// Checkout em 4 passos (entrega, envio, pagamento, revisão) e página de confirmação.
import { href } from "../config.js";
import { ApiError, call } from "../core/api.js";
import { currentUser } from "../core/auth.js";
import { clearCart, SHIPPING, totals } from "../core/cart.js";
import { addressText } from "../core/components.js";
import { esc, eur, PAYMENT_LABELS, plural, round2, SHIPPING_LABELS } from "../core/format.js";
import { db, readKey, writeKey } from "../core/store.js";
import { $, $$, field, main, notFound, params, setTitle, showErrors, toast } from "../core/ui.js";
import * as v from "../core/validators.js";

const STEPS = ["Entrega", "Envio", "Pagamento", "Revisão"];
const DECLINED_CARD = "4000000000000002";

let state;

function freshState(user) {
  const address = user?.addresses?.find((a) => a.isDefault) ?? user?.addresses?.[0] ?? null;
  return {
    step: 0,
    guest: false,
    delivery: {
      addressId: address?.id ?? "nova",
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      line: "",
      postalCode: "",
      city: "",
      nif: user?.nif ?? "",
    },
    shipping: { method: "normal", store: "" },
    payment: { method: "cartao", holder: "", number: "", expiry: "", cvv: "", phone: user?.phone ?? "" },
    accepted: false,
    error: null,
  };
}

export function checkout() {
  setTitle("Checkout");
  const user = currentUser();
  if (!totals().lines.length) {
    window.location.replace(href("carrinho.html"));
    return;
  }
  state = readKey("checkout", null, "session") ?? freshState(user);
  if (!user && !state.guest) return renderGate();
  render();
}

function persist() {
  writeKey("checkout", { ...state, payment: { ...state.payment, number: "", cvv: "" } }, "session");
}

function renderGate() {
  main().innerHTML = `
    <h1>Checkout</h1>
    <div class="gate">
      <section class="card">
        <h2>Já tem conta?</h2>
        <p>Inicie sessão para usar as suas moradas e acompanhar a encomenda.</p>
        <a class="button primary" href="${href("login.html?voltar=checkout.html")}" data-testid="checkout-login">Iniciar sessão</a>
      </section>
      <section class="card">
        <h2>Comprar sem conta</h2>
        <p>Pode concluir a compra como convidado. Vai receber a confirmação por email.</p>
        <button type="button" id="guest" data-testid="checkout-guest">Continuar como convidado</button>
      </section>
    </div>`;
  $("#guest").addEventListener("click", () => {
    state.guest = true;
    persist();
    render();
  });
}

function stepper() {
  return `
    <ol class="stepper-steps" data-testid="checkout-steps">
      ${STEPS.map((label, i) => `
        <li ${i === state.step ? 'aria-current="step"' : ""} class="${i < state.step ? "done" : ""}" data-testid="step-${i + 1}">
          <span class="step-number">${i + 1}</span> ${label}
        </li>`).join("")}
    </ol>`;
}

function render() {
  const user = currentUser();
  const t = currentTotals();
  main().innerHTML = `
    <h1>Checkout</h1>
    ${stepper()}
    <div class="checkout-layout">
      <form id="step-form" class="card" novalidate data-testid="step-form">
        <h2 data-testid="step-title" tabindex="-1">${state.step + 1}. ${STEPS[state.step]}</h2>
        <div class="alert error" role="alert" data-testid="form-errors" hidden></div>
        ${state.error ? `<div class="alert error" role="alert" data-testid="checkout-error">${esc(state.error)}</div>` : ""}
        ${[stepDelivery, stepShipping, stepPayment, stepReview][state.step](user, t)}
        <div class="actions">
          ${state.step > 0 ? '<button type="button" id="back" data-testid="step-back">Anterior</button>' : `<a class="button" href="${href("carrinho.html")}" data-testid="back-to-cart">Voltar ao carrinho</a>`}
          <button type="submit" class="primary" id="next" data-testid="${state.step === 3 ? "place-order" : "step-next"}">${state.step === 3 ? `Confirmar encomenda · ${eur(t.total)}` : "Seguinte"}</button>
        </div>
      </form>
      ${summary(t)}
    </div>`;
  wireStep();
}

