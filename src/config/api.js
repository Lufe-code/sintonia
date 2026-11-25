const baseUrl = import.meta.env.VITE_API_BASE_URL;

if (!baseUrl) {
  throw new Error("Falta la variable de entorno VITE_API_BASE_URL.");
}

export const API_BASE_URL = baseUrl.replace(/\/$/, "");

export async function obtenerJson(ruta, { signal } = {}) {
  const url = ruta.startsWith("http") ? ruta : `${API_BASE_URL}${ruta}`;
  const respuesta = await fetch(url, { signal });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  return respuesta.json();
}