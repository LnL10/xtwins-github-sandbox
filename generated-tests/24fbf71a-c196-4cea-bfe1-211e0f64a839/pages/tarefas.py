from urllib.parse import urljoin

from playwright.sync_api import expect


class TarefasPage:
    page_path = "/xtwins-site-simples/tarefas.html"

    def __init__(self, page, app_url):
        self.page = page
        self.app_url = app_url

    def open(self):
        self.page.goto(urljoin(self.app_url, self.page_path))

    def _column(self, name):
        return self.page.get_by_role("columnheader", name=name)

    def _task_cell(self, titulo):
        return self.page.get_by_role("cell", name=titulo)

    def _task_checkbox(self, titulo):
        return self.page.get_by_role("checkbox", name=f"Concluída: {titulo}")

    def assert_columns(self, names):
        for name in names:
            expect(self._column(name)).to_be_visible()

    def assert_task_cell(self, titulo):
        expect(self._task_cell(titulo)).to_be_visible()

    def assert_task_text(self, titulo):
        expect(self.page.get_by_text(titulo, exact=True)).to_be_visible()

    def assert_summary(self, quantidade, plural):
        nome = "tarefas" if plural else "tarefa"
        expect(self.page.get_by_text(f"{quantidade} {nome} por fazer", exact=True)).to_be_visible()

    def assert_deadline(self, data_limite):
        expect(self.page.get_by_role("cell", name=data_limite)).to_be_visible()

    def assert_strikethrough_title(self, titulo):
        celula = self._task_cell(titulo)
        expect(celula).to_be_visible()
        expect(celula).to_have_css("text-decoration-line", "line-through")

    def check_task(self, titulo):
        self._task_checkbox(titulo).check()

    def uncheck_task(self, titulo):
        self._task_checkbox(titulo).uncheck()

    def assert_task_checkbox_visible(self, titulo):
        expect(self._task_checkbox(titulo)).to_be_visible()

    def click_new_task_link(self):
        self.page.get_by_role("link", name="Nova tarefa").click()

    def assert_status(self, mensagem):
        expect(self.page.get_by_role("status", name=mensagem)).to_be_visible()
