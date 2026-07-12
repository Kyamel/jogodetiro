function valorCaixaBot(caixa, bot) {
    if (!caixa) return 0;
    if (caixa.tipo === "vida") return bot.hp < 40 ? 95 : (bot.hp < 75 ? 55 : 8);
    if (caixa.tipo === "escudo") return (bot.armor || 0) < 35 ? 62 : 12;
    if (caixa.tipo === "arma") return bot.damage < 20 ? 72 : 14;
    if (caixa.tipo === "velocidade") return bot.speed < 4.8 ? 50 : 10;
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
    if (!ponto || ponto.x < bot.radius || ponto.x > arena.width - bot.radius || ponto.y < bot.radius || ponto.y > arena.height - bot.radius) return false;
    return !walls.some(w => checkCollision({ x: ponto.x, y: ponto.y, radius: bot.radius }, w));
}
function encontrarCoberturaBot(bot, inimigo) {
    if (!inimigo) return null;
    let pad = bot.radius + 18;
    let candidatos = [];
    walls.forEach(w => {
        let cx = Math.max(w.x - 80, Math.min(w.x + w.width + 80, bot.x));
        let cy = Math.max(w.y - 80, Math.min(w.y + w.height + 80, bot.y));
        candidatos.push({ x: w.x - pad, y: cy }, { x: w.x + w.width + pad, y: cy }, { x: cx, y: w.y - pad }, { x: cx, y: w.y + w.height + pad });
    });
    let melhor = null;
    let melhorScore = Infinity;
    candidatos.forEach(p => {
        if (!pontoValidoParaBot(p, bot)) return;
        if (!temParede(inimigo.x, inimigo.y, p.x, p.y)) return;
        let distBot = Math.hypot(p.x - bot.x, p.y - bot.y);
        let distInimigo = Math.hypot(p.x - inimigo.x, p.y - inimigo.y);
        if (distBot > 520) return;
        let score = distBot + Math.max(0, 260 - distInimigo) * 1.5;
        if (score < melhorScore) { melhorScore = score; melhor = p; }
    });
    return melhor;
}
function decidirAcaoBotSimples(bot, contexto) {
    let scoreRecurso = contexto.caixaVisivel ? valorCaixaBot(contexto.caixa, bot) - contexto.distCaixa * 0.08 : 0;
    if (contexto.alvoVisivel && contexto.distAlvo < 180 && bot.hp > 45) scoreRecurso -= 35;
    let scoreAtaque = contexto.alvoVisivel ? 60 + vantagemDeCombateBot(bot, contexto.alvo, contexto.distAlvo) - contexto.distAlvo * 0.05 : 0;
    if (bot.hp < 35) scoreAtaque -= 45;
    let scoreCobertura = contexto.cobertura ? 70 - contexto.distCobertura * 0.08 : 0;
    if (contexto.alvoVisivel && (bot.hp < 55 || contexto.recarregando)) scoreCobertura += bot.hp < 35 ? 70 : 35;
    else scoreCobertura = 0;
    let scoreRecuo = bot.hp < 35 && contexto.inimigoPerto ? (contexto.cobertura ? 65 : 90) : 0;
    const acoes = [
        { tipo: "VOLTAR_ZONA", score: contexto.foraDaZona ? 130 : (contexto.pertoDaBorda ? 70 : 0) },
        { tipo: "BUSCAR_COBERTURA", score: scoreCobertura },
        { tipo: "BUSCAR_RECURSO", score: scoreRecurso },
        { tipo: "ATACAR", score: scoreAtaque },
        { tipo: "RECUAR", score: scoreRecuo },
        { tipo: "PATRULHAR", score: 20 }
    ];
    return acoes.sort((a, b) => b.score - a.score)[0].tipo;
}
function executarAcaoBotSimples(bot, decisao, contexto, now) {
    if (decisao === "VOLTAR_ZONA") {
        moverBotPara(bot, { x: 750, y: 750 });
        return;
    }
    if (decisao === "BUSCAR_COBERTURA" && contexto.cobertura) {
        bot.coverPoint = contexto.cobertura;
        moverBotPara(bot, contexto.cobertura);
        return;
    }
    bot.coverPoint = null;
    if (decisao === "BUSCAR_RECURSO" && contexto.caixa) {
        moverBotPara(bot, contexto.caixa);
        return;
    }
    if (decisao === "RECUAR" && contexto.alvo) {
        bot.angle = Math.atan2(contexto.alvo.y - bot.y, contexto.alvo.x - bot.x);
        let fuga = Math.atan2(bot.y - contexto.alvo.y, bot.x - contexto.alvo.x);
        moverEntidade(bot, Math.cos(fuga) * bot.speed, Math.sin(fuga) * bot.speed);
        return;
    }
    if (decisao === "ATACAR" && contexto.alvo) {
        bot.angle = Math.atan2(contexto.alvo.y - bot.y, contexto.alvo.x - bot.x);
        if (!contexto.alvoVisivel || contexto.distAlvo > 250) {
            moverEntidade(bot, Math.cos(bot.angle) * bot.speed, Math.sin(bot.angle) * bot.speed);
        } else if (contexto.distAlvo < 150) {
            moverEntidade(bot, -Math.cos(bot.angle) * (bot.speed * 0.8), -Math.sin(bot.angle) * (bot.speed * 0.8));
        } else {
            moverEntidade(bot, Math.cos(bot.angle + (Math.PI / 2 * bot.strafeDir)) * bot.speed, Math.sin(bot.angle + (Math.PI / 2 * bot.strafeDir)) * bot.speed);
        }
        if (contexto.alvoVisivel && now - bot.lastShot > bot.shootCooldown && contexto.distAlvo < 430) {
            bullets.push({ ownerId: bot.id, teamId: bot.teamId, x: bot.x + Math.cos(bot.angle) * 20, y: bot.y + Math.sin(bot.angle) * 20, angle: bot.angle, speed: 7, damage: bot.damage, skin: bot.skin });
            bot.lastShot = now;
            tocarSom("tiroB");
        }
        return;
    }
    patrulharBot(bot);
}
