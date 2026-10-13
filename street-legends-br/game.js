import * as THREE from "three";
import { ELENCO, GOLPES, criarLuta, passo, vazio } from "./combat.mjs";

const tela = document.getElementById("tela");
const hud = document.getElementById("hud");
const aviso = document.getElementById("aviso");
const escolhe = document.getElementById("escolhe");
const fim = document.getElementById("fim");
const toque = document.getElementById("toque");

const renderer = new THREE.WebGLRenderer({
  canvas: tela,
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setClearColor(0x141820, 1);

const cena = new THREE.Scene();
cena.fog = new THREE.Fog(0x141820, 12, 28);
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);
camera.position.set(0, 3.4, 6.5);

const relogio = new THREE.Clock();
const camDesejada = new THREE.Vector3();
const olhar = new THREE.Vector3();
const frenteCam = new THREE.Vector3();
const direitaCam = new THREE.Vector3();

let luta = null;
let escolhido = "kadu";
let rigA = null;
let rigB = null;
let tremer = 0;
const teclas = new Set();
const pulso = new Set();
const pulsoToque = [];
let guardaToque = false;
let stickX = 0;
let stickY = 0;
let audio = null;
let ultimoSom = null;

function cor(hex) {
  return new THREE.MeshLambertMaterial({ color: hex });
}

function caixa(w, h, d, material) {
  const malha = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  malha.userData.base = material.color.getHex();
  return malha;
}

function boneco(dados) {
  const g = new THREE.Group();
  const corpo = new THREE.Group();
  g.add(corpo);
  const pele = cor(dados.pele);
  const roupa = cor(dados.roupa);
  const calca = cor(dados.calca);
  const tenis = cor(dados.tenis);
  const cabelo = cor(dados.cabelo || "#241c18");

  const hips = new THREE.Group();
  hips.position.y = 0.96;
  hips.add(caixa(0.42, 0.26, 0.24, calca));
  corpo.add(hips);

  const torso = new THREE.Group();
  torso.position.y = 0.32;
  const peito = caixa(0.52, 0.5, 0.28, roupa);
  peito.position.y = 0.22;
  torso.add(peito);
  const cabeca = new THREE.Group();
  cabeca.position.y = 0.56;
  const cranio = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), pele);
  cranio.scale.set(1, 1.12, 1);
  cranio.userData.base = pele.color.getHex();
  cabeca.add(cranio);
  if (!dados.careca) {
    const pelo = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 10), cabelo);
    pelo.scale.set(1.02, 0.72, 1.05);
    pelo.position.y = 0.08;
    pelo.userData.base = cabelo.color.getHex();
    cabeca.add(pelo);
  }
  torso.add(cabeca);
  hips.add(torso);

  function braco(lado) {
    const ombro = new THREE.Group();
    ombro.position.set(lado * 0.34, 0.4, 0);
    const cima = caixa(0.13, 0.34, 0.13, roupa);
    cima.position.y = -0.18;
    ombro.add(cima);
    const cotovelo = new THREE.Group();
    cotovelo.position.y = -0.34;
    const ante = caixa(0.12, 0.3, 0.12, pele);
    ante.position.y = -0.16;
    cotovelo.add(ante);
    const mao = caixa(0.13, 0.13, 0.14, pele);
    mao.position.y = -0.34;
    cotovelo.add(mao);
    ombro.add(cotovelo);
    torso.add(ombro);
    return { ombro, cotovelo, mao };
  }

  function perna(lado) {
    const quadril = new THREE.Group();
    quadril.position.set(lado * 0.14, -0.08, 0);
    const coxa = caixa(0.16, 0.4, 0.16, calca);
    coxa.position.y = -0.22;
    quadril.add(coxa);
    const joelho = new THREE.Group();
    joelho.position.y = -0.42;
    const canela = caixa(0.14, 0.38, 0.14, calca);
    canela.position.y = -0.2;
    joelho.add(canela);
    const pe = caixa(0.16, 0.08, 0.28, tenis);
    pe.position.set(0, -0.42, 0.06);
    joelho.add(pe);
    quadril.add(joelho);
    hips.add(quadril);
    return { quadril, joelho };
  }

  const bracoL = braco(-1);
  const bracoR = braco(1);
  const pernaL = perna(-1);
  const pernaR = perna(1);
  const anel = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.52, 20),
    new THREE.MeshBasicMaterial({ color: dados.roupa, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
  );
  anel.rotation.x = -Math.PI / 2;
  anel.position.y = 0.02;
  g.add(anel);
  return { g, corpo, hips, torso, cabeca, bracoL, bracoR, pernaL, pernaR, anel, flash: 0 };
}

