let arenaBaseCache = null;
let arenaWallsCache = null;

const DESENHADORES_ARMA = {
    neon: () => {
        ctx.fillStyle = "#FFF";
        ctx.fillRect(8, 3, 22, 5);
        ctx.fillStyle = "#00FFFF";
        ctx.fillRect(26, 2, 6, 3);
    },
    deserto: () => {
        ctx.fillStyle = "#4E342E";
        ctx.fillRect(8, 4, 26, 3);
        ctx.fillStyle = "#222";
        ctx.fillRect(15, 2, 4, 2);
    },
    fantasma: () => {
        ctx.fillStyle = "#444";
        ctx.fillRect(8, 4, 16, 4);
        ctx.fillStyle = "#111";
        ctx.fillRect(24, 3, 8, 6);
    },
    realeza: () => {
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(8, 3, 20, 6);
        ctx.fillStyle = "#FFF";
        ctx.fillRect(24, 2, 4, 8);
    },
    dourada: () => {
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(8, 3, 20, 6);
        ctx.fillStyle = "#FFF";
        ctx.fillRect(24, 2, 4, 8);
    },
    ciborgue: () => {
        ctx.fillStyle = "#555";
        ctx.fillRect(8, 3, 25, 8);
        ctx.fillStyle = "#00FFFF";
        ctx.fillRect(30, 4, 3, 6);
    }
};

function desenharRetanguloArredondadoEm(ctxAlvo, x, y, w, h, r, fillStyle, strokeStyle = null, lineWidth = 1) {
    let rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctxAlvo.beginPath();
    ctxAlvo.moveTo(x + rr, y);
    ctxAlvo.lineTo(x + w - rr, y);
    ctxAlvo.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctxAlvo.lineTo(x + w, y + h - rr);
    ctxAlvo.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctxAlvo.lineTo(x + rr, y + h);
    ctxAlvo.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctxAlvo.lineTo(x, y + rr);
    ctxAlvo.quadraticCurveTo(x, y, x + rr, y);
    ctxAlvo.closePath();
    ctxAlvo.fillStyle = fillStyle;
    ctxAlvo.fill();
    if(strokeStyle) {
        ctxAlvo.strokeStyle = strokeStyle;
        ctxAlvo.lineWidth = lineWidth;
        ctxAlvo.stroke();
    }
}

function prepararCamadasEstaticasArena() {
    if (arenaBaseCache && arenaWallsCache) return;

    arenaBaseCache = document.createElement("canvas");
    arenaBaseCache.width = arena.width;
    arenaBaseCache.height = arena.height;
    let baseCtx = arenaBaseCache.getContext("2d");
    let arenaGrad = baseCtx.createLinearGradient(0, 0, arena.width, arena.height);
    arenaGrad.addColorStop(0, "#162130");
    arenaGrad.addColorStop(0.48, "#202d32");
    arenaGrad.addColorStop(1, "#121a24");
    baseCtx.fillStyle = arenaGrad;
    baseCtx.fillRect(arena.x, arena.y, arena.width, arena.height);
    baseCtx.strokeStyle = "rgba(54,216,255,0.08)";
    baseCtx.lineWidth = 1;
    baseCtx.beginPath();
    for(let i=0; i<=arena.width; i+=50) { baseCtx.moveTo(i, 0); baseCtx.lineTo(i, arena.height); }
    for(let i=0; i<=arena.height; i+=50) { baseCtx.moveTo(0, i); baseCtx.lineTo(arena.width, i); }
    baseCtx.stroke();
    baseCtx.strokeStyle = "rgba(255,255,255,0.075)";
    baseCtx.lineWidth = 1.5;
    baseCtx.beginPath();
    for(let i=0; i<=arena.width; i+=250) { baseCtx.moveTo(i, 0); baseCtx.lineTo(i, arena.height); }
    for(let i=0; i<=arena.height; i+=250) { baseCtx.moveTo(0, i); baseCtx.lineTo(arena.width, i); }
    baseCtx.stroke();
    baseCtx.strokeStyle = "rgba(255,255,255,0.16)";
    baseCtx.lineWidth = 8;
    baseCtx.strokeRect(arena.x + 4, arena.y + 4, arena.width - 8, arena.height - 8);
    baseCtx.strokeStyle = "rgba(54,216,255,0.35)";
    baseCtx.lineWidth = 2;
    baseCtx.strokeRect(arena.x + 14, arena.y + 14, arena.width - 28, arena.height - 28);

    arenaWallsCache = document.createElement("canvas");
    arenaWallsCache.width = arena.width;
    arenaWallsCache.height = arena.height;
    let wallCtx = arenaWallsCache.getContext("2d");
    walls.forEach(w => {
        wallCtx.save();
        if (!REDUZIR_EFEITOS_CANVAS) {
            wallCtx.shadowColor = "rgba(0,0,0,0.42)";
            wallCtx.shadowBlur = 14;
            wallCtx.shadowOffsetY = 8;
        }
        desenharRetanguloArredondadoEm(wallCtx, w.x, w.y, w.width, w.height, 6, "#485462", "rgba(197,218,239,0.18)", 2);
        wallCtx.shadowBlur = 0;
        wallCtx.shadowOffsetY = 0;
        wallCtx.strokeStyle = "rgba(255,255,255,0.13)";
        wallCtx.lineWidth = 1;
        wallCtx.beginPath();
        wallCtx.moveTo(w.x + 8, w.y + 8);
        wallCtx.lineTo(w.x + w.width - 8, w.y + w.height - 8);
        wallCtx.stroke();
        wallCtx.restore();
    });
}

