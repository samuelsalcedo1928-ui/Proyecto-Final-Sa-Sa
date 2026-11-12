import { NEGOCIO } from "../config";
import { LEGAL, FECHA_LEGAL } from "../contenido";
import Aparecer from "../components/Aparecer";

// cambia {direccion}, {correo}... por los datos reales de la tienda
function llenar(texto, config) {
  return texto
    .replace("{direccion}", NEGOCIO.direccion)
    .replace("{correo}", NEGOCIO.correo)
    .replace("{telefono}", NEGOCIO.telefono)
    .replace("{plazo}", String(config.plazoReclamoHoras || 24));
}

// sirve para las tres páginas: privacidad, terminos y reclamos
export default function Legal({ tipo, config }) {
  const doc = LEGAL[tipo];

  return (
    <section className="contenedor seccion legal">
      <h1>{doc.titulo}</h1>
      <p className="nota">Última actualización: {FECHA_LEGAL}</p>
      <p className="legal-intro">{doc.intro}</p>

      {doc.secciones.map((s, i) => (
        <Aparecer key={i}>
          <h2>{s.t}</h2>
          {s.p.map((parrafo, j) => (
            <p key={j}>{llenar(parrafo, config)}</p>
          ))}
        </Aparecer>
      ))}

      {NEGOCIO.nit && <p className="nota">NIT {NEGOCIO.nit}</p>}
    </section>
  );
}
