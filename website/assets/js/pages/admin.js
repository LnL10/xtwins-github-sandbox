// Backoffice (só gestores): painel, encomendas, produtos e utilizadores.
import { ADMIN_PAGE_SIZE, href } from "../config.js";
import { call } from "../core/api.js";
import { currentUser } from "../core/auth.js";
import { pagination } from "../core/components.js";
import { date, dateTime, esc, eur, isoDay, plural, round2, statusBadge } from "../core/format.js";
import { productImage } from "../core/images.js";
import { db } from "../core/store.js";
import { $, $$, confirmDialog, download, errorState, field, loading, main, notFound, openDialog, params, setTitle, toast } from "../core/ui.js";
import * as v from "../core/validators.js";
import { cancelOrder, CANCELLABLE, orderDetail } from "./account.js";

const STATUSES = ["Pendente", "Paga", "Enviada", "Entregue", "Cancelada"];
const TRANSITIONS = {
  Pendente: ["Paga", "Cancelada"],
  Paga: ["Enviada", "Cancelada"],
  Enviada: ["Entregue"],
  Entregue: [],
  Cancelada: [],
};
const ACTION_LABELS = { Paga: "Marcar como paga", Enviada: "Marcar como enviada", Entregue: "Marcar como entregue", Cancelada: "Cancelar encomenda" };

async function guarded(container, fn) {
  const run = async () => {
    loading(container);
    try {
      await fn();
    } catch (error) {
      errorState(container, error, run);
    }
  };
  await run();
}

// ---------- painel ----------

export function dashboard() {
  setTitle("Painel");
  return guarded(main(), async () => {
    const data = await call("backoffice", () => {
      const orders = db.all("orders");
      const products = db.all("products");
      const since = Date.now() - 30 * 86400000;
      const valid = orders.filter((o) => o.status !== "Cancelada");
      const days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = isoDay(d);
        return { key, label: d.toLocaleDateString("pt-PT", { weekday: "short", day: "2-digit" }), total: round2(valid.filter((o) => isoDay(o.createdAt) === key).reduce((s, o) => s + o.total, 0)) };
      });
      return {
        sales30: round2(valid.filter((o) => new Date(o.createdAt).getTime() >= since).reduce((s, o) => s + o.total, 0)),
        toShip: orders.filter((o) => o.status === "Paga").length,
        pending: orders.filter((o) => o.status === "Pendente").length,
        outOfStock: products.filter((p) => p.active && p.stock === 0).length,
        customers: db.all("users").filter((u) => u.role === "cliente").length,
        recent: orders.slice(0, 5),
        lowStock: products.filter((p) => p.active && p.stock > 0 && p.stock <= 3),
        days,
      };
    });
    const max = Math.max(1, ...data.days.map((d) => d.total));
    main().innerHTML = `
      <h1>Painel</h1>
      <div class="kpis">
        <a class="kpi card" href="${href("admin/encomendas.html")}" data-testid="kpi-sales"><span>Vendas (30 dias)</span><strong>${eur(data.sales30)}</strong></a>
        <a class="kpi card" href="${href("admin/encomendas.html?estado=Paga")}" data-testid="kpi-to-ship"><span>Por enviar</span><strong>${data.toShip}</strong></a>
        <a class="kpi card" href="${href("admin/encomendas.html?estado=Pendente")}" data-testid="kpi-pending"><span>Pagamento pendente</span><strong>${data.pending}</strong></a>
        <a class="kpi card" href="${href("admin/produtos.html?stock=esgotado")}" data-testid="kpi-out-of-stock"><span>Produtos esgotados</span><strong>${data.outOfStock}</strong></a>
        <a class="kpi card" href="${href("admin/utilizadores.html?perfil=cliente")}" data-testid="kpi-customers"><span>Clientes</span><strong>${data.customers}</strong></a>
      </div>
      <div class="dash-grid">
        <section class="card" aria-labelledby="chart-title">
          <h2 id="chart-title">Vendas dos últimos 7 dias</h2>
          <svg class="chart" viewBox="0 0 700 240" role="img" aria-labelledby="chart-title" data-testid="sales-chart">
            ${data.days.map((d, i) => {
              const h = Math.round((d.total / max) * 170);
              return `<g><title>${esc(d.label)}: ${eur(d.total)}</title>
                <rect x="${30 + i * 95}" y="${200 - h}" width="60" height="${h}" rx="4" class="bar"/>
                <text x="${60 + i * 95}" y="222" text-anchor="middle" class="axis">${esc(d.label)}</text>
                <text x="${60 + i * 95}" y="${192 - h}" text-anchor="middle" class="value">${d.total ? Math.round(d.total) + " €" : ""}</text></g>`;
            }).join("")}
            <line x1="20" y1="200" x2="690" y2="200" class="baseline"/>
          </svg>
        </section>
        <section class="card" aria-labelledby="low-title">
          <h2 id="low-title">Stock baixo</h2>
          ${data.lowStock.length ? `<ul data-testid="low-stock">${data.lowStock.map((p) => `<li><a href="${href(`admin/produtos.html?q=${encodeURIComponent(p.sku)}`)}">${esc(p.name)}</a> · ${plural(p.stock, "unidade", "unidades")}</li>`).join("")}</ul>` : "<p>Sem alertas de stock.</p>"}
        </section>
      </div>
      <section class="card" aria-labelledby="recent-title">
        <h2 id="recent-title">Últimas encomendas</h2>
        ${ordersTable(data.recent, { selectable: false })}
        <p><a href="${href("admin/encomendas.html")}" data-testid="see-all-orders">Ver todas as encomendas</a></p>
      </section>`;
  });
}

