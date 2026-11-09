const Banner = require("../models/banner");

const limpiarDatos = (body) => {
  const titulo = String(body.titulo || "").trim();
  if (!titulo) return { error: "El título es obligatorio." };

  return {
    datos: {
      titulo: titulo.slice(0, 80),
      subtitulo: String(body.subtitulo || "").trim().slice(0, 160),
      imagen: String(body.imagen || "").trim(),
      ver: String(body.ver || "").trim(),
      textoBoton: String(body.textoBoton || "Ver productos").trim().slice(0, 30),
      orden: Number(body.orden) || 0,
      activo: body.activo !== false,
    },
  };
};

// público: solo los activos. El admin pide todos con ?todos=1
const listar = async (req, res) => {
  try {
    const filtro = req.query.todos === "1" ? {} : { activo: true };
    res.json(await Banner.find(filtro).sort({ orden: 1, createdAt: 1 }));
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron cargar los banners." });
  }
};

const crear = async (req, res) => {
  const { error, datos } = limpiarDatos(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  try {
    res.status(201).json(await Banner.create(datos));
  } catch (e) {
    res.status(500).json({ mensaje: "No se pudo crear el banner." });
  }
};

const actualizar = async (req, res) => {
  const { error, datos } = limpiarDatos(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, datos, { new: true });
    if (!banner) return res.status(404).json({ mensaje: "Banner no encontrado." });
    res.json(banner);
  } catch (e) {
    res.status(400).json({ mensaje: "No se pudo actualizar el banner." });
  }
};

const eliminar = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ mensaje: "Banner no encontrado." });
    res.json({ mensaje: "Banner eliminado." });
  } catch (e) {
    res.status(400).json({ mensaje: "No se pudo eliminar el banner." });
  }
};

module.exports = { listar, crear, actualizar, eliminar };
