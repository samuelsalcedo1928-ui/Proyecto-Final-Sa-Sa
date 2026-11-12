import { useState } from "react";
import { formatearPrecio, porcentajeDescuento, fechaCorta } from "../utils/formato";
import { rutaImagen } from "../utils/imagen";
import { useCategorias } from "../utils/categorias";

export default function TarjetaProducto({ producto, agregar }) {
  const { icono } = useCategorias();
  // la persona elige comprar la presentación (paca, bulto...) o una sola unidad
  const [modo, setModo] = useState("presentacion");

  const foto = rutaImagen(producto.imagen);
  const sePuedeSuelto = producto.precioUnidad > 0;
  const esUnidad = modo === "unidad" && sePuedeSuelto;
  const hayOferta = !esUnidad && producto.enOferta;

  const etiqueta = esUnidad ? producto.unidadSuelta : producto.unidad;
  const precio = esUnidad ? producto.precioUnidad : (producto.precioActual ?? producto.precio);

  return (
    <article className="tarjeta">
      <div className="tarjeta-foto">
        {foto ? (
          <img src={foto} alt={producto.nombre} loading="lazy" />
        ) : (
          <span className="tarjeta-icono">{icono(producto.categoria)}</span>
        )}
        {hayOferta && (
          <span className="descuento">-{porcentajeDescuento(producto.precio, producto.precioOferta)}%</span>
        )}
        {hayOferta && producto.ofertaTipo === "caducidad" && <span className="por-vencer">Por vencer</span>}
        {producto.agotado && <span className="agotado">Agotado</span>}
      </div>

      <div className="tarjeta-cuerpo">
        <span className="etiqueta">{producto.categoria}</span>
        <h3>{producto.nombre}</h3>

        {sePuedeSuelto && (
          <div className="selector-modo">
            <button className={!esUnidad ? "activo" : ""} onClick={() => setModo("presentacion")}>
              {producto.unidad}
            </button>
            <button className={esUnidad ? "activo" : ""} onClick={() => setModo("unidad")}>
              {producto.unidadSuelta}
            </button>
          </div>
        )}

        <p className="unidad">Precio por {etiqueta.toLowerCase()}</p>
        {hayOferta && <p className="precio-viejo">{formatearPrecio(producto.precio)}</p>}
        <p className={hayOferta ? "precio precio-oferta" : "precio"}>{formatearPrecio(precio)}</p>
        {hayOferta && producto.ofertaHasta && (
          <p className="oferta-hasta">Oferta hasta el {fechaCorta(producto.ofertaHasta)}</p>
        )}

        <button className="boton" onClick={() => agregar(producto, modo)} disabled={producto.agotado}>
          {producto.agotado ? "Agotado" : "Agregar al pedido"}
        </button>
      </div>
    </article>
  );
}
