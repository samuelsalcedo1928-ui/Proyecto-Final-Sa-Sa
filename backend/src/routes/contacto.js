const express = require("express");
const rateLimit = require("express-rate-limit");
const controlador = require("../controllers/contacto");
const protegerAdmin = require("../middlewares/auth");

const router = express.Router();

// máximo 5 mensajes por hora por persona (contra spam)
const limiteContacto = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { mensaje: "Enviaste muchos mensajes. Intenta más tarde." },
});

router.post("/", limiteContacto, controlador.enviar);

router.get("/", protegerAdmin, controlador.listar);
router.patch("/:id", protegerAdmin, controlador.marcarLeido);
router.delete("/:id", protegerAdmin, controlador.eliminar);

module.exports = router;
