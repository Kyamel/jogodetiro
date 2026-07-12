function obterEntidadePorId(id) {
    if (player && player.id === id && player.hp > 0) return player;
    return bots.find(b => b.id === id && b.hp > 0) || null;
}
function atualizarVelocidadeEntidade(entidade) {
    if (!entidade) return;
    if (entidade.prevX === undefined || entidade.prevY === undefined) {
        entidade.prevX = entidade.x;
        entidade.prevY = entidade.y;
    }
    let escala = frameScale || 1;
    entidade.velX = (entidade.x - entidade.prevX) / escala;
    entidade.velY = (entidade.y - entidade.prevY) / escala;
    entidade.prevX = entidade.x;
    entidade.prevY = entidade.y;
}
function registrarAmeacaChefe(entidade, sourceId, danoGerado) {
    if (!entidade || !entidade.isBoss || !sourceId || sourceId === entidade.id || sourceId === "gas") return;
    let atacante = obterEntidadePorId(sourceId);
    if (!atacante || atacante.teamId === entidade.teamId) return;
    if (!entidade.ameaca) entidade.ameaca = {};
    entidade.ameaca[sourceId] = (entidade.ameaca[sourceId] || 0) + Math.max(5, danoGerado);
    entidade.ultimoAtacanteId = sourceId;
    entidade.ultimaPosicaoConhecida = { x: atacante.x, y: atacante.y, t: Date.now() };
}
function darDano(entidade, dano, x, y, isCritical, sourceId) { 
    let dFinal = isCritical ? Math.floor(dano * 1.5) : dano; 
    if(sourceId === "player") progressoMissao(2, dFinal); 
    if (entidade.armor && entidade.armor > 0) { if (dFinal >= entidade.armor) { dFinal -= entidade.armor; entidade.armor = 0; entidade.hp -= dFinal; } else { entidade.armor -= dFinal; dFinal = 0; } } else { entidade.hp -= dFinal; } 
    if (entidade.isBoss) registrarAmeacaChefe(entidade, sourceId, Math.max(dFinal, dano * 0.25));
    if(entidade.id === "player" || entidade.isBoss) atualizarUI(); mostrarDanoText(x, y, isCritical ? (dFinal > 0 ? dFinal : "BLOCKED") : (dFinal > 0 ? dFinal : "BLOCKED"), isCritical); 
}
function moverEntidade(entidade, movX, movY) { let deslocX = movX * frameScale; let deslocY = movY * frameScale; let nX = entidade.x + deslocX; let nY = entidade.y + deslocY; let canX = true; let canY = true; for (let w of walls) { if (checkCollision({ x: nX, y: entidade.y, radius: entidade.radius }, w)) canX = false; } for (let w of walls) { if (checkCollision({ x: entidade.x, y: nY, radius: entidade.radius }, w)) canY = false; } if (nX < entidade.radius || nX > arena.width - entidade.radius) canX = false; if (nY < entidade.radius || nY > arena.height - entidade.radius) canY = false; if (canX) entidade.x = nX; if (canY) entidade.y = nY; }
function moverBotPara(bot, ponto, multiplicador = 1) {
    if (!ponto) return;
    let ang = Math.atan2(ponto.y - bot.y, ponto.x - bot.x);
    bot.angle = ang;
    moverEntidade(bot, Math.cos(ang) * bot.speed * multiplicador, Math.sin(ang) * bot.speed * multiplicador);
}
function patrulharBot(bot) {
    if (!bot.patrolPoint || Math.hypot(bot.patrolPoint.x - bot.x, bot.patrolPoint.y - bot.y) < 30) {
        bot.patrolPoint = getValidSpawn(false, false, bot.isBoss ? 60 : 20);
    }
    moverBotPara(bot, bot.patrolPoint);
}
