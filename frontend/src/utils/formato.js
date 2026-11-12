import { WHATSAPP } from "../config";

// 80000 -> "$ 80.000"
export function formatearPrecio(numero) {
  return "$ " + Number(numero).toLocaleString("es-CO");
}

export function totalCarrito(carrito) {
  return carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

// "Cosas frías" -> "cosas-frias" (para las clases de CSS)
export function slug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-");
}

// 100000 -> 80000 da 20 (%)
export function porcentajeDescuento(precio, oferta) {
  return Math.round(((precio - oferta) / precio) * 100);
}

export function fechaCorta(iso) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

// "9 de noviembre de 2026, 3:45 p. m."
export function fechaLarga(iso) {
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });
}

// texto que le llega a la tienda por WhatsApp (el pedido ya viene del servidor con su ticket)
export function armarMensajePedido(pedido, nombre, barrio, correo) {
  let texto = `Hola, hice el pedido ${pedido.ticket} en la página:\n\n`;

  pedido.items.forEach((item) => {
    texto += `- ${item.cantidad} x ${item.nombre} (${item.unidad}) = ${formatearPrecio(item.subtotal)}\n`;
  });

  texto += `\nTotal: ${formatearPrecio(pedido.total)}\n`;
  texto += "Quiero coordinar el lugar, la fecha y la hora de la entrega.\n";
  if (nombre) texto += `\nNombre: ${nombre}`;
  if (barrio) texto += `\nBarrio: ${barrio}`;
  if (correo) texto += `\nCuenta: ${correo}`;

  return texto;
}

export function mensajeReclamo(pedido, correo) {
  return `Hola, quiero hacer un reclamo del pedido ${pedido.ticket}.\nCuenta: ${correo}\n\nMi reclamo es: `;
}

// encodeURIComponent convierte espacios y saltos de línea para que quepan en el link
export function linkWhatsApp(texto = "Hola, quiero información.") {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}
