import os

import pytest
from playwright.sync_api import sync_playwright

pytest_plugins = ["steps.lista_de_tarefas"]


@pytest.fixture
def playwright():
    with sync_playwright() as playwright_instance:
        yield playwright_instance


@pytest.fixture
def browser(playwright):
    browser_instance = playwright.chromium.launch(headless=True)
    yield browser_instance
    browser_instance.close()


@pytest.fixture
def context(browser):
    context_instance = browser.new_context()
    yield context_instance
    context_instance.close()


@pytest.fixture
def page(context):
    return context.new_page()


@pytest.fixture
def app_url():
    return os.environ["APP_URL"]
