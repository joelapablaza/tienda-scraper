import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import tiendasRouter from "./routes/tiendas.js";
import adminRouter from "./routes/admin.js";

const app = express();

// middlewares
app.use(express.json({ limit: "5mb" }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// rutas
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/tiendas", tiendasRouter);

export default app;
