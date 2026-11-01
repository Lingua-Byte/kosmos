// Narrador (opcional, desligado por padrão): lê em voz alta o texto das cenas com a voz
// que o próprio aparelho já tem (Web Speech API — gratuita, sem conta).
// Para soar menos "robô", a leitura é feita frase a frase com pausas de respiração,
// e muda de tom conforme o que está sendo lido: título, narração, falas entre aspas, perguntas
// e o ambiente (as frases em itálico, lidas mais baixo e devagar).
// Cada eixo tem o seu jeito de falar. A música não é tocada aqui: ela segue no volume dela.
// Há também a "voz neural" (Piper, pt-BR, roda no próprio navegador, gratuita): soa bem mais
// humana, mas na primeira vez baixa o modelo (~60 MB), que fica guardado no aparelho.

const Narrador = (() => {
  const CHAVE = "kosmos.narrador";
  const fala = window.speechSynthesis;
  const EIXO = {
    x: { rate: 0.95, pitch: 1 },
    y: { rate: 0.82, pitch: 0.85 },
    z: { rate: 1.0, pitch: 1.12 },
  };
  // ajustes por tipo de trecho (somados/multiplicados ao perfil do eixo)
  const TOM = {
    titulo: { rate: 0.85, pitch: 0.95, volume: 1, pausa: 900 },
    texto: { rate: 1, pitch: 1, volume: 1, pausa: 420 },
    fala: { rate: 1.05, pitch: 1.12, volume: 1, pausa: 500 },
    pergunta: { rate: 0.95, pitch: 1.08, volume: 1, pausa: 650 },
    ambiente: { rate: 0.85, pitch: 0.9, volume: 0.7, pausa: 700 },
  };
  const FIM_PARAGRAFO = 550; // pausa a mais entre parágrafos
  const RETICENCIAS = 500; // e depois de "..."

  let ultimo = "";
  let geracao = 0; // cada nova leitura invalida a anterior
  let falando = false;
  let espera = null;
  let estado = ""; // aviso ao lado dos botões ("baixando a voz… 40%")

  function preferencias() {
    try {
      return { ligado: false, voz: "aparelho", ...JSON.parse(localStorage.getItem(CHAVE)) };
    } catch {
      return { ligado: false, voz: "aparelho" };
    }
  }

  function ligado() {
    return preferencias().ligado;
  }

  function guardar(mudancas) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ ...preferencias(), ...mudancas }));
    } catch {}
  }

  // ---------- Voz neural (Piper no navegador) ----------
  const NEURAL = {
    biblioteca: "https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/+esm",
    voz: "pt_BR-faber-medium",
    // velocidade do áudio por eixo; sem preservar o tom, mais lento também fica mais grave
    eixo: { x: 1, y: 0.9, z: 1.06 },
    tipo: {
      titulo: { rate: 0.95, volume: 1, pausa: 700 },
      texto: { rate: 1, volume: 1, pausa: 450 },
      ambiente: { rate: 0.94, volume: 0.65, pausa: 600 },
    },
  };
  let tts = null;
  let audio = null;

  function aviso(texto) {
    estado = texto;
    atualizarBotoes();
  }

  async function prepararNeural() {
    if (!tts) tts = await import(NEURAL.biblioteca);
    if (!(await tts.stored()).includes(NEURAL.voz)) {
      aviso("baixando a voz… 0%");
      await tts.download(NEURAL.voz, (p) => p.total && aviso(`baixando a voz… ${Math.round((p.loaded * 100) / p.total)}%`));
    }
  }

  function tocarAudio(blob, tom, eixo, minha) {
    return new Promise((pronto) => {
      if (minha !== geracao) return pronto();
      audio = new Audio(URL.createObjectURL(blob));
      audio.preservesPitch = false;
      audio.playbackRate = (NEURAL.eixo[eixo] || 1) * tom.rate;
      audio.volume = tom.volume;
      audio.onended = audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        pronto();
      };
      audio.play().catch(pronto);
      Musica.garantir();
    });
  }

  async function falarNeural(paragrafos, eixo, minha) {
    try {
      await prepararNeural();
    } catch {
      // sem internet, navegador antigo...: volta para a voz do aparelho
      guardar({ voz: "aparelho" });
      aviso("a voz neural não carregou aqui; usando a do aparelho");
      return falarAparelho(paragrafos, eixo, minha);
    }
    if (minha !== geracao) return;
    aviso("");
    // cada parágrafo vira um áudio; o próximo já vai sendo gerado enquanto o atual toca
    const gerar = (p) => tts.predict({ text: p.texto, voiceId: NEURAL.voz });
    let proximo = gerar(paragrafos[0]);
    for (let i = 0; i < paragrafos.length; i++) {
      const blob = await proximo.catch(() => null);
      if (minha !== geracao) return;
      if (i + 1 < paragrafos.length) proximo = gerar(paragrafos[i + 1]);
      const tom = NEURAL.tipo[paragrafos[i].tipo] || NEURAL.tipo.texto;
      if (blob) await tocarAudio(blob, tom, eixo, minha);
      if (minha !== geracao) return;
      await new Promise((r) => (espera = setTimeout(r, tom.pausa)));
    }
    if (minha === geracao) aoParar();
  }

  // Melhor voz em português do aparelho: pt-BR antes de pt-PT, vozes "naturais"/online antes das locais
  function voz() {
    const vozes = fala.getVoices().filter((v) => /^pt/i.test(v.lang));
    const nota = (v) => (/pt[-_]BR/i.test(v.lang) ? 2 : 0) + (/natural|online|google/i.test(v.name) ? 1 : 0);
    return vozes.sort((a, b) => nota(b) - nota(a))[0] || null;
  }

  // Parágrafos [{tipo, texto}] → falas curtas, cada uma com o seu tom e a pausa que vem depois
  function roteiro(paragrafos) {
    const saida = [];
    for (const { tipo, texto } of paragrafos) {
      // separa o que está entre aspas (falas de personagens) do resto
      const blocos = texto.split(/(“[^”]*”|"[^"]*")/).filter((b) => b.trim());
      for (const bloco of blocos) {
        const ehFala = /^[“"]/.test(bloco);
        const frases = bloco.match(/[^.!?…]+[.!?…]+["”»]?|[^.!?…]+$/g) || [bloco];
        for (const f of frases) {
          const s = f.trim().replace(/^[“"]|[”"]$/g, "");
          if (!/[\p{L}\d]/u.test(s)) continue;
          const t = tipo !== "texto" ? tipo : ehFala ? "fala" : /\?$/.test(s) ? "pergunta" : "texto";
          saida.push({ texto: s, tom: TOM[t], extra: /(\.\.\.|…)$/.test(s) ? RETICENCIAS : 0 });
        }
      }
      if (saida.length) saida[saida.length - 1].extra += FIM_PARAGRAFO;
    }
    return saida;
  }

  function aoParar() {
    falando = false;
    atualizarBotoes();
    Musica.garantir(); // em alguns celulares a voz pausa a música: ela volta
  }

  function falar(paragrafos, eixo) {
    if (!fala) return;
    const minha = ++geracao;
    calar();
    if (!paragrafos.length) return aoParar();
    falando = true;
    atualizarBotoes();
    if (preferencias().voz === "neural") falarNeural(paragrafos, eixo, minha);
    else falarAparelho(paragrafos, eixo, minha);
  }

  function calar() {
    clearTimeout(espera);
    fala.cancel();
    if (audio) {
      audio.pause();
      audio.onended = audio.onerror = null;
      audio = null;
    }
  }

  function falarAparelho(paragrafos, eixo, minha) {
    const falas = roteiro(paragrafos);
    if (!falas.length) return aoParar();
    const v = voz();
    const perfil = EIXO[eixo] || EIXO.x;

    const proxima = (i) => {
      if (minha !== geracao) return;
      if (i >= falas.length) return aoParar();
      const { texto, tom, extra } = falas[i];
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = v ? v.lang : "pt-BR";
      if (v) u.voice = v;
      u.rate = perfil.rate * tom.rate;
      u.pitch = Math.min(2, perfil.pitch * tom.pitch);
      u.volume = tom.volume;
      u.onend = () => {
        if (minha !== geracao) return;
        espera = setTimeout(() => proxima(i + 1), tom.pausa + extra);
      };
      u.onerror = () => minha === geracao && aoParar();
      fala.speak(u);
      Musica.garantir();
    };
    proxima(0);
  }

  function parar() {
    if (!fala) return;
    geracao++;
    calar();
    if (estado.startsWith("baixando")) estado = "";
    if (falando) aoParar();
  }

  function chave(paragrafos) {
    return paragrafos.map((p) => p.texto).join("\n");
  }

  // Chamado a cada desenho da cena: só lê quando o texto mudou (abrir o mapa não repete a leitura)
  function cena(paragrafos, eixo) {
    atualizarBotoes();
    const k = chave(paragrafos);
    if (!fala || k === ultimo) return;
    ultimo = k;
    if (ligado()) falar(paragrafos, eixo);
    else parar();
  }

  function atualizarBotoes() {
    const { ligado: sim, voz: tipoVoz } = preferencias();
    document.querySelectorAll("[data-acao='narrador-voz']").forEach((b) => {
      b.hidden = !sim;
      b.textContent = tipoVoz === "neural" ? "Voz: neural" : "Voz: do aparelho";
    });
    document.querySelectorAll(".narrador-estado").forEach((el) => (el.textContent = sim ? estado : ""));
    document.querySelectorAll("[data-acao='narrador']").forEach((b) => {
      b.textContent = sim ? "🔊 Narrador ligado" : "🔇 Narrador desligado";
      b.setAttribute("aria-pressed", String(sim));
    });
    document.querySelectorAll("[data-acao='narrar']").forEach((b) => {
      b.hidden = !sim;
      b.textContent = falando ? "■ Parar" : "↻ Ouvir de novo";
    });
  }

  // as vozes chegam depois do carregamento em alguns navegadores
  if (fala) fala.onvoiceschanged = () => {};

  return {
    disponivel: Boolean(fala),
    cena,
    parar,
    // liga/desliga o narrador (fica guardado no aparelho); ao ligar, já lê a cena
    alternarLigado(paragrafos, eixo) {
      const sim = !ligado();
      guardar({ ligado: sim });
      if (sim) falar(paragrafos, eixo);
      else parar();
      atualizarBotoes();
    },
    // troca entre a voz do aparelho e a neural, e já lê a cena com a nova voz
    alternarVoz(paragrafos, eixo) {
      guardar({ voz: preferencias().voz === "neural" ? "aparelho" : "neural" });
      estado = "";
      falar(paragrafos, eixo);
    },
    // ↻ / ■: lê de novo o que está na tela, ou para
    alternar(paragrafos, eixo) {
      if (falando) parar();
      else falar(paragrafos, eixo);
    },
  };
})();
