import { useState, useEffect } from "react";
import { SOBRE_POR_DEFECTO } from "../../config";
import SubirImagen from "../../components/SubirImagen";

// el admin cambia aquí los textos y las fotos de la página "Sobre nosotros"
export default function SobreAdmin({ llamar, alError }) {
  const [sobre, setSobre] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    llamar("/api/config")
      .then((c) => setSobre({ ...SOBRE_POR_DEFECTO, ...(c.sobre || {}) }))
      .catch(alError);
  }, []);

  function cambiar(e) {
    setSobre({ ...sobre, [e.target.name]: e.target.value });
  }

  function cambiarValor(i, campo, valor) {
    const valores = sobre.valores.map((v, n) => (n === i ? { ...v, [campo]: valor } : v));
    setSobre({ ...sobre, valores });
  }

  function cambiarPersona(i, campo, valor) {
    const equipo = sobre.equipo.map((p, n) => (n === i ? { ...p, [campo]: valor } : p));
    setSobre({ ...sobre, equipo });
  }

  function agregarPersona() {
    setSobre({ ...sobre, equipo: [...sobre.equipo, { nombre: "", cargo: "", foto: "" }] });
  }

  function quitarPersona(i) {
    setSobre({ ...sobre, equipo: sobre.equipo.filter((_, n) => n !== i) });
  }

  async function guardar(e) {
    e.preventDefault();
    setMensaje("");
    try {
      const config = await llamar("/api/config/sobre", { method: "PUT", body: sobre });
      setSobre({ ...SOBRE_POR_DEFECTO, ...config.sobre });
      setMensaje("Guardado. Ya se ve en la página «Nosotros».");
    } catch (error) {
      if (error.estado === 401) alError(error);
      else setMensaje(error.message);
    }
  }

  if (!sobre) return <p>Cargando…</p>;

  return (
    <form onSubmit={guardar} className="form-admin">
      <h2>Portada</h2>
      <label>Título grande
        <input name="titulo" value={sobre.titulo} onChange={cambiar} maxLength={120} />
      </label>
      <label>Texto de presentación
        <textarea name="intro" rows="3" value={sobre.intro} onChange={cambiar} maxLength={400} />
      </label>
      <label>Años de la tienda (sale en las cifras)
        <input name="anios" type="number" min="0" value={sobre.anios} onChange={cambiar} />
      </label>
      <p className="nota">Foto de la fachada</p>
      <SubirImagen
        valor={sobre.fachada}
        cambiar={(url) => setSobre({ ...sobre, fachada: url })}
        llamar={llamar}
        alError={alError}
        proporcion={5 / 2}
      />

      <h2>Historia y misión</h2>
      <label>Nuestra historia (deja una línea en blanco para separar párrafos)
        <textarea name="historia" rows="8" value={sobre.historia} onChange={cambiar} maxLength={2000} />
      </label>
      <label>Nuestra misión
        <textarea name="mision" rows="3" value={sobre.mision} onChange={cambiar} maxLength={500} />
      </label>

      <h2>Lo que nos importa</h2>
      {sobre.valores.map((v, i) => (
        <div key={i} className="grupo-form">
          <label>Dibujito
            <input value={v.icono} onChange={(e) => cambiarValor(i, "icono", e.target.value)} maxLength={8} />
          </label>
          <label>Título
            <input value={v.titulo} onChange={(e) => cambiarValor(i, "titulo", e.target.value)} maxLength={40} />
          </label>
          <label>Texto
            <textarea rows="2" value={v.texto} onChange={(e) => cambiarValor(i, "texto", e.target.value)} maxLength={200} />
          </label>
        </div>
      ))}

      <h2>Quién administra la tienda</h2>
      <label>Nombre
        <input name="administradorNombre" value={sobre.administradorNombre} onChange={cambiar} maxLength={60} />
      </label>
      <label>Descripción
        <textarea name="administradorTexto" rows="3" value={sobre.administradorTexto} onChange={cambiar} maxLength={500} />
      </label>
      <p className="nota">Foto</p>
      <SubirImagen
        valor={sobre.administradorFoto}
        cambiar={(url) => setSobre({ ...sobre, administradorFoto: url })}
        llamar={llamar}
        alError={alError}
        proporcion={3 / 4}
      />

      <h2>Nuestro equipo</h2>
      {sobre.equipo.length === 0 && <p className="nota">Todavía no hay personas. Agrega las que quieras que salgan en la página.</p>}
      {sobre.equipo.map((p, i) => (
        <div key={i} className="grupo-form">
          <label>Nombre
            <input value={p.nombre} onChange={(e) => cambiarPersona(i, "nombre", e.target.value)} maxLength={60} />
          </label>
          <label>Cargo
            <input value={p.cargo} onChange={(e) => cambiarPersona(i, "cargo", e.target.value)} maxLength={60} />
          </label>
          <SubirImagen
            valor={p.foto}
            cambiar={(url) => cambiarPersona(i, "foto", url)}
            llamar={llamar}
            alError={alError}
            proporcion={3 / 4}
          />
          <button type="button" className="enlace peligro" onClick={() => quitarPersona(i)}>Quitar a esta persona</button>
        </div>
      ))}
      <button type="button" className="boton boton-borde" onClick={agregarPersona}>+ Agregar persona</button>

      <div>
        <button className="boton">Guardar información</button>
      </div>
      {mensaje && <p className="exito">{mensaje}</p>}
    </form>
  );
}
