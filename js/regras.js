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
      return "";
    }
    if (tipo === "hab" && pontosGastos(p) + hab(chave).custo > LIMITES.pontosHabilidade)
      return "Pontos de habilidade insuficientes.";
    if (tipo === "item" && carga(p) + equip(chave).peso > cargaMax(p))
      return "Carga cheia. Mais Corpo = mais carga.";
    lista.push(chave);
    return "";
  }

  // ---------- Usos ----------

  function usoMax(it) {
    if (it.usos === "passiva") return Infinity;
    return it.usos.cena || it.usos.sessao;
  }

  function usosRestantes(p, chave) {
    const it = chave === "estudo" ? { usos: RUNAS_CARTAS.estudo.usos } : item(chave);
    return usoMax(it) - (p.usos[chave] || 0);
  }

  function consumir(p, chave) {
    p.usos[chave] = (p.usos[chave] || 0) + 1;
  }

  // "cena" renova só o que é por cena; "sessao" renova tudo
  function renovar(p, periodo) {
    for (const chave of Object.keys(p.usos)) {
      const it = chave === "estudo" ? { usos: RUNAS_CARTAS.estudo.usos } : item(chave);
      if (periodo === "sessao" || (it && it.usos.cena)) delete p.usos[chave];
    }
  }

  function textoUsos(it) {
    if (it.usos === "passiva") return "passiva";
    if (it.usos.cena) return `${it.usos.cena}× por cena`;
    return `${it.usos.sessao}× por sessão`;
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
    return limiaresAtivos(p)
      .filter((l) => l.dados && l.dados[atributo])
      .map((l) => ({ fonte: l.nome, dados: l.dados[atributo], trilha: l.trilha }));
  }

  function dificuldadeConvergencia(p) {
    return CONVERGENCIA.dificuldade + limiaresAtivos(p).reduce((s, l) => s + (l.convergenciaDif || 0), 0);
  }

  function sinaisDaoDissonancia(p) {
    return limiaresAtivos(p).some((l) => l.sinaisDissonancia);
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
    if (p.habs) return p;
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
    return p;
  }

  return {
    hab, equip, item,
    pontosGastos, carga, cargaMax, alternar,
    usosRestantes, consumir, renovar, textoUsos,
    limiaresAtivos, bloqueado, modificadores, dificuldadeConvergencia, sinaisDaoDissonancia, fimDeJogo, aplicarLimiares,
    modTracos, chance, rotuloChance, sugestoes,
    cartasViradas, virarRuna, podeAprenderRuna, aplicarAlfabetoDaClasse,
    migrar,
  };
})();
