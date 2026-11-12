import { Link } from "react-router-dom";
import { formatearPrecio, fechaLarga } from "../utils/formato";

// la guarda el carrito justo después de crear el pedido
function leerUltimoPedido() {
  try {
    return JSON.parse(sessionStorage.getItem("ultimoPedido"));
  } catch {
    return null;
  }
}

export default function Gracias() {
  const ultimo = leerUltimoPedido();

  if (!ultimo) {
    return (
      <section className="contenedor seccion centrado">
        <h1>¡Gracias por visitarnos!</h1>
        <p>Cuando hagas un pedido, aquí verás tu número de ticket.</p>
        <Link to="/catalogo" className="boton">Ver catálogo</Link>
      </section>
    );
  }

  const { pedido, enlace } = ultimo;

  return (
    <section className="contenedor seccion centrado">
      <h1>¡Gracias por tu pedido! 🎉</h1>
      <div className="ticket-listo">
        <p className="nota">Tu número de ticket es</p>
        <p className="ticket-grande">{pedido.ticket}</p>
        <p>
          Total: <strong>{formatearPrecio(pedido.total)}</strong>
        </p>
        <p>
          Se abrió WhatsApp con tu pedido. <strong>Envía el mensaje</strong> para que la tienda lo confirme y
          coordinen el lugar, la fecha y la hora de la entrega. Si no se abrió, usa el botón.
        </p>
        <a className="boton boton-whatsapp" href={enlace} target="_blank" rel="noreferrer">Abrir WhatsApp</a>
        <p className="nota">
          Tienes hasta el {fechaLarga(pedido.reclamoHasta)} para hacer un reclamo con este ticket.
        </p>
        <div className="botones-fila">
          <Link to="/cuenta" className="boton boton-borde">Ver mis pedidos</Link>
          <Link to="/catalogo" className="boton boton-borde">Seguir comprando</Link>
        </div>
      </div>
    </section>
  );
}
