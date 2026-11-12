const Imagen = require("../models/imagen");

// el admin sube una foto como texto "data:image/jpeg;base64,...."
const subir = async (req, res) => {
  const texto = String(req.body.imagen || "");
  const partes = texto.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);

  if (!partes) {
    return res.status(400).json({ mensaje: "El archivo tiene que ser una imagen (JPG, PNG o WEBP)." });
  }

  const datos = Buffer.from(partes[2], "base64");
  if (datos.length > 800 * 1024) {
    return res.status(400).json({ mensaje: "La imagen es muy pesada. Prueba con una más pequeña." });
  }

  try {
    const imagen = await Imagen.create({ tipo: partes[1], datos });
    res.status(201).json({ url: `/api/imagenes/${imagen._id}` });
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo guardar la imagen." });
  }
};

// público: cualquiera puede ver la foto de un producto
const ver = async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(404).end();
    const imagen = await Imagen.findById(req.params.id);
    if (!imagen) return res.status(404).end();

    res.set("Content-Type", imagen.tipo);
    // el id nunca cambia de contenido, así el navegador la guarda un año
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    res.send(imagen.datos);
  } catch (error) {
    res.status(404).end();
  }
};

module.exports = { subir, ver };
