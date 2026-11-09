"""Checkout, autenticação e área de cliente."""

import re

from playwright.sync_api import expect


def fill_delivery(page, postal="1000-001"):
    page.get_by_test_id("name").fill("Rita Convidada")
    page.get_by_test_id("email").fill("rita@example.com")
    page.get_by_test_id("phone").fill("912000111")
    page.get_by_test_id("line").fill("Rua das Flores, 1")
    page.get_by_test_id("postalCode").fill(postal)
    page.get_by_test_id("city").fill("Lisboa")


def pay_with_card(page, number="4242 4242 4242 4242"):
    page.get_by_test_id("payment-cartao").check()
    page.get_by_test_id("holder").fill("Rita Convidada")
    page.get_by_test_id("number").fill(number)
    page.get_by_test_id("expiry").fill("12/30")
    page.get_by_test_id("cvv").fill("123")


def guest_checkout(site):
    page = site.open("checkout.html")
    page.get_by_test_id("checkout-guest").click()
    return page


def test_convidado_paga_com_cartao(site):
    site.add_to_cart(110)
    page = guest_checkout(site)
    page.get_by_test_id("step-next").click()
    expect(page.get_by_test_id("form-errors")).to_have_text("Corrija os 6 campos assinalados.")
    fill_delivery(page)
    page.get_by_test_id("nif").fill("123456780")
    page.get_by_test_id("step-next").click()
    expect(page.get_by_test_id("error-nif")).to_have_text("NIF inválido.")
    page.get_by_test_id("nif").fill("123456789")
    page.get_by_test_id("step-next").click()
    expect(page.get_by_test_id("step-title")).to_have_text("2. Envio")
    expect(page.get_by_test_id("checkout-shipping")).to_have_text("Grátis")
    page.get_by_test_id("step-next").click()
    pay_with_card(page, "4242 4242 4242 4241")
    page.get_by_test_id("step-next").click()
    expect(page.get_by_test_id("error-number")).to_have_text("Número de cartão inválido.")
    pay_with_card(page)
    page.get_by_test_id("step-next").click()
    expect(page.get_by_test_id("review-payment")).to_contain_text("Cartão terminado em 4242")
    page.get_by_test_id("place-order").click()
    expect(page.get_by_test_id("error-accept-terms")).to_be_visible()
    page.get_by_test_id("accept-terms").check()
    page.get_by_test_id("place-order").click()
    page.wait_for_url(re.compile(r"encomenda-confirmada\.html\?id=AUR-2026-00031"))
    expect(page.get_by_test_id("order-status-text")).to_have_text("Paga")
    expect(page.get_by_test_id("cart-count")).to_have_text("0")


def test_cartao_recusado_volta_ao_pagamento(site):
    site.add_to_cart(120)
    page = guest_checkout(site)
    fill_delivery(page)
    page.get_by_test_id("step-next").click()
    page.get_by_test_id("step-next").click()
    pay_with_card(page, "4000 0000 0000 0002")
    page.get_by_test_id("step-next").click()
    page.get_by_test_id("accept-terms").check()
    page.get_by_test_id("place-order").click()
    expect(page.get_by_test_id("checkout-error")).to_contain_text("Pagamento recusado pelo banco")
    expect(page.get_by_test_id("step-title")).to_have_text("3. Pagamento")


def test_ilhas_sem_expresso_e_com_sobretaxa(site):
    site.add_to_cart(108)  # 19,90 €
    page = guest_checkout(site)
    fill_delivery(page, postal="9000-067")
    page.get_by_test_id("step-next").click()
    expect(page.get_by_test_id("shipping-express")).to_be_disabled()
    expect(page.get_by_test_id("checkout-shipping")).to_have_text("8,99\xa0€")
    page.get_by_test_id("shipping-store").check()
    page.get_by_test_id("step-next").click()
    expect(page.get_by_test_id("error-store")).to_have_text("Escolha a loja onde quer levantar a encomenda.")


def test_multibanco_fica_pendente_com_referencia(site):
    site.login("cliente")
    site.add_to_cart(113, variant=2)
    page = site.open("checkout.html")
    expect(page.get_by_test_id("address-m1")).to_be_checked()
    page.get_by_test_id("step-next").click()
    page.get_by_test_id("shipping-express").check()
    expect(page.get_by_test_id("checkout-shipping")).to_have_text("7,99\xa0€")
    page.get_by_test_id("step-next").click()
    page.get_by_test_id("payment-multibanco").check()
    page.get_by_test_id("step-next").click()
    page.get_by_test_id("accept-terms").check()
    page.get_by_test_id("place-order").click()
    page.wait_for_url(re.compile(r"encomenda-confirmada"))
    expect(page.get_by_test_id("mb-entity")).to_have_text("21054")
    page.get_by_test_id("view-order").click()
    page.wait_for_selector("body[data-ready=true]")
    expect(page.get_by_test_id("order-status")).to_have_text("Pendente")


def test_login_errado_e_bloqueio_temporario(site):
    page = site.open("login.html")
    page.get_by_test_id("login-submit").click()
    expect(page.get_by_test_id("error-login-email")).to_have_text("Indique o email.")
    page.get_by_test_id("login-email").fill("ana.silva@example.com")
    for attempt in range(1, 6):
        page.get_by_test_id("login-password").fill("errada")
        page.get_by_test_id("login-submit").click()
        expect(page.get_by_test_id("login-password")).to_have_value("")  # resposta recebida
        if attempt == 3:
            expect(page.get_by_test_id("login-error")).to_contain_text("Restam 2 tentativas")
    expect(page.get_by_test_id("login-error")).to_contain_text("Demasiadas tentativas falhadas")
    expect(page.get_by_test_id("login-submit")).to_be_disabled()


