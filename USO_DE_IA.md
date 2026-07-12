# Uso de IA no projeto

Este documento registra de forma transparente como a Inteligencia Artificial foi utilizada no desenvolvimento, na refatoracao e na documentacao do jogo de tiro top-down em HTML5/Canvas.

## Objetivo do uso da IA

A IA foi utilizada como apoio para analisar o codigo existente, interpretar a proposta de Inteligencia Artificial do chefao e auxiliar na implementacao das melhorias solicitadas. O uso principal foi voltado para modularizacao do projeto, implementacao da IA do chefao, melhoria dos bots simples, organizacao do codigo e criacao de textos de apoio para o relatorio.

A IA tambem foi usada para identificar problemas de manutencao e desempenho no jogo, principalmente em trechos grandes de JavaScript, renderizacao em Canvas, compatibilidade com Firefox e ausencia de delta time no loop principal.

## Prompt principal do usuario

O usuario forneceu uma proposta de IA para o chefao do jogo e pediu:

> "Primeiramente separe o jogo atual em varios arquivos, modularize tudo, e crie a maqueina de estados. Escreve em um markdown o que vc fez, preciso de deixar transparente o suo de IA no trabalho, ent descreva o que vc ,a IA fez, considerando qual prompt meu, do usuario"

Junto desse pedido, o usuario descreveu a ideia da inteligencia artificial do chefao: uma maquina de estados finitos com os estados PATRULHA, PERSEGUICAO, COMBATE, RECUO e BUSCA; um sistema de selecao de alvo por ameaca, vulnerabilidade e distancia; um limiar para evitar troca constante de alvo; predicao simples de movimento para projeteis; e memoria curta da ultima posicao conhecida.

## Outros pedidos feitos a IA

Durante o desenvolvimento, o usuario tambem solicitou:

- Separar cores e espacamentos em um arquivo `tokens.css`.
- Melhorar a performance do jogo no Firefox.
- Refatorar blocos de codigo grandes e dificeis de manter, como a funcao de desenho do personagem.
- Corrigir problemas de teclado no Firefox.
- Verificar e implementar delta time no loop principal do jogo.
- Juntar a documentacao anexada sobre uso de IA neste arquivo.

## Arquivos utilizados

Os principais arquivos analisados ou modificados com apoio da IA foram:

- `jogodetiro.html`: estrutura da tela, menus, canvas e chamadas dos scripts.
- `Proposta de Inteligencia Artificial para o Chefao.pdf`: documento com as regras de negocio da IA do chefao.
- `css/styles.css`: estilos visuais principais do jogo.
- `css/tokens.css`: variaveis CSS de cores, espacamentos, raios e dimensoes.
- Arquivos JavaScript dentro da pasta `js/`, criados a partir da modularizacao do arquivo original.

## Modularizacao feita pela IA

Antes da refatoracao, o jogo estava concentrado principalmente em um unico arquivo HTML, com HTML, CSS e JavaScript juntos. A IA separou o projeto em varios arquivos por responsabilidade.

A organizacao atual ficou assim:

- `js/core.js`: configuracao inicial do canvas.
- `js/save.js`: moedas, diamantes, inventario, progresso e persistencia em `localStorage`.
- `js/world-state.js`: estado global da partida, arena, paredes e constantes gerais.
- `js/battle-pass.js`: logica do passe de batalha, missoes e recompensas.
- `js/menus.js`: abertura, fechamento e atualizacao dos menus.
- `js/audio.js`: efeitos sonoros e musica de fundo.
- `js/input.js`: teclado, mouse e eventos do jogador.
- `js/helpers.js`: particulas, textos de dano, colisoes e funcoes auxiliares.
- `js/hud.js`: HUD, radar, mira e atualizacao de informacoes na tela.
- `js/game-setup.js`: inicio de partida, criacao do jogador, aliados, bots e chefao.
- `js/entities.js`: dano, ameaca recebida pelo chefao, movimentacao e patrulha.
- `js/boss-fsm.js`: maquina de estados e decisoes do chefao.
- `js/bot-ai.js`: decisoes dos bots comuns.
- `js/game-loop.js`: atualizacao da partida.
- `js/render.js`: desenho da arena, personagens, tiros, explosoes e elementos visuais.
- `js/main.js`: inicializacao final do jogo e chamada do loop principal.

