import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En GitHub Pages la página vive en /nombre-del-repo/, por eso el "base".
// Si cambias el nombre del repositorio, cámbialo aquí también.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "production" ? "/Proyecto-Final-Sa-Sa/" : "/",
}));
