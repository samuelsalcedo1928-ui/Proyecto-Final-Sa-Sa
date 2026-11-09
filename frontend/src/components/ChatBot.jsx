import { useState, useRef, useEffect } from "react";
import { pedir } from "../utils/api";

const SALUDO = {
  rol: "bot",
  texto: "¡Hola! Soy el asistente de Nueva Vida. Pregúntame por los productos o cómo hacer un pedido.",
};

export default function ChatBot({ abierto, cerrar }) {
  const [mensajes, setMensajes] = useState([SALUDO]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const final = useRef(null);

  // baja hasta el último mensaje
  useEffect(() => {
    final.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, abierto]);

  async function enviar(e) {
    e.preventDefault();
    const pregunta = texto.trim();
    if (!pregunta || cargando) return;

    const nuevos = [...mensajes, { rol: "usuario", texto: pregunta }];
    setMensajes(nuevos);
    setTexto("");
    setCargando(true);

    try {
      // no mandamos el saludo, solo la conversación real
      const historial = nuevos.filter((m) => m !== SALUDO);
      const datos = await pedir("/api/chat", { method: "POST", body: { mensajes: historial } });
      setMensajes([...nuevos, { rol: "bot", texto: datos.respuesta }]);
    } catch (error) {
      setMensajes([...nuevos, { rol: "bot", texto: error.message }]);
    } finally {
      setCargando(false);
    }
  }

  if (!abierto) return null;

  return (
    <section className="chat">
      <div className="chat-cabecera">
        <strong>Asistente Nueva Vida</strong>
        <button className="boton-icono" onClick={cerrar} aria-label="Cerrar chat">✕</button>
      </div>

      <div className="chat-mensajes">
        {mensajes.map((m, i) => (
          <p key={i} className={m.rol === "bot" ? "burbuja bot" : "burbuja usuario"}>
            {m.texto}
          </p>
        ))}
        {cargando && <p className="burbuja bot">Escribiendo… (la primera vez puede tardar)</p>}
        <div ref={final} />
      </div>

      <form className="chat-form" onSubmit={enviar}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe tu pregunta"
          maxLength={300}
        />
        <button className="boton" disabled={cargando}>Enviar</button>
      </form>
    </section>
  );
}
