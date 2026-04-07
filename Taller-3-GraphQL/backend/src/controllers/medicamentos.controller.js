// Importar el pool de conexiones a la base de datos.
import { pool } from "../db/pool.js";

// Obtener todos los medicamentos ordenados por nombre.
export const getAllMedicamentos = async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM medicamentos ORDER BY nombre");
  res.json(rows);
};

// Obtener un medicamento por id.
export const getMedicamentoById = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query("SELECT * FROM medicamentos WHERE id = $1", [id]);
  if (!rows.length) return res.status(404).json({ message: "Medicamento no encontrado" });
  res.json(rows[0]);
};

// Crear un medicamento.
export const createMedicamento = async (req, res) => {
  const { nombre, descripcion, dosis } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO medicamentos (nombre, descripcion, dosis)
     VALUES ($1, $2, $3) RETURNING *`,
    [nombre, descripcion, dosis]
  );
  res.status(201).json(rows[0]);
};

// Actualizar un medicamento.
export const updateMedicamento = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, dosis } = req.body;
  const { rows } = await pool.query(
    `UPDATE medicamentos
     SET nombre = $1, descripcion = $2, dosis = $3
     WHERE id = $4 RETURNING *`,
    [nombre, descripcion, dosis, id]
  );
  if (!rows.length) return res.status(404).json({ message: "Medicamento no encontrado" });
  res.json(rows[0]);
};

// Eliminar un medicamento.
export const deleteMedicamento = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query("DELETE FROM medicamentos WHERE id = $1", [id]);
  if (!rowCount) return res.status(404).json({ message: "Medicamento no encontrado" });
  res.status(204).send();
};
