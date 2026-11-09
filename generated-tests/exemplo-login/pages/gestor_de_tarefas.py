from urllib.parse import urljoin

from playwright.sync_api import Page, expect


class PaginaInicioSessao:
    PAGE_PATH = "/xtwins-github-sandbox/login.html"

    def __init__(self, page: Page, app_url: str):
        self.page = page
        self.app_url = app_url
        self.utilizador = page.get_by_label("Utilizador")
        self.palavra_passe = page.get_by_label("Palavra-passe")
        self.botao_entrar = page.get_by_role("button", name="Entrar")
        self.mensagem_erro = page.get_by_test_id("login-error")
        self.mensagem = page.get_by_test_id("flash-message")

    def abrir(self):
        self.page.goto(urljoin(self.app_url, self.PAGE_PATH))

    def preencher(self, utilizador: str, palavra_passe: str):
        self.utilizador.fill(utilizador)
        self.palavra_passe.fill(palavra_passe)

    def iniciar_sessao(self, utilizador: str, palavra_passe: str):
        self.abrir()
        self.preencher(utilizador, palavra_passe)
        self.botao_entrar.click()

    def esta_aberta(self):
        expect(self.page).to_have_url(urljoin(self.app_url, self.PAGE_PATH))
        expect(self.botao_entrar).to_be_visible()


class PaginaTarefas:
    PAGE_PATH = "/xtwins-github-sandbox/tarefas.html"

    def __init__(self, page: Page, app_url: str):
        self.page = page
        self.app_url = app_url
        self.titulo = page.get_by_role("heading", name="Tarefas")
        self.tabela_tarefas = page.get_by_test_id("tasks-table")
        self.utilizador_atual = page.get_by_test_id("current-user")

    def esta_aberta(self):
        expect(self.page).to_have_url(urljoin(self.app_url, self.PAGE_PATH))
        expect(self.titulo).to_be_visible()
        expect(self.tabela_tarefas).to_be_visible()
