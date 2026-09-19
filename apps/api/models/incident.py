"""
CIVIS — Incident Model
The triggering event that the city must respond to.
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Text, JSON, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base
import enum


class IncidentSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class IncidentStatus(str, enum.Enum):
    detected = "detected"
    investigating = "investigating"
    resolved = "resolved"


class IncidentType(str, enum.Enum):
    known = "known"       # Act I — existing workforce can handle
    unknown = "unknown"   # Act II — triggers capability gap detection


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: f"INC-{uuid.uuid4().hex[:6].upper()}")
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="detected")
    incident_type: Mapped[str] = mapped_column(String(20), nullable=False, default="known")
    evidence: Mapped[dict] = mapped_column(JSON, nullable=True, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "severity": self.severity,
            "status": self.status,
            "incident_type": self.incident_type,
            "evidence": self.evidence,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }
