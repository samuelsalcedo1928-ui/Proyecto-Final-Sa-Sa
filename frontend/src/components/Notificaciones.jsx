import { useState, useEffect } from "react";
import { pedir } from "../utils/api";

const ICONOS = { pedido: "🛒", cancelacion: "❌", cliente: "👤", stock: "📦", mensaje: "✉️", reclamo: "⚠️" };

// campana del admin: avisa de pedidos, cancelaciones, clientes nuevos, poco stock, mensajes y reclamos
export default function Notificaciones({ ir }) {
  const [datos, setDatos] = useState({ lista: [], noLeidas: 0 });
  const [abierto, setAbierto] = useState(false);

  async function cargar() {
    try {
      setDatos(await pedir("/api/notificaciones", { rol: "admin" }));
    } catch (e) {
      // si falla, se queda lo que había
    }
  }

  // revisa cada 30 segundos
  useEffect(() => {
    cargar();
    const reloj = setInterval(cargar, 30000);
    return () => clearInterval(reloj);
  }, []);

  async function abrir(n) {
    if (!n.leida) {
      await pedir(`/api/notificaciones/${n._id}/leida`, { method: "PATCH", rol: "admin" }).catch(() => {});
    }
    setAbierto(false);
    ir(`/admin/panel?pestana=${n.pestana}`);
    cargar();
  }

  async function leerTodas() {
    await pedir("/api/notificaciones/leer-todas", { method: "POST", rol: "admin" }).catch(() => {});
    cargar();
  }

  return (
    <div className="notif">
      <button
        className="boton-icono"
        onClick={() => { setAbierto(!abierto); if (!abierto) cargar(); }}
        aria-label="Notificaciones"
      >
        🔔
        {datos.noLeidas > 0 && <span className="globo">{datos.noLeidas}</span>}
      </button>

      {abierto && (
        <div className="notif-panel">
          <div className="notif-cabecera">
            <strong>Notificaciones</strong>
            {datos.noLeidas > 0 && <button className="enlace" onClick={leerTodas}>Marcar todas como leídas</button>}
          </div>

          {datos.lista.length === 0 && <p className="nota">No hay notificaciones todavía.</p>}

          {datos.lista.map((n) => (
            <button key={n._id} className={n.leida ? "notif-item" : "notif-item nueva"} onClick={() => abrir(n)}>
              <span>{ICONOS[n.tipo] || "🔔"}</span>
              <div>
                <strong>{n.titulo}</strong>
                {n.detalle && <small>{n.detalle}</small>}
                <small>{new Date(n.createdAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</small>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
