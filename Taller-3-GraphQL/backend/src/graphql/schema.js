// Importar el constructor de esquemas de GraphQL.
import { buildSchema } from "graphql";
// Importar el pool de PostgreSQL para consultas.
import { pool } from "../db/pool.js";

// Definir el esquema GraphQL (tipos, inputs, queries y mutations).
export const schema = buildSchema(`
  type Cliente {
    id: ID!
    cedula: String!
    nombres: String!
    apellidos: String!
    direccion: String!
    telefono: String!
  }

  type Medicamento {
    id: ID!
    nombre: String!
    descripcion: String!
    dosis: String!
  }

  type Mascota {
    id: ID!
    nombre: String!
    raza: String!
    edad: Int!
    edad_unidad: String!
    peso: Float!
    cliente_id: Int!
    medicamento_id: Int
    cliente_cedula: String
    cliente_nombres: String
    cliente_apellidos: String
    medicamento_nombre: String
  }

  type ReporteCliente {
    cedula: String!
    nombres: String!
    apellidos: String!
    telefono: String!
    total_mascotas: Int!
  }

  type ReporteMedicamento {
    id: ID!
    nombre: String!
    dosis: String!
    total_mascotas: Int!
  }

  input ClienteInput {
    cedula: String!
    nombres: String!
    apellidos: String!
    direccion: String!
    telefono: String!
  }

  input MedicamentoInput {
    nombre: String!
    descripcion: String!
    dosis: String!
  }

  input MascotaInput {
    nombre: String!
    raza: String!
    edad: Int!
    edad_unidad: String
    peso: Float!
    cliente_cedula: String
    cliente_id: Int
    medicamento_id: Int
  }

  type Query {
    clientes: [Cliente!]!
    cliente(cedula: String!): Cliente
    medicamentos: [Medicamento!]!
    medicamento(id: ID!): Medicamento
    mascotas: [Mascota!]!
    mascota(id: ID!): Mascota
    reporteClientes: [ReporteCliente!]!
    reporteMedicamentos: [ReporteMedicamento!]!
  }

  type Mutation {
    createCliente(input: ClienteInput!): Cliente!
    updateCliente(cedula: String!, input: ClienteInput!): Cliente!
    deleteCliente(cedula: String!): Boolean!

    createMedicamento(input: MedicamentoInput!): Medicamento!
    updateMedicamento(id: ID!, input: MedicamentoInput!): Medicamento!
    deleteMedicamento(id: ID!): Boolean!

    createMascota(input: MascotaInput!): Mascota!
    updateMascota(id: ID!, input: MascotaInput!): Mascota!
    deleteMascota(id: ID!): Boolean!
  }
`);

// Resolver auxiliar: obtener el id interno del cliente desde cedula o id directo.
async function resolveClienteId(cliente_cedula, cliente_id) {
  if (cliente_id) return Number(cliente_id);
  if (!cliente_cedula) return null;
  const { rows } = await pool.query("SELECT id FROM clientes WHERE cedula = $1 LIMIT 1", [cliente_cedula]);
  return rows.length ? rows[0].id : null;
}

// Resolver auxiliar: normalizar el id del medicamento (numero o null).
function resolveMedicamentoId(medicamento_id) {
  if (medicamento_id === null || medicamento_id === undefined || medicamento_id === "") return null;
  const value = Number(medicamento_id);
  return Number.isNaN(value) ? null : value;
}

