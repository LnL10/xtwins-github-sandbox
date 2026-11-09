// Layout (cabeçalho, rodapé), mensagens, janelas de diálogo e ajudas para formulários.
import { STORE_NAME, href } from "../config.js";
import { currentUser, endSession } from "./auth.js";
import { cartCount } from "./cart.js";
import { db, readKey, writeKey } from "./store.js";
import { esc } from "./format.js";

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const params = () => new URLSearchParams(window.location.search);
export const main = () => $("#main");

// ---------- layout ----------

export function renderLayout(area) {
  const user = currentUser();
  const header = $("#site-header");
  header.innerHTML = area === "admin" ? adminHeader(user) : shopHeader(user);
  header.className = area === "admin" ? "topbar admin" : "topbar";
  $("#site-footer").innerHTML = `
    <div class="footer-inner">
      <p><strong>${STORE_NAME}</strong> é uma loja fictícia para testes do xTwins. Nenhuma encomenda, pagamento ou conta é real.</p>
      <nav aria-label="Rodapé">
        <a href="${href("catalogo.html")}">Catálogo</a>
        <a href="${href("demo.html")}" data-testid="footer-demo">Painel de demonstração</a>
      </nav>
    </div>`;
  markCurrentNav();
  wireAccountMenu();
  $$("[data-action=logout]").forEach((button) =>
    button.addEventListener("click", () => {
      endSession();
      setFlash("Sessão terminada.");
      window.location.href = href("login.html");
    }),
  );
  document.addEventListener("cart:changed", updateCartBadge);
  showFlash();
}

function shopHeader(user) {
  const categories = db.all("categories");
  const q = new URLSearchParams(window.location.search).get("q") ?? "";
  return `
    <div class="topbar-row">
      <a class="brand" href="${href("index.html")}" data-testid="brand">${STORE_NAME}</a>
      <form class="search" role="search" action="${href("catalogo.html")}" method="get">
        <label for="header-search" class="sr-only">Pesquisar produtos</label>
        <input id="header-search" name="q" type="search" placeholder="Pesquisar produtos…" value="${esc(q)}" data-testid="header-search">
        <button type="submit" data-testid="header-search-submit">Pesquisar</button>
      </form>
      <div class="account">
        ${user ? accountMenu(user) : `
          <a href="${href("login.html")}" data-testid="nav-login">Entrar</a>
          <a href="${href("registo.html")}" data-testid="nav-register">Criar conta</a>`}
        <a class="cart-link" href="${href("carrinho.html")}" data-testid="nav-cart">
          Carrinho <span class="cart-count" data-testid="cart-count" aria-label="${cartCount()} artigos no carrinho">${cartCount()}</span>
        </a>
      </div>
    </div>
    <nav class="categories" aria-label="Categorias">
      ${categories.map((c) => `<a href="${href(`catalogo.html?categoria=${c.id}`)}" data-testid="nav-category-${c.id}">${esc(c.name)}</a>`).join("")}
      <a href="${href("catalogo.html?promocoes=1")}" class="promo" data-testid="nav-promotions">Promoções</a>
    </nav>`;
}

function accountMenu(user) {
  return `
    <div class="menu">
      <button type="button" class="menu-button" aria-expanded="false" aria-controls="account-menu" data-testid="account-menu">
        Olá, ${esc(user.name.split(" ")[0])}
      </button>
      <div class="menu-panel" id="account-menu" hidden>
        <a href="${href("conta/index.html")}" data-testid="menu-profile">A minha conta</a>
        <a href="${href("conta/encomendas.html")}" data-testid="menu-orders">As minhas encomendas</a>
        <a href="${href("conta/moradas.html")}" data-testid="menu-addresses">Moradas</a>
        ${user.role === "gestor" ? `<a href="${href("admin/index.html")}" data-testid="menu-backoffice">Backoffice</a>` : ""}
        <button type="button" data-action="logout" data-testid="logout">Terminar sessão</button>
      </div>
    </div>`;
}

