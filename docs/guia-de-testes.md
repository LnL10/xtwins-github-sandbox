# Guia de testes do conector GitHub

Para a equipa do xTwins next-gen (EPIC[19], stories #134–#141 e #149). Explica como configurar o ambiente, que dados
usar e que cenários validar em cada story.

## 1. Configuração

### Token do conector

Token **fine-grained** do GitHub, só para `LnL10/xtwins-github-sandbox`, com:

| Permissão | Acesso |
|---|---|
| Contents | Read and write |
| Pull requests | Read and write |
| Metadata | Read (automático) |

O token é partilhado pelo cofre da equipa. Nunca o ponham em commits, logs ou tickets.

### Variáveis

```dotenv
# xtwins-next-gen_implementation/.env (serviço connectors)
GITHUB_TOKEN=<token>

# testes de integração do conector e dos agentes (#134, #137)
GITHUB_TEST_REPOSITORY=LnL10/xtwins-github-sandbox
```

### Destino da entrega (`publish`)

```json
{ "repository": "LnL10/xtwins-github-sandbox", "base_branch": "main", "mode": "pull_request" }
```

## 2. Aplicação sob teste: Loja Aurora

| | |
|---|---|
| `app_url` | `https://lnl10.github.io/xtwins-github-sandbox/` |
| Local | `python tools/serve.py` → `http://localhost:8765/xtwins-github-sandbox/` |
| A partir do docker compose | `http://host.docker.internal:8765/xtwins-github-sandbox/` |

A loja não tem servidor: os dados vivem no `localStorage` do browser. Cada contexto novo do Playwright começa com os
dados iniciais. As páginas são ficheiros separados (sem rotas com `#`), porque o test-automator guarda o caminho e a
query de cada página, mas não o fragmento.

### Contas

| Perfil | Email | Palavra-passe | Notas |
|---|---|---|---|
| Cliente | `ana.silva@example.com` | `Cliente#2026` | 2 moradas (uma na Madeira), encomendas em vários estados |
| Cliente | `bruno.costa@example.com` | `Cliente#2026` | |
| Cliente | `diana.ferreira@example.com` | `Cliente#2026` | |
| Gestor | `gestor@example.com` | `Gestor#2026` | Acede ao backoffice (`admin/`) |
| Bloqueado | `bloqueado@example.com` | `Cliente#2026` | Não consegue entrar |

Para a #149 (`credential_ref`): a credencial de teste é `APP_USERNAME=ana.silva@example.com` e
`APP_PASSWORD=Cliente#2026` (ou a do gestor para o backoffice). O formulário de login tem os campos "Email" e
"Palavra-passe" e o botão "Entrar", e redireciona para a página pedida em `?voltar=`.

### Dados úteis

- Cartões: `4242 4242 4242 4242` é aceite; `4000 0000 0000 0002` é recusado. Validade futura e CVV de 3 dígitos.
- Códigos promocionais: `AURORA10`, `BEMVINDO5`, `PORTESGRATIS`; `VERAO2026` está expirado.
- Códigos postais começados por 9 (ilhas): sem envio expresso e com sobretaxa de 5 €.
- Produtos: com opções (101, 105, 107…), esgotados (104, 116), últimas unidades (107, 111, 124), inativo (125).

### Painel de demonstração (`demo.html`)

- "Entrar como": inicia sessão com qualquer conta num clique.
- Latência das respostas: 0, 300 ms (normal), 1 s ou 3 s, para testar estados de carregamento.
- Simular falhas por área (catálogo, checkout, conta, backoffice), para testar mensagens de erro e "Tentar novamente".
- Repor todos os dados.

### Requisitos para o story-writer

Em `requirements/loja-aurora/`: cinco documentos (visão geral, loja e catálogo, carrinho e checkout, área de cliente,
backoffice), em `.md` e `.pdf`, e um PDF com todos (`requisitos-loja-aurora-completo.pdf`). Os PDF passam pelo OCR
(OI-070, OI-074). O cenário `full_pipeline` pode partir de um destes documentos com a `app_url` da loja.

## 3. Cenários por story

### #134 — servidor `github` e `create_branch`

| Cenário | Entrada | Esperado |
|---|---|---|
| Sucesso | branch nova, base `main` | Branch criada a partir de `main`; `{repository, branch, base_branch}` |
| Branch repetida | a mesma branch outra vez | `BRANCH_EXISTS` |
| Base inexistente | `base_branch: "nao-existe"` | `NOT_FOUND` |
| Repositório inexistente | `LnL10/nao-existe` | `NOT_FOUND` |
| Formato inválido | `repository: "sandbox"`, branch `a..b` | `INVALID_INPUT`, sem chamar o GitHub |
| Sem token | `GITHUB_TOKEN` vazio | `NOT_CONFIGURED`, subprocesso não arranca |
| Token inválido | `GITHUB_TOKEN=xxx` | `EXTERNAL_SYSTEM_ERROR`, sem o token em logs |

### #135 — `commit_package`

| Cenário | Esperado |
|---|---|
| Pacote do object storage numa branch existente | Um só commit com todos os ficheiros em `target_dir` |
| Caminho com `..` ou começado por `/` | `INVALID_INPUT` |
| Ficheiro binário no zip | `UNSUPPORTED_CONTENT` |
| Mais de 300 ficheiros ou mais de 5 MB | `PACKAGE_TOO_LARGE` |
| Branch inexistente | `NOT_FOUND` |

### #136 — `open_pull_request`

| Cenário | Esperado |
|---|---|
| Branch com commit para `main` | PR aberto; `{number, url}` |
| Repetir com a mesma `head` e `base` | `PULL_REQUEST_EXISTS` |
| `draft: true` | PR em rascunho |

### #137 — entrega do test-automator

- `publish` com `mode: "pull_request"` → branch `xtwins/<request_id>-…`, pacote em `generated-tests/<request_id>/`, PR
  com cenários cobertos e saltados; `delivery_status = published`.
- `mode: "branch"` → sem PR, `merge_request_url` nulo.
- `base_branch: "nao-existe"` → tarefa `failed`, `EXTERNAL_SYSTEM_ERROR`, pacote ainda descarregável.

### #140 e #141 — ler e reutilizar testes existentes

- `read_repository_files` em `generated-tests` na `main` devolve os `.py` de `exemplo-sessao-e-carrinho/`.
- Caso de teste novo com `Given o utilizador abre a página "Carrinho"` → o pacote novo mantém o padrão
  `parsers.parse('o utilizador abre a página "{nome}"')` e a função `o_utilizador_abre_a_pagina`; `reused_steps ≥ 1`.
- Para testar um ficheiro com erro de sintaxe, crie-o numa branch e use-a como `base_branch`. Nunca o ponha em `main`.

### #138 e #139 — Coordinator e frontend

- `run_scenario` em `user_stories_to_code` com `inputs.publish` → o test-automator recebe o mesmo `publish`.
- No frontend: Novo pedido com o destino GitHub preenchido; o resultado da automação mostra o link do PR.

### #149 — áreas autenticadas

- Casos de teste do backoffice ou da área de cliente com `credential_ref` da conta do gestor ou da Ana.
- O pacote tem a fixture de login no `conftest.py`, `steps/authentication.py` e `.env.example`; não contém o email nem
  a palavra-passe; corre com `APP_URL`, `APP_USERNAME` e `APP_PASSWORD`.

## 4. Limpeza

- Branches `xtwins/*` e PRs abertos pelos testes podem ser apagados e fechados a qualquer momento.
- Para não poluir a `main`, não façam merge dos PRs do xTwins (ver `generated-tests/README.md`).
- Em Settings → General, "Automatically delete head branches" está recomendado.
