// Trilha própria: os MP3 do autor ficam num repositório PRIVADO do GitHub (pasta musicas/),
// nunca no site público. Cada aparelho se conecta uma vez (o mesmo token da Oficina);
// a primeira vez baixa as músicas e guarda no aparelho, depois tocam na hora, até sem internet.
// musicas/trilha.json diz o que toca onde:
//   { "inicio": [...], "x": [...], "y": [...], "z": [...],
//     "radio": { "arquivo": "...", "inicio": 150, "fim": 180 }, "nomes": { "arquivo.mp3": "Nome" } }
// Sem conexão (ou se der erro), o jogo usa a trilha do YouTube, como antes.

const MusicaPropria = (() => {
  const CONEXAO = "kosmos.oficina.nuvem"; // { repo, token }: a mesma conexão da Oficina
  const CACHE = "kosmos-musicas";
  const PASTA = "musicas";

  let trilha = null;
  let usando = false; // a trilha própria carregou e está no comando
  let falhou = null; // chamado se não der para usar (o jogo volta ao YouTube)
  let ligada = true;
  let querTocar = false;
  let contextoAtual = "inicio";
  let contextoTocando = null;
  let faixa = 0;
  let trecho = null; // { restantes, aoTerminar }
  let carregando = null; // arquivo que está sendo trocado agora
  const urls = new Map(); // arquivo → blob URL
  const baixando = new Map(); // arquivo → Promise<blob URL>

  const audio = new Audio();
  audio.preload = "auto";
  const botao = document.getElementById("btn-musica");
  const titulo = document.getElementById("musica-titulo");

  function conexao() {
    try {
      const c = JSON.parse(localStorage.getItem(CONEXAO));
      return c && c.repo && c.token ? c : null;
    } catch {
      return null;
    }
  }

  function conectar(c) {
    try {
      if (c) localStorage.setItem(CONEXAO, JSON.stringify(c));
      else localStorage.removeItem(CONEXAO);
    } catch {}
  }

  async function baixarDoRepo(c, arquivo) {
    const res = await fetch(`https://api.github.com/repos/${c.repo}/contents/${PASTA}/${arquivo}`, {
      headers: { Authorization: `Bearer ${c.token}`, Accept: "application/vnd.github.raw+json", "X-GitHub-Api-Version": "2022-11-28" },
      cache: "no-store",
    });
    if (!res.ok) {
      const e = new Error({ 401: "o token não é válido (ou expirou)", 404: "não achei a pasta musicas/ (ou o token não tem acesso)" }[res.status] || `erro ${res.status}`);
      e.status = res.status;
      throw e;
    }
    return res;
  }

  // a lista do que toca onde: tenta a versão nova; sem internet, a guardada
  async function lerTrilha(c) {
    const cache = await caches.open(CACHE);
    const chave = `/${PASTA}/trilha.json`;
    try {
      const res = await baixarDoRepo(c, "trilha.json");
      const json = await res.json();
      cache.put(chave, new Response(JSON.stringify(json), { headers: { "Content-Type": "application/json" } }));
      return json;
    } catch (e) {
      const guardado = await cache.match(chave);
      if (guardado && !e.status) return guardado.json();
      throw e;
    }
  }

  // o MP3 como blob URL: do aparelho se já baixou, senão do repositório (e guarda)
  function arquivoUrl(arquivo) {
    if (urls.has(arquivo)) return Promise.resolve(urls.get(arquivo));
    if (baixando.has(arquivo)) return baixando.get(arquivo);
    const p = (async () => {
      const cache = await caches.open(CACHE);
      const chave = `/${PASTA}/${arquivo}`;
      let res = await cache.match(chave);
      if (!res) {
        const blob = await (await baixarDoRepo(conexao(), arquivo)).blob();
        res = new Response(blob, { headers: { "Content-Type": "audio/mpeg" } });
        await cache.put(chave, res.clone());
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(new Blob([blob], { type: "audio/mpeg" }));
      urls.set(arquivo, url);
      return url;
    })();
    baixando.set(arquivo, p);
    p.catch(() => baixando.delete(arquivo));
    return p;
  }

  const nome = (arquivo) => (trilha.nomes && trilha.nomes[arquivo]) || arquivo.replace(/\.mp3$/i, "");
  const lista = (contexto) => {
    const l = trilha[contexto] && trilha[contexto].length ? trilha[contexto] : trilha.inicio;
    return [].concat(l || []);
  };

  async function tocarArquivo(arquivo, inicio = 0) {
    carregando = arquivo;
    if (!urls.has(arquivo)) titulo.textContent = `Baixando ${nome(arquivo)}…`;
    let url;
    try {
      url = await arquivoUrl(arquivo);
    } catch (e) {
      if (carregando === arquivo) titulo.textContent = "";
      return;
    }
    if (carregando !== arquivo) return; // outra troca chegou antes
    carregando = null;
    if (audio.src !== url) audio.src = url;
    audio.currentTime = inicio;
    titulo.textContent = nome(arquivo);
    if (ligada && querTocar) audio.play().catch(() => {});
  }

  function tocarContexto(contexto) {
    if (!usando || !ligada || !querTocar || trecho) return;
    contextoTocando = contexto;
    faixa = 0;
    const l = lista(contexto);
    audio.loop = l.length === 1;
    if (l.length) tocarArquivo(l[0]);
  }

  audio.addEventListener("ended", () => {
    if (trecho) return;
    const l = lista(contextoTocando || contextoAtual);
    faixa = (faixa + 1) % Math.max(1, l.length);
    if (l.length) tocarArquivo(l[faixa]);
  });
  audio.addEventListener("playing", () => botao.classList.add("tocando"));

  // o trecho do rádio: repete de "inicio" a "fim"
  audio.addEventListener("timeupdate", () => {
    if (!trecho || audio.currentTime < trecho.fim) return;
    trecho.restantes--;
    if (trecho.restantes > 0) audio.currentTime = trecho.inicio;
    else encerrarTrecho(true);
  });

  function encerrarTrecho(tocou, retomar = true) {
    const fim = trecho.aoTerminar;
    trecho = null;
    contextoTocando = null;
    if (retomar) tocarContexto(contextoAtual);
    else audio.pause();
    if (fim) fim(tocou);
  }

  // Começa a trilha própria se o aparelho estiver conectado. Devolve false se não estiver.
  function iniciar(aoFalhar) {
    const c = conexao();
    if (!c || typeof caches === "undefined") return false;
    falhou = aoFalhar;
    lerTrilha(c)
      .then((t) => {
        trilha = t;
        usando = true;
        // a música da tela inicial primeiro (para começar na hora), depois o resto em segundo plano
        arquivoUrl(lista("inicio")[0])
          .then(() => {
            if (querTocar && contextoTocando === null) tocarContexto(contextoAtual);
            const todas = new Set([...["inicio", "x", "y", "z"].flatMap(lista), trilha.radio && trilha.radio.arquivo].filter(Boolean));
            return [...todas].reduce((p, a) => p.then(() => arquivoUrl(a).catch(() => {})), Promise.resolve());
          })
          .catch(() => {});
      })
      .catch(() => {
        usando = false;
        if (falhou) falhou();
      });
    return true;
  }

  return {
    iniciar, conexao, conectar,
    usando: () => usando,
    // testa uma conexão nova antes de guardar
    async testar(c) {
      const t = await baixarDoRepo(c, "trilha.json").then((r) => r.json());
      return Object.keys(t.nomes || {}).length || ["inicio", "x", "y", "z"].flatMap((k) => t[k] || []).length;
    },
    contexto(n) {
      contextoAtual = n;
      if (usando && n !== contextoTocando) tocarContexto(n);
    },
    tocar() {
      querTocar = true;
      if (!usando || !ligada) return;
      if (contextoTocando === null) tocarContexto(contextoAtual);
      else audio.play().catch(() => {});
    },
    definirLigada(sim) {
      ligada = sim;
      if (!usando) return;
      if (ligada && querTocar) {
        if (contextoTocando === null && !trecho) tocarContexto(contextoAtual);
        else audio.play().catch(() => {});
      } else if (!ligada) audio.pause();
    },
    volume(v) {
      audio.volume = Math.max(0, Math.min(1, v / 100));
    },
    proxima() {
      if (!usando) return;
      ligada = true;
      if (trecho) return this.pararTrecho();
      if (contextoTocando === null) return tocarContexto(contextoAtual);
      audio.dispatchEvent(new Event("ended"));
    },
    tocarTrecho({ vezes = 1, aoTerminar }) {
      const r = trilha && trilha.radio;
      if (!usando || !r || !ligada || !querTocar) {
        if (aoTerminar) aoTerminar(false);
        return false;
      }
      trecho = { inicio: r.inicio || 0, fim: r.fim || Infinity, restantes: vezes, aoTerminar };
      audio.loop = false;
      tocarArquivo(r.arquivo, trecho.inicio);
      return true;
    },
    pararTrecho(retomar = true) {
      if (trecho) {
        trecho.aoTerminar = null;
        encerrarTrecho(false, retomar);
      }
    },
    retomar() {
      if (!trecho) tocarContexto(contextoAtual);
    },
    garantir() {
      if (usando && ligada && querTocar && audio.paused && audio.src && !carregando) audio.play().catch(() => {});
    },
    ativa: () => usando && ligada && querTocar,
  };
})();
