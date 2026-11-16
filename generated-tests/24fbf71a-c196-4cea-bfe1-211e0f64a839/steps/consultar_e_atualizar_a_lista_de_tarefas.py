from pytest_bdd import given, when, then, parsers

from pages.tarefas import TarefasPage
from pages.nova_tarefa import NovaTarefaPage


@given(parsers.parse('que a lista contém a tarefa "{titulo}" por fazer, com prioridade "{prioridade}" e data limite "{data_limite}"'))
def lista_contem_tarefa_por_fazer_com_prioridade_e_data_limite(titulo, prioridade, data_limite):
    pass


@given(parsers.parse('a tarefa "{titulo}" concluída, com prioridade "{prioridade}" e sem data limite'))
def tarefa_concluida_com_prioridade_sem_data_limite(titulo, prioridade):
    pass


@given(parsers.parse('que a lista contém a tarefa "{titulo}" concluída e o "resumo de tarefas por fazer" apresenta "{quantidade}" tarefas por fazer'))
def lista_contem_tarefa_concluida_e_resumo_plural(titulo, quantidade):
    pass


@given(parsers.parse('que a tarefa "{titulo}" está concluída'))
def tarefa_esta_concluida(titulo):
    pass


@given(parsers.parse('que a tarefa "{titulo}" não tem data limite'))
def tarefa_sem_data_limite(titulo):
    pass


@given(parsers.parse('que a lista contém a tarefa "{titulo}" por fazer e o "resumo de tarefas por fazer" apresenta "{quantidade}" tarefa por fazer'))
def lista_contem_tarefa_por_fazer_e_resumo_singular(titulo, quantidade):
    pass


@given('que a sessão não está iniciada')
def sessao_nao_iniciada():
    pass


@given(parsers.parse('a lista contém a tarefa "{titulo}" por fazer'))
def lista_contem_tarefa_por_fazer(titulo):
    pass


@given('que a aplicação é aberta num navegador novo')
def aplicacao_aberta_num_navegador_novo():
    pass


@given(parsers.parse('a pessoa utilizadora abre "{nome_pagina}"'))
@when(parsers.parse('a pessoa utilizadora abre "{nome_pagina}"'))
def pessoa_utilizadora_abre_lista(page, app_url, nome_pagina):
    TarefasPage(page, app_url).open()


@when(parsers.parse('a pessoa utilizadora desmarca a caixa de seleção da tarefa "{titulo}"'))
def pessoa_utilizadora_desmarca_tarefa(page, app_url, titulo):
    TarefasPage(page, app_url).uncheck_task(titulo)


@when(parsers.parse('a pessoa utilizadora marca a caixa de seleção da tarefa "{titulo}"'))
def pessoa_utilizadora_marca_tarefa(page, app_url, titulo):
    TarefasPage(page, app_url).check_task(titulo)


@when(parsers.parse('a pessoa utilizadora seleciona a ligação "{ligacao}" em "{nome_pagina}"'))
@given(parsers.parse('a pessoa utilizadora seleciona a ligação "{ligacao}" em "{nome_pagina}"'))
def pessoa_utilizadora_seleciona_ligacao(page, app_url, ligacao, nome_pagina):
    TarefasPage(page, app_url).click_new_task_link()


@when(parsers.parse('a pessoa utilizadora seleciona o botão "{botao}" em "{nome_pagina}"'))
def pessoa_utilizadora_seleciona_botao(page, app_url, botao, nome_pagina):
    NovaTarefaPage(page, app_url).click_save()


@given(parsers.parse('preenche o campo "{campo}" com "{valor}"'))
def preenche_campo(page, app_url, campo, valor):
    NovaTarefaPage(page, app_url).fill_title(valor)


@when(parsers.parse('a pessoa utilizadora recarrega "{nome_pagina}" no mesmo navegador'))
def pessoa_utilizadora_recarrega_lista(page, app_url, nome_pagina):
    TarefasPage(page, app_url).open()


