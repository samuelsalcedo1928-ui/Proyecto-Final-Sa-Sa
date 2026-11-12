import { createContext, useContext } from "react";
import { ICONOS } from "../config";

// las categorías las crea el admin; App las trae del servidor y las reparte con este contexto
export const CategoriasContexto = createContext({ categorias: [], recargar: () => {} });

export function useCategorias() {
  const { categorias, recargar } = useContext(CategoriasContexto);

  // dibujito de una categoría (o de un filtro como "Ofertas")
  function icono(nombre) {
    const c = categorias.find((x) => x.nombre === nombre);
    return (c && c.icono) || ICONOS[nombre] || "📦";
  }

  return { categorias, recargar, icono };
}
