import express from "express";
import callScraper from "../controllers/scrapers.js";
import { crearUsuario, loginUsuario } from "../controllers/admin.js";
import { auth, isAdmin } from "../utils/authMiddleware.js";

const router = express.Router();

router.route("/:tienda").post(auth, isAdmin, callScraper);
router.route("/registro/create-user").post(auth, isAdmin, crearUsuario); // proteger esta ruta solamente se puede acceder si se esta registrado y si el usuario es admin (isAdmin: true)
router.route("/registro/login").post(loginUsuario);

export default router;
