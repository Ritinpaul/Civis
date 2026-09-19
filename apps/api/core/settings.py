"""
CIVIS — Core Settings
Loaded from environment variables / .env file.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://civis:civis@localhost:5432/civis"

    # Gemini
    gemini_api_key: str = ""
    gemini_fast_model: str = "gemini-2.5-flash"   # understand, decompose, eval, swarm
    gemini_smart_model: str = "gemini-2.5-pro"    # specify, analyze_failure, plan_repair

    # App
    environment: str = "development"
    demo_mode: bool = True
    log_level: str = "INFO"

    # Demo timing (seconds between events for pacing)
    demo_act1_delay: float = 0.5
    demo_act2_delay: float = 0.5
    demo_act3_delay: float = 0.8
    demo_act4_delay: float = 0.5

    # CORS
    allowed_origins: str = "http://localhost:3000,https://civis.vercel.app"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
