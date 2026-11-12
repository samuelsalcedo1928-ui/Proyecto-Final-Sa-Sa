import { Link } from "react-router-dom";
import TarjetaProducto from "./TarjetaProducto";
import Aparecer from "./Aparecer";

// una fila de productos que se desliza hacia el lado (como en los supermercados en línea)
export default function FilaProductos({ titulo, ver, productos, agregar }) {
  if (productos.length === 0) return null;

  return (
    <Aparecer>
      <section className="contenedor seccion fila">
        <div className="fila-titulo">
          <h2>{titulo}</h2>
          <Link to={`/catalogo?ver=${encodeURIComponent(ver)}`}>Ver todo</Link>
        </div>
        <div className="fila-scroll">
          {productos.map((p) => (
            <TarjetaProducto key={p._id} producto={p} agregar={agregar} />
          ))}
        </div>
      </section>
    </Aparecer>
  );
}
