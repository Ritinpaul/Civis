"""
CIVIS — Base Tool Abstraction
Defines the tool interface, parameter schema, and risk classification.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class BaseTool(ABC):
    """Abstract base class for all CIVIS tools."""

    name: str
    description: str
    risk_level: str = "low"  # "low", "medium", "high", "critical"
    parameters: Dict[str, Any] = {}

    @abstractmethod
    def execute(self, **kwargs) -> Dict[str, Any]:
        """Execute the tool deterministically or against live services."""
        pass

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "risk_level": self.risk_level,
            "parameters": self.parameters,
        }
