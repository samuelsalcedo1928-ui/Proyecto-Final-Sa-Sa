import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { pedir } from "../utils/api";
import { NEGOCIO } from "../config";
import { useCategorias } from "../utils/categorias";
import { slug, formatearPrecio, linkWhatsApp } from "../utils/formato";
import { rutaImagen } from "../utils/imagen";
import Carrusel from "../components/Carrusel";
import FilaProductos from "../components/FilaProductos";
import Aparecer from "../components/Aparecer";
import Marquesina from "../components/Marquesina";

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
  "Crea tu cuenta gratis con tu correo (solo la primera vez).",
  "Abre tu pedido, revisa las cantidades y pulsa «Pedir por WhatsApp». Recibes un número de ticket.",
  "Por WhatsApp coordinan el lugar, la fecha y la hora de la entrega.",
];

export default function Inicio({ agregar, ir, config }) {
  const { categorias } = useCategorias();
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

      <Marquesina
        frases={[
          `🚚 ${config.domicilio}`,
          `📦 Pedido mínimo ${formatearPrecio(config.pedidoMinimo)}`,
          `💳 ${config.mediosPago}`,
          "🛒 Bultos, pacas y cajas",
          "📍 El Pozón, Cartagena",
        ]}
      />

      <Aparecer>
        <section className="contenedor beneficios">
          <div>🚚 <strong>{config.domicilio}</strong></div>
          <div>📦 Pedido mínimo <strong>{formatearPrecio(config.pedidoMinimo)}</strong></div>
          <div>💳 <strong>{config.mediosPago}</strong></div>
        </section>
      </Aparecer>

      <section className="contenedor seccion">
        <Aparecer>
          <h2>Encuentra todo fácilmente</h2>
          <p className="nota">Obtén todo lo que necesitas en un solo lugar</p>
        </Aparecer>
        <div className="rejilla categorias">
          {categorias.map((c, i) => (
            <Aparecer key={c._id} retraso={i * 100}>
              <button
                className={`categoria cat-${slug(c.nombre)}`}
                onClick={() => ir(`/catalogo?ver=${encodeURIComponent(c.nombre)}`, c.icono, c.nombre)}
              >
                {c.imagen ? (
                  <img className="categoria-foto" src={rutaImagen(c.imagen)} alt="" />
                ) : (
                  <span className="categoria-icono">{c.icono}</span>
                )}
                {c.nombre}
              </button>
            </Aparecer>
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

      <Aparecer>
        <section className="contenedor seccion">
          <h2>¿Cómo pedir?</h2>
          <ol className="pasos">
            {PASOS.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </section>
      </Aparecer>

      <Aparecer>
        <section className="contenedor seccion">
          <h2>Visítanos</h2>
          <p>📍 {NEGOCIO.direccion} · {NEGOCIO.referencia}</p>
          <p>🕒 {config.horarios}</p>
          <p>📞 {NEGOCIO.telefono}</p>
          <Link to="/contacto" className="boton">Cómo llegar y contacto</Link>{" "}
          <Link to="/sobre" className="boton boton-borde">Conócenos</Link>{" "}
          <a className="boton boton-borde" href={linkWhatsApp()} target="_blank" rel="noreferrer">WhatsApp</a>
        </section>
      </Aparecer>
    </>
  );
}
