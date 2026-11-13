from pytest_bdd import given, parsers, then, when

from pages.catalogo import CatalogoPage, InicioPage


@given(parsers.parse('o utilizador abre a página "{nome}"'))
def o_utilizador_abre_a_pagina(page, app_url, nome):
    InicioPage(page, app_url).abrir()


@when('o utilizador carrega em "Ver catálogo"')
def o_utilizador_carrega_em_ver_catalogo(page, app_url):
    InicioPage(page, app_url).carregar_em_ver_catalogo()


@then('o utilizador vê o botão "Aplicar filtros"')
def o_utilizador_ve_o_botao_aplicar_filtros(page, app_url):
    CatalogoPage(page, app_url).ver_botao_aplicar_filtros()
