"""
CIVIS — WorkforceSnapshot Model
A point-in-time snapshot of the city's AI capabilities.
Captured when capabilities are added or removed.
"""
import uuid
from datetime import datetime
from sqlalchemy import String, JSON, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base


class WorkforceSnapshot(Base):
    __tablename__ = "workforce_snapshots"

    id: Mapped[str] = mapped_column(String(100), primary_key=True, default=lambda: f"snap-{uuid.uuid4().hex[:8]}")
    agent_ids: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    capability_ids: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    captured_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    trigger: Mapped[str] = mapped_column(String(100), nullable=True)  # "CAPABILITY_PERSISTED"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "agent_ids": self.agent_ids,
            "capability_ids": self.capability_ids,
            "version": self.version,
            "captured_at": self.captured_at.isoformat() if self.captured_at else None,
            "trigger": self.trigger,
        }
