# Testes automatizados (pytest-bdd + Playwright)

Pacote gerado pelo test-automator: um ficheiro `.feature` por caso de teste, as step definitions em `steps/`,
as páginas e locators em `pages/` e a configuração do browser em `conftest.py`.

## Cenários cobertos

- Cliente inicia sessão com credenciais válidas (`features/iniciar_sessao_na_loja_aurora.feature`)
- Cliente erra a palavra-passe (`features/iniciar_sessao_na_loja_aurora.feature`)
- Conta bloqueada não consegue entrar (`features/iniciar_sessao_na_loja_aurora.feature`)
- Adicionar um produto com opções ao carrinho (`features/adicionar_produto_ao_carrinho.feature`)
- Adicionar sem escolher a opção obrigatória (`features/adicionar_produto_ao_carrinho.feature`)
- Filtrar o catálogo por categoria (`features/navegar_no_catalogo.feature`)
- Ordenar o catálogo pelo preço mais baixo (`features/navegar_no_catalogo.feature`)

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

Estas variáveis de ambiente têm de estar definidas ao correr; os valores nunca ficam no pacote.

- `APP_PASSWORD`
