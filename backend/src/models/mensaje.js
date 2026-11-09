const mongoose = require("mongoose");

const mensajeSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, default: "" },
    asunto: { type: String, default: "" },
    mensaje: { type: String, required: true },
    leido: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Mensaje", mensajeSchema);
