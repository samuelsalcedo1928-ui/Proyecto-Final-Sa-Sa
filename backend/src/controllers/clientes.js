const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Cliente = require("../models/cliente");
const Pedido = require("../models/pedido");
const notificar = require("../services/notificar");

const correoValido = (texto) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto);

// token de cliente: dura 7 días y lleva el rol para no confundirlo con el del admin
const crearToken = (cliente) =>
  jwt.sign({ id: cliente._id, rol: "cliente" }, process.env.JWT_SECRET, { expiresIn: "7d" });

// lo que el navegador puede ver del cliente (nunca la contraseña)
const datosPublicos = (c) => ({ id: c._id, email: c.email, nombre: c.nombre, telefono: c.telefono });

const registrar = async (req, res) => {
  // campo trampa para bots
  if (req.body.sitioWeb) return res.status(201).json({ mensaje: "Listo." });

  const email = String(req.body.email || "").toLowerCase().trim();
  const password = String(req.body.password || "");
  const nombre = String(req.body.nombre || "").trim().slice(0, 80);
  const telefono = String(req.body.telefono || "").trim().slice(0, 30);

  if (!correoValido(email) || email.length > 120) {
    return res.status(400).json({ mensaje: "El correo no es válido." });
  }
  if (password.length < 8 || password.length > 100) {
    return res.status(400).json({ mensaje: "La contraseña debe tener mínimo 8 caracteres." });
  }
  if (req.body.aceptoPolitica !== true) {
    return res.status(400).json({ mensaje: "Tienes que aceptar la política de privacidad." });
  }

  try {
    if (await Cliente.findOne({ email })) {
      return res.status(400).json({ mensaje: "Ese correo ya tiene una cuenta. Inicia sesión." });
    }

    const cliente = await Cliente.create({
      email,
      password: await bcrypt.hash(password, 10),
      nombre,
      telefono,
      aceptoPoliticaEn: new Date(),
    });

    notificar("cliente", "Nuevo cliente registrado", email, "clientes");
    res.status(201).json({ token: crearToken(cliente), cliente: datosPublicos(cliente) });
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo crear la cuenta." });
  }
};

const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    const cliente = await Cliente.findOne({ email });
    const coincide = cliente && (await bcrypt.compare(password, cliente.password));

    if (!coincide) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
    }
    if (cliente.bloqueado) {
      return res.status(403).json({ mensaje: "Tu cuenta está bloqueada. Escríbenos por WhatsApp." });
    }

    res.json({ token: crearToken(cliente), cliente: datosPublicos(cliente) });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al iniciar sesión." });
  }
};

// sirve para saber si el token guardado todavía vale
const yo = (req, res) => {
  res.json({ cliente: datosPublicos(req.cliente) });
};

// el cliente cambia su nombre o celular
const actualizarDatos = async (req, res) => {
  try {
    req.cliente.nombre = String(req.body.nombre || "").trim().slice(0, 80);
    req.cliente.telefono = String(req.body.telefono || "").trim().slice(0, 30);
    await req.cliente.save();
    res.json({ cliente: datosPublicos(req.cliente) });
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron guardar los datos." });
  }
};

const cambiarPassword = async (req, res) => {
  try {
    const actual = String(req.body.actual || "");
    const nueva = String(req.body.nueva || "");

    if (nueva.length < 8 || nueva.length > 100) {
      return res.status(400).json({ mensaje: "La nueva contraseña debe tener mínimo 8 caracteres." });
    }
    if (!(await bcrypt.compare(actual, req.cliente.password))) {
      return res.status(400).json({ mensaje: "La contraseña actual no es correcta." });
    }

    req.cliente.password = await bcrypt.hash(nueva, 10);
    await req.cliente.save();
    res.json({ mensaje: "Contraseña cambiada." });
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo cambiar la contraseña." });
  }
};

// el carrito se guarda en el servidor para verlo desde cualquier celular o computador
const verCarrito = (req, res) => {
  res.json(req.cliente.carrito || []);
};

const guardarCarrito = async (req, res) => {
  try {
    const recibido = Array.isArray(req.body.items) ? req.body.items : [];
    const limpio = [];

    recibido.slice(0, 50).forEach((i) => {
      const cantidad = Number(i.cantidad);
      if (/^[a-f\d]{24}$/i.test(String(i.productoId)) && Number.isInteger(cantidad) && cantidad >= 1 && cantidad <= 999) {
        limpio.push({
          productoId: String(i.productoId),
          modo: i.modo === "unidad" ? "unidad" : "presentacion",
          cantidad,
        });
      }
    });

    req.cliente.carrito = limpio;
    await req.cliente.save();
    res.json(limpio);
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo guardar el carrito." });
  }
};

// ---------- lo de abajo es solo para el admin ----------

const listar = async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 }).select("-password");
    // cuántos pedidos ha hecho cada uno
    const conteo = await Pedido.aggregate([{ $group: { _id: "$cliente", pedidos: { $sum: 1 } } }]);
    const pedidosDe = {};
    conteo.forEach((c) => (pedidosDe[String(c._id)] = c.pedidos));

    res.json(clientes.map((c) => ({ ...c.toObject(), pedidos: pedidosDe[String(c._id)] || 0 })));
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron cargar los clientes." });
  }
};

const bloquear = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { bloqueado: req.body.bloqueado === true },
      { new: true },
    ).select("-password");
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado." });
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ mensaje: "No se pudo actualizar el cliente." });
  }
};

// cuando alguien olvida la contraseña y escribe por WhatsApp:
// se genera una temporal, se muestra UNA vez y se la pasas al cliente
const reiniciarPassword = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado." });

    // 10 caracteres sin letras confusas (0/O, 1/l)
    const letras = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let temporal = "";
    for (let i = 0; i < 10; i++) temporal += letras[crypto.randomInt(letras.length)];

    cliente.password = await bcrypt.hash(temporal, 10);
    await cliente.save();
    res.json({ temporal, email: cliente.email });
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo reiniciar la contraseña." });
  }
};

module.exports = {
  registrar,
  login,
  yo,
  actualizarDatos,
  cambiarPassword,
  verCarrito,
  guardarCarrito,
  listar,
  bloquear,
  reiniciarPassword,
};
