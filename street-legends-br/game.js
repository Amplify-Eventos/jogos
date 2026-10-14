import * as THREE from "three";
import { ELENCO, GOLPES, criarLuta, passo, assentar, vazio } from "./combat.mjs";
import { GLTFLoader } from "./vendor/GLTFLoader.js";
import { clone } from "./vendor/SkeletonUtils.js";

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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const cena = new THREE.Scene();
cena.fog = new THREE.Fog(0x141820, 12, 28);
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);
camera.position.set(0, 3.4, 6.5);

const relogio = new THREE.Clock();
const camDesejada = new THREE.Vector3();
const olhar = new THREE.Vector3();
const frenteCam = new THREE.Vector3();
const direitaCam = new THREE.Vector3();

let passoDt = 0.016;
let gltfKadu = null;
let gltfNilo = null;
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
  m.castShadow = true;
  m.receiveShadow = true;
  m.userData.base = material.color.getHex();
  if (m.material.emissive) m.material.emissive.setHex(0x000000);
  return m;
}

function pano(hex, tipo) {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = hex;
  g.fillRect(0, 0, 128, 128);
  if (tipo === "pele") {
    g.fillStyle = "rgba(90,40,20,0.08)";
    for (let i = 0; i < 90; i += 1) g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  } else {
    g.strokeStyle = "rgba(0,0,0,0.18)";
    g.lineWidth = 1;
    for (let y = 0; y < 128; y += 5) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(128, y);
      g.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function tecido(hex, tipo, rugoso) {
  const m = cor(hex, rugoso);
  m.map = pano(hex, tipo);
  return m;
}

function solido(aneis, material, lados) {
  const n = lados || 6;
  const pos = [];
  const uv = [];
  const y0 = aneis[0].y;
  const alto = (aneis[aneis.length - 1].y - y0) || 1;
  const ponto = (anel, k) => {
    const kk = ((k % n) + n) % n;
    const a = (kk / n) * Math.PI * 2;
    return {
      p: [Math.cos(a) * anel.rx, anel.y, Math.sin(a) * anel.rz + (anel.oz || 0)],
      uv: [kk / n, (anel.y - y0) / alto]
    };
  };
  const tri = (a, b, c) => {
    pos.push(a.p[0], a.p[1], a.p[2], b.p[0], b.p[1], b.p[2], c.p[0], c.p[1], c.p[2]);
    uv.push(a.uv[0], a.uv[1], b.uv[0], b.uv[1], c.uv[0], c.uv[1]);
  };
  for (let i = 0; i < aneis.length - 1; i += 1) {
    for (let k = 0; k < n; k += 1) {
      const a = ponto(aneis[i], k);
      const b = ponto(aneis[i], k + 1);
      const c = ponto(aneis[i + 1], k);
      const d = ponto(aneis[i + 1], k + 1);
      tri(a, c, b);
      tri(b, c, d);
    }
  }
  const baixo = { p: [0, aneis[0].y, aneis[0].oz || 0], uv: [0.5, 0] };
  const cima = { p: [0, aneis[aneis.length - 1].y, aneis[aneis.length - 1].oz || 0], uv: [0.5, 1] };
  for (let k = 0; k < n; k += 1) {
    tri(baixo, ponto(aneis[0], k + 1), ponto(aneis[0], k));
    tri(cima, ponto(aneis[aneis.length - 1], k), ponto(aneis[aneis.length - 1], k + 1));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  const mat = material.clone();
  mat.side = THREE.DoubleSide;
  return malha(geo, mat);
}

function marcar(mesh, parte) {
  mesh.userData.parte = parte;
  return mesh;
}

function superficie(grelha, material) {
  const pos = [];
  const n = grelha[0].length;
  const por = (p) => pos.push(p[0], p[1], p[2]);
  for (let j = 0; j < grelha.length - 1; j += 1) {
    for (let i = 0; i < n - 1; i += 1) {
      const a = grelha[j][i];
      const b = grelha[j][i + 1];
      const c = grelha[j + 1][i];
      const d = grelha[j + 1][i + 1];
      por(a); por(c); por(b);
      por(b); por(c); por(d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  const mat = material.clone();
  mat.side = THREE.DoubleSide;
  return malha(geo, mat);
}

function filaRosto(y, rx, z, nariz) {
  const u = [-1, -0.7, -0.34, 0, 0.34, 0.7, 1];
  return u.map((t) => {
    const lado = Math.abs(t);
    const x = t * rx * (t === -1 || t === 1 ? 1.08 : 1);
    let zz = z * (1 - lado * 0.42);
    if (t === 0) zz += nariz || 0;
    return [x, y, zz];
  });
}

function boneco(dados) {
  const g = new THREE.Group();
  const corpo = new THREE.Group();
  g.add(corpo);
  const pele = tecido(dados.pele, "pele", 0.48);
  const roupa = tecido(dados.roupa, "tecido", 0.72);
  const calca = tecido(dados.calca, "tecido", 0.78);
  const tenis = cor(dados.tenis, 0.45);
  const sola = cor("#2a241c", 0.8);
  const cabeloMat = cor(dados.cabelo || "#241c18", 0.7);
  const olhoMat = cor("#1c140f", 0.3);
  const largo = dados.careca ? 1.12 : 1;

  const hips = new THREE.Group();
  hips.position.y = 0.96;
  const pelvis = marcar(solido([
    { y: -0.1, rx: 0.13 * largo, rz: 0.1 },
    { y: 0.02, rx: 0.2 * largo, rz: 0.13 },
    { y: 0.18, rx: 0.15 * largo, rz: 0.11 }
  ], calca, 8), "quadril");
  hips.add(pelvis);
  corpo.add(hips);

  const torso = new THREE.Group();
  torso.position.y = 0.28;
  const peito = marcar(solido([
    { y: -0.28, rx: 0.16 * largo, rz: 0.11 },
    { y: -0.06, rx: 0.2 * largo, rz: 0.13, oz: 0.01 },
    { y: 0.12, rx: 0.24 * largo, rz: 0.15, oz: 0.015 },
    { y: 0.26, rx: 0.22 * largo, rz: 0.12 }
  ], roupa, 8), "peito");
  peito.position.y = 0.06;
  if (dados.regata) {
    peito.scale.x = 0.86;
    peito.userData.traje = "regata";
  }
  torso.add(peito);
  if (dados.jaqueta) {
    peito.userData.traje = "jaqueta";
    const gola = solido([
      { y: 0, rx: 0.11, rz: 0.08 },
      { y: 0.06, rx: 0.13, rz: 0.09 }
    ], cor("#2c3424", 0.8), 6);
    gola.position.set(0, 0.28, 0.02);
    gola.userData.traje = "jaqueta";
    torso.add(gola);
  }

  const cabeca = new THREE.Group();
  cabeca.position.y = 0.42;
  const frente = [
    filaRosto(-0.22, 0.07, 0.05, 0),
    filaRosto(-0.14, 0.075, 0.09, 0.02),
    filaRosto(-0.08, 0.086, 0.1, 0.015),
    filaRosto(-0.02, 0.09, 0.1, 0.055),
    filaRosto(0.035, 0.098, 0.09, 0.01),
    filaRosto(0.08, 0.1, 0.11, 0.02),
    filaRosto(0.15, 0.078, 0.04, 0)
  ];
  const tras = frente.map((linha) => linha.map((p) => [p[0] * 0.92, p[1], -Math.max(0.03, p[2] * 0.75)]));
  const rostoMesh = marcar(superficie(frente, pele), "queixo");
  const nuca = superficie(tras, pele);
  cabeca.add(rostoMesh);
  cabeca.add(nuca);
  for (let j = 0; j < frente.length - 1; j += 1) {
    const anel = [
      frente[j][0], tras[j][0], tras[j + 1][0], frente[j + 1][0]
    ];
    const anelD = [
      frente[j][6], frente[j + 1][6], tras[j + 1][6], tras[j][6]
    ];
    cabeca.add(superficie([anel.slice(0, 2), anel.slice(2)], pele));
    cabeca.add(superficie([anelD.slice(0, 2), anelD.slice(2)], pele));
  }
  cabeca.add(superficie([frente[frente.length - 1], tras[tras.length - 1]], pele));
  [-1, 1].forEach((lado) => {
    const olho = malha(new THREE.BoxGeometry(0.028, 0.012, 0.008), olhoMat);
    olho.position.set(lado * 0.038, 0.04, 0.1);
    cabeca.add(olho);
  });
  const boca = malha(new THREE.BoxGeometry(0.046, 0.01, 0.008), olhoMat);
  boca.position.set(0, -0.075, 0.112);
  cabeca.add(boca);
  const nariz = new THREE.Object3D();
  nariz.position.set(0, -0.01, 0.16);
  nariz.userData.parte = "rosto";
  cabeca.add(nariz);
  if (dados.careca) {
    rostoMesh.userData.traje = "careca";
  } else {
    const pelo = superficie([
      filaRosto(0.06, 0.11, 0.12, 0),
      filaRosto(0.12, 0.12, 0.08, 0),
      filaRosto(0.18, 0.06, 0.02, 0)
    ], cabeloMat);
    pelo.userData.traje = "cabelo";
    cabeca.add(pelo);
  }
  torso.add(cabeca);
  hips.add(torso);

  function braco(lado) {
    const ombro = new THREE.Group();
    ombro.position.set(lado * 0.3 * largo, 0.4, 0);
    const junta = solido([
      { y: -0.02, rx: 0.06, rz: 0.05 },
      { y: 0.04, rx: 0.075, rz: 0.06 },
      { y: 0.08, rx: 0.03, rz: 0.03 }
    ], dados.careca ? pele : roupa, 6);
    ombro.add(junta);
    const manga = dados.careca ? pele : roupa;
    const cima = solido([
      { y: -0.2, rx: 0.05, rz: 0.05 },
      { y: 0, rx: 0.068, rz: 0.062 },
      { y: 0.16, rx: 0.055, rz: 0.05 }
    ], manga, 6);
    cima.position.y = -0.16;
    ombro.add(cima);
    const cotovelo = new THREE.Group();
    cotovelo.position.y = -0.32;
    const ante = solido([
      { y: -0.16, rx: 0.04, rz: 0.038 },
      { y: 0, rx: 0.05, rz: 0.046 },
      { y: 0.2, rx: 0.048, rz: 0.045 }
    ], pele, 6);
    ante.position.y = -0.14;
    cotovelo.add(ante);
    const mao = marcar(malha(new THREE.BoxGeometry(0.09, 0.1, 0.045), pele.clone()), "mao");
    mao.position.y = -0.32;
    const dedos = malha(new THREE.BoxGeometry(0.078, 0.04, 0.036), pele);
    dedos.position.set(0, -0.065, 0.004);
    mao.add(dedos);
    const polegar = malha(new THREE.BoxGeometry(0.028, 0.045, 0.03), pele);
    polegar.position.set(lado * 0.05, -0.01, 0.01);
    polegar.rotation.z = lado * -0.7;
    mao.add(polegar);
    cotovelo.add(mao);
    ombro.add(cotovelo);
    torso.add(ombro);
    return { ombro, cotovelo, mao };
  }

  function perna(lado) {
    const quadril = new THREE.Group();
    quadril.position.set(lado * 0.11 * largo, -0.02, 0);
    const coxa = marcar(solido([
      { y: -0.24, rx: 0.052, rz: 0.058 },
      { y: -0.02, rx: 0.08, rz: 0.09 },
      { y: 0.2, rx: 0.1, rz: 0.105 }
    ], calca, 7), "coxa");
    coxa.position.y = -0.2;
    quadril.add(coxa);
    const joelho = new THREE.Group();
    joelho.position.y = -0.4;
    const canela = marcar(solido([
      { y: -0.17, rx: 0.036, rz: 0.04 },
      { y: -0.02, rx: 0.055, rz: 0.074 },
      { y: 0.24, rx: 0.05, rz: 0.052 }
    ], calca, 6), "canela");
    canela.position.y = -0.18;
    joelho.add(canela);
    const cabedal = malha(new THREE.BoxGeometry(dados.jaqueta ? 0.14 : 0.11, dados.jaqueta ? 0.08 : 0.06, dados.jaqueta ? 0.24 : 0.16), tenis);
    cabedal.position.set(0, -0.35, dados.jaqueta ? 0.05 : 0.02);
    if (dados.jaqueta) {
      cabedal.userData.traje = "tenis";
      const faixa = malha(new THREE.BoxGeometry(0.142, 0.018, 0.1), cor("#1c1a17", 0.55));
      faixa.position.set(0, 0.02, 0.02);
      faixa.userData.traje = "tenis";
      cabedal.add(faixa);
    }
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
  return { g, corpo, hips, torso, cabeca, nariz, bracoL, bracoR, pernaL, pernaR, anel, largo, careca: !!dados.careca, flash: 0 };
}

function pintar(rig, claro) {
  rig.g.traverse((obj) => {
    if (!obj.material || !obj.material.emissive) return;
    obj.material.emissive.setHex(claro ? 0x5a3a28 : 0x000000);
  });
}

const CLIP = {
  idle: "Unarmed_Idle",
  walk: "Walking_A",
  soco: "Unarmed_Melee_Attack_Punch_A",
  rajada: "Unarmed_Melee_Attack_Punch_B",
  chute: "Unarmed_Melee_Attack_Kick",
  agarra: "Unarmed_Melee_Attack_Punch_B",
  cola: "Unarmed_Idle",
  ombro: "2H_Melee_Attack_Chop",
  guarda: "Block",
  esquiva: "Dodge_Backward",
  hit: "Hit_A",
  queda: "Death_A",
  ko: "Death_A",
  levanta: "Unarmed_Idle"
};
const EM_LOOP = new Set([
  "Unarmed_Idle", "Idle", "Walking_A", "Walking_B", "Walking_C",
  "Walking_Backwards", "Running_A", "Running_B", "Block", "Blocking"
]);

function pessoa(dados) {
  const origem = dados.id === "nilo" ? gltfNilo : gltfKadu;
  const g = new THREE.Group();
  const corpo = clone(origem.scene);
  corpo.rotation.y = 0;
  corpo.traverse((obj) => {
    if (obj.name === "Knife_Offhand" || obj.name === "1H_Crossbow" || obj.name === "2H_Crossbow" || obj.name === "Knife" || obj.name === "Throwable" || obj.name === "1H_Axe_Offhand" || obj.name === "1H_Axe" || obj.name === "2H_Axe" || obj.name === "Mug" || obj.name === "Barbarian_Round_Shield") obj.visible = false;
  });
  corpo.updateMatrixWorld(true);
  const caixa = new THREE.Box3().setFromObject(corpo);
  const alto = caixa.max.y - caixa.min.y || 1;
  const escala = 1.8 / alto;
  corpo.scale.setScalar(escala);
  corpo.position.y = -caixa.min.y * escala;
  g.add(corpo);
  const mixer = new THREE.AnimationMixer(corpo);
  const clips = {};
  origem.animations.forEach((clip) => {
    const acao = mixer.clipAction(clip);
    const loop = EM_LOOP.has(clip.name);
    acao.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    acao.clampWhenFinished = !loop;
    clips[clip.name] = acao;
  });
  let maoOsso = null;
  let peOsso = null;
  let cabeca = null;
  corpo.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      const lista = Array.isArray(obj.material) ? obj.material : [obj.material];
      const novos = lista.map((m) => {
        const c = m.clone();
        if (c.emissive) c.emissive.setHex(0x000000);
        return c;
      });
      obj.material = Array.isArray(obj.material) ? novos : novos[0];
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
    if (obj.name === "handr" || obj.name === "hand.r") maoOsso = obj;
    if ((obj.name === "footr" || obj.name === "foot.r") && !peOsso) peOsso = obj;
    if (obj.name === "toesr" || obj.name === "toes.r") peOsso = obj;
    if (obj.name === "head") cabeca = obj;
  });
  const nariz = new THREE.Object3D();
  nariz.position.set(0, 0.05, 0.18);
  if (cabeca) cabeca.add(nariz);
  g.userData.traje = dados.careca ? "careca" : (dados.jaqueta ? "jaqueta" : "regata");
  const anel = new THREE.Mesh(
    new THREE.RingGeometry(0.38, 0.46, 24),
    new THREE.MeshBasicMaterial({ color: dados.roupa, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
  );
  anel.rotation.x = -Math.PI / 2;
  anel.position.y = 0.02;
  g.add(anel);
  return {
    g, corpo, mixer, clips, acao: null, acaoNome: "",
    mao: maoOsso, pe: peOsso, cabeca, nariz,
    careca: !!dados.careca, flash: 0, gente: true
  };
}

function animar(rig, f) {
  const nome = CLIP[f.estado] || "Unarmed_Idle";
  const acao = rig.clips[nome] || rig.clips.Unarmed_Idle;
  if (!acao) return;
  if (rig.acaoNome !== nome) {
    if (rig.acao) rig.acao.stop();
    acao.reset();
    acao.enabled = true;
    acao.setEffectiveWeight(1);
    acao.play();
    rig.acao = acao;
    rig.acaoNome = nome;
  }
  const loop = EM_LOOP.has(nome);
  if (!loop) {
    const d = acao.getClip().duration;
    const golpe = GOLPES[f.estado];
    let u = Math.min(1, f.t / Math.max(0.25, d));
    if (f.estado === "rajada" && golpe && golpe.vezes > 1) {
      const ciclo = golpe.startup + golpe.active + (golpe.pausa || 0);
      const local = f.t - Math.floor(f.t / ciclo) * ciclo;
      const meio = golpe.startup + golpe.active;
      u = local < meio ? Math.min(0.55, (local / meio) * 0.5) : 0.12;
    } else if (f.estado === "ombro" && golpe) {
      u = f.t < golpe.startup ? (f.t / Math.max(0.01, golpe.startup)) * 0.2 : Math.min(0.62, 0.3 + (f.t - golpe.startup));
    } else if (golpe && f.t >= golpe.startup) {
      u = Math.min(0.72, 0.34 + (f.t - golpe.startup) * 2);
    }
    if (nome === "Death_A") u = Math.min(1, f.t / 0.28);
    acao.time = Math.min(Math.max(0, d - 0.02), Math.max(0, u * d));
    rig.mixer.update(0);
  } else {
    rig.mixer.update(passoDt);
  }
}

function usar(dadosA, dadosB) {
  if (rigA) cena.remove(rigA.g);
  if (rigB) cena.remove(rigB.g);
  rigA = pessoa(dadosA);
  rigB = pessoa(dadosB);
  cena.add(rigA.g);
  cena.add(rigB.g);
}

function texturaChao() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const g = c.getContext("2d");
  g.fillStyle = "#2c2926";
  g.fillRect(0, 0, 1024, 1024);
  g.fillStyle = "#514c45";
  g.fillRect(0, 0, 1024, 150);
  g.fillRect(0, 874, 1024, 150);
  g.fillStyle = "#7a7468";
  g.fillRect(0, 142, 1024, 16);
  g.fillRect(0, 866, 1024, 16);
  for (let i = 0; i < 1600; i += 1) {
    const tom = 26 + Math.floor(Math.random() * 22);
    g.fillStyle = "rgb(" + tom + "," + (tom - 2) + "," + (tom - 5) + ")";
    g.fillRect(Math.random() * 1024, 160 + Math.random() * 700, 2 + Math.random() * 7, 2 + Math.random() * 3);
  }
  g.strokeStyle = "#161412";
  g.lineWidth = 2;
  [[140, 380, 280, 430, 360, 510, 520, 490], [700, 620, 820, 560, 900, 640]].forEach((p) => {
    g.beginPath();
    g.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]);
    g.stroke();
  });
  g.fillStyle = "#c2b15a";
  for (let x = 48; x < 1000; x += 96) g.fillRect(x, 498, 42, 12);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function texturaGrafite() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#3e413c";
  g.fillRect(0, 0, 1024, 512);
  g.strokeStyle = "#2c2e2b";
  g.lineWidth = 4;
  for (let y = 0; y <= 512; y += 64) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(1024, y);
    g.stroke();
  }
  for (let x = 0; x <= 1024; x += 140) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 512);
    g.stroke();
  }
  function letra(x, y, tinta, linha) {
    g.fillStyle = tinta;
    g.beginPath();
    g.moveTo(x, y + 90);
    g.quadraticCurveTo(x + 16, y, x + 78, y + 8);
    g.quadraticCurveTo(x + 138, y - 16, x + 146, y + 78);
    g.quadraticCurveTo(x + 156, y + 168, x + 74, y + 150);
    g.quadraticCurveTo(x + 8, y + 162, x, y + 90);
    g.fill();
    g.strokeStyle = linha;
    g.lineWidth = 10;
    g.stroke();
    g.fillStyle = linha;
    g.fillRect(x + 64, y + 148, 9, 42);
  }
  letra(70, 150, "#c4483a", "#140e0c");
  letra(250, 128, "#e0a23a", "#140e0c");
  letra(440, 156, "#2f6f8f", "#0c1216");
  letra(630, 136, "#d8d2c6", "#140e0c");
  g.strokeStyle = "#8e2e2a";
  g.lineWidth = 16;
  g.beginPath();
  g.moveTo(60, 360);
  g.quadraticCurveTo(420, 312, 820, 372);
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function arena() {
  cena.add(new THREE.AmbientLight(0xd5dde8, 1.05));
  const lua = new THREE.DirectionalLight(0xe7eef8, 1.45);
  lua.position.set(-4, 8, 2);
  lua.castShadow = true;
  lua.shadow.mapSize.set(1024, 1024);
  lua.shadow.camera.near = 0.5;
  lua.shadow.camera.far = 28;
  lua.shadow.camera.left = -8;
  lua.shadow.camera.right = 8;
  lua.shadow.camera.top = 8;
  lua.shadow.camera.bottom = -8;
  cena.add(lua);

  const chao = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshLambertMaterial({ map: texturaChao() }));
  chao.rotation.x = -Math.PI / 2;
  chao.userData.peca = "chao";
  chao.receiveShadow = true;
  chao.castShadow = false;
  cena.add(chao);
  [-4.2, 4.2].forEach((z) => {
    const meio = new THREE.Mesh(new THREE.BoxGeometry(14, 0.16, 0.28), cor("#7a7468", 0.86));
    meio.position.set(0, 0.08, z);
    meio.userData.peca = "chao";
    cena.add(meio);
    const calcada = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 2.4), cor("#514c45", 0.9));
    calcada.position.set(0, 0.05, z + Math.sign(z) * 1.3);
    calcada.userData.peca = "chao";
    cena.add(calcada);
  });

  const muro = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 2.8, 9),
    new THREE.MeshLambertMaterial({ map: texturaGrafite() })
  );
  muro.position.set(7.2, 1.4, 0);
  muro.userData.peca = "muro";
  cena.add(muro);

  const poste = new THREE.Group();
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 8), cor("#241e18"));
  haste.position.y = 2.1;
  haste.userData.peca = "poste";
  poste.add(haste);
  const bracoPoste = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.5), cor("#241e18"));
  bracoPoste.position.set(0, 4.1, 0.7);
  poste.add(bracoPoste);
  const cabecaPoste = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.72), cor("#3a342c"));
  cabecaPoste.position.set(0, 3.96, 1.35);
  poste.add(cabecaPoste);
  const lampada = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.42), new THREE.MeshBasicMaterial({ color: 0xf0c36a }));
  lampada.position.set(0, 3.86, 1.35);
  poste.add(lampada);
  poste.position.set(-0.6, 0, -3.8);
  cena.add(poste);
  const quente = new THREE.PointLight(0xf0b45a, 3.2, 16);
  quente.position.set(-0.6, 3.8, -2.4);
  cena.add(quente);

  for (let i = 0; i < 5; i += 1) {
    const alto = 1.4 + (i % 3) * 0.8;
    const casa = new THREE.Mesh(new THREE.BoxGeometry(0.9, alto, 1.3), cor(i % 2 ? "#2a3138" : "#3a332c"));
    casa.position.set(8.4, alto / 2, -3.2 + i * 1.6);
    cena.add(casa);
  }
}

