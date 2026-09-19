"""
CIVIS — Capability Model
The central CIVIS concept. A named, versioned, structured skill
that an agent can possess. The registry is the source of truth.
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Text, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base


class Capability(Base):
    __tablename__ = "capabilities"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)  # "flood_passability"
    name: Mapped[str] = mapped_column(String(200), nullable=False)   # "Dynamic Flood-Road Passability"
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    inputs: Mapped[list] = mapped_column(JSON, nullable=False, default=list)   # ["street_image", ...]
    outputs: Mapped[list] = mapped_column(JSON, nullable=False, default=list)  # ["passability_result"]
    required_tools: Mapped[list] = mapped_column(JSON, nullable=False, default=list)  # ["road.read", ...]
    version: Mapped[str] = mapped_column(String(20), nullable=False, default="1.0.0")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")
    # "draft" | "verified" | "deprecated"
    created_from_incident: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "purpose": self.purpose,
            "inputs": self.inputs,
            "outputs": self.outputs,
            "required_tools": self.required_tools,
            "version": self.version,
            "status": self.status,
            "created_from_incident": self.created_from_incident,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
