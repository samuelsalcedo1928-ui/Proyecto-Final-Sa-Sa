const mongoose = require("mongoose");

// cliente que se registra en la página para poder pedir
const clienteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // contraseña encriptada con bcrypt, nunca el texto normal
    password: { type: String, required: true },
    nombre: { type: String, default: "", trim: true },
    telefono: { type: String, default: "", trim: true },
    // el admin puede bloquear a un cliente
    bloqueado: { type: Boolean, default: false },
    // carrito guardado en el servidor (solo ids y cantidades; los precios se leen al abrirlo)
    carrito: [
      {
        _id: false,
        productoId: String,
        modo: { type: String, enum: ["presentacion", "unidad"], default: "presentacion" },
        cantidad: Number,
      },
    ],
    // cuándo aceptó la política de privacidad
    aceptoPoliticaEn: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cliente", clienteSchema);