function currentTotals() {
  return totals({ method: state.shipping.method, postalCode: deliveryAddress()?.postalCode ?? state.delivery.postalCode });
}

function deliveryAddress() {
  const user = currentUser();
  if (state.delivery.addressId !== "nova") {
    const saved = user?.addresses?.find((a) => a.id === state.delivery.addressId);
    if (saved) return saved;
  }
  const d = state.delivery;
  return d.line ? { name: d.name, line: d.line, postalCode: d.postalCode, city: d.city, phone: d.phone } : null;
}

function summary(t) {
  return `
    <aside class="card summary" data-testid="checkout-summary">
      <h2>A sua encomenda</h2>
      <ul class="summary-lines">
        ${t.lines.map((l) => `<li><span>${l.quantity} × ${esc(l.product.name)}${l.variant ? ` <span class="muted">(${esc(l.variant)})</span>` : ""}</span><span>${eur(l.total)}</span></li>`).join("")}
      </ul>
      <dl class="totals">
        <dt>Subtotal</dt><dd data-testid="checkout-subtotal">${eur(t.subtotal)}</dd>
        ${t.discount ? `<dt>Desconto (${esc(t.coupon.code)})</dt><dd data-testid="checkout-discount">−${eur(t.discount)}</dd>` : ""}
        <dt>Portes</dt><dd data-testid="checkout-shipping">${t.shippingCost === null ? "—" : t.shippingCost ? eur(t.shippingCost) : "Grátis"}</dd>
        <dt class="total">Total</dt><dd class="total" data-testid="checkout-total">${eur(t.total)}</dd>
      </dl>
      <p class="muted">IVA incluído (23%): ${eur(t.vat)}</p>
    </aside>`;
}

// ---------- passo 1: entrega ----------

function stepDelivery(user) {
  const d = state.delivery;
  const saved = user?.addresses ?? [];
  return `
    ${saved.length ? `
      <fieldset data-testid="saved-addresses">
        <legend>Morada de entrega</legend>
        ${saved.map((a) => `
          <label class="choice card-choice"><input type="radio" name="addressId" value="${a.id}" ${d.addressId === a.id ? "checked" : ""} data-testid="address-${a.id}">
            <span><strong>${esc(a.label)}</strong><br>${addressText(a)}</span></label>`).join("")}
        <label class="choice card-choice"><input type="radio" name="addressId" value="nova" ${d.addressId === "nova" ? "checked" : ""} data-testid="address-new"> <span>Usar outra morada</span></label>
      </fieldset>` : '<input type="hidden" name="addressId" value="nova">'}
    <div id="new-address" ${saved.length && d.addressId !== "nova" ? "hidden" : ""}>
      ${field({ name: "name", label: "Nome completo", value: d.name, required: true, attrs: 'autocomplete="name"' })}
      ${!user ? field({ name: "email", label: "Email", type: "email", value: d.email, required: true, help: "Para onde enviamos a confirmação.", attrs: 'autocomplete="email"' }) : ""}
      ${field({ name: "phone", label: "Telefone", type: "tel", value: d.phone, required: true, attrs: 'autocomplete="tel"' })}
      ${field({ name: "line", label: "Morada", value: d.line, required: true, help: "Rua, número, andar.", attrs: 'autocomplete="street-address"' })}
      <div class="row">
        ${field({ name: "postalCode", label: "Código postal", value: d.postalCode, required: true, help: "Formato 0000-000.", attrs: 'autocomplete="postal-code" inputmode="numeric"' })}
        ${field({ name: "city", label: "Localidade", value: d.city, required: true, attrs: 'autocomplete="address-level2"' })}
      </div>
    </div>
    ${field({ name: "nif", label: "NIF para a fatura (opcional)", value: d.nif, help: "9 dígitos. Sem NIF, a fatura sai como consumidor final.", attrs: 'inputmode="numeric"' })}`;
}

