// Import the dotenv module to load environment variables from a .env file
import dotenv from "dotenv";
// Import the Pool class from the pg library for PostgreSQL connections
import { Pool } from "pg";

// Load environment variables from the .env file into process.env
dotenv.config();

// Create a new connection pool for PostgreSQL database connections
// The pool configuration uses environment variables for database credentials
export const pool = new Pool({
  // Database host address
  host: process.env.DB_HOST,
  // Database port number, defaults to 5432 if not specified
  port: Number(process.env.DB_PORT || 5432),
  // Database username
  user: process.env.DB_USER,
  // Database password
  password: process.env.DB_PASSWORD,
  // Database name
  database: process.env.DB_NAME,
});
