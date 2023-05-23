import axios from "axios";
import cheerio from "cheerio";

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

const scrapFravega = async () => {
  const baseURL = "https://www.fravega.com/l/";
  const urlPagina = "https://www.fravega.com";
  const keyword = "oferta";
  const ofertas = [];

  async function scrapeCategoryWithLoop(categoria) {
    let page = 1;

    while (true) {
      const url = `${baseURL}${categoria}/?keyword=${keyword}&page=${page}`;
      console.log(url);

      try {
        const cuotasArray = [
          "https://images.fravega.com/f64/4663af5ee0bdf3d70f356c10261b5e7e.png",
          "https://images.fravega.com/f64/6d52a7007b7d0cc7fdf0874cd4a44b17.png",
          "https://images.fravega.com/f64/352a0cad70d895898a4f548b8d0b2202.png",
        ];

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const noResultados = $(".sc-d945a0ce-4 p:first-of-type").text();
        if (noResultados.length !== 0) {
          break;
        }

        // .sc-d4c91285-0
        const items = $(".sc-ef269aa1-2.hJAsrO");
        let itemsProcessed = 0;

        items.each((i, el) => {
          const interes = $(el).find(".sc-28a904f2-1.coapDI").attr("src");
          console.log("El interes es: ", interes);
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

          const isProductValid = Object.entries(product).every(
            ([key, value]) => {
              return key === "precioAnterior" || !!value;
            }
          );

          if (isProductValid) {
            ofertas.push(product);
            console.log(product);
          } else {
            return;
          }
        });

        if (itemsProcessed === items.length) {
          break;
        }
        page++;
      } catch (err) {
        console.log(err);
        break;
      }
    }
  }

  const batchSize = 5; // Establece el tamaño del lote aquí
  for (let i = 0; i < categorias.length; i += batchSize) {
    const batch = categorias.slice(i, i + batchSize);
    const promises = batch.map((categoria) =>
      scrapeCategoryWithLoop(categoria)
    );
    await Promise.all(promises);
  }

  return ofertas;
};

export default scrapFravega;
