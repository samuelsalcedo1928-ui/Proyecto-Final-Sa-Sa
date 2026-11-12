import { useState } from "react";
import { Link } from "react-router-dom";
import { pedir } from "../utils/api";
import { linkWhatsApp } from "../utils/formato";

// pantalla para entrar o crear cuenta
export default function Cuenta({ iniciarSesion }) {
  const [crear, setCrear] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", nombre: "", sitioWeb: "" });
  const [acepto, setAcepto] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    setError("");

    if (crear && !acepto) {
      return setError("Tienes que aceptar la política de privacidad.");
    }

    setEnviando(true);
    try {
      const ruta = crear ? "/api/clientes/registro" : "/api/clientes/login";
      const cuerpo = crear ? { ...form, aceptoPolitica: true } : { email: form.email, password: form.password };
      const datos = await pedir(ruta, { method: "POST", body: cuerpo });
      iniciarSesion(datos.token, datos.cliente);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const olvido = linkWhatsApp("Hola, olvidé la contraseña de mi cuenta. Mi correo es: " + form.email);

  return (
    <section className="contenedor seccion login">
      <h1>{crear ? "Crear cuenta" : "Entrar"}</h1>
      <p className="nota">
        Puedes ver el catálogo y las ofertas sin cuenta. La cuenta sirve para enviar pedidos y ver tu historial.
      </p>

      <form onSubmit={enviar}>
        <label>Correo
          <input name="email" type="email" value={form.email} onChange={cambiar} required autoComplete="email" />
        </label>
        <label>Contraseña {crear && <small>(mínimo 8 caracteres)</small>}
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={cambiar}
            required
            minLength={crear ? 8 : undefined}
            autoComplete={crear ? "new-password" : "current-password"}
          />
        </label>

        {crear && (
          <>
            <label>Tu nombre (opcional)
              <input name="nombre" value={form.nombre} onChange={cambiar} maxLength={80} />
            </label>

            {/* campo trampa para bots */}
            <input className="trampa" name="sitioWeb" value={form.sitioWeb} onChange={cambiar} tabIndex="-1" autoComplete="off" aria-hidden="true" />

            <label className="check">
              <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
              <span>
                Acepto la <Link to="/privacidad">política de privacidad</Link> y los{" "}
                <Link to="/terminos">términos y condiciones</Link>.
              </span>
            </label>
          </>
        )}

        <button className="boton" disabled={enviando}>
          {enviando ? "Un momento…" : crear ? "Crear mi cuenta" : "Entrar"}
        </button>
        {error && <p className="aviso">{error}</p>}
      </form>

      <p>
        {crear ? "¿Ya tienes cuenta? " : "¿Primera vez? "}
        <button className="enlace" onClick={() => { setCrear(!crear); setError(""); }}>
          {crear ? "Entra aquí" : "Crea tu cuenta"}
        </button>
      </p>

      {!crear && (
        <p className="nota">
          ¿Olvidaste tu contraseña?{" "}
          <a href={olvido} target="_blank" rel="noreferrer">Escríbenos por WhatsApp</a> y la tienda te da una nueva.
        </p>
      )}
    </section>
  );
}
