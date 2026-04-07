// URL base del endpoint GraphQL.
const API_URL = "http://localhost:4000/graphql";

// Ejecutar una solicitud GraphQL con query y variables.
export async function graphqlRequest(query, variables = {}) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  // Intentar parsear la respuesta como JSON.
  const payload = await response.json().catch(() => ({}));

  // Manejar errores HTTP.
  if (!response.ok) {
    const message = payload?.errors?.[0]?.message || "Error en la solicitud";
    throw new Error(message);
  }

  // Manejar errores GraphQL.
  if (payload?.errors?.length) {
    throw new Error(payload.errors[0].message || "Error en la solicitud");
  }

  // Devolver el data del payload.
  return payload.data;
}
