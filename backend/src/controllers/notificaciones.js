const Notificacion = require("../models/notificacion");

const listar = async (req, res) => {
  try {
    const lista = await Notificacion.find().sort({ createdAt: -1 }).limit(40);
    const noLeidas = await Notificacion.countDocuments({ leida: false });
    res.json({ lista, noLeidas });
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron cargar las notificaciones." });
  }
};

const marcarLeida = async (req, res) => {
  try {
    await Notificacion.findByIdAndUpdate(req.params.id, { leida: true });
    res.json({ mensaje: "Listo." });
  } catch (error) {
    res.status(400).json({ mensaje: "No se pudo actualizar." });
  }
};

const marcarTodas = async (req, res) => {
  try {
    await Notificacion.updateMany({ leida: false }, { leida: true });
    res.json({ mensaje: "Listo." });
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo actualizar." });
  }
};

module.exports = { listar, marcarLeida, marcarTodas };
