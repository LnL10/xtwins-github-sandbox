from pytest_bdd import given, parsers, then

from pages.catalogo import PaginaCatalogo, abrir_pagina


@given(parsers.parse('o utilizador abre a página "{nome}"'))
def o_utilizador_abre_a_pagina(page, app_url, nome):
    abrir_pagina(page, app_url, nome)


@then(parsers.parse('o utilizador vê o campo "{campo}"'))
def o_utilizador_ve_o_campo(page, campo):
    PaginaCatalogo(page).ver_ordenar_por(campo)
