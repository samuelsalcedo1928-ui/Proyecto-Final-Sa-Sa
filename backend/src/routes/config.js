const express = require("express");
const controlador = require("../controllers/config");
const protegerAdmin = require("../middlewares/auth");

const router = express.Router();

router.get("/", controlador.obtener);
router.put("/", protegerAdmin, controlador.actualizar);

module.exports = router;
