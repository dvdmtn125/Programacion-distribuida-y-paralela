import os

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import Base, engine, get_db
from app.reporting import build_enrollment_report_xml


# Creates the tables when the API starts if they do not exist yet.
Base.metadata.create_all(bind=engine)

# Local and Docker frontend origins allowed to call the API.
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app = FastAPI(
    title="EdTech Cursos API",
    version="1.0.0",
    description="CRUD de cursos, usuarios e inscripciones con reporte XML.",
)

# Enables communication between React and FastAPI in the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root() -> dict[str, str]:
    # Simple message to verify that the API is running.
    return {"message": "API de plataforma edtech en funcionamiento"}


@app.get("/cursos", response_model=list[schemas.Curso])
def list_cursos(db: Session = Depends(get_db)) -> list[models.Curso]:
    return list(crud.list_cursos(db))


@app.post("/cursos", response_model=schemas.Curso, status_code=status.HTTP_201_CREATED)
def create_curso(payload: schemas.CursoCreate, db: Session = Depends(get_db)) -> models.Curso:
    try:
        return crud.create_curso(db, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="El curso ya existe.") from exc


@app.put("/cursos/{curso_id}", response_model=schemas.Curso)
def update_curso(
    curso_id: int,
    payload: schemas.CursoUpdate,
    db: Session = Depends(get_db),
) -> models.Curso:
    curso = crud.get_curso(db, curso_id)
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado.")
    try:
        return crud.update_curso(db, curso, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="No se pudo actualizar el curso.") from exc


@app.delete("/cursos/{curso_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_curso(curso_id: int, db: Session = Depends(get_db)) -> Response:
    curso = crud.get_curso(db, curso_id)
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado.")
    crud.delete_curso(db, curso)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/usuarios", response_model=list[schemas.Usuario])
def list_usuarios(db: Session = Depends(get_db)) -> list[models.Usuario]:
    return list(crud.list_usuarios(db))


@app.post("/usuarios", response_model=schemas.Usuario, status_code=status.HTTP_201_CREATED)
def create_usuario(payload: schemas.UsuarioCreate, db: Session = Depends(get_db)) -> models.Usuario:
    try:
        return crud.create_usuario(db, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="El correo del usuario ya existe.") from exc


@app.put("/usuarios/{usuario_id}", response_model=schemas.Usuario)
def update_usuario(
    usuario_id: int,
    payload: schemas.UsuarioUpdate,
    db: Session = Depends(get_db),
) -> models.Usuario:
    usuario = crud.get_usuario(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    try:
        return crud.update_usuario(db, usuario, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="No se pudo actualizar el usuario.") from exc


@app.delete("/usuarios/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(usuario_id: int, db: Session = Depends(get_db)) -> Response:
    usuario = crud.get_usuario(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    crud.delete_usuario(db, usuario)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/inscripciones", response_model=list[schemas.Inscripcion])
def list_inscripciones(db: Session = Depends(get_db)) -> list[models.Inscripcion]:
    return list(crud.list_inscripciones(db))


@app.post("/inscripciones", response_model=schemas.Inscripcion, status_code=status.HTTP_201_CREATED)
def create_inscripcion(
    payload: schemas.InscripcionCreate,
    db: Session = Depends(get_db),
) -> models.Inscripcion:
    # First we validate that the student and course exist.
    if not crud.get_usuario(db, payload.usuario_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    curso = crud.get_curso(db, payload.curso_id)
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado.")

    # Available seats depend on the number of current enrollments.
    inscritos = crud.count_inscripciones_by_curso(db, payload.curso_id)
    if inscritos >= curso.cupo:
        raise HTTPException(status_code=400, detail="No hay cupos disponibles para este curso.")

    # The same student cannot enroll twice in the same course.
    if crud.enrollment_exists(db, payload.usuario_id, payload.curso_id):
        raise HTTPException(status_code=400, detail="El estudiante ya esta inscrito en este curso.")
    return crud.create_inscripcion(db, payload)


@app.delete("/inscripciones/{inscripcion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inscripcion(inscripcion_id: int, db: Session = Depends(get_db)) -> Response:
    inscripcion = crud.get_inscripcion(db, inscripcion_id)
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripcion no encontrada.")
    crud.delete_inscripcion(db, inscripcion)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/reportes/inscripciones.xml")
def enrollment_report(db: Session = Depends(get_db)) -> Response:
    # Returns the XML summary required by the project.
    total = crud.count_inscripciones(db)
    distribution = crud.course_distribution(db)
    xml = build_enrollment_report_xml(total, distribution)
    return Response(content=xml, media_type="application/xml")
