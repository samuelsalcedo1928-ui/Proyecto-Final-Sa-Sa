import { useState, useEffect } from "react";

// la franja amarilla de arriba: muestra un mensaje y cada 4 segundos pasa al siguiente
export default function AvisoRotativo({ frases }) {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (frases.length < 2) return;
    const reloj = setInterval(() => setActual((n) => n + 1), 4000);
    return () => clearInterval(reloj);
  }, [frases.length]);

  const frase = frases[actual % frases.length];

  // el key hace que React redibuje el texto y se vea la animación de entrada
  return (
    <div className="aviso-superior" aria-live="polite">
      <span key={frase}>{frase}</span>
    </div>
  );
}
