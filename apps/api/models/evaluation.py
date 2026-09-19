"""
CIVIS — Evaluation Model
Records each test run against a new specialist agent.
The T03 failure is the pivotal moment — it MUST be stored here.
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Text, JSON, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[str] = mapped_column(String(100), primary_key=True, default=lambda: f"eval-{uuid.uuid4().hex[:8]}")
    agent_id: Mapped[str] = mapped_column(String(100), nullable=False)
    capability_id: Mapped[str] = mapped_column(String(100), nullable=False)

    # Test identification
    test_id: Mapped[str] = mapped_column(String(20), nullable=False)  # "T01" ... "T07"
    test_name: Mapped[str] = mapped_column(String(100), nullable=False)  # "clear_road", "ambiguous"

    # Input / expected / actual
    input_data: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    expected_output: Mapped[str] = mapped_column(String(50), nullable=False)  # "UNKNOWN"
    actual_output: Mapped[str] = mapped_column(String(50), nullable=False)    # "PASSABLE"

    # Outcome
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # "passed" | "failed"
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Was this run after a repair?
    repair_applied: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    run_number: Mapped[int] = mapped_column(nullable=False, default=1)  # 1 = first, 2 = after repair

    evaluated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "capability_id": self.capability_id,
            "test_id": self.test_id,
            "test_name": self.test_name,
            "input_data": self.input_data,
            "expected_output": self.expected_output,
            "actual_output": self.actual_output,
            "status": self.status,
            "reason": self.reason,
            "repair_applied": self.repair_applied,
            "run_number": self.run_number,
            "evaluated_at": self.evaluated_at.isoformat() if self.evaluated_at else None,
        }
