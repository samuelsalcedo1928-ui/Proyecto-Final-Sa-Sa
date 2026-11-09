const mongoose = require("mongoose");

const CATEGORIAS = ["Comida", "Aseo", "Variedades", "Cosas frías"];

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, enum: CATEGORIAS },
    // cómo se vende al por mayor: Bulto, Paca, Caja, Docena...
    unidad: { type: String, required: true, trim: true },
    // precio de esa presentación, en pesos colombianos
    precio: { type: Number, required: true, min: 0 },
    // precio de una sola unidad suelta (0 = no se vende suelto). Es más caro.
    precioUnidad: { type: Number, default: 0, min: 0 },
    unidadSuelta: { type: String, default: "Unidad", trim: true },
    // nombre del archivo en frontend/public/img o un link completo
    imagen: { type: String, default: "" },
    descripcion: { type: String, default: "" },
    disponible: { type: Boolean, default: true },
    // para las filas "Recomendados" y "Más vendidos" del inicio
    destacado: { type: Boolean, default: false },
    masVendido: { type: Boolean, default: false },
    // oferta: precio rebajado de la presentación, con fecha de fin opcional
    precioOferta: { type: Number, default: 0, min: 0 },
    ofertaHasta: { type: Date, default: null },
    ofertaTipo: { type: String, enum: ["", "oferta", "caducidad"], default: "" },
  },
  { timestamps: true },
);

// le agrega al producto si está en oferta y cuál es su precio de hoy
// (lo usan la API y el chatbot, así la fecha de fin se respeta sola)
function conOferta(producto) {
  const p = producto.toObject ? producto.toObject() : { ...producto };
  const vigente = !p.ofertaHasta || new Date(p.ofertaHasta) > new Date();
  p.enOferta = p.precioOferta > 0 && p.precioOferta < p.precio && vigente;
  p.precioActual = p.enOferta ? p.precioOferta : p.precio;
  return p;
}

const Producto = mongoose.model("Producto", productoSchema);

module.exports = Producto;
module.exports.CATEGORIAS = CATEGORIAS;
module.exports.conOferta = conOferta;
