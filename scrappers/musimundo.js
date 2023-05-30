import axios from "axios";
import cheerio from "cheerio";

const fetchPage = async (page) => {
  const url = `https://www.musimundo.com/super-ofertas/c/superofertas?q=%3Arelevance&page=${page}`;
  const response = await axios.get(url);
  return cheerio.load(response.data);
};

const processItems = ($, items) => {
  const urlPagina = "https://www.musimundo.com";
  const productos = [];
  items.each((i, el) => {
    const product = {};
    product.titulo = $(el).find(".mus-pro-name a").text().trim();
    const precioTexto = $(el)
      .find(".mus-pro-price-number span")
      .text()
      .trim()
      .replace(/[$,.]/g, "");
    product.precio = parseInt(precioTexto.slice(0, -2));
    const anteriorTexto = $(el)
      .find(".line-trought")
      .text()
      .replace(/[$,.]/g, "")
      .trim();
    if (anteriorTexto !== "") {
      product.precioAnterior = parseInt(anteriorTexto.slice(0, -2));
    } else {
      product.precioAnterior = 0;
    }
    product.interes = $(el).find(".sin-interes-label").text().trim();
    product.cuotas = $(el).find(".mus-pro-quotes").first().text().trim();
    product.cuotas = parseInt(product.cuotas);
    product.valorCuotas = $(el).find(".mus-pro-quotes-price").text().trim();
    product.valorCuotas = parseInt(product.valorCuotas.replace(".", ""));
    product.link = $(el).find(".mus-pro-thumb a").attr("href");
    product.link = `${urlPagina}${product.link}`;
    product.categoria = $(el).find(".mus-pro-thumb a").attr("href");
    product.categoria = product.categoria.split("/")[1];
    if (product.categoria === "pequeos") {
      product.categoria = "pequeños";
    }
    product.marca = $(el).find(".mus-pro-brand span").text().trim();

    const isProductValid = Object.values(product).every((value) => !!value);

    if (isProductValid) {
      productos.push(product);
    } else {
      return;
    }
  });

  return productos;
};

const fetchAndProcessPage = async (page) => {
  const $ = await fetchPage(page);
  const items = $(".mus-product-box-out");
  return processItems($, items);
};

const scrapMusimundo = async () => {
  let page = 0;
  let productos = [];
  let isNext = true;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  do {
    try {
      const newProducts = await fetchAndProcessPage(page);
      if (newProducts.length === 0) {
        isNext = false;
        break;
      }
      productos = productos.concat(newProducts);
      page++;
      await sleep(300);
    } catch (error) {
      console.error(error);
      break;
    }
  } while (isNext);

  return productos;
};

export default scrapMusimundo;
