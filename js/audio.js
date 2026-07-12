const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let bgmInterval;
function tocarNota(frequencia, tipo = 'sine', duracao = 0.2, volume = 0.08) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frequencia, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duracao);
  osc.start();
  osc.stop(audioCtx.currentTime + duracao);
}
function tocarSom(tipo) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  if (tipo === 'tiroJ') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } else if (tipo === 'tiroB') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } else if (tipo === 'headshot') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } else if (tipo === 'powerup') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } else if (tipo === 'espada') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } else if (tipo === 'bomba' || tipo === 'basuca') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(tipo === 'basuca' ? 50 : 100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } else if (tipo === 'compra') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }
}
function tocarMusicaFundo(isBoss = false) {
  if (bgmInterval) clearInterval(bgmInterval);
  let passo = 0;
  bgmInterval = setInterval(
    () => {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = isBoss ? 'sawtooth' : 'sine';
      osc.frequency.value = isBoss ? (passo % 4 === 0 ? 80 : 100) : passo % 4 === 0 ? 120 : 180;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(isBoss ? 0.05 : 0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
      passo++;
    },
    isBoss ? 350 : 500
  );
}
function pararMusica() {
  if (bgmInterval) clearInterval(bgmInterval);
}
