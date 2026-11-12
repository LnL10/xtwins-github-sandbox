from pytest_bdd import given, parsers, then, when

from pages.aplicacao_de_tarefas_todomvc import AplicacaoDeTarefasTodomvcPage


@given('na página "Aplicação de tarefas TodoMVC" a lista de tarefas está vazia')
def lista_de_tarefas_vazia(page, app_url):
    AplicacaoDeTarefasTodomvcPage(page, app_url).abrir()


@when(parsers.parse('escrevo "{tarefa}" no campo "What needs to be done?" e primo "Enter"'))
def escrevo_tarefa_e_primo_enter(page, app_url, tarefa):
    pagina = AplicacaoDeTarefasTodomvcPage(page, app_url)
    pagina.escrever_tarefa(tarefa)
    pagina.primo_enter()


@then(parsers.parse('a tarefa "{tarefa}" aparece no fim da lista e o contador apresenta "{contador}"'))
def tarefa_aparece_e_contador_apresenta(page, app_url, tarefa, contador):
    pagina = AplicacaoDeTarefasTodomvcPage(page, app_url)
    pagina.verificar_tarefa(tarefa)
    pagina.verificar_contador(contador)
