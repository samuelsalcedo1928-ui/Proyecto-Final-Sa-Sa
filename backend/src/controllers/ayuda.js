const { elegirProductos } = require("../services/ia");
const Producto = require("../models/producto");

// sin tildes y en minúsculas, para comparar
const limpiar = (texto) =>
  String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// palabras que no dicen nada del producto (si no las quitamos, "para" encuentra cualquier cosa con "para")
const SOBRAN = new Set(
  "algo para quiero quisiera necesito busco buscando que con una uno unos unas los las del les por como hay tienen tienes tiene favor dame venden vender comprar producto productos cosa cosas bien muy tipo mas menos esto eso donde cual cuales sirve sirven".split(" "),
);

// grupos de palabras parecidas: si escriben una, buscamos las demás
const GRUPOS = [
  ["limpiar", "limpieza", "piso", "pisos", "aseo", "trapear", "barrer", "escoba", "trapero", "desinfectante", "cloro", "pala"],
  ["tomar", "bebida", "bebidas", "sed", "frio", "fria", "refrescar", "gaseosa", "agua", "jugo", "hidratacion"],
  ["cocinar", "cocina", "comida", "almuerzo", "arroz", "aceite", "harina", "freir", "pan", "arepa", "sazonar", "sal"],
  ["merienda", "merendar", "snack", "pasabocas", "picar", "antojo", "dulce", "dulces", "galleta", "galletas", "crispetas"],
  ["salsa", "salsas", "aderezo", "condimento", "mostaza", "tomate", "bbq", "perros", "hamburguesa"],
  ["pelo", "cabello", "peinar", "peine", "crema", "cuerpo", "piel"],
  ["mascota", "mascotas", "gato", "gatos", "perro", "alimento", "concentrado"],
  ["fiesta", "cumpleanos", "carnaval", "espuma", "juego", "diversion"],
];

// dos palabras "se parecen" si una empieza con la otra o comparten las primeras 5 letras (escoba/escobas)
const parecidas = (a, b) =>
  a === b ||
  (a.length >= 4 && b.startsWith(a)) ||
  (b.length >= 4 && a.startsWith(b)) ||
  (a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5));

const partir = (texto) =>
  limpiar(texto)
    .split(/[^a-z0-9ñ]+/)
    .filter((w) => w.length >= 3 && !SOBRAN.has(w));

// búsqueda básica: puntúa cada producto según las palabras que coinciden
// (en el nombre, en sus etiquetas #, en la categoría y en los grupos de palabras parecidas)
const buscarBasico = (texto, productos) => {
  const palabras = partir(texto);

  // agrega las palabras parecidas de los grupos
  const extra = [];
  GRUPOS.forEach((grupo) => {
    if (palabras.some((w) => grupo.some((g) => parecidas(w, g)))) extra.push(...grupo);
  });

  return productos
    .map((p) => {
      const nombre = partir(p.nombre);
      const etiquetas = (p.etiquetas || []).flatMap((e) => partir(e));
      const categoria = partir(p.categoria);
      let puntos = 0;
      palabras.forEach((w) => {
        if (nombre.some((n) => parecidas(n, w))) puntos += 3;
        if (etiquetas.some((e) => parecidas(e, w))) puntos += 3;
        else if (categoria.some((c) => parecidas(c, w))) puntos += 1;
      });
      extra.forEach((w) => {
        if (nombre.some((n) => parecidas(n, w))) puntos += 1;
        if (etiquetas.some((e) => parecidas(e, w))) puntos += 1;
      });
      return { p, puntos };
    })
    .filter((x) => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, 6)
    .map((x) => x.p);
};

const buscar = async (req, res) => {
  const texto = String(req.body.texto || "").trim().slice(0, 200);
  if (texto.length < 3) {
    return res.status(400).json({ mensaje: "Cuéntanos un poco más de lo que necesitas." });
  }

  const todos = await Producto.find({ disponible: true });
  const publicos = todos.map(Producto.paraPublico).filter((p) => !p.agotado);

  // primero la IA; si falla, la búsqueda básica
  let encontrados = [];
  let origen = "ia";
  try {
    const ids = await elegirProductos(texto, publicos);
    encontrados = ids.map((id) => publicos.find((p) => String(p._id) === id)).filter(Boolean);
  } catch (error) {
    console.error("Ayuda con IA no disponible, uso la búsqueda básica:", error.message);
    origen = "basica";
    encontrados = buscarBasico(texto, publicos);
  }

  res.json({ productos: encontrados, origen });
};

module.exports = { buscar, buscarBasico };