function preencherCirculo(x, y, raio, cor) {
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(x, y, raio, 0, Math.PI * 2);
    ctx.fill();
}

function preencherElipse(x, y, rx, ry, rotacao, cor) {
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rotacao, 0, Math.PI * 2);
    ctx.fill();
}

function preencherPoligono(cor, pontos) {
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.moveTo(pontos[0][0], pontos[0][1]);
    for (let i = 1; i < pontos.length; i++) ctx.lineTo(pontos[i][0], pontos[i][1]);
    ctx.fill();
}

function configurarSombraPersonagem(isBoss, teamId) {
    ctx.shadowColor = isBoss ? "rgba(255,77,109,0.7)" : (teamId === 1 ? "rgba(54,216,255,0.48)" : "rgba(255,77,109,0.42)");
    ctx.shadowBlur = REDUZIR_EFEITOS_CANVAS ? 0 : (isBoss ? 22 : 10);
}

function desenharMarcadorAliado(teamId, isBoss, escala) {
    if (modoJogo === "solo" || teamId !== 1 || isBoss) return;
    ctx.strokeStyle = "#2196F3";
    ctx.lineWidth = 3 / escala;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.stroke();
}

function desenharAcessorioTraseiro(skin) {
    if (skin === "realeza") {
        preencherPoligono("#D32F2F", [[-10, -12], [-25, -18], [-25, 18], [-10, 12]]);
    } else if (skin === "ciborgue") {
        preencherPoligono("#FF0000", [[-10, -8], [-20, -12], [-20, 12], [-10, 8]]);
    }
}

function desenharPernas(skin) {
    let cor = skin === "deserto" ? "#4E342E" : (skin === "fantasma" ? "rgba(0,0,0,0)" : "#111");
    preencherCirculo(-10, -8, 5, cor);
    preencherCirculo(-10, 8, 5, cor);
}

function desenharCorpo(skin, color) {
    preencherElipse(-3, 0, 10, 16, 0, color);

    if (skin === "deserto") {
        preencherCirculo(-5, -6, 3, "#8D6E63");
        preencherCirculo(-2, 8, 2.5, "#8D6E63");
    } else if (skin === "neon") {
        ctx.fillStyle = "#00FFFF";
        ctx.fillRect(-6, -12, 3, 24);
    } else if (skin === "ciborgue") {
        ctx.fillStyle = "#2196F3";
        ctx.fillRect(-5, -5, 8, 10);
    }
}

function desenharBracos(skin, color) {
    let corBraco = ["ninja", "fantasma", "ciborgue"].includes(skin) ? color : "#ffcc99";
    preencherCirculo(10, -10, 5, corBraco);
    preencherCirculo(12, 6, 5, corBraco);
}

function desenharArma(skin, isBoss) {
    if (DESENHADORES_ARMA[skin]) {
        DESENHADORES_ARMA[skin]();
        return;
    }

    ctx.fillStyle = isBoss ? "#444" : "#333";
    ctx.fillRect(8, 3, 20, 6);
}

function desenharRosto(skin) {
    if (skin === "ninja") {
        ctx.fillStyle = "#D32F2F";
        ctx.fillRect(-10, -4, 15, 8);
        preencherCirculo(4, -3, 2, "#000");
        preencherCirculo(4, 3, 2, "#000");
    } else if (skin === "fantasma") {
        preencherCirculo(4, -4, 3, "#000");
        preencherCirculo(4, 4, 3, "#000");
    } else if (skin === "deserto") {
        ctx.fillStyle = "#222";
        ctx.fillRect(-2, -7, 8, 14);
        ctx.fillStyle = "#FF9800";
        ctx.fillRect(0, -6, 6, 12);
    } else if (skin === "ciborgue") {
        preencherCirculo(4, -4, 2, "#FF0000");
        ctx.fillStyle = "#000";
        ctx.fillRect(4, 2, 4, 4);
    } else {
        preencherCirculo(0, 0, 4, "rgba(0,0,0,0.2)");
    }
}

