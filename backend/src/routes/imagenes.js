const express = require("express");
const controlador = require("../controllers/imagenes");
const protegerAdmin = require("../middlewares/auth");

const router = express.Router();

router.post("/", protegerAdmin, controlador.subir);
router.get("/:id", controlador.ver);

module.exports = router;
