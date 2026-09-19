"""
CIVIS — Tool Registry
Central catalog of city operational tools.
Provides validation, lookup, and deterministic/live execution.
"""
import logging
from typing import Dict, List, Optional, Any
from tools.base import BaseTool
from tools.stubs import (
    WeatherReadTool,
    TrafficReadTool,
    RoadReadTool,
    DrainageReadTool,
    EmergencyReadTool,
    ImageryReadTool,
)

logger = logging.getLogger("civis.tools")


class ToolRegistry:
    """Registry maintaining all available tools accessible by agents."""

    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        self._register_default_tools()

    def _register_default_tools(self):
        """Register the default Chennai operational tools."""
        defaults = [
            WeatherReadTool(),
            TrafficReadTool(),
            RoadReadTool(),
            DrainageReadTool(),
            EmergencyReadTool(),
            ImageryReadTool(),
        ]
        for tool in defaults:
            self.register(tool)

    def register(self, tool: BaseTool):
        """Register a new tool."""
        self._tools[tool.name] = tool
        logger.debug(f"[ToolRegistry] Registered tool: {tool.name}")

    def get(self, tool_name: str) -> Optional[BaseTool]:
        """Get a tool by name."""
        return self._tools.get(tool_name)

    def list_tools(self) -> List[Dict[str, Any]]:
        """List metadata for all registered tools."""
        return [tool.to_dict() for tool in self._tools.values()]

    def has_tool(self, tool_name: str) -> bool:
        """Check if tool exists in registry."""
        return tool_name in self._tools

    def execute(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        """Execute a tool with parameters."""
        tool = self.get(tool_name)
        if not tool:
            raise KeyError(f"Tool '{tool_name}' not found in registry")
        logger.info(f"[ToolRegistry] Executing tool '{tool_name}' with args {kwargs}")
        return tool.execute(**kwargs)


# Global singleton
tool_registry = ToolRegistry()


def get_tool_registry() -> ToolRegistry:
    """Dependency / accessor for ToolRegistry."""
    return tool_registry