function pintar(rig, claro) {
  rig.g.traverse((obj) => {
    if (!obj.material || obj.material.userData === undefined) return;
    if (!obj.userData || obj.userData.base === undefined) return;
    obj.material.color.setHex(claro ? 0xf4f0e8 : obj.userData.base);
  });
}

function usar(dadosA, dadosB) {
  if (rigA) cena.remove(rigA.g);
  if (rigB) cena.remove(rigB.g);
  rigA = boneco(dadosA);
  rigB = boneco(dadosB);
  cena.add(rigA.g);
  cena.add(rigB.g);
}

function texturaChao() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#3a342f";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i += 1) {
    const tom = 40 + Math.floor(Math.random() * 28);
    g.fillStyle = "rgb(" + tom + "," + (tom - 6) + "," + (tom - 10) + ")";
    g.fillRect(Math.random() * 512, Math.random() * 512, 3 + Math.random() * 8, 2 + Math.random() * 4);
  }
  g.fillStyle = "#6d6248";
  g.fillRect(228, 0, 18, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function texturaMuro() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#3c403c";
  g.fillRect(0, 0, 256, 256);
  const tintas = ["#8e2e2a", "#e0a23a", "#2f6f8f", "#d7d2c8", "#1d4d3a"];
  for (let i = 0; i < 18; i += 1) {
    g.fillStyle = tintas[i % tintas.length];
    g.globalAlpha = 0.85;
    g.fillRect(Math.random() * 200, Math.random() * 180, 30 + Math.random() * 80, 12 + Math.random() * 36);
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function arena() {
  cena.add(new THREE.AmbientLight(0xc5d0dc, 0.72));
  const lua = new THREE.DirectionalLight(0xd5e2f2, 1.15);
  lua.position.set(-4, 8, 2);
  cena.add(lua);
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8), cor("#2a241c"));
  poste.position.set(-2.4, 1.6, -3.2);
  cena.add(poste);
  const lampada = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), new THREE.MeshBasicMaterial({ color: 0xf0c36a }));
  lampada.position.set(-2.4, 3.15, -3.2);
  cena.add(lampada);
  const quente = new THREE.PointLight(0xf0b45a, 2.4, 14);
  quente.position.copy(lampada.position);
  cena.add(quente);

  const chao = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshLambertMaterial({ map: texturaChao() }));
  chao.rotation.x = -Math.PI / 2;
  cena.add(chao);

  const muroMat = new THREE.MeshLambertMaterial({ map: texturaMuro() });
  const altos = [
    [-8, 1.1, 0, 0.4, 2.2, 16],
    [8, 1.1, 0, 0.4, 2.2, 16],
    [0, 1.1, -8, 16, 2.2, 0.4],
    [0, 1.1, 8, 16, 2.2, 0.4]
  ];
  altos.forEach((p) => {
    const muro = new THREE.Mesh(new THREE.BoxGeometry(p[3], p[4], p[5]), muroMat);
    muro.position.set(p[0], p[1], p[2]);
    cena.add(muro);
  });

  for (let i = 0; i < 16; i += 1) {
    const casa = new THREE.Mesh(
      new THREE.BoxGeometry(0.8 + (i % 3) * 0.3, 1.2 + (i % 4) * 0.7, 0.8),
      cor(i % 2 ? "#2a3138" : "#3a332c")
    );
    const ang = (i / 16) * Math.PI * 2;
    casa.position.set(Math.cos(ang) * 12.5, 0.8, Math.sin(ang) * 12.5 - 2);
    cena.add(casa);
    if (i % 2 === 0) {
      const janela = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.08), new THREE.MeshBasicMaterial({ color: 0xf0c36a }));
      janela.position.set(casa.position.x, casa.position.y + 0.3, casa.position.z + 0.45);
      cena.add(janela);
    }
  }
}