A IA manteve scripts JavaScript classicos, em vez de transformar tudo em modulos `import/export`, para preservar os `onclick` ja existentes no HTML e permitir que o jogo continue abrindo diretamente pelo arquivo `jogodetiro.html`.

## IA do chefao

A IA do chefao foi organizada em uma Maquina de Estados Finitos. Foram implementados os estados:

- `PATRULHA`
- `PERSEGUICAO`
- `COMBATE`
- `RECUO`
- `BUSCA`

Com isso, o chefao passou a mudar de comportamento conforme a situacao da partida. Ele pode patrulhar quando nao encontra inimigos, perseguir um alvo, entrar em combate, recuar quando esta em desvantagem ou buscar a ultima posicao conhecida do jogador caso perca contato visual.

Tambem foi implementado um sistema de ameaca, conhecido como aggro. O chefao escolhe o alvo usando uma pontuacao baseada em ameaca, vulnerabilidade e distancia:

```text
score = ameaca * pesoAmeaca + vulnerabilidade * pesoVulnerabilidade - distancia * pesoDistancia
```

A ameaca aumenta quando um jogador ou aliado causa dano ao chefao. A vulnerabilidade considera fatores como pouca vida e ausencia de escudo. A distancia reduz a prioridade de alvos muito afastados.

Para evitar trocas de alvo muito frequentes, foi implementado um limite de troca. O novo alvo so passa a ser escolhido se tiver uma pontuacao significativamente maior que a do alvo atual e se ja tiver passado um tempo minimo desde a ultima troca.

Tambem foi adicionada predicao de movimento. Nos ataques com projetil e basuca, o chefao calcula uma posicao futura estimada do alvo com base na velocidade atual dele. Assim, o chefao nao mira apenas onde o alvo esta, mas onde ele provavelmente estara quando o projetil chegar.

Por fim, foi adicionada memoria de curto prazo. Quando o chefao perde a visao do alvo, ele guarda a ultima posicao conhecida e entra no estado `BUSCA`, indo ate esse local antes de voltar a patrulhar.

## Bots simples

Os bots simples receberam uma melhoria tatica baseada em decisao por utilidade. A IA ajudou a expandir a logica com uma nova acao:

- `BUSCAR_COBERTURA`

Quando um bot simples esta com pouca vida ou esta recarregando, ele pode procurar uma parede proxima para se proteger da linha de visao do inimigo. Essa decisao usa uma verificacao simples de obstaculos do mapa, aproveitando as paredes existentes no jogo.

Com isso, os bots comuns deixam de apenas atacar ou recuar em linha reta. Em algumas situacoes, eles passam a tentar se posicionar de maneira mais inteligente, usando o cenario a favor deles.

## Melhorias de manutencao

A IA tambem ajudou a identificar blocos de codigo dificeis de manter, especialmente na renderizacao. Um exemplo foi a funcao `desenharPersonagem`, que concentrava muitos `if/else` de skins, armas, corpo, rosto, escudo e barra de vida.

Esse trecho foi reorganizado em funcoes menores, como:

- `desenharPernas`
- `desenharCorpo`
- `desenharBracos`
- `desenharArma`
- `desenharRosto`
- `desenharAcessorioFrontal`
- `desenharEscudoPersonagem`
- `desenharBarraVidaPersonagem`

Tambem foram separados desenhos de caixas, bombas, tiros, basuca, explosoes, cortes e textos de dano. O objetivo foi tornar o codigo mais facil de ler, alterar e explicar.

## Melhorias visuais e CSS

A IA criou o arquivo `css/tokens.css`, concentrando variaveis CSS de cores, espacamentos, raios e dimensoes comuns. O arquivo `css/styles.css` passou a importar esses tokens:

```css
@import url("./tokens.css");
```

Isso facilita futuras alteracoes de identidade visual, cores da interface, tamanhos e espacamentos sem precisar procurar valores espalhados pelo CSS inteiro.

## Melhorias de performance

A IA analisou pontos que poderiam deixar o jogo travado no Firefox. Foram feitas otimizacoes como:

- Cache da arena e das paredes em canvases estaticos.
- Reducao de `shadowBlur` no Firefox.
- Limitacao da quantidade maxima de particulas.
- Atualizacao do minimapa em intervalo controlado, em vez de redesenhar todo frame.
- Cache temporario da busca de cobertura dos bots.
- Remocao de `backdrop-filter` no Firefox por CSS especifico.

Essas mudancas foram feitas para reduzir o custo por frame e melhorar a estabilidade em navegadores com desempenho menor em Canvas.

