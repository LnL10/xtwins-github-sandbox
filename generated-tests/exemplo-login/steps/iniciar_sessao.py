import os

from playwright.sync_api import expect
from pytest_bdd import given, parsers, then, when

from pages.gestor_de_tarefas import PaginaInicioSessao, PaginaTarefas


@given("que estou na página de início de sessão")
def que_estou_na_pagina_de_inicio_de_sessao(page, app_url):
    PaginaInicioSessao(page, app_url).abrir()


@given(parsers.parse('que tenho a sessão iniciada como "{utilizador}"'))
def que_tenho_a_sessao_iniciada_como(page, app_url, utilizador):
    PaginaInicioSessao(page, app_url).iniciar_sessao(utilizador, os.environ["LOGIN_PASSWORD"])
    PaginaTarefas(page, app_url).esta_aberta()


@when(parsers.parse('preencho o utilizador "{utilizador}" e a palavra-passe válida'))
def preencho_o_utilizador_e_a_palavra_passe_valida(page, app_url, utilizador):
    PaginaInicioSessao(page, app_url).preencher(utilizador, os.environ["LOGIN_PASSWORD"])


@when(parsers.parse('preencho o utilizador "{utilizador}" e a palavra-passe "{palavra_passe}"'))
def preencho_o_utilizador_e_a_palavra_passe(page, app_url, utilizador, palavra_passe):
    PaginaInicioSessao(page, app_url).preencher(utilizador, palavra_passe)


@when(parsers.parse('carrego em "{botao}"'))
def carrego_em(page, botao):
    page.get_by_role("button", name=botao).click()


@then("vejo a lista de tarefas")
def vejo_a_lista_de_tarefas(page, app_url):
    PaginaTarefas(page, app_url).esta_aberta()


@then(parsers.parse('vejo o nome "{nome}" no cabeçalho'))
def vejo_o_nome_no_cabecalho(page, app_url, nome):
    expect(PaginaTarefas(page, app_url).utilizador_atual).to_have_text(nome)


@then(parsers.parse('vejo a mensagem de erro "{mensagem}"'))
def vejo_a_mensagem_de_erro(page, app_url, mensagem):
    expect(PaginaInicioSessao(page, app_url).mensagem_erro).to_have_text(mensagem)


@then("estou na página de início de sessão")
def estou_na_pagina_de_inicio_de_sessao(page, app_url):
    PaginaInicioSessao(page, app_url).esta_aberta()


@then(parsers.parse('vejo a mensagem "{mensagem}"'))
def vejo_a_mensagem(page, app_url, mensagem):
    expect(PaginaInicioSessao(page, app_url).mensagem).to_have_text(mensagem)
