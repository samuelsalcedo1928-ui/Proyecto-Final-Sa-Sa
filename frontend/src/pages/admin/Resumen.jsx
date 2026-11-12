import { useState, useEffect } from "react";
import { formatearPrecio } from "../../utils/formato";

const NOMBRES_ESTADO = { nuevo: "Nuevos", confirmado: "Confirmados", entregado: "Entregados", cancelado: "Cancelados" };
const COLOR_ESTADO = { nuevo: "amarilla", confirmado: "", entregado: "", cancelado: "roja" };

// una fila de gráfico de barras hecha solo con CSS
function Barra({ nombre, valor, maximo, texto, color }) {
  const ancho = maximo > 0 ? Math.round((valor / maximo) * 100) : 0;
  return (
    <div className="barra-fila">
      <span>{nombre}</span>
      <div className="barra-pista">
        <div className={"barra-valor " + (color || "")} style={{ width: ancho + "%" }} />
      </div>
      <strong>{texto}</strong>
    </div>
  );
}

export default function Resumen({ llamar, alError }) {
  const [datos, setDatos] = useState(null);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    llamar("/api/resumen").then(setDatos).catch(alError);
    llamar("/api/productos?todos=1").then(setProductos).catch(alError);
  }, []);

  if (!datos) return <p>Cargando resumen…</p>;

  const maxVentas = Math.max(...datos.dias.map((d) => d.ventas), 0);
  const maxPedidos = Math.max(...datos.dias.map((d) => d.pedidos), 0);
  const maxEstado = Math.max(...Object.values(datos.porEstado), 0);
  const maxTop = Math.max(...datos.topProductos.map((t) => t.cantidad), 0);

  return (
    <>
      <div className="rejilla contadores">
        <div className="contador"><strong>{datos.porEstado.nuevo}</strong>Pedidos nuevos</div>
        <div className="contador"><strong>{datos.clientes}</strong>Clientes</div>
        <div className="contador"><strong>{datos.mensajesSinLeer}</strong>Mensajes sin leer</div>
        <div className="contador"><strong>{productos.filter((p) => p.disponible).length}</strong>Productos visibles</div>
        <div className="contador"><strong>{productos.filter((p) => p.enOferta).length}</strong>En oferta</div>
        <div className="contador"><strong>{datos.stockBajo.length}</strong>Con poco stock</div>
      </div>

      <h2>Ventas de los últimos 7 días</h2>
      <p className="nota">Solo cuentan los pedidos confirmados o entregados.</p>
      <div className="barras">
        {datos.dias.map((d) => (
          <Barra key={d.dia} nombre={d.dia.slice(5)} valor={d.ventas} maximo={maxVentas} texto={formatearPrecio(d.ventas)} />
        ))}
      </div>

      <h2>Pedidos por día</h2>
      <div className="barras">
        {datos.dias.map((d) => (
          <Barra key={d.dia} nombre={d.dia.slice(5)} valor={d.pedidos} maximo={maxPedidos} texto={String(d.pedidos)} color="amarilla" />
        ))}
      </div>

      <h2>Pedidos por estado</h2>
      <div className="barras">
        {Object.keys(NOMBRES_ESTADO).map((e) => (
          <Barra key={e} nombre={NOMBRES_ESTADO[e]} valor={datos.porEstado[e]} maximo={maxEstado} texto={String(datos.porEstado[e])} color={COLOR_ESTADO[e]} />
        ))}
      </div>

      <h2>Lo que más se pide</h2>
      {datos.topProductos.length === 0 && <p className="nota">Todavía no hay pedidos.</p>}
      <div className="barras">
        {datos.topProductos.map((t) => (
          <Barra key={t.nombre} nombre={t.nombre} valor={t.cantidad} maximo={maxTop} texto={t.cantidad + " pedidos"} />
        ))}
      </div>

      {datos.stockBajo.length > 0 && (
        <>
          <h2>Stock bajo</h2>
          <ul>
            {datos.stockBajo.map((p) => (
              <li key={p.id}>
                {p.nombre}: <span className="stock-bajo">{p.stock === 0 ? "agotado" : `quedan ${p.stock}`}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
