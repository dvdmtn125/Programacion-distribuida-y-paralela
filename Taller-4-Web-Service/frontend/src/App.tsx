import { FormEvent, useEffect, useState } from "react";
import { api, Curso, Inscripcion, Usuario } from "./api";

type CursoForm = {
  nombre: string;
  descripcion: string;
  cupo: number;
};

type UsuarioForm = {
  nombre: string;
  correo: string;
  carrera: string;
};

type TabKey = "cursos" | "estudiantes" | "inscripciones" | "reportes";

const initialCurso: CursoForm = {
  nombre: "",
  descripcion: "",
  cupo: 30
};

const initialUsuario: UsuarioForm = {
  nombre: "",
  correo: "",
  carrera: ""
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "cursos", label: "Cursos" },
  { key: "estudiantes", label: "Estudiantes" },
  { key: "inscripciones", label: "Inscripciones" },
  { key: "reportes", label: "Reporte XML" }
];

// Calculates the seats that are still available for each course.
function getAvailableSeats(curso: Curso, inscripciones: Inscripcion[]) {
  const inscritos = inscripciones.filter((inscripcion) => inscripcion.curso_id === curso.id).length;
  return {
    inscritos,
    cuposDisponibles: Math.max(curso.cupo - inscritos, 0)
  };
}

