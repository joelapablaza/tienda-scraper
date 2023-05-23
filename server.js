import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./index.js";

dotenv.config();

mongoose.connect(process.env.DATA_BASE, {
  useNewUrlParser: true,
});

mongoose.connection.on("connected", () => {
  console.log("Conexion a MongoDB establecida");
});

mongoose.connection.on("error", (err) => {
  console.error("Error al conectar a MongoDB", err);
});

// const PORT = process.env.PORT || 3000;
const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.setTimeout(5 * 60 * 1000); // Establece el tiempo de espera en 5 minutos

export default app;
