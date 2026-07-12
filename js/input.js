const keys = {};
const mouse = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  worldX: 750,
  worldY: 750,
  isDown: false
};
const TECLAS_POR_CODE = {
  KeyW: 'w',
  KeyA: 'a',
  KeyS: 's',
  KeyD: 'd',
  ArrowUp: 'arrowup',
  ArrowLeft: 'arrowleft',
  ArrowDown: 'arrowdown',
  ArrowRight: 'arrowright',
  Space: ' ',
  Digit1: '1',
  Digit2: '2',
  Digit3: '3'
};
const TECLAS_POR_KEYCODE = {
  87: 'w',
  65: 'a',
  83: 's',
  68: 'd',
  38: 'arrowup',
  37: 'arrowleft',
  40: 'arrowdown',
  39: 'arrowright',
  32: ' ',
  49: '1',
  50: '2',
  51: '3'
};
const TECLAS_DO_JOGO = [
  'w',
  'a',
  's',
  'd',
  'arrowup',
  'arrowleft',
  'arrowdown',
  'arrowright',
  ' ',
  '1',
  '2',
  '3'
];
const textKeys = {};
const timersSoltarTecla = {};

function teclaAtiva(key, code = null, keyCode = null) {
  return !!(keys[key] || textKeys[key] || (code && keys[code]) || (keyCode && keys[keyCode]));
}

function marcarTecla(key, pressionada) {
  if (!key) return;
  keys[key] = pressionada;
}

function soltarTeclaDepois(key) {
  if (!key) return;
  clearTimeout(timersSoltarTecla[key]);
  timersSoltarTecla[key] = setTimeout(() => {
    textKeys[key] = false;
  }, 140);
}

function registrarTecla(e, pressionada) {
  let key = (e.key || '').toLowerCase();
  let codeKey = TECLAS_POR_CODE[e.code];
  let keyCode = e.keyCode || e.which;
  let keyCodeKey = TECLAS_POR_KEYCODE[keyCode];

  marcarTecla(e.key, pressionada);
  marcarTecla(key, pressionada);
  marcarTecla(e.code, pressionada);
  marcarTecla(codeKey, pressionada);
  marcarTecla(keyCode, pressionada);
  marcarTecla(keyCodeKey, pressionada);

  if (TECLAS_DO_JOGO.includes(key) || codeKey || keyCodeKey) e.preventDefault();
}

function registrarTeclaPorTexto(e) {
  let key = (e.key || String.fromCharCode(e.charCode || e.which || 0)).toLowerCase();
  if (!TECLAS_DO_JOGO.includes(key)) return;
  textKeys[key] = true;
  soltarTeclaDepois(key);
  e.preventDefault();
}
function atualizarMouse(e) {
  let rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
}
window.addEventListener('keydown', (e) => registrarTecla(e, true), true);
window.addEventListener('keyup', (e) => registrarTecla(e, false), true);
window.addEventListener('keypress', registrarTeclaPorTexto, true);
window.addEventListener('mousemove', atualizarMouse);
canvas.addEventListener('mousedown', (e) => {
  canvas.focus();
  if (e.button === 0) {
    atualizarMouse(e);
    mouse.isDown = true;
    if (gameState === 'PLAYING' && player && player.hp > 0) {
      atualizarMiraJogador();
      atirarJogador(Date.now());
    }
    e.preventDefault();
  }
});
window.addEventListener('mouseup', (e) => {
  if (e.button === 0) mouse.isDown = false;
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
