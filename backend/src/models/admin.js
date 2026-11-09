const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // aquí va la contraseña ya encriptada, nunca el texto normal
    password: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admin", adminSchema);
