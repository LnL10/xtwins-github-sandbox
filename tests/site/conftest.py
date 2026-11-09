"""Testes da própria Loja Aurora (não são testes gerados pelo xTwins).

Por omissão servem a pasta website/ num servidor local, no mesmo caminho do GitHub Pages.
Para testar o site publicado: SITE_URL=https://lnl10.github.io/xtwins-github-sandbox/ pytest tests/site
"""

import json
import os
import socket
import sys
import threading
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path

import pytest
from playwright.sync_api import Page, sync_playwright

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from serve import PREFIX, WEBSITE, Handler  # noqa: E402

ACCOUNTS = {
    "cliente": ("ana.silva@example.com", "Cliente#2026"),
    "gestor": ("gestor@example.com", "Gestor#2026"),
    "bloqueado": ("bloqueado@example.com", "Cliente#2026"),
}


@pytest.fixture(scope="session")
def site_url():
    if os.environ.get("SITE_URL"):
        yield os.environ["SITE_URL"].rstrip("/") + "/"
        return
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        port = s.getsockname()[1]
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(WEBSITE)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{port}{PREFIX}/"
    server.shutdown()


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture
def page(browser, site_url):
    context = browser.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True)
    # Sem latência simulada nos testes (o painel de demonstração pode mudar isto noutros testes).
    context.add_init_script(
        "try { if (!localStorage.getItem('aurora:demo')) localStorage.setItem('aurora:demo', "
        + json.dumps(json.dumps({"latency": 0, "failures": {}}))
        + "); } catch (e) {}"
    )
    page = context.new_page()
    page.errors = []
    page.on("pageerror", lambda error: page.errors.append(str(error)))
    yield page
    context.close()
    assert not page.errors, f"Erros de JavaScript: {page.errors}"


class Site:
    def __init__(self, page: Page, base: str):
        self.page = page
        self.base = base

    def url(self, path=""):
        return self.base + path

    def open(self, path="index.html"):
        self.page.goto(self.url(path))
        self.page.wait_for_selector("body[data-ready=true]")
        return self.page

    def login(self, who="cliente"):
        email, password = ACCOUNTS[who]
        self.open("login.html")
        self.page.get_by_label("Email").fill(email)
        self.page.locator("#f-password").fill(password)
        self.page.get_by_role("button", name="Entrar").click()
        self.page.wait_for_url(lambda url: "login.html" not in url)
        self.page.wait_for_selector("body[data-ready=true]")

    def add_to_cart(self, product_id, variant=1, quantity=1):
        self.open(f"produto.html?id={product_id}")
        if self.page.locator("[data-testid=variants]").count():
            self.page.get_by_test_id(f"variant-{variant}").check()
        self.page.get_by_test_id("quantity").fill(str(quantity))
        self.page.get_by_test_id("add-to-cart").click()
        self.page.get_by_test_id("toast").first.wait_for()


@pytest.fixture
def site(page, site_url):
    return Site(page, site_url)
