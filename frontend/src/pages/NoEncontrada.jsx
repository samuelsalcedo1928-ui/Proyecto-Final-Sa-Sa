import { Link } from "react-router-dom";

export default function NoEncontrada() {
  return (
    <section className="contenedor seccion centrado">
      <p className="error-codigo">404</p>
      <h1>No encontramos esta página</h1>
      <p>Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <div className="botones-fila">
        <Link to="/" className="boton">Ir al inicio</Link>
        <Link to="/catalogo" className="boton boton-borde">Ver catálogo</Link>
      </div>
    </section>
  );
}
