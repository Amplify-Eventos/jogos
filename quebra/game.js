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

  function acabou() {
    if (nilo.hp <= 0) return "vitoria";
    if (kadu.hp <= 0) return "derrota";
    return "";
  }

  function fechar(qual) {
    fase = qual;
    luta.hidden = true;
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
    var alvo = de === "kadu" ? nilo : kadu;
    var quanto = dano(tipo, alvo.guarda > agora ? 1 : 0);
    alvo.hp -= quanto;
    fala.textContent = (de === "kadu" ? "Kadu" : "Nilo") + " — " + tipo + ".";
    pulso(de === "kadu" ? imgKadu : imgNilo, "bate");
    pulso(de === "kadu" ? imgNilo : imgKadu, "toma");
    if (de === "kadu") trava = agora + (tipo === "chute" ? 520 : 340);
    pintar();
    var fimDe = acabou();
    if (fimDe) fechar(fimDe);
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
    luta.hidden = false;
    fala.textContent = "A rua é essa.";
    pintar();
  }

  function tick(agora) {
    requestAnimationFrame(tick);
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

  window.Quebra = { dano: dano };
})();
