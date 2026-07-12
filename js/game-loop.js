function update(deltaMs = MS_POR_FRAME) {
  if (gameState === 'MENU' || gameState === 'GAMEOVER') return;
  frameScale = Math.min(3, Math.max(0, deltaMs / MS_POR_FRAME));
  let now = Date.now();

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].x += particles[i].vx * frameScale;
    particles[i].y += particles[i].vy * frameScale;
    particles[i].life -= 0.02 * frameScale;
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
  for (let i = damageTexts.length - 1; i >= 0; i--) {
    damageTexts[i].y -= 1 * frameScale;
    damageTexts[i].life -= 0.02 * frameScale;
    if (damageTexts[i].life <= 0) damageTexts.splice(i, 1);
  }
  for (let i = slashes.length - 1; i >= 0; i--) {
    slashes[i].life -= 0.08 * frameScale;
    if (slashes[i].life <= 0) slashes.splice(i, 1);
  }
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].life -= 0.05 * frameScale;
    if (explosions[i].life <= 0) explosions.splice(i, 1);
  }

  if (gameState === 'COUNTDOWN') {
    if (now >= gameStartTime) gameState = 'PLAYING';
    return;
  }
  if (gameState === 'ANIMATING_END') return;

  let myTeamAlive = player.hp > 0 || bots.some((b) => b.teamId === player.teamId);
  if (modoJogo === 'boss') {
    let boss = bots.find((b) => b.isBoss);
    if (!boss && gameState !== 'GAMEOVER') {
      finalizarPartida(1, true);
      return;
    }
    if (!myTeamAlive && gameState !== 'GAMEOVER') {
      finalizarPartida(2, false);
      return;
    }
  } else {
    let totalEquipes = getEquipesVivas();
    if (modoJogo === 'solo' && player.hp <= 0 && gameState !== 'GAMEOVER') {
      finalizarPartida(totalEquipes + 1);
      return;
    }
    if (!myTeamAlive && gameState !== 'GAMEOVER') {
      finalizarPartida(totalEquipes + 1);
      return;
    }
    if (totalEquipes === 1 && myTeamAlive && gameState !== 'GAMEOVER') {
      finalizarPartida(1);
      return;
    }
    if (safeZone.radius > 0) safeZone.radius -= 0.2 * frameScale;
  }

  let maxHp = inventario.tita ? 150 : 100;

  if (player.hp > 0) {
    if (inventario.regen && player.hp < maxHp && now - player.lastRegen > 1000) {
      player.hp = Math.min(maxHp, player.hp + 1);
      player.lastRegen = now;
      atualizarUI();
    }
    if (teclaAtiva(' ', 'Space', 32) && now - player.lastJump > 2000) {
      player.isJumping = true;
      player.jumpTimer = now;
      player.lastJump = now;
    }
    let curSpd = player.speed;
    if (player.isJumping) {
      if (now - player.jumpTimer < 300) curSpd = player.speed * 3;
      else player.isJumping = false;
    }
    let movX = 0,
      movY = 0;
    if (teclaAtiva('w', 'KeyW', 87) || teclaAtiva('arrowup', 'ArrowUp', 38)) movY -= 1;
    if (teclaAtiva('s', 'KeyS', 83) || teclaAtiva('arrowdown', 'ArrowDown', 40)) movY += 1;
    if (teclaAtiva('a', 'KeyA', 65) || teclaAtiva('arrowleft', 'ArrowLeft', 37)) movX -= 1;
    if (teclaAtiva('d', 'KeyD', 68) || teclaAtiva('arrowright', 'ArrowRight', 39)) movX += 1;
    if (movX !== 0 || movY !== 0) {
      let len = Math.hypot(movX, movY);
      movX = (movX / len) * curSpd;
      movY = (movY / len) * curSpd;
    }
    if (movX !== 0 || movY !== 0) moverEntidade(player, movX, movY);
    atualizarMiraJogador();

    if (mouse.isDown) atirarJogador(now);
    if (keys['1'] && inventario.espada && now - player.lastSword > 600) {
      tocarSom('espada');
      slashes.push({
        x: player.x,
        y: player.y,
        angle: player.angle,
        life: 1.0,
        radius: 35,
        skin: player.skin
      });
      bots.forEach((bot, index) => {
        if (
          bot.teamId !== player.teamId &&
          Math.hypot(bot.x - player.x, bot.y - player.y) < 70 + bot.radius
        ) {
          let d = Math.abs(Math.atan2(bot.y - player.y, bot.x - player.x) - player.angle);
          if (d > Math.PI) d = 2 * Math.PI - d;
          if (d < Math.PI / 2.5) {
            darDano(bot, 40, bot.x, bot.y, true, player.id);
            criarParticulas(bot.x, bot.y, 'cyan');
            if (bot.hp <= 0) {
              progressoMissao(1, 1);
              if (inventario.vampiro) {
                player.hp = Math.min(maxHp, player.hp + 20);
                mostrarDanoText(player.x, player.y, '+20 VAMP!', false, true);
              }
              bots.splice(index, 1);
              atualizarUI();
            }
          }
        }
      });
      player.lastSword = now;
    }
    if (keys['2'] && inventario.granada && now - player.lastBomb > 2000) {
      bombs.push({
        teamId: player.teamId,
        x: player.x + Math.cos(player.angle) * 25,
        y: player.y + Math.sin(player.angle) * 25,
        vx: Math.cos(player.angle) * 12,
        vy: Math.sin(player.angle) * 12,
        spawnTime: now,
        ownerId: player.id,
        skin: player.skin
      });
      player.lastBomb = now;
    }
    if (
      keys['3'] &&
      basucaDesbloqueada &&
      player.bazookaAmmo > 0 &&
      now - player.lastBazooka > 1000
    ) {
      tocarSom('bomba');
      basucas.push({
        teamId: player.teamId,
        ownerId: player.id,
        x: player.x + Math.cos(player.angle) * 20,
        y: player.y + Math.sin(player.angle) * 20,
        angle: player.angle,
        speed: 18,
        damage: 90
      });
      player.bazookaAmmo--;
      player.lastBazooka = now;
      atualizarUI();
    }
    let dPC = Math.hypot(player.x - 750, player.y - 750);
    if (
      modoJogo !== 'boss' &&
      (dPC > safeZone.radius ||
        player.x < 0 ||
        player.x > 1500 ||
        player.y < 0 ||
        player.y > 1500) &&
      now - player.lastToxicDamage > 1000
    ) {
      darDano(player, 10, player.x, player.y, false, 'gas');
      player.lastToxicDamage = now;
    }
    for (let i = caixas.length - 1; i >= 0; i--) {
      let cx = caixas[i];
      if (Math.hypot(player.x - cx.x, player.y - cx.y) < player.radius + cx.size) {
        if (cx.tipo === 'arma') {
          player.damage = 20;
          mostrarDanoText(player.x, player.y, 'ARMA UP!', false, true);
        } else if (cx.tipo === 'vida') {
          player.hp = Math.min(maxHp, player.hp + 50);
          mostrarDanoText(player.x, player.y, '+50 HP', false, true);
        } else if (cx.tipo === 'escudo') {
          player.armor = 50;
          mostrarDanoText(player.x, player.y, '+50 ESCUDO', false, true);
        } else if (cx.tipo === 'velocidade') {
          player.speed += 2;
          mostrarDanoText(player.x, player.y, 'VELOCIDADE!', false, true);
        }
        tocarSom('powerup');
        atualizarUI();
        caixas.splice(i, 1);
      }
    }
  }
  atualizarVelocidadeEntidade(player);

  for (let i = basucas.length - 1; i >= 0; i--) {
    let bz = basucas[i];
    bz.x += Math.cos(bz.angle) * bz.speed * frameScale;
    bz.y += Math.sin(bz.angle) * bz.speed * frameScale;
    criarParticulas(bz.x, bz.y, 'yellow', REDUZIR_EFEITOS_CANVAS ? 1 : 2);
    let explodiu = false;
    if (bz.x < -500 || bz.x > 2000 || bz.y < -500 || bz.y > 2000) {
      explodiu = true;
    }
    if (!explodiu) {
      for (let w of walls) {
        if (bz.x > w.x && bz.x < w.x + w.width && bz.y > w.y && bz.y < w.y + w.height) {
          explodiu = true;
          break;
        }
      }
    }
    if (!explodiu) {
      for (let j = bots.length - 1; j >= 0; j--) {
        if (
          bots[j].teamId !== bz.teamId &&
          Math.hypot(bz.x - bots[j].x, bz.y - bots[j].y) < bots[j].radius + 10
        ) {
          explodiu = true;
          break;
        }
      }
    }
    if (
      !explodiu &&
      player.hp > 0 &&
      player.teamId !== bz.teamId &&
      Math.hypot(bz.x - player.x, bz.y - player.y) < player.radius + 10
    ) {
      explodiu = true;
    }
    if (explodiu) {
      tocarSom('bomba');
      explosions.push({x: bz.x, y: bz.y, life: 1.0, radius: 120});
      for (let j = bots.length - 1; j >= 0; j--) {
        if (bots[j].teamId !== bz.teamId && Math.hypot(bots[j].x - bz.x, bots[j].y - bz.y) < 120) {
          darDano(bots[j], bz.damage, bots[j].x, bots[j].y, true, bz.ownerId);
          if (bots[j].hp <= 0) {
            if (bz.ownerId === 'player') progressoMissao(1, 1);
            if (bz.ownerId === 'player' && inventario.vampiro) {
              player.hp = Math.min(maxHp, player.hp + 20);
              mostrarDanoText(player.x, player.y, '+20 VAMP!', false, true);
            }
            bots.splice(j, 1);
            atualizarUI();
          }
        }
      }
      if (
        player.hp > 0 &&
        player.teamId !== bz.teamId &&
        !player.isJumping &&
        Math.hypot(player.x - bz.x, player.y - bz.y) < 120
      ) {
        darDano(player, bz.damage, player.x, player.y, true, bz.ownerId);
      }
      basucas.splice(i, 1);
    }
  }
  for (let i = bombs.length - 1; i >= 0; i--) {
    let b = bombs[i];
    b.x += b.vx * frameScale;
    b.y += b.vy * frameScale;
    let atrito = Math.pow(0.92, frameScale);
    b.vx *= atrito;
    b.vy *= atrito;
    for (let w of walls) {
      if (b.x > w.x && b.x < w.x + w.width && b.y > w.y && b.y < w.y + w.height) {
        b.vx = 0;
        b.vy = 0;
        break;
      }
    }
    if (now - b.spawnTime > 1500) {
      tocarSom('bomba');
      explosions.push({x: b.x, y: b.y, life: 1.0, radius: 90});
      for (let j = bots.length - 1; j >= 0; j--) {
        if (bots[j].teamId !== b.teamId && Math.hypot(bots[j].x - b.x, bots[j].y - b.y) < 90) {
          darDano(bots[j], 50, bots[j].x, bots[j].y, true, b.ownerId);
          if (bots[j].hp <= 0) {
            if (b.ownerId === 'player') progressoMissao(1, 1);
            if (b.ownerId === 'player' && inventario.vampiro) {
              player.hp = Math.min(maxHp, player.hp + 20);
              mostrarDanoText(player.x, player.y, '+20 VAMP!', false, true);
            }
            bots.splice(j, 1);
            atualizarUI();
          }
        }
      }
      if (
        player.hp > 0 &&
        player.teamId !== b.teamId &&
        !player.isJumping &&
        Math.hypot(player.x - b.x, player.y - b.y) < 90
      ) {
        darDano(player, 50, player.x, player.y, true, b.ownerId);
      }
      bombs.splice(i, 1);
    }
  }
  for (let i = caixas.length - 1; i >= 0; i--) {
    for (let j = 0; j < bots.length; j++) {
      if (
        !bots[j].isBoss &&
        Math.hypot(bots[j].x - caixas[i].x, bots[j].y - caixas[i].y) <
          bots[j].radius + caixas[i].size
      ) {
        let cx = caixas[i];
        if (cx.tipo === 'arma') bots[j].damage = 20;
        else if (cx.tipo === 'vida') bots[j].hp = Math.min(100, bots[j].hp + 50);
        else if (cx.tipo === 'escudo') bots[j].armor = 50;
        else if (cx.tipo === 'velocidade') bots[j].speed += 1.5;
        caixas.splice(i, 1);
        break;
      }
    }
  }

  for (let i = bots.length - 1; i >= 0; i--) {
    let bot = bots[i];
    let oldX = bot.x;
    let oldY = bot.y;
    if (!bot.isBoss && modoJogo !== 'boss') {
      let dBC = Math.hypot(bot.x - 750, bot.y - 750);
      if (dBC > safeZone.radius && now - (bot.lastToxicDamage || 0) > 1000) {
        darDano(bot, 10, bot.x, bot.y, false, 'gas');
        bot.lastToxicDamage = now;
        if (bot.hp <= 0) {
          bots.splice(i, 1);
          atualizarUI();
          continue;
        }
      }
    }
    let isIgnoring = now < (bot.ignoreTargetUntil || 0);
    let alvoM = null;
    let menorD = Infinity;
    if (!isIgnoring) {
      if (player.hp > 0 && player.teamId !== bot.teamId) {
        let d = Math.hypot(player.x - bot.x, player.y - bot.y);
        if (d < menorD) {
          menorD = d;
          alvoM = player;
        }
      }
      bots.forEach((o) => {
        if (o.teamId !== bot.teamId) {
          let d = Math.hypot(o.x - bot.x, o.y - bot.y);
          if (d < menorD) {
            menorD = d;
            alvoM = o;
          }
        }
      });
    }
    let visaoLimpa = alvoM ? !temParede(bot.x, bot.y, alvoM.x, alvoM.y) : false;
    if (alvoM && !visaoLimpa) alvoM = null;
    if (bot.isBoss) {
      atualizarChefeFSM(bot, now);
    } else {
      if (modoJogo !== 'boss') {
        let caixaM = null;
        let distC = Infinity;
        caixas.forEach((cx) => {
          let d = Math.hypot(cx.x - bot.x, cx.y - bot.y);
          if (d < distC) {
            distC = d;
            caixaM = cx;
          }
        });
        let dBC = Math.hypot(bot.x - 750, bot.y - 750);
        let cobertura = null;
        if (alvoM && visaoLimpa) {
          if (now - (bot.lastCoverCheck || 0) > 350) {
            bot.cachedCover = encontrarCoberturaBot(bot, alvoM);
            bot.lastCoverCheck = now;
          }
          cobertura = bot.cachedCover;
        } else {
          bot.cachedCover = null;
        }
        let contextoBot = {
          alvo: alvoM,
          distAlvo: alvoM ? menorD : Infinity,
          alvoVisivel: !!(alvoM && visaoLimpa),
          caixa: caixaM,
          distCaixa: caixaM ? distC : Infinity,
          caixaVisivel: !!(caixaM && distC < 420 && !temParede(bot.x, bot.y, caixaM.x, caixaM.y)),
          cobertura: cobertura,
          distCobertura: cobertura
            ? Math.hypot(cobertura.x - bot.x, cobertura.y - bot.y)
            : Infinity,
          recarregando: alvoM && visaoLimpa && now - bot.lastShot < bot.shootCooldown * 0.7,
          foraDaZona: dBC > safeZone.radius,
          pertoDaBorda: dBC > safeZone.radius - 120,
          inimigoPerto: !!(alvoM && menorD < 190)
        };
        let decisaoBot = decidirAcaoBotSimples(bot, contextoBot);
        bot.acaoAtual = decisaoBot;
        executarAcaoBotSimples(bot, decisaoBot, contextoBot, now);
      } else {
        if (alvoM) {
          let miraAlvo = Math.atan2(alvoM.y - bot.y, alvoM.x - bot.x);
          girarEntidadePara(bot, miraAlvo);
          if (!visaoLimpa || menorD > 250) {
            moverEntidade(bot, Math.cos(miraAlvo) * bot.speed, Math.sin(miraAlvo) * bot.speed);
          } else if (menorD < 150) {
            moverEntidade(
              bot,
              -Math.cos(miraAlvo) * (bot.speed * 0.8),
              -Math.sin(miraAlvo) * (bot.speed * 0.8)
            );
          } else {
            moverEntidade(
              bot,
              Math.cos(miraAlvo + (Math.PI / 2) * bot.strafeDir) * bot.speed,
              Math.sin(miraAlvo + (Math.PI / 2) * bot.strafeDir) * bot.speed
            );
          }
          if (visaoLimpa && now - bot.lastShot > bot.shootCooldown && menorD < 400) {
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
        } else {
          patrulharBot(bot);
        }
      }
    }
    if (Math.hypot(bot.x - oldX, bot.y - oldY) < bot.speed * 0.2 * frameScale) {
      bot.stuckCounter = (bot.stuckCounter || 0) + frameScale;
      // Ao primeiro sinal de travamento (tipico de quina), inverte o lado do
      // strafe para o bot deslizar ao longo da parede e sair, em vez de moer
      // contra ela girando no lugar.
      if (bot.stuckCounter > 6 && !bot.jaInverteuStrafe) {
        bot.strafeDir *= -1;
        bot.jaInverteuStrafe = true;
      }
      if (bot.stuckCounter > 20) {
        bot.patrolPoint = getValidSpawn(false, false, bot.isBoss ? 60 : 20);
        if (bot.isBoss) {
          let alvoAtual = obterEntidadePorId(bot.targetId);
          if (alvoAtual) bot.ultimaPosicaoConhecida = {x: alvoAtual.x, y: alvoAtual.y, t: now};
          alterarEstadoChefe(bot, ESTADO_CHEFE.BUSCA, now);
        } else {
          bot.ignoreTargetUntil = now + 1500;
        }
        bot.stuckCounter = 0;
      }
    } else {
      bot.stuckCounter = 0;
      bot.jaInverteuStrafe = false;
    }
    atualizarVelocidadeEntidade(bot);
  }
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x += Math.cos(b.angle) * b.speed * frameScale;
    b.y += Math.sin(b.angle) * b.speed * frameScale;
    if (b.x < -500 || b.x > 2000 || b.y < -500 || b.y > 2000) {
      bullets.splice(i, 1);
      continue;
    }
    let tiroD = false;
    for (let w of walls) {
      if (b.x > w.x && b.x < w.x + w.width && b.y > w.y && b.y < w.y + w.height) {
        tiroD = true;
        criarParticulas(b.x, b.y, 'gray');
        break;
      }
    }
    if (tiroD) {
      bullets.splice(i, 1);
      continue;
    }
    function processHit(alvo, dist) {
      let isHeadshot = dist < alvo.radius * 0.4;
      darDano(alvo, b.damage, b.x, b.y, isHeadshot, b.ownerId);
      if (isHeadshot) tocarSom('headshot');
      criarParticulas(b.x, b.y, alvo.armor > 0 ? 'cyan' : isHeadshot ? 'red' : 'orange');
    }
    for (let j = bots.length - 1; j >= 0; j--) {
      if (
        b.teamId !== bots[j].teamId &&
        Math.hypot(b.x - bots[j].x, b.y - bots[j].y) < bots[j].radius + 5
      ) {
        tiroD = true;
        processHit(bots[j], Math.hypot(b.x - bots[j].x, b.y - bots[j].y));
        if (bots[j].hp <= 0) {
          if (b.ownerId === 'player') progressoMissao(1, 1);
          if (b.ownerId === 'player' && inventario.vampiro) {
            player.hp = Math.min(maxHp, player.hp + 20);
            mostrarDanoText(player.x, player.y, '+20 VAMP!', false, true);
          }
          bots.splice(j, 1);
          atualizarUI();
        }
        break;
      }
    }
    if (
      !tiroD &&
      player.hp > 0 &&
      b.teamId !== player.teamId &&
      !player.isJumping &&
      Math.hypot(b.x - player.x, b.y - player.y) < player.radius + 5
    ) {
      tiroD = true;
      processHit(player, Math.hypot(b.x - player.x, b.y - player.y));
    }
    if (tiroD) bullets.splice(i, 1);
  }
}
