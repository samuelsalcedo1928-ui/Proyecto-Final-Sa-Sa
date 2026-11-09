import { linkWhatsApp } from "../utils/formato";

export default function BotonesFlotantes({ abrirChat }) {
  return (
    <div className="flotantes">
      <button className="flotante flotante-chat" onClick={abrirChat} aria-label="Abrir asistente">
        💬
      </button>
      <a
        className="flotante flotante-whatsapp"
        href={linkWhatsApp()}
        target="_blank"
        rel="noreferrer"
        aria-label="Escribir por WhatsApp"
      >
        WhatsApp
      </a>
    </div>
  );
}
