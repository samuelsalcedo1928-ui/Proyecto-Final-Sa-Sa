import { useRef, useState, useEffect } from "react";

// hace que lo de adentro aparezca suavemente cuando llega a la pantalla al bajar
// retraso = milisegundos de espera (sirve para que varias tarjetas salgan una tras otra)
export default function Aparecer({ children, retraso = 0, className = "" }) {
  const caja = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // navegadores viejos sin IntersectionObserver: se muestra de una
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const vigilante = new IntersectionObserver(
      (entradas) => {
        if (entradas[0].isIntersecting) {
          setVisible(true);
          vigilante.disconnect(); // solo la primera vez
        }
      },
      { threshold: 0.12 },
    );
    vigilante.observe(caja.current);
    return () => vigilante.disconnect();
  }, []);

  return (
    <div
      ref={caja}
      className={`aparecer ${visible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${retraso}ms` }}
    >
      {children}
    </div>
  );
}