function validateDelivery(form, user) {
  const choice = form.elements.addressId.value || "nova";
  const values = Object.fromEntries(new FormData(form));
  const errors = { nif: v.nif(values.nif) };
  if (choice === "nova") {
    Object.assign(errors, {
      name: v.required(values.name, "Indique o nome completo."),
      email: user ? null : v.email(values.email ?? ""),
      phone: v.phone(values.phone),
      line: v.required(values.line, "Indique a morada."),
      postalCode: v.postalCode(values.postalCode ?? ""),
      city: v.required(values.city, "Indique a localidade."),
    });
  }
  return { errors, values: { ...state.delivery, ...values, addressId: choice } };
}

// ---------- passo 2: envio ----------

function stepShipping() {
  const address = deliveryAddress();
  const island = v.isIslandPostalCode(address?.postalCode ?? "");
  const s = state.shipping;
  const stores = db.all("stores");
  const normalCost = totals({ method: "normal", postalCode: address?.postalCode }).shippingCost;
  return `
    <p class="muted" data-testid="shipping-destination">Entrega em: ${esc(address?.postalCode ?? "")} ${esc(address?.city ?? "")}${island ? " (Regiões Autónomas)" : ""}</p>
    <fieldset data-testid="shipping-methods">
      <legend>Método de envio</legend>
      <label class="choice card-choice"><input type="radio" name="method" value="normal" ${s.method === "normal" ? "checked" : ""} data-testid="shipping-normal">
        <span><strong>${SHIPPING_LABELS.normal}</strong> · ${normalCost ? eur(normalCost) : "Grátis"}<br><span class="muted">${SHIPPING.normal.days}. Grátis a partir de 50 €${island ? "; Regiões Autónomas com sobretaxa de 5 €" : ""}.</span></span></label>
      <label class="choice card-choice ${island ? "disabled" : ""}"><input type="radio" name="method" value="expresso" ${s.method === "expresso" ? "checked" : ""} ${island ? 'disabled aria-describedby="expresso-note"' : ""} data-testid="shipping-express">
        <span><strong>${SHIPPING_LABELS.expresso}</strong> · ${eur(SHIPPING.expresso.cost)}<br><span class="muted" id="expresso-note">${island ? "Indisponível para as Regiões Autónomas." : SHIPPING.expresso.days + "."}</span></span></label>
      <label class="choice card-choice"><input type="radio" name="method" value="loja" ${s.method === "loja" ? "checked" : ""} data-testid="shipping-store">
        <span><strong>${SHIPPING_LABELS.loja}</strong> · Grátis<br><span class="muted">${SHIPPING.loja.days}.</span></span></label>
      <p class="field-error" data-error-for="method" data-testid="error-method" hidden></p>
    </fieldset>
    <div id="store-select" ${s.method === "loja" ? "" : "hidden"}>
      ${field({ name: "store", label: "Loja de levantamento", value: s.store, required: true, options: [{ value: "", label: "Escolha uma loja" }, ...stores.map((st) => ({ value: st.id, label: st.name }))] })}
    </div>`;
}

function validateShipping(form) {
  const method = form.elements.method.value;
  const store = form.elements.store.value;
  const island = v.isIslandPostalCode(deliveryAddress()?.postalCode ?? "");
  return {
    errors: {
      method: !method ? "Escolha um método de envio." : method === "expresso" && island ? "O envio expresso não está disponível para as Regiões Autónomas." : null,
      store: method === "loja" && !store ? "Escolha a loja onde quer levantar a encomenda." : null,
    },
    values: { method, store: method === "loja" ? store : "" },
  };
}

// ---------- passo 3: pagamento ----------

