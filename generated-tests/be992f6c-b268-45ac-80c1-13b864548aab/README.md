# Testes automatizados (pytest-bdd + Playwright)

Pacote gerado pelo test-automator: um ficheiro `.feature` por caso de teste, as step definitions em `steps/`,
as páginas e locators em `pages/` e a configuração do browser em `conftest.py`.

## Cenários cobertos

- Cliente com o carrinho vazio vê o aviso e a ligação ao catálogo (`features/carrinho_na_loja_aurora.feature`)

## Cenários saltados

- Nenhum.

## Como correr

```bash
pip install -r requirements.txt
playwright install
APP_URL=https://lnl10.github.io/xtwins-github-sandbox/ pytest
```

`APP_URL` é o endereço da aplicação a testar; o código lê-o sempre do ambiente.

## Segredos

Estas variáveis de ambiente têm de estar definidas ao correr; os valores nunca ficam no pacote
(`.env.example` lista-as). O login é feito uma vez por sessão de testes, no `conftest.py`, com o utilizador
de teste destas variáveis; os cenários autenticados começam já com sessão.

- `APP_URL`
- `APP_USERNAME`
- `APP_PASSWORD`

A página de login é aberta relativamente à pasta de `APP_URL`, por isso uma aplicação servida sob um
prefixo (`https://servidor/prefixo/`) faz o login no sítio certo; termine `APP_URL` em `/` quando for uma
pasta. Limitação conhecida: as páginas dos cenários são abertas pelo caminho absoluto no servidor, como
na geração, por isso o prefixo do caminho tem de ser o mesmo na geração e na execução.
