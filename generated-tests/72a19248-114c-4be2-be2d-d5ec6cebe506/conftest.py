import os

import pytest
from playwright.sync_api import Browser, BrowserContext, Page, Playwright, sync_playwright


pytest_plugins = ["steps.ordenacao"]


@pytest.fixture
def app_url() -> str:
    return os.environ["APP_URL"]


@pytest.fixture(scope="session")
def playwright() -> Playwright:
    with sync_playwright() as playwright_instance:
        yield playwright_instance


@pytest.fixture(scope="session")
def browser(playwright: Playwright) -> Browser:
    browser_instance = playwright.chromium.launch(headless=True)
    yield browser_instance
    browser_instance.close()


@pytest.fixture
def context(browser: Browser) -> BrowserContext:
    context_instance = browser.new_context()
    yield context_instance
    context_instance.close()


@pytest.fixture
def page(context: BrowserContext) -> Page:
    page_instance = context.new_page()
    yield page_instance
