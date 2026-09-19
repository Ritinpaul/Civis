"""
CIVIS — Database Engine & Session Factory
SQLAlchemy 2.0 async-compatible setup.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from core.settings import get_settings

settings = get_settings()

if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """All CIVIS models inherit from this."""
    pass


def get_db():
    """FastAPI dependency — yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(bind=engine):
    """Create all tables in the database if they do not exist."""
    import models  # Ensure all models are registered with Base.metadata
    Base.metadata.create_all(bind=bind)
