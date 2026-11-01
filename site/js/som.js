// Sons de interface, no espírito dos menus de Fallout e Resident Evil: cliques mecânicos,
// bipes de terminal, o "clunk" de abrir um menu. Tudo sintetizado na hora (Web Audio), sem arquivos.
// Cada eixo soa diferente: Urbano = terminal de fósforo; Medieval = madeira e papel; Espacial = painel de bordo.

const Som = (() => {
  const CHAVE = "kosmos.sons";
  let ctx = null;

  function ligado() {
    try {
      return localStorage.getItem(CHAVE) !== "0";
    } catch {
      return true;
    }
  }

  function alternar() {
    const sim = !ligado();
    try {
      localStorage.setItem(CHAVE, sim ? "1" : "0");
    } catch {}
    return sim;
  }

  function audio() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  const eixo = () => (document.body.classList.contains("tema-y") ? "y" : document.body.classList.contains("tema-z") ? "z" : "x");

  // um tom curto com envelope rápido
  function tom(a, { freq, fim = freq, dur = 0.05, tipo = "square", vol = 0.06, atraso = 0 }) {
    const t = a.currentTime + atraso;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, fim), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  // estalo de ruído filtrado (o "clack" mecânico)
  function estalo(a, { freq = 2500, dur = 0.03, vol = 0.12, atraso = 0, q = 1 }) {
    const t = a.currentTime + atraso;
    const n = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, n, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3;
    const s = a.createBufferSource();
    s.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    const g = a.createGain();
    g.gain.value = vol;
    s.connect(f).connect(g).connect(a.destination);
    s.start(t);
  }

  const SONS = {
    // escolher uma opção / tocar num botão
    clique: {
      x: (a) => { estalo(a, { freq: 3200, dur: 0.02, vol: 0.1 }); tom(a, { freq: 1900, dur: 0.035, vol: 0.035 }); },
      y: (a) => { estalo(a, { freq: 900, dur: 0.04, vol: 0.18, q: 2 }); },
      z: (a) => { tom(a, { freq: 1400, fim: 1800, dur: 0.05, tipo: "sine", vol: 0.06 }); estalo(a, { freq: 4000, dur: 0.015, vol: 0.05 }); },
    },
    // abrir um menu (mapa, diário, bolsa…): o "clunk" pesado
    abrir: {
      x: (a) => { estalo(a, { freq: 1800, dur: 0.035, vol: 0.14 }); tom(a, { freq: 140, fim: 70, dur: 0.12, tipo: "triangle", vol: 0.12 }); tom(a, { freq: 1200, fim: 1600, dur: 0.06, vol: 0.03, atraso: 0.05 }); },
      y: (a) => { estalo(a, { freq: 500, dur: 0.08, vol: 0.2, q: 0.8 }); estalo(a, { freq: 1600, dur: 0.12, vol: 0.06, atraso: 0.04, q: 0.5 }); },
      z: (a) => { tom(a, { freq: 600, fim: 1200, dur: 0.08, tipo: "sine", vol: 0.07 }); tom(a, { freq: 1200, fim: 1500, dur: 0.06, tipo: "sine", vol: 0.05, atraso: 0.08 }); },
    },
    // fechar
    fechar: {
      x: (a) => { tom(a, { freq: 1500, fim: 900, dur: 0.06, vol: 0.03 }); estalo(a, { freq: 2200, dur: 0.02, vol: 0.08, atraso: 0.04 }); },
      y: (a) => { estalo(a, { freq: 700, dur: 0.05, vol: 0.14, q: 1.5 }); },
      z: (a) => { tom(a, { freq: 1300, fim: 650, dur: 0.09, tipo: "sine", vol: 0.06 }); },
    },
    // sair andando para outro lugar
    viajar: {
      x: (a) => { [0, 0.09, 0.18].forEach((d) => tom(a, { freq: 880, dur: 0.04, vol: 0.03, atraso: d })); tom(a, { freq: 660, dur: 0.18, vol: 0.03, atraso: 0.3 }); },
      y: (a) => { [0, 0.25].forEach((d) => estalo(a, { freq: 300, dur: 0.1, vol: 0.2, atraso: d, q: 1.2 })); },
      z: (a) => { tom(a, { freq: 300, fim: 900, dur: 0.35, tipo: "sawtooth", vol: 0.025 }); },
    },
  };

  function tocar(nome) {
    if (!ligado()) return;
    const a = audio();
    if (!a) return;
    try {
      (SONS[nome] || SONS.clique)[eixo()](a);
    } catch {}
  }

  return { tocar, ligado, alternar };
})();
