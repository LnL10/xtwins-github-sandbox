// Raiz do site, calculada a partir deste ficheiro: funciona no GitHub Pages
// (/xtwins-github-sandbox/) e em qualquer servidor local, a qualquer profundidade de página.
export const ROOT = new URL("../../", import.meta.url);

export const STORE_NAME = "Loja Aurora";
export const DATA_VERSION = 3;
export const PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 10;
export const VAT_RATE = 0.23;

/** Endereço de uma página do site (caminho + query), relativo à raiz. */
export function href(path) {
  const url = new URL(path, ROOT);
  return url.pathname + url.search;
}

/** Caminho da página atual relativo à raiz do site, com a query (ex.: "conta/encomenda.html?id=1"). */
export function currentPath() {
  const root = ROOT.pathname;
  const path = window.location.pathname.startsWith(root)
    ? window.location.pathname.slice(root.length)
    : window.location.pathname.replace(/^\//, "");
  return (path || "index.html") + window.location.search;
}
