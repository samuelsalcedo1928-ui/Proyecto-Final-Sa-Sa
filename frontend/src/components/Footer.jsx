import { Link } from "react-router-dom";
import { NEGOCIO } from "../config";

export default function Footer({ config }) {
  return (
    <footer className="footer">
      <div className="contenedor footer-fila">
        <div>
          <strong>{NEGOCIO.nombre}</strong>
          <p>{NEGOCIO.direccion}</p>
          <p>{NEGOCIO.referencia}</p>
          <p>WhatsApp: {NEGOCIO.telefono}</p>
        </div>
        <div>
          <p>🕒 {config.horarios}</p>
          <p>💳 {config.mediosPago}</p>
          <p>
            <Link to="/admin">Acceso administrador</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