## Correcao de teclado no Firefox

Foi investigado um problema em que o movimento para a direita, pela tecla `D`, nao funcionava corretamente no Firefox. A IA tentou tornar a captura de teclado mais robusta usando:

- `event.key`
- `event.code`
- `keyCode`/`which`
- fallback por `keypress`
- foco explicito no `canvas`
- setas direcionais como alternativa de movimento

Tambem foram adicionados sufixos de versao nos scripts do HTML para reduzir risco de cache do navegador durante os testes.

## Delta time

O jogo originalmente nao usava delta time de forma real. Varias partes eram baseadas em valores fixos por frame, como movimento, projeteis, particulas, zona segura e tempo de vida de efeitos.

A IA alterou o loop principal para calcular `deltaMs` com `requestAnimationFrame` e converter isso para uma escala chamada `frameScale`, calibrada para 60 FPS. Assim, em 60 FPS `frameScale` vale aproximadamente `1`; em 30 FPS vale aproximadamente `2`; e em 120 FPS vale aproximadamente `0.5`.

Com isso, movimento, projeteis e efeitos passaram a se comportar de forma mais consistente em maquinas e navegadores com FPS diferentes.

## Onde aparece a proposta do chefao no codigo

- Estados do chefao: `ESTADO_CHEFE` em `js/world-state.js`.
- Criacao inicial do chefao com memoria, alvo e ameaca: `js/game-setup.js`.
- Registro de ameaca quando o chefao recebe dano: `registrarAmeacaChefe()` em `js/entities.js`.
- Pontuacao de alvo: `pontuarAlvoChefe()` em `js/boss-fsm.js`.
- Limiar de troca de alvo: `selecionarAlvoChefe()` em `js/boss-fsm.js`.
- Predicao de movimento: `calcularPosicaoPredita()` em `js/boss-fsm.js`.
- Transicoes entre PATRULHA, PERSEGUICAO, COMBATE, RECUO e BUSCA: `atualizarChefeFSM()` em `js/boss-fsm.js`.

## Validacoes realizadas com apoio da IA

A IA ajudou a validar as alteracoes feitas no codigo. Foram realizadas verificacoes como:

- Checagem de sintaxe JavaScript com `node --check`.
- Abertura do jogo em navegador headless para confirmar que a tela inicial carregava.
- Verificacao manual dos arquivos modificados e dos pontos principais da IA.
- Tentativa de validacao no Firefox headless. No ambiente usado, o Firefox headless apresentou problema do proprio ambiente grafico/crash reporter, entao essa validacao nao foi conclusiva.

As validacoes ajudam a identificar erros de sintaxe e carregamento, mas nao substituem testes manuais completos de jogabilidade pelos integrantes do grupo.

## Participacao humana

As decisoes principais do projeto, o tema do jogo, os requisitos do professor e os prompts foram definidos pelos alunos. A IA foi usada como ferramenta de apoio para acelerar a analise, sugerir solucoes e implementar/refatorar trechos de codigo.

O codigo final e o relatorio devem ser revisados pelos integrantes do grupo antes da entrega, para garantir que todos entendam as alteracoes e consigam explicar o funcionamento da IA implementada.

## Limites do uso da IA

A IA nao substituiu a responsabilidade dos alunos pelo projeto. Ela auxiliou na escrita, na organizacao das ideias, na implementacao tecnica e na refatoracao, mas o resultado precisa ser testado, compreendido e validado pelo grupo.

Tambem e importante destacar que a IA pode cometer erros. Por isso, as alteracoes foram acompanhadas de verificacoes de sintaxe, testes de carregamento e revisao humana.

## Resumo

Neste projeto, a IA foi utilizada de forma transparente como ferramenta de apoio ao desenvolvimento. Ela ajudou a transformar uma logica simples de bots em uma estrutura mais organizada, com Maquina de Estados Finitos para o chefao, sistema de ameaca, predicao de movimento, memoria de curto prazo e busca de cobertura para bots simples.

Alem disso, a IA auxiliou na modularizacao do projeto, na criacao de tokens CSS, na melhoria de performance, na refatoracao de trechos grandes, na investigacao de compatibilidade com Firefox e na implementacao de delta time.

O uso da IA contribuiu principalmente para melhorar a qualidade da inteligencia artificial do jogo, facilitar a manutencao do codigo e documentar melhor as decisoes tecnicas realizadas durante o desenvolvimento.
