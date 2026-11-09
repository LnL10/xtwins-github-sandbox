// Carrinho, cupões e cálculo de totais (preços com IVA incluído).
import { VAT_RATE } from "../config.js";
import { round2 } from "./format.js";
import { db, readKey, writeKey } from "./store.js";
import { isIslandPostalCode } from "./validators.js";

export const FREE_SHIPPING_FROM = 50;
export const SHIPPING = {
  normal: { cost: 3.99, islandSurcharge: 5, days: "2 a 4 dias úteis" },
  expresso: { cost: 7.99, days: "24 horas (dias úteis)" },
  loja: { cost: 0, days: "Pronto a levantar em 2 dias úteis" },
};
export const MAX_PER_LINE = 10;

const empty = () => ({ lines: [], coupon: null });

export function getCart() {
  return readKey("cart", null) ?? empty();
}

function saveCart(cart) {
  writeKey("cart", cart);
  document.dispatchEvent(new CustomEvent("cart:changed"));
}

export const cartCount = () => getCart().lines.reduce((sum, line) => sum + line.quantity, 0);

export function lineKey(productId, variant) {
  return `${productId}|${variant ?? ""}`;
}

export function unitPrice(product, variantName) {
  const option = product.variants?.options.find((o) => o.name === variantName);
  return round2(product.price + (option?.delta ?? 0));
}

/** Quantidade que ainda se pode juntar ao carrinho (stock total menos o que já lá está, todas as variantes). */
export function availableToAdd(product) {
  const inCart = getCart().lines.filter((l) => l.productId === product.id).reduce((s, l) => s + l.quantity, 0);
  return Math.max(0, product.stock - inCart);
}

export function addToCart(product, variant, quantity) {
  const cart = getCart();
  const key = lineKey(product.id, variant);
  const line = cart.lines.find((l) => lineKey(l.productId, l.variant) === key);
  if (line) line.quantity = Math.min(line.quantity + quantity, MAX_PER_LINE);
  else cart.lines.push({ productId: product.id, variant: variant ?? null, quantity });
  saveCart(cart);
}

export function setQuantity(productId, variant, quantity) {
  const cart = getCart();
  const line = cart.lines.find((l) => lineKey(l.productId, l.variant) === lineKey(productId, variant));
  if (line) line.quantity = quantity;
  saveCart(cart);
}

export function removeLine(productId, variant) {
  const cart = getCart();
  const index = cart.lines.findIndex((l) => lineKey(l.productId, l.variant) === lineKey(productId, variant));
  const [removed] = index >= 0 ? cart.lines.splice(index, 1) : [];
  saveCart(cart);
  return { removed, index };
}

export function restoreLine(line, index) {
  const cart = getCart();
  cart.lines.splice(Math.min(index, cart.lines.length), 0, line);
  saveCart(cart);
}

export function clearCart() {
  saveCart(empty());
}

/** Linhas do carrinho com o produto atual (preço e stock), ignorando produtos que deixaram de existir. */
export function cartLines() {
  const products = db.all("products");
  return getCart()
    .lines.map((line) => {
      const product = products.find((p) => p.id === line.productId && p.active);
      if (!product) return null;
      const price = unitPrice(product, line.variant);
      return { ...line, product, unitPrice: price, total: round2(price * line.quantity) };
    })
    .filter(Boolean);
}

/** Valida e aplica um cupão. Devolve { ok, message }. */
export function applyCoupon(code) {
  const clean = String(code).trim().toUpperCase();
  if (!clean) return { ok: false, message: "Indique um código promocional." };
  const coupon = db.find("coupons", (c) => c.code === clean);
  if (!coupon) return { ok: false, message: "Código promocional inválido." };
  if (new Date(coupon.expiresAt) < new Date()) return { ok: false, message: "Este código promocional expirou." };
  const subtotal = cartLines().reduce((sum, line) => sum + line.total, 0);
  if (subtotal < coupon.minSubtotal) {
    return { ok: false, message: `Este código exige compras a partir de ${coupon.minSubtotal.toFixed(2).replace(".", ",")} €.` };
  }
  const cart = getCart();
  cart.coupon = coupon.code;
  saveCart(cart);
  const description = { percent: `${coupon.value}% de desconto`, amount: `${coupon.value} € de desconto`, shipping: "portes grátis" }[coupon.type];
  return { ok: true, message: `Código ${coupon.code} aplicado: ${description}.` };
}

export function removeCoupon() {
  const cart = getCart();
  cart.coupon = null;
  saveCart(cart);
}

/**
 * Totais do carrinho. `shipping` = { method, postalCode } (opcional, no checkout).
 * Regras: cupão revalidado (pode deixar de cumprir o mínimo); envio normal grátis a partir de 50 €
 * (depois do desconto) exceto nas ilhas, que pagam 5 € de sobretaxa; expresso indisponível nas ilhas.
 */
export function totals(shipping = null) {
  const lines = cartLines();
  const subtotal = round2(lines.reduce((sum, line) => sum + line.total, 0));
  const cart = getCart();
  let coupon = cart.coupon ? db.find("coupons", (c) => c.code === cart.coupon) : null;
  if (coupon && (subtotal < coupon.minSubtotal || new Date(coupon.expiresAt) < new Date())) coupon = null;
  let discount = 0;
  if (coupon?.type === "percent") discount = round2((subtotal * coupon.value) / 100);
  if (coupon?.type === "amount") discount = Math.min(coupon.value, subtotal);
  const afterDiscount = round2(subtotal - discount);

  let shippingCost = null;
  if (shipping?.method) {
    const island = isIslandPostalCode(shipping.postalCode ?? "");
    if (shipping.method === "loja") shippingCost = 0;
    else if (shipping.method === "expresso") shippingCost = SHIPPING.expresso.cost;
    else {
      const base = afterDiscount >= FREE_SHIPPING_FROM ? 0 : SHIPPING.normal.cost;
      shippingCost = round2(base + (island ? SHIPPING.normal.islandSurcharge : 0));
    }
    if (coupon?.freeShipping && shipping.method !== "expresso") shippingCost = 0;
  }
  const total = round2(afterDiscount + (shippingCost ?? 0));
  const vat = round2(total - total / (1 + VAT_RATE));
  return { lines, subtotal, coupon, discount, shippingCost, total, vat };
}
