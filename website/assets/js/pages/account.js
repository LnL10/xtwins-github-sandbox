// Área de cliente: perfil, encomendas e moradas.
import { href } from "../config.js";
import { call } from "../core/api.js";
import { requireUser } from "../core/auth.js";
import { addToCart, availableToAdd } from "../core/cart.js";
import { accountNav, addressText, breadcrumb } from "../core/components.js";
import { date, dateTime, esc, eur, PAYMENT_LABELS, plural, SHIPPING_LABELS, statusBadge } from "../core/format.js";
import { db } from "../core/store.js";
import { $, $$, confirmDialog, errorState, field, loading, main, notFound, openDialog, params, setTitle, showErrors, toast, updateCartBadge } from "../core/ui.js";
import * as v from "../core/validators.js";

const MAX_ADDRESSES = 5;
export const CANCELLABLE = ["Pendente", "Paga"];

function layout(active, title, content) {
  return `
    ${breadcrumb([["Início", href("index.html")], ["A minha conta", href("conta/index.html")], [title]])}
    <div class="account-layout">
      ${accountNav(active)}
      <section class="account-content">${content}</section>
    </div>`;
}

// ---------- perfil ----------

export function profile() {
  const user = requireUser();
  if (!user) return;
  setTitle("A minha conta");
  main().innerHTML = layout("profile", "Perfil", `
    <h1>Olá, ${esc(user.name)}</h1>
    <form id="profile-form" class="card" novalidate data-testid="profile-form">
      <h2>Dados pessoais</h2>
      <div class="alert error" role="alert" data-testid="form-errors" hidden></div>
      ${field({ name: "name", label: "Nome completo", value: user.name, required: true, testid: "profile-name" })}
      ${field({ name: "email", label: "Email", type: "email", value: user.email, attrs: "readonly", help: "Para alterar o email, contacte o apoio ao cliente.", testid: "profile-email" })}
      <div class="row">
        ${field({ name: "phone", label: "Telemóvel", type: "tel", value: user.phone, testid: "profile-phone" })}
        ${field({ name: "nif", label: "NIF", value: user.nif, testid: "profile-nif" })}
      </div>
      <div class="actions"><button type="submit" class="primary" data-testid="profile-save">Guardar alterações</button></div>
    </form>
    <form id="password-form" class="card" novalidate data-testid="password-form">
      <h2>Alterar palavra-passe</h2>
      <div class="alert error" role="alert" data-testid="form-errors" hidden></div>
      ${field({ name: "current", label: "Palavra-passe atual", type: "password", required: true, attrs: 'autocomplete="current-password"', testid: "password-current" })}
      ${field({ name: "next", label: "Nova palavra-passe", type: "password", required: true, help: "Pelo menos 8 caracteres, com maiúscula, minúscula, número e símbolo.", attrs: 'autocomplete="new-password"', testid: "password-new" })}
      ${field({ name: "confirm", label: "Confirmar nova palavra-passe", type: "password", required: true, attrs: 'autocomplete="new-password"', testid: "password-confirm" })}
      <div class="actions"><button type="submit" class="primary" data-testid="password-save">Alterar palavra-passe</button></div>
    </form>`);

  $("#profile-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const values = Object.fromEntries(new FormData(form));
    const errors = {
      name: values.name.trim().length < 3 ? "Indique o nome completo (pelo menos 3 caracteres)." : null,
      phone: v.phone(values.phone, { optional: true, mobileOnly: true }),
      nif: v.nif(values.nif),
    };
    if (!showErrors(form, errors)) return;
    try {
      await call("conta", () => db.update("users", user.id, { name: values.name.trim(), phone: values.phone.replace(/\s/g, ""), nif: values.nif.trim() }));
      toast("Os seus dados foram atualizados.");
      $("h1").textContent = `Olá, ${values.name.trim()}`;
    } catch (error) {
      toast(error.message, { type: "error" });
    }
  });

  $("#password-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const values = Object.fromEntries(new FormData(form));
    const fresh = db.find("users", (u) => u.id === user.id);
    const errors = {
      current: !values.current ? "Indique a palavra-passe atual." : values.current !== fresh.password ? "A palavra-passe atual está incorreta." : null,
      next: v.newPassword(values.next) ?? (values.next === values.current ? "A nova palavra-passe tem de ser diferente da atual." : null),
      confirm: values.confirm !== values.next ? "As palavras-passe não coincidem." : null,
    };
    if (!showErrors(form, errors)) return;
    try {
      await call("conta", () => db.update("users", user.id, { password: values.next }));
      form.reset();
      toast("A palavra-passe foi alterada.");
    } catch (error) {
      toast(error.message, { type: "error" });
    }
  });
}

