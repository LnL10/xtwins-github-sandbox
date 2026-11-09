# Testes automatizados (pytest-bdd + Playwright)

Pacote gerado pelo test-automator: um ficheiro `.feature` por caso de teste, as step definitions em `steps/`,
as páginas e locators em `pages/` e a configuração do browser em `conftest.py`.

## Cenários cobertos

- Iniciar sessão com credenciais válidas (`features/iniciar_sessao_no_gestor_de_tarefas.feature`)
- Iniciar sessão com a palavra-passe errada (`features/iniciar_sessao_no_gestor_de_tarefas.feature`)
- Terminar sessão (`features/iniciar_sessao_no_gestor_de_tarefas.feature`)

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

- `LOGIN_PASSWORD`
