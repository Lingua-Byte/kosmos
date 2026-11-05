// =====================================================================
// Motor de storylets e NPCs
// ---------------------------------------------------------------------
// Storylet = um pedaço de história que diz ONDE e QUANDO pode aparecer.
// O motor olha o estado do mundo (eixo, lugar, relógio, flags, atitude dos NPCs,
// Ressonância/Dissonância, itens) e sorteia, entre as storylets que cabem no momento,
// qual acontece. Escolhas mudam o estado, e o estado muda o que aparece depois:
// é daí que vem a sensação de mundo aberto, sem precisar escrever cada ramificação.
//
// Os dados (NPCs, storylets, tabelas dos geradores) vêm de dados/oficina.json,
// escritos na Oficina do Autor (oficina.html). Tudo aqui é dado simples (JSON):
//
// storylet = {
//   id, titulo, eixo ("x" | "y" | "z" | "lime" | "todos"), tipo ("side" | "evento" | "principal"),
//   npc: id do NPC principal (opcional),
//   onde: [lugares] (vazio = qualquer lugar),
//   quando: { relogioMin, relogioMax, flags: [precisa ter], semFlags: [não pode ter],
//             ressonanciaMin, dissonanciaMin, atitude: { npc: mínimo } },
//   peso: chance relativa de ser sorteada (0 = só aparece quando outra storylet leva até ela),
//   repetivel: pode acontecer de novo?,
//   texto: com marcadores {p.nome}, {npc.nome}, {npc.fala}, {npc:mabel.nome}...
//   opcoes: [{ texto, palavras, req: { item, hab, flag, res, dis },
//              situacao (teste) | convergencia (intensidade) | nenhum (sem teste),
//              resultado | sucesso + falha: { texto, pista, ir: "storylet:id",
//                efeitos: { ressonancia, dissonancia, exposicao, convergencia, item,
//                           flag (texto ou lista), tirarFlag, atitude: { npc: +n },
//                           memoria, aprenderX: [ids] } } }]
// }
//
// estado = { eixo, lugar, relogio, flags: [], atitudes: {}, feitas: [], pistas: [],
//            p: { nome, ressonancia, dissonancia, exposicao, itens: [], habs: [] } }
// =====================================================================

