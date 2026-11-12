const Pedido = require("../models/pedido");
const Producto = require("../models/producto");
const Config = require("../models/config");
const Contador = require("../models/contador");
const { conOferta } = Producto;
const { formatoTicket, armarPedido, accionStock } = require("../services/pedidos");
const notificar = require("../services/notificar");

// agrega si todavía se puede reclamar
const conReclamo = (pedido) => {
  const p = pedido.toObject ? pedido.toObject() : pedido;
  p.reclamable = new Date(p.reclamoHasta) > new Date() && p.estado !== "cancelado";
  return p;
};

// el cliente crea su pedido. Se guarda ANTES de abrir WhatsApp, así siempre hay ticket.
const crear = async (req, res) => {
  try {
    const recibidos = Array.isArray(req.body.items) ? req.body.items : [];

    // traemos de la base los productos que pidió
    const ids = recibidos.map((r) => String(r.productoId)).filter((id) => /^[a-f\d]{24}$/i.test(id));
    const productos = {};
    (await Producto.find({ _id: { $in: ids } })).forEach((p) => {
      productos[String(p._id)] = conOferta(p);
    });

    const resultado = armarPedido(recibidos, productos);
    if (resultado.error) return res.status(400).json({ mensaje: resultado.error, productoId: resultado.productoId });

    const config = await Config.obtener();
    if (config.pedidoMinimo > 0 && resultado.total < config.pedidoMinimo) {
      return res.status(400).json({
        mensaje: `El pedido mínimo es de $${config.pedidoMinimo.toLocaleString("es-CO")}.`,
      });
    }

    const numero = await Contador.siguiente("pedido");
    const horas = config.plazoReclamoHoras || 24;

    const pedido = await Pedido.create({
      ticket: formatoTicket(numero),
      cliente: req.cliente._id,
      items: resultado.items,
      total: resultado.total,
      nota: String(req.body.nota || "").trim().slice(0, 300),
      reclamoHasta: new Date(Date.now() + horas * 60 * 60 * 1000),
    });

    notificar("pedido", `Nuevo pedido ${pedido.ticket}`, `${req.cliente.email} · $${pedido.total.toLocaleString("es-CO")}`, "pedidos");
    res.status(201).json(conReclamo(pedido));
  } catch (error) {
    console.error("Error al crear el pedido:", error.message);
    res.status(500).json({ mensaje: "No se pudo crear el pedido." });
  }
};

// historial del cliente
const misPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ cliente: req.cliente._id }).sort({ createdAt: -1 }).limit(100);
    res.json(pedidos.map(conReclamo));
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron cargar tus pedidos." });
  }
};

// el cliente cancela un pedido que la tienda todavía no confirmó
const cancelar = async (req, res) => {
  try {
    const pedido = await Pedido.findOne({ _id: req.params.id, cliente: req.cliente._id });
    if (!pedido) return res.status(404).json({ mensaje: "Pedido no encontrado." });

    if (pedido.estado !== "nuevo") {
      return res.status(400).json({ mensaje: "Este pedido ya no se puede cancelar desde aquí. Escríbenos por WhatsApp." });
    }

    pedido.estado = "cancelado";
    await pedido.save();
    notificar("cancelacion", `Pedido ${pedido.ticket} cancelado por el cliente`, req.cliente.email, "pedidos");
    res.json(conReclamo(pedido));
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo cancelar el pedido." });
  }
};

// el cliente deja registrado su reclamo (luego sigue por WhatsApp)
const reclamar = async (req, res) => {
  try {
    const pedido = await Pedido.findOne({ _id: req.params.id, cliente: req.cliente._id });
    if (!pedido) return res.status(404).json({ mensaje: "Pedido no encontrado." });

    if (pedido.reclamoHasta < new Date()) {
      return res.status(400).json({ mensaje: "El plazo para reclamar este pedido ya terminó." });
    }

    // si ya lo había registrado no creamos otro aviso
    if (!pedido.reclamoEn) {
      pedido.reclamoEn = new Date();
      await pedido.save();
      notificar("reclamo", `Reclamo del pedido ${pedido.ticket}`, req.cliente.email, "pedidos");
    }
    res.json(conReclamo(pedido));
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo registrar el reclamo." });
  }
};

// ---------- admin ----------

const listar = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.estado && Pedido.ESTADOS.includes(req.query.estado)) filtro.estado = req.query.estado;
    // buscar por ticket, por ejemplo ?ticket=NV-0007
    if (req.query.ticket) filtro.ticket = String(req.query.ticket).toUpperCase().trim();

    const pedidos = await Pedido.find(filtro)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("cliente", "email nombre telefono");
    res.json(pedidos.map(conReclamo));
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron cargar los pedidos." });
  }
};

// suma o resta el stock de las presentaciones de un pedido.
// Devuelve los productos que quedaron con poco stock (para avisar al admin)
const moverStock = async (pedido, accion) => {
  const bajos = [];
  for (const item of pedido.items) {
    if (item.modo !== "presentacion" || !item.producto) continue;
    const producto = await Producto.findById(item.producto);
    // si el producto no controla stock, no se toca
    if (!producto || producto.stock === null || producto.stock === undefined) continue;

    producto.stock =
      accion === "descontar"
        ? Math.max(0, producto.stock - item.cantidad)
        : producto.stock + item.cantidad;
    await producto.save();

    if (accion === "descontar" && producto.stock <= producto.stockMinimo) {
      bajos.push(producto);
    }
  }
  return bajos;
};

const cambiarEstado = async (req, res) => {
  try {
    const estado = req.body.estado;
    if (!Pedido.ESTADOS.includes(estado)) {
      return res.status(400).json({ mensaje: "Estado no válido." });
    }

    const pedido = await Pedido.findById(req.params.id).populate("cliente", "email nombre telefono");
    if (!pedido) return res.status(404).json({ mensaje: "Pedido no encontrado." });

    const accion = accionStock(pedido.stockDescontado, estado);
    if (accion) {
      const bajos = await moverStock(pedido, accion);
      pedido.stockDescontado = accion === "descontar";
      bajos.forEach((p) => {
        const texto = p.stock === 0 ? "Se agotó" : `Quedan ${p.stock}`;
        notificar("stock", `Poco stock: ${p.nombre}`, texto, "productos");
      });
    }

    pedido.estado = estado;
    await pedido.save();
    res.json(conReclamo(pedido));
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo cambiar el estado." });
  }
};

module.exports = { crear, misPedidos, cancelar, reclamar, listar, cambiarEstado };
