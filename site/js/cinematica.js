// Cinemáticas: vídeos curtos em tela cheia, sem som (a trilha continua), que podem ser pulados.
//   · Tela de carregamento: ao entrar numa missão do eixo, uma vez por partida a cada vez que o jogo é aberto
//     (voltar da ficha ou do tradutor não repete).
//   · Revelação: quando um eixo é revelado na ficha, uma vez por personagem.
// Para rever durante o desenvolvimento: ?cinematica=z no endereço.

const CINEMATICAS = {
  y: { video: "imagens/yudur-vila.mp4", titulo: "Yudur", legenda: "Eixo Y · Medieval" },
  z: { video: "imagens/domus-viagem.mp4", titulo: "DOMUS", legenda: "Eixo Z · Espacial" },
};

const Cinematica = (() => {
  const CHAVE = "kosmos.cinematicas-vistas";
  let tocando = false;
  const fila = [];

  function vistas() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE)) || {};
    } catch {
      return {};
    }
  }

  function marcar(pid, eixo) {
    const v = vistas();
    v[pid] = { ...(v[pid] || {}), [eixo]: true };
    try {
      localStorage.setItem(CHAVE, JSON.stringify(v));
    } catch {}
  }

  function tocar(eixo, aoTerminar) {
    const c = CINEMATICAS[eixo];
    if (!c) return aoTerminar && aoTerminar();
    if (tocando) return fila.push([eixo, aoTerminar]);
    tocando = true;
    const el = document.createElement("div");
    el.className = `cinematica cinematica-${eixo}`;
    el.innerHTML = `
      <video class="cinematica-fundo" src="${c.video}" muted playsinline preload="auto" aria-hidden="true"></video>
      <video class="cinematica-video" src="${c.video}" muted playsinline preload="auto"></video>
      <div class="cinematica-texto"><p>${c.legenda}</p><h2>${c.titulo}</h2></div>
      <button class="btn-texto cinematica-pular">Pular ›</button>`;
    document.body.appendChild(el);
    const video = el.querySelector(".cinematica-video");
    const fundo = el.querySelector(".cinematica-fundo");
    let fim = false;
    const terminar = () => {
      if (fim) return;
      fim = true;
      el.classList.add("saindo");
      setTimeout(() => {
        el.remove();
        tocando = false;
        if (aoTerminar) aoTerminar();
        const prox = fila.shift();
        if (prox) tocar(...prox);
      }, 900);
    };
    video.addEventListener("ended", terminar);
    video.addEventListener("error", terminar); // sem o vídeo (offline): segue o jogo
    el.querySelector(".cinematica-pular").addEventListener("click", terminar);
    requestAnimationFrame(() => el.classList.add("visivel"));
    video.play().catch(terminar);
    fundo.play().catch(() => {});
  }

  // Toca se algum desses personagens ainda não viu a cinemática do eixo; senão, segue direto
  function primeiraVez(personagens, eixo, aoTerminar) {
    const lista = [].concat(personagens).filter(Boolean);
    const v = vistas();
    const falta = CINEMATICAS[eixo] && lista.some((p) => !(v[p.id] && v[p.id][eixo]));
    if (!falta) return aoTerminar && aoTerminar();
    lista.forEach((p) => marcar(p.id, eixo));
    tocar(eixo, aoTerminar);
  }

  // Tela de carregamento da missão: uma vez por partida nesta sessão do jogo
  function carregamento(eixo, partidaId, aoTerminar) {
    const chave = `kosmos.carregou.${partidaId}`;
    let ja = false;
    try {
      ja = sessionStorage.getItem(chave) === "1";
      sessionStorage.setItem(chave, "1");
    } catch {}
    if (ja || !CINEMATICAS[eixo]) return aoTerminar && aoTerminar();
    tocar(eixo, aoTerminar);
  }

  // revisão durante o desenvolvimento
  const pedida = new URLSearchParams(location.search).get("cinematica");
  if (pedida) addEventListener("load", () => tocar(pedida));

  return { tocar, primeiraVez, carregamento };
})();
