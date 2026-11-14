// GoatCounter: cuenta visitas sin cookies y sin datos personales.
// Solo funciona si pones VITE_GOATCOUNTER (el código de tu cuenta en goatcounter.com).
import { RUTA_ADMIN } from "../config";

const CODIGO = import.meta.env.VITE_GOATCOUNTER;

export function iniciarContador() {
  if (!CODIGO || document.getElementById("goatcounter")) return;

  const script = document.createElement("script");
  script.id = "goatcounter";
  script.async = true;
  script.src = "https://gc.zgo.at/count.js";
  script.dataset.goatcounter = `https://${CODIGO}.goatcounter.com/count`;
  // como la página usa # en las rutas, contamos nosotros cada cambio de página
  script.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
  document.head.appendChild(script);
}

export function contarPagina(ruta) {
  if (!CODIGO) return;
  // el panel de administración no se cuenta
  if (ruta.startsWith(RUTA_ADMIN)) return;
  if (window.goatcounter && window.goatcounter.count) {
    window.goatcounter.count({ path: ruta });
  }
}
