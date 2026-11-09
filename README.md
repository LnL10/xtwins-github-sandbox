# xtwins-github-sandbox

Repositório **só para testes** do conector GitHub do xTwins next-gen (EPIC[19], OI-071). É aqui que o test-automator
cria branches, faz commit dos pacotes de testes e abre pull requests durante o desenvolvimento e as demos.

Não tem código de produção nem dados reais: pode ser limpo a qualquer momento.

## O que está aqui

| Pasta | Para quê |
|---|---|
| `docs/` | **Gestor de Tarefas**, a app de demonstração (HTML + JS, sem backend), publicada no GitHub Pages. É a `app_url` dos testes. |
| `requirements/` | Documento de requisitos da app (`.md` e `.pdf`), o input do story-writer no cenário `full_pipeline` (o `.pdf` passa pelo OCR). |
| `generated-tests/` | Onde o test-automator entrega os pacotes (`generated-tests/<request_id>/`). `exemplo-login/` é um pacote de exemplo, já validado contra a app, para a leitura e a reutilização de passos (#140, #141). |

## Configuração nos ambientes xTwins

```dotenv
# xtwins-next-gen_implementation/.env (serviço connectors)
GITHUB_TOKEN=<token fine-grained só deste repositório: Contents e Pull requests em leitura e escrita>

# testes de integração do conector e dos agentes
GITHUB_TEST_REPOSITORY=LnL10/xtwins-github-sandbox
```

`publish` do test-automator:

```json
{ "repository": "LnL10/xtwins-github-sandbox", "base_branch": "main", "mode": "pull_request" }
```

## App de demonstração

- URL: https://lnl10.github.io/xtwins-github-sandbox/
- Conta: utilizador `qa.demo`, palavra-passe `Demo#2026` (conta fictícia, só existe na app de demonstração; nos
  pacotes gerados vai sempre por variável de ambiente, por exemplo `LOGIN_PASSWORD`).
- Páginas: `login.html`, `tarefas.html` (pesquisa e filtro por estado), `nova-tarefa.html` (validações),
  `tarefa.html?id=N` (iniciar, concluir, reabrir, eliminar com confirmação).
- Os dados ficam no `localStorage` do browser: cada contexto Playwright novo começa com as 6 tarefas de exemplo.
  No browser normal, "Repor dados de demonstração" na lista volta ao início.
- Todos os elementos têm etiqueta e `data-testid`, e as páginas são ficheiros separados (sem rotas `#`), porque o
  test-automator guarda o caminho e a query de cada página, mas não o fragmento.

Para correr localmente no mesmo caminho do Pages:

```bash
mkdir -p /tmp/serve && cp -r docs /tmp/serve/xtwins-github-sandbox
python -m http.server 8765 --directory /tmp/serve
# APP_URL=http://localhost:8765/xtwins-github-sandbox/
# a partir do docker compose do xTwins: http://host.docker.internal:8765/xtwins-github-sandbox/
```

## Correr o pacote de exemplo

```bash
cd generated-tests/exemplo-login
pip install -r requirements.txt
playwright install chromium
APP_URL=https://lnl10.github.io/xtwins-github-sandbox/ LOGIN_PASSWORD='Demo#2026' pytest
```

## Regras

- `main` é a branch de base. As entregas do xTwins vão sempre para `xtwins/<request_id>-<timestamp>`.
- Não fazer merge dos PRs do xTwins em `main`, a não ser que se queira que passem a contar como "testes existentes"
  para a reutilização (#141).
- Branches e PRs antigos podem ser apagados e fechados sem aviso.
