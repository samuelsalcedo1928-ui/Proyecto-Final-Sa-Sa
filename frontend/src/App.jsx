import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Carrito from "./components/Carrito";
import ChatBot from "./components/ChatBot";
import BotonesFlotantes from "./components/BotonesFlotantes";

import Inicio from "./pages/Inicio";
import Catalogo from "./pages/Catalogo";
import Contacto from "./pages/Contacto";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";

import { pedir } from "./utils/api";
import { CONFIG_POR_DEFECTO } from "./config";

// lee algo guardado en el navegador; si falla devuelve el valor por defecto
function leerGuardado(clave, defecto) {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : defecto;
  } catch {
    return defecto;
  }
}

// todo vive dentro del HashRouter para poder usar useNavigate
function Contenido() {
  const [carrito, setCarrito] = useState(() => leerGuardado("carrito", []));
  const [tema, setTema] = useState(() => leerGuardado("tema", "claro"));
  const [config, setConfig] = useState(CONFIG_POR_DEFECTO);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [transicion, setTransicion] = useState(null);
  const irA = useNavigate();

  // los ajustes de la tienda los cambia el admin; si el backend no responde se quedan los de por defecto
  useEffect(() => {
    pedir("/api/config")
      .then(setConfig)
      .catch(() => {});
  }, []);

  // cada vez que cambia el carrito lo guardamos
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  // el tema se pone como atributo en <html>, el CSS hace el resto
  useEffect(() => {
    document.documentElement.setAttribute("data-tema", tema);
    localStorage.setItem("tema", JSON.stringify(tema));
  }, [tema]);

  // cambia de página mostrando un momento el dibujo de lo que se eligió
  function ir(ruta, icono, texto) {
    if (!icono) return irA(ruta);
    setTransicion({ icono, texto });
    setTimeout(() => {
      irA(ruta);
      window.scrollTo(0, 0);
    }, 550);
    setTimeout(() => setTransicion(null), 900);
  }

  // modo: "presentacion" (paca, bulto...) o "unidad" (una suelta, más cara)
  function agregar(producto, modo) {
    const esUnidad = modo === "unidad" && producto.precioUnidad > 0;
    const id = `${producto._id}-${esUnidad ? "unidad" : "presentacion"}`;

    setCarrito((actual) => {
      const existe = actual.find((i) => i.id === id);
      if (existe) {
        return actual.map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i));
      }
      return [
        ...actual,
        {
          id,
          nombre: producto.nombre,
          unidad: esUnidad ? producto.unidadSuelta : producto.unidad,
          precio: esUnidad ? producto.precioUnidad : (producto.precioActual ?? producto.precio),
          cantidad: 1,
        },
      ];
    });
  }

  function cambiarCantidad(id, cambio) {
    setCarrito((actual) =>
      actual
        .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + cambio } : i))
        .filter((i) => i.cantidad > 0),
    );
  }

  function quitar(id) {
    setCarrito((actual) => actual.filter((i) => i.id !== id));
  }

  const cantidadTotal = carrito.reduce((suma, i) => suma + i.cantidad, 0);

  return (
    <>
      <Header
        config={config}
        tema={tema}
        cambiarTema={() => setTema(tema === "claro" ? "oscuro" : "claro")}
        cantidadCarrito={cantidadTotal}
        abrirCarrito={() => setCarritoAbierto(true)}
        ir={ir}
      />

      <main>
        <Routes>
          <Route path="/" element={<Inicio agregar={agregar} ir={ir} config={config} />} />
          <Route path="/catalogo" element={<Catalogo agregar={agregar} ir={ir} />} />
          <Route path="/contacto" element={<Contacto config={config} />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="*" element={<Inicio agregar={agregar} ir={ir} config={config} />} />
        </Routes>
      </main>

      <Footer config={config} />

      <Carrito
        abierto={carritoAbierto}
        cerrar={() => setCarritoAbierto(false)}
        carrito={carrito}
        cambiarCantidad={cambiarCantidad}
        quitar={quitar}
        config={config}
      />

      <ChatBot abierto={chatAbierto} cerrar={() => setChatAbierto(false)} />
      <BotonesFlotantes abrirChat={() => setChatAbierto(true)} />

      {transicion && (
        <div className="transicion">
          <span className="transicion-icono">{transicion.icono}</span>
          <p>{transicion.texto}</p>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Contenido />
    </HashRouter>
  );
}
