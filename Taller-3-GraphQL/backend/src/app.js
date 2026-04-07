// Importar Express para crear el servidor HTTP.
import express from "express";
// Importar CORS para permitir solicitudes desde otros origenes.
import cors from "cors";
// Importar el pool de PostgreSQL para el health check.
import { pool } from "./db/pool.js";
// Importar el handler de GraphQL para Express.
import { createHandler } from "graphql-http/lib/use/express";
// Importar el schema y los resolvers de GraphQL.
import { schema, root } from "./graphql/schema.js";

// Crear la instancia de la aplicacion Express.
const app = express();

// Habilitar CORS para todas las rutas.
app.use(cors());
// Parsear JSON entrante.
app.use(express.json());

// Endpoint raiz con informacion basica.
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "API PETS S.A. activa",
    health: "/health",
    graphql: "/graphql",
  });
});

// Endpoint de salud para validar conexion a la BD.
app.get("/health", async (_req, res) => {
  try {
    // Probar conexion con una consulta simple.
    await pool.query("SELECT 1");
    res.json({ ok: true, message: "API y BD conectadas" });
  } catch (error) {
    // Responder error si falla la conexion.
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Endpoint principal de GraphQL.
app.use(
  "/graphql",
  createHandler({
    schema,
    rootValue: root,
  })
);

// Middleware global de errores.
app.use((err, _req, res, _next) => {
  // Loguear el error en consola.
  console.error(err);
  // Responder un error generico.
  res.status(500).json({ message: "Error interno del servidor" });
});

// Exportar la app para ser usada por el servidor.
export default app;
