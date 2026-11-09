import { useState } from "react";
import { pedir } from "../utils/api";
import { NEGOCIO } from "../config";
import { linkWhatsApp } from "../utils/formato";

const VACIO = { nombre: "", email: "", telefono: "", asunto: "", mensaje: "", sitioWeb: "" };

export default function Contacto({ config }) {
  const [form, setForm] = useState(VACIO);
  const [estado, setEstado] = useState({ tipo: "", texto: "" });
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setEstado({ tipo: "", texto: "" });

    try {
      const datos = await pedir("/api/contacto", { method: "POST", body: form });
      setEstado({ tipo: "ok", texto: datos.mensaje });
      setForm(VACIO);
    } catch (error) {
      setEstado({ tipo: "error", texto: error.message });
    } finally {
      setEnviando(false);
    }
  }

  const mapa = `https://www.google.com/maps?q=${NEGOCIO.latitud},${NEGOCIO.longitud}&z=18&output=embed`;
  const verEnMapa = `https://www.google.com/maps?q=${NEGOCIO.latitud},${NEGOCIO.longitud}`;

  return (
    <section className="contenedor seccion">
      <h1>Contacto</h1>

      <div className="dos-columnas">
        <div>
          <h2>Datos de la tienda</h2>
          <p>📍 {NEGOCIO.direccion}</p>
          <p>{NEGOCIO.referencia}</p>
          <p>📞 {NEGOCIO.telefono}</p>
          <p>✉️ {NEGOCIO.correo}</p>
          <p>🕒 {config.horarios}</p>
          <p>💳 Pagos: {config.mediosPago}</p>
          <p>🚚 {config.domicilio}</p>
          <a className="boton boton-whatsapp" href={linkWhatsApp()} target="_blank" rel="noreferrer">
            Escribir por WhatsApp
          </a>
        </div>

        <form onSubmit={enviar}>
          <h2>Envíanos un mensaje</h2>
          <label>Nombre
            <input name="nombre" value={form.nombre} onChange={cambiar} required maxLength={80} />
          </label>
          <label>Correo
            <input name="email" type="email" value={form.email} onChange={cambiar} required />
          </label>
          <label>Teléfono (opcional)
            <input name="telefono" value={form.telefono} onChange={cambiar} maxLength={30} />
          </label>
          <label>Asunto (opcional)
            <input name="asunto" value={form.asunto} onChange={cambiar} maxLength={100} />
          </label>
          <label>Mensaje
            <textarea name="mensaje" rows="4" value={form.mensaje} onChange={cambiar} required maxLength={1000} />
          </label>

          {/* campo trampa para bots: las personas no lo ven */}
          <input
            className="trampa"
            name="sitioWeb"
            value={form.sitioWeb}
            onChange={cambiar}
            tabIndex="-1"
            autoComplete="off"
            aria-hidden="true"
          />

          <button className="boton" disabled={enviando}>{enviando ? "Enviando…" : "Enviar"}</button>
          {estado.texto && <p className={estado.tipo === "ok" ? "exito" : "aviso"}>{estado.texto}</p>}
        </form>
      </div>

      <p><a href={verEnMapa} target="_blank" rel="noreferrer">Abrir en Google Maps</a></p>
      <iframe className="mapa" title="Ubicación de la tienda" src={mapa} loading="lazy" />
    </section>
  );
}