// ---------- encomendas ----------

export async function orders() {
  const user = requireUser();
  if (!user) return;
  setTitle("As minhas encomendas");
  const status = params().get("estado") ?? "";
  main().innerHTML = layout("orders", "Encomendas", `
    <h1>As minhas encomendas</h1>
    <form method="get" class="row filters-inline" data-testid="orders-filter">
      <label for="f-estado">Estado</label>
      <select id="f-estado" name="estado" data-testid="orders-status-filter">
        ${["", "Pendente", "Paga", "Enviada", "Entregue", "Cancelada"].map((s) => `<option value="${s}" ${s === status ? "selected" : ""}>${s || "Todas"}</option>`).join("")}
      </select>
      <button type="submit" data-testid="orders-filter-apply">Filtrar</button>
    </form>
    <div id="orders"></div>`);
  $("#f-estado").addEventListener("change", (event) => event.target.form.requestSubmit());

  const box = $("#orders");
  const load = async () => {
    loading(box);
    try {
      const list = await call("conta", () => db.all("orders").filter((o) => o.customerId === user.id && (!status || o.status === status)));
      if (!list.length) {
        box.innerHTML = `<div class="card empty" data-testid="orders-empty"><p>${status ? `Não tem encomendas no estado "${esc(status)}".` : "Ainda não fez nenhuma encomenda."}</p><a class="button primary" href="${href("catalogo.html")}">Ver catálogo</a></div>`;
        return;
      }
      box.innerHTML = `
        <p class="muted" data-testid="orders-count">${plural(list.length, "encomenda", "encomendas")}</p>
        <table class="data-table" data-testid="orders-table">
          <thead><tr><th scope="col">Encomenda</th><th scope="col">Data</th><th scope="col">Artigos</th><th scope="col">Total</th><th scope="col">Estado</th></tr></thead>
          <tbody>${list.map((o) => `
            <tr data-testid="order-row-${o.id}">
              <td><a href="${href(`conta/encomenda.html?id=${o.id}`)}" data-testid="order-link-${o.id}">${o.id}</a></td>
              <td>${date(o.createdAt)}</td>
              <td>${o.lines.reduce((s, l) => s + l.quantity, 0)}</td>
              <td>${eur(o.total)}</td>
              <td>${statusBadge(o.status)}</td>
            </tr>`).join("")}</tbody>
        </table>`;
    } catch (error) {
      errorState(box, error, load);
    }
  };
  await load();
}

// ---------- detalhe de encomenda ----------

