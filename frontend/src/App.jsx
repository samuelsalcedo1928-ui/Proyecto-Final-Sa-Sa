import { useState, useEffect, useRef } from "react";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Carrito from "./components/Carrito";
import BotonesFlotantes from "./components/BotonesFlotantes";
import VolverArriba from "./components/VolverArriba";
import AvisoLocal from "./components/AvisoLocal";

import Inicio from "./pages/Inicio";
import Catalogo from "./pages/Catalogo";
import Contacto from "./pages/Contacto";
import Sobre from "./pages/Sobre";
import Legal from "./pages/Legal";
import Cuenta from "./pages/Cuenta";
import MisPedidos from "./pages/MisPedidos";
import Gracias from "./pages/Gracias";
import NoEncontrada from "./pages/NoEncontrada";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";

import { pedir } from "./utils/api";
import { CONFIG_POR_DEFECTO, NEGOCIO } from "./config";
import { CategoriasContexto } from "./utils/categorias";
import { iniciarContador, contarPagina } from "./utils/contador";

// si el backend todavía no tiene las categorías (o no responde) se usan estas cuatro para que el menú no quede vacío
const CATEGORIAS_BASE = [
  { _id: "base1", nombre: "Comida", icono: "🌾" },
  { _id: "base2", nombre: "Aseo", icono: "🧹" },
  { _id: "base3", nombre: "Variedades", icono: "🧴" },
  { _id: "base4", nombre: "Cosas frías", icono: "🥤" },
];

// título de la pestaña según la página
const TITULOS = {
  "/": "Inicio",
  "/catalogo": "Catálogo",
  "/contacto": "Contacto",
  "/sobre": "Sobre nosotros",
  "/privacidad": "Política de privacidad",
  "/terminos": "Términos y condiciones",
  "/reclamos": "Reclamos",
  "/gracias": "¡Gracias por tu pedido!",
};

// lee algo guardado en el navegador; si falla devuelve el valor por defecto
function leerGuardado(clave, defecto) {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : defecto;
  } catch {
    return defecto;
  }
}

// junta dos carritos sumando las cantidades de lo que se repite
function unirCarritos(a, b) {
  const resultado = [...a];
  b.forEach((item) => {
    const existe = resultado.find((i) => i.id === item.id);
    if (existe) {
      existe.cantidad = existe.cantidad + item.cantidad;
    } else {
      resultado.push({ ...item });
    }
  });
  return resultado;
}

// arma una línea del carrito a partir de un producto
function crearItem(producto, modo, cantidad) {
  const esUnidad = modo === "unidad" && producto.precioUnidad > 0;
  return {
    id: `${producto._id}-${esUnidad ? "unidad" : "presentacion"}`,
    productoId: producto._id,
    modo: esUnidad ? "unidad" : "presentacion",
    nombre: producto.nombre,
    unidad: esUnidad ? producto.unidadSuelta : producto.unidad,
    precio: esUnidad ? producto.precioUnidad : (producto.precioActual ?? producto.precio),
    cantidad,
  };
}

