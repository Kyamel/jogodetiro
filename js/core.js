const canvas = document.getElementById("gameCanvas");
canvas.tabIndex = 0;
const ctx = canvas.getContext("2d");
const radarCanvas = document.getElementById("radarCanvas");
const radarCtx = radarCanvas.getContext("2d");
function redimensionar() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', redimensionar); redimensionar();
