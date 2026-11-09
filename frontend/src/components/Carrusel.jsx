import { useState, useEffect } from "react";
import { rutaImagen } from "../utils/imagen";
import { ICONOS } from "../config";

// imagen grande del inicio que cambia sola cada 5 segundos
export default function Carrusel({ slides, ir }) {
  const [actual, setActual] = useState(0);

  // si cambia la cantidad de slides, volvemos al primero
  useEffect(() => {
    setActual(0);
  }, [slides.length]);

  // pasa de slide solo; el return limpia el temporizador para no acumularlos
  useEffect(() => {
    if (slides.length < 2) return;
    const temporizador = setInterval(() => {
      setActual((a) => (a + 1) % slides.length);
    }, 5000);
    return () => clearInterval(temporizador);
  }, [slides.length]);

  const slide = slides[actual] || slides[0];
  const foto = rutaImagen(slide.imagen);

  function siguiente(cambio) {
    setActual((actual + cambio + slides.length) % slides.length);
  }

  function pulsarBoton() {
    const ver = slide.ver || "Todas";
    ir(`/catalogo?ver=${encodeURIComponent(ver)}`, ICONOS[ver] || "🛒", ver === "Todas" ? "Catálogo" : ver);
  }

  return (
    <section className="carrusel" style={foto ? { backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.6), rgba(0,0,0,.1)), url(${foto})` } : undefined}>
      <div className="contenedor carrusel-texto">
        <h1>{slide.titulo}</h1>
        {slide.subtitulo && <p>{slide.subtitulo}</p>}
        <button className="boton" onClick={pulsarBoton}>{slide.textoBoton || "Ver productos"}</button>
      </div>

      {slides.length > 1 && (
        <>
          <button className="flecha izquierda" onClick={() => siguiente(-1)} aria-label="Anterior">‹</button>
          <button className="flecha derecha" onClick={() => siguiente(1)} aria-label="Siguiente">›</button>
          <div className="puntos">
            {slides.map((s, i) => (
              <button key={i} className={i === actual ? "punto activo" : "punto"} onClick={() => setActual(i)} aria-label={`Ir al banner ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
