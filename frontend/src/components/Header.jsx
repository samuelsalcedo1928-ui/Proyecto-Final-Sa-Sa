import { useState } from "react";
import { NavLink, Link, useNavigate, useSearchParams } from "react-router-dom";
import { NEGOCIO } from "../config";
import { useCategorias } from "../utils/categorias";
import { PESTANAS } from "../pages/admin/pestanas";
import Notificaciones from "./Notificaciones";
import MenuCuenta from "./MenuCuenta";
import AvisoRotativo from "./AvisoRotativo";
import { formatearPrecio } from "../utils/formato";

export default function Header({ config, tema, cambiarTema, cantidadCarrito, abrirCarrito, ir, cliente, admin, vistaCliente, verComoCliente, volverAlPanel, cerrarAdmin, cerrarSesion }) {
  const { categorias, icono } = useCategorias();
  const [busqueda, setBusqueda] = useState("");
  const [logoOk, setLogoOk] = useState(true);
  const irA = useNavigate();
  const [params] = useSearchParams();
  const pestanaActual = params.get("pestana") || "resumen";
  const enPanel = window.location.hash.startsWith("#/admin/panel");

  function salir() {
    if (window.confirm("¿Seguro que quieres cerrar la sesión de administrador?")) cerrarAdmin();
  }

  function buscar(e) {
    e.preventDefault();
    const texto = busqueda.trim();
    irA(texto ? `/catalogo?buscar=${encodeURIComponent(texto)}` : "/catalogo");
  }

  // mensajes que van cambiando en la franja amarilla (el primero lo edita el admin en Ajustes)
  const frasesAviso = [
    `🚚 ${config.aviso}`,
    `📦 Pedido mínimo ${formatearPrecio(config.pedidoMinimo)}`,
    `💳 ${config.mediosPago}`,
    "🛒 Vendemos por bultos, pacas y cajas",
    "📍 El Pozón, Cartagena",
  ];

  // con la sesión de administrador el menú cambia: no hay carrito ni categorías, hay opciones del panel
  // (salvo que esté mirando la tienda como cliente)
  if (admin && !vistaCliente) {
    return (
      <header className="header">
        <div className="contenedor header-fila">
          <Link to="/admin/panel" className="logo">
            {logoOk && (
              <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="logo-img" onError={() => setLogoOk(false)} />
            )}
            <span>{NEGOCIO.nombre}</span>
          </Link>
          <span className="modo-admin">Modo administrador</span>

          <div className="header-botones">
            <button className="boton-icono boton-texto" onClick={verComoCliente}>
              👁️<span className="solo-grande"> Ver como cliente</span>
            </button>
            <Notificaciones ir={irA} />
            <button className="boton-icono" onClick={cambiarTema} aria-label="Cambiar modo claro u oscuro">
              {tema === "claro" ? "🌙" : "☀️"}
            </button>
            <button className="boton-icono boton-texto" onClick={salir}>
              Salir<span className="solo-grande"> de la sesión</span>
            </button>
          </div>
        </div>

        <nav className="barra-categorias">
          <div className="contenedor barra-scroll">
            {PESTANAS.map(([clave, nombre]) => (
              <button
                key={clave}
                className={enPanel && pestanaActual === clave ? "activa" : ""}
                onClick={() => irA(`/admin/panel?pestana=${clave}`)}
              >
                {nombre}
              </button>
            ))}
            <NavLink to="/catalogo">Ver la tienda</NavLink>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="header">
      {admin && (
        <div className="vista-cliente-barra">
          <span>👁️ Estás viendo la tienda como la ve un cliente</span>
          <button onClick={volverAlPanel}>Volver al panel</button>
        </div>
      )}
      {config.aviso && <AvisoRotativo frases={frasesAviso} />}

      <div className="contenedor header-fila">
        <Link to="/" className="logo">
          {logoOk && (
            <img
              src={`${import.meta.env.BASE_URL}favicon.svg`}
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
          <MenuCuenta cliente={cliente} tema={tema} cambiarTema={cambiarTema} cerrarSesion={cerrarSesion} />
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
          <button onClick={() => ir("/catalogo?ver=Ofertas", icono("Ofertas"), "Ofertas")}>
            {icono("Ofertas")} Ofertas
          </button>
          {categorias.map((c) => (
            <button key={c._id} onClick={() => ir(`/catalogo?ver=${encodeURIComponent(c.nombre)}`, c.icono, c.nombre)}>
              {c.icono} {c.nombre}
            </button>
          ))}
          <NavLink to="/sobre">Nosotros</NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
        </div>
      </nav>
    </header>
  );
}