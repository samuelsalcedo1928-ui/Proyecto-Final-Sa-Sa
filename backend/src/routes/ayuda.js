const express = require("express");
const rateLimit = require("express-rate-limit");
const controlador = require("../controllers/ayuda");

const router = express.Router();

// 30 búsquedas cada 10 minutos por persona, para no gastar la cuota gratis de Gemini
const limite = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { mensaje: "Has buscado mucho, espera unos minutos." },
});

router.post("/", limite, controlador.buscar);

module.exports = router;
