// =====================================================================
// CRIADOR DE MISSÕES: a missão completa (tudo o que o jogo precisa) dentro do diagrama.
// ---------------------------------------------------------------------
// Cada bloco do diagrama guarda, em n.d, os dados de verdade no mesmo formato que o motor do
// jogo usa (cenas.js), mais três coisas novas:
//   · variantes: o texto muda conforme quem joga ou o que aconteceu ([{ se, texto, efeitos }]);
//     a primeira que servir vale. acrescimos: parágrafos que entram no fim quando servem.
//   · {nome} no texto vira o nome do personagem; {frase universal}, uma frase universal.
//   · a missão tem desbloqueio: missão anterior, condição e próxima missão (m.jogo).
// Tipos de bloco que viram jogo: entrada/cena/final (cenas), lugar, mapa (a exploração:
// relógio, eventos, ações que valem em toda parte) e escolha (as opções do jogador).
// As escolhas pertencem ao bloco que liga nelas; para onde cada resultado leva vem das
// ligações que saem da escolha (✓ sucesso, ✗ falha, segue).
// Criador.importar(missão do jogo) → projeto completo; Criador.exportar(projeto) → missão do jogo.
// =====================================================================

const Criador = (() => {
  const PRONTOS_IDS = ["frank-brennan", "rosa-delgado", "marcus-bell", "denise-carter", "michael-doyle", "june-albright", "eli-navarro", "tess-monroe", "ray-okafor"];
  const PRONTO_PAPEL = { "frank-brennan": "tank", "rosa-delgado": "tank", "marcus-bell": "tank", "denise-carter": "healer", "michael-doyle": "healer", "june-albright": "healer", "eli-navarro": "support", "tess-monroe": "support", "ray-okafor": "support" };
  const TENDENCIAS = ["heroi", "anti-heroi", "vilao"];
  const NOME_TENDENCIA = { heroi: "Herói", "anti-heroi": "Anti-herói", vilao: "Vilão" };
  const nomePronto = (id) => id.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join(" ");

  // ---------- Catálogos (o que dá para escolher em cada campo) ----------
  const opcoes = {
    situacao: () => (typeof SITUACOES !== "undefined" ? SITUACOES.map((s) => [s.id, `${s.nome} (${s.atributo})`]) : []),
    equip: () => (typeof EQUIPAMENTOS !== "undefined" ? EQUIPAMENTOS.map((e) => [e.chave, e.nomes.x]) : []),
    hab: () => (typeof HABILIDADES !== "undefined" ? HABILIDADES.map((h) => [h.chave, h.nomes.x]) : []),
    pertence: () => (typeof PERTENCES !== "undefined" ? PERTENCES.map((p) => [p.chave, p.nomes.x]) : []),
    condicao: () => (typeof CONDICOES !== "undefined" ? Object.entries(CONDICOES).flatMap(([k, c]) => [[k, `fica: ${c.nome}`], ["-" + k, `tira: ${c.nome}`]]) : []),
    condicaoReq: () => (typeof CONDICOES !== "undefined" ? Object.entries(CONDICOES).map(([k, c]) => [k, c.nome]) : []),
    pronto: () => PRONTOS_IDS.map((id) => [id, nomePronto(id)]),
    classe: () => [["tank", "Tank"], ["healer", "Healer"], ["support", "Support"]],
    tendencia: () => TENDENCIAS.map((t) => [t, NOME_TENDENCIA[t]]),
    eixo: () => [["x", "∃ Urbano"], ["y", "ᛉ Medieval"], ["z", "◉ Espacial"]],
    prazo: () => [["curta", "curta"], ["media", "média"], ["longa", "longa"]],
    modoDecifrar: () => [["facil", "fácil (com opções)"], ["dificil", "difícil (sem opções)"]],
    linguaDecifrar: () => [["x", "Código Urbano (X)"], ["y", "Runas (Y)"]],
    estado: () => [["", "aberta"], ["concluida", "concluída"], ["perdida", "perdida"]],
    cidade: () => (typeof CIDADE_X !== "undefined" ? Object.entries(CIDADE_X.lugares).map(([k, l]) => [k, l.nome]) : []),
  };

  // tipo de valor: num, txt, lista (vírgulas), sel:<catálogo>, bool, pares (comida:1, cafe:2), quest
  const SE = {
    flag: ["depois de (acontecimento)", "lista"], semFlag: ["sem o acontecimento", "lista"], algum: ["depois de algum destes", "lista"],
    relogioMin: ["relógio a partir de", "num"], marca: ["personagem tem a marca", "lista"], semMarca: ["personagem não tem a marca", "lista"],
    algumaMarca: ["tem alguma destas marcas", "lista"], pronto: ["só este personagem", "sel:pronto"], classe: ["só esta classe", "sel:classe"],
    ponto: ["só a profissão (ponto)", "txt"], semPronto: ["só personagem criado (não pronto)", "bool"], rodadaMin: ["rodada do perigo a partir de", "num"],
    resMin: ["Ressonância a partir de", "num"], disMin: ["Dissonância a partir de", "num"],
    tendencia: ["só esta tendência", "sel:tendencia"],
    atitudeMin: ["NPC gosta pelo menos (ex.: abe:1)", "pares"], atitudeMax: ["NPC gosta no máximo (ex.: abe:-1)", "pares"],
  };
  const REQ = {
    item: ["precisa do equipamento", "sel:equip"], semItem: ["some se tiver o equipamento", "sel:equip"], hab: ["precisa da habilidade", "sel:hab"],
    res: ["precisa de Ressonância", "num"], dis: ["precisa de Dissonância", "num"], dinheiro: ["custa (dinheiro)", "num"],
    pertence: ["precisa do pertence", "sel:pertence"], condicao: ["só se estiver", "sel:condicaoReq"],
  };
  const EF = {
    atitude: ["atitude do NPC (ex.: abe:1, moore:-2)", "pares"],
    flag: ["marca o acontecimento (flag)", "lista"], tirarFlag: ["desfaz o acontecimento", "lista"], marca: ["marca no personagem (vai para as próximas)", "lista"],
    quest: ["linha no Diário", "quest"], dinheiro: ["dinheiro (+/−)", "num"], pertence: ["ganha pertences", "pares"], consumir: ["gasta o pertence", "sel:pertence"],
    item: ["ganha equipamento (se já tem, enche os usos)", "sel:equip"], condicao: ["condição", "sel:condicao"], exposicao: ["exposição (+/−)", "num"],
    ressonancia: ["Ressonância (+/−)", "num"], dissonancia: ["Dissonância (+/−)", "num"], convergencia: ["Teste de Convergência depois (intensidade)", "num"],
    ameaca: ["ameaça (+/−)", "num"], memoria: ["Memória Cruzada", "txt"], memoriaMin: ["memória só com Ressonância", "num"],
    aprenderX: ["aprende símbolos (Código Urbano)", "lista"], revela: ["lugar novo no mapa", "lista"], renovarItens: ["recarrega lanterna, celular e medidor", "bool"],
    documento: ["documento de lore (vai para a Coleção; id de dados/documentos.json)", "txt"],
  };
  const CATALOGOS = { se: SE, req: REQ, ef: EF };

  // ---------- Caminhos dentro do bloco (ex.: "d.res.sucesso.efeitos") ----------
  function pegar(obj, caminho) {
    return caminho.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }
  function por(obj, caminho, valor) {
    const ks = caminho.split(".");
    let o = obj;
    for (const k of ks.slice(0, -1)) {
      if (o[k] == null) o[k] = /^\d+$/.test(k) ? [] : {};
      o = o[k];
    }
    if (valor === undefined) delete o[ks.at(-1)];
    else o[ks.at(-1)] = valor;
  }

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  function paraTexto(tipo, v) {
    if (v == null) return "";
    if (tipo === "lista") return [].concat(v).join(", ");
    if (tipo === "pares") return Object.entries(v || {}).map(([k, q]) => `${k}:${q}`).join(", ");
    if (tipo === "sel:condicao") return [].concat(v).join(", ");
    return String(v);
  }
  function deTexto(tipo, s, el) {
    if (tipo === "bool") return el.checked || undefined;
    if (tipo === "num") return s === "" ? undefined : Number(s);
    if (tipo === "lista") {
      const l = s.split(",").map((x) => x.trim()).filter(Boolean);
      return l.length ? l : undefined;
    }
    if (tipo === "pares") {
      const o = {};
      for (const par of s.split(",")) {
        const [k, q] = par.split(":").map((x) => x.trim());
        if (k) o[k] = Number(q || 1);
      }
      return Object.keys(o).length ? o : undefined;
    }
    return s === "" ? undefined : s;
  }

  function entrada(tipo, caminho, valor) {
    if (tipo === "bool") return `<input type="checkbox" data-p="${caminho}" data-k="bool" ${valor ? "checked" : ""}>`;
    if (tipo.startsWith("sel:")) {
      const lista = opcoes[tipo.slice(4)]();
      const atual = [].concat(valor ?? "")[0];
      return `<select data-p="${caminho}" data-k="${tipo}"><option value=""></option>${lista.map(([k, n]) => `<option value="${esc(k)}" ${atual === k ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>`;
    }
    return `<input data-p="${caminho}" data-k="${tipo}" value="${esc(paraTexto(tipo, valor))}" ${tipo === "num" ? 'inputmode="numeric"' : ""}>`;
  }

  // linhas de condição, requisito ou efeito
  function linhas(cat, caminho, obj = {}) {
    const C = CATALOGOS[cat];
    const usadas = Object.keys(obj || {}).filter((k) => C[k]);
    const outras = Object.keys(obj || {}).filter((k) => !C[k]);
    const linha = (k) => {
      const [rot, tipo] = C[k];
      if (tipo === "quest") {
        const q = obj[k] || {};
        return `<div class="cr-linha cr-quest"><span>${rot}</span>
          <input data-p="${caminho}.${k}.id" data-k="txt" value="${esc(q.id)}" placeholder="id">
          <input data-p="${caminho}.${k}.nome" data-k="txt" value="${esc(q.nome)}" placeholder="nome no Diário">
          ${entrada("sel:prazo", `${caminho}.${k}.prazo`, q.prazo)} ${entrada("sel:estado", `${caminho}.${k}.estado`, q.estado)}
          <input data-p="${caminho}.${k}.nota" data-k="txt" value="${esc(q.nota)}" placeholder="nota">
          <button class="cr-x" data-tirar="${caminho}.${k}" title="Tirar">✕</button></div>`;
      }
      return `<div class="cr-linha"><span>${rot}</span>${entrada(tipo, `${caminho}.${k}`, obj[k])}<button class="cr-x" data-tirar="${caminho}.${k}" title="Tirar">✕</button></div>`;
    };
    return `<div class="cr-linhas">${usadas.map(linha).join("")}
      ${outras.map((k) => `<div class="cr-linha"><span>${esc(k)}</span><input data-p="${caminho}.${k}" data-k="json" value="${esc(JSON.stringify(obj[k]))}"><button class="cr-x" data-tirar="${caminho}.${k}">✕</button></div>`).join("")}
      <select class="cr-add" data-add="${caminho}" data-cat="${cat}"><option value="">+ ${cat === "se" ? "condição" : cat === "req" ? "requisito" : "efeito"}…</option>${Object.entries(C).filter(([k]) => !usadas.includes(k)).map(([k, [rot]]) => `<option value="${k}">${rot}</option>`).join("")}</select></div>`;
  }

  // texto com variantes e acréscimos
  function textoHtml(rot, caminho, alvo, { acrescimos = false, efeitosNaVariante = false } = {}) {
    const vs = alvo.variantes || [];
    const as = alvo.acrescimos || [];
    return `<label class="campo"><span>${rot} <small>· linha em branco = um “Continuar”; aspas “ ” = fala com voz</small></span>
      <textarea data-p="${caminho}.texto" data-k="txt" rows="5">${esc(alvo.texto)}</textarea></label>
      ${vs.map((v, i) => `<div class="cr-variante"><div class="cr-variante-topo"><b>Variação ${i + 1}</b> <small>vale no lugar do texto acima quando:</small><button class="cr-x" data-tirar-item="${caminho}.variantes.${i}">✕</button></div>
        ${linhas("se", `${caminho}.variantes.${i}.se`, v.se)}
        <textarea data-p="${caminho}.variantes.${i}.texto" data-k="txt" rows="3" placeholder="(vazio = mantém o texto principal)">${esc(v.texto)}</textarea>
        ${efeitosNaVariante ? `<small>efeitos desta variação (somam aos de cima):</small>${linhas("ef", `${caminho}.variantes.${i}.efeitos`, v.efeitos)}` : ""}</div>`).join("")}
      ${as.map((v, i) => `<div class="cr-variante cr-acrescimo"><div class="cr-variante-topo"><b>Acréscimo ${i + 1}</b> <small>parágrafo a mais no fim quando:</small><button class="cr-x" data-tirar-item="${caminho}.acrescimos.${i}">✕</button></div>
        ${linhas("se", `${caminho}.acrescimos.${i}.se`, v.se)}
        <textarea data-p="${caminho}.acrescimos.${i}.texto" data-k="txt" rows="2">${esc(v.texto)}</textarea></div>`).join("")}
      <div class="dg-botoes"><button class="btn" data-novo-item="${caminho}.variantes">+ Variação</button>${acrescimos ? `<button class="btn" data-novo-item="${caminho}.acrescimos">+ Acréscimo</button>` : ""}</div>`;
  }

  // variações de um texto curto: [{ se, texto }] (a primeira que servir vale)
  function variantesCurtas(rot, caminho, lista = [], ajuda = "") {
    return secao(`${rot} <small>${lista.length}</small>`, `${ajuda ? `<p class="ajuda">${ajuda}</p>` : ""}
      ${lista.map((v, i) => `<div class="cr-variante"><div class="cr-variante-topo"><b>Variação ${i + 1}</b> <small>quando:</small><button class="cr-x" data-tirar-item="${caminho}.${i}">✕</button></div>
        ${linhas("se", `${caminho}.${i}.se`, v.se)}
        <input data-p="${caminho}.${i}.texto" data-k="txt" value="${esc(v.texto)}" placeholder="o texto para esse caso"></div>`).join("")}
      <button class="btn" data-novo-item="${caminho}">+ Variação</button>`, !!lista.length);
  }

  function secao(titulo, corpo, aberta = true) {
    return `<details class="cr-secao" ${aberta ? "open" : ""}><summary>${titulo}</summary>${corpo}</details>`;
  }

  // ---------- O painel de cada tipo de bloco ----------
  // ctx: { m (missão), no(id), saidas(id), destinos (blocos que podem ser destino), pais }
  function painel(n, ctx) {
    const d = n.d;
    const t = n.tipo;
    if (t === "escolha") return painelEscolha(n, ctx);
    if (t === "lugar") {
      return `
        ${campoTxt("Nome do lugar", "titulo", n.titulo)}
        ${variantesCurtas("O nome muda para…", "d.nomeVariantes", d.nomeVariantes, "Ex.: o lugar inicial tem um nome para cada personagem.")}
        <div class="cr-duas">${campoTxt("Ícone", "d.icone", d.icone)}${campoTxt("Id no jogo", "d.chave", d.chave)}</div>
        ${textoHtml("Descrição (o que se vê ao chegar)", "d.descricao", d.descricao || {}, {})}
        ${secao("Só aparece no mapa se…", linhas("se", "d.se", d.se), !!(d.se && Object.keys(d.se).length))}
        ${secao("Lugar da cidade (mapa de Port Halden)", `<label class="campo"><span>Fica em</span>${entrada("sel:cidade", "d.cidade", d.cidade)}</label>
          <label class="campo"><span>Vídeo do caminho até aqui</span>${entrada("txt", "d.caminho", d.caminho)}</label>
          <label class="cr-check"><input type="checkbox" data-p="d.inicial" data-k="bool" ${d.inicial ? "checked" : ""}> a missão começa aqui (depois da abertura)</label>`, false)}
        ${secao("Loja", `${campoTxt("Nome da loja (vazio = sem loja)", "d.loja.nome", d.loja?.nome)}
          <label class="campo"><span>Vende (pertences e equipamentos, separados por vírgula)</span>
          <input data-p="d.loja.vende" data-k="lista" value="${esc((d.loja?.vende || []).join(", "))}" placeholder="comida, cafe, kit_medico"></label>`, !!d.loja?.nome)}
        ${listaEscolhas(n, ctx, "Ações neste lugar")}`;
    }
    if (t === "mapa") {
      return `
        ${campoTxt("Nome", "titulo", n.titulo)}
        <div class="cr-duas">${campoNum("Relógio (marcas)", "d.relogioMax", d.relogioMax)}${campoNum("Pistas para o marco", "d.pistasParaMarco", d.pistasParaMarco)}</div>
        ${campoTxt("Botão do marco", "d.marcoTexto", d.marcoTexto, "Seguir a multidão até a Praça Central")}
        ${campoTxt("Dica do marco (Diário)", "d.marcoDica", d.marcoDica)}
        ${campoTxt("Dica do mapa", "d.mapaDica", d.mapaDica)}
        ${campoTxt("Centro do mapa (nome)", "d.centro.nome", d.centro?.nome)}
        ${secao("O clima da cidade (muda com o relógio)", (d.ambiente || []).map((a, i) => `<div class="cr-linha"><span>até ${entrada("num", `d.ambiente.${i}.ate`, a.ate)}</span><input data-p="d.ambiente.${i}.texto" data-k="txt" value="${esc(a.texto)}"><button class="cr-x" data-tirar-item="d.ambiente.${i}">✕</button></div>`).join("") + `<button class="btn" data-novo-item="d.ambiente">+ Faixa</button>`)}
        ${secao("Acontecimentos do relógio", (d.eventos || []).map((e, i) => `<div class="cr-evento"><div class="cr-duas"><label class="campo"><span>no relógio</span>${entrada("num", `d.eventos.${i}.em`, e.em)}</label><label class="campo"><span>marca o acontecimento</span>${entrada("txt", `d.eventos.${i}.flag`, e.flag)}</label></div>
          <textarea data-p="d.eventos.${i}.texto" data-k="txt" rows="2">${esc(e.texto)}</textarea><button class="cr-x" data-tirar-item="d.eventos.${i}">✕</button></div>`).join("") + `<button class="btn" data-novo-item="d.eventos">+ Acontecimento</button>`)}
        ${listaEscolhas(n, ctx, "Ações que valem em toda parte")}
        <p class="ajuda">Os lugares ligados a este bloco são os lugares da exploração.</p>`;
    }
    if (["entrada", "cena", "final"].includes(t)) {
      return `
        ${campoTxt("Título da cena", "titulo", n.titulo)}
        ${campoTxt("Id no jogo", "d.chave", d.chave)}
        ${textoHtml("Texto da cena", "d", d, { acrescimos: true })}
        ${campoTxt("Explicação para o jogador (tutorial)", "d.tutorial", d.tutorial)}
        <div class="cr-duas">${campoNum("Ameaça (perigo com rodadas)", "d.ameaca", d.ameaca)}
          <label class="cr-check"><input type="checkbox" data-p="d.musica" data-k="bool" ${d.musica ? "checked" : ""}> toca a música do rádio</label></div>
        ${secao("Decifrar (enigma de tradução)", `
          <p class="ajuda">Ponha palavras aqui para esta cena virar um Decifrar (abre numa tela própria). A escrita aparece sempre inteira; a tradução se monta com o que o personagem sabe. Palavra sem id (ligação, como ⇒ "que") aparece sempre traduzida. Cada palavra que falta tem 3 tentativas grátis; no fácil, depois, 4 opções e 2 chances; quem falha de vez vai para a Lição (salto no tempo).</p>
          <div class="cr-duas"><label class="campo"><span>Língua</span>${entrada("sel:linguaDecifrar", "d.decifrar.lingua", d.decifrar?.lingua)}</label>
            <label class="campo"><span>Modo</span>${entrada("sel:modoDecifrar", "d.decifrar.modo", d.decifrar?.modo)}</label></div>
          ${(d.decifrar?.palavras || []).map((w, i) => `<div class="cr-evento"><div class="cr-duas">
              <label class="campo"><span>Escrita</span>${entrada("txt", `d.decifrar.palavras.${i}.escrita`, w.escrita)}</label>
              <label class="campo"><span>Tradução</span>${entrada("txt", `d.decifrar.palavras.${i}.sentido`, w.sentido)}</label></div>
            <div class="cr-duas"><label class="campo"><span>Id (símbolo no X ou runas no Y; vazio = ligação)</span>${entrada("txt", `d.decifrar.palavras.${i}.id`, w.id)}</label>
              <label class="campo"><span>Respostas aceitas</span>${entrada("lista", `d.decifrar.palavras.${i}.respostas`, w.respostas)}</label></div>
            <label class="campo"><span>3 opções erradas (modo fácil)</span>${entrada("lista", `d.decifrar.palavras.${i}.erradas`, w.erradas)}</label>
            <button class="cr-x" data-tirar-item="d.decifrar.palavras.${i}">✕</button></div>`).join("")}
          <button class="btn" data-novo-item="d.decifrar.palavras">+ Palavra</button>
          <div class="cr-duas">${campoTxt("Ao terminar, vai para (cena:id)", "d.decifrar.acertou", d.decifrar?.acertou, "cena:fim")}
            ${campoTxt("Lição (cena:id)", "d.decifrar.licao", d.decifrar?.licao, "cena:licao")}</div>
          ${campoNum("Dissonância do salto da Lição", "d.decifrar.dissonancia", d.decifrar?.dissonancia)}
          ${campoTxt("Memória Cruzada ao terminar (opcional)", "d.decifrar.memoria", d.decifrar?.memoria)}`)}
        ${t === "final" || d.final ? secao("Final da missão", `
          <label class="cr-check"><input type="checkbox" data-p="d.final" data-k="bool" ${d.final ? "checked" : ""}> esta cena encerra a missão</label>
          <label class="campo"><span>Revela o mundo</span>${entrada("sel:eixo", "d.revela", d.revela)}</label>
          ${campoTxt("Memória Cruzada (fica na ficha)", "d.memoria", d.memoria)}
          <label class="campo"><span>Marcas que o personagem leva</span>${entrada("lista", "d.marca", d.marca)}</label>
          ${campoTxt("Aviso no fim", "d.textoFinal", d.textoFinal)}`) : ""}
        ${listaEscolhas(n, ctx, "Escolhas desta cena")}`;
    }
    return "";
  }

  function campoTxt(rot, caminho, valor, ph = "") {
    return `<label class="campo"><span>${rot}</span><input data-p="${caminho}" data-k="txt" value="${esc(valor)}" placeholder="${esc(ph)}"></label>`;
  }
  function campoNum(rot, caminho, valor) {
    return `<label class="campo"><span>${rot}</span><input data-p="${caminho}" data-k="num" inputmode="numeric" value="${esc(valor ?? "")}"></label>`;
  }

  function listaEscolhas(n, ctx, titulo) {
    const filhos = ctx.escolhasDe(n.id);
    return secao(`${titulo} <small>${filhos.length}</small>`, `
      <ol class="cr-escolhas">${filhos.map((f) => `<li><button class="btn-texto" data-ir-no="${f.id}">${esc(f.titulo || "(sem texto)")}</button> <small>${esc(rotuloTeste(f.d))}</small></li>`).join("")}</ol>
      <button class="btn primario" data-nova-escolha="${n.id}">+ Nova escolha</button>
      <p class="ajuda">A ordem na tela do jogo é a de cima para baixo no diagrama.</p>`);
  }

  function rotuloTeste(d = {}) {
    const t = d.teste || {};
    if (t.tipo === "convergencia") return `Convergência ${t.intensidade || 1}`;
    if (t.tipo === "situacao") return `teste: ${t.situacao || "?"}`;
    return d.comum ? "vida comum" : "sem teste";
  }

  function painelEscolha(n, ctx) {
    const d = n.d;
    const teste = d.teste || { tipo: "nenhum" };
    const comTeste = teste.tipo && teste.tipo !== "nenhum";
    const pai = ctx.paiDe(n.id);
    const resultado = (chave, rot) => {
      const r = (d.res || {})[chave] || {};
      return secao(rot, `
        ${textoHtml("Texto", `d.res.${chave}`, r, { efeitosNaVariante: true })}
        <label class="campo"><span>Vai para</span><select data-destino="${chave}">${ctx.opcoesDestino(n.id, chave)}</select></label>
        ${campoTxt("Quem fala neste resultado (se não for o da escolha)", `d.res.${chave}.npc`, r.npc)}
        ${campoTxt("Pista no Diário", `d.res.${chave}.pista`, r.pista)}
        <small>Efeitos</small>${linhas("ef", `d.res.${chave}.efeitos`, r.efeitos)}`);
    };
    return `
      <p class="ajuda">Escolha de: <b>${esc(pai ? pai.titulo : "— (ligue a uma cena ou lugar)")}</b></p>
      ${campoTxt("Texto do botão (a fala ou ação do personagem)", "titulo", n.titulo)}
      ${variantesCurtas("Cada personagem diz do seu jeito", "d.botaoVariantes", d.botaoVariantes, "O botão muda conforme quem joga: personagem, classe, tendência, marca… A primeira variação que servir vale.")}
      <div class="cr-duas">${campoTxt("Id (voz e ‘feita’)", "d.id", d.id)}${campoTxt("Quem fala (NPC)", "d.npc", d.npc)}</div>
      ${campoTxt("Palavras para o texto livre", "d.palavras", (d.palavras || []).join(", "))}
      ${secao("Teste", `
        <label class="campo"><span>Tipo</span><select data-p="d.teste.tipo" data-k="txt">
          <option value="nenhum" ${!comTeste ? "selected" : ""}>Sem teste (um resultado só)</option>
          <option value="situacao" ${teste.tipo === "situacao" ? "selected" : ""}>Teste de dados (situação)</option>
          <option value="convergencia" ${teste.tipo === "convergencia" ? "selected" : ""}>Teste de Convergência</option></select></label>
        ${teste.tipo === "situacao" ? `<label class="campo"><span>Situação (decide o atributo e os traços que ajudam)</span>${entrada("sel:situacao", "d.teste.situacao", teste.situacao)}</label>` : ""}
        ${teste.tipo === "convergencia" ? campoNum("Intensidade (1 a 3)", "d.teste.intensidade", teste.intensidade) : ""}
        <label class="cr-check"><input type="checkbox" data-p="d.rodada" data-k="bool" ${d.rodada ? "checked" : ""}> é uma rodada do perigo (cena com ameaça)</label>`)}
      ${secao("Tempo e repetição", `
        <div class="cr-duas">${campoNum("Gasta no relógio (vazio = 1; vida comum = 0)", "d.tempo", d.tempo)}${campoTxt("Grupo (só uma do grupo)", "d.grupo", d.grupo)}</div>
        <label class="cr-check"><input type="checkbox" data-p="d.comum" data-k="bool" ${d.comum ? "checked" : ""}> vida comum</label>
        <label class="cr-check"><input type="checkbox" data-p="d.repetivel" data-k="bool" ${d.repetivel ? "checked" : ""}> dá para fazer de novo</label>`, false)}
      ${secao("Só aparece se…", linhas("se", "d.se", d.se), !!(d.se && Object.keys(d.se).length))}
      ${secao("Requisitos (aparece trancada sem eles)", linhas("req", "d.req", d.req), !!(d.req && Object.keys(d.req).length))}
      ${comTeste ? resultado("sucesso", "✓ Se passar no teste") + resultado("falha", "✗ Se falhar") : resultado("resultado", "Resultado")}`;
  }

  // ---------- Aplicar o que foi digitado ----------
  function aplicar(n, el) {
    const caminho = el.dataset.p;
    const tipo = el.dataset.k;
    if (caminho === "d.palavras") return por(n, caminho, deTexto("lista", el.value, el));
    if (tipo === "json") {
      try {
        por(n, caminho, JSON.parse(el.value));
      } catch {}
      return;
    }
    if (tipo === "sel:condicao") return por(n, caminho, el.value || undefined);
    let v = deTexto(tipo.startsWith("sel:") ? "txt" : tipo, el.value, el);
    // listas de um item só continuam listas; o motor aceita as duas formas
    por(n, caminho, v);
    if (caminho === "d.teste.tipo") return "repintar";
    if (/\.texto$|^titulo$/.test(caminho)) return "blocos";
    return "";
  }

  // + condição / + efeito escolhido no select
  function acrescentar(n, sel) {
    const caminho = sel.dataset.add;
    const k = sel.value;
    if (!k) return;
    const [, tipo] = CATALOGOS[sel.dataset.cat][k];
    const padrao = tipo === "num" ? 1 : tipo === "bool" ? true : tipo === "quest" ? { id: "", nome: "", prazo: "curta" } : tipo === "lista" ? [] : tipo === "pares" ? {} : "";
    por(n, `${caminho}.${k}`, padrao);
  }

  function tirar(n, caminho) {
    por(n, caminho, undefined);
  }
  function tirarItem(n, caminho) {
    const ks = caminho.split(".");
    const i = Number(ks.pop());
    const lista = pegar(n, ks.join("."));
    if (Array.isArray(lista)) lista.splice(i, 1);
  }
  function novoItem(n, caminho) {
    const lista = pegar(n, caminho) || [];
    const novo = caminho.endsWith("ambiente") ? { ate: 99, texto: "" } : caminho.endsWith("eventos") ? { em: 1, flag: "", texto: "" } : caminho.endsWith("palavras") ? { escrita: "", sentido: "" } : { se: {}, texto: "" };
    lista.push(novo);
    por(n, caminho, lista);
  }

  // dados iniciais de um bloco novo
  function dadosNovos(tipo, titulo) {
    if (tipo === "escolha") return { id: "a" + Date.now().toString(36), teste: { tipo: "nenhum" }, res: { resultado: { texto: "" } } };
    if (tipo === "lugar") return { chave: "l" + Date.now().toString(36), icone: "◇", descricao: { texto: "" } };
    if (tipo === "mapa") return { relogioMax: 16, pistasParaMarco: 5, ambiente: [{ ate: 99, texto: "" }], eventos: [], centro: { nome: "Praça Central" } };
    if (["entrada", "cena", "final"].includes(tipo)) return { chave: "c" + Date.now().toString(36), texto: "", final: tipo === "final" || undefined };
    return null;
  }

  // ======================= Importar uma missão do jogo, inteira =======================

  function importar(jm) {
    const m = {
      id: "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), titulo: jm.titulo, eixo: jm.eixo,
      resumo: typeof jm.resumo === "string" ? jm.resumo : "", nos: [], ligacoes: [],
      jogo: {
        id: jm.id, subtitulo: jm.subtitulo, fase: jm.fase, faseTag: jm.faseTag, npcs: { ...(jm.npcs || {}) },
        anterior: jm.id === "x1-manha" ? "prologo-x" : "", proxima: jm.id === "prologo-x" ? "x1-manha" : "", desbloqueio: {},
        avancado: limpar({ radio: jm.radio, centroMapa: jm.centroMapa, aberturas: jm.aberturas }),
      },
    };
    const novo = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const ids = {};
    const add = (chave, tipo, titulo, x, y, d) => {
      const n = { id: novo("n"), tipo, titulo, texto: "", condicao: "", efeitos: "", notas: "", x, y, d };
      m.nos.push(n);
      if (chave) ids[chave] = n.id;
      return n;
    };
    const lig = (a, b, tipo = "segue", rotulo = "") => a && b && !m.ligacoes.some((l) => l.de === a && l.para === b && l.tipo === tipo) && m.ligacoes.push({ id: novo("l"), de: a, para: b, rotulo, tipo });

    // contextos para avaliar os textos que mudam (um por personagem pronto)
    const fraseOriginal = window.fraseAleatoria;
    window.fraseAleatoria = () => "{frase universal}";
    const ctxDe = (pid, extra = {}) => {
      const p = { id: pid, pronto: pid, nome: "{nome}", papel: PRONTO_PAPEL[pid], tracos: [], ressonancia: 0, dissonancia: 0, itens: [], habs: [], ...extra.p };
      return { p, camp: { flags: {}, rodada: 0, ...extra.camp }, trabalho: jm.trabalho ? jm.trabalho(p) : {}, grupo: [p] };
    };
    // texto que pode ser função → { texto, variantes }
    function texto(v, { chave = "" } = {}) {
      if (typeof v !== "function") return { texto: v || "" };
      const tenta = (c) => { try { return String(v(c) ?? ""); } catch { return ""; } };
      const porPronto = PRONTOS_IDS.map((pid) => [pid, tenta(ctxDe(pid))]);
      const cont = {};
      porPronto.forEach(([, t]) => (cont[t] = (cont[t] || 0) + 1));
      const padrao = Object.entries(cont).sort((a, b) => b[1] - a[1])[0][0];
      const variantes = [];
      // por classe, quando os da mesma classe têm o mesmo texto
      const porClasse = {};
      let classeServe = true;
      for (const [pid, t] of porPronto) {
        const c = PRONTO_PAPEL[pid];
        if (porClasse[c] === undefined) porClasse[c] = t;
        else if (porClasse[c] !== t) classeServe = false;
      }
      if (classeServe) for (const [c, t] of Object.entries(porClasse)) { if (t !== padrao) variantes.push({ se: { classe: c }, texto: t }); }
      else for (const [pid, t] of porPronto) if (t !== padrao) variantes.push({ se: { pronto: pid }, texto: t });
      // o que muda com o rádio tocando e com a rodada do perigo
      const base = tenta(ctxDe(PRONTOS_IDS[0]));
      const comRadio = tenta(ctxDe(PRONTOS_IDS[0], { camp: { flags: { radioTocando: true } } }));
      if (comRadio !== base) variantes.unshift({ se: { flag: ["radioTocando"] }, texto: comRadio });
      const rodada = tenta(ctxDe(PRONTOS_IDS[0], { camp: { rodada: 1 } }));
      if (rodada !== base) variantes.unshift({ se: { rodadaMin: 1 }, texto: rodada });
      return { texto: padrao, variantes: variantes.length ? variantes : undefined };
    }
    const efeitosLimpos = (e) => (e && Object.keys(e).length ? JSON.parse(JSON.stringify(e)) : undefined);
    const resultadoDe = (r) => {
      if (!r) return undefined;
      if (typeof r === "function") {
        // resultado que muda por personagem: o texto comum e, por personagem, os efeitos dele
        const porPronto = PRONTOS_IDS.map((pid) => [pid, r(ctxDe(pid))]);
        const base = porPronto[0][1];
        return {
          texto: typeof base.texto === "string" ? base.texto : "", pista: base.pista, ir: base.ir,
          variantes: porPronto.map(([pid, x]) => ({ se: { pronto: pid }, efeitos: efeitosLimpos(x.efeitos) })).filter((v) => v.efeitos),
        };
      }
      return { ...texto(r.texto), efeitos: efeitosLimpos(r.efeitos), pista: r.pista, npc: r.npc, ir: r.ir };
    };

    // 1. as cenas, na ordem em que se chega nelas
    const destinos = (op) => ["resultado", "sucesso", "falha"].map((k) => op[k]).filter((r) => r && typeof r === "object" && r.ir).map((r) => r.ir);
    const ordem = [];
    const visitar = (ini) => {
      const fila = [ini];
      while (fila.length) {
        const c = fila.shift();
        if (!c || ordem.includes(c) || !jm.cenas[c]) continue;
        ordem.push(c);
        for (const op of jm.cenas[c].opcoes || []) for (const dd of destinos(op)) if (dd.startsWith("cena:")) fila.push(dd.slice(5));
      }
    };
    visitar(jm.inicio);
    visitar("chamado");
    Object.keys(jm.cenas).forEach((c) => !ordem.includes(c) && ordem.push(c));

    const escolhas = []; // [{ n, op }] para ligar os destinos depois
    function escolha(op, x, y, paiId) {
      const teste = op.convergencia ? { tipo: "convergencia", intensidade: op.convergencia } : op.situacao ? { tipo: "situacao", situacao: op.situacao } : { tipo: "nenhum" };
      const res = {};
      for (const k of ["sucesso", "falha", "resultado"]) if (op[k]) res[k] = resultadoDe(op[k]);
      const d = limpar({
        id: op.id || "", palavras: op.palavras, npc: op.npc, comum: op.comum, repetivel: op.repetivel, tempo: op.tempo, grupo: op.grupo,
        se: op.se && JSON.parse(JSON.stringify(op.se)), req: op.req && JSON.parse(JSON.stringify(op.req)), teste, rodada: op.rodada, res,
      });
      const n = add(null, "escolha", op.texto, x, y, d);
      lig(paiId, n.id);
      escolhas.push({ n, op: d });
      return n;
    }

    const X0 = 0, PASSO = 340;
    ordem.forEach((c, i) => {
      const cena = jm.cenas[c];
      const tipo = c === jm.inicio ? "entrada" : cena.final ? "final" : "cena";
      const t = texto(cena.texto);
      if (c === "salto" && jm.id === "prologo-x") {
        t.acrescimos = [
          { se: { algum: ["salvou-raimundo", "salvou-tiao", "salvou-diego"] }, texto: "Atrás da pessoa de capuz, um rosto que você conhece: alguém que você salvou em Port Halden. Não é ele, não pode ser. Mas ele sorri como quem já te deve uma." },
          { se: { algum: ["gravou-ouvinte", "fita"] }, texto: "Em algum lugar do mosteiro, alguém está cantando a melodia da Rádio Pirata. Com outra letra, e a mesma voz." },
          { se: { disMin: 5 }, texto: "Suas mãos estão sujas de carvão, e você não lembra de ter riscado nada. A pessoa de capuz olha para elas e recua um passo." },
          { se: { resMin: 5 }, texto: "Por um instante, antes da pedra, você viu outra coisa: um corredor de metal, uma janela redonda, um planeta enorme do lado de fora. Depois, só a pedra." },
        ];
      }
      const n = add("cena:" + c, tipo, cena.titulo || c, X0 + i * PASSO, 0, limpar({
        chave: c, ...t, tutorial: cena.tutorial, ameaca: cena.ameaca, musica: cena.musica, final: cena.final,
        revela: cena.revela, memoria: cena.memoria, marca: cena.marca, imagem: cena.imagem, decifrar: cena.decifrar,
        textoFinal: cena.final ? jm.textoFinal || (jm.id === "prologo-x" ? "Fim do prólogo. O Eixo Y foi revelado na ficha de quem jogou." : "") : undefined,
      }));
      (cena.opcoes || []).forEach((op, k) => escolha(op, n.x, 200 + k * 190, n.id));
    });

    // 2. a exploração: o bloco do mapa e os lugares
    const lugares = Object.entries(jm.lugares || {});
    if (lugares.length) {
      const amb = [];
      if (jm.ambiente) for (let r = 0; r <= (jm.relogioMax || 16); r++) {
        const t = jm.ambiente(r);
        if (amb.length && amb.at(-1).texto === t) amb.at(-1).ate = r;
        else amb.push({ ate: r, texto: t });
      }
      if (amb.length) amb.at(-1).ate = 99;
      const xMapa = (ordem.indexOf("chamado") >= 0 ? ordem.indexOf("chamado") : 1) * PASSO;
      const mapa = add("mapa", "mapa", "A exploração", xMapa, 1100, limpar({
        relogioMax: jm.relogioMax, pistasParaMarco: jm.pistasParaMarco, marcoTexto: jm.marcoTexto, marcoDica: jm.marcoDica, mapaDica: jm.mapaDica,
        centro: jm.centroMapa ? { nome: jm.centroMapa.nome } : undefined, ambiente: amb,
        eventos: (jm.eventosRelogio || []).map((e) => ({ ...e })),
      }));
      (jm.emTodaParte || []).forEach((op, k) => escolha(op, xMapa - PASSO, 1100 + k * 190, mapa.id));
      if (ids["cena:chamado"]) lig(mapa.id, ids["cena:chamado"], "segue", "marco: pistas ou relógio cheio");

      lugares.forEach(([lid, l], col) => {
        const x = col * PASSO;
        const y = 1500;
        const ehInicial = lid === jm.lugarInicial;
        const nome = typeof l.nome === "function" ? "Onde a noite começa" : l.nome;
        const d = limpar({
          chave: lid, icone: l.icone, descricao: texto(l.descricao), se: l.se && JSON.parse(JSON.stringify(l.se)), inicial: ehInicial || undefined,
          loja: l.loja ? { nome: l.loja.nome, vende: l.loja.itens.map((i) => i.pertence || i.equip) } : undefined,
          cidade: typeof LIGACOES_X !== "undefined" ? (LIGACOES_X[jm.id] || {})[lid] : undefined,
        });
        if (typeof l.nome === "function") {
          d.nomeVariantes = PRONTOS_IDS.map((pid) => ({ se: { pronto: pid }, texto: l.nome(ctxDe(pid)) }));
          if (typeof ORIGENS_X !== "undefined") d.cidadePor = Object.fromEntries(PRONTOS_IDS.map((pid) => [pid, ORIGENS_X[pid]?.cidade]).filter(([, c]) => c));
        }
        if (jm.caminho) d.caminho = jm.caminho("_", lid, false);
        const n = add("lugar:" + lid, "lugar", nome, x, y, d);
        lig(mapa.id, n.id);
        l.acoes.forEach((op, k) => escolha(op, x, y + 230 + k * 190, n.id));
      });
      if (jm.caminho) m.jogo.caminhoVeiculo = jm.caminho("_", "_", true);
    }

    // 3. para onde cada resultado leva
    for (const { n, op } of escolhas) {
      for (const [k, tipo] of [["sucesso", "sucesso"], ["falha", "falha"], ["resultado", "segue"]]) {
        const r = op.res && op.res[k];
        if (!r || !r.ir) continue;
        const alvo = ids[r.ir.startsWith("cena:") ? r.ir : "lugar:" + r.ir.slice(6)];
        if (alvo) lig(n.id, alvo, tipo);
        else r.irTexto = r.ir; // destino fora do diagrama: guarda como texto
        delete r.ir;
      }
    }
    // abertura → lugar inicial
    if (ids["cena:" + jm.inicio] && ids["lugar:" + jm.lugarInicial]) m.jogo.inicio = ids["cena:" + jm.inicio];
    window.fraseAleatoria = fraseOriginal;
    return m;
  }

  // tira chaves vazias (undefined) de um objeto, recursivamente
  function limpar(o) {
    if (Array.isArray(o)) return o.map(limpar);
    if (!o || typeof o !== "object") return o;
    const s = {};
    for (const [k, v] of Object.entries(o)) if (v !== undefined) s[k] = limpar(v);
    return s;
  }

  // ======================= Exportar: o projeto vira missão do jogo =======================
  // (o motor ainda precisa aprender variantes/acréscimos e o desbloqueio: vem com o Publicar)

  function exportar(m) {
    const no = (id) => m.nos.find((n) => n.id === id);
    const saidas = (id) => m.ligacoes.filter((l) => l.de === id);
    const porY = (a, b) => a.y - b.y || a.x - b.x;
    const escolhasDe = (id) => saidas(id).map((l) => no(l.para)).filter((n) => n && n.tipo === "escolha").sort(porY);
    const destinoDe = (n) => (n.tipo === "lugar" ? "lugar:" : "cena:") + n.d.chave;
    const opcao = (e) => {
      const d = e.d;
      const op = limpar({ id: d.id || undefined, texto: e.titulo, textoVariantes: d.botaoVariantes?.length ? d.botaoVariantes : undefined, palavras: d.palavras, npc: d.npc, comum: d.comum, repetivel: d.repetivel, tempo: d.tempo, grupo: d.grupo, se: d.se, req: d.req, rodada: d.rodada });
      if (d.teste?.tipo === "convergencia") op.convergencia = d.teste.intensidade || 1;
      if (d.teste?.tipo === "situacao") op.situacao = d.teste.situacao;
      for (const [k, tipo] of [["sucesso", "sucesso"], ["falha", "falha"], ["resultado", "segue"]]) {
        const r = d.res && d.res[k];
        if (!r) continue;
        const l = saidas(e.id).find((x) => x.tipo === tipo && no(x.para) && no(x.para).tipo !== "escolha");
        op[k] = limpar({ ...r, ir: l ? destinoDe(no(l.para)) : r.irTexto, irTexto: undefined });
      }
      return op;
    };
    const jm = { id: m.jogo?.id || m.id, eixo: m.eixo, titulo: m.titulo, resumo: m.resumo, ...limpar({ subtitulo: m.jogo?.subtitulo, fase: m.jogo?.fase, faseTag: m.jogo?.faseTag, npcs: m.jogo?.npcs, anterior: m.jogo?.anterior || undefined, proxima: m.jogo?.proxima || undefined, desbloqueio: m.jogo?.desbloqueio, tutorial: m.jogo?.tutorial }), ...(m.jogo?.avancado || {}), cenas: {}, lugares: {} };
    for (const n of m.nos.filter((x) => ["entrada", "cena", "final"].includes(x.tipo) && x.d)) {
      const d = n.d;
      jm.cenas[d.chave] = limpar({ titulo: n.titulo, texto: d.texto, variantes: d.variantes, acrescimos: d.acrescimos, tutorial: d.tutorial, ameaca: d.ameaca, musica: d.musica, final: d.final, revela: d.revela, memoria: d.memoria, marca: d.marca, imagem: d.imagem, decifrar: d.decifrar?.palavras?.length ? d.decifrar : undefined, opcoes: escolhasDe(n.id).map(opcao) });
      if (n.tipo === "entrada" && !jm.inicio) jm.inicio = d.chave;
      if (d.final && d.textoFinal) jm.textoFinal = d.textoFinal;
    }
    const mapa = m.nos.find((x) => x.tipo === "mapa" && x.d);
    if (mapa) {
      const d = mapa.d;
      Object.assign(jm, limpar({ relogioMax: d.relogioMax, pistasParaMarco: d.pistasParaMarco, marcoTexto: d.marcoTexto, marcoDica: d.marcoDica, mapaDica: d.mapaDica, ambiente: d.ambiente, eventosRelogio: d.eventos }));
      if (d.centro?.nome) jm.centroMapa = { ...(jm.centroMapa || { x: 50, y: 50 }), nome: d.centro.nome };
      jm.emTodaParte = escolhasDe(mapa.id).map(opcao);
    }
    for (const n of m.nos.filter((x) => x.tipo === "lugar" && x.d)) {
      const d = n.d;
      jm.lugares[d.chave] = limpar({ nome: n.titulo, nomeVariantes: d.nomeVariantes, icone: d.icone, descricao: d.descricao, se: d.se, cidade: d.cidade, cidadePor: d.cidadePor, caminho: d.caminho, loja: d.loja?.nome ? d.loja : undefined, acoes: escolhasDe(n.id).map(opcao) });
      if (d.inicial) jm.lugarInicial = d.chave;
    }
    return jm;
  }

  // ======================= Treino do autor (tutorial jogável) =======================
  // Uma missão curta na Conveniência do Abe que mostra, com notas ao lado, como os 9
  // personagens falam diferente e como o NPC reage (classe, personagem, tendência, atitude).
  // Recriar = um projeto novo, igual ao original. No jogo, aparece na Mesa só para o autor.
  function tutorial() {
    const id = () => "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const m = {
      id: "m" + Date.now().toString(36), titulo: "Treino: nove vozes", eixo: "x", nos: [], ligacoes: [],
      resumo: "Uma conversa com o Abe, no balcão. Jogue com personagens diferentes e veja o que muda.",
      jogo: { id: "treino-vozes", tutorial: true, subtitulo: "Treino do autor", fase: "Treino", npcs: { abe: "Abe" }, anterior: "", proxima: "", desbloqueio: {} },
    };
    const bloco = (tipo, titulo, x, y, d, notas = "") => {
      const n = { id: id(), tipo, titulo, texto: "", condicao: "", efeitos: "", notas, x, y, ...(d ? { d } : {}) };
      m.nos.push(n);
      return n;
    };
    const nota = (titulo, texto, x, y) => bloco("nota", titulo, x, y, null, "").texto = texto;
    const lig = (a, b, tipo = "segue") => m.ligacoes.push({ id: "l" + id(), de: a.id, para: b.id, rotulo: "", tipo });

    const chegada = bloco("entrada", "O balcão do Abe", 0, 0, {
      chave: "chegada",
      texto: "{nome} empurra a porta da Conveniência do Abe. O sininho toca. O velho Abe levanta os olhos do jornal.\n\n“Fechando em dez minutos. O que vai ser?”",
      variantes: [
        { se: { classe: "tank" }, texto: "{nome} entra ocupando a porta inteira. O sininho toca duas vezes. Abe abaixa o jornal devagar.\n\n“Opa. Sem confusão hoje, tá? O que vai ser?”" },
        { se: { classe: "healer" }, texto: "{nome} entra e o Abe tosse, rápido, como quem esconde o cigarro atrás do balcão.\n\n“Ah, é você. Não vai me mandar parar de fumar de novo, vai? O que vai ser?”" },
      ],
      acrescimos: [{ se: { marca: ["salvou:Danny"] }, texto: "Num canto, o Danny acena para você. Pelo jeito do Abe, ele já contou o que você fez por ele." }],
    });

    const vozes = {
      "frank-brennan": "Um café preto, Abe. Forte como o da estação.",
      "rosa-delgado": "Café. E não me pergunte do meu dia.",
      "marcus-bell": "Um café pra viagem, rapidinho, que a moto tá ligada.",
      "denise-carter": "Café, por favor. É o quarto do dia, não conta pra ninguém.",
      "michael-doyle": "Um café, meu filho. Que Deus abençoe essa sua máquina.",
      "june-albright": "Um chá, querido. Café a essa hora me deixa elétrica.",
      "eli-navarro": "Café. Duplo. Eu calculei: preciso de duplo.",
      "tess-monroe": "O que tiver de mais forte. Entro no ar em uma hora.",
      "ray-okafor": "O de sempre, meu chapa.",
    };
    const cafe = bloco("escolha", "Pedir um café", 0, 260, {
      id: "treino-cafe", npc: "abe", teste: { tipo: "nenhum" }, tempo: 0,
      botaoVariantes: Object.entries(vozes).map(([pid, texto]) => ({ se: { pronto: pid }, texto })),
      res: { resultado: {
        texto: "Abe serve sem pressa. “Tá aqui. Três pratas.”", efeitos: { dinheiro: -3, condicao: "-cansaco" },
        variantes: [
          { se: { tendencia: "heroi" }, texto: "Abe serve e empurra um biscoito junto. “Por conta da casa. Gente como você faz falta nesta cidade.”", efeitos: { dinheiro: 3, atitude: { abe: 1 } } },
          { se: { tendencia: "vilao" }, texto: "Abe serve sem olhar nos seus olhos e conta o troco duas vezes.", efeitos: { atitude: { abe: -1 } } },
          { se: { tendencia: "anti-heroi" }, texto: "Abe serve e espera você pagar primeiro. “Nada pessoal.”" },
        ],
      } },
    });
    const ameaca = bloco("escolha", "Levar o caixa “emprestado”", 0, 470, {
      id: "treino-ameaca", npc: "abe", teste: { tipo: "nenhum" }, se: { tendencia: "vilao" },
      botaoVariantes: [{ se: { classe: "tank" }, texto: "Encostar no balcão até ele estalar" }],
      res: { resultado: { texto: "Abe abre o caixa sem tirar os olhos de você.\n\n“Leva. Mas não volta aqui.”", efeitos: { dinheiro: 40, atitude: { abe: -3 }, marca: ["roubou-o-abe"] } } },
    });
    const remedio = bloco("escolha", "Perguntar se ele tomou o remédio da pressão", 0, 680, {
      id: "treino-remedio", npc: "abe", teste: { tipo: "nenhum" }, se: { classe: "healer" },
      res: { resultado: { texto: "Abe ri, sem graça. “Tomei. Tomei, sim.” Ele não tomou. Mas agora vai.", efeitos: { atitude: { abe: 2 } },
        variantes: [
          { se: { pronto: "denise-carter" }, texto: "Abe ri, sem graça. “Tomei, doutora. Tomei, sim.” Ele não tomou. Mas agora vai." },
          { se: { pronto: "michael-doyle" }, texto: "Abe ri, sem graça. “Tomei, padre. Juro.” E faz o sinal da cruz, por via das dúvidas." },
          { se: { pronto: "june-albright" }, texto: "Abe abaixa a cabeça. “A senhora parece a minha falecida. Tomo agora, June. Agora mesmo.”" },
        ] } },
    });
    const fiado = bloco("escolha", "Pedir para pendurar umas compras", 0, 890, {
      id: "treino-fiado", npc: "abe", teste: { tipo: "situacao", situacao: "convencer" },
      res: {
        sucesso: { texto: "Abe abre o caderno de fiado e anota o seu nome. “Até sexta, hein.”", efeitos: { pertence: { comida: 2 } } },
        falha: { texto: "“Fiado só amanhã”, diz o Abe, apontando a plaquinha. Hoje é sempre hoje.",
          variantes: [{ se: { atitudeMin: { abe: 1 } }, texto: "“Fiado só amanhã…” Abe olha para você, suspira e anota mesmo assim. “Pra você, tudo bem.”", efeitos: { pertence: { comida: 2 } } }] },
      },
    });
    const fim = bloco("final", "Hora de fechar", 760, 300, {
      chave: "despedida", final: true,
      texto: "Abe vira a plaquinha para FECHADO e apaga metade das luzes.",
      variantes: [
        { se: { atitudeMin: { abe: 1 } }, texto: "Abe grita da porta: “Volta amanhã! Guardo um pão pra você.” E fica olhando até você virar a esquina." },
        { se: { atitudeMax: { abe: -1 } }, texto: "Abe tranca a porta antes de você chegar na calçada. Ele vai lembrar disso." },
      ],
      textoFinal: "Fim do treino. Jogue de novo com outro personagem e veja o que muda. A atitude do Abe fica guardada no personagem: jogando com o mesmo, o Abe lembra.",
    });
    for (const e of [cafe, ameaca, remedio, fiado]) lig(chegada, e);
    lig(cafe, fim); lig(ameaca, fim); lig(remedio, fim);
    lig(fiado, fim, "sucesso"); lig(fiado, fim, "falha");

    // as notas: como cada coisa foi feita
    nota("1 · Texto que muda por classe", "Toque em “O balcão do Abe”. No texto da cena, “+ Variação” com a condição “só esta classe”. Tank e Healer têm entrada própria; os outros veem o texto principal.\n\nEmbaixo, um “+ Acréscimo”: um parágrafo a mais só para quem tem a marca salvou:Danny.", -420, -40);
    nota("2 · Nove vozes no mesmo botão", "Toque em “Pedir um café”. Em “Cada personagem diz do seu jeito” há 9 variações, uma por personagem (“só este personagem”). O botão que o jogador vê é a fala dele.", -420, 250);
    nota("3 · O NPC reage pela tendência", "Ainda em “Pedir um café”, no Resultado: variações com “só esta tendência”. O herói ganha o café e +1 de atitude com o Abe; o vilão, −1.\n\nDefina as tendências em ⋯ → Personagens e tendências (e publique) para ver no jogo.", -420, 470);
    nota("4 · Escolhas que só alguns veem", "“Levar o caixa” só aparece para vilões (Só aparece se… → só esta tendência). “O remédio da pressão” só para Healers, e o Michael tem uma resposta própria.", -420, 690);
    nota("5 · Atitude: o NPC lembra", "Efeito “atitude do NPC” (abe:1). Depois, a condição “NPC gosta pelo menos (abe:1)” muda a falha de “Pendurar umas compras” e a despedida. A atitude fica no personagem, de missão em missão.", -420, 900);
    nota("6 · Jogar e jogar de novo", "Publique (⋯ → Publicar no jogo). No jogo, a Mesa mostra “Treino do autor” para quem abriu o Criador neste aparelho. Jogue com o Frank, depois com a Denise e a June: a conversa muda. Para recomeçar o treino do zero aqui: ⋯ → Criar o treino de novo.", 380, 620);
    return m;
  }

  // ======================= Conferir antes de publicar =======================
  // erros: o jogo não roda assim · avisos: roda, mas talvez não seja o que você quer
  function validar(m) {
    const erros = [], avisos = [];
    const no = (id) => m.nos.find((n) => n.id === id);
    const nome = (n) => `“${n.titulo || "(sem título)"}”`;
    if (!m.jogo?.id) erros.push("A missão não tem “Id no jogo” (menu ⋯).");
    const cenas = m.nos.filter((n) => ["entrada", "cena", "final"].includes(n.tipo) && n.d);
    if (!m.nos.some((n) => n.tipo === "entrada" && n.d)) erros.push("Falta um bloco de Abertura (a primeira cena).");
    if (!cenas.some((n) => n.d.final)) avisos.push("Nenhuma cena encerra a missão (marque “esta cena encerra a missão” no final).");
    const chaves = {};
    for (const n of m.nos.filter((x) => x.d && (x.d.chave || x.tipo === "escolha"))) {
      const k = n.tipo === "escolha" ? "e:" + (n.d.id || n.id) : (n.tipo === "lugar" ? "l:" : "c:") + n.d.chave;
      if (chaves[k] && n.tipo !== "escolha") erros.push(`Dois blocos com o mesmo id no jogo: ${nome(n)} e ${nome(chaves[k])}.`);
      chaves[k] = n;
    }
    for (const n of cenas) {
      if (!String(n.d.texto || "").trim() && !(n.d.variantes || []).length) avisos.push(`A cena ${nome(n)} está sem texto.`);
      const filhos = m.ligacoes.filter((l) => l.de === n.id && no(l.para)?.tipo === "escolha");
      if (!filhos.length && !n.d.final && !n.d.decifrar?.palavras?.length && !m.ligacoes.some((l) => l.de === n.id && no(l.para)?.tipo === "lugar"))
        avisos.push(`A cena ${nome(n)} não tem escolhas: o jogador fica preso nela.`);
    }
    for (const e of m.nos.filter((x) => x.tipo === "escolha" && x.d)) {
      const pai = m.ligacoes.some((l) => l.para === e.id && ["entrada", "cena", "final", "lugar", "mapa"].includes(no(l.de)?.tipo));
      if (!pai) erros.push(`A escolha ${nome(e)} não pertence a nenhuma cena ou lugar (ligue uma cena a ela).`);
      const t = e.d.teste?.tipo || "nenhum";
      const res = e.d.res || {};
      if (t !== "nenhum" && (!res.sucesso || !res.falha)) erros.push(`A escolha ${nome(e)} tem teste, mas falta o resultado de sucesso ou de falha.`);
      if (t === "nenhum" && !res.resultado) erros.push(`A escolha ${nome(e)} não tem resultado.`);
      if (t === "situacao" && !e.d.teste.situacao) erros.push(`A escolha ${nome(e)} tem teste de dados sem situação.`);
    }
    for (const n of m.nos.filter((x) => x.d)) {
      for (const v of [...(n.d.botaoVariantes || []), ...(n.d.nomeVariantes || [])]) {
        if (!String(v.texto || "").trim()) avisos.push(`${nome(n)} tem uma variação sem texto.`);
        if (!v.se || !Object.keys(v.se).length) avisos.push(`${nome(n)} tem uma variação sem condição (vale sempre).`);
      }
    }
    const lugares = m.nos.filter((n) => n.tipo === "lugar" && n.d);
    if (lugares.length && !lugares.some((n) => n.d.inicial)) avisos.push("Nenhum lugar está marcado como “a missão começa aqui”.");
    if (lugares.length && !m.nos.some((n) => n.tipo === "mapa")) avisos.push("Há lugares, mas falta o bloco de Exploração (relógio e acontecimentos).");
    return { erros, avisos };
  }

  // ======================= Publicar no jogo =======================
  // No PC com o servidor do projeto: grava site/missoes/ (depois, publicar.sh leva para o site).
  // Em qualquer aparelho: grava direto no GitHub do jogo (branches main e gh-pages), com o token
  // da ☁. O token precisa ter acesso ao repositório do jogo, além do privado.
  const b64 = (t) => {
    const bytes = new TextEncoder().encode(t);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  const deB64 = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, "")), (c) => c.charCodeAt(0)));

  // tendencias: { "frank-brennan": "heroi", … } (definidas em ⋯ → Personagens e tendências)
  async function publicar(m, { repo = "Lingua-Byte/kosmos", aviso = () => {}, tendencias = {} } = {}) {
    const jm = exportar(m);
    const texto = JSON.stringify(jm, null, 2) + "\n";
    const pers = JSON.stringify({ tendencias }, null, 2) + "\n";
    // 1. servidor do projeto no PC
    try {
      if ((await fetch("__versao", { cache: "no-store" })).ok) {
        const r = await fetch("__missao", { method: "POST", headers: { "Content-Type": "application/json" }, body: texto });
        await fetch("__missao", { method: "POST", headers: { "Content-Type": "application/json" }, body: pers });
        if (r.ok) return { onde: "pc", id: jm.id };
      }
    } catch {}
    // 2. GitHub do jogo
    const c = typeof Nuvem !== "undefined" && Nuvem.config();
    if (!c) throw new Error("conecte a ☁ (na Oficina) para publicar deste aparelho");
    const cab = { Authorization: `Bearer ${c.token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    const url = (caminho) => `https://api.github.com/repos/${repo}/contents/${caminho}`;
    async function ler(caminho, ref) {
      const r = await fetch(`${url(caminho)}?ref=${ref}&t=${Date.now()}`, { headers: cab, cache: "no-store" });
      if (r.status === 404) return null;
      if (!r.ok) throw erroGitHub(r.status);
      return r.json();
    }
    async function gravar(caminho, conteudo, ref) {
      const atual = await ler(caminho, ref);
      const r = await fetch(url(caminho), {
        method: "PUT", headers: { ...cab, "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Missão publicada pelo Criador: ${jm.id}`, content: b64(conteudo), branch: ref, ...(atual ? { sha: atual.sha } : {}) }),
      });
      if (!r.ok) throw erroGitHub(r.status);
    }
    for (const [ref, pasta] of [["main", "site/missoes/"], ["gh-pages", "missoes/"]]) {
      aviso(`Gravando em ${ref}…`);
      await gravar(`${pasta}${jm.id}.json`, texto, ref);
      const atualPers = await ler(`${pasta}personagens.json`, ref);
      if (!atualPers || deB64(atualPers.content) !== pers) await gravar(`${pasta}personagens.json`, pers, ref);
      const ind = await ler(`${pasta}indice.json`, ref);
      const ids = ind ? JSON.parse(deB64(ind.content)) : [];
      if (!ids.includes(jm.id)) {
        ids.push(jm.id);
        await gravar(`${pasta}indice.json`, JSON.stringify(ids, null, 2) + "\n", ref);
      }
    }
    return { onde: "github", id: jm.id };
  }
  function erroGitHub(status) {
    const e = new Error({
      401: "o token não é válido (ou expirou)",
      403: "o token não tem permissão de escrever no repositório do jogo",
      404: "o token não tem acesso ao repositório do jogo",
      409: "o arquivo mudou no meio do caminho; tente de novo",
    }[status] || `erro ${status} do GitHub`);
    e.status = status;
    return e;
  }

  return { painel, aplicar, acrescentar, tirar, tirarItem, novoItem, dadosNovos, importar, exportar, validar, publicar, tutorial, rotuloTeste, pegar, PRONTOS_IDS, TENDENCIAS, NOME_TENDENCIA, nomePronto };
})();