function zerar(rig) {
  rig.corpo.rotation.set(0, 0, 0);
  rig.corpo.position.set(0, 0, 0);
  rig.hips.position.y = 0.96;
  rig.torso.position.y = 0.32;
  rig.torso.rotation.set(0, 0, 0);
  rig.cabeca.rotation.set(0, 0, 0);
  [rig.bracoL, rig.bracoR].forEach((braco) => {
    braco.ombro.rotation.set(0.2, 0, 0);
    braco.cotovelo.rotation.set(0.45, 0, 0);
  });
  [rig.pernaL, rig.pernaR].forEach((perna) => {
    perna.quadril.rotation.set(0, 0, 0);
    perna.joelho.rotation.set(0, 0, 0);
  });
}

function curva(f) {
  const g = GOLPES[f.estado];
  if (!g) return 0;
  if (f.t < g.startup) return (f.t / g.startup) * 0.3;
  if (f.t < g.startup + g.active) return 1;
  const r = (f.t - g.startup - g.active) / g.recovery;
  return Math.max(0, 1 - r);
}

function posar(rig, f, agora) {
  zerar(rig);
  const s = f.estado;
  const u = curva(f);
  if (s === "idle" || s === "walk" || s === "guarda") {
    rig.torso.position.y = 0.32 + Math.sin(agora * 2.4 + f.x) * 0.02;
  }
  if (s === "walk") {
    const w = Math.sin(agora * 9);
    rig.pernaL.quadril.rotation.x = w * 0.7;
    rig.pernaR.quadril.rotation.x = -w * 0.7;
    rig.pernaL.joelho.rotation.x = Math.max(0, -w) * 0.8;
    rig.pernaR.joelho.rotation.x = Math.max(0, w) * 0.8;
    rig.bracoL.ombro.rotation.x = -w * 0.45;
    rig.bracoR.ombro.rotation.x = w * 0.45;
  }
  if (s === "guarda") {
    rig.bracoL.ombro.rotation.set(-1.25, 0, 0.35);
    rig.bracoR.ombro.rotation.set(-1.25, 0, -0.35);
    rig.bracoL.cotovelo.rotation.x = 1.2;
    rig.bracoR.cotovelo.rotation.x = 1.2;
    rig.torso.rotation.x = 0.12;
  }
  if (s === "soco" || s === "rajada") {
    rig.bracoR.ombro.rotation.x = -1.55 * u;
    rig.bracoR.cotovelo.rotation.x = 0.2 + (1 - u) * 0.4;
    rig.torso.rotation.y = 0.45 * u;
    if (s === "rajada") rig.bracoL.ombro.rotation.x = -1.2 * u;
  }
  if (s === "chute") {
    rig.pernaR.quadril.rotation.x = -1.35 * u;
    rig.pernaR.joelho.rotation.x = 0.4 * (1 - u);
    rig.torso.rotation.x = -0.2 * u;
  }
  if (s === "agarra") {
    rig.bracoL.ombro.rotation.x = -1.4 * u;
    rig.bracoR.ombro.rotation.x = -1.4 * u;
    rig.torso.rotation.x = -0.25 * u;
  }
  if (s === "ombro") {
    rig.torso.rotation.x = -0.55 * u;
    rig.bracoL.ombro.rotation.x = -0.8 * u;
    rig.bracoR.ombro.rotation.x = -0.8 * u;
  }
  if (s === "esquiva") {
    const k = Math.sin(Math.min(1, f.t / 0.36) * Math.PI);
    rig.corpo.rotation.z = (f.lado || 1) * 0.55 * k;
    rig.corpo.position.x = (f.lado || 1) * 0.18 * k;
  }
  if (s === "hit") {
    const k = 1 - Math.min(1, f.t / Math.max(0.1, f.stun || 0.3));
    rig.torso.rotation.x = 0.55 * k;
    rig.cabeca.rotation.x = -0.45 * k;
    rig.bracoL.ombro.rotation.x = 0.4 * k;
    rig.bracoR.ombro.rotation.x = 0.4 * k;
  }
  if (s === "queda" || s === "ko" || s === "levanta") {
    let k = 1;
    if (s === "queda") k = Math.min(1, f.t / 0.28);
    if (s === "levanta") k = 1 - Math.min(1, f.t / 0.45);
    rig.corpo.rotation.x = (Math.PI / 2) * k;
    rig.corpo.position.y = 0.2 * k;
    rig.corpo.position.z = -0.9 * k;
    rig.bracoL.ombro.rotation.set(0.05, 0, 0.4);
    rig.bracoR.ombro.rotation.set(0.05, 0, -0.4);
    rig.bracoL.cotovelo.rotation.set(0.12, 0, 0);
    rig.bracoR.cotovelo.rotation.set(0.12, 0, 0);
  }
  const golpe = GOLPES[s];
  const noMeio = golpe && f.t >= golpe.startup && f.t < golpe.startup + golpe.active;
  const mao = s === "chute" ? rig.pernaR.joelho : rig.bracoR.mao;
  if (mao && mao.material) mao.material.color.setHex(noMeio ? 0xf2d7b0 : mao.userData.base);
}

