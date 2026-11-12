# Testes automatizados (pytest-bdd + Playwright)

Pacote gerado pelo test-automator: um ficheiro `.feature` por caso de teste, as step definitions em `steps/`,
as páginas e locators em `pages/` e a configuração do browser em `conftest.py`.

## Cenários cobertos

- Apresentar uma mensagem quando o preço mínimo é superior ao máximo (`features/validar_o_intervalo_de_preco_nos_filtros_do_catalogo.feature`)

## Cenários saltados

- Nenhum.

## Como correr

```bash
pip install -r requirements.txt
playwright install
APP_URL=https://lnl10.github.io/xtwins-github-sandbox/catalogo.html pytest
```

`APP_URL` é o endereço da aplicação a testar; o código lê-o sempre do ambiente.
