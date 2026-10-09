const Feel = (() => {
  const KEY = "hemp-kush-feel";
  const COLOR = {
    verde: "#7dff6a", roxo: "#c45cff", ambar: "#ffb020", bong: "#3dff78",
    pote: "#e7c4a0", seda: "#f3e6c8", bud: "#7dff6a", folha: "#3ddc97",
    flor: "#c45cff", semente: "#e7c4a0", bomb: "#fff4c2",
  };
  let prefs = { motion: true, flash: true, music: true, sfx: true, haptic: true };
  let ctx = null;
  let bed = null;
  let air = null;
  let meter = 0;
  let vibesUntil = 0;
  let bits = 0;

  function load() {
    try { prefs = Object.assign(prefs, JSON.parse(localStorage.getItem(KEY) || "{}")); }
    catch (err) { prefs = { motion: true, flash: true, music: true, sfx: true, haptic: true }; }
    if (!localStorage.getItem(KEY) && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      prefs.motion = false;
      prefs.flash = false;
    }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(prefs)); }
  function still() { return !prefs.motion; }
  function hot() { return vibesUntil > Date.now(); }

  function apply() {
    document.body.classList.toggle("feel-still", still());
    document.body.classList.toggle("feel-noflash", !prefs.flash);
    document.body.classList.toggle("high-vibes", hot());
    ["motion", "flash", "music", "sfx", "haptic"].forEach((name) => {
      const box = document.getElementById("feel-" + name);
      if (box) box.checked = !!prefs[name];
    });
    if (!prefs.music && bed) bed.gain.value = 0;
  }

  function audio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);
      bed = ctx.createGain();
      bed.gain.value = 0;
      const low = ctx.createOscillator();
      low.type = "sine";
      low.frequency.value = 98;
      low.connect(bed);
      const high = ctx.createOscillator();
      high.type = "triangle";
      high.frequency.value = 196;
      air = ctx.createGain();
      air.gain.value = 0;
      high.connect(air);
      air.connect(bed);
      low.start();
      high.start();
      bed.connect(master);
      ctx._master = master;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function arm() { if (prefs.sfx || prefs.music) audio(); }

  function tone(freq, dur, type, vol, delay) {
    if (!prefs.sfx) return;
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime + (delay || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(ac._master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function buzz(ms) {
    if (!prefs.haptic || !navigator.vibrate) return;
    try { navigator.vibrate(ms); } catch (err) { /* sem motor */ }
  }

  function music(combo) {
    if (!bed) return;
    const on = prefs.music ? 1 : 0;
    const lift = hot() ? 0.045 : Math.min(0.03, combo * 0.006);
    bed.gain.cancelScheduledValues(0);
    bed.gain.value = on * (0.012 + lift);
    if (air) air.gain.value = on * (hot() ? 0.35 : Math.min(0.5, combo * 0.08));
  }

  function rank(wave) {
    const n = wave.cleared.length;
    const powers = wave.cleared.filter((cell) => cell.power).length;
    if (powers >= 2 || n >= 12 || wave.combo >= 5) return 4;
    if (wave.power || n >= 5 || (wave.spawned && wave.spawned.some((cell) => cell.power === "bomb" || cell.power === "wrap"))) return 3;
    if (n >= 4 || (wave.spawned && wave.spawned.length)) return 2;
    return 1;
  }

  function hold(wave) {
    if (still()) return 0;
    return [0, 0, 0, 16, 28][rank(wave)] || 0;
  }

  function shout(hit) {
    const combo = hit.combo || 1;
    const level = rank(hit);
    if (combo >= 6) return "Chapou geral";
    if (combo >= 5) return "Absurdo";
    if (combo >= 4) return "Sem dó";
    if (combo >= 3) return "Chapeei";
    if (level >= 4) return "Chapou";
    if (level >= 3) return "Chapeei";
    if (combo >= 2) return "De novo";
    if (level >= 2) return "Gostoso";
    return "";
  }

  function banner(text, level) {
    if (!text || still()) return;
    let el = document.getElementById("fx-banner");
    if (!el) {
      el = document.createElement("p");
      el.id = "fx-banner";
      el.className = "fx-banner";
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.dataset.level = String(level);
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
  }

  function flash(level) {
    if (!prefs.flash || still() || level < 3) return;
    let el = document.getElementById("fx-flash");
    if (!el) {
      el = document.createElement("i");
      el.id = "fx-flash";
      el.className = "fx-flash";
      document.body.appendChild(el);
    }
    el.dataset.level = String(level);
    el.classList.remove("on");
    void el.offsetWidth;
    el.classList.add("on");
  }

  function shake(level) {
    if (still()) return;
    const stage = document.querySelector(".stage");
    if (!stage) return;
    stage.classList.remove("punch-1", "punch-2", "punch-3", "punch-4");
    void stage.offsetWidth;
    stage.classList.add("punch-" + level);
    setTimeout(() => stage.classList.remove("punch-" + level), 280);
  }

  function cellBox(board, cell) {
    const el = board.querySelector('[data-r="' + cell.r + '"][data-c="' + cell.c + '"]');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const host = board.getBoundingClientRect();
    return {
      el,
      x: rect.left - host.left + rect.width / 2,
      y: rect.top - host.top + rect.height / 2,
      pageX: rect.left + rect.width / 2,
      pageY: rect.top + rect.height / 2,
    };
  }

  function pieceSrc(kind, power) {
    const prep = {
      verde: "verde", roxo: "roxo", ambar: "ambar", rosa: "rosa", azul: "azul", branco: "branco",
      folha: "verde", bud: "verde", flor: "roxo", semente: "bloco", bloco: "bloco", bomb: "ambar",
    };
    const base = prep[kind] || "verde";
    if (power === "row" || power === "col") return "art/prep/" + base + "-fino.png";
    if (power === "wrap") return "art/prep/" + base + "-bomba.png";
    if (power === "pipe") return "art/prep/" + base + "-pipe.png";
    if (power === "bomb") return "art/bong.png";
    const art = {
      verde: "art/verde.png", roxo: "art/roxo.png", ambar: "art/ambar.png", rosa: "art/rosa.png",
      azul: "art/azul.png", branco: "art/branco.png", hash: "art/bloco.png", folha: "art/folha.png",
      flor: "art/flor.png", semente: "art/semente.png", bud: "art/bud.png", bloco: "art/bloco.png",
      bong: "art/bong.png",
    };
    return art[kind] || "";
  }

  function spark(board, box, kind, power) {
    if (!box || bits > 48 || still()) return;
    const src = pieceSrc(kind, power);
    if (!src) return;
    bits += 1;
    const dot = document.createElement("i");
    dot.className = "fx-bit";
    dot.style.left = box.x + "px";
    dot.style.top = box.y + "px";
    const img = document.createElement("img");
    img.alt = "";
    img.draggable = false;
    img.src = src;
    dot.appendChild(img);
    const ang = Math.random() * Math.PI * 2;
    dot.style.setProperty("--dx", Math.cos(ang) * 22 + "px");
    dot.style.setProperty("--dy", Math.sin(ang) * 16 + "px");
    board.appendChild(dot);
    setTimeout(() => { dot.remove(); bits = Math.max(0, bits - 1); }, 460);
  }

  function fly(box, text) {
    if (!box || !text) return;
    const score = document.getElementById("score");
    if (!score) return;
    const chip = document.createElement("b");
    chip.className = "fx-fly";
    chip.textContent = text;
    chip.style.left = box.pageX + "px";
    chip.style.top = box.pageY + "px";
    document.body.appendChild(chip);
    const to = score.getBoundingClientRect();
    const dx = to.left + to.width / 2 - box.pageX;
    const dy = to.top + to.height / 2 - box.pageY;
    if (chip.animate && !still()) {
      chip.animate(
        [{ transform: "translate(-50%, -50%) scale(1)", opacity: 1 }, { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(0.55)", opacity: 0.15 }],
        { duration: 380, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" },
      );
    }
    score.classList.remove("pulse");
    void score.offsetWidth;
    score.classList.add("pulse");
    setTimeout(() => chip.remove(), 420);
  }

  function fill(amount) {
    if (hot()) return;
    meter = Math.min(100, meter + amount);
    const bar = document.getElementById("vibes-fill");
    if (bar) bar.style.width = meter + "%";
    const host = document.getElementById("vibes");
    if (host) {
      host.classList.toggle("ready", meter >= 100 || hot());
      host.classList.toggle("live", meter > 0 || hot());
    }
    if (meter >= 100 && !hot()) {
      vibesUntil = Date.now() + 7000;
      meter = 0;
      if (bar) bar.style.width = "100%";
      document.body.classList.add("high-vibes");
      banner("Chapa total", 4);
      tone(523, 0.12, "sawtooth", 0.04);
      tone(784, 0.18, "triangle", 0.04, 0.08);
      buzz([20, 30, 40]);
      setTimeout(() => {
        if (Date.now() >= vibesUntil) {
          document.body.classList.remove("high-vibes");
          meter = 0;
          if (bar) bar.style.width = "0%";
          if (host) host.classList.remove("ready");
        }
      }, 7100);
    }
  }

  function resetMeter() {
    meter = 0;
    vibesUntil = 0;
    document.body.classList.remove("high-vibes");
    const bar = document.getElementById("vibes-fill");
    const host = document.getElementById("vibes");
    if (bar) bar.style.width = "0%";
    if (host) host.classList.remove("live", "ready");
  }

  function anticipate(board, wave) {
    if (still() || rank(wave) < 3) return;
    wave.cleared.forEach((cell) => {
      const el = board.querySelector('[data-r="' + cell.r + '"][data-c="' + cell.c + '"]');
      if (el) el.classList.add("antic");
    });
  }

  function wave(board, hit) {
    const level = rank(hit);
    const name = shout(hit);
    shake(level);
    flash(level);
    if (name) banner(name, level);
    const pitch = 1 + Math.min(0.5, (hit.combo - 1) * 0.08);
    if (level >= 4) {
      tone(180 * pitch, 0.16, "sawtooth", 0.05);
      tone(520 * pitch, 0.2, "triangle", 0.05, 0.05);
      buzz([28, 24, 48]);
    } else if (level === 3) {
      tone(392 * pitch, 0.14, "triangle", 0.05);
      tone(588 * pitch, 0.12, "square", 0.03, 0.04);
      buzz([18, 22, 28]);
    } else if (level === 2) {
      tone(330 * pitch, 0.1, "triangle", 0.045);
      buzz(22);
    } else {
      tone(260 * pitch, 0.07, "triangle", 0.04);
      buzz(10);
    }
    const focus = hit.cleared[Math.floor(hit.cleared.length / 2)] || hit.cleared[0];
    const cells = hit.cleared.length > 8 ? hit.cleared.filter((_, i) => i % 3 === 0).slice(0, 8) : hit.cleared;
    cells.forEach((cell) => spark(board, cellBox(board, cell), cell.kind, cell.power));
    if (focus) fly(cellBox(board, focus), "+" + hit.score);
    fill(level * 6 + hit.combo * 4);
    music(hit.combo);
    if (hit.spawned && hit.spawned.length) tone(640 * pitch, 0.1, "sine", 0.04, 0.06);
  }

  function glass(kind) {
    if (kind === "folha" || kind === "bud") return "verde";
    if (kind === "flor") return "roxo";
    if (kind === "semente" || kind === "bloco") return "bloco";
    if (kind === "bomb") return "ambar";
    return COLOR[kind] ? kind : "verde";
  }

  function rise(kind) {
    if (still()) return Promise.resolve();
    const layer = document.createElement("div");
    layer.className = "bong-rise";
    layer.innerHTML = '<img alt="" src="art/prep/' + glass(kind) + '-bong.png" draggable="false">'
      + '<span class="smoke"></span><span class="smoke b"></span><span class="smoke c"></span>';
    document.body.appendChild(layer);
    tone(160, 0.42, "sawtooth", 0.05);
    tone(420, 0.28, "triangle", 0.04, 0.12);
    buzz([22, 28, 40]);
    banner("Fumou", 4);
    return new Promise((done) => {
      setTimeout(() => {
        layer.remove();
        done();
      }, 420);
    });
  }

  function power(name) {
    arm();
    tone(name === "bong" ? 220 : 160, 0.12, "sawtooth", 0.04);
    buzz([16, 20, 30]);
    const word = { fino: "Beck fino", bomba: "Beck grosso", bong: "Fumou", pipe: "Pipe" };
    banner(word[name] || "Pá", 3);
    shake(3);
  }

  function touch(el) {
    arm();
    if (el && el.classList && !still()) {
      el.classList.add("press");
      setTimeout(() => el.classList.remove("press"), 140);
    }
    tone(520, 0.03, "square", 0.02);
    buzz(8);
  }

  function snap() {
    tone(240, 0.05, "square", 0.03);
    buzz(12);
  }

  function reject() {
    tone(140, 0.08, "sine", 0.03);
    buzz(16);
  }

  function ending(didWin, info) {
    music(didWin ? 4 : 0);
    if (didWin) {
      tone(523, 0.1, "triangle", 0.05);
      tone(659, 0.12, "triangle", 0.05, 0.12);
      tone(784, 0.16, "triangle", 0.05, 0.24);
      buzz([18, 24, 18, 40]);
      if (info.record) banner("RECORDE", 4);
      else if (info.stars >= 3) banner("Chapou", 3);
    } else {
      tone(196, 0.16, "sine", 0.04);
      buzz(30);
    }
    const pause = still() ? 0 : didWin ? 420 : 160;
    return new Promise((resolve) => setTimeout(resolve, pause));
  }

  function mount() {
    load();
    apply();
    document.addEventListener("pointerdown", (event) => {
      arm();
      const el = event.target.closest && event.target.closest(".tile, .boost, .node, .pin-node, .gear, .card button, .feel-open, .title-play");
      if (el) touch(el);
    }, { passive: true });
    const panel = document.getElementById("feel-panel");
    document.querySelectorAll(".feel-open").forEach((open) => {
      open.addEventListener("click", () => {
        if (!panel) return;
        const screen = open.closest(".screen");
        if (screen && !screen.contains(panel)) {
          screen.appendChild(panel);
          panel.hidden = true;
        }
        panel.hidden = !panel.hidden;
      });
    });
    ["motion", "flash", "music", "sfx", "haptic"].forEach((name) => {
      const box = document.getElementById("feel-" + name);
      if (!box) return;
      box.addEventListener("change", () => {
        prefs[name] = box.checked;
        save();
        apply();
        music(0);
      });
    });
  }

  function line(hit) { return shout(hit) || "Boa."; }

  return { hold, anticipate, wave, power, rise, snap, reject, ending, resetMeter, mount, touch, line };
})();

if (typeof document !== "undefined") Feel.mount();
