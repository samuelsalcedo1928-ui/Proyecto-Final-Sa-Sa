import { useState, useEffect } from "react";

export default function Mensajes({ llamar, alError }) {
  const [mensajes, setMensajes] = useState([]);

  async function cargar() {
    try {
      setMensajes(await llamar("/api/contacto"));
    } catch (error) {
      alError(error);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function marcarLeido(id) {
    try {
      await llamar(`/api/contacto/${id}`, { method: "PATCH" });
      cargar();
    } catch (error) {
      alError(error);
    }
  }

  async function borrar(id) {
    if (!confirm("¿Eliminar este mensaje?")) return;
    try {
      await llamar(`/api/contacto/${id}`, { method: "DELETE" });
      cargar();
    } catch (error) {
      alError(error);
    }
  }

  return (
    <div>
      {mensajes.length === 0 && <p>No hay mensajes todavía.</p>}
      {mensajes.map((m) => (
        <article key={m._id} className={m.leido ? "mensaje" : "mensaje nuevo"}>
          <strong>{m.nombre}</strong> · {m.email} {m.telefono && `· ${m.telefono}`}
          <small> · {new Date(m.createdAt).toLocaleString("es-CO")}</small>
          {m.asunto && <p><em>{m.asunto}</em></p>}
          <p>{m.mensaje}</p>
          {!m.leido && <button className="enlace" onClick={() => marcarLeido(m._id)}>Marcar como leído</button>}{" "}
          <button className="enlace peligro" onClick={() => borrar(m._id)}>Eliminar</button>
        </article>
      ))}
    </div>
  );
}
