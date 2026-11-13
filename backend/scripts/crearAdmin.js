require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../src/models/admin");

const crear = async () => {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || password.length < 8) {
    console.error("Pon ADMIN_EMAIL y un ADMIN_PASSWORD de mínimo 8 caracteres en el .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  // la contraseña se guarda encriptada
  const encriptada = await bcrypt.hash(password, 10);

  // si ya existe ese correo, le cambia la contraseña
  await Admin.findOneAndUpdate({ email }, { email, password: encriptada }, { upsert: true });

  console.log(`Administrador listo: ${email}`);
  await mongoose.disconnect();
};

crear().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