function desenharAcessorioFrontal(skin) {
    if (skin === "realeza") {
        preencherPoligono("#FFD700", [[-5, -10], [0, -16], [5, -10]]);
    }

    if (skin === "ninja") {
        ctx.strokeStyle = "#777";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, -8);
        ctx.lineTo(-12, 8);
        ctx.stroke();
    } else if (skin !== "fantasma" && skin !== "realeza") {
        ctx.fillStyle = "black";
        ctx.fillRect(6, -5, 6, 10);
    }
}

function desenharEscudoPersonagem(armor, escala) {
    if (armor <= 0) return;
    ctx.strokeStyle = "rgba(54, 216, 255, 0.72)";
    ctx.lineWidth = 3 / escala;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
}

function desenharBarraVidaPersonagem(x, y, teamId, isBoss, hp, maxHp, color) {
    if (!isBoss && !(modoJogo === "boss" && teamId === 1 && color !== player.color)) return;
    let barY = y - (isBoss ? 60 : 30);
    preencherRetanguloArredondado(x - 31, barY - 1, 62, 8, 4, "rgba(0,0,0,0.62)");
    preencherRetanguloArredondado(x - 30, barY, 60 * Math.max(0, hp / maxHp), 6, 4, isBoss ? "#ff4d6d" : "#36d8ff");
}

function desenharPersonagem(x, y, angle, color, isJumping = false, armor = 0, teamId = 1, isBoss = false, hp = 100, maxHp = 100, skin = "padrao") {
    let escala = isBoss ? 2.5 : 1.0;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = skin === "fantasma" ? (isJumping ? 0.2 : 0.6) : (isJumping ? 0.4 : 1.0);
    ctx.scale(escala, escala);

    configurarSombraPersonagem(isBoss, teamId);
    desenharMarcadorAliado(teamId, isBoss, escala);
    desenharAcessorioTraseiro(skin);
    desenharPernas(skin);
    desenharCorpo(skin, color);
    desenharBracos(skin, color);
    desenharArma(skin, isBoss);
    preencherCirculo(0, 0, 12, color);
    desenharRosto(skin);
    desenharAcessorioFrontal(skin);

    ctx.shadowBlur = 0;
    desenharEscudoPersonagem(armor, escala);
    ctx.restore();

    desenharBarraVidaPersonagem(x, y, teamId, isBoss, hp, maxHp, color);
}

function corCaixa(tipo) {
    const cores = {
        vida: "#ff4d6d",
        arma: "#ffd166",
        escudo: "#36d8ff",
        velocidade: "#63f0a0"
    };
    return cores[tipo] || "#63f0a0";
}

function simboloCaixa(tipo) {
    const simbolos = {
        vida: "♥",
        arma: "⚔",
        escudo: "◆",
        velocidade: "⚡"
    };
    return simbolos[tipo] || "?";
}

function desenharCaixa(cx) {
    let accent = corCaixa(cx.tipo);
    ctx.save();
    ctx.translate(cx.x, cx.y);
    ctx.shadowColor = accent;
    ctx.shadowBlur = REDUZIR_EFEITOS_CANVAS ? 0 : 12;
    preencherRetanguloArredondado(-cx.size / 2, -cx.size / 2, cx.size, cx.size, 5, "#6b4a28", "rgba(255,255,255,0.22)", 2);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(0,0,0,0.38)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-cx.size / 2 + 4, -cx.size / 4);
    ctx.lineTo(cx.size / 2 - 4, -cx.size / 4);
    ctx.moveTo(-cx.size / 2 + 4, cx.size / 4);
    ctx.lineTo(cx.size / 2 - 4, cx.size / 4);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(simboloCaixa(cx.tipo), 0, 0);
    ctx.restore();
}

function desenharExplosao(ex) {
    let grad = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, ex.radius);
    grad.addColorStop(0, `rgba(255, 255, 0, ${ex.life})`);
    grad.addColorStop(0.5, `rgba(255, 0, 0, ${ex.life})`);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
    ctx.fill();
}

