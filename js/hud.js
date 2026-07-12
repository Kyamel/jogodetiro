let ultimoDesenhoMinimapa = 0;
function desenharMira() {
  if (!player || player.hp <= 0 || gameState !== 'PLAYING') return;
  ctx.save();
  ctx.translate(mouse.x, mouse.y);
  ctx.strokeStyle = 'rgba(54,216,255,0.92)';
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(54,216,255,0.65)';
  ctx.shadowBlur = REDUZIR_EFEITOS_CANVAS ? 0 : 12;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.moveTo(-18, 0);
  ctx.lineTo(-7, 0);
  ctx.moveTo(7, 0);
  ctx.lineTo(18, 0);
  ctx.moveTo(0, -18);
  ctx.lineTo(0, -7);
  ctx.moveTo(0, 7);
  ctx.lineTo(0, 18);
  ctx.stroke();
  ctx.restore();
}
function desenharMinimapa(now = Date.now()) {
  if (!radarCtx || !player || gameState === 'MENU' || gameState === 'GAMEOVER') return;
  if (now - ultimoDesenhoMinimapa < INTERVALO_MINIMAPA_MS) return;
  ultimoDesenhoMinimapa = now;
  let w = radarCanvas.width,
    h = radarCanvas.height,
    pad = 10;
  let escala = (w - pad * 2) / arena.width;
  radarCtx.clearRect(0, 0, w, h);
  radarCtx.fillStyle = 'rgba(2,6,12,0.92)';
  radarCtx.fillRect(0, 0, w, h);
  radarCtx.strokeStyle = 'rgba(54,216,255,0.18)';
  radarCtx.lineWidth = 1;
  for (let i = 0; i <= arena.width; i += 300) {
    let x = pad + i * escala;
    radarCtx.beginPath();
    radarCtx.moveTo(x, pad);
    radarCtx.lineTo(x, h - pad);
    radarCtx.stroke();
  }
  for (let i = 0; i <= arena.height; i += 300) {
    let y = pad + i * escala;
    radarCtx.beginPath();
    radarCtx.moveTo(pad, y);
    radarCtx.lineTo(w - pad, y);
    radarCtx.stroke();
  }
  radarCtx.strokeStyle = 'rgba(255,255,255,0.24)';
  radarCtx.strokeRect(pad, pad, arena.width * escala, arena.height * escala);
  if (modoJogo !== 'boss') {
    radarCtx.strokeStyle = 'rgba(255,77,109,0.78)';
    radarCtx.lineWidth = 2;
    radarCtx.beginPath();
    radarCtx.arc(
      pad + 750 * escala,
      pad + 750 * escala,
      Math.max(0, safeZone.radius) * escala,
      0,
      Math.PI * 2
    );
    radarCtx.stroke();
  }
  radarCtx.fillStyle = 'rgba(255,255,255,0.16)';
  walls.forEach((wall) =>
    radarCtx.fillRect(
      pad + wall.x * escala,
      pad + wall.y * escala,
      wall.width * escala,
      wall.height * escala
    )
  );
  caixas.forEach((cx) => {
    radarCtx.fillStyle =
      cx.tipo === 'vida'
        ? '#ff4d6d'
        : cx.tipo === 'arma'
          ? '#ffd166'
          : cx.tipo === 'escudo'
            ? '#36d8ff'
            : '#63f0a0';
    radarCtx.fillRect(pad + cx.x * escala - 2, pad + cx.y * escala - 2, 4, 4);
  });
  bots.forEach((bot) => {
    radarCtx.fillStyle =
      bot.teamId === player.teamId ? '#36d8ff' : bot.isBoss ? '#ff4d6d' : '#ff8a3d';
    radarCtx.beginPath();
    radarCtx.arc(pad + bot.x * escala, pad + bot.y * escala, bot.isBoss ? 4 : 2.5, 0, Math.PI * 2);
    radarCtx.fill();
  });
  radarCtx.fillStyle = '#63f0a0';
  radarCtx.beginPath();
  radarCtx.arc(pad + player.x * escala, pad + player.y * escala, 4, 0, Math.PI * 2);
  radarCtx.fill();
  radarCtx.strokeStyle = 'rgba(99,240,160,0.82)';
  radarCtx.beginPath();
  radarCtx.moveTo(pad + player.x * escala, pad + player.y * escala);
  radarCtx.lineTo(
    pad + (player.x + Math.cos(player.angle) * 90) * escala,
    pad + (player.y + Math.sin(player.angle) * 90) * escala
  );
  radarCtx.stroke();
}

function atualizarUI() {
  if (!player) return;
  let maxHpUI = inventario.tita ? 150 : 100;
  let hpAtual = Math.max(0, player.hp);
  document.getElementById('hp').innerText = player.hp > 0 ? `${hpAtual}/${maxHpUI}` : 'MORTO';
  document.getElementById('escudo').innerText = player.armor;
  document.getElementById('hpBar').style.width =
    `${Math.max(0, Math.min(100, (hpAtual / maxHpUI) * 100))}%`;
  document.getElementById('escudoBar').style.width =
    `${Math.max(0, Math.min(100, (player.armor / 50) * 100))}%`;
  document.getElementById('dano').innerText = player.damage;
  document.getElementById('vel').innerText =
    player.speed > 4.5 ? 'Relâmpago' : player.speed > 3.5 ? 'Rápido' : 'Normal';
  if (modoJogo === 'boss') {
    let boss = bots.find((b) => b.isBoss);
    document.getElementById('infoModoTexto').innerText = 'HP Chefão:';
    document.getElementById('botsText').innerText = boss ? boss.hp : '0';
  } else {
    let numEquipes = getEquipesVivas();
    if (modoJogo === 'solo') {
      document.getElementById('infoModoTexto').innerText = 'Inimigos Vivos:';
      document.getElementById('botsText').innerText = numEquipes - (player.hp > 0 ? 1 : 0);
    } else {
      document.getElementById('infoModoTexto').innerText = 'Equipes Vivas:';
      document.getElementById('botsText').innerText = numEquipes;
    }
  }
  if (basucaDesbloqueada) {
    document.getElementById('uiBasuca').style.display = 'block';
    document.getElementById('municaoBasuca').innerText = player.bazookaAmmo;
  } else {
    document.getElementById('uiBasuca').style.display = 'none';
  }
  document.getElementById('skillSword').classList.toggle('locked', !inventario.espada);
  document.getElementById('skillBomb').classList.toggle('locked', !inventario.granada);
  document.getElementById('skillBazooka').classList.toggle('locked', !basucaDesbloqueada);
}
