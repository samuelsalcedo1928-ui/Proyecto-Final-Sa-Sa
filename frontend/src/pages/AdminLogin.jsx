import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pedir } from "../utils/api";

export default function AdminLogin({ admin, iniciarAdmin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const irA = useNavigate();

  // si ya hay sesión de administrador, va directo al panel
  useEffect(() => {
    if (admin) irA("/admin/panel");
  }, [admin]);

  async function entrar(e) {
    e.preventDefault();
    setError("");
    try {
      const datos = await pedir("/api/auth/login", { method: "POST", body: { email, password } });
      iniciarAdmin(datos.token);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="contenedor seccion login">
      <h1>Administrador</h1>
      <form onSubmit={entrar}>
        <label>Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="boton">Entrar</button>
        {error && <p className="aviso">{error}</p>}
      </form>
    </section>
  );
}
