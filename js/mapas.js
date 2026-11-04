// Mapas ilustrados das missões, desenhados pelo próprio jogo (SVG, sem imagens).
// Cada eixo tem o seu estilo. Por enquanto: Urbano (radar verde da cidade).
// Os lugares são botões HTML posicionados por cima do desenho (data-ir), então o clique e a
// acessibilidade continuam iguais aos da lista antiga.
//
// Mapas.html({ eixo, lugares: [{ id, nome, icone, x, y, atual, pendentes, trancado, dica }],
//              centro: { x, y, nome }, tensao: 0..1 })
// x e y vão de 0 a 100 (porcentagem da largura e da altura).

const Mapas = (() => {
  // números "aleatórios" fixos: o mapa não muda a cada vez que a tela redesenha
  function sorte(semente) {
    let a = semente;
    return () => {
      a = (a * 1664525 + 1013904223) % 4294967296;
      return a / 4294967296;
    };
  }

  // ---------- Eixo X: a cidade num radar verde ----------
  function cidade({ centro, tensao }) {
    const W = 400, H = 300;
    const cx = (centro.x / 100) * W, cy = (centro.y / 100) * H;
    const r = sorte(2147);
    let s = "";

    // quarteirões: uma grade torta de ruas
    const ruasV = [30, 85, 150, 205, 262, 330, 372];
    const ruasH = [28, 80, 128, 176, 228, 270];
    for (let i = 0; i < ruasV.length - 1; i++) {
      for (let j = 0; j < ruasH.length - 1; j++) {
        const x = ruasV[i] + 6, y = ruasH[j] + 6;
        const w = ruasV[i + 1] - ruasV[i] - 12, h = ruasH[j + 1] - ruasH[j] - 12;
        if (Math.hypot(x + w / 2 - cx, y + h / 2 - cy) < 34) continue; // a praça fica livre
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" class="quarteirao" style="opacity:${0.35 + r() * 0.4}"/>`;
      }
    }
    // avenidas diagonais até a praça
    for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H], [W / 2, 0]]) s += `<line x1="${x}" y1="${y}" x2="${cx}" y2="${cy}" class="avenida"/>`;

    // a praça e os anéis do pulso: três rápidos, um longo
    s += `<circle cx="${cx}" cy="${cy}" r="26" class="praca"/>`;
    for (let i = 0; i < 4; i++) s += `<circle cx="${cx}" cy="${cy}" r="26" class="pulso pulso-${i}"/>`;

    // varredura do radar
    s += `<g class="varredura" style="transform-origin:${cx}px ${cy}px"><path d="M${cx},${cy} L${cx + 260},${cy - 40} A260,260 0 0,1 ${cx + 260},${cy + 40} Z" class="feixe"/></g>`;

    // a multidão: pontos que andam para a praça; mais gente quanto mais cheio o relógio
    const pessoas = Math.round(8 + tensao * 46);
    for (let i = 0; i < pessoas; i++) {
      const ang = r() * Math.PI * 2;
      const dist = 150 + r() * 120;
      const x0 = cx + Math.cos(ang) * dist, y0 = cy + Math.sin(ang) * dist * 0.75;
      const dur = (14 - tensao * 7 + r() * 6).toFixed(1);
      s += `<circle r="1.6" class="pessoa"><animateMotion dur="${dur}s" begin="-${(r() * dur).toFixed(1)}s" repeatCount="indefinite" path="M${x0.toFixed(0)},${y0.toFixed(0)} L${cx.toFixed(0)},${cy.toFixed(0)}"/></circle>`;
    }

    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="distorcao"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="${(tensao * 14).toFixed(1)}"/></filter>
      </defs>
      <rect width="${W}" height="${H}" class="fundo-mapa"/>
      <g filter="url(#distorcao)">${s}</g>
    </svg>`;
  }

  const ESTILOS = { x: cidade };

  // A geografia por cima do radar, esticada para o tamanho do mapa (0–100 nos dois eixos):
  // o mar e o porto ao sul, e a região de cada bairro (os desconhecidos ficam na névoa).
  function geografia(eixo, bairros) {
    if (eixo !== "x" || !bairros.some((b) => b.regiao)) return "";
    const regioes = bairros.filter((b) => b.regiao).map((b) => {
      const [cx, cy, rx, ry] = b.regiao;
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="regiao ${b.conhecido ? "conhecida" : "nevoa"}"/>`;
    }).join("");
    // a costa: o porto no meio, o mar entrando pelos cantos de baixo
    const mar = `<path class="mar" d="M0,84 C8,86 12,95 22,96 C30,97 34,93 40,96 L40,100 L0,100 Z"/>
      <path class="mar" d="M38,97 C48,95 58,96 66,95 C74,94 80,97 88,95 C94,93 97,88 100,86 L100,100 L38,100 Z"/>
      ${[42, 48, 54, 60, 66, 72].map((x) => `<line class="cais" x1="${x}" y1="95.5" x2="${x}" y2="99.5"/>`).join("")}`;
    return `<svg class="mapa-geografia" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${mar}${regioes}</svg>`;
  }

  // lugares: nós do mapa. Além dos da missão:
  //   fora: true → lugar que o personagem conhece, mas que não está nesta missão (ponto apagado, sem clique)
  //   desconhecido: true → lugar da missão que ele ainda não conhece ("?", dá para ir, procurando)
  // bairros: [{ nome, x, y, conhecido }] → nomes dos bairros; os desconhecidos aparecem como "???"
  // Cada lugar é um alfinete no ponto exato do mapa (só o ícone, para não encostar nos vizinhos);
  // os nomes ficam numa legenda numerada embaixo, como num mapa de verdade. O alfinete e a
  // linha da legenda levam ao lugar (data-ir). Lugares "fora" (conhecidos, mas não desta missão)
  // são pontinhos apagados, só com o nome na legenda.
  // compacta: true → versão de consulta (ficha): alfinete só com o número e a legenda corrida por bairro
  function html({ eixo, lugares, centro, tensao = 0, bairros = [], compacta = false }) {
    const desenho = ESTILOS[eixo];
    if (!desenho) return null; // eixo sem mapa ilustrado ainda: a missão usa a lista
    const t = Math.max(0, Math.min(1, tensao));
    // numeração de cima para baixo, da esquerda para a direita (como se lê o mapa)
    // só os lugares desta missão ganham número e linha na legenda; os de fora são pontinhos
    const ordem = lugares.filter((l) => !l.fora).sort((a, b) => (a.y - b.y) || (a.x - b.x));
    const fora = lugares.filter((l) => l.fora);
    ordem.forEach((l, i) => (l.n = i + 1));
    const ir = (l) => (l.trancado || l.atual || l.fora ? "disabled" : `data-ir="${l.id}"`);
    const nome = (l) => (l.desconhecido ? `${l.bairro || "Lugar"} · ?` : l.nome);
    const pino = (l) => l.fora
      ? `<span class="mapa-ponto" style="left:${l.x}%;top:${l.y}%" title="${l.nome}"><i></i></span>`
      : compacta
        ? `<span class="mapa-pino mini" style="left:${l.x}%;top:${l.y}%" title="${nome(l)}">${l.n}</span>`
        : `<button class="mapa-pino ${l.atual ? "atual" : ""} ${l.desconhecido ? "desconhecido" : ""}" style="left:${l.x}%;top:${l.y}%" ${ir(l)} title="${nome(l)}" aria-label="${l.n}. ${nome(l)}">
          <b>${l.desconhecido ? "?" : l.icone}</b><small>${l.n}</small></button>`;
    const linha = (l) => `
        <button class="mapa-legenda-item ${l.atual ? "atual" : ""} ${l.desconhecido ? "desconhecido" : ""} ${l.fora ? "fora" : ""}" ${ir(l)}>
          <i>${l.n}</i><b>${l.desconhecido ? "?" : l.icone}</b>
          <span>${nome(l)}</span>
          <small>${l.desconhecido ? "não conhece · +1" : l.atual ? "você está aqui" : l.fora ? "fora desta missão" : l.pendentes != null ? (l.pendentes ? l.pendentes + " a fazer" : "nada novo") : ""}</small>
        </button>`;
    return `
      <div class="mapa-ilustrado mapa-${eixo}" style="--tensao:${t.toFixed(2)}">
        ${desenho({ centro, tensao: t })}
        ${geografia(eixo, bairros)}
        ${bairros.map((b) => `<span class="mapa-bairro ${b.conhecido ? "" : "nevoa"}" style="left:${b.x}%;top:${b.y}%">${b.conhecido ? b.nome : "???"}</span>`).join("")}
        <span class="mapa-centro" style="left:${centro.x}%;top:${centro.y}%">${centro.nome}</span>
        ${fora.map(pino).join("")}
        ${ordem.map(pino).join("")}
      </div>
      ${!ordem.length ? "" : compacta
        ? `<p class="mapa-legenda-corrida">${[...new Set(ordem.map((l) => l.bairro || ""))].map((b) => `${b ? `<b>${b}:</b> ` : ""}${ordem.filter((l) => (l.bairro || "") === b).map((l) => `<i>${l.n}</i> ${l.nome}`).join(" · ")}`).join("<br>")}</p>`
        : `<div class="mapa-legenda">${ordem.map(linha).join("")}</div>`}`;
  }

  return { html };
})();
