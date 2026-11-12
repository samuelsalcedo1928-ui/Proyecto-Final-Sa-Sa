const mongoose = require("mongoose");

// lleva la cuenta de números (por ejemplo el de los tickets) sin repetirlos
const contadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  valor: { type: Number, default: 0 },
});

// suma 1 de forma atómica y devuelve el nuevo número
contadorSchema.statics.siguiente = async function (nombre) {
  const c = await this.findOneAndUpdate(
    { nombre },
    { $inc: { valor: 1 } },
    { new: true, upsert: true },
  );
  return c.valor;
};

module.exports = mongoose.model("Contador", contadorSchema);
