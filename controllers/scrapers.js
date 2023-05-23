import scrapMusimundo from "../scrappers/musimundo.js";
import scrapCetrogar from "../scrappers/cetrogar.js";
import scrapFravega from "../scrappers/fravega.js";
import Oferta from "../schemas/ofertas.js";
import Tienda from "../schemas/tienda.js";
import errorHandler from "../utils/errorHandler.js";

const guardarDatos = async (data, tiendaNombre) => {
  try {
    const tienda = await Tienda.findOne({ nombre: tiendaNombre });

    if (!tienda) {
      console.log("Tienda no encontrada");
      return false;
    }

    const oferta = new Oferta({ tienda: tienda._id, productos: data });

    await oferta.save();

    tienda.ofertas.push(oferta);
    await tienda.save();

    return true;
  } catch (error) {
    console.log("Error en guardarDatos:", error);
    return false;
  }
};

const processScraping = async (scrapFunction, tienda, res) => {
  try {
    const data = await scrapFunction();

    if (!data) {
      throw { message: "No se obtuvieron datos para guardar", status: 500 };
    }

    const datosGuardados = await guardarDatos(data, tienda);

    if (datosGuardados) {
      return res
        .status(201)
        .json({ message: "Ofertas guardadas correctamente" });
    } else {
      throw { message: "Las Ofertas no pudieron ser guardadas", status: 500 };
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

const callScraper = async (req, res) => {
  const { tienda } = req.params;

  try {
    if (tienda === "musimundo") {
      await processScraping(scrapMusimundo, tienda, res);
    } else if (tienda === "cetrogar") {
      await processScraping(scrapCetrogar, tienda, res);
    } else if (tienda === "fravega") {
      await processScraping(scrapFravega, tienda, res);
    } else {
      throw { message: "Tienda no válida", status: 400 };
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

export default callScraper;