function ordersTable(list, { selectable = true, sort = null } = {}) {
  const sortable = (key, label) => {
    if (!sort) return label;
    const active = sort.key === key;
    const next = active && sort.dir === "asc" ? "desc" : "asc";
    return `<a href="${withParams({ ordem: `${key}-${next}`, pagina: "" })}" data-testid="sort-${key}">${label}${active ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}</a>`;
  };
  const ariaSort = (key) => (sort?.key === key ? `aria-sort="${sort.dir === "asc" ? "ascending" : "descending"}"` : "");
  return `
    <table class="data-table" data-testid="admin-orders-table">
      <thead><tr>
        ${selectable ? '<th scope="col"><input type="checkbox" id="select-all" aria-label="Selecionar todas as encomendas desta página" data-testid="select-all"></th>' : ""}
        <th scope="col" ${ariaSort("id")}>${sortable("id", "Encomenda")}</th>
        <th scope="col" ${ariaSort("data")}>${sortable("data", "Data")}</th>
        <th scope="col" ${ariaSort("cliente")}>${sortable("cliente", "Cliente")}</th>
        <th scope="col" ${ariaSort("total")}>${sortable("total", "Total")}</th>
        <th scope="col">Estado</th>
      </tr></thead>
      <tbody>${list.map((o) => `
        <tr data-testid="admin-order-row-${o.id}">
          ${selectable ? `<td><input type="checkbox" name="selected" value="${o.id}" aria-label="Selecionar ${o.id}" data-testid="select-${o.id}"></td>` : ""}
          <td><a href="${href(`admin/encomenda.html?id=${o.id}`)}" data-testid="admin-order-link-${o.id}">${o.id}</a></td>
          <td>${dateTime(o.createdAt)}</td>
          <td>${esc(o.customerName)}${o.customerId ? "" : ' <span class="muted">(convidado)</span>'}</td>
          <td>${eur(o.total)}</td>
          <td>${statusBadge(o.status)}</td>
        </tr>`).join("")}</tbody>
    </table>`;
}

function withParams(changes, page = window.location.pathname) {
  const p = new URLSearchParams(window.location.search);
  for (const [k, value] of Object.entries(changes)) value ? p.set(k, value) : p.delete(k);
  const q = p.toString();
  return `${page}${q ? `?${q}` : ""}`;
}

// ---------- encomendas ----------

