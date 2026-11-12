const express = require("express");
const controlador = require("../controllers/notificaciones");
const protegerAdmin = require("../middlewares/auth");

const router = express.Router();

router.get("/", protegerAdmin, controlador.listar);
router.post("/leer-todas", protegerAdmin, controlador.marcarTodas);
router.patch("/:id/leida", protegerAdmin, controlador.marcarLeida);

module.exports = router;
