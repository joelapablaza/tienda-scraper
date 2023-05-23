import bcrypt from "bcrypt";
import User from "../schemas/user.js";
import generarToken from "../utils/jwt.js";
import errorHandler from "../utils/errorHandler.js";

export const crearUsuario = async (req, res) => {
  try {
    const { username, password } = req.body;

    const usuarioExistente = await User.findOne({ username });
    if (usuarioExistente) {
      throw { message: "El nombre de usuario ya esta en uso", status: 400 };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword });
    newUser.isAdmin = true;

    await newUser.save();

    return res.status(201).json({
      message: "Usuario creado con exito",
      token: generarToken(newUser),
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    const user = await User.findOne({ usuario });
    if (!user) {
      throw {
        message: "Nombre de usuario o contraseña incorrecta",
        status: 400,
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw {
        message: "Nombre de usuario o contraseña incorrecta",
        status: 400,
      };
    }

    res.status(200).json({
      message: "Inicio de sesion exitoso",
      token: generarToken(user),
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};
