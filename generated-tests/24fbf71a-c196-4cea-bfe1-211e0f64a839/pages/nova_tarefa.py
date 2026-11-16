from urllib.parse import urljoin

from playwright.sync_api import expect


class NovaTarefaPage:
    page_path = "/xtwins-site-simples/nova-tarefa.html"

    def __init__(self, page, app_url):
        self.page = page
        self.app_url = app_url

    def open(self):
        self.page.goto(urljoin(self.app_url, self.page_path))

    def assert_form(self):
        expect(self.page.get_by_role("heading", name="Nova tarefa")).to_be_visible()
        expect(self.page.get_by_role("textbox", name="Título")).to_be_visible()
        expect(self.page.get_by_role("combobox", name="Prioridade")).to_be_visible()
        expect(self.page.get_by_role("textbox", name="Data limite")).to_be_visible()

    def assert_priority_options(self):
        baixa = self.page.get_by_role("option", name="Baixa")
        media = self.page.get_by_role("option", name="Média")
        alta = self.page.get_by_role("option", name="Alta")
        expect(baixa).to_be_visible()
        expect(media).to_be_visible()
        expect(alta).to_be_visible()
        assert media.evaluate("element => element.selected")

    def fill_title(self, valor):
        self.page.get_by_role("textbox", name="Título").fill(valor)

    def click_save(self):
        self.page.get_by_role("button", name="Guardar").click()
