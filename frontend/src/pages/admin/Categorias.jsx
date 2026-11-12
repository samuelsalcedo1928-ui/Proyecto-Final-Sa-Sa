import { useState, useEffect } from "react";
import SubirImagen from "../../components/SubirImagen";
import { useCategorias } from "../../utils/categorias";

const VACIA = { nombre: "", icono: "📦", imagen: "", orden: "", activa: true };

export default function Categorias({ llamar, alError }) {
  const { recargar } = useCategorias();
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(VACIA);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");

  async function cargar() {
    try {
      setLista(await llamar("/api/categorias?todas=1"));
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
    setMensaje("");
    try {
      const ruta = editando ? `/api/categorias/${editando}` : "/api/categorias";
      await llamar(ruta, { method: editando ? "PUT" : "POST", body: form });
      setForm(VACIA);
      setEditando(null);
      await cargar();
      recargar();
    } catch (error) {
      if (error.estado === 401) alError(error);
      else setMensaje(error.message);
    }
  }

  function editar(c) {
    setEditando(c._id);
    setForm({ nombre: c.nombre, icono: c.icono, imagen: c.imagen || "", orden: c.orden, activa: c.activa });
    window.scrollTo(0, 0);
  }

  async function borrar(c) {
    if (!window.confirm(`¿Borrar la categoría "${c.nombre}"?`)) return;
    setMensaje("");
    try {
      await llamar(`/api/categorias/${c._id}`, { method: "DELETE" });
      await cargar();
      recargar();
    } catch (error) {
      if (error.estado === 401) alError(error);
      else setMensaje(error.message);
    }
  }

  return (
    <>
      <form onSubmit={guardar} className="form-admin">
        <h2>{editando ? "Editar categoría" : "Nueva categoría (catálogo)"}</h2>
        <p className="nota">Las categorías aparecen en el menú de arriba, en el inicio y en los filtros del catálogo.</p>
        <label>Nombre
          <input name="nombre" value={form.nombre} onChange={cambiar} maxLength={30} required />
        </label>
        <label>Dibujito (un emoji)
          <input name="icono" value={form.icono} onChange={cambiar} maxLength={8} />
        </label>
        <label>Posición en el menú (1 sale primero)
          <input name="orden" type="number" value={form.orden} onChange={cambiar} />
        </label>
        <SubirImagen
          valor={form.imagen}
          cambiar={(url) => setForm({ ...form, imagen: url })}
          llamar={llamar}
          alError={alError}
          proporcion={4 / 3}
        />
        <label className="check">
          <input name="activa" type="checkbox" checked={form.activa} onChange={cambiar} /> Visible en la tienda
        </label>
        <button className="boton">{editando ? "Guardar cambios" : "Crear categoría"}</button>
        {editando && (
          <button type="button" className="boton boton-borde" onClick={() => { setEditando(null); setForm(VACIA); }}>
            Cancelar
          </button>
        )}
        {mensaje && <p className="aviso">{mensaje}</p>}
      </form>

      {lista.map((c) => (
        <article key={c._id} className="mensaje">
          <strong>{c.icono} {c.nombre}</strong> {c.activa ? "" : "(oculta)"}
          <p><small>{c.productos} producto(s) · Posición {c.orden}</small></p>
          <p>
            <button className="enlace" onClick={() => editar(c)}>Editar</button>{" "}
            <button className="enlace peligro" onClick={() => borrar(c)}>Eliminar</button>
          </p>
        </article>
      ))}
    </>
  );
}
