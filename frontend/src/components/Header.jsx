import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { NEGOCIO, CATEGORIAS, ICONOS } from "../config";

export default function Header({ config, tema, cambiarTema, cantidadCarrito, abrirCarrito, ir }) {
  const [busqueda, setBusqueda] = useState("");
  const [logoOk, setLogoOk] = useState(true);
  const irA = useNavigate();

  function buscar(e) {
    e.preventDefault();
    const texto = busqueda.trim();
    irA(texto ? `/catalogo?buscar=${encodeURIComponent(texto)}` : "/catalogo");
  }

  return (
    <header className="header">
      {config.aviso && <div className="aviso-superior">🚚 {config.aviso}</div>}

      <div className="contenedor header-fila">
        <Link to="/" className="logo">
          {/* si no existe public/img/logo.png se muestra solo el texto */}
          {logoOk && (
            <img
              src={`${import.meta.env.BASE_URL}img/logo.png`}
              alt=""
              className="logo-img"
              onError={() => setLogoOk(false)}
            />
          )}
          <span>{NEGOCIO.nombre}</span>
        </Link>

        <form className="busqueda" onSubmit={buscar}>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Encuentra todo lo que necesitas"
            aria-label="Buscar productos"
          />
          <button aria-label="Buscar">🔍</button>
        </form>

        <div className="header-botones">
          <button className="boton-icono" onClick={cambiarTema} aria-label="Cambiar modo claro u oscuro">
            {tema === "claro" ? "🌙" : "☀️"}
          </button>
          <button className="boton-icono" onClick={abrirCarrito} aria-label="Ver mi pedido">
            🧺
            {cantidadCarrito > 0 && <span className="globo">{cantidadCarrito}</span>}
          </button>
        </div>
      </div>

      <nav className="barra-categorias">
        <div className="contenedor barra-scroll">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/catalogo" end>Catálogo</NavLink>
          <button onClick={() => ir("/catalogo?ver=Ofertas", ICONOS.Ofertas, "Ofertas")}>
            {ICONOS.Ofertas} Ofertas
          </button>
          {CATEGORIAS.map((c) => (
            <button key={c} onClick={() => ir(`/catalogo?ver=${encodeURIComponent(c)}`, ICONOS[c], c)}>
              {ICONOS[c]} {c}
            </button>
          ))}
          <NavLink to="/contacto">Contacto</NavLink>
        </div>
      </nav>
    </header>
  );
}
