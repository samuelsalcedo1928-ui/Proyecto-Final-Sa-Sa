const Producto = require("../models/producto");
const Categoria = require("../models/categoria");
const { conOferta, paraPublico } = Producto;

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

// "#snack, #dulce merienda" -> ["snack", "dulce", "merienda"]
const limpiarEtiquetas = (valor) => {
  const texto = Array.isArray(valor) ? valor.join(" ") : String(valor || "");
  const lista = texto
    .toLowerCase()
    .split(/[\s,#;]+/)
    .map((e) => e.trim().slice(0, 24))
    .filter(Boolean);
  return [...new Set(lista)].slice(0, 12);
};

// la categoría tiene que existir (las crea el admin en su pestaña)
const categoriaExiste = async (nombre) => {
  await Categoria.asegurarBase();
  return !!(await Categoria.exists({ nombre }));
};

// valida y limpia lo que llega del formulario del admin
const limpiarDatos = (body) => {
  const nombre = String(body.nombre || "").trim();
  const unidad = String(body.unidad || "").trim();
  const precio = Number(body.precio);

  if (!nombre || !unidad) return { error: "Nombre y unidad son obligatorios." };
  if (!Number.isFinite(precio) || precio < 0) return { error: "El precio no es válido." };
  const categoria = String(body.categoria || "").trim();
  if (!categoria) return { error: "Elige una categoría." };

  const precioOferta = positivo(body.precioOferta);
  if (precioOferta > 0 && precioOferta >= precio) {
    return { error: "El precio de oferta tiene que ser menor al precio normal." };
  }

  // sin precio de oferta no hay tipo ni fecha
  let ofertaTipo = "";
  if (precioOferta > 0) ofertaTipo = body.ofertaTipo === "caducidad" ? "caducidad" : "oferta";

  // stock vacío = no se controla
  const stockCrudo = body.stock;
  let stock = null;
  if (stockCrudo !== "" && stockCrudo !== null && stockCrudo !== undefined) {
    stock = Math.floor(Number(stockCrudo));
    if (!Number.isFinite(stock) || stock < 0) return { error: "El stock no es válido." };
  }

  return {
    datos: {
      stock,
      stockMinimo: Math.floor(positivo(body.stockMinimo)),
      nombre,
      unidad,
      precio,
      categoria,
      etiquetas: limpiarEtiquetas(body.etiquetas),
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
    const esAdmin = req.query.todos === "1";
    const filtro = esAdmin ? {} : { disponible: true };
    const productos = await Producto.find(filtro).sort({ categoria: 1, nombre: 1 });
    // el público no ve las cantidades de stock, solo si está agotado
    res.json(productos.map(esAdmin ? conOferta : paraPublico));
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron cargar los productos." });
  }
};

const crear = async (req, res) => {
  const { error, datos } = limpiarDatos(req.body);
  if (error) return res.status(400).json({ mensaje: error });
  if (!(await categoriaExiste(datos.categoria))) return res.status(400).json({ mensaje: "Esa categoría no existe." });

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
  if (!(await categoriaExiste(datos.categoria))) return res.status(400).json({ mensaje: "Esa categoría no existe." });

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
