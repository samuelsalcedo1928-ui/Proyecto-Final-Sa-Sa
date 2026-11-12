import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NEGOCIO, SOBRE_POR_DEFECTO } from "../config";
import { pedir } from "../utils/api";
import { rutaImagen } from "../utils/imagen";
import { useCategorias } from "../utils/categorias";
import Aparecer from "../components/Aparecer";
import Contador from "../components/Contador";

// foto de una persona. Si no hay foto o no carga, sale un espacio vacío
function FotoPersona({ foto, nombre, grande }) {
  const [falla, setFalla] = useState(false);

  return (
    <div className={grande ? "foto-persona grande" : "foto-persona"}>
      {foto && !falla ? (
        <img src={rutaImagen(foto)} alt={nombre} onError={() => setFalla(true)} />
      ) : (
        <span>👤</span>
      )}
    </div>
  );
}

export default function Sobre() {
  const { categorias } = useCategorias();
  const [sobre, setSobre] = useState(SOBRE_POR_DEFECTO);

  // los textos los cambia el admin; si el servidor no responde se quedan los de por defecto
  useEffect(() => {
    pedir("/api/config")
      .then((c) => setSobre({ ...SOBRE_POR_DEFECTO, ...(c.sobre || {}) }))
      .catch(() => {});
  }, []);

  const parrafos = String(sobre.historia || "").split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <section className="sobre-portada">
        <div className="contenedor">
          <p className="etiqueta">Sobre nosotros</p>
          <h1>{sobre.titulo}</h1>
          <p className="sobre-lead">{sobre.intro}</p>
        </div>
      </section>

      {sobre.fachada && (
        <div className="contenedor">
          <img className="sobre-fachada" src={rutaImagen(sobre.fachada)} alt="Fachada de Abasto y Variedades Nueva Vida" />
        </div>
      )}

      <Aparecer>
        <section className="contenedor seccion cifras">
          <div>
            <strong><Contador hasta={Number(sobre.anios) || 0} /></strong>
            <span>años en el barrio</span>
          </div>
          <div>
            <strong><Contador hasta={categorias.length} /></strong>
            <span>categorías de productos</span>
          </div>
          <div>
            <strong><Contador hasta={7} /></strong>
            <span>días a la semana abiertos</span>
          </div>
        </section>
      </Aparecer>

      <Aparecer>
        <section className="contenedor seccion dos-columnas">
          <div>
            <h2>Nuestra historia</h2>
            {parrafos.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div>
            <h2>Nuestra misión</h2>
            <p>{sobre.mision}</p>
            <p>
              <Link to="/catalogo" className="boton">Ver catálogo</Link>
            </p>
          </div>
        </section>
      </Aparecer>

      {sobre.valores.length > 0 && (
        <section className="contenedor seccion">
          <Aparecer><h2>Lo que nos importa</h2></Aparecer>
          <div className="rejilla valores">
            {sobre.valores.map((v, i) => (
              <Aparecer key={i} retraso={i * 120}>
                <div className="valor">
                  <span className="valor-icono">{v.icono}</span>
                  <h3>{v.titulo}</h3>
                  <p>{v.texto}</p>
                </div>
              </Aparecer>
            ))}
          </div>
        </section>
      )}

      <Aparecer>
        <section className="contenedor seccion administrador">
          <FotoPersona foto={sobre.administradorFoto} nombre={sobre.administradorNombre} grande />
          <div>
            <p className="etiqueta">Quién administra la tienda</p>
            <h2>{sobre.administradorNombre}</h2>
            <p>{sobre.administradorTexto}</p>
          </div>
        </section>
      </Aparecer>

      {sobre.equipo.length > 0 && (
        <section className="contenedor seccion">
          <Aparecer><h2>Nuestro equipo</h2></Aparecer>
          <div className="rejilla equipo">
            {sobre.equipo.map((e, i) => (
              <Aparecer key={i} retraso={i * 120}>
                <div className="persona">
                  <FotoPersona foto={e.foto} nombre={e.nombre} />
                  <strong>{e.nombre}</strong>
                  <small>{e.cargo}</small>
                </div>
              </Aparecer>
            ))}
          </div>
        </section>
      )}

      <Aparecer>
        <section className="contenedor seccion">
          <h2>Visítanos</h2>
          <p>📍 {NEGOCIO.direccion} · {NEGOCIO.referencia}</p>
          <p>
            <Link to="/contacto" className="boton boton-borde">Cómo llegar y contacto</Link>
          </p>
        </section>
      </Aparecer>
    </>
  );
}
