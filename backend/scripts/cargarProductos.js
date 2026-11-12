// Uso: npm run productos
// Carga los productos reales de la tienda con sus fotos (están en frontend/public/img/productos).
// Los PRECIOS son de referencia (buscados en internet y redondeados): ajústalos en el panel.
// Si un producto ya existe (mismo nombre) no se toca, solo se le pone la foto si no tenía.
// Con "npm run productos -- --quitar-ejemplos" borra los productos de ejemplo del sembrar.
require("dotenv").config();
const mongoose = require("mongoose");
const Producto = require("../src/models/producto");
const Banner = require("../src/models/banner");
const Categoria = require("../src/models/categoria");

// precio = lo que cuesta la presentación al por mayor; precioUnidad = una sola unidad suelta
const productos = [
  { nombre: "Crispetas Diana Mini Pipa", etiquetas: "snack pasabocas merienda crispetas maiz salado".split(" "), categoria: "Comida", unidad: "Paca x 12", precio: 16500, precioUnidad: 1500, imagen: "productos/crispetas-diana.webp", destacado: true },
  { nombre: "Atún Sabor del Pacífico en agua", etiquetas: "atun enlatado pescado almuerzo".split(" "), categoria: "Comida", unidad: "Caja x 24", precio: 158000, precioUnidad: 7200, imagen: "productos/atun-sabor-del-pacifico.webp", descripcion: "Lomitos de atún en agua." },
  { nombre: "Atún Van Camp's en agua", etiquetas: "atun enlatado pescado almuerzo".split(" "), categoria: "Comida", unidad: "Caja x 24", precio: 192000, precioUnidad: 8700, imagen: "productos/atun-van-camps.webp", descripcion: "Lomitos de atún en agua.", destacado: true },
  { nombre: "Sardinas Peskar en salsa de tomate", etiquetas: "sardina enlatado pescado almuerzo".split(" "), categoria: "Comida", unidad: "Caja x 24", precio: 108000, precioUnidad: 4900, imagen: "productos/peskar-sardinas.webp", descripcion: "Lata de 210 g." },
  { nombre: "Agua Cristal 600 ml", etiquetas: "agua bebida sed hidratacion fria".split(" "), categoria: "Cosas frías", unidad: "Paca x 12", precio: 27500, precioUnidad: 2500, imagen: "productos/agua-cristal.webp", masVendido: true },
  { nombre: "Galletas Saltín Noel tradicional", etiquetas: "galleta galletas snack merienda salada pasabocas".split(" "), categoria: "Comida", unidad: "Paca x 12", precio: 26500, precioUnidad: 2400, imagen: "productos/saltin-noel.webp", descripcion: "Paquete de 102 g." },
  { nombre: "Harina PAN maíz blanco 1 kg", etiquetas: "harina arepa maiz desayuno cocinar".split(" "), categoria: "Comida", unidad: "Paca x 10", precio: 42000, precioUnidad: 4500, imagen: "productos/harina-pan.webp", masVendido: true },
  { nombre: "Aderezo de mostaza San Jorge", etiquetas: "salsa aderezo condimento perros hamburguesa".split(" "), categoria: "Comida", unidad: "Paca x 24", precio: 50000, precioUnidad: 2300, imagen: "productos/mostaza-san-jorge.webp", descripcion: "Doypack de 100 g." },
  { nombre: "Salsa para carnes La Constancia", etiquetas: "salsa aderezo condimento carne asado".split(" "), categoria: "Comida", unidad: "Paca x 24", precio: 57000, precioUnidad: 2600, imagen: "productos/salsa-carnes-la-constancia.webp" },
  { nombre: "Salsa de tomate La Constancia", etiquetas: "salsa aderezo tomate condimento".split(" "), categoria: "Comida", unidad: "Paca x 24", precio: 44000, precioUnidad: 2000, imagen: "productos/salsa-tomate-la-constancia.webp", descripcion: "Doypack de 120 g." },
  { nombre: "Galletas Festival vainilla", etiquetas: "galleta galletas dulce merienda snack postre".split(" "), categoria: "Comida", unidad: "Paca x 12", precio: 33000, precioUnidad: 3000, imagen: "productos/galletas-festival-vainilla.webp" },
  { nombre: "Salsa de tomate Bary", etiquetas: "salsa aderezo tomate condimento".split(" "), categoria: "Comida", unidad: "Paca x 24", precio: 44000, precioUnidad: 2000, imagen: "productos/salsa-tomate-bary.webp" },
  { nombre: "Salsa BBQ Bary", etiquetas: "salsa aderezo bbq condimento carne asado".split(" "), categoria: "Comida", unidad: "Paca x 24", precio: 57000, precioUnidad: 2600, imagen: "productos/salsa-bbq-bary.webp", descripcion: "Bolsa de 110 g." },
  { nombre: "Sal Refisal alta pureza 500 g", etiquetas: "sal condimento cocinar sazonar".split(" "), categoria: "Comida", unidad: "Paca x 24", precio: 48000, precioUnidad: 2200, imagen: "productos/sal-refisal.webp" },
  { nombre: "Harina de trigo Tres Castillos 50 kg", etiquetas: "harina trigo panaderia pan reposteria cocinar".split(" "), categoria: "Comida", unidad: "Bulto 50 kg", precio: 150000, precioUnidad: 3500, unidadSuelta: "Kilo", imagen: "productos/harina-castillos-50kg.webp" },
  { nombre: "Arroz Emperador 22,5 kg", etiquetas: "arroz grano almuerzo cocinar bulto".split(" "), categoria: "Comida", unidad: "Bulto 22,5 kg", precio: 80000, precioUnidad: 3900, unidadSuelta: "Kilo", imagen: "productos/arroz-emperador.webp", masVendido: true, destacado: true },
  { nombre: "Arroz Leopardo tipo gourmet", etiquetas: "arroz grano almuerzo cocinar".split(" "), categoria: "Comida", unidad: "Paca x 24", precio: 66000, precioUnidad: 3000, imagen: "productos/arroz-leopardo.webp" },
  { nombre: "Aceite Biosol 500 ml", etiquetas: "aceite cocinar freir".split(" "), categoria: "Comida", unidad: "Caja x 12", precio: 46500, precioUnidad: 4200, imagen: "productos/aceite-biosol.webp", descripcion: "Aceite vegetal de oleína de palma." },
  { nombre: "Aceite En su Punto y sabor 3000 ml", etiquetas: "aceite cocinar freir".split(" "), categoria: "Comida", unidad: "Caja x 4", precio: 104000, precioUnidad: 28000, imagen: "productos/aceite-en-su-punto.webp", masVendido: true },
  { nombre: "Aceite Diana VitAmor", etiquetas: "aceite cocinar freir".split(" "), categoria: "Comida", unidad: "Caja x 12", precio: 128000, precioUnidad: 11500, imagen: "productos/aceite-diana-vitamor.webp" },
  { nombre: "Alimento para gatos Don Kat adultos 7 kg", etiquetas: "gato mascota alimento concentrado".split(" "), categoria: "Variedades", unidad: "Bulto 7 kg", precio: 118000, imagen: "productos/don-kat.webp" },
  { nombre: "Espuma Divertida", etiquetas: "fiesta carnaval juego diversion cumpleanos".split(" "), categoria: "Variedades", unidad: "Docena", precio: 70000, precioUnidad: 6500, imagen: "productos/espuma-divertida.webp", destacado: true },
];

