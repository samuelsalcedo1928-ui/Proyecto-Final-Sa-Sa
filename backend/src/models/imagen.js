const mongoose = require("mongoose");

// fotos que sube el admin (ya vienen reducidas desde el navegador)
const imagenSchema = new mongoose.Schema(
  {
    tipo: { type: String, required: true },
    datos: { type: Buffer, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Imagen", imagenSchema);
