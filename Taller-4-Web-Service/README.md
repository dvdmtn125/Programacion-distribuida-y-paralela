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

### Como se conectan los contenedores

- `postgres` levanta la base de datos PostgreSQL.
- `backend` se conecta a PostgreSQL usando el nombre del servicio `postgres`.
- `frontend` corre en Vite y desde el navegador consume la API en `http://localhost:8000`.
- Docker publica los puertos para que puedas abrir el sistema desde Windows sin entrar al contenedor.

### Variables usadas con Docker

- `DATABASE_URL=postgresql+psycopg://postgres:postgres@postgres:5432/edtech_db`
  Esta URL la usa el backend dentro de Docker. El host es `postgres` porque asi se llama el servicio de la base de datos en `docker-compose.yml`.
- `ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`
  Permite que el frontend pueda hacer peticiones al backend sin errores de CORS.
- `VITE_API_URL=http://localhost:8000`
  Indica al frontend la direccion publica del backend vista desde tu navegador.

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

Ejemplo base en [`.env.example`](D:/Documentos/Universidad/Programacion-paralela-y-distribuida/Practica/Taller-4-Web-Service/.env.example).

## Idea del proyecto

Este sistema representa una plataforma `edtech`, una tendencia muy actual porque permite administrar cursos, estudiantes e inscripciones desde una interfaz web moderna y una API desacoplada.
