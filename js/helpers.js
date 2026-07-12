function criarParticulas(x, y, color = 'orange', quantidade = 6) {
  if (!particles) return;
  let espacoLivre = Math.max(0, MAX_PARTICULAS - particles.length);
  let total = Math.min(quantidade, espacoLivre);
  for (let i = 0; i < total; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 1.0,
      size: Math.random() * 3 + 1,
      color: color
    });
  }
}
function mostrarDanoText(x, y, valor, isCritical, isHeal = false) {
  let color = isCritical ? '#ff0000' : '#ffffff';
  if (isHeal) color = '#00ff00';
  damageTexts.push({
    x: x + (Math.random() * 20 - 10),
    y: y - 10,
    text: valor,
    life: 1.0,
    color: color,
    size: isCritical ? 24 : 16
  });
}
function checkCollision(circle, rect) {
  let closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  let closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  let dX = circle.x - closestX;
  let dY = circle.y - closestY;
  return dX * dX + dY * dY < circle.radius * circle.radius;
}
function temParede(x1, y1, x2, y2) {
  let dist = Math.hypot(x2 - x1, y2 - y1);
  let steps = Math.max(5, Math.ceil(dist / 20));
  for (let i = 0; i <= steps; i++) {
    let px = x1 + (x2 - x1) * (i / steps);
    let py = y1 + (y2 - y1) * (i / steps);
    for (let w of walls) {
      if (px > w.x && px < w.x + w.width && py > w.y && py < w.y + w.height) return true;
    }
  }
  return false;
}
function getValidSpawn(isPlayer = false, keepDistanceFromCenter = true, reqRad = 30) {
  let valid = false;
  let sx, sy;
  let attempts = 0;
  while (!valid && attempts < 150) {
    sx = Math.random() * 1300 + 100;
    sy = Math.random() * 1300 + 100;
    if (!isPlayer && keepDistanceFromCenter && Math.hypot(sx - 750, sy - 750) < 400) {
      attempts++;
      continue;
    }
    let hitWall = false;
    for (let w of walls) {
      if (
        sx > w.x - reqRad &&
        sx < w.x + w.width + reqRad &&
        sy > w.y - reqRad &&
        sy < w.y + w.height + reqRad
      ) {
        hitWall = true;
        break;
      }
    }
    if (!hitWall) valid = true;
    attempts++;
  }
  return {x: sx || 200, y: sy || 200};
}
function getEquipesVivas() {
  let equipes = new Set();
  if (player && player.hp > 0) equipes.add(player.teamId);
  bots.forEach((b) => equipes.add(b.teamId));
  return equipes.size;
}
function atualizarMiraJogador() {
  if (!player) return;
  let viewCamX = canvas.width / 2 - player.x;
  let viewCamY = canvas.height / 2 - player.y;
  mouse.worldX = mouse.x - viewCamX;
  mouse.worldY = mouse.y - viewCamY;
  player.angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
}
function atirarJogador(now) {
  if (!player || player.hp <= 0 || now - player.lastShot <= 300) return;
  bullets.push({
    ownerId: player.id,
    teamId: player.teamId,
    x: player.x + Math.cos(player.angle) * 20,
    y: player.y + Math.sin(player.angle) * 20,
    angle: player.angle,
    speed: 10,
    damage: player.damage,
    skin: player.skin
  });
  player.lastShot = now;
  tocarSom('tiroJ');
}
function caminhoArredondado(x, y, w, h, r) {
  let rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}
function preencherRetanguloArredondado(
  x,
  y,
  w,
  h,
  r,
  fillStyle,
  strokeStyle = null,
  lineWidth = 1
) {
  caminhoArredondado(x, y, w, h, r);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}
