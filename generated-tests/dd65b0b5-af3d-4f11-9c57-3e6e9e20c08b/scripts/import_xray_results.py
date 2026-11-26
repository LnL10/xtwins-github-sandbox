"""Imports the results of a pytest-bdd run (cucumber.json) into Xray Cloud.

    pytest --cucumberjson=cucumber.json
    python scripts/import_xray_results.py [cucumber.json]

Needs XRAY_CLIENT_ID and XRAY_CLIENT_SECRET in the environment (an API key of Xray Cloud). Prints the key of the
Test Execution it creates; on any error prints a message (never the secret) and exits with code 1.
"""
import json
import os
import sys
import urllib.error
import urllib.request

BASE_URL = "https://xray.cloud.getxray.app/api/v2"
DEFAULT_RESULTS = "cucumber.json"
TIMEOUT_SECONDS = 60


class ImportFailed(Exception):
    pass


def read_settings(environment):
    missing = [name for name in ("XRAY_CLIENT_ID", "XRAY_CLIENT_SECRET") if not environment.get(name)]
    if missing:
        raise ImportFailed("Defina as variáveis de ambiente: " + ", ".join(missing))
    return environment["XRAY_CLIENT_ID"], environment["XRAY_CLIENT_SECRET"]


def read_results(path):
    try:
        with open(path, "rb") as handle:
            data = handle.read()
    except OSError as error:
        raise ImportFailed("Não foi possível ler " + path + ": " + error.strerror) from error
    try:
        json.loads(data)
    except ValueError as error:
        raise ImportFailed(path + " não é JSON válido") from error
    return data


def post(path, body):
    request = urllib.request.Request(
        BASE_URL + path, data=body, method="POST", headers={"Content-Type": "application/json"}
    )
    return request


def send(request, what):
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as error:
        raise ImportFailed(what + ": o Xray recusou o pedido (HTTP " + str(error.code) + ")") from error
    except (urllib.error.URLError, OSError, ValueError) as error:
        raise ImportFailed(what + " falhou: não foi possível falar com o Xray") from error


def authenticate(client_id, client_secret):
    body = json.dumps({"client_id": client_id, "client_secret": client_secret}).encode("utf-8")
    token = send(post("/authenticate", body), "A autenticação")
    if not isinstance(token, str) or not token:
        raise ImportFailed("A autenticação falhou: resposta inesperada do Xray")
    return token


def import_results(token, results):
    request = post("/import/execution/cucumber", results)
    request.add_header("Authorization", "Bearer " + token)
    answer = send(request, "A importação")
    key = answer.get("key") if isinstance(answer, dict) else None
    if not key:
        raise ImportFailed("A importação falhou: o Xray não devolveu a chave da execução")
    return key


def main(argv, environment):
    path = argv[1] if len(argv) > 1 else DEFAULT_RESULTS
    try:
        client_id, client_secret = read_settings(environment)
        results = read_results(path)
        key = import_results(authenticate(client_id, client_secret), results)
    except ImportFailed as error:
        print("Erro: " + str(error), file=sys.stderr)
        return 1
    print("Execução criada no Xray: " + key)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv, os.environ))
