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
  // si el negocio tiene NIT, ponlo aquí y sale en el pie de página y en la política de privacidad
  nit: "",
  administrador: "Pedro Salcedo",
  // pon el link cuando existan las redes; las que estén vacías no se muestran
  redes: { instagram: "", facebook: "", tiktok: "" },
};

// se usan mientras el backend despierta (Render gratis se duerme) o si falla
export const CONFIG_POR_DEFECTO = {
  aviso: "Domicilios sin costo",
  horarios: "Lunes a sábado de 7:00 a.m. a 9:00 p.m. · Domingos de 8:00 a.m. a 6:00 p.m.",
  mediosPago: "Efectivo, Nequi y llaves Bre-B",
  pedidoMinimo: 50000,
  domicilio: "Domicilios sin costo",
  zonas: "",
  plazoReclamoHoras: 24,
};

// textos de "Sobre nosotros" mientras no los cambie el admin
export const SOBRE_POR_DEFECTO = {
  titulo: "Una tienda de barrio que creció pensando en su gente",
  intro: "Hace 5 años abrimos nuestras puertas en El Pozón. Hoy seguimos aquí, vendiendo al por mayor y con el mismo trato de siempre.",
  anios: 5,
  fachada: "fachada.jpg",
  historia:
    "Empezamos como una tienda de barrio, atendiendo a los vecinos con lo básico del día a día. Con el tiempo, más familias y negocios de la zona empezaron a buscarnos y fuimos ampliando el surtido.\n\nHoy vendemos por bultos, pacas y cajas, y también por unidades sueltas, para que cada cliente compre lo que necesita. Y como no todo el mundo puede venir hasta la tienda, creamos esta página para que hagas tu pedido desde el celular.",
  mision:
    "Surtir a los hogares y negocios de nuestra zona con buenos productos, precios justos y un servicio cercano y responsable.",
  valores: [
    { icono: "🤝", titulo: "Cercanía", texto: "Atendemos como en el barrio: te conocemos, te escuchamos y te explicamos." },
    { icono: "💲", titulo: "Precios justos", texto: "Vendemos por bulto, paca o caja para que tu negocio y tu hogar rindan más." },
    { icono: "⚡", titulo: "Servicio ágil", texto: "Pides desde el celular y coordinas la entrega por WhatsApp con una persona de la tienda." },
  ],
  administradorNombre: "Pedro Salcedo",
  administradorTexto:
    "Está al frente del día a día de la tienda: atiende los pedidos, revisa los precios y se asegura de que cada entrega salga bien.",
  administradorFoto: "equipo/pedro.jpg",
  equipo: [],
};

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

// los filtros fijos; después van las categorías que haya creado el admin
export const FILTROS_FIJOS = ["Todas", "Ofertas", "Más vendidos", "Recomendados"];
