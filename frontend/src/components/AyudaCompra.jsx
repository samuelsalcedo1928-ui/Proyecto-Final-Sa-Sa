import { useState } from "react";
import { pedir } from "../utils/api";
import TarjetaProducto from "./TarjetaProducto";

const EJEMPLOS = ["algo para limpiar el piso", "bebidas frías para vender", "lo básico para cocinar"];

// el cliente cuenta qué necesita y la IA le sugiere productos del catálogo
export default function AyudaCompra({ agregar }) {
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  async function buscar(e, forzado) {
    if (e) e.preventDefault();
    const pregunta = (forzado ?? texto).trim();
    if (pregunta.length < 3 || cargando) return;

    setCargando(true);
    setError("");
    try {
      const datos = await pedir("/api/ayuda", { method: "POST", body: { texto: pregunta }, tiempo: 25000 });
      setResultado(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function usarEjemplo(ejemplo) {
    setTexto(ejemplo);
    buscar(null, ejemplo);
  }

  return (
    <div className="ayuda-compra">
      <h2>✨ ¿No sabes qué elegir?</h2>
      <p className="nota">Cuéntanos qué necesitas y te sugerimos productos del catálogo.</p>

      <form onSubmit={buscar} className="ayuda-form">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej: algo para limpiar el piso"
          maxLength={200}
          aria-label="Cuéntanos qué necesitas"
        />
        <button className="boton" disabled={cargando}>{cargando ? "Buscando…" : "Sugerir"}</button>
      </form>

      <div className="ayuda-ejemplos">
        {EJEMPLOS.map((e) => (
          <button key={e} type="button" className="filtro" onClick={() => usarEjemplo(e)}>{e}</button>
        ))}
      </div>

      {error && <p className="aviso">{error}</p>}

      {resultado && resultado.productos.length === 0 && (
        <p>No encontramos algo parecido. Prueba con otras palabras o mira todo el catálogo más abajo.</p>
      )}

      {resultado && resultado.productos.length > 0 && (
        <>
          <p className="nota">
            Esto te puede servir{resultado.origen === "basica" ? " (búsqueda básica)" : ""}:
          </p>
          <div className="rejilla productos">
            {resultado.productos.map((p) => (
              <TarjetaProducto key={p._id} producto={p} agregar={agregar} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
