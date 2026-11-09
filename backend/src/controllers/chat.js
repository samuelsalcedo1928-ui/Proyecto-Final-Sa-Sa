const { preguntarAGemini } = require("../services/ia");

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
    res.json({ respuesta });
  } catch (error) {
    console.error("Error del chatbot:", error.message);
    res.status(502).json({ mensaje: "El asistente está ocupado. Intenta de nuevo en un momento." });
  }
};

module.exports = { responder };