function stepPayment() {
  const p = state.payment;
  return `
    <fieldset data-testid="payment-methods">
      <legend>Método de pagamento</legend>
      ${Object.entries(PAYMENT_LABELS).map(([value, label]) => `
        <label class="choice"><input type="radio" name="method" value="${value}" ${p.method === value ? "checked" : ""} data-testid="payment-${value}"> ${label}</label>`).join("")}
    </fieldset>
    <div data-payment="cartao" ${p.method === "cartao" ? "" : "hidden"}>
      ${field({ name: "holder", label: "Nome no cartão", value: p.holder, required: true, attrs: 'autocomplete="cc-name"' })}
      ${field({ name: "number", label: "Número do cartão", value: p.number, required: true, help: "16 dígitos, sem espaços ou com espaços.", attrs: 'autocomplete="cc-number" inputmode="numeric" maxlength="23"' })}
      <div class="row">
        ${field({ name: "expiry", label: "Validade (MM/AA)", value: p.expiry, required: true, attrs: 'autocomplete="cc-exp" placeholder="MM/AA" maxlength="5"' })}
        ${field({ name: "cvv", label: "CVV", value: "", required: true, help: "3 dígitos no verso.", attrs: 'autocomplete="cc-csc" inputmode="numeric" maxlength="3"' })}
      </div>
    </div>
    <div data-payment="mbway" ${p.method === "mbway" ? "" : "hidden"}>
      ${field({ name: "mbwayPhone", label: "Telemóvel MB WAY", type: "tel", value: p.phone, required: true, help: "Vai receber um pedido de pagamento na app MB WAY." })}
    </div>
    <div data-payment="multibanco" ${p.method === "multibanco" ? "" : "hidden"}>
      <p class="hint" data-testid="multibanco-info">A referência Multibanco é gerada depois de confirmar a encomenda e é válida durante 72 horas. A encomenda só é enviada depois do pagamento.</p>
    </div>`;
}

function validatePayment(form) {
  const values = Object.fromEntries(new FormData(form));
  const method = values.method;
  const errors = {};
  if (method === "cartao") {
    Object.assign(errors, {
      holder: v.required(values.holder, "Indique o nome que está no cartão."),
      number: v.cardNumber(values.number),
      expiry: v.cardExpiry(values.expiry),
      cvv: v.cvv(values.cvv),
    });
  }
  if (method === "mbway") errors.mbwayPhone = v.phone(values.mbwayPhone, { mobileOnly: true });
  return {
    errors,
    values: { method, holder: values.holder ?? "", number: (values.number ?? "").replace(/\s/g, ""), expiry: values.expiry ?? "", cvv: values.cvv ?? "", phone: values.mbwayPhone ?? "" },
  };
}

// ---------- passo 4: revisão ----------

function stepReview(user, t) {
  const address = deliveryAddress();
  const store = db.find("stores", (s) => s.id === state.shipping.store);
  const p = state.payment;
  const paymentText = p.method === "cartao" ? `Cartão terminado em ${esc(p.number.slice(-4))}` : p.method === "mbway" ? `MB WAY (${esc(p.phone)})` : "Referência Multibanco (gerada a seguir)";
  return `
    <div class="review-grid">
      <section data-testid="review-delivery"><h3>Entrega</h3><p>${addressText(address)}</p>${state.delivery.nif ? `<p>NIF: ${esc(state.delivery.nif)}</p>` : ""}
        <button type="button" class="link" data-goto="0" data-testid="edit-delivery">Alterar</button></section>
      <section data-testid="review-shipping"><h3>Envio</h3><p>${SHIPPING_LABELS[state.shipping.method]}${store ? `<br>${esc(store.name)}` : ""}</p>
        <button type="button" class="link" data-goto="1" data-testid="edit-shipping">Alterar</button></section>
      <section data-testid="review-payment"><h3>Pagamento</h3><p>${paymentText}</p>
        <button type="button" class="link" data-goto="2" data-testid="edit-payment">Alterar</button></section>
    </div>
    ${p.method === "cartao" && !p.cvv ? `<div class="alert warn" data-testid="cvv-required">Por segurança, volte ao passo Pagamento e indique de novo o CVV.</div>` : ""}
    <label class="choice"><input type="checkbox" name="accepted" value="1" ${state.accepted ? "checked" : ""} data-testid="accept-terms"> Li e aceito os Termos e Condições e a Política de Devoluções <span class="req" aria-hidden="true">*</span></label>
    <p class="field-error" data-error-for="accepted" data-testid="error-accept-terms" hidden></p>
    <p class="muted">Ao confirmar, a encomenda de ${plural(t.lines.reduce((s, l) => s + l.quantity, 0), "artigo", "artigos")} fica registada e o pagamento é processado.</p>`;
}

