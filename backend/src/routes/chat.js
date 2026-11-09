const express = require("express");
const rateLimit = require("express-rate-limit");
const controlador = require("../controllers/chat");

const router = express.Router();

// 20 preguntas cada 10 minutos por persona, para no agotar la cuota gratis de Gemini
const limiteChat = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { mensaje: "Has preguntado mucho, espera unos minutos." },
});

router.post("/", limiteChat, controlador.responder);

module.exports = router;
