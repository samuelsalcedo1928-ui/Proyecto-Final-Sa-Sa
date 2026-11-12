import { linkWhatsApp } from "../utils/formato";

export default function BotonesFlotantes() {
  return (
    <div className="flotantes">
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
