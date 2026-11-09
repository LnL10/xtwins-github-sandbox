// Imagens dos produtos geradas em SVG (sem ficheiros nem pedidos externos).
import { esc } from "./format.js";

const PALETTE = {
  computadores: ["#3b5bdb", "#dbe4ff"],
  telemoveis: ["#0c8599", "#c5f6fa"],
  audio: ["#9c36b5", "#f3d9fa"],
  casa: ["#2b8a3e", "#d3f9d8"],
  gaming: ["#e8590c", "#ffe8cc"],
  acessorios: ["#5f3dc4", "#e5dbff"],
};

const ICONS = {
  computadores: '<rect x="70" y="70" width="160" height="100" rx="8"/><rect x="50" y="176" width="200" height="12" rx="6"/>',
  telemoveis: '<rect x="115" y="50" width="70" height="140" rx="12"/><circle cx="150" cy="176" r="5" fill="#fff"/>',
  audio: '<path d="M90 150v-30a60 60 0 0 1 120 0v30" fill="none" stroke-width="14" stroke="currentColor"/><rect x="78" y="140" width="34" height="50" rx="10"/><rect x="188" y="140" width="34" height="50" rx="10"/>',
  casa: '<path d="M150 55 70 120h22v70h116v-70h22z"/>',
  gaming: '<rect x="70" y="95" width="160" height="80" rx="40"/><circle cx="195" cy="125" r="8" fill="#fff"/><rect x="95" y="128" width="40" height="10" rx="4" fill="#fff"/><rect x="110" y="113" width="10" height="40" rx="4" fill="#fff"/>',
  acessorios: '<rect x="95" y="70" width="110" height="110" rx="18"/><rect x="135" y="45" width="30" height="30" rx="6"/>',
};

/** Imagem SVG (data URI) de um produto; `view` dá as variantes da galeria (0 a 3). */
export function productImage(product, view = 0) {
  if (product.image && view === 0) return product.image;
  const [main, light] = PALETTE[product.category] ?? ["#495057", "#e9ecef"];
  const rotate = [0, -8, 8, 0][view] ?? 0;
  const scale = [1, 0.85, 0.85, 1.15][view] ?? 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 240">
    <rect width="300" height="240" fill="${light}"/>
    <g fill="${main}" color="${main}" transform="translate(150 120) rotate(${rotate}) scale(${scale}) translate(-150 -120)">${ICONS[product.category] ?? ICONS.acessorios}</g>
    <text x="150" y="226" text-anchor="middle" font-family="Segoe UI, Arial" font-size="13" fill="${main}">${esc(product.sku)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
