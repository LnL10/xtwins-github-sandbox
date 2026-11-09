"""Backoffice e painel de demonstração."""

import re

from playwright.sync_api import expect


def test_painel_mostra_indicadores(site):
    site.login("gestor")
    page = site.page
    expect(page).to_have_url(re.compile(r"admin/index\.html$"))
    expect(page.get_by_test_id("kpi-pending")).to_contain_text("3")
    expect(page.get_by_test_id("sales-chart")).to_be_visible()
    expect(page.get_by_test_id("low-stock")).to_contain_text("Hub USB-C 7 em 1")


def test_encomenda_paga_e_enviada_com_numero_de_seguimento(site):
    site.login("gestor")
    page = site.open("admin/encomendas.html?estado=Paga&ordem=id-asc")
    page.locator("[data-testid^=admin-order-link-]").first.click()
    page.wait_for_selector("body[data-ready=true]")
    expect(page.get_by_test_id("status-entregue")).to_have_count(0)
    page.get_by_test_id("status-enviada").click()
    dialog = page.get_by_test_id("ship-dialog")
    dialog.get_by_test_id("tracking-number").fill("123")
    dialog.get_by_test_id("dialog-confirm").click()
    expect(dialog.get_by_test_id("error-tracking-number")).to_have_text("Número de seguimento inválido (ex.: RR123456789PT).")
    dialog.get_by_test_id("tracking-number").fill("rr123456789pt")
    dialog.get_by_test_id("dialog-confirm").click()
    expect(page.get_by_test_id("order-status")).to_have_text("Enviada")
    expect(page.get_by_test_id("order-tracking")).to_have_text("RR123456789PT")
    page.get_by_test_id("note-add").click()
    expect(page.get_by_test_id("error-note-text")).to_have_text("Escreva a nota antes de a adicionar.")


def test_acoes_em_massa_ignoram_estados_invalidos(site):
    site.login("gestor")
    page = site.open("admin/encomendas.html?ordem=id-desc")
    expect(page.get_by_test_id("admin-orders-count")).to_have_text("30 encomendas")
    page.get_by_test_id("select-AUR-2026-00030").check()  # Pendente
    page.get_by_test_id("select-AUR-2026-00029").check()  # Paga
    page.get_by_test_id("bulk-action").select_option("Enviada")
    page.get_by_test_id("bulk-apply").click()
    page.get_by_test_id("bulk-dialog").get_by_test_id("dialog-confirm").click()
    expect(page.get_by_test_id("toast-message").last).to_have_text("1 encomenda atualizada. 1 ignorada (o estado não o permite).")


def test_filtro_de_datas_invalido_e_exportacao(site):
    site.login("gestor")
    page = site.open("admin/encomendas.html")
    page.get_by_test_id("admin-orders-from").fill("2026-12-31")
    page.get_by_test_id("admin-orders-to").fill("2026-01-01")
    page.get_by_test_id("admin-orders-apply").click()
    expect(page.get_by_test_id("error-admin-orders-dates")).to_have_text("A data final não pode ser anterior à data inicial.")
    with page.expect_download() as info:
        page.get_by_test_id("export-csv").click()
    assert re.match(r"encomendas-\d{4}-\d{2}-\d{2}\.csv", info.value.suggested_filename)


def test_novo_produto_validacoes_e_desativar(site):
    site.login("gestor")
    page = site.open("admin/produtos.html")
    page.get_by_test_id("product-new").click()
    dialog = page.get_by_test_id("product-dialog")
    dialog.get_by_test_id("product-name").fill("Tablet Aurora Tab")
    dialog.get_by_test_id("product-sku").fill("AUR-1001")
    dialog.get_by_test_id("product-category").select_option("computadores")
    dialog.get_by_test_id("product-price").fill("299")
    dialog.get_by_test_id("product-old-price").fill("250")
    dialog.get_by_test_id("product-stock").fill("2.5")
    dialog.get_by_test_id("dialog-confirm").click()
    expect(dialog.get_by_test_id("error-product-sku")).to_have_text("Já existe um produto com este SKU.")
    expect(dialog.get_by_test_id("error-product-old-price")).to_have_text("O preço anterior tem de ser maior do que o preço.")
    expect(dialog.get_by_test_id("error-product-stock")).to_have_text("Indique um stock inteiro, 0 ou mais.")
    dialog.get_by_test_id("product-sku").fill("AUR-2001")
    dialog.get_by_test_id("product-old-price").fill("349")
    dialog.get_by_test_id("product-stock").fill("5")
    dialog.get_by_test_id("dialog-confirm").click()
    expect(page.get_by_test_id("toast-message").last).to_have_text("Tablet Aurora Tab foi criado.")
    page.get_by_test_id("admin-product-active-126").click()
    expect(page.get_by_test_id("admin-product-active-126")).to_have_attribute("aria-checked", "false")
    site.open("produto.html?id=126")
    expect(page.get_by_test_id("not-found")).to_be_visible()


def test_produto_com_encomendas_nao_se_elimina(site):
    site.login("gestor")
    page = site.open("admin/produtos.html?q=AUR-1001")
    page.get_by_test_id("admin-product-delete-101").click()
    expect(page.get_by_test_id("delete-blocked-dialog")).to_contain_text("tem encomendas associadas")


def test_bloquear_utilizador_impede_login(site):
    site.login("gestor")
    page = site.open("admin/utilizadores.html")
    expect(page.get_by_test_id("admin-user-role-3")).to_be_disabled()
    page.get_by_test_id("admin-user-block-2").click()
    page.get_by_test_id("confirm-dialog").get_by_test_id("dialog-confirm").click()
    expect(page.get_by_test_id("admin-user-status-2")).to_have_text("Bloqueado")
    page.get_by_test_id("logout").click()
    page.wait_for_url(re.compile(r"login\.html"))
    page.wait_for_selector("body[data-ready=true]")
    page.get_by_test_id("login-email").fill("bruno.costa@example.com")
    page.get_by_test_id("login-password").fill("Cliente#2026")
    page.get_by_test_id("login-submit").click()
    expect(page.get_by_test_id("login-error")).to_have_text("Esta conta está bloqueada. Contacte o apoio ao cliente.")


def test_falha_simulada_mostra_erro_e_tentar_novamente(site):
    page = site.open("demo.html")
    page.get_by_test_id("demo-fail-catalogo").check()
    page.get_by_test_id("demo-save").click()
    site.open("catalogo.html")
    expect(page.get_by_test_id("error-state")).to_contain_text("temporariamente indisponível")
    site.open("demo.html")
    page.get_by_test_id("demo-fail-catalogo").uncheck()
    page.get_by_test_id("demo-save").click()
    site.open("catalogo.html")
    expect(page.get_by_test_id("product-list")).to_be_visible()


def test_repor_dados(site):
    site.add_to_cart(110)
    page = site.open("demo.html")
    page.get_by_test_id("demo-reset").click()
    page.get_by_test_id("confirm-dialog").get_by_test_id("dialog-confirm").click()
    expect(page.get_by_test_id("toast-message").last).to_have_text("Os dados foram repostos.")
    site.open("carrinho.html")
    expect(page.get_by_test_id("cart-empty")).to_be_visible()
