"""
CIVIS — Authority Model
Explicit tool-level permission grants. One record per (agent, tool) pair.
This is enforced in GenericAgentRuntime — not just UI decoration.
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base


class Authority(Base):
    __tablename__ = "authorities"

    id: Mapped[str] = mapped_column(String(100), primary_key=True, default=lambda: f"auth-{uuid.uuid4().hex[:8]}")
    agent_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    tool_name: Mapped[str] = mapped_column(String(100), nullable=False)  # "road.read"

    decision: Mapped[str] = mapped_column(String(10), nullable=False)  # "allow" | "deny"
    reason: Mapped[str] = mapped_column(Text, nullable=False, default="")

    granted_by: Mapped[str] = mapped_column(String(100), nullable=False, default="governance-engine")
    granted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "tool_name": self.tool_name,
            "decision": self.decision,
            "reason": self.reason,
            "granted_by": self.granted_by,
            "granted_at": self.granted_at.isoformat() if self.granted_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }
