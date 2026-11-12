import { Link } from "react-router-dom";
import { NEGOCIO } from "../config";

// pie de página con columnas (como en los supermercados en línea)
export default function Footer({ config, admin }) {
  // solo se muestran las redes que ya tienen link en config.js
  const redes = Object.entries(NEGOCIO.redes).filter(([, url]) => url);

  return (
    <footer className="footer">
      <div className="contenedor footer-columnas">
        <div>
          <strong className="footer-nombre">{NEGOCIO.nombre}</strong>
          <p>{NEGOCIO.direccion}</p>
          <p>{NEGOCIO.referencia}</p>
          <p>WhatsApp: {NEGOCIO.telefono}</p>
          <p>{NEGOCIO.correo}</p>
          {redes.length > 0 && (
            <p className="redes">
              {redes.map(([nombre, url]) => (
                <a key={nombre} href={url} target="_blank" rel="noreferrer">{nombre}</a>
              ))}
            </p>
          )}
        </div>

        <div>
          <h4>La tienda</h4>
          <Link to="/sobre">Sobre nosotros</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/contacto">Contacto</Link>
        </div>

        <div>
          <h4>Ayuda</h4>
          {!admin && <Link to="/cuenta">Mi cuenta y mis pedidos</Link>}
          <Link to="/reclamos">Reclamos y garantías</Link>
          <p>🕒 {config.horarios}</p>
          <p>💳 {config.mediosPago}</p>
        </div>

        <div>
          <h4>Legal</h4>
          <Link to="/privacidad">Política de privacidad</Link>
          <Link to="/terminos">Términos y condiciones</Link>
          <Link to="/reclamos">Reclamos (plazo de {config.plazoReclamoHoras || 24} horas)</Link>
        </div>
      </div>

      <div className="contenedor footer-base">
        <span>
          © {new Date().getFullYear()} {NEGOCIO.nombre}. Todos los derechos reservados.
          {NEGOCIO.nit && ` NIT ${NEGOCIO.nit}.`}
        </span>
        <Link to="/admin">{admin ? "Panel de administración" : "Acceso administrador"}</Link>
      </div>
    </footer>
  );
}
