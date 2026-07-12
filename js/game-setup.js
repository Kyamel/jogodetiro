// --- SISTEMA DE FIM DE JOGO E ANIMAÇÃO ---
function finalizarPartida(colocacao, bossVencido = false) {
    if(gameState === "GAMEOVER" || gameState === "ANIMATING_END") return; 
    gameState = "ANIMATING_END"; pararMusica(); document.getElementById("instructions").style.display = "none";
    
    progressoMissao(0, 1); // Missão Jogar
    
    let moedasBase = 0; let vitoria = false; let txtPrincipal = "", txtSub = "";
    if (modoJogo === 'boss') {
        vitoria = bossVencido;
        if (bossVencido) { moedasBase = 150; txtPrincipal = "TITÃ DERROTADO!"; txtSub = `Você concluiu o Nível ${nivelChefeProgresso}!`; nivelChefeProgresso++; if (nivelChefeProgresso > 10) basucaDesbloqueada = true; progressoMissao(3, 1); } 
        else { moedasBase = 10; txtPrincipal = "O TITÃ VENCEU"; txtSub = "Sua equipe foi massacrada."; }
    } else {
        if (modoJogo === 'duo') { vitoria = colocacao <= 2; if (colocacao === 1) { moedasBase = 100; progressoMissao(3, 1); } else if (colocacao === 2) moedasBase = 50; else if (colocacao === 3) moedasBase = 25; else moedasBase = 10; } 
        else { vitoria = colocacao <= 5; if (colocacao === 1) { moedasBase = 100; progressoMissao(3, 1); } else if (colocacao === 2) moedasBase = 50; else if (colocacao === 3) moedasBase = 25; else if (colocacao <= 5) moedasBase = 10; else moedasBase = 5; }
        txtPrincipal = colocacao === 1 ? "VITÓRIA!" : (vitoria ? "MUITO BEM!" : "DERROTA");
        txtSub = modoJogo === 'solo' ? `Você ficou em ${colocacao}º Lugar!` : `Sua equipe ficou em ${colocacao}º Lugar!`;
    }

    let moedasFinais = moedasBase * dificuldade; moedas += moedasFinais; salvarProgresso(); 
    
    document.getElementById("tituloFim").innerText = txtPrincipal; document.getElementById("tituloFim").style.color = vitoria ? "gold" : "red";
    document.getElementById("colocacaoTexto").innerText = txtSub; document.getElementById("moedasGanhasTexto").innerText = `+${moedasFinais} Moedas`;
    
    const overlay = document.getElementById("animacaoFim");
    document.getElementById("textoAnimado").innerText = txtPrincipal; document.getElementById("textoAnimado").className = vitoria ? "texto-vitoria" : "texto-derrota";
    document.getElementById("subTextoAnimado").innerText = txtSub; document.getElementById("subTextoAnimado").style.color = vitoria ? "gold" : "white";
    
    overlay.style.display = "flex"; overlay.style.background = vitoria ? "rgba(0,50,100,0.6)" : "rgba(100,0,0,0.8)";
    
    if(vitoria) { 
        tocarNota(600, 'triangle', 0.5, 0.1); setTimeout(() => tocarNota(800, 'triangle', 0.6, 0.1), 120); 
        let camTarget = player.hp > 0 ? player : (bots.find(b => b.teamId === player.teamId) || player);
        for(let i=0; i<80; i++) { particles.push({ x: camTarget.x + (Math.random()*1200-600), y: camTarget.y - 400 + Math.random()*200, vx: (Math.random() - 0.5) * 6, vy: Math.random() * 5 + 3, life: 3.0, size: Math.random() * 8 + 4, color: `hsl(${Math.random()*360}, 100%, 50%)` }); }
    } else { tocarNota(100, 'sawtooth', 0.8, 0.2); }

    setTimeout(() => { overlay.style.display = "none"; gameState = "GAMEOVER"; mostrarTela("menuGameOver"); }, 3500); 
}

function iniciarJogoBoss() { modoJogo = "boss"; dificuldade = nivelChefeProgresso; iniciarJogo(dificuldade); }

