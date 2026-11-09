const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

// se pone antes de las rutas que solo puede usar el admin
const protegerAdmin = async (req, res, next) => {
  try {
    const cabecera = req.headers.authorization;

    if (!cabecera || !cabecera.startsWith("Bearer ")) {
      return res.status(401).json({ mensaje: "Inicia sesión para continuar." });
    }

    const token = cabecera.split(" ")[1];
    const datos = jwt.verify(token, process.env.JWT_SECRET);

    // el admin tiene que seguir existiendo
    const admin = await Admin.findById(datos.id);
    if (!admin) {
      return res.status(401).json({ mensaje: "Administrador no autorizado." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: "Sesión vencida. Inicia sesión de nuevo." });
  }
};

module.exports = protegerAdmin;
