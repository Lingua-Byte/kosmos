// Narrador: lê em voz alta o texto das cenas, com a voz que o próprio aparelho já tem
// (Web Speech API — gratuita, sem conta, funciona no celular).
// Cada eixo tem o seu jeito de falar: Medieval mais lento e grave, Espacial mais rápido e agudo.
// Enquanto o narrador fala, a música abaixa.

const Narrador = (() => {
  const CHAVE = "kosmos.narrador";
  const fala = window.speechSynthesis;
  const PERFIS = {
    x: { rate: 1, pitch: 1 },
    y: { rate: 0.88, pitch: 0.8 },
    z: { rate: 1.08, pitch: 1.2 },
  };
  let ultimo = "";
  let geracao = 0; // cada nova leitura invalida a anterior
  let falando = false;

  function preferencias() {
    try {
      return { auto: true, ...JSON.parse(localStorage.getItem(CHAVE)) };
    } catch {
      return { auto: true };
    }
  }

  function guardar(p) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(p));
    } catch {}
  }

  // Melhor voz em português do aparelho: pt-BR antes de pt-PT, vozes "naturais"/online antes das locais
  function voz() {
    const vozes = fala.getVoices().filter((v) => /^pt/i.test(v.lang));
    const nota = (v) => (/pt[-_]BR/i.test(v.lang) ? 2 : 0) + (/natural|online|google/i.test(v.name) ? 1 : 0);
    return vozes.sort((a, b) => nota(b) - nota(a))[0] || null;
  }

  // O Chrome corta falas longas no meio: lê frase a frase
  function pedacos(texto) {
    return (texto.match(/[^.!?…]+[.!?…]+["”»]?|[^.!?…]+$/g) || [])
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function aoParar() {
    falando = false;
    Musica.abaixar(false);
    atualizarBotoes();
  }

  function falar(texto, eixo) {
    if (!fala) return;
    const minha = ++geracao;
    fala.cancel();
    const partes = pedacos(texto);
    if (!partes.length) return aoParar();
    const v = voz();
    const perfil = PERFIS[eixo] || PERFIS.x;
    falando = true;
    Musica.abaixar(true);
    atualizarBotoes();
    partes.forEach((parte, i) => {
      const u = new SpeechSynthesisUtterance(parte);
      u.lang = v ? v.lang : "pt-BR";
      if (v) u.voice = v;
      u.rate = perfil.rate;
      u.pitch = perfil.pitch;
      if (i === partes.length - 1) u.onend = () => minha === geracao && aoParar();
      u.onerror = () => minha === geracao && aoParar();
      fala.speak(u);
    });
  }

  function parar() {
    if (!fala) return;
    geracao++;
    fala.cancel();
    if (falando) aoParar();
  }

  // Chamado a cada desenho da cena: só lê quando o texto mudou (abrir o mapa não repete a leitura)
  function cena(texto, eixo) {
    atualizarBotoes();
    if (!fala || texto === ultimo) return;
    ultimo = texto;
    if (preferencias().auto) falar(texto, eixo);
    else parar();
  }

  function atualizarBotoes() {
    const auto = preferencias().auto;
    document.querySelectorAll("[data-acao='narrar']").forEach((b) => {
      b.textContent = falando ? "■ Parar" : "🔊 Narrar";
      b.setAttribute("aria-pressed", String(falando));
    });
    document.querySelectorAll("[data-acao='narrar-auto']").forEach((b) => {
      b.textContent = auto ? "Narração automática: ligada" : "Narração automática: desligada";
      b.setAttribute("aria-pressed", String(auto));
    });
  }

  // as vozes chegam depois do carregamento em alguns navegadores
  if (fala) fala.onvoiceschanged = () => {};

  return {
    disponivel: Boolean(fala),
    cena,
    parar,
    // botão 🔊: lê de novo o que está na tela, ou para
    alternar(texto, eixo) {
      if (falando) parar();
      else falar(texto, eixo);
    },
    alternarAuto(texto, eixo) {
      const p = preferencias();
      p.auto = !p.auto;
      guardar(p);
      if (p.auto) falar(texto, eixo);
      else parar();
      atualizarBotoes();
    },
  };
})();
