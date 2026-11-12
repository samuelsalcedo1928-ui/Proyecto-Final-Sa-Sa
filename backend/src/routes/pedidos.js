const express = require("express");
const rateLimit = require("express-rate-limit");
const controlador = require("../controllers/pedidos");
const protegerAdmin = require("../middlewares/auth");
const protegerCliente = require("../middlewares/cliente");

const router = express.Router();

// 20 pedidos por hora por conexión es de sobra para una persona real
const limitePedidos = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { mensaje: "Hiciste muchos pedidos seguidos. Intenta más tarde." },
});

router.post("/", protegerCliente, limitePedidos, controlador.crear);
router.get("/mios", protegerCliente, controlador.misPedidos);
router.patch("/:id/cancelar", protegerCliente, controlador.cancelar);
router.post("/:id/reclamo", protegerCliente, controlador.reclamar);

// admin
router.get("/", protegerAdmin, controlador.listar);
router.patch("/:id/estado", protegerAdmin, controlador.cambiarEstado);

module.exports = router;
