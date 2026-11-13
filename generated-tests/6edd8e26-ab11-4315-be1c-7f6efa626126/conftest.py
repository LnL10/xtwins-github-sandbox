import os

import pytest


pytest_plugins = ["steps.catalogo"]


@pytest.fixture(scope="session")
def browser(playwright):
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


@pytest.fixture
def app_url():
    return os.environ["APP_URL"]
