const mongoose = require("mongoose");

// avisos para el admin: pedidos nuevos, cancelaciones, clientes nuevos, poco stock...
const notificacionSchema = new mongoose.Schema({
  tipo: { type: String, enum: ["pedido", "cancelacion", "cliente", "stock", "mensaje", "reclamo"], required: true },
  titulo: { type: String, required: true },
  detalle: { type: String, default: "" },
  // pestaña del panel a la que lleva al tocarla
  pestana: { type: String, default: "resumen" },
  leida: { type: Boolean, default: false },
  // se borran solas a los 30 días
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
});

module.exports = mongoose.model("Notificacion", notificacionSchema);
