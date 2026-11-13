import os

import pytest
from playwright.sync_api import sync_playwright


pytest_plugins = ["steps.catalogo"]


@pytest.fixture
def app_url():
    return os.environ["APP_URL"]


@pytest.fixture
def browser():
    playwright = sync_playwright().start()
    browser = playwright.chromium.launch(headless=True)
    yield browser
    browser.close()
    playwright.stop()


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
