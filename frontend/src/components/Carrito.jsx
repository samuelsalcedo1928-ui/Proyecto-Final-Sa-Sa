import { useState } from "react";
import { Link } from "react-router-dom";
import { formatearPrecio, totalCarrito, armarMensajePedido, linkWhatsApp } from "../utils/formato";

export default function Carrito({ abierto, cerrar, carrito, cambiarCantidad, quitar, config }) {
  const [nombre, setNombre] = useState("");
  const [barrio, setBarrio] = useState("");

  const total = totalCarrito(carrito);
  const minimo = config.pedidoMinimo || 0;
  const bajoMinimo = minimo > 0 && total < minimo;

  function pedir() {
    const mensaje = armarMensajePedido(carrito, nombre.trim(), barrio.trim());
    window.open(linkWhatsApp(mensaje), "_blank");
  }

  if (!abierto) return null;

  return (
    <div className="fondo-oscuro" onClick={cerrar}>
      <aside className="panel-carrito" onClick={(e) => e.stopPropagation()}>
        <div className="panel-cabecera">
          <h2>Mi pedido</h2>
          <button className="boton-icono" onClick={cerrar} aria-label="Cerrar">✕</button>
        </div>

        {carrito.length === 0 ? (
          <div className="vacio">
            <p>Todavía no has agregado nada.</p>
            <Link to="/catalogo" className="boton" onClick={cerrar}>Ver catálogo</Link>
          </div>
        ) : (
          <>
            <ul className="lista-carrito">
              {carrito.map((item) => (
                <li key={item.id}>
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
              <span>Total estimado</span>
              <strong>{formatearPrecio(total)}</strong>
            </div>
            <p className="nota">Los precios y el domicilio los confirma la tienda por WhatsApp.</p>

            {bajoMinimo && (
              <p className="aviso">
                El pedido mínimo es {formatearPrecio(minimo)}. Te faltan {formatearPrecio(minimo - total)}.
              </p>
            )}

            <label>
              Tu nombre (opcional)
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={60} />
            </label>
            <label>
              Tu barrio (opcional)
              <input value={barrio} onChange={(e) => setBarrio(e.target.value)} maxLength={60} />
            </label>

            <button className="boton boton-whatsapp" onClick={pedir} disabled={bajoMinimo}>
              Pedir por WhatsApp
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
