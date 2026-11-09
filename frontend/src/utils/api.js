import { API_URL } from "../config";

// función única para hablar con el backend. Si hay token del admin, lo manda.
export async function pedir(ruta, opciones = {}) {
  const token = localStorage.getItem("token_admin");

  const respuesta = await fetch(API_URL + ruta, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const error = new Error(datos.mensaje || "Algo salió mal.");
    error.estado = respuesta.status;
    throw error;
  }
  return datos;
}
