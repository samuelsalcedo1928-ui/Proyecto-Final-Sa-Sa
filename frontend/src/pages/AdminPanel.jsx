import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pedir } from "../utils/api";
import { CATEGORIAS, FILTROS } from "../config";
import { formatearPrecio } from "../utils/formato";

const PRODUCTO_VACIO = {
  nombre: "",
  categoria: "Comida",
  unidad: "",
  precio: "",
  precioUnidad: "",
  unidadSuelta: "Unidad",
  imagen: "",
  descripcion: "",
  disponible: true,
  destacado: false,
  masVendido: false,
  precioOferta: "",
  ofertaTipo: "oferta",
  ofertaHasta: "",
};

const BANNER_VACIO = { titulo: "", subtitulo: "", imagen: "", ver: "", textoBoton: "Ver productos", orden: 1, activo: true };

const PESTANAS = ["resumen", "productos", "banners", "ajustes", "mensajes"];

// fecha ISO -> "2026-11-20" en hora de Colombia (lo que espera el campo de fecha)
const aFechaCampo = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Bogota" }) : "";

export default function AdminPanel() {
  const [pestana, setPestana] = useState("resumen");
  const [productos, setProductos] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [banners, setBanners] = useState([]);
  const [ajustes, setAjustes] = useState(null);
  const [form, setForm] = useState(PRODUCTO_VACIO);
  const [editando, setEditando] = useState(null); // id del producto que se edita
  const [formBanner, setFormBanner] = useState(BANNER_VACIO);
  const [editandoBanner, setEditandoBanner] = useState(null);
  const [aviso, setAviso] = useState("");
  const [guardado, setGuardado] = useState("");
  const irA = useNavigate();

  function salir() {
    localStorage.removeItem("token_admin");
    irA("/admin");
  }

  // si el token venció (401) mandamos al login
  function manejarError(error) {
    if (error.estado === 401) return salir();
    setAviso(error.message);
  }

  async function cargar() {
    try {
      setProductos(await pedir("/api/productos?todos=1"));
      setMensajes(await pedir("/api/contacto"));
      setBanners(await pedir("/api/banners?todos=1"));
      setAjustes(await pedir("/api/config"));
    } catch (error) {
      manejarError(error);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("token_admin")) return irA("/admin");
    cargar();
  }, []);

  // ---------- productos ----------
  function cambiar(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function guardar(e) {
    e.preventDefault();
    setAviso("");
    try {
      const ruta = editando ? `/api/productos/${editando}` : "/api/productos";
      await pedir(ruta, { method: editando ? "PUT" : "POST", body: form });
      setForm(PRODUCTO_VACIO);
      setEditando(null);
      cargar();
    } catch (error) {
      manejarError(error);
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
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function borrarProducto(id) {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await pedir(`/api/productos/${id}`, { method: "DELETE" });
      cargar();
    } catch (error) {
      manejarError(error);
    }
  }

  // ---------- banners ----------
  function cambiarBanner(e) {
    const { name, value, type, checked } = e.target;
    setFormBanner({ ...formBanner, [name]: type === "checkbox" ? checked : value });
  }

  async function guardarBanner(e) {
    e.preventDefault();
    setAviso("");
    try {
      const ruta = editandoBanner ? `/api/banners/${editandoBanner}` : "/api/banners";
      await pedir(ruta, { method: editandoBanner ? "PUT" : "POST", body: formBanner });
      setFormBanner(BANNER_VACIO);
      setEditandoBanner(null);
      cargar();
    } catch (error) {
      manejarError(error);
    }
  }

  async function borrarBanner(id) {
    if (!confirm("¿Eliminar este banner?")) return;
    try {
      await pedir(`/api/banners/${id}`, { method: "DELETE" });
      cargar();
    } catch (error) {
      manejarError(error);
    }
  }

  // ---------- ajustes ----------
  function cambiarAjuste(e) {
    setAjustes({ ...ajustes, [e.target.name]: e.target.value });
  }

  async function guardarAjustes(e) {
    e.preventDefault();
    setAviso("");
    setGuardado("");
    try {
      setAjustes(await pedir("/api/config", { method: "PUT", body: ajustes }));
      setGuardado("Ajustes guardados.");
    } catch (error) {
      manejarError(error);
    }
  }

  // ---------- mensajes ----------
  async function marcarLeido(id) {
    try {
      await pedir(`/api/contacto/${id}`, { method: "PATCH" });
      cargar();
    } catch (error) {
      manejarError(error);
    }
  }

  async function borrarMensaje(id) {
    if (!confirm("¿Eliminar este mensaje?")) return;
    try {
      await pedir(`/api/contacto/${id}`, { method: "DELETE" });
      cargar();
    } catch (error) {
      manejarError(error);
    }
  }

  const disponibles = productos.filter((p) => p.disponible).length;
  const enOferta = productos.filter((p) => p.enOferta).length;
  const sinLeer = mensajes.filter((m) => !m.leido).length;

  return (
    <section className="contenedor seccion">
      <div className="admin-titulo">
        <h1>Panel de administración</h1>
        <button className="boton boton-borde" onClick={salir}>Cerrar sesión</button>
      </div>

      <div className="filtros">
        {PESTANAS.map((p) => (
          <button
            key={p}
            className={p === pestana ? "filtro activo" : "filtro"}
            onClick={() => { setPestana(p); setAviso(""); setGuardado(""); }}
          >
            {p[0].toUpperCase() + p.slice(1)}
            {p === "mensajes" && sinLeer > 0 ? ` (${sinLeer})` : ""}
          </button>
        ))}
      </div>

      {aviso && <p className="aviso">{aviso}</p>}

      {pestana === "resumen" && (
        <div className="rejilla contadores">
          <div className="contador"><strong>{productos.length}</strong>Productos</div>
          <div className="contador"><strong>{disponibles}</strong>Disponibles</div>
          <div className="contador"><strong>{enOferta}</strong>En oferta</div>
          <div className="contador"><strong>{banners.length}</strong>Banners</div>
          <div className="contador"><strong>{mensajes.length}</strong>Mensajes</div>
          <div className="contador"><strong>{sinLeer}</strong>Sin leer</div>
        </div>
      )}

      {pestana === "productos" && (
        <>
          <form onSubmit={guardar} className="form-admin">
            <h2>{editando ? "Editar producto" : "Nuevo producto"}</h2>
            <label>Nombre
              <input name="nombre" value={form.nombre} onChange={cambiar} required />
            </label>
            <label>Categoría
              <select name="categoria" value={form.categoria} onChange={cambiar}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>Se vende al por mayor por (Bulto, Paca, Caja…)
              <input name="unidad" value={form.unidad} onChange={cambiar} required />
            </label>
            <label>Precio de esa presentación (pesos)
              <input name="precio" type="number" min="0" value={form.precio} onChange={cambiar} required />
            </label>
            <label>Precio de una unidad suelta (déjalo vacío si no se vende suelto)
              <input name="precioUnidad" type="number" min="0" value={form.precioUnidad} onChange={cambiar} />
            </label>
            <label>Cómo se llama la unidad suelta (Unidad, Bolsa, Litro…)
              <input name="unidadSuelta" value={form.unidadSuelta} onChange={cambiar} />
            </label>
            <label>Imagen (nombre del archivo en public/img o un link)
              <input name="imagen" value={form.imagen} onChange={cambiar} />
            </label>
            <label>Descripción
              <input name="descripcion" value={form.descripcion} onChange={cambiar} />
            </label>

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
                <tr><th>Nombre</th><th>Categoría</th><th>Presentación</th><th>Precio</th><th>Suelto</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {productos.map((p) => (
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
                    <td>
                      {p.disponible ? "Disponible" : "Oculto"}
                      {p.enOferta ? " · Oferta" : ""}
                      {p.masVendido ? " · Más vendido" : ""}
                      {p.destacado ? " · Recomendado" : ""}
                    </td>
                    <td>
                      <button className="enlace" onClick={() => editar(p)}>Editar</button>{" "}
                      <button className="enlace peligro" onClick={() => borrarProducto(p._id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pestana === "banners" && (
        <>
          <p className="nota">Son las imágenes grandes que rotan arriba en el inicio. Si no hay ninguno activo, se muestra uno por defecto.</p>
          <form onSubmit={guardarBanner} className="form-admin">
            <h2>{editandoBanner ? "Editar banner" : "Nuevo banner"}</h2>
            <label>Título
              <input name="titulo" value={formBanner.titulo} onChange={cambiarBanner} required />
            </label>
            <label>Subtítulo
              <input name="subtitulo" value={formBanner.subtitulo} onChange={cambiarBanner} />
            </label>
            <label>Imagen (nombre del archivo en public/img o un link)
              <input name="imagen" value={formBanner.imagen} onChange={cambiarBanner} />
            </label>
            <label>El botón lleva a
              <select name="ver" value={formBanner.ver} onChange={cambiarBanner}>
                {FILTROS.map((f) => <option key={f} value={f === "Todas" ? "" : f}>{f}</option>)}
              </select>
            </label>
            <label>Texto del botón
              <input name="textoBoton" value={formBanner.textoBoton} onChange={cambiarBanner} />
            </label>
            <label>Orden (1 sale primero)
              <input name="orden" type="number" value={formBanner.orden} onChange={cambiarBanner} />
            </label>
            <label className="check">
              <input name="activo" type="checkbox" checked={formBanner.activo} onChange={cambiarBanner} />
              Activo
            </label>
            <div>
              <button className="boton">{editandoBanner ? "Guardar cambios" : "Agregar banner"}</button>{" "}
              {editandoBanner && (
                <button type="button" className="boton boton-borde" onClick={() => { setEditandoBanner(null); setFormBanner(BANNER_VACIO); }}>
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
                <button className="enlace" onClick={() => { setEditandoBanner(b._id); setFormBanner({ ...BANNER_VACIO, ...b }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Editar</button>{" "}
                <button className="enlace peligro" onClick={() => borrarBanner(b._id)}>Eliminar</button>
              </p>
            </article>
          ))}
        </>
      )}

      {pestana === "ajustes" && ajustes && (
        <form onSubmit={guardarAjustes} className="form-admin">
          <h2>Ajustes de la tienda</h2>
          <label>Aviso de arriba (vacío = no se muestra)
            <input name="aviso" value={ajustes.aviso} onChange={cambiarAjuste} />
          </label>
          <label>Horarios
            <input name="horarios" value={ajustes.horarios} onChange={cambiarAjuste} />
          </label>
          <label>Medios de pago
            <input name="mediosPago" value={ajustes.mediosPago} onChange={cambiarAjuste} />
          </label>
          <label>Pedido mínimo (pesos, 0 = sin mínimo)
            <input name="pedidoMinimo" type="number" min="0" value={ajustes.pedidoMinimo} onChange={cambiarAjuste} />
          </label>
          <label>Domicilio
            <input name="domicilio" value={ajustes.domicilio} onChange={cambiarAjuste} />
          </label>
          <label>Zonas de domicilio
            <input name="zonas" value={ajustes.zonas} onChange={cambiarAjuste} />
          </label>
          <button className="boton">Guardar ajustes</button>
          {guardado && <p className="exito">{guardado}</p>}
        </form>
      )}

      {pestana === "mensajes" && (
        <div>
          {mensajes.length === 0 && <p>No hay mensajes todavía.</p>}
          {mensajes.map((m) => (
            <article key={m._id} className={m.leido ? "mensaje" : "mensaje nuevo"}>
              <strong>{m.nombre}</strong> · {m.email} {m.telefono && `· ${m.telefono}`}
              <small> · {new Date(m.createdAt).toLocaleString("es-CO")}</small>
              {m.asunto && <p><em>{m.asunto}</em></p>}
              <p>{m.mensaje}</p>
              {!m.leido && <button className="enlace" onClick={() => marcarLeido(m._id)}>Marcar como leído</button>}{" "}
              <button className="enlace peligro" onClick={() => borrarMensaje(m._id)}>Eliminar</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
