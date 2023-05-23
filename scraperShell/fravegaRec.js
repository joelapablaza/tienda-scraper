import axios from "axios";
import cheerio from "cheerio";
import { promises as fsPromises } from "fs";

const categorias = [
  "pequenos-electrodomesticos",
  "cocina",
  "heladeras-freezers-y-cavas",
  "herramientas-y-construccion",
  "lavado",
  "hogar",
  "informatica",
  "muebles",
  "salud-y-bienestar",
  "tv-y-video",
  "termotanques-y-calefones",
  "audio",
  "climatizacion",
  "deportes-y-fitness",
  "jardin",
  "celulares",
  "lavadero-y-limpieza",
  "bebes-y-primera-infancia",
  "iluminacion",
  "juguetes-y-juegos",
  "belleza-y-cuidado-corporal",
  "seguridad-para-el-hogar",
];

(async () => {
  const t0 = new Date().getTime();
  const baseURL = "https://www.fravega.com/l/";
  const urlPagina = "https://www.fravega.com";
  const keyword = "oferta";
  const ofertas = [];

  async function scrapeCategory(categoria, page = 1) {
    const url = `${baseURL}${categoria}/?keyword=${keyword}&page=${page}`;

    try {
      const cuotasArray = [
        "https://images.fravega.com/f64/4663af5ee0bdf3d70f356c10261b5e7e.png",
        "https://images.fravega.com/f64/352a0cad70d895898a4f548b8d0b2202.png",
        "https://images.fravega.com/f64/6d52a7007b7d0cc7fdf0874cd4a44b17.png",
      ];

      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const noResultados = $(".sc-d945a0ce-4 p:first-of-type").text();
      if (noResultados.length !== 0) {
        return;
      }

      const items = $(".sc-79bf4172-2");

      items.each((i, el) => {
        const interes = $(el).find(".ScbvQ").attr("src");
        if (!cuotasArray.includes(interes)) {
          return;
        }
        const product = {};
        product.titulo = $(el).find(".sc-6321a7c8-0").text().trim();
        product.precio =
          Number($(el).find(".sc-ad64037f-0").text().trim().slice(1)) * 1000;
        product.precioAnterior =
          Number($(el).find(".sc-dba42328-0").text().trim().slice(1)) * 1000;
        if (!product.precioAnterior) {
          product.precioAnterior = 0;
        }
        product.link = $(el).find("a").attr("href");
        product.link = `${urlPagina}${product.link}`;
        product.categoria = categoria;
        if (interes === cuotasArray[0]) {
          product.interes = "sin interes";
          product.cuotas = 3;
          product.valorCuotas = +(+product.precio / 3).toFixed(2);
        } else if (interes === cuotasArray[1]) {
          product.interes = "sin interes";
          product.cuotas = 6;
          product.valorCuotas = +(+product.precio / 6).toFixed(2);
        } else if (interes === cuotasArray[2]) {
          product.interes = "sin interes";
          product.cuotas = 12;
          product.valorCuotas = +(+product.precio / 12).toFixed(2);
        }

        const isProductValid = Object.entries(product).every(([key, value]) => {
          return key === "precioAnterior" || !!value;
        });

        if (isProductValid) {
          ofertas.push(product);
        } else {
          return;
        }
      });

      await scrapeCategory(categoria, page + 1);
    } catch (err) {
      console.log(err);
    }
  }

  for (let categoria of categorias) {
    await scrapeCategory(categoria);
  }

  const resultObject = {
    productos: ofertas.length,
    products: ofertas,
  };

  try {
    await fsPromises.writeFile("fravega.json", JSON.stringify(resultObject));
    console.log("El resultado se ha guardado en result.json");
  } catch (err) {
    console.error("Error al guardar el archivo:", err);
  }

  const t1 = new Date().getTime();
  const tiempoEjecucion = (t1 - t0) / 1000;
  console.log(tiempoEjecucion);
})();
