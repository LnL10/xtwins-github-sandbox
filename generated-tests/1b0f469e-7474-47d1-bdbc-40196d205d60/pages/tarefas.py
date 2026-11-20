from urllib.parse import urljoin

from playwright.sync_api import expect


class ListaDeTarefasPage:
    page_path = "/xtwins-site-simples/tarefas.html"

    def __init__(self, page, app_url):
        self.page = page
        self.app_url = app_url

    @property
    def tarefa_header(self):
        return self.page.get_by_role("columnheader", name="Tarefa", exact=True)

    @property
    def prioridade_header(self):
        return self.page.get_by_role("columnheader", name="Prioridade", exact=True)

    @property
    def data_limite_header(self):
        return self.page.get_by_role("columnheader", name="Data limite", exact=True)

    @property
    def acoes_header(self):
        return self.page.get_by_role("columnheader", name="Ações", exact=True)

    @property
    def contador(self):
        return self.page.get_by_role("paragraph")

    @property
    def mensagem_sem_tarefas(self):
        return self.page.get_by_text("Não tem tarefas.", exact=True)

    def open(self):
        self.page.goto(urljoin(self.app_url, self.page_path))

    def apagar_as_tres_tarefas(self):
        self.page.get_by_role("row").filter(has_text="Rever requisitos").get_by_role("button", name="Apagar", exact=True).click()
        self.page.get_by_role("row").filter(has_text="Preparar demonstração").get_by_role("button", name="Apagar", exact=True).click()
        self.page.get_by_role("row").filter(has_text="Enviar relatório semanal").get_by_role("button", name="Apagar", exact=True).click()

    def verificar_colunas(self):
        expect(self.tarefa_header).to_be_visible()
        expect(self.prioridade_header).to_be_visible()
        expect(self.data_limite_header).to_be_visible()
        expect(self.acoes_header).to_be_visible()

    def verificar_contador(self, texto):
        expect(self.contador).to_have_text(texto)

    def selecionar_ligacao(self, ligacao):
        self.page.get_by_role("link", name=ligacao, exact=True).click()

    def verificar_mensagem_sem_tarefas(self):
        expect(self.mensagem_sem_tarefas).to_be_visible()


class NovaTarefaPage:
    page_path = "/xtwins-site-simples/nova-tarefa.html"

    def __init__(self, page, app_url):
        self.page = page
        self.app_url = app_url

    def verificar_pagina_aberta(self):
        expect(self.page).to_have_url(urljoin(self.app_url, self.page_path))