function colocar(rig, f, agora) {
  rig.g.position.set(f.x, 0, f.z);
  rig.g.rotation.y = f.yaw;
  posar(rig, f, agora);
  if (rig.flash > 0) {
    pintar(rig, true);
    rig.flash = Math.max(0, rig.flash - 0.016);
    if (rig.flash === 0) pintar(rig, false);
  }
}

function enquadrar(dt) {
  const a = luta ? luta.a : { x: -1.6, z: 0, yaw: Math.PI / 2 };
  const b = luta ? luta.b : { x: 1.6, z: 0 };
  const dist = 5.8;
  let cx = a.x - Math.sin(a.yaw) * dist;
  let cz = a.z - Math.cos(a.yaw) * dist;
  cx = Math.max(-5.4, Math.min(5.4, cx));
  cz = Math.max(-5.4, Math.min(5.4, cz));
  const treme = tremer > 0 ? (Math.random() - 0.5) * 0.12 : 0;
  camDesejada.set(cx + treme, 4.4, cz + treme);
  const t = 1 - Math.pow(0.012, dt || 0.016);
  camera.position.lerp(camDesejada, t);
  olhar.set((a.x + b.x) / 2, 1.05, (a.z + b.z) / 2);
  camera.lookAt(olhar);
  if (tremer > 0) tremer = Math.max(0, tremer - dt);
}

function tamanho() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
}

function barra(id, hp) {
  document.getElementById(id).style.width = Math.max(0, Math.min(100, hp)) + "%";
}

function garantirSom() {
  if (!audio) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audio = new Ctx();
  }
  if (audio.state === "suspended") audio.resume();
}

function tocar(tipo) {
  if (!audio) return;
  const o = audio.createOscillator();
  const g = audio.createGain();
  const filtro = audio.createBiquadFilter();
  const agora = audio.currentTime;
  let freq = 140;
  let fim = 0.12;
  let tipoOnda = "sine";
  if (tipo === "acerto" || tipo === "combo" || tipo === "contra") freq = tipo === "combo" ? 110 : 90;
  if (tipo === "guarda") { freq = 220; fim = 0.08; }
  if (tipo === "esquiva") { freq = 420; fim = 0.1; tipoOnda = "triangle"; }
  if (tipo === "muro") { freq = 70; fim = 0.18; }
  o.type = tipoOnda;
  o.frequency.setValueAtTime(freq, agora);
  o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.6), agora + fim);
  filtro.type = "lowpass";
  filtro.frequency.value = tipo === "esquiva" ? 1800 : 500;
  g.gain.setValueAtTime(0.0001, agora);
  g.gain.exponentialRampToValueAtTime(0.22, agora + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, agora + fim);
  o.connect(filtro);
  filtro.connect(g);
  g.connect(audio.destination);
  o.start(agora);
  o.stop(agora + fim + 0.02);
}

