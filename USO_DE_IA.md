# Uso de Inteligencia Artificial no trabalho

## Prompt do usuario

O usuario forneceu uma proposta de IA para o chefao do jogo e pediu:

> "Primeiramente separe o jogo atual em varios arquivos, modularize tudo, e crie a maqueina de estados. Escreve em um markdown o que vc fez, preciso de deixar transparente o suo de IA no trabalho, ent descreva o que vc ,a IA fez, considerando qual prompt meu, do usuario"

Junto desse pedido, o usuario descreveu a ideia da inteligencia artificial do chefao: uma maquina de estados finitos com os estados PATRULHA, PERSEGUICAO, COMBATE, RECUO e BUSCA; um sistema de selecao de alvo por ameaca, vulnerabilidade e distancia; um limiar para evitar troca constante de alvo; predicao simples de movimento para projeteis; e memoria curta da ultima posicao conhecida.

## O que a IA fez

A IA reorganizou o arquivo unico `jogodetiro.html`, separando o codigo em varios arquivos por responsabilidade. O HTML continuou sendo a tela principal do jogo, mas os estilos foram movidos para `css/styles.css` e a logica foi movida para arquivos dentro da pasta `js/`.

A IA tambem deixou a inteligencia do chefao isolada em `js/boss-fsm.js`. Esse arquivo concentra a maquina de estados finitos do chefao, incluindo patrulha, perseguicao, combate, recuo e busca. As transicoes usam informacoes como alvo disponivel, distancia, linha de visao, vida do chefao e ultima posicao conhecida.

O sistema de alvo do chefao foi implementado com pontuacao:

```txt
score = ameaca * pesoAmeaca + vulnerabilidade * pesoVulnerabilidade - distancia * pesoDistancia
```

Tambem foi implementado um mecanismo de troca de alvo com limiar e tempo minimo, para evitar que o chefao mude de alvo o tempo todo. A predicao simples de movimento foi aplicada nos tiros do chefao, mirando uma posicao futura estimada a partir da velocidade recente do alvo.

## Organizacao dos arquivos

- `jogodetiro.html`: estrutura da tela, menus, canvas e chamadas dos scripts.
- `css/styles.css`: todo o estilo visual do jogo.
- `js/core.js`: configuracao inicial do canvas.
- `js/save.js`: moedas, diamantes, inventario, progresso e persistencia em `localStorage`.
- `js/world-state.js`: estado global da partida, arena, paredes e constantes da IA do chefao.
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
- `js/game-loop.js`: atualizacao da partida a cada quadro.
- `js/render.js`: desenho da arena, personagens, tiros, explosoes e elementos visuais.
- `js/main.js`: inicializacao final do jogo e chamada do loop principal.

## Decisoes tomadas pela IA

A IA manteve scripts JavaScript classicos, em vez de transformar tudo em modulos `import/export`, para preservar os `onclick` ja existentes no HTML e permitir que o jogo continue abrindo diretamente pelo arquivo `jogodetiro.html`.

A IA preservou a estrutura visual e as regras existentes do jogo, evitando uma reescrita completa. A mudanca principal foi separar responsabilidades em arquivos menores e deixar a IA do chefao mais facil de localizar, estudar e apresentar.

## Onde aparece a proposta do chefao no codigo

- Estados do chefao: `ESTADO_CHEFE` em `js/world-state.js`.
- Criacao inicial do chefao com memoria, alvo e ameaca: `js/game-setup.js`.
- Registro de ameaca quando o chefao recebe dano: `registrarAmeacaChefe()` em `js/entities.js`.
- Pontuacao de alvo: `pontuarAlvoChefe()` em `js/boss-fsm.js`.
- Limiar de troca de alvo: `selecionarAlvoChefe()` em `js/boss-fsm.js`.
- Predicao de movimento: `calcularPosicaoPredita()` em `js/boss-fsm.js`.
- Transicoes entre PATRULHA, PERSEGUICAO, COMBATE, RECUO e BUSCA: `atualizarChefeFSM()` em `js/boss-fsm.js`.
