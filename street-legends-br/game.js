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

function cor(hex, rugoso) {
  return new THREE.MeshStandardMaterial({ color: hex, roughness: rugoso === undefined ? 0.62 : rugoso, metalness: 0 });
}

function malha(geo, material) {
  const m = new THREE.Mesh(geo, material);
  m.userData.base = material.color.getHex();
  if (m.material.emissive) m.material.emissive.setHex(0x000000);
  return m;
}

function cilindro(raioA, raioB, altura, material) {
  const m = malha(new THREE.CylinderGeometry(raioA, raioB, altura, 10), material);
  return m;
}

function boneco(dados) {
  const g = new THREE.Group();
  const corpo = new THREE.Group();
  g.add(corpo);
  const pele = cor(dados.pele, 0.48);
  const roupa = cor(dados.roupa, 0.72);
  const calca = cor(dados.calca, 0.78);
  const tenis = cor(dados.tenis, 0.45);
  const sola = cor("#2a241c", 0.8);
  const cabeloMat = cor(dados.cabelo || "#241c18", 0.7);
  const olhoMat = cor("#1c140f", 0.3);
  const largo = dados.careca ? 1.12 : 1;

  const hips = new THREE.Group();
  hips.position.y = 0.96;
  const pelvis = cilindro(0.16 * largo, 0.18 * largo, 0.22, calca);
  hips.add(pelvis);
  corpo.add(hips);

  const torso = new THREE.Group();
  torso.position.y = 0.28;
  const peito = malha(new THREE.BoxGeometry(0.46 * largo, 0.42, 0.24), roupa);
  peito.position.y = 0.24;
  torso.add(peito);
  const camisa = malha(new THREE.BoxGeometry(0.16, 0.28, 0.04), cor(dados.careca ? "#6a241c" : "#f4efe6", 0.55));
  camisa.position.set(0, 0.2, 0.13);
  torso.add(camisa);
  const pescoco = cilindro(0.07, 0.08, 0.1, pele);
  pescoco.position.y = 0.5;
  torso.add(pescoco);

  const cabeca = new THREE.Group();
  cabeca.position.y = 0.66;
  const cranio = malha(new THREE.SphereGeometry(0.17, 16, 14), pele);
  cranio.scale.set(1, 1.08, 0.96);
  cabeca.add(cranio);
  [-1, 1].forEach((lado) => {
    const olho = malha(new THREE.SphereGeometry(0.026, 8, 6), olhoMat);
    olho.position.set(lado * 0.055, 0.02, 0.145);
    cabeca.add(olho);
  });
  const nariz = malha(new THREE.SphereGeometry(0.03, 8, 6), pele);
  nariz.position.set(0, -0.02, 0.155);
  nariz.scale.set(0.8, 0.7, 1);
  cabeca.add(nariz);
  if (dados.careca) {
    const sobrancelha = malha(new THREE.BoxGeometry(0.14, 0.02, 0.02), cabeloMat);
    sobrancelha.position.set(0, 0.07, 0.15);
    cabeca.add(sobrancelha);
  } else {
    const pelo = malha(new THREE.SphereGeometry(0.18, 14, 12), cabeloMat);
    pelo.scale.set(1.05, 0.62, 1.02);
    pelo.position.y = 0.08;
    cabeca.add(pelo);
    const brinco = malha(new THREE.TorusGeometry(0.02, 0.006, 6, 8), cor("#e0b15a", 0.35));
    brinco.position.set(-0.16, -0.04, 0.02);
    brinco.rotation.y = Math.PI / 2;
    cabeca.add(brinco);
  }
  torso.add(cabeca);
  hips.add(torso);

  function braco(lado) {
    const ombro = new THREE.Group();
    ombro.position.set(lado * 0.3 * largo, 0.4, 0);
    const junta = malha(new THREE.SphereGeometry(0.07, 10, 8), dados.careca ? pele : roupa);
    ombro.add(junta);
    const manga = dados.careca ? pele : roupa;
    const cima = cilindro(0.07, 0.06, 0.3, manga);
    cima.position.y = -0.18;
    ombro.add(cima);
    const cotovelo = new THREE.Group();
    cotovelo.position.y = -0.32;
    const ante = cilindro(0.055, 0.048, 0.28, pele);
    ante.position.y = -0.15;
    cotovelo.add(ante);
    const mao = malha(new THREE.SphereGeometry(0.065, 10, 8), pele.clone());
    mao.scale.set(0.9, 0.75, 1.15);
    mao.position.y = -0.32;
    mao.userData.base = pele.color.getHex();
    cotovelo.add(mao);
    ombro.add(cotovelo);
    torso.add(ombro);
    return { ombro, cotovelo, mao };
  }

  function perna(lado) {
    const quadril = new THREE.Group();
    quadril.position.set(lado * 0.11 * largo, -0.02, 0);
    const coxa = cilindro(0.09, 0.07, 0.38, calca);
    coxa.position.y = -0.2;
    quadril.add(coxa);
    const joelho = new THREE.Group();
    joelho.position.y = -0.4;
    const canela = cilindro(0.06, 0.048, 0.36, calca);
    canela.position.y = -0.18;
    joelho.add(canela);
    const cabedal = malha(new THREE.BoxGeometry(0.12, 0.07, 0.18), tenis);
    cabedal.position.set(0, -0.36, 0.02);
    joelho.add(cabedal);
    const solaPe = malha(new THREE.BoxGeometry(0.13, 0.04, 0.28), sola);
    solaPe.position.set(0, -0.4, 0.05);
    joelho.add(solaPe);
    quadril.add(joelho);
    hips.add(quadril);
    return { quadril, joelho, pe: solaPe };
  }

  const bracoL = braco(-1);
  const bracoR = braco(1);
  const pernaL = perna(-1);
  const pernaR = perna(1);
  const anel = new THREE.Mesh(
    new THREE.RingGeometry(0.38, 0.46, 24),
    new THREE.MeshBasicMaterial({ color: dados.roupa, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
  );
  anel.rotation.x = -Math.PI / 2;
  anel.position.y = 0.02;
  g.add(anel);
  return { g, corpo, hips, torso, cabeca, bracoL, bracoR, pernaL, pernaR, anel, largo, flash: 0 };
}

function pintar(rig, claro) {
  rig.g.traverse((obj) => {
    if (!obj.material || !obj.material.emissive) return;
    obj.material.emissive.setHex(claro ? 0x5a3a28 : 0x000000);
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
  cena.add(new THREE.AmbientLight(0xd5dde8, 1.05));
  const lua = new THREE.DirectionalLight(0xe7eef8, 1.45);
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
  const largo = rig.largo || 1;
  rig.bracoL.ombro.position.set(-0.3 * largo, 0.4, 0);
  rig.bracoR.ombro.position.set(0.3 * largo, 0.4, 0);
  [rig.bracoL, rig.bracoR].forEach((braco) => {
    braco.ombro.rotation.set(0.25, 0, 0);
    braco.cotovelo.rotation.set(0.5, 0, 0);
  });
  rig.pernaL.quadril.position.set(-0.11 * largo, -0.02, 0);
  rig.pernaR.quadril.position.set(0.11 * largo, -0.02, 0);
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
    rig.bracoR.ombro.position.x = 0.1;
    rig.bracoR.ombro.position.z = 0.22 * u;
    rig.bracoR.ombro.rotation.x = -1.25 * u;
    rig.bracoR.cotovelo.rotation.x = 0.15 * (1 - u);
    rig.torso.rotation.x = 0.42 * u;
    rig.torso.rotation.y = 0.25 * u;
    if (s === "rajada") rig.bracoL.ombro.rotation.x = -1.1 * u;
  }
  if (s === "chute") {
    rig.pernaR.quadril.position.x = 0.05;
    rig.pernaR.quadril.position.z = 0.12 * u;
    rig.pernaR.quadril.rotation.x = -1.35 * u;
    rig.pernaR.joelho.rotation.x = 0.15 * (1 - u);
    rig.torso.rotation.x = -0.28 * u;
    rig.bracoL.ombro.rotation.x = -0.55 * u;
    rig.bracoR.ombro.rotation.x = 0.35 * u;
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
  const mao = s === "chute" ? null : rig.bracoR.mao;
  if (mao && mao.material && mao.material.emissive) mao.material.emissive.setHex(noMeio ? 0x6a4228 : 0x000000);
}

function avancar(rig, f, outro) {
  const g = GOLPES[f.estado];
  if (!g || !outro) return;
  const u = curva(f);
  if (u < 0.25) return;
  const dx = outro.x - f.x;
  const dz = outro.z - f.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.2) return;
  const membro = f.estado === "chute" ? 0.9 : 0.5;
  const falta = dist - membro - 0.15;
  if (falta <= 0) return;
  const cabe = dist <= g.alcance + 0.55;
  const passo = (cabe ? Math.min(falta, 1.15) : Math.min(falta, 0.18)) * u;
  rig.g.position.x += (dx / dist) * passo;
  rig.g.position.z += (dz / dist) * passo;
}

function colocar(rig, f, outro, agora) {
  rig.g.position.set(f.x, 0, f.z);
  rig.g.rotation.y = f.yaw;
  posar(rig, f, agora);
  avancar(rig, f, outro);
  if (rig.flash > 0) {
    pintar(rig, true);
    rig.flash = Math.max(0, rig.flash - 0.016);
    if (rig.flash === 0) pintar(rig, false);
  }
}

function enquadrar(dt) {
  const a = luta ? luta.a : { x: -1.6, z: 0, yaw: Math.PI / 2 };
  const b = luta ? luta.b : { x: 1.6, z: 0 };
  const dist = 4.8;
  const fx = Math.sin(a.yaw);
  const fz = Math.cos(a.yaw);
  let cx = a.x - fx * dist + fz * 1.7;
  let cz = a.z - fz * dist - fx * 1.7;
  cx = Math.max(-5.4, Math.min(5.4, cx));
  cz = Math.max(-5.4, Math.min(5.4, cz));
  const treme = tremer > 0 ? (Math.random() - 0.5) * 0.12 : 0;
  camDesejada.set(cx + treme, 2.7, cz + treme);
  const t = 1 - Math.pow(0.012, dt || 0.016);
  camera.position.lerp(camDesejada, t);
  olhar.set((a.x + b.x) / 2, 1.15, (a.z + b.z) / 2);
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
    colocar(rigA, luta.a, luta.b, agora);
    colocar(rigB, luta.b, luta.a, agora);
  } else if (rigA && rigB) {
    colocar(rigA, { id: "kadu", x: -1.8, z: 0, yaw: Math.PI / 2, estado: "idle", t: 0, stun: 0, lado: 1 }, null, agora);
    colocar(rigB, { id: "nilo", x: 1.8, z: 0, yaw: -Math.PI / 2, estado: "idle", t: 0, stun: 0, lado: 1 }, null, agora);
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

function pontoDe(quem, osso) {
  const rig = quem === "b" ? rigB : rigA;
  const outro = luta && (quem === "b" ? luta.a : luta.b);
  const p = new THREE.Vector3();
  osso.getWorldPosition(p);
  const d = outro ? Math.hypot(p.x - outro.x, p.z - outro.z) : 0;
  return { x: p.x, y: p.y, z: p.z, d };
}

function mao(quem) {
  const rig = quem === "b" ? rigB : rigA;
  return pontoDe(quem, rig.bracoR.mao);
}

function pe(quem) {
  const rig = quem === "b" ? rigB : rigA;
  return pontoDe(quem, rig.pernaR.pe);
}

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
  mao,
  pe,
  escolher(id) { escolhido = id; marcarCarta(); }
};
