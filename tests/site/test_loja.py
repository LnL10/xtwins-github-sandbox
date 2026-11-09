"""Loja: navegação, catálogo, produto e carrinho."""

import re

import pytest
from playwright.sync_api import expect

PAGES = [
    "index.html", "catalogo.html", "produto.html?id=101", "carrinho.html", "login.html", "registo.html",
    "recuperar-password.html", "acesso-negado.html", "demo.html",
]


@pytest.mark.parametrize("path", PAGES)
def test_paginas_publicas_abrem_sem_erros(site, path):
    page = site.open(path)
    expect(page.locator("h1").first).to_be_visible()
    expect(page.get_by_test_id("brand")).to_be_visible()


def test_pagina_inexistente_mostra_404(site):
    site.page.goto(site.url("nao-existe.html"))
    expect(site.page.get_by_test_id("page-404")).to_be_visible()


def test_area_de_cliente_exige_sessao(site):
    site.page.goto(site.url("conta/encomendas.html"))
    page = site.page
    page.wait_for_url(re.compile(r"login\.html\?voltar=conta%2Fencomendas\.html"))
    page.wait_for_selector("body[data-ready=true]")
    expect(page.get_by_test_id("login-required")).to_be_visible()
    page.get_by_test_id("login-email").fill("ana.silva@example.com")
    page.get_by_test_id("login-password").fill("Cliente#2026")
    page.get_by_test_id("login-submit").click()
    page.wait_for_url(re.compile(r"conta/encomendas\.html$"))
    expect(page.get_by_test_id("orders-table")).to_be_visible()


def test_cliente_nao_entra_no_backoffice(site):
    site.login("cliente")
    site.page.goto(site.url("admin/index.html"))
    site.page.wait_for_url(re.compile(r"acesso-negado\.html"))
    expect(site.page.get_by_test_id("forbidden")).to_be_visible()


def test_pesquisa_sem_acentos_encontra_produto(site):
    page = site.open("index.html")
    page.get_by_test_id("header-search").fill("auscultadores silenciopro")
    page.get_by_test_id("header-search-submit").click()
    page.wait_for_selector("body[data-ready=true]")
    expect(page.get_by_test_id("results-count")).to_contain_text("1 produto")
    expect(page.get_by_test_id("product-link-109")).to_be_visible()


def test_catalogo_tem_paginacao_e_esconde_produtos_inativos(site):
    page = site.open("catalogo.html")
    expect(page.get_by_test_id("results-count")).to_have_text("24 produtos · a mostrar 1–12")
    page.get_by_test_id("page-2").click()
    page.wait_for_selector("body[data-ready=true]")
    expect(page.get_by_test_id("results-count")).to_have_text("24 produtos · a mostrar 13–24")
    expect(page.get_by_test_id("product-card-125")).to_have_count(0)


def test_filtros_categoria_preco_e_ordenacao(site):
    page = site.open("catalogo.html?categoria=audio")
    page.get_by_test_id("filter-price-max").fill("200")
    page.get_by_test_id("filters-apply").click()
    page.wait_for_selector("body[data-ready=true]")
    expect(page).to_have_url(re.compile(r"categoria=audio.*max=200"))
    page.get_by_test_id("sort").select_option("preco-asc")
    page.wait_for_selector("body[data-ready=true]")
    prices = page.locator("[data-testid=product-list] [data-testid=price]").all_inner_texts()
    values = [float(p.replace("\xa0€", "").replace(".", "").replace(",", ".")) for p in prices]
    assert values == sorted(values) and len(values) == 3
    page.get_by_test_id("chip-max").click()
    page.wait_for_selector("body[data-ready=true]")
    expect(page.get_by_test_id("results-count")).to_contain_text("4 produtos")


def test_preco_minimo_maior_que_maximo(site):
    page = site.open("catalogo.html")
    page.get_by_test_id("filter-price-min").fill("500")
    page.get_by_test_id("filter-price-max").fill("100")
    page.get_by_test_id("filters-apply").click()
    expect(page.get_by_test_id("error-filter-price")).to_have_text("O preço mínimo não pode ser superior ao máximo.")


def test_pesquisa_sem_resultados(site):
    page = site.open("catalogo.html?q=frigorifico")
    expect(page.get_by_test_id("no-results")).to_be_visible()


