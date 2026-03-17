import { useEffect, useState } from "react";
import { apiRequest } from "./services/api";

// Modelo de formulario predeterminado para cada entidad.
// React web con Vite

const initialCliente = { cedula: "", nombres: "", apellidos: "", direccion: "", telefono: "" };
const initialMedicamento = { nombre: "", descripcion: "", dosis: "" };
const initialMascota = {
  nombre: "",
  raza: "",
  edad: "",
  edad_unidad: "anios",
  peso: "",
  cliente_cedula: "",
  medicamento_id: "",
};

// Unidad de la edad guardada en la DB como valores normalizados.
const unidadEdadOptions = [
  { value: "dias", label: "Días" },
  { value: "semanas", label: "Semanas" },
  { value: "meses", label: "Meses" },
  { value: "anios", label: "Años" },
];

// Convierte las unidades guardadas a etiquetas en la UI.
function formatEdadUnidad(unidad) {
  const map = {
    dias: "días",
    semanas: "semanas",
    meses: "meses",
    anios: "años",
  };
  return map[unidad] || "años";
}
export default function App() {
  const [tab, setTab] = useState("clientes");
  const [clientes, setClientes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [reporteClientes, setReporteClientes] = useState([]);
  const [reporteMedicamentos, setReporteMedicamentos] = useState([]);

  const [clienteForm, setClienteForm] = useState(initialCliente);
  const [medicamentoForm, setMedicamentoForm] = useState(initialMedicamento);
  const [mascotaForm, setMascotaForm] = useState(initialMascota);

  const [editCliente, setEditCliente] = useState(false);
  const [editMedicamento, setEditMedicamento] = useState(null);
  const [editMascota, setEditMascota] = useState(null);

  const [searchCliente, setSearchCliente] = useState("");
  const [searchMedicamento, setSearchMedicamento] = useState("");
  const [searchMascota, setSearchMascota] = useState("");

  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);

  // Alertas push y autocierre despues de 10 segundos.
  const pushAlert = (type, message) => {
    const id = Date.now() + Math.random();
    setAlerts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 10000);
  };

  // Remove a specific alert.
  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Fetch a la listas principales de las pestañas.
  async function loadAll() {
    try {
      setError("");
      const [c, md, ms] = await Promise.all([
        apiRequest("/clientes"),
        apiRequest("/medicamentos"),
        apiRequest("/mascotas"),
      ]);
      setClientes(c);
      setMedicamentos(md);
      setMascotas(ms);
    } catch (e) {
      setError(e.message);
      pushAlert("error", e.message);
    }
  }

  // Fetch para los reportes por demanda.
  async function loadReportes() {
    try {
      setError("");
      const [rc, rm] = await Promise.all([
        apiRequest("/reportes/clientes"),
        apiRequest("/reportes/medicamentos"),
      ]);
      setReporteClientes(rc);
      setReporteMedicamentos(rm);
    } catch (e) {
      setError(e.message);
      pushAlert("error", e.message);
    }
  }

  // Carga de los datos inicial.
  useEffect(() => {
    loadAll();
  }, []);

  // Fetch para los reportes cuando la pestaña de reportes se abrá.
  useEffect(() => {
    if (tab === "reportes") loadReportes();
  }, [tab]);

  // Controlador de cambios genérico para campos de formulario.
  const onChange = (setter) => (e) => setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // CRUD: Clientes.
  async function submitCliente(e) {
    e.preventDefault();
    try {
      setError("");
      if (editCliente) {
        await apiRequest(`/clientes/${clienteForm.cedula}`, {
          method: "PUT",
          body: JSON.stringify(clienteForm),
        });
        pushAlert("success", "Cliente actualizado");
      } else {
        await apiRequest("/clientes", { method: "POST", body: JSON.stringify(clienteForm) });
        pushAlert("success", "Cliente creado");
      }
      setClienteForm(initialCliente);
      setEditCliente(false);
      loadAll();
    } catch (err) {
      setError(err.message);
      pushAlert("error", err.message);
    }
  }

  // CRUD: Medicamentos.
  async function submitMedicamento(e) {
    e.preventDefault();
    try {
      setError("");
      if (editMedicamento) {
        await apiRequest(`/medicamentos/${editMedicamento}`, {
          method: "PUT",
          body: JSON.stringify(medicamentoForm),
        });
        pushAlert("success", "Medicamento actualizado");
      } else {
        await apiRequest("/medicamentos", { method: "POST", body: JSON.stringify(medicamentoForm) });
        pushAlert("success", "Medicamento creado");
      }
      setMedicamentoForm(initialMedicamento);
      setEditMedicamento(null);
      loadAll();
    } catch (err) {
      setError(err.message);
      pushAlert("error", err.message);
    }
  }

  // CRUD: Mascotas (Incluye la medicacion opcional).
  async function submitMascota(e) {
    e.preventDefault();
    try {
      setError("");
      const payload = {
        ...mascotaForm,
        edad: Number(mascotaForm.edad),
        peso: Number(mascotaForm.peso),
        medicamento_id:
          mascotaForm.medicamento_id && mascotaForm.medicamento_id !== "NA"
            ? Number(mascotaForm.medicamento_id)
            : null,
      };
      if (editMascota) {
        await apiRequest(`/mascotas/${editMascota}`, { method: "PUT", body: JSON.stringify(payload) });
        pushAlert("success", "Mascota actualizada");
      } else {
        await apiRequest("/mascotas", { method: "POST", body: JSON.stringify(payload) });
        pushAlert("success", "Mascota creada");
      }
      setMascotaForm(initialMascota);
      setEditMascota(null);
      loadAll();
    } catch (err) {
      setError(err.message);
      pushAlert("error", err.message);
    }
  }

  // Controlador de eliminar generico.
  async function remove(path) {
    try {
      setError("");
      await apiRequest(path, { method: "DELETE" });
      pushAlert("success", "Registro eliminado");
      loadAll();
      if (tab === "reportes") loadReportes();
    } catch (err) {
      setError(err.message);
      pushAlert("error", err.message);
    }
  }

  const clientesQuery = searchCliente.trim().toLowerCase();
  const medicamentosQuery = searchMedicamento.trim().toLowerCase();
  const mascotasQuery = searchMascota.trim().toLowerCase();

  const clientesFiltrados = clientesQuery
    ? clientes.filter((c) =>
        `${c.cedula} ${c.nombres} ${c.apellidos} ${c.direccion} ${c.telefono}`
          .toLowerCase()
          .includes(clientesQuery)
      )
    : clientes;

  const medicamentosFiltrados = medicamentosQuery
    ? medicamentos.filter((m) =>
        `${m.id} ${m.nombre} ${m.descripcion} ${m.dosis}`.toLowerCase().includes(medicamentosQuery)
      )
    : medicamentos;

  const mascotasFiltradas = mascotasQuery
    ? mascotas.filter((m) =>
        `${m.id} ${m.nombre} ${m.raza} ${m.edad} ${m.cliente_nombres} ${m.cliente_apellidos} ${
          m.medicamento_nombre || ""
        }`
          .toLowerCase()
          .includes(mascotasQuery)
      )
    : mascotas;

  return (
    <main className="container">
      <h1>PETS S.A. - Gestion Veterinaria</h1>
      <nav className="tabs">
        {[
          ["clientes", "Clientes"],
          ["medicamentos", "Medicamentos"],
          ["mascotas", "Mascotas"],
          ["reportes", "Reportes"],
        ].map(([key, label]) => (
          <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      {alerts.length > 0 && (
        <div className="alerts">
          {alerts.map((alert) => (
            <div key={alert.id} className={`alert ${alert.type}`}>
              <span>{alert.message}</span>
              <button type="button" onClick={() => dismissAlert(alert.id)}>x</button>
            </div>
          ))}
        </div>
      )}

      {error && null}

      {tab === "clientes" && (
        <section>
          <form onSubmit={submitCliente} className="form-grid">
            <input name="cedula" placeholder="Cedula" value={clienteForm.cedula} onChange={onChange(setClienteForm)} disabled={editCliente} required />
            <input name="nombres" placeholder="Nombres" value={clienteForm.nombres} onChange={onChange(setClienteForm)} required />
            <input name="apellidos" placeholder="Apellidos" value={clienteForm.apellidos} onChange={onChange(setClienteForm)} required />
            <input name="direccion" placeholder="Direccion" value={clienteForm.direccion} onChange={onChange(setClienteForm)} required />
            <input name="telefono" placeholder="Telefono" value={clienteForm.telefono} onChange={onChange(setClienteForm)} required />
            <button type="submit">{editCliente ? "Actualizar" : "Crear"} cliente</button>
          </form>

          <div className="form-grid">
            <input
              name="buscar_cliente"
              placeholder="Buscar clientes..."
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
            />
          </div>

          <table>
            <thead><tr><th>Cedula</th><th>Nombre</th><th>Direccion</th><th>Telefono</th><th>Acciones</th></tr></thead>
            <tbody>
              {clientesFiltrados.map((c) => (
                <tr key={c.cedula}>
                  <td>{c.cedula}</td><td>{c.nombres} {c.apellidos}</td><td>{c.direccion}</td><td>{c.telefono}</td>
                  <td>
                    <button onClick={() => { setClienteForm(c); setEditCliente(true); }}>Editar</button>
                    <button onClick={() => remove(`/clientes/${c.cedula}`)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "medicamentos" && (
        <section>
          <form onSubmit={submitMedicamento} className="form-grid">
            <input name="nombre" placeholder="Nombre" value={medicamentoForm.nombre} onChange={onChange(setMedicamentoForm)} required />
            <input name="descripcion" placeholder="Descripcion" value={medicamentoForm.descripcion} onChange={onChange(setMedicamentoForm)} required />
            <input name="dosis" placeholder="Dosis" value={medicamentoForm.dosis} onChange={onChange(setMedicamentoForm)} required />
            <button type="submit">{editMedicamento ? "Actualizar" : "Crear"} medicamento</button>
          </form>

          <div className="form-grid">
            <input
              name="buscar_medicamento"
              placeholder="Buscar medicamentos..."
              value={searchMedicamento}
              onChange={(e) => setSearchMedicamento(e.target.value)}
            />
          </div>

          <table>
            <thead><tr><th>ID</th><th>Nombre</th><th>Descripcion</th><th>Dosis</th><th>Acciones</th></tr></thead>
            <tbody>
              {medicamentosFiltrados.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td><td>{m.nombre}</td><td>{m.descripcion}</td><td>{m.dosis}</td>
                  <td>
                    <button onClick={() => { setMedicamentoForm(m); setEditMedicamento(m.id); }}>Editar</button>
                    <button onClick={() => remove(`/medicamentos/${m.id}`)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "mascotas" && (
        <section>
          <form onSubmit={submitMascota} className="form-grid">
            <input name="nombre" placeholder="Nombre" value={mascotaForm.nombre} onChange={onChange(setMascotaForm)} required />
            <input name="raza" placeholder="Raza" value={mascotaForm.raza} onChange={onChange(setMascotaForm)} required />
            <input name="edad" type="number" min="0" placeholder="Edad" value={mascotaForm.edad} onChange={onChange(setMascotaForm)} required />
            <select name="edad_unidad" value={mascotaForm.edad_unidad} onChange={onChange(setMascotaForm)} required>
              {unidadEdadOptions.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
            <input name="peso" type="number" step="0.01" placeholder="Peso" value={mascotaForm.peso} onChange={onChange(setMascotaForm)} required />
            <select name="cliente_cedula" value={mascotaForm.cliente_cedula} onChange={onChange(setMascotaForm)} required>
              <option value="">Cliente</option>
              {clientes.map((c) => <option key={c.cedula} value={c.cedula}>{c.nombres} {c.apellidos}</option>)}
            </select>
            <select name="medicamento_id" value={mascotaForm.medicamento_id} onChange={onChange(setMascotaForm)}>
              <option value="">Medicamento</option>
              <option value="NA">N/A</option>
              {medicamentos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <button type="submit">{editMascota ? "Actualizar" : "Crear"} mascota</button>
          </form>

          <div className="form-grid">
            <input
              name="buscar_mascota"
              placeholder="Buscar mascotas..."
              value={searchMascota}
              onChange={(e) => setSearchMascota(e.target.value)}
            />
          </div>

          <table>
            <thead><tr><th>ID</th><th>Nombre</th><th>Raza</th><th>Edad</th><th>Peso</th><th>Cliente</th><th>Medicamento</th><th>Acciones</th></tr></thead>
            <tbody>
              {mascotasFiltradas.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.nombre}</td>
                  <td>{m.raza}</td>
                  <td>{m.edad} {formatEdadUnidad(m.edad_unidad)}</td>
                  <td>{m.peso}</td>
                  <td>{m.cliente_nombres} {m.cliente_apellidos}</td>
                  <td>{m.medicamento_nombre || "N/A"}</td>
                  <td>
                    <button onClick={() => {
                      setMascotaForm({
                        nombre: m.nombre,
                        raza: m.raza,
                        edad: m.edad,
                        edad_unidad: m.edad_unidad || "anios",
                        peso: m.peso,
                        cliente_cedula: m.cliente_cedula,
                        medicamento_id: m.medicamento_id || "",
                      });
                      setEditMascota(m.id);
                    }}>Editar</button>
                    <button onClick={() => remove(`/mascotas/${m.id}`)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "reportes" && (
        <section className="report-grid">
          <article>
            <h2>Reporte de clientes</h2>
            <table>
              <thead><tr><th>Cedula</th><th>Cliente</th><th>Telefono</th><th>Total mascotas</th></tr></thead>
              <tbody>
                {reporteClientes.map((r) => (
                  <tr key={r.cedula}><td>{r.cedula}</td><td>{r.nombres} {r.apellidos}</td><td>{r.telefono}</td><td>{r.total_mascotas}</td></tr>
                ))}
              </tbody>
            </table>
          </article>

          <article>
            <h2>Reporte de medicamentos</h2>
            <table>
              <thead><tr><th>ID</th><th>Medicamento</th><th>Dosis</th><th>Total mascotas</th></tr></thead>
              <tbody>
                {reporteMedicamentos.map((r) => (
                  <tr key={r.id}><td>{r.id}</td><td>{r.nombre}</td><td>{r.dosis}</td><td>{r.total_mascotas}</td></tr>
                ))}
              </tbody>
            </table>
          </article>
        </section>
      )}
    </main>
  );
}
