from urllib.parse import urljoin

from playwright.sync_api import Page, expect


class Cabecalho:
    def __init__(self, page: Page):
        self.page = page
        self.pesquisa = page.get_by_label("Pesquisar produtos")
        self.botao_pesquisar = page.get_by_role("button", name="Pesquisar")
        self.menu_conta = page.get_by_test_id("account-menu")
        self.contador_carrinho = page.get_by_test_id("cart-count")

    def pesquisar(self, termo: str):
        self.pesquisa.fill(termo)
        self.botao_pesquisar.click()


class PaginaInicial:
    PAGE_PATH = "/xtwins-github-sandbox/index.html"

    def __init__(self, page: Page, app_url: str):
        self.page = page
        self.app_url = app_url

    def abrir(self):
        self.page.goto(urljoin(self.app_url, self.PAGE_PATH))


class PaginaInicioSessao:
    PAGE_PATH = "/xtwins-github-sandbox/login.html"

    def __init__(self, page: Page, app_url: str):
        self.page = page
        self.app_url = app_url
        self.email = page.get_by_label("Email")
        self.palavra_passe = page.get_by_test_id("login-password")
        self.mensagem_erro = page.get_by_test_id("login-error")

    def abrir(self):
        self.page.goto(urljoin(self.app_url, self.PAGE_PATH))

    def preencher(self, email: str, palavra_passe: str):
        self.email.fill(email)
        self.palavra_passe.fill(palavra_passe)


PAGINAS = {
    "Início": "/xtwins-github-sandbox/index.html",
    "Catálogo": "/xtwins-github-sandbox/catalogo.html",
    "Carrinho": "/xtwins-github-sandbox/carrinho.html",
    "Iniciar sessão": "/xtwins-github-sandbox/login.html",
}


def abrir_pagina(page: Page, app_url: str, nome: str):
    page.goto(urljoin(app_url, PAGINAS[nome]))


class PaginaCatalogo:
    def __init__(self, page: Page):
        self.page = page
        self.ordenar = page.get_by_label("Ordenar por")
        self.total_resultados = page.get_by_test_id("results-count")
        self.lista_produtos = page.get_by_test_id("product-list")

    def escolher_categoria(self, categoria: str):
        self.page.get_by_test_id("filters-form").get_by_role("radio", name=categoria, exact=True).check()

    def primeiro_produto(self):
        return self.lista_produtos.get_by_role("heading", level=3).first

    def abrir_produto(self, nome: str):
        self.page.get_by_role("link", name=nome, exact=True).click()


class PaginaProduto:
    def __init__(self, page: Page):
        self.page = page
        self.nome = page.get_by_test_id("product-name")
        self.preco = page.get_by_test_id("product-price")
        self.erro_opcao = page.get_by_test_id("error-variant")

    def escolher_opcao(self, opcao: str):
        self.page.get_by_test_id("variants").get_by_role("radio", name=opcao).check()

    def esta_aberta(self, nome: str):
        expect(self.nome).to_have_text(nome)