function desenharBomba(b, drawNow) {
    const s = b.skin || "padrao";
    ctx.save();
    ctx.translate(b.x, b.y);

    if (s === "neon") {
        preencherCirculo(0, 0, 6, "#39FF14");
        preencherCirculo(-2, -2, 2, "rgba(255,255,255,0.5)");
    } else if (s === "dourada") {
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(-5, -5, 10, 10);
    } else if (s === "realeza") {
        preencherCirculo(0, 0, 6, "#9C27B0");
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.stroke();
    } else if (s === "deserto") {
        ctx.fillStyle = "#C2B280";
        ctx.fillRect(-4, -4, 8, 8);
        ctx.fillStyle = "#4E342E";
        ctx.fillRect(-2, -2, 4, 4);
    } else if (s === "fantasma") {
        preencherCirculo(0, 0, 6, "rgba(255,255,255,0.7)");
    } else if (s === "ciborgue") {
        ctx.fillStyle = "#00FFFF";
        ctx.fillRect(-4, -4, 8, 8);
    } else if (s === "ninja") {
        preencherCirculo(0, 0, 6, "#333");
        ctx.fillStyle = "#000";
        ctx.fillRect(-2, -6, 4, 12);
        ctx.fillRect(-6, -2, 12, 4);
    } else {
        preencherCirculo(0, 0, 6, "#222");
        if (Math.floor(drawNow / 150) % 2 === 0) preencherCirculo(0, 0, 3, "red");
    }

    ctx.restore();
}

function corEfeitoSkin(skin) {
    const cores = {
        neon: "#39FF14",
        ninja: "red",
        fantasma: "white",
        realeza: "#9C27B0",
        dourada: "#FFD700",
        deserto: "#FF9800",
        ciborgue: "#00FFFF",
        boss: "red"
    };
    return cores[skin] || "cyan";
}

function desenharCorte(sl) {
    ctx.save();
    ctx.translate(sl.x, sl.y);
    ctx.rotate(sl.angle);
    ctx.globalAlpha = sl.life;
    ctx.strokeStyle = corEfeitoSkin(sl.skin || "padrao");
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, 0, sl.radius || 35, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
    ctx.restore();
}

function desenharParticula(p) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    preencherCirculo(p.x, p.y, p.size, p.color);
    ctx.globalAlpha = 1.0;
}

function corTiro(b) {
    if (player && b.teamId === player.teamId) return "#ffd166";
    return b.damage > 15 ? "#ff4d6d" : "#ff8a3d";
}

function desenharTiro(b, drawNow) {
    let s = b.skin || "padrao";
    let bulletColor = corTiro(b);

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    ctx.shadowColor = bulletColor;
    ctx.shadowBlur = REDUZIR_EFEITOS_CANVAS ? 0 : 12;
    ctx.strokeStyle = bulletColor;
    ctx.lineWidth = b.damage > 15 ? 5 : 3;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(2, 0);
    ctx.stroke();

    if (s === "neon") {
        preencherElipse(0, 0, 6, 3, 0, "#63f0a0");
    } else if (s === "ninja") {
        ctx.rotate(drawNow / 50);
        ctx.fillStyle = "#d7e8f8";
        ctx.fillRect(-4, -1, 8, 2);
        ctx.fillRect(-1, -4, 2, 8);
    } else if (s === "fantasma") {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.stroke();
    } else if (s === "dourada") {
        preencherPoligono("#FFD700", [[-4, 0], [0, -4], [4, 0], [0, 4]]);
    } else if (s === "realeza") {
        preencherPoligono("#B36BFF", [[4, 0], [-4, -3], [-4, 3]]);
    } else if (s === "deserto") {
        ctx.fillStyle = "#C2B280";
        ctx.fillRect(-4, -1, 8, 2);
    } else if (s === "ciborgue") {
        ctx.fillStyle = "#36d8ff";
        ctx.fillRect(-3, -3, 6, 6);
    } else {
        preencherCirculo(0, 0, b.damage > 15 ? 5 : 4, bulletColor);
    }

    ctx.restore();
}

function desenharBasuca(bz) {
    ctx.save();
    ctx.shadowColor = "rgba(255,77,109,0.85)";
    ctx.shadowBlur = REDUZIR_EFEITOS_CANVAS ? 0 : 16;
    preencherElipse(bz.x, bz.y, 10, 5, bz.angle, "#c4cbd4");
    preencherCirculo(bz.x - Math.cos(bz.angle) * 10, bz.y - Math.sin(bz.angle) * 10, 4, "#ff4d6d");
    ctx.restore();
}

