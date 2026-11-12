import os

import pytest
from playwright.sync_api import Browser, BrowserContext, Page, sync_playwright


pytest_plugins = ["steps.adicionar_uma_tarefa"]


@pytest.fixture
def app_url() -> str:
    return os.environ["APP_URL"]


@pytest.fixture
def browser():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture
def context(browser: Browser):
    context = browser.new_context()
    yield context
    context.close()


@pytest.fixture
def page(context: BrowserContext) -> Page:
    page = context.new_page()
    yield page
    page.close()
