const { preguntarAGemini } = require("../services/ia");
const Producto = require("../models/producto");

// sin tildes y en minúsculas, para comparar nombres
const limpiar = (texto) =>
  String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// busca qué productos del catálogo menciona la respuesta (máximo 4) para ofrecer el botón de agregar
const productosMencionados = async (respuesta) => {
  const texto = limpiar(respuesta);
  const productos = await Producto.find({ disponible: true });
  return productos
    .map(Producto.paraPublico)
    .filter((p) => !p.agotado && texto.includes(limpiar(p.nombre)))
    .slice(0, 4);
};

const responder = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ mensaje: "El asistente no está disponible por ahora." });
  }

  // el frontend manda el historial: [{ rol: "usuario" | "bot", texto }]
  const recibido = Array.isArray(req.body.mensajes) ? req.body.mensajes : [];

  // dejamos solo los últimos 10 y con texto corto, para no gastar de más
  const historial = recibido
    .slice(-10)
    .map((m) => ({
      rol: m.rol === "bot" ? "bot" : "usuario",
      texto: String(m.texto || "").slice(0, 500),
    }))
    .filter((m) => m.texto.trim());

  // Gemini exige que el último mensaje sea del usuario
  if (historial.length === 0 || historial[historial.length - 1].rol !== "usuario") {
    return res.status(400).json({ mensaje: "Escribe una pregunta." });
  }

  try {
    const respuesta = await preguntarAGemini(historial);
    let sugeridos = [];
    try {
      sugeridos = await productosMencionados(respuesta);
    } catch (e) {
      // si falla esto, la respuesta igual se entrega
    }
    res.json({ respuesta, sugeridos });
  } catch (error) {
    console.error("Error del chatbot:", error.message);
    // 429 = demasiadas preguntas a la vez en la cuota gratis; lo demás, error general
    if (error.codigo === 429) {
      return res.status(429).json({ mensaje: "Hay muchas preguntas ahora mismo. Intenta en un minuto." });
    }
    res.status(502).json({ mensaje: "No pude responder ahora. Intenta de nuevo o escríbenos por WhatsApp." });
  }
};

module.exports = { responder };
