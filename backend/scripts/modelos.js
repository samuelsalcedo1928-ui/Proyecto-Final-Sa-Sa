// Uso: npm run modelos
// Muestra los modelos de Gemini que tu clave puede usar para chatear.
require("dotenv").config();

const ver = async () => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Falta GEMINI_API_KEY en el .env");
    process.exit(1);
  }

  const respuesta = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=100", {
    headers: { "x-goog-api-key": process.env.GEMINI_API_KEY },
  });

  if (!respuesta.ok) {
    console.error(`Google respondió ${respuesta.status}:`, (await respuesta.text()).slice(0, 300));
    process.exit(1);
  }

  const datos = await respuesta.json();
  const sirven = (datos.models || []).filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"));

  console.log("Modelos que puedes poner en GEMINI_MODEL:");
  sirven.forEach((m) => console.log("- " + m.name.replace("models/", "")));
};

ver().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
