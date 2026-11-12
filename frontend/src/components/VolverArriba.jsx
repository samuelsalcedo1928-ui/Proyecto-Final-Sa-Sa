import { useState, useEffect } from "react";

// botón que aparece cuando ya bajaste mucho y te devuelve arriba
export default function VolverArriba() {
  const [ver, setVer] = useState(false);

  useEffect(() => {
    const revisar = () => setVer(window.scrollY > 600);
    window.addEventListener("scroll", revisar);
    return () => window.removeEventListener("scroll", revisar);
  }, []);

  return (
    <button
      className={ver ? "volver-arriba visible" : "volver-arriba"}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
    >
      ↑
    </button>
  );
}