export function orderDetail(order, { admin = false } = {}) {
  return `
    <div class="order-grid">
      <section class="card" data-testid="order-items">
        <h2>Artigos</h2>
        <table class="data-table">
          <thead><tr><th scope="col">Produto</th><th scope="col">Qtd.</th><th scope="col">Preço</th><th scope="col">Total</th></tr></thead>
          <tbody>${order.lines.map((l) => `
            <tr><td>${admin ? esc(l.name) : `<a href="${href(`produto.html?id=${l.productId}`)}">${esc(l.name)}</a>`}${l.variant ? `<br><span class="muted">${esc(l.variant)}</span>` : ""}</td>
            <td>${l.quantity}</td><td>${eur(l.unitPrice)}</td><td>${eur(l.unitPrice * l.quantity)}</td></tr>`).join("")}</tbody>
        </table>
        <dl class="totals">
          <dt>Subtotal</dt><dd>${eur(order.subtotal)}</dd>
          ${order.discount ? `<dt>Desconto${order.coupon ? ` (${esc(order.coupon)})` : ""}</dt><dd>−${eur(order.discount)}</dd>` : ""}
          <dt>Portes</dt><dd>${order.shipping.cost ? eur(order.shipping.cost) : "Grátis"}</dd>
          <dt class="total">Total</dt><dd class="total" data-testid="order-detail-total">${eur(order.total)}</dd>
        </dl>
      </section>
      <section class="card" data-testid="order-delivery">
        <h2>Entrega</h2>
        <p><strong>${SHIPPING_LABELS[order.shipping.method]}</strong></p>
        <p>${order.shipping.store ? esc(order.shipping.store) : addressText(order.shipping.address)}</p>
        ${order.tracking ? `<p>N.º de seguimento: <strong data-testid="order-tracking">${esc(order.tracking)}</strong></p>` : ""}
        <h2>Pagamento</h2>
        <p data-testid="order-payment">${PAYMENT_LABELS[order.payment.method]}${order.payment.last4 ? ` terminado em ${esc(order.payment.last4)}` : ""}${order.payment.method === "mbway" ? ` (${esc(order.payment.phone)})` : ""}</p>
        ${order.payment.method === "multibanco" && order.status === "Pendente" ? `<p data-testid="order-mb">Entidade ${order.payment.entity} · Referência ${order.payment.reference}</p>` : ""}
        ${order.nif ? `<p>NIF: ${esc(order.nif)}</p>` : ""}
      </section>
      <section class="card" data-testid="order-history">
        <h2>Histórico</h2>
        <ol class="timeline">${order.history.map((h) => `<li><strong>${esc(h.status)}</strong> · ${dateTime(h.at)}${admin ? ` · ${esc(h.by)}` : ""}</li>`).join("")}</ol>
        ${order.cancelReason ? `<p data-testid="order-cancel-reason">Motivo do cancelamento: ${esc(order.cancelReason)}</p>` : ""}
      </section>
    </div>`;
}

