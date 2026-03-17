// Import Express framework for building the web server
import express from "express";
// Import CORS middleware to handle cross-origin requests
import cors from "cors";
// Import the database connection pool
import { pool } from "./db/pool.js";
// Import route handlers for different API endpoints
import clientesRouter from "./routes/clientes.routes.js";
import medicamentosRouter from "./routes/medicamentos.routes.js";
import mascotasRouter from "./routes/mascotas.routes.js";
import reportesRouter from "./routes/reportes.routes.js";

// Create an Express application instance
const app = express();

// Enable CORS for all routes to allow cross-origin requests
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// Root endpoint that returns API information
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "API PETS S.A. activa",
    health: "/health",
    base: "/api",
  });
});

// Health check endpoint to verify database connection
app.get("/health", async (_req, res) => {
  try {
    // Test database connection with a simple query
    await pool.query("SELECT 1");
    res.json({ ok: true, message: "API y BD conectadas" });
  } catch (error) {
    // Return error if database connection fails
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Mount route handlers for different API sections
app.use("/api/clientes", clientesRouter);
app.use("/api/medicamentos", medicamentosRouter);
app.use("/api/mascotas", mascotasRouter);
app.use("/api/reportes", reportesRouter);

// Global error handler middleware
app.use((err, _req, res, _next) => {
  // Log the error to the console
  console.error(err);
  // Return a generic error response
  res.status(500).json({ message: "Error interno del servidor" });
});

// Export the Express app for use in the server
export default app;
