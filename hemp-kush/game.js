const HempKush = (() => {
  const COLS = 8;
  const ROWS = 8;
  let seq = 1;

  const GLYPH = {
    folha: '<svg viewBox="0 0 64 64"><g fill="#083222"><ellipse cx="32" cy="30" rx="7" ry="18"/><ellipse cx="32" cy="32" rx="6" ry="16" transform="rotate(38 32 32)"/><ellipse cx="32" cy="32" rx="6" ry="16" transform="rotate(-38 32 32)"/><ellipse cx="32" cy="34" rx="5" ry="13" transform="rotate(72 32 32)"/><ellipse cx="32" cy="34" rx="5" ry="13" transform="rotate(-72 32 32)"/></g><path d="M32 28v22" stroke="#042214" stroke-width="2"/></svg>',
    flor: '<svg viewBox="0 0 64 64"><circle cx="32" cy="18" r="8" fill="#4a146e"/><circle cx="46" cy="28" r="8" fill="#4a146e"/><circle cx="42" cy="44" r="8" fill="#4a146e"/><circle cx="22" cy="44" r="8" fill="#4a146e"/><circle cx="18" cy="28" r="8" fill="#4a146e"/><circle cx="32" cy="32" r="7" fill="#f0c14b"/><circle cx="28" cy="16" r="1.4" fill="#ffb020"/><circle cx="44" cy="26" r="1.4" fill="#ffb020"/><circle cx="36" cy="46" r="1.4" fill="#ffb020"/></svg>',
    semente: '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="14" ry="18" fill="#5a3218"/><path d="M32 18c6 8 6 16 0 28" stroke="#f3e0c8" stroke-width="2" fill="none"/><ellipse cx="32" cy="22" rx="4" ry="3" fill="#c4a574"/></svg>',
    bud: '<svg viewBox="0 0 64 64"><circle cx="32" cy="34" r="16" fill="#14520c"/><circle cx="22" cy="28" r="8" fill="#1f7a28"/><circle cx="42" cy="30" r="8" fill="#1f7a28"/><circle cx="32" cy="22" r="7" fill="#2f9a32"/><circle cx="26" cy="24" r="1.3" fill="#f4fff0"/><circle cx="36" cy="26" r="1.3" fill="#f4fff0"/><circle cx="30" cy="34" r="1.2" fill="#f4fff0"/><circle cx="40" cy="38" r="1.2" fill="#f4fff0"/></svg>',
    verde: '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="46" rx="10" ry="6" fill="#0c3a14"/><circle cx="22" cy="34" r="11" fill="#146b24"/><circle cx="42" cy="34" r="11" fill="#1f8a32"/><circle cx="32" cy="24" r="12" fill="#3cb84a"/><circle cx="32" cy="34" r="8" fill="#7dff6a"/><circle cx="26" cy="22" r="1.4" fill="#ffe08a"/><circle cx="38" cy="26" r="1.3" fill="#ffe08a"/><circle cx="30" cy="34" r="1.2" fill="#fff"/><circle cx="40" cy="36" r="1.1" fill="#ffe08a"/></svg>',
    roxo: '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="46" rx="10" ry="6" fill="#2a0840"/><circle cx="22" cy="34" r="11" fill="#6a1fa6"/><circle cx="42" cy="34" r="11" fill="#4a146e"/><circle cx="32" cy="24" r="12" fill="#c45cff"/><circle cx="32" cy="34" r="8" fill="#e2b6ff"/><circle cx="26" cy="22" r="1.4" fill="#ffe08a"/><circle cx="38" cy="26" r="1.3" fill="#ffe08a"/><circle cx="30" cy="34" r="1.2" fill="#fff"/></svg>',
    ambar: '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="46" rx="10" ry="6" fill="#5a3208"/><circle cx="22" cy="34" r="11" fill="#c45a28"/><circle cx="42" cy="34" r="11" fill="#e07a20"/><circle cx="32" cy="24" r="12" fill="#f0a04a"/><circle cx="32" cy="34" r="8" fill="#ffd27a"/><circle cx="26" cy="22" r="1.4" fill="#fff"/><circle cx="38" cy="28" r="1.3" fill="#fff6c8"/><circle cx="30" cy="36" r="1.2" fill="#fff"/></svg>',
    bong: '<svg viewBox="0 0 64 64"><path d="M28 6h8v12h-8z" fill="#eafff0"/><path d="M24 16h16l2 8H22z" fill="#9dffb8"/><path d="M18 26h28c8 2 12 8 10 16-2 10-12 16-24 16S10 52 8 42c-2-8 2-14 10-16z" fill="#3dff78"/><ellipse cx="32" cy="42" rx="12" ry="8" fill="#d6ff4a" opacity=".65"/><circle cx="32" cy="6" r="4" fill="#fff"/><path d="M24 34c6 4 12 4 18 0" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/></svg>',
    pote: '<svg viewBox="0 0 64 64"><rect x="20" y="16" width="24" height="8" rx="2" fill="#6a4324"/><path d="M18 26h28v22c0 6-6 10-14 10s-14-4-14-10z" fill="#8a5a32"/><rect x="22" y="32" width="20" height="16" rx="3" fill="#3a2414"/><path d="M32 34c-3 5-3 9 0 14 3-5 3-9 0-14z" fill="#3cb84a"/><ellipse cx="32" cy="34" rx="6" ry="3" fill="#7dff6a" transform="rotate(-20 32 34)"/></svg>',
    seda: '<svg viewBox="0 0 64 64"><rect x="16" y="20" width="28" height="16" rx="8" fill="#f3e6c8" transform="rotate(-28 32 32)"/><path d="M22 30h16" stroke="#c45a28" stroke-width="1.5" transform="rotate(-28 32 32)"/><circle cx="44" cy="40" r="5" fill="#3cb84a"/><circle cx="44" cy="40" r="2" fill="#ffe08a"/></svg>',
    bomb: '<svg viewBox="0 0 64 64"><circle cx="32" cy="36" r="16" fill="#f0c14b"/><path d="M32 8c2 6 2 10 0 14" stroke="#ff7a18" stroke-width="3" fill="none"/><circle cx="32" cy="8" r="4" fill="#fff6c8"/><circle cx="32" cy="36" r="6" fill="#fff4c2"/></svg>',
  };

  const THREE = ["verde", "roxo", "ambar"];
  const FOUR = ["verde", "roxo", "ambar", "rosa"];
  function band(rows) {
    const cells = [];
    rows.forEach((r) => { for (let c = 0; c < COLS; c += 1) cells.push([r, c]); });
    return cells;
  }
  function corners() {
    const cells = [];
    [[0, 0], [0, 6], [6, 0], [6, 6]].forEach(([r, c]) => {
      for (let dr = 0; dr < 2; dr += 1) {
        for (let dc = 0; dc < 2; dc += 1) cells.push([r + dr, c + dc]);
      }
    });
    return cells;
  }
  function checker(n) {
    const cells = [];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if ((r + c) % 2 === 0) cells.push([r, c]);
      }
    }
    return n ? cells.slice(0, n) : cells;
  }
  function block(r, c, h, w) {
    const cells = [];
    for (let dr = 0; dr < h; dr += 1) {
      for (let dc = 0; dc < w; dc += 1) cells.push([r + dr, c + dc]);
    }
    return cells;
  }
  const EASY = [900, 1800, 3000];
  const MID = [1400, 2600, 4000];
  const HARD = [1800, 3200, 4800];
  const LEVELS = [];
  function heatAt(i) { return ["facil", "medio", "facil", "medio", "dificil"][i % 5]; }
  function starsAt(heat) { return heat === "dificil" ? HARD : heat === "medio" ? MID : EASY; }
  function buds(pairs) {
    const label = { verde: "Skunk", roxo: "Purple Haze", ambar: "Colombia Gold", rosa: "Pink Kush", azul: "Nightdream Blue", branco: "White Widow", semente: "sementes", fino: "becks finos", bomba: "becks grossos", pipe: "pipes", bong: "bongs" };
    const noBong = { verde: "Skunk no bong", roxo: "Purple Haze no bong", ambar: "Colombia Gold no bong", rosa: "Pink Kush no bong", azul: "Nightdream Blue no bong", branco: "White Widow no bong" };
    return pairs.map(([kind, n]) => ({
      kind,
      n,
      label: kind.indexOf("bong-") === 0 ? (noBong[kind.slice(5)] || "no bong") : (label[kind] || kind),
    }));
  }
  const FIVE = FOUR.concat(["azul"]);
  const SIX = FIVE.concat(["branco"]);
  function kindsFor(i, chap) {
    const heat = heatAt(i);
    const book = chap || 0;
    if (book === 0 && i < 12) return FOUR;
    if (book === 0 && heat === "facil") return FOUR;
    if (book === 0) return FIVE;
    if (book === 1 && i < 8) return FOUR;
    if (heat === "dificil" && (book >= 3 || (book === 2 && i >= 12))) return SIX;
    if (heat === "facil" && book < 3) return FOUR;
    return FIVE;
  }
  function holesFrom(spans) {
    const cells = [];
    for (let c = 0; c < COLS; c += 1) {
      const pair = spans[c];
      const a = pair ? pair[0] : 1;
      const b = pair ? pair[1] : 0;
      for (let r = 0; r < ROWS; r += 1) if (r < a || r > b) cells.push([r, c]);
    }
    return cells;
  }
  const SPANS = {
    diamond: [[3, 4], [2, 5], [1, 6], [0, 7], [0, 7], [1, 6], [2, 5], [3, 4]],
    circle: [[2, 5], [1, 6], [0, 7], [0, 7], [0, 7], [0, 7], [1, 6], [2, 5]],
    plus: [[2, 5], [2, 5], [0, 7], [0, 7], [0, 7], [0, 7], [2, 5], [2, 5]],
    tee: [[0, 2], [0, 2], [0, 7], [0, 7], [0, 7], [0, 7], [0, 2], [0, 2]],
    you: [[0, 7], [0, 7], [5, 7], [5, 7], [5, 7], [5, 7], [0, 7], [0, 7]],
    pyramid: [[5, 7], [4, 7], [2, 7], [0, 7], [0, 7], [2, 7], [4, 7], [5, 7]],
    stairs: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 7]],
    ramp: [[0, 7], [0, 7], [0, 6], [0, 5], [0, 4], [0, 3], [0, 2], [0, 1]],
    el: [[0, 7], [0, 7], [5, 7], [5, 7], [5, 7], [5, 7], [5, 7], [5, 7]],
    arch: [[0, 7], [0, 7], [0, 2], [0, 2], [0, 2], [0, 2], [0, 7], [0, 7]],
    arrow: [[0, 2], [0, 4], [0, 6], [0, 7], [0, 7], [0, 6], [0, 4], [0, 2]],
    heart: [[1, 5], [0, 6], [0, 7], [1, 7], [1, 7], [0, 7], [0, 6], [1, 5]],
    hache: [[0, 7], [0, 7], [3, 4], [3, 4], [3, 4], [3, 4], [0, 7], [0, 7]],
    bar: [[3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [3, 5]],
    vase: [[0, 7], [2, 7], [3, 7], [4, 7], [4, 7], [3, 7], [2, 7], [0, 7]],
    cross: [[3, 4], [3, 4], [0, 7], [0, 7], [0, 7], [0, 7], [3, 4], [3, 4]],
    jay: [[5, 7], [5, 7], [5, 7], [5, 7], [5, 7], [5, 7], [0, 7], [0, 7]],
    bowl: [[3, 7], [2, 7], [1, 7], [0, 7], [0, 7], [1, 7], [2, 7], [3, 7]],
    mushroom: [[0, 3], [0, 3], [0, 7], [0, 7], [0, 7], [0, 7], [0, 3], [0, 3]],
    steps: [[6, 7], [5, 7], [3, 7], [1, 7], [1, 7], [3, 7], [5, 7], [6, 7]],
    chevron: [[0, 1], [0, 3], [0, 5], [0, 7], [0, 7], [0, 5], [0, 3], [0, 1]],
  };
  const SHAPE_KEYS = Object.keys(SPANS);
  function shapeHoles(i, salt) {
    const soft = ["circle", "bowl", "diamond", "plus", "heart", "tee"];
    if (salt === 0 && i === 0) return [];
    if (salt === 0 && i < 10) return holesFrom(SPANS[soft[i % soft.length]]);
    if (i === 0) return holesFrom(SPANS.circle);
    const nasty = { bar: 1, hache: 1, cross: 1, stairs: 1, chevron: 1, steps: 1, you: 1 };
    let key = SHAPE_KEYS[(i + salt * 5) % SHAPE_KEYS.length];
    if (salt > 0 && salt < 2 && i < 12 && nasty[key]) key = soft[i % soft.length];
    return holesFrom(SPANS[key]);
  }
  function pickSpots(holes, busy, count) {
    const ban = new Set((holes || []).concat(busy || []).map(([r, c]) => r + "," + c));
    const skip = new Set();
    for (let c = 0; c < COLS; c += 1) {
      for (let r = 0; r < ROWS; r += 1) {
        if (!ban.has(r + "," + c)) { skip.add(r + "," + c); break; }
      }
    }
    const cells = [];
    const spare = [];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const id = r + "," + c;
        if (ban.has(id)) continue;
        const score = Math.abs(r - 3.5) + Math.abs(c - 3.5);
        if (skip.has(id)) spare.push([score, r, c]);
        else cells.push([score, r, c]);
      }
    }
    cells.sort((a, b) => a[0] - b[0]);
    spare.sort((a, b) => a[0] - b[0]);
    return cells.concat(spare).slice(0, count).map((item) => [item[1], item[2]]);
  }
  function take(holes, busy, want) {
    const free = 64 - holes.length - (busy ? busy.length : 0);
    const n = Math.min(want, Math.max(2, Math.floor(free / 7)));
    return pickSpots(holes, busy, n);
  }
  function zipN(holes, busy, want) {
    const free = 64 - holes.length - busy.length;
    return zips(Math.min(want, Math.max(0, Math.floor(free / 5))), holes, busy);
  }
  function seedN(holes, busy, want) {
    const free = 64 - holes.length - busy.length;
    if (want >= 8 && free >= 36) return 8;
    if (want >= 6 && free >= 28) return 6;
    return Math.min(4, want);
  }
  function fit(cells, holes) {
    const ban = new Set((holes || []).map(([r, c]) => r + "," + c));
    return cells.filter(([r, c]) => !ban.has(r + "," + c));
  }
  function zips(n, holes, busy) {
    const ban = new Set((holes || []).concat(busy || []).map(([r, c]) => r + "," + c));
    const cells = [];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if ((r + c) % 2 === 0 && !ban.has(r + "," + c)) cells.push([r, c]);
      }
    }
    return cells.slice(0, n);
  }
  function jellyOf(jelly, holes) {
    const cells = typeof jelly === "number" ? zips(jelly, holes, []) : (jelly || []);
    const ban = new Set((holes || []).map(([r, c]) => r + "," + c));
    return cells.filter(([r, c]) => !ban.has(r + "," + c));
  }
  function addLevel(zone, i, row) {
    const heat = heatAt(i);
    const book = { head: 0, hash: 1, crumble: 2, semente: 3, folha: 4, vidro: 5 }[zone] || 0;
    const goals = buds(row.goals);
    const extra = powerGoal(i, book, row.holes);
    if (extra) goals.push(buds([extra])[0]);
    LEVELS.push({
      id: LEVELS.length + 1,
      zone,
      name: row.name,
      heat,
      teach: row.teach,
      moves: row.moves,
      kinds: row.kinds || kindsFor(i, book),
      goals,
      stars: starsAt(heat),
      jelly: row.jelly || [],
      hash: row.hash || [],
      locks: row.locks || [],
      glass: row.glass || [],
      cover: row.cover || [],
      seeds: row.seeds || 0,
      holes: row.holes || [],
      kit: row.kit || {},
      load: "Abrindo " + row.name.toLowerCase() + "…",
    });
  }
  function say(parts) {
    if (parts.teach) return parts.teach;
    const what = [];
    if (parts.glass) what.push("crumble");
    if (parts.cover) what.push("folha");
    if (parts.seeds) what.push("semente");
    if (parts.locks) what.push("rosin");
    if (parts.hash) what.push("haxixe");
    if (parts.jelly) what.push("ziplok");
    if (parts.holes) what.push("menos espaço");
    if (what.length === 1 && what[0] === "crumble") return "O crumble não sai no match. Só um poder quebra.";
    if (what.length === 1 && what[0] === "haxixe") return "O haxixe cresce se você não corta. Junta do lado.";
    if (what.length === 1 && what[0] === "rosin") return "O rosin prende a peça. Junta ela pra soltar.";
    if (what.length === 1 && what[0] === "semente") return "A semente tem que cair embaixo.";
    if (what.length === 1 && what[0] === "folha") return "A folha aguenta dois cortes.";
    if (what.length === 1 && what[0] === "ziplok") return "Abre os ziploks e junta a cor.";
    if (what.length === 1 && what[0] === "menos espaço") return "O tabuleiro perdeu casas. Junta no que sobrou.";
    return "Junta a cor com " + what.join(", ") + ".";
  }
  function colorGoals(i, chap) {
    const heat = heatAt(i);
    const count = i < 5 ? 1 : i < 12 ? (heat === "facil" ? 1 : 2) : (heat === "dificil" ? 3 : heat === "medio" ? 2 : 1);
    const n = i < 8 ? 20 : i < 16 ? 16 : 14;
    const colors = kindsFor(i, chap);
    const pick = [];
    for (let k = 0; k < count; k += 1) pick.push(colors[(i + k) % colors.length]);
    return pick.map((kind) => [kind, n]);
  }
  function lineFive(holes) {
    const ban = new Set((holes || []).map(([r, c]) => r + "," + c));
    for (let r = 0; r < ROWS; r += 1) {
      let run = 0;
      for (let c = 0; c < COLS; c += 1) {
        run = ban.has(r + "," + c) ? 0 : run + 1;
        if (run >= 5) return true;
      }
    }
    for (let c = 0; c < COLS; c += 1) {
      let run = 0;
      for (let r = 0; r < ROWS; r += 1) {
        run = ban.has(r + "," + c) ? 0 : run + 1;
        if (run >= 5) return true;
      }
    }
    return false;
  }
  function powerGoal(i, chap, holes) {
    const book = chap || 0;
    if (book === 0 && i < 6) {
      if (i === 1) return ["fino", 1];
      if (i === 2) return ["pipe", 1];
      if (i === 3) return ["bomba", 1];
      return null;
    }
    const heat = heatAt(i);
    if (heat === "dificil" && i >= (book === 0 ? 14 : 9)) {
      if (!lineFive(holes)) return null;
      const pool = kindsFor(i, book).filter((kind) => kind !== "branco");
      return ["bong-" + pool[(i + book) % pool.length], 1];
    }
    if (heat === "medio" && i % 10 === 6) return ["bomba", book === 0 && i < 12 ? 1 : 2];
    if (heat === "facil" && i >= 8 && i % 10 === 0) return ["fino", 2];
    if (i >= 12 && heat === "medio" && i % 10 === 1) return ["pipe", 1];
    return null;
  }
  function movesAt(i) {
    const base = [20, 18, 20, 18, 17][i % 5];
    return Math.max(15, base - Math.floor(i / 10));
  }
  [
    ["Loja", "Junta muitos verdes. Um combo não fecha.", 22, [["verde", 36]], FOUR, [], "", {}],
    ["Fininho", "Quatro em linha viram o beck fino. Precisa das duas cores.", 20, [["verde", 22], ["roxo", 22]], FOUR, [], "", { fino: 1 }],
    ["Pipe", "Quadrado vira o pipe. Uns ziploks nas pontas.", 20, [["roxo", 24]], FOUR, [[0, 3], [0, 4], [3, 0], [4, 0], [3, 7], [4, 7], [7, 3], [7, 4]], "", { pipe: 1 }],
    ["Beck grosso", "O L vira o beck grosso. Uns ziploks em cima.", 20, [["ambar", 28]], FOUR, 8, "", { bomba: 1 }],
    ["Bong", "Cinco em linha viram o bong. As duas cores e uns ziploks.", 20, [["verde", 22], ["roxo", 22]], FOUR, 6, "", {}],
    ["Ziplok", "A fase é abrir os ziploks, não só juntar cor.", 20, [["verde", 26]], FOUR, 12, "", {}],
    ["Prateleira", "Mesa menor. Roxo, âmbar, ziplok e um beck grosso.", 18, [["roxo", 20], ["ambar", 20]], FOUR, 8, "", {}],
    ["Rosa", "A rosa quer a mesa pra ela.", 20, [["rosa", 32]], FOUR, [], "", {}],
    ["Mistura", "Verde, rosa e uns ziploks.", 18, [["verde", 18], ["rosa", 18]], FOUR, 8, "", {}],
    ["A casa", "Três cores e ziplok. A primeira fase mais cheia.", 18, [["verde", 16], ["roxo", 16], ["rosa", 16]], FOUR, 8, "", {}],
    ["Corredor", "O meio continua. As bordas somem. Dois becks finos.", 17, [["verde", 36]], FOUR, [], "bite", {}],
    ["Cantos", "Os cantos saíram. Duas cores e ziplok.", 16, [["roxo", 24], ["ambar", 24]], FOUR, 10, "bite", {}],
    ["Estreito", "Só o corredor. A rosa no que sobrou.", 17, [["rosa", 34]], FOUR, [], "narrow", {}],
    ["Mesa", "Verde, rosa e ziplok na mesa curta.", 15, [["verde", 22], ["rosa", 22]], FOUR, 12, "bite", {}],
    ["Fundo", "Três cores, ziplok e o fundo fechado. O azul no bong.", 15, [["verde", 16], ["roxo", 16], ["rosa", 16]], FOUR, 14, "tight", {}],
    ["Vitrine", "Âmbar no tabuleiro curto.", 17, [["ambar", 36]], FOUR, [], "well", {}],
    ["Duas cores", "Verde e roxo, com casas a menos. Dois becks grossos.", 15, [["verde", 24], ["roxo", 24]], FOUR, [], "corners", {}],
    ["Trio", "A rosa de novo, no tabuleiro mordido.", 16, [["rosa", 32]], FOUR, [], "bite", {}],
    ["Lacre", "Roxo, âmbar e muito ziplok. Pouca mesa.", 14, [["roxo", 18], ["ambar", 18]], FOUR, 16, "tight", {}],
    ["Aperto", "Três flores, uns ziploks e o azul no bong. Aperta em cima.", 14, [["verde", 14], ["roxo", 14], ["rosa", 14]], FOUR, 12, "tight", {}],
    ["Beco", "Três colunas pro verde. Dois becks finos.", 16, [["verde", 30]], FOUR, [], "narrow", {}],
    ["Cheio", "Verde, rosa e ziplok sem as bordas. Um pipe.", 14, [["verde", 16], ["rosa", 16]], FOUR, 14, "bite", {}],
    ["Quatro", "Colombia Gold e Purple Haze no poço.", 15, [["ambar", 22], ["roxo", 22]], FOUR, [], "well", {}],
    ["Sem folga", "A mesa é uma cruz. Skunk, Purple Haze e ziplok.", 14, [["verde", 16], ["roxo", 16]], FOUR, 12, "tight", {}],
    ["Fecha", "Pouca mesa. Skunk, Purple Haze, Pink Kush e ziplok.", 14, [["verde", 14], ["roxo", 14], ["rosa", 14]], FOUR, 16, "tight", {}],
  ].forEach((row, i) => {
    const holes = i === 10
      ? holesFrom([[1, 0], [1, 6], [1, 6], [1, 6], [1, 6], [1, 6], [1, 6], [1, 0]])
      : i === 16
      ? holesFrom([[4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [0, 7], [0, 7], [0, 7]])
      : i === 15
      ? holesFrom([[4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7], [4, 7]])
      : i === 12
      ? holesFrom([[1, 0], [0, 7], [0, 7], [0, 7], [0, 7], [0, 7], [0, 7], [1, 0]])
      : i === 20
      ? holesFrom([[0, 7], [0, 7], [0, 7], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0]])
      : i === 21
      ? holesFrom([[1, 0], [1, 0], [0, 7], [0, 7], [0, 7], [0, 7], [1, 0], [1, 0]])
      : i === 11
      ? corners()
      : i === 14
      ? holesFrom([[0, 5], [0, 5], [0, 5], [0, 5], [0, 5], [0, 5], [0, 5], [0, 5]])
      : i === 22
      ? holesFrom([[1, 0], [1, 0], [0, 6], [0, 6], [0, 6], [0, 6], [1, 0], [1, 0]])
      : i === 18 || i === 24
      ? holesFrom([[1, 0], [1, 0], [2, 5], [2, 5], [2, 5], [2, 5], [1, 0], [1, 0]])
      : shapeHoles(i, 0);
    let jelly = jellyOf(row[5], holes);
    if ((typeof row[5] === "number" || (row[5] && row[5].length)) && jelly.length < 4) jelly = zips(typeof row[5] === "number" ? row[5] : 8, holes, []);
    addLevel("head", i, {
      name: row[0],
      teach: row[1],
      moves: Math.max(row[2], i < 8 ? 20 : i < 16 ? 18 : 16) + (i === 13 ? 5 : 0),
      goals: row[3],
      kinds: kindsFor(i, 0),
      jelly,
      holes,
      kit: row[7],
    });
  });
  function pushZone(zone, names, spec) {
    names.forEach((name, i) => addLevel(zone, i, spec(name, i)));
  }
  pushZone("hash", ["Massa", "Casca", "Miolo", "Laje", "Pedra", "Raspa", "Crosta", "Barra", "Mistura", "A prensa", "Bloco", "Fatia", "Núcleo", "Borda", "Dupla", "Fundo", "Casca fina", "Prensado", "Preto", "Canto", "Duas massas", "Estreito", "Poço", "Sem corte", "A pedreira"], (name, i) => {
    const holes = i === 15
      ? holesFrom([[4, 7], [4, 7], [0, 7], [0, 7], [0, 7], [0, 7], [4, 7], [4, 7]])
      : i === 7
      ? holesFrom(SPANS.pyramid)
      : i === 9
      ? holesFrom(SPANS.you)
      : i === 13
      ? holesFrom(SPANS.tee)
      : shapeHoles(i, 1);
    const hash = take(holes, [], i < 12 ? 4 : 6);
    const jelly = i >= 6 ? zipN(holes, hash, i >= 16 ? 10 : 6) : [];
    return {
      name,
      moves: movesAt(i),
      goals: colorGoals(i, 1),
      hash,
      jelly,
      holes,
      kit: i === 3 ? { bomba: 1 } : {},
      teach: say({
        hash: hash.length,
        jelly: jelly.length,
        holes: holes.length,
        teach: i === 0 ? "Se não corta, cresce. Junta a Skunk do lado." : i === 1 ? "Menos espaço. Junta a Purple Haze no haxixe." : i === 2 ? "Escada na direita. Colombia Gold no haxixe." : i === 3 ? "Um L. Pink Kush. O beck grosso come o haxixe." : i === 4 ? "Vão embaixo. Junta a Skunk no haxixe." : i === 5 ? "Seta pra baixo. Junta a Purple Haze no haxixe." : i === 6 ? "Dois becks grossos. Colombia Gold e Pink Kush." : i === 7 ? "Pirâmide. Pink Kush, ziplok e haxixe." : i === 8 ? "Diamante. Pink Kush e Nightdream Blue." : i === 9 ? "Um U. Skunk no bong. Nightdream Blue." : i === 10 ? "Coração. Colombia Gold e dois becks finos." : i === 11 ? "L na direita. Purple Haze e Colombia Gold." : i === 12 ? "Morro. Skunk, ziplok e haxixe." : i === 13 ? "Um T. Pink Kush e Nightdream Blue." : i === 14 ? "Degraus. Três cores. Skunk no bong." : i === 15 ? "T invertido. Pink Kush, ziplok e haxixe." : i === 16 ? "Diamante. Duas cores e dois becks grossos." : i === 17 ? "Círculo. Purple Haze, ziplok e haxixe." : i === 18 ? "Uma cruz. Pink Kush e Nightdream Blue." : i === 19 ? "Um T. Três cores. Skunk no bong." : i === 20 ? "Um U. Skunk, ziplok e dois becks finos." : i === 21 ? "Pirâmide. Duas cores e um pipe." : i === 22 ? "Escada na esquerda. Colombia Gold e haxixe." : i === 23 ? "Escada na direita. Pink Kush e Nightdream Blue." : i === 24 ? "L na esquerda. Três cores. Skunk no bong." : "",
      }),
    };
  });
  pushZone("crumble", ["Grade", "Cola", "Casquinha", "Pedra doce", "Laje", "Pó", "Dupla", "Fina", "Mistura", "Prensado", "Grude", "Ponto", "Faixa", "Dois lados", "Meleca", "Com haxixe", "Com ziplok", "Centro", "Canto", "Pouco espaço", "Três", "Fundo", "Denso", "Sem folga", "O rosin"], (name, i) => {
    const holes = i === 4 ? holesFrom(SPANS.you) : shapeHoles(i, 2);
    const locks = take(holes, [], i < 14 ? 4 : 6);
    const hash = i >= 8 ? take(holes, locks, 4) : [];
    const jelly = i >= 4 ? zipN(holes, locks.concat(hash), i >= 18 ? 10 : 6) : [];
    return {
      name,
      moves: movesAt(i),
      goals: colorGoals(i, 2),
      locks,
      hash,
      jelly,
      holes,
      teach: say({
        locks: locks.length,
        hash: hash.length,
        jelly: jelly.length,
        holes: holes.length,
        teach: i === 0 ? "Círculo. Skunk. Rosin prende. Junta pra soltar." : i === 1 ? "Coração. Purple Haze. O rosin prende." : i === 2 ? "Um H. Colombia Gold. O rosin prende." : i === 3 ? "Faixa no meio. Pink Kush. O rosin prende." : i === 4 ? "Um U. Nightdream Blue, ziplok e rosin." : i === 5 ? "Uma cruz. Purple Haze, ziplok e rosin." : i === 6 ? "L na direita. Duas cores e dois becks grossos." : "",
      }),
    };
  });
  pushZone("semente", ["Queda", "Fileira", "Caminho", "Duas", "Saco", "Broto", "Par", "Uma", "Com ziplok", "Colheita", "Descida", "Vaso", "Canteiro", "Com rosin", "Com haxixe", "Estreito", "Fundo", "Muitas", "Poucas", "Travada", "Mista", "Canto", "Cheia", "Sem espaço", "A colheita"], (name, i) => {
    const holes = shapeHoles(i, 3);
    const locks = i >= 8 ? take(holes, [], 4) : [];
    const hash = i >= 13 ? take(holes, locks, 4) : [];
    const seeds = seedN(holes, locks.concat(hash), i < 6 ? 4 : i < 14 ? 6 : 8);
    const jelly = i >= 4 ? zipN(holes, locks.concat(hash), 6) : [];
    return {
      name,
      moves: movesAt(i),
      goals: colorGoals(i, 3).concat([["semente", seeds]]),
      seeds,
      locks,
      hash,
      jelly,
      holes,
      teach: say({
        seeds,
        locks: locks.length,
        hash: hash.length,
        jelly: jelly.length,
        holes: holes.length,
        teach: i === 0 ? "A semente tem que cair embaixo." : "",
      }),
    };
  });
  pushZone("folha", ["Broto", "Camada", "Folhinha", "Duas", "Mato", "Rosa", "Par", "Leve", "Com ziplok", "Densa", "Corte", "Segunda", "Galho", "Com rosin", "Com haxixe", "Com semente", "Estreito", "Fundo", "Grossa", "Fina", "Mista", "Canto", "Cheia", "Sem folga", "A ganja"], (name, i) => {
    const holes = shapeHoles(i, 4);
    const cover = take(holes, [], i < 15 ? 4 : 6);
    const locks = i >= 7 ? take(holes, cover, 4) : [];
    const hash = i >= 11 ? take(holes, cover.concat(locks), 4) : [];
    const seeds = i === 15 || i >= 18 ? seedN(holes, cover.concat(locks, hash), 4) : 0;
    const jelly = i >= 3 ? zipN(holes, cover.concat(locks, hash), 6) : [];
    const metas = colorGoals(i, 4);
    if (i === 5 && metas[0]) metas[0][0] = "rosa";
    return {
      name,
      moves: movesAt(i),
      goals: metas.concat(seeds ? [["semente", seeds]] : []),
      cover,
      locks,
      hash,
      seeds,
      jelly,
      holes,
      teach: say({
        cover: cover.length,
        seeds,
        locks: locks.length,
        hash: hash.length,
        jelly: jelly.length,
        holes: holes.length,
        teach: i === 0 ? "A folha aguenta dois cortes." : "",
      }),
    };
  });
  pushZone("vidro", ["Cristal", "Lasca", "Pedra", "Junta", "Veio", "Brilho", "Par", "Um", "Cheio", "O crumble", "Com ziplok", "Com rosin", "Com haxixe", "Dois", "Fundo", "Menos espaço", "Trio", "Prensado", "Com folha", "Camada", "Com semente", "Estreito", "Denso", "Tudo junto", "O veio"], (name, i) => {
    const holes = shapeHoles(i, 5);
    const glass = take(holes, [], i < 16 ? 4 : 6);
    const locks = i >= 6 ? take(holes, glass, 4) : [];
    const hash = i >= 10 ? take(holes, glass.concat(locks), 4) : [];
    const cover = i >= 18 && i < 22 ? take(holes, glass.concat(locks, hash), 4) : [];
    const seeds = i === 20 || i === 22 || i === 23 ? seedN(holes, glass.concat(locks, hash, cover), 4) : 0;
    const jelly = i >= 3 ? zipN(holes, glass.concat(locks, hash, cover), i >= 14 ? 8 : 6) : [];
    return {
      name,
      moves: movesAt(i),
      goals: colorGoals(i, 5).concat(seeds ? [["semente", seeds]] : []),
      glass,
      locks,
      hash,
      cover,
      seeds,
      jelly,
      holes,
      kit: i === 0 ? { fino: 1 } : i === 1 ? { bomba: 1 } : {},
      teach: say({
        glass: glass.length,
        cover: cover.length,
        seeds,
        locks: locks.length,
        hash: hash.length,
        jelly: jelly.length,
        holes: holes.length,
        teach: i === 0 ? "O crumble não sai no match. Só um poder quebra." : i === 1 ? "O beck grosso derrete o crumble em volta." : "",
      }),
    };
  });
  const ZONES = {
    head: { name: "Head Shop", sub: "Fácil, médio, difícil. E de novo.", prev: null },
    hash: { name: "Haxixland", sub: "O haxixe cresce se você não corta.", prev: "head" },
    crumble: { name: "Rosin", sub: "O rosin prende a peça. Junta ela pra soltar.", prev: "hash" },
    semente: { name: "Semente", sub: "A semente tem que cair embaixo.", prev: "crumble" },
    folha: { name: "Folha", sub: "A folha aguenta dois cortes.", prev: "semente" },
    vidro: { name: "Crumble", sub: "O crumble só quebra com poder.", prev: "folha" },
  };
  function zoneLevels(zone) {
    return LEVELS.filter((lv) => lv.zone === zone);
  }
  function firesNeeded(zone) {
    const prev = ZONES[zone] && ZONES[zone].prev;
    if (!prev) return 0;
    return Math.ceil(zoneLevels(prev).length * 3 * 0.7);
  }
  function firesOf(stars, zone) {
    const bag = stars || {};
    return zoneLevels(zone).reduce((sum, lv) => sum + (bag[lv.id] || 0), 0);
  }
  function zoneOpen(stars, zone) {
    const need = firesNeeded(zone);
    if (!need) return true;
    return firesOf(stars, ZONES[zone].prev) >= need;
  }
  const STORY = [
    { id: "hire", flag: "hired" },
    { id: "hash", flag: "hashChegou", zone: "hash" },
    { id: "rosin", flag: "rosinChegou", zone: "crumble" },
    { id: "semente", flag: "sementeChegou", zone: "semente" },
    { id: "folha", flag: "folhaChegou", zone: "folha" },
    { id: "crumble", flag: "crumbleChegou", zone: "vidro" },
    { id: "balcao", flag: "balcaoCresceu", deep: "vidro" },
    { id: "cliente", flag: "clienteEncostou", full: "vidro" },
    { id: "pote", flag: "poteEntregue", full: "vidro" },
    { id: "saida", flag: "clienteSaiu", full: "vidro" },
    { id: "porta", flag: "portaFechou", full: "vidro" },
  ];
  function storyPassed(stars, step) {
    const bag = stars || {};
    if (step.zone) return zoneOpen(bag, step.zone);
    if (step.deep) return firesOf(bag, step.deep) >= firesNeeded(step.deep);
    if (step.full) return firesOf(bag, step.full) >= zoneLevels(step.full).length * 3;
    return true;
  }
  function storyFlag(id) {
    const step = STORY.filter((row) => row.id === id)[0];
    return step ? step.flag : "";
  }
  function nextStory(stars, seen) {
    const bag = seen || {};
    for (let i = 0; i < STORY.length; i += 1) {
      const step = STORY[i];
      if (!storyPassed(stars, step)) return "";
      if (!bag[step.flag]) return step.id;
    }
    return "";
  }
  function storyPassNext(cursor) {
    const at = STORY.findIndex((row) => row.id === cursor);
    const step = STORY[at + 1] || STORY[0];
    return step ? step.id : "";
  }
  function storyLevel(id) {
    const first = (zone) => {
      const list = zoneLevels(zone);
      return list.length ? list[0].id : 1;
    };
    if (id === "hire") return first("head");
    if (id === "hash") return first("hash");
    if (id === "rosin") return first("crumble");
    if (id === "semente") return first("semente");
    if (id === "folha") return first("folha");
    if (id === "crumble") return first("vidro");
    const vidro = zoneLevels("vidro");
    if (!vidro.length) return first("head");
    if (id === "balcao") {
      const idx = Math.min(vidro.length - 1, Math.ceil(firesNeeded("vidro") / 3));
      return vidro[idx].id;
    }
    if (id === "cliente" || id === "pote" || id === "saida" || id === "porta") return vidro[vidro.length - 1].id;
    return first("head");
  }

  function key(r, c) { return r + "," + c; }
  function inside(cell) {
    return !!cell && cell.r >= 0 && cell.c >= 0 && cell.r < ROWS && cell.c < COLS;
  }
  function adjacent(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
  }
  function tile(kind, power, fresh) {
    return { id: seq++, kind, power: power || null, fresh: !!fresh };
  }
  function cloneBoard(board) {
    return board.map((row) => row.map((cell) => (cell ? { ...cell, fresh: false, cut: false } : null)));
  }
  function cloneJelly(jelly) {
    return jelly.map((row) => row.slice());
  }

  function same(board, r, c, kind) {
    const cell = board[r] && board[r][c];
    return !!(cell && cell.kind === kind && cell.kind !== "hash" && cell.kind !== "vidro" && cell.kind !== "hole" && cell.kind !== "semente" && cell.kind !== "bomb" && cell.power !== "bomb" && cell.power !== "pipe");
  }

  function openKind(board, r, c) {
    const cell = board[r] && board[r][c];
    if (!cell || cell.kind === "hash" || cell.kind === "vidro" || cell.kind === "hole" || cell.kind === "semente" || cell.kind === "bomb" || cell.power === "bomb" || cell.power === "pipe") return null;
    return cell.kind;
  }

  function findClusters(board) {
    const mark = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const stamp = (cells) => {
      if (cells.length >= 3) cells.forEach((cell) => { mark[cell.r][cell.c] = true; });
    };
    for (let r = 0; r < ROWS; r += 1) {
      let run = [];
      for (let c = 0; c <= COLS; c += 1) {
        const kind = c < COLS ? openKind(board, r, c) : null;
        const prev = run.length ? openKind(board, run[0].r, run[0].c) : null;
        if (kind && (run.length === 0 || kind === prev)) run.push({ r, c });
        else { stamp(run); run = kind ? [{ r, c }] : []; }
      }
    }
    for (let c = 0; c < COLS; c += 1) {
      let run = [];
      for (let r = 0; r <= ROWS; r += 1) {
        const kind = r < ROWS ? openKind(board, r, c) : null;
        const prev = run.length ? openKind(board, run[0].r, run[0].c) : null;
        if (kind && (run.length === 0 || kind === prev)) run.push({ r, c });
        else { stamp(run); run = kind ? [{ r, c }] : []; }
      }
    }
    const seen = new Set();
    const clusters = [];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (!mark[r][c] || seen.has(key(r, c)) || !board[r][c]) continue;
        const kind = board[r][c].kind;
        const cells = [];
        const stack = [{ r, c }];
        while (stack.length) {
          const cur = stack.pop();
          const id = key(cur.r, cur.c);
          if (seen.has(id) || !mark[cur.r][cur.c]) continue;
          if (!same(board, cur.r, cur.c, kind)) continue;
          seen.add(id);
          cells.push(cur);
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
            const nr = cur.r + dr;
            const nc = cur.c + dc;
            if (nr >= 0 && nc >= 0 && nr < ROWS && nc < COLS) stack.push({ r: nr, c: nc });
          });
        }
        if (cells.length >= 3) clusters.push({ cells, kind, shape: shapeOf(cells) });
      }
    }
    for (let r = 0; r < ROWS - 1; r += 1) {
      for (let c = 0; c < COLS - 1; c += 1) {
        const kind = openKind(board, r, c);
        if (!kind) continue;
        const block = [{ r, c }, { r, c: c + 1 }, { r: r + 1, c }, { r: r + 1, c: c + 1 }];
        const square = block.every((cell) => !mark[cell.r][cell.c] && openKind(board, cell.r, cell.c) === kind);
        if (!square) continue;
        block.forEach((cell) => { mark[cell.r][cell.c] = true; });
        clusters.push({ cells: block, kind, shape: "sq" });
      }
    }
    return clusters;
  }

  function shapeOf(cells) {
    const rows = new Set(cells.map((cell) => cell.r));
    const cols = new Set(cells.map((cell) => cell.c));
    if (rows.size === 1) return "h";
    if (cols.size === 1) return "v";
    return "t";
  }

  function specialFor(cluster) {
    const n = cluster.cells.length;
    if (cluster.shape === "sq") return "pipe";
    if (n >= 5 && (cluster.shape === "h" || cluster.shape === "v")) return "bomb";
    if (n >= 5) return "wrap";
    if (n === 4 && cluster.shape === "h") return "row";
    if (n === 4 && cluster.shape === "v") return "col";
    return null;
  }

  function pickSpawn(cells, prefer) {
    const list = prefer || [];
    for (let i = 0; i < list.length; i += 1) {
      const p = list[i];
      if (p && cells.some((cell) => cell.r === p.r && cell.c === p.c)) return p;
    }
    return cells[Math.floor(cells.length / 2)];
  }

  function expand(board, dead, protect) {
    const seen = new Set(dead);
    const queue = Array.from(dead).map((id) => {
      const [r, c] = id.split(",").map(Number);
      return { r, c };
    });
    while (queue.length && seen.size < 70) {
      const cur = queue.shift();
      if (protect.has(key(cur.r, cur.c))) continue;
      const piece = board[cur.r] && board[cur.r][cur.c];
      if (!piece || !piece.power || piece.power === "bomb") continue;
      const extra = [];
      if (piece.power === "row") {
        for (let c = 0; c < COLS; c += 1) extra.push({ r: cur.r, c });
      } else if (piece.power === "col") {
        for (let r = 0; r < ROWS; r += 1) extra.push({ r, c: cur.c });
      } else if (piece.power === "wrap") {
        for (let dr = -1; dr <= 1; dr += 1) {
          for (let dc = -1; dc <= 1; dc += 1) extra.push({ r: cur.r + dr, c: cur.c + dc });
        }
      }
      extra.forEach((cell) => {
        if (!inside(cell)) return;
        const id = key(cell.r, cell.c);
        if (seen.has(id) || protect.has(id)) return;
        seen.add(id);
        queue.push(cell);
      });
    }
    protect.forEach((id) => seen.delete(id));
    return seen;
  }

  function isHash(cell) {
    return !!(cell && cell.kind === "hash");
  }
  function isGlass(cell) {
    return !!(cell && cell.kind === "vidro");
  }
  function isHole(cell) {
    return !!(cell && cell.kind === "hole");
  }
  function stuck(cell) {
    return isHash(cell) || isGlass(cell) || isHole(cell) || !!(cell && cell.lock);
  }

  function skyOpen(board, top, c) {
    for (let r = 0; r < top; r += 1) {
      if (!isHole(board[r][c])) return false;
    }
    return true;
  }

  function dropColumns(board, kinds, random) {
    for (let c = 0; c < COLS; c += 1) {
      let r = ROWS - 1;
      while (r >= 0) {
        if (stuck(board[r][c])) { r -= 1; continue; }
        let top = r;
        while (top - 1 >= 0 && !stuck(board[top - 1][c])) top -= 1;
        const kept = [];
        for (let i = r; i >= top; i -= 1) {
          if (board[i][c] && !stuck(board[i][c])) {
            if (typeof board[i][c]._from !== "number") board[i][c]._from = i;
            kept.push(board[i][c]);
          }
        }
        const spawn = skyOpen(board, top, c);
        for (let i = r; i >= top; i -= 1) {
          if (kept.length) {
            const item = kept.shift();
            item.fresh = item._from !== i;
            board[i][c] = item;
          } else if (spawn) {
            board[i][c] = tile(kinds[Math.floor(random() * kinds.length)], null, true);
          } else {
            board[i][c] = null;
          }
        }
        r = top - 1;
      }
    }
  }

  function slideSide(board) {
    let moved = false;
    for (let r = ROWS - 1; r > 0; r -= 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (board[r][c] !== null) continue;
        if (!stuck(board[r - 1][c])) continue;
        const dirs = [-1, 1];
        for (let i = 0; i < dirs.length; i += 1) {
          const nc = c + dirs[i];
          if (nc < 0 || nc >= COLS) continue;
          const src = board[r - 1][nc];
          if (!src || stuck(src) || src.seed || src.kind === "semente") continue;
          if (typeof src._from !== "number") src._from = r - 1;
          if (typeof src._fromC !== "number") src._fromC = nc;
          src.fresh = true;
          board[r][c] = src;
          board[r - 1][nc] = null;
          moved = true;
          break;
        }
      }
    }
    return moved;
  }

  function collapse(board, kinds, random) {
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (board[r][c]) {
          delete board[r][c]._from;
          delete board[r][c]._fromC;
        }
      }
    }
    dropColumns(board, kinds, random);
    for (let pass = 0; pass < 8; pass += 1) {
      if (!slideSide(board)) break;
      dropColumns(board, kinds, random);
    }
  }

  function chewHash(board, dead) {
    const extra = [];
    dead.forEach((id) => {
      const [r, c] = id.split(",").map(Number);
      const piece = board[r] && board[r][c];
      if (!piece || piece.kind === "hash") return;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) return;
        const next = board[nr][nc];
        const hid = key(nr, nc);
        if (next && next.kind === "hash" && !dead.has(hid)) extra.push(hid);
      });
    });
    extra.forEach((id) => dead.add(id));
  }

  function spreadHash(board, random, cover, jelly) {
    const seen = new Set();
    const blobs = [];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (!isHash(board[r][c]) || seen.has(key(r, c))) continue;
        const blob = [];
        const stack = [{ r, c }];
        while (stack.length) {
          const cur = stack.pop();
          const id = key(cur.r, cur.c);
          if (seen.has(id) || !board[cur.r] || !isHash(board[cur.r][cur.c])) continue;
          seen.add(id);
          blob.push(cur);
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
            const nr = cur.r + dr;
            const nc = cur.c + dc;
            if (nr >= 0 && nc >= 0 && nr < ROWS && nc < COLS) stack.push({ r: nr, c: nc });
          });
        }
        blobs.push(blob);
      }
    }
    const taken = new Set();
    blobs.forEach((blob) => {
      const options = [];
      blob.forEach((cell) => {
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
          const nr = cell.r + dr;
          const nc = cell.c + dc;
          if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS) return;
          const id = key(nr, nc);
          if (taken.has(id)) return;
          const piece = board[nr][nc];
          if (!piece || piece.kind === "hash" || piece.kind === "hole" || piece.kind === "vidro" || piece.kind === "semente" || piece.seed || piece.lock || piece.power) return;
          if (cover && cover[nr] && cover[nr][nc]) return;
          if (jelly && jelly[nr] && jelly[nr][nc]) return;
          options.push({ r: nr, c: nc, id });
        });
      });
      if (!options.length) return;
      const pick = options[Math.floor(random() * options.length)];
      taken.add(pick.id);
      const was = board[pick.r][pick.c].kind;
      const born = tile("hash", null, false);
      born.grown = was;
      board[pick.r][pick.c] = born;
    });
  }

  function columnFloor(board, c) {
    for (let r = ROWS - 1; r >= 0; r -= 1) {
      if (board[r][c] && board[r][c].kind === "hole") continue;
      return r;
    }
    return -1;
  }

  function columnTop(board, c) {
    for (let r = 0; r < ROWS; r += 1) {
      if (!(board[r][c] && board[r][c].kind === "hole")) return r;
    }
    return -1;
  }

  function snapBoard(board) {
    return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
  }

  function floorSeeds(board) {
    const found = [];
    for (let c = 0; c < COLS; c += 1) {
      const floor = columnFloor(board, c);
      if (floor < 0) continue;
      const piece = board[floor][c];
      if (piece && piece.seed) found.push({ r: floor, c: c });
    }
    return found;
  }

  function deliverSeeds(board, got, kinds, random, queue) {
    const quadros = [];
    let pending = queue || 0;
    for (let pass = 0; pass < 6; pass += 1) {
      const piso = floorSeeds(board);
      if (!piso.length) break;
      quadros.push({ board: snapBoard(board), piso: piso });
      const cols = [];
      piso.forEach((cell) => {
        got.semente = (got.semente || 0) + 1;
        board[cell.r][cell.c] = null;
        cols.push(cell.c);
      });
      collapse(board, kinds, random);
      cols.forEach((c) => {
        if (pending <= 0) return;
        let spot = -1;
        for (let r = 0; r < ROWS; r += 1) {
          const piece = board[r][c];
          if (!piece || !piece.fresh || typeof piece._from === "number") continue;
          if (piece.seed || piece.lock || piece.power) continue;
          if (piece.kind === "hash" || piece.kind === "vidro" || piece.kind === "hole" || piece.kind === "semente") continue;
          spot = r;
          break;
        }
        if (spot < 0) return;
        const born = tile("semente", null, true);
        born.seed = true;
        board[spot][c] = born;
        pending -= 1;
      });
    }
    return { pending: pending, quadros: quadros };
  }

  function applyWave(state, prefer, combo, random, preset) {
    const board = cloneBoard(state.board);
    const jelly = cloneJelly(state.jelly);
    const cover = cloneJelly(state.cover || []);
    const clusters = preset ? [] : findClusters(board);
    if (!preset && !clusters.length) return null;
    const spawned = [];
    const protect = new Set();
    let dead = new Set(preset || []);
    clusters.forEach((cluster) => {
      const power = specialFor(cluster);
      const spawn = power ? pickSpawn(cluster.cells, prefer) : null;
      cluster.cells.forEach((cell) => {
        const id = key(cell.r, cell.c);
        if (spawn && cell.r === spawn.r && cell.c === spawn.c) protect.add(id);
        else dead.add(id);
      });
      if (spawn) spawned.push({ r: spawn.r, c: spawn.c, kind: cluster.kind, power });
    });
    if (!dead.size && !spawned.length) return null;
    dead = expand(board, dead, protect);
    const spared = [];
    const nicked = [];
    dead.forEach((id) => {
      const [r, c] = id.split(",").map(Number);
      const piece = board[r] && board[r][c];
      if (!piece) return;
      if (piece.seed || piece.kind === "semente") spared.push(id);
      else if (cover[r] && cover[r][c] > 1) nicked.push(id);
    });
    let sparedScore = 0;
    spared.forEach((id) => {
      dead.delete(id);
      const [r, c] = id.split(",").map(Number);
      const piece = board[r] && board[r][c];
      if (jelly[r] && jelly[r][c]) {
        jelly[r][c] = 0;
        sparedScore += 40 * combo;
      }
      if (cover[r] && cover[r][c] > 0) {
        if (cover[r][c] > 1 && piece) piece.cut = true;
        cover[r][c] -= 1;
        sparedScore += 30 * combo;
      }
    });
    nicked.forEach((id) => {
      dead.delete(id);
      const [r, c] = id.split(",").map(Number);
      const piece = board[r] && board[r][c];
      if (cover[r] && cover[r][c] > 1) {
        if (piece) piece.cut = true;
        cover[r][c] -= 1;
        sparedScore += 30 * combo;
      }
    });
    if (!dead.size && !spawned.length && !sparedScore) return null;
    chewHash(board, dead);
    const cleared = [];
    let score = sparedScore;
    const got = { ...state.got };
    const queue = state.seedQueue || 0;
    dead.forEach((id) => {
      const [r, c] = id.split(",").map(Number);
      const piece = board[r][c];
      if (!piece || piece.kind === "hole") return;
      cleared.push({ r, c, kind: piece.kind, power: piece.power });
      if (piece.kind === "hash" || piece.kind === "vidro") score += 50 * combo;
      else if (piece.kind !== "bomb") {
        got[piece.kind] = (got[piece.kind] || 0) + 1;
        score += (piece.power ? 70 : 35) * combo;
      }
      if (piece.power === "row" || piece.power === "col") got.fino = (got.fino || 0) + 1;
      else if (piece.power === "wrap") got.bomba = (got.bomba || 0) + 1;
      else if (piece.power === "pipe") got.pipe = (got.pipe || 0) + 1;
      else if (piece.power === "bomb") got.bong = (got.bong || 0) + 1;
      if (jelly[r][c]) {
        jelly[r][c] = 0;
        score += 40 * combo;
      }
      if (cover[r] && cover[r][c] > 0) {
        cover[r][c] -= 1;
        score += 30 * combo;
      }
      board[r][c] = null;
    });
    spawned.forEach((item) => {
      board[item.r][item.c] = tile(item.kind, item.power, true);
      score += 100;
    });
    collapse(board, state.kinds, random);
    const entrega = deliverSeeds(board, got, state.kinds, random, queue);
    const seedQueue = entrega.pending;
    return {
      cleared,
      spawned,
      score,
      combo,
      chegadas: entrega.quadros,
      power: cleared.some((cell) => cell.power),
      state: {
        ...state,
        board,
        jelly,
        cover,
        got,
        seedQueue,
        score: state.score + score,
      },
    };
  }

  function paintSpecial(dead, r, c, power, board) {
    const add = (rr, cc) => {
      if (rr < 0 || cc < 0 || rr >= ROWS || cc >= COLS) return;
      const piece = board[rr] && board[rr][cc];
      if (piece && piece.kind === "hole") return;
      dead.add(key(rr, cc));
    };
    add(r, c);
    if (power === "row") for (let cc = 0; cc < COLS; cc += 1) add(r, cc);
    else if (power === "col") for (let rr = 0; rr < ROWS; rr += 1) add(rr, c);
    else if (power === "wrap") {
      for (let dr = -2; dr <= 2; dr += 1) {
        for (let dc = -2; dc <= 2; dc += 1) add(r + dr, c + dc);
      }
    } else if (power === "bomb") {
      for (let rr = 0; rr < ROWS; rr += 1) {
        for (let cc = 0; cc < COLS; cc += 1) if (board[rr][cc]) add(rr, cc);
      }
    }
  }

  function aimPipe(board, jelly, avoid, random) {
    const zips = [];
    const rest = [];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const id = key(r, c);
        if (avoid.has(id) || !board[r][c]) continue;
        if (jelly[r][c]) zips.push(id);
        else rest.push(id);
      }
    }
    const pool = zips.length ? zips : rest;
    if (!pool.length) return null;
    return pool[Math.floor(random() * pool.length)];
  }

  function playMove(state, a, b, random) {
    if (!inside(a) || !inside(b) || !adjacent(a, b)) return null;
    const board = cloneBoard(state.board);
    const A = board[a.r][a.c];
    const B = board[b.r][b.c];
    if (!A || !B || A.kind === "hash" || B.kind === "hash" || A.kind === "vidro" || B.kind === "vidro" || A.kind === "hole" || B.kind === "hole" || A.lock || B.lock || A.seed || B.seed || A.kind === "semente" || B.kind === "semente") return null;
    board[a.r][a.c] = B;
    board[b.r][b.c] = A;
    const bomb = A.power === "bomb" || B.power === "bomb";
    const pipe = A.power === "pipe" || B.power === "pipe";
    const pair = !!(A.power && B.power);
    if (!bomb && !pipe && !pair && !findClusters(board).length) return null;
    let current = {
      ...state,
      board,
      jelly: cloneJelly(state.jelly),
      got: { ...state.got },
      moves: state.moves - 1,
    };
    const waves = [];
    if (bomb || pipe || pair) {
      const dead = new Set();
      if (A.power === "bomb" && B.power === "bomb") {
        paintSpecial(dead, a.r, a.c, "bomb", board);
      } else if (bomb) {
        const color = A.power === "bomb" ? B : A;
        const pos = A.power === "bomb" ? b : a;
        dead.add(key(pos.r, pos.c));
        for (let r = 0; r < ROWS; r += 1) {
          for (let c = 0; c < COLS; c += 1) {
            if (board[r][c] && board[r][c].kind === color.kind) dead.add(key(r, c));
          }
        }
      } else if (pipe) {
        if (A.power === "pipe") dead.add(key(b.r, b.c));
        if (B.power === "pipe") dead.add(key(a.r, a.c));
        const other = A.power === "pipe" ? B : A;
        const otherAt = A.power === "pipe" ? a : b;
        if (other.power && other.power !== "pipe") paintSpecial(dead, otherAt.r, otherAt.c, other.power, board);
        const hit = aimPipe(board, current.jelly, dead, random);
        if (hit) dead.add(hit);
        if (A.power === "pipe" && B.power === "pipe") {
          const hit2 = aimPipe(board, current.jelly, dead, random);
          if (hit2) dead.add(hit2);
        }
      } else {
        paintSpecial(dead, a.r, a.c, A.power, board);
        paintSpecial(dead, b.r, b.c, B.power, board);
      }
      const first = applyWave(current, null, 1, random, dead);
      if (first) {
        if (bomb && !(A.power === "bomb" && B.power === "bomb")) {
          const color = A.power === "bomb" ? B : A;
          first.bong = color.kind;
          first.state.got["bong-" + color.kind] = (first.state.got["bong-" + color.kind] || 0) + 1;
        }
        waves.push(first);
        current = first.state;
      }
    }
    let combo = waves.length + 1;
    let prefer = [b, a];
    for (let n = 0; n < 30; n += 1) {
      const wave = applyWave(current, prefer, combo, random, null);
      if (!wave) break;
      waves.push(wave);
      current = wave.state;
      prefer = null;
      combo += 1;
    }
    const ate = waves.some((wave) => wave.cleared.some((cell) => cell.kind === "hash"));
    if (!ate && hashLeft({ board: current.board })) spreadHash(current.board, random, current.cover, current.jelly);
    return { state: current, waves };
  }

  function hasMove(board) {
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const tries = [{ r, c: c + 1 }, { r: r + 1, c }];
        for (let i = 0; i < tries.length; i += 1) {
          const other = tries[i];
          if (other.c >= COLS || other.r >= ROWS) continue;
          const A = board[r][c];
          const B = board[other.r][other.c];
          if (!A || !B || A.kind === "hash" || B.kind === "hash" || A.kind === "vidro" || B.kind === "vidro" || A.kind === "hole" || B.kind === "hole" || A.lock || B.lock || A.seed || B.seed || A.kind === "semente" || B.kind === "semente") continue;
          if (A.power === "bomb" || B.power === "bomb" || A.power === "pipe" || B.power === "pipe" || (A.power && B.power)) return true;
          const copy = cloneBoard(board);
          copy[r][c] = { ...B };
          copy[other.r][other.c] = { ...A };
          if (findClusters(copy).length) return true;
        }
      }
    }
    return false;
  }

  function anchored(cell) {
    return !cell || cell.kind === "hash" || cell.kind === "vidro" || cell.kind === "hole" || cell.kind === "semente" || cell.seed || cell.lock;
  }

  function shuffle(board, random) {
    const roll = random || Math.random;
    const spots = [];
    const bag = [];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const cell = board[r][c];
        if (anchored(cell)) continue;
        spots.push([r, c]);
        const piece = { ...cell, fresh: false };
        delete piece._from;
        bag.push(piece);
      }
    }
    if (bag.length < 2) return board;
    const deal = (order) => {
      for (let i = 0; i < spots.length; i += 1) {
        const spot = spots[i];
        board[spot[0]][spot[1]] = { ...order[i], fresh: false };
      }
    };
    let playable = null;
    let quiet = null;
    for (let n = 0; n < 40; n += 1) {
      const order = bag.map((piece) => ({ ...piece }));
      for (let i = order.length - 1; i > 0; i -= 1) {
        const j = Math.floor(roll() * (i + 1));
        const swap = order[i];
        order[i] = order[j];
        order[j] = swap;
      }
      deal(order);
      const open = !findClusters(board).length;
      const move = hasMove(board);
      if (open && move) return board;
      if (move && !playable) playable = order;
      if (open && !quiet) quiet = order;
    }
    if (playable) deal(playable);
    else if (quiet) deal(quiet);
    return board;
  }

  function fillBoard(kinds, random) {
    const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        for (let n = 0; n < 12; n += 1) {
          const kind = kinds[Math.floor(random() * kinds.length)];
          board[r][c] = tile(kind);
          const left = c >= 2 && board[r][c - 1].kind === kind && board[r][c - 2].kind === kind;
          const up = r >= 2 && board[r - 1][c].kind === kind && board[r - 2][c].kind === kind;
          const square = r >= 1 && c >= 1
            && board[r][c - 1].kind === kind
            && board[r - 1][c].kind === kind
            && board[r - 1][c - 1].kind === kind;
          if (!left && !up && !square) break;
        }
      }
    }
    return board;
  }

  function punch(board, holes) {
    (holes || []).forEach(([r, c]) => {
      if (board[r]) board[r][c] = { id: 0, kind: "hole", power: null, fresh: false };
    });
  }

  function create(level, random) {
    const roll = random || Math.random;
    let board = fillBoard(level.kinds, roll);
    punch(board, level.holes);
    let placed = stampBoard(board, level, roll);
    let guard = 0;
    while ((findClusters(board).length || !hasMove(board)) && guard < 40) {
      board = fillBoard(level.kinds, roll);
      punch(board, level.holes);
      placed = stampBoard(board, level, roll);
      guard += 1;
    }
    const jelly = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    (level.jelly || []).forEach(([r, c]) => {
      if (board[r][c] && board[r][c].kind !== "hole") jelly[r][c] = 1;
    });
    const cover = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    (level.cover || []).forEach(([r, c]) => {
      if (board[r][c] && board[r][c].kind !== "hole") cover[r][c] = 2;
    });
    return {
      level,
      kinds: level.kinds,
      board,
      jelly,
      cover,
      seedQueue: Math.max(0, (level.seeds || 0) - placed),
      moves: level.moves,
      score: 0,
      got: {},
    };
  }

  function stampBoard(board, level, random) {
    stampHash(board, level.hash);
    (level.glass || []).forEach(([r, c]) => {
      if (board[r] && board[r][c] && board[r][c].kind !== "hole") board[r][c] = tile("vidro");
    });
    const meta = level.goals && level.goals[0] ? String(level.goals[0].kind || "").replace(/^bong-/, "") : "";
    const mesma = meta === "verde" || meta === "roxo" || meta === "ambar" || meta === "rosa" || meta === "azul" || meta === "branco";
    (level.locks || []).forEach(([r, c]) => {
      const cell = board[r] && board[r][c];
      if (!cell || cell.kind === "hash" || cell.kind === "vidro" || cell.kind === "hole") return;
      const antes = cell.kind;
      if (mesma) cell.kind = meta;
      cell.lock = true;
      if (mesma && findClusters(board).some((cluster) => cluster.cells.some((spot) => spot.r === r && spot.c === c))) cell.kind = antes;
    });
    const blocked = new Set((level.jelly || []).concat(level.cover || []).map(([r, c]) => r + "," + c));
    const want = level.seeds || 0;
    const spots = [];
    for (let c = 0; c < COLS; c += 1) {
      let top = -1;
      for (let r = 0; r < ROWS; r += 1) {
        if (board[r][c] && board[r][c].kind !== "hole") { top = r; break; }
      }
      if (top < 0) continue;
      const floor = columnFloor(board, c);
      for (let r = top; r < Math.min(ROWS, top + 3); r += 1) {
        if (r === floor) continue;
        if (blocked.has(r + "," + c)) continue;
        const cell = board[r][c];
        if (!cell || cell.kind === "hole" || cell.lock || cell.kind === "hash" || cell.kind === "vidro") continue;
        spots.push([r, c]);
      }
    }
    let placed = 0;
    while (placed < want && spots.length) {
      const i = Math.floor(random() * spots.length);
      const spot = spots.splice(i, 1)[0];
      const born = tile("semente", null, true);
      born.seed = true;
      board[spot[0]][spot[1]] = born;
      placed += 1;
    }
    return placed;
  }

  function stampHash(board, cells) {
    (cells || []).forEach(([r, c]) => {
      if (board[r] && (!board[r][c] || board[r][c].kind !== "hole")) board[r][c] = tile("hash");
    });
  }

  function hashLeft(state) {
    let n = 0;
    state.board.forEach((row) => row.forEach((cell) => { if (isHash(cell)) n += 1; }));
    return n;
  }

  function countBoard(state, pred) {
    let n = 0;
    state.board.forEach((row) => row.forEach((cell) => { if (pred(cell)) n += 1; }));
    return n;
  }
  function lockLeft(state) { return countBoard(state, (cell) => cell && cell.lock); }
  function glassLeft(state) { return countBoard(state, isGlass); }

  function coverLeft(state) {
    let n = 0;
    (state.cover || []).forEach((row) => row.forEach((cell) => { if (cell) n += 1; }));
    return n;
  }

  function coverTalk(state) {
    let thick = false;
    (state.cover || []).forEach((row) => row.forEach((cell) => { if (cell > 1) thick = true; }));
    return thick ? "A folha aguenta dois cortes." : "A folha aguenta mais um corte.";
  }

  function jellyLeft(state) {
    let n = 0;
    state.jelly.forEach((row) => row.forEach((cell) => { if (cell) n += 1; }));
    return n;
  }

  function won(state) {
    const level = state.level;
    for (let i = 0; i < level.goals.length; i += 1) {
      const goal = level.goals[i];
      if ((state.got[goal.kind] || 0) < goal.n) return false;
    }
    if ((level.jelly || []).length && jellyLeft(state) > 0) return false;
    if ((level.hash || []).length && hashLeft(state) > 0) return false;
    if ((level.locks || []).length && lockLeft(state) > 0) return false;
    if ((level.glass || []).length && glassLeft(state) > 0) return false;
    if ((level.cover || []).length && coverLeft(state) > 0) return false;
    return true;
  }

  function shortLine(level, state) {
    const goals = (level && level.goals) || [];
    const got = (state && state.got) || {};
    for (let i = 0; i < goals.length; i += 1) {
      const goal = goals[i];
      const have = got[goal.kind] || 0;
      if (have < goal.n) return have + " de " + goal.n + " " + goal.label + ". Mais uma.";
    }
    if ((level.jelly || []).length && jellyLeft(state) > 0) {
      const n = level.jelly.length;
      return (n - jellyLeft(state)) + " de " + n + " ziploks. Mais uma.";
    }
    if ((level.hash || []).length && hashLeft(state) > 0) return hashLeft(state) + " haxixe na mesa. Mais uma.";
    if ((level.locks || []).length && lockLeft(state) > 0) {
      const n = level.locks.length;
      return Math.max(0, n - lockLeft(state)) + " de " + n + " rosin. Mais uma.";
    }
    if ((level.glass || []).length && glassLeft(state) > 0) {
      const n = level.glass.length;
      return Math.max(0, n - glassLeft(state)) + " de " + n + " crumble. Mais uma.";
    }
    if ((level.cover || []).length && coverLeft(state) > 0) {
      const n = level.cover.length;
      return Math.max(0, n - coverLeft(state)) + " de " + n + " folhas de ganja. Mais uma.";
    }
    return "";
  }

  function starsFor(level, score, didWin) {
    if (!didWin) return 0;
    if (score >= level.stars[2]) return 3;
    if (score >= level.stars[1]) return 2;
    return 1;
  }

  function blast(state, cells, random) {
    const dead = new Set();
    cells.forEach((cell) => {
      if (inside(cell) && state.board[cell.r][cell.c]) dead.add(key(cell.r, cell.c));
    });
    if (!dead.size) return null;
    let current = {
      ...state,
      board: cloneBoard(state.board),
      jelly: cloneJelly(state.jelly),
      got: { ...state.got },
    };
    const waves = [];
    const first = applyWave(current, null, 1, random, dead);
    if (!first) return null;
    waves.push(first);
    current = first.state;
    let combo = 2;
    for (let n = 0; n < 30; n += 1) {
      const wave = applyWave(current, null, combo, random, null);
      if (!wave) break;
      waves.push(wave);
      current = wave.state;
      combo += 1;
    }
    const ate = waves.some((wave) => wave.cleared.some((cell) => cell.kind === "hash"));
    if (!ate && hashLeft(current)) spreadHash(current.board, random, current.cover, current.jelly);
    return { state: current, waves };
  }

  function dragTalk(board, a, b) {
    if (!board || !a || !b || !board[a.r] || !board[b.r]) return "";
    const A = board[a.r][a.c];
    const B = board[b.r][b.c];
    if ((A && (A.seed || A.kind === "semente")) || (B && (B.seed || B.kind === "semente"))) return "A semente não anda. Ela só cai.";
    if ((A && A.lock) || (B && B.lock)) return "O rosin prende. Junta a peça presa pra soltar.";
    if ((A && A.kind === "hash") || (B && B.kind === "hash")) return "O haxixe cresce se você não corta. Junta do lado.";
    if ((A && A.kind === "vidro") || (B && B.kind === "vidro")) return "O crumble não sai no match. Só um poder quebra.";
    return "";
  }

  return {
    COLS, ROWS, GLYPH, LEVELS, ZONES,
    create, playMove, findClusters, specialFor, won, hasMove, shuffle, starsFor, shortLine, jellyLeft, hashLeft, lockLeft, glassLeft, coverLeft, coverTalk, dragTalk, tile,
    adjacent, inside, blast, firesNeeded, firesOf, zoneOpen, zoneLevels, storyFlag, nextStory, storyPassNext, storyLevel,
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = HempKush;

const VERSOES = [
  {
    nome: "1.4",
    notas: [
      "O bong puxa a mesa e sobe.",
    ],
  },
  {
    nome: "1.3",
    notas: [
      "O fino se bola com as peças e aparece enrolado.",
      "O fino queima a fileira do começo ao fim.",
      "A bomba acende a área como a ponta do beck.",
    ],
  },
  {
    nome: "1.2",
    notas: [
      "O segundo corte leva a folha. A flor estoura.",
    ],
  },
  {
    nome: "1.1",
    notas: [
      "O ziplok abre e a flor estoura.",
      "O crumble quebra e o caco sai.",
      "O primeiro corte encolhe a folha. A flor fica.",
      "A próxima semente cai do alto. A flor que estava fica.",
      "Na cena do haxixe, o bloco cresce na casa da flor.",
      "Na cena da semente, ela encosta no chão e sai.",
      "Quando o haxixe nasce, ele cresce na casa da flor.",
      "A semente encosta no chão e a conta sobe. Depois o lugar fecha.",
      "Quando a peça vem do lado, a queda começa de lá.",
      "No match, sai a peça que chegou. A outra fica.",
      "Na cena do haxixe, o bloco é um só.",
      "Na cena do crumble, o caco é um só.",
      "Quando a peça assenta, a cascata segue.",
      "A conta entra pelo nome e a senha. O progresso guarda na loja.",
    ],
  },
];
const VERSAO = VERSOES[0].nome;

function boot() {
  const mapEl = document.getElementById("screen-map");
  const titleEl = document.getElementById("screen-title");
  const districtEl = document.getElementById("screen-district");
  const playEl = document.getElementById("screen-play");
  const boardEl = document.getElementById("board");
  const loading = document.getElementById("loading");
  const loadText = document.getElementById("load-text");
  const modal = document.getElementById("modal");
  const SAVE = "hemp-kush-v3";
  const SESSAO = "hemp-kush-sessao";
  let endNota = "";
  let progress = loadProgress();
  let currentZone = "head";
  let state = null;
  let level = null;
  let locked = false;
  let selected = null;
  let pointer = null;
  let armed = null;
  let kit = { bong: 0, bloco: 0, pipe: 0, seda: 0, lata: 0 };

  const Snd = {
    ctx: null,
    go() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!this.ctx) this.ctx = new AC();
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    },
    beep(freq, dur, type, vol) {
      const ctx = this.go();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    },
    swap() { this.beep(196, 0.05, "square", 0.03); },
    pop(combo) { this.beep(392 + combo * 48, 0.07, "triangle", 0.05); },
    power() { this.beep(130, 0.14, "sawtooth", 0.04); },
    win() {
      [523, 659, 784].forEach((freq, i) => setTimeout(() => this.beep(freq, 0.12, "triangle", 0.05), i * 90));
    },
    lose() { this.beep(146, 0.22, "sine", 0.05); },
  };

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(SAVE) || "{}"); }
    catch (err) { return {}; }
  }
  function loadSessao() {
    try { return JSON.parse(localStorage.getItem(SESSAO) || "null"); }
    catch (err) { return null; }
  }
  function saveSessao(sess) {
    if (!sess) localStorage.removeItem(SESSAO);
    else localStorage.setItem(SESSAO, JSON.stringify({ nome: sess.nome, token: sess.token }));
  }
  function mergeFicha(base, extra) {
    const out = Object.assign({}, base || {});
    const stars = Object.assign({}, (base && base.stars) || {});
    const best = Object.assign({}, (base && base.best) || {});
    const theirs = extra || {};
    Object.keys(theirs.stars || {}).forEach((id) => {
      stars[id] = Math.max(Number(stars[id]) || 0, Number(theirs.stars[id]) || 0);
    });
    Object.keys(theirs.best || {}).forEach((id) => {
      best[id] = Math.max(Number(best[id]) || 0, Number(theirs.best[id]) || 0);
    });
    out.stars = stars;
    out.best = best;
    Object.keys(theirs).forEach((key) => {
      if (key === "stars" || key === "best") return;
      if (theirs[key]) out[key] = 1;
    });
    return out;
  }
  function saveProgress() {
    localStorage.setItem(SAVE, JSON.stringify(progress));
    const sess = loadSessao();
    if (!sess || !sess.token) return;
    fetch("/guardar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: sess.token, ficha: progress }),
    }).catch(() => {});
  }
  function paintConta() {
    const btn = document.getElementById("title-conta");
    const sair = document.getElementById("conta-sair");
    const sess = loadSessao();
    if (btn) btn.textContent = sess && sess.nome ? sess.nome : "Entrar";
    if (sair) sair.hidden = !(sess && sess.token);
  }
  function avisoConta(texto) {
    const aviso = document.getElementById("conta-aviso");
    if (aviso) aviso.textContent = texto || "";
  }
  async function pullConta() {
    paintConta();
    const sess = loadSessao();
    if (!sess || !sess.token) return;
    try {
      const res = await fetch("/sessao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sess.token }),
      });
      if (!res.ok) {
        saveSessao(null);
        paintConta();
        return;
      }
      const data = await res.json();
      progress = mergeFicha(progress, data.ficha);
      saveProgress();
      paintConta();
    } catch (err) {}
  }
  function fireRow(n) {
    return [0, 1, 2].map((i) => '<i class="' + (i < n ? "on" : "") + '">🔥</i>').join("");
  }
  const HEAT = { facil: "Fácil", medio: "Médio", dificil: "Difícil" };
  function unlocked(id) {
    const lv = HempKush.LEVELS[id - 1];
    if (!lv || !HempKush.zoneOpen(progress.stars || {}, lv.zone)) return false;
    const prev = HempKush.LEVELS[id - 2];
    if (!prev || prev.zone !== lv.zone) return true;
    return !!((progress.stars || {})[prev.id]);
  }
  function paintDistrict() {
    const box = document.getElementById("dist-path");
    const zone = HempKush.ZONES[currentZone] || HempKush.ZONES.head;
    const title = document.getElementById("dist-title");
    const sub = document.getElementById("dist-sub");
    if (title) title.textContent = zone.name;
    if (sub) sub.textContent = zone.sub;
    if (!box) return;
    box.innerHTML = "";
    HempKush.zoneLevels(currentZone).forEach((lv, index) => {
      const stars = (progress.stars && progress.stars[lv.id]) || 0;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pin-node heat-" + (lv.heat || "facil") + (unlocked(lv.id) ? "" : " locked");
      btn.innerHTML = '<span class="pin">' + (index + 1) + '</span><span class="nm">' + lv.name + '</span><span class="heat">' + (HEAT[lv.heat] || "") + '</span><span class="fires">' + fireRow(stars) + "</span>";
      btn.addEventListener("click", () => openBrief(lv.id, index + 1));
      box.appendChild(btn);
    });
  }
  const CHAPTERS = [
    { id: "head", name: "Head Shop", bg: "trilha-head.jpg", portrait: "loja-recebe.jpg", focus: "center 36%", road: "#f6c453", edge: "#c9842c" },
    { id: "hash", name: "Haxixland", bg: "trilha-hash.jpg", portrait: "loja-haxixe.jpg", focus: "center 96%", road: "#d58bff", edge: "#7a3cb8" },
    { id: "crumble", name: "Rosin", bg: "trilha-crumble.jpg", piece: "goo", road: "#f0a04a", edge: "#c46a18" },
    { id: "semente", name: "Semente", bg: "trilha-semente.jpg", piece: "semente.png", road: "#7dce6a", edge: "#3d8a38" },
    { id: "folha", name: "Folha", bg: "trilha-folha.jpg", piece: "folha.png", road: "#5ecf7a", edge: "#2f8a48" },
    { id: "vidro", name: "Crumble", bg: "trilha-vidro.jpg", piece: "cristal", road: "#f0c14a", edge: "#c48a18" },
  ];
  function laneSize() {
    const view = document.getElementById("world-view");
    const w = Math.max(280, (view && view.clientWidth) || 390);
    const vh = (view && view.clientHeight) || 700;
    const step = Math.round(Math.min(124, Math.max(102, vh / 6.3)));
    const count = Math.max(1, (worldChapter && HempKush.zoneLevels(worldChapter).length) || 25);
    const chapH = worldChapter ? vh : 110 + step * (count - 1) + 150;
    return { w: w, step: step, chapH: chapH };
  }
  let worldCam = 0;
  let worldVel = 0;
  let worldZoom = 1;
  let worldDrag = false;
  let worldFocus = 0;
  let worldChapter = "";

  function worldSpots() {
    const lane = laneSize();
    const levels = HempKush.zoneLevels(worldChapter);
    const mouths = [0.108, 0.278, 0.448, 0.588, 0.708];
    const boards = [0.198, 0.352, 0.528, 0.678, 0.802];
    const cols = [0.16, 0.33, 0.50, 0.67, 0.84];
    return levels.map((lv, i) => {
      const row = Math.min(mouths.length - 1, Math.floor(i / cols.length));
      const col = i % cols.length;
      return {
        id: lv.id,
        zone: lv.zone,
        name: lv.name,
        heat: lv.heat,
        n: i + 1,
        x: lane.w * cols[col],
        y: lane.chapH * mouths[row],
        board: lane.chapH * boards[row],
      };
    });
  }

  function roadMarkup() {
    return "";
  }

  function currentLevelId() {
    const stars = progress.stars || {};
    for (let i = 0; i < HempKush.LEVELS.length; i += 1) {
      const id = HempKush.LEVELS[i].id;
      if (unlocked(id) && !stars[id]) return id;
    }
    let last = 1;
    HempKush.LEVELS.forEach((lv) => { if (unlocked(lv.id)) last = lv.id; });
    return last;
  }

  function nodeState(id) {
    const stars = (progress.stars || {})[id] || 0;
    if (!unlocked(id)) return "locked";
    if (stars >= 3) return "perfect";
    if (stars >= 1) return "done";
    if (id === currentLevelId()) return "current";
    return "ready";
  }

  function worldMax() {
    const view = document.getElementById("world-view");
    const track = document.getElementById("world-track");
    if (!view || !track) return 0;
    return Math.max(0, track.offsetHeight * worldZoom - view.clientHeight);
  }

  function applyWorld() {
    const view = document.getElementById("world-view");
    const track = document.getElementById("world-track");
    const far = document.querySelector(".world-far i");
    const sky = document.querySelector(".world-sky");
    if (!view || !track) return;
    worldCam = Math.max(0, Math.min(worldMax(), worldCam));
    track.style.top = "0";
    track.style.left = "0";
    track.style.width = "100%";
    track.style.transformOrigin = "50% 0";
    track.style.transform = "translate3d(0," + (-worldCam) + "px,0) scale(" + worldZoom + ")";
    if (far) far.style.transform = "translate3d(0," + (-worldCam * 0.18) + "px,0)";
    if (sky) sky.style.transform = "translate3d(0," + (-worldCam * 0.06) + "px,0)";
    const label = document.getElementById("world-chap");
    if (label) {
      const ch = CHAPTERS.find((item) => item.id === worldChapter);
      label.textContent = ch ? ch.name : "Capítulos";
    }
    const back = document.getElementById("world-back");
    if (back) back.hidden = !worldChapter;
  }

  function focusLevel(id, animate) {
    const track = document.getElementById("world-track");
    const view = document.getElementById("world-view");
    const node = track && track.querySelector('[data-level="' + id + '"]');
    if (!node || !view) return;
    const dest = Math.max(0, Math.min(worldMax(), node.offsetTop * worldZoom - view.clientHeight * 0.82));
    if (!animate) {
      worldCam = dest;
      worldVel = 0;
      applyWorld();
      return;
    }
    const start = worldCam;
    const t0 = performance.now();
    function step(now) {
      const t = Math.min(1, (now - t0) / 780);
      const e = 1 - Math.pow(1 - t, 3);
      worldCam = start + (dest - start) * e;
      applyWorld();
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function chapterFrame(ch) {
    if (ch.piece === "goo") return '<span class="wn-num chap-frame piece">' + rosinPiece("verde") + "</span>";
    if (ch.piece === "cristal") return '<span class="wn-num chap-frame piece">' + cristalHtml() + "</span>";
    if (ch.piece === "folha.png") return '<span class="wn-num chap-frame piece">' + leafPiece("verde") + "</span>";
    if (ch.piece) return '<span class="wn-num chap-frame piece"><img alt="" src="art/' + ch.piece + '" draggable="false"></span>';
    const focus = ch.focus || "center";
    return '<span class="wn-num chap-frame"><img class="chap-pic" alt="" src="art/' + ch.portrait + '" style="object-position:' + focus + '" draggable="false"></span>';
  }

  function paintChapterMap() {
    const track = document.getElementById("world-track");
    if (!track) return;
    const lane = laneSize();
    const view = document.getElementById("world-view");
    const viewH = Math.max(520, (view && view.clientHeight) || 0);
    const frameH = 50;
    const label = 36;
    const wood = 16;
    const gap = frameH + label + wood;
    const band = Math.round(viewH * 0.82);
    const count = CHAPTERS.length;
    const here = HempKush.LEVELS[currentLevelId() - 1];
    const hereAt = Math.max(0, CHAPTERS.findIndex((ch) => here && here.zone === ch.id));
    const top = band;
    const last = top + (count - 1) * gap;
    const height = last + Math.round(viewH - band) + 32;
    track.style.width = "100%";
    track.style.height = height + "px";
    track.style.setProperty("--frame-h", frameH + "px");
    track.innerHTML = "";
    worldCam = hereAt * gap;
    const spots = CHAPTERS.map((ch, i) => ({
      ch: ch,
      x: lane.w * 0.5,
      y: top + i * gap,
    }));
    const box = document.createElement("div");
    box.className = "world-nodes";
    spots.forEach((spot, i) => {
      const open = HempKush.zoneOpen(progress.stars || {}, spot.ch.id);
      const fires = HempKush.firesOf(progress.stars || {}, spot.ch.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "world-node chapter-node" + (open ? "" : " locked") + (here && here.zone === spot.ch.id ? " current" : "");
      btn.style.left = spot.x + "px";
      btn.style.top = spot.y + "px";
      btn.innerHTML = chapterFrame(spot.ch) + '<span class="chap-label"><b>' + (i + 1) + "</b> " + spot.ch.name + '</span><span class="wn-fires">🔥 ' + fires + "</span>";
      btn.addEventListener("click", () => {
        const note = document.getElementById("map-note");
        if (!open) {
          const prev = HempKush.ZONES[spot.ch.id] && HempKush.ZONES[HempKush.ZONES[spot.ch.id].prev];
          if (note) note.textContent = "Precisa de " + HempKush.firesNeeded(spot.ch.id) + " foguinhos no " + (prev ? prev.name : "capítulo passado") + ".";
          return;
        }
        if (note) note.textContent = "";
        openChapter(spot.ch.id);
      });
      box.appendChild(btn);
    });
    track.appendChild(box);
    applyWorld();
  }

  function shelfFace(lv) {
    if (lv.glass && lv.glass.length && lv.seeds) return '<img alt="" src="art/semente.png" draggable="false">';
    if (lv.cover && lv.cover.length) return leafPiece(florDaFase(lv));
    if (lv.seeds) return '<img alt="" src="art/semente.png" draggable="false">';
    if (lv.glass && lv.glass.length) return cristalHtml();
    if (lv.hash && lv.hash.length) return '<img alt="" src="art/bloco.png" draggable="false">';
    const kit = lv.kit || {};
    if (kit.fino) return '<img class="prep" alt="" src="' + finoSrc(lv) + '" draggable="false">';
    if (kit.bomba) return '<img class="prep" alt="" src="' + bombaSrc(lv) + '" draggable="false">';
    if (kit.pipe) return '<img class="prep" alt="" src="' + pipeSrc(lv) + '" draggable="false">';
    if (kit.bong) return '<img alt="" src="art/bong.png" draggable="false">';
    if (lv.teach && lv.teach.indexOf("viram o bong") >= 0) return '<img class="prep" alt="" src="' + bongSrc(florDaFase(lv)) + '" draggable="false">';
    const plain = (lv.goals || []).filter((goal) => {
      const kind = goal.kind || "";
      return kind === "verde" || kind === "roxo" || kind === "ambar" || kind === "rosa" || kind === "azul" || kind === "branco";
    });
    if (lv.jelly && lv.jelly.length && plain.length === 1) return '<img alt="" src="art/ziplok.png" draggable="false">';
    if (lv.locks && lv.locks.length) return rosinPiece(florDaFase(lv));
    const goal = (lv.goals || [])[0];
    const kind = goal ? String(goal.kind || "").replace(/^bong-/, "") : "";
    return '<img alt="" src="' + ((kind && ART[kind]) || "art/verde.png") + '" draggable="false">';
  }

  function paintWorld() {
    const track = document.getElementById("world-track");
    if (!track) return;
    if (!worldChapter) {
      paintChapterMap();
      return;
    }
    const levels = HempKush.zoneLevels(worldChapter);
    const lane = laneSize();
    const view = document.getElementById("world-view");
    const viewH = Math.max(520, (view && view.clientHeight) || 0);
    const row = 58;
    const tail = 84;
    const top = Math.max(88, Math.round(viewH * 0.82));
    track.style.width = "100%";
    track.style.height = (top + levels.length * row + tail) + "px";
    track.innerHTML = "";
    const box = document.createElement("div");
    box.className = "world-nodes";
    levels.forEach((lv, i) => {
      const stars = (progress.stars && progress.stars[lv.id]) || 0;
      const stateName = nodeState(lv.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "world-node shelf " + stateName + (worldFocus === lv.id ? " just" : "");
      btn.dataset.level = String(lv.id);
      btn.style.left = (lane.w * 0.5) + "px";
      btn.style.top = (top + i * row) + "px";
      btn.innerHTML = '<span class="shelf-piece">' + shelfFace(lv) + '</span><span class="wn-num">' + lv.name + '</span><span class="wn-fires">' + fireRow(stars) + "</span>";
      btn.addEventListener("click", () => {
        const note = document.getElementById("map-note");
        if (!unlocked(lv.id)) {
          const zone = HempKush.ZONES[lv.zone];
          if (zone && !HempKush.zoneOpen(progress.stars || {}, lv.zone)) {
            const prev = HempKush.ZONES[zone.prev];
            if (note) note.textContent = "Precisa de " + HempKush.firesNeeded(lv.zone) + " foguinhos no " + (prev ? prev.name : "capítulo passado") + ".";
          } else if (note) note.textContent = "Acende um foguinho na fase anterior.";
          return;
        }
        if (note) note.textContent = "";
        openBrief(lv.id, i + 1);
      });
      box.appendChild(btn);
    });
    track.appendChild(box);
    applyWorld();
  }

  function bindWorld() {
    const view = document.getElementById("world-view");
    if (!view || view.dataset.bound) return;
    view.dataset.bound = "1";
    let lastY = 0;
    let lastT = 0;
    view.addEventListener("pointerdown", (event) => {
      if (event.target.closest && (event.target.closest(".world-node") || event.target.closest(".world-ui") || event.target.closest(".feel-open") || event.target.closest(".feel-panel") || event.target.closest(".world-zoom"))) return;
      worldDrag = true;
      worldVel = 0;
      lastY = event.clientY;
      lastT = performance.now();
      view.classList.add("drag");
      view.setPointerCapture(event.pointerId);
    });
    view.addEventListener("pointermove", (event) => {
      if (!worldDrag) return;
      const now = performance.now();
      const dy = event.clientY - lastY;
      worldVel = (-dy / Math.max(16, now - lastT)) * 16;
      worldCam -= dy;
      lastY = event.clientY;
      lastT = now;
      applyWorld();
    });
    function endDrag() {
      worldDrag = false;
      view.classList.remove("drag");
      kickCoast();
    }
    view.addEventListener("pointerup", endDrag);
    view.addEventListener("pointercancel", endDrag);
    view.addEventListener("wheel", (event) => {
      event.preventDefault();
      if (event.ctrlKey) worldZoom = Math.max(0.85, Math.min(1.25, worldZoom + (event.deltaY > 0 ? -0.06 : 0.06)));
      else worldCam += event.deltaX + event.deltaY;
      applyWorld();
    }, { passive: false });
    const zoomBtn = document.getElementById("world-zoom");
    if (zoomBtn) zoomBtn.onclick = () => {
      worldZoom = worldZoom > 1.05 ? 1 : 1.18;
      const track = document.getElementById("world-track");
      const node = track && track.querySelector(".world-node.current");
      const band = view.clientHeight * 0.82;
      worldCam = node ? Math.max(0, Math.min(worldMax(), node.offsetTop * worldZoom - band)) : 0;
      worldVel = 0;
      applyWorld();
    };
    const sky = document.querySelector(".world-sky");
    if (sky && !sky.childElementCount) {
      for (let i = 0; i < 6; i += 1) {
        const leaf = document.createElement("span");
        leaf.style.left = (8 + i * 15) + "%";
        leaf.style.animationDelay = (i * 1.3) + "s";
        leaf.style.animationDuration = (8 + i) + "s";
        sky.appendChild(leaf);
      }
    }
    let coastOn = false;
    function coast() {
      if (mapEl.hidden || worldDrag || Math.abs(worldVel) <= 0.25) {
        worldVel = 0;
        coastOn = false;
        return;
      }
      worldCam += worldVel;
      worldVel *= 0.92;
      applyWorld();
      requestAnimationFrame(coast);
    }
    function kickCoast() {
      if (coastOn || mapEl.hidden || worldDrag || Math.abs(worldVel) <= 0.25) return;
      coastOn = true;
      requestAnimationFrame(coast);
    }
    window.addEventListener("resize", () => { paintWorld(); });
  }

  function openChapter(id) {
    worldChapter = id;
    worldCam = 0;
    worldVel = 0;
    paintWorld();
    const here = currentLevelId();
    const lv = HempKush.LEVELS[here - 1];
    const first = HempKush.zoneLevels(id)[0];
    const focus = lv && lv.zone === id ? here : (first ? first.id : here);
    requestAnimationFrame(() => focusLevel(focus, false));
  }

  function leaveTitle() {
    if (titleEl) titleEl.hidden = true;
  }

  function showChapters() {
    leaveTitle();
    districtEl.hidden = true;
    playEl.hidden = true;
    mapEl.hidden = false;
    modal.hidden = true;
    closeFeedback();
    worldChapter = "";
    worldCam = 0;
    worldVel = 0;
    const note = document.getElementById("map-note");
    if (note) note.textContent = "";
    paintWorld();
  }

  function showWorld(animate) {
    leaveTitle();
    districtEl.hidden = true;
    playEl.hidden = true;
    mapEl.hidden = false;
    modal.hidden = true;
    closeFeedback();
    const id = worldFocus || currentLevelId();
    worldFocus = 0;
    const lv = HempKush.LEVELS[id - 1];
    worldChapter = lv ? lv.zone : (worldChapter || "head");
    paintWorld();
    requestAnimationFrame(() => focusLevel(id, animate));
  }
  function landStory() {
    const due = HempKush.nextStory(progress.stars || {}, progress);
    if (!due) return false;
    openShop(due);
    return true;
  }
  function goWorld(animate) {
    if (landStory()) return;
    showWorld(!!animate);
  }
  function goChapters() {
    if (landStory()) return;
    showChapters();
  }

  function paintMap() {
    if (!mapEl.hidden) paintWorld();
    paintDistrict();
  }
  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  const ART = {
    verde: "art/verde.png", roxo: "art/roxo.png", ambar: "art/ambar.png", rosa: "art/rosa.png",
    azul: "art/azul.png", branco: "art/branco.png",
    hash: "art/bloco.png",
    bong: "art/bong.png", pote: "art/pote.png", seda: "art/seda.png",
    bomb: "art/bomb.png", folha: "art/folha.png", flor: "art/flor.png",
    semente: "art/semente.png", bud: "art/bud.png", bloco: "art/bloco.png",
  };
  function prepBase(kind) {
    if (kind === "folha" || kind === "bud") return "verde";
    if (kind === "flor") return "roxo";
    if (kind === "semente") return "bloco";
    if (kind === "bomb") return "ambar";
    return kind || "verde";
  }
  function bongSrc(kind) {
    const base = prepBase(kind);
    if (base === "verde" || base === "roxo" || base === "ambar" || base === "rosa") return "art/prep/" + base + "-bong.png";
    return "art/bong.png";
  }
  function rosinPiece(kind) {
    const src = (kind && ART[kind]) || ART.verde;
    return '<span class="rosin-piece"><img alt="" src="' + src + '" draggable="false">' + gooHtml(true) + "</span>";
  }
  function florDaFase(lv) {
    const meta = lv && lv.goals && lv.goals[0] ? String(lv.goals[0].kind || "").replace(/^bong-/, "") : "";
    if (meta === "verde" || meta === "roxo" || meta === "ambar" || meta === "rosa" || meta === "azul" || meta === "branco") return meta;
    return "verde";
  }
  function pipeSrc(lv) {
    return "art/prep/" + florDaFase(lv) + "-pipe.png";
  }
  function finoSrc(lv) {
    return "art/prep/" + florDaFase(lv) + "-fino.png";
  }
  function bombaSrc(lv) {
    return "art/prep/" + florDaFase(lv) + "-bomba.png";
  }
  function leafPiece(kind) {
    const src = (kind && ART[kind]) || ART.verde;
    return '<span class="leaf-piece"><img alt="" src="' + src + '" draggable="false"><img class="leaf" alt="" src="art/folha.png" draggable="false"></span>';
  }
  function gooHtml(mark, extra) {
    const ink = mark ? ["0.95", "0.9", "0.75", "0.5"] : ["0.5", "0.42", "0.55", "0.35"];
    const cls = "goo" + (mark ? " goo-mark" : "") + (extra ? " " + extra : "");
    return '<span class="' + cls + '"><svg viewBox="0 0 64 64"><path fill="#ffe566" fill-opacity="' + ink[0] + '" d="M18 8c8-6 22-4 28 6 4 8 10 10 8 18-2 10-8 8-10 16-2 8-12 14-22 10-8-3-14-2-16-10-2-8 4-10 2-18C6 22 8 14 18 8z"/><path fill="#ffd000" fill-opacity="' + ink[1] + '" d="M14 36c2 8 0 14 4 18 3-6 10-4 12 0 2 4-2 8 0 10H22c-8-2-12-8-10-16 1-4-2-8-2-12 1-1 3-1 4 0z"/><path fill="#fff4a8" fill-opacity="' + ink[2] + '" d="M22 16c6-2 14 0 16 4-6 1-12-1-16-4z"/><path fill="#ffe566" fill-opacity="' + ink[3] + '" d="M44 6c6 2 8 8 4 12-5-1-8-6-8-8 1-2 2-4 4-4z"/></svg></span>';
  }
  function cristalHtml() {
    return '<span class="cristal"><svg viewBox="8 8 44 48"><path fill="#e8a020" d="M26 10l14 6 8 14-4 16-14 10-12-4-8-14 4-16z"/><path fill="#ffe14a" d="M26 10l12 8-2 6-12-2z"/><path fill="#fff7b0" d="M30 12l6 6-1 3-6-1z"/><path fill="#ffd24a" d="M36 18l12 4 4 12-8 6-8-8z"/><path fill="#d49216" d="M16 28l10 2 4 14-10 6-8-10z"/><path fill="#fff4c4" d="M32 20l6 2-1 5-6-1z"/></svg></span>';
  }
  function artTag(kind, power) {
    const base = prepBase(kind);
    if (power === "row" || power === "col") {
      return '<img class="prep ' + power + '" alt="" src="art/prep/' + base + '-fino.png" draggable="false">';
    }
    if (power === "wrap") {
      return '<img class="prep" alt="" src="art/prep/' + base + '-bomba.png" draggable="false">';
    }
    if (power === "pipe") {
      return '<img class="prep" alt="" src="art/prep/' + base + '-pipe.png" draggable="false">';
    }
    if (power === "bomb") {
      const src = bongSrc(base);
      if (src !== "art/bong.png") return '<img class="prep" alt="" src="' + src + '" draggable="false">';
      const flor = ART[kind] || ART.verde;
      return '<span class="bong-par"><img alt="" src="' + flor + '" draggable="false"><img class="prep" alt="" src="art/bong.png" draggable="false"></span>';
    }
    const src = ART[kind] || ART.verde;
    return '<img alt="" src="' + src + '" draggable="false">';
  }

  function goalArt(kind) {
    if (kind.indexOf("bong-") === 0) {
      const cor = kind.slice(5);
      const src = bongSrc(cor);
      if (src !== "art/bong.png") return '<img class="prep bong" alt="" src="' + src + '" draggable="false">';
      return artTag(cor) + '<img alt="" src="art/bong.png" draggable="false">';
    }
    if (kind === "fino") return '<img class="prep" alt="" src="' + finoSrc(level) + '" draggable="false">';
    if (kind === "bomba") return '<img class="prep" alt="" src="' + bombaSrc(level) + '" draggable="false">';
    if (kind === "pipe") return '<img class="prep pipe" alt="" src="' + pipeSrc(level) + '" draggable="false">';
    if (kind === "bong") return '<img alt="" src="art/bong.png" draggable="false">';
    return artTag(kind);
  }

  let goalsFor = 0;
  function goalRows() {
    const rows = [];
    level.goals.forEach((goal) => {
      const have = state.got[goal.kind] || 0;
      rows.push({ art: goalArt(goal.kind), count: have + "/" + goal.n, done: have >= goal.n });
    });
    if (level.jelly.length) {
      const left = HempKush.jellyLeft(state);
      rows.push({ art: '<img alt="" src="art/ziplok.png" draggable="false">', count: (level.jelly.length - left) + "/" + level.jelly.length, done: left === 0 });
    }
    if (level.hash && level.hash.length) {
      const left = HempKush.hashLeft(state);
      rows.push({ art: '<img alt="" src="art/bloco.png" draggable="false">', count: String(left), done: left === 0 });
    }
    if (level.locks && level.locks.length) {
      const left = HempKush.lockLeft(state);
      const n = level.locks.length;
      const flor = (level.goals[0] && String(level.goals[0].kind || "").replace(/^bong-/, "")) || "verde";
      rows.push({ art: rosinPiece(flor), count: Math.max(0, n - left) + "/" + n, done: left === 0 });
    }
    if (level.glass && level.glass.length) {
      const left = HempKush.glassLeft(state);
      const n = level.glass.length;
      rows.push({ art: cristalHtml(), count: Math.max(0, n - left) + "/" + n, done: left === 0 });
    }
    if (level.cover && level.cover.length) {
      const left = HempKush.coverLeft(state);
      const n = level.cover.length;
      rows.push({ art: leafPiece(florDaFase(level)), count: Math.max(0, n - left) + "/" + n, done: left === 0 });
    }
    return rows;
  }
  function paintGoals() {
    const box = document.getElementById("goals");
    const id = level ? level.id : 0;
    const rows = goalRows();
    const chips = box.querySelectorAll(".chip");
    if (id !== goalsFor || chips.length !== rows.length) {
      goalsFor = id;
      box.innerHTML = rows.map((row) => '<span class="chip ' + (row.done ? "done" : "todo") + '"><span class="chip-art">' + row.art + "</span><b>" + row.count + "</b></span>").join("");
    } else {
      rows.forEach((row, i) => {
        const chip = chips[i];
        chip.classList.toggle("done", row.done);
        chip.classList.toggle("todo", !row.done);
        const num = chip.querySelector("b");
        if (num && num.textContent !== row.count) num.textContent = row.count;
      });
    }
    document.getElementById("score").textContent = state.score.toLocaleString("pt-BR");
    document.getElementById("moves").textContent = String(state.moves);
    const caps = level.stars;
    const fill = document.getElementById("star-fill");
    if (fill) fill.style.width = Math.min(100, Math.round((state.score / caps[2]) * 100)) + "%";
    const earned = state.score > 0 ? HempKush.starsFor(level, state.score, true) : 0;
    [0, 1, 2].forEach((i) => {
      const star = document.getElementById("star-" + (i + 1));
      if (star) star.classList.toggle("on", earned > i);
    });
    paintKit();
    const stuck = stuckLine();
    if (stuck) document.getElementById("hint").textContent = stuck;
  }

  function stuckLine() {
    if (!level || !state) return "";
    const left = HempKush.jellyLeft(state);
    const hash = HempKush.hashLeft(state);
    const locks = HempKush.lockLeft(state);
    const glass = HempKush.glassLeft(state);
    const cover = HempKush.coverLeft(state);
    const goalsDone = level.goals.every((goal) => (state.got[goal.kind] || 0) >= goal.n);
    if (hash > 0 && goalsDone) return "O haxixe ainda cresce. Estoura do lado pra cortar.";
    if (locks > 0 && goalsDone) return "O rosin prende. Junta a peça presa pra soltar.";
    if (glass > 0 && goalsDone) return "O crumble só quebra com poder.";
    if (cover > 0 && goalsDone) return HempKush.coverTalk(state);
    if (left > 0 && goalsDone) return "A flor ainda tá no ziplok. Combina em cima pra tirar.";
    return "";
  }

  function phaseLine() {
    return stuckLine() || (level && level.teach) || "Arrasta uma peça para o lado.";
  }

  function balcaoMarkup() {
    const cols = HempKush.COLS;
    const rows = HempKush.ROWS;
    const lip = 0.16;
    const rad = 0.32;
    function aberto(r, c) {
      if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
      const piece = state.board[r] && state.board[r][c];
      return !piece || piece.kind !== "hole";
    }
    const edges = [];
    function addEdge(x0, y0, x1, y1) {
      edges.push({ x0: x0, y0: y0, x1: x1, y1: y1, used: false });
    }
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (!aberto(r, c)) continue;
        if (!aberto(r - 1, c)) addEdge(c, r, c + 1, r);
        if (!aberto(r, c + 1)) addEdge(c + 1, r, c + 1, r + 1);
        if (!aberto(r + 1, c)) addEdge(c + 1, r + 1, c, r + 1);
        if (!aberto(r, c - 1)) addEdge(c, r + 1, c, r);
      }
    }
    const from = new Map();
    edges.forEach((edge, i) => {
      const key = edge.x0 + "," + edge.y0;
      if (!from.has(key)) from.set(key, []);
      from.get(key).push(i);
    });
    function takeEdge(x, y) {
      const list = from.get(x + "," + y);
      if (!list) return null;
      while (list.length && edges[list[list.length - 1]].used) list.pop();
      if (!list.length) return null;
      const edge = edges[list.pop()];
      if (edge.used) return takeEdge(x, y);
      edge.used = true;
      return edge;
    }
    const loops = [];
    edges.forEach((edge) => {
      if (edge.used) return;
      edge.used = true;
      const loop = [[edge.x0, edge.y0], [edge.x1, edge.y1]];
      let x = edge.x1;
      let y = edge.y1;
      let guard = 0;
      while ((x !== loop[0][0] || y !== loop[0][1]) && guard < 400) {
        const next = takeEdge(x, y);
        if (!next) break;
        x = next.x1;
        y = next.y1;
        loop.push([x, y]);
        guard += 1;
      }
      if (x === loop[0][0] && y === loop[0][1] && loop.length >= 4) loops.push(loop);
    });
    function num(v) {
      return String(Math.round(v * 1000) / 1000);
    }
    function simplify(loop) {
      const closed = loop[0][0] === loop[loop.length - 1][0] && loop[0][1] === loop[loop.length - 1][1];
      const pts = closed ? loop.slice(0, -1) : loop.slice();
      const out = [];
      for (let i = 0; i < pts.length; i += 1) {
        const prev = pts[(i + pts.length - 1) % pts.length];
        const cur = pts[i];
        const next = pts[(i + 1) % pts.length];
        const cross = (cur[0] - prev[0]) * (next[1] - cur[1]) - (cur[1] - prev[1]) * (next[0] - cur[0]);
        if (cross !== 0) out.push(cur);
      }
      return out;
    }
    const parts = [];
    const wood = [];
    loops.forEach((raw) => {
      const pts = simplify(raw);
      if (pts.length < 3) return;
      const n = pts.length;
      const corners = pts.map((cur, i) => {
        const prev = pts[(i + n - 1) % n];
        const next = pts[(i + 1) % n];
        const inDx = cur[0] - prev[0];
        const inDy = cur[1] - prev[1];
        const outDx = next[0] - cur[0];
        const outDy = next[1] - cur[1];
        const inLen = Math.hypot(inDx, inDy) || 1;
        const outLen = Math.hypot(outDx, outDy) || 1;
        const cross = inDx * outDy - inDy * outDx;
        let r = cross > 0 ? Math.min(rad, inLen / 2, outLen / 2) : 0;
        if (r < 0.05) r = 0;
        if (!r) return { a: cur, b: cur, c: null, r: 0, sweep: 1 };
        const a = [cur[0] - (inDx / inLen) * r, cur[1] - (inDy / inLen) * r];
        const b = [cur[0] + (outDx / outLen) * r, cur[1] + (outDy / outLen) * r];
        const c = [a[0] - (inDy / inLen) * r, a[1] + (inDx / inLen) * r];
        const a0 = Math.atan2(a[1] - c[1], a[0] - c[0]);
        const a1 = Math.atan2(b[1] - c[1], b[0] - c[0]);
        let delta = a1 - a0;
        while (delta <= -Math.PI) delta += Math.PI * 2;
        while (delta > Math.PI) delta -= Math.PI * 2;
        return { a: a, b: b, c: c, r: r, sweep: delta >= 0 ? 1 : 0, delta: delta, a0: a0 };
      });
      let d = "";
      for (let i = 0; i < n; i += 1) {
        const prev = corners[(i + n - 1) % n];
        const cur = corners[i];
        if (!d) d = "M " + num(prev.b[0]) + " " + num(prev.b[1]);
        if (Math.hypot(cur.a[0] - prev.b[0], cur.a[1] - prev.b[1]) > 0.001) {
          d += " L " + num(cur.a[0]) + " " + num(cur.a[1]);
          wood.push({ kind: "line", a: prev.b, b: cur.a });
        }
        if (cur.r) {
          d += " A " + num(cur.r) + " " + num(cur.r) + " 0 0 " + cur.sweep + " " + num(cur.b[0]) + " " + num(cur.b[1]);
          wood.push(cur);
        }
      }
      d += " Z";
      parts.push(d);
    });
    if (!parts.length) return "";
    const pad = (lip / cols) * 100;
    const vb = num(-lip) + " " + num(-lip) + " " + num(cols + lip * 2) + " " + num(rows + lip * 2);
    let defs = '<pattern id="mesa-fundo" patternUnits="userSpaceOnUse" width="' + cols + '" height="' + rows + '"><image href="art/balcao-fundo.jpg" x="0" y="0" width="' + cols + '" height="' + rows + '" preserveAspectRatio="xMidYMid slice"/></pattern>';
    let clipN = 0;
    const lipBits = wood.map((seg) => {
      if (seg.kind === "line") {
        const dx = seg.b[0] - seg.a[0];
        const dy = seg.b[1] - seg.a[1];
        const len = Math.hypot(dx, dy);
        if (len < 0.001) return "";
        const deg = Math.atan2(dy, dx) * 180 / Math.PI;
        return '<image href="art/balcao-borda.jpg" x="' + num(-0.03) + '" y="' + num(-lip) + '" width="' + num(len + 0.06) + '" height="' + num(lip + 0.02) + '" transform="translate(' + num(seg.a[0]) + " " + num(seg.a[1]) + ") rotate(" + num(deg) + ')" preserveAspectRatio="none"/>';
      }
      const mid = seg.a0 + seg.delta / 2;
      const rm = seg.r + lip / 2;
      const mx = seg.c[0] + Math.cos(mid) * rm;
      const my = seg.c[1] + Math.sin(mid) * rm;
      const tx = seg.delta >= 0 ? -Math.sin(mid) : Math.sin(mid);
      const ty = seg.delta >= 0 ? Math.cos(mid) : -Math.cos(mid);
      const tang = Math.atan2(ty, tx) * 180 / Math.PI;
      const cover = Math.max(lip, (seg.r + lip) * Math.abs(seg.delta) + 0.08);
      const id = "lipc" + clipN;
      clipN += 1;
      function ring(p, radius) {
        const dx = p[0] - seg.c[0];
        const dy = p[1] - seg.c[1];
        const len = Math.hypot(dx, dy) || 1;
        const k = radius / len;
        return [seg.c[0] + dx * k, seg.c[1] + dy * k];
      }
      const ia = ring(seg.a, seg.r - 0.02);
      const ib = ring(seg.b, seg.r - 0.02);
      const oa = ring(seg.a, seg.r + lip);
      const ob = ring(seg.b, seg.r + lip);
      const back = seg.sweep === 1 ? 0 : 1;
      const sector = "M " + num(ia[0]) + " " + num(ia[1])
        + " A " + num(seg.r - 0.02) + " " + num(seg.r - 0.02) + " 0 0 " + seg.sweep + " " + num(ib[0]) + " " + num(ib[1])
        + " L " + num(ob[0]) + " " + num(ob[1])
        + " A " + num(seg.r + lip) + " " + num(seg.r + lip) + " 0 0 " + back + " " + num(oa[0]) + " " + num(oa[1])
        + " Z";
      defs += '<clipPath id="' + id + '" clipPathUnits="userSpaceOnUse"><path d="' + sector + '"/></clipPath>';
      return '<g clip-path="url(#' + id + ')"><image href="art/balcao-borda.jpg" x="' + num(-cover / 2) + '" y="' + num(-lip / 2) + '" width="' + num(cover) + '" height="' + num(lip) + '" transform="translate(' + num(mx) + " " + num(my) + ") rotate(" + num(tang) + ')" preserveAspectRatio="none"/></g>';
    }).join("");
    return '<svg class="counter" viewBox="' + vb + '" style="left:' + (-pad) + "%;top:" + (-pad) + "%;width:" + (100 + pad * 2) + "%;height:" + (100 + pad * 2) + '%" aria-hidden="true"><defs>' + defs + '</defs><path fill="url(#mesa-fundo)" d="' + parts.join(" ") + '"/>' + lipBits + "</svg>";
  }

  let mesaCache = "";
  let mesaFor = 0;
  function tileFace(piece, r, c) {
    if (!piece || piece.kind === "hole") return "hole";
    const cover = state.cover && state.cover[r][c] ? state.cover[r][c] : 0;
    const jelly = state.jelly[r][c] ? 1 : 0;
    const on = selected && selected.r === r && selected.c === c ? 1 : 0;
    return [piece.kind, piece.power || "", piece.lock ? 1 : 0, cover, jelly, on].join("|");
  }

  function paint() {
    paintGoals();
    const id = level ? level.id : 0;
    const held = boardEl.querySelector("svg.counter");
    if (id !== mesaFor || !held) {
      mesaFor = id;
      mesaCache = balcaoMarkup();
      boardEl.innerHTML = mesaCache;
    }
    const stay = new Map();
    boardEl.querySelectorAll(".tile").forEach((tile) => {
      stay.set(tile.dataset.r + "," + tile.dataset.c, tile);
    });
    for (let r = 0; r < HempKush.ROWS; r += 1) {
      for (let c = 0; c < HempKush.COLS; c += 1) {
        const piece = state.board[r][c];
        const face = tileFace(piece, r, c);
        const prev = stay.get(r + "," + c);
        if (prev) stay.delete(r + "," + c);
        if (prev && prev.dataset.face === face && !(piece && piece.fresh)) {
          prev.classList.remove("fresh", "born", "ember", "antic", "seed-out");
          if (piece && piece.cut) {
            prev.classList.add("leaf-cut");
            piece.cut = false;
          }
          continue;
        }
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.r = String(r);
        btn.dataset.c = String(c);
        btn.dataset.face = face;
        if (!piece || piece.kind === "hole") {
          btn.className = "tile hole";
          btn.disabled = true;
          if (prev) prev.replaceWith(btn);
          else boardEl.appendChild(btn);
          continue;
        }
        btn.className = "tile deck " + piece.kind;
        if (piece.power) btn.classList.add("power-" + piece.power);
        if (piece.lock) btn.classList.add("lock");
        if (state.cover && state.cover[r][c] === 2) btn.classList.add("cover-2");
        if (state.cover && state.cover[r][c] === 1) btn.classList.add("cover-1");
        if (piece.cut) {
          btn.classList.add("leaf-cut");
          piece.cut = false;
        }
        if (piece.fresh) {
          btn.classList.add("fresh");
          const from = typeof piece._from === "number" ? piece._from : -1;
          const fromC = typeof piece._fromC === "number" ? piece._fromC : c;
          btn.style.setProperty("--fall", String(Math.max(1, r - from)));
          btn.style.setProperty("--slide", String(fromC - c));
        }
        if (piece.power && piece.fresh) btn.classList.add("born");
        if (state.jelly[r][c]) btn.classList.add("jelly");
        if (selected && selected.r === r && selected.c === c) btn.classList.add("on");
        const bag = state.jelly[r][c]
          ? '<img class="bag" alt="" src="art/ziplok.png" draggable="false">'
          : "";
        const leaf = state.cover && state.cover[r][c]
          ? '<img class="leaf" alt="" src="art/folha.png" draggable="false">'
          : "";
        const art = piece.grown && ART[piece.grown]
          ? '<img class="hash-was" alt="" src="' + ART[piece.grown] + '" draggable="false"><img class="hash-now" alt="" src="art/bloco.png" draggable="false">'
          : (piece.kind === "vidro" ? cristalHtml() : artTag(piece.kind, piece.power));
        if (piece.grown) {
          btn.classList.add("hash-grown");
          piece.grown = false;
        }
        const goo = piece.lock ? gooHtml() : "";
        btn.innerHTML = bag + leaf + art + goo;
        if (prev) prev.replaceWith(btn);
        else boardEl.appendChild(btn);
        piece.fresh = false;
      }
    }
    stay.forEach((tile) => tile.remove());
  }

  function paintKit() {
    const handed = (level && level.kit) || {};
    if (boardEl) {
      boardEl.style.setProperty("--mark-fino", 'url("' + finoSrc(level) + '")');
      boardEl.style.setProperty("--mark-bomba", 'url("' + bombaSrc(level) + '")');
      boardEl.style.setProperty("--mark-pipe", 'url("' + pipeSrc(level) + '")');
      boardEl.style.setProperty("--mark-bong", 'url("' + bongSrc(florDaFase(level)) + '")');
    }
    ["fino", "bomba", "bong", "pipe"].forEach((name) => {
      const btn = document.querySelector('[data-tool="' + name + '"]');
      const qty = document.getElementById("qty-" + name);
      if (!btn || !qty) return;
      const n = kit[name] || 0;
      qty.textContent = String(n);
      if (name === "bomba") {
        const img = btn.querySelector("img");
        if (img) img.src = bombaSrc(level);
      }
      btn.hidden = !handed[name];
      btn.disabled = !n;
      btn.classList.toggle("armed", armed === name);
      btn.classList.toggle("hot", name === "bong" && n > 0);
    });
  }

  function resetKit() {
    armed = null;
    kit = Object.assign({ fino: 0, bomba: 0, bong: 0, pipe: 0 }, (level && level.kit) || {});
  }

  function toolCells(tool, cell) {
    const cells = [];
    const piece = state.board[cell.r] && state.board[cell.r][cell.c];
    if (tool === "fino") {
      for (let c = 0; c < HempKush.COLS; c += 1) cells.push({ r: cell.r, c });
    } else if (tool === "bomba") {
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) cells.push({ r: cell.r + dr, c: cell.c + dc });
      }
    } else if (tool === "bong" && piece && piece.kind !== "hash" && piece.kind !== "vidro" && piece.kind !== "semente") {
      for (let r = 0; r < HempKush.ROWS; r += 1) {
        for (let c = 0; c < HempKush.COLS; c += 1) {
          const item = state.board[r][c];
          if (item && item.kind === piece.kind && item.power !== "bomb") cells.push({ r, c });
        }
      }
    } else if (tool === "pipe") {
      cells.push(cell);
    }
    return cells;
  }

  function burst(cell, kind) {
    const el = tileEl(cell);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const host = boardEl.getBoundingClientRect();
    for (let i = 0; i < 6; i += 1) {
      const dot = document.createElement("i");
      dot.className = "spark";
      dot.style.left = (rect.left - host.left + rect.width / 2) + "px";
      dot.style.top = (rect.top - host.top + rect.height / 2) + "px";
      dot.style.background = kind === "flor" ? "#c45cff" : kind === "bud" ? "#7dff6a" : "#e4c16a";
      const ang = (Math.PI * 2 * i) / 6;
      dot.style.setProperty("--dx", Math.cos(ang) * 22 + "px");
      dot.style.setProperty("--dy", Math.sin(ang) * 22 + "px");
      boardEl.appendChild(dot);
      setTimeout(() => dot.remove(), 420);
    }
  }

  function closeFeedback() {
    const box = document.getElementById("feedback");
    if (box) box.hidden = true;
  }

  async function postFeedback(payload) {
    const res = await fetch("/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("feedback");
    return res.json();
  }

  function openFeedback(de, lv) {
    const box = document.getElementById("feedback");
    if (!box) return;
    const where = document.getElementById("feedback-where");
    const text = document.getElementById("feedback-text");
    const status = document.getElementById("feedback-status");
    box.dataset.de = de;
    if (lv) {
      box.dataset.fase = String(lv.id);
      box.dataset.calor = lv.heat || "";
      if (where) where.textContent = lv.name + (HEAT[lv.heat] ? " · " + HEAT[lv.heat] : "");
    } else {
      delete box.dataset.fase;
      delete box.dataset.calor;
      if (where) where.textContent = "Pra o Heitor.";
    }
    if (text) text.value = "";
    if (status) status.textContent = "";
    box.hidden = false;
    if (text) text.focus();
  }

  async function finish(didWin) {
    const stars = HempKush.starsFor(level, state.score, didWin);
    progress.best = progress.best || {};
    const prevBest = progress.best[level.id] || 0;
    const record = state.score > prevBest && state.score > 0;
    if (record) progress.best[level.id] = state.score;
    if (didWin) {
      progress.stars = progress.stars || {};
      progress.stars[level.id] = Math.max(progress.stars[level.id] || 0, stars);
      saveProgress();
      const nxt = HempKush.LEVELS[level.id];
      worldFocus = nxt && unlocked(nxt.id) ? nxt.id : level.id;
      Snd.win();
    } else {
      if (record) saveProgress();
      Snd.lose();
    }
    document.getElementById("modal-title").textContent = didWin ? "Parabéns" : "Quase";
    const phase = document.getElementById("modal-phase");
    if (phase) phase.textContent = level.name;
    const scoreLine = document.getElementById("modal-score");
    if (scoreLine) scoreLine.textContent = "Pontuação " + state.score.toLocaleString("pt-BR");
    const starHost = document.getElementById("modal-stars");
    starHost.innerHTML = fireRow(stars);
    if (didWin) {
      Array.from(starHost.children).forEach((mark, i) => {
        mark.style.animationDelay = (i * 160) + "ms";
      });
    }
    let line = didWin ? "" : HempKush.shortLine(level, state);
    if (record) line = line ? line + " Recorde." : "Recorde.";
    document.getElementById("modal-text").textContent = line;
    endNota = "";
    const rate = document.getElementById("modal-rate");
    if (rate) rate.querySelectorAll("button").forEach((btn) => btn.classList.remove("on"));
    const rateStatus = document.getElementById("modal-rate-status");
    if (rateStatus) rateStatus.textContent = "";
    closeFeedback();
    const next = HempKush.LEVELS[level.id];
    const goOn = !!(didWin && next && unlocked(next.id));
    document.getElementById("to-next").hidden = !goOn;
    document.getElementById("to-next").classList.toggle("ghost", !goOn);
    document.getElementById("again").classList.toggle("ghost", goOn);
    if (typeof Feel !== "undefined") await Feel.ending(didWin, { stars: stars, record: record, score: state.score });
    modal.hidden = false;
    paintMap();
  }

  async function showLoading(text) {
    loadText.textContent = text;
    const sprout = document.querySelector("#loading .sprout");
    if (sprout && level) sprout.innerHTML = shelfFace(level);
    loading.hidden = false;
    await sleep(260);
    loading.hidden = true;
  }

  let pendingLevel = 0;
  let passAt = "";
  let passHold = "";
  let passPlay = 0;

  function zoneNumber(id) {
    const lv = HempKush.LEVELS[id - 1];
    if (!lv) return 1;
    const list = HempKush.zoneLevels(lv.zone);
    for (let i = 0; i < list.length; i += 1) {
      if (list[i].id === id) return i + 1;
    }
    return 1;
  }

  function openBrief(id, number, viaPass) {
    if (!viaPass && !unlocked(id)) return;
    const lv = HempKush.LEVELS[id - 1];
    if (!lv) return;
    pendingLevel = id;
    const zone = HempKush.ZONES[lv.zone] || HempKush.ZONES.head;
    const fires = (progress.stars && progress.stars[lv.id]) || 0;
    const best = (progress.best && progress.best[lv.id]) || 0;
    document.getElementById("brief-zone").textContent = zone.name;
    document.getElementById("brief-title").textContent = "Nível " + number + " · " + lv.name;
    document.getElementById("brief-heat").textContent = HEAT[lv.heat] || "";
    document.getElementById("brief-fires").innerHTML = fireRow(fires);
    document.getElementById("brief-teach").textContent = lv.teach || "";
    const pedidos = [];
    const fala = {
      verde: ["Fume", "Skunk", "art/verde.png"],
      roxo: ["Fume", "Purple Haze", "art/roxo.png"],
      ambar: ["Fume", "Colombia Gold", "art/ambar.png"],
      rosa: ["Fume", "Pink Kush", "art/rosa.png"],
      azul: ["Fume", "Nightdream Blue", "art/azul.png"],
      branco: ["Fume", "White Widow", "art/branco.png"],
      semente: ["Plante", "sementes", "art/semente.png"],
      fino: ["Fume", "becks finos", finoSrc(lv)],
      bomba: ["Fume", "becks grossos", bombaSrc(lv)],
      pipe: ["Fume", "pipes", pipeSrc(lv)],
      bong: ["Fume", "no bong", "art/bong.png"],
    };
    const noBong = { verde: "Skunk", roxo: "Purple Haze", ambar: "Colombia Gold", rosa: "Pink Kush", azul: "Nightdream Blue", branco: "White Widow" };
    lv.goals.forEach((goal) => {
      if (goal.kind.indexOf("bong-") === 0) {
        const cor = goal.kind.slice(5);
        const broto = (fala[cor] && fala[cor][2]) || "art/verde.png";
        const src = bongSrc(cor);
        pedidos.push(["Fume", goal.n, (noBong[cor] || "a cor") + " no bong", src !== "art/bong.png" ? src : [broto, "art/bong.png"]]);
        return;
      }
      const linha = fala[goal.kind];
      if (linha) pedidos.push([linha[0], goal.n, linha[1], linha[2]]);
    });
    if (lv.jelly && lv.jelly.length) pedidos.push(["Abra", lv.jelly.length, "ziploks", "art/ziplok.png"]);
    if (lv.hash && lv.hash.length) pedidos.push(["Corte", lv.hash.length, "haxixe", "art/bloco.png"]);
    if (lv.locks && lv.locks.length) pedidos.push(["Solte", lv.locks.length, "rosin", "goo"]);
    if (lv.cover && lv.cover.length) pedidos.push(["Colha", lv.cover.length, "folhas de ganja", "folha"]);
    if (lv.glass && lv.glass.length) pedidos.push(["Quebre", lv.glass.length, "crumble", "cristal"]);
    const kit = lv.kit || {};
    const kitArt = { fino: finoSrc(lv), bomba: bombaSrc(lv), bong: "art/bong.png", pipe: pipeSrc(lv) };
    const kitNome = { fino: "beck fino", bomba: "beck grosso", bong: "bong", pipe: "pipe" };
    Object.keys(kitArt).forEach((name) => {
      if (kit[name]) pedidos.push(["Leva", kit[name], kitNome[name], kitArt[name]]);
    });
    const nPed = pedidos.length;
    const mesaH = (document.getElementById("brief") || {}).clientHeight || 720;
    const roomTop = 16;
    const roomStop = Math.round(mesaH * 0.50);
    const tight = nPed * 46 > roomStop - roomTop;
    const rowH = Math.max(30, Math.floor((roomStop - roomTop) / Math.max(1, nPed)));
    document.getElementById("brief-goals").innerHTML = pedidos.map((pedido, i) => {
      const top = tight ? (roomTop + i * rowH) + "px" : (nPed === 1 ? 16 : 5 + (38 * i) / (nPed - 1)) + "%";
      const tilt = i % 2 === 0 ? -2 : 2;
      const icon = Array.isArray(pedido[3])
        ? '<span class="bong-par">' + pedido[3].map((src) => '<img alt="" src="' + src + '" draggable="false">').join("") + "</span>"
        : pedido[3] === "goo"
        ? rosinPiece(((lv.goals || [])[0] && String(lv.goals[0].kind || "").replace(/^bong-/, "")) || "verde")
        : pedido[3] === "folha"
        ? leafPiece(florDaFase(lv))
        : pedido[3] === "cristal"
        ? cristalHtml()
        : pedido[3] === "caco"
        ? '<i class="caco"></i>'
        : '<img alt="" src="' + pedido[3] + '" draggable="false">';
      return '<figure class="mesa-item' + (tight ? " tight" : "") + '" style="left:52%;top:' + top + ';--r:' + tilt + 'deg">'
        + icon
        + "<figcaption><b>" + pedido[0] + " " + pedido[1] + "</b><span>" + pedido[2] + "</span></figcaption></figure>";
    }).join("");
    document.getElementById("brief-moves").textContent = String(lv.moves);
    const you = document.getElementById("brief-you");
    you.textContent = best ? best.toLocaleString("pt-BR") : "Ainda não";
    you.classList.toggle("words", !best);
    document.getElementById("brief-marks").innerHTML = lv.stars.map((n, i) => {
      const mark = i === 0 ? "passou" : n.toLocaleString("pt-BR");
      return "<li><i>" + "🔥".repeat(i + 1) + "</i><b>" + mark + "</b></li>";
    }).join("");
    passPlay = viaPass ? id : 0;
    if (viaPass) {
      const hire = document.getElementById("screen-hire");
      if (hire) hire.hidden = true;
      districtEl.hidden = true;
      playEl.hidden = true;
      mapEl.hidden = false;
      modal.hidden = true;
    }
    document.getElementById("brief").hidden = false;
  }

  async function startLevel(id) {
    const free = passPlay === id;
    if ((!free && !unlocked(id)) || locked) return;
    passPlay = 0;
    level = HempKush.LEVELS[id - 1];
    currentZone = level.zone || "head";
    Snd.swap();
    await showLoading(level.load);
    state = HempKush.create(level);
    selected = null;
    locked = false;
    resetKit();
    leaveTitle();
    mapEl.hidden = true;
    districtEl.hidden = true;
    playEl.hidden = false;
    modal.hidden = true;
    document.getElementById("brief").hidden = true;
    closeFeedback();
    document.getElementById("nivel").textContent = String(zoneNumber(level.id));
    const nome = document.getElementById("nivel-nome");
    if (nome) nome.textContent = level.name;
    document.getElementById("hint").textContent = level.teach || "Arrasta uma peça para o lado.";
    if (typeof Feel !== "undefined") Feel.resetMeter();
    paint();
  }

  function fallSpan(board) {
    let n = 0;
    if (!board) return n;
    for (let r = 0; r < HempKush.ROWS; r += 1) {
      for (let c = 0; c < HempKush.COLS; c += 1) {
        const piece = board[r][c];
        if (!piece || !piece.fresh || piece.kind === "hole") continue;
        const from = typeof piece._from === "number" ? piece._from : -1;
        n = Math.max(n, r - from);
      }
    }
    return n;
  }

  async function restFall() {
    const span = fallSpan(state.board);
    const fallMs = 180 + span * 70;
    await sleep(stillFeel() ? 20 : fallMs + 80);
  }

  function pieceBits(el) {
    return Array.from(el.children).filter((node) => !node.classList.contains("bag") && !node.classList.contains("leaf"));
  }

  function commitSwap(a, b) {
    const elA = tileEl(a);
    const elB = tileEl(b);
    if (!elA || !elB) return;
    elA.getAnimations().forEach((anim) => anim.cancel());
    elB.getAnimations().forEach((anim) => anim.cancel());
    elA.style.zIndex = "";
    elB.style.zIndex = "";
    const bitsA = pieceBits(elA);
    const bitsB = pieceBits(elB);
    bitsA.forEach((node) => elB.appendChild(node));
    bitsB.forEach((node) => elA.appendChild(node));
    const keep = { tile: 1, deck: 1, hole: 1, "cover-1": 1, "cover-2": 1, jelly: 1, fresh: 1, born: 1, on: 1, ember: 1, antic: 1, bad: 1 };
    const owned = (el) => Array.from(el.classList).filter((name) => !keep[name]);
    const ownedA = owned(elA);
    const ownedB = owned(elB);
    ownedA.forEach((name) => elA.classList.remove(name));
    ownedB.forEach((name) => elB.classList.remove(name));
    ownedA.forEach((name) => elB.classList.add(name));
    ownedB.forEach((name) => elA.classList.add(name));
  }

  async function resolve(moved, a, b) {
    locked = true;
    selected = null;
    const hint = document.getElementById("hint");
    if (hint) hint.textContent = phaseLine();
    for (let i = 0; i < moved.waves.length; i += 1) {
      const wave = moved.waves[i];
      if (i === 0 && a && b) commitSwap(a, b);
      if (typeof Feel !== "undefined") {
        Feel.anticipate(boardEl, wave);
        const hold = Feel.hold(wave);
        if (hold) await sleep(hold);
        Feel.wave(boardEl, wave);
      }
      if (wave.power) {
        boardEl.classList.add("shake");
        Snd.power();
      } else Snd.pop(wave.combo);
      await ember(wave);
      if (wave.bong && typeof Feel !== "undefined" && Feel.rise) await Feel.rise(wave.bong);
      await sleep(40);
      const depois = wave.state;
      const chegadas = wave.chegadas || [];
      for (let n = 0; n < chegadas.length; n += 1) {
        const quadro = chegadas[n];
        state = Object.assign({}, depois, { board: quadro.board });
        paint();
        boardEl.classList.remove("shake");
        await restFall();
        if (!stillFeel()) {
          quadro.piso.forEach((cell) => {
            const el = tileEl(cell);
            if (el) el.classList.add("seed-out");
          });
          await sleep(420);
        }
      }
      state = depois;
      paint();
      boardEl.classList.remove("shake");
      await restFall();
    }
    state = moved.state;
    paint();
    locked = false;
    if (HempKush.won(state)) finish(true);
    else if (state.moves <= 0) finish(false);
    else if (!HempKush.hasMove(state.board)) {
      HempKush.shuffle(state.board);
      document.getElementById("hint").textContent = "Tabuleiro embaralhado.";
      paint();
    } else if (hint) hint.textContent = phaseLine();
  }

  async function play(a, b) {
    if (locked || !modal.hidden) return;
    if (!HempKush.adjacent(a, b)) {
      selected = b;
      paint();
      return;
    }
    const held = boardEl.querySelector(".tile.on");
    if (held) held.classList.remove("on");
    const moved = HempKush.playMove(state, a, b, Math.random);
    const aviso = HempKush.dragTalk(state.board, a, b);
    if (!moved) {
      locked = true;
      if (!aviso) await nudge(a, b);
      locked = false;
      document.getElementById("hint").textContent = aviso || "Essa troca não combina.";
      if (typeof Feel !== "undefined") Feel.reject();
      return;
    }
    locked = true;
    Snd.swap();
    if (typeof Feel !== "undefined") Feel.snap();
    await slide(a, b);
    resolve(moved, a, b);
  }

  function tileEl(cell) {
    return boardEl.querySelector('[data-r="' + cell.r + '"][data-c="' + cell.c + '"]');
  }

  function stillFeel() {
    return document.body.classList.contains("feel-still");
  }

  function burnOrder(cells) {
    const list = cells.slice();
    const rows = new Set(list.map((cell) => cell.r));
    const cols = new Set(list.map((cell) => cell.c));
    if (rows.size === 1) list.sort((a, b) => a.c - b.c);
    else if (cols.size === 1) list.sort((a, b) => a.r - b.r);
    else list.sort((a, b) => a.r - b.r || a.c - b.c);
    return list;
  }

  async function ember(wave) {
    const cells = Array.isArray(wave) ? wave : (wave.cleared || []);
    const spawned = Array.isArray(wave) ? [] : (wave.spawned || []);
    const order = burnOrder(cells);
    const smoked = new Set();
    const jobs = [];
    const mark = (cell, cls, lit) => {
      const el = tileEl(cell);
      if (!el) return;
      el.classList.remove("antic");
      el.style.setProperty("--lit", String(lit));
      el.classList.add(cls);
      smoked.add(cell.r + "," + cell.c);
    };
    order.forEach((cell) => {
      if (cell.power !== "bomb") return;
      const elBomb = tileEl(cell);
      if (!elBomb) return;
      const box = elBomb.getBoundingClientRect();
      mark(cell, "cherry", 0);
      order.forEach((spot) => {
        const id = spot.r + "," + spot.c;
        if (smoked.has(id)) return;
        const el = tileEl(spot);
        smoked.add(id);
        if (!el || stillFeel() || !el.animate) return;
        el.classList.remove("antic");
        const here = el.getBoundingClientRect();
        const dx = (box.left + box.width / 2) - (here.left + here.width / 2);
        const dy = (box.top + box.height / 2) - (here.top + here.height / 2);
        const dist = Math.max(Math.abs(spot.r - cell.r), Math.abs(spot.c - cell.c));
        jobs.push(el.animate(
          [
            { transform: "none", opacity: 1, filter: "none" },
            { transform: "translate(" + (dx * 0.35) + "px," + (dy * 0.35) + "px) scale(1.04)", opacity: 1, filter: "sepia(0.8) saturate(2) brightness(1.4)", offset: 0.35 },
            { transform: "translate(" + dx + "px," + dy + "px) scale(0.2)", opacity: 0, filter: "sepia(1) brightness(0.5)" },
          ],
          { duration: 460, delay: dist * 36, easing: "cubic-bezier(.22,.7,.3,1)", fill: "forwards" }
        ).finished);
      });
    });
    order.forEach((cell) => {
      if (cell.power !== "row" && cell.power !== "col") return;
      const line = order.filter((other) => (cell.power === "row" ? other.r === cell.r : other.c === cell.c));
      line.sort((a, b) => (cell.power === "row" ? a.c - b.c : a.r - b.r));
      line.forEach((spot, i) => mark(spot, cell.power === "row" ? "roll" : "roll-col", i));
    });
    order.forEach((cell) => {
      if (cell.power !== "wrap") return;
      order.forEach((spot) => {
        if (smoked.has(spot.r + "," + spot.c)) return;
        mark(spot, "cherry", Math.max(Math.abs(spot.r - cell.r), Math.abs(spot.c - cell.c)));
      });
    });
    spawned.forEach((spawn) => {
      if (spawn.power !== "row" && spawn.power !== "col" && spawn.power !== "wrap" && spawn.power !== "pipe") return;
      const elSpawn = tileEl(spawn);
      if (!elSpawn) return;
      const box = elSpawn.getBoundingClientRect();
      order.forEach((cell) => {
        const id = cell.r + "," + cell.c;
        if (smoked.has(id) || cell.power) return;
        const near = spawn.power === "row"
          ? cell.r === spawn.r
          : spawn.power === "col"
            ? cell.c === spawn.c
            : Math.max(Math.abs(cell.r - spawn.r), Math.abs(cell.c - spawn.c)) <= 2;
        if (!near) return;
        const el = tileEl(cell);
        smoked.add(id);
        if (!el || stillFeel() || !el.animate) return;
        el.classList.remove("antic");
        const here = el.getBoundingClientRect();
        const dx = (box.left + box.width / 2) - (here.left + here.width / 2);
        const dy = (box.top + box.height / 2) - (here.top + here.height / 2);
        jobs.push(el.animate(
          [{ transform: "none", opacity: 1 }, { transform: "translate(" + dx + "px," + dy + "px) scale(0.15)", opacity: 0 }],
          { duration: 380, easing: "cubic-bezier(.22,.7,.3,1)", fill: "forwards" }
        ).finished);
      });
    });
    order.forEach((cell) => {
      if (smoked.has(cell.r + "," + cell.c)) return;
      const el = tileEl(cell);
      if (!el) return;
      el.classList.remove("antic");
      el.classList.add("ember");
    });
    if (stillFeel()) return;
    const waits = [];
    if (order.some((cell) => cell.power === "row" || cell.power === "col")) waits.push(sleep(1240));
    if (order.some((cell) => cell.power === "wrap")) waits.push(sleep(700));
    if (jobs.length) waits.push(Promise.all(jobs));
    if (order.some((cell) => !smoked.has(cell.r + "," + cell.c))) waits.push(sleep(520));
    if (waits.length) await Promise.all(waits);
  }

  async function slide(a, b) {
    if (stillFeel()) return;
    const elA = tileEl(a);
    const elB = tileEl(b);
    if (!elA || !elB || !elA.animate) return;
    const ra = elA.getBoundingClientRect();
    const rb = elB.getBoundingClientRect();
    const dx = rb.left - ra.left;
    const dy = rb.top - ra.top;
    elA.style.zIndex = "4";
    elB.style.zIndex = "3";
    const ease = "cubic-bezier(.22,.7,.3,1)";
    await Promise.all([
      elA.animate(
        [{ transform: "translate(0,0)" }, { transform: "translate(" + dx + "px," + dy + "px)" }],
        { duration: 200, easing: ease, fill: "forwards" },
      ).finished,
      elB.animate(
        [{ transform: "translate(0,0)" }, { transform: "translate(" + (-dx) + "px," + (-dy) + "px)" }],
        { duration: 200, easing: ease, fill: "forwards" },
      ).finished,
    ]);
  }

  async function nudge(a, b) {
    if (stillFeel()) return;
    const elA = tileEl(a);
    const elB = tileEl(b);
    if (!elA || !elB || !elA.animate) return;
    const ra = elA.getBoundingClientRect();
    const rb = elB.getBoundingClientRect();
    const dx = (rb.left - ra.left) * 0.35;
    const dy = (rb.top - ra.top) * 0.35;
    const frames = [
      { transform: "translate(0,0)" },
      { transform: "translate(" + dx + "px," + dy + "px)", offset: 0.42 },
      { transform: "translate(0,0)" },
    ];
    const back = [
      { transform: "translate(0,0)" },
      { transform: "translate(" + (-dx) + "px," + (-dy) + "px)", offset: 0.42 },
      { transform: "translate(0,0)" },
    ];
    await Promise.all([
      elA.animate(frames, { duration: 180, easing: "ease-out" }).finished,
      elB.animate(back, { duration: 180, easing: "ease-out" }).finished,
    ]);
  }

  async function showPower(tool, cell) {
    if (typeof Feel !== "undefined") Feel.power(tool);
    if (stillFeel()) return;
    const mark = { fino: "lane", bomba: "mark-bomba", bong: "mark-bong", pipe: "mark-pipe" }[tool] || "lane";
    toolCells(tool, cell).forEach((spot) => {
      const el = tileEl(spot);
      if (el) el.classList.add(mark);
    });
    await sleep(160);
  }

  async function fireTool(cell) {
    const tool = armed;
    if (!tool || !kit[tool] || locked) return;
    const alvo = state.board[cell.r] && state.board[cell.r][cell.c];
    const moved = HempKush.blast(state, toolCells(tool, cell), Math.random);
    if (!moved) return;
    moved.state.got[tool] = (moved.state.got[tool] || 0) + 1;
    if (tool === "bong" && alvo && alvo.kind) {
      moved.state.got["bong-" + alvo.kind] = (moved.state.got["bong-" + alvo.kind] || 0) + 1;
    }
    kit[tool] -= 1;
    armed = null;
    locked = true;
    paintKit();
    Snd.power();
    await showPower(tool, cell);
    resolve(moved);
  }

  boardEl.addEventListener("pointerdown", (event) => {
    const el = event.target.closest && event.target.closest("[data-r]");
    if (!el || locked) return;
    pointer = { x: event.clientX, y: event.clientY, r: Number(el.dataset.r), c: Number(el.dataset.c) };
  });
  boardEl.addEventListener("pointerup", (event) => {
    if (!pointer) return;
    const from = { r: pointer.r, c: pointer.c };
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer = null;
    if (armed) {
      fireTool(from);
      return;
    }
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) {
      if (selected && (selected.r !== from.r || selected.c !== from.c)) {
        const origin = selected;
        selected = null;
        play(origin, from);
        return;
      }
      selected = from;
      paint();
      return;
    }
    const to = { r: from.r, c: from.c };
    if (Math.abs(dx) > Math.abs(dy)) to.c += dx > 0 ? 1 : -1;
    else to.r += dy > 0 ? 1 : -1;
    selected = null;
    play(from, to);
  });

  document.getElementById("tray").addEventListener("click", (event) => {
    const btn = event.target.closest && event.target.closest("[data-tool]");
    if (!btn || locked || !kit[btn.dataset.tool]) return;
    armed = armed === btn.dataset.tool ? null : btn.dataset.tool;
    const tip = {
      fino: "Toca uma peça. O beck fino limpa a linha.",
      bomba: "Toca uma peça. O beck grosso abre em volta.",
      bong: "Toca uma cor. O bong fuma ela toda.",
      pipe: "Toca a peça que o pipe vai pegar.",
    };
    document.getElementById("hint").textContent = armed ? tip[armed] : phaseLine();
    paintKit();
  });

  mapEl.addEventListener("click", (event) => {
    const zone = event.target.closest && event.target.closest("[data-zone]");
    if (!zone) return;
    const id = zone.dataset.zone;
    if (!HempKush.ZONES[id]) return;
    const note = document.getElementById("map-note");
    if (!HempKush.zoneOpen(progress.stars || {}, id)) {
      const need = HempKush.firesNeeded(id);
      const prev = HempKush.ZONES[HempKush.ZONES[id].prev];
      if (note) note.textContent = "Precisa de " + need + " foguinhos no " + (prev ? prev.name : "capítulo passado") + ".";
      return;
    }
    if (note) note.textContent = "";
    currentZone = id;
    mapEl.hidden = true;
    districtEl.hidden = false;
    paintDistrict();
  });
  document.getElementById("dist-back").onclick = () => goChapters();
  document.getElementById("world-back").onclick = () => goChapters();
  document.getElementById("back").onclick = () => goWorld(true);
  document.getElementById("brief-go").onclick = () => {
    const id = pendingLevel;
    document.getElementById("brief").hidden = true;
    startLevel(id);
  };
  document.getElementById("brief-back").onclick = () => {
    document.getElementById("brief").hidden = true;
    passPlay = 0;
  };
  const briefFeedback = document.getElementById("brief-feedback");
  if (briefFeedback) briefFeedback.onclick = () => {
    const lv = HempKush.LEVELS[pendingLevel - 1];
    if (lv) openFeedback("brief", lv);
  };
  const modalRate = document.getElementById("modal-rate");
  if (modalRate) modalRate.addEventListener("click", async (event) => {
    const btn = event.target.closest("button");
    if (!btn || !level || btn.disabled || btn.classList.contains("on")) return;
    const nota = btn.getAttribute("data-nota");
    if (!nota) return;
    modalRate.querySelectorAll("button").forEach((item) => { item.disabled = true; });
    const status = document.getElementById("modal-rate-status");
    try {
      await postFeedback({
        de: "parabéns",
        fase: level.id,
        calor: level.heat,
        nota: nota,
        texto: "",
      });
      endNota = nota;
      modalRate.querySelectorAll("button").forEach((item) => {
        item.classList.toggle("on", item === btn);
      });
      if (status) status.textContent = "Anotado.";
    } catch (err) {
      if (status) status.textContent = "Não anotou.";
    }
    modalRate.querySelectorAll("button").forEach((item) => { item.disabled = false; });
  });
  const modalFeedback = document.getElementById("modal-feedback");
  if (modalFeedback) modalFeedback.onclick = () => {
    if (level) openFeedback("parabéns", level);
  };
  const feedbackForm = document.getElementById("feedback-form");
  if (feedbackForm) feedbackForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const box = document.getElementById("feedback");
    const textEl = document.getElementById("feedback-text");
    const status = document.getElementById("feedback-status");
    const texto = ((textEl && textEl.value) || "").trim();
    if (!texto || !box) return;
    const send = feedbackForm.querySelector("button[type=submit]");
    if (send) send.disabled = true;
    const payload = { de: box.dataset.de, texto: texto };
    if (box.dataset.fase) payload.fase = Number(box.dataset.fase);
    if (box.dataset.calor) payload.calor = box.dataset.calor;
    if (box.dataset.de === "parabéns" && endNota) payload.nota = endNota;
    try {
      await postFeedback(payload);
      if (textEl) textEl.value = "";
      if (status) status.textContent = "Anotado.";
    } catch (err) {
      if (status) status.textContent = "Não anotou.";
    }
    if (send) send.disabled = false;
  });
  const feedbackClose = document.getElementById("feedback-close");
  if (feedbackClose) feedbackClose.onclick = () => closeFeedback();
  document.getElementById("again").onclick = () => {
    modal.hidden = true;
    openBrief(level.id, zoneNumber(level.id));
  };
  document.getElementById("to-map").onclick = () => goWorld(true);
  document.getElementById("to-next").onclick = () => {
    modal.hidden = true;
    openBrief(level.id + 1, zoneNumber(level.id + 1));
  };

  const HIRE = [
    { name: "Beto", line: "Entra. A luz tá acesa.\nEu não levanto daqui." },
    { name: "Cacau", line: "Ele recebe sentado.\nO turno vago é seu." },
    { name: "Beto", line: "Falta braço no balcão.\nJunta o que combina." },
    { name: "Cacau", line: "Fica com a gente.\nO trabalho é aqui dentro." },
  ];
  const HASH_SHIP = [
    { name: "Cacau", line: "Você falou pra não abrir.\nEu abri. O bloco já saiu." },
    { name: "Beto", line: "Manda de volta. Aqui é flor.\nEu não levanto pra caixa." },
    { name: "Cacau", line: "Tarde. Cresce se ninguém corta.\nA loja não é só flor mais.", demo: "grow" },
    { name: "Beto", line: "Então corta. Eu fico no banco.\nJunta a cor nele. Senão enche.", demo: "cut" },
  ];
  const ROSIN_SHIP = [
    { name: "Cacau", line: "Achei que brilhava e andava.\nPassei o dedo. Grudou." },
    { name: "Beto", line: "Tira o dedo. Isso prende.\nEu queria a mesa livre." },
    { name: "Cacau", line: "Não sai. A meleca segurou.\nA peça não anda.", demo: "film" },
    { name: "Beto", line: "Então solta pela cor.\nJunta do lado. Ela vai junto.", demo: "solta" },
  ];
  const SEMENTE_SHIP = [
    { name: "Cacau", line: "Plantei no meio. Achei que a junta comia.\nIgual flor." },
    { name: "Beto", line: "Tira da mesa. Isso fica no saquinho.\nO chão da loja não é canteiro." },
    { name: "Cacau", line: "Não come. No meio ela fica.\nA junta passa e ela continua.", demo: "parada" },
    { name: "Beto", line: "Então desce. Tira o de baixo.\nEla encosta no chão e conta.", demo: "chao" },
  ];
  const FOLHA_SHIP = [
    { name: "Cacau", line: "Um corte e eu levo.\nTá em cima. Já dá." },
    { name: "Beto", line: "Deixa. Eu quero ela na peça.\nA mesa fica verde assim." },
    { name: "Cacau", line: "O primeiro segurou.\nContinua aí, verdinha.", demo: "folha" },
    { name: "Beto", line: "O segundo leva. Eu perco ela.\nUm corte só não tira.", demo: "colhe" },
  ];
  const CRUMBLE_SHIP = [
    { name: "Cacau", line: "Vou quebrar no match.\nPedacinho duro. A junta resolve." },
    { name: "Beto", line: "Não mexe no pote.\nEu quero ele inteiro na casa." },
    { name: "Cacau", line: "Juntei a cor. Não quebrou.\nFica preso aí.", demo: "preso" },
    { name: "Beto", line: "Então é poder em cima.\nCombinar sozinho não tira.", demo: "quebra" },
  ];
  const BALCAO_SHIP = [
    { name: "Beto", line: "Levantei. O banco já deu.\nAgora eu fico de pé." },
    { name: "Cacau", line: "Olha o fundo. Abriu.\nA casa respira." },
    { name: "Beto", line: "O balcão cresceu comigo.\nCabe pote, jarra e braço." },
    { name: "Cacau", line: "Eu fico aqui do lado.\nO turno é nosso." },
  ];
  const CLIENTE_SHIP = [
    { name: "Beto", line: "Primeiro da fila.\nEncosta aí, sem pressa." },
    { name: "Cacau", line: "A gente atende de pé.\nO banco ficou pra trás." },
    { name: "Cliente", line: "Encostei. Tá quente aqui.\nDeixa eu ver o pote." },
    { name: "Beto", line: "Olha à vontade.\nA casa é essa." },
  ];
  const POTE_SHIP = [
    { name: "Beto", line: "Toma. Por cima do balcão.\nEsse pote é seu." },
    { name: "Cliente", line: "Recebi. Cabe na mão.\nCheira a casa." },
    { name: "Cacau", line: "Eu fico aqui vendo.\nEle leva sorrindo." },
    { name: "Beto", line: "Primeira saída da loja.\nVolta quando quiser." },
  ];
  const SAIDA_SHIP = [
    { name: "Cliente", line: "Beleza. Tô indo.\nPote na mão." },
    { name: "Beto", line: "A porta é sua.\nA gente fica no balcão." },
    { name: "Cacau", line: "Vai leve.\nA luz não apaga." },
    { name: "Beto", line: "Olha ele saindo.\nA loja fica de pé." },
  ];
  const PORTA_SHIP = [
    { name: "Beto", line: "Fechou.\nA rua ficou lá fora." },
    { name: "Cacau", line: "Só a gente de pé.\nO balcão é nosso." },
    { name: "Beto", line: "Madeira quente.\nNinguém na fila." },
    { name: "Cacau", line: "Respira fundo.\nAmanhã abre de novo." },
  ];
  let hireAt = 0;
  let shopScene = "hire";

  function shopBeats() {
    if (shopScene === "porta") return PORTA_SHIP;
    if (shopScene === "saida") return SAIDA_SHIP;
    if (shopScene === "pote") return POTE_SHIP;
    if (shopScene === "cliente") return CLIENTE_SHIP;
    if (shopScene === "balcao") return BALCAO_SHIP;
    if (shopScene === "crumble") return CRUMBLE_SHIP;
    if (shopScene === "folha") return FOLHA_SHIP;
    if (shopScene === "semente") return SEMENTE_SHIP;
    if (shopScene === "rosin") return ROSIN_SHIP;
    if (shopScene === "hash") return HASH_SHIP;
    return HIRE;
  }

  function shopArt(mode) {
    if (mode === "porta") return "art/loja-porta.jpg";
    if (mode === "saida") return "art/loja-saida.jpg";
    if (mode === "pote") return "art/loja-pote.jpg";
    if (mode === "cliente") return "art/loja-cliente.jpg";
    if (mode === "balcao") return "art/loja-balcao.jpg";
    if (mode === "crumble" || mode === "folha" || mode === "semente" || mode === "hire") return "art/loja-recebe.jpg";
    if (mode === "rosin") return "art/loja-rosin.jpg";
    if (mode === "hash") return "art/loja-haxixe.jpg";
    return "art/loja-recebe.jpg";
  }

  function paintDemo(kind) {
    const box = document.getElementById("hire-demo");
    if (!box) return;
    if (kind === "grow") {
      box.hidden = false;
      box.innerHTML = '<span class="hash-grow"><img class="hash-bud" alt="" src="art/verde.png" draggable="false"><img class="hash-born" alt="" src="art/bloco.png" draggable="false"></span>';
      return;
    }
    if (kind === "cut") {
      box.hidden = false;
      box.innerHTML = '<img class="cut-away" alt="" src="art/verde.png" draggable="false"><img class="cut-away" alt="" src="art/verde.png" draggable="false"><img class="cut-away" alt="" src="art/verde.png" draggable="false"><img class="cut-away" alt="" src="art/bloco.png" draggable="false">';
      return;
    }
    if (kind === "film") {
      box.hidden = false;
      box.innerHTML = '<span class="rosin-hold"><img alt="" src="art/verde.png" draggable="false">' + gooHtml() + "</span>";
      return;
    }
    if (kind === "solta") {
      box.hidden = false;
      box.innerHTML = '<img class="rosin-buddy cut-away" alt="" src="art/verde.png" draggable="false"><span class="rosin-hold gone"><img alt="" src="art/verde.png" draggable="false">' + gooHtml(false, "peel") + '</span><img class="rosin-buddy cut-away" alt="" src="art/verde.png" draggable="false">';
      return;
    }
    if (kind === "parada") {
      box.hidden = false;
      box.innerHTML = '<div class="seed-col"><img class="match-gone" alt="" src="art/verde.png" draggable="false"><img alt="" src="art/semente.png" draggable="false"><img class="match-gone" alt="" src="art/verde.png" draggable="false"></div>';
      return;
    }
    if (kind === "chao") {
      box.hidden = false;
      box.innerHTML = '<div class="seed-col"><img alt="" src="art/verde.png" draggable="false"><img class="seed-drop" alt="" src="art/semente.png" draggable="false"><img class="seed-clear" alt="" src="art/verde.png" draggable="false"></div>';
      return;
    }
    if (kind === "folha") {
      box.hidden = false;
      box.innerHTML = '<span class="leaf-hold"><img alt="" src="art/verde.png" draggable="false"><img class="leaf-on nick" alt="" src="art/folha.png" draggable="false"></span>';
      return;
    }
    if (kind === "colhe") {
      box.hidden = false;
      box.innerHTML = '<span class="leaf-hold wide"><img class="cut-away" alt="" src="art/verde.png" draggable="false"><img class="leaf-on harvest" alt="" src="art/folha.png" draggable="false"></span>';
      return;
    }
    if (kind === "preso") {
      box.hidden = false;
      box.innerHTML = '<div class="crumble-row"><img class="match-gone" alt="" src="art/verde.png" draggable="false"><img class="match-gone" alt="" src="art/verde.png" draggable="false"><img class="match-gone" alt="" src="art/verde.png" draggable="false"><span class="crumble-gems crumble-stay"><span class="tile vidro gem-one">' + cristalHtml() + "</span></span></div>";
      return;
    }
    if (kind === "quebra") {
      box.hidden = false;
      box.innerHTML = '<div class="crumble-row"><img class="power-in prep" alt="" src="art/prep/verde-fino.png" draggable="false"><span class="crumble-gems crumble-shatter"><span class="tile vidro gem-one">' + cristalHtml() + "</span></span></div>";
      return;
    }
    box.hidden = true;
    box.innerHTML = "";
  }

  function paintHire() {
    const list = shopBeats();
    const beat = list[hireAt];
    const name = document.getElementById("hire-name");
    const line = document.getElementById("hire-line");
    const next = document.getElementById("hire-next");
    if (name) name.textContent = beat.name;
    if (line) line.textContent = beat.line;
    const last = hireAt === list.length - 1;
    const done = shopScene === "hire" ? "Eu fico" : "Fechou";
    if (next) next.textContent = last ? done : "Continua";
    paintDemo(beat.demo || "");
  }

  function openShop(mode) {
    shopScene = mode;
    leaveTitle();
    districtEl.hidden = true;
    playEl.hidden = true;
    mapEl.hidden = true;
    modal.hidden = true;
    closeFeedback();
    const brief = document.getElementById("brief");
    if (brief) brief.hidden = true;
    const hire = document.getElementById("screen-hire");
    if (!hire) {
      showWorld(false);
      return;
    }
    const img = hire.querySelector(".hire-shop");
    if (img) img.src = shopArt(mode);
    hire.classList.toggle("hash-in", mode === "hash");
    hire.classList.toggle("rosin-in", mode === "rosin");
    hire.classList.toggle("semente-in", mode === "semente");
    hire.classList.toggle("folha-in", mode === "folha");
    hire.classList.toggle("crumble-in", mode === "crumble");
    hire.classList.toggle("balcao-in", mode === "balcao");
    hire.classList.toggle("cliente-in", mode === "cliente");
    hire.classList.toggle("pote-in", mode === "pote");
    hire.classList.toggle("saida-in", mode === "saida");
    hire.classList.toggle("porta-in", mode === "porta");
    hire.hidden = false;
    hireAt = 0;
    paintHire();
  }

  function advanceHire() {
    const list = shopBeats();
    if (hireAt < list.length - 1) {
      hireAt += 1;
      paintHire();
      return;
    }
    const hire = document.getElementById("screen-hire");
    if (hire) hire.hidden = true;
    const held = passHold;
    passHold = "";
    if (held) {
      const levelId = HempKush.storyLevel(held);
      openBrief(levelId, zoneNumber(levelId), true);
      return;
    }
    const flag = HempKush.storyFlag(shopScene);
    if (flag) progress[flag] = true;
    saveProgress();
    showWorld(false);
  }

  function stepPass() {
    passAt = HempKush.storyPassNext(passAt);
    passHold = passAt;
    openShop(passAt);
  }

  const hireNext = document.getElementById("hire-next");
  if (hireNext) hireNext.onclick = () => advanceHire();
  const passMap = document.getElementById("story-pass");
  const passShop = document.getElementById("story-pass-shop");
  if (passMap) passMap.onclick = () => stepPass();
  if (passShop) passShop.onclick = () => stepPass();
  bindWorld();
  const versionEl = document.getElementById("title-version");
  const versaoPapel = document.getElementById("versao-papel");
  if (versionEl) versionEl.textContent = VERSAO;
  if (versaoPapel) {
    versaoPapel.innerHTML = VERSOES.map((versao) => {
      const itens = versao.notas.map((linha) => "<li>" + linha + "</li>").join("");
      return '<p class="versao-nome">' + versao.nome + "</p><ul>" + itens + "</ul>";
    }).join("");
  }
  if (versionEl && versaoPapel) versionEl.onclick = () => { versaoPapel.hidden = !versaoPapel.hidden; };
  const titlePlay = document.getElementById("title-play");
  const contaPronta = pullConta();
  if (titlePlay) titlePlay.onclick = async () => {
    await contaPronta;
    leaveTitle();
    goWorld(false);
  };
  else goWorld(false);
  const titleConta = document.getElementById("title-conta");
  const contaPapel = document.getElementById("conta-papel");
  if (titleConta && contaPapel) {
    titleConta.onclick = () => { contaPapel.hidden = !contaPapel.hidden; };
    contaPapel.addEventListener("submit", async (event) => {
      event.preventDefault();
      const nome = document.getElementById("conta-nome").value.trim();
      const senha = document.getElementById("conta-senha").value;
      if (!nome || !senha) {
        avisoConta("Escreve o nome e a senha.");
        return;
      }
      try {
        const res = await fetch("/entrar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: nome, senha: senha }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          avisoConta(data.erro === "senha" ? "Essa senha não abre essa conta." : "O nome fica com letras e números, de 2 a 16.");
          return;
        }
        saveSessao({ nome: data.nome, token: data.token });
        progress = mergeFicha(progress, data.ficha);
        saveProgress();
        document.getElementById("conta-senha").value = "";
        avisoConta(data.novo ? "Conta aberta. O progresso fica na loja." : "Entrou. A loja devolveu o progresso.");
        paintConta();
      } catch (err) {
        avisoConta("A loja não respondeu. O jogo segue neste celular.");
      }
    });
  }
  const contaSair = document.getElementById("conta-sair");
  if (contaSair) contaSair.onclick = () => {
    saveSessao(null);
    avisoConta("Saiu. O celular continua com a fase.");
    paintConta();
  };
  const titleFeedback = document.getElementById("title-feedback");
  if (titleFeedback) titleFeedback.onclick = () => openFeedback("início", null);
}

if (typeof document !== "undefined") boot();
