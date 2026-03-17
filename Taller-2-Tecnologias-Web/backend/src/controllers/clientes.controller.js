import { pool } from "../db/pool.js";

// List all clientes ordered by apellido/nombre.
export const getAllClientes = async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM clientes ORDER BY apellidos, nombres");
  res.json(rows);
};

export const getClienteByCedula = async (req, res) => {
  const { cedula } = req.params;
  const { rows } = await pool.query("SELECT * FROM clientes WHERE cedula = $1", [cedula]);
  if (!rows.length) return res.status(404).json({ message: "Cliente no encontrado" });
  res.json(rows[0]);
};

export const createCliente = async (req, res) => {
  const { cedula, nombres, apellidos, direccion, telefono } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO clientes (cedula, nombres, apellidos, direccion, telefono)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [cedula, nombres, apellidos, direccion, telefono]
  );
  res.status(201).json(rows[0]);
};

export const updateCliente = async (req, res) => {
  const { cedula } = req.params;
  const { nombres, apellidos, direccion, telefono } = req.body;
  const { rows } = await pool.query(
    `UPDATE clientes
     SET nombres = $1, apellidos = $2, direccion = $3, telefono = $4
     WHERE cedula = $5 RETURNING *`,
    [nombres, apellidos, direccion, telefono, cedula]
  );
  if (!rows.length) return res.status(404).json({ message: "Cliente no encontrado" });
  res.json(rows[0]);
};

// Delete a cliente; block if it has mascotas linked.
export const deleteCliente = async (req, res) => {
  const { cedula } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM clientes WHERE cedula = $1", [cedula]);
    if (!rowCount) return res.status(404).json({ message: "Cliente no encontrado" });
    res.status(204).send();
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({
        message: "No se puede eliminar el cliente porque tiene mascotas vinculadas",
      });
    }
    return res.status(500).json({ message: "Error al eliminar el cliente" });
  }
};
