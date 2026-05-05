from collections.abc import Generator
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# Cadena de conexion que usa SQLAlchemy para conectarse a PostgreSQL.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/edtech_db",
)

# El motor administra las conexiones a la base de datos de toda la aplicacion.
engine = create_engine(DATABASE_URL, future=True)
# SessionLocal crea una sesion independiente por cada peticion.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
# Base es la clase padre de todos los modelos ORM.
Base = declarative_base()


def get_db() -> Generator:
    # FastAPI inyecta esta sesion en los endpoints que necesitan base de datos.
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
