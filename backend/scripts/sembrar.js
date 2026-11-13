
require("dotenv").config();
const mongoose = require("mongoose");
const Producto = require("../src/models/producto");
const Banner = require("../src/models/banner");
const Categoria = require("../src/models/categoria");
const Config = require("../src/models/config");

// fecha dentro de N días
const enDias = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const ejemplos = [
  { nombre: "Arroz (bolsa de 500 g)", categoria: "Comida", unidad: "Paca", precio: 80000, precioUnidad: 3800, masVendido: true, destacado: true },
  { nombre: "Aceite de litro", categoria: "Comida", unidad: "Caja", precio: 150000, precioUnidad: 13500, masVendido: true },
  { nombre: "Harina de trigo", categoria: "Comida", unidad: "Bulto", precio: 120000, precioUnidad: 5200, precioOferta: 110000, ofertaTipo: "oferta", ofertaHasta: enDias(7) },
  { nombre: "Galletas surtidas", categoria: "Comida", unidad: "Caja", precio: 45000, precioUnidad: 2200, precioOferta: 30000, ofertaTipo: "caducidad", ofertaHasta: enDias(15) },
  { nombre: "Gaseosa", categoria: "Cosas frías", unidad: "Paca", precio: 35000, precioUnidad: 3000, masVendido: true, precioOferta: 32000, ofertaTipo: "oferta", ofertaHasta: enDias(5) },
  { nombre: "Agua en bolsa", categoria: "Cosas frías", unidad: "Paca", precio: 12000, precioUnidad: 700, destacado: true },
  { nombre: "Escoba", categoria: "Aseo", unidad: "Docena", precio: 60000, precioUnidad: 6000, destacado: true },
  { nombre: "Trapero", categoria: "Aseo", unidad: "Docena", precio: 70000, precioUnidad: 7000 },
  { nombre: "Desinfectante", categoria: "Aseo", unidad: "Caja", precio: 90000, precioUnidad: 8500, masVendido: true },
  { nombre: "Pala recogedora", categoria: "Aseo", unidad: "Docena", precio: 40000, precioUnidad: 4000 },
  { nombre: "Peines", categoria: "Variedades", unidad: "Docena", precio: 15000, precioUnidad: 1500 },
  { nombre: "Crema para el cuerpo", categoria: "Variedades", unidad: "Docena", precio: 50000, precioUnidad: 5000, destacado: true },
].map((p) => ({ ...p, descripcion: "Precio de ejemplo" }));

// algunos con stock de prueba (los demás no controlan stock)
const stockEjemplo = { "Arroz (bolsa de 500 g)": 40, "Aceite de litro": 15, Gaseosa: 25, Escoba: 3 };
ejemplos.forEach((p) => {
  if (stockEjemplo[p.nombre] !== undefined) {
    p.stock = stockEjemplo[p.nombre];
    p.stockMinimo = 5;
  }
});

const banners = [
  { titulo: "Surtido al por mayor para tu negocio y tu hogar", subtitulo: "Bultos, pacas y cajas con domicilio sin costo", ver: "", textoBoton: "Ver catálogo", orden: 1 },
  { titulo: "Ofertas de la semana", subtitulo: "Precios especiales por tiempo limitado", ver: "Ofertas", textoBoton: "Ver ofertas", orden: 2 },
];

const sembrar = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  if (process.argv.includes("--reiniciar")) {
    await Producto.deleteMany({});
    await Banner.deleteMany({});
    console.log("Productos y banners borrados.");
  }

  if ((await Producto.countDocuments()) === 0) {
    await Producto.insertMany(ejemplos);
    console.log(`Productos de ejemplo: ${ejemplos.length}`);
  } else {
    console.log("Ya hay productos, no se agregó nada.");
  }

  if ((await Banner.countDocuments()) === 0) {
    await Banner.insertMany(banners);
    console.log(`Banners de ejemplo: ${banners.length}`);
  } else {
    console.log("Ya hay banners, no se agregó nada.");
  }

  await Categoria.asegurarBase();
  console.log("Categorías listas.");

  await Config.obtener(); // crea los ajustes con los valores por defecto si no existían
  console.log("Ajustes de la tienda listos.");

  await mongoose.disconnect();
};

sembrar().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
