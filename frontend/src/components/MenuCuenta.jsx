import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// el botón "Mi cuenta" del encabezado: abre un mini menú
export default function MenuCuenta({ cliente, tema, cambiarTema, cerrarSesion }) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);

  // se cierra al tocar fuera del menú o al apretar Escape
  useEffect(() => {
    if (!abierto) return;
    function fuera(e) {
      if (caja.current && !caja.current.contains(e.target)) setAbierto(false);
    }
    function tecla(e) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  function salir(mensaje) {
    setAbierto(false);
    if (window.confirm(mensaje)) cerrarSesion();
  }

  return (
    <div className="menu-cuenta" ref={caja}>
      <button
        className="boton-icono boton-cuenta"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-label="Menú de mi cuenta"
      >
        👤<span className="solo-grande">{cliente ? " Mi cuenta" : " Entrar"}</span>
      </button>

      {abierto && (
        <div className="menu-cuenta-lista" role="menu">
          {cliente && (
            <div className="menu-cuenta-datos">
              <strong>{cliente.nombre || "Mi cuenta"}</strong>
              <small>{cliente.email}</small>
            </div>
          )}

          {cliente ? (
            <Link to="/cuenta" onClick={() => setAbierto(false)}>📦 Mis pedidos</Link>
          ) : (
            <Link to="/cuenta" onClick={() => setAbierto(false)}>🔑 Entrar o crear cuenta</Link>
          )}

          <button onClick={() => { cambiarTema(); setAbierto(false); }}>
            {tema === "claro" ? "🌙 Modo oscuro" : "☀️ Modo claro"}
          </button>

          {cliente && (
            <>
              <button onClick={() => salir("¿Quieres cambiar de cuenta? Se cerrará la sesión actual.")}>🔁 Cambiar de cuenta</button>
              <button onClick={() => salir("¿Seguro que quieres cerrar la sesión?")}>🚪 Cerrar sesión</button>
            </>
          )}

        </div>
      )}
    </div>
  );
}
