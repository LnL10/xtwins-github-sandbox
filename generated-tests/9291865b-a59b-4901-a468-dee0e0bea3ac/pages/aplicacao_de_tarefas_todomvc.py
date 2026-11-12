from urllib.parse import urljoin

from playwright.sync_api import Page, expect


class AplicacaoDeTarefasTodomvcPage:
    page_path = "/todomvc/"

    def __init__(self, page: Page, app_url: str):
        self.page = page
        self.app_url = app_url
        self.campo_what_needs_to_be_done = page.get_by_role(
            "textbox", name="What needs to be done?"
        )

    def abrir(self) -> None:
        self.page.goto(urljoin(self.app_url, self.page_path))

    def escrever_tarefa(self, tarefa: str) -> None:
        self.campo_what_needs_to_be_done.fill(tarefa)

    def primo_enter(self) -> None:
        self.campo_what_needs_to_be_done.press("Enter")

    def verificar_tarefa(self, tarefa: str) -> None:
        expect(self.page.get_by_text(tarefa)).to_be_visible()

    def verificar_contador(self, contador: str) -> None:
        expect(self.page.get_by_text("item left")).to_contain_text(contador)
