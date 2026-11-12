import { API_URL } from "../config";

// función única para hablar con el backend.
// rol: "admin" o "cliente" para mandar el token que toca (sin rol no manda ninguno)
export async function pedir(ruta, opciones = {}) {
  const token = opciones.rol ? localStorage.getItem("token_" + opciones.rol) : null;

  // si el servidor tarda demasiado cortamos para no dejar la pantalla colgada (25 s por defecto)
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), opciones.tiempo || 25000);

  let respuesta;
  try {
    respuesta = await fetch(API_URL + ruta, {
      method: opciones.method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opciones.body ? JSON.stringify(opciones.body) : undefined,
      signal: control.signal,
    });
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("El servidor está tardando mucho. Si acaba de despertar, espera un minuto e intenta de nuevo.");
    }
    // aquí cae cuando el backend está apagado, la dirección está mal o CORS lo bloquea
    throw new Error("No se pudo conectar con el servidor. Revisa tu internet o que el backend esté encendido.");
  } finally {
    clearTimeout(reloj);
  }

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const error = new Error(datos.mensaje || "Algo salió mal.");
    error.estado = respuesta.status;
    error.datos = datos;
    throw error;
  }
  return datos;
}
