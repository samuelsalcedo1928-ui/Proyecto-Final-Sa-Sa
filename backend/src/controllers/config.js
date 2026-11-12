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
    const plazo = Number(req.body.plazoReclamoHoras);
    if (Number.isFinite(plazo) && plazo >= 1 && plazo <= 720) config.plazoReclamoHoras = plazo;
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron guardar los ajustes." });
  }
};

// textos y fotos de "Sobre nosotros"
const actualizarSobre = async (req, res) => {
  const texto = (valor, largo) => String(valor || "").trim().slice(0, largo);
  const b = req.body || {};

  const valores = (Array.isArray(b.valores) ? b.valores : []).slice(0, 6).map((v) => ({
    icono: texto(v.icono, 8) || "⭐",
    titulo: texto(v.titulo, 40),
    texto: texto(v.texto, 200),
  }));
  const equipo = (Array.isArray(b.equipo) ? b.equipo : []).slice(0, 12).map((p) => ({
    nombre: texto(p.nombre, 60),
    cargo: texto(p.cargo, 60),
    foto: texto(p.foto, 300),
  }));

  const anios = Math.floor(Number(b.anios));

  try {
    const config = await Config.obtener();
    config.sobre = {
      titulo: texto(b.titulo, 120),
      intro: texto(b.intro, 400),
      anios: Number.isFinite(anios) && anios >= 0 && anios <= 200 ? anios : 0,
      fachada: texto(b.fachada, 300),
      historia: texto(b.historia, 2000),
      mision: texto(b.mision, 500),
      valores: valores.filter((v) => v.titulo),
      administradorNombre: texto(b.administradorNombre, 60),
      administradorTexto: texto(b.administradorTexto, 500),
      administradorFoto: texto(b.administradorFoto, 300),
      equipo: equipo.filter((p) => p.nombre),
    };
    config.markModified("sobre");
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo guardar la información." });
  }
};

module.exports = { obtener, actualizar, actualizarSobre };
