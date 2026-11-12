const express = require("express");
const rateLimit = require("express-rate-limit");
const controlador = require("../controllers/clientes");
const protegerAdmin = require("../middlewares/auth");
const protegerCliente = require("../middlewares/cliente");

const router = express.Router();

// 10 intentos de login cada 15 minutos
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { mensaje: "Demasiados intentos. Espera 15 minutos." },
});

// 5 cuentas nuevas por hora desde la misma conexión
const limiteRegistro = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { mensaje: "Se crearon muchas cuentas desde aquí. Intenta más tarde." },
});

router.post("/registro", limiteRegistro, controlador.registrar);
router.post("/login", limiteLogin, controlador.login);
router.get("/yo", protegerCliente, controlador.yo);
router.put("/yo", protegerCliente, controlador.actualizarDatos);
router.post("/password", protegerCliente, controlador.cambiarPassword);
router.get("/carrito", protegerCliente, controlador.verCarrito);
router.put("/carrito", protegerCliente, controlador.guardarCarrito);

// admin
router.get("/", protegerAdmin, controlador.listar);
router.patch("/:id/bloqueo", protegerAdmin, controlador.bloquear);
router.post("/:id/reiniciar-password", protegerAdmin, controlador.reiniciarPassword);

module.exports = router;
