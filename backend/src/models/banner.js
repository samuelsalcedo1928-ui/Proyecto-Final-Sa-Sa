const mongoose = require("mongoose");

// las imágenes grandes que rotan en el inicio
const bannerSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    subtitulo: { type: String, default: "" },
    imagen: { type: String, default: "" },
    // a qué parte del catálogo lleva el botón: una categoría, "Ofertas", etc. Vacío = todo el catálogo
    ver: { type: String, default: "" },
    textoBoton: { type: String, default: "Ver productos" },
    orden: { type: Number, default: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Banner", bannerSchema);
