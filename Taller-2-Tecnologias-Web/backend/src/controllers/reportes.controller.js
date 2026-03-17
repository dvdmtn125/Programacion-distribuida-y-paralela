// Importar el pool de conexiones a la base de datos
import { pool } from "../db/pool.js";

// Reporte: clientes con el total de mascotas asociadas
export const reporteClientes = async (_req, res) => {
  // Consulta para obtener clientes con conteo de mascotas
  const { rows } = await pool.query(
    `SELECT c.cedula, c.nombres, c.apellidos, c.telefono, COUNT(m.id) AS total_mascotas
     FROM clientes c
     LEFT JOIN mascotas m ON m.cliente_id = c.id
     GROUP BY c.cedula, c.nombres, c.apellidos, c.telefono
     ORDER BY c.apellidos, c.nombres`
  );
  // Devolver el reporte como JSON
  res.json(rows);
};

// Reporte: medicamentos con el total de mascotas vinculadas
export const reporteMedicamentos = async (_req, res) => {
  // Consulta para obtener medicamentos con conteo de mascotas
  const { rows } = await pool.query(
    `SELECT md.id, md.nombre, md.dosis, COUNT(m.id) AS total_mascotas
     FROM medicamentos md
     LEFT JOIN mascotas m ON m.medicamento_id = md.id
     GROUP BY md.id, md.nombre, md.dosis
     ORDER BY md.nombre`
  );
  // Devolver el reporte como JSON
  res.json(rows);
};
