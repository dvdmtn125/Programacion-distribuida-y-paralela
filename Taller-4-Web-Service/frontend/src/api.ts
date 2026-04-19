export type Curso = {
  id: number;
  nombre: string;
  descripcion: string;
  cupo: number;
  created_at: string;
};

export type Usuario = {
  id: number;
  nombre: string;
  correo: string;
  carrera: string;
  created_at: string;
};

export type Inscripcion = {
  id: number;
  usuario_id: number;
  curso_id: number;
  created_at: string;
  usuario: Usuario;
  curso: Curso;
};

// The frontend reads the backend URL from Vite env vars or falls back to localhost.
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // Shared helper for the HTTP requests made by the React app.
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: "Error inesperado" }));
    throw new Error(data.detail ?? "Error inesperado");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// Centralized API methods keep the UI code shorter and easier to maintain.
export const api = {
  listCursos: () => request<Curso[]>("/cursos"),
  createCurso: (payload: Omit<Curso, "id" | "created_at">) =>
    request<Curso>("/cursos", { method: "POST", body: JSON.stringify(payload) }),
  deleteCurso: (id: number) => request<void>(`/cursos/${id}`, { method: "DELETE" }),
  listUsuarios: () => request<Usuario[]>("/usuarios"),
  createUsuario: (payload: Omit<Usuario, "id" | "created_at">) =>
    request<Usuario>("/usuarios", { method: "POST", body: JSON.stringify(payload) }),
  deleteUsuario: (id: number) => request<void>(`/usuarios/${id}`, { method: "DELETE" }),
  listInscripciones: () => request<Inscripcion[]>("/inscripciones"),
  createInscripcion: (payload: { usuario_id: number; curso_id: number }) =>
    request<Inscripcion>("/inscripciones", { method: "POST", body: JSON.stringify(payload) }),
  deleteInscripcion: (id: number) =>
    request<void>(`/inscripciones/${id}`, { method: "DELETE" }),
  getReporteXml: async () => {
    const response = await fetch(`${API_URL}/reportes/inscripciones.xml`);
    if (!response.ok) {
      throw new Error("No fue posible cargar el reporte XML");
    }
    return response.text();
  }
};
