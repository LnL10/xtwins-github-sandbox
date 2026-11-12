from pytest_bdd import given, parsers, then, when

from pages.catalogo import CatalogoPage


@given('que o visitante está na página "Catálogo"')
def visitante_na_pagina_catalogo(page, app_url):
    CatalogoPage(page).abrir(app_url)


@when(parsers.parse('indica "{minimo}" no campo "Mínimo" e "{maximo}" no campo "Máximo" de "Preço (€)" e carrega em "Aplicar filtros"'))
def indicar_intervalo_e_aplicar_filtros(page, minimo, maximo):
    catalogo = CatalogoPage(page)
    catalogo.indicar_intervalo_de_preco(minimo, maximo)
    catalogo.aplicar_filtros_de_preco()


@then(parsers.parse('aparece a mensagem "{mensagem}"'))
def aparece_mensagem_de_preco_invalido(page, mensagem):
    CatalogoPage(page).verificar_mensagem_de_preco_invalido()