// Root resolvers: implementan la logica de cada Query y Mutation.
export const root = {
  // Queries de clientes.
  clientes: async () => {
    const { rows } = await pool.query("SELECT * FROM clientes ORDER BY apellidos, nombres");
    return rows;
  },
  cliente: async ({ cedula }) => {
    const { rows } = await pool.query("SELECT * FROM clientes WHERE cedula = $1", [cedula]);
    return rows[0] || null;
  },
  // Queries de medicamentos.
  medicamentos: async () => {
    const { rows } = await pool.query("SELECT * FROM medicamentos ORDER BY nombre");
    return rows;
  },
  medicamento: async ({ id }) => {
    const { rows } = await pool.query("SELECT * FROM medicamentos WHERE id = $1", [id]);
    return rows[0] || null;
  },
  // Queries de mascotas (incluye joins para nombres de cliente/medicamento).
  mascotas: async () => {
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
    return rows;
  },
  mascota: async ({ id }) => {
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
       WHERE m.id = $1`,
      [id]
    );
    return rows[0] || null;
  },
  // Reporte de clientes con total de mascotas.
  reporteClientes: async () => {
    const { rows } = await pool.query(
      `SELECT c.cedula, c.nombres, c.apellidos, c.telefono, COUNT(m.id) AS total_mascotas
       FROM clientes c
       LEFT JOIN mascotas m ON m.cliente_id = c.id
       GROUP BY c.cedula, c.nombres, c.apellidos, c.telefono
       ORDER BY c.apellidos, c.nombres`
    );
    return rows.map((row) => ({ ...row, total_mascotas: Number(row.total_mascotas) }));
  },
  // Reporte de medicamentos con total de mascotas.
  reporteMedicamentos: async () => {
    const { rows } = await pool.query(
      `SELECT md.id, md.nombre, md.dosis, COUNT(m.id) AS total_mascotas
       FROM medicamentos md
       LEFT JOIN mascotas m ON m.medicamento_id = md.id
       GROUP BY md.id, md.nombre, md.dosis
       ORDER BY md.nombre`
    );
    return rows.map((row) => ({ ...row, total_mascotas: Number(row.total_mascotas) }));
  },

  // Mutations de clientes.
  createCliente: async ({ input }) => {
    const { cedula, nombres, apellidos, direccion, telefono } = input;
    const { rows } = await pool.query(
      `INSERT INTO clientes (cedula, nombres, apellidos, direccion, telefono)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [cedula, nombres, apellidos, direccion, telefono]
    );
    return rows[0];
  },
  updateCliente: async ({ cedula, input }) => {
    const { nombres, apellidos, direccion, telefono } = input;
    const { rows } = await pool.query(
      `UPDATE clientes
       SET nombres = $1, apellidos = $2, direccion = $3, telefono = $4
       WHERE cedula = $5 RETURNING *`,
      [nombres, apellidos, direccion, telefono, cedula]
    );
    if (!rows.length) throw new Error("Cliente no encontrado");
    return rows[0];
  },
  deleteCliente: async ({ cedula }) => {
    try {
      const { rowCount } = await pool.query("DELETE FROM clientes WHERE cedula = $1", [cedula]);
      if (!rowCount) throw new Error("Cliente no encontrado");
      return true;
    } catch (error) {
      if (error.code === "23503") {
        throw new Error("No se puede eliminar el cliente porque tiene mascotas vinculadas");
      }
      throw error;
    }
  },

  // Mutations de medicamentos.
  createMedicamento: async ({ input }) => {
    const { nombre, descripcion, dosis } = input;
    const { rows } = await pool.query(
      `INSERT INTO medicamentos (nombre, descripcion, dosis)
       VALUES ($1, $2, $3) RETURNING *`,
      [nombre, descripcion, dosis]
    );
    return rows[0];
  },
  updateMedicamento: async ({ id, input }) => {
    const { nombre, descripcion, dosis } = input;
    const { rows } = await pool.query(
      `UPDATE medicamentos
       SET nombre = $1, descripcion = $2, dosis = $3
       WHERE id = $4 RETURNING *`,
      [nombre, descripcion, dosis, id]
    );
    if (!rows.length) throw new Error("Medicamento no encontrado");
    return rows[0];
  },
  deleteMedicamento: async ({ id }) => {
    const { rowCount } = await pool.query("DELETE FROM medicamentos WHERE id = $1", [id]);
    if (!rowCount) throw new Error("Medicamento no encontrado");
    return true;
  },

  // Mutations de mascotas.
  createMascota: async ({ input }) => {
    const { nombre, raza, edad, edad_unidad, peso, cliente_cedula, cliente_id, medicamento_id } = input;
    const clienteId = await resolveClienteId(cliente_cedula, cliente_id);
    if (!clienteId) throw new Error("Cliente invalido para la mascota");
    const medicamentoId = resolveMedicamentoId(medicamento_id);

    const { rows } = await pool.query(
      `INSERT INTO mascotas (nombre, raza, edad, edad_unidad, peso, cliente_id, medicamento_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nombre, raza, edad, COALESCE(edad_unidad, 'anios') AS edad_unidad, peso, cliente_id, medicamento_id`,
      [nombre, raza, edad, edad_unidad || "anios", peso, clienteId, medicamentoId]
    );
    const mascota = rows[0];
    const detalle = await root.mascota({ id: mascota.id });
    return detalle || mascota;
  },
  updateMascota: async ({ id, input }) => {
    const { nombre, raza, edad, edad_unidad, peso, cliente_cedula, cliente_id, medicamento_id } = input;
    const clienteId = await resolveClienteId(cliente_cedula, cliente_id);
    if (!clienteId) throw new Error("Cliente invalido para la mascota");
    const medicamentoId = resolveMedicamentoId(medicamento_id);

    const { rows } = await pool.query(
      `UPDATE mascotas
       SET nombre = $1, raza = $2, edad = $3, edad_unidad = $4, peso = $5, cliente_id = $6, medicamento_id = $7
       WHERE id = $8
       RETURNING id, nombre, raza, edad, COALESCE(edad_unidad, 'anios') AS edad_unidad, peso, cliente_id, medicamento_id`,
      [nombre, raza, edad, edad_unidad || "anios", peso, clienteId, medicamentoId, id]
    );
    if (!rows.length) throw new Error("Mascota no encontrada");
    const mascota = rows[0];
    const detalle = await root.mascota({ id: mascota.id });
    return detalle || mascota;
  },
  deleteMascota: async ({ id }) => {
    const { rowCount } = await pool.query("DELETE FROM mascotas WHERE id = $1", [id]);
    if (!rowCount) throw new Error("Mascota no encontrada");
    return true;
  },
};
