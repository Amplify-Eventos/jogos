(function () {
  var VIDA = 100;
  var kadu = { hp: VIDA, guarda: 0 };
  var nilo = { hp: VIDA, guarda: 0 };
  var fase = "titulo";
  var trava = 0;
  var ia = 0;

  var titulo = document.getElementById("titulo");
  var luta = document.getElementById("luta");
  var fim = document.getElementById("fim");
  var versoes = document.getElementById("versoes");
  var fala = document.getElementById("fala");
  var imgKadu = document.getElementById("kadu");
  var imgNilo = document.getElementById("nilo");
  var pose = {
    kadu: { parado: "art/kadu.png", soco: "art/kadu-soco.png", chute: "art/kadu-chute.png", queda: "art/kadu-queda.png" },
    nilo: { parado: "art/nilo.png", soco: "art/nilo-soco.png", chute: "art/nilo-chute.png", queda: "art/nilo-queda.png" }
  };
  var volta = { kadu: 0, nilo: 0 };
  var fila = [];
  var posto = { kadu: { fundo: 8 }, nilo: { fundo: 74 } };
  var ALCANCE = { soco: 70, chute: 130 };

  function dano(golpe, guarda) {
    if (golpe === "soco") return guarda > 0 ? 3 : 10;
    if (golpe === "chute") return guarda > 0 ? 4 : 14;
    return 0;
  }

  function barra(id, hp) {
    document.getElementById(id).style.width = Math.max(0, hp) + "%";
  }

  function pintar() {
    barra("vida-kadu", kadu.hp);
    barra("vida-nilo", nilo.hp);
  }

  function pulso(img, classe) {
    img.classList.remove("bate", "toma");
    void img.offsetWidth;
    img.classList.add(classe);
  }

  function imgDe(quem) {
    return quem === "kadu" ? imgKadu : imgNilo;
  }

  function mostrar(quem, qual) {
    var img = imgDe(quem);
    img.src = pose[quem][qual];
    img.classList.remove("soco", "chute", "queda", "bate", "toma", "vai", "recua");
    if (qual !== "parado") img.classList.add(qual);
  }

  function colocar(img, fundo, casa) {
    var t = Math.max(0, Math.min(100, fundo)) / 100;
    var bottom = t * 46;
    var scale = (casa ? 1.2 : 1.08) - t * 0.74;
    var lado = casa ? 4 + t * 30 : 62 - t * 18;
    img.style.left = lado + "%";
    img.style.right = "auto";
    img.style.bottom = bottom + "%";
    img.style.zIndex = String(Math.round(180 - fundo));
    if (img.style && img.style.setProperty) img.style.setProperty("--corpo", scale.toFixed(3));
  }

  function plantar() {
    colocar(imgKadu, posto.kadu.fundo, true);
    colocar(imgNilo, posto.nilo.fundo, false);
  }

  function vaoEntre(de) {
    var atacante = imgDe(de);
    var outro = de === "kadu" ? imgNilo : imgKadu;
    if (!atacante.getBoundingClientRect || !outro.getBoundingClientRect) return null;
    var a = atacante.getBoundingClientRect();
    var b = outro.getBoundingClientRect();
    if (!isFinite(a.left) || !isFinite(a.right) || !isFinite(b.left) || !isFinite(b.right)) return null;
    var dx = de === "kadu" ? b.left - a.right : a.left - b.right;
    if (!isFinite(dx)) return null;
    if (dx < 0) dx = 0;
    var fundo = Math.abs(posto.nilo.fundo - posto.kadu.fundo) * 3;
    var naTela = isFinite(a.top) && isFinite(b.top);
    if (!naTela && dx > 0) return Math.max(dx, fundo);
    return fundo;
  }

  function noAlcance(vao, tipo) {
    if (vao === null) return true;
    return vao <= ALCANCE[tipo];
  }

  function mirar(de, tipo, acerta) {
    var atacante = imgDe(de);
    var outro = de === "kadu" ? imgNilo : imgKadu;
    var sinal = de === "kadu" ? 1 : -1;
    var ax = sinal * 28;
    var ay = sinal * -64;
    if (atacante.getBoundingClientRect && outro.getBoundingClientRect) {
      var a = atacante.getBoundingClientRect();
      var b = outro.getBoundingClientRect();
      if (isFinite(a.left) && isFinite(b.left) && isFinite(a.top) && isFinite(b.top) && isFinite(a.right) && isFinite(b.right)) {
        var dx = ((b.left + b.right) / 2) - ((a.left + a.right) / 2);
        var dy = ((b.top + b.bottom) / 2) - ((a.top + a.bottom) / 2);
        var dist = Math.hypot(dx, dy) || 1;
        var alcance = acerta ? Math.max(24, dist * 0.7) : ALCANCE[tipo];
        ax = dx / dist * alcance;
        ay = dy / dist * alcance;
      }
    }
    if (atacante.style && atacante.style.setProperty) {
      atacante.style.setProperty("--alcance-x", Math.round(ax) + "px");
      atacante.style.setProperty("--alcance-y", Math.round(ay) + "px");
    }
  }

  function atravessa(de, tipo, acerta) {
    mirar(de, tipo, acerta);
    mostrar(de, tipo);
    var atacante = imgDe(de);
    var outro = de === "kadu" ? imgNilo : imgKadu;
    outro.classList.remove("recua", "toma", "bate");
    void atacante.offsetWidth;
    void outro.offsetWidth;
    atacante.classList.add("vai");
    if (acerta) outro.classList.add("recua");
  }

  function aplicar(item) {
    if (fase !== "luta") return;
    if (!item.acerta) {
      if (item.de === "kadu") posto.kadu.fundo = Math.min(posto.nilo.fundo - 14, posto.kadu.fundo + 16);
      else posto.nilo.fundo = Math.max(posto.kadu.fundo + 14, posto.nilo.fundo - 16);
      plantar();
      return;
    }
    var alvo = item.alvo === "kadu" ? kadu : nilo;
    var guarda = alvo.guarda > item.quando ? 1 : 0;
    alvo.hp -= dano(item.tipo, guarda);
    if (item.alvo === "kadu") posto.kadu.fundo = Math.max(0, posto.kadu.fundo - 12);
    else posto.nilo.fundo = Math.min(94, posto.nilo.fundo + 12);
    plantar();
    pintar();
    var fimDe = acabou();
    if (fimDe) fechar(fimDe);
  }

  function acabou() {
    if (nilo.hp <= 0) return "vitoria";
    if (kadu.hp <= 0) return "derrota";
    return "";
  }

  function fechar(qual) {
    fase = qual;
    volta.kadu = 0;
    volta.nilo = 0;
    fila = [];
    mostrar(qual === "vitoria" ? "nilo" : "kadu", "queda");
    luta.classList.add("acabou");
    fim.hidden = false;
    document.getElementById("fim-titulo").textContent = qual === "vitoria" ? "Kadu ficou de pé" : "Kadu caiu";
    document.getElementById("fim-texto").textContent = qual === "vitoria" ? "Nilo no chão." : "A rua ficou com o Nilo.";
  }

  function golpe(de, tipo) {
    var agora = performance.now();
    if (fase !== "luta") return;
    if (de === "kadu" && agora < trava) return;
    if (tipo === "guarda") {
      if (de === "kadu") {
        kadu.guarda = agora + 700;
        fala.textContent = "Kadu fecha a guarda.";
        trava = agora + 280;
      } else {
        nilo.guarda = agora + 650;
        fala.textContent = "Nilo fecha a guarda.";
      }
      return;
    }
    var alvoNome = de === "kadu" ? "nilo" : "kadu";
    var longo = tipo === "chute";
    var acerta = noAlcance(vaoEntre(de), tipo);
    fala.textContent = (de === "kadu" ? "Kadu" : "Nilo") + " — " + tipo + (acerta ? "." : ". Passou.");
    atravessa(de, tipo, acerta);
    fila.push({ de: de, tipo: tipo, alvo: alvoNome, acerta: acerta, quando: agora + (longo ? 280 : 190) });
    volta[de] = agora + (longo ? 660 : 500);
    if (de === "kadu") trava = agora + (longo ? 520 : 340);
  }

  function comecar() {
    kadu.hp = VIDA;
    nilo.hp = VIDA;
    kadu.guarda = 0;
    nilo.guarda = 0;
    trava = 0;
    ia = performance.now() + 900;
    fase = "luta";
    titulo.hidden = true;
    fim.hidden = true;
    luta.classList.remove("acabou");
    luta.hidden = false;
    volta.kadu = 0;
    volta.nilo = 0;
    fila = [];
    posto.kadu.fundo = 8;
    posto.nilo.fundo = 74;
    plantar();
    mostrar("kadu", "parado");
    mostrar("nilo", "parado");
    fala.textContent = "O Nilo está no fundo da rua.";
    pintar();
  }

  function repor(agora) {
    var i = 0;
    while (i < fila.length) {
      if (agora >= fila[i].quando) {
        var item = fila.splice(i, 1)[0];
        if (fase === "luta") aplicar(item);
      } else {
        i += 1;
      }
    }
    if (fase !== "luta") return;
    if (volta.kadu && agora >= volta.kadu) {
      volta.kadu = 0;
      mostrar("kadu", "parado");
    }
    if (volta.nilo && agora >= volta.nilo) {
      volta.nilo = 0;
      mostrar("nilo", "parado");
    }
  }

  function tick(agora) {
    requestAnimationFrame(tick);
    repor(agora);
    if (fase !== "luta" || agora < ia) return;
    ia = agora + 860;
    var escolha = Math.random();
    golpe("nilo", escolha < 0.45 ? "soco" : escolha < 0.75 ? "chute" : "guarda");
  }

  document.getElementById("jogar").onclick = comecar;
  document.getElementById("de-novo").onclick = comecar;
  document.getElementById("soco").onclick = function () { golpe("kadu", "soco"); };
  document.getElementById("chute").onclick = function () { golpe("kadu", "chute"); };
  document.getElementById("guarda").onclick = function () { golpe("kadu", "guarda"); };
  document.getElementById("versao").onclick = function () { versoes.hidden = false; };
  document.getElementById("fechar-versoes").onclick = function () { versoes.hidden = true; };
  requestAnimationFrame(tick);

  window.Quebra = { dano: dano, noAlcance: noAlcance };
})();
