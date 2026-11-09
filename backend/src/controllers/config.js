const Config = require("../models/config");

const obtener = async (req, res) => {
  try {
    res.json(await Config.obtener());
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron cargar los ajustes." });
  }
};

const actualizar = async (req, res) => {
  const texto = (valor, largo) => String(valor || "").trim().slice(0, largo);
  const minimo = Number(req.body.pedidoMinimo);

  if (!Number.isFinite(minimo) || minimo < 0) {
    return res.status(400).json({ mensaje: "El pedido mínimo no es válido." });
  }

  try {
    const config = await Config.obtener();
    config.aviso = texto(req.body.aviso, 120);
    config.horarios = texto(req.body.horarios, 200);
    config.mediosPago = texto(req.body.mediosPago, 120);
    config.pedidoMinimo = minimo;
    config.domicilio = texto(req.body.domicilio, 120);
    config.zonas = texto(req.body.zonas, 200);
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron guardar los ajustes." });
  }
};

module.exports = { obtener, actualizar };
