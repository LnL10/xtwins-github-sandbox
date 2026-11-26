from pytest_bdd import given, parsers, then, when

from pages.loja import (
    Carrinho,
    Catalogo,
    DetalheDoProduto,
    IniciarSessao,
    PaginaInicial,
    PainelDeDemonstracao,
    navegar,
)


_CAMINHOS = {
    "Iniciar sessão": "/xtwins-github-sandbox/login.html",
    "Página inicial": "/xtwins-github-sandbox/",
    "Catálogo": "/xtwins-github-sandbox/catalogo.html",
    "Promoções": "/xtwins-github-sandbox/catalogo.html?promocoes=1",
    "Portátil Aurora Book 14": "/xtwins-github-sandbox/produto.html?id=101",
    "Carrinho vazio": "/xtwins-github-sandbox/carrinho.html",
    "Painel de demonstração": "/xtwins-github-sandbox/demo.html",
    "Detalhe do produto (3)": "/xtwins-github-sandbox/produto.html?id=107",
}


@given("não tenho a sessão iniciada")
def nao_tenho_a_sessao_iniciada():
    pass


@when(parsers.parse('acedo à página "{nome}"'))
def acedo_a_pagina(page, app_url, nome):
    navegar(page, app_url, _CAMINHOS[nome])


@when(parsers.parse('pesquiso produtos por "{valor}" no campo "pesquisa de produtos"'))
def pesquiso_produtos(page, valor):
    PaginaInicial().pesquisar_produtos(page, valor)


@when(parsers.parse('seleciono o produto "{nome}"'))
def seleciono_o_produto(page, nome):
    Catalogo().selecionar_produto(page, nome)


@when(parsers.parse('seleciono "{nome}"'))
def seleciono_promocoes(page, nome):
    Catalogo().selecionar_promocoes(page, nome)


@when("seleciono uma opção de ordenação nos controlos de ordenação")
def seleciono_uma_opcao_de_ordenacao(page):
    Catalogo().selecionar_ordenacao(page)


@when('seleciono uma opção disponível em "escolha de cor"')
def seleciono_uma_cor_disponivel(page):
    DetalheDoProduto().selecionar_cor(page)


@when(parsers.parse('defino "controlo de quantidade" como "{quantidade}"'))
def defino_quantidade(page, quantidade):
    DetalheDoProduto().definir_quantidade(page, quantidade)


@when('seleciono a "ligação para o catálogo"')
def seleciono_a_ligacao_para_o_catalogo(page):
    Carrinho().selecionar_catalogo(page)


@when("seleciono a ação para entrar como um utilizador de teste disponível")
def seleciono_acao_de_entrada(page):
    PainelDeDemonstracao().selecionar_acao_de_entrada(page)


@when('configuro os controlos de "latência" e de "falhas simuladas"')
def configuro_controlos(page):
    page._valor_latencia_guardado_no_teste = PainelDeDemonstracao().configurar_controlos(page)


@when('primo "Guardar"')
def primo_guardar(page):
    PainelDeDemonstracao().guardar(page)


@when(parsers.parse('volto a carregar a página "{nome}"'))
def volto_a_carregar_a_pagina(page, app_url, nome):
    navegar(page, app_url, _CAMINHOS[nome])


@then(parsers.parse('a página "{nome}" é apresentada'))
def pagina_e_apresentada(page, app_url, nome):
    if nome == "Iniciar sessão":
        IniciarSessao().esta_apresentada(page, app_url)
    elif nome == "Página inicial":
        PaginaInicial().esta_apresentada(page, app_url)
    elif nome == "Catálogo":
        Catalogo().esta_apresentado(page, app_url)
    elif nome == "Promoções":
        Catalogo().esta_apresentado(page, app_url, _CAMINHOS[nome])
    elif nome == "Portátil Aurora Book 14":
        DetalheDoProduto().esta_apresentado(page, app_url, _CAMINHOS[nome])
    elif nome == "Carrinho vazio":
        Carrinho().esta_apresentado(page, app_url)
    elif nome == "Painel de demonstração":
        PainelDeDemonstracao().esta_apresentado(page, app_url)
    else:
        raise ValueError(f"Página não reconhecida: {nome}")


@then(parsers.parse('a página "Catálogo" apresenta {quantidade:d} produtos, de um total de {total:d}'))
def pagina_catalogo_apresenta_produtos(page, quantidade, total):
    Catalogo().contar_produtos(page, quantidade)
    Catalogo().apresentar_total(page, total)


@then(parsers.parse('são apresentados {quantidade:d} produtos na página "Catálogo"'))
def sao_apresentados_produtos(page, quantidade):
    Catalogo().contar_produtos(page, quantidade)


@then(parsers.parse('a opção de cor selecionada e a quantidade "{quantidade}" são apresentadas na configuração do produto'))
def configuracao_do_produto_e_apresentada(page, quantidade):
    DetalheDoProduto().verificar_configuracao(page, quantidade)


@then('a página "Carrinho vazio" apresenta a "mensagem de carrinho vazio" e a "ligação para o catálogo"')
def carrinho_vazio_apresenta_mensagem_e_ligacao(page):
    Carrinho().verificar_estado_vazio(page)


@then('a página "Página inicial" é apresentada com o nome do utilizador de teste selecionado no "Cabeçalho da loja"')
def pagina_inicial_apresenta_nome_do_utilizador(page, app_url):
    PaginaInicial().esta_apresentada(page, app_url)
    PaginaInicial().nome_do_utilizador(page)


@then(parsers.parse('os controlos de "{nome_latencia}" e de "{nome_falhas}" apresentam as definições que foram guardadas'))
def controlos_apresentam_definicoes_guardadas(page, nome_latencia, nome_falhas):
    PainelDeDemonstracao().verificar_controlos_guardados(
        page, page._valor_latencia_guardado_no_teste, nome_latencia, nome_falhas
    )
