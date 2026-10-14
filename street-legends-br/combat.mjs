export const ELENCO = [
  {
    id: "kadu",
    nome: "Kadu Laje",
    estilo: "Mão rápida",
    especial: "rajada",
    pele: "#c48a62",
    roupa: "#5c6b3a",
    calca: "#243044",
    tenis: "#d7d2c8",
    cabelo: "#2a211c",
    jaqueta: true,
    ajuste: { soco: 1.12, chute: 1, agarra: 1, rajada: 1, ombro: 1, velocidade: 1.06 }
  },
  {
    id: "nilo",
    nome: "Nilo Brasa",
    estilo: "Corpo",
    especial: "ombro",
    pele: "#a86b45",
    roupa: "#8e2e2a",
    calca: "#1b1b22",
    tenis: "#c8c2b4",
    cabelo: "#1a1412",
    careca: true,
    regata: true,
    ajuste: { soco: 1, chute: 1.16, agarra: 1.08, rajada: 1, ombro: 1.2, velocidade: 0.98 }
  }
];

export const GOLPES = {
  soco: { startup: 0.1, active: 0.08, recovery: 0.2, alcance: 1.25, raio: 0.42, dano: 9, empurra: 0.42, stun: 0.34 },
  chute: { startup: 0.16, active: 0.1, recovery: 0.28, alcance: 1.7, raio: 0.48, dano: 13, empurra: 0.72, stun: 0.4 },
  agarra: { startup: 0.12, active: 0.1, recovery: 0.36, alcance: 0.98, raio: 0.5, dano: 15, empurra: 1.45, stun: 0.5 },
  rajada: { startup: 0.05, active: 0.06, recovery: 0.14, pausa: 0.08, vezes: 3, alcance: 1.22, raio: 0.42, dano: 5, empurra: 0.14, stun: 0.28 },
  ombro: { startup: 0.14, active: 0.09, recovery: 0.3, alcance: 1.15, raio: 0.55, dano: 11, empurra: 1.4, stun: 0.42 }
};

const CORPO = 0.45;
const ARENA = 6.3;
const SEPARACAO = 1.32;

export function vazio() {
  return { x: 0, z: 0, soco: false, chute: false, guarda: false, esquiva: false, agarra: false, especial: false };
}

