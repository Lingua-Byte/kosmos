// Trilha sonora via player oficial do YouTube (escondido).
// Cada contexto (tela inicial, prólogo, Eixo X/Y/Z) tem a sua lista em MUSICA.contextos;
// quando o jogador muda de tela ou de eixo, a trilha troca junto.
// As listas são carregadas inteiras no player (loadPlaylist com ids), então a passagem de uma
// faixa para a outra é feita pelo próprio YouTube — funciona também no celular.
// Navegadores só liberam o som depois de um clique, por isso Musica.tocar()
// é chamado pelo botão "Entrar no Kosmos".
// Cenas podem tocar um trecho de uma música em loop (Musica.tocarTrecho) e depois a trilha volta.

const Musica = (() => {
  const DESBLOQUEADAS = "kosmos.musicas-desbloqueadas";
  let player = null;
  let pronto = false;
  let querTocar = false;
  let ligada = true;
  let contextoAtual = "inicio";
  let contextoTocando = null; // qual lista está carregada no player
  let trecho = null; // { videoIds, indice, inicio, fim, restantes, aoTerminar }
  let trocaAgendada = null;
  const botao = document.getElementById("btn-musica");
  const titulo = document.getElementById("musica-titulo");

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  function desbloqueadas() {
    try {
      return JSON.parse(localStorage.getItem(DESBLOQUEADAS)) || [];
    } catch {
      return [];
    }
  }

  // Faixas que a gravadora não deixa tocar fora do YouTube (erro do player): ficam de fora nesta visita
  const bloqueadas = new Set();

  function lista(contexto) {
    let base = MUSICA.contextos[contexto] || MUSICA.contextos.inicio;
    if (contexto === "inicio") {
      // faixas que já tocaram numa missão entram na tela inicial, depois da primeira
      const extras = desbloqueadas().filter((id) => !base.includes(id));
      base = [base[0], ...extras, ...base.slice(1)];
    }
    const livres = base.filter((id) => !bloqueadas.has(id));
    return livres.length ? livres : MUSICA.contextos.inicio.slice(0, 1);
  }

  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player("yt-player", {
      width: 200,
      height: 200,
      videoId: lista("inicio")[0],
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1 },
      events: {
        onReady: () => {
          pronto = true;
          player.setVolume(volumeAtual());
          if (!Opcoes.get("musica").ligada) definirLigada(false);
          if (querTocar) tocarContexto(contextoAtual);
        },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING) {
            const dados = player.getVideoData();
            titulo.textContent = dados && dados.title ? dados.title : "";
            botao.classList.add("tocando");
            registrarDesbloqueio(dados && dados.video_id);
          }
          if (e.data === YT.PlayerState.ENDED && trecho) repetirTrecho();
        },
        onError: () => {
          if (trecho) return tentarOutraVersao();
          // faixa bloqueada fora do YouTube: tira da lista e recomeça o contexto sem ela
          const indice = Math.max(0, player.getPlaylistIndex ? player.getPlaylistIndex() : 0);
          const id = listaCarregada[indice] || listaCarregada[0];
          if (id) bloqueadas.add(id);
          contextoTocando = null;
          tocarContexto(contextoAtual);
        },
      },
    });
  };

  // Uma faixa que desbloqueia a tela inicial só conta se tocou durante uma missão
  function registrarDesbloqueio(id) {
    if (!id || !MUSICA.desbloqueiaInicio.includes(id)) return;
    if (!document.getElementById("tela-cena")?.classList.contains("ativa")) return;
    const ja = desbloqueadas();
    if (ja.includes(id)) return;
    try {
      localStorage.setItem(DESBLOQUEADAS, JSON.stringify([...ja, id]));
    } catch {}
  }

  let listaCarregada = [];

  function tocarContexto(contexto) {
    if (!pronto || !ligada || !querTocar || trecho) return;
    contextoTocando = contexto;
    listaCarregada = lista(contexto);
    player.loadPlaylist(listaCarregada, 0);
    player.setLoop(true);
  }

  // Chamado pelo jogo a cada troca de tela/eixo. Espera um instante para não trocar duas vezes seguidas.
  function contexto(nome) {
    contextoAtual = nome;
    clearTimeout(trocaAgendada);
    trocaAgendada = setTimeout(() => {
      if (contextoAtual !== contextoTocando) tocarContexto(contextoAtual);
    }, 350);
  }

  function tocar() {
    querTocar = true;
    botao.hidden = false;
    if (!pronto || !ligada) return;
    if (contextoTocando === null) tocarContexto(contextoAtual);
    else player.playVideo();
  }

  // ---------- Trecho em loop (para cenas) ----------

  function carregarTrecho() {
    player.loadVideoById({ videoId: trecho.videoIds[trecho.indice], startSeconds: trecho.inicio, endSeconds: trecho.fim });
  }

  function repetirTrecho() {
    trecho.restantes--;
    if (trecho.restantes > 0) carregarTrecho();
    else encerrarTrecho(true);
  }

  // A versão da música não toca aqui (bloqueio da gravadora): tenta a próxima versão da lista
  function tentarOutraVersao() {
    trecho.indice++;
    if (trecho.indice < trecho.videoIds.length) carregarTrecho();
    else encerrarTrecho(false);
  }

  // retomar = false: a cena quer silêncio depois (a trilha só volta com Musica.retomar())
  function encerrarTrecho(tocou, retomar = true) {
    const fim = trecho.aoTerminar;
    trecho = null;
    contextoTocando = null;
    if (retomar) tocarContexto(contextoAtual);
    else if (player) player.stopVideo();
    if (fim) fim(tocou);
  }

  // Toca de "inicio" a "fim" (segundos), "vezes" seguidas (Infinity = até a cena mandar parar).
  // videoId pode ser uma lista de versões da mesma música: se uma estiver bloqueada, tenta a próxima.
  function tocarTrecho({ videoId, inicio, fim, vezes = 1, aoTerminar }) {
    if (!pronto || !ligada || !querTocar) {
      if (aoTerminar) aoTerminar(false);
      return false;
    }
    trecho = { videoIds: [].concat(videoId), indice: 0, inicio, fim, restantes: vezes, aoTerminar };
    carregarTrecho();
    return true;
  }

  // Para o trecho antes da hora (o jogador avançou a cena)
  function pararTrecho(retomar = true) {
    if (trecho) {
      trecho.aoTerminar = null;
      encerrarTrecho(false, retomar);
    }
  }

  // Volta a trilha depois de um silêncio pedido por uma cena
  function retomar() {
    if (!trecho) tocarContexto(contextoAtual);
  }

  const volumeAtual = () => (typeof Opcoes !== "undefined" ? Opcoes.get("musica").volume : 60);

  // liga ou desliga a trilha (o botão do canto e o menu de opções usam isto)
  function definirLigada(sim) {
    ligada = sim;
    if (pronto) {
      if (ligada && querTocar) {
        if (contextoTocando === null && !trecho) tocarContexto(contextoAtual);
        else player.playVideo();
      } else if (!ligada) player.pauseVideo();
    }
    botao.classList.toggle("tocando", ligada);
    botao.setAttribute("aria-pressed", String(ligada));
  }

  botao.addEventListener("click", () => {
    if (!pronto) return;
    if (typeof Opcoes !== "undefined") Opcoes.mudar("musica", { ligada: !ligada });
    else definirLigada(!ligada);
  });

  document.getElementById("btn-proxima").addEventListener("click", () => {
    if (!pronto) return;
    ligada = true;
    if (trecho) return pararTrecho();
    if (contextoTocando === null) tocarContexto(contextoAtual);
    else player.nextVideo();
  });

  return {
    tocar, tocarTrecho, pararTrecho, retomar, contexto, definirLigada,
    volume(v) {
      if (pronto) player.setVolume(v);
    },
    // a música devia estar tocando mas algo (a voz do narrador, no celular) pausou: volta a tocar
    garantir() {
      if (!pronto || !ligada || !querTocar) return;
      if (player.getPlayerState() === YT.PlayerState.PAUSED) player.playVideo();
    },
    // o som está realmente tocando? (cenas que dependem de música pedem para ligar)
    ativa: () => pronto && ligada && querTocar,
    ligar: () => {
      ligada = true;
      tocar();
      botao.classList.add("tocando");
      botao.setAttribute("aria-pressed", "true");
    },
  };
})();