// todo vive dentro del HashRouter para poder usar useNavigate
function Contenido() {
  // un carrito por cliente; el que no ha entrado usa "invitado"
  const [carritos, setCarritos] = useState(() =>
    leerGuardado("carritos", { invitado: leerGuardado("carrito", []) }),
  );
  const [cliente, setCliente] = useState(() =>
    localStorage.getItem("token_cliente") ? leerGuardado("cliente", null) : null,
  );
  const [tema, setTema] = useState(() => leerGuardado("tema", "claro"));
  const [config, setConfig] = useState(CONFIG_POR_DEFECTO);
  // categorías que crea el admin (el menú, el inicio y el catálogo las usan)
  const [categorias, setCategorias] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [transicion, setTransicion] = useState(null);
  const [aviso, setAviso] = useState("");
  // true cuando hay sesión de administrador (el menú de arriba cambia)
  const [admin, setAdmin] = useState(!!localStorage.getItem("token_admin"));
  // true cuando el admin está mirando la tienda como la vería un cliente
  const [vistaCliente, setVistaCliente] = useState(false);
  // el carrito del servidor ya se trajo y ya se puede guardar
  const [carritoListo, setCarritoListo] = useState(false);
  const unirAlTraer = useRef(false);
  const irA = useNavigate();
  const lugar = useLocation();

  const clave = cliente ? cliente.id : "invitado";
  const carrito = carritos[clave] || [];

  // los ajustes de la tienda los cambia el admin; si el backend no responde se quedan los de por defecto
  useEffect(() => {
    pedir("/api/config")
      .then(setConfig)
      .catch(() => {});
  }, []);

  function cargarCategorias() {
    pedir("/api/categorias")
      .then((lista) => setCategorias(lista.length > 0 ? lista : CATEGORIAS_BASE))
      .catch(() => setCategorias(CATEGORIAS_BASE));
  }

  useEffect(() => {
    cargarCategorias();
    iniciarContador();
  }, []);

  // cada vez que cambian los carritos los guardamos
  useEffect(() => {
    localStorage.setItem("carritos", JSON.stringify(carritos));
  }, [carritos]);

  // al cambiar de página (no de filtro o búsqueda) volvemos arriba
  // ojo: los links del router no disparan "hashchange", por eso se mira la ruta con useLocation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lugar.pathname]);

  // título de la pestaña distinto en cada página, y conteo de visitas (GoatCounter)
  useEffect(() => {
    const ruta = lugar.pathname;
    let titulo = TITULOS[ruta];
    if (ruta === "/cuenta") titulo = cliente ? "Mis pedidos" : "Mi cuenta";
    else if (ruta.startsWith("/admin")) titulo = "Administración";
    else if (!titulo) titulo = "Página no encontrada";
    document.title = `${titulo} | ${NEGOCIO.nombre}`;
    contarPagina(ruta);
  }, [lugar.pathname]);

  // si el admin entra a una página de administración, sale de la vista de cliente
  useEffect(() => {
    if (lugar.pathname.startsWith("/admin")) setVistaCliente(false);
  }, [lugar.pathname]);

  // si el token de admin ya venció, se cierra la sesión sin hacer ruido
  useEffect(() => {
    if (!admin) return;
    pedir("/api/auth/me", { rol: "admin" }).catch((e) => {
      if (e.estado === 401) {
        localStorage.removeItem("token_admin");
        setAdmin(false);
      }
    });
  }, []);

  // con sesión de cliente traemos su carrito guardado en el servidor (así lo ve desde cualquier dispositivo)
  useEffect(() => {
    if (!cliente) {
      setCarritoListo(false);
      return;
    }
    let cancelado = false;

    async function traer() {
      try {
        const guardado = await pedir("/api/clientes/carrito", { rol: "cliente" });
        if (guardado.length > 0 || unirAlTraer.current) {
          const productos = guardado.length > 0 ? await pedir("/api/productos") : [];
          const items = [];
          guardado.forEach((g) => {
            const p = productos.find((x) => x._id === g.productoId);
            if (p && !p.agotado) items.push(crearItem(p, g.modo, g.cantidad));
          });
          if (!cancelado) {
            // si venía de agregar cosas sin cuenta, se juntan; si no, manda lo del servidor
            const juntar = unirAlTraer.current;
            setCarritos((a) => ({ ...a, [cliente.id]: juntar ? unirCarritos(items, a[cliente.id] || []) : items }));
          }
        } else if (!cancelado) {
          setCarritos((a) => ({ ...a, [cliente.id]: [] }));
        }
        unirAlTraer.current = false;
      } catch (e) {
        if (e.estado === 401 || e.estado === 403) cerrarSesion();
      } finally {
        if (!cancelado) setCarritoListo(true);
      }
    }

    traer();
    return () => {
      cancelado = true;
    };
  }, [cliente && cliente.id]);

  // y cada vez que cambia el carrito del cliente lo guardamos en el servidor (con una pausa corta)
  useEffect(() => {
    if (!cliente || !carritoListo) return;
    const espera = setTimeout(() => {
      pedir("/api/clientes/carrito", {
        method: "PUT",
        rol: "cliente",
        body: { items: carrito.map((i) => ({ productoId: i.productoId, modo: i.modo, cantidad: i.cantidad })) },
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(espera);
  }, [carritos, carritoListo]);

  // mensajito que se quita solo
  useEffect(() => {
    if (!aviso) return;
    const reloj = setTimeout(() => setAviso(""), 2500);
    return () => clearTimeout(reloj);
  }, [aviso]);

  // el tema se pone como atributo en <html>, el CSS hace el resto
  useEffect(() => {
    document.documentElement.setAttribute("data-tema", tema);
    localStorage.setItem("tema", JSON.stringify(tema));
  }, [tema]);

  // cambia el carrito de la persona que está usando la página
  function ponerCarrito(cambio) {
    setCarritos((actuales) => ({ ...actuales, [clave]: cambio(actuales[clave] || []) }));
  }

  // ---------- sesión ----------
  function iniciarSesion(token, datos) {
    localStorage.setItem("token_cliente", token);
    localStorage.setItem("cliente", JSON.stringify(datos));
    setCliente(datos);

    // lo que había agregado sin cuenta pasa al carrito de su cuenta
    const habia = (carritos.invitado || []).length > 0;
    unirAlTraer.current = habia;
    setCarritos((actuales) => ({
      ...actuales,
      invitado: [],
      [datos.id]: unirCarritos(actuales[datos.id] || [], actuales.invitado || []),
    }));

    irA("/catalogo");
    if (habia) setCarritoAbierto(true);
  }

  function cerrarSesion() {
    localStorage.removeItem("token_cliente");
    localStorage.removeItem("cliente");
    setCliente(null);
    irA("/cuenta");
  }

  function iniciarAdmin(token) {
    // no puede haber dos sesiones a la vez: si había un cliente, se cierra
    localStorage.removeItem("token_cliente");
    localStorage.removeItem("cliente");
    setCliente(null);
    localStorage.setItem("token_admin", token);
    setAdmin(true);
    irA("/admin/panel");
  }

  function verComoCliente() {
    setVistaCliente(true);
    irA("/");
  }

  function volverAlPanel() {
    setVistaCliente(false);
    irA("/admin/panel");
  }

  function cerrarAdmin() {
    localStorage.removeItem("token_admin");
    setAdmin(false);
    setVistaCliente(false);
    irA("/admin");
  }

  function guardarCliente(datos) {
    localStorage.setItem("cliente", JSON.stringify(datos));
    setCliente(datos);
  }

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
    // el administrador no hace pedidos
    if (admin) {
      return setAviso(vistaCliente ? "Vista de cliente: aquí no se hacen pedidos." : "Estás como administrador: aquí no se hacen pedidos.");
    }

    const nuevo = crearItem(producto, modo, 1);

    ponerCarrito((actual) => {
      const existe = actual.find((i) => i.id === nuevo.id);
      if (existe) {
        return actual.map((i) => (i.id === nuevo.id ? { ...i, cantidad: i.cantidad + 1 } : i));
      }
      return [...actual, nuevo];
    });
    setAviso(`Agregado: ${producto.nombre}`);
  }

  function cambiarCantidad(id, cambio) {
    ponerCarrito((actual) =>
      actual
        .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + cambio } : i))
        .filter((i) => i.cantidad > 0),
    );
  }

  function quitar(id) {
    ponerCarrito((actual) => actual.filter((i) => i.id !== id));
  }

  function vaciar() {
    ponerCarrito(() => []);
  }

  const cantidadTotal = carrito.reduce((suma, i) => suma + i.cantidad, 0);

  // si alguien con cuenta entra a /cuenta ve su historial; si no, la pantalla para entrar
  const paginaCuenta = admin ? (
    <section className="contenedor seccion">
      <h1>Estás en modo administrador</h1>
      <p>No se puede tener una cuenta de cliente y la de administrador al mismo tiempo. Para entrar como cliente, primero cierra la sesión de administrador.</p>
      <button className="boton" onClick={() => irA("/admin/panel")}>Volver al panel</button>
    </section>
  ) : cliente ? (
    <MisPedidos cliente={cliente} cerrarSesion={cerrarSesion} guardarCliente={guardarCliente} />
  ) : (
    <Cuenta iniciarSesion={iniciarSesion} />
  );

  return (
    <CategoriasContexto.Provider value={{ categorias, recargar: cargarCategorias }}>
      <Header
        config={config}
        tema={tema}
        cambiarTema={() => setTema(tema === "claro" ? "oscuro" : "claro")}
        cantidadCarrito={cantidadTotal}
        abrirCarrito={() => setCarritoAbierto(true)}
        ir={ir}
        cliente={cliente}
        admin={admin}
        vistaCliente={vistaCliente}
        verComoCliente={verComoCliente}
        volverAlPanel={volverAlPanel}
        cerrarAdmin={cerrarAdmin}
        cerrarSesion={cerrarSesion}
      />

      <main>
        <Routes>
          <Route path="/" element={<Inicio agregar={agregar} ir={ir} config={config} />} />
          <Route path="/catalogo" element={<Catalogo agregar={agregar} ir={ir} />} />
          <Route path="/contacto" element={<Contacto config={config} />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/gracias" element={<Gracias />} />
          <Route path="/cuenta" element={paginaCuenta} />
          <Route path="/privacidad" element={<Legal tipo="privacidad" config={config} />} />
          <Route path="/terminos" element={<Legal tipo="terminos" config={config} />} />
          <Route path="/reclamos" element={<Legal tipo="reclamos" config={config} />} />
          <Route path="/admin" element={<AdminLogin admin={admin} iniciarAdmin={iniciarAdmin} />} />
          <Route path="/admin/panel" element={<AdminPanel admin={admin} cerrarAdmin={cerrarAdmin} />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>

      <Footer config={config} admin={admin && !vistaCliente} />

      <Carrito
        abierto={carritoAbierto}
        cerrar={() => setCarritoAbierto(false)}
        carrito={carrito}
        cambiarCantidad={cambiarCantidad}
        quitar={quitar}
        vaciar={vaciar}
        config={config}
        cliente={cliente}
        cerrarSesion={cerrarSesion}
      />

      <BotonesFlotantes />
      <AvisoLocal />
      <VolverArriba />

      {aviso && <div className="aviso-flotante">{aviso}</div>}

      {transicion && (
        <div className="transicion">
          <span className="transicion-icono">{transicion.icono}</span>
          <p>{transicion.texto}</p>
        </div>
      )}
    </CategoriasContexto.Provider>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Contenido />
    </HashRouter>
  );
}
