# generated-tests

Pasta onde o **test-automator do xTwins** entrega os pacotes de testes (OI-071): cada pedido fica em
`generated-tests/<request_id>/`, numa branch `xtwins/<request_id>-<AAAAMMDDhhmmss>`, com um pull request para `main`.

## O que está em `main`

| Pacote | Para quê |
|---|---|
| `exemplo-sessao-e-carrinho/` | Pacote de exemplo no formato do test-automator, já validado contra a Loja Aurora (7 cenários). É o "teste existente" que a #140 lê e a #141 reutiliza. |

O exemplo tem passos com os quatro tipos de padrão que a #141 analisa:

| Tipo | Exemplo |
|---|---|
| texto | `@given("que estou na página de início de sessão")` |
| `parsers.parse` | `@given(parsers.parse('o utilizador abre a página "{nome}"'))` |
| `parsers.cfparse` | `@then(parsers.cfparse('vê "{total}" no total de resultados'))` |
| `parsers.re` | `@then(parsers.re(r"o carrinho do cabeçalho mostra (?P<quantidade>\d+) artigos?"))` |

Para testar a reutilização, peça ao test-automator um caso de teste que use um destes passos, por exemplo
`Given o utilizador abre a página "Carrinho"`, e confirme no PR o mesmo padrão e o mesmo nome de função, e a linha
"Passos reutilizados do repositório: n".

## Correr um pacote

```bash
cd generated-tests/<pacote>
pip install -r requirements.txt
playwright install chromium
APP_URL=https://lnl10.github.io/xtwins-github-sandbox/ APP_USERNAME=ana.silva@example.com APP_PASSWORD='Cliente#2026' pytest
```

Cada pacote corre sozinho, a partir da sua pasta (os pacotes não partilham código).

## Regras

- Não fazer merge dos PRs do xTwins em `main`, a não ser que se queira que passem a contar como testes existentes
  para a reutilização.
- O workflow **Testes gerados** corre os pacotes alterados em cada PR contra uma cópia local da Loja Aurora. O
  resultado é informativo: a execução dos testes não faz parte do xTwins (OI-005).
