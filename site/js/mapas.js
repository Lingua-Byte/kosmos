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

  function html({ eixo, lugares, centro, tensao = 0 }) {
    const desenho = ESTILOS[eixo];
    if (!desenho) return null; // eixo sem mapa ilustrado ainda: a missão usa a lista
    const t = Math.max(0, Math.min(1, tensao));
    return `
      <div class="mapa-ilustrado mapa-${eixo}" style="--tensao:${t.toFixed(2)}">
        ${desenho({ centro, tensao: t })}
        <span class="mapa-centro" style="left:${centro.x}%;top:${centro.y}%">${centro.nome}</span>
        ${lugares.map((l) => `
          <button class="mapa-no ${l.atual ? "atual" : ""} ${l.trancado ? "trancado" : ""}" style="left:${l.x}%;top:${l.y}%"
            ${l.trancado || l.atual ? "disabled" : `data-ir="${l.id}"`} title="${l.dica || ""}">
            <b>${l.icone}</b>
            <span>${l.nome}${l.atual ? " · você está aqui" : ""}</span>
            ${l.pendentes != null && !l.atual ? `<small>${l.pendentes ? l.pendentes + " a fazer" : "nada novo"}</small>` : ""}
          </button>`).join("")}
      </div>`;
  }

  return { html };
})();