function lerEntrada() {
  const e = vazio();
  let ix = stickX;
  let iz = stickY;
  if (teclas.has("KeyW") || teclas.has("ArrowUp")) iz += 1;
  if (teclas.has("KeyS") || teclas.has("ArrowDown")) iz -= 1;
  if (teclas.has("KeyD") || teclas.has("ArrowRight")) ix += 1;
  if (teclas.has("KeyA") || teclas.has("ArrowLeft")) ix -= 1;
  camera.getWorldDirection(frenteCam);
  frenteCam.y = 0;
  if (frenteCam.lengthSq() < 0.0001) frenteCam.set(0, 0, -1);
  frenteCam.normalize();
  direitaCam.set(frenteCam.z, 0, -frenteCam.x);
  e.x = direitaCam.x * ix + frenteCam.x * iz;
  e.z = direitaCam.z * ix + frenteCam.z * iz;
  const quer = (code, nome) => pulso.has(code) || pulsoToque.includes(nome);
  e.soco = quer("KeyJ", "soco");
  e.chute = quer("KeyK", "chute");
  e.esquiva = quer("Space", "esquiva");
  e.agarra = quer("KeyF", "agarra");
  e.especial = quer("KeyE", "especial");
  e.guarda = teclas.has("KeyL") || guardaToque;
  pulso.clear();
  pulsoToque.length = 0;
  return e;
}

function abrirFim() {
  if (!luta || luta.fase === "luta") return;
  const titulo = document.getElementById("fim-titulo");
  const texto = document.getElementById("fim-texto");
  if (luta.fase === "vitoria") {
    titulo.textContent = luta.a.nome + " ficou de pé";
    texto.textContent = luta.b.nome + " no chão.";
  } else if (luta.fase === "derrota") {
    titulo.textContent = luta.a.nome + " caiu";
    texto.textContent = "A rua ficou com " + luta.b.nome + ".";
  } else {
    titulo.textContent = "Os dois ficaram";
    texto.textContent = "O tempo fechou a rua.";
  }
  fim.hidden = false;
  toque.hidden = true;
}

function comecar() {
  garantirSom();
  const semente = (Math.random() * 0x7fffffff) | 0;
  luta = criarLuta(escolhido, semente);
  const da = ELENCO.find((f) => f.id === luta.a.id);
  const db = ELENCO.find((f) => f.id === luta.b.id);
  usar(da, db);
  document.getElementById("nome-a").textContent = luta.a.nome;
  document.getElementById("nome-b").textContent = luta.b.nome;
  escolhe.hidden = true;
  fim.hidden = true;
  hud.hidden = false;
  toque.hidden = false;
  aviso.textContent = "Vai.";
}

function quadro() {
  requestAnimationFrame(quadro);
  const dt = Math.min(0.05, relogio.getDelta() || 0.016);
  const agora = relogio.elapsedTime;
  if (luta && luta.fase === "luta") {
    passo(luta, dt, lerEntrada());
    if (luta.ultimo && luta.ultimo !== ultimoSom) {
      ultimoSom = luta.ultimo;
      tocar(luta.ultimo.tipo);
      tremer = 0.12;
      const rig = luta.ultimo.alvo === luta.a.id ? rigA : rigB;
      if (rig) {
        rig.flash = 0.08;
      }
    }
    barra("vida-a", luta.a.hp);
    barra("vida-b", luta.b.hp);
    document.getElementById("relogio").textContent = String(Math.ceil(luta.tempo));
    aviso.textContent = luta.avisoT > 0 ? luta.aviso : "";
    if (luta.fase !== "luta") abrirFim();
  } else if (!luta) {
    lerEntrada();
  }
  if (luta && rigA && rigB) {
    colocar(rigA, luta.a, agora);
    colocar(rigB, luta.b, agora);
  } else if (rigA && rigB) {
    colocar(rigA, { id: "kadu", x: -1.8, z: 0, yaw: Math.PI / 2, estado: "idle", t: 0, stun: 0, lado: 1 }, agora);
    colocar(rigB, { id: "nilo", x: 1.8, z: 0, yaw: -Math.PI / 2, estado: "idle", t: 0, stun: 0, lado: 1 }, agora);
  }
  enquadrar(dt);
  renderer.render(cena, camera);
}