export function mulberry32(semente) {
  let a = semente >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ficha(id) {
  return ELENCO.find((f) => f.id === id) || ELENCO[0];
}

function criarLutador(dados, x, z) {
  return {
    id: dados.id,
    nome: dados.nome,
    estilo: dados.estilo,
    especial: dados.especial,
    ajuste: dados.ajuste,
    ia: false,
    x,
    z,
    yaw: 0,
    hp: 100,
    estado: "idle",
    t: 0,
    stun: 0,
    iframe: 0,
    conectou: false,
    toques: 0,
    combo: 0,
    recuo: 0,
    noMuro: false,
    noChao: false,
    lado: 1,
    andando: false,
    fecha: false,
    segura: false,
    seguro: false,
    buffer: "",
    bufferT: 0
  };
}

export function criarLuta(idJogador, semente = 1) {
  const jogador = ficha(idJogador);
  const rival = ELENCO.find((f) => f.id !== jogador.id) || ELENCO[1];
  const a = criarLutador(jogador, -2.2, 0);
  const b = criarLutador(rival, 2.2, 0);
  b.ia = true;
  a.yaw = Math.atan2(b.x - a.x, b.z - a.z);
  b.yaw = Math.atan2(a.x - b.x, a.z - b.z);
  return {
    a,
    b,
    tempo: 60,
    fase: "luta",
    rng: mulberry32(semente),
    ultimo: null,
    aviso: "",
    avisoT: 0,
    vencedor: "",
    cola: null,
    trava: 0
  };
}

export function danoDe(tipo, atacante, extra) {
  const base = GOLPES[tipo].dano * (atacante.ajuste[tipo] || 1);
  let dano = base;
  if (extra.contra) dano *= 1.35;
  if (extra.combo > 1) dano *= 1 + 0.12 * (extra.combo - 1);
  return Math.max(1, Math.round(dano));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function virar(f, outro) {
  const dx = outro.x - f.x;
  const dz = outro.z - f.z;
  if (dx * dx + dz * dz < 0.0001) return;
  f.yaw = Math.atan2(dx, dz);
}

function ocupado(f) {
  return f.estado === "hit" || f.estado === "queda" || f.estado === "levanta" || f.estado === "ko" || f.estado === "esquiva";
}

function emGolpe(f) {
  return !!GOLPES[f.estado];
}

function podeComecar(f) {
  if (f.estado === "cola") return !!f.segura;
  if (f.fecha && emGolpe(f)) return false;
  if (f.estado === "idle" || f.estado === "walk" || f.estado === "guarda") return true;
  if (!emGolpe(f) || !f.conectou) return false;
  const g = GOLPES[f.estado];
  if (g.vezes > 1) {
    const ciclo = g.startup + g.active + (g.pausa || 0);
    return f.t >= (g.vezes - 1) * ciclo + g.startup + g.active;
  }
  return f.t >= g.startup + g.active;
}

function movendo(entrada) {
  return Math.hypot(entrada.x, entrada.z) > 0.12;
}

function duracaoGolpe(g) {
  if (g.vezes > 1) {
    const ciclo = g.startup + g.active + (g.pausa || 0);
    return (g.vezes - 1) * ciclo + g.startup + g.active + g.recovery;
  }
  return g.startup + g.active + g.recovery;
}

function comecar(f, estado, entrada) {
  f.estado = estado;
  f.t = 0;
  f.conectou = false;
  f.toques = 0;
  f.noMuro = false;
  if (estado === "esquiva") {
    f.iframe = 0.2;
    const dirX = Math.cos(f.yaw);
    const dirZ = -Math.sin(f.yaw);
    let lado = entrada.x * dirX + entrada.z * dirZ;
    if (Math.abs(lado) < 0.2) lado = 1;
    f.lado = lado >= 0 ? 1 : -1;
  }
}

function comando(f, entrada) {
  if (entrada.esquiva) return "esquiva";
  if (entrada.agarra) return "agarra";
  if (entrada.especial) return f.especial;
  if (entrada.chute) return "chute";
  if (entrada.soco) return "soco";
  return "";
}

function mover(f, entrada, dt) {
  const mag = Math.hypot(entrada.x, entrada.z);
  f.andando = mag > 0.12;
  if (!f.andando) return;
  const sp = 3.5 * f.ajuste.velocidade * (f.estado === "guarda" ? 0.42 : 1);
  f.x += (entrada.x / mag) * sp * dt;
  f.z += (entrada.z / mag) * sp * dt;
}

function atualizar(f, entrada, outro, dt) {
  f.iframe = Math.max(0, f.iframe - dt);
  f.recuo = Math.max(0, f.recuo - dt);
  const pedido = comando(f, entrada);
  if (pedido && !podeComecar(f)) {
    f.buffer = pedido;
    f.bufferT = 0.16;
  } else {
    f.bufferT = Math.max(0, (f.bufferT || 0) - dt);
  }
  virar(f, outro);
  if (f.estado === "ko") return;
  if (podeComecar(f)) {
    const novo = comando(f, entrada) || (f.bufferT > 0 ? f.buffer : "");
    if (novo) {
      f.buffer = "";
      f.bufferT = 0;
      comecar(f, novo, entrada);
    } else if (f.estado === "cola") {
      /* fica grudado até o golpe seguinte */
    } else if (f.estado === "guarda") {
      if (!entrada.guarda) f.estado = movendo(entrada) ? "walk" : "idle";
    } else if (!ocupado(f) && !emGolpe(f)) {
      if (entrada.guarda) f.estado = "guarda";
      else f.estado = movendo(entrada) ? "walk" : "idle";
    }
  }
  if (f.estado === "idle" || f.estado === "walk" || f.estado === "guarda") {
    mover(f, entrada, dt);
    if (f.estado !== "guarda") f.estado = f.andando ? "walk" : "idle";
    return;
  }
  if (f.estado === "cola") return;
  if (f.estado === "esquiva") {
    const dirX = Math.cos(f.yaw);
    const dirZ = -Math.sin(f.yaw);
    const sp = 5.4 * f.ajuste.velocidade;
    f.x += dirX * f.lado * sp * dt;
    f.z += dirZ * f.lado * sp * dt;
    f.t += dt;
    if (f.t >= 0.36) {
      f.estado = "idle";
      f.t = 0;
      f.iframe = 0;
    }
    return;
  }
  if (emGolpe(f)) {
    f.t += dt;
    const g = GOLPES[f.estado];
    if (f.t >= duracaoGolpe(g)) {
      f.estado = "idle";
      f.t = 0;
      f.conectou = false;
      f.toques = 0;
      f.combo = 0;
      f.fecha = false;
      if (f.ia) f.recuo = 0.32;
    }
    return;
  }
  if (f.estado === "hit") {
    f.t += dt;
    if (f.t >= f.stun) {
      f.estado = "idle";
      f.t = 0;
      f.noMuro = false;
    }
    return;
  }
  if (f.estado === "queda") {
    f.t += dt;
    if (f.t >= 0.9) {
      f.estado = "levanta";
      f.t = 0;
    }
    return;
  }
  if (f.estado === "levanta") {
    f.t += dt;
    if (f.t >= 0.45) {
      f.estado = "idle";
      f.t = 0;
      f.noMuro = false;
    }
  }
}

function emAtivo(f) {
  const g = GOLPES[f.estado];
  if (!g) return null;
  if (g.vezes > 1) {
    const ciclo = g.startup + g.active + (g.pausa || 0);
    const i = Math.floor(f.t / ciclo);
    if (i >= g.vezes || f.toques > i) return null;
    const local = f.t - i * ciclo;
    if (local < g.startup || local >= g.startup + g.active) return null;
    return g;
  }
  if (f.conectou) return null;
  if (f.t < g.startup || f.t >= g.startup + g.active) return null;
  return g;
}

function naFrente(defensor, atacante) {
  const dx = atacante.x - defensor.x;
  const dz = atacante.z - defensor.z;
  const fx = Math.sin(defensor.yaw);
  const fz = Math.cos(defensor.yaw);
  return dx * fx + dz * fz > 0.15;
}

function emRecuperacao(f) {
  const g = GOLPES[f.estado];
  if (!g || f.conectou) return false;
  if (g.vezes > 1) {
    const ciclo = g.startup + g.active + (g.pausa || 0);
    return f.t >= (g.vezes - 1) * ciclo + g.startup + g.active;
  }
  return f.t >= g.startup + g.active;
}

function avisar(luta, texto) {
  luta.aviso = texto;
  luta.avisoT = 0.85;
}

function aplicarAcerto(atacante, alvo, tipo, g, luta) {
  const ponto = {
    x: atacante.x + Math.sin(atacante.yaw) * g.alcance * 0.82,
    z: atacante.z + Math.cos(atacante.yaw) * g.alcance * 0.82
  };
  const d = Math.hypot(ponto.x - alvo.x, ponto.z - alvo.z);
  if (d > g.raio + CORPO) return;
  if (g.vezes > 1) {
    const ciclo = g.startup + g.active + (g.pausa || 0);
    const i = Math.min(g.vezes - 1, Math.floor(atacante.t / ciclo));
    atacante.toques = i + 1;
    atacante.conectou = atacante.toques >= g.vezes;
  } else {
    atacante.conectou = true;
  }
  if (alvo.iframe > 0) {
    luta.ultimo = { tipo: "esquiva", quem: atacante.id, alvo: alvo.id, dano: 0 };
    avisar(luta, alvo.nome + " sai.");
    return;
  }
  if (alvo.estado === "guarda" && naFrente(alvo, atacante) && !atacante.segura) {
    const chip = Math.max(1, Math.round(danoDe(tipo, atacante, { contra: false, combo: 1 }) * 0.2));
    alvo.hp = Math.max(0, alvo.hp - chip);
    const dx = alvo.x - atacante.x;
    const dz = alvo.z - atacante.z;
    const len = Math.hypot(dx, dz) || 1;
    alvo.x += (dx / len) * g.empurra * 0.22;
    alvo.z += (dz / len) * g.empurra * 0.22;
    luta.ultimo = { tipo: "guarda", quem: atacante.id, alvo: alvo.id, dano: chip };
    avisar(luta, alvo.nome + " segura.");
    return;
  }
  if (tipo === "agarra") {
    luta.cola = atacante.id;
    atacante.segura = true;
    atacante.estado = "cola";
    atacante.t = 0;
    atacante.recuo = 0.45;
    alvo.seguro = true;
    alvo.estado = "cola";
    alvo.t = 0;
    alvo.conectou = false;
    luta.ultimo = { tipo: "agarra", quem: atacante.id, alvo: alvo.id, dano: 0 };
    avisar(luta, atacante.nome + " agarra.");
    return;
  }
  const solta = !!(atacante.segura && (alvo.seguro || alvo.estado === "cola"));
  const contra = emRecuperacao(alvo);
  const combo = alvo.estado === "hit" ? atacante.combo + 1 : 1;
  atacante.combo = combo;
  const dano = danoDe(tipo, atacante, { contra, combo });
  alvo.hp = Math.max(0, alvo.hp - dano);
  if (combo >= 3) atacante.fecha = true;
  const dx = alvo.x - atacante.x;
  const dz = alvo.z - atacante.z;
  const len = Math.hypot(dx, dz) || 1;
  const empurra = g.empurra + (solta ? 1.15 : 0);
  alvo.x += (dx / len) * empurra;
  alvo.z += (dz / len) * empurra;
  if (solta) {
    atacante.segura = false;
    alvo.seguro = false;
    luta.cola = null;
  }
  const derruba = alvo.hp <= 0 || solta || tipo === "ombro" || (tipo === "chute" && combo >= 2);
  if (alvo.hp <= 0) {
    alvo.estado = "ko";
    alvo.t = 0;
  } else if (derruba) {
    alvo.estado = "queda";
    alvo.t = 0;
    alvo.stun = 0.9;
  } else {
    alvo.estado = "hit";
    alvo.t = 0;
    alvo.stun = Math.max(g.stun, 0.52);
    alvo.conectou = false;
  }
  alvo.noMuro = false;
  let texto = solta || tipo === "ombro" ? atacante.nome + " empurra." : contra ? "Contra." : combo > 1 ? "Combo " + combo + "." : atacante.nome + " acerta.";
  luta.ultimo = { tipo: contra ? "contra" : combo > 1 ? "combo" : "acerto", quem: atacante.id, alvo: alvo.id, dano };
  if (dano > 0) luta.trava = Math.max(luta.trava || 0, solta ? 0.08 : 0.055);
  avisar(luta, texto);
}

function limitar(f, luta) {
  let bateu = false;
  if (f.x > ARENA) { f.x = ARENA; bateu = true; }
  if (f.x < -ARENA) { f.x = -ARENA; bateu = true; }
  if (f.z > ARENA) { f.z = ARENA; bateu = true; }
  if (f.z < -ARENA) { f.z = -ARENA; bateu = true; }
  if (!bateu || f.noMuro) return;
  if (f.estado !== "hit" && f.estado !== "queda") return;
  f.noMuro = true;
  f.hp = Math.max(0, f.hp - 4);
  f.stun += 0.15;
  luta.ultimo = { tipo: "muro", quem: f.id, alvo: f.id, dano: 4 };
  avisar(luta, f.nome + " no muro.");
}

function grudar(a, b) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const d = Math.hypot(dx, dz) || 1;
  const nx = dx / d;
  const nz = dz / d;
  const meioX = (a.x + b.x) / 2;
  const meioZ = (a.z + b.z) / 2;
  const aperto = 0.36;
  a.x = meioX - nx * aperto;
  a.z = meioZ - nz * aperto;
  b.x = meioX + nx * aperto;
  b.z = meioZ + nz * aperto;
}

function separar(a, b) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const d = Math.hypot(dx, dz);
  if (d >= SEPARACAO) return;
  const empurra = (SEPARACAO - d) / 2;
  const len = d || 1;
  const nx = d ? dx / len : 1;
  const nz = d ? dz / len : 0;
  a.x -= nx * empurra;
  a.z -= nz * empurra;
  b.x += nx * empurra;
  b.z += nz * empurra;
}

