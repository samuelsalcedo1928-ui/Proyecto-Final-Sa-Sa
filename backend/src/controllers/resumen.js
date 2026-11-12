const Pedido = require("../models/pedido");
const Producto = require("../models/producto");
const Cliente = require("../models/cliente");
const Mensaje = require("../models/mensaje");

// "2026-11-09" en hora de Colombia
const diaColombia = (fecha) =>
  new Date(fecha.getTime() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);

// números para la pestaña "Resumen" del panel
const obtener = async (req, res) => {
  try {
    const hace7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recientes = await Pedido.find({ createdAt: { $gte: hace7 } });

    // los últimos 7 días, aunque no hayan tenido pedidos
    const porDia = {};
    for (let i = 6; i >= 0; i--) {
      porDia[diaColombia(new Date(Date.now() - i * 24 * 60 * 60 * 1000))] = { pedidos: 0, ventas: 0 };
    }
    recientes.forEach((p) => {
      const dia = diaColombia(p.createdAt);
      if (!porDia[dia]) return;
      porDia[dia].pedidos += 1;
      // las ventas solo cuentan si el pedido se confirmó o se entregó
      if (p.estado === "confirmado" || p.estado === "entregado") porDia[dia].ventas += p.total;
    });

    const porEstado = { nuevo: 0, confirmado: 0, entregado: 0, cancelado: 0 };
    (await Pedido.aggregate([{ $group: { _id: "$estado", n: { $sum: 1 } } }])).forEach((e) => {
      porEstado[e._id] = e.n;
    });

    // los 5 productos que más se piden (sin contar cancelados)
    const top = await Pedido.aggregate([
      { $match: { estado: { $ne: "cancelado" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.nombre", cantidad: { $sum: "$items.cantidad" } } },
      { $sort: { cantidad: -1 } },
      { $limit: 5 },
    ]);

    const productos = await Producto.find({ stock: { $ne: null } });
    const stockBajo = productos
      .filter((p) => p.stock <= p.stockMinimo)
      .map((p) => ({ id: p._id, nombre: p.nombre, stock: p.stock }));

    res.json({
      dias: Object.entries(porDia).map(([dia, v]) => ({ dia, ...v })),
      porEstado,
      topProductos: top.map((t) => ({ nombre: t._id, cantidad: t.cantidad })),
      stockBajo,
      clientes: await Cliente.countDocuments(),
      mensajesSinLeer: await Mensaje.countDocuments({ leido: false }),
    });
  } catch (error) {
    console.error("Error en el resumen:", error.message);
    res.status(500).json({ mensaje: "No se pudo cargar el resumen." });
  }
};

module.exports = { obtener };