const cargar = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Categoria.asegurarBase();

  if (process.argv.includes("--quitar-ejemplos")) {
    const borrados = await Producto.deleteMany({ descripcion: "Precio de ejemplo" });
    console.log(`Productos de ejemplo borrados: ${borrados.deletedCount}`);
  }

  let nuevos = 0;
  for (const p of productos) {
    const existe = await Producto.findOne({ nombre: p.nombre });
    if (!existe) {
      await Producto.create(p);
      nuevos++;
    } else {
      // a los que ya existían solo se les completa la foto y las etiquetas si les faltaban
      // si todavía apuntaba a la foto png vieja, pasa a la webp
      if (!existe.imagen || /^productos\/.*\.png$/.test(existe.imagen)) existe.imagen = p.imagen;
      if (!existe.etiquetas || existe.etiquetas.length === 0) existe.etiquetas = p.etiquetas;
      await existe.save();
    }
  }
  console.log(`Productos nuevos: ${nuevos} (los que ya existían no se tocaron).`);

  // la fachada como imagen del primer banner que no tenga foto
  const banner = await Banner.findOne({ imagen: "" }).sort({ orden: 1 });
  if (banner) {
    banner.imagen = "fachada.jpg";
    await banner.save();
    console.log("Foto de la fachada puesta en el banner: " + banner.titulo);
  }

  await mongoose.disconnect();
};

cargar().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
