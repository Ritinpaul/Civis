"""
CIVIS — Provenance Router (Phase 15)
Endpoints for querying the immutable audit trail, story stages, and cryptographic integrity proof.
"""
import logging
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.database import get_db
from engines.provenance import get_provenance_engine, ProvenanceEngine

logger = logging.getLogger("civis.provenance")
router = APIRouter(prefix="/provenance", tags=["Provenance"])


@router.get("", response_model=List[dict])
def get_provenance_events(
    incident_id: Optional[str] = Query(None, description="Filter by incident ID (e.g. INC-002)"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    actor: Optional[str] = Query(None, description="Filter by actor"),
    limit: int = Query(100, ge=1, le=500, description="Max events to return"),
    db: Session = Depends(get_db),
    engine: ProvenanceEngine = Depends(get_provenance_engine),
):
    """
    Get chronological immutable audit trail of provenance events.
    Supports filtering by incident_id, event_type, and actor.
    """
    return engine.get_timeline(
        incident_id=incident_id,
        event_type=event_type,
        actor=actor,
        limit=limit,
        db=db,
    )


@router.get("/timeline/{incident_id}", response_model=dict)
def get_incident_timeline(
    incident_id: str,
    db: Session = Depends(get_db),
    engine: ProvenanceEngine = Depends(get_provenance_engine),
):
    """
    Get structured timeline grouped by the 7 CIVIS story stages:
    detection, capability_gap, adaptation_forge, evaluation_failure,
    repair_pass, governance_authority, swarm_persistence.
    """
    return engine.get_incident_story(incident_id=incident_id, db=db)


@router.get("/verify/{incident_id}", response_model=dict)
def verify_incident_provenance(
    incident_id: str,
    db: Session = Depends(get_db),
    engine: ProvenanceEngine = Depends(get_provenance_engine),
):
    """
    Cryptographic SHA-256 integrity verification of the incident event stream.
    Validates that the provenance log is immutable and untampered.
    """
    return engine.compute_integrity_hash(incident_id=incident_id, db=db)


@router.get("/canonical-20", response_model=List[dict])
def get_canonical_20_events(
    engine: ProvenanceEngine = Depends(get_provenance_engine),
):
    """
    Return the canonical 20-event sequence definition for INC-002.
    Defines the standard narrative progression from detection to persistence.
    """
    return engine.get_canonical_20()
