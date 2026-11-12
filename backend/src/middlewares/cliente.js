const jwt = require("jsonwebtoken");
const Cliente = require("../models/cliente");

// para las rutas que exigen estar registrado (hacer pedidos, ver historial)
const protegerCliente = async (req, res, next) => {
  try {
    const cabecera = req.headers.authorization;

    if (!cabecera || !cabecera.startsWith("Bearer ")) {
      return res.status(401).json({ mensaje: "Inicia sesión para continuar." });
    }

    const datos = jwt.verify(cabecera.split(" ")[1], process.env.JWT_SECRET);
    if (datos.rol !== "cliente") {
      return res.status(401).json({ mensaje: "Sesión vencida. Inicia sesión de nuevo." });
    }

    const cliente = await Cliente.findById(datos.id);
    if (!cliente) {
      return res.status(401).json({ mensaje: "Cuenta no encontrada." });
    }
    if (cliente.bloqueado) {
      return res.status(403).json({ mensaje: "Tu cuenta está bloqueada. Escríbenos por WhatsApp." });
    }

    req.cliente = cliente;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: "Sesión vencida. Inicia sesión de nuevo." });
  }
};

module.exports = protegerCliente;
