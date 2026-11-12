const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    const admin = await Admin.findOne({ email });
    const coincide = admin && (await bcrypt.compare(password, admin.password));

    // mismo mensaje si falla el correo o la clave, así no damos pistas
    if (!coincide) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
    }

    const token = jwt.sign({ id: admin._id, rol: "admin" }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, email: admin.email });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al iniciar sesión." });
  }
};

// el frontend lo usa para saber si el token guardado todavía sirve
const yo = (req, res) => {
  res.json({ email: req.admin.email });
};

// cambiar la contraseña del admin (pide la actual por seguridad)
const cambiarPassword = async (req, res) => {
  try {
    const actual = String(req.body.actual || "");
    const nueva = String(req.body.nueva || "");

    if (nueva.length < 8) {
      return res.status(400).json({ mensaje: "La nueva contraseña debe tener mínimo 8 caracteres." });
    }
    if (!(await bcrypt.compare(actual, req.admin.password))) {
      return res.status(400).json({ mensaje: "La contraseña actual no es correcta." });
    }

    req.admin.password = await bcrypt.hash(nueva, 10);
    await req.admin.save();
    res.json({ mensaje: "Contraseña cambiada." });
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo cambiar la contraseña." });
  }
};

module.exports = { login, yo, cambiarPassword };
