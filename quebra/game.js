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
  var posto = { kadu: 4, nilo: 62 };
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

  function plantar() {
    imgKadu.style.left = posto.kadu + "%";
    imgKadu.style.right = "auto";
    imgNilo.style.left = posto.nilo + "%";
    imgNilo.style.right = "auto";
  }

  function vaoEntre(de) {
    var atacante = imgDe(de);
    var outro = de === "kadu" ? imgNilo : imgKadu;
    if (!atacante.getBoundingClientRect || !outro.getBoundingClientRect) return null;
    var a = atacante.getBoundingClientRect();
    var b = outro.getBoundingClientRect();
    var vao = de === "kadu" ? b.left - a.right : a.left - b.right;
    if (!isFinite(vao)) return null;
    return vao;
  }

  function noAlcance(vao, tipo) {
    if (vao === null) return true;
    return vao <= ALCANCE[tipo];
  }

  function mirar(de, tipo, acerta) {
    var atacante = imgDe(de);
    var vao = vaoEntre(de);
    var px = acerta ? (vao === null ? null : vao + 36) : ALCANCE[tipo];
    var valor = "26vw";
    if (px !== null) {
      if (px < 24) px = 24;
      valor = (de === "kadu" ? px : -px) + "px";
    }
    if (atacante.style && atacante.style.setProperty) atacante.style.setProperty("--alcance", valor);
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
      if (item.de === "kadu") posto.kadu = Math.min(posto.nilo - 28, posto.kadu + 8);
      else posto.nilo = Math.max(posto.kadu + 28, posto.nilo - 8);
      plantar();
      return;
    }
    var alvo = item.alvo === "kadu" ? kadu : nilo;
    var guarda = alvo.guarda > item.quando ? 1 : 0;
    alvo.hp -= dano(item.tipo, guarda);
    if (item.alvo === "kadu") posto.kadu = Math.max(0, posto.kadu - 6);
    else posto.nilo = Math.min(78, posto.nilo + 6);
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
    posto.kadu = 4;
    posto.nilo = 62;
    plantar();
    mostrar("kadu", "parado");
    mostrar("nilo", "parado");
    fala.textContent = "A rua é essa.";
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