function iniciarJogo(nivelSelecionado) {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    canvas.focus();
    if(audioCtx.state === 'suspended') audioCtx.resume(); tocarMusicaFundo(modoJogo === 'boss'); 
    dificuldade = nivelSelecionado; if(modoJogo !== 'boss') modoJogo = document.getElementById("selectModo").value; mouse.isDown = false;
    mostrarTela("ui"); document.getElementById("instructions").style.display = "block"; document.getElementById("nivelText").innerText = dificuldade; safeZone.radius = modoJogo === 'boss' ? 2000 : 1100; 

    let maxHp = inventario.tita ? 150 : 100; let pSpeed = 3.5; if (inventario.ninja) pSpeed += 1.0; if (inventario.botas) pSpeed += 1.0; 
    let pSkin = inventario.skinEquipada; if (inventario.ninja && pSkin === 'padrao') pSkin = 'ninja';
    let pColor = pSkin === 'ninja' ? "#222" : coresSkins[pSkin];

    let pSpawn = getValidSpawn(true, false, 30);
    player = { id: "player", teamId: 1, x: pSpawn.x, y: pSpawn.y, prevX: pSpawn.x, prevY: pSpawn.y, velX: 0, velY: 0, radius: 15, angle: 0, speed: pSpeed, hp: maxHp, maxHp: maxHp, armor: inventario.colete ? 50 : 0, damage: inventario.rifle ? 20 : 10, color: pColor, skin: pSkin, lastToxicDamage: 0, lastShot: 0, lastSword: 0, lastBomb: 0, lastBazooka: 0, lastRegen: Date.now(), bazookaAmmo: basucaDesbloqueada ? 2 : 0, isJumping: false, jumpTimer: 0, lastJump: 0 };

    bots = []; bullets = []; particles = []; damageTexts = []; bombs = []; explosions = []; slashes = []; basucas = [];

    if (modoJogo === 'boss') {
        for(let i=0; i<3; i++) { let allySpawn = getValidSpawn(false, true, 20); bots.push({ id: "ally" + i, teamId: 1, isBoss: false, x: allySpawn.x, y: allySpawn.y, prevX: allySpawn.x, prevY: allySpawn.y, velX: 0, velY: 0, radius: 15, hp: 150, maxHp: 150, armor: 100, damage: 25, color: "#2196F3", skin: "padrao", speed: 3.6, shootCooldown: 1000, lastShot: i*150, angle: 0, patrolPoint: null, strafeDir: Math.random() < 0.5 ? 1 : -1, stuckCounter: 0 }); }
        let bossHp = 800 + (nivelChefeProgresso * 300); let bossSpawn = getValidSpawn(false, false, 60); bots.push({ id: "boss", teamId: 2, isBoss: true, x: bossSpawn.x, y: bossSpawn.y, prevX: bossSpawn.x, prevY: bossSpawn.y, velX: 0, velY: 0, radius: 40, hp: bossHp, maxHp: bossHp, armor: 0, damage: 20, color: "#900", skin: "boss", speed: 1.8 + (nivelChefeProgresso * 0.05), shootCooldown: Math.max(650, 1500 - (nivelChefeProgresso * 50)), lastShot: 0, lastMelee: 0, lastBazooka: 0, angle: 0, estado: ESTADO_CHEFE.PATRULHA, estadoDesde: Date.now(), targetId: null, targetScore: 0, lastTargetSwitch: 0, ameaca: {}, lastThreatDecay: Date.now(), ultimaPosicaoConhecida: null, buscaInicio: 0, lastTargetSeen: 0, strafeDir: 1, stuckCounter: 0 });
        caixas = []; 
    } else {
        let botSpeedBase = 0.8 + (dificuldade * 0.3); let botCooldown = 2100 - (dificuldade * 300); let teamSpawns = {}; 
        for (let i = 0; i < 9; i++) {
            let bTeamId = (modoJogo === 'duo') ? Math.floor((i + 1) / 2) + 1 : i + 2; let spawnPt;
            if (modoJogo === 'duo') { if (!teamSpawns[bTeamId]) teamSpawns[bTeamId] = getValidSpawn(false, true, 30); spawnPt = { x: teamSpawns[bTeamId].x + (Math.random()*40-20), y: teamSpawns[bTeamId].y + (Math.random()*40-20) }; } else { spawnPt = getValidSpawn(false, true, 30); }
            let bColor = "#f44336"; let bSkin = "inimigo"; let bSpeed = botSpeedBase; 
            if (Math.random() < 0.15) { bColor = "#222"; bSkin = "ninja"; bSpeed += 1.0; } 
            if (bSkin !== "ninja") { if (modoJogo === 'duo' && bTeamId === 1) { bColor = "#2196F3"; bSkin = "padrao"; } else { bColor = "#f44336"; bSkin = "inimigo"; } }
            bots.push({ id: "bot" + i, teamId: bTeamId, isBoss: false, x: spawnPt.x, y: spawnPt.y, prevX: spawnPt.x, prevY: spawnPt.y, velX: 0, velY: 0, radius: 15, hp: 100, maxHp: 100, armor: Math.random()<0.2?50:0, damage: Math.random()<0.2?20:10, color: bColor, skin: bSkin, speed: bSpeed, shootCooldown: botCooldown, lastShot: i * 150, angle: 0, patrolPoint: null, strafeDir: Math.random() < 0.5 ? 1 : -1, stuckCounter: 0, coverPoint: null });
        }
        caixas = [ { x: 400, y: 400, size: 24, color: "#FF9800", tipo: "arma" }, { x: 1100, y: 1200, size: 24, color: "#F44336", tipo: "vida" }, { x: 750, y: 450, size: 24, color: "#00BCD4", tipo: "escudo" }, { x: 250, y: 750, size: 24, color: "#FFEB3B", tipo: "velocidade" }, { x: 1100, y: 400, size: 24, color: "#FF9800", tipo: "arma" }, { x: 400, y: 1200, size: 24, color: "#F44336", tipo: "vida" }, { x: 750, y: 1200, size: 24, color: "#00BCD4", tipo: "escudo" }, { x: 1250, y: 750, size: 24, color: "#FFEB3B", tipo: "velocidade" } ];
    }
    atualizarUI(); gameState = "COUNTDOWN"; gameStartTime = Date.now() + 3000;
}
