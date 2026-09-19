"""
CIVIS — Capabilities Router
Registry endpoints for city capabilities.
Central to the CIVIS concept: A capability is a named, versioned, structured skill.
Searching for a missing capability triggers the adaptation engine (Act II).
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.database import get_db
from models.capability import Capability
from services.event_bus import get_event_bus, EventBus

router = APIRouter(prefix="/capabilities", tags=["Capabilities"])


# ── Schemas ───────────────────────────────────────────────────────────────────
class CapabilityCreate(BaseModel):
    id: str = Field(..., example="flood_passability")
    name: str = Field(..., example="Dynamic Flood-Road Passability Assessment")
    purpose: str = Field(..., example="Determine whether flooded roads are passable for emergency and light vehicles.")
    inputs: List[str] = Field(default_factory=list, example=["street_image", "water_depth_cm", "vehicle_type"])
    outputs: List[str] = Field(default_factory=list, example=["is_passable", "max_safe_speed_kmh", "confidence"])
    required_tools: List[str] = Field(default_factory=list, example=["road.read", "imagery.read"])
    version: str = Field(default="1.0.0", example="1.0.0")
    status: str = Field(default="verified", example="verified")
    created_from_incident: Optional[str] = None


class CapabilitySearchRequest(BaseModel):
    query: str = Field(..., example="flood_passability")
    incident_id: Optional[str] = Field(None, example="INC-002")


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.get("", response_model=List[dict])
def list_capabilities(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    """List all capabilities currently registered in the city's capability registry."""
    query = db.query(Capability)
    if status_filter:
        query = query.filter(Capability.status == status_filter)
    caps = query.order_by(Capability.created_at.asc()).all()
    return [cap.to_dict() for cap in caps]


@router.get("/{capability_id}", response_model=dict)
def get_capability(
    capability_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve details of a specific capability."""
    cap = db.query(Capability).filter(Capability.id == capability_id).first()
    if not cap:
        raise HTTPException(status_code=404, detail=f"Capability '{capability_id}' not found in registry")
    return cap.to_dict()


@router.post("", status_code=status.HTTP_201_CREATED, response_model=dict)
async def register_capability(
    payload: CapabilityCreate,
    db: Session = Depends(get_db),
    bus: EventBus = Depends(get_event_bus),
):
    """
    Register or persist a new capability into the city's intelligence registry.
    Used in Act IV when the newly forged specialist is persisted.
    """
    existing = db.query(Capability).filter(Capability.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Capability '{payload.id}' already exists")

    cap = Capability(
        id=payload.id,
        name=payload.name,
        purpose=payload.purpose,
        inputs=payload.inputs,
        outputs=payload.outputs,
        required_tools=payload.required_tools,
        version=payload.version,
        status=payload.status,
        created_from_incident=payload.created_from_incident,
    )
    db.add(cap)
    db.commit()
    db.refresh(cap)

    # Publish CAPABILITY_PERSISTED event
    await bus.publish_provenance(
        event_type="CAPABILITY_PERSISTED",
        actor="civis-system",
        message=f"Capability '{payload.id}' v{payload.version} permanently added to city registry.",
        payload=cap.to_dict(),
        incident_id=payload.created_from_incident,
        db=db,
    )

    return cap.to_dict()


@router.post("/search", response_model=dict)
async def search_capability(
    payload: CapabilitySearchRequest,
    db: Session = Depends(get_db),
    bus: EventBus = Depends(get_event_bus),
):
    """
    Search for a capability in the registry.
    If FOUND: Returns capability info and publishes CAPABILITY_FOUND.
    If NOT FOUND: Returns gap detection notice and publishes CAPABILITY_GAP.
    """
    search_term = payload.query.lower().strip()

    # Exact ID match or substring in ID/name/purpose
    cap = (
        db.query(Capability)
        .filter(
            (Capability.id == search_term)
            | (Capability.name.ilike(f"%{search_term}%"))
            | (Capability.purpose.ilike(f"%{search_term}%"))
        )
        .first()
    )

    if cap:
        if payload.incident_id:
            await bus.publish_provenance(
                event_type="CAPABILITY_FOUND",
                actor="capability-registry",
                message=f"Capability '{cap.id}' found in registry for {payload.incident_id}.",
                payload=cap.to_dict(),
                incident_id=payload.incident_id,
                db=db,
            )
        return {
            "found": True,
            "capability": cap.to_dict(),
            "gap_detected": False,
        }
    else:
        # Capability GAP detected! Hero moment in Act II
        gap_payload = {
            "query": payload.query,
            "incident_id": payload.incident_id,
            "missing_capability": payload.query,
            "required_for": "Dynamic Flood-Road Passability Assessment",
            "gap_detected": True,
        }
        if payload.incident_id:
            await bus.publish_provenance(
                event_type="CAPABILITY_GAP",
                actor="capability-registry",
                message=f"CAPABILITY GAP DETECTED: City lacks capability '{payload.query}' for {payload.incident_id}.",
                payload=gap_payload,
                incident_id=payload.incident_id,
                db=db,
            )
        return {
            "found": False,
            "missing_capability": payload.query,
            "gap_detected": True,
            "message": f"Capability '{payload.query}' not found in city registry. Adaptation required.",
        }
