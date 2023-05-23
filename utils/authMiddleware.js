import jwt from "jsonwebtoken";
import User from "../schemas/user.js";
import errorHandler from "./errorHandler.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw {
        message: "Acceso denegado, no se proporciono un token",
        status: 401,
      };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      throw { message: "Acceso denegado, usuario no encontrado", status: 401 };
    }

    req.user = user;
    next();
  } catch (error) {
    return errorHandler(res, error);
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Acceso denegado, el usuario no es administrador" });
  }
};
