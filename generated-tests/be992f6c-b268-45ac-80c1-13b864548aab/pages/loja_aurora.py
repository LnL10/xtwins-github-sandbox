from urllib.parse import urljoin

from playwright.sync_api import Page, expect


class PaginaCarrinho:
    PAGE_PATH = "/xtwins-github-sandbox/carrinho.html"

    def __init__(self, page: Page, app_url: str):
        self.page = page
        self.app_url = app_url
        self.ligacao_catalogo = page.get_by_role("link", name="Ver catálogo", exact=True)

    def abrir(self):
        self.page.goto(urljoin(self.app_url, self.PAGE_PATH))

    def verificar_mensagem(self, mensagem: str):
        expect(self.page.get_by_text(mensagem, exact=True)).to_have_text(mensagem)

    def verificar_ligacao_catalogo_visivel(self):
        expect(self.ligacao_catalogo).to_be_visible()
