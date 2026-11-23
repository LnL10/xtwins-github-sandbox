"""Standard step of an authenticated user (written by xTwins): the scenario continues with `authenticated_page`."""
from pytest_bdd import given, parsers


@given(parsers.parse('o utilizador está autenticado como "{perfil}"'), target_fixture="page")
def utilizador_autenticado(authenticated_page, perfil):
    return authenticated_page
