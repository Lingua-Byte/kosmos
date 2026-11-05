// =====================================================================
// CONVERSA LIVRE COM NPC (teste): o jogador escreve, o NPC responde com falas ESCRITAS PELO AUTOR.
// ---------------------------------------------------------------------
// A IA não inventa nada: ela só ENTENDE a pergunta e escolhe o assunto certo da ficha do NPC
// (dados/npcs/<id>.json). Cada assunto tem respostas por fase da noite (cedo / meio / tarde),
// para respeitar o slow burn.
//
// Dois jeitos de entender, do mais simples ao mais esperto:
//   1. palavras-chave (funciona na hora, em qualquer aparelho, sem internet);
//   2. "entendedor" (Transformers.js, modelo multilíngue de ~120 MB, roda no próprio aparelho,
//      grátis, sem conta; baixa uma vez e fica guardado no navegador). Entende pelo SENTIDO:
//      "cadê a água?" e "ainda tem água pra vender?" caem no mesmo assunto.
// Se o entendedor não carregar, o jogo segue com as palavras-chave.
// =====================================================================

const ConversaNPC = (() => {
  const BIBLIOTECA = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1";
  const MODELO = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
  const LIMIAR = 0.68; // abaixo disso, o entendedor "não tem certeza" (no teste: certas ≥ 78%, erradas ≤ 59%)

  let extrator = null;
  let estado = "palavras"; // palavras | carregando | pronto | falhou

  const norm = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const PARADAS = new Set("voce voces esta estao para pelo pela como qual quem onde quando porque isso essa esse aqui tudo muito mais aquele aquela sobre seus suas meus minhas".split(" "));
  const radicais = (t) => norm(t).split(/[^a-z]+/).filter((w) => w.length > 3 && !PARADAS.has(w)).map((w) => w.slice(0, 5));

  async function carregarEntendedor(aoProgredir) {
    if (estado === "pronto" || estado === "carregando") return;
    estado = "carregando";
    try {
      const { pipeline } = await import(BIBLIOTECA);
      const visto = {};
      extrator = await pipeline("feature-extraction", MODELO, {
        dtype: "q8",
        progress_callback: (p) => {
          if (p.status !== "progress" || !p.total) return;
          visto[p.file] = [p.loaded, p.total];
          const [l, t] = Object.values(visto).reduce((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0]);
          aoProgredir && aoProgredir(Math.round((100 * l) / t));
        },
      });
      estado = "pronto";
    } catch (e) {
      console.warn("Entendedor não carregou; seguindo com palavras-chave.", e);
      estado = "falhou";
    }
  }

  async function vetor(texto) {
    const s = await extrator(texto, { pooling: "mean", normalize: true });
    return Array.from(s.data);
  }
  const cosseno = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);

  // prepara a ficha: radicais de cada assunto e, se o entendedor estiver pronto, os vetores dos exemplos
  async function preparar(ficha) {
    for (const t of ficha.topicos) {
      t._radicais = new Set(t.exemplos.flatMap(radicais).concat((t.palavras || []).map((w) => norm(w).slice(0, 5))));
      if (estado === "pronto" && !t._vetores) t._vetores = await Promise.all(t.exemplos.map(vetor));
    }
  }

  function porPalavras(ficha, pergunta) {
    const r = radicais(pergunta);
    if (!r.length) {
      // "oi", "tchau": palavras curtas comparadas inteiras
      const p = norm(pergunta).replace(/[^a-z ]/g, "").trim();
      const t = ficha.topicos.find((t) => t.exemplos.some((e) => norm(e).replace(/[^a-z ]/g, "").trim() === p));
      return t ? { topico: t, confianca: 1 } : null;
    }
    let melhor = null;
    for (const t of ficha.topicos) {
      const n = r.filter((w) => t._radicais.has(w)).length;
      if (n && (!melhor || n > melhor.n)) melhor = { topico: t, n };
    }
    return melhor ? { topico: melhor.topico, confianca: Math.min(1, melhor.n / r.length) } : null;
  }

  // → { topico, confianca, como: "entendedor" | "palavras" | "nada" }
  async function entender(ficha, pergunta) {
    if (estado === "pronto") {
      await preparar(ficha);
      const v = await vetor(pergunta);
      let melhor = { topico: null, confianca: 0 };
      for (const t of ficha.topicos) for (const e of t._vetores) {
        const c = cosseno(v, e);
        if (c > melhor.confianca) melhor = { topico: t, confianca: c };
      }
      if (melhor.confianca >= LIMIAR) return { ...melhor, como: "entendedor" };
    }
    const p = porPalavras(ficha, pergunta);
    if (p) return { ...p, como: "palavras" };
    return { topico: null, confianca: 0, como: "nada" };
  }

  // fase da noite pelo relógio (0..16 no Prólogo X)
  function fase(ficha, relogio) {
    let f = "cedo";
    for (const [nome, desde] of Object.entries(ficha.fases || { cedo: 0 })) if (relogio >= desde) f = nome;
    return f;
  }

  // a resposta do assunto na fase atual (ou na fase anterior mais próxima que tiver texto)
  function responder(ficha, topico, relogio, memoria) {
    const sorteia = (l) => l[Math.floor(Math.random() * l.length)];
    if (!topico) return sorteia(ficha.naoSei);
    const ordem = Object.keys(ficha.fases || { cedo: 0 });
    const ate = ordem.indexOf(fase(ficha, relogio));
    let lista = null;
    for (let i = ate; i >= 0 && !lista; i--) lista = topico.respostas[ordem[i]];
    const chave = `${topico.id}:${ordem[ate]}`;
    if (memoria[chave] && topico.id !== "saudacao" && topico.id !== "tchau") return sorteia(ficha.repetido);
    memoria[chave] = true;
    return sorteia(lista);
  }

  return { carregarEntendedor, preparar, entender, responder, fase, estado: () => estado };
})();
