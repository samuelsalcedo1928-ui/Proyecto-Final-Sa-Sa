const express = require("express");
const controlador = require("../controllers/resumen");
const protegerAdmin = require("../middlewares/auth");

const router = express.Router();

router.get("/", protegerAdmin, controlador.obtener);

module.exports = router;
