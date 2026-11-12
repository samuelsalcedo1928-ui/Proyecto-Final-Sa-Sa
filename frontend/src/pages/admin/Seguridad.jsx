import { useState } from "react";

// cambiar la contraseña del administrador
export default function Seguridad({ llamar }) {
  const [form, setForm] = useState({ actual: "", nueva: "", repetir: "" });
  const [estado, setEstado] = useState({ tipo: "", texto: "" });

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function guardar(e) {
    e.preventDefault();
    setEstado({ tipo: "", texto: "" });

    if (form.nueva !== form.repetir) {
      return setEstado({ tipo: "error", texto: "Las contraseñas nuevas no coinciden." });
    }

    try {
      await llamar("/api/auth/password", { method: "POST", body: { actual: form.actual, nueva: form.nueva } });
      setForm({ actual: "", nueva: "", repetir: "" });
      setEstado({ tipo: "ok", texto: "Contraseña cambiada." });
    } catch (error) {
      setEstado({ tipo: "error", texto: error.message });
    }
  }

  return (
    <form onSubmit={guardar} className="form-admin">
      <h2>Cambiar mi contraseña</h2>
      <label>Contraseña actual
        <input name="actual" type="password" value={form.actual} onChange={cambiar} required autoComplete="current-password" />
      </label>
      <label>Contraseña nueva (mínimo 8 caracteres)
        <input name="nueva" type="password" value={form.nueva} onChange={cambiar} required minLength={8} autoComplete="new-password" />
      </label>
      <label>Repite la contraseña nueva
        <input name="repetir" type="password" value={form.repetir} onChange={cambiar} required minLength={8} autoComplete="new-password" />
      </label>
      <button className="boton">Cambiar contraseña</button>
      {estado.texto && <p className={estado.tipo === "ok" ? "exito" : "aviso"}>{estado.texto}</p>}
    </form>
  );
}
