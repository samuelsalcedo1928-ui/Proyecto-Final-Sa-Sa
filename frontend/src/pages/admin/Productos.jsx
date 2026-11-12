import { useState, useEffect } from "react";
import { useCategorias } from "../../utils/categorias";
import { formatearPrecio } from "../../utils/formato";
import SubirImagen from "../../components/SubirImagen";

const PRODUCTO_VACIO = {
  nombre: "",
  categoria: "Comida",
  unidad: "",
  precio: "",
  precioUnidad: "",
  unidadSuelta: "Unidad",
  imagen: "",
  descripcion: "",
  etiquetas: "",
  disponible: true,
  destacado: false,
  masVendido: false,
  precioOferta: "",
  ofertaTipo: "oferta",
  ofertaHasta: "",
  stock: "",
  stockMinimo: "",
};

// fecha ISO -> "2026-11-20" en hora de Colombia (lo que espera el campo de fecha)
const aFechaCampo = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Bogota" }) : "";

export default function Productos({ llamar, alError }) {
  const { categorias } = useCategorias();
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(PRODUCTO_VACIO);
  const [editando, setEditando] = useState(null); // id del producto que se edita

  async function cargar() {
    try {
      setProductos(await llamar("/api/productos?todos=1"));
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
      const ruta = editando ? `/api/productos/${editando}` : "/api/productos";
      await llamar(ruta, { method: editando ? "PUT" : "POST", body: form });
      setForm(PRODUCTO_VACIO);
      setEditando(null);
      cargar();
    } catch (error) {
      alError(error);
    }
  }

  function editar(p) {
    setEditando(p._id);
    setForm({
      ...PRODUCTO_VACIO,
      ...p,
      precioUnidad: p.precioUnidad || "",
      precioOferta: p.precioOferta || "",
      ofertaTipo: p.ofertaTipo || "oferta",
      ofertaHasta: aFechaCampo(p.ofertaHasta),
      // stock vacío = no se controla
      stock: p.stock === null || p.stock === undefined ? "" : p.stock,
      stockMinimo: p.stockMinimo || "",
      etiquetas: (p.etiquetas || []).map((e) => "#" + e).join(" "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // acción rápida: ocultar o mostrar sin abrir el formulario
  async function alternarVisible(p) {
    try {
      await llamar(`/api/productos/${p._id}`, {
        method: "PUT",
        body: {
          ...PRODUCTO_VACIO,
          ...p,
          precioUnidad: p.precioUnidad || "",
          etiquetas: p.etiquetas || [],
          precioOferta: p.precioOferta || "",
          ofertaTipo: p.ofertaTipo || "oferta",
          ofertaHasta: aFechaCampo(p.ofertaHasta),
          stock: p.stock === null || p.stock === undefined ? "" : p.stock,
          disponible: !p.disponible,
        },
      });
      cargar();
    } catch (error) {
      alError(error);
    }
  }

  async function borrar(id) {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await llamar(`/api/productos/${id}`, { method: "DELETE" });
      cargar();
    } catch (error) {
      alError(error);
    }
  }

  return (
    <>
      <form onSubmit={guardar} className="form-admin">
        <h2>{editando ? "Editar producto" : "Nuevo producto"}</h2>
        <label>Nombre
          <input name="nombre" value={form.nombre} onChange={cambiar} required />
        </label>
        <label>Categoría
          <select name="categoria" value={form.categoria} onChange={cambiar}>
            {categorias.map((c) => <option key={c._id}>{c.nombre}</option>)}
          </select>
        </label>
        <label>Etiquetas para la búsqueda inteligente (con # o separadas por espacios, ej: #snack #merienda #dulce)
          <input name="etiquetas" value={form.etiquetas} onChange={cambiar} placeholder="#snack #merienda" />
        </label>
        <label>Se vende al por mayor por (Bulto, Paca, Caja…)
          <input name="unidad" value={form.unidad} onChange={cambiar} required />
        </label>
        <label>Precio de esa presentación (pesos)
          <input name="precio" type="number" min="0" value={form.precio} onChange={cambiar} required />
        </label>
        <label>Precio de una unidad suelta (si lo dejas vacío, el producto no se vende suelto y no sale el selector de unidad)
          <input name="precioUnidad" type="number" min="0" value={form.precioUnidad} onChange={cambiar} />
        </label>
        <label>Cómo se llama la unidad suelta (Unidad, Bolsa, Litro…)
          <input name="unidadSuelta" value={form.unidadSuelta} onChange={cambiar} />
        </label>
        <SubirImagen
          valor={form.imagen}
          cambiar={(url) => setForm({ ...form, imagen: url })}
          llamar={llamar}
          alError={alError}
          proporcion={4 / 3}
        />
        <label>Descripción
          <input name="descripcion" value={form.descripcion} onChange={cambiar} />
        </label>

        <fieldset>
          <legend>Stock (opcional)</legend>
          <label>Cuántas presentaciones hay (vacío = no controlar el stock)
            <input name="stock" type="number" min="0" value={form.stock} onChange={cambiar} />
          </label>
          <label>Avisar cuando queden esta cantidad o menos
            <input name="stockMinimo" type="number" min="0" value={form.stockMinimo} onChange={cambiar} />
          </label>
        </fieldset>

        <fieldset>
          <legend>Oferta (opcional)</legend>
          <label>Precio de oferta de la presentación (vacío = sin oferta)
            <input name="precioOferta" type="number" min="0" value={form.precioOferta} onChange={cambiar} />
          </label>
          <label>Tipo de oferta
            <select name="ofertaTipo" value={form.ofertaTipo} onChange={cambiar}>
              <option value="oferta">Oferta normal</option>
              <option value="caducidad">Próximo a vencer</option>
            </select>
          </label>
          <label>La oferta termina el (vacío = sin fecha)
            <input name="ofertaHasta" type="date" value={form.ofertaHasta} onChange={cambiar} />
          </label>
        </fieldset>

        <label className="check">
          <input name="disponible" type="checkbox" checked={form.disponible} onChange={cambiar} />
          Disponible
        </label>
        <label className="check">
          <input name="masVendido" type="checkbox" checked={form.masVendido} onChange={cambiar} />
          Mostrar en «Lo más vendido»
        </label>
        <label className="check">
          <input name="destacado" type="checkbox" checked={form.destacado} onChange={cambiar} />
          Mostrar en «Recomendados»
        </label>
        <div>
          <button className="boton">{editando ? "Guardar cambios" : "Agregar"}</button>{" "}
          {editando && (
            <button type="button" className="boton boton-borde" onClick={() => { setEditando(null); setForm(PRODUCTO_VACIO); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="tabla-scroll">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Categoría</th><th>Presentación</th><th>Precio</th><th>Suelto</th><th>Stock</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {productos.map((p) => {
              const controla = p.stock !== null && p.stock !== undefined;
              const bajo = controla && p.stock <= p.stockMinimo;
              return (
                <tr key={p._id}>
                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>{p.unidad}</td>
                  <td>
                    {p.enOferta ? (
                      <>
                        <s>{formatearPrecio(p.precio)}</s> {formatearPrecio(p.precioOferta)}
                      </>
                    ) : (
                      formatearPrecio(p.precio)
                    )}
                  </td>
                  <td>{p.precioUnidad > 0 ? formatearPrecio(p.precioUnidad) : "-"}</td>
                  <td className={bajo ? "stock-bajo" : ""}>{controla ? p.stock : "-"}</td>
                  <td>
                    {p.disponible ? "Visible" : "Oculto"}
                    {p.enOferta ? " · Oferta" : ""}
                    {p.masVendido ? " · Más vendido" : ""}
                    {p.destacado ? " · Recomendado" : ""}
                  </td>
                  <td>
                    <button className="enlace" onClick={() => alternarVisible(p)}>{p.disponible ? "Ocultar" : "Mostrar"}</button>{" "}
                    <button className="enlace" onClick={() => editar(p)}>Editar</button>{" "}
                    <button className="enlace peligro" onClick={() => borrar(p._id)}>Eliminar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
