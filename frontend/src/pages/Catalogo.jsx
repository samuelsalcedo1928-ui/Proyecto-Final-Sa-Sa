import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { pedir } from "../utils/api";
import { FILTROS_FIJOS } from "../config";
import { useCategorias } from "../utils/categorias";
import TarjetaProducto from "../components/TarjetaProducto";
import AyudaCompra from "../components/AyudaCompra";

export default function Catalogo({ agregar, ir }) {
  const { categorias, icono } = useCategorias();
  const FILTROS = [...FILTROS_FIJOS, ...categorias.map((c) => c.nombre)];
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // lo que se está viendo y lo que se busca van en el link (?ver=Aseo&buscar=escoba)
  const [params, setParams] = useSearchParams();
  const ver = params.get("ver") || "Todas";
  const busqueda = params.get("buscar") || "";

  useEffect(() => {
    pedir("/api/productos")
      .then(setProductos)
      .catch(() => setError("No pudimos cargar el catálogo. Intenta de nuevo en un momento."))
      .finally(() => setCargando(false));
  }, []);

  function escribirBusqueda(texto) {
    const nuevos = {};
    if (ver !== "Todas") nuevos.ver = ver;
    if (texto) nuevos.buscar = texto;
    setParams(nuevos, { replace: true });
  }

  const visibles = productos.filter((p) => {
    const coincideTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase());

    let coincideVer = true;
    if (ver === "Ofertas") coincideVer = p.enOferta;
    else if (ver === "Más vendidos") coincideVer = p.masVendido;
    else if (ver === "Recomendados") coincideVer = p.destacado;
    else if (ver !== "Todas") coincideVer = p.categoria === ver;

    return coincideVer && coincideTexto;
  });

  return (
    <section className="contenedor seccion">
      <h1>Catálogo</h1>
      <p className="nota">Estos son los precios de la tienda. El lugar, la fecha y la hora de la entrega se coordinan por WhatsApp.</p>

      <AyudaCompra agregar={agregar} />

      <input
        className="buscador"
        placeholder="Buscar producto…"
        value={busqueda}
        onChange={(e) => escribirBusqueda(e.target.value)}
      />

      <div className="filtros">
        {FILTROS.map((f) => (
          <button
            key={f}
            className={f === ver ? "filtro activo" : "filtro"}
            onClick={() => ir(`/catalogo${f === "Todas" ? "" : `?ver=${encodeURIComponent(f)}`}`, icono(f), f)}
          >
            {icono(f)} {f}
          </button>
        ))}
      </div>

      {cargando && <p>Cargando productos… la primera vez puede tardar hasta un minuto.</p>}
      {error && <p className="aviso">{error}</p>}
      {!cargando && !error && visibles.length === 0 && <p>No hay productos para mostrar.</p>}

      <div className="rejilla productos" key={ver}>
        {visibles.map((p, i) => (
          <div key={p._id} className="entra" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
            <TarjetaProducto producto={p} agregar={agregar} />
          </div>
        ))}
      </div>
    </section>
  );
}
