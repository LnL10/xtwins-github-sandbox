from pytest_bdd import given, parsers, then

from pages.catalogo import PaginaCatalogo


@given(parsers.parse('o utilizador abre a página "{nome}"'))
def o_utilizador_abre_a_pagina(page, app_url, nome):
    if nome == "Catálogo":
        PaginaCatalogo(page, app_url).abrir()


@then('o utilizador vê o campo "Ordenar por"')
def o_utilizador_ve_o_campo_ordenar_por(page):
    PaginaCatalogo(page).ver_campo_ordenar_por()


@then('o utilizador vê o botão "Aplicar filtros"')
def o_utilizador_ve_o_botao_aplicar_filtros(page):
    PaginaCatalogo(page).ver_botao_aplicar_filtros()
