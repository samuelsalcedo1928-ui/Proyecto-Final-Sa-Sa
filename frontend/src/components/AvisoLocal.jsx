import { useState } from "react";
import { Link } from "react-router-dom";

// aviso corto de que la página guarda cosas en el navegador (se muestra una vez)
export default function AvisoLocal() {
  const [visible, setVisible] = useState(() => {
    try {
      return !localStorage.getItem("aviso_local");
    } catch {
      return false;
    }
  });

  function entendido() {
    try {
      localStorage.setItem("aviso_local", "1");
    } catch {
      // si no se puede guardar, igual se cierra
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="aviso-local" role="dialog" aria-label="Aviso de privacidad">
      <p>
        Esta página guarda en tu navegador tu sesión, tu carrito y el modo claro u oscuro para funcionar.
        No usamos cookies de publicidad. <Link to="/privacidad">Más información</Link>
      </p>
      <button className="boton" onClick={entendido}>Entendido</button>
    </div>
  );
}
