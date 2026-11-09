import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pedir } from "../utils/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const irA = useNavigate();

  async function entrar(e) {
    e.preventDefault();
    setError("");
    try {
      const datos = await pedir("/api/auth/login", { method: "POST", body: { email, password } });
      localStorage.setItem("token_admin", datos.token);
      irA("/admin/panel");
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
