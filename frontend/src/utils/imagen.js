// la imagen puede ser un link completo o solo el nombre de un archivo en public/img
export function rutaImagen(imagen) {
  if (!imagen) return "";
  if (imagen.startsWith("http")) return imagen;
  return `${import.meta.env.BASE_URL}img/${imagen}`;
}
