// Importar el pool de conexiones a la base de datos
import { pool } from "../db/pool.js";

// Función auxiliar para resolver el ID del cliente a partir de la cédula si es necesario
async function resolveClienteId(cliente_cedula, cliente_id) {
  if (cliente_id) return Number(cliente_id);
  if (!cliente_cedula) return null;

  // Consultar la base de datos para obtener el ID del cliente por cédula
  const { rows } = await pool.query("SELECT id FROM clientes WHERE cedula = $1 LIMIT 1", [cliente_cedula]);
  return rows.length ? rows[0].id : null;
}

// Función auxiliar para normalizar el ID del medicamento a entero o null
function resolveMedicamentoId(medicamento_id) {
  if (medicamento_id === null || medicamento_id === undefined || medicamento_id === "") return null;
  const value = Number(medicamento_id);
  return Number.isNaN(value) ? null : value;
}

// Controlador para obtener todas las mascotas con nombres de cliente y medicamento
export const getAllMascotas = async (_req, res) => {
  // Consulta para seleccionar todas las mascotas con joins a clientes y medicamentos
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
  // Devolver las mascotas como JSON
  res.json(rows);
};

// Controlador para obtener una mascota por ID
export const getMascotaById = async (req, res) => {
  const { id } = req.params;
  // Consulta para seleccionar la mascota por ID
  const { rows } = await pool.query(
    `SELECT id, nombre, raza, edad, COALESCE(edad_unidad, 'anios') AS edad_unidad, peso, cliente_id, medicamento_id
     FROM mascotas WHERE id = $1`,
    [id]
  );
  // Si no se encuentra la mascota, devolver error 404
  if (!rows.length) return res.status(404).json({ message: "Mascota no encontrada" });
  // Devolver la mascota
  res.json(rows[0]);
};

// Controlador para crear una nueva mascota con enlace opcional a medicamento
export const createMascota = async (req, res) => {
  // Extraer datos del cuerpo de la solicitud
  const { nombre, raza, edad, edad_unidad, peso, cliente_cedula, cliente_id, medicamento_id } = req.body;
  // Resolver el ID del cliente
  const clienteId = await resolveClienteId(cliente_cedula, cliente_id);
  if (!clienteId) return res.status(400).json({ message: "Cliente invalido para la mascota" });
  // Resolver el ID del medicamento
  const medicamentoId = resolveMedicamentoId(medicamento_id);

  // Insertar la nueva mascota en la base de datos
  const { rows } = await pool.query(
    `INSERT INTO mascotas (nombre, raza, edad, edad_unidad, peso, cliente_id, medicamento_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, nombre, raza, edad, COALESCE(edad_unidad, 'anios') AS edad_unidad, peso, cliente_id, medicamento_id`,
    [nombre, raza, edad, edad_unidad || "anios", peso, clienteId, medicamentoId]
  );
  // Devolver la mascota creada con código 201
  res.status(201).json(rows[0]);
};

// Controlador para actualizar una mascota con enlace opcional a medicamento
export const updateMascota = async (req, res) => {
  const { id } = req.params;
  // Extraer datos del cuerpo de la solicitud
  const { nombre, raza, edad, edad_unidad, peso, cliente_cedula, cliente_id, medicamento_id } = req.body;
  // Resolver el ID del cliente
  const clienteId = await resolveClienteId(cliente_cedula, cliente_id);
  if (!clienteId) return res.status(400).json({ message: "Cliente invalido para la mascota" });
  // Resolver el ID del medicamento
  const medicamentoId = resolveMedicamentoId(medicamento_id);

  // Actualizar la mascota en la base de datos
  const { rows } = await pool.query(
    `UPDATE mascotas
     SET nombre = $1, raza = $2, edad = $3, edad_unidad = $4, peso = $5, cliente_id = $6, medicamento_id = $7
     WHERE id = $8
     RETURNING id, nombre, raza, edad, COALESCE(edad_unidad, 'anios') AS edad_unidad, peso, cliente_id, medicamento_id`,
    [nombre, raza, edad, edad_unidad || "anios", peso, clienteId, medicamentoId, id]
  );
  // Si no se actualizó ninguna fila, la mascota no existe
  if (!rows.length) return res.status(404).json({ message: "Mascota no encontrada" });
  // Devolver la mascota actualizada
  res.json(rows[0]);
};

// Controlador para eliminar una mascota
export const deleteMascota = async (req, res) => {
  const { id } = req.params;
  // Intentar eliminar la mascota
  const { rowCount } = await pool.query("DELETE FROM mascotas WHERE id = $1", [id]);
  // Si no se eliminó ninguna fila, la mascota no existe
  if (!rowCount) return res.status(404).json({ message: "Mascota no encontrada" });
  // Devolver 204 No Content
  res.status(204).send();
};
