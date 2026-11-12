import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { pedir } from "../utils/api";
import {
  formatearPrecio,
  fechaLarga,
  linkWhatsApp,
  armarMensajePedido,
  mensajeReclamo,
} from "../utils/formato";

const ESTADOS = {
  nuevo: "Enviado, esperando confirmación",
  confirmado: "Confirmado por la tienda",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

// historial de compras y datos de la cuenta
export default function MisPedidos({ cliente, cerrarSesion, guardarCliente }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [avisoPedido, setAvisoPedido] = useState("");

  const [nombre, setNombre] = useState(cliente.nombre || "");
  const [datosMsg, setDatosMsg] = useState("");
  const [clave, setClave] = useState({ actual: "", nueva: "" });
  const [claveMsg, setClaveMsg] = useState({ tipo: "", texto: "" });

  useEffect(() => {
    pedir("/api/pedidos/mios", { rol: "cliente" })
      .then(setPedidos)
      .catch((e) => {
        // sesión vencida: se cierra y vuelve a la pantalla de entrar
        if (e.estado === 401 || e.estado === 403) cerrarSesion();
        else setError(e.message);
      })
      .finally(() => setCargando(false));
  }, []);

  // cambia un pedido de la lista por la versión nueva que mandó el servidor
  function reemplazar(nuevo) {
    setPedidos(pedidos.map((p) => (p._id === nuevo._id ? nuevo : p)));
  }

  async function cancelar(p) {
    if (!confirm(`¿Cancelar el pedido ${p.ticket}?`)) return;
    setAvisoPedido("");
    try {
      reemplazar(await pedir(`/api/pedidos/${p._id}/cancelar`, { method: "PATCH", rol: "cliente" }));
    } catch (err) {
      setAvisoPedido(err.message);
    }
  }

  // primero deja el reclamo registrado en la página y después abre WhatsApp
  async function reclamar(p) {
    setAvisoPedido("");
    // la pestaña se abre ya, en el clic, para que el navegador no la bloquee
    const ventana = window.open("", "_blank");
    try {
      const nuevo = await pedir(`/api/pedidos/${p._id}/reclamo`, { method: "POST", rol: "cliente" });
      reemplazar(nuevo);
      const enlace = linkWhatsApp(mensajeReclamo(p, cliente.email));
      if (ventana) ventana.location.href = enlace;
    } catch (err) {
      if (ventana) ventana.close();
      setAvisoPedido(err.message);
    }
  }

  async function guardarNombre(e) {
    e.preventDefault();
    setDatosMsg("");
    try {
      const datos = await pedir("/api/clientes/yo", {
        method: "PUT",
        rol: "cliente",
        body: { nombre, telefono: cliente.telefono || "" },
      });
      guardarCliente(datos.cliente);
      setDatosMsg("Datos guardados.");
    } catch (err) {
      setDatosMsg(err.message);
    }
  }

  async function cambiarClave(e) {
    e.preventDefault();
    setClaveMsg({ tipo: "", texto: "" });
    try {
      await pedir("/api/clientes/password", { method: "POST", rol: "cliente", body: clave });
      setClave({ actual: "", nueva: "" });
      setClaveMsg({ tipo: "ok", texto: "Contraseña cambiada." });
    } catch (err) {
      setClaveMsg({ tipo: "error", texto: err.message });
    }
  }

  return (
    <section className="contenedor seccion">
      <div className="admin-titulo">
        <h1>Mis pedidos</h1>
        <button className="boton boton-borde" onClick={() => window.confirm("¿Seguro que quieres cerrar la sesión?") && cerrarSesion()}>Cerrar sesión</button>
      </div>
      <p className="nota">Cuenta: {cliente.email}</p>

      {avisoPedido && <p className="aviso">{avisoPedido}</p>}
      {cargando && <p>Cargando tus pedidos…</p>}
      {error && <p className="aviso">{error}</p>}

      {!cargando && !error && pedidos.length === 0 && (
        <div className="vacio">
          <p>Todavía no has hecho pedidos.</p>
          <Link to="/catalogo" className="boton">Ver catálogo</Link>
        </div>
      )}

      {pedidos.map((p) => (
        <article key={p._id} className={`pedido estado-${p.estado}`}>
          <div className="pedido-cabecera">
            <strong className="ticket">{p.ticket}</strong>
            <span className="insignia">{ESTADOS[p.estado]}</span>
          </div>
          <small>Realizaste esta compra el {fechaLarga(p.createdAt)}</small>

          <ul className="pedido-items">
            {p.items.map((i, n) => (
              <li key={n}>
                {i.cantidad} x {i.nombre} ({i.unidad}) <span>{formatearPrecio(i.subtotal)}</span>
              </li>
            ))}
          </ul>
          <p className="pedido-total">Total: <strong>{formatearPrecio(p.total)}</strong></p>

          {p.reclamoEn && <p className="nota">Reclamo registrado el {fechaLarga(p.reclamoEn)}.</p>}
          {p.reclamable ? (
            <p className="nota">Puedes reclamar hasta el {fechaLarga(p.reclamoHasta)}.</p>
          ) : (
            <p className="nota">El plazo para reclamar este pedido terminó el {fechaLarga(p.reclamoHasta)}.</p>
          )}

          <div className="pedido-botones">
            {p.estado === "nuevo" && (
              <a
                className="boton boton-whatsapp"
                href={linkWhatsApp(armarMensajePedido(p, cliente.nombre, "", cliente.email))}
                target="_blank"
                rel="noreferrer"
              >
                Enviar por WhatsApp
              </a>
            )}
            {p.reclamable && (
              <button className="boton boton-borde" onClick={() => reclamar(p)}>
                {p.reclamoEn ? "Seguir el reclamo por WhatsApp" : "Hacer un reclamo"}
              </button>
            )}
            {p.estado === "nuevo" && (
              <button className="boton boton-borde peligro-borde" onClick={() => cancelar(p)}>
                Cancelar pedido
              </button>
            )}
          </div>
        </article>
      ))}

      <div className="dos-columnas cuenta-datos">
        <form onSubmit={guardarNombre}>
          <h2>Mis datos</h2>
          <label>Nombre (opcional)
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} />
          </label>
          <button className="boton">Guardar</button>
          {datosMsg && <p className="nota">{datosMsg}</p>}
        </form>

        <form onSubmit={cambiarClave}>
          <h2>Cambiar contraseña</h2>
          <label>Contraseña actual
            <input type="password" value={clave.actual} onChange={(e) => setClave({ ...clave, actual: e.target.value })} required autoComplete="current-password" />
          </label>
          <label>Contraseña nueva (mínimo 8 caracteres)
            <input type="password" value={clave.nueva} onChange={(e) => setClave({ ...clave, nueva: e.target.value })} required minLength={8} autoComplete="new-password" />
          </label>
          <button className="boton">Cambiar</button>
          {claveMsg.texto && <p className={claveMsg.tipo === "ok" ? "exito" : "aviso"}>{claveMsg.texto}</p>}
        </form>
      </div>
    </section>
  );
}
