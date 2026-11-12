from playwright.sync_api import Page


class CatalogoPage:
    page_path = "/xtwins-github-sandbox/catalogo.html"

    def __init__(self, page: Page):
        self.page = page

    def abrir(self, app_url: str) -> None:
        from urllib.parse import urljoin

        self.page.goto(urljoin(app_url, self.page_path))

    def minimo(self):
        return self.page.get_by_role("spinbutton", name="Mínimo")

    def maximo(self):
        return self.page.get_by_role("spinbutton", name="Máximo")

    def aplicar_filtros(self):
        return self.page.get_by_role("button", name="Aplicar filtros")

    def mensagem_de_preco_invalido(self):
        return self.page.get_by_text("O preço mínimo não pode ser superior ao máximo.")

    def indicar_intervalo_de_preco(self, minimo: str, maximo: str) -> None:
        self.minimo().fill(minimo)
        self.maximo().fill(maximo)

    def aplicar_filtros_de_preco(self) -> None:
        self.aplicar_filtros().click()

    def verificar_mensagem_de_preco_invalido(self) -> None:
        assert self.mensagem_de_preco_invalido().is_visible()
