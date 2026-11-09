// Loja: página inicial, catálogo e detalhe de produto.
import { PAGE_SIZE, href, currentPath } from "../config.js";
import { call } from "../core/api.js";
import { currentUser } from "../core/auth.js";
import { addToCart, availableToAdd, unitPrice, MAX_PER_LINE } from "../core/cart.js";
import { breadcrumb, pagination, productCard, stockInfo } from "../core/components.js";
import { date, esc, eur, plural, stars } from "../core/format.js";
import { productImage } from "../core/images.js";
import { db } from "../core/store.js";
import { $, $$, errorState, loading, main, notFound, params, setTitle, showErrors, toast, updateCartBadge } from "../core/ui.js";

const activeProducts = () => db.all("products").filter((p) => p.active);
const reviewCounts = () =>
  db.all("reviews").reduce((acc, r) => ({ ...acc, [r.productId]: (acc[r.productId] ?? 0) + 1 }), {});

function wireQuickAdd(container) {
  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-to-cart]");
    if (!button) return;
    const product = db.find("products", (p) => p.id === Number(button.dataset.addToCart));
    if (!product || availableToAdd(product) < 1) {
      toast("Não há mais unidades disponíveis deste produto.", { type: "error" });
      return;
    }
    addToCart(product, null, 1);
    updateCartBadge();
    toast(`${product.name} foi adicionado ao carrinho.`, { action: { label: "Ver carrinho", onClick: () => (window.location.href = href("carrinho.html")) } });
  });
}

// ---------- página inicial ----------

export async function home() {
  setTitle("Início");
  const container = main();
  const load = async () => {
    loading(container);
    try {
      const { featured, promos, categories } = await call("catalogo", () => {
        const products = activeProducts();
        return {
          featured: products.filter((p) => p.featured).slice(0, 8),
          promos: products.filter((p) => p.oldPrice).sort((a, b) => b.oldPrice - b.price - (a.oldPrice - a.price)).slice(0, 4),
          categories: db.all("categories"),
        };
      });
      const counts = reviewCounts();
      container.innerHTML = `
        <section class="hero" data-testid="hero">
          <div>
            <h1>Tecnologia para todos os dias</h1>
            <p>Campanha de novembro: <strong>10% de desconto</strong> em compras a partir de 30 € com o código <code data-testid="hero-coupon">AURORA10</code>.</p>
            <p>Portes grátis em envios normais a partir de 50 €.</p>
            <a class="button primary" href="${href("catalogo.html")}" data-testid="hero-cta">Ver catálogo</a>
          </div>
        </section>
        <section aria-labelledby="cat-title">
          <h2 id="cat-title">Categorias</h2>
          <ul class="category-grid">
            ${categories.map((c) => `<li><a href="${href(`catalogo.html?categoria=${c.id}`)}" data-testid="category-${c.id}">${esc(c.name)}</a></li>`).join("")}
          </ul>
        </section>
        <section aria-labelledby="featured-title">
          <h2 id="featured-title">Destaques</h2>
          <div class="product-grid" data-testid="featured-products">${featured.map((p) => productCard(p, { reviewsCount: counts[p.id] ?? 0 })).join("")}</div>
        </section>
        <section aria-labelledby="promo-title">
          <h2 id="promo-title">Promoções</h2>
          <div class="product-grid" data-testid="promo-products">${promos.map((p) => productCard(p, { reviewsCount: counts[p.id] ?? 0 })).join("")}</div>
          <p><a href="${href("catalogo.html?promocoes=1")}">Ver todas as promoções</a></p>
        </section>`;
      wireQuickAdd(container);
    } catch (error) {
      errorState(container, error, load);
    }
  };
  await load();
}

// ---------- catálogo ----------

const SORTS = {
  relevancia: "Relevância",
  "preco-asc": "Preço: mais baixo",
  "preco-desc": "Preço: mais alto",
  avaliacao: "Melhor avaliação",
  novidades: "Novidades",
};

