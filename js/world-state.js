const arena = {x: 0, y: 0, width: 1500, height: 1500};
const walls = [
  {x: 650, y: 650, width: 200, height: 40},
  {x: 730, y: 550, width: 40, height: 200},
  {x: 300, y: 300, width: 150, height: 30},
  {x: 300, y: 330, width: 30, height: 100},
  {x: 500, y: 200, width: 30, height: 150},
  {x: 1000, y: 300, width: 150, height: 30},
  {x: 1120, y: 330, width: 30, height: 100},
  {x: 900, y: 200, width: 30, height: 150},
  {x: 300, y: 1100, width: 150, height: 30},
  {x: 300, y: 970, width: 30, height: 130},
  {x: 500, y: 1050, width: 30, height: 150},
  {x: 1000, y: 1100, width: 150, height: 30},
  {x: 1120, y: 970, width: 30, height: 130},
  {x: 900, y: 1050, width: 30, height: 150},
  {x: 100, y: 700, width: 50, height: 100},
  {x: 1350, y: 700, width: 50, height: 100}
];

let gameStartTime = 0;
let gameState = 'MENU';
let dificuldade = 1;
let modoJogo = 'solo';
let player,
  bots,
  bullets,
  caixas,
  particles,
  damageTexts,
  bombs = [],
  explosions = [],
  slashes = [],
  basucas = [];
let camX = 0,
  camY = 0;
let safeZone = {radius: 1100};
let frameScale = 1;
const MS_POR_FRAME = 1000 / 60;
const IS_FIREFOX = navigator.userAgent.toLowerCase().includes('firefox');
const REDUZIR_EFEITOS_CANVAS = IS_FIREFOX;
const MAX_PARTICULAS = IS_FIREFOX ? 140 : 220;
const INTERVALO_MINIMAPA_MS = IS_FIREFOX ? 120 : 80;
const ESTADO_CHEFE = {
  PATRULHA: 'PATRULHA',
  PERSEGUICAO: 'PERSEGUICAO',
  COMBATE: 'COMBATE',
  RECUO: 'RECUO',
  BUSCA: 'BUSCA'
};
const LIMIAR_TROCA_CHEFE = 1.2;
const TEMPO_MINIMO_TROCA_CHEFE = 2000;
const PESO_AMEACA_CHEFE = 1.0;
const PESO_VULNERABILIDADE_CHEFE = 1.0;
const PESO_DISTANCIA_CHEFE = 0.08;
