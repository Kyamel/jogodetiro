// Maquina de estados finitos do chefao:
// PATRULHA -> PERSEGUICAO -> COMBATE -> RECUO/BUSCA, conforme alvo, distancia,
// vida, visibilidade e memoria de curto prazo da ultima posicao conhecida.
function decairAmeacaChefe(chefe, now) {
    if (!chefe.ameaca) chefe.ameaca = {};
    if (!chefe.lastThreatDecay) chefe.lastThreatDecay = now;
    let dt = now - chefe.lastThreatDecay;
    if (dt < 250) return;
    let fator = Math.pow(0.88, dt / 1000);
    Object.keys(chefe.ameaca).forEach(id => {
        chefe.ameaca[id] *= fator;
        if (chefe.ameaca[id] < 1) delete chefe.ameaca[id];
    });
    chefe.lastThreatDecay = now;
}
function alterarEstadoChefe(chefe, estado, now) {
    if (chefe.estado === estado) return;
    chefe.estado = estado;
    chefe.estadoDesde = now;
    if (estado === ESTADO_CHEFE.BUSCA) chefe.buscaInicio = now;
}
function listarAlvosChefe(chefe) {
    let alvos = [];
    if (player && player.hp > 0 && player.teamId !== chefe.teamId) alvos.push(player);
    bots.forEach(o => { if (o !== chefe && o.hp > 0 && o.teamId !== chefe.teamId) alvos.push(o); });
    return alvos;
}
function calcularVulnerabilidadeAlvo(alvo) {
    let maxHpAlvo = alvo.maxHp || (alvo.id === "player" ? (inventario.tita ? 150 : 100) : 100);
    let hpRatio = Math.max(0, Math.min(1, alvo.hp / maxHpAlvo));
    let semArmadura = (alvo.armor || 0) <= 0 ? 18 : 0;
    let evasivo = alvo.isJumping ? -10 : 0;
    return (1 - hpRatio) * 70 + semArmadura + evasivo;
}
function pontuarAlvoChefe(chefe, alvo, now) {
    let dist = Math.hypot(alvo.x - chefe.x, alvo.y - chefe.y);
    let ameacaBase = chefe.ameaca ? (chefe.ameaca[alvo.id] || 0) : 0;
    let ameacaPorProximidade = Math.max(0, 650 - dist) * 0.06;
    let ameacaPorAtaqueRecente = alvo.lastShot && now - alvo.lastShot < 1200 ? 18 : 0;
    let ameaca = ameacaBase + ameacaPorProximidade + ameacaPorAtaqueRecente;
    let vulnerabilidade = calcularVulnerabilidadeAlvo(alvo);
    // score = alfa * ameaca + beta * vulnerabilidade - gama * distancia
    let score = PESO_AMEACA_CHEFE * ameaca + PESO_VULNERABILIDADE_CHEFE * vulnerabilidade - PESO_DISTANCIA_CHEFE * dist;
    return { alvo, score, dist, visivel: !temParede(chefe.x, chefe.y, alvo.x, alvo.y) };
}
function selecionarAlvoChefe(chefe, now) {
    decairAmeacaChefe(chefe, now);
    let pontuados = listarAlvosChefe(chefe).map(alvo => pontuarAlvoChefe(chefe, alvo, now)).sort((a, b) => b.score - a.score);
    if (pontuados.length === 0) {
        chefe.targetId = null;
        chefe.targetScore = 0;
        return null;
    }
    let melhor = pontuados[0];
    let atual = chefe.targetId ? pontuados.find(p => p.alvo.id === chefe.targetId) : null;
    if (!atual) {
        chefe.targetId = melhor.alvo.id;
        chefe.targetScore = melhor.score;
        chefe.lastTargetSwitch = now;
        atual = melhor;
    } else if (melhor.alvo.id !== atual.alvo.id && now - (chefe.lastTargetSwitch || 0) >= TEMPO_MINIMO_TROCA_CHEFE) {
        // Threshold e tempo minimo evitam que o chefao troque de alvo indeciso a cada quadro.
        let superouLimiar = atual.score <= 0 ? melhor.score > atual.score + 15 : melhor.score > atual.score * LIMIAR_TROCA_CHEFE;
        if (superouLimiar) {
            chefe.targetId = melhor.alvo.id;
            chefe.targetScore = melhor.score;
            chefe.lastTargetSwitch = now;
            atual = melhor;
        }
    }
    if (atual.visivel) {
        chefe.ultimaPosicaoConhecida = { x: atual.alvo.x, y: atual.alvo.y, t: now };
        chefe.lastTargetSeen = now;
    }
    return atual;
}
function calcularPosicaoPredita(atirador, alvo, velocidadeProjetil) {
    let dist = Math.hypot(alvo.x - atirador.x, alvo.y - atirador.y);
    let tempoEstimado = dist / Math.max(1, velocidadeProjetil);
    // Mira na posicao futura estimada pelo deslocamento recente do alvo.
    return {
        x: Math.max(alvo.radius || 0, Math.min(arena.width - (alvo.radius || 0), alvo.x + (alvo.velX || 0) * tempoEstimado)),
        y: Math.max(alvo.radius || 0, Math.min(arena.height - (alvo.radius || 0), alvo.y + (alvo.velY || 0) * tempoEstimado))
    };
}
function executarAtaqueChefe(chefe, infoAlvo, now) {
    let alvo = infoAlvo && infoAlvo.alvo;
    if (!alvo || !infoAlvo.visivel) return;
    let dist = infoAlvo.dist;
    chefe.angle = Math.atan2(alvo.y - chefe.y, alvo.x - chefe.x);
    if (dist < 115 && now - (chefe.lastMelee || 0) > 1100) {
        tocarSom("espada");
        slashes.push({ x: chefe.x, y: chefe.y, angle: chefe.angle, life: 1.0, radius: 95, skin: "boss" });
        [player, ...bots].forEach(o => { if (o && o.hp > 0 && o.teamId !== chefe.teamId && Math.hypot(o.x - chefe.x, o.y - chefe.y) < 110) darDano(o, 60, o.x, o.y, true, chefe.id); });
        chefe.lastMelee = now;
        return;
    }
    if (dist > 240 && dist < 720 && now - (chefe.lastBazooka || 0) > 2200) {
        let alvoFuturo = calcularPosicaoPredita(chefe, alvo, 12);
        let ang = Math.atan2(alvoFuturo.y - chefe.y, alvoFuturo.x - chefe.x);
        basucas.push({ teamId: chefe.teamId, ownerId: chefe.id, x: chefe.x, y: chefe.y, angle: ang, speed: 12, damage: 60 });
        chefe.lastBazooka = now;
        tocarSom("bomba");
        return;
    }
    if (now - chefe.lastShot > chefe.shootCooldown) {
        let alvoFuturo = calcularPosicaoPredita(chefe, alvo, 7);
        let ang = Math.atan2(alvoFuturo.y - chefe.y, alvoFuturo.x - chefe.x);
        [-0.12, 0, 0.12].forEach(offset => bullets.push({ ownerId: chefe.id, teamId: chefe.teamId, x: chefe.x, y: chefe.y, angle: ang + offset, speed: 7, damage: chefe.damage, skin: "boss" }));
        chefe.lastShot = now;
        tocarSom("tiroB");
    }
}
function atualizarChefeFSM(chefe, now) {
    if (!chefe.estado) alterarEstadoChefe(chefe, ESTADO_CHEFE.PATRULHA, now);
    let info = selecionarAlvoChefe(chefe, now);
    let alvo = info ? info.alvo : null;
    let dist = info ? info.dist : Infinity;
    let visivel = info ? info.visivel : false;
    let vidaRatio = chefe.hp / Math.max(1, chefe.maxHp || chefe.hp);
    if (alvo && visivel) {
        chefe.ultimaPosicaoConhecida = { x: alvo.x, y: alvo.y, t: now };
        chefe.lastTargetSeen = now;
    }
    if (!alvo && chefe.estado !== ESTADO_CHEFE.BUSCA) {
        if (chefe.ultimaPosicaoConhecida && now - (chefe.ultimaPosicaoConhecida.t || 0) < 5000) alterarEstadoChefe(chefe, ESTADO_CHEFE.BUSCA, now);
        else alterarEstadoChefe(chefe, ESTADO_CHEFE.PATRULHA, now);
    }
    if (chefe.estado === ESTADO_CHEFE.PATRULHA) {
        if (alvo && (visivel || dist < 800 || info.score > 20)) alterarEstadoChefe(chefe, ESTADO_CHEFE.PERSEGUICAO, now);
        else patrulharBot(chefe);
        return;
    }
    if (chefe.estado === ESTADO_CHEFE.PERSEGUICAO) {
        if (!alvo) { alterarEstadoChefe(chefe, chefe.ultimaPosicaoConhecida ? ESTADO_CHEFE.BUSCA : ESTADO_CHEFE.PATRULHA, now); return; }
        if (!visivel && now - (chefe.lastTargetSeen || 0) > 650) { alterarEstadoChefe(chefe, ESTADO_CHEFE.BUSCA, now); return; }
        if (visivel && dist < 520) { alterarEstadoChefe(chefe, ESTADO_CHEFE.COMBATE, now); return; }
        moverBotPara(chefe, visivel ? alvo : (chefe.ultimaPosicaoConhecida || alvo), 1.05);
        return;
    }
    if (chefe.estado === ESTADO_CHEFE.COMBATE) {
        if (!alvo) { alterarEstadoChefe(chefe, chefe.ultimaPosicaoConhecida ? ESTADO_CHEFE.BUSCA : ESTADO_CHEFE.PATRULHA, now); return; }
        if (!visivel || dist > 760) { alterarEstadoChefe(chefe, ESTADO_CHEFE.BUSCA, now); return; }
        if (dist > 560) { alterarEstadoChefe(chefe, ESTADO_CHEFE.PERSEGUICAO, now); return; }
        if (dist < 125 || (vidaRatio < 0.3 && now - chefe.estadoDesde > 1400)) { alterarEstadoChefe(chefe, ESTADO_CHEFE.RECUO, now); return; }
        chefe.angle = Math.atan2(alvo.y - chefe.y, alvo.x - chefe.x);
        if (dist > 330) moverEntidade(chefe, Math.cos(chefe.angle) * chefe.speed, Math.sin(chefe.angle) * chefe.speed);
        else if (dist < 190) moverEntidade(chefe, -Math.cos(chefe.angle) * chefe.speed, -Math.sin(chefe.angle) * chefe.speed);
        else moverEntidade(chefe, Math.cos(chefe.angle + Math.PI / 2 * chefe.strafeDir) * chefe.speed, Math.sin(chefe.angle + Math.PI / 2 * chefe.strafeDir) * chefe.speed);
        executarAtaqueChefe(chefe, info, now);
        return;
    }
    if (chefe.estado === ESTADO_CHEFE.RECUO) {
        if (!alvo) { alterarEstadoChefe(chefe, chefe.ultimaPosicaoConhecida ? ESTADO_CHEFE.BUSCA : ESTADO_CHEFE.PATRULHA, now); return; }
        let fuga = Math.atan2(chefe.y - alvo.y, chefe.x - alvo.x);
        chefe.angle = Math.atan2(alvo.y - chefe.y, alvo.x - chefe.x);
        moverEntidade(chefe, Math.cos(fuga) * chefe.speed * 1.25, Math.sin(fuga) * chefe.speed * 1.25);
        if (visivel) executarAtaqueChefe(chefe, info, now);
        if (!visivel) alterarEstadoChefe(chefe, ESTADO_CHEFE.BUSCA, now);
        else if (dist > 300 && now - chefe.estadoDesde > 900) alterarEstadoChefe(chefe, ESTADO_CHEFE.COMBATE, now);
        return;
    }
    if (chefe.estado === ESTADO_CHEFE.BUSCA) {
        if (alvo && visivel) { alterarEstadoChefe(chefe, dist < 520 ? ESTADO_CHEFE.COMBATE : ESTADO_CHEFE.PERSEGUICAO, now); return; }
        let destino = chefe.ultimaPosicaoConhecida;
        if (destino) {
            moverBotPara(chefe, destino);
            if (Math.hypot(destino.x - chefe.x, destino.y - chefe.y) < 45 || now - (chefe.buscaInicio || now) > 4200) {
                chefe.ultimaPosicaoConhecida = null;
                chefe.targetId = null;
                alterarEstadoChefe(chefe, ESTADO_CHEFE.PATRULHA, now);
            }
        } else {
            alterarEstadoChefe(chefe, ESTADO_CHEFE.PATRULHA, now);
        }
    }
}
