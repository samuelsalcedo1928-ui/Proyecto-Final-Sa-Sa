import { useRef, useState, useEffect } from "react";

// número que sube de 0 hasta "hasta" cuando se ve en pantalla
export default function Contador({ hasta, sufijo = "" }) {
  const caja = useRef(null);
  const [valor, setValor] = useState(0);

  useEffect(() => {
    let reloj = null;

    function arrancar() {
      let actual = 0;
      const paso = Math.max(1, Math.ceil(hasta / 30));
      reloj = setInterval(() => {
        actual = Math.min(hasta, actual + paso);
        setValor(actual);
        if (actual >= hasta) clearInterval(reloj);
      }, 40);
    }

    if (!("IntersectionObserver" in window)) {
      setValor(hasta);
      return;
    }

    const vigilante = new IntersectionObserver((entradas) => {
      if (entradas[0].isIntersecting) {
        arrancar();
        vigilante.disconnect();
      }
    });
    vigilante.observe(caja.current);

    return () => {
      vigilante.disconnect();
      clearInterval(reloj);
    };
  }, [hasta]);

  return (
    <span ref={caja}>
      {valor}
      {sufijo}
    </span>
  );
}
