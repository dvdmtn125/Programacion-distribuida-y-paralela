from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CursoBase(BaseModel):
    # Shared validation used when creating or updating a course.
    nombre: str = Field(min_length=3, max_length=120)
    descripcion: str = Field(min_length=5, max_length=255)
    cupo: int = Field(gt=0, le=500)


class CursoCreate(CursoBase):
    pass


class CursoUpdate(CursoBase):
    pass


class Curso(CursoBase):
    # API response for a course.
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UsuarioBase(BaseModel):
    # Shared validation used when creating or updating a user.
    nombre: str = Field(min_length=3, max_length=120)
    correo: EmailStr
    carrera: str = Field(min_length=3, max_length=120)


class UsuarioCreate(UsuarioBase):
    pass


class UsuarioUpdate(UsuarioBase):
    pass


class Usuario(UsuarioBase):
    # API response for a user.
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InscripcionBase(BaseModel):
    # An enrollment only needs the linked user and course ids.
    usuario_id: int
    curso_id: int


class InscripcionCreate(InscripcionBase):
    pass


class Inscripcion(InscripcionBase):
    # API response for an enrollment with nested data.
    id: int
    created_at: datetime
    usuario: Usuario
    curso: Curso

    model_config = ConfigDict(from_attributes=True)