function adminHeader(user) {
  return `
    <div class="topbar-row">
      <a class="brand" href="${href("admin/index.html")}" data-testid="brand">${STORE_NAME} · Backoffice</a>
      <nav class="admin-nav" aria-label="Backoffice">
        <a href="${href("admin/index.html")}" data-testid="admin-nav-dashboard">Painel</a>
        <a href="${href("admin/encomendas.html")}" data-testid="admin-nav-orders">Encomendas</a>
        <a href="${href("admin/produtos.html")}" data-testid="admin-nav-products">Produtos</a>
        <a href="${href("admin/utilizadores.html")}" data-testid="admin-nav-users">Utilizadores</a>
      </nav>
      <div class="account">
        <a href="${href("index.html")}" data-testid="admin-view-store">Ver loja</a>
        <span class="muted" data-testid="current-user">${esc(user?.name ?? "")}</span>
        <button type="button" class="link" data-action="logout" data-testid="logout">Terminar sessão</button>
      </div>
    </div>`;
}

function markCurrentNav() {
  const here = window.location.pathname + window.location.search;
  $$("#site-header nav a").forEach((link) => {
    const target = new URL(link.href);
    const samePath = target.pathname === window.location.pathname;
    if (samePath && (target.search === window.location.search || !target.search)) link.setAttribute("aria-current", "page");
    if (target.pathname + target.search === here) link.setAttribute("aria-current", "page");
  });
}

