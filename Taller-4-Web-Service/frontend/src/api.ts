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

type ApiValidationError = {
  detail?: Array<{
    loc?: Array<string | number>;
    msg?: string;
  }> | string;
};

// El frontend lee la URL del backend desde las variables de entorno de Vite.
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

function formatApiError(data: ApiValidationError) {
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        const field = item.loc?.slice(1).join(".") ?? "campo";
        return `${field}: ${item.msg ?? "valor invalido"}`;
      })
      .join(" | ");
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  return "Error inesperado";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // Helper compartido para las peticiones HTTP del frontend.
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: "Error inesperado" }));
    throw new Error(formatApiError(data));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// Metodos centralizados para mantener la UI mas simple.
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
  },
  getReporteXmlUrl: () => `${API_URL}/reportes/inscripciones.xml`
};
