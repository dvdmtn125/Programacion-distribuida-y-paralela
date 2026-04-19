from collections.abc import Generator
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# Connection string used by SQLAlchemy to connect to PostgreSQL.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/edtech_db",
)

# The engine manages database connections for the whole app.
engine = create_engine(DATABASE_URL, future=True)
# SessionLocal creates one session per incoming request.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
# Base is the parent class for all ORM models.
Base = declarative_base()


def get_db() -> Generator:
    # FastAPI injects this session into the endpoints that need the database.
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
