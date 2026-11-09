// Carrinho de compras.
import { href } from "../config.js";
import { applyCoupon, FREE_SHIPPING_FROM, MAX_PER_LINE, removeCoupon, removeLine, restoreLine, setQuantity, totals } from "../core/cart.js";
import { esc, eur, plural } from "../core/format.js";
import { productImage } from "../core/images.js";
import { $, main, setTitle, toast, updateCartBadge } from "../core/ui.js";

export function cartPage() {
  setTitle("Carrinho");
  render();
}

function render(couponMessage = null) {
  const container = main();
  const t = totals();
  if (!t.lines.length) {
    container.innerHTML = `
      <h1>Carrinho</h1>
      <section class="card empty" data-testid="cart-empty">
        <p>O seu carrinho está vazio.</p>
        <a class="button primary" href="${href("catalogo.html")}" data-testid="cart-go-catalog">Ver catálogo</a>
      </section>`;
    updateCartBadge();
    return;
  }
  const missing = Math.max(0, FREE_SHIPPING_FROM - (t.subtotal - t.discount));
  container.innerHTML = `
    <h1>Carrinho <span class="muted" data-testid="cart-items-count">(${plural(t.lines.reduce((s, l) => s + l.quantity, 0), "artigo", "artigos")})</span></h1>
    <div class="cart-layout">
      <section aria-label="Artigos no carrinho">
        <table class="cart-table" data-testid="cart-table">
          <thead><tr><th scope="col">Produto</th><th scope="col">Preço</th><th scope="col">Quantidade</th><th scope="col">Total</th><th scope="col"><span class="sr-only">Ações</span></th></tr></thead>
          <tbody>
            ${t.lines.map((line, i) => `
              <tr data-testid="cart-line-${i + 1}" data-product="${line.productId}" data-variant="${esc(line.variant ?? "")}">
                <td class="cart-product">
                  <img src="${productImage(line.product)}" alt="" width="72" height="58">
                  <div>
                    <a href="${href(`produto.html?id=${line.productId}`)}" data-testid="cart-line-name">${esc(line.product.name)}</a>
                    ${line.variant ? `<p class="muted" data-testid="cart-line-variant">${esc(line.product.variants?.label ?? "Opção")}: ${esc(line.variant)}</p>` : ""}
                    ${line.quantity > line.product.stock ? `<p class="field-error" data-testid="cart-line-stock">Só há ${plural(line.product.stock, "unidade disponível", "unidades disponíveis")}.</p>` : ""}
                  </div>
                </td>
                <td data-testid="cart-line-price">${eur(line.unitPrice)}</td>
                <td>
                  <label class="sr-only" for="qty-${i}">Quantidade de ${esc(line.product.name)}</label>
                  <input id="qty-${i}" class="qty-input" type="number" min="1" max="${Math.min(MAX_PER_LINE, line.product.stock)}" value="${line.quantity}" data-line="${i}" data-testid="cart-line-quantity">
                </td>
                <td data-testid="cart-line-total">${eur(line.total)}</td>
                <td><button type="button" class="link" data-remove="${i}" data-testid="cart-line-remove">Remover</button></td>
              </tr>`).join("")}
          </tbody>
        </table>
        <p><a href="${href("catalogo.html")}" data-testid="continue-shopping">← Continuar a comprar</a></p>
      </section>
      <aside class="card summary" aria-labelledby="summary-title" data-testid="cart-summary">
        <h2 id="summary-title">Resumo</h2>
        <form id="coupon-form" novalidate>
          ${t.coupon ? `
            <p data-testid="coupon-applied">Código <strong>${esc(t.coupon.code)}</strong> aplicado.
              <button type="button" class="link" id="remove-coupon" data-testid="coupon-remove">Remover</button></p>` : `
            <label for="f-coupon">Código promocional</label>
            <div class="row">
              <input id="f-coupon" name="coupon" autocomplete="off" data-testid="coupon-input">
              <button type="submit" data-testid="coupon-apply">Aplicar</button>
            </div>`}
          ${couponMessage ? `<p class="${couponMessage.ok ? "success" : "field-error"}" role="status" data-testid="coupon-message">${esc(couponMessage.message)}</p>` : ""}
        </form>
        <dl class="totals">
          <dt>Subtotal</dt><dd data-testid="summary-subtotal">${eur(t.subtotal)}</dd>
          ${t.discount ? `<dt>Desconto</dt><dd data-testid="summary-discount">−${eur(t.discount)}</dd>` : ""}
          <dt>Portes</dt><dd data-testid="summary-shipping">${t.coupon?.freeShipping || !missing ? "Grátis (envio normal, continente)" : "Calculados no checkout"}</dd>
          <dt class="total">Total</dt><dd class="total" data-testid="summary-total">${eur(t.total)}</dd>
        </dl>
        <p class="muted">IVA incluído (23%): <span data-testid="summary-vat">${eur(t.vat)}</span></p>
        ${missing && !t.coupon?.freeShipping ? `<p class="hint" data-testid="free-shipping-hint">Faltam ${eur(missing)} para ter portes grátis.</p>` : ""}
        <a class="button primary large" href="${href("checkout.html")}" data-testid="checkout">Finalizar compra</a>
      </aside>
    </div>`;

  container.querySelectorAll("[data-testid=cart-line-quantity]").forEach((input) =>
    input.addEventListener("change", () => {
      const line = t.lines[Number(input.dataset.line)];
      let quantity = Number.parseInt(input.value, 10);
      const max = Math.min(MAX_PER_LINE, line.product.stock);
      if (!quantity || quantity < 1) quantity = 1;
      if (quantity > max) {
        quantity = max;
        toast(`Só pode encomendar ${plural(max, "unidade", "unidades")} de ${line.product.name}.`, { type: "error" });
      }
      setQuantity(line.productId, line.variant, quantity);
      render();
      updateCartBadge();
    }),
  );
  container.querySelectorAll("[data-remove]").forEach((button) =>
    button.addEventListener("click", () => {
      const line = t.lines[Number(button.dataset.remove)];
      const { removed, index } = removeLine(line.productId, line.variant);
      render();
      updateCartBadge();
      toast(`${line.product.name} foi removido do carrinho.`, {
        action: {
          label: "Anular",
          onClick: () => {
            restoreLine(removed, index);
            render();
            updateCartBadge();
          },
        },
      });
    }),
  );
  $("#coupon-form").addEventListener("submit", (event) => {
    event.preventDefault();
    render(applyCoupon(event.target.elements.coupon.value));
  });
  $("#remove-coupon")?.addEventListener("click", () => {
    removeCoupon();
    render({ ok: true, message: "Código promocional removido." });
  });
}
