from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app import models, schemas


def list_cursos(db: Session) -> Sequence[models.Curso]:
    # Returns all courses ordered by id for stable rendering in the UI.
    return db.scalars(select(models.Curso).order_by(models.Curso.id)).all()


def get_curso(db: Session, curso_id: int) -> models.Curso | None:
    return db.get(models.Curso, curso_id)


def create_curso(db: Session, payload: schemas.CursoCreate) -> models.Curso:
    # Inserts a new course from the validated request body.
    curso = models.Curso(**payload.model_dump())
    db.add(curso)
    db.commit()
    db.refresh(curso)
    return curso


def update_curso(db: Session, curso: models.Curso, payload: schemas.CursoUpdate) -> models.Curso:
    # Updates each editable field on the selected course.
    for key, value in payload.model_dump().items():
        setattr(curso, key, value)
    db.commit()
    db.refresh(curso)
    return curso


def delete_curso(db: Session, curso: models.Curso) -> None:
    db.delete(curso)
    db.commit()


def list_usuarios(db: Session) -> Sequence[models.Usuario]:
    # Returns all students ordered by id.
    return db.scalars(select(models.Usuario).order_by(models.Usuario.id)).all()


def get_usuario(db: Session, usuario_id: int) -> models.Usuario | None:
    return db.get(models.Usuario, usuario_id)


def create_usuario(db: Session, payload: schemas.UsuarioCreate) -> models.Usuario:
    # Inserts a new student from the validated request body.
    usuario = models.Usuario(**payload.model_dump())
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def update_usuario(
    db: Session,
    usuario: models.Usuario,
    payload: schemas.UsuarioUpdate,
) -> models.Usuario:
    for key, value in payload.model_dump().items():
        setattr(usuario, key, value)
    db.commit()
    db.refresh(usuario)
    return usuario


def delete_usuario(db: Session, usuario: models.Usuario) -> None:
    db.delete(usuario)
    db.commit()


def list_inscripciones(db: Session) -> Sequence[models.Inscripcion]:
    # joinedload fetches the related student and course in the same query.
    stmt = (
        select(models.Inscripcion)
        .options(joinedload(models.Inscripcion.usuario), joinedload(models.Inscripcion.curso))
        .order_by(models.Inscripcion.id)
    )
    return db.scalars(stmt).unique().all()


def create_inscripcion(db: Session, payload: schemas.InscripcionCreate) -> models.Inscripcion:
    # Creates the enrollment and reloads it with nested relationships.
    inscripcion = models.Inscripcion(**payload.model_dump())
    db.add(inscripcion)
    db.commit()
    stmt = (
        select(models.Inscripcion)
        .options(joinedload(models.Inscripcion.usuario), joinedload(models.Inscripcion.curso))
        .where(models.Inscripcion.id == inscripcion.id)
    )
    return db.scalars(stmt).unique().one()


def get_inscripcion(db: Session, inscripcion_id: int) -> models.Inscripcion | None:
    stmt = (
        select(models.Inscripcion)
        .options(joinedload(models.Inscripcion.usuario), joinedload(models.Inscripcion.curso))
        .where(models.Inscripcion.id == inscripcion_id)
    )
    return db.scalars(stmt).unique().first()


def delete_inscripcion(db: Session, inscripcion: models.Inscripcion) -> None:
    db.delete(inscripcion)
    db.commit()


def count_inscripciones(db: Session) -> int:
    # Counts every enrollment for the XML report.
    return db.scalar(select(func.count(models.Inscripcion.id))) or 0


def count_inscripciones_by_curso(db: Session, curso_id: int) -> int:
    # Counts how many students are already enrolled in one course.
    stmt = select(func.count(models.Inscripcion.id)).where(models.Inscripcion.curso_id == curso_id)
    return db.scalar(stmt) or 0


def enrollment_exists(db: Session, usuario_id: int, curso_id: int) -> bool:
    # Prevents duplicate enrollments for the same course and student.
    stmt = select(models.Inscripcion.id).where(
        models.Inscripcion.usuario_id == usuario_id,
        models.Inscripcion.curso_id == curso_id,
    )
    return db.scalar(stmt) is not None


def course_distribution(db: Session) -> list[dict[str, float | int | str]]:
    # Builds the percentage distribution used by the XML report.
    total = count_inscripciones(db)
    stmt = (
        select(
            models.Curso.nombre,
            func.count(models.Inscripcion.id).label("inscritos"),
        )
        .select_from(models.Curso)
        .join(models.Inscripcion, models.Inscripcion.curso_id == models.Curso.id, isouter=True)
        .group_by(models.Curso.id)
        .order_by(models.Curso.nombre)
    )
    rows = db.execute(stmt).all()
    distribution = []
    for nombre, inscritos in rows:
        percent = round((inscritos / total) * 100, 2) if total else 0.0
        distribution.append(
            {
                "curso": nombre,
                "inscritos": inscritos,
                "porcentaje": percent,
            }
        )
    return distribution
