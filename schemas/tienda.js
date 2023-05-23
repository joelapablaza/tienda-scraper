import mongoose from "mongoose";

const { Schema } = mongoose;

const tiendaSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
  },
  ofertas: [
    {
      type: Schema.Types.ObjectId,
      ref: "Oferta",
    },
  ],
});

const Tienda = mongoose.model("Tienda", tiendaSchema);
export default Tienda;
