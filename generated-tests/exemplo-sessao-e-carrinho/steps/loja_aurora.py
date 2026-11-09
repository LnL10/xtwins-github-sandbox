import os

from playwright.sync_api import expect
from pytest_bdd import given, parsers, then, when

from pages.loja_aurora import Cabecalho, PaginaCatalogo, PaginaInicial, PaginaInicioSessao, PaginaProduto, abrir_pagina


@given("que estou na página de início de sessão")
def que_estou_na_pagina_de_inicio_de_sessao(page, app_url):
    PaginaInicioSessao(page, app_url).abrir()


@given(parsers.parse('que pesquisei "{termo}" na loja'))
def que_pesquisei_na_loja(page, app_url, termo):
    PaginaInicial(page, app_url).abrir()
    Cabecalho(page).pesquisar(termo)


@given(parsers.parse('o utilizador abre a página "{nome}"'))
def o_utilizador_abre_a_pagina(page, app_url, nome):
    abrir_pagina(page, app_url, nome)


@when(parsers.parse('preencho o email "{email}" e a palavra-passe válida'))
def preencho_o_email_e_a_palavra_passe_valida(page, app_url, email):
    PaginaInicioSessao(page, app_url).preencher(email, os.environ["APP_PASSWORD"])


@when(parsers.parse('preencho o email "{email}" e a palavra-passe "{palavra_passe}"'))
def preencho_o_email_e_a_palavra_passe(page, app_url, email, palavra_passe):
    PaginaInicioSessao(page, app_url).preencher(email, palavra_passe)


@when(parsers.parse('carrego em "{botao}"'))
def carrego_em(page, botao):
    page.get_by_role("button", name=botao, exact=True).click()


@when(parsers.parse('abro o produto "{nome}"'))
def abro_o_produto(page, nome):
    PaginaCatalogo(page).abrir_produto(nome)
    PaginaProduto(page).esta_aberta(nome)


@when(parsers.parse('escolho a opção "{opcao}"'))
def escolho_a_opcao(page, opcao):
    PaginaProduto(page).escolher_opcao(opcao)


@then(parsers.parse('vejo a saudação "{saudacao}" no cabeçalho'))
def vejo_a_saudacao_no_cabecalho(page, saudacao):
    expect(Cabecalho(page).menu_conta).to_have_text(saudacao)


@then(parsers.parse('vejo a mensagem de erro "{mensagem}"'))
def vejo_a_mensagem_de_erro(page, app_url, mensagem):
    expect(PaginaInicioSessao(page, app_url).mensagem_erro).to_have_text(mensagem)


@then(parsers.re(r"o carrinho do cabeçalho mostra (?P<quantidade>\d+) artigos?"))
def o_carrinho_do_cabecalho_mostra_artigos(page, quantidade):
    expect(Cabecalho(page).contador_carrinho).to_have_text(quantidade)


@then(parsers.cfparse('o preço do produto é "{preco}"'))
def o_preco_do_produto_e(page, preco):
    expect(PaginaProduto(page).preco).to_have_text(preco.replace(" €", " €"))


@then(parsers.parse('vejo o erro da opção "{mensagem}"'))
def vejo_o_erro_da_opcao(page, mensagem):
    expect(PaginaProduto(page).erro_opcao).to_have_text(mensagem)


@when(parsers.parse('escolhe a categoria "{categoria}" nos filtros'))
def escolhe_a_categoria_nos_filtros(page, categoria):
    PaginaCatalogo(page).escolher_categoria(categoria)


@when(parsers.parse('ordena por "{ordem}"'))
def ordena_por(page, ordem):
    PaginaCatalogo(page).ordenar.select_option(label=ordem)


@then(parsers.cfparse('vê "{total}" no total de resultados'))
def ve_no_total_de_resultados(page, total):
    expect(PaginaCatalogo(page).total_resultados).to_contain_text(total)


@then("o primeiro produto é \"Capa Antichoque X1\"")
def o_primeiro_produto_e_capa_antichoque_x1(page):
    expect(PaginaCatalogo(page).primeiro_produto()).to_have_text("Capa Antichoque X1")
