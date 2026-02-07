from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

db_url = settings.database_url.replace("postgresql+asyncpg", "postgresql")

if db_url.startswith("sqlite"):
    # SQLite: no server, zero cost – ideal for hackathons
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL (local or Azure)
    engine = create_engine(
        db_url,
        connect_args={"connect_timeout": 10},
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
