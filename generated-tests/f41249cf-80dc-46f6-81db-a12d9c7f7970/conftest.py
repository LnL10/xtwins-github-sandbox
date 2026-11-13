import os

import pytest
from playwright.sync_api import Browser, BrowserContext, Page, Playwright, sync_playwright


pytest_plugins = ["steps.filtros"]


@pytest.fixture
def app_url() -> str:
    return os.environ["APP_URL"]


@pytest.fixture
def browser(playwright: Playwright) -> Browser:
    browser = playwright.chromium.launch(headless=True)
    yield browser
    browser.close()


@pytest.fixture
def context(browser: Browser) -> BrowserContext:
    context = browser.new_context()
    yield context
    context.close()


@pytest.fixture
def page(context: BrowserContext) -> Page:
    page = context.new_page()
    yield page
    page.close()
