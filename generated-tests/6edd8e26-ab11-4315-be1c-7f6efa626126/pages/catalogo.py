from urllib.parse import urljoin

from playwright.sync_api import Page, expect


class PaginaCatalogo:
    PAGE_PATH = "/xtwins-github-sandbox/catalogo.html"

    def __init__(self, page: Page, app_url: str | None = None):
        self.page = page
        self.app_url = app_url
        self.ordenar = page.get_by_label("Ordenar por")

    def abrir(self):
        if self.app_url is None:
            raise ValueError("app_url é obrigatório para abrir a página")
        self.page.goto(urljoin(self.app_url, self.PAGE_PATH))

    def ver_ordenar(self):
        expect(self.ordenar).to_be_visible()


def abrir_pagina(page: Page, app_url: str, nome: str):
    if nome == "Catálogo":
        PaginaCatalogo(page, app_url).abrir()
        return
    raise ValueError(f"Página não suportada: {nome}")
