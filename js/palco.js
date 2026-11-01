// O palco: a parte de cima da tela da missão, como nas telas de conversa dos Fallout clássicos.
// Mostra o lugar ou a cena atual: um vídeo em loop se existir (imagens/<eixo>/<chave>.mp4),
// senão a imagem (imagens/<eixo>/<chave>.webp), senão um cartão com o ícone e o nome.
// Assim o jogo funciona enquanto as artes vão chegando: é só salvar o arquivo com o nome certo.
//
// Viajar entre lugares toca uma transição: o vídeo de caminho (imagens/<eixo>/caminho-*.mp4)
// ou, sem ele, uma tela de carregamento com a arte do destino.

const Palco = (() => {
  const el = () => document.getElementById("palco");
  let atual = null; // chave do que está no palco agora (não recarrega o vídeo à toa)
  const achados = {}; // "x/lugar-casa" → "video" | "img" | "nada"

  const base = (eixo, chave) => `imagens/${eixo}/${chave}`;

  // Monta a melhor mídia disponível dentro de "alvo": vídeo → imagem → cartão
  function midia(alvo, { eixo, chave, titulo, icone }, { loop = true, aoTerminar } = {}) {
    const id = `${eixo}/${chave}`;
    const cartao = () => {
      achados[id] = achados[id] || "nada";
      alvo.innerHTML = `<div class="palco-cartao"><b>${esc(icone || "◉")}</b><span>${esc(titulo || "")}</span></div>`;
      if (aoTerminar) aoTerminar();
    };
    const imagem = () => {
      if (achados[id] === "nada") return cartao();
      const img = new Image();
      img.alt = "";
      img.className = "palco-midia";
      img.onload = () => {
        achados[id] = "img";
        alvo.replaceChildren(img);
        if (aoTerminar) aoTerminar();
      };
      img.onerror = () => {
        achados[id] = "nada";
        cartao();
      };
      img.src = base(eixo, chave) + ".webp";
    };
    if (achados[id] === "img" || achados[id] === "nada") return imagem();
    const v = document.createElement("video");
    Object.assign(v, { muted: true, loop, playsInline: true, autoplay: true, className: "palco-midia" });
    v.setAttribute("playsinline", "");
    v.onerror = () => {
      achados[id] = achados[id] === "video" ? "video" : "img?";
      imagem();
    };
    v.onloadeddata = () => {
      achados[id] = "video";
      alvo.replaceChildren(v);
      v.play().catch(() => {});
    };
    if (aoTerminar) v.onended = aoTerminar;
    v.src = base(eixo, chave) + ".mp4";
    // rede lenta ou servidor que não responde: não espera o vídeo para sempre
    setTimeout(() => {
      if (!achados[id] || achados[id] === "img?") {
        v.removeAttribute("src");
        imagem();
      }
    }, 3000);
    // enquanto carrega, o cartão segura o lugar
    if (!alvo.firstChild) alvo.innerHTML = `<div class="palco-cartao"><b>${esc(icone || "◉")}</b><span>${esc(titulo || "")}</span></div>`;
  }

  // Mostra um lugar ou cena. Se já é o que está no palco, não faz nada (o vídeo continua rodando).
  function mostrar(o) {
    const p = el();
    if (!p) return;
    const chave = `${o.eixo}/${o.chave}`;
    p.hidden = false;
    if (atual === chave) {
      const v = p.querySelector("video");
      if (v && v.paused) v.play().catch(() => {});
      return;
    }
    atual = chave;
    p.className = `palco palco-${o.eixo}`;
    const caixa = document.createElement("div");
    caixa.className = "palco-caixa";
    p.replaceChildren(caixa);
    midia(caixa, o);
  }

  // Transição de viagem. Devolve uma Promise que resolve quando o jogador "chegou".
  function viajar({ eixo, caminho, destino }) {
    const p = el();
    if (!p) return Promise.resolve();
    atual = null;
    return new Promise((chegou) => {
      p.className = `palco palco-${eixo} viajando`;
      const caixa = document.createElement("div");
      caixa.className = "palco-caixa";
      const rotulo = document.createElement("div");
      rotulo.className = "palco-viagem";
      rotulo.innerHTML = `<span>Indo para</span><strong>${esc(destino.titulo)}</strong><i class="palco-barra"><b></b></i>`;
      p.replaceChildren(caixa, rotulo);
      let pronto = false;
      const fim = () => {
        if (pronto) return;
        pronto = true;
        chegou();
      };
      let carregando = false;
      const caminhoId = `${eixo}/${caminho}`;
      if (caminho && achados[caminhoId] !== "nada" && achados[caminhoId] !== "img") {
        // vídeo de caminho: toca uma vez e chega
        const v = document.createElement("video");
        Object.assign(v, { muted: true, playsInline: true, autoplay: true, className: "palco-midia" });
        v.setAttribute("playsinline", "");
        v.onloadeddata = () => {
          achados[caminhoId] = "video";
          caixa.replaceChildren(v);
          v.play().catch(fim);
          setTimeout(fim, 9000); // nunca prende o jogador
        };
        v.onended = fim;
        v.onerror = () => {
          achados[caminhoId] = "nada";
          carregamento();
        };
        v.src = base(eixo, caminho) + ".mp4";
        setTimeout(() => {
          if (achados[caminhoId] !== "video" && !pronto) {
            achados[caminhoId] = "nada";
            carregamento();
          }
        }, 2500);
      } else carregamento();

      // sem vídeo de caminho: a arte do destino aparece aos poucos, com a barra de carregamento
      function carregamento() {
        if (carregando) return;
        carregando = true;
        midia(caixa, { eixo, ...destino }, { loop: false });
        setTimeout(fim, 1700);
      }
    });
  }

  function pausar() {
    const v = el()?.querySelector("video");
    if (v) v.pause();
  }

  function esconder() {
    const p = el();
    if (p) p.hidden = true;
    atual = null;
  }

  return { mostrar, viajar, pausar, esconder };
})();
