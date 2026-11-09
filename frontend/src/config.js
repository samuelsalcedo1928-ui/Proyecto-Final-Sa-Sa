// Datos fijos de la tienda. Lo que cambia seguido (horarios, pagos, mínimo...) viene del backend.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const WHATSAPP = import.meta.env.VITE_WHATSAPP || "573052666891";

export const NEGOCIO = {
  nombre: "Abasto y Variedades Nueva Vida",
  direccion: "Cra. 88, El Pozón, Cartagena, Bolívar",
  referencia: "Justo al frente de Lorena Casa Diego",
  // coordenadas exactas de la tienda en Google Maps
  latitud: 10.4168241,
  longitud: -75.4605278,
  telefono: "305 266 6891",
  correo: "samuelsalcedo1928@gmail.com",
};

// se usan mientras el backend despierta (Render gratis se duerme) o si falla
export const CONFIG_POR_DEFECTO = {
  aviso: "Domicilios sin costo",
  horarios: "Lunes a sábado de 7:00 a.m. a 9:00 p.m. · Domingos de 8:00 a.m. a 6:00 p.m.",
  mediosPago: "Efectivo, Nequi y llaves Bre-B",
  pedidoMinimo: 50000,
  domicilio: "Domicilios sin costo",
  zonas: "",
};

export const CATEGORIAS = ["Comida", "Aseo", "Variedades", "Cosas frías"];

// cada opción del catálogo con su dibujito (también sale en la animación al cambiar de página)
export const ICONOS = {
  Todas: "🛒",
  Ofertas: "🏷️",
  "Más vendidos": "🔥",
  Recomendados: "⭐",
  Comida: "🌾",
  Aseo: "🧹",
  Variedades: "🧴",
  "Cosas frías": "🥤",
};

export const FILTROS = ["Todas", "Ofertas", "Más vendidos", "Recomendados", ...CATEGORIAS];
