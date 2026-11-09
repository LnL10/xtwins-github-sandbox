# xtwins-github-sandbox

Repositório **só para testes** do conector GitHub do xTwins next-gen (EPIC[19], OI-071). O test-automator cria aqui
branches, faz commit dos pacotes de testes e abre pull requests. Inclui também a aplicação que esses testes exercitam,
a **Loja Aurora**.

Nada aqui é produção: as contas, as encomendas e os pagamentos são fictícios, e o repositório pode ser limpo a
qualquer momento.

**Loja Aurora:** https://lnl10.github.io/xtwins-github-sandbox/ · **Guia para a equipa:** [docs/guia-de-testes.md](docs/guia-de-testes.md)

## Estrutura

| Pasta | Conteúdo |
|---|---|
| [`website/`](website) | Loja Aurora: loja online com catálogo, checkout, área de cliente e backoffice. HTML, CSS e JavaScript, sem servidor; publicada no GitHub Pages. |
| [`requirements/`](requirements) | Documentos de requisitos da Loja Aurora (`.md` e `.pdf`), o input do story-writer. |
| [`generated-tests/`](generated-tests) | Onde o test-automator entrega os pacotes (`generated-tests/<request_id>/`). Tem um pacote de exemplo para a leitura e a reutilização de passos. |
| [`docs/`](docs) | Guia de testes do conector: configuração, contas, dados e cenários por story. |
| [`tests/site/`](tests/site) | Testes da própria Loja Aurora (pytest + Playwright), corridos no CI antes de cada publicação. |
| [`tools/`](tools) | `serve.py` (servir a loja localmente) e `build_pdfs.py` (gerar os PDF dos requisitos). |

## Início rápido

```dotenv
# xtwins-next-gen_implementation/.env
GITHUB_TOKEN=<token fine-grained só deste repositório: Contents e Pull requests em leitura e escrita>
GITHUB_TEST_REPOSITORY=LnL10/xtwins-github-sandbox
```

```json
{ "publish": { "repository": "LnL10/xtwins-github-sandbox", "base_branch": "main", "mode": "pull_request" },
  "app_url": "https://lnl10.github.io/xtwins-github-sandbox/" }
```

Contas de teste: `ana.silva@example.com` / `Cliente#2026` (cliente) e `gestor@example.com` / `Gestor#2026` (gestor).
Mais dados e o painel de demonstração (latência, falhas simuladas) em [docs/guia-de-testes.md](docs/guia-de-testes.md).

## A Loja Aurora em números

- 20 páginas: loja (início, catálogo, produto, carrinho, checkout em 4 passos, confirmação), conta (login, registo,
  recuperação, perfil, encomendas, moradas), backoffice (painel, encomendas, produtos, utilizadores), acesso negado e
  painel de demonstração, mais a página 404.
- 25 produtos em 6 categorias, 5 contas, 30 encomendas, 4 códigos promocionais.
- Regras de negócio: stock, opções com preço, cupões com mínimo e validade, portes por região, validação de NIF, de
  código postal e de cartão (Luhn), bloqueio após 5 tentativas de login, estados das encomendas com transições,
  permissões por perfil.
- Padrões de UI: filtros e ordenação no URL, paginação, separadores, janelas de diálogo, notificações com "Anular",
  ações em massa, exportação CSV, upload de imagem, carregamento e erro simulados.
- 46 testes automáticos em `tests/site/`.

## Desenvolvimento

```bash
python tools/serve.py                         # http://localhost:8765/xtwins-github-sandbox/
pip install pytest==9.1.1 playwright==1.64.1 && playwright install chromium
pytest tests/site                             # contra a cópia local
SITE_URL=https://lnl10.github.io/xtwins-github-sandbox/ pytest tests/site   # contra o site publicado
```

Um push para `main` que mude `website/` corre os testes e, se passarem, publica no GitHub Pages (workflow **Site**).
Os PRs que mudam `generated-tests/` correm os pacotes alterados contra a loja (workflow **Testes gerados**).
