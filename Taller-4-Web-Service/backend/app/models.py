from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.database import Base


class Curso(Base):
    # Guarda los cursos disponibles dentro de la plataforma.
    __tablename__ = "cursos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(120), nullable=False, unique=True)
    descripcion = Column(String(255), nullable=False)
    cupo = Column(Integer, nullable=False, default=30)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Un curso puede tener muchas inscripciones asociadas.
    inscripciones = relationship("Inscripcion", back_populates="curso", cascade="all, delete")


class Usuario(Base):
    # Guarda los estudiantes o usuarios registrados en el sistema.
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(120), nullable=False)
    correo = Column(String(120), nullable=False, unique=True, index=True)
    carrera = Column(String(120), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Un estudiante puede aparecer en muchas inscripciones.
    inscripciones = relationship("Inscripcion", back_populates="usuario", cascade="all, delete")


class Inscripcion(Base):
    # Tabla intermedia que relaciona estudiantes con cursos.
    __tablename__ = "inscripciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    curso_id = Column(Integer, ForeignKey("cursos.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Estas relaciones permiten devolver datos anidados en la API.
    usuario = relationship("Usuario", back_populates="inscripciones")
    curso = relationship("Curso", back_populates="inscripciones")
