// --- LÓGICA E CONSTRUÇÃO DO PASSE DE BATALHA ---
function getCustoPatamar() {
  return passe.vip ? 50 : 100;
}
function getPatamarAtual() {
  return Math.min(30, Math.floor(diamantes / getCustoPatamar()));
}

function progressoMissao(id, valor) {
  passe.missoes[id].atual += valor;
  salvarProgresso();
}

function resgatarMissao(id) {
  let m = passe.missoes[id];
  if (m.atual >= m.meta) {
    diamantes += m.premio;
    m.atual = 0;
    m.meta = Math.floor(m.meta * 1.5);
    m.premio = Math.floor(m.premio * 1.2);
    salvarProgresso();
    gerarPasseHTML();
    atualizarMenus();
    tocarSom('powerup');
  }
}

function comprarVip() {
  if (moedas >= 10000 && !passe.vip) {
    moedas -= 10000;
    passe.vip = true;
    salvarProgresso();
    gerarPasseHTML();
    atualizarMenus();
    tocarSom('compra');
  }
}

function resgatarPasse(tier, isVip) {
  let patamarAtual = getPatamarAtual();
  if (tier > patamarAtual) return;
  if (isVip && !passe.vip) return;

  let resgatados = isVip ? passe.resgatadosVip : passe.resgatadosFree;
  if (resgatados.includes(tier)) return;

  if (isVip) {
    if (tier === 30) {
      inventario.skins.ciborgue = true;
      inventario.skinEquipada = 'ciborgue';
    } else {
      moedas += tier * 100;
    }
  } else {
    if (tier === 30) {
      moedas += 2000;
    } else if (tier % 2 === 0) {
      moedas += tier * 20;
    }
  }

  resgatados.push(tier);
  salvarProgresso();
  gerarPasseHTML();
  atualizarMenus();
  tocarSom('powerup');
}

// AGORA SIM, A FUNÇÃO QUE DESENHA O PASSE NA TELA
function gerarPasseHTML() {
  let patamarAtual = getPatamarAtual();
  let proximoFalta = getCustoPatamar() - (diamantes % getCustoPatamar());
  if (patamarAtual >= 30) proximoFalta = 0;

  document.getElementById('textoPatamar').innerText = `Patamar Atual: ${patamarAtual}/30`;
  document.getElementById('textoCustoPasse').innerText =
    `1 Patamar = ${getCustoPatamar()} 💎 (Próximo em ${proximoFalta}💎)`;

  let btnVip = document.getElementById('btnComprarVip');
  if (passe.vip) {
    btnVip.innerText = '⭐ PASSE VIP ATIVADO ⭐';
    btnVip.style.background = '#555';
    btnVip.disabled = true;
  } else {
    btnVip.innerText = '⭐ COMPRAR PASSE VIP (10.000 💰)';
    btnVip.style.background = '#9C27B0';
    btnVip.disabled = moedas < 10000;
  }

  // Desenha Missões
  let missoesHTML = '';
  passe.missoes.forEach((m, index) => {
    let perc = Math.min(100, (m.atual / m.meta) * 100);
    let pronto = m.atual >= m.meta;
    missoesHTML += `<div class="missao-box">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div><b style="font-size:18px;color:#fff;">${m.desc}</b><br><span style="font-size:14px; color:#aaa;">Progresso: ${Math.floor(m.atual)} / ${m.meta}</span></div>
                <button class="btn" style="background: ${pronto ? '#4CAF50' : '#555'}; margin:0; padding:10px 15px;" ${pronto ? '' : 'disabled'} onclick="resgatarMissao(${index})">Pegar ${m.premio} 💎</button>
            </div>
            <div class="progresso-bar"><div class="progresso-fill" style="width: ${perc}%;"></div></div>
        </div>`;
  });
  document.getElementById('listaMissoes').innerHTML = missoesHTML;

  // Desenha Patamares (Nível 1 a 30)
  let passHTML = '';
  for (let i = 1; i <= 30; i++) {
    let liberado = i <= patamarAtual;

    let freePremio = i === 30 ? '2000 💰' : i % 2 === 0 ? `${i * 20} 💰` : '---';
    let freeResgatado = passe.resgatadosFree.includes(i);
    let btnFree =
      freePremio === '---'
        ? `<button disabled style="background:#333;color:#555;border:none;">Vazio</button>`
        : freeResgatado
          ? `<button disabled style="background:#555;border:none;">Resgatado</button>`
          : `<button class="btn" style="background:${liberado ? '#4CAF50' : '#555'}" ${liberado ? '' : 'disabled'} onclick="resgatarPasse(${i}, false)">Pegar</button>`;

    let vipPremio = i === 30 ? '🤖 Skin CIBORGUE' : `${i * 100} 💰`;
    let vipResgatado = passe.resgatadosVip.includes(i);
    let btnVip = vipResgatado
      ? `<button disabled style="background:#555;border:none;">Resgatado</button>`
      : `<button class="btn" style="background:${liberado && passe.vip ? '#9C27B0' : '#555'}" ${liberado && passe.vip ? '' : 'disabled'} onclick="resgatarPasse(${i}, true)">Pegar</button>`;

    passHTML += `<div class="passe-tier">
            <div class="passe-header"><span>NÍVEL ${i}</span> <span style="color:#00BCD4; font-size:14px;">(Requer ${i * getCustoPatamar()} 💎)</span></div>
            <div class="passe-recompensas">
                <div class="passe-lado"> <span style="font-size:12px;color:#aaa;font-weight:bold;">GRÁTIS</span> <b style="font-size:16px; margin:10px 0; color:#fff;">${freePremio}</b> ${btnFree} </div>
                <div class="passe-lado vip"> <span style="font-size:12px;color:gold;font-weight:bold;">PASSE VIP</span> <b style="font-size:16px; margin:10px 0; color:gold;">${vipPremio}</b> ${btnVip} </div>
            </div>
        </div>`;
  }
  document.getElementById('listaPatamares').innerHTML = passHTML;
}