export function orders() {
  setTitle("Encomendas");
  const p = params();
  const f = {
    q: (p.get("q") ?? "").trim(),
    estado: STATUSES.includes(p.get("estado")) ? p.get("estado") : "",
    de: p.get("de") ?? "",
    ate: p.get("ate") ?? "",
    pagina: Math.max(1, Number.parseInt(p.get("pagina") ?? "1", 10) || 1),
  };
  const [key, dir] = (p.get("ordem") ?? "data-desc").split("-");
  const sort = { key: ["id", "data", "cliente", "total"].includes(key) ? key : "data", dir: dir === "asc" ? "asc" : "desc" };

  return guarded(main(), async () => {
    const all = await call("backoffice", () => db.all("orders"));
    const q = f.q.toLowerCase();
    const filtered = all
      .filter((o) => (!q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.email.toLowerCase().includes(q))
        && (!f.estado || o.status === f.estado)
        && (!f.de || isoDay(o.createdAt) >= f.de)
        && (!f.ate || isoDay(o.createdAt) <= f.ate))
      .sort((a, b) => {
        const value = { id: (o) => o.id, data: (o) => o.createdAt, cliente: (o) => o.customerName, total: (o) => o.total }[sort.key];
        const cmp = typeof value(a) === "number" ? value(a) - value(b) : String(value(a)).localeCompare(String(value(b)), "pt");
        return sort.dir === "asc" ? cmp : -cmp;
      });
    const pages = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
    const page = Math.min(f.pagina, pages);
    const slice = filtered.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE);

    main().innerHTML = `
      <h1>Encomendas</h1>
      <form method="get" class="card filter-bar" data-testid="admin-orders-filters" novalidate>
        <div class="field"><label for="f-q">Pesquisar</label><input id="f-q" name="q" type="search" value="${esc(f.q)}" placeholder="N.º, cliente ou email" data-testid="admin-orders-search"></div>
        <div class="field"><label for="f-estado">Estado</label><select id="f-estado" name="estado" data-testid="admin-orders-status">
          <option value="">Todos</option>${STATUSES.map((s) => `<option ${s === f.estado ? "selected" : ""}>${s}</option>`).join("")}</select></div>
        <div class="field"><label for="f-de">De</label><input id="f-de" name="de" type="date" value="${esc(f.de)}" data-testid="admin-orders-from"></div>
        <div class="field"><label for="f-ate">Até</label><input id="f-ate" name="ate" type="date" value="${esc(f.ate)}" data-testid="admin-orders-to">
          <p class="field-error" data-error-for="ate" data-testid="error-admin-orders-dates" hidden></p></div>
        <input type="hidden" name="ordem" value="${sort.key}-${sort.dir}">
        <div class="actions"><button type="submit" class="primary" data-testid="admin-orders-apply">Filtrar</button>
          <a class="button" href="${href("admin/encomendas.html")}" data-testid="admin-orders-clear">Limpar</a></div>
      </form>
      <div class="results-bar">
        <p data-testid="admin-orders-count">${plural(filtered.length, "encomenda", "encomendas")}</p>
        <div class="row">
          <label for="bulk-action">Com as selecionadas</label>
          <select id="bulk-action" data-testid="bulk-action">
            <option value="">Escolha uma ação</option>
            <option value="Enviada">Marcar como enviadas</option>
            <option value="Cancelada">Cancelar</option>
          </select>
          <button type="button" id="bulk-apply" data-testid="bulk-apply" disabled>Aplicar</button>
          <button type="button" id="export" data-testid="export-csv">Exportar CSV</button>
        </div>
      </div>
      ${slice.length ? ordersTable(slice, { sort }) : '<div class="card empty" data-testid="admin-orders-empty"><p>Nenhuma encomenda corresponde aos filtros.</p></div>'}
      ${pagination(filtered.length, page, ADMIN_PAGE_SIZE, (n) => withParams({ pagina: n === 1 ? "" : String(n) }))}`;

    $("[data-testid=admin-orders-filters]").addEventListener("submit", (event) => {
      const form = event.target;
      if (form.elements.de.value && form.elements.ate.value && form.elements.de.value > form.elements.ate.value) {
        event.preventDefault();
        const box = $("[data-error-for=ate]", form);
        box.textContent = "A data final não pode ser anterior à data inicial.";
        box.hidden = false;
        return;
      }
      [...form.elements].forEach((el) => { if (el.name && !el.value) el.disabled = true; });
    });

    const boxes = () => $$("input[name=selected]");
    const selected = () => boxes().filter((b) => b.checked).map((b) => b.value);
    const refreshBulk = () => {
      $("#bulk-apply").disabled = !selected().length || !$("#bulk-action").value;
      const all = $("#select-all");
      if (all) {
        all.checked = selected().length > 0 && selected().length === boxes().length;
        all.indeterminate = selected().length > 0 && selected().length < boxes().length;
      }
    };
    $("#select-all")?.addEventListener("change", (event) => {
      boxes().forEach((b) => (b.checked = event.target.checked));
      refreshBulk();
    });
    boxes().forEach((b) => b.addEventListener("change", refreshBulk));
    $("#bulk-action").addEventListener("change", refreshBulk);

    $("#bulk-apply").addEventListener("click", async () => {
      const target = $("#bulk-action").value;
      const ids = selected();
      let tracking = null;
      if (target === "Enviada") {
        const data = await openDialog({
          title: `Marcar ${plural(ids.length, "encomenda", "encomendas")} como enviadas`,
          body: `<p>Só as encomendas pagas podem ser enviadas; as outras são ignoradas.</p>${field({ name: "tracking", label: "Prefixo do n.º de seguimento", value: "RR", required: true, help: "Duas letras. O número é gerado para cada encomenda.", testid: "bulk-tracking" })}`,
          confirmLabel: "Marcar como enviadas",
          testid: "bulk-dialog",
          validate: (form) => ({ tracking: /^[A-Za-z]{2}$/.test(form.elements.tracking.value.trim()) ? null : "Indique duas letras (ex.: RR)." }),
        });
        if (!data) return;
        tracking = data.get("tracking").trim().toUpperCase();
      } else if (!(await confirmDialog(`Cancelar ${plural(ids.length, "encomenda", "encomendas")}? Só as pendentes ou pagas são canceladas.`, { title: "Cancelar encomendas", confirmLabel: "Cancelar encomendas", danger: true }))) {
        return;
      }
      try {
        const result = await call("backoffice", () => {
          let changed = 0;
          for (const id of ids) {
            const order = db.find("orders", (o) => o.id === id);
            if (!TRANSITIONS[order.status].includes(target)) continue;
            if (target === "Cancelada") cancelOrder(id, "Cancelada pelo gestor", currentUser().name);
            else changeStatus(id, target, { tracking: `${tracking}${String(Math.floor(100000000 + Math.random() * 899999999))}PT` });
            changed++;
          }
          return { changed, ignored: ids.length - changed };
        });
        const message = `${plural(result.changed, "encomenda atualizada", "encomendas atualizadas")}.${result.ignored ? ` ${plural(result.ignored, "ignorada", "ignoradas")} (o estado não o permite).` : ""}`;
        await orders();
        toast(message, { type: result.changed ? "ok" : "error" });
      } catch (error) {
        toast(error.message, { type: "error" });
      }
    });

    $("#export").addEventListener("click", () => {
      const rows = [["Encomenda", "Data", "Cliente", "Email", "Estado", "Artigos", "Total (EUR)"]].concat(
        filtered.map((o) => [o.id, dateTime(o.createdAt), o.customerName, o.email, o.status, o.lines.reduce((s, l) => s + l.quantity, 0), o.total.toFixed(2).replace(".", ",")]),
      );
      download(`encomendas-${isoDay(new Date())}.csv`, rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n"));
      toast(`Exportadas ${plural(filtered.length, "encomenda", "encomendas")}.`);
    });
  });
}

