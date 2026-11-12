import { useState, useEffect } from "react";
import { formatearPrecio, fechaLarga } from "../../utils/formato";

const ESTADOS = ["nuevo", "confirmado", "entregado", "cancelado"];
const NOMBRES = { nuevo: "Nuevo", confirmado: "Confirmado", entregado: "Entregado", cancelado: "Cancelado" };

export default function Pedidos({ llamar, alError }) {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [ticket, setTicket] = useState("");
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    try {
      const params = [];
      if (filtro) params.push("estado=" + filtro);
      if (ticket.trim()) params.push("ticket=" + encodeURIComponent(ticket.trim()));
      setPedidos(await llamar("/api/pedidos" + (params.length ? "?" + params.join("&") : "")));
    } catch (error) {
      alError(error);
    } finally {
      setCargando(false);
    }
  }

  // se vuelve a cargar al cambiar el filtro de estado
  useEffect(() => {
    cargar();
  }, [filtro]);

  async function cambiarEstado(id, estado) {
    try {
      const nuevo = await llamar(`/api/pedidos/${id}/estado`, { method: "PATCH", body: { estado } });
      setPedidos(pedidos.map((p) => (p._id === id ? nuevo : p)));
    } catch (error) {
      alError(error);
    }
  }

  function buscar(e) {
    e.preventDefault();
    cargar();
  }

  return (
    <>
      <p className="nota">
        Al pasar un pedido a «Confirmado» o «Entregado» se descuenta el stock; si lo cancelas, se devuelve.
      </p>

      <div className="filtros">
        <button className={filtro === "" ? "filtro activo" : "filtro"} onClick={() => setFiltro("")}>Todos</button>
        {ESTADOS.map((e) => (
          <button key={e} className={filtro === e ? "filtro activo" : "filtro"} onClick={() => setFiltro(e)}>
            {NOMBRES[e]}
          </button>
        ))}
      </div>

      <form onSubmit={buscar} className="busca-pedidos">
        <input value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="Buscar por ticket (NV-0001)" />
        <button className="boton">Buscar</button>
      </form>

      {cargando && <p>Cargando pedidos…</p>}
      {!cargando && pedidos.length === 0 && <p>No hay pedidos para mostrar.</p>}

      {pedidos.map((p) => (
        <article key={p._id} className={`pedido pedido-admin estado-${p.estado}`}>
          <div className="pedido-cabecera">
            <strong className="ticket">{p.ticket}</strong>
            <span className="insignia">{NOMBRES[p.estado]}</span>
          </div>
          <small>
            {fechaLarga(p.createdAt)} · {p.cliente ? p.cliente.email : "cliente borrado"}
            {p.cliente && p.cliente.nombre ? ` (${p.cliente.nombre})` : ""}
          </small>

          <ul className="pedido-items">
            {p.items.map((i, n) => (
              <li key={n}>
                {i.cantidad} x {i.nombre} ({i.unidad}) <span>{formatearPrecio(i.subtotal)}</span>
              </li>
            ))}
          </ul>
          <p className="pedido-total">Total: <strong>{formatearPrecio(p.total)}</strong></p>
          {p.nota && <p className="nota">Barrio/nota: {p.nota}</p>}
          {p.reclamoEn && <p className="stock-bajo">⚠ Reclamo registrado el {fechaLarga(p.reclamoEn)}</p>}
          <p className="nota">
            {p.reclamable ? "Aún dentro del plazo de reclamo" : "Plazo de reclamo terminado"} (hasta {fechaLarga(p.reclamoHasta)})
          </p>

          <div className="estados">
            {ESTADOS.map((e) => (
              <button key={e} className={p.estado === e ? "activo" : ""} onClick={() => cambiarEstado(p._id, e)}>
                {NOMBRES[e]}
              </button>
            ))}
          </div>
        </article>
      ))}
    </>
  );
}