export function order() {
  const user = requireUser();
  if (!user) return;
  const id = params().get("id");
  const container = main();
  const load = async () => {
    loading(container);
    try {
      const found = await call("conta", () => db.find("orders", (o) => o.id === id && o.customerId === user.id));
      if (!found) {
        setTitle("Encomenda não encontrada");
        return notFound(container, "Encomenda não encontrada", href("conta/encomendas.html"), "Ver as minhas encomendas");
      }
      render(found);
    } catch (error) {
      errorState(container, error, load);
    }
  };
  const render = (o) => {
    setTitle(`Encomenda ${o.id}`);
    container.innerHTML = layout("orders", o.id, `
      <div class="title-row">
        <h1>Encomenda ${o.id}</h1>
        ${statusBadge(o.status)}
      </div>
      <p class="muted">Feita a ${dateTime(o.createdAt)}</p>
      <div class="actions">
        ${CANCELLABLE.includes(o.status) ? '<button type="button" class="danger" id="cancel" data-testid="order-cancel">Cancelar encomenda</button>' : ""}
        <button type="button" id="reorder" data-testid="order-reorder">Voltar a comprar</button>
      </div>
      ${orderDetail(o)}`);
    $("#cancel")?.addEventListener("click", async () => {
      const data = await openDialog({
        title: `Cancelar a encomenda ${o.id}?`,
        body: `<p>O valor pago é devolvido em até 10 dias úteis pelo mesmo método de pagamento.</p>
          ${field({ name: "reason", label: "Motivo", required: true, testid: "cancel-reason", options: [{ value: "", label: "Escolha um motivo" }, ...["Já não preciso do produto", "Encontrei mais barato", "Prazo de entrega demasiado longo", "Enganei-me na encomenda", "Outro"].map((r) => ({ value: r, label: r }))] })}`,
        confirmLabel: "Cancelar encomenda",
        cancelLabel: "Voltar",
        danger: true,
        testid: "cancel-dialog",
        validate: (form) => ({ reason: form.elements.reason.value ? null : "Escolha o motivo do cancelamento." }),
      });
      if (!data) return;
      try {
        const updated = await call("conta", () => cancelOrder(o.id, data.get("reason"), "Cliente"));
        toast(`A encomenda ${o.id} foi cancelada.`);
        render(updated);
      } catch (error) {
        toast(error.message, { type: "error" });
      }
    });
    $("#reorder").addEventListener("click", () => {
      let added = 0;
      const skipped = [];
      for (const line of o.lines) {
        const product = db.find("products", (p) => p.id === line.productId && p.active);
        const variant = line.variant ? line.variant.split(": ").slice(1).join(": ") : null;
        const qty = product ? Math.min(line.quantity, availableToAdd(product)) : 0;
        if (!qty) {
          skipped.push(line.name);
          continue;
        }
        addToCart(product, variant, qty);
        added += qty;
      }
      updateCartBadge();
      if (added) toast(`${plural(added, "artigo adicionado", "artigos adicionados")} ao carrinho.${skipped.length ? ` Sem stock: ${skipped.join(", ")}.` : ""}`, { action: { label: "Ver carrinho", onClick: () => (window.location.href = href("carrinho.html")) } });
      else toast("Nenhum dos produtos desta encomenda está disponível.", { type: "error" });
    });
  };
  return load();
}

/** Cancela uma encomenda (cliente ou gestor) e devolve o stock. */
export function cancelOrder(id, reason, by) {
  const current = db.find("orders", (o) => o.id === id);
  if (!CANCELLABLE.includes(current.status)) throw new Error("Esta encomenda já não pode ser cancelada.");
  const products = db.all("products");
  db.save("products", products.map((p) => {
    const qty = current.lines.filter((l) => l.productId === p.id).reduce((s, l) => s + l.quantity, 0);
    return qty ? { ...p, stock: p.stock + qty } : p;
  }));
  return db.update("orders", id, (o) => ({
    status: "Cancelada",
    cancelReason: reason,
    history: [...o.history, { status: "Cancelada", at: new Date().toISOString(), by }],
  }));
}

// ---------- moradas ----------

