import { API_URL } from "../config";

// la imagen puede ser: una foto subida desde el panel (/api/imagenes/...),
// un link completo, o solo el nombre de un archivo en public/img
export function rutaImagen(imagen) {
  if (!imagen) return "";
  if (imagen.startsWith("http")) return imagen;
  if (imagen.startsWith("/api/")) return API_URL + imagen;
  return `${import.meta.env.BASE_URL}img/${imagen}`;
}
