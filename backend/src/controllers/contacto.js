const Mensaje = require("../models/mensaje");
const notificar = require("../services/notificar");

const correoValido = (texto) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto);

// aviso por correo con Resend. Si no hay clave, simplemente no hace nada.
const avisarPorCorreo = async (m) => {
  if (!process.env.RESEND_API_KEY || !process.env.CORREO_AVISOS) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Nueva Vida <onboarding@resend.dev>",
        to: [process.env.CORREO_AVISOS],
        reply_to: m.email,
        subject: `Mensaje nuevo de ${m.nombre}`,
        text: `Nombre: ${m.nombre}\nCorreo: ${m.email}\nTeléfono: ${m.telefono || "-"}\nAsunto: ${m.asunto || "-"}\n\n${m.mensaje}`,
      }),
    });
  } catch (error) {
    // si falla el correo no pasa nada, el mensaje ya quedó guardado
    console.error("No se pudo enviar el aviso:", error.message);
  }
};

const enviar = async (req, res) => {
  // campo trampa: las personas no lo ven, los bots sí lo llenan
  if (req.body.sitioWeb) {
    return res.status(201).json({ mensaje: "Mensaje enviado." });
  }

  const nombre = String(req.body.nombre || "").trim();
  const email = String(req.body.email || "").trim();
  const telefono = String(req.body.telefono || "").trim();
  const asunto = String(req.body.asunto || "").trim();
  const texto = String(req.body.mensaje || "").trim();

  if (nombre.length < 2) return res.status(400).json({ mensaje: "Escribe tu nombre." });
  if (!correoValido(email)) return res.status(400).json({ mensaje: "El correo no es válido." });
  if (texto.length < 5) return res.status(400).json({ mensaje: "Escribe tu mensaje." });
  if (texto.length > 1000) return res.status(400).json({ mensaje: "El mensaje es muy largo." });

  try {
    const guardado = await Mensaje.create({
      nombre: nombre.slice(0, 80),
      email: email.slice(0, 120),
      telefono: telefono.slice(0, 30),
      asunto: asunto.slice(0, 100),
      mensaje: texto,
    });

    avisarPorCorreo(guardado);
    notificar("mensaje", `Mensaje nuevo de ${guardado.nombre}`, guardado.asunto, "mensajes");
    res.status(201).json({ mensaje: "Mensaje enviado. ¡Gracias por escribirnos!" });
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo enviar el mensaje." });
  }
};

// lo de abajo es solo para el admin
const listar = async (req, res) => {
  try {
    const mensajes = await Mensaje.find().sort({ createdAt: -1 });
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudieron cargar los mensajes." });
  }
};

const marcarLeido = async (req, res) => {
  try {
    const m = await Mensaje.findByIdAndUpdate(req.params.id, { leido: true }, { new: true });
    if (!m) return res.status(404).json({ mensaje: "Mensaje no encontrado." });
    res.json(m);
  } catch (error) {
    res.status(400).json({ mensaje: "No se pudo actualizar." });
  }
};

const eliminar = async (req, res) => {
  try {
    const m = await Mensaje.findByIdAndDelete(req.params.id);
    if (!m) return res.status(404).json({ mensaje: "Mensaje no encontrado." });
    res.json({ mensaje: "Mensaje eliminado." });
  } catch (error) {
    res.status(400).json({ mensaje: "No se pudo eliminar." });
  }
};

module.exports = { enviar, listar, marcarLeido, eliminar };