// ---------- navegação ----------

function wireStep() {
  const form = $("#step-form");
  const user = currentUser();
  $("#back")?.addEventListener("click", () => go(state.step - 1));
  $$("[data-goto]").forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.goto))));

  if (state.step === 0) {
    $$("input[name=addressId]").forEach((r) => r.addEventListener("change", () => ($("#new-address").hidden = r.value !== "nova")));
  }
  if (state.step === 1) {
    $$("input[name=method]").forEach((r) =>
      r.addEventListener("change", () => {
        $("#store-select").hidden = r.value !== "loja";
        state.shipping.method = r.value;
        $("[data-testid=checkout-summary]").outerHTML = summary(currentTotals());
      }),
    );
  }
  if (state.step === 2) {
    $$("input[name=method]").forEach((r) =>
      r.addEventListener("change", () => $$("[data-payment]").forEach((box) => (box.hidden = box.dataset.payment !== r.value))),
    );
    // formata o número do cartão em grupos de 4
    form.elements.number.addEventListener("input", (event) => {
      const digits = event.target.value.replace(/\D/g, "").slice(0, 19);
      event.target.value = digits.replace(/(.{4})/g, "$1 ").trim();
    });
    form.elements.expiry.addEventListener("input", (event) => {
      const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
      event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    state.error = null;
    if (state.step === 0) {
      const { errors, values } = validateDelivery(form, user);
      if (!showErrors(form, errors)) return;
      state.delivery = values;
      if (state.shipping.method === "expresso" && v.isIslandPostalCode(deliveryAddress()?.postalCode ?? "")) state.shipping.method = "normal";
      return go(1);
    }
    if (state.step === 1) {
      const { errors, values } = validateShipping(form);
      if (!showErrors(form, errors)) return;
      state.shipping = values;
      return go(2);
    }
    if (state.step === 2) {
      const { errors, values } = validatePayment(form);
      if (!showErrors(form, errors)) return;
      state.payment = values;
      return go(3);
    }
    state.accepted = form.elements.accepted.checked;
    if (!showErrors(form, { accepted: state.accepted ? null : "Tem de aceitar os Termos e Condições para continuar." })) return;
    if (state.payment.method === "cartao" && !state.payment.cvv) return go(2);
    await placeOrder(form);
  });
}

function go(step) {
  state.step = Math.max(0, Math.min(3, step));
  persist();
  render();
  $("[data-testid=step-title]").focus?.();
  window.scrollTo({ top: 0 });
}

async function placeOrder(form) {
  const button = $("[data-testid=place-order]", form);
  button.disabled = true;
  button.textContent = "A processar o pagamento…";
  try {
    const order = await call("checkout", createOrder, { extraLatency: 700 });
    clearCart();
    writeKey("checkout", null, "session");
    writeKey("last-order", order.id, "session");
    window.location.href = href(`encomenda-confirmada.html?id=${order.id}`);
  } catch (error) {
    state.error = error instanceof ApiError ? error.message : "Não foi possível concluir a encomenda.";
    if (error.code === "PAYMENT_DECLINED") {
      state.step = 2;
      state.payment.cvv = "";
    }
    persist();
    render();
    toast(state.error, { type: "error" });
  }
}

