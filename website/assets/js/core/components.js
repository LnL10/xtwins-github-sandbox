// Componentes partilhados entre páginas.
import { href } from "../config.js";
import { esc, eur, stars } from "./format.js";
import { productImage } from "./images.js";

export function stockInfo(product) {
  if (product.stock <= 0) return { label: "Esgotado", cls: "muted", available: false };
  if (product.stock <= 3) return { label: `Últimas unidades (${product.stock})`, cls: "warn", available: true };
  return { label: "Em stock", cls: "ok", available: true };
}

export function priceBlock(price, oldPrice) {
  return `<span class="price" data-testid="price">${eur(price)}</span>${oldPrice ? ` <s class="old-price" data-testid="old-price">${eur(oldPrice)}</s>` : ""}`;
}

export function productCard(product, { reviewsCount = 0 } = {}) {
  const stock = stockInfo(product);
  const link = href(`produto.html?id=${product.id}`);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  return `
    <article class="product-card" data-testid="product-card-${product.id}">
      <a href="${link}" class="product-image" tabindex="-1" aria-hidden="true"><img src="${productImage(product)}" alt="" width="300" height="240"></a>
      <div class="product-body">
        ${discount ? `<span class="badge promo" data-testid="badge-discount">-${discount}%</span>` : ""}
        ${!stock.available ? '<span class="badge muted" data-testid="badge-sold-out">Esgotado</span>' : ""}
        <h3><a href="${link}" data-testid="product-link-${product.id}">${esc(product.name)}</a></h3>
        <p class="rating">${stars(product.rating)} <span class="muted">(${reviewsCount})</span></p>
        <p>${priceBlock(product.price, product.oldPrice)}</p>
        ${product.variants
          ? `<a class="button" href="${link}" data-testid="choose-options-${product.id}">Escolher opções</a>`
          : `<button type="button" class="primary" data-add-to-cart="${product.id}" data-testid="add-to-cart-${product.id}" ${stock.available ? "" : "disabled"}>Adicionar ao carrinho</button>`}
      </div>
    </article>`;
}

export function pagination(total, page, pageSize, makeHref) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return "";
  const items = [];
  const link = (n, label, rel = "") =>
    `<a href="${makeHref(n)}" ${rel} data-testid="page-${label === String(n) ? n : label.toLowerCase()}" ${n === page ? 'aria-current="page"' : ""}>${label}</a>`;
  if (page > 1) items.push(link(page - 1, "Anterior", 'rel="prev"'));
  for (let n = 1; n <= pages; n++) items.push(link(n, String(n)));
  if (page < pages) items.push(link(page + 1, "Seguinte", 'rel="next"'));
  return `<nav class="pagination" aria-label="Paginação" data-testid="pagination">${items.join("")}</nav>`;
}

export function breadcrumb(items) {
  return `<nav class="breadcrumb" aria-label="Caminho"><ol>${items
    .map(([label, link], i) => (i === items.length - 1 || !link ? `<li aria-current="page">${esc(label)}</li>` : `<li><a href="${link}">${esc(label)}</a></li>`))
    .join("")}</ol></nav>`;
}

export function accountNav(active) {
  const links = [
    ["profile", "conta/index.html", "Perfil"],
    ["orders", "conta/encomendas.html", "Encomendas"],
    ["addresses", "conta/moradas.html", "Moradas"],
  ];
  return `<nav class="side-nav" aria-label="A minha conta">${links
    .map(([id, path, label]) => `<a href="${href(path)}" data-testid="account-nav-${id}" ${id === active ? 'aria-current="page"' : ""}>${label}</a>`)
    .join("")}</nav>`;
}

export function addressText(address) {
  if (!address) return "—";
  return `${esc(address.name)}<br>${esc(address.line)}<br>${esc(address.postalCode)} ${esc(address.city)}${address.phone ? `<br>Tel.: ${esc(address.phone)}` : ""}`;
}