export async function catalog() {
  const p = params();
  const filters = {
    q: (p.get("q") ?? "").trim(),
    categoria: p.get("categoria") ?? "",
    min: p.get("min") ?? "",
    max: p.get("max") ?? "",
    avaliacao: p.get("avaliacao") ?? "",
    stock: p.get("stock") === "1",
    promocoes: p.get("promocoes") === "1",
    ordem: SORTS[p.get("ordem")] ? p.get("ordem") : "relevancia",
    vista: p.get("vista") === "lista" ? "lista" : "grelha",
    pagina: Math.max(1, Number.parseInt(p.get("pagina") ?? "1", 10) || 1),
  };
  const categories = db.all("categories");
  const category = categories.find((c) => c.id === filters.categoria);
  const title = filters.promocoes ? "Promoções" : category ? category.name : filters.q ? `Pesquisa: "${filters.q}"` : "Catálogo";
  setTitle(title);

  const container = main();
  container.innerHTML = `
    ${breadcrumb([["Início", href("index.html")], [title]])}
    <h1 data-testid="catalog-title">${esc(title)}</h1>
    <div class="catalog">
      <aside class="filters card" aria-labelledby="filters-title">
        <h2 id="filters-title">Filtros</h2>
        <form method="get" action="${href("catalogo.html")}" data-testid="filters-form" novalidate>
          ${filters.q ? `<input type="hidden" name="q" value="${esc(filters.q)}">` : ""}
          ${filters.promocoes ? '<input type="hidden" name="promocoes" value="1">' : ""}
          <input type="hidden" name="ordem" value="${filters.ordem}">
          <input type="hidden" name="vista" value="${filters.vista}">
          <fieldset>
            <legend>Categoria</legend>
            <label class="choice"><input type="radio" name="categoria" value="" ${!filters.categoria ? "checked" : ""} data-testid="filter-category-all"> Todas</label>
            ${categories.map((c) => `<label class="choice"><input type="radio" name="categoria" value="${c.id}" ${filters.categoria === c.id ? "checked" : ""} data-testid="filter-category-${c.id}"> ${esc(c.name)}</label>`).join("")}
          </fieldset>
          <fieldset>
            <legend>Preço (€)</legend>
            <div class="row">
              <div class="field"><label for="f-min">Mínimo</label><input id="f-min" name="min" type="number" min="0" step="1" value="${esc(filters.min)}" data-testid="filter-price-min"></div>
              <div class="field"><label for="f-max">Máximo</label><input id="f-max" name="max" type="number" min="0" step="1" value="${esc(filters.max)}" data-testid="filter-price-max"></div>
            </div>
            <p class="field-error" data-error-for="max" data-testid="error-filter-price" hidden></p>
          </fieldset>
          <div class="field">
            <label for="f-rating">Avaliação mínima</label>
            <select id="f-rating" name="avaliacao" data-testid="filter-rating">
              <option value="">Qualquer</option>
              ${[4, 3].map((n) => `<option value="${n}" ${filters.avaliacao === String(n) ? "selected" : ""}>${n} estrelas ou mais</option>`).join("")}
            </select>
          </div>
          <label class="choice"><input type="checkbox" name="stock" value="1" ${filters.stock ? "checked" : ""} data-testid="filter-in-stock"> Só produtos com stock</label>
          <div class="actions">
            <button type="submit" class="primary" data-testid="filters-apply">Aplicar filtros</button>
            <a href="${href("catalogo.html")}" class="button" data-testid="filters-clear">Limpar filtros</a>
          </div>
        </form>
      </aside>
      <section class="results" aria-labelledby="catalog-title">
        <div class="results-bar">
          <p data-testid="results-count" aria-live="polite"></p>
          <div class="row">
            <label for="sort">Ordenar por</label>
            <select id="sort" data-testid="sort">${Object.entries(SORTS).map(([v, l]) => `<option value="${v}" ${filters.ordem === v ? "selected" : ""}>${l}</option>`).join("")}</select>
            <div class="toggle" role="group" aria-label="Vista">
              <a href="${withParam("vista", "grelha")}" ${filters.vista === "grelha" ? 'aria-current="true"' : ""} data-testid="view-grid">Grelha</a>
              <a href="${withParam("vista", "lista")}" ${filters.vista === "lista" ? 'aria-current="true"' : ""} data-testid="view-list">Lista</a>
            </div>
          </div>
        </div>
        <div data-testid="active-filters" class="chips"></div>
        <div id="results"></div>
      </section>
    </div>`;

  $("#sort").addEventListener("change", (event) => {
    window.location.href = withParam("ordem", event.target.value, true);
  });
  $("[data-testid=filters-form]").addEventListener("submit", (event) => {
    const form = event.target;
    const min = form.elements.min.value;
    const max = form.elements.max.value;
    if (min && max && Number(min) > Number(max)) {
      event.preventDefault();
      showErrors(form, { max: "O preço mínimo não pode ser superior ao máximo." }, { summary: false });
      return;
    }
    // Campos vazios não vão para o URL.
    [...form.elements].forEach((el) => {
      if (el.name && !el.value && el.type !== "radio") el.disabled = true;
    });
    if (!form.elements.categoria.value) [...form.elements.categoria].forEach((r) => (r.disabled = true));
  });

  renderChips(filters, category);
  const results = $("#results");
  const load = async () => {
    loading(results, "A carregar produtos…");
    try {
      const list = await call("catalogo", () => filterProducts(filters));
      renderResults(results, list, filters);
    } catch (error) {
      errorState(results, error, load);
    }
  };
  await load();
}

