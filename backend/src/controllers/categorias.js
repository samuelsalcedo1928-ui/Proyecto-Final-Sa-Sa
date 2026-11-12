const Categoria = require("../models/categoria");
const Producto = require("../models/producto");

const limpiarDatos = (body) => {
  const nombre = String(body.nombre || "").trim().slice(0, 30);
  if (!nombre) return { error: "El nombre es obligatorio." };
  return {
    datos: {
      nombre,
      icono: String(body.icono || "📦").trim().slice(0, 8) || "📦",
      imagen: String(body.imagen || "").trim(),
      orden: Number(body.orden) || 0,
      activa: body.activa !== false,
    },
  };
};

// público: solo las activas. El admin pide todas con ?todas=1 (y ve cuántos productos tiene cada una)
const listar = async (req, res) => {
  try {
    await Categoria.asegurarBase();
    const esAdmin = req.query.todas === "1";
    const lista = await Categoria.find(esAdmin ? {} : { activa: true }).sort({ orden: 1, nombre: 1 });

    if (!esAdmin) return res.json(lista);

    const conteo = await Producto.aggregate([{ $group: { _id: "$categoria", total: { $sum: 1 } } }]);
    res.json(
      lista.map((c) => ({
        ...c.toObject(),
        productos: (conteo.find((x) => x._id === c.nombre) || {}).total || 0,
      })),
    );
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron cargar las categorías." });
  }
};

const crear = async (req, res) => {
  const { error, datos } = limpiarDatos(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  try {
    if (await Categoria.findOne({ nombre: datos.nombre })) {
      return res.status(400).json({ mensaje: "Ya existe una categoría con ese nombre." });
    }
    res.status(201).json(await Categoria.create(datos));
  } catch (e) {
    res.status(500).json({ mensaje: "No se pudo crear la categoría." });
  }
};

const actualizar = async (req, res) => {
  const { error, datos } = limpiarDatos(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  try {
    const actual = await Categoria.findById(req.params.id);
    if (!actual) return res.status(404).json({ mensaje: "Categoría no encontrada." });

    const repetida = await Categoria.findOne({ nombre: datos.nombre, _id: { $ne: actual._id } });
    if (repetida) return res.status(400).json({ mensaje: "Ya existe una categoría con ese nombre." });

    // si cambia el nombre, sus productos la siguen
    if (actual.nombre !== datos.nombre) {
      await Producto.updateMany({ categoria: actual.nombre }, { categoria: datos.nombre });
    }
    Object.assign(actual, datos);
    await actual.save();
    res.json(actual);
  } catch (e) {
    res.status(400).json({ mensaje: "No se pudo actualizar la categoría." });
  }
};

const eliminar = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) return res.status(404).json({ mensaje: "Categoría no encontrada." });

    const cuantos = await Producto.countDocuments({ categoria: categoria.nombre });
    if (cuantos > 0) {
      return res.status(400).json({
        mensaje: `Tiene ${cuantos} producto(s). Muévelos a otra categoría antes de borrarla (o desactívala).`,
      });
    }
    await categoria.deleteOne();
    res.json({ mensaje: "Categoría eliminada." });
  } catch (e) {
    res.status(400).json({ mensaje: "No se pudo eliminar la categoría." });
  }
};

module.exports = { listar, crear, actualizar, eliminar };
