// Cargar variables de entorno desde .env.
import dotenv from "dotenv";
// Importar Pool para conexiones a PostgreSQL.
import { Pool } from "pg";

// Inicializar variables de entorno.
dotenv.config();

// Crear el pool de conexiones usando variables de entorno.
export const pool = new Pool({
  // Host de la base de datos.
  host: process.env.DB_HOST,
  // Puerto de la base de datos (por defecto 5432).
  port: Number(process.env.DB_PORT || 5432),
  // Usuario de la base de datos.
  user: process.env.DB_USER,
  // Password de la base de datos.
  password: process.env.DB_PASSWORD,
  // Nombre de la base de datos.
  database: process.env.DB_NAME,
});