function withParam(name, value, resetPage = false) {
  const p = new URLSearchParams(window.location.search);
  if (value) p.set(name, value);
  else p.delete(name);
  if (resetPage) p.delete("pagina");
  const query = p.toString();
  return href(`catalogo.html${query ? `?${query}` : ""}`);
}

function filterProducts(f) {
  const terms = f.q.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").split(/\s+/).filter(Boolean);
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  let list = activeProducts().filter((p) => {
    if (f.categoria && p.category !== f.categoria) return false;
    if (f.min && p.price < Number(f.min)) return false;
    if (f.max && p.price > Number(f.max)) return false;
    if (f.avaliacao && p.rating < Number(f.avaliacao)) return false;
    if (f.stock && p.stock <= 0) return false;
    if (f.promocoes && !p.oldPrice) return false;
    if (terms.length) {
      const text = norm(`${p.name} ${p.description} ${p.sku}`);
      if (!terms.every((t) => text.includes(t))) return false;
    }
    return true;
  });
  const sorters = {
    "preco-asc": (a, b) => a.price - b.price,
    "preco-desc": (a, b) => b.price - a.price,
    avaliacao: (a, b) => b.rating - a.rating,
    novidades: (a, b) => b.createdAt.localeCompare(a.createdAt),
    relevancia: (a, b) => Number(b.featured) - Number(a.featured) || Number(b.stock > 0) - Number(a.stock > 0),
  };
  return [...list].sort(sorters[f.ordem]);
}

function renderChips(filters, category) {
  const chips = [];
  if (filters.q) chips.push(["q", `Pesquisa: ${filters.q}`]);
  if (category) chips.push(["categoria", category.name]);
  if (filters.min) chips.push(["min", `Desde ${filters.min} €`]);
  if (filters.max) chips.push(["max", `Até ${filters.max} €`]);
  if (filters.avaliacao) chips.push(["avaliacao", `${filters.avaliacao}+ estrelas`]);
  if (filters.stock) chips.push(["stock", "Com stock"]);
  if (filters.promocoes) chips.push(["promocoes", "Promoções"]);
  $("[data-testid=active-filters]").innerHTML = chips
    .map(([name, label]) => `<a class="chip" href="${withParam(name, "", true)}" data-testid="chip-${name}" aria-label="Remover filtro ${esc(label)}">${esc(label)} ×</a>`)
    .join("");
}

function renderResults(container, list, filters) {
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.pagina, pages);
  const slice = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  $("[data-testid=results-count]").textContent = total
    ? `${plural(total, "produto", "produtos")} · a mostrar ${from}–${from + slice.length - 1}`
    : "0 produtos";
  if (!total) {
    container.innerHTML = `
      <div class="card empty" data-testid="no-results">
        <h2>Não encontrámos produtos</h2>
        <p>Experimente outros termos de pesquisa ou <a href="${href("catalogo.html")}">limpe os filtros</a>.</p>
      </div>`;
    return;
  }
  const counts = reviewCounts();
  container.innerHTML = `
    <div class="product-grid ${filters.vista === "lista" ? "as-list" : ""}" data-testid="product-list">${slice.map((p) => productCard(p, { reviewsCount: counts[p.id] ?? 0 })).join("")}</div>
    ${pagination(total, page, PAGE_SIZE, (n) => withParam("pagina", n === 1 ? "" : String(n)))}`;
  wireQuickAdd(container);
}

