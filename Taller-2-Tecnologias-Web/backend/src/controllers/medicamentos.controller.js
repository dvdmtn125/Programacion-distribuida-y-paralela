// Importar el pool de conexiones a la base de datos
import { pool } from "../db/pool.js";

// Controlador para obtener todos los medicamentos ordenados por nombre
export const getAllMedicamentos = async (_req, res) => {
  // Consultar todos los medicamentos ordenados por nombre
  const { rows } = await pool.query("SELECT * FROM medicamentos ORDER BY nombre");
  // Devolver los medicamentos como JSON
  res.json(rows);
};

// Controlador para obtener un medicamento por ID
export const getMedicamentoById = async (req, res) => {
  const { id } = req.params;
  // Consultar el medicamento por ID
  const { rows } = await pool.query("SELECT * FROM medicamentos WHERE id = $1", [id]);
  // Si no se encuentra, devolver error 404
  if (!rows.length) return res.status(404).json({ message: "Medicamento no encontrado" });
  // Devolver el medicamento
  res.json(rows[0]);
};

// Controlador para crear un nuevo medicamento
export const createMedicamento = async (req, res) => {
  // Extraer datos del cuerpo de la solicitud
  const { nombre, descripcion, dosis } = req.body;
  // Insertar el nuevo medicamento en la base de datos
  const { rows } = await pool.query(
    `INSERT INTO medicamentos (nombre, descripcion, dosis)
     VALUES ($1, $2, $3) RETURNING *`,
    [nombre, descripcion, dosis]
  );
  // Devolver el medicamento creado con código 201
  res.status(201).json(rows[0]);
};

// Controlador para actualizar un medicamento existente
export const updateMedicamento = async (req, res) => {
  const { id } = req.params;
  // Extraer datos del cuerpo de la solicitud
  const { nombre, descripcion, dosis } = req.body;
  // Actualizar el medicamento en la base de datos
  const { rows } = await pool.query(
    `UPDATE medicamentos
     SET nombre = $1, descripcion = $2, dosis = $3
     WHERE id = $4 RETURNING *`,
    [nombre, descripcion, dosis, id]
  );
  // Si no se actualizó ninguna fila, el medicamento no existe
  if (!rows.length) return res.status(404).json({ message: "Medicamento no encontrado" });
  // Devolver el medicamento actualizado
  res.json(rows[0]);
};

// Controlador para eliminar un medicamento
export const deleteMedicamento = async (req, res) => {
  const { id } = req.params;
  // Intentar eliminar el medicamento
  const { rowCount } = await pool.query("DELETE FROM medicamentos WHERE id = $1", [id]);
  // Si no se eliminó ninguna fila, el medicamento no existe
  if (!rowCount) return res.status(404).json({ message: "Medicamento no encontrado" });
  // Devolver 204 No Content
  res.status(204).send();
};
