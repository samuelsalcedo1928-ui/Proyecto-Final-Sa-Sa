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

// texto que le llega a la tienda por WhatsApp
export function armarMensajePedido(carrito, nombre, barrio) {
  let texto = "Hola, quiero hacer este pedido:\n\n";

  carrito.forEach((item) => {
    texto += `- ${item.cantidad} x ${item.nombre} (${item.unidad}) = ${formatearPrecio(item.precio * item.cantidad)}\n`;
  });

  texto += `\nTotal estimado: ${formatearPrecio(totalCarrito(carrito))}\n`;
  texto += "(los precios y el domicilio los confirma la tienda)\n";
  if (nombre) texto += `\nNombre: ${nombre}`;
  if (barrio) texto += `\nBarrio: ${barrio}`;

  return texto;
}

// encodeURIComponent convierte espacios y saltos de línea para que quepan en el link
export function linkWhatsApp(texto = "Hola, quiero información.") {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}