@then('são apresentadas as colunas "Concluída", "Título", "Prioridade", "Data limite" e "Ações"')
def colunas_sao_apresentadas(page, app_url):
    TarefasPage(page, app_url).assert_columns(
        ["Concluída", "Título", "Prioridade", "Data limite", "Ações"]
    )


@then(parsers.parse('são apresentados os dados das tarefas "{primeira}" e "{segunda}"'))
def dados_das_tarefas_sao_apresentados(page, app_url, primeira, segunda):
    tarefas = TarefasPage(page, app_url)
    tarefas.assert_task_cell(primeira)
    tarefas.assert_task_cell(segunda)


@then(parsers.parse('o "resumo de tarefas por fazer" apresenta "{quantidade}" tarefa por fazer'))
def resumo_apresenta_tarefa_singular(page, app_url, quantidade):
    TarefasPage(page, app_url).assert_summary(quantidade, plural=False)


@then(parsers.parse('o "resumo de tarefas por fazer" apresenta "{quantidade}" tarefas por fazer'))
def resumo_apresenta_tarefas_plural(page, app_url, quantidade):
    TarefasPage(page, app_url).assert_summary(quantidade, plural=True)


@then(parsers.parse('a tarefa "{titulo}" fica por fazer'))
def tarefa_fica_por_fazer(page, app_url, titulo):
    TarefasPage(page, app_url).assert_task_text(titulo)


@then(parsers.parse('o título "{titulo}" é apresentado riscado'))
def titulo_e_apresentado_riscado(page, app_url, titulo):
    TarefasPage(page, app_url).assert_strikethrough_title(titulo)


@then(parsers.parse('a data limite da tarefa "{titulo}" é apresentada como "{data_limite}"'))
def data_limite_e_apresentada(page, app_url, titulo, data_limite):
    TarefasPage(page, app_url).assert_deadline(data_limite)


@then(parsers.parse('a tarefa "{titulo}" fica concluída'))
def tarefa_fica_concluida(page, app_url, titulo):
    TarefasPage(page, app_url).assert_task_checkbox_visible(titulo)


@then(parsers.parse('a tarefa "{titulo}" é apresentada na lista'))
def tarefa_e_apresentada_na_lista(page, app_url, titulo):
    TarefasPage(page, app_url).assert_task_cell(titulo)


@then(parsers.parse('é apresentado o formulário "{nome_formulario}" com o campo "Título", a lista "Prioridade" e o campo "Data limite"'))
def formulario_nova_tarefa_e_apresentado(page, app_url, nome_formulario):
    NovaTarefaPage(page, app_url).assert_form()


@then(parsers.parse('a lista "Prioridade" apresenta as opções "Baixa", "Média" e "Alta", com "Média" selecionada por predefinição'))
def opcoes_de_prioridade_sao_apresentadas(page, app_url):
    NovaTarefaPage(page, app_url).assert_priority_options()


@then(parsers.parse('a tarefa "{titulo}" é criada e acrescentada ao fim da lista de tarefas'))
def tarefa_criada_e_acrescentada(page, app_url, titulo):
    TarefasPage(page, app_url).assert_task_cell(titulo)


@then(parsers.parse('é apresentada a mensagem "{mensagem}"'))
def mensagem_e_apresentada(page, app_url, mensagem):
    TarefasPage(page, app_url).assert_status(mensagem)


@then(parsers.parse('a tarefa "{titulo}" continua apresentada em "{nome_pagina}"'))
def tarefa_continua_apresentada(page, app_url, titulo, nome_pagina):
    TarefasPage(page, app_url).assert_task_cell(titulo)


@then(parsers.parse('são apresentadas as tarefas "{primeira}", "{segunda}" e "{terceira}" em "{nome_pagina}"'))
def tarefas_iniciais_sao_apresentadas(page, app_url, primeira, segunda, terceira, nome_pagina):
    tarefas = TarefasPage(page, app_url)
    tarefas.assert_task_cell(primeira)
    tarefas.assert_task_cell(segunda)
    tarefas.assert_task_cell(terceira)