function wireAccountMenu() {
  const button = $(".menu-button");
  if (!button) return;
  const panel = $("#account-menu");
  const close = () => {
    button.setAttribute("aria-expanded", "false");
    panel.hidden = true;
  };
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
  });
  document.addEventListener("click", (event) => {
    if (!panel.contains(event.target)) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

export function updateCartBadge() {
  const badge = $("[data-testid=cart-count]");
  if (!badge) return;
  const count = cartCount();
  badge.textContent = count;
  badge.setAttribute("aria-label", `${count} artigos no carrinho`);
}

export function setTitle(text) {
  document.title = `${text} — ${STORE_NAME}`;
}

// ---------- mensagens ----------

export function toast(message, { type = "ok", action = null, timeout = 6000 } = {}) {
  const box = document.createElement("div");
  box.className = `toast ${type}`;
  box.setAttribute("role", type === "error" ? "alert" : "status");
  box.dataset.testid = "toast";
  box.innerHTML = `<span data-testid="toast-message">${esc(message)}</span>`;
  if (action) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.label;
    button.dataset.testid = "toast-action";
    button.addEventListener("click", () => {
      action.onClick();
      box.remove();
    });
    box.append(button);
  }
  const close = document.createElement("button");
  close.type = "button";
  close.className = "toast-close";
  close.setAttribute("aria-label", "Fechar mensagem");
  close.textContent = "×";
  close.addEventListener("click", () => box.remove());
  box.append(close);
  $("#toasts").append(box);
  if (timeout) setTimeout(() => box.remove(), timeout);
  return box;
}

export function setFlash(message, type = "ok") {
  writeKey("flash", { message, type }, "session");
}

function showFlash() {
  const flash = readKey("flash", null, "session");
  if (!flash) return;
  writeKey("flash", null, "session");
  toast(flash.message, { type: flash.type });
}

// ---------- estados de carregamento e erro ----------

export function loading(container, text = "A carregar…") {
  container.innerHTML = `<div class="loading" role="status" data-testid="loading"><span class="spinner" aria-hidden="true"></span>${esc(text)}</div>`;
}

export function errorState(container, error, retry) {
  container.innerHTML = `
    <div class="alert error" role="alert" data-testid="error-state">
      <p>${esc(error.message || "Ocorreu um erro inesperado.")}</p>
      ${retry ? '<button type="button" data-testid="retry">Tentar novamente</button>' : ""}
    </div>`;
  if (retry) $("[data-testid=retry]", container).addEventListener("click", retry);
}

export function notFound(container, title, backHref, backLabel) {
  container.innerHTML = `
    <section class="card empty" data-testid="not-found">
      <h1>${esc(title)}</h1>
      <p><a href="${backHref}">${esc(backLabel)}</a></p>
    </section>`;
}

// ---------- formulários ----------

/** Mostra os erros por campo (`errors` = { nomeDoCampo: mensagem }) e um resumo; devolve true se não houver erros. */
export function showErrors(form, errors, { summary = true } = {}) {
  $$("[data-error-for]", form).forEach((el) => {
    el.textContent = "";
    el.hidden = true;
  });
  $$("[aria-invalid]", form).forEach((el) => el.removeAttribute("aria-invalid"));
  const summaryBox = $("[data-testid=form-errors]", form);
  const entries = Object.entries(errors).filter(([, message]) => message);
  if (summaryBox) summaryBox.hidden = true;
  if (!entries.length) return true;
  for (const [name, message] of entries) {
    const holder = $(`[data-error-for="${name}"]`, form);
    if (holder) {
      holder.textContent = message;
      holder.hidden = false;
    }
    const field = form.elements[name];
    const target = field instanceof RadioNodeList ? field[0] : field;
    target?.setAttribute?.("aria-invalid", "true");
  }
  if (summary && summaryBox) {
    summaryBox.textContent = entries.length === 1 ? "Corrija o campo assinalado." : `Corrija os ${entries.length} campos assinalados.`;
    summaryBox.hidden = false;
  }
  const first = form.elements[entries[0][0]];
  (first instanceof RadioNodeList ? first[0] : first)?.focus?.();
  return false;
}

/** Campo de formulário com etiqueta, ajuda e contentor de erro. */
export function field({ name, label, type = "text", value = "", required = false, help = "", attrs = "", testid = name, options = null }) {
  const id = `f-${name}`;
  const req = required ? ' <span class="req" aria-hidden="true">*</span>' : "";
  const describedBy = [help ? `${id}-help` : "", `${id}-error`].filter(Boolean).join(" ");
  let control;
  if (options) {
    control = `<select id="${id}" name="${name}" data-testid="${testid}" aria-describedby="${describedBy}" ${required ? "required" : ""} ${attrs}>
      ${options.map((o) => `<option value="${esc(o.value)}" ${String(o.value) === String(value) ? "selected" : ""}>${esc(o.label)}</option>`).join("")}
    </select>`;
  } else if (type === "textarea") {
    control = `<textarea id="${id}" name="${name}" data-testid="${testid}" aria-describedby="${describedBy}" ${attrs}>${esc(value)}</textarea>`;
  } else {
    control = `<input id="${id}" name="${name}" type="${type}" value="${esc(value)}" data-testid="${testid}" aria-describedby="${describedBy}" ${required ? 'aria-required="true"' : ""} ${attrs}>`;
  }
  return `
    <div class="field">
      <label for="${id}">${esc(label)}${req}</label>
      ${control}
      ${help ? `<p class="help" id="${id}-help">${esc(help)}</p>` : ""}
      <p class="field-error" id="${id}-error" data-error-for="${name}" data-testid="error-${testid}" hidden></p>
    </div>`;
}

// ---------- diálogos (nunca alert/confirm do browser) ----------

/**
 * Abre um diálogo com um formulário. `validate(form)` devolve { campo: mensagem } ou {}.
 * Resolve com o FormData quando confirmado e válido, ou null quando cancelado.
 */
export function openDialog({ title, body, confirmLabel = "Guardar", cancelLabel = "Cancelar", danger = false, validate = null, testid = "dialog", onOpen = null }) {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.dataset.testid = testid;
    dialog.setAttribute("aria-labelledby", `${testid}-title`);
    dialog.innerHTML = `
      <form method="dialog" novalidate>
        <h2 id="${testid}-title">${esc(title)}</h2>
        <div class="alert error" data-testid="form-errors" role="alert" hidden></div>
        <div class="dialog-body">${body}</div>
        <div class="actions">
          <button type="submit" value="confirm" class="${danger ? "danger" : "primary"}" data-testid="dialog-confirm">${esc(confirmLabel)}</button>
          <button type="button" value="cancel" data-testid="dialog-cancel">${esc(cancelLabel)}</button>
        </div>
      </form>`;
    document.body.append(dialog);
    const form = $("form", dialog);
    const finish = (value) => {
      dialog.close();
      dialog.remove();
      resolve(value);
    };
    $("[data-testid=dialog-cancel]", dialog).addEventListener("click", () => finish(null));
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      finish(null);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (validate && !showErrors(form, validate(form))) return;
      finish(new FormData(form));
    });
    onOpen?.(dialog);
    dialog.showModal();
  });
}

export async function confirmDialog(message, { title = "Confirmar", confirmLabel = "Confirmar", danger = false, testid = "confirm-dialog" } = {}) {
  const result = await openDialog({ title, body: `<p>${esc(message)}</p>`, confirmLabel, danger, testid });
  return result !== null;
}

/** Descarrega um ficheiro gerado no browser. */
export function download(filename, content, type = "text/csv;charset=utf-8") {
  const blob = new Blob(["﻿" + content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
