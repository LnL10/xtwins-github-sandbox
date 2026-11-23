from pytest_bdd import given, parsers, then

from pages.loja_aurora import PaginaCarrinho


@given(parsers.parse('o utilizador abre a página "{nome}"'))
def o_utilizador_abre_a_pagina(page, app_url, nome):
    paginas = {"Carrinho": PaginaCarrinho}
    pagina = paginas[nome](page, app_url)
    pagina.abrir()


@then(parsers.parse('vê a mensagem "{mensagem}"'))
def ve_a_mensagem(page, app_url, mensagem):
    PaginaCarrinho(page, app_url).verificar_mensagem(mensagem)


@then('vê a ligação "Ver catálogo"')
def ve_a_ligacao_ver_catalogo(page, app_url):
    PaginaCarrinho(page, app_url).verificar_ligacao_catalogo_visivel()
