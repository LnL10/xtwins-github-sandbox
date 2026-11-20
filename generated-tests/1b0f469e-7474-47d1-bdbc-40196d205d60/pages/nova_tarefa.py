from urllib.parse import urljoin

from playwright.sync_api import expect


class NovaTarefaPage:
    page_path = "/xtwins-site-simples/nova-tarefa.html"

    def __init__(self, page):
        self.page = page

    def verificar_pagina(self, app_url):
        expect(self.page).to_have_url(urljoin(app_url, self.page_path))
