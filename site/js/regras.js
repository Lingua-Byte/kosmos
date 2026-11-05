// Motor de regras: custos, limites, usos, efeitos de Ressonância/Dissonância e cartas de runa.
// Tudo que muda a ficha por regra passa por aqui — a interface só pede.

const Regras = (() => {
  const hab = (chave) => HABILIDADES.find((h) => h.chave === chave);
  const equip = (chave) => EQUIPAMENTOS.find((e) => e.chave === chave);
  const item = (chave) => hab(chave) || equip(chave);

  // ---------- Custos e limites ----------

  function pontosGastos(p) {
    return p.habs.reduce((s, c) => s + hab(c).custo, 0);
  }

  function carga(p) {
    return p.itens.reduce((s, c) => s + equip(c).peso, 0);
  }

  function cargaMax(p) {
    return LIMITES.cargaBase + p.atributos.corpo;
  }

  // Liga/desliga uma habilidade ou item respeitando o orçamento. Devolve um aviso se não couber.
  function alternar(p, tipo, chave) {
    const lista = tipo === "hab" ? p.habs : p.itens;
    const i = lista.indexOf(chave);
    if (i >= 0) {
      lista.splice(i, 1);
      if (tipo === "item" && p.cargas) delete p.cargas[chave];
      return "";
    }
    if (tipo === "hab" && pontosGastos(p) + hab(chave).custo > LIMITES.pontosHabilidade)
      return "Pontos de habilidade insuficientes.";
    if (tipo === "item" && carga(p) + equip(chave).peso > cargaMax(p))
      return "Carga cheia. Mais Corpo = mais carga.";
    lista.push(chave);
    if (tipo === "item") (p.cargas = p.cargas || {})[chave] = equip(chave).usos;
    return "";
  }

  // ---------- Itens: cada um tem usos, e os usos acabam ----------
  // p.itens: as chaves dos equipamentos (como sempre) · p.cargas: { chave: usos que restam }.

  // Fichas antigas não tinham cargas: cada item começa cheio. Os usos antigos de equipamento (por cena/sessão) saem.
  function garantirCargas(p) {
    if (!p.itens) p.itens = [];
    if (!p.cargas || typeof p.cargas !== "object") p.cargas = {};
    p.itens = p.itens.filter((c, i) => equip(c) && p.itens.indexOf(c) === i);
    for (const c of p.itens) if (!(c in p.cargas)) p.cargas[c] = equip(c).usos;
    for (const c of Object.keys(p.cargas)) if (!p.itens.includes(c)) delete p.cargas[c];
    for (const c of Object.keys(p.usos || {})) if (equip(c)) delete p.usos[c];
    return p.cargas;
  }

  function cargas(p, chave) {
    return garantirCargas(p)[chave] || 0;
  }

  // O item está com o personagem e ainda tem uso? (a lanterna apagada não ilumina a escada)
  function funciona(p, chave) {
    return (p.itens || []).includes(chave) && cargas(p, chave) > 0;
  }

  // Gasta usos de um item. O consumível que zera some; o resto fica, sem efeito, até recarregar ou achar outro.
  function gastarItem(p, chave, n = 1) {
    garantirCargas(p);
    if (!p.itens.includes(chave)) return "";
    p.cargas[chave] = Math.max(0, p.cargas[chave] - n);
    if (p.cargas[chave] > 0) return "";
    if (equip(chave).consumivel) {
      p.itens = p.itens.filter((x) => x !== chave);
      delete p.cargas[chave];
      return "acabou";
    }
    return "zerou";
  }

  // Ganhar um item (achado numa missão ou comprado). Quem já tem um enche os usos dele.
  // Devolve { erro } | { recarregou: true } | {}
  function darItem(p, chave) {
    const e = equip(chave);
    if (!e) return { erro: "item desconhecido" };
    garantirCargas(p);
    if (p.itens.includes(chave)) {
      p.cargas[chave] = e.usos;
      return { recarregou: true };
    }
    if (carga(p) + e.peso > cargaMax(p)) return { erro: "carga cheia" };
    p.itens.push(chave);
    p.cargas[chave] = e.usos;
    return {};
  }

  // Bateria, óleo, célula de energia ou uma tomada: enche os itens que recarregam. Devolve as chaves recarregadas.
  function recarregar(p) {
    garantirCargas(p);
    const feitos = [];
    for (const c of p.itens) {
      const e = equip(c);
      if (e.recarga === "bateria" && p.cargas[c] < e.usos) {
        p.cargas[c] = e.usos;
        feitos.push(c);
      }
    }
    return feitos;
  }

  // Equipamento pode ser trocado na ficha só antes da primeira missão (e nunca nos personagens prontos)
  function equipamentoFixo(p) {
    const emMissao = typeof Cenas !== "undefined" && p.id && Cenas.emAndamento(p.id);
    return Boolean(p.pronto || p.jaJogou || (p.concluidas || []).length || emMissao);
  }

  // ---------- Usos de habilidades (e do que se renova por missão) ----------
  // Os que não são habilidade nem item: o estudo de runa (por cena) e o Pressentimento (Ressonância 15, por missão)
  const ESPECIAIS = {
    estudo: () => ({ usos: RUNAS_CARTAS.estudo.usos }),
    pressentimento: () => ({ usos: { sessao: 1 } }),
  };
  const comUsos = (chave) => (ESPECIAIS[chave] ? ESPECIAIS[chave]() : item(chave));

  function usoMax(it) {
    if (!it) return 0;
    if (it.usos === "passiva") return Infinity;
    if (typeof it.usos === "number") return it.usos;
    return it.usos.cena || it.usos.sessao;
  }

  function usosRestantes(p, chave) {
    if (equip(chave)) return cargas(p, chave);
    return usoMax(comUsos(chave)) - ((p.usos || {})[chave] || 0);
  }

  function consumir(p, chave) {
    if (equip(chave)) return gastarItem(p, chave);
    p.usos = p.usos || {};
    p.usos[chave] = (p.usos[chave] || 0) + 1;
    return "";
  }

  // "cena" renova o que é por cena (numa missão: cada cena da história ou troca de lugar);
  // "sessao" renova tudo o que é das habilidades (no começo de cada missão). Itens não se renovam aqui.
  function renovar(p, periodo) {
    p.usos = p.usos || {};
    for (const chave of Object.keys(p.usos)) {
      if (equip(chave)) continue;
      const it = comUsos(chave);
      if (periodo === "sessao" || (it && it.usos && it.usos.cena)) delete p.usos[chave];
    }
  }

  function textoUsos(it) {
    if (it.usos === "passiva") return "passiva";
    if (typeof it.usos === "number")
      return `${it.usos} uso${it.usos > 1 ? "s" : ""}${it.recarga ? " · bateria" : it.consumivel ? " · acaba" : ""}`;
    if (it.usos.cena) return `${it.usos.cena}× por cena`;
    return `${it.usos.sessao}× por missão`;
  }

  // Alívios de Dissonância com limite por missão (dormir, calmante). Devolve true se ainda vale, e conta.
  function alivio(p, fonte, max) {
    p.usos = p.usos || {};
    const k = "alivio:" + fonte;
    if ((p.usos[k] || 0) >= max) return false;
    p.usos[k] = (p.usos[k] || 0) + 1;
    return true;
  }

  // Muda Ressonância e Dissonância respeitando os limites (0 a 30; a Ressonância comum para no 29).
  // Devolve quanto mudou de verdade.
  function mudarRes(p, n) {
    const antes = p.ressonancia || 0;
    if (n > 0) p.ressonancia = Math.max(antes, Math.min(REGRAS.ressonanciaTeto, antes + n));
    else p.ressonancia = Math.max(0, antes + n);
    return p.ressonancia - antes;
  }

  function mudarDis(p, n) {
    const antes = p.dissonancia || 0;
    p.dissonancia = Math.max(0, Math.min(REGRAS.ressonanciaMax, antes + n));
    return p.dissonancia - antes;
  }

  // ---------- Ressonância e Dissonância ----------

  function limiaresAtivos(p) {
    return [
      ...RESSONANCIA_LIMIARES.filter((l) => p.ressonancia >= l.em).map((l) => ({ ...l, trilha: "res" })),
      ...DISSONANCIA_LIMIARES.filter((l) => p.dissonancia >= l.em).map((l) => ({ ...l, trilha: "dis" })),
    ];
  }

  function bloqueado(p, chave) {
    return limiaresAtivos(p).some((l) => l.bloqueia === chave);
  }

  // Dados ganhos/perdidos automaticamente num teste daquele atributo
  function modificadores(p, atributo) {
    // condições do corpo (fome, cansaço…) também tiram dados até serem resolvidas
    const condicoes = (p.condicoes || []).map((c) => CONDICOES[c]).filter((c) => c && c.dados[atributo])
      .map((c) => ({ fonte: c.nome, dados: c.dados[atributo], trilha: "cond" }));
    return limiaresAtivos(p)
      .filter((l) => l.dados && l.dados[atributo])
      .map((l) => ({ fonte: l.nome, dados: l.dados[atributo], trilha: l.trilha }))
      .concat(condicoes);
  }

  function dificuldadeConvergencia(p) {
    return CONVERGENCIA.dificuldade + limiaresAtivos(p).reduce((s, l) => s + (l.convergenciaDif || 0), 0);
  }

  // Marcas que mexem num tipo de situação (ex.: Inquietação, −1 para convencer e acalmar)
  function modMarcasTags(p, tags) {
    const mods = [];
    for (const l of limiaresAtivos(p)) {
      if (!l.dadosTags) continue;
      const n = Object.entries(l.dadosTags).filter(([tag]) => tags.includes(tag)).reduce((s, [, v]) => s + v, 0);
      if (n) mods.push({ fonte: l.nome, dados: n, trilha: l.trilha });
    }
    return mods;
  }

  // Os sinais ◉ deste tipo de teste também marcam Dissonância? (Perda de Controle: só na Convergência)
  function sinaisDaoDissonancia(p, tipo) {
    return limiaresAtivos(p).some((l) => l.sinaisDissonancia === true || (l.sinaisDissonancia && l.sinaisDissonancia === tipo));
  }

  // Pressentimento (Ressonância 15): ainda pode rolar de novo um teste comum nesta missão?
  function podePressentir(p) {
    return limiaresAtivos(p).some((l) => l.rerrolar === "teste") && usosRestantes(p, "pressentimento") > 0;
  }

  function fimDeJogo(p) {
    return limiaresAtivos(p).find((l) => l.fim) || null;
  }

  // Aplica o que liga sozinho ao cruzar marcas. Devolve mensagens do que aconteceu.
  function aplicarLimiares(p) {
    const avisos = [];
    p.marcasVistas = p.marcasVistas || [];
    for (const l of limiaresAtivos(p)) {
      const id = l.trilha + l.em;
      if (p.marcasVistas.includes(id)) continue;
      p.marcasVistas.push(id);
      avisos.push(`${l.trilha === "res" ? "Ressonância" : "Dissonância"} ${l.em} — ${l.nome}: ${l.efeito}`);
      if (l.revela) {
        const oculto = ORDEM_EIXOS.find((id) => !p.revelados[id]);
        if (oculto) {
          p.revelados[oculto] = true;
          if (typeof Cinematica !== "undefined") Cinematica.primeiraVez(p, oculto);
          avisos.push(`Memória Cruzada: ${p.nome} lembra do ${EIXOS[oculto].nome} — ${EIXOS[oculto].mundo}.`);
        }
      }
    }
    return avisos;
  }

  // ---------- Traços ----------

  // Cada traço vale no máximo ±1 por teste, mesmo que várias tags combinem
  function modTracos(p, tags) {
    const mods = [];
    for (const nome of p.tracos) {
      const t = TRACOS.find((x) => x.nome === nome);
      if (!t) continue;
      if (t.bonus.some((tag) => tags.includes(tag))) mods.push({ fonte: t.nome, dados: 1, trilha: "traco" });
      else if (t.penalidade.some((tag) => tags.includes(tag))) mods.push({ fonte: t.nome, dados: -1, trilha: "traco-neg" });
    }
    return mods;
  }

  // ---------- Chance ----------

  // Probabilidade de tirar pelo menos k sucessos em n dados
  function chance(n, k) {
    const p = (DADOS.faces - DADOS.sucessoMin + 1) / DADOS.faces;
    let total = 0;
    let comb = 1;
    for (let i = 0; i <= n; i++) {
      if (i > 0) comb = (comb * (n - i + 1)) / i;
      if (i >= k) total += comb * p ** i * (1 - p) ** (n - i);
    }
    return total;
  }

  function rotuloChance(c) {
    return CHANCE_ROTULOS.find((r) => c >= r.min).nome;
  }

  // ---------- Sugestões pela descrição ----------

  function sugestoes(descricao) {
    const palavras = (descricao || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/[^a-z]+/);
    return HABILIDADES.filter((h) => h.pistas.some((pista) => palavras.some((w) => w.startsWith(pista)))).map((h) => h.chave);
  }

  // ---------- Runas como cartas ----------

  const runasUnicas = () => [...new Set([...Object.values(RUNAS), ...Object.keys(RUNAS_EXTRAS)])];

  function cartasViradas(p) {
    return Math.max(0, p.cartasRunas - p.runas.length);
  }

  function virarRuna(p) {
    if (cartasViradas(p) <= 0) return null;
    const restantes = runasUnicas().filter((r) => !p.runas.includes(r));
    if (!restantes.length) return null;
    const r = restantes[Math.floor(Math.random() * restantes.length)];
    p.runas.push(r);
    return r;
  }

  function podeAprenderRuna(p) {
    return p.cartasRunas < runasUnicas().length;
  }

  // ---------- Personagem novo / antigo ----------

  // No Eixo Y, a classe decide quanto do alfabeto rúnico o personagem já sabe:
  // Oráculo Rúnico (support) lê todas as runas; Paladino (healer) começa com metade das cartas;
  // Cavaleiro (tank) depende só da Mente. As palavras-runa, todos aprendem jogando.
  function aplicarAlfabetoDaClasse(p) {
    const todas = runasUnicas();
    if (p.papel === "support") {
      p.runas = todas.slice();
      p.cartasRunas = todas.length;
    } else if (p.papel === "healer") {
      p.cartasRunas = Math.max(p.cartasRunas || 0, Math.ceil(todas.length / 2));
    }
    p.vocabY = [...new Set([...(p.vocabY || []), ...Lingua.Yudur.inicial(p.papel)])];
    p.alfabetoPorClasse = true;
  }

  // Fichas antigas tinham habilidades e equipamentos em texto livre: converte o que reconhecer
  function migrar(p) {
    // Idade era texto livre: mantém só se for um número válido
    if (p.idade !== "" && !(+p.idade >= IDADE.min && +p.idade <= IDADE.max)) p.idade = "";
    if (!p.linguas) p.linguas = { x: [], z: [] };
    if (!p.alfabetoPorClasse && p.papel) aplicarAlfabetoDaClasse(p);
    if (!p.dinheiro) p.dinheiro = { ...DINHEIRO_INICIAL };
    if (!p.pertences) p.pertences = {};
    if (!p.condicoes) p.condicoes = [];
    if (!p.usos) p.usos = {};
    if (p.habs) {
      garantirCargas(p);
      return p;
    }
    p.habs = [];
    p.itens = [];
    p.usos = {};
    const norm = (t) => (t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const textoHab = norm((p.habilidades || []).join(" "));
    const textoEquip = norm(Object.values(p.equipamentos || {}).join(" "));
    for (const h of HABILIDADES)
      if (Object.values(h.nomes).some((n) => textoHab.includes(norm(n)))) alternar(p, "hab", h.chave);
    for (const e of EQUIPAMENTOS)
      if (Object.values(e.nomes).some((n) => textoEquip.includes(norm(n)))) alternar(p, "item", e.chave);
    // Antes as runas eram escolhidas livremente; agora a Mente decide e as cartas começam viradas
    p.cartasRunas = RUNAS_CARTAS.iniciais(p.atributos.mente);
    p.runas = [];
    garantirCargas(p);
    return p;
  }

  return {
    hab, equip, item,
    pontosGastos, carga, cargaMax, alternar,
    garantirCargas, cargas, funciona, gastarItem, darItem, recarregar, equipamentoFixo,
    usoMax, usosRestantes, consumir, renovar, textoUsos, alivio, mudarRes, mudarDis,
    limiaresAtivos, bloqueado, modificadores, modMarcasTags, dificuldadeConvergencia, sinaisDaoDissonancia, podePressentir, fimDeJogo, aplicarLimiares,
    modTracos, chance, rotuloChance, sugestoes,
    cartasViradas, virarRuna, podeAprenderRuna, aplicarAlfabetoDaClasse,
    migrar,
  };
})();
