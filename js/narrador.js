// Narrador (opcional, desligado por padrão): lê em voz alta o texto das cenas com a voz
// que o próprio aparelho já tem (Web Speech API — gratuita, sem conta).
// Para soar menos "robô", a leitura é feita frase a frase com pausas de respiração,
// e muda de tom conforme o que está sendo lido: título, narração, falas entre aspas, perguntas
// e o ambiente (as frases em itálico, lidas mais baixo e devagar).
// Cada eixo tem o seu jeito de falar. A música não é tocada aqui: ela segue no volume dela.

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

  function ligado() {
    try {
      return Boolean(JSON.parse(localStorage.getItem(CHAVE))?.ligado);
    } catch {
      return false;
    }
  }

  function guardar(sim) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ ligado: sim }));
    } catch {}
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
    clearTimeout(espera);
    fala.cancel();
    const falas = roteiro(paragrafos);
    if (!falas.length) return aoParar();
    const v = voz();
    const perfil = EIXO[eixo] || EIXO.x;
    falando = true;
    atualizarBotoes();

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
    clearTimeout(espera);
    fala.cancel();
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
    const sim = ligado();
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
      guardar(sim);
      if (sim) falar(paragrafos, eixo);
      else parar();
      atualizarBotoes();
    },
    // ↻ / ■: lê de novo o que está na tela, ou para
    alternar(paragrafos, eixo) {
      if (falando) parar();
      else falar(paragrafos, eixo);
    },
  };
})();
