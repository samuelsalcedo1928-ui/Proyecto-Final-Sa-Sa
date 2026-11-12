const mongoose = require("mongoose");

// ajustes de la tienda que el admin puede cambiar. Solo existe un documento.
const configSchema = new mongoose.Schema({
  aviso: { type: String, default: "Domicilios sin costo" },
  horarios: {
    type: String,
    default: "Lunes a sábado de 7:00 a.m. a 9:00 p.m. · Domingos de 8:00 a.m. a 6:00 p.m.",
  },
  mediosPago: { type: String, default: "Efectivo, Nequi y llaves Bre-B" },
  pedidoMinimo: { type: Number, default: 50000, min: 0 },
  domicilio: { type: String, default: "Domicilios sin costo" },
  zonas: { type: String, default: "" },
  // horas que tiene el cliente para reclamar un pedido
  plazoReclamoHoras: { type: Number, default: 24, min: 1 },
  // textos y fotos de la página "Sobre nosotros" (vacío = se usan los del frontend)
  sobre: { type: mongoose.Schema.Types.Mixed, default: {} },
});

// trae el documento, y si todavía no existe lo crea con los valores por defecto
configSchema.statics.obtener = async function () {
  return (await this.findOne()) || (await this.create({}));
};

module.exports = mongoose.model("Config", configSchema);
