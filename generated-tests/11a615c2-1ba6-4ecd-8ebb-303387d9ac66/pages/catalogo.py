from urllib.parse import urljoin

from playwright.sync_api import Page, expect


class PaginaCatalogo:
    PAGE_PATH = "/xtwins-github-sandbox/catalogo.html"

    def __init__(self, page: Page, app_url: str | None = None):
        self.page = page
        self.app_url = app_url
        self.ordenar = page.get_by_label("Ordenar por")

    def abrir(self):
        if self.app_url is None:
            raise ValueError("app_url é necessário para abrir a página")
        self.page.goto(urljoin(self.app_url, self.PAGE_PATH))

    def ver_campo_ordenar_por(self):
        expect(self.ordenar).to_be_visible()