function encerrar(luta) {
  if (luta.a.hp <= 0 && luta.b.hp <= 0) {
    luta.fase = "empate";
    luta.vencedor = "";
    return;
  }
  if (luta.b.hp <= 0) {
    luta.fase = "vitoria";
    luta.vencedor = luta.a.nome;
    luta.b.estado = "ko";
    return;
  }
  if (luta.a.hp <= 0) {
    luta.fase = "derrota";
    luta.vencedor = luta.b.nome;
    luta.a.estado = "ko";
    return;
  }
  if (luta.tempo > 0) return;
  if (luta.a.hp === luta.b.hp) {
    luta.fase = "empate";
    luta.vencedor = "";
    return;
  }
  if (luta.a.hp > luta.b.hp) {
    luta.fase = "vitoria";
    luta.vencedor = luta.a.nome;
    deitar(luta.b);
  } else {
    luta.fase = "derrota";
    luta.vencedor = luta.b.nome;
    deitar(luta.a);
  }
}

function deitar(f) {
  f.noChao = true;
  if (f.estado === "ko" || f.estado === "queda") return;
  f.estado = "ko";
  f.t = 0;
}

export function pensar(eu, outro, luta) {
  const e = vazio();
  if (eu.seguro || (eu.estado === "cola" && !eu.segura)) return e;
  if (eu.segura) {
    if (eu.recuo <= 0) e.soco = true;
    return e;
  }
  const dx = outro.x - eu.x;
  const dz = outro.z - eu.z;
  const d = Math.hypot(dx, dz) || 1;
  const golpe = GOLPES[outro.estado];
  const ameaca = !!golpe && outro.t < golpe.startup + golpe.active && d < 2.35;
  if (ameaca && eu.recuo <= 0 && (eu.estado === "idle" || eu.estado === "walk" || eu.estado === "guarda")) {
    const r = luta.rng();
    if (r < 0.62) {
      e.guarda = true;
      return e;
    }
    if (r < 0.84) {
      e.esquiva = true;
      e.x = -dz / d;
      e.z = dx / d;
      return e;
    }
  }
  if (d > 1.72) {
    e.x = dx / d;
    e.z = dz / d;
    return e;
  }
  if (eu.recuo > 0) {
    if (ameaca) e.guarda = true;
    return e;
  }
  const r = luta.rng();
  if (d < 1.02 && r < 0.38) {
    e.agarra = true;
    return e;
  }
  if (r < 0.22) e.especial = true;
  else if (r < 0.62) e.soco = true;
  else e.chute = true;
  return e;
}

