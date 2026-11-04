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

  // ---------- Eixo X: Port Halden num radar verde ----------
  // Tudo desenhado em 0–100 (a mesma escala dos alfinetes), esticado para o tamanho do mapa:
  // a costa e o porto ao sul, os bairros com contorno curvo (os desconhecidos na névoa),
  // um anel de avenidas em volta da Praça Central e avenidas curvas saindo dele.
  // A varredura e o pulso ficam por cima, em HTML, para continuarem redondos em qualquer tela.

  // contorno fechado e suave passando pelos pontos (Catmull-Rom → curvas de Bézier)
  function curvaFechada(pts) {
    const n = pts.length;
    const p = (i) => pts[(i + n) % n];
    let d = `M${p(0)[0]},${p(0)[1]}`;
    for (let i = 0; i < n; i++) {
      const [a, b, c, e] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
      const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
      const c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${c[0]},${c[1]}`;
    }
    return d + " Z";
  }

  function cidade({ centro, tensao, bairros = [] }) {
    const cx = centro.x, cy = centro.y;
    const regioes = bairros.filter((b) => b.forma).map((b) =>
      `<path d="${curvaFechada(b.forma)}" class="bairro ${b.conhecido ? "conhecido" : "nevoa"}"/>`).join("");
    // avenidas: saem do anel da praça e curvam até os bairros
    const avenidas = [
      `M${cx},${cy - 11} C${cx - 1},${cy - 25} ${cx + 3},${cy - 38} ${cx + 1},2`,          // norte: Universidade
      `M${cx + 12},${cy - 5} C${cx + 22},${cy - 14} ${cx + 32},${cy - 22} 98,${cy - 30}`,  // nordeste: Maple Heights
      `M${cx + 13},${cy + 1} C${cx + 24},${cy + 1} ${cx + 34},${cy - 4} 99,${cy - 6}`,     // leste: Midtown
      `M${cx + 9},${cy + 9} C${cx + 18},${cy + 18} ${cx + 30},${cy + 26} 98,${cy + 30}`,   // sudeste: Eastside
      `M${cx},${cy + 11} C${cx - 2},${cy + 22} ${cx + 3},${cy + 32} ${cx + 1},96`,         // sul: o porto
      `M${cx - 10},${cy + 8} C${cx - 20},${cy + 16} ${cx - 32},${cy + 20} 2,${cy + 26}`,   // sudoeste: 9º Distrito
      `M${cx - 13},${cy} C${cx - 24},${cy - 4} ${cx - 36},${cy - 14} 2,${cy - 20}`,        // oeste: Westside
      `M${cx - 9},${cy - 8} C${cx - 16},${cy - 18} ${cx - 22},${cy - 30} ${cx - 30},4`,    // noroeste
    ].map((d) => `<path d="${d}" class="avenida"/>`).join("");
    // ruas menores: arcos curtos dentro dos bairros, só para dar textura
    const ruas = [
      "M8,30 C14,26 22,27 28,33", "M6,44 C14,40 22,42 30,46", "M66,14 C74,10 84,11 94,16", "M68,26 C78,22 88,24 96,29",
      "M74,44 C80,41 88,42 94,46", "M6,66 C14,63 24,64 34,70", "M8,76 C16,74 26,76 34,80", "M66,70 C74,67 84,68 96,72",
      "M70,82 C78,80 86,82 94,88", "M36,10 C42,6 52,6 62,10", "M38,20 C46,17 56,17 64,21",
    ].map((d) => `<path d="${d}" class="rua"/>`).join("");
    // a via expressa do Viaduto Leste, cortando o Eastside até a borda
    const viaduto = `<path d="M${cx + 24},100 C${cx + 28},88 ${cx + 38},78 100,${cy + 16}" class="expressa"/>`;
    // o mar: entra pelo sudoeste e passa embaixo das Docas; os cais saem da costa
    const mar = `<path class="mar" d="M0,78 C6,82 10,90 18,94 C28,99 40,97 52,97 C62,97 70,99 78,100 L0,100 Z"/>
      ${[30, 37, 44, 51, 58, 65].map((x) => `<path class="cais" d="M${x},96.3 L${x},100"/>`).join("")}`;
    return `<svg class="mapa-geografia" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <rect width="100" height="100" class="fundo-mapa"/>
        ${mar}${regioes}${ruas}${viaduto}${avenidas}
        <ellipse cx="${cx}" cy="${cy}" rx="12.5" ry="11" class="anel"/>
        <ellipse cx="${cx}" cy="${cy}" rx="5.5" ry="5" class="praca"/>
      </svg>
      <div class="radar" style="left:${cx}%;top:${cy}%;--tensao:${tensao.toFixed(2)}">
        <i class="radar-varredura"></i>
        ${[0, 1, 2, 3].map((k) => `<i class="radar-pulso radar-pulso-${k}"></i>`).join("")}
      </div>`;
  }

  const ESTILOS = { x: cidade };

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
    const vid = compacta ? "ficha" : "missao";
    const v = vistaDe(vid);
    return `
      <div class="mapa-ilustrado mapa-${eixo}" style="--tensao:${t.toFixed(2)}" data-vista="${vid}">
        <div class="mapa-mundo" style="${estiloVista(v)}">
        ${desenho({ centro, tensao: t, bairros })}
        ${bairros.map((b) => `<span class="mapa-bairro ${b.conhecido ? "" : "nevoa"}" style="left:${b.x}%;top:${b.y}%">${b.conhecido ? b.nome : "???"}</span>`).join("")}
        <span class="mapa-centro" style="left:${centro.x}%;top:${centro.y}%">${centro.nome}</span>
        ${fora.map(pino).join("")}
        ${ordem.map(pino).join("")}
        </div>
        <div class="mapa-zoom" aria-label="Zoom do mapa">
          <button data-zoom-mapa="1" aria-label="Aproximar">+</button><button data-zoom-mapa="-1" aria-label="Afastar">−</button><button data-zoom-mapa="0" aria-label="Ver o mapa inteiro">⟲</button>
        </div>
      </div>
      ${!ordem.length ? "" : compacta
        ? `<p class="mapa-legenda-corrida">${[...new Set(ordem.map((l) => l.bairro || ""))].map((b) => `${b ? `<b>${b}:</b> ` : ""}${ordem.filter((l) => (l.bairro || "") === b).map((l) => `<i>${l.n}</i> ${l.nome}`).join(" · ")}`).join("<br>")}</p>`
        : `<div class="mapa-legenda">${ordem.map(linha).join("")}</div>`}`;
  }

  // ---------- Zoom e arrasto (roda do mouse, pinça, botões, arrastar) ----------
  // A vista de cada mapa (o da missão e o da ficha) fica guardada enquanto o jogo está aberto:
  // redesenhar a tela não perde o zoom. x e y em % do próprio mapa; z de 1 (inteiro) a 4.
  const vistas = {};
  const vistaDe = (id) => (vistas[id] = vistas[id] || { z: 1, x: 0, y: 0 });
  const estiloVista = (v) => `transform:translate(${v.x}%,${v.y}%) scale(${v.z});--z:${v.z}`;
  const prender = (v) => {
    v.z = Math.min(4, Math.max(1, v.z));
    v.x = Math.min(0, Math.max(100 * (1 - v.z), v.x));
    v.y = Math.min(0, Math.max(100 * (1 - v.z), v.y));
    return v;
  };
  function aplicar(caixa) {
    const mundo = caixa.querySelector(".mapa-mundo");
    if (mundo) mundo.setAttribute("style", estiloVista(vistaDe(caixa.dataset.vista)));
    caixa.classList.toggle("ampliado", vistaDe(caixa.dataset.vista).z > 1.01);
  }
  let ultimoSom = 0;
  function somZoom(entrar) {
    const agora = performance.now();
    if (agora - ultimoSom < 140 || typeof Som === "undefined") return;
    ultimoSom = agora;
    Som.tocar(entrar ? "zoom-entrar" : "zoom-sair");
  }
  // aproxima/afasta em volta de um ponto (px, py em % do mapa)
  function zoomEm(caixa, fator, px = 50, py = 50) {
    const v = vistaDe(caixa.dataset.vista);
    const z = Math.min(4, Math.max(1, v.z * fator));
    if (Math.abs(z - v.z) < 0.001) return;
    somZoom(z > v.z);
    v.x = px - (px - v.x) * (z / v.z);
    v.y = py - (py - v.y) * (z / v.z);
    v.z = z;
    prender(v);
    aplicar(caixa);
  }
  const pontoEm = (caixa, ev) => {
    const r = caixa.getBoundingClientRect();
    return { x: ((ev.clientX - r.left) / r.width) * 100, y: ((ev.clientY - r.top) / r.height) * 100 };
  };

  document.addEventListener("wheel", (ev) => {
    const caixa = ev.target.closest && ev.target.closest(".mapa-ilustrado[data-vista]");
    if (!caixa) return;
    ev.preventDefault();
    const p = pontoEm(caixa, ev);
    zoomEm(caixa, ev.deltaY < 0 ? 1.2 : 1 / 1.2, p.x, p.y);
  }, { passive: false });

  document.addEventListener("click", (ev) => {
    const b = ev.target.closest && ev.target.closest("[data-zoom-mapa]");
    if (!b) return;
    const caixa = b.closest(".mapa-ilustrado");
    const z = +b.dataset.zoomMapa;
    if (z === 0) {
      const v = vistaDe(caixa.dataset.vista);
      if (v.z > 1.01) somZoom(false);
      Object.assign(v, { z: 1, x: 0, y: 0 });
      aplicar(caixa);
    } else zoomEm(caixa, z > 0 ? 1.5 : 1 / 1.5);
  });

  // arrastar com um dedo/mouse; pinça com dois dedos. Um toque sem arrastar continua sendo clique.
  let gesto = null;
  const dedos = new Map();
  let engolirClique = false;
  document.addEventListener("pointerdown", (ev) => {
    const caixa = ev.target.closest && ev.target.closest(".mapa-ilustrado[data-vista]");
    if (!caixa || ev.target.closest(".mapa-zoom")) return;
    dedos.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    const v = vistaDe(caixa.dataset.vista);
    if (dedos.size === 2) {
      const [a, b] = [...dedos.values()];
      gesto = { tipo: "pinca", caixa, dist: Math.hypot(a.x - b.x, a.y - b.y) };
    } else gesto = { tipo: "arrasto", caixa, x0: ev.clientX, y0: ev.clientY, vx: v.x, vy: v.y, moveu: false, id: ev.pointerId };
  });
  document.addEventListener("pointermove", (ev) => {
    if (!gesto || !dedos.has(ev.pointerId)) return;
    dedos.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    const caixa = gesto.caixa;
    if (gesto.tipo === "pinca" && dedos.size >= 2) {
      const [a, b] = [...dedos.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const meio = pontoEm(caixa, { clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 });
      zoomEm(caixa, dist / gesto.dist, meio.x, meio.y);
      gesto.dist = dist;
      engolirClique = true;
      return;
    }
    if (gesto.tipo !== "arrasto") return;
    const dx = ev.clientX - gesto.x0, dy = ev.clientY - gesto.y0;
    if (!gesto.moveu && Math.hypot(dx, dy) < 6) return;
    const v = vistaDe(caixa.dataset.vista);
    if (v.z <= 1.01) return; // inteiro: não há para onde arrastar
    if (!gesto.moveu) {
      gesto.moveu = true;
      try { caixa.setPointerCapture(gesto.id); } catch {}
      caixa.classList.add("arrastando");
    }
    const r = caixa.getBoundingClientRect();
    v.x = gesto.vx + (dx / r.width) * 100;
    v.y = gesto.vy + (dy / r.height) * 100;
    prender(v);
    aplicar(caixa);
  });
  const soltar = (ev) => {
    dedos.delete(ev.pointerId);
    if (!gesto) return;
    if (gesto.moveu) engolirClique = true;
    gesto.caixa.classList.remove("arrastando");
    if (!dedos.size) gesto = null;
  };
  document.addEventListener("pointerup", soltar);
  document.addEventListener("pointercancel", soltar);
  // depois de arrastar, o clique que vem junto não viaja para o lugar embaixo do dedo
  window.addEventListener("click", (ev) => {
    if (!engolirClique) return;
    engolirClique = false;
    if (ev.target.closest && ev.target.closest(".mapa-ilustrado")) {
      ev.stopPropagation();
      ev.preventDefault();
    }
  }, true);

  return { html };
})();
