import Tienda from "../schemas/tienda.js";
import errorHandler from "../utils/errorHandler.js";

export const crearTienda = async (req, res) => {
  const { nombre } = req.body;

  try {
    if (!nombre) {
      throw { message: "La tienda tiene que tener Nombre", status: 400 };
    }

    const nuevaTienda = new Tienda({
      nombre: nombre,
    });

    await nuevaTienda.save();
    res.status(201).json(nuevaTienda);
  } catch (error) {
    return errorHandler(res, error);
  }
};
