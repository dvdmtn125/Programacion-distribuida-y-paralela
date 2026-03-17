# Taller #2 - Tecnologias Web (PETS S.A.)

Stack solicitado:
- Frontend: React (Vite)
- Backend: Node.js + Express
- Base de datos: PostgreSQL

## Estructura

- `backend/`: API REST con CRUD y reportes.
- `frontend/`: aplicacion React para gestionar datos.
- `docs/diagrama-clases.md`: diagrama de clases UML (mermaid).

## 1) Configurar backend

1. Ir a `backend`.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear `.env` usando `.env.example` y poner tus credenciales reales.
4. Ejecutar:
   ```bash
   npm run dev
   ```

API base: `http://localhost:4000/api`

## 2) Configurar frontend

1. Ir a `frontend`.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar:
   ```bash
   npm run dev
   ```

Frontend: `http://localhost:5173`

## Endpoints principales

- `GET/POST/PUT/DELETE /api/clientes`
- `GET/POST/PUT/DELETE /api/medicamentos`
- `GET/POST/PUT/DELETE /api/mascotas`
- `GET /api/reportes/clientes`
- `GET /api/reportes/medicamentos`

## Nota BD

Inclui `backend/schema.sql` por si necesitas comparar estructura. Si tu base ya existe, solo verifica que los nombres de tablas/columnas coincidan:
- `clientes`
- `medicamentos`
- `mascotas`