function changeStatus(id, status, { tracking = null } = {}) {
  const by = currentUser().name;
  return db.update("orders", id, (o) => ({
    status,
    tracking: tracking ?? o.tracking,
    history: [...o.history, { status, at: new Date().toISOString(), by }],
  }));
}

// ---------- detalhe da encomenda ----------

export function order() {
  const id = params().get("id");
  const container = main();
  const render = (o) => {
    setTitle(`Encomenda ${o.id}`);
    const user = o.customerId ? db.find("users", (u) => u.id === o.customerId) : null;
    container.innerHTML = `
      <p><a href="${href("admin/encomendas.html")}" data-testid="back-to-orders">← Encomendas</a></p>
      <div class="title-row"><h1>Encomenda ${o.id}</h1>${statusBadge(o.status)}</div>
      <p class="muted">Feita a ${dateTime(o.createdAt)} por <strong data-testid="admin-order-customer">${esc(o.customerName)}</strong> (${esc(o.email)})${user ? "" : " · compra como convidado"}</p>
      <div class="actions" data-testid="status-actions">
        ${TRANSITIONS[o.status].map((s) => `<button type="button" class="${s === "Cancelada" ? "danger" : "primary"}" data-status="${s}" data-testid="status-${s.toLowerCase()}">${ACTION_LABELS[s]}</button>`).join("") || '<p class="muted" data-testid="status-final">Esta encomenda está num estado final.</p>'}
      </div>
      ${orderDetail(o, { admin: true })}
      <section class="card" aria-labelledby="notes-title" data-testid="order-notes">
        <h2 id="notes-title">Notas internas</h2>
        ${o.notes.length ? `<ul class="notes">${o.notes.map((n) => `<li><p>${esc(n.text)}</p><p class="muted">${esc(n.by)} · ${dateTime(n.at)}</p></li>`).join("")}</ul>` : '<p class="muted" data-testid="no-notes">Sem notas.</p>'}
        <form id="note-form" novalidate>
          ${field({ name: "note", label: "Nova nota", type: "textarea", testid: "note-text", help: "Visível só para a equipa. Máximo 500 caracteres.", attrs: 'maxlength="500"' })}
          <button type="submit" data-testid="note-add">Adicionar nota</button>
        </form>
      </section>`;

    $$("[data-status]").forEach((button) =>
      button.addEventListener("click", async () => {
        const target = button.dataset.status;
        let extra = {};
        if (target === "Enviada") {
          const data = await openDialog({
            title: "Marcar como enviada",
            body: field({ name: "tracking", label: "Número de seguimento", required: true, help: "Ex.: RR123456789PT", testid: "tracking-number" }),
            confirmLabel: "Marcar como enviada",
            testid: "ship-dialog",
            validate: (form) => ({ tracking: v.tracking(form.elements.tracking.value) }),
          });
          if (!data) return;
          extra = { tracking: data.get("tracking").trim().toUpperCase() };
        } else if (target === "Cancelada") {
          const data = await openDialog({
            title: `Cancelar a encomenda ${o.id}?`,
            body: field({ name: "reason", label: "Motivo", type: "textarea", required: true, testid: "admin-cancel-reason" }),
            confirmLabel: "Cancelar encomenda",
            cancelLabel: "Voltar",
            danger: true,
            testid: "admin-cancel-dialog",
            validate: (form) => ({ reason: form.elements.reason.value.trim().length >= 5 ? null : "Indique o motivo (pelo menos 5 caracteres)." }),
          });
          if (!data) return;
          extra = { reason: data.get("reason").trim() };
        } else if (!(await confirmDialog(`${ACTION_LABELS[target]} a encomenda ${o.id}?`, { confirmLabel: ACTION_LABELS[target] }))) {
          return;
        }
        try {
          const updated = await call("backoffice", () => {
            const current = db.find("orders", (x) => x.id === o.id);
            if (!TRANSITIONS[current.status].includes(target)) throw new Error("O estado da encomenda mudou entretanto. Atualize a página.");
            return target === "Cancelada" ? cancelOrder(o.id, extra.reason, currentUser().name) : changeStatus(o.id, target, extra);
          });
          render(updated);
          toast(`Encomenda ${o.id}: ${updated.status.toLowerCase()}.`);
        } catch (error) {
          toast(error.message, { type: "error" });
        }
      }),
    );

    $("#note-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const text = event.target.elements.note.value.trim();
      const box = $("[data-error-for=note]");
      box.hidden = Boolean(text);
      box.textContent = text ? "" : "Escreva a nota antes de a adicionar.";
      if (!text) return;
      const updated = await call("backoffice", () => db.update("orders", o.id, (x) => ({ notes: [...x.notes, { text, by: currentUser().name, at: new Date().toISOString() }] })));
      render(updated);
      toast("Nota adicionada.");
    });
  };
  return guarded(container, async () => {
    const found = await call("backoffice", () => db.find("orders", (o) => o.id === id));
    if (!found) {
      setTitle("Encomenda não encontrada");
      return notFound(container, "Encomenda não encontrada", href("admin/encomendas.html"), "Voltar às encomendas");
    }
    render(found);
  });
}