const Motor = (() => {
  // ---------- Sorte com semente (o mesmo número gera o mesmo NPC) ----------
  function sorte(semente = Date.now()) {
    let a = semente >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const um = (lista, rng = Math.random) => (lista && lista.length ? lista[Math.floor(rng() * lista.length)] : "");

  const lista = (v) => (Array.isArray(v) ? v : v ? [v] : []);

  // ---------- Quem é quem ----------
  function npc(mundo, id) {
    return (mundo.npcs || []).find((n) => n.id === id) || null;
  }

  function atitude(estado, id) {
    if (estado.atitudes && id in estado.atitudes) return estado.atitudes[id];
    return 0;
  }

  // ---------- Condições ----------
  // Devolve "" se a storylet pode acontecer agora, ou o motivo de não poder (útil na Oficina)
  function motivo(s, estado) {
    const q = s.quando || {};
    const p = estado.p || {};
    if (s.eixo && s.eixo !== "todos" && s.eixo !== estado.eixo) return `é do eixo ${s.eixo.toUpperCase()}`;
    if (lista(s.onde).length && !lista(s.onde).includes(estado.lugar)) return `só acontece em: ${lista(s.onde).join(", ")}`;
    if (!s.repetivel && (estado.feitas || []).includes(s.id)) return "já aconteceu";
    if (q.relogioMin != null && q.relogioMin !== "" && estado.relogio < +q.relogioMin) return `relógio abaixo de ${q.relogioMin}`;
    if (q.relogioMax != null && q.relogioMax !== "" && estado.relogio > +q.relogioMax) return `relógio acima de ${q.relogioMax}`;
    const falta = lista(q.flags).find((f) => !estado.flags.includes(f));
    if (falta) return `precisa de: ${falta}`;
    const sobra = lista(q.semFlags).find((f) => estado.flags.includes(f));
    if (sobra) return `não pode ter: ${sobra}`;
    if (q.ressonanciaMin && (p.ressonancia || 0) < +q.ressonanciaMin) return `Ressonância abaixo de ${q.ressonanciaMin}`;
    if (q.dissonanciaMin && (p.dissonancia || 0) < +q.dissonanciaMin) return `Dissonância abaixo de ${q.dissonanciaMin}`;
    for (const [id, min] of Object.entries(q.atitude || {})) if (atitude(estado, id) < +min) return `atitude de ${id} abaixo de ${min}`;
    return "";
  }

  function elegiveis(mundo, estado, { incluirPesoZero = false } = {}) {
    return (mundo.storylets || []).filter((s) => !motivo(s, estado) && (incluirPesoZero || +(s.peso ?? 1) > 0));
  }

  // Sorteio pelo peso: peso 3 aparece três vezes mais que peso 1
  function sortear(mundo, estado, rng = Math.random) {
    const opcoes = elegiveis(mundo, estado);
    const total = opcoes.reduce((t, s) => t + +(s.peso ?? 1), 0);
    let r = rng() * total;
    for (const s of opcoes) if ((r -= +(s.peso ?? 1)) < 0) return s;
    return null;
  }

  // ---------- Texto ----------
  // {p.nome} · {npc.nome} · {npc.fala} · {npc.papel} · {npc:mabel.nome} · {npc.eco.y}
  function preencher(texto, mundo, estado, s, rng = Math.random) {
    if (!texto) return "";
    const principal = s && s.npc ? npc(mundo, s.npc) : null;
    return String(texto).replace(/\{([^{}]+)\}/g, (inteiro, chave) => {
      let [alvo, ...resto] = chave.split(".");
      let campo = resto.join(".");
      let pessoa = null;
      if (alvo === "p") return (estado.p && estado.p[campo]) || inteiro;
      if (alvo === "npc") pessoa = principal;
      else if (alvo.startsWith("npc:")) pessoa = npc(mundo, alvo.slice(4));
      if (!pessoa) return inteiro;
      if (campo === "fala") return um(pessoa.falas, rng) || "...";
      if (campo.startsWith("eco.")) return (pessoa.ecos || {})[campo.slice(4)] || inteiro;
      return pessoa[campo] ?? inteiro;
    });
  }

  // ---------- Opções ----------
  function bloqueio(op, estado, nomes = {}) {
    const r = op.req || {};
    const p = estado.p || {};
    if (r.item && !(p.itens || []).includes(r.item)) return `requer ${nomes.item ? nomes.item(r.item) : r.item}`;
    if (r.hab && !(p.habs || []).includes(r.hab)) return `requer ${nomes.hab ? nomes.hab(r.hab) : r.hab}`;
    if (r.flag && !estado.flags.includes(r.flag)) return `requer: ${r.flag}`;
    if (r.res && (p.ressonancia || 0) < +r.res) return `requer Ressonância ${r.res}`;
    if (r.dis && (p.dissonancia || 0) < +r.dis) return `requer Dissonância ${r.dis}`;
    return "";
  }

  function tipoDeTeste(op) {
    if (op.convergencia) return "convergencia";
    if (op.situacao) return "teste";
    return "nenhum";
  }

  // Aplica o resultado de uma escolha ao estado e devolve o que mudou, em linhas legíveis
  function aplicar(res, estado, mundo) {
    res = res || {};
    const e = res.efeitos || {};
    const p = estado.p || (estado.p = {});
    const linhas = [];
    // Ressonância e Dissonância ficam entre 0 e 30 (a Ressonância comum para no 29, como no jogo)
    const tetos = typeof REGRAS !== "undefined" ? { ressonancia: REGRAS.ressonanciaTeto, dissonancia: REGRAS.ressonanciaMax } : {};
    const somar = (campo, nome) => {
      if (!+e[campo]) return;
      const antes = p[campo] || 0;
      let novo = Math.max(0, antes + +e[campo]);
      if (tetos[campo] != null && +e[campo] > 0) novo = Math.max(antes, Math.min(tetos[campo], novo));
      p[campo] = novo;
      if (novo !== antes) linhas.push(`${novo > antes ? "+" : ""}${novo - antes} ${nome}`);
    };
    somar("ressonancia", "Ressonância");
    somar("dissonancia", "Dissonância");
    somar("exposicao", "Exposição");
    for (const f of lista(e.flag)) if (!estado.flags.includes(f)) estado.flags.push(f);
    for (const f of lista(e.tirarFlag)) estado.flags = estado.flags.filter((x) => x !== f);
    for (const [id, n] of Object.entries(e.atitude || {})) {
      estado.atitudes = estado.atitudes || {};
      estado.atitudes[id] = atitude(estado, id) + +n;
      const quem = npc(mundo, id);
      linhas.push(`${quem ? quem.nome : id}: atitude ${+n > 0 ? "+" : ""}${n}`);
    }
    if (e.item && !(p.itens || []).includes(e.item)) {
      p.itens = [...(p.itens || []), e.item];
      linhas.push(`Ganhou: ${e.item}`);
    }
    if (lista(e.aprenderX).length) linhas.push(`Aprende no Código Urbano: ${lista(e.aprenderX).join(", ")}`);
    if (e.memoria) linhas.push("Nova Memória Cruzada");
    if (res.pista) {
      estado.pistas = estado.pistas || [];
      if (!estado.pistas.includes(res.pista)) estado.pistas.push(res.pista);
      linhas.push("Nova pista no Diário");
    }
    if (+e.convergencia) linhas.push(`Teste de Convergência · intensidade ${e.convergencia}`);
    const ir = res.ir && res.ir.startsWith("storylet:") ? res.ir.slice(9) : null;
    return { linhas, ir, convergencia: +e.convergencia || 0 };
  }

  function concluir(s, estado) {
    estado.feitas = estado.feitas || [];
    if (!estado.feitas.includes(s.id)) estado.feitas.push(s.id);
  }

  // ---------- Geradores ----------
  const EIXOS_NPC = ["x", "y", "z"];

  // NPC completo a partir das tabelas: nome, ofício, desejo, medo, segredo, relação com a Entidade
  // e um eco em cada um dos outros eixos (a mesma pessoa em outro mundo)
  function gerarNPC(tabelas, eixo, rng = Math.random) {
    const t = tabelas[eixo] || tabelas.x;
    const nome = um(t.nomes, rng);
    const oficio = um(t.oficios, rng);
    const ecos = {};
    for (const outro of EIXOS_NPC) if (outro !== eixo && tabelas[outro]) ecos[outro] = `${um(tabelas[outro].oficios, rng)}`;
    return {
      id: `${nome}-${Math.floor(rng() * 9000 + 1000)}`.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      nome,
      eixo,
      papel: oficio,
      aparencia: "",
      voz: "",
      desejo: um(tabelas.desejos, rng),
      medo: um(tabelas.medos, rng),
      segredo: um(tabelas.segredos, rng),
      entidade: um(tabelas.entidade, rng),
      ecos,
      onde: [um(t.lugares, rng)].filter(Boolean),
      atitude: 0,
      falas: [],
      notas: "Gerado pelo gerador. Escreva aparência, voz e falas para dar vida.",
    };
  }

  // Side quest: gancho + objetivo + complicação + revelação + recompensa
  function gerarMissao(tabelas, eixo, quem, rng = Math.random) {
    const m = {
      gancho: um(tabelas.ganchos, rng),
      objetivo: um(tabelas.objetivos, rng),
      complicacao: um(tabelas.complicacoes, rng),
      revelacao: um(tabelas.revelacoes, rng),
      recompensa: um(tabelas.recompensas, rng),
    };
    m.resumo = `${quem ? quem.nome + ": " : ""}${m.gancho}. Objetivo: ${m.objetivo}. Complicação: ${m.complicacao}. Revelação: ${m.revelacao}. Recompensa: ${m.recompensa}.`;
    return m;
  }

  // Rascunho de storylet a partir de uma missão gerada (o autor completa os textos)
  function rascunho(missao, eixo, quem) {
    const id = `${eixo}-${(quem ? quem.id : "missao")}-${Date.now().toString(36)}`;
    return {
      id,
      titulo: missao.gancho ? missao.gancho[0].toUpperCase() + missao.gancho.slice(1) : "Nova missão",
      eixo,
      tipo: "side",
      npc: quem ? quem.id : "",
      onde: quem ? lista(quem.onde) : [],
      quando: { semFlags: [`${id}-fim`] },
      peso: 1,
      texto: `${quem ? "{npc.nome} te procura. “{npc.fala}”\n\n" : ""}(${missao.gancho}. ${missao.complicacao}.)`,
      opcoes: [
        { texto: `${missao.objetivo[0].toUpperCase() + missao.objetivo.slice(1)}…`, palavras: [], situacao: "investigar",
          sucesso: { texto: `(Revelação: ${missao.revelacao}.)`, pista: "", efeitos: { flag: [`${id}-fim`] } },
          falha: { texto: "", efeitos: { flag: [`${id}-fim`], exposicao: 1 } } },
        { texto: "Recusar", palavras: ["recus", "nao"], resultado: { texto: "", efeitos: { flag: [`${id}-fim`] } } },
      ],
      notas: `Gerado: ${missao.resumo}`,
    };
  }

  return { sorte, um, npc, atitude, motivo, elegiveis, sortear, preencher, bloqueio, tipoDeTeste, aplicar, concluir, gerarNPC, gerarMissao, rascunho };
})();