function createOrder() {
  const user = currentUser();
  const t = currentTotals();
  // stock revalidado no momento da compra
  const products = db.all("products");
  for (const line of t.lines) {
    const product = products.find((p) => p.id === line.productId);
    const wanted = t.lines.filter((l) => l.productId === line.productId).reduce((s, l) => s + l.quantity, 0);
    if (!product || product.stock < wanted) {
      throw new ApiError(`Já não há stock suficiente de ${line.product.name}. Atualize o carrinho.`, "OUT_OF_STOCK");
    }
  }
  if (state.payment.method === "cartao" && state.payment.number === DECLINED_CARD) {
    throw new ApiError("Pagamento recusado pelo banco. Experimente outro cartão ou outro método de pagamento.", "PAYMENT_DECLINED");
  }
  const orders = db.all("orders");
  const nextNumber = Math.max(0, ...orders.map((o) => Number(o.id.split("-")[2]))) + 1;
  const now = new Date().toISOString();
  const payment = {
    cartao: { method: "cartao", last4: state.payment.number.slice(-4), holder: state.payment.holder },
    mbway: { method: "mbway", phone: state.payment.phone },
    multibanco: { method: "multibanco", entity: "21054", reference: `${String(nextNumber).padStart(3, "0")} ${String(Date.now()).slice(-6, -3)} ${String(Date.now()).slice(-3)}` },
  }[state.payment.method];
  const status = state.payment.method === "multibanco" ? "Pendente" : "Paga";
  const address = deliveryAddress();
  const store = db.find("stores", (s) => s.id === state.shipping.store);
  const order = {
    id: `AUR-2026-${String(nextNumber).padStart(5, "0")}`,
    customerId: user?.id ?? null,
    customerName: user?.name ?? state.delivery.name,
    email: user?.email ?? state.delivery.email,
    nif: state.delivery.nif || null,
    createdAt: now,
    status,
    lines: t.lines.map((l) => ({ productId: l.productId, name: l.product.name, variant: l.variant ? `${l.product.variants?.label}: ${l.variant}` : null, unitPrice: l.unitPrice, quantity: l.quantity })),
    subtotal: t.subtotal,
    discount: t.discount,
    coupon: t.coupon?.code ?? null,
    shipping: { method: state.shipping.method, cost: t.shippingCost ?? 0, address: state.shipping.method === "loja" ? null : { ...address }, store: store?.name ?? null },
    payment,
    total: round2(t.total),
    tracking: null,
    cancelReason: null,
    history: status === "Paga" ? [{ status: "Paga", at: now, by: "Cliente" }] : [{ status: "Pendente", at: now, by: "Cliente" }],
    notes: [],
  };
  db.save("orders", [order, ...orders]);
  db.save("products", products.map((p) => {
    const qty = t.lines.filter((l) => l.productId === p.id).reduce((s, l) => s + l.quantity, 0);
    return qty ? { ...p, stock: p.stock - qty } : p;
  }));
  return order;
}

// ---------- confirmação ----------

export function confirmation() {
  setTitle("Encomenda confirmada");
  const id = params().get("id");
  const order = db.find("orders", (o) => o.id === id);
  const user = currentUser();
  const allowed = order && (readKey("last-order", null, "session") === id || (user && order.customerId === user.id));
  if (!allowed) {
    notFound(main(), "Encomenda não encontrada", href("index.html"), "Voltar à loja");
    return;
  }
  main().innerHTML = `
    <section class="card confirmation" data-testid="order-confirmation">
      <h1>Obrigado pela sua encomenda!</h1>
      <p>A encomenda <strong data-testid="order-number">${esc(order.id)}</strong> foi registada. Enviámos a confirmação para <strong>${esc(order.email)}</strong>.</p>
      <p>Estado: <span data-testid="order-status-text">${esc(order.status)}</span> · Total: <strong data-testid="order-total">${eur(order.total)}</strong></p>
      ${order.payment.method === "multibanco" ? `
        <div class="mb-box" data-testid="multibanco-details">
          <h2>Pagamento por Multibanco</h2>
          <dl><dt>Entidade</dt><dd data-testid="mb-entity">${order.payment.entity}</dd><dt>Referência</dt><dd data-testid="mb-reference">${order.payment.reference}</dd><dt>Valor</dt><dd>${eur(order.total)}</dd></dl>
          <p class="muted">Válida durante 72 horas. A encomenda é enviada depois de recebermos o pagamento.</p>
        </div>` : ""}
      <div class="actions">
        ${user ? `<a class="button primary" href="${href(`conta/encomenda.html?id=${order.id}`)}" data-testid="view-order">Ver encomenda</a>` : ""}
        <a class="button" href="${href("catalogo.html")}" data-testid="continue-shopping">Continuar a comprar</a>
      </div>
    </section>`;
}
