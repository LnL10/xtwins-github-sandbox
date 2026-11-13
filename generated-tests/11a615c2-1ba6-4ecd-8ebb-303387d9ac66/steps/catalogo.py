from pytest_bdd import given, then, parsers

from pages.catalogo import PaginaCatalogo


@given(parsers.parse('o utilizador abre a página "{nome}"'))
def o_utilizador_abre_a_pagina(page, app_url, nome):
    if nome == "Catálogo":
        PaginaCatalogo(page, app_url).abrir()


@then('o utilizador vê o campo "Ordenar por"')
def o_utilizador_ve_o_campo_ordenar_por(page):
    PaginaCatalogo(page).ver_campo_ordenar_por()
