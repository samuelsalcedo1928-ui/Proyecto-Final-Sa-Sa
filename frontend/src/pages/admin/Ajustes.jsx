import { useState, useEffect } from "react";

export default function Ajustes({ llamar, alError }) {
  const [ajustes, setAjustes] = useState(null);
  const [guardado, setGuardado] = useState("");

  useEffect(() => {
    llamar("/api/config").then(setAjustes).catch(alError);
  }, []);

  function cambiar(e) {
    setAjustes({ ...ajustes, [e.target.name]: e.target.value });
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardado("");
    try {
      setAjustes(await llamar("/api/config", { method: "PUT", body: ajustes }));
      setGuardado("Ajustes guardados.");
    } catch (error) {
      alError(error);
    }
  }

  if (!ajustes) return <p>Cargando…</p>;

  return (
    <form onSubmit={guardar} className="form-admin">
      <h2>Ajustes de la tienda</h2>
      <label>Aviso de arriba (vacío = no se muestra)
        <input name="aviso" value={ajustes.aviso} onChange={cambiar} />
      </label>
      <label>Horarios
        <input name="horarios" value={ajustes.horarios} onChange={cambiar} />
      </label>
      <label>Medios de pago
        <input name="mediosPago" value={ajustes.mediosPago} onChange={cambiar} />
      </label>
      <label>Pedido mínimo (pesos, 0 = sin mínimo)
        <input name="pedidoMinimo" type="number" min="0" value={ajustes.pedidoMinimo} onChange={cambiar} />
      </label>
      <label>Domicilio
        <input name="domicilio" value={ajustes.domicilio} onChange={cambiar} />
      </label>
      <label>Zonas de domicilio
        <input name="zonas" value={ajustes.zonas} onChange={cambiar} />
      </label>
      <label>Horas que tiene el cliente para hacer un reclamo
        <input name="plazoReclamoHoras" type="number" min="1" max="720" value={ajustes.plazoReclamoHoras || 24} onChange={cambiar} />
      </label>
      <button className="boton">Guardar ajustes</button>
      {guardado && <p className="exito">{guardado}</p>}
    </form>
  );
}
