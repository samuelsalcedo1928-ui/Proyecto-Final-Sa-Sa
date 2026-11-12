import { useState, useEffect } from "react";
import { FILTROS_FIJOS } from "../../config";
import { useCategorias } from "../../utils/categorias";
import SubirImagen from "../../components/SubirImagen";

const BANNER_VACIO = { titulo: "", subtitulo: "", imagen: "", ver: "", textoBoton: "Ver productos", orden: 1, activo: true };

export default function Banners({ llamar, alError }) {
  const { categorias } = useCategorias();
  const FILTROS = [...FILTROS_FIJOS, ...categorias.map((c) => c.nombre)];
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(BANNER_VACIO);
  const [editando, setEditando] = useState(null);

  async function cargar() {
    try {
      setBanners(await llamar("/api/banners?todos=1"));
    } catch (error) {
      alError(error);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function cambiar(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function guardar(e) {
    e.preventDefault();
    try {
      const ruta = editando ? `/api/banners/${editando}` : "/api/banners";
      await llamar(ruta, { method: editando ? "PUT" : "POST", body: form });
      setForm(BANNER_VACIO);
      setEditando(null);
      cargar();
    } catch (error) {
      alError(error);
    }
  }

  async function borrar(id) {
    if (!confirm("¿Eliminar este banner?")) return;
    try {
      await llamar(`/api/banners/${id}`, { method: "DELETE" });
      cargar();
    } catch (error) {
      alError(error);
    }
  }

  return (
    <>
      <p className="nota">Son las imágenes grandes que rotan arriba en el inicio. Si no hay ninguno activo, se muestra uno por defecto.</p>
      <form onSubmit={guardar} className="form-admin">
        <h2>{editando ? "Editar banner" : "Nuevo banner"}</h2>
        <label>Título
          <input name="titulo" value={form.titulo} onChange={cambiar} required />
        </label>
        <label>Subtítulo
          <input name="subtitulo" value={form.subtitulo} onChange={cambiar} />
        </label>
        <SubirImagen
          valor={form.imagen}
          cambiar={(url) => setForm({ ...form, imagen: url })}
          llamar={llamar}
          alError={alError}
          proporcion={21 / 9}
          guia={0.3}
          ayuda="El marco punteado muestra lo que se alcanza a ver en un celular: pon ahí lo más importante."
        />
        <label>El botón lleva a
          <select name="ver" value={form.ver} onChange={cambiar}>
            {FILTROS.map((f) => <option key={f} value={f === "Todas" ? "" : f}>{f}</option>)}
          </select>
        </label>
        <label>Texto del botón
          <input name="textoBoton" value={form.textoBoton} onChange={cambiar} />
        </label>
        <label>Orden (1 sale primero)
          <input name="orden" type="number" value={form.orden} onChange={cambiar} />
        </label>
        <label className="check">
          <input name="activo" type="checkbox" checked={form.activo} onChange={cambiar} />
          Activo
        </label>
        <div>
          <button className="boton">{editando ? "Guardar cambios" : "Agregar banner"}</button>{" "}
          {editando && (
            <button type="button" className="boton boton-borde" onClick={() => { setEditando(null); setForm(BANNER_VACIO); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {banners.map((b) => (
        <article key={b._id} className="mensaje">
          <strong>{b.titulo}</strong> {b.activo ? "" : "(inactivo)"}
          <p>{b.subtitulo}</p>
          <small>Orden {b.orden} · Lleva a: {b.ver || "Todo el catálogo"}</small>
          <p>
            <button className="enlace" onClick={() => { setEditando(b._id); setForm({ ...BANNER_VACIO, ...b }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Editar</button>{" "}
            <button className="enlace peligro" onClick={() => borrar(b._id)}>Eliminar</button>
          </p>
        </article>
      ))}
    </>
  );
}
