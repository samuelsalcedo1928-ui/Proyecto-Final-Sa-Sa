const Producto = require("../models/producto");
const { conOferta } = Producto;

// devuelve un número positivo o 0
const positivo = (valor) => {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

// "2026-11-20" -> fecha al final de ese día (hora de Colombia)
const leerFecha = (valor) => {
  if (!valor) return null;
  const texto = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor + "T23:59:59-05:00" : valor;
  const fecha = new Date(texto);
  return isNaN(fecha) ? null : fecha;
};

// valida y limpia lo que llega del formulario del admin
const limpiarDatos = (body) => {
  const nombre = String(body.nombre || "").trim();
  const unidad = String(body.unidad || "").trim();
  const precio = Number(body.precio);

  if (!nombre || !unidad) return { error: "Nombre y unidad son obligatorios." };
  if (!Number.isFinite(precio) || precio < 0) return { error: "El precio no es válido." };
  if (!Producto.CATEGORIAS.includes(body.categoria)) return { error: "Categoría no válida." };

  const precioOferta = positivo(body.precioOferta);
  if (precioOferta > 0 && precioOferta >= precio) {
    return { error: "El precio de oferta tiene que ser menor al precio normal." };
  }

  // sin precio de oferta no hay tipo ni fecha
  let ofertaTipo = "";
  if (precioOferta > 0) ofertaTipo = body.ofertaTipo === "caducidad" ? "caducidad" : "oferta";

  return {
    datos: {
      nombre,
      unidad,
      precio,
      categoria: body.categoria,
      precioUnidad: positivo(body.precioUnidad),
      unidadSuelta: String(body.unidadSuelta || "Unidad").trim() || "Unidad",
      imagen: String(body.imagen || "").trim(),
      descripcion: String(body.descripcion || "").trim(),
      disponible: body.disponible !== false,
      destacado: body.destacado === true,
      masVendido: body.masVendido === true,
      precioOferta,
      ofertaTipo,
      ofertaHasta: precioOferta > 0 ? leerFecha(body.ofertaHasta) : null,
    },
  };
};

// público: solo muestra los disponibles. El admin pide todos con ?todos=1
const listar = async (req, res) => {
  try {
    const filtro = req.query.todos === "1" ? {} : { disponible: true };
    const productos = await Producto.find(filtro).sort({ categoria: 1, nombre: 1 });
    res.json(productos.map(conOferta));
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron cargar los productos." });
  }
};

const crear = async (req, res) => {
  const { error, datos } = limpiarDatos(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  try {
    const producto = await Producto.create(datos);
    res.status(201).json(conOferta(producto));
  } catch (e) {
    res.status(500).json({ mensaje: "No se pudo crear el producto." });
  }
};

const actualizar = async (req, res) => {
  const { error, datos } = limpiarDatos(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, datos, { new: true });
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado." });
    res.json(conOferta(producto));
  } catch (e) {
    res.status(400).json({ mensaje: "No se pudo actualizar el producto." });
  }
};

const eliminar = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado." });
    res.json({ mensaje: "Producto eliminado." });
  } catch (e) {
    res.status(400).json({ mensaje: "No se pudo eliminar el producto." });
  }
};

module.exports = { listar, crear, actualizar, eliminar };
