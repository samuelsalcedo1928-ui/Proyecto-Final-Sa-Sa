// Funciones del pedido que no tocan la base de datos (así se pueden probar solas).

const ESTADOS_QUE_DESCUENTAN = ["confirmado", "entregado"];

// "NV-0007"
const formatoTicket = (numero) => "NV-" + String(numero).padStart(4, "0");

// recibe lo que mandó el cliente y los productos reales de la base.
// Los precios se calculan AQUÍ con los de la base, nunca con los que manda el navegador.
// productos: objeto { idDelProducto: producto (ya con conOferta) }
const armarPedido = (recibidos, productos) => {
  if (!Array.isArray(recibidos) || recibidos.length === 0) {
    return { error: "Tu pedido está vacío." };
  }
  if (recibidos.length > 50) {
    return { error: "El pedido tiene demasiados productos." };
  }

  const items = [];
  let total = 0;

  for (const r of recibidos) {
    const p = productos[String(r.productoId)];
    const cantidad = Number(r.cantidad);
    const modo = r.modo === "unidad" ? "unidad" : "presentacion";
    // si el producto ya no existe usamos el nombre que mandó el carrito, solo para avisar cuál es
    const nombre = p ? p.nombre : String(r.nombre || "Un producto").slice(0, 60);

    if (!p || !p.disponible) {
      return { error: `"${nombre}" ya no está disponible. Quítalo del carrito para continuar.`, productoId: r.productoId };
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 999) {
      return { error: `La cantidad de "${nombre}" no es válida.`, productoId: r.productoId };
    }
    if (p.agotado) {
      return { error: `"${nombre}" está agotado. Quítalo del carrito para continuar.`, productoId: r.productoId };
    }
    if (modo === "unidad" && !(p.precioUnidad > 0)) {
      return { error: `"${nombre}" no se vende por unidad.`, productoId: r.productoId };
    }
    // el stock se cuenta en presentaciones
    if (modo === "presentacion" && p.stock !== null && p.stock !== undefined && cantidad > p.stock) {
      return { error: `De "${nombre}" solo quedan ${p.stock}.`, productoId: r.productoId };
    }

    const precioUnitario = modo === "unidad" ? p.precioUnidad : p.precioActual;
    const subtotal = precioUnitario * cantidad;
    total += subtotal;

    items.push({
      producto: p._id,
      nombre: p.nombre,
      modo,
      unidad: modo === "unidad" ? p.unidadSuelta : p.unidad,
      cantidad,
      precioUnitario,
      subtotal,
    });
  }

  return { items, total };
};

// al cambiar el estado: ¿hay que descontar el stock, devolverlo o no hacer nada?
const accionStock = (stockDescontado, nuevoEstado) => {
  const descuenta = ESTADOS_QUE_DESCUENTAN.includes(nuevoEstado);
  if (descuenta && !stockDescontado) return "descontar";
  if (!descuenta && stockDescontado) return "devolver";
  return null;
};

module.exports = { formatoTicket, armarPedido, accionStock };
