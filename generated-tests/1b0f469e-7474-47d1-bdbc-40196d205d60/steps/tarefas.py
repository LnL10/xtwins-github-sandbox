from pytest_bdd import given, parsers, then, when

from pages.tarefas import ListaDeTarefasPage, NovaTarefaPage


@given('que estou na página "Lista de tarefas"')
def estou_na_pagina_lista_de_tarefas(page, app_url):
    ListaDeTarefasPage(page, app_url).open()


@when('apago as três tarefas apresentadas na tabela da página "Lista de tarefas" através dos botões "Apagar"')
def apago_as_tres_tarefas_da_lista(page, app_url):
    ListaDeTarefasPage(page, app_url).apagar_as_tres_tarefas()


@when('abro a página "Lista de tarefas"')
def abro_a_pagina_lista_de_tarefas(page, app_url):
    ListaDeTarefasPage(page, app_url).open()


@when('consulto o conteúdo da página')
def consulto_o_conteudo_da_pagina(page):
    # A consulta não exige uma interação adicional com o navegador.
    return None


@then('vejo a tabela com as colunas "Tarefa", "Prioridade", "Data limite" e "Ações"')
def vejo_as_colunas_da_tabela(page, app_url):
    ListaDeTarefasPage(page, app_url).verificar_colunas()


@then(parsers.parse('vejo o contador "{texto}"'))
def vejo_o_contador(page, app_url, texto):
    ListaDeTarefasPage(page, app_url).verificar_contador(texto)


@when(parsers.parse('seleciono a ligação "{ligacao}" na página "Lista de tarefas"'))
def seleciono_a_ligacao_na_lista(page, app_url, ligacao):
    ListaDeTarefasPage(page, app_url).selecionar_ligacao(ligacao)


@then('vejo a mensagem "Não tem tarefas."')
def vejo_a_mensagem_sem_tarefas(page, app_url):
    ListaDeTarefasPage(page, app_url).verificar_mensagem_sem_tarefas()


@then('vejo a página "Nova tarefa"')
def vejo_a_pagina_nova_tarefa(page, app_url):
    NovaTarefaPage(page, app_url).verificar_pagina_aberta()
