const Notificacion = require("../models/notificacion");

// crea un aviso para el admin. Si falla, no debe romper lo que el cliente estaba haciendo.
const notificar = async (tipo, titulo, detalle, pestana) => {
  try {
    await Notificacion.create({ tipo, titulo, detalle: String(detalle || "").slice(0, 200), pestana });
  } catch (error) {
    console.error("No se pudo crear la notificación:", error.message);
  }
};

module.exports = notificar;
