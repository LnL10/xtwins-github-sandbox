from urllib.parse import urljoin

from playwright.sync_api import Page, expect


class ListaDeTarefas:
    def __init__(self, page: Page):
        self.page = page

    def abrir(self, app_url: str) -> None:
        self.page.goto(urljoin(app_url, "/todomvc/"))

    def escrever_tarefa(self, tarefa: str) -> None:
        self.page.get_by_role("textbox", name="What needs to be done?", exact=True).fill(tarefa)

    def carregar_enter(self) -> None:
        self.page.get_by_role("textbox", name="What needs to be done?", exact=True).press("Enter")

    def verificar_tarefa_visivel(self, tarefa: str) -> None:
        expect(self.page.get_by_text(tarefa, exact=True)).to_be_visible()