export default function App() {
  // Main state used by the dashboard.
  const [activeTab, setActiveTab] = useState<TabKey>("cursos");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cursoForm, setCursoForm] = useState<CursoForm>(initialCurso);
  const [usuarioForm, setUsuarioForm] = useState<UsuarioForm>(initialUsuario);
  const [usuarioId, setUsuarioId] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [xmlReport, setXmlReport] = useState("");
  const [status, setStatus] = useState("Conecta el backend para comenzar.");

  // Refreshes only the XML report after a mutation.
  async function refreshReport() {
    try {
      const loadedXml = await api.getReporteXml();
      setXmlReport(loadedXml);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No fue posible actualizar el reporte.");
    }
  }

  // Loads all initial data when the page starts.
  async function loadData() {
    try {
      const [loadedCursos, loadedUsuarios, loadedInscripciones, loadedXml] = await Promise.all([
        api.listCursos(),
        api.listUsuarios(),
        api.listInscripciones(),
        api.getReporteXml()
      ]);
      setCursos(loadedCursos);
      setUsuarios(loadedUsuarios);
      setInscripciones(loadedInscripciones);
      setXmlReport(loadedXml);
      setStatus("Datos sincronizados correctamente.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No fue posible cargar los datos.");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function submitCurso(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const createdCurso = await api.createCurso(cursoForm);
      setCursos((currentCursos) => [...currentCursos, createdCurso]);
      setCursoForm(initialCurso);
      setStatus("Curso creado correctamente.");
      void refreshReport();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo crear el curso.");
    }
  }

  async function submitUsuario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const createdUsuario = await api.createUsuario(usuarioForm);
      setUsuarios((currentUsuarios) => [...currentUsuarios, createdUsuario]);
      setUsuarioForm(initialUsuario);
      setStatus("Estudiante creado correctamente.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo crear el usuario.");
    }
  }

  async function submitInscripcion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedCourse = cursos.find((curso) => curso.id === Number(cursoId));
    if (!selectedCourse) {
      setStatus("Selecciona un curso valido.");
      return;
    }

    const { cuposDisponibles } = getAvailableSeats(selectedCourse, inscripciones);
    if (cuposDisponibles <= 0) {
      window.alert("No hay cupos disponibles para este curso.");
      setStatus("No hay cupos disponibles para este curso.");
      return;
    }

    try {
      const createdInscripcion = await api.createInscripcion({
        usuario_id: Number(usuarioId),
        curso_id: Number(cursoId)
      });
      setInscripciones((currentInscripciones) => [...currentInscripciones, createdInscripcion]);
      setUsuarioId("");
      setCursoId("");
      setStatus("Inscripcion creada correctamente.");
      void refreshReport();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo registrar la inscripcion.";
      if (message.includes("No hay cupos disponibles")) {
        window.alert("No hay cupos disponibles para este curso.");
      }
      setStatus(message);
    }
  }

  async function handleDeleteCurso(cursoIdToDelete: number) {
    try {
      await api.deleteCurso(cursoIdToDelete);
      setCursos((currentCursos) => currentCursos.filter((curso) => curso.id !== cursoIdToDelete));
      setInscripciones((currentInscripciones) =>
        currentInscripciones.filter((inscripcion) => inscripcion.curso_id !== cursoIdToDelete)
      );
      setStatus("Curso eliminado correctamente.");
      void refreshReport();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo eliminar el curso.");
    }
  }

  async function handleDeleteUsuario(usuarioIdToDelete: number) {
    try {
      await api.deleteUsuario(usuarioIdToDelete);
      setUsuarios((currentUsuarios) =>
        currentUsuarios.filter((usuario) => usuario.id !== usuarioIdToDelete)
      );
      setInscripciones((currentInscripciones) =>
        currentInscripciones.filter((inscripcion) => inscripcion.usuario_id !== usuarioIdToDelete)
      );
      setStatus("Estudiante eliminado correctamente.");
      void refreshReport();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo eliminar el estudiante.");
    }
  }

  async function handleDeleteInscripcion(inscripcionIdToDelete: number) {
    try {
      await api.deleteInscripcion(inscripcionIdToDelete);
      setInscripciones((currentInscripciones) =>
        currentInscripciones.filter((inscripcion) => inscripcion.id !== inscripcionIdToDelete)
      );
      setStatus("Inscripcion eliminada correctamente.");
      void refreshReport();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo eliminar la inscripcion.");
    }
  }

  function renderCursosTab() {
    return (
      <section className="tab-layout">
        <article className="panel">
          <p className="eyebrow">Nuevo Curso</p>
          <h2>Registrar curso</h2>
          <form onSubmit={submitCurso} className="stack-form">
            <input
              value={cursoForm.nombre}
              onChange={(event) => setCursoForm({ ...cursoForm, nombre: event.target.value })}
              placeholder="Nombre del curso"
              required
            />
            <textarea
              value={cursoForm.descripcion}
              onChange={(event) => setCursoForm({ ...cursoForm, descripcion: event.target.value })}
              placeholder="Descripcion"
              required
            />
            <input
              type="number"
              min="1"
              value={cursoForm.cupo}
              onChange={(event) =>
                setCursoForm({ ...cursoForm, cupo: Number(event.target.value) })
              }
              placeholder="Cupo"
              required
            />
            <button type="submit">Crear curso</button>
          </form>
        </article>

        <article className="panel data-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Base De Datos</p>
              <h2>Tabla de cursos</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripcion</th>
                  <th>Cupo total</th>
                  <th>Disponibles</th>
                  <th>Inscritos</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {cursos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-cell">
                      Todavia no hay cursos registrados.
                    </td>
                  </tr>
                ) : (
                  cursos.map((curso) => {
                    const seatInfo = getAvailableSeats(curso, inscripciones);
                    return (
                      <tr key={curso.id}>
                        <td>{curso.id}</td>
                        <td>{curso.nombre}</td>
                        <td>{curso.descripcion}</td>
                        <td>{curso.cupo}</td>
                        <td>{seatInfo.cuposDisponibles}</td>
                        <td>{seatInfo.inscritos}</td>
                        <td>
                          <button onClick={() => void handleDeleteCurso(curso.id)}>Eliminar</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    );
  }

  function renderUsuariosTab() {
    return (
      <section className="tab-layout">
        <article className="panel">
          <p className="eyebrow">Nuevo Estudiante</p>
          <h2>Registrar estudiante</h2>
          <form onSubmit={submitUsuario} className="stack-form">
            <input
              value={usuarioForm.nombre}
              onChange={(event) => setUsuarioForm({ ...usuarioForm, nombre: event.target.value })}
              placeholder="Nombre del estudiante"
              required
            />
            <input
              value={usuarioForm.correo}
              onChange={(event) => setUsuarioForm({ ...usuarioForm, correo: event.target.value })}
              placeholder="Correo"
              type="email"
              required
            />
            <input
              value={usuarioForm.carrera}
              onChange={(event) => setUsuarioForm({ ...usuarioForm, carrera: event.target.value })}
              placeholder="Carrera"
              required
            />
            <button type="submit">Crear estudiante</button>
          </form>
        </article>

        <article className="panel data-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Base De Datos</p>
              <h2>Tabla de estudiantes</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Carrera</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-cell">
                      Todavia no hay estudiantes registrados.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.id}</td>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.correo}</td>
                      <td>{usuario.carrera}</td>
                      <td>
                        <button onClick={() => void handleDeleteUsuario(usuario.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    );
  }

  function renderInscripcionesTab() {
    return (
      <section className="tab-layout">
        <article className="panel">
          <p className="eyebrow">Nueva Inscripcion</p>
          <h2>Registrar inscripcion</h2>
          <form onSubmit={submitInscripcion} className="stack-form">
            <select value={usuarioId} onChange={(event) => setUsuarioId(event.target.value)} required>
              <option value="">Selecciona estudiante</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
            <select value={cursoId} onChange={(event) => setCursoId(event.target.value)} required>
              <option value="">Selecciona curso</option>
              {cursos.map((curso) => (
                <option
                  key={curso.id}
                  value={curso.id}
                  disabled={getAvailableSeats(curso, inscripciones).cuposDisponibles <= 0}
                >
                  {curso.nombre} - cupos disponibles: {getAvailableSeats(curso, inscripciones).cuposDisponibles}
                </option>
              ))}
            </select>
            <button type="submit">Inscribir estudiante</button>
          </form>
        </article>

        <article className="panel data-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Base De Datos</p>
              <h2>Tabla de inscripciones</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Estudiante</th>
                  <th>Correo</th>
                  <th>Curso</th>
                  <th>Fecha</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {inscripciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      Todavia no hay inscripciones registradas.
                    </td>
                  </tr>
                ) : (
                  inscripciones.map((inscripcion) => (
                    <tr key={inscripcion.id}>
                      <td>{inscripcion.id}</td>
                      <td>{inscripcion.usuario.nombre}</td>
                      <td>{inscripcion.usuario.correo}</td>
                      <td>{inscripcion.curso.nombre}</td>
                      <td>{new Date(inscripcion.created_at).toLocaleString()}</td>
                      <td>
                        <button onClick={() => void handleDeleteInscripcion(inscripcion.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    );
  }

  function renderReportesTab() {
    return (
      <section className="tab-layout single-tab">
        <article className="panel report-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Reporte XML</p>
              <h2>Indicadores de inscripcion</h2>
            </div>
            <button onClick={() => void loadData()}>Actualizar reporte</button>
          </div>
          <pre>{xmlReport || "El reporte aparecera aqui cuando el backend este disponible."}</pre>
        </article>
      </section>
    );
  }

  function renderActiveTab() {
    switch (activeTab) {
      case "cursos":
        return renderCursosTab();
      case "estudiantes":
        return renderUsuariosTab();
      case "inscripciones":
        return renderInscripcionesTab();
      case "reportes":
        return renderReportesTab();
      default:
        return null;
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Taller 4 Web Service</p>
        <h1>Plataforma EdTech</h1>
        <h2>Gestiona cursos, estudiantes e inscripciones</h2>
        <p className="lead">
          Frontend en React, API REST en FastAPI y persistencia en PostgreSQL.
          Navega por pestañas y revisa en tablas la informacion almacenada en la base de datos.
        </p>
        <div className="status-card">{status}</div>
      </section>

      <nav className="tabs-bar" aria-label="Secciones del sistema">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={tab.key === activeTab ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {renderActiveTab()}
    </main>
  );
}
