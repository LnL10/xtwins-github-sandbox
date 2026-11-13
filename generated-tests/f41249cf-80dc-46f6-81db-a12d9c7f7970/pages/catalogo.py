from urllib.parse import urljoin

from playwright.sync_api import Page, expect


class PaginaCatalogo:
    PAGE_PATH = "/xtwins-github-sandbox/catalogo.html"

    def __init__(self, page: Page):
        self.page = page
        self.ordenar = page.get_by_label("Ordenar por")
        self.aplicar_filtros = page.get_by_role("button", name="Aplicar filtros")
        self.total_resultados = page.get_by_test_id("results-count")
        self.lista_produtos = page.get_by_test_id("product-list")

    def abrir(self, app_url: str):
        self.page.goto(urljoin(app_url, self.PAGE_PATH))

    def escolher_categoria(self, categoria: str):
        self.page.get_by_test_id("filters-form").get_by_role("radio", name=categoria, exact=True).check()

    def primeiro_produto(self):
        return self.lista_produtos.get_by_role("heading", level=3).first

    def abrir_produto(self, nome: str):
        self.page.get_by_role("link", name=nome, exact=True).click()

    def ver_ordenar_por(self, campo: str):
        expect(self.ordenar).to_be_visible()

    def ver_aplicar_filtros(self, botao: str):
        expect(self.aplicar_filtros).to_be_visible()