def test_conta_bloqueada_nao_entra(site):
    page = site.open("login.html")
    page.get_by_test_id("login-email").fill("bloqueado@example.com")
    page.get_by_test_id("login-password").fill("Cliente#2026")
    page.get_by_test_id("login-submit").click()
    expect(page.get_by_test_id("login-error")).to_have_text("Esta conta está bloqueada. Contacte o apoio ao cliente.")


def test_registo_valida_e_cria_conta(site):
    page = site.open("registo.html")
    page.get_by_test_id("register-email").fill("ana.silva@example.com")
    page.get_by_test_id("register-password").fill("fraca")
    expect(page.get_by_test_id("password-strength")).to_contain_text("Fraca")
    page.get_by_test_id("register-submit").click()
    expect(page.get_by_test_id("error-register-email")).to_have_text("Já existe uma conta com este email.")
    expect(page.get_by_test_id("error-register-password")).to_have_text("A palavra-passe não cumpre os requisitos.")
    expect(page.get_by_test_id("error-register-terms")).to_be_visible()
    page.get_by_test_id("register-name").fill("Nuno Novo")
    page.get_by_test_id("register-email").fill("nuno.novo@example.com")
    page.get_by_test_id("register-password").fill("Segura#2026")
    expect(page.get_by_test_id("password-strength")).to_contain_text("Forte")
    page.get_by_test_id("register-confirm").fill("Segura#2027")
    page.get_by_test_id("register-terms").check()
    page.get_by_test_id("register-submit").click()
    expect(page.get_by_test_id("error-register-confirm")).to_have_text("As palavras-passe não coincidem.")
    page.get_by_test_id("register-confirm").fill("Segura#2026")
    page.get_by_test_id("register-submit").click()
    page.wait_for_url(re.compile(r"index\.html$"))
    expect(page.get_by_test_id("account-menu")).to_have_text("Olá, Nuno")


def test_recuperar_password_nao_revela_contas(site):
    page = site.open("recuperar-password.html")
    page.get_by_test_id("recover-email").fill("ninguem@example.com")
    page.get_by_test_id("recover-submit").click()
    expect(page.get_by_test_id("recover-sent")).to_contain_text("Se existir uma conta associada a ninguem@example.com")


def test_alterar_palavra_passe_com_atual_errada(site):
    site.login("cliente")
    page = site.open("conta/index.html")
    page.get_by_test_id("password-current").fill("Errada#1")
    page.get_by_test_id("password-new").fill("Nova#20261")
    page.get_by_test_id("password-confirm").fill("Nova#20261")
    page.get_by_test_id("password-save").click()
    expect(page.get_by_test_id("error-password-current")).to_have_text("A palavra-passe atual está incorreta.")


def test_moradas_adicionar_e_predefinir(site):
    site.login("cliente")
    page = site.open("conta/moradas.html")
    page.get_by_test_id("address-add").click()
    dialog = page.get_by_test_id("address-dialog")
    dialog.get_by_test_id("address-label").fill("Casa")
    dialog.get_by_test_id("dialog-confirm").click()
    expect(dialog.get_by_test_id("error-address-label")).to_have_text("Já tem uma morada com este nome.")
    dialog.get_by_test_id("address-label").fill("Trabalho")
    dialog.get_by_test_id("address-line").fill("Rua Augusta, 50")
    dialog.get_by_test_id("address-postal-code").fill("1100053")
    dialog.get_by_test_id("address-city").fill("Lisboa")
    dialog.get_by_test_id("dialog-confirm").click()
    expect(dialog.get_by_test_id("error-address-postal-code")).to_have_text("Código postal inválido (formato 0000-000).")
    dialog.get_by_test_id("address-postal-code").fill("1100-053")
    dialog.get_by_test_id("address-is-default").check()
    dialog.get_by_test_id("dialog-confirm").click()
    expect(page.get_by_test_id("addresses-count")).to_have_text("3 moradas de 5 possíveis.")
    expect(page.locator("[data-testid^=address-card-]").filter(has_text="Trabalho").get_by_test_id("address-default")).to_be_visible()


def test_cancelar_encomenda_devolve_stock(site):
    site.login("cliente")
    page = site.open("conta/encomendas.html?estado=Pendente")
    page.locator("[data-testid^=order-link-]").first.click()
    page.wait_for_selector("body[data-ready=true]")
    page.get_by_test_id("order-cancel").click()
    dialog = page.get_by_test_id("cancel-dialog")
    dialog.get_by_test_id("dialog-confirm").click()
    expect(dialog.get_by_test_id("error-cancel-reason")).to_have_text("Escolha o motivo do cancelamento.")
    dialog.get_by_test_id("cancel-reason").select_option("Encontrei mais barato")
    dialog.get_by_test_id("dialog-confirm").click()
    expect(page.get_by_test_id("order-status")).to_have_text("Cancelada")
    expect(page.get_by_test_id("order-cancel-reason")).to_have_text("Motivo do cancelamento: Encontrei mais barato")
