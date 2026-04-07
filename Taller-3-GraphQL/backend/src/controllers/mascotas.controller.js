// Importar el pool de conexiones a la base de datos.
import { pool } from "../db/pool.js";

// Resolver el id del cliente usando cedula o id directo.
async function resolveClienteId(cliente_cedula, cliente_id) {
  if (cliente_id) return Number(cliente_id);
  if (!cliente_cedula) return null;

  const { rows } = await pool.query("SELECT id FROM clientes WHERE cedula = $1 LIMIT 1", [cliente_cedula]);
  return rows.length ? rows[0].id : null;
}

// Normalizar el id del medicamento a entero o null.
function resolveMedicamentoId(medicamento_id) {
  if (medicamento_id === null || medicamento_id === undefined || medicamento_id === "") return null;
  const value = Number(medicamento_id);
  return Number.isNaN(value) ? null : value;
}

// Obtener todas las mascotas con datos de cliente y medicamento.
export const getAllMascotas = async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT
      m.id,
      m.nombre,
      m.raza,
      m.edad,
      COALESCE(m.edad_unidad, 'anios') AS edad_unidad,
      m.peso,
      m.cliente_id,
      m.medicamento_id,
      c.cedula AS cliente_cedula,
      c.nombres AS cliente_nombres,
      c.apellidos AS cliente_apellidos,
      md.nombre AS medicamento_nombre
     FROM mascotas m
     LEFT JOIN clientes c ON c.id = m.cliente_id
     LEFT JOIN medicamentos md ON md.id = m.medicamento_id
     ORDER BY m.nombre`
  );
  res.json(rows);
};

// Obtener una mascota por id.
export const getMascotaById = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    `SELECT id, nombre, raza, edad, COALESCE(edad_unidad, 'anios') AS edad_unidad, peso, cliente_id, medicamento_id
     FROM mascotas WHERE id = $1`,
    [id]
  );
  if (!rows.length) return res.status(404).json({ message: "Mascota no encontrada" });
  res.json(rows[0]);
};

// Crear una mascota con medicamento opcional.
export const createMascota = async (req, res) => {
  const { nombre, raza, edad, edad_unidad, peso, cliente_cedula, cliente_id, medicamento_id } = req.body;
  const clienteId = await resolveClienteId(cliente_cedula, cliente_id);
  if (!clienteId) return res.status(400).json({ message: "Cliente invalido para la mascota" });
  const medicamentoId = resolveMedicamentoId(medicamento_id);

  const { rows } = await pool.query(
    `INSERT INTO mascotas (nombre, raza, edad, edad_unidad, peso, cliente_id, medicamento_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, nombre, raza, edad, COALESCE(edad_unidad, 'anios') AS edad_unidad, peso, cliente_id, medicamento_id`,
    [nombre, raza, edad, edad_unidad || "anios", peso, clienteId, medicamentoId]
  );
  res.status(201).json(rows[0]);
};

// Actualizar una mascota.
export const updateMascota = async (req, res) => {
  const { id } = req.params;
  const { nombre, raza, edad, edad_unidad, peso, cliente_cedula, cliente_id, medicamento_id } = req.body;
  const clienteId = await resolveClienteId(cliente_cedula, cliente_id);
  if (!clienteId) return res.status(400).json({ message: "Cliente invalido para la mascota" });
  const medicamentoId = resolveMedicamentoId(medicamento_id);

  const { rows } = await pool.query(
    `UPDATE mascotas
     SET nombre = $1, raza = $2, edad = $3, edad_unidad = $4, peso = $5, cliente_id = $6, medicamento_id = $7
     WHERE id = $8
     RETURNING id, nombre, raza, edad, COALESCE(edad_unidad, 'anios') AS edad_unidad, peso, cliente_id, medicamento_id`,
    [nombre, raza, edad, edad_unidad || "anios", peso, clienteId, medicamentoId, id]
  );
  if (!rows.length) return res.status(404).json({ message: "Mascota no encontrada" });
  res.json(rows[0]);
};

// Eliminar una mascota.
export const deleteMascota = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query("DELETE FROM mascotas WHERE id = $1", [id]);
  if (!rowCount) return res.status(404).json({ message: "Mascota no encontrada" });
  res.status(204).send();
};
