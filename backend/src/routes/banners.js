const express = require("express");
const controlador = require("../controllers/banners");
const protegerAdmin = require("../middlewares/auth");

const router = express.Router();

router.get(
  "/",
  (req, res, next) => (req.query.todos === "1" ? protegerAdmin(req, res, next) : next()),
  controlador.listar,
);

router.post("/", protegerAdmin, controlador.crear);
router.put("/:id", protegerAdmin, controlador.actualizar);
router.delete("/:id", protegerAdmin, controlador.eliminar);

module.exports = router;
