import mongoose from "mongoose";

const { Schema } = mongoose;

const ofertaSchema = new mongoose.Schema({
  tienda: {
    type: Schema.Types.ObjectId,
    ref: "Tienda",
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  productos: [
    {
      titulo: String,
      precio: Number,
      precioAnterior: Number,
      interes: String,
      cuotas: Number,
      valorCuotas: Number,
      link: String,
      categoria: String,
    },
    {
      timestamps: true,
    },
  ],
});

ofertaSchema.post("deleteMany", async function (docs, next) {
  const tiendaIds = docs.map((doc) => doc.tienda);

  await this.model("Tienda").updateMany(
    { _id: { $in: tiendaIds } },
    { $pull: { ofertas: { $in: docs.map((doc) => doc._id) } } }
  );

  next();
});

const Oferta = mongoose.model("Oferta", ofertaSchema);
export default Oferta;
