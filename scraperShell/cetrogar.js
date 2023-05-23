import axios from "axios";
import cheerio from "cheerio";
import { promises as fsPromises } from "fs";

const categorias = {
  349: "tecnologia",
  350: "electrodomesticos",
  2840: "belleza y cuidado personal",
  8896: "salud y bienestar",
  24: "hogar",
  280: "jardin",
  30: "herramientas",
  1936: "tiempo libre",
};

const keys = Object.keys(categorias);
const values = Object.values(categorias);
(async () => {
  const t0 = new Date().getTime();
  const baseUrl = `https://www.cetrogar.com.ar/catalogsearch/result/index`;
  const keyword = "oferta";
  const ofertas = [];
  const promesas = [];

  async function scrapeCategory(categoria, categoriaTexto, page = 1) {
    const url = `${baseUrl}/?cat=${categoria}&p=${page}&q=${keyword}`;
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const noResultados = $(".pages-item-next");
      if (noResultados.length === 0) {
        return;
      }

      const items = $(".product-item");

      items.each((i, el) => {
        const product = {};
        product.titulo = $(el).find(".product-item-link").text().trim();
        product.precio = parseFloat(
          $(el)
            .find(".special-price > .price-container > .price-wrapper")
            .attr("data-price-amount")
        );
        product.precioAnterior = parseFloat(
          $(el)
            .find(".old-price > .price-container > .price-wrapper")
            .attr("data-price-amount")
        );
        product.link = $(el).find(".product-item-link").attr("href");
        product.categoria = categoriaTexto;
        product.interes = $(el).find(".installment-text").text().trim();
        product.cuotas = parseInt(
          $(el).find(".installment-count").text().trim()
        );
        if (!product.cuotas) {
          product.cuotas = 1;
        }
        product.valorCuotas = parseFloat(
          (product.precio / product.cuotas).toFixed(2)
        );

        const isProductValid = Object.values(product).every((value) => !!value);

        if (isProductValid) {
          ofertas.push(product);
        } else {
          return;
        }
      });

      await scrapeCategory(categoria, categoriaTexto, page + 1);
    } catch (err) {
      console.log(err);
    }
  }

  for (let index in keys) {
    promesas.push(scrapeCategory(keys[index], values[index], 1));
  }

  await Promise.allSettled(promesas);

  const resultObject = {
    productos: ofertas.length,
    products: ofertas,
  };

  try {
    await fsPromises.writeFile("cetrogar.json", JSON.stringify(resultObject));
    console.log("El resultado se ha guardado en result.json");
  } catch (err) {
    console.error("Error al guardar el archivo:", err);
  }

  const t1 = new Date().getTime();
  const tiempoEjecucion = (t1 - t0) / 1000;
  console.log(tiempoEjecucion);

  return ofertas;
})();

// export default scrapCetrogar;