// ---------- produto ----------

export async function product() {
  const id = Number(params().get("id"));
  const container = main();
  const load = async () => {
    loading(container);
    try {
      const data = await call("catalogo", () => {
        const item = db.find("products", (p) => p.id === id && p.active);
        if (!item) return null;
        return {
          item,
          category: db.find("categories", (c) => c.id === item.category),
          reviews: db.all("reviews").filter((r) => r.productId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
          related: activeProducts().filter((p) => p.category === item.category && p.id !== id).slice(0, 4),
        };
      });
      if (!data) {
        setTitle("Produto não encontrado");
        notFound(container, "Produto não encontrado", href("catalogo.html"), "Voltar ao catálogo");
        return;
      }
      renderProduct(container, data);
    } catch (error) {
      errorState(container, error, load);
    }
  };
  await load();
}

function renderProduct(container, { item, category, reviews, related }) {
  setTitle(item.name);
  const stock = stockInfo(item);
  const user = currentUser();
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : item.rating;
  const counts = reviewCounts();
  container.innerHTML = `
    ${breadcrumb([["Início", href("index.html")], [category.name, href(`catalogo.html?categoria=${category.id}`)], [item.name]])}
    <article class="product-detail" data-testid="product-detail">
      <div class="gallery">
        <img id="main-image" src="${productImage(item, 0)}" alt="${esc(item.name)}" width="600" height="480" data-testid="main-image">
        <div class="thumbs" role="group" aria-label="Imagens do produto">
          ${[0, 1, 2, 3].map((v) => `<button type="button" data-view="${v}" aria-label="Imagem ${v + 1}" aria-pressed="${v === 0}" data-testid="thumb-${v + 1}"><img src="${productImage(item, v)}" alt="" width="80" height="64"></button>`).join("")}
        </div>
      </div>
      <div class="buy-box">
        <h1 data-testid="product-name">${esc(item.name)}</h1>
        <p class="muted">Ref.: <span data-testid="product-sku">${esc(item.sku)}</span></p>
        <p class="rating">${stars(average)} <a href="#tab-reviews" data-testid="reviews-link">${plural(reviews.length, "avaliação", "avaliações")}</a></p>
        <p class="big-price"><span data-testid="product-price">${eur(item.price)}</span>${item.oldPrice ? ` <s class="old-price" data-testid="product-old-price">${eur(item.oldPrice)}</s>` : ""}</p>
        <p class="muted">IVA incluído</p>
        <p><span class="badge ${stock.cls}" data-testid="stock-status">${stock.label}</span></p>
        <form id="buy-form" novalidate>
          ${item.variants ? `
            <fieldset class="variants" data-testid="variants">
              <legend>${esc(item.variants.label)} <span class="req" aria-hidden="true">*</span></legend>
              ${item.variants.options.map((o, i) => `
                <label class="pill"><input type="radio" name="variant" value="${esc(o.name)}" data-testid="variant-${i + 1}">
                  ${esc(o.name)}${o.delta ? ` <span class="muted">(+${eur(o.delta)})</span>` : ""}</label>`).join("")}
              <p class="field-error" data-error-for="variant" data-testid="error-variant" hidden></p>
            </fieldset>` : ""}
          <div class="field qty">
            <label for="f-quantity">Quantidade</label>
            <div class="stepper">
              <button type="button" data-step="-1" aria-label="Diminuir quantidade" data-testid="qty-decrease">−</button>
              <input id="f-quantity" name="quantity" type="number" min="1" max="${MAX_PER_LINE}" value="1" inputmode="numeric" data-testid="quantity">
              <button type="button" data-step="1" aria-label="Aumentar quantidade" data-testid="qty-increase">+</button>
            </div>
            <p class="field-error" data-error-for="quantity" data-testid="error-quantity" hidden></p>
          </div>
          <button type="submit" class="primary large" data-testid="add-to-cart" ${stock.available ? "" : "disabled"}>
            ${stock.available ? "Adicionar ao carrinho" : "Esgotado"}
          </button>
        </form>
        <ul class="perks">
          <li>Portes grátis a partir de 50 € (envio normal, Portugal continental)</li>
          <li>Devolução gratuita em 30 dias</li>
          <li>Garantia de 3 anos</li>
        </ul>
      </div>
    </article>

    <section class="tabs" data-testid="product-tabs">
      <div role="tablist" aria-label="Informação do produto">
        <button role="tab" id="tab-description" aria-controls="panel-description" aria-selected="true" data-testid="tab-description">Descrição</button>
        <button role="tab" id="tab-specs" aria-controls="panel-specs" aria-selected="false" tabindex="-1" data-testid="tab-specs">Especificações</button>
        <button role="tab" id="tab-reviews" aria-controls="panel-reviews" aria-selected="false" tabindex="-1" data-testid="tab-reviews">Avaliações (${reviews.length})</button>
      </div>
      <div role="tabpanel" id="panel-description" aria-labelledby="tab-description" data-testid="panel-description"><p>${esc(item.description)}</p></div>
      <div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs" hidden data-testid="panel-specs">
        <table class="specs"><tbody>${Object.entries(item.specs).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>
      </div>
      <div role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews" hidden data-testid="panel-reviews">
        ${reviewsBlock(item, reviews, user)}
      </div>
    </section>

    ${related.length ? `
      <section aria-labelledby="related-title">
        <h2 id="related-title">Produtos relacionados</h2>
        <div class="product-grid" data-testid="related-products">${related.map((p) => productCard(p, { reviewsCount: counts[p.id] ?? 0 })).join("")}</div>
      </section>` : ""}`;

  // galeria
  $$(".thumbs button").forEach((button) =>
    button.addEventListener("click", () => {
      $("#main-image").src = productImage(item, Number(button.dataset.view));
      $$(".thumbs button").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    }),
  );

  // preço por variante
  $$("input[name=variant]").forEach((radio) =>
    radio.addEventListener("change", () => {
      $("[data-testid=product-price]").textContent = eur(unitPrice(item, radio.value));
    }),
  );

  // quantidade
  const qty = $("#f-quantity");
  $$(".stepper button").forEach((button) =>
    button.addEventListener("click", () => {
      const next = (Number.parseInt(qty.value, 10) || 1) + Number(button.dataset.step);
      qty.value = Math.min(MAX_PER_LINE, Math.max(1, next));
    }),
  );

  $("#buy-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    const errors = {};
    const variant = item.variants ? form.elements.variant.value : null;
    if (item.variants && !variant) errors.variant = `Escolha uma opção de ${item.variants.label.toLowerCase()}.`;
    const quantity = Number(form.elements.quantity.value);
    const available = availableToAdd(item);
    if (!Number.isInteger(quantity) || quantity < 1) errors.quantity = "Indique uma quantidade de pelo menos 1.";
    else if (quantity > MAX_PER_LINE) errors.quantity = `Pode encomendar no máximo ${MAX_PER_LINE} unidades de cada produto.`;
    else if (quantity > available) {
      errors.quantity = available
        ? `Só pode juntar mais ${plural(available, "unidade", "unidades")} deste produto ao carrinho.`
        : "Já tem no carrinho todas as unidades disponíveis deste produto.";
    }
    if (!showErrors(form, errors, { summary: false })) return;
    addToCart(item, variant, quantity);
    updateCartBadge();
    toast(`${plural(quantity, "unidade", "unidades")} de ${item.name} ${quantity === 1 ? "foi adicionada" : "foram adicionadas"} ao carrinho.`, {
      action: { label: "Ver carrinho", onClick: () => (window.location.href = href("carrinho.html")) },
    });
  });

  wireTabs();
  wireReviewForm(item, user);
  wireQuickAdd($("[data-testid=related-products]") ?? document.createElement("div"));
  if (window.location.hash === "#avaliacoes") selectTab($("#tab-reviews"));
  $("[data-testid=reviews-link]").addEventListener("click", (event) => {
    event.preventDefault();
    selectTab($("#tab-reviews"));
    $("#tab-reviews").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function reviewsBlock(item, reviews, user) {
  const already = user && reviews.some((r) => r.userId === user.id);
  const list = reviews.length
    ? `<ul class="reviews" data-testid="reviews-list">${reviews
        .map((r) => `
          <li data-testid="review-${r.id}">
            <p>${stars(r.rating)} <strong>${esc(r.title)}</strong></p>
            <p>${esc(r.comment)}</p>
            <p class="muted">${esc(r.author)} · ${date(r.createdAt)}</p>
          </li>`)
        .join("")}</ul>`
    : '<p data-testid="no-reviews">Este produto ainda não tem avaliações.</p>';
  let form;
  if (!user) {
    form = `<p data-testid="review-login"><a href="${href(`login.html?voltar=${encodeURIComponent(currentPath())}`)}">Inicie sessão</a> para avaliar este produto.</p>`;
  } else if (already) {
    form = '<p data-testid="review-already">Já avaliou este produto. Obrigado!</p>';
  } else {
    form = `
      <form id="review-form" class="card" novalidate data-testid="review-form">
        <h3>Escrever uma avaliação</h3>
        <fieldset>
          <legend>Classificação <span class="req" aria-hidden="true">*</span></legend>
          <div class="rating-input">
            ${[1, 2, 3, 4, 5].map((n) => `<label class="pill"><input type="radio" name="rating" value="${n}" data-testid="review-rating-${n}"> ${n} ★</label>`).join("")}
          </div>
          <p class="field-error" data-error-for="rating" data-testid="error-review-rating" hidden></p>
        </fieldset>
        <div class="field">
          <label for="f-review-title">Título <span class="req" aria-hidden="true">*</span></label>
          <input id="f-review-title" name="title" maxlength="80" data-testid="review-title">
          <p class="field-error" data-error-for="title" data-testid="error-review-title" hidden></p>
        </div>
        <div class="field">
          <label for="f-review-comment">Comentário <span class="req" aria-hidden="true">*</span></label>
          <textarea id="f-review-comment" name="comment" maxlength="1000" data-testid="review-comment"></textarea>
          <p class="help">Entre 10 e 1000 caracteres.</p>
          <p class="field-error" data-error-for="comment" data-testid="error-review-comment" hidden></p>
        </div>
        <button type="submit" class="primary" data-testid="review-submit">Publicar avaliação</button>
      </form>`;
  }
  return `<h2 class="sr-only">Avaliações</h2>${list}${form}`;
}

function wireReviewForm(item, user) {
  const form = $("#review-form");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const rating = form.elements.rating.value;
    const title = form.elements.title.value.trim();
    const comment = form.elements.comment.value.trim();
    const errors = {
      rating: rating ? null : "Escolha uma classificação de 1 a 5.",
      title: title ? null : "Indique um título.",
      comment: comment.length < 10 ? "O comentário tem de ter pelo menos 10 caracteres." : null,
    };
    if (!showErrors(form, errors, { summary: false })) return;
    const button = $("[data-testid=review-submit]", form);
    button.disabled = true;
    try {
      await call("catalogo", () => {
        const reviews = db.all("reviews");
        db.insert("reviews", {
          id: Math.max(0, ...reviews.map((r) => r.id)) + 1,
          productId: item.id,
          userId: user.id,
          author: user.name,
          rating: Number(rating),
          title,
          comment,
          createdAt: new Date().toISOString(),
        });
      });
      const reviews = db.all("reviews").filter((r) => r.productId === item.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      $("#panel-reviews").innerHTML = reviewsBlock(item, reviews, user);
      $("#tab-reviews").textContent = `Avaliações (${reviews.length})`;
      toast("Obrigado! A sua avaliação foi publicada.");
    } catch (error) {
      button.disabled = false;
      toast(error.message, { type: "error" });
    }
  });
}

function selectTab(tab) {
  $$("[role=tab]").forEach((t) => {
    const selected = t === tab;
    t.setAttribute("aria-selected", String(selected));
    t.tabIndex = selected ? 0 : -1;
    $(`#${t.getAttribute("aria-controls")}`).hidden = !selected;
  });
}

function wireTabs() {
  const tabs = $$("[role=tab]");
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      const delta = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!delta) return;
      const next = tabs[(i + delta + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });
}
