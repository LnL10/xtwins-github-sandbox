from urllib.parse import urljoin


class InicioPage:
    page_path = "/xtwins-github-sandbox/"

    def __init__(self, page, app_url):
        self.page = page
        self.app_url = app_url
        self.ver_catalogo = page.get_by_role("link", name="Ver catálogo")

    def abrir(self):
        self.page.goto(urljoin(self.app_url, self.page_path))

    def carregar_em_ver_catalogo(self):
        self.ver_catalogo.click()


class CatalogoPage:
    page_path = "/xtwins-github-sandbox/catalogo.html"

    def __init__(self, page, app_url):
        self.page = page
        self.app_url = app_url
        self.aplicar_filtros = page.get_by_role("button", name="Aplicar filtros")

    def ver_botao_aplicar_filtros(self):
        self.aplicar_filtros.wait_for(state="visible")
