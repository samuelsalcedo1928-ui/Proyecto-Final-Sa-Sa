import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { pedir } from "../utils/api";
import { CATEGORIAS, ICONOS, NEGOCIO } from "../config";
import { slug, formatearPrecio, linkWhatsApp } from "../utils/formato";
import Carrusel from "../components/Carrusel";
import FilaProductos from "../components/FilaProductos";

// se muestra si el admin todavía no creó ningún banner
const SLIDE_POR_DEFECTO = {
  titulo: "Surtido al por mayor para tu negocio y tu hogar",
  subtitulo: "Bultos, pacas y cajas de comida, aseo y variedades, directo desde El Pozón, Cartagena.",
  imagen: "portada.jpg",
  ver: "",
  textoBoton: "Ver catálogo",
};

const PASOS = [
  "Entra al catálogo y agrega lo que necesitas (por paca o por unidad).",
  "Abre tu pedido y revisa las cantidades.",
  "Pulsa «Pedir por WhatsApp».",
  "La tienda te confirma precios y coordina el domicilio.",
];

export default function Inicio({ agregar, ir, config }) {
  const [productos, setProductos] = useState([]);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    pedir("/api/productos").then(setProductos).catch(() => {});
    pedir("/api/banners").then(setBanners).catch(() => {});
  }, []);

  const slides = banners.length > 0 ? banners : [SLIDE_POR_DEFECTO];

  return (
    <>
      <Carrusel slides={slides} ir={ir} />

      <section className="contenedor beneficios">
        <div>🚚 <strong>{config.domicilio}</strong></div>
        <div>📦 Pedido mínimo <strong>{formatearPrecio(config.pedidoMinimo)}</strong></div>
        <div>💳 <strong>{config.mediosPago}</strong></div>
      </section>

      <section className="contenedor seccion">
        <h2>Encuentra todo fácilmente</h2>
        <p className="nota">Obtén todo lo que necesitas en un solo lugar</p>
        <div className="rejilla categorias">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              className={`categoria cat-${slug(c)}`}
              onClick={() => ir(`/catalogo?ver=${encodeURIComponent(c)}`, ICONOS[c], c)}
            >
              <span className="categoria-icono">{ICONOS[c]}</span>
              {c}
            </button>
          ))}
        </div>
      </section>

      <FilaProductos
        titulo="🏷️ Ofertas de la semana"
        ver="Ofertas"
        productos={productos.filter((p) => p.enOferta && p.ofertaTipo !== "caducidad")}
        agregar={agregar}
      />
      <FilaProductos
        titulo="⏳ Próximos a vencer, precio especial"
        ver="Ofertas"
        productos={productos.filter((p) => p.enOferta && p.ofertaTipo === "caducidad")}
        agregar={agregar}
      />
      <FilaProductos
        titulo="🔥 Lo más vendido"
        ver="Más vendidos"
        productos={productos.filter((p) => p.masVendido)}
        agregar={agregar}
      />
      <FilaProductos
        titulo="⭐ Recomendados"
        ver="Recomendados"
        productos={productos.filter((p) => p.destacado)}
        agregar={agregar}
      />

      <section className="contenedor seccion">
        <h2>¿Cómo pedir?</h2>
        <ol className="pasos">
          {PASOS.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
      </section>

      <section className="contenedor seccion">
        <h2>Visítanos</h2>
        <p>📍 {NEGOCIO.direccion} · {NEGOCIO.referencia}</p>
        <p>🕒 {config.horarios}</p>
        <p>📞 {NEGOCIO.telefono}</p>
        <Link to="/contacto" className="boton">Cómo llegar y contacto</Link>{" "}
        <a className="boton boton-borde" href={linkWhatsApp()} target="_blank" rel="noreferrer">WhatsApp</a>
      </section>
    </>
  );
}