export function passo(luta, dt, entradaA, entradaB) {
  if (!luta || luta.fase !== "luta") return luta;
  const dtOk = Math.max(0, Math.min(0.05, dt));
  luta.ultimo = null;
  if (luta.avisoT > 0) luta.avisoT = Math.max(0, luta.avisoT - dtOk);
  if ((luta.trava || 0) > 0) {
    luta.trava = Math.max(0, luta.trava - dtOk);
    const pedido = comando(luta.a, entradaA || vazio());
    if (pedido) {
      luta.a.buffer = pedido;
      luta.a.bufferT = 0.16;
    }
    return luta;
  }
  luta.tempo = Math.max(0, luta.tempo - dtOk);
  const ea = entradaA || vazio();
  const eb = entradaB === undefined ? pensar(luta.b, luta.a, luta) : entradaB;
  atualizar(luta.a, ea, luta.b, dtOk);
  atualizar(luta.b, eb, luta.a, dtOk);
  const tipoA = luta.a.estado;
  const tipoB = luta.b.estado;
  const ga = emAtivo(luta.a);
  const gb = emAtivo(luta.b);
  if (ga) aplicarAcerto(luta.a, luta.b, tipoA, ga, luta);
  if (gb) aplicarAcerto(luta.b, luta.a, tipoB, gb, luta);
  if (luta.b.hp <= 0 && luta.b.estado !== "ko") luta.b.estado = "ko";
  if (luta.a.hp <= 0 && luta.a.estado !== "ko") luta.a.estado = "ko";
  if (luta.cola) grudar(luta.a, luta.b);
  else separar(luta.a, luta.b);
  limitar(luta.a, luta);
  limitar(luta.b, luta);
  encerrar(luta);
  return luta;
}

export function assentar(luta, dt) {
  if (!luta || luta.fase === "luta") return luta;
  const dtOk = Math.max(0, Math.min(0.05, dt || 0));
  for (const f of [luta.a, luta.b]) {
    if (f.hp > 0 && !f.noChao) {
      if (f.estado !== "idle" && f.estado !== "walk") {
        f.estado = "idle";
        f.t = 0;
      }
      continue;
    }
    if (f.estado !== "ko" && f.estado !== "queda") {
      f.estado = "ko";
      f.t = 0;
    }
    f.t = Math.min(1, f.t + dtOk);
  }
  return luta;
}

