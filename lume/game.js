(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document !== "undefined") pagina(api);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var CONFIG = {
    mundo: 1600,
    centro: 800,
    raioCais: 530,
    torreX: 800,
    torreY: 455,
    torreRaio: 118,
    partida: 180
  };

  var FASES = [
    { id: "vigilia", nome: "Vigília", tipo: "tempo", limite: 180, texto: "Aguente três minutos até o farol reacender.", icone: "art/faroleiro.png" },
    { id: "travessia", nome: "Travessia", tipo: "chegar", limite: 75, texto: "Acenda os três marcos do cais.", icone: "art/marco.png", marcos: [{ x: 1090, y: 1170 }, { x: 500, y: 1100 }, { x: 520, y: 560 }] },
    { id: "caca", nome: "Caça", tipo: "abater", limite: 110, meta: 100, texto: "Apague cem da maré.", icone: "art/caranguejo.png" },
    { id: "vaga", nome: "Vaga-mãe", tipo: "chefe", limite: 150, texto: "Derrube a vaga-mãe.", icone: "art/vaga.png" }
  ];

  var MOLDE = {
    caranguejo: { hp: 18, vel: 60, dano: 11, raio: 18, xp: 1, desenho: 58 },
    gaivota: { hp: 12, vel: 88, dano: 8, raio: 15, xp: 1, desenho: 54 },
    onda: { hp: 42, vel: 42, dano: 14, raio: 24, xp: 2, desenho: 76 },
    vaga: { hp: 1800, vel: 74, dano: 20, raio: 54, xp: 12, desenho: 176 }
  };

  var CARTAS = {
    fagulha: { nome: "Fagulha", max: 5, icone: "art/fagulha.png", textos: [
      "Mais uma faísca.",
      "A faísca queima mais.",
      "Mais uma faísca.",
      "As faíscas saem mais rápido e mais fortes."
    ]},
    coroa: { nome: "Coroa", max: 5, icone: "art/coroa.png", textos: [
      "Duas luzes passam a girar em volta.",
      "Entra mais uma luz.",
      "As luzes afastam e doem mais.",
      "A coroa fica mais forte.",
      "Seis luzes fecham a coroa."
    ]},
    pulso: { nome: "Pulso", max: 5, icone: "art/coroa.png", textos: [
      "A lanterna solta um anel de luz.",
      "O anel sai mais vezes e maior.",
      "O anel fica mais forte.",
      "O pulso encurta e alarga.",
      "O anel quase toma o cais."
    ]},
    ima: { nome: "Ímã", max: 4, icone: "art/brasa.png", textos: [
      "As brasas vêm de mais longe.",
      "O alcance do ímã cresce.",
      "Quase toda brasa atravessa o cais.",
      "A brasa não fica no chão."
    ]},
    passo: { nome: "Passo", max: 4, icone: "art/faroleiro.png", textos: [
      "O faroleiro anda mais rápido.",
      "O passo abre.",
      "Dá para cortar a maré.",
      "Passo de quem conhece o cais."
    ]},
    vidro: { nome: "Vidro", max: 4, icone: "art/faroleiro.png", textos: [
      "Aguenta mais e recupera um pouco.",
      "Mais fôlego e um descanso.",
      "A maré precisa insistir.",
      "O vidro do farol segura."
    ]},
    pavio: { nome: "Pavio", max: 4, icone: "art/fagulha.png", textos: [
      "A lanterna trabalha mais rápido.",
      "Menos espera entre os golpes.",
      "A luz não descansa.",
      "O pavio fica curto."
    ]},
    bruma: { nome: "Bruma", max: 4, icone: "art/onda.png", textos: [
      "A névoa corta um pouco o golpe.",
      "A maré dói menos.",
      "O casaco bebe o impacto.",
      "A bruma fica grossa."
    ]},
    brasa: { nome: "Brasa", max: 99, icone: "art/brasa.png", textos: [
      "Recupera uma parte da vida."
    ]},
    labareda: { nome: "Labareda", max: 1, icone: "art/fagulha.png", textos: [
      "A fagulha evolui: mais larga, mais forte, atravessa a maré."
    ]},
    aureola: { nome: "Auréola", max: 1, icone: "art/coroa.png", textos: [
      "A coroa evolui numa auréola larga."
    ]},
    clarao: { nome: "Clarão", max: 1, icone: "art/coroa.png", textos: [
      "O pulso evolui num clarão curto e enorme."
    ]}
  };

  function mulberry32(a) {
    a = a >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function custo(nivel) {
    return 5 + nivel * 3;
  }

  function dist(ax, ay, bx, by) {
    var dx = ax - bx;
    var dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function criar(seed) {
    return {
      seed: seed || 1,
      rng: mulberry32(seed || 1),
      fase: "titulo",
      t: 0,
      xp: 0,
      nivel: 1,
      need: custo(1),
      ranks: { fagulha: 1, coroa: 0, pulso: 0, ima: 0, passo: 0, vidro: 0, pavio: 0, bruma: 0 },
      jogador: {
        x: 800, y: 860, hp: 100, hpMax: 100, raio: 16, ang: -Math.PI / 2,
        vx: 0, vy: 0, feridoAte: 0, flash: 0, marSom: 0
      },
      inimigos: [],
      corpos: [],
      tiros: [],
      brasas: [],
      pocos: [],
      motes: [],
      giro: 0,
      nasce: 0.6,
      tiroEm: 0.15,
      pulsoEm: 0.8,
      pulsoVis: 0,
      pulsoRaio: 0,
      vaga: false,
      chefeMorta: false,
      abates: 0,
      modo: "tempo",
      limite: 180,
      meta: 0,
      nomeFase: "Vigília",
      faseId: "vigilia",
      marco: null,
      marcos: [],
      marcoI: 0,
      pressao: 1,
      chefeHp: 0,
      ondaChefe: 120,
      pontos: 0,
      farol: 0,
      evo: { labareda: false, aureola: false, clarao: false },
      shake: 0,
      aviso: "",
      avisoAte: 0,
      oferta: null,
      eventos: [],
      seq: 1
    };
  }

  var MARCO_A = { x: 1090, y: 1170 };
  var MARCO_B = { x: 500, y: 1100 };
  var MARCO_C = { x: 520, y: 560 };
  var MARCO_D = { x: 1120, y: 700 };

  var HISTORIA = [
    { id: "h1", nome: "Primeira luz", tipo: "tempo", limite: 75, pressao: 0.72, texto: "Aguente até o farol piscar.", icone: "art/faroleiro.png" },
    { id: "h2", nome: "Dois marcos", tipo: "chegar", limite: 70, pressao: 0.78, texto: "Acenda os dois marcos.", icone: "art/marco.png", marcos: [MARCO_A, MARCO_B] },
    { id: "h3", nome: "Maré curta", tipo: "tempo", limite: 120, pressao: 0.84, texto: "A noite aperta um pouco.", icone: "art/faroleiro.png" },
    { id: "h4", nome: "Caça rasa", tipo: "abater", limite: 80, meta: 40, pressao: 0.84, texto: "Apague quarenta da maré.", icone: "art/caranguejo.png" },
    { id: "h5", nome: "Três marcos", tipo: "chegar", limite: 90, pressao: 0.9, texto: "Acenda os três marcos.", icone: "art/marco.png", marcos: [MARCO_A, MARCO_B, MARCO_C] },
    { id: "h6", nome: "Caça funda", tipo: "abater", limite: 110, meta: 80, pressao: 0.94, texto: "Apague oitenta da maré.", icone: "art/caranguejo.png" },
    { id: "h7", nome: "Vigília longa", tipo: "tempo", limite: 180, pressao: 1, texto: "Aguente três minutos.", icone: "art/faroleiro.png" },
    { id: "h8", nome: "A vaga", tipo: "chefe", limite: 150, pressao: 1, chefeHp: 520, texto: "Derrube a vaga-mãe.", icone: "art/vaga.png" }
  ];

  var MODOS = [
    { id: "vigilia-1", grupo: "vigilia", nome: "Vigília I", tipo: "tempo", limite: 90, pressao: 0.78, texto: "Um minuto e meio.", icone: "art/faroleiro.png" },
    { id: "vigilia-2", grupo: "vigilia", nome: "Vigília II", tipo: "tempo", limite: 150, pressao: 0.9, texto: "Dois minutos e meio.", icone: "art/faroleiro.png" },
    { id: "vigilia-3", grupo: "vigilia", nome: "Vigília III", tipo: "tempo", limite: 180, pressao: 1, texto: "Três minutos.", icone: "art/faroleiro.png" },
    { id: "travessia-1", grupo: "travessia", nome: "Travessia I", tipo: "chegar", limite: 70, pressao: 0.8, texto: "Dois marcos.", icone: "art/marco.png", marcos: [MARCO_A, MARCO_B] },
    { id: "travessia-2", grupo: "travessia", nome: "Travessia II", tipo: "chegar", limite: 85, pressao: 0.92, texto: "Três marcos.", icone: "art/marco.png", marcos: [MARCO_A, MARCO_B, MARCO_C] },
    { id: "travessia-3", grupo: "travessia", nome: "Travessia III", tipo: "chegar", limite: 100, pressao: 1, texto: "Quatro marcos.", icone: "art/marco.png", marcos: [MARCO_A, MARCO_B, MARCO_C, MARCO_D] },
    { id: "caca-1", grupo: "caca", nome: "Caça I", tipo: "abater", limite: 80, meta: 40, pressao: 0.82, texto: "Quarenta da maré.", icone: "art/caranguejo.png" },
    { id: "caca-2", grupo: "caca", nome: "Caça II", tipo: "abater", limite: 100, meta: 70, pressao: 0.92, texto: "Setenta da maré.", icone: "art/caranguejo.png" },
    { id: "caca-3", grupo: "caca", nome: "Caça III", tipo: "abater", limite: 120, meta: 110, pressao: 1, texto: "Cento e dez da maré.", icone: "art/caranguejo.png" },
    { id: "vaga-1", grupo: "vaga", nome: "Vaga I", tipo: "chefe", limite: 140, pressao: 0.85, chefeHp: 340, texto: "Uma vaga menor.", icone: "art/vaga.png" },
    { id: "vaga-2", grupo: "vaga", nome: "Vaga II", tipo: "chefe", limite: 150, pressao: 1, chefeHp: 520, texto: "A vaga-mãe.", icone: "art/vaga.png" },
    { id: "vaga-3", grupo: "vaga", nome: "Vaga III", tipo: "chefe", limite: 170, pressao: 1.05, chefeHp: 760, texto: "A vaga mais funda.", icone: "art/vaga.png" }
  ];

  var INFINITO = { id: "infinito", nome: "Infinito", tipo: "infinito", limite: 0, pressao: 1, texto: "A maré não acaba.", icone: "art/onda.png" };

  function acharFase(qual) {
    var listas = [FASES, HISTORIA, MODOS, [INFINITO]];
    var a, i;
    if (!qual) return null;
    for (a = 0; a < listas.length; a++) {
      for (i = 0; i < listas[a].length; i++) {
        if (listas[a][i].id === qual) return listas[a][i];
      }
    }
    return null;
  }

  function iniciar(seed, qual, farol) {
    var s = criar(seed || 1);
    var item = acharFase(qual);
    s.farol = farol || 0;
    if (item) {
      s.modo = item.tipo;
      s.limite = item.limite;
      s.meta = item.meta || 0;
      s.nomeFase = item.nome;
      s.faseId = item.id;
      s.pressao = item.pressao || 1;
      s.chefeHp = item.chefeHp || 0;
      if (item.tipo === "chegar" && item.marcos) {
        s.marcos = item.marcos.map(function (m) { return { x: m.x, y: m.y }; });
        s.marcoI = 0;
        s.marco = s.marcos[0];
      }
    }
    s.fase = "jogando";
    return s;
  }

  function ganhou(s) {
    if (s.modo === "infinito") return false;
    if (s.modo === "chegar") return !s.marco && s.marcoI > 0;
    if (s.modo === "abater") return s.abates >= s.meta;
    if (s.modo === "chefe") return !!s.chefeMorta;
    return s.t >= (s.limite || CONFIG.partida);
  }

  function derivar(s) {
    var r = s.ranks;
    var f = r.fagulha;
    var c = r.coroa;
    var u = r.pulso;
    var bonus = 1 + (s.farol || 0) * 0.05;
    var lab = s.evo && s.evo.labareda;
    var aura = s.evo && s.evo.aureola;
    var clar = s.evo && s.evo.clarao;
    var nf = f >= 4 ? 3 : f >= 2 ? 2 : 1;
    var nm = [0, 2, 3, 4, 4, 6][c];
    var rm = [0, 74, 84, 96, 108, 122][c];
    var dm = [0, 9, 12, 15, 19, 24][c];
    var pc = [0, 3.2, 2.6, 2.15, 1.75, 1.4][u];
    var dp = [0, 22, 30, 40, 50, 62][u];
    var rp = [0, 110, 128, 148, 168, 192][u];
    if (lab) nf += 1;
    if (aura) {
      nm += 2;
      rm += 36;
      dm += 10;
    }
    if (clar) {
      pc *= 0.7;
      dp *= 1.45;
      rp *= 1.4;
    }
    return {
      fagulhas: nf,
      dmgFagulha: (f >= 5 ? 24 : f >= 3 ? 18 : 13) * (lab ? 1.5 : 1) * bonus,
      cadencia: (f >= 5 ? 0.46 : 0.6) * (lab ? 0.85 : 1),
      motes: nm,
      dmgMote: dm * bonus,
      raioMote: rm,
      pulsoCada: pc,
      dmgPulso: dp * bonus,
      raioPulso: rp,
      labareda: !!lab,
      velocidade: [158, 182, 208, 236, 268][r.passo],
      hpMax: [100, 130, 165, 200, 240][r.vidro] + (s.farol || 0) * 12,
      ima: [80, 125, 175, 240, 320][r.ima],
      frio: [1, 0.86, 0.74, 0.64, 0.55][r.pavio],
      pele: [1, 0.86, 0.74, 0.64, 0.55][r.bruma]
    };
  }

  function evento(s, nome) {
    if (s.eventos.indexOf(nome) === -1) s.eventos.push(nome);
  }

  function embaralhar(s, arr) {
    var i, j, tmp;
    for (i = arr.length - 1; i > 0; i--) {
      j = Math.floor(s.rng() * (i + 1));
      tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function cartaDe(s, id) {
    var item = CARTAS[id];
    var indice = id === "fagulha" ? s.ranks.fagulha - 1 : s.ranks[id] || 0;
    if (id === "brasa") indice = 0;
    return {
      id: id,
      nome: item.nome,
      texto: item.textos[indice] || item.textos[0],
      icone: item.icone
    };
  }

  function oferecer(s) {
    var ids = ["fagulha", "coroa", "pulso", "ima", "passo", "vidro", "pavio", "bruma"];
    var pool = [];
    var evos = [];
    var i;
    var cartas = [];
    for (i = 0; i < ids.length; i++) {
      if (s.ranks[ids[i]] < CARTAS[ids[i]].max) pool.push(ids[i]);
    }
    if (s.ranks.fagulha >= 5 && !s.evo.labareda) evos.push("labareda");
    if (s.ranks.coroa >= 5 && !s.evo.aureola) evos.push("aureola");
    if (s.ranks.pulso >= 5 && !s.evo.clarao) evos.push("clarao");
    embaralhar(s, pool);
    embaralhar(s, evos);
    if (evos.length) cartas.push(cartaDe(s, evos[0]));
    for (i = 0; i < pool.length && cartas.length < 3; i++) cartas.push(cartaDe(s, pool[i]));
    while (cartas.length < 3) cartas.push(cartaDe(s, "brasa"));
    return cartas;
  }

  function aplicar(s, id) {
    var st, antes;
    if (id === "brasa") {
      s.jogador.hp = Math.min(s.jogador.hpMax, s.jogador.hp + 26);
      return;
    }
    if (id === "labareda" || id === "aureola" || id === "clarao") {
      s.evo[id] = true;
      return;
    }
    if (!CARTAS[id] || s.ranks[id] >= CARTAS[id].max) return;
    antes = s.jogador.hpMax;
    s.ranks[id] += 1;
    st = derivar(s);
    s.jogador.hpMax = st.hpMax;
    if (st.hpMax > antes) s.jogador.hp += st.hpMax - antes;
    if (id === "vidro") s.jogador.hp = Math.min(s.jogador.hpMax, s.jogador.hp + 14);
    if (id === "pulso" && s.ranks.pulso === 1) s.pulsoEm = 0.4;
  }

  function escolher(s, indice) {
    var carta;
    if (!s || s.fase !== "carta" || !s.oferta || !s.oferta[indice]) return s;
    carta = s.oferta[indice];
    aplicar(s, carta.id);
    s.xp -= s.need;
    if (s.xp < 0) s.xp = 0;
    s.nivel += 1;
    s.need = custo(s.nivel);
    s.eventos = ["nivel"];
    if (s.xp >= s.need) {
      s.oferta = oferecer(s);
      s.fase = "carta";
    } else {
      s.oferta = null;
      s.fase = "jogando";
    }
    return s;
  }

  function intervalo(t) {
    if (t < 14) return 1.15;
    if (t < 36) return 0.78;
    if (t < 60) return 0.5;
    if (t < 100) return 0.34;
    if (t < 150) return 0.24;
    return 0.18;
  }

  function tipoDo(s) {
    var r = s.rng();
    if (s.t > 75) {
      if (r < 0.22) return "onda";
      if (r < 0.55) return "gaivota";
      return "caranguejo";
    }
    if (s.t > 40) return r < 0.38 ? "gaivota" : "caranguejo";
    return "caranguejo";
  }

  function nascer(s, tipo, forcar) {
    var molde = MOLDE[tipo];
    var ang, escala, e;
    if (!forcar && s.inimigos.length >= 66) return;
    ang = s.rng() * Math.PI * 2;
    escala = (1 + s.t / 100) * (s.pressao || 1);
    e = {
      id: s.seq++,
      tipo: tipo,
      x: CONFIG.centro + Math.cos(ang) * 690,
      y: CONFIG.centro + Math.sin(ang) * 690,
      hp: Math.round(molde.hp * (tipo === "vaga" ? 1 : escala)),
      hpMax: Math.round(molde.hp * (tipo === "vaga" ? 1 : escala)),
      vel: molde.vel,
      dano: molde.dano * (1 + s.t / 240),
      raio: molde.raio,
      xp: molde.xp,
      desenho: molde.desenho,
      flash: 0,
      moteEm: 0,
      ciclo: 1 + s.rng() * 1.4,
      impulso: 0,
      pocoEm: 1.2,
      ang: 0
    };
    if (tipo === "vaga" && s.modo === "chefe") {
      e.hp = s.chefeHp || 520;
      e.hpMax = e.hp;
      e.vel = 60;
    }
    if (tipo === "vaga" && s.modo === "tempo") {
      e.vel = 40;
      e.dano = 11;
      e.raio = 40;
    }
    if (tipo === "vaga" && s.modo === "infinito") {
      e.hp = Math.round(260 + s.t * 3.2);
      e.hpMax = e.hp;
      e.vel = 36;
      e.dano = 10;
      e.raio = 42;
    }
    s.inimigos.push(e);
  }

  function maisPerto(s) {
    var p = s.jogador;
    var melhor = null;
    var md = 1e9;
    var i, e, d;
    for (i = 0; i < s.inimigos.length; i++) {
      e = s.inimigos[i];
      d = dist(p.x, p.y, e.x, e.y);
      if (d < md) {
        md = d;
        melhor = e;
      }
    }
    return melhor;
  }

  function ferir(s, e, quanto) {
    e.hp -= quanto;
    e.flash = 0.08;
  }

  function soltar(s, e) {
    if (s.brasas.length >= 90) s.brasas.shift();
    s.brasas.push({ x: e.x, y: e.y, v: e.xp, raio: 8 });
    s.abates += 1;
    if (e.tipo === "vaga") {
      s.chefeMorta = true;
      if (s.modo === "infinito") {
        s.chefeMorta = false;
        s.vaga = false;
        s.ondaChefe = s.t + 80;
      }
    }
  }

  function empurraTorre(ent) {
    var dx = ent.x - CONFIG.torreX;
    var dy = ent.y - CONFIG.torreY;
    var d = Math.sqrt(dx * dx + dy * dy) || 0.001;
    var min = CONFIG.torreRaio + ent.raio;
    if (d < min) {
      ent.x = CONFIG.torreX + (dx / d) * min;
      ent.y = CONFIG.torreY + (dy / d) * min;
    }
  }

  function separar(lista) {
    var i, j, a, b, dx, dy, d, min, em;
    for (i = 0; i < lista.length; i++) {
      for (j = i + 1; j < lista.length; j++) {
        a = lista[i];
        b = lista[j];
        dx = a.x - b.x;
        dy = a.y - b.y;
        d = Math.sqrt(dx * dx + dy * dy);
        min = (a.raio + b.raio) * 0.82;
        if (d > 0 && d < min) {
          em = (min - d) / 2;
          dx /= d;
          dy /= d;
          a.x += dx * em;
          a.y += dy * em;
          b.x -= dx * em;
          b.y -= dy * em;
        }
      }
    }
  }

  function passo(s, dt, eixo) {
    var st, p, vel, noPoco, i, e, dx, dy, d, ang, n, k, a, x, y;
    if (!s || s.fase !== "jogando") return s;
    s.eventos = [];
    dt = Math.max(0, Math.min(0.05, dt || 0));
    if (!dt) return s;
    eixo = eixo || { x: 0, y: 0 };
    s.t += dt;
    st = derivar(s);
    p = s.jogador;
    p.hpMax = st.hpMax;
    if (p.hp > p.hpMax) p.hp = p.hpMax;
    if (p.flash > 0) p.flash -= dt;
    if (s.shake > 0) s.shake = Math.max(0, s.shake - dt * 22);
    if (s.pulsoVis > 0) s.pulsoVis -= dt;

    noPoco = false;
    for (i = s.pocos.length - 1; i >= 0; i--) {
      s.pocos[i].vida -= dt;
      if (s.pocos[i].vida <= 0) s.pocos.splice(i, 1);
      else if (dist(p.x, p.y, s.pocos[i].x, s.pocos[i].y) < s.pocos[i].raio + p.raio * 0.4) noPoco = true;
    }

    vel = st.velocidade * (noPoco ? 0.52 : 1);
    d = dist(p.x, p.y, CONFIG.centro, CONFIG.centro);
    if (d > CONFIG.raioCais) vel *= 0.4;
    var segue = 1 - Math.exp(-dt * 8);
    var alvoX = (eixo.x || 0) * vel;
    var alvoY = (eixo.y || 0) * vel;
    p.vx = (p.vx || 0) + (alvoX - (p.vx || 0)) * segue;
    p.vy = (p.vy || 0) + (alvoY - (p.vy || 0)) * segue;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (Math.sqrt(p.vx * p.vx + p.vy * p.vy) > 24) {
      var angAlvo = Math.atan2(p.vy, p.vx);
      var giroAng = angAlvo - p.ang;
      while (giroAng > Math.PI) giroAng -= Math.PI * 2;
      while (giroAng < -Math.PI) giroAng += Math.PI * 2;
      p.ang += giroAng * Math.min(1, dt * 10);
    }
    dx = p.x - CONFIG.centro;
    dy = p.y - CONFIG.centro;
    d = Math.sqrt(dx * dx + dy * dy);
    if (d > 760) {
      p.x = CONFIG.centro + (dx / d) * 760;
      p.y = CONFIG.centro + (dy / d) * 760;
    }
    empurraTorre(p);
    if (dist(p.x, p.y, CONFIG.centro, CONFIG.centro) > CONFIG.raioCais) {
      p.hp -= 14 * dt;
      if (s.t >= p.marSom) {
        evento(s, "dano");
        p.marSom = s.t + 0.5;
      }
    }

    if (s.modo === "infinito") s.pressao = 1 + s.t / 110;
    s.nasce -= dt;
    if (s.nasce <= 0) {
      var aperto = Math.max(0.5, Math.min(s.pressao || 1, 2.4));
      s.nasce = intervalo(s.t) / aperto;
      nascer(s, tipoDo(s), false);
    }
    if (s.modo === "infinito") {
      if (!s.vaga && s.t >= (s.ondaChefe || 120)) {
        s.vaga = true;
        nascer(s, "vaga", true);
        s.aviso = "A vaga sobe de novo";
        s.avisoAte = s.t + 2.4;
      }
    } else if (!s.vaga && s.t >= (s.modo === "chefe" ? 10 : 150) && s.modo !== "chegar" && s.modo !== "abater") {
      s.vaga = true;
      nascer(s, "vaga", true);
      s.aviso = "A vaga-mãe subiu";
      s.avisoAte = s.t + 3.2;
    }

    for (i = 0; i < s.inimigos.length; i++) {
      e = s.inimigos[i];
      dx = p.x - e.x;
      dy = p.y - e.y;
      d = Math.sqrt(dx * dx + dy * dy) || 1;
      vel = e.vel;
      if (e.tipo === "gaivota") {
        e.ciclo -= dt;
        if (e.ciclo <= 0) {
          e.ciclo = 2.15;
          e.impulso = 0.28;
        }
        if (e.impulso > 0) {
          e.impulso -= dt;
          vel *= 1.35;
        }
      }
      e.x += (dx / d) * vel * dt;
      e.y += (dy / d) * vel * dt;
      e.ang = Math.atan2(dy, dx);
      if (e.flash > 0) e.flash -= dt;
      empurraTorre(e);
      if (e.tipo === "onda") {
        e.pocoEm -= dt;
        if (e.pocoEm <= 0) {
          e.pocoEm = 2.6;
          if (s.pocos.length < 14) s.pocos.push({ x: e.x, y: e.y, raio: 36, vida: 8, desenho: 90 });
        }
      }
    }
    separar(s.inimigos);

    s.tiroEm -= dt;
    if (s.tiroEm <= 0) {
      e = maisPerto(s);
      if (!e) s.tiroEm = 0.08;
      else {
        s.tiroEm = st.cadencia * st.frio;
        ang = Math.atan2(e.y - p.y, e.x - p.x);
        n = st.fagulhas;
        for (k = 0; k < n; k++) {
          a = ang + (k - (n - 1) / 2) * 0.16;
          if (s.tiros.length < 48) {
            s.tiros.push({
              x: p.x, y: p.y,
              vx: Math.cos(a) * 390,
              vy: Math.sin(a) * 390,
              dano: st.dmgFagulha,
              vida: st.labareda ? 0.85 : 0.7,
              raio: st.labareda ? 13 : 8,
              largo: !!st.labareda,
              ja: {}
            });
          }
        }
        evento(s, "tiro");
        p.acertaAte = s.t + 0.2;
      }
    }

    for (i = s.tiros.length - 1; i >= 0; i--) {
      var tiro = s.tiros[i];
      tiro.x += tiro.vx * dt;
      tiro.y += tiro.vy * dt;
      tiro.vida -= dt;
      if (tiro.vida <= 0) {
        s.tiros.splice(i, 1);
        continue;
      }
      for (k = 0; k < s.inimigos.length; k++) {
        e = s.inimigos[k];
        if (tiro.ja[e.id]) continue;
        if (dist(tiro.x, tiro.y, e.x, e.y) < tiro.raio + e.raio) {
          tiro.ja[e.id] = 1;
          ferir(s, e, tiro.dano);
        }
      }
    }

    s.giro += dt * 1.7;
    s.motes = [];
    n = st.motes;
    for (k = 0; k < n; k++) {
      a = s.giro + (k * Math.PI * 2) / n;
      x = p.x + Math.cos(a) * st.raioMote;
      y = p.y + Math.sin(a) * st.raioMote;
      s.motes.push({ x: x, y: y });
      for (i = 0; i < s.inimigos.length; i++) {
        e = s.inimigos[i];
        if (s.t < e.moteEm) continue;
        if (dist(x, y, e.x, e.y) < 16 + e.raio) {
          e.moteEm = s.t + 0.26;
          ferir(s, e, st.dmgMote);
        }
      }
    }

    if (st.pulsoCada > 0) {
      s.pulsoEm -= dt;
      if (s.pulsoEm <= 0) {
        s.pulsoEm = st.pulsoCada * st.frio;
        s.pulsoVis = 0.26;
        s.pulsoRaio = st.raioPulso;
        evento(s, "pulso");
        for (i = 0; i < s.inimigos.length; i++) {
          e = s.inimigos[i];
          if (dist(p.x, p.y, e.x, e.y) < st.raioPulso + e.raio) ferir(s, e, st.dmgPulso);
        }
      }
    }

    if (s.corpos.length) {
      var ci;
      for (ci = s.corpos.length - 1; ci >= 0; ci--) {
        if (s.t >= s.corpos[ci].ate) s.corpos.splice(ci, 1);
      }
    }
    for (i = s.inimigos.length - 1; i >= 0; i--) {
      e = s.inimigos[i];
      if (e.hp <= 0) {
        if (e.tipo === "caranguejo" || e.tipo === "gaivota" || e.tipo === "onda") {
          s.corpos.push({ tipo: e.tipo, x: e.x, y: e.y, desenho: e.desenho, ate: s.t + 0.45 });
        }
        soltar(s, e);
        s.inimigos.splice(i, 1);
        continue;
      }
      if (dist(p.x, p.y, e.x, e.y) < p.raio + e.raio && s.t >= p.feridoAte) {
        p.hp -= e.dano * st.pele;
        p.feridoAte = s.t + 0.5;
        p.flash = 0.12;
        s.shake = 8;
        evento(s, "dano");
        dx = p.x - e.x;
        dy = p.y - e.y;
        d = Math.sqrt(dx * dx + dy * dy) || 1;
        p.x += (dx / d) * 20;
        p.y += (dy / d) * 20;
        e.x -= (dx / d) * 14;
        e.y -= (dy / d) * 14;
      }
    }

    for (i = s.brasas.length - 1; i >= 0; i--) {
      var g = s.brasas[i];
      d = dist(g.x, g.y, p.x, p.y);
      if (d < st.ima && d > 0.01) {
        var passoG = (70 + (1 - d / st.ima) * 320) * dt;
        g.x += ((p.x - g.x) / d) * passoG;
        g.y += ((p.y - g.y) / d) * passoG;
        d = dist(g.x, g.y, p.x, p.y);
      }
      if (d < p.raio + 12) {
        s.xp += g.v;
        s.brasas.splice(i, 1);
        evento(s, "brasa");
      }
    }

    if (s.modo === "chegar" && s.marco) {
      if (dist(p.x, p.y, s.marco.x, s.marco.y) < 52) s.noMarco = (s.noMarco || 0) + dt;
      else s.noMarco = Math.max(0, (s.noMarco || 0) - dt * 0.5);
      if (s.noMarco >= 3) {
        s.marcoI += 1;
        s.marco = s.marcos[s.marcoI] || null;
        s.noMarco = 0;
      }
    }
    s.pontos = Math.floor(s.t) * 10 + s.abates * 5 + s.nivel * 8;
    if (p.hp <= 0) {
      p.hp = 0;
      s.fase = "derrota";
      s.eventos = ["derrota"];
      return s;
    }
    if (ganhou(s)) {
      s.fase = "vitoria";
      s.eventos = ["vitoria"];
      return s;
    }
    if (s.modo !== "tempo" && s.modo !== "infinito" && s.limite && s.t >= s.limite) {
      s.fase = "derrota";
      s.eventos = ["derrota"];
      return s;
    }
    if (s.xp >= s.need) {
      s.oferta = oferecer(s);
      s.fase = "carta";
    }
    return s;
  }

  return {
    CONFIG: CONFIG,
    FASES: FASES,
    HISTORIA: HISTORIA,
    MODOS: MODOS,
    criar: criar,
    iniciar: iniciar,
    passo: passo,
    escolher: escolher
  };
});

function pagina(api) {
  var canvas = document.getElementById("jogo");
  var ctx = canvas.getContext("2d");
  var titulo = document.getElementById("titulo");
  var cartas = document.getElementById("cartas");
  var opcoes = document.getElementById("opcoes");
  var fim = document.getElementById("fim");
  var fimTitulo = document.getElementById("fim-titulo");
  var fimTexto = document.getElementById("fim-texto");
  var fimStats = document.getElementById("fim-stats");
  var acender = document.getElementById("acender");
  var deNovo = document.getElementById("de-novo");
  var aoMapa = document.getElementById("ao-mapa");
  var mapa = document.getElementById("mapa");
  var fasesEl = document.getElementById("fases");
  var farolEl = document.getElementById("farol-nivel");
  var mapaTitulo = document.getElementById("mapa-titulo");
  var voltar = document.getElementById("voltar");
  var estado = null;
  var ultimo = 0;
  var oculto = false;
  var dedo = null;
  var teclas = {};
  var ofertaVista = null;
  var somFim = false;
  var vista = "portas";
  var grupoAberto = "vigilia";
  var imgs = {};
  var audio = criarAudio();
  var arquivos = {
    faroleiro: "art/faroleiro.png",
    andar: "art/andar.png",
    acertar: "art/acertar.png",
    cair: "art/cair.png",
    caranguejo: "art/caranguejo.png",
    gaivota: "art/gaivota.png",
    onda: "art/onda.png",
    caranguejoAgir: "art/caranguejo-agir.png",
    caranguejoCair: "art/caranguejo-cair.png",
    gaivotaAgir: "art/gaivota-agir.png",
    gaivotaCair: "art/gaivota-cair.png",
    ondaAgir: "art/onda-agir.png",
    ondaCair: "art/onda-cair.png",
    vaga: "art/vaga.png",
    brasa: "art/brasa.png",
    fagulha: "art/fagulha.png",
    coroa: "art/coroa.png",
    poco: "art/poco.png",
    cais: "art/cais.jpg",
    marco: "art/marco.png",
    mapa: "art/mapa.jpg"
  };

  function criarAudio() {
    var ctxA = null;
    var drone = null;
    var extra = null;
    function ac() {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      if (!ctxA) ctxA = new C();
      if (ctxA.state === "suspended") ctxA.resume();
      return ctxA;
    }
    function bip(freq, quando, dur, tipo, vol) {
      var c = ac();
      var o, g, t0;
      if (!c) return;
      t0 = c.currentTime + quando;
      o = c.createOscillator();
      g = c.createGain();
      o.type = tipo;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    }
    return {
      desbloquear: ac,
      tocar: function (ev) {
        if (ev === "tiro") bip(680, 0, 0.045, "square", 0.025);
        else if (ev === "dano") bip(96, 0, 0.13, "sawtooth", 0.045);
        else if (ev === "brasa") bip(920, 0, 0.04, "sine", 0.028);
        else if (ev === "pulso") bip(160, 0, 0.16, "sine", 0.04);
        else if (ev === "nivel") {
          bip(523, 0, 0.08, "sine", 0.05);
          bip(659, 0.07, 0.1, "sine", 0.05);
          bip(784, 0.14, 0.16, "sine", 0.05);
        } else if (ev === "vitoria") {
          bip(523, 0, 0.18, "sine", 0.06);
          bip(659, 0.12, 0.22, "sine", 0.06);
          bip(784, 0.24, 0.42, "sine", 0.07);
        } else if (ev === "derrota") {
          bip(311, 0, 0.18, "triangle", 0.05);
          bip(220, 0.16, 0.28, "triangle", 0.05);
          bip(130, 0.32, 0.4, "sine", 0.05);
        } else if (ev === "ambiente") {
          var c = ac();
          var g1, g2;
          if (!c || drone) return;
          drone = c.createOscillator();
          extra = c.createOscillator();
          g1 = c.createGain();
          g2 = c.createGain();
          drone.type = "sine";
          drone.frequency.value = 73;
          g1.gain.value = 0.014;
          extra.type = "triangle";
          extra.frequency.value = 110;
          g2.gain.value = 0.007;
          drone.connect(g1);
          g1.connect(c.destination);
          extra.connect(g2);
          g2.connect(c.destination);
          drone.start();
          extra.start();
        }
      },
      parar: function () {
        try { if (drone) drone.stop(); } catch (e) {}
        try { if (extra) extra.stop(); } catch (e2) {}
        drone = null;
        extra = null;
      }
    };
  }

  function carregar(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(src); };
      img.src = src;
    });
  }

  function ajustar() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
  }

  function eixoDedo() {
    var x = 0;
    var y = 0;
    if (teclas.arrowleft || teclas.a) x -= 1;
    if (teclas.arrowright || teclas.d) x += 1;
    if (teclas.arrowup || teclas.w) y -= 1;
    if (teclas.arrowdown || teclas.s) y += 1;
    if (dedo) {
      var dx = dedo.x - dedo.ox;
      var dy = dedo.y - dedo.oy;
      var L = Math.sqrt(dx * dx + dy * dy);
      if (L > 10) {
        var c = Math.min(L, 32) / 32;
        x = (dx / L) * c;
        y = (dy / L) * c;
      }
    }
    var m = Math.sqrt(x * x + y * y);
    if (m > 1) {
      x /= m;
      y /= m;
    }
    return { x: x, y: y };
  }

  function progresso() {
    try {
      var j = JSON.parse(localStorage.getItem("lume-ilha") || "{\"feitas\":[]}");
      if (!j.feitas) j.feitas = [];
      if (!j.melhores) j.melhores = {};
      if (!j.quadro) j.quadro = [];
      return j;
    } catch (e) {
      return { feitas: [], melhores: {}, quadro: [] };
    }
  }

  function salvar(j) {
    try { localStorage.setItem("lume-ilha", JSON.stringify(j)); } catch (e2) {}
  }

  function gravarFase(id) {
    var j = progresso();
    if (j.feitas.indexOf(id) === -1) j.feitas.push(id);
    salvar(j);
  }

  function farolAtual() {
    var feitas = progresso().feitas;
    var n = 0;
    api.HISTORIA.forEach(function (item) {
      if (feitas.indexOf(item.id) !== -1) n += 1;
    });
    return n;
  }

  function abertaNaLista(lista, id) {
    var feitas = progresso().feitas;
    var i;
    for (i = 0; i < lista.length; i++) {
      if (lista[i].id === id) break;
    }
    if (i <= 0) return true;
    return feitas.indexOf(lista[i - 1].id) !== -1;
  }

  function gravarRecorde(s) {
    var j = progresso();
    var pts = s.pontos || 0;
    var ant = j.melhores[s.faseId];
    var melhor = !ant || pts > ant.pontos;
    if (melhor) {
      j.melhores[s.faseId] = {
        pontos: pts,
        t: Math.round(s.t * 10) / 10,
        abates: s.abates,
        nome: s.nomeFase
      };
    }
    if (s.fase === "vitoria" || (s.modo === "infinito" && s.t >= 20)) {
      j.quadro.push({
        nome: s.nomeFase,
        pontos: pts,
        t: Math.round(s.t * 10) / 10
      });
      j.quadro.sort(function (a, b) { return b.pontos - a.pontos; });
      j.quadro = j.quadro.slice(0, 8);
    }
    salvar(j);
    return melhor;
  }

  function linhaRecorde(id, texto) {
    var melhor = progresso().melhores[id];
    if (!melhor) return texto;
    return texto + " · recorde " + melhor.pontos;
  }

  function botaoLista(item, aberta, trava) {
    var b = document.createElement("button");
    var img = document.createElement("img");
    var texto = document.createElement("div");
    var nome = document.createElement("strong");
    var linha = document.createElement("span");
    var feitas = progresso().feitas;
    b.type = "button";
    b.className = "fase";
    b.disabled = !aberta;
    img.src = item.icone;
    img.alt = "";
    nome.textContent = item.nome + (feitas.indexOf(item.id) !== -1 ? " · feita" : "");
    linha.textContent = aberta ? linhaRecorde(item.id, item.texto) : trava;
    texto.appendChild(nome);
    texto.appendChild(linha);
    b.appendChild(img);
    b.appendChild(texto);
    b.addEventListener("click", function () {
      if (!aberta) return;
      comecar(null, item.id);
    });
    fasesEl.appendChild(b);
  }

  function botaoPorta(nome, texto, icone, aoClicar) {
    var b = document.createElement("button");
    var img = document.createElement("img");
    var caixa = document.createElement("div");
    var forte = document.createElement("strong");
    var linha = document.createElement("span");
    b.type = "button";
    b.className = "fase";
    img.src = icone;
    img.alt = "";
    forte.textContent = nome;
    linha.textContent = texto;
    caixa.appendChild(forte);
    caixa.appendChild(linha);
    b.appendChild(img);
    b.appendChild(caixa);
    b.addEventListener("click", aoClicar);
    fasesEl.appendChild(b);
  }

  function pintarMenu() {
    var feitas = progresso().feitas;
    var melhorInf = progresso().melhores.infinito;
    fasesEl.innerHTML = "";
    voltar.hidden = vista === "portas";
    farolEl.textContent = "Farol " + farolAtual();
    if (vista === "portas") {
      mapaTitulo.textContent = "A ilha";
      botaoPorta("História", "Oito noites, uma depois da outra.", "art/faroleiro.png", function () {
        vista = "historia";
        pintarMenu();
      });
      botaoPorta("Modos", "Quatro estilos, três níveis cada.", "art/marco.png", function () {
        vista = "modos";
        pintarMenu();
      });
      botaoPorta("Infinito", melhorInf ? "Recorde " + melhorInf.pontos + " · " + relogio(melhorInf.t) : "A maré não acaba.", "art/onda.png", function () {
        comecar(null, "infinito");
      });
      botaoPorta("Ranque", "O seu recorde e o quadro deste aparelho.", "art/coroa.png", function () {
        vista = "ranque";
        pintarMenu();
      });
      return;
    }
    if (vista === "historia") {
      mapaTitulo.textContent = "História";
      api.HISTORIA.forEach(function (item) {
        botaoLista(item, abertaNaLista(api.HISTORIA, item.id), "Fecha a noite anterior.");
      });
      return;
    }
    if (vista === "modos") {
      mapaTitulo.textContent = "Modos";
      [
        { id: "vigilia", nome: "Vigília", texto: "Aguentar o farol.", icone: "art/faroleiro.png" },
        { id: "travessia", nome: "Travessia", texto: "Acender os marcos.", icone: "art/marco.png" },
        { id: "caca", nome: "Caça", texto: "Apagar a maré.", icone: "art/caranguejo.png" },
        { id: "vaga", nome: "Vaga-mãe", texto: "Derrubar a vaga.", icone: "art/vaga.png" }
      ].forEach(function (g) {
        var n = 0;
        api.MODOS.forEach(function (item) {
          if (item.grupo === g.id && feitas.indexOf(item.id) !== -1) n += 1;
        });
        botaoPorta(g.nome, g.texto + (n ? " · " + n + "/3" : ""), g.icone, function () {
          grupoAberto = g.id;
          vista = "niveis";
          pintarMenu();
        });
      });
      return;
    }
    if (vista === "niveis") {
      var lista = api.MODOS.filter(function (item) { return item.grupo === grupoAberto; });
      mapaTitulo.textContent = lista.length ? lista[0].nome.replace(/ I+$/, "") : "Níveis";
      lista.forEach(function (item) {
        botaoLista(item, abertaNaLista(lista, item.id), "Fecha o nível anterior.");
      });
      return;
    }
    mapaTitulo.textContent = "Ranque";
    var pessoais = Object.keys(progresso().melhores);
    var quadro = progresso().quadro;
    var tituloP = document.createElement("p");
    tituloP.className = "marca";
    tituloP.textContent = "Pessoal";
    fasesEl.appendChild(tituloP);
    if (!pessoais.length) {
      var vazio = document.createElement("p");
      vazio.className = "recorde";
      vazio.textContent = "Ainda não há recorde.";
      fasesEl.appendChild(vazio);
    }
    pessoais.forEach(function (id) {
      var m = progresso().melhores[id];
      var p = document.createElement("p");
      p.className = "recorde";
      p.textContent = m.nome + " · " + m.pontos + " · " + relogio(m.t);
      fasesEl.appendChild(p);
    });
    var tituloQ = document.createElement("p");
    tituloQ.className = "marca";
    tituloQ.textContent = "Quadro deste aparelho";
    fasesEl.appendChild(tituloQ);
    if (!quadro.length) {
      var vazioQ = document.createElement("p");
      vazioQ.className = "recorde";
      vazioQ.textContent = "O quadro abre na primeira noite fechada.";
      fasesEl.appendChild(vazioQ);
    }
    quadro.forEach(function (m, i) {
      var p = document.createElement("p");
      p.className = "recorde";
      p.textContent = (i + 1) + ". " + m.nome + " · " + m.pontos;
      fasesEl.appendChild(p);
    });
  }

  function mostrarMapa() {
    vista = "portas";
    pintarMenu();
    titulo.hidden = true;
    fim.hidden = true;
    cartas.hidden = true;
    mapa.hidden = false;
    estado = null;
    somFim = false;
  }

  function comecar(seed, qual) {
    audio.desbloquear();
    audio.parar();
    audio.tocar("ambiente");
    estado = api.iniciar(seed || ((Math.random() * 1e9) | 0), qual || "vigilia", farolAtual());
    ofertaVista = null;
    somFim = false;
    titulo.hidden = true;
    mapa.hidden = true;
    fim.hidden = true;
    cartas.hidden = true;
  }

  function relogio(seg) {
    var s = Math.max(0, Math.floor(seg));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function montarCartas(lista) {
    opcoes.innerHTML = "";
    lista.forEach(function (carta, indice) {
      var b = document.createElement("button");
      var img = document.createElement("img");
      var texto = document.createElement("div");
      var nome = document.createElement("strong");
      var linha = document.createElement("span");
      b.type = "button";
      b.className = "carta";
      img.src = carta.icone;
      img.alt = "";
      nome.textContent = carta.nome;
      linha.textContent = carta.texto;
      texto.appendChild(nome);
      texto.appendChild(linha);
      b.appendChild(img);
      b.appendChild(texto);
      b.addEventListener("click", function () {
        api.escolher(estado, indice);
        tocarEventos();
        sincronizar();
      });
      opcoes.appendChild(b);
    });
  }

  function tocarEventos() {
    if (!estado || !estado.eventos) return;
    estado.eventos.forEach(function (ev) { audio.tocar(ev); });
    estado.eventos = [];
  }

  function sincronizar() {
    var acabou;
    if (!estado) return;
    acabou = estado.fase === "vitoria" || estado.fase === "derrota";
    fim.hidden = !acabou;
    cartas.hidden = estado.fase !== "carta";
    if (acabou && !somFim) {
      somFim = true;
      audio.parar();
      fimTitulo.textContent = estado.fase === "vitoria"
        ? (estado.modo === "tempo" ? "O farol reacendeu" : estado.nomeFase + " fechou")
        : "A lanterna apagou";
      fimTexto.textContent = estado.fase === "vitoria" ? "A maré recuou." : "A maré cobriu o cais.";
      var recorde = false;
      if (estado.faseId && (estado.fase === "vitoria" || estado.modo === "infinito")) {
        if (estado.fase === "vitoria") gravarFase(estado.faseId);
        recorde = gravarRecorde(estado);
      }
      fimStats.textContent = (estado.nomeFase || "Vigília") + " · tempo " + relogio(estado.t) + " · nível " + estado.nivel + " · maré " + estado.abates + " · " + (estado.pontos || 0) + (recorde ? " · recorde" : "");
    }
    if (!acabou) somFim = false;
    if (estado.fase === "carta" && estado.oferta && estado.oferta !== ofertaVista) {
      ofertaVista = estado.oferta;
      montarCartas(estado.oferta);
    }
  }

  function peca(img, x, y, lado, ang, alfa) {
    if (!img || !img.complete || !img.naturalWidth) return false;
    var alt = lado * img.naturalHeight / img.naturalWidth;
    ctx.save();
    ctx.translate(x, y);
    if (ang) ctx.rotate(ang + Math.PI / 2);
    ctx.globalAlpha = alfa == null ? 1 : alfa;
    ctx.drawImage(img, -lado / 2, -alt / 2, lado, alt);
    ctx.restore();
    return true;
  }

  function sprite(img, x, y, w, ang, alfa, escX, escY) {
    if (!img || !img.complete || !img.naturalWidth) return;
    ctx.save();
    ctx.translate(x, y);
    if (ang) ctx.rotate(ang + Math.PI / 2);
    ctx.scale(escX || 1, escY || 1);
    ctx.globalAlpha = alfa == null ? 1 : alfa;
    ctx.drawImage(img, -w / 2, -w / 2, w, w);
    ctx.restore();
  }

  function desenhar() {
    var dprVista, escala, p, ox, oy, i, e, g, luz, barra, vida, falta;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#06141c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!estado || estado.fase === "titulo") return;
    p = estado.jogador;
    dprVista = 420;
    escala = canvas.width / dprVista;
    var meiaLargura = dprVista / 2;
    var meiaAltura = meiaLargura * canvas.height / Math.max(1, canvas.width);
    var camX = p.x;
    var camY = p.y;
    var afastaX = camX - api.CONFIG.centro;
    var afastaY = camY - api.CONFIG.centro;
    var afasta = Math.hypot(afastaX, afastaY);
    var limiteCam = api.CONFIG.raioCais - Math.max(meiaLargura, meiaAltura);
    if (limiteCam < 36) limiteCam = 36;
    if (afasta > limiteCam) {
      camX = api.CONFIG.centro + (afastaX / afasta) * limiteCam;
      camY = api.CONFIG.centro + (afastaY / afasta) * limiteCam;
    }
    ox = 0;
    oy = 0;
    if (estado.shake > 0) {
      ox = Math.sin(estado.t * 42) * estado.shake;
      oy = Math.cos(estado.t * 37) * estado.shake;
    }
    ctx.setTransform(escala, 0, 0, escala, canvas.width / 2 - (camX + ox) * escala, canvas.height / 2 - (camY + oy) * escala);
    if (imgs.cais) ctx.drawImage(imgs.cais, 0, 0, api.CONFIG.mundo, api.CONFIG.mundo);
    var raioLuz = 158 + Math.sin(estado.t * 3) * 16;
    luz = ctx.createRadialGradient(p.x, p.y, 16, p.x, p.y, raioLuz);
    luz.addColorStop(0, "rgba(240, 170, 60, 0.22)");
    luz.addColorStop(1, "rgba(240, 170, 60, 0)");
    ctx.fillStyle = luz;
    ctx.beginPath();
    ctx.arc(p.x, p.y, raioLuz, 0, Math.PI * 2);
    ctx.fill();
    if (estado.marco && estado.modo === "chegar") {
      var imgM = imgs.marco || imgs.coroa;
      var largM = 84;
      var altM = imgM && imgM.naturalWidth ? largM * imgM.naturalHeight / imgM.naturalWidth : 120;
      var bobM = Math.sin(estado.t * 3) * 2;
      ctx.save();
      ctx.translate(estado.marco.x, estado.marco.y + bobM);
      ctx.globalAlpha = 1;
      if (imgM && imgM.complete && imgM.naturalWidth) ctx.drawImage(imgM, -largM / 2, -altM, largM, altM);
      ctx.restore();
    }
    for (i = 0; i < estado.pocos.length; i++) {
      g = estado.pocos[i];
      sprite(imgs.poco, g.x, g.y, g.desenho, 0, 0.92);
    }
    for (i = 0; i < estado.brasas.length; i++) {
      g = estado.brasas[i];
      sprite(imgs.brasa, g.x, g.y + Math.sin(estado.t * 6 + i) * 3, 22, estado.t, 1);
    }
    for (i = 0; i < estado.tiros.length; i++) {
      g = estado.tiros[i];
      sprite(imgs.fagulha, g.x, g.y, g.largo ? 36 : 22, Math.atan2(g.vy, g.vx), 1);
    }
    for (i = 0; i < (estado.corpos || []).length; i++) {
      var c = estado.corpos[i];
      if (estado.t > c.ate) continue;
      peca(imgs[c.tipo + "Cair"], c.x, c.y, c.desenho || 64, 0, 1);
    }
    for (i = 0; i < estado.inimigos.length; i++) {
      e = estado.inimigos[i];
      var escY = 1;
      var angE = e.tipo === "vaga" ? estado.t * 0.35 : e.ang;
      var agir = null;
      if (e.tipo === "gaivota" && e.impulso > 0) agir = imgs.gaivotaAgir;
      else if (e.tipo === "caranguejo" && Math.hypot(e.x - p.x, e.y - p.y) < p.raio + e.raio + 36) agir = imgs.caranguejoAgir;
      else if (e.tipo === "onda" && e.pocoEm > 2.2) agir = imgs.ondaAgir;
      if (agir && peca(agir, e.x, e.y, e.desenho, e.ang, e.flash > 0 ? 0.55 : 1)) continue;
      if (e.tipo === "gaivota") escY = 1 + Math.sin(estado.t * 16 + e.id) * 0.16;
      if (e.tipo === "caranguejo") angE += Math.sin(estado.t * 11 + e.id) * 0.18;
      if (e.tipo === "onda") angE += Math.sin(estado.t * 2 + e.id) * 0.25;
      sprite(imgs[e.tipo], e.x, e.y + Math.sin(estado.t * 7 + e.id) * 2, e.desenho, angE, e.flash > 0 ? 0.55 : 1, 1, escY);
    }
    for (i = 0; i < estado.motes.length; i++) {
      var tm = 20 + Math.sin(estado.t * 8 + i) * 3;
      sprite(imgs.coroa, estado.motes[i].x, estado.motes[i].y, tm, estado.giro, 1);
    }
    if (estado.pulsoVis > 0) {
      var anel = estado.pulsoRaio * (1.05 - estado.pulsoVis);
      var q = estado.pulsoVis / 0.26;
      for (i = 0; i < 8; i++) {
        var aa = (i / 8) * Math.PI * 2 + estado.giro;
        sprite(imgs.coroa, p.x + Math.cos(aa) * anel, p.y + Math.sin(aa) * anel, 18, 0, Math.max(0, q));
      }
    }
    var anda = Math.sqrt((p.vx || 0) * (p.vx || 0) + (p.vy || 0) * (p.vy || 0));
    var bob = Math.sin(estado.t * (7 + anda * 0.03)) * (anda > 28 ? 3.2 : 0.8);
    var corpo = imgs.faroleiro;
    var lado = 64;
    var angCorpo = p.ang;
    if (estado.fase === "derrota" && imgs.cair && imgs.cair.complete && imgs.cair.naturalWidth) {
      corpo = imgs.cair;
      lado = 120;
      angCorpo = 0;
      bob = 0;
    } else if (estado.t < (p.acertaAte || 0) && imgs.acertar && imgs.acertar.complete && imgs.acertar.naturalWidth) {
      corpo = imgs.acertar;
      lado = 86;
    } else if (anda > 28 && imgs.andar && imgs.andar.complete && imgs.andar.naturalWidth) {
      corpo = imgs.andar;
    }
    if (corpo && corpo.complete && corpo.naturalWidth) {
      var altCorpo = lado * corpo.naturalHeight / corpo.naturalWidth;
      ctx.save();
      ctx.translate(p.x, p.y + bob);
      if (angCorpo) ctx.rotate(angCorpo + Math.PI / 2);
      ctx.globalAlpha = p.flash > 0 && estado.fase !== "derrota" ? 0.6 : 1;
      ctx.drawImage(corpo, -lado / 2, -altCorpo / 2, lado, altCorpo);
      ctx.restore();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (estado.fase === "jogando" || estado.fase === "carta") {
      var topo = Math.round(canvas.height * 0.06);
      ctx.fillStyle = "#f4ead8";
      ctx.font = Math.round(canvas.width * 0.052) + "px Palatino, Georgia, serif";
      ctx.textAlign = "center";
      falta = Math.max(0, (estado.limite || api.CONFIG.partida) - estado.t);
      if (estado.modo === "infinito") ctx.fillText(relogio(estado.t), canvas.width / 2, topo);
      else ctx.fillText(relogio(falta), canvas.width / 2, topo);
      barra = Math.min(canvas.width * 0.42, 240);
      var barraY = topo + Math.round(canvas.width * 0.045);
      vida = estado.jogador.hpMax ? estado.jogador.hp / estado.jogador.hpMax : 0;
      ctx.fillStyle = "rgba(244, 234, 216, 0.25)";
      ctx.fillRect((canvas.width - barra) / 2, barraY, barra, 5);
      ctx.fillStyle = "#e0a23a";
      ctx.fillRect((canvas.width - barra) / 2, barraY, barra * Math.max(0, vida), 5);
      ctx.fillStyle = "#d5cbb8";
      ctx.font = Math.round(canvas.width * 0.028) + "px system-ui, sans-serif";
      var objetivo = estado.modo === "infinito" ? (estado.pontos || 0) + " pts" : "maré " + estado.abates;
      if (estado.modo === "abater") objetivo = "maré " + estado.abates + "/" + estado.meta;
      if (estado.modo === "chefe") objetivo = estado.chefeMorta ? "a vaga caiu" : "a vaga sobe";
      if (estado.modo === "chegar" && estado.marco) {
        var dm = Math.hypot(estado.marco.x - p.x, estado.marco.y - p.y);
        objetivo = "marco " + ((estado.marcoI || 0) + 1) + "/" + estado.marcos.length + " · " + Math.max(0, Math.round(dm));
      }
      ctx.fillText((estado.nomeFase || "Vigília") + "  ·  nível " + estado.nivel + "  ·  " + objetivo, canvas.width / 2, barraY + Math.round(canvas.width * 0.07));
    }
    if (estado.aviso && estado.t < estado.avisoAte && estado.fase === "jogando") {
      ctx.fillStyle = "#f0d7a4";
      ctx.font = Math.round(canvas.width * 0.04) + "px Palatino, Georgia, serif";
      ctx.fillText(estado.aviso, canvas.width / 2, Math.round(canvas.height * 0.22));
    }
    if (estado.t < 5 && estado.fase === "jogando") {
      ctx.fillStyle = "#f4ead8";
      ctx.font = Math.round(canvas.width * 0.032) + "px Palatino, Georgia, serif";
      ctx.fillText("Arraste para andar", canvas.width / 2, canvas.height - Math.round(canvas.width * 0.08));
    }
  }

  function quadro(agora) {
    requestAnimationFrame(quadro);
    if (oculto) {
      ultimo = agora;
      return;
    }
    if (estado && estado.fase === "jogando" && !(window.__lume && window.__lume.pausa)) {
      var dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 0;
      api.passo(estado, dt, eixoDedo());
      tocarEventos();
    }
    ultimo = agora;
    desenhar();
    sincronizar();
  }

  window.addEventListener("resize", ajustar);
  document.addEventListener("visibilitychange", function () { oculto = document.hidden; });
  ajustar();

  canvas.addEventListener("pointerdown", function (e) {
    if (!estado || estado.fase !== "jogando") return;
    dedo = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: e.clientX, oy: e.clientY };
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!dedo || e.pointerId !== dedo.id) return;
    dedo.x = e.clientX;
    dedo.y = e.clientY;
  });
  function soltar(e) {
    if (dedo && e.pointerId === dedo.id) dedo = null;
  }
  canvas.addEventListener("pointerup", soltar);
  canvas.addEventListener("pointercancel", soltar);
  window.addEventListener("keydown", function (e) {
    teclas[e.key.toLowerCase()] = true;
    var k = e.key.toLowerCase();
    if (k === "arrowup" || k === "arrowdown" || k === "arrowleft" || k === "arrowright") e.preventDefault();
  });
  window.addEventListener("keyup", function (e) { teclas[e.key.toLowerCase()] = false; });

  acender.addEventListener("click", function () {
    if (acender.disabled) return;
    audio.desbloquear();
    mostrarMapa();
  });
  deNovo.addEventListener("click", function () {
    comecar(null, estado && estado.faseId);
  });
  aoMapa.addEventListener("click", function () { mostrarMapa(); });
  voltar.addEventListener("click", function () {
    vista = vista === "niveis" ? "modos" : "portas";
    pintarMenu();
  });

  var nomes = Object.keys(arquivos);
  Promise.all(nomes.map(function (nome) {
    return carregar(arquivos[nome]).then(function (img) { imgs[nome] = img; });
  })).then(function () {
    acender.disabled = false;
    acender.textContent = "Acender";
  }).catch(function () {
    acender.textContent = "A arte não abriu";
  });

  requestAnimationFrame(quadro);

  if (location.hash.indexOf("prova") !== -1) {
    window.__lume = {
      comecar: comecar,
      obter: function () { return estado; },
      api: api,
      eixo: eixoDedo
    };
  }
}