function desenharTextoDano(dt) {
    ctx.fillStyle = dt.color;
    ctx.globalAlpha = dt.life;
    ctx.font = `bold ${dt.size}px Arial`;
    ctx.fillText(dt.text, dt.x, dt.y);
    ctx.globalAlpha = 1.0;
}

function atualizarCamera() {
    if (player && player.hp > 0) {
        camX = canvas.width / 2 - player.x;
        camY = canvas.height / 2 - player.y;
        return;
    }

    let aliado = bots.find(b => b.teamId === (player ? player.teamId : 1));
    if (aliado) {
        camX = canvas.width / 2 - aliado.x;
        camY = canvas.height / 2 - aliado.y;
        return;
    }

    camX = canvas.width / 2 - 750;
    camY = canvas.height / 2 - 750;
}

function desenharZonaSegura(drawNow) {
    if (modoJogo === "boss") {
        ctx.save();
        ctx.fillStyle = "rgba(255, 77, 109, 0.08)";
        ctx.fillRect(arena.x, arena.y, arena.width, arena.height);
        ctx.strokeStyle = "rgba(255,77,109,0.28)";
        ctx.lineWidth = 3;
        ctx.strokeRect(arena.x + 22, arena.y + 22, arena.width - 44, arena.height - 44);
        ctx.restore();
        return;
    }

    ctx.save();
    ctx.fillStyle = "rgba(2, 5, 9, 0.62)";
    ctx.beginPath();
    ctx.rect(arena.x, arena.y, arena.width, arena.height);
    ctx.arc(750, 750, Math.max(0, safeZone.radius), 0, Math.PI * 2, true);
    ctx.fill();

    let pulso = REDUZIR_EFEITOS_CANVAS ? 0.52 : 0.45 + Math.sin(drawNow / 180) * 0.18;
    ctx.strokeStyle = `rgba(255, 77, 109, ${pulso})`;
    ctx.shadowColor = "rgba(255,77,109,0.65)";
    ctx.shadowBlur = REDUZIR_EFEITOS_CANVAS ? 0 : 18;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(750, 750, Math.max(0, safeZone.radius), 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
}

function desenharContagemRegressiva(drawNow) {
    if (gameState !== "COUNTDOWN") return;

    let tempoRestante = Math.ceil((gameStartTime - drawNow) / 1000);
    let texto = tempoRestante > 0 ? tempoRestante : (modoJogo === "boss" ? "MATE O TITÃ!" : "VAI!");

    ctx.fillStyle = "white";
    ctx.shadowColor = "rgba(54,216,255,0.55)";
    ctx.shadowBlur = REDUZIR_EFEITOS_CANVAS ? 0 : 26;
    ctx.font = "bold 80px Arial";
    ctx.textAlign = "center";
    ctx.fillText(texto, canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;
    ctx.textAlign = "left";
}

function desenharAvisoEspectador() {
    if (modoJogo === "solo" || !player || player.hp > 0 || gameState !== "PLAYING") return;

    ctx.fillStyle = "gold";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("ASSISTINDO ALIADO...", canvas.width / 2, 80);
    ctx.textAlign = "left";
}

function draw() {
    let drawNow = Date.now();
    ctx.fillStyle = "#07090f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (gameState === "MENU" || gameState === "GAMEOVER") return;
    prepararCamadasEstaticasArena();
    ctx.save(); 
    atualizarCamera();
    ctx.translate(camX, camY); 
    
    ctx.drawImage(arenaBaseCache, 0, 0);
    desenharZonaSegura(drawNow);
    ctx.drawImage(arenaWallsCache, 0, 0);

    caixas.forEach(desenharCaixa);
    explosions.forEach(desenharExplosao);
    
    bombs.forEach(b => desenharBomba(b, drawNow));
    slashes.forEach(desenharCorte);
    particles.forEach(desenharParticula);
    
    if (player && player.hp > 0) desenharPersonagem(player.x, player.y, player.angle, player.color, player.isJumping, player.armor, player.teamId, false, player.hp, inventario.tita ? 150 : 100, player.skin);
    bots.forEach(bot => desenharPersonagem(bot.x, bot.y, bot.angle, bot.color, false, bot.armor, bot.teamId, bot.isBoss, bot.hp, bot.maxHp||100, bot.skin));
    
    bullets.forEach(b => desenharTiro(b, drawNow));
    basucas.forEach(desenharBasuca);

    damageTexts.forEach(desenharTextoDano);
    ctx.restore(); 
    desenharMira();
    desenharMinimapa(drawNow);
    desenharContagemRegressiva(drawNow);
    desenharAvisoEspectador();
}
