from urllib.parse import urljoin

from playwright.sync_api import expect


class TarefasPage:
    page_path = "/xtwins-site-simples/tarefas.html"

    def __init__(self, page):
        self.page = page

    def abrir(self, app_url):
        self.page.goto(urljoin(app_url, self.page_path))

    def apagar_as_tres_tarefas(self):
        self.page.get_by_role("row").filter(has_text="Rever requisitos").get_by_role("button", name="Apagar", exact=True).click()
        self.page.get_by_role("row").filter(has_text="Preparar demonstração").get_by_role("button", name="Apagar", exact=True).click()
        self.page.get_by_role("row").filter(has_text="Enviar relatório semanal").get_by_role("button", name="Apagar", exact=True).click()

    def ver_mensagem(self, mensagem):
        expect(self.page.get_by_text(mensagem, exact=True)).to_be_visible()

    def verificar_pagina(self, app_url):
        expect(self.page).to_have_url(urljoin(app_url, self.page_path))

    def ver_colunas(self):
        expect(self.page.get_by_role("columnheader", name="Tarefa", exact=True)).to_be_visible()
        expect(self.page.get_by_role("columnheader", name="Prioridade", exact=True)).to_be_visible()
        expect(self.page.get_by_role("columnheader", name="Data limite", exact=True)).to_be_visible()
        expect(self.page.get_by_role("columnheader", name="Ações", exact=True)).to_be_visible()

    def ver_contador(self, contador):
        expect(self.page.get_by_role("paragraph")).to_have_text(contador)

    def selecionar_ligacao_nova_tarefa(self, app_url):
        self.page.get_by_role("link", name="Nova tarefa", exact=True).click()
