import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { pedir } from "../utils/api";
import { PESTANAS } from "./admin/pestanas";

import Resumen from "./admin/Resumen";
import Pedidos from "./admin/Pedidos";
import Clientes from "./admin/Clientes";
import Productos from "./admin/Productos";
import Categorias from "./admin/Categorias";
import Banners from "./admin/Banners";
import SobreAdmin from "./admin/SobreAdmin";
import Ajustes from "./admin/Ajustes";
import Mensajes from "./admin/Mensajes";
import Seguridad from "./admin/Seguridad";

// el menú de las pestañas está arriba (en el encabezado); aquí solo se muestra la que toca
export default function AdminPanel({ admin, cerrarAdmin }) {
  const [params] = useSearchParams();
  const [aviso, setAviso] = useState("");
  const irA = useNavigate();

  // la pestaña va en el link (?pestana=pedidos), así las notificaciones pueden llevar a una
  const pedida = params.get("pestana");
  const pestana = PESTANAS.some(([clave]) => clave === pedida) ? pedida : "resumen";
  const titulo = PESTANAS.find(([clave]) => clave === pestana)[1];

  // llamadas al backend con el token del admin
  function llamar(ruta, opciones = {}) {
    return pedir(ruta, { ...opciones, rol: "admin" });
  }

  // si el token venció (401) cerramos la sesión
  function alError(error) {
    if (error.estado === 401) return cerrarAdmin();
    setAviso(error.message);
  }

  useEffect(() => {
    if (!admin) irA("/admin");
  }, [admin]);

  // al cambiar de pestaña se quita el aviso anterior
  useEffect(() => {
    setAviso("");
  }, [pestana]);

  const props = { llamar, alError };

  return (
    <section className="contenedor seccion">
      <h1>{titulo}</h1>

      {aviso && <p className="aviso">{aviso}</p>}

      {pestana === "resumen" && <Resumen {...props} />}
      {pestana === "pedidos" && <Pedidos {...props} />}
      {pestana === "clientes" && <Clientes {...props} />}
      {pestana === "productos" && <Productos {...props} />}
      {pestana === "categorias" && <Categorias {...props} />}
      {pestana === "banners" && <Banners {...props} />}
      {pestana === "ajustes" && <Ajustes {...props} />}
      {pestana === "sobre" && <SobreAdmin {...props} />}
      {pestana === "mensajes" && <Mensajes {...props} />}
      {pestana === "seguridad" && <Seguridad {...props} />}
    </section>
  );
}
