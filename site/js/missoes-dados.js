// =====================================================================
// MISSÕES PUBLICADAS PELO CRIADOR (diagramas.html → Publicar)
// ---------------------------------------------------------------------
// Ficam em missoes/indice.json (a lista de ids) e missoes/<id>.json (o formato que o Criador
// exporta). Ao abrir o jogo, cada uma é carregada e adaptada para o motor (cenas.js); uma missão
// publicada com o mesmo id de uma missão do código (ex.: prologo-x) toma o lugar dela.
// O que o formato do Criador tem a mais e é resolvido aqui:
//   · variantes ([{ se, texto, efeitos }]): a primeira que servir vale no lugar do texto;
//   · acrescimos ([{ se, texto }]): parágrafos a mais no fim quando servem;
//   · {nome} vira o nome do personagem; {frase universal}, uma frase universal;
//   · desbloqueio: anterior (missão que precisa ter terminado), desbloqueio.marca, proxima.
// =====================================================================

const MissoesDados = (() => {
  // desbloqueio das missões que ainda estão só no código
  const PADRAO = {};
  // tendência de cada personagem pronto (herói, anti-herói, vilão): missoes/personagens.json
  let TENDENCIAS = {};
  const tendenciaDe = (p) => (p && (p.tendencia || TENDENCIAS[p.pronto])) || "";
  // atitude de cada NPC com o personagem (fica na ficha: p.atitudes = { abe: 2 })
  const atitudeDe = (p, npc) => ((p && p.atitudes) || {})[npc] || 0;

  // ---------- condições (as mesmas do motor, mais classe, rodada e Ressonância/Dissonância) ----------
  function condicao(se, ctx) {
    if (!se) return true;
    const f = ctx.camp?.flags || {};
    const p = ctx.p || {};
    const grupo = ctx.grupo || [p];
    const temMarca = (k) => grupo.some((x) => (x.marcas || []).includes(k));
    if ([].concat(se.flag || []).some((k) => !f[k])) return false;
    if ([].concat(se.semFlag || []).some((k) => f[k])) return false;
    if (se.algum && ![].concat(se.algum).some((k) => f[k])) return false;
    if (se.relogioMin != null && (ctx.camp?.relogio || 0) < se.relogioMin) return false;
    if ([].concat(se.marca || []).some((k) => !temMarca(k))) return false;
    if ([].concat(se.semMarca || []).some((k) => temMarca(k))) return false;
    if (se.algumaMarca && ![].concat(se.algumaMarca).some(temMarca)) return false;
    if (se.pronto && p.pronto !== se.pronto) return false;
    if (se.semPronto && p.pronto) return false;
    if (se.classe && p.papel !== se.classe) return false;
    if (se.rodadaMin != null && (ctx.camp?.rodada || 0) < se.rodadaMin) return false;
    if (se.resMin != null && (p.ressonancia || 0) < se.resMin) return false;
    if (se.disMin != null && (p.dissonancia || 0) < se.disMin) return false;
    if (se.ponto && (ctx.trabalho || {}).ponto !== se.ponto) return false;
    if (se.tendencia && tendenciaDe(p) !== se.tendencia) return false;
    for (const [npc, n] of Object.entries(se.atitudeMin || {})) if (atitudeDe(p, npc) < n) return false;
    for (const [npc, n] of Object.entries(se.atitudeMax || {})) if (atitudeDe(p, npc) > n) return false;
    return true;
  }

  // o texto do botão de uma escolha: a fala do personagem que está jogando
  function textoOpcao(op, ctx) {
    if (!op.textoVariantes?.length) return op.texto;
    const v = op.textoVariantes.find((x) => x.texto && condicao(x.se, ctx));
    return tokens(v ? v.texto : op.texto, ctx);
  }

  function tokens(t, ctx) {
    return String(t || "")
      .replace(/\{nome\}/g, ctx.p?.nome || "")
      .replace(/\{frase universal\}/g, () => (typeof fraseAleatoria === "function" ? fraseAleatoria() : ""));
  }

  // texto com variantes e acréscimos → o texto que vale agora
  function textoDe(o, ctx) {
    if (o == null) return "";
    if (typeof o === "string") return tokens(o, ctx);
    const v = (o.variantes || []).find((x) => x.texto && condicao(x.se, ctx));
    let t = v ? v.texto : o.texto || "";
    for (const a of o.acrescimos || []) if (condicao(a.se, ctx)) t += "\n\n" + a.texto;
    return tokens(t, ctx);
  }
  const precisaResolver = (o) => o && typeof o === "object" && (o.variantes?.length || o.acrescimos?.length || /\{(nome|frase universal)\}/.test(o.texto || ""));
  const comoTexto = (o) => (precisaResolver(o) ? (ctx) => textoDe(o, ctx) : typeof o === "object" && o ? o.texto || "" : o || "");

  // resultado de uma escolha: texto e efeitos da primeira variante que servir (os efeitos somam)
  function resultado(r, ctx) {
    if (!r || !r.variantes?.length && !/\{(nome|frase universal)\}/.test(typeof r.texto === "string" ? r.texto : "")) return r;
    const v = (r.variantes || []).find((x) => condicao(x.se, ctx));
    const efeitos = { ...(r.efeitos || {}), ...((v && v.efeitos) || {}) };
    return { ...r, texto: tokens(v && v.texto ? v.texto : r.texto, ctx), efeitos, variantes: undefined };
  }

  // ---------- o formato do Criador → a missão do motor ----------
  function adaptar(jm) {
    const codigo = window.MISSOES && MISSOES[jm.id];
    const m = { ...jm, cenas: {}, lugares: {}, publicada: true };
    Object.assign(m, { ...PADRAO[jm.id], ...limpo({ anterior: jm.anterior, proxima: jm.proxima }) });
    for (const [c, cena] of Object.entries(jm.cenas || {})) m.cenas[c] = { ...cena, texto: comoTexto(cena) };
    const equips = new Set((typeof EQUIPAMENTOS !== "undefined" ? EQUIPAMENTOS : []).map((e) => e.chave));
    for (const [l, lug] of Object.entries(jm.lugares || {})) {
      const nome = lug.nomeVariantes?.length ? (ctx) => textoDe({ texto: lug.nome, variantes: lug.nomeVariantes }, ctx) : lug.nome;
      m.lugares[l] = {
        ...lug, nome, descricao: comoTexto(lug.descricao),
        loja: lug.loja ? { nome: lug.loja.nome, itens: (lug.loja.vende || []).map((k) => (equips.has(k) ? { equip: k } : { pertence: k })) } : undefined,
      };
      // posição no mapa e lugar da cidade
      if (lug.cidade && typeof LIGACOES_X !== "undefined" && typeof CIDADE_X !== "undefined") {
        (LIGACOES_X[jm.id] = LIGACOES_X[jm.id] || {})[l] = lug.cidade;
        const c = CIDADE_X.lugares[lug.cidade];
        if (c) m.lugares[l].mapa = { x: c.x, y: c.y };
      }
      if (!m.lugares[l].mapa && codigo?.lugares?.[l]?.mapa) m.lugares[l].mapa = codigo.lugares[l].mapa;
    }
    if (Array.isArray(jm.ambiente)) {
      const faixas = jm.ambiente;
      m.ambiente = (r) => (faixas.find((a) => r <= a.ate) || faixas.at(-1) || { texto: "" }).texto;
    } else m.ambiente = codigo?.ambiente || (() => "");
    // o que ainda é código: onde a noite começa (origens) e os vídeos do caminho
    m.trabalho = codigo?.trabalho || ((p) => {
      const ini = jm.lugares?.[jm.lugarInicial] || {};
      const of = typeof profissaoDe === "function" ? profissaoDe(p, jm.eixo) : null;
      return { ponto: of?.ponto, cidade: ini.cidadePor?.[p?.pronto] || ini.cidade, origem: !!p?.pronto };
    });
    m.caminho = codigo?.caminho || ((daqui, destino, veiculo) => (veiculo && jm.caminhoVeiculo) || jm.lugares?.[destino]?.caminho || "caminho-calcada");
    if (codigo?.aberturas && !m.aberturas) m.aberturas = codigo.aberturas;
    if (!m.relogioMax) m.relogioMax = 16;
    if (m.pistasParaMarco == null) m.pistasParaMarco = 99;
    return m;
  }
  const limpo = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v));

  // ---------- carregar as publicadas ----------
  const pronto = (async () => {
    for (const [id, d] of Object.entries(PADRAO)) if (window.MISSOES?.[id]) Object.assign(MISSOES[id], { ...d, ...MISSOES[id] });
    try {
      const r = await fetch("missoes/personagens.json", { cache: "no-store" });
      if (r.ok) TENDENCIAS = (await r.json()).tendencias || {};
    } catch {}
    try {
      const r = await fetch("missoes/indice.json", { cache: "no-store" });
      if (!r.ok) return;
      const ids = await r.json();
      await Promise.all(ids.map(async (id) => {
        try {
          const j = await (await fetch(`missoes/${id}.json`, { cache: "no-store" })).json();
          MISSOES[j.id || id] = adaptar(j);
        } catch {}
      }));
    } catch {}
  })();

  // missão liberada para este personagem? (a anterior terminou e ele tem as marcas pedidas)
  function liberada(m, p) {
    if (m.anterior && !(p.concluidas || []).includes(m.anterior)) return false;
    return [].concat(m.desbloqueio?.marca || []).every((k) => (p.marcas || []).includes(k));
  }

  return { pronto, adaptar, condicao, textoDe, textoOpcao, resultado, liberada, tendenciaDe };
})();
