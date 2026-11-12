const mongoose = require("mongoose");

// las que existen al empezar (después el admin crea las que quiera)
const BASE = [
  { nombre: "Comida", icono: "🌾", orden: 1 },
  { nombre: "Aseo", icono: "🧹", orden: 2 },
  { nombre: "Variedades", icono: "🧴", orden: 3 },
  { nombre: "Cosas frías", icono: "🥤", orden: 4 },
];

const categoriaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    icono: { type: String, default: "📦", trim: true },
    // foto opcional de la categoría (igual que las de productos)
    imagen: { type: String, default: "" },
    orden: { type: Number, default: 0 },
    activa: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Categoria = mongoose.model("Categoria", categoriaSchema);

// si todavía no hay ninguna, crea las cuatro de siempre
Categoria.asegurarBase = async () => {
  if ((await Categoria.countDocuments()) === 0) await Categoria.insertMany(BASE);
};

module.exports = Categoria;
