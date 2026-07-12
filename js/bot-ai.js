function valorCaixaBot(caixa, bot) {
  if (!caixa) return 0;
  if (caixa.tipo === 'vida') return bot.hp < 40 ? 95 : bot.hp < 75 ? 55 : 8;
  if (caixa.tipo === 'escudo') return (bot.armor || 0) < 35 ? 62 : 12;
  if (caixa.tipo === 'arma') return bot.damage < 20 ? 72 : 14;
  if (caixa.tipo === 'velocidade') return bot.speed < 4.8 ? 50 : 10;
  return 20;
}
function vantagemDeCombateBot(bot, alvo, distAlvo) {
  if (!alvo) return 0;
  let vidaBot = bot.hp + (bot.armor || 0);
  let vidaAlvo = alvo.hp + (alvo.armor || 0);
  let vantagemVida = Math.max(-35, Math.min(35, (vidaBot - vidaAlvo) * 0.35));
  let vantagemDano = ((bot.damage || 10) - (alvo.damage || 10)) * 2;
  let faixaIdeal = distAlvo > 170 && distAlvo < 360 ? 14 : -8;
  return vantagemVida + vantagemDano + faixaIdeal;
}
function pontoValidoParaBot(ponto, bot) {
  if (
    !ponto ||
    ponto.x < bot.radius ||
    ponto.x > arena.width - bot.radius ||
    ponto.y < bot.radius ||
    ponto.y > arena.height - bot.radius
  )
    return false;
  return !walls.some((w) => checkCollision({x: ponto.x, y: ponto.y, radius: bot.radius}, w));
}
function encontrarCoberturaBot(bot, inimigo) {
  if (!inimigo) return null;
  let pad = bot.radius + 18;
  let candidatos = [];
  walls.forEach((w) => {
    let cx = Math.max(w.x - 80, Math.min(w.x + w.width + 80, bot.x));
    let cy = Math.max(w.y - 80, Math.min(w.y + w.height + 80, bot.y));
    candidatos.push(
      {x: w.x - pad, y: cy},
      {x: w.x + w.width + pad, y: cy},
      {x: cx, y: w.y - pad},
      {x: cx, y: w.y + w.height + pad}
    );
  });
  let melhor = null;
  let melhorScore = Infinity;
  candidatos.forEach((p) => {
    if (!pontoValidoParaBot(p, bot)) return;
    if (!temParede(inimigo.x, inimigo.y, p.x, p.y)) return;
    let distBot = Math.hypot(p.x - bot.x, p.y - bot.y);
    let distInimigo = Math.hypot(p.x - inimigo.x, p.y - inimigo.y);
    if (distBot > 520) return;
    let score = distBot + Math.max(0, 260 - distInimigo) * 1.5;
    if (score < melhorScore) {
      melhorScore = score;
      melhor = p;
    }
  });
  return melhor;
}
// --- TATICA DE TIME: cerco/pinca para encurralar o adversario ---
// Aponta para a borda de arena mais proxima do alvo. Usamos isso para empurrar o
// inimigo contra a parede: os bots se posicionam do lado aberto (oposto a borda).
function anguloParaBordaMaisProxima(alvo) {
  let dl = alvo.x;
  let dr = arena.width - alvo.x;
  let dt = alvo.y;
  let db = arena.height - alvo.y;
  let m = Math.min(dl, dr, dt, db);
  if (m === dl) return Math.PI; // parede a esquerda
  if (m === dr) return 0; // parede a direita
  if (m === dt) return -Math.PI / 2; // parede em cima
  return Math.PI / 2; // parede embaixo
}
// Bots vivos do mesmo time (fora o chefao) que estao engajando o mesmo alvo.
function aliadosEngajando(bot, alvo) {
  let grupo = bots.filter(
    (o) =>
      o !== bot &&
      o.hp > 0 &&
      !o.isBoss &&
      o.teamId === bot.teamId &&
      Math.hypot(o.x - alvo.x, o.y - alvo.y) < 560
  );
  grupo.push(bot);
  grupo.sort((a, b) => (a.id < b.id ? -1 : 1));
  return grupo;
}
// Calcula a posicao de cerco deste bot: os aliados se distribuem num leque em
// volta do alvo, centrado no lado oposto a parede mais proxima. Assim eles cobrem
// as rotas de fuga e prensam o inimigo contra a parede/quina.
function posicaoDeCerco(bot, alvo) {
  let grupo = aliadosEngajando(bot, alvo);
  let n = grupo.length;
  let idx = grupo.indexOf(bot);
  if (n <= 1) return null;
  let centro = anguloParaBordaMaisProxima(alvo) + Math.PI;
  let leque = Math.min(Math.PI * 1.15, 0.6 + (n - 1) * 0.55);
  let ang = centro - leque / 2 + (leque * idx) / (n - 1);
  let raio = 150;
  let px = alvo.x + Math.cos(ang) * raio;
  let py = alvo.y + Math.sin(ang) * raio;
  return {
    x: Math.max(bot.radius + 6, Math.min(arena.width - bot.radius - 6, px)),
    y: Math.max(bot.radius + 6, Math.min(arena.height - bot.radius - 6, py)),
    n
  };
}
function decidirAcaoBotSimples(bot, contexto) {
  let scoreRecurso = contexto.caixaVisivel
    ? valorCaixaBot(contexto.caixa, bot) - contexto.distCaixa * 0.08
    : 0;
  if (contexto.alvoVisivel && contexto.distAlvo < 180 && bot.hp > 45) scoreRecurso -= 35;
  let scoreAtaque = contexto.alvoVisivel
    ? 60 + vantagemDeCombateBot(bot, contexto.alvo, contexto.distAlvo) - contexto.distAlvo * 0.05
    : 0;
  if (bot.hp < 35) scoreAtaque -= 45;
  // Curta distancia: se o inimigo esta praticamente em cima, o bot precisa revidar
  // em vez de tentar fugir/cobrir. Sem isso, um bot pressionado ficava passivo e
  // "sem conseguir atacar" quando o jogador colava nele.
  let coladoNoInimigo = contexto.alvoVisivel && contexto.distAlvo < 120;
  if (coladoNoInimigo && bot.hp > 25) scoreAtaque += 55;
  let scoreCobertura = contexto.cobertura ? 70 - contexto.distCobertura * 0.08 : 0;
  if (contexto.alvoVisivel && !coladoNoInimigo && (bot.hp < 55 || contexto.recarregando))
    scoreCobertura += bot.hp < 35 ? 70 : 35;
  else scoreCobertura = 0;
  let scoreRecuo =
    bot.hp < 35 && !coladoNoInimigo && contexto.inimigoPerto
      ? contexto.cobertura
        ? 65
        : 90
      : 0;
  const acoes = [
    {tipo: 'VOLTAR_ZONA', score: contexto.foraDaZona ? 130 : contexto.pertoDaBorda ? 70 : 0},
    {tipo: 'BUSCAR_COBERTURA', score: scoreCobertura},
    {tipo: 'BUSCAR_RECURSO', score: scoreRecurso},
    {tipo: 'ATACAR', score: scoreAtaque},
    {tipo: 'RECUAR', score: scoreRecuo},
    {tipo: 'PATRULHAR', score: 20}
  ];
  return acoes.sort((a, b) => b.score - a.score)[0].tipo;
}
function executarAcaoBotSimples(bot, decisao, contexto, now) {
  if (decisao === 'VOLTAR_ZONA') {
    moverBotPara(bot, {x: 750, y: 750});
    return;
  }
  if (decisao === 'BUSCAR_COBERTURA' && contexto.cobertura) {
    bot.coverPoint = contexto.cobertura;
    moverBotPara(bot, contexto.cobertura);
    return;
  }
  bot.coverPoint = null;
  if (decisao === 'BUSCAR_RECURSO' && contexto.caixa) {
    moverBotPara(bot, contexto.caixa);
    return;
  }
  if (decisao === 'RECUAR' && contexto.alvo) {
    girarEntidadePara(bot, Math.atan2(contexto.alvo.y - bot.y, contexto.alvo.x - bot.x));
    let fuga = Math.atan2(bot.y - contexto.alvo.y, bot.x - contexto.alvo.x);
    moverEntidade(bot, Math.cos(fuga) * bot.speed, Math.sin(fuga) * bot.speed);
    return;
  }
  if (decisao === 'ATACAR' && contexto.alvo) {
    let miraAlvo = Math.atan2(contexto.alvo.y - bot.y, contexto.alvo.x - bot.x);
    girarEntidadePara(bot, miraAlvo);
    // Em modo de times, se ha aliados engajando o mesmo alvo, o bot ocupa sua
    // posicao de cerco (pinca) para encurralar o inimigo, em vez de so orbitar.
    let cerco = modoJogo === 'duo' && contexto.alvoVisivel ? posicaoDeCerco(bot, contexto.alvo) : null;
    if (cerco && Math.hypot(cerco.x - bot.x, cerco.y - bot.y) > 40) {
      let ang = Math.atan2(cerco.y - bot.y, cerco.x - bot.x);
      moverEntidade(bot, Math.cos(ang) * bot.speed, Math.sin(ang) * bot.speed);
    } else if (!contexto.alvoVisivel || contexto.distAlvo > 250) {
      moverEntidade(bot, Math.cos(miraAlvo) * bot.speed, Math.sin(miraAlvo) * bot.speed);
    } else if (contexto.distAlvo < 150) {
      // Recua mantendo a mira; se a fuga esta bloqueada (encurralado), desliza de
      // lado em vez de grudar na parede e travar.
      let recX = -Math.cos(miraAlvo) * (bot.speed * 0.8);
      let recY = -Math.sin(miraAlvo) * (bot.speed * 0.8);
      let antesX = bot.x;
      let antesY = bot.y;
      moverEntidade(bot, recX, recY);
      if (Math.hypot(bot.x - antesX, bot.y - antesY) < bot.speed * 0.2) {
        moverEntidade(
          bot,
          Math.cos(miraAlvo + (Math.PI / 2) * bot.strafeDir) * bot.speed,
          Math.sin(miraAlvo + (Math.PI / 2) * bot.strafeDir) * bot.speed
        );
      }
    } else {
      moverEntidade(
        bot,
        Math.cos(miraAlvo + (Math.PI / 2) * bot.strafeDir) * bot.speed,
        Math.sin(miraAlvo + (Math.PI / 2) * bot.strafeDir) * bot.speed
      );
    }
    if (contexto.alvoVisivel && now - bot.lastShot > bot.shootCooldown && contexto.distAlvo < 430) {
      bullets.push({
        ownerId: bot.id,
        teamId: bot.teamId,
        x: bot.x + Math.cos(bot.angle) * 20,
        y: bot.y + Math.sin(bot.angle) * 20,
        angle: bot.angle,
        speed: 7,
        damage: bot.damage,
        skin: bot.skin
      });
      bot.lastShot = now;
      tocarSom('tiroB');
    }
    return;
  }
  patrulharBot(bot);
}
