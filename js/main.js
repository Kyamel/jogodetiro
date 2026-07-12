let ultimoFrame = performance.now();
function gameLoop(frameTime = performance.now()) {
  let deltaMs = Math.min(50, Math.max(0, frameTime - ultimoFrame));
  ultimoFrame = frameTime;
  update(deltaMs);
  draw();
  requestAnimationFrame(gameLoop);
}

mostrarTela('menuPrincipal');
atualizarMenus();
atualizarMenuModo();
gameLoop();
