// Vozes dos personagens, à moda dos RPGs antigos: ninguém lê o texto em voz alta.
//   · Fala breve: quando um personagem começa a falar, toca uma palavra curta na voz dele
//     ("Ei.", "Hm.", "Escuta."), gravada antes por ferramentas/gerar_barks.py em audio/barks/.
//   · Balbucio: enquanto a fala (o que está entre aspas) aparece na tela, um som de voz
//     sintetizado acompanha as sílabas. Cada personagem tem o seu tom, timbre e ritmo.
// Liga, desliga e volume ficam no menu de opções (⚙), em "Vozes dos personagens".

const Vozes = (() => {
  let ctx = null;
  let audio = null;
  let falou = null; // a fala que já soltou a fala breve (redesenhar a tela não repete)
  let indice = {};
  fetch("audio/barks/indice.json").then((r) => r.json()).then((j) => (indice = j)).catch(() => {});

  const ligadas = () => Opcoes.get("vozes").ligadas;
  const volume = () => Opcoes.get("vozes").volume / 100;

  // Como cada um soa: f = tom (Hz), onda, ritmo (ms por sílaba), variação do tom, aspereza
  const PERFIS = {
    helen: { f: 230, onda: "triangle", ms: 70, varia: 0.12 },
    martha: { f: 205, onda: "triangle", ms: 85, varia: 0.1 },
    "ouvinte-x": { f: 250, onda: "sine", ms: 110, varia: 0.06 },
    petrakis: { f: 245, onda: "triangle", ms: 65, varia: 0.2 },
    hilde: { f: 265, onda: "triangle", ms: 75, varia: 0.16 },
    moore: { f: 115, onda: "sawtooth", ms: 80, varia: 0.05 },
    abe: { f: 105, onda: "triangle", ms: 95, varia: 0.12 },
    sal: { f: 95, onda: "triangle", ms: 105, varia: 0.14 },
    danny: { f: 160, onda: "triangle", ms: 55, varia: 0.18 },
    hollis: { f: 125, onda: "sine", ms: 115, varia: 0.15 },
    oswald: { f: 110, onda: "sine", ms: 90, varia: 0.02 },
    teddy: { f: 140, onda: "sine", ms: 100, varia: 0 },
    "homem-terno": { f: 88, onda: "sine", ms: 100, varia: 0 },
    riscador: { f: 80, onda: "sawtooth", ms: 60, varia: 0.3, aspero: true },
    rita: { f: 220, onda: "triangle", ms: 65, varia: 0.12 },
    guarda: { f: 120, onda: "square", ms: 70, varia: 0.06 },
    saqueador: { f: 135, onda: "sawtooth", ms: 55, varia: 0.2 },
    walt: { f: 100, onda: "triangle", ms: 95, varia: 0.08 },
    leo: { f: 310, onda: "sine", ms: 120, varia: 0.04 },
  };
  // quem não está na lista ganha um perfil fixo tirado do nome
  function perfil(npc) {
    if (PERFIS[npc]) return PERFIS[npc];
    let h = 0;
    for (const c of npc) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return { f: 95 + (h % 170), onda: ["triangle", "sine", "square"][h % 3], ms: 60 + (h % 50), varia: 0.05 + (h % 10) / 60 };
  }

  function audioCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        return null;
      }
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  // Uma sílaba do balbucio: um tom curto passando por um "filtro de vogal"
  let ultimaSilaba = 0;
  const VOGAIS = [700, 1100, 450, 1600, 900];
  function silaba(npc) {
    if (!npc || !ligadas()) return;
    if (audio && !audio.paused && !audio.ended) return; // a fala breve está tocando
    const pf = perfil(npc);
    const a = audioCtx();
    if (!a) return;
    const agora = performance.now();
    if (agora - ultimaSilaba < pf.ms) return; // o ritmo de cada um
    ultimaSilaba = agora;
    try {
      const t = a.currentTime;
      const dur = (pf.ms / 1000) * 0.85;
      const osc = a.createOscillator();
      osc.type = pf.onda;
      const f = pf.f * (1 + (Math.random() * 2 - 1) * pf.varia);
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.linearRampToValueAtTime(f * (Math.random() < 0.5 ? 0.94 : 1.05), t + dur);
      const filtro = a.createBiquadFilter();
      filtro.type = "bandpass";
      filtro.frequency.value = VOGAIS[Math.floor(Math.random() * VOGAIS.length)];
      filtro.Q.value = pf.aspero ? 1.2 : 2.5;
      const g = a.createGain();
      const v = 0.32 * volume();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(filtro).connect(g).connect(a.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch {}
  }

  // A fala breve, uma vez por fala (id = a fala na tela)
  function comecar(npc, id) {
    if (!npc || !ligadas() || id === falou) return;
    falou = id;
    const n = indice[npc];
    if (!n) return;
    parar();
    audio = new Audio(`audio/barks/${npc}-${1 + Math.floor(Math.random() * n)}.mp3`);
    audio.volume = Math.min(1, volume());
    audio.onerror = () => (audio = null);
    audio.play().catch(() => {});
  }

  function parar() {
    if (audio) audio.pause();
    audio = null;
  }

  // Saiu da fala (Continuar): a próxima fala pode soltar a sua fala breve
  function encerrar() {
    falou = null;
  }

  function alternar() {
    Opcoes.mudar("vozes", { ligadas: !ligadas() });
    if (!ligadas()) parar();
    return ligadas();
  }

  // o botão Testar do menu de opções: o Sal abre a boca
  function testar() {
    falou = null;
    comecar("sal", "teste");
    let i = 0;
    const r = setInterval(() => {
      silaba("sal");
      if (++i > 14) clearInterval(r);
    }, 60);
    setTimeout(() => (falou = null), 1500);
  }

  return { ligadas, alternar, silaba, comecar, encerrar, parar, testar, perfil };
})();
