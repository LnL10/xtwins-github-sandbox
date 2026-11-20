from pytest_bdd import given, when, then, parsers

from pages.nova_tarefa import NovaTarefaPage
from pages.tarefas import TarefasPage


@given('que estou na página "Lista de tarefas"')
def estou_na_pagina_lista_de_tarefas(page, app_url):
    TarefasPage(page).abrir(app_url)


@when('apago as três tarefas apresentadas na tabela da página "Lista de tarefas" através dos botões "Apagar"')
def apago_as_tres_tarefas(page):
    TarefasPage(page).apagar_as_tres_tarefas()


@when('abro a página "Lista de tarefas"')
def abro_a_pagina_lista_de_tarefas(page, app_url):
    TarefasPage(page).abrir(app_url)


@then(parsers.parse('vejo a mensagem "{mensagem}"'))
def vejo_a_mensagem(page, mensagem):
    TarefasPage(page).ver_mensagem(mensagem)


@when('consulto o conteúdo da página')
def consulto_o_conteudo_da_pagina(page, app_url):
    TarefasPage(page).verificar_pagina(app_url)


@then('vejo a tabela com as colunas "Tarefa", "Prioridade", "Data limite" e "Ações"')
def vejo_a_tabela_com_as_colunas(page):
    TarefasPage(page).ver_colunas()


@then(parsers.parse('vejo o contador "{contador}"'))
def vejo_o_contador(page, contador):
    TarefasPage(page).ver_contador(contador)


@when('seleciono a ligação "Nova tarefa" na página "Lista de tarefas"')
def seleciono_a_ligacao_nova_tarefa(page, app_url):
    TarefasPage(page).selecionar_ligacao_nova_tarefa(app_url)


@then('vejo a página "Nova tarefa"')
def vejo_a_pagina_nova_tarefa(page, app_url):
    NovaTarefaPage(page).verificar_pagina(app_url)