function rua() {
  const n = { chao: 0, muro: 0, poste: 0 };
  let muroY = 0;
  let posteY = 0;
  cena.traverse((obj) => {
    const peca = obj.userData && obj.userData.peca;
    if (!peca || n[peca] === undefined) return;
    n[peca] += 1;
    if (peca === "muro") muroY = Math.max(muroY, obj.position.y);
    if (peca === "poste") posteY = Math.max(posteY, obj.position.y);
  });
  return { chao: n.chao, muro: n.muro, poste: n.poste, muroY, posteY };
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

function pesoDoAcerto(t, stun) {
  const dura = Math.max(0.28, stun || 0.34);
  const segura = dura * 0.62;
  if (t <= segura) return 1;
  return Math.max(0, 1 - (t - segura) / (dura - segura));
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
  if (s === "agarra" || s === "cola") {
    const k = s === "cola" ? 1 : u;
    rig.bracoL.ombro.rotation.x = -1.35 * k;
    rig.bracoR.ombro.rotation.x = -1.35 * k;
    rig.bracoL.ombro.rotation.z = 0.45 * k;
    rig.bracoR.ombro.rotation.z = -0.45 * k;
    rig.torso.rotation.x = 0.4 * k;
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
    const k = pesoDoAcerto(f.t, f.stun);
    rig.hips.position.y = 0.96 - 0.08 * k;
    rig.torso.rotation.x = 0.62 * k;
    rig.cabeca.rotation.x = 0.28 * k;
    rig.pernaL.joelho.rotation.x = 0.45 * k;
    rig.pernaR.joelho.rotation.x = 0.45 * k;
    rig.bracoL.ombro.rotation.set(-0.9 * k, 0, 0.55 * k);
    rig.bracoR.ombro.rotation.set(-0.9 * k, 0, -0.55 * k);
    rig.bracoL.cotovelo.rotation.x = 1.15 * k;
    rig.bracoR.cotovelo.rotation.x = 1.15 * k;
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
  const membro = f.estado === "chute" ? 0.7 : 0.5;
  const falta = dist - membro - 0.15;
  if (falta <= 0) return;
  const cabe = dist <= g.alcance + 0.55;
  const passo = (cabe ? Math.min(falta, 1.15) : Math.min(falta, 0.18)) * u;
  rig.g.position.x += (dx / dist) * passo;
  rig.g.position.z += (dz / dist) * passo;
}

function virarRosto(rig, f, outro) {
  if (!outro || !rig.cabeca) return;
  const dx = outro.x - f.x;
  const dz = outro.z - f.z;
  if (dx * dx + dz * dz < 0.04) return;
  let diff = Math.atan2(dx, dz) - f.yaw - (rig.torso ? rig.torso.rotation.y : 0);
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const giro = Math.max(-1.05, Math.min(1.05, diff));
  if (rig.gente) {
    rig.cabeca.rotateY(giro);
    const frente = new THREE.Vector3(Math.sin(f.yaw + giro), 0, Math.cos(f.yaw + giro));
    const base = new THREE.Vector3();
    rig.cabeca.getWorldPosition(base);
    base.addScaledVector(frente, 0.22);
    rig.nariz.parent.worldToLocal(base);
    rig.nariz.position.copy(base);
    return;
  }
  rig.cabeca.rotation.y = giro;
}

function colocar(rig, f, outro, agora) {
  rig.g.position.set(f.x, 0, f.z);
  rig.g.rotation.y = f.yaw;
  if (rig.gente) {
    animar(rig, f);
    if (f.estado === "queda" || f.estado === "ko") {
      let baixo = Infinity;
      rig.corpo.traverse((obj) => {
        if (!ossoDeCorpo(obj)) return;
        const p = new THREE.Vector3();
        obj.getWorldPosition(p);
        if (p.y < baixo) baixo = p.y;
      });
      if (baixo < 0.12) rig.g.position.y += 0.12 - baixo;
    }
    avancar(rig, f, outro);
    virarRosto(rig, f, outro);
    if (rig.flash > 0) {
      pintar(rig, true);
      rig.flash = Math.max(0, rig.flash - 0.016);
      if (rig.flash === 0) pintar(rig, false);
    }
    return;
  }
  posar(rig, f, agora);
  virarRosto(rig, f, outro);
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
  if (!audio) garantirSom();
  if (!audio) return false;
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
  return true;
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

const poeira = [];
let sonsNoAcerto = 0;
let graosNoAcerto = 0;

function estalo(tipo, ponto) {
  const tocou = tocar(tipo);
  const acerto = tipo === "acerto" || tipo === "combo" || tipo === "contra";
  if (!acerto || !ponto || !tocou) return { sons: sonsNoAcerto, graos: graosNoAcerto, vivos: poeira.length };
  sonsNoAcerto += 1;
  const n = 12;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  const vel = [];
  for (let i = 0; i < n; i += 1) {
    pos[i * 3] = ponto.x;
    pos[i * 3 + 1] = 0.12;
    pos[i * 3 + 2] = ponto.z;
    vel.push({
      x: (Math.random() - 0.5) * 1.8,
      y: 0.35 + Math.random() * 1.1,
      z: (Math.random() - 0.5) * 1.8
    });
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0x9a9186,
    size: 0.09,
    transparent: true,
    opacity: 0.9,
    depthWrite: false
  }));
  pts.userData.vida = 0.32;
  pts.userData.vel = vel;
  cena.add(pts);
  poeira.push(pts);
  graosNoAcerto += n;
  return { sons: sonsNoAcerto, graos: graosNoAcerto, vivos: poeira.length };
}

function andarPoeira(dt) {
  for (let i = poeira.length - 1; i >= 0; i -= 1) {
    const pts = poeira[i];
    pts.userData.vida -= dt;
    const pos = pts.geometry.attributes.position;
    pts.userData.vel.forEach((v, k) => {
      v.y -= 3 * dt;
      pos.setXYZ(k, pos.getX(k) + v.x * dt, pos.getY(k) + v.y * dt, pos.getZ(k) + v.z * dt);
    });
    pos.needsUpdate = true;
    pts.material.opacity = Math.max(0, pts.userData.vida / 0.32);
    if (pts.userData.vida > 0) continue;
    cena.remove(pts);
    pts.geometry.dispose();
    pts.material.dispose();
    poeira.splice(i, 1);
  }
}

function impacto() {
  return { sons: sonsNoAcerto, graos: graosNoAcerto, vivos: poeira.length };
}

function quadro() {
  requestAnimationFrame(quadro);
  const dt = Math.min(0.05, relogio.getDelta() || 0.016);
  passoDt = dt;
  const agora = relogio.elapsedTime;
  if (luta && luta.fase === "luta") {
    passo(luta, dt, lerEntrada());
    if (luta.ultimo && luta.ultimo !== ultimoSom) {
      ultimoSom = luta.ultimo;
      const corpo = luta.ultimo.alvo === luta.a.id ? luta.a : luta.b;
      estalo(luta.ultimo.tipo, { x: corpo.x, z: corpo.z });
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
  } else if (luta && (luta.fase === "vitoria" || luta.fase === "derrota" || luta.fase === "empate")) {
    assentar(luta, dt);
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
  andarPoeira(dt);
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
const loader = new GLTFLoader();
gltfKadu = await loader.loadAsync("./vendor/Rogue.glb");
gltfNilo = await loader.loadAsync("./vendor/Barbarian.glb");
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

function silhueta(quem) {
  const rig = quem === "b" ? rigB : rigA;
  const partes = {};
  let cilindro = 0;
  let esfera = 0;
  let skinned = 0;
  rig.g.traverse((obj) => {
    if (obj.isSkinnedMesh) skinned += 1;
    if (obj.userData && obj.userData.parte) partes[obj.userData.parte] = (partes[obj.userData.parte] || 0) + 1;
    if (!obj.geometry) return;
    if (obj.geometry.type === "CylinderGeometry") cilindro += 1;
    if (obj.geometry.type === "SphereGeometry") esfera += 1;
  });
  return { partes, cilindro, esfera, skinned };
}

function dobra(quem) {
  const rig = quem === "b" ? rigB : rigA;
  const f = luta ? (quem === "b" ? luta.b : luta.a) : null;
  if (rig.gente) {
    return {
      k: pesoDoAcerto(f ? f.t : 0, f ? f.stun : 0.52),
      clip: rig.acaoNome || "",
      gente: true
    };
  }
  return {
    k: pesoDoAcerto(f ? f.t : 0, f ? f.stun : 0.52),
    torso: rig.torso.rotation.x,
    joelho: rig.pernaR.joelho.rotation.x,
    hips: rig.hips.position.y,
    frente: rig.bracoL.ombro.rotation.x,
    braco: rig.bracoL.ombro.rotation.z
  };
}

function traje(quem) {
  const rig = quem === "b" ? rigB : rigA;
  const marcas = [];
  rig.g.traverse((obj) => {
    if (obj.userData && obj.userData.traje && !marcas.includes(obj.userData.traje)) marcas.push(obj.userData.traje);
  });
  return { marcas, careca: !!rig.careca, gente: !!rig.gente };
}

function rosto(quem) {
  const rig = quem === "b" ? rigB : rigA;
  const outro = luta ? (quem === "b" ? luta.a : luta.b) : null;
  const nariz = new THREE.Vector3();
  const nuca = new THREE.Vector3();
  rig.nariz.getWorldPosition(nariz);
  rig.cabeca.getWorldPosition(nuca);
  const dNariz = outro ? Math.hypot(nariz.x - outro.x, nariz.z - outro.z) : 0;
  const dCabeca = outro ? Math.hypot(nuca.x - outro.x, nuca.z - outro.z) : 0;
  return { dNariz, dCabeca, olha: dNariz < dCabeca - 0.02 };
}

function mao(quem) {
  const rig = quem === "b" ? rigB : rigA;
  return pontoDe(quem, rig.gente ? rig.mao : rig.bracoR.mao);
}

function pe(quem) {
  const rig = quem === "b" ? rigB : rigA;
  return pontoDe(quem, rig.gente ? rig.pe : rig.pernaR.pe);
}

function ossoDeCorpo(obj) {
  if (!obj.isBone || !obj.name) return false;
  if (/ik|control|slot/i.test(obj.name)) return false;
  return true;
}

function medida(quem) {
  const rig = quem === "b" ? rigB : rigA;
  const caixa = new THREE.Box3();
  if (rig.gente) {
    rig.corpo.traverse((obj) => {
      if (!ossoDeCorpo(obj)) return;
      const p = new THREE.Vector3();
      obj.getWorldPosition(p);
      caixa.expandByPoint(p);
    });
    caixa.expandByScalar(0.08);
  } else {
    caixa.setFromObject(rig.g);
  }
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
  silhueta,
  dobra,
  traje,
  rosto,
  rua,
  estalo,
  impacto,
  escolher(id) { escolhido = id; marcarCarta(); }
};
