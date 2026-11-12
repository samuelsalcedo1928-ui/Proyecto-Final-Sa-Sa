import { useState, useEffect } from "react";

export default function Clientes({ llamar, alError }) {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  // contraseña temporal recién creada: { email, temporal }
  const [temporal, setTemporal] = useState(null);

  async function cargar() {
    try {
      setClientes(await llamar("/api/clientes"));
    } catch (error) {
      alError(error);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function bloquear(c) {
    const bloquear = !c.bloqueado;
    if (bloquear && !confirm(`¿Bloquear a ${c.email}? No podrá hacer pedidos.`)) return;
    try {
      await llamar(`/api/clientes/${c._id}/bloqueo`, { method: "PATCH", body: { bloqueado: bloquear } });
      cargar();
    } catch (error) {
      alError(error);
    }
  }

  async function reiniciar(c) {
    if (!confirm(`¿Crear una contraseña temporal para ${c.email}?`)) return;
    try {
      setTemporal(await llamar(`/api/clientes/${c._id}/reiniciar-password`, { method: "POST" }));
    } catch (error) {
      alError(error);
    }
  }

  const visibles = clientes.filter(
    (c) =>
      c.email.includes(busqueda.toLowerCase().trim()) ||
      (c.nombre || "").toLowerCase().includes(busqueda.toLowerCase().trim()),
  );

  return (
    <>
      <p className="nota">
        Si un cliente olvidó su contraseña y te escribe por WhatsApp, crea una temporal y se la pasas. Solo se muestra una vez.
      </p>

      {temporal && (
        <div className="temporal">
          <p>
            Contraseña temporal de <strong>{temporal.email}</strong>:
          </p>
          <code>{temporal.temporal}</code>
          <p className="nota">Anótala ahora, cuando cierres este aviso no se puede volver a ver. El cliente puede cambiarla en «Mis pedidos».</p>
          <button className="boton boton-borde" onClick={() => setTemporal(null)}>Ya la anoté</button>
        </div>
      )}

      <input
        className="buscador"
        placeholder="Buscar por correo o nombre"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {visibles.length === 0 && <p>No hay clientes para mostrar.</p>}

      <div className="tabla-scroll">
        <table>
          <thead>
            <tr><th>Correo</th><th>Nombre</th><th>Pedidos</th><th>Registro</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {visibles.map((c) => (
              <tr key={c._id}>
                <td>{c.email}</td>
                <td>{c.nombre || "-"}</td>
                <td>{c.pedidos}</td>
                <td>{new Date(c.createdAt).toLocaleDateString("es-CO")}</td>
                <td>{c.bloqueado ? <span className="stock-bajo">Bloqueado</span> : "Activo"}</td>
                <td>
                  <button className="enlace" onClick={() => reiniciar(c)}>Nueva contraseña</button>{" "}
                  <button className={c.bloqueado ? "enlace" : "enlace peligro"} onClick={() => bloquear(c)}>
                    {c.bloqueado ? "Desbloquear" : "Bloquear"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
