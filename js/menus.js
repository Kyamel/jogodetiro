// --- SISTEMAS DE MENU ---
function atualizarMenuModo() {
  let modo = document.getElementById('selectModo').value;
  if (modo === 'boss') {
    document.getElementById('menuDificuldade').style.display = 'none';
    document.getElementById('menuBoss').style.display = 'block';
    document.getElementById('textoNivelBoss').innerText = Math.min(10, nivelChefeProgresso);
  } else {
    document.getElementById('menuDificuldade').style.display = 'block';
    document.getElementById('menuBoss').style.display = 'none';
  }
}

function atualizarMenus() {
  document.getElementById('menuMoedas').innerText = moedas;
  document.getElementById('lojaMoedas').innerText = moedas;
  document.getElementById('passeMoedas').innerText = moedas;
  document.getElementById('menuDiamantes').innerText = diamantes;
  document.getElementById('lojaDiamantes').innerText = diamantes;
  document.getElementById('passeDiamantes').innerText = diamantes;

  let itens = [
    'rifle',
    'colete',
    'ninja',
    'espada',
    'granada',
    'regen',
    'botas',
    'tita',
    'vampiro'
  ];
  let precos = [300, 200, 500, 600, 800, 1000, 1200, 1500, 2000];
  for (let i = 0; i < itens.length; i++) {
    let btn = document.getElementById(
      'btnComprar' + itens[i].charAt(0).toUpperCase() + itens[i].slice(1)
    );
    if (btn) {
      if (inventario[itens[i]]) {
        btn.innerText = 'EQUIPADO';
        btn.disabled = true;
        btn.style.background = '#555';
      } else {
        btn.innerText = precos[i] + ' 💰';
        btn.disabled = moedas < precos[i];
        btn.style.background = moedas < precos[i] ? '#888' : '#4CAF50';
      }
    }
  }

  let skinsLista = ['padrao', 'deserto', 'neon', 'fantasma', 'realeza', 'dourada', 'ciborgue'];
  let skinsPrecos = [0, 150, 300, 500, 800, 1000, 0];
  document.getElementById('divSkinCiborgue').style.display = inventario.skins.ciborgue
    ? 'flex'
    : 'none';

  for (let i = 0; i < skinsLista.length; i++) {
    let skinKey = skinsLista[i];
    let btn = document.getElementById(
      'btnSkin' + skinKey.charAt(0).toUpperCase() + skinKey.slice(1)
    );
    if (btn) {
      if (inventario.skinEquipada === skinKey) {
        btn.innerText = 'USANDO';
        btn.disabled = true;
        btn.style.background = '#555';
        btn.className = 'btn';
      } else if (inventario.skins[skinKey]) {
        btn.innerText = 'EQUIPAR';
        btn.disabled = false;
        btn.className = 'btn btn-equipar';
      } else {
        btn.innerText = skinsPrecos[i] + ' 💰';
        btn.disabled = moedas < skinsPrecos[i];
        btn.style.background = moedas < skinsPrecos[i] ? '#888' : '#4CAF50';
        btn.className = 'btn';
      }
    }
  }
}

function comprarItem(item, preco) {
  if (inventario[item] || moedas < preco) return;
  moedas -= preco;
  inventario[item] = true;
  salvarProgresso();
  atualizarMenus();
  tocarSom('compra');
}

function comprarOuEquiparSkin(skin, preco) {
  if (skin === 'ciborgue' && !inventario.skins.ciborgue) return;
  if (!inventario.skins[skin]) {
    if (moedas < preco) return;
    moedas -= preco;
    inventario.skins[skin] = true;
  }
  inventario.skinEquipada = skin;
  salvarProgresso();
  atualizarMenus();
  tocarSom('compra');
}

function mostrarTela(telaId) {
  [
    'menuPrincipal',
    'menuLoja',
    'menuGameOver',
    'menuPasse',
    'ui',
    'radarPanel',
    'abilityDeck'
  ].forEach((id) => (document.getElementById(id).style.display = 'none'));
  if (telaId === 'ui') {
    document.getElementById('ui').style.display = 'block';
    document.getElementById('radarPanel').style.display = 'block';
    document.getElementById('abilityDeck').style.display = 'grid';
    return;
  }
  if (telaId) document.getElementById(telaId).style.display = 'block';
}
function abrirLoja() {
  atualizarMenus();
  mostrarTela('menuLoja');
}
function fecharLoja() {
  mostrarTela('menuPrincipal');
  atualizarMenuModo();
}
function abrirPasse() {
  mostrarTela('menuPasse');
  gerarPasseHTML();
  atualizarMenus();
}
function fecharPasse() {
  mostrarTela('menuPrincipal');
  atualizarMenuModo();
}
function voltarAoMenu() {
  gameState = 'MENU';
  mostrarTela('menuPrincipal');
  atualizarMenus();
  atualizarMenuModo();
}
