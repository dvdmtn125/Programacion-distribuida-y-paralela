# Taller #2 - Tecnologias Web (PETS S.A.)

Stack solicitado:
- Frontend: React (Vite)
- Backend: Node.js + Express + GraphQL
- Base de datos: PostgreSQL

## Estructura

- `backend/`: API GraphQL con CRUD y reportes.
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

API GraphQL: `http://localhost:4000/graphql`

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

## Consultas principales

Todas las operaciones se hacen via GraphQL en `/graphql`.

Query ejemplo:
```graphql
query {
  clientes { cedula nombres apellidos direccion telefono }
  medicamentos { id nombre descripcion dosis }
  mascotas { id nombre raza edad edad_unidad peso cliente_nombres cliente_apellidos medicamento_nombre }
}
```

Mutaciones ejemplo:
```graphql
mutation ($input: ClienteInput!) {
  createCliente(input: $input) { cedula }
}
```

## Nota BD

Inclui `backend/schema.sql` por si necesitas comparar estructura. Si tu base ya existe, solo verifica que los nombres de tablas/columnas coincidan:
- `clientes`
- `medicamentos`
- `mascotas`
