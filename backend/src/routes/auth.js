const express = require("express");
const rateLimit = require("express-rate-limit");
const controlador = require("../controllers/auth");
const protegerAdmin = require("../middlewares/auth");

const router = express.Router();

// máximo 5 intentos de login cada 15 minutos por persona
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { mensaje: "Demasiados intentos. Espera 15 minutos." },
});

router.post("/login", limiteLogin, controlador.login);
router.get("/me", protegerAdmin, controlador.yo);

module.exports = router;