// ---------- produtos ----------

export function products() {
  setTitle("Produtos");
  const p = params();
  const f = { q: (p.get("q") ?? "").trim(), categoria: p.get("categoria") ?? "", estado: p.get("estado") ?? "", stock: p.get("stock") ?? "" };
  const categories = db.all("categories");

  const render = async () => {
    const all = await call("backoffice", () => db.all("products"));
    const q = f.q.toLowerCase();
    const list = all.filter((x) => (!q || x.name.toLowerCase().includes(q) || x.sku.toLowerCase().includes(q))
      && (!f.categoria || x.category === f.categoria)
      && (!f.estado || (f.estado === "ativos" ? x.active : !x.active))
      && (!f.stock || (f.stock === "esgotado" ? x.stock === 0 : x.stock > 0 && x.stock <= 3)));
    main().innerHTML = `
      <div class="title-row"><h1>Produtos</h1><button type="button" class="primary" id="new-product" data-testid="product-new">Novo produto</button></div>
      <form method="get" class="card filter-bar" data-testid="admin-products-filters">
        <div class="field"><label for="f-q">Pesquisar</label><input id="f-q" name="q" type="search" value="${esc(f.q)}" placeholder="Nome ou SKU" data-testid="admin-products-search"></div>
        <div class="field"><label for="f-cat">Categoria</label><select id="f-cat" name="categoria" data-testid="admin-products-category">
          <option value="">Todas</option>${categories.map((c) => `<option value="${c.id}" ${c.id === f.categoria ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div>
        <div class="field"><label for="f-est">Estado</label><select id="f-est" name="estado" data-testid="admin-products-state">
          ${[["", "Todos"], ["ativos", "Ativos"], ["inativos", "Inativos"]].map(([v2, l]) => `<option value="${v2}" ${v2 === f.estado ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        <div class="field"><label for="f-stock">Stock</label><select id="f-stock" name="stock" data-testid="admin-products-stock">
          ${[["", "Todos"], ["baixo", "Stock baixo (1 a 3)"], ["esgotado", "Esgotados"]].map(([v2, l]) => `<option value="${v2}" ${v2 === f.stock ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        <div class="actions"><button type="submit" class="primary" data-testid="admin-products-apply">Filtrar</button><a class="button" href="${href("admin/produtos.html")}">Limpar</a></div>
      </form>
      <p data-testid="admin-products-count">${plural(list.length, "produto", "produtos")}</p>
      ${list.length ? `
      <table class="data-table" data-testid="admin-products-table">
        <thead><tr><th scope="col"><span class="sr-only">Imagem</span></th><th scope="col">SKU</th><th scope="col">Nome</th><th scope="col">Categoria</th><th scope="col">Preço</th><th scope="col">Stock</th><th scope="col">Ativo</th><th scope="col"><span class="sr-only">Ações</span></th></tr></thead>
        <tbody>${list.map((x) => `
          <tr data-testid="admin-product-row-${x.id}">
            <td><img src="${productImage(x)}" alt="" width="56" height="45"></td>
            <td>${esc(x.sku)}</td>
            <td>${esc(x.name)}</td>
            <td>${esc(categories.find((c) => c.id === x.category)?.name ?? x.category)}</td>
            <td>${eur(x.price)}</td>
            <td class="${x.stock === 0 ? "danger-text" : x.stock <= 3 ? "warn-text" : ""}" data-testid="admin-product-stock">${x.stock}</td>
            <td><button type="button" role="switch" class="switch" aria-checked="${x.active}" aria-label="Produto ativo: ${esc(x.name)}" data-toggle="${x.id}" data-testid="admin-product-active-${x.id}"><span></span></button></td>
            <td class="nowrap"><button type="button" data-edit="${x.id}" data-testid="admin-product-edit-${x.id}">Editar</button>
              <button type="button" class="link danger-text" data-delete="${x.id}" data-testid="admin-product-delete-${x.id}">Eliminar</button></td>
          </tr>`).join("")}</tbody>
      </table>` : '<div class="card empty" data-testid="admin-products-empty"><p>Nenhum produto corresponde aos filtros.</p></div>'}`;

    $("[data-testid=admin-products-filters]").addEventListener("submit", (event) => {
      [...event.target.elements].forEach((el) => { if (el.name && !el.value) el.disabled = true; });
    });
    $("#new-product").addEventListener("click", () => edit(null));
    $$("[data-edit]").forEach((b) => b.addEventListener("click", () => edit(all.find((x) => x.id === Number(b.dataset.edit)))));
    $$("[data-toggle]").forEach((b) =>
      b.addEventListener("click", async () => {
        const id = Number(b.dataset.toggle);
        const updated = await call("backoffice", () => db.update("products", id, (x) => ({ active: !x.active })));
        b.setAttribute("aria-checked", String(updated.active));
        toast(`${updated.name} ${updated.active ? "está visível na loja" : "deixou de estar visível na loja"}.`);
      }),
    );
    $$("[data-delete]").forEach((b) =>
      b.addEventListener("click", async () => {
        const item = all.find((x) => x.id === Number(b.dataset.delete));
        const used = db.all("orders").some((o) => o.lines.some((l) => l.productId === item.id));
        if (used) {
          await openDialog({ title: "Não é possível eliminar", body: `<p>${esc(item.name)} tem encomendas associadas e não pode ser eliminado. Pode desativá-lo para deixar de aparecer na loja.</p>`, confirmLabel: "Percebi", testid: "delete-blocked-dialog" });
          return;
        }
        if (!(await confirmDialog(`Eliminar ${item.name}? Esta ação não pode ser anulada.`, { title: "Eliminar produto", confirmLabel: "Eliminar", danger: true }))) return;
        await call("backoffice", () => db.remove("products", item.id));
        await render();
        toast(`${item.name} foi eliminado.`);
      }),
    );
  };

  async function edit(item) {
    const x = item ?? { name: "", sku: "", category: "", price: "", oldPrice: "", stock: 0, description: "", featured: false };
    let imageData = item?.image ?? null;
    const data = await openDialog({
      title: item ? `Editar ${item.name}` : "Novo produto",
      testid: "product-dialog",
      body: `
        ${field({ name: "name", label: "Nome", value: x.name, required: true, testid: "product-name", attrs: 'maxlength="80"' })}
        <div class="row">
          ${field({ name: "sku", label: "SKU", value: x.sku, required: true, help: "Formato AUR-0000.", testid: "product-sku" })}
          ${field({ name: "category", label: "Categoria", value: x.category, required: true, testid: "product-category", options: [{ value: "", label: "Escolha" }, ...categories.map((c) => ({ value: c.id, label: c.name }))] })}
        </div>
        <div class="row">
          ${field({ name: "price", label: "Preço (€)", type: "number", value: x.price, required: true, testid: "product-price", attrs: 'step="0.01" min="0"' })}
          ${field({ name: "oldPrice", label: "Preço anterior (€)", type: "number", value: x.oldPrice ?? "", help: "Opcional, para promoções.", testid: "product-old-price", attrs: 'step="0.01" min="0"' })}
          ${field({ name: "stock", label: "Stock", type: "number", value: x.stock, required: true, testid: "product-stock", attrs: 'step="1" min="0"' })}
        </div>
        ${field({ name: "description", label: "Descrição", type: "textarea", value: x.description, help: "Máximo 500 caracteres.", testid: "product-description", attrs: 'maxlength="500"' })}
        <p class="muted" data-testid="description-counter" aria-live="polite">${x.description.length}/500</p>
        <div class="field">
          <label for="f-image">Imagem</label>
          <input id="f-image" name="image" type="file" accept="image/png,image/jpeg,image/webp" data-testid="product-image" aria-describedby="f-image-help f-image-error">
          <p class="help" id="f-image-help">PNG, JPEG ou WebP, até 1 MB.</p>
          <p class="field-error" id="f-image-error" data-error-for="image" data-testid="error-product-image" hidden></p>
          <img id="image-preview" alt="Pré-visualização da imagem" width="150" height="120" ${imageData ? `src="${imageData}"` : "hidden"} data-testid="product-image-preview">
        </div>
        <label class="choice"><input type="checkbox" name="featured" value="1" ${x.featured ? "checked" : ""} data-testid="product-featured"> Mostrar nos destaques da página inicial</label>`,
      onOpen: (dialog) => {
        const desc = $("[name=description]", dialog);
        desc.addEventListener("input", () => ($("[data-testid=description-counter]", dialog).textContent = `${desc.value.length}/500`));
        $("[name=image]", dialog).addEventListener("change", (event) => {
          const file = event.target.files[0];
          const box = $("[data-error-for=image]", dialog);
          box.hidden = true;
          imageData = item?.image ?? null;
          if (!file) return;
          if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            box.textContent = "Formato não suportado. Use PNG, JPEG ou WebP.";
            box.hidden = false;
            event.target.value = "";
            return;
          }
          if (file.size > 1024 * 1024) {
            box.textContent = "A imagem não pode ter mais de 1 MB.";
            box.hidden = false;
            event.target.value = "";
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            imageData = reader.result;
            const preview = $("#image-preview", dialog);
            preview.src = imageData;
            preview.hidden = false;
          };
          reader.readAsDataURL(file);
        });
      },
      validate: (form) => {
        const y = Object.fromEntries(new FormData(form));
        const sku = y.sku.trim().toUpperCase();
        const price = Number(y.price);
        const stock = Number(y.stock);
        return {
          name: y.name.trim().length < 3 ? "Indique o nome (pelo menos 3 caracteres)." : null,
          sku: !/^AUR-\d{4}$/.test(sku) ? "SKU inválido (formato AUR-0000)." : db.find("products", (z) => z.sku === sku && z.id !== item?.id) ? "Já existe um produto com este SKU." : null,
          category: y.category ? null : "Escolha a categoria.",
          price: !y.price || !(price > 0) ? "Indique um preço maior que zero." : !/^\d+(\.\d{1,2})?$/.test(y.price) ? "O preço tem no máximo 2 casas decimais." : null,
          oldPrice: y.oldPrice && Number(y.oldPrice) <= price ? "O preço anterior tem de ser maior do que o preço." : null,
          stock: y.stock === "" || !Number.isInteger(stock) || stock < 0 ? "Indique um stock inteiro, 0 ou mais." : null,
        };
      },
    });
    if (!data) return;
    const y = Object.fromEntries(data);
    const values = {
      name: y.name.trim(),
      sku: y.sku.trim().toUpperCase(),
      category: y.category,
      price: round2(Number(y.price)),
      oldPrice: y.oldPrice ? round2(Number(y.oldPrice)) : null,
      stock: Number(y.stock),
      description: y.description.trim(),
      featured: Boolean(y.featured),
      image: imageData,
    };
    try {
      await call("backoffice", () => {
        if (item) return db.update("products", item.id, values);
        const allProducts = db.all("products");
        return db.insert("products", { ...values, id: Math.max(...allProducts.map((z) => z.id)) + 1, rating: 0, variants: null, specs: {}, active: true, createdAt: new Date().toISOString() });
      });
      await render();
      toast(item ? `${values.name} foi atualizado.` : `${values.name} foi criado.`);
    } catch (error) {
      toast(error.message, { type: "error" });
    }
  }

  return guarded(main(), render);
}

// ---------- utilizadores ----------

export function users() {
  setTitle("Utilizadores");
  const me = currentUser();
  const p = params();
  const f = { q: (p.get("q") ?? "").trim(), perfil: p.get("perfil") ?? "", estado: p.get("estado") ?? "" };
  const render = async () => {
    const all = await call("backoffice", () => db.all("users"));
    const q = f.q.toLowerCase();
    const list = all.filter((u) => (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) && (!f.perfil || u.role === f.perfil) && (!f.estado || u.status === f.estado));
    main().innerHTML = `
      <h1>Utilizadores</h1>
      <form method="get" class="card filter-bar" data-testid="admin-users-filters">
        <div class="field"><label for="f-q">Pesquisar</label><input id="f-q" name="q" type="search" value="${esc(f.q)}" placeholder="Nome ou email" data-testid="admin-users-search"></div>
        <div class="field"><label for="f-perfil">Perfil</label><select id="f-perfil" name="perfil" data-testid="admin-users-role">
          ${[["", "Todos"], ["cliente", "Cliente"], ["gestor", "Gestor"]].map(([v2, l]) => `<option value="${v2}" ${v2 === f.perfil ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        <div class="field"><label for="f-estado">Estado</label><select id="f-estado" name="estado" data-testid="admin-users-state">
          ${[["", "Todos"], ["ativo", "Ativo"], ["bloqueado", "Bloqueado"]].map(([v2, l]) => `<option value="${v2}" ${v2 === f.estado ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        <div class="actions"><button type="submit" class="primary" data-testid="admin-users-apply">Filtrar</button><a class="button" href="${href("admin/utilizadores.html")}">Limpar</a></div>
      </form>
      <p data-testid="admin-users-count">${plural(list.length, "utilizador", "utilizadores")}</p>
      <table class="data-table" data-testid="admin-users-table">
        <thead><tr><th scope="col">Nome</th><th scope="col">Email</th><th scope="col">Perfil</th><th scope="col">Estado</th><th scope="col">Registo</th><th scope="col">Encomendas</th><th scope="col"><span class="sr-only">Ações</span></th></tr></thead>
        <tbody>${list.map((u) => {
          const self = u.id === me.id;
          return `
          <tr data-testid="admin-user-row-${u.id}">
            <td>${esc(u.name)}${self ? ' <span class="muted">(você)</span>' : ""}</td>
            <td>${esc(u.email)}</td>
            <td><label class="sr-only" for="role-${u.id}">Perfil de ${esc(u.name)}</label>
              <select id="role-${u.id}" data-role="${u.id}" data-testid="admin-user-role-${u.id}" ${self ? 'disabled title="Não pode alterar o seu próprio perfil."' : ""}>
                <option value="cliente" ${u.role === "cliente" ? "selected" : ""}>Cliente</option><option value="gestor" ${u.role === "gestor" ? "selected" : ""}>Gestor</option></select></td>
            <td><span class="badge ${u.status === "ativo" ? "ok" : "muted"}" data-testid="admin-user-status-${u.id}">${u.status === "ativo" ? "Ativo" : "Bloqueado"}</span></td>
            <td>${date(u.createdAt)}</td>
            <td>${db.all("orders").filter((o) => o.customerId === u.id).length}</td>
            <td>${self ? "" : `<button type="button" data-block="${u.id}" data-testid="admin-user-block-${u.id}">${u.status === "ativo" ? "Bloquear" : "Desbloquear"}</button>`}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>`;
    $("[data-testid=admin-users-filters]").addEventListener("submit", (event) => {
      [...event.target.elements].forEach((el) => { if (el.name && !el.value) el.disabled = true; });
    });
    $$("[data-role]").forEach((select) =>
      select.addEventListener("change", async () => {
        const u = all.find((x) => x.id === Number(select.dataset.role));
        const label = select.value === "gestor" ? "Gestor" : "Cliente";
        if (!(await confirmDialog(`Mudar o perfil de ${u.name} para ${label}?`, { title: "Alterar perfil", confirmLabel: "Alterar perfil" }))) {
          select.value = u.role;
          return;
        }
        await call("backoffice", () => db.update("users", u.id, { role: select.value }));
        await render();
        toast(`${u.name} é agora ${label.toLowerCase()}.`);
      }),
    );
    $$("[data-block]").forEach((button) =>
      button.addEventListener("click", async () => {
        const u = all.find((x) => x.id === Number(button.dataset.block));
        const blocking = u.status === "ativo";
        if (!(await confirmDialog(blocking ? `Bloquear ${u.name}? Deixa de conseguir iniciar sessão.` : `Desbloquear ${u.name}?`, { title: blocking ? "Bloquear utilizador" : "Desbloquear utilizador", confirmLabel: blocking ? "Bloquear" : "Desbloquear", danger: blocking }))) return;
        await call("backoffice", () => db.update("users", u.id, { status: blocking ? "bloqueado" : "ativo" }));
        await render();
        toast(blocking ? `${u.name} foi bloqueado.` : `${u.name} foi desbloqueado.`);
      }),
    );
  };
  return guarded(main(), render);
}

export { CANCELLABLE };
