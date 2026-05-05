from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CursoBase(BaseModel):
    # Validaciones compartidas para crear o actualizar un curso.
    nombre: str = Field(min_length=3, max_length=120)
    descripcion: str = Field(min_length=5, max_length=255)
    cupo: int = Field(gt=0, le=500)


class CursoCreate(CursoBase):
    pass


class CursoUpdate(CursoBase):
    pass


class Curso(CursoBase):
    # Respuesta que devuelve la API para un curso.
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UsuarioBase(BaseModel):
    # Validaciones compartidas para crear o actualizar un usuario.
    nombre: str = Field(min_length=3, max_length=120)
    correo: EmailStr
    carrera: str = Field(min_length=3, max_length=120)


class UsuarioCreate(UsuarioBase):
    pass


class UsuarioUpdate(UsuarioBase):
    pass


class Usuario(UsuarioBase):
    # Respuesta que devuelve la API para un usuario.
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InscripcionBase(BaseModel):
    # Una inscripcion solo necesita los ids del usuario y del curso.
    usuario_id: int
    curso_id: int


class InscripcionCreate(InscripcionBase):
    pass


class Inscripcion(InscripcionBase):
    # Respuesta que devuelve la API para una inscripcion con datos anidados.
    id: int
    created_at: datetime
    usuario: Usuario
    curso: Curso

    model_config = ConfigDict(from_attributes=True)
