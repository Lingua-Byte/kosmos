// Trilha sonora via player oficial do YouTube (escondido).
// Toca Solar Wind primeiro e depois segue para a playlist do Kosmos.
// Navegadores só liberam o som depois de um clique, por isso Musica.tocar()
// é chamado pelo botão "Entrar no Kosmos".
// Cenas podem tocar um trecho de uma música em loop (Musica.tocarTrecho) e depois a playlist volta.

const Musica = (() => {
  let player = null;
  let pronto = false;
  let querTocar = false;
  let naPlaylist = false;
  let ligada = true;
  let trecho = null; // { videoId, inicio, fim, restantes, aoTerminar }
  const botao = document.getElementById("btn-musica");
  const titulo = document.getElementById("musica-titulo");

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player("yt-player", {
      width: 200,
      height: 200,
      videoId: MUSICA.principal,
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1 },
      events: {
        onReady: () => {
          pronto = true;
          player.setVolume(60);
          if (querTocar) player.playVideo();
        },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING) {
            const dados = player.getVideoData();
            titulo.textContent = dados && dados.title ? dados.title : "";
            botao.classList.add("tocando");
          }
          if (e.data !== YT.PlayerState.ENDED) return;
          if (trecho) return repetirTrecho();
          if (!naPlaylist) irParaPlaylist();
        },
        onError: () => {
          if (trecho) return encerrarTrecho(false);
          // O dono da faixa pode bloquear a reprodução fora do YouTube: pula para a próxima
          if (!naPlaylist) irParaPlaylist();
          else player.nextVideo();
        },
      },
    });
  };

  function irParaPlaylist() {
    naPlaylist = true;
    player.loadPlaylist({ list: MUSICA.playlist, listType: "playlist" });
  }

  function tocar() {
    querTocar = true;
    botao.hidden = false;
    if (pronto && ligada) player.playVideo();
  }

  // ---------- Trecho em loop (para cenas) ----------

  function carregarTrecho() {
    player.loadVideoById({ videoId: trecho.videoId, startSeconds: trecho.inicio, endSeconds: trecho.fim });
  }

  function repetirTrecho() {
    trecho.restantes--;
    if (trecho.restantes > 0) carregarTrecho();
    else encerrarTrecho(true);
  }

  // retomar = false: a cena quer silêncio depois (a playlist só volta com Musica.retomar())
  function encerrarTrecho(tocou, retomar = true) {
    const fim = trecho.aoTerminar;
    trecho = null;
    if (retomar && pronto && ligada) irParaPlaylist();
    else if (!retomar && player) player.stopVideo();
    if (fim) fim(tocou);
  }

  // Toca de "inicio" a "fim" (segundos), "vezes" seguidas (Infinity = até a cena mandar parar).
  // Se não der para tocar, avisa na hora.
  function tocarTrecho({ videoId, inicio, fim, vezes = 1, aoTerminar }) {
    if (!pronto || !ligada || !querTocar) {
      if (aoTerminar) aoTerminar(false);
      return false;
    }
    trecho = { videoId, inicio, fim, restantes: vezes, aoTerminar };
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

  // Volta a playlist depois de um silêncio pedido por uma cena
  function retomar() {
    if (pronto && ligada && querTocar && !trecho) irParaPlaylist();
  }

  botao.addEventListener("click", () => {
    if (!pronto) return;
    ligada = !ligada;
    if (ligada) player.playVideo();
    else player.pauseVideo();
    botao.classList.toggle("tocando", ligada);
    botao.setAttribute("aria-pressed", String(ligada));
  });

  document.getElementById("btn-proxima").addEventListener("click", () => {
    if (!pronto) return;
    ligada = true;
    if (trecho) return pararTrecho();
    if (naPlaylist) player.nextVideo();
    else irParaPlaylist();
  });

  return {
    tocar, tocarTrecho, pararTrecho, retomar,
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
