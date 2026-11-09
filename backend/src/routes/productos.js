const express = require("express");
const controlador = require("../controllers/productos");
const protegerAdmin = require("../middlewares/auth");

const router = express.Router();

// ver productos lo puede hacer cualquiera; lo demás solo el admin.
// Si piden "todos" (incluye los no disponibles) primero se revisa que sea admin.
router.get(
  "/",
  (req, res, next) => (req.query.todos === "1" ? protegerAdmin(req, res, next) : next()),
  controlador.listar,
);

router.post("/", protegerAdmin, controlador.crear);
router.put("/:id", protegerAdmin, controlador.actualizar);
router.delete("/:id", protegerAdmin, controlador.eliminar);

module.exports = router;
