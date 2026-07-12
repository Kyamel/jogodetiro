// --- SISTEMA DE SAVE ---
let moedas = parseInt(localStorage.getItem("br_moedas")) || 0;
let diamantes = parseInt(localStorage.getItem("br_diamantes")) || 0;
let nivelChefeProgresso = parseInt(localStorage.getItem("br_nivel_chefe")) || 1;

let inventarioPadrao = { rifle: false, colete: false, ninja: false, espada: false, granada: false, regen: false, botas: false, tita: false, vampiro: false, skins: { padrao: true, deserto: false, neon: false, fantasma: false, realeza: false, dourada: false, ciborgue: false }, skinEquipada: 'padrao' };
let inventario = JSON.parse(localStorage.getItem("br_inventario"));
if (!inventario) inventario = inventarioPadrao;
if (!inventario.skins) { inventario.skins = inventarioPadrao.skins; inventario.skinEquipada = 'padrao'; } 

let passePadrao = { vip: false, resgatadosFree: [], resgatadosVip: [], missoes: [ {id:0, desc:"Jogar Partidas", meta: 3, atual: 0, premio: 50}, {id:1, desc:"Eliminar Inimigos", meta: 10, atual: 0, premio: 50}, {id:2, desc:"Causar Dano", meta: 1000, atual: 0, premio: 50}, {id:3, desc:"Vencer Partidas (Top 5 / Derrotar Boss)", meta: 1, atual: 0, premio: 100} ] };
let passe = JSON.parse(localStorage.getItem("br_passe")) || passePadrao;

const coresSkins = { padrao: "#2196F3", deserto: "#C2B280", neon: "#39FF14", fantasma: "#FFFFFF", realeza: "#9C27B0", dourada: "#FFD700", ciborgue: "#B0BEC5" };
let basucaDesbloqueada = nivelChefeProgresso > 10; 

function salvarProgresso() { 
    localStorage.setItem("br_moedas", moedas); localStorage.setItem("br_diamantes", diamantes);
    localStorage.setItem("br_inventario", JSON.stringify(inventario)); 
    localStorage.setItem("br_nivel_chefe", nivelChefeProgresso);
    localStorage.setItem("br_passe", JSON.stringify(passe));
}
