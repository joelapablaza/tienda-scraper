import express from "express";
import {
  obtenerOfertas,
  agregarOferta,
  eliminarOfertasAntiguas,
} from "../controllers/oferta.js";
import { crearTienda } from "../controllers/tienda.js";
import { auth, isAdmin } from "../utils/authMiddleware.js";

const router = express.Router();

router.route("/").post(auth, isAdmin, crearTienda);

// api/tienda/
router
  .route("/:tienda/ofertas")
  .get(obtenerOfertas)
  .post(auth, isAdmin, agregarOferta)
  .delete(auth, isAdmin, eliminarOfertasAntiguas);

export default router;
