import os

import pytest
from playwright.sync_api import sync_playwright

pytest_plugins = ["steps.loja_aurora"]


@pytest.fixture(scope="session")
def app_url():
    return os.environ["APP_URL"]


@pytest.fixture
def browser():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture
def context(browser):
    context = browser.new_context()
    yield context
    context.close()


@pytest.fixture
def page(context):
    page = context.new_page()
    yield page
    page.close()