export function addresses() {
  const user = requireUser();
  if (!user) return;
  setTitle("Moradas");
  const render = () => {
    const list = db.find("users", (u) => u.id === user.id).addresses;
    main().innerHTML = layout("addresses", "Moradas", `
      <div class="title-row">
        <h1>Moradas</h1>
        <button type="button" class="primary" id="add" data-testid="address-add">Adicionar morada</button>
      </div>
      <p class="muted" data-testid="addresses-count">${plural(list.length, "morada", "moradas")} de ${MAX_ADDRESSES} possíveis.</p>
      ${list.length ? `<div class="address-grid">${list.map((a) => `
        <article class="card" data-testid="address-card-${a.id}">
          <h2>${esc(a.label)} ${a.isDefault ? '<span class="badge ok" data-testid="address-default">Predefinida</span>' : ""}</h2>
          <p>${addressText(a)}</p>
          <div class="actions">
            <button type="button" data-edit="${a.id}" data-testid="address-edit">Editar</button>
            ${a.isDefault ? "" : `<button type="button" data-default="${a.id}" data-testid="address-make-default">Tornar predefinida</button>`}
            <button type="button" class="link danger-text" data-delete="${a.id}" data-testid="address-delete">Eliminar</button>
          </div>
        </article>`).join("")}</div>` : '<div class="card empty" data-testid="addresses-empty"><p>Ainda não tem moradas guardadas.</p></div>'}`);

    $("#add").addEventListener("click", () => {
      if (list.length >= MAX_ADDRESSES) return toast(`Atingiu o limite de ${MAX_ADDRESSES} moradas. Elimine uma para adicionar outra.`, { type: "error" });
      edit(null);
    });
    $$("[data-edit]").forEach((b) => b.addEventListener("click", () => edit(list.find((a) => a.id === b.dataset.edit))));
    $$("[data-default]").forEach((b) => b.addEventListener("click", () => save(list.map((a) => ({ ...a, isDefault: a.id === b.dataset.default })), "Morada predefinida atualizada.")));
    $$("[data-delete]").forEach((b) =>
      b.addEventListener("click", async () => {
        const address = list.find((a) => a.id === b.dataset.delete);
        if (!(await confirmDialog(`Eliminar a morada "${address.label}"?`, { title: "Eliminar morada", confirmLabel: "Eliminar", danger: true }))) return;
        const rest = list.filter((a) => a.id !== address.id);
        if (address.isDefault && rest.length) rest[0] = { ...rest[0], isDefault: true };
        save(rest, "Morada eliminada.");
      }),
    );

    async function edit(address) {
      const a = address ?? { label: "", name: user.name, line: "", postalCode: "", city: "", phone: user.phone, isDefault: !list.length };
      const data = await openDialog({
        title: address ? "Editar morada" : "Nova morada",
        testid: "address-dialog",
        body: `
          ${field({ name: "label", label: "Nome da morada", value: a.label, required: true, help: "Ex.: Casa, Trabalho.", testid: "address-label" })}
          ${field({ name: "name", label: "Destinatário", value: a.name, required: true, testid: "address-name" })}
          ${field({ name: "line", label: "Morada", value: a.line, required: true, testid: "address-line" })}
          <div class="row">
            ${field({ name: "postalCode", label: "Código postal", value: a.postalCode, required: true, testid: "address-postal-code" })}
            ${field({ name: "city", label: "Localidade", value: a.city, required: true, testid: "address-city" })}
          </div>
          ${field({ name: "phone", label: "Telefone", type: "tel", value: a.phone, required: true, testid: "address-phone" })}
          <label class="choice"><input type="checkbox" name="isDefault" value="1" ${a.isDefault ? "checked" : ""} ${address?.isDefault ? "disabled" : ""} data-testid="address-is-default"> Usar como morada predefinida</label>`,
        validate: (form) => {
          const x = Object.fromEntries(new FormData(form));
          const duplicated = list.some((o) => o.id !== address?.id && o.label.trim().toLowerCase() === x.label.trim().toLowerCase());
          return {
            label: v.required(x.label, "Indique um nome para a morada.") ?? (duplicated ? "Já tem uma morada com este nome." : null),
            name: v.required(x.name, "Indique o destinatário."),
            line: v.required(x.line, "Indique a morada."),
            postalCode: v.postalCode(x.postalCode),
            city: v.required(x.city, "Indique a localidade."),
            phone: v.phone(x.phone),
          };
        },
      });
      if (!data) return;
      const values = Object.fromEntries(data);
      const makeDefault = Boolean(values.isDefault) || Boolean(address?.isDefault) || !list.length;
      const record = { id: address?.id ?? `m${Date.now()}`, label: values.label.trim(), name: values.name.trim(), line: values.line.trim(), postalCode: values.postalCode.trim(), city: values.city.trim(), phone: values.phone.replace(/\s/g, ""), isDefault: makeDefault };
      const next = address ? list.map((x) => (x.id === address.id ? record : x)) : [...list, record];
      save(makeDefault ? next.map((x) => ({ ...x, isDefault: x.id === record.id })) : next, address ? "Morada atualizada." : "Morada adicionada.");
    }
  };

  async function save(next, message) {
    try {
      await call("conta", () => db.update("users", user.id, { addresses: next }));
      render();
      toast(message);
    } catch (error) {
      toast(error.message, { type: "error" });
    }
  }
  render();
}
