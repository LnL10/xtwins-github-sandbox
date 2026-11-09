const EUR = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });
const DATE = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
const DATE_TIME = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const eur = (value) => EUR.format(value ?? 0);
export const date = (iso) => (iso ? DATE.format(new Date(iso)) : "—");
export const dateTime = (iso) => (iso ? DATE_TIME.format(new Date(iso)) : "—");
export const round2 = (value) => Math.round(value * 100) / 100;

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

/** Data ISO (aaaa-mm-dd) local, para comparar com inputs type=date. */
export function isoDay(value) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const PAYMENT_LABELS = { cartao: "Cartão de crédito/débito", mbway: "MB WAY", multibanco: "Referência Multibanco" };
export const SHIPPING_LABELS = { normal: "Envio normal", expresso: "Envio expresso", loja: "Levantamento em loja" };

export function statusBadge(status) {
  const cls = { Pendente: "warn", Paga: "info", Enviada: "info", Entregue: "ok", Cancelada: "muted" }[status] ?? "muted";
  return `<span class="badge ${cls}" data-testid="order-status">${esc(status)}</span>`;
}

export function stars(rating) {
  const full = Math.round(rating);
  return `<span class="stars" role="img" aria-label="${String(rating).replace(".", ",")} de 5 estrelas">${"★".repeat(full)}${"☆".repeat(5 - full)}</span>`;
}