def test_produto_com_opcoes_exige_escolha(site):
    page = site.open("produto.html?id=105")
    page.get_by_test_id("add-to-cart").click()
    expect(page.get_by_test_id("error-variant")).to_have_text("Escolha uma opção de armazenamento.")
    page.get_by_test_id("variant-2").check()
    expect(page.get_by_test_id("product-price")).to_have_text("799,00\xa0€")
    page.get_by_test_id("add-to-cart").click()
    expect(page.get_by_test_id("cart-count")).to_have_text("1")


def test_nao_deixa_juntar_mais_do_que_o_stock(site):
    page = site.open("produto.html?id=107")  # Fold Z: 2 unidades
    expect(page.get_by_test_id("stock-status")).to_have_text("Últimas unidades (2)")
    page.get_by_test_id("variant-1").check()
    page.get_by_test_id("quantity").fill("3")
    page.get_by_test_id("add-to-cart").click()
    expect(page.get_by_test_id("error-quantity")).to_have_text("Só pode juntar mais 2 unidades deste produto ao carrinho.")


def test_produto_esgotado_nao_se_compra(site):
    page = site.open("produto.html?id=116")
    expect(page.get_by_test_id("stock-status")).to_have_text("Esgotado")
    expect(page.get_by_test_id("add-to-cart")).to_be_disabled()


def test_separadores_e_avaliacao_exigem_sessao(site):
    page = site.open("produto.html?id=101")
    page.get_by_test_id("tab-specs").click()
    expect(page.get_by_test_id("panel-specs")).to_contain_text("14\" 2,8K OLED")
    page.get_by_test_id("tab-reviews").click()
    expect(page.get_by_test_id("review-login")).to_be_visible()


def test_cliente_publica_avaliacao(site):
    site.login("cliente")
    page = site.open("produto.html?id=103")
    page.get_by_test_id("tab-reviews").click()
    page.get_by_test_id("review-submit").click()
    expect(page.get_by_test_id("error-review-rating")).to_be_visible()
    page.get_by_test_id("review-rating-4").check()
    page.get_by_test_id("review-title").fill("Bom monitor")
    page.get_by_test_id("review-comment").fill("Cores boas e suporte firme.")
    page.get_by_test_id("review-submit").click()
    expect(page.get_by_test_id("review-already")).to_be_visible()
    expect(page.get_by_test_id("tab-reviews")).to_have_text("Avaliações (1)")


def test_cupoes_no_carrinho(site):
    site.add_to_cart(110)  # Aurora Buds, 99 €
    page = site.open("carrinho.html")
    page.get_by_test_id("coupon-input").fill("NAOEXISTE")
    page.get_by_test_id("coupon-apply").click()
    expect(page.get_by_test_id("coupon-message")).to_have_text("Código promocional inválido.")
    page.get_by_test_id("coupon-input").fill("verao2026")
    page.get_by_test_id("coupon-apply").click()
    expect(page.get_by_test_id("coupon-message")).to_have_text("Este código promocional expirou.")
    page.get_by_test_id("coupon-input").fill("AURORA10")
    page.get_by_test_id("coupon-apply").click()
    expect(page.get_by_test_id("summary-discount")).to_have_text("−9,90\xa0€")
    expect(page.get_by_test_id("summary-total")).to_have_text("89,10\xa0€")


def test_cupao_com_minimo(site):
    site.add_to_cart(108)  # capa 19,90 €
    page = site.open("carrinho.html")
    page.get_by_test_id("coupon-input").fill("AURORA10")
    page.get_by_test_id("coupon-apply").click()
    expect(page.get_by_test_id("coupon-message")).to_have_text("Este código exige compras a partir de 30,00 €.")
    expect(page.get_by_test_id("free-shipping-hint")).to_have_text("Faltam 30,10\xa0€ para ter portes grátis.")


def test_remover_e_anular(site):
    site.add_to_cart(114)
    page = site.open("carrinho.html")
    page.get_by_test_id("cart-line-remove").click()
    expect(page.get_by_test_id("cart-empty")).to_be_visible()
    page.get_by_test_id("toast-action").click()
    expect(page.get_by_test_id("cart-line-1")).to_be_visible()
    expect(page.get_by_test_id("cart-count")).to_have_text("1")


def test_quantidade_no_carrinho_limitada_ao_stock(site):
    site.add_to_cart(124)  # Hub USB-C: 1 unidade
    page = site.open("carrinho.html")
    page.get_by_test_id("cart-line-quantity").fill("4")
    page.get_by_test_id("cart-line-quantity").press("Tab")
    expect(page.get_by_test_id("toast-message").last).to_have_text("Só pode encomendar 1 unidade de Hub USB-C 7 em 1.")
    expect(page.get_by_test_id("cart-line-quantity")).to_have_value("1")
