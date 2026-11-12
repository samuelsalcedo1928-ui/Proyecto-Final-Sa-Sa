const mongoose = require("mongoose");

const ESTADOS = ["nuevo", "confirmado", "entregado", "cancelado"];

const itemSchema = new mongoose.Schema(
  {
    producto: { type: mongoose.Schema.Types.ObjectId, ref: "Producto" },
    nombre: String,
    // "presentacion" (paca, bulto...) o "unidad" (suelta)
    modo: { type: String, enum: ["presentacion", "unidad"], default: "presentacion" },
    unidad: String,
    cantidad: Number,
    precioUnitario: Number,
    subtotal: Number,
  },
  { _id: false },
);

const pedidoSchema = new mongoose.Schema(
  {
    // "NV-0001", se crea aunque el cliente no termine el mensaje de WhatsApp
    ticket: { type: String, required: true, unique: true },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },
    items: [itemSchema],
    total: { type: Number, required: true },
    nota: { type: String, default: "" },
    estado: { type: String, enum: ESTADOS, default: "nuevo" },
    // para no descontar el stock dos veces
    stockDescontado: { type: Boolean, default: false },
    // si el cliente registró un reclamo desde la página
    reclamoEn: { type: Date, default: null },
    // hasta cuándo se puede reclamar
    reclamoHasta: { type: Date, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Pedido", pedidoSchema);
module.exports.ESTADOS = ESTADOS;
