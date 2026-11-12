// franja que corre sola de derecha a izquierda con los beneficios de la tienda
export default function Marquesina({ frases }) {
  // se repite la lista dos veces para que el movimiento nunca tenga un hueco
  const lista = [...frases, ...frases];

  return (
    <div className="marquesina" aria-label={frases.join(". ")}>
      <div className="marquesina-pista" aria-hidden="true">
        {lista.map((f, i) => (
          <span key={i}>{f}</span>
        ))}
      </div>
    </div>
  );
}
