# Plataforma EdTech

Proyecto base para un taller de servicios web con:

- `React` para el frontend
- `FastAPI` para el backend en Python
- `PostgreSQL` para la base de datos

## Funcionalidades

- CRUD de cursos
- CRUD de estudiantes
- CRUD de inscripciones
- API REST con rutas:
  - `/cursos`
  - `/usuarios`
  - `/inscripciones`
- Reporte XML en `/reportes/inscripciones.xml`
  - total de estudiantes inscritos
  - porcentaje de estudiantes por curso

## Ejecutar PostgreSQL

```bash
docker compose up --build
```

Servicios disponibles:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Documentacion Swagger: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

## Ejecutar con Docker

Desde la raiz del proyecto:

```bash
docker compose up --build
```

Para detenerlo:

```bash
docker compose down
```

Para detenerlo y borrar volumenes:

```bash
docker compose down -v
```

## Ejecutar sin Docker

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Variables de entorno

- Backend:
  - `DATABASE_URL`
  - `ALLOWED_ORIGINS`
- Frontend:
  - `VITE_API_URL`

## Idea del proyecto

Este sistema representa una plataforma `edtech`, una tendencia muy actual porque permite administrar cursos, estudiantes e inscripciones desde una interfaz web moderna y una API desacoplada.
