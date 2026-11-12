import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pedir } from "../utils/api";
import {
  formatearPrecio,
  totalCarrito,
  armarMensajePedido,
  linkWhatsApp,
} from "../utils/formato";

export default function Carrito({
  abierto,
  cerrar,
  carrito,
  cambiarCantidad,
  quitar,
  vaciar,
  config,
  cliente,
  cerrarSesion,
}) {
  const irA = useNavigate();
  const [nombre, setNombre] = useState("");
  const [barrio, setBarrio] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  // producto que el servidor dijo que no se puede pedir (para marcarlo en la lista)
  const [problema, setProblema] = useState("");

  const total = totalCarrito(carrito);
  const minimo = config.pedidoMinimo || 0;
  const bajoMinimo = minimo > 0 && total < minimo;

  function cerrarTodo() {
    setError("");
    setProblema("");
    cerrar();
  }

  async function hacerPedido() {
    setError("");
    setProblema("");
    setEnviando(true);

    // la pestaña de WhatsApp se abre YA, en el clic, porque si esperamos al servidor el navegador la bloquea
    const ventana = window.open("", "_blank");

    try {
      const pedido = await pedir("/api/pedidos", {
        method: "POST",
        rol: "cliente",
        body: {
          items: carrito.map((i) => ({ productoId: i.productoId, modo: i.modo, cantidad: i.cantidad, nombre: i.nombre })),
          nota: barrio.trim(),
        },
      });

      const mensaje = armarMensajePedido(pedido, nombre.trim() || cliente.nombre, barrio.trim(), cliente.email);
      const enlace = linkWhatsApp(mensaje);
      if (ventana) ventana.location.href = enlace;

      vaciar();
      // la página de gracias muestra el ticket
      try {
        sessionStorage.setItem("ultimoPedido", JSON.stringify({ pedido, enlace }));
      } catch {
        // si no se puede guardar, la página de gracias sale sin el ticket
      }
      cerrarTodo();
      irA("/gracias");
    } catch (err) {
      if (ventana) ventana.close();
      // sesión vencida o cuenta bloqueada
      if (err.estado === 401 || err.estado === 403) {
        cerrarSesion();
        cerrar();
      } else {
        setError(err.message);
        if (err.datos && err.datos.productoId) setProblema(String(err.datos.productoId));
      }
    } finally {
      setEnviando(false);
    }
  }

  if (!abierto) return null;

  return (
    <div className="fondo-oscuro" onClick={cerrarTodo}>
      <aside className="panel-carrito" onClick={(e) => e.stopPropagation()}>
        <div className="panel-cabecera">
          <h2>Mi pedido</h2>
          <button className="boton-icono" onClick={cerrarTodo} aria-label="Cerrar">✕</button>
        </div>

        {carrito.length === 0 ? (
          <div className="vacio">
            <p>Todavía no has agregado nada.</p>
            <Link to="/catalogo" className="boton" onClick={cerrarTodo}>Ver catálogo</Link>
          </div>
        ) : (
          <>
            <ul className="lista-carrito">
              {carrito.map((item) => (
                <li key={item.id} className={item.productoId === problema ? "con-problema" : ""}>
                  <div>
                    <strong>{item.nombre}</strong>
                    <small>{item.unidad} · {formatearPrecio(item.precio)}</small>
                  </div>
                  <div className="cantidad">
                    <button onClick={() => cambiarCantidad(item.id, -1)} aria-label="Quitar uno">−</button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.id, 1)} aria-label="Agregar uno">+</button>
                    <button className="quitar" onClick={() => quitar(item.id)} aria-label="Eliminar">🗑</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="total">
              <span>Total</span>
              <strong>{formatearPrecio(total)}</strong>
            </div>
            <p className="nota">Los precios son los de la página. Por WhatsApp coordinas el lugar, la fecha y la hora de la entrega.</p>

            {bajoMinimo && (
              <p className="aviso">
                El pedido mínimo es {formatearPrecio(minimo)}. Te faltan {formatearPrecio(minimo - total)}.
              </p>
            )}

            {cliente ? (
              <>
                <label>Tu nombre (opcional)
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder={cliente.nombre}
                    maxLength={60}
                  />
                </label>
                <label>Tu barrio o dirección (opcional)
                  <input value={barrio} onChange={(e) => setBarrio(e.target.value)} maxLength={100} />
                </label>

                {error && <p className="aviso">{error}</p>}

                <button className="boton boton-whatsapp" onClick={hacerPedido} disabled={bajoMinimo || enviando}>
                  {enviando ? "Creando tu ticket…" : "Pedir por WhatsApp"}
                </button>
                <p className="nota">Al pedir se crea un número de ticket para tu pedido.</p>
              </>
            ) : (
              <div className="pide-cuenta">
                <p>Para enviar tu pedido necesitas una cuenta (es gratis y rápida).</p>
                <Link to="/cuenta" className="boton" onClick={cerrarTodo}>Entrar o crear cuenta</Link>
                <p className="nota">Tu pedido se queda guardado mientras tanto.</p>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
