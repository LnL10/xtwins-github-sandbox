// Ponto de entrada: monta o layout e corre o código da página indicada em <body data-page>.
import { renderLayout } from "./core/ui.js";

const PAGES = {
  home: () => import("./pages/shop.js").then((m) => m.home()),
  catalog: () => import("./pages/shop.js").then((m) => m.catalog()),
  product: () => import("./pages/shop.js").then((m) => m.product()),
  cart: () => import("./pages/cart.js").then((m) => m.cartPage()),
  checkout: () => import("./pages/checkout.js").then((m) => m.checkout()),
  confirmation: () => import("./pages/checkout.js").then((m) => m.confirmation()),
  login: () => import("./pages/auth.js").then((m) => m.loginPage()),
  register: () => import("./pages/auth.js").then((m) => m.registerPage()),
  recover: () => import("./pages/auth.js").then((m) => m.recoverPage()),
  forbidden: () => import("./pages/misc.js").then((m) => m.forbidden()),
  demo: () => import("./pages/misc.js").then((m) => m.demoPanel()),
  "account-profile": () => import("./pages/account.js").then((m) => m.profile()),
  "account-orders": () => import("./pages/account.js").then((m) => m.orders()),
  "account-order": () => import("./pages/account.js").then((m) => m.order()),
  "account-addresses": () => import("./pages/account.js").then((m) => m.addresses()),
  "admin-dashboard": () => import("./pages/admin.js").then((m) => m.dashboard()),
  "admin-orders": () => import("./pages/admin.js").then((m) => m.orders()),
  "admin-order": () => import("./pages/admin.js").then((m) => m.order()),
  "admin-products": () => import("./pages/admin.js").then((m) => m.products()),
  "admin-users": () => import("./pages/admin.js").then((m) => m.users()),
};

const page = document.body.dataset.page;
const area = page.startsWith("admin-") ? "admin" : "shop";

// O backoffice só existe para gestores: verificar antes de desenhar o cabeçalho.
let allowed = true;
if (area === "admin") {
  const { requireUser } = await import("./core/auth.js");
  allowed = Boolean(requireUser("gestor"));
}

if (allowed) {
  renderLayout(area);
  await PAGES[page]?.();
  document.body.dataset.ready = "true";
}
