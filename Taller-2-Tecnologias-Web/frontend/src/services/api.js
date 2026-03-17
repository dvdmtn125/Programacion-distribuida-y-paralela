// URL base de la API del backend
const API_URL = "http://localhost:4000/api";

// Función para hacer peticiones a la API
export async function apiRequest(path, options = {}) {
  // Hacer la petición fetch con la URL completa
  const response = await fetch(`${API_URL}${path}`, {
    // Establecer headers por defecto para JSON
    headers: { "Content-Type": "application/json" },
    // Combinar con opciones adicionales
    ...options,
  });

  // Si la respuesta no es ok, lanzar error
  if (!response.ok) {
    // Intentar parsear el cuerpo del error
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Error en la solicitud");
  }

  // Si es 204 No Content, devolver null
  if (response.status === 204) return null;
  // De lo contrario, devolver el JSON parseado
  return response.json();
}
