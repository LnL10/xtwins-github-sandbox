from pytest_bdd import given, parsers, then

from pages.catalogo import PaginaCatalogo


@given(parsers.parse('o utilizador abre a página "{nome}"'))
def o_utilizador_abre_a_pagina(page, app_url, nome):
    PaginaCatalogo(page).abrir(app_url)


@then(parsers.parse('o utilizador vê o campo "{campo}"'))
def o_utilizador_ve_o_campo(page, campo):
    PaginaCatalogo(page).ver_ordenar_por(campo)


@then(parsers.parse('o utilizador vê o botão "{botao}"'))
def o_utilizador_ve_o_botao(page, botao):
    PaginaCatalogo(page).ver_aplicar_filtros(botao)
