const express = require("express");
const cors = require("cors");
require("dotenv").config();

const conectarDB = require("./src/config/db");

// si falta algo obligatorio, avisamos de una vez
["MONGO_URI", "JWT_SECRET"].forEach((variable) => {
  if (!process.env[variable]) {
    console.error(`Falta la variable ${variable} (revisa backend/.env)`);
    process.exit(1);
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// en Render hay un proxy delante, sin esto el límite de intentos vería una sola IP
app.set("trust proxy", 1);

// solo dejamos pasar peticiones de las páginas que están en CORS_ORIGIN
const permitidos = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin(origen, callback) {
      // sin origen = Postman o el mismo servidor
      if (!origen || permitidos.includes(origen)) return callback(null, true);
      callback(new Error("Origen no permitido"));
    },
  }),
);

// las fotos pesan más, así que esta ruta va antes y acepta cuerpos más grandes
app.use("/api/imagenes", express.json({ limit: "1500kb" }), require("./src/routes/imagenes"));

app.use(express.json({ limit: "20kb" }));

// sirve para comprobar que el servidor despertó
app.get("/", (req, res) => {
  res.send("Backend de Abasto y Variedades Nueva Vida funcionando");
});

app.use("/api/productos", require("./src/routes/productos"));
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/contacto", require("./src/routes/contacto"));
app.use("/api/banners", require("./src/routes/banners"));
app.use("/api/categorias", require("./src/routes/categorias"));
app.use("/api/config", require("./src/routes/config"));
app.use("/api/ayuda", require("./src/routes/ayuda"));
app.use("/api/clientes", require("./src/routes/clientes"));
app.use("/api/pedidos", require("./src/routes/pedidos"));
app.use("/api/resumen", require("./src/routes/resumen"));
app.use("/api/notificaciones", require("./src/routes/notificaciones"));

app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada." });
});

// errores de CORS o de JSON mal escrito
app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(400).json({ mensaje: "Petición no válida." });
});

conectarDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor en el puerto ${PORT}`));
});
