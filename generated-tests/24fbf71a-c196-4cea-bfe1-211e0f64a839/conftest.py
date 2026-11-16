"""Browser, application address and login of the tests (written by xTwins from the login recipe).

The login is done once per test session with the test user of APP_USERNAME and APP_PASSWORD; the scenarios that need
it ask for `authenticated_page` (or use the standard authenticated-user step) and start with that session.
"""
import os
from urllib.parse import urljoin

import pytest
from playwright.sync_api import expect, sync_playwright

LOGIN_PATH = './login.html'
LOGIN_FORM = {'username': {'role': 'textbox', 'name': 'Email'}, 'password': {'role': 'textbox', 'name': 'Password'}, 'submit': {'role': 'button', 'name': 'Entrar'}}

pytest_plugins = ['steps.authentication', 'steps.consultar_e_atualizar_a_lista_de_tarefas']


@pytest.fixture(scope="session")
def app_url():
    return os.environ["APP_URL"]


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture
def page(browser):
    context = browser.new_context()
    page = context.new_page()
    yield page
    context.close()


@pytest.fixture(scope="session")
def authenticated_storage_state(browser, app_url, tmp_path_factory):
    username = os.environ.get("APP_USERNAME", "")
    password = os.environ.get("APP_PASSWORD", "")
    if not username or not password:
        pytest.fail("Defina APP_USERNAME e APP_PASSWORD com o utilizador de teste antes de correr os testes.")
    context = browser.new_context()
    page = context.new_page()
    page.goto(urljoin(app_url, LOGIN_PATH))
    _find_login_element(page, "username").fill(username)
    _find_login_element(page, "password").fill(password)
    _find_login_element(page, "submit").click()
    expect(_find_login_element(page, "password")).to_have_count(0)
    state = tmp_path_factory.mktemp("authentication") / "storage_state.json"
    context.storage_state(path=str(state))
    context.close()
    return str(state)


@pytest.fixture
def authenticated_page(browser, authenticated_storage_state):
    context = browser.new_context(storage_state=authenticated_storage_state)
    page = context.new_page()
    yield page
    context.close()


def _find_login_element(page, field):
    element = LOGIN_FORM[field]
    return page.get_by_role(element["role"], name=element["name"], exact=True)