function marcarCarta() {
  document.getElementById("escolhe-kadu").classList.toggle("ligada", escolhido === "kadu");
  document.getElementById("escolhe-nilo").classList.toggle("ligada", escolhido === "nilo");
}

window.addEventListener("keydown", (evento) => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(evento.code)) evento.preventDefault();
  if (!teclas.has(evento.code)) pulso.add(evento.code);
  teclas.add(evento.code);
  garantirSom();
});
window.addEventListener("keyup", (evento) => {
  teclas.delete(evento.code);
});

document.querySelectorAll("#botoes button").forEach((botao) => {
  const nome = botao.dataset.g;
  botao.addEventListener("pointerdown", (evento) => {
    evento.preventDefault();
    garantirSom();
    if (nome === "guarda") guardaToque = true;
    else pulsoToque.push(nome);
  });
  const solta = () => {
    if (nome === "guarda") guardaToque = false;
  };
  botao.addEventListener("pointerup", solta);
  botao.addEventListener("pointercancel", solta);
  botao.addEventListener("pointerleave", solta);
});

const stick = document.getElementById("stick");
const nub = document.getElementById("nub");
let stickId = null;
let origem = null;
stick.addEventListener("pointerdown", (evento) => {
  stickId = evento.pointerId;
  origem = { x: evento.clientX, y: evento.clientY };
  stick.setPointerCapture(evento.pointerId);
  garantirSom();
});
stick.addEventListener("pointermove", (evento) => {
  if (evento.pointerId !== stickId || !origem) return;
  const dx = (evento.clientX - origem.x) / 46;
  const dy = (origem.y - evento.clientY) / 46;
  const mag = Math.hypot(dx, dy) || 1;
  const corta = mag > 1 ? 1 / mag : 1;
  stickX = dx * corta;
  stickY = dy * corta;
  nub.style.transform = "translate(" + stickX * 28 + "px," + -stickY * 28 + "px)";
});
function soltaStick(evento) {
  if (evento.pointerId !== stickId) return;
  stickId = null;
  origem = null;
  stickX = 0;
  stickY = 0;
  nub.style.transform = "none";
}
stick.addEventListener("pointerup", soltaStick);
stick.addEventListener("pointercancel", soltaStick);

document.getElementById("escolhe-kadu").onclick = () => { escolhido = "kadu"; marcarCarta(); };
document.getElementById("escolhe-nilo").onclick = () => { escolhido = "nilo"; marcarCarta(); };
document.getElementById("lutar").onclick = () => comecar();
document.getElementById("de-novo").onclick = () => comecar();
window.addEventListener("resize", tamanho);

arena();
usar(ELENCO[0], ELENCO[1]);
tamanho();
requestAnimationFrame(quadro);

function medida(quem) {
  const rig = quem === "b" ? rigB : rigA;
  const caixa = new THREE.Box3().setFromObject(rig.g);
  return {
    minX: caixa.min.x, maxX: caixa.max.x,
    minY: caixa.min.y, maxY: caixa.max.y,
    minZ: caixa.min.z, maxZ: caixa.max.z
  };
}

window.STREET = {
  renderer,
  get luta() { return luta; },
  comecar,
  medida,
  escolher(id) { escolhido = id; marcarCarta(); }
};
