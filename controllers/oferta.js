import Tienda from "../schemas/tienda.js";
import Oferta from "../schemas/ofertas.js";
import errorHandler from "../utils/errorHandler.js";

export const obtenerOfertas = async (req, res) => {
  const { tienda } = req.params;
  const { fecha, formato } = req.query;

  try {
    const tiendaData = await Tienda.findOne({ nombre: tienda });

    if (!tiendaData) {
      throw { message: "Tienda no encontrada", status: 404 };
    }

    let ofertas;

    // Si recibe parametro fecha por query
    if (fecha) {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - parseInt(fecha));

      ofertas = await Oferta.find({
        tienda: tiendaData._id,
        fecha: { $gte: fechaInicio },
      })
        .populate("tienda")
        .sort({ fecha: -1 });
    } else {
      const ultimaOferta = await Oferta.findOne({
        tienda: tiendaData._id,
      }).populate("tienda");

      if (ultimaOferta) {
        ofertas = [ultimaOferta];
      } else {
        throw {
          message: "No hay ofertas disponibles para esta tienda",
          status: 404,
        };
      }
    }

    // Si recibe parametro formato por query
    if (formato === "csv") {
      const csvData = transformarProductosACSV(ofertas);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${tienda}-ofertas.csv"`
      );
      return res.status(200).send(csvData);
    } else {
      const ofertasFormateadas = ofertas.map((oferta) => {
        return {
          fecha: oferta.fecha,
          tienda: {
            _id: oferta.tienda._id,
            nombre: oferta.tienda.nombre,
            cantidadOfertas: oferta.tienda.ofertas.length,
            ofertas: oferta.tienda.ofertas,
          },
          cantidadProductos: oferta.productos.length,
          productos: oferta.productos,
        };
      });

      return res.status(200).json(ofertasFormateadas);
    }
  } catch (error) {
    console.error(error);
    return errorHandler(res, error);
  }
};

/* ---------------------------------------------------------- */

// AGREGAR POR BODY (ACTUALMENTE SIN USO)
export const agregarOferta = async (req, res) => {
  try {
    const tiendaNombre = req.params.tienda;
    const tienda = await Tienda.findOne({ nombre: tiendaNombre });

    if (!tienda) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    const { productos } = req.body;

    const oferta = new Oferta({ tienda: tienda._id, productos });

    await oferta.save();

    tienda.ofertas.push(oferta);
    await tienda.save();

    res.status(201).json(oferta);
  } catch (error) {
    res.status(500).json({ message: "Error al agregar oferta", error });
  }
};

export const eliminarOfertasAntiguas = async (req, res) => {
  try {
    const tiendaNombre = req.params.tienda;
    const tienda = await Tienda.findOne({ nombre: tiendaNombre });

    if (!tienda) {
      throw { message: "Tienda no encontrada", status: 404 };
    }

    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 6);

    // Encuentra y elimina las ofertas antiguas
    await Oferta.deleteMany({
      tienda: tienda._id,
      fecha: { $lt: fechaLimite },
    });

    res.status(200).json({ message: "Ofertas antiguas eliminadas" });
  } catch (error) {
    console.error(error);
    return errorHandler(res, error);
  }
};

/* -------------------------------------------------- */

const transformarProductosACSV = (ofertas) => {
  const header = [
    "tienda",
    "categoria",
    "titulo",
    "precio",
    "precio anterior",
    "interes",
    "cuotas",
    "valor cuotas",
    "link",
    "fecha",
  ];
  const rows = [];

  ofertas.forEach((oferta) => {
    const tienda = oferta.tienda.nombre;
    const fecha = oferta.fecha;

    oferta.productos.forEach((producto) => {
      const row = [
        tienda,
        producto.categoria,
        producto.titulo,
        producto.precio,
        producto.precioAnterior,
        producto.interes,
        producto.cuotas,
        producto.valorCuotas,
        producto.link,
        fecha,
      ];
      rows.push(row);
    });
  });

  const csvContent =
    header.join(",") + "\n" + rows.map((row) => row.join(",")).join("\n");
  return csvContent;
};
