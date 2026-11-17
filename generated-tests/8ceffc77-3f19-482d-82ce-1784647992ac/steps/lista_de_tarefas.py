from pytest_bdd import given, parsers, then, when

from pages.lista_de_tarefas import ListaDeTarefas


@given('estou na página "Lista de tarefas"')
def estou_na_pagina_lista_de_tarefas(page, app_url):
    ListaDeTarefas(page).abrir(app_url)


@when(parsers.parse('escrevo "{tarefa}" no campo "What needs to be done?" e carrego em "Enter"'))
def escrevo_tarefa_no_campo_e_carrego_em_enter(page, tarefa):
    lista_de_tarefas = ListaDeTarefas(page)
    lista_de_tarefas.escrever_tarefa(tarefa)
    lista_de_tarefas.carregar_enter()


@then(parsers.parse('a tarefa "{tarefa}" aparece na lista'))
def tarefa_aparece_na_lista(page, tarefa):
    ListaDeTarefas(page).verificar_tarefa_visivel(tarefa)
