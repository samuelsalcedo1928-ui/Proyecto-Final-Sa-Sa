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

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, email: admin.email });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al iniciar sesión." });
  }
};

// el frontend lo usa para saber si el token guardado todavía sirve
const yo = (req, res) => {
  res.json({ email: req.admin.email });
};

module.exports = { login, yo };
