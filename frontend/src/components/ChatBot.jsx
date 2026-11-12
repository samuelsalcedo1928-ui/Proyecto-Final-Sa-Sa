import { useState, useRef, useEffect } from "react";
import { pedir } from "../utils/api";
import { formatearPrecio } from "../utils/formato";

const SALUDO = {
  rol: "bot",
  texto: "¡Hola! Soy el asistente de Nueva Vida. Pregúntame por los productos o cómo hacer un pedido.",
};

export default function ChatBot({ abierto, cerrar, agregar }) {
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
      // el chat puede tardar más (Gemini): le damos 40 segundos
      const datos = await pedir("/api/chat", { method: "POST", body: { mensajes: historial }, tiempo: 40000 });
      setMensajes([...nuevos, { rol: "bot", texto: datos.respuesta, sugeridos: datos.sugeridos || [] }]);
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
          <div key={i} className="chat-mensaje">
            <p className={m.rol === "bot" ? "burbuja bot" : "burbuja usuario"}>{m.texto}</p>

            {/* productos que el asistente mencionó, con botón para agregarlos al pedido */}
            {m.sugeridos && m.sugeridos.length > 0 && (
              <div className="sugeridos">
                {m.sugeridos.map((p) => (
                  <div key={p._id} className="sugerido">
                    <span>
                      <strong>{p.nombre}</strong>
                      <small>{formatearPrecio(p.precioActual ?? p.precio)} · {p.unidad}</small>
                    </span>
                    <button className="boton" onClick={() => agregar(p, "presentacion")}>Agregar</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {cargando && <p className="burbuja bot">Escribiendo… puede tardar unos segundos</p>}
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
