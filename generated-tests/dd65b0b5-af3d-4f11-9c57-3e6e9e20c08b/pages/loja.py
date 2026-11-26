from urllib.parse import urljoin

from playwright.sync_api import Page, expect


class IniciarSessao:
    page_path = "/xtwins-github-sandbox/login.html"

    def esta_apresentada(self, page: Page, app_url: str) -> None:
        expect(page).to_have_url(urljoin(app_url, self.page_path))


class PaginaInicial:
    page_path = "/xtwins-github-sandbox/"

    def pesquisar_produtos(self, page: Page, valor: str) -> None:
        page.get_by_role("searchbox", name="Pesquisar produtos", exact=True).fill(valor)
        page.get_by_role("button", name="Pesquisar", exact=True).click()

    def nome_do_utilizador(self, page: Page) -> None:
        expect(page.get_by_role("button", name="Olá, Ana", exact=True)).to_be_visible()

    def esta_apresentada(self, page: Page, app_url: str) -> None:
        expect(page).to_have_url(urljoin(app_url, self.page_path))


class Catalogo:
    page_path = "/xtwins-github-sandbox/catalogo.html"

    def selecionar_produto(self, page: Page, nome: str) -> None:
        page.get_by_role("link", name=nome, exact=True).click()

    def selecionar_promocoes(self, page: Page, nome: str) -> None:
        page.get_by_role("link", name=nome.capitalize(), exact=True).click()

    def selecionar_ordenacao(self, page: Page) -> None:
        page.get_by_role("combobox", name="Ordenar por", exact=True).select_option(index=1)

    def contar_produtos(self, page: Page, total: int) -> None:
        expect(page.get_by_role("article")).to_have_count(total)

    def apresentar_total(self, page: Page, total: int) -> None:
        expect(page.get_by_text("24 produtos · a mostrar 1–12", exact=True)).to_contain_text(str(total))

    def esta_apresentado(self, page: Page, app_url: str, page_path: str | None = None) -> None:
        expect(page).to_have_url(urljoin(app_url, page_path or self.page_path))


class DetalheDoProduto:
    page_path = "/xtwins-github-sandbox/produto.html?id=107"

    def selecionar_cor(self, page: Page) -> None:
        page.get_by_role("radio", name="Grafite", exact=True).check()

    def definir_quantidade(self, page: Page, quantidade: str) -> None:
        page.get_by_role("spinbutton", name="Quantidade", exact=True).fill(quantidade)

    def verificar_configuracao(self, page: Page, quantidade: str) -> None:
        expect(page.get_by_role("radio", name="Grafite", exact=True)).to_be_checked()
        expect(page.get_by_role("spinbutton", name="Quantidade", exact=True)).to_have_value(quantidade)

    def esta_apresentado(self, page: Page, app_url: str, page_path: str | None = None) -> None:
        expect(page).to_have_url(urljoin(app_url, page_path or self.page_path))


class Carrinho:
    page_path = "/xtwins-github-sandbox/carrinho.html"

    def verificar_estado_vazio(self, page: Page) -> None:
        expect(page.get_by_text("O seu carrinho está vazio.", exact=True)).to_have_text("O seu carrinho está vazio.")
        expect(page.get_by_role("link", name="Ver catálogo", exact=True)).to_be_visible()

    def selecionar_catalogo(self, page: Page) -> None:
        page.get_by_role("link", name="Ver catálogo", exact=True).click()

    def esta_apresentado(self, page: Page, app_url: str) -> None:
        expect(page).to_have_url(urljoin(app_url, self.page_path))


class PainelDeDemonstracao:
    page_path = "/xtwins-github-sandbox/demo.html"

    def selecionar_acao_de_entrada(self, page: Page) -> None:
        page.get_by_role("button", name="Entrar como Ana", exact=True).click()

    def configurar_controlos(self, page: Page) -> str:
        latencia = page.get_by_role("combobox", name="Latência das respostas", exact=True)
        valor_latencia = latencia.select_option(index=1)[0]
        page.get_by_role("checkbox", name="Catálogo e produtos", exact=True).check()
        page.get_by_role("checkbox", name="Checkout e pagamentos", exact=True).check()
        page.get_by_role("checkbox", name="Área de cliente", exact=True).check()
        page.get_by_role("checkbox", name="Backoffice", exact=True).check()
        return valor_latencia

    def guardar(self, page: Page) -> None:
        page.get_by_role("button", name="Guardar", exact=True).click()

    def verificar_controlos_guardados(
        self, page: Page, valor_latencia: str, nome_latencia: str, nome_falhas: str
    ) -> None:
        if nome_latencia != "latência":
            raise ValueError(f"Controlo não reconhecido: {nome_latencia}")
        if nome_falhas != "falhas simuladas":
            raise ValueError(f"Controlo não reconhecido: {nome_falhas}")
        expect(page.get_by_role("combobox", name="Latência das respostas", exact=True)).to_have_value(valor_latencia)
        expect(page.get_by_role("checkbox", name="Catálogo e produtos", exact=True)).to_be_checked()
        expect(page.get_by_role("checkbox", name="Checkout e pagamentos", exact=True)).to_be_checked()
        expect(page.get_by_role("checkbox", name="Área de cliente", exact=True)).to_be_checked()
        expect(page.get_by_role("checkbox", name="Backoffice", exact=True)).to_be_checked()

    def esta_apresentado(self, page: Page, app_url: str) -> None:
        expect(page).to_have_url(urljoin(app_url, self.page_path))


def navegar(page: Page, app_url: str, page_path: str) -> None:
    page.goto(urljoin(app_url, page_path))
