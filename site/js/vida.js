// Vida comum: dinheiro, pertences e condições do personagem (dados em data.js).
// Usado pelas missões (comprar, ganhar, gastar, comer, dormir…) e pela ficha.

const Vida = (() => {
  // Fichas antigas não tinham carteira nem bolsa
  function garantir(p) {
    if (!p.dinheiro) p.dinheiro = { ...DINHEIRO_INICIAL };
    if (!p.pertences) p.pertences = {};
    if (!p.condicoes) p.condicoes = [];
    return p;
  }

  const pertence = (chave) => PERTENCES.find((x) => x.chave === chave);
  const nome = (chave, eixo) => pertence(chave)?.nomes[eixo] || chave;
  const dinheiroTexto = (eixo, v) => MOEDAS[eixo].formato(v);
  const naBolsa = (p) => Object.values(garantir(p).pertences).reduce((s, n) => s + n, 0);
  const tem = (p, chave) => (garantir(p).pertences[chave] || 0) > 0;

  function ganhar(p, chave, qtd = 1) {
    garantir(p);
    const cabe = Math.min(qtd, BOLSA_MAX - naBolsa(p));
    if (cabe <= 0) return 0;
    p.pertences[chave] = (p.pertences[chave] || 0) + cabe;
    return cabe;
  }

  function tirar(p, chave, qtd = 1) {
    garantir(p);
    p.pertences[chave] = Math.max(0, (p.pertences[chave] || 0) - qtd);
    if (!p.pertences[chave]) delete p.pertences[chave];
  }

  function mudarDinheiro(p, eixo, valor) {
    garantir(p);
    p.dinheiro[eixo] = Math.max(0, (p.dinheiro[eixo] || 0) + valor);
  }

  // condicao("fome") põe · condicao("-fome") tira. Devolve a linha do que mudou (ou "")
  function condicao(p, cod) {
    garantir(p);
    const tirarC = cod.startsWith("-");
    const c = tirarC ? cod.slice(1) : cod;
    if (!CONDICOES[c]) return "";
    const tinha = p.condicoes.includes(c);
    if (tirarC && tinha) {
      p.condicoes = p.condicoes.filter((x) => x !== c);
      return `Não está mais: ${CONDICOES[c].nome.toLowerCase()}`;
    }
    if (!tirarC && !tinha) {
      p.condicoes.push(c);
      return `${CONDICOES[c].nome} (−1 dado até resolver)`;
    }
    return "";
  }

  // Usa um pertence: aplica o efeito e devolve as linhas do que aconteceu
  function usar(p, chave, eixo) {
    const it = pertence(chave);
    if (!it || !tem(p, chave)) return [];
    tirar(p, chave);
    const linhas = [`${it.nomes[eixo]}: ${it.efeito}`];
    for (const c of it.tira || []) {
      const l = condicao(p, "-" + c);
      if (l) linhas.push(l);
    }
    for (const c of it.poe || []) {
      const l = condicao(p, c);
      if (l) linhas.push(l);
    }
    if (it.dissonancia) p.dissonancia = Math.max(0, p.dissonancia + it.dissonancia);
    if (it.renovarItens) for (const k of Object.keys(p.usos)) if (EQUIPAMENTOS.some((e) => e.chave === k)) delete p.usos[k];
    return linhas;
  }

  // oferta: { pertence: "comida" } ou { equip: "kit_medico" }; preço do eixo
  function preco(oferta, eixo) {
    if (oferta.preco != null) return oferta.preco;
    if (oferta.pertence) return pertence(oferta.pertence).preco[eixo];
    return PRECO_EQUIPAMENTO[oferta.equip][eixo];
  }

  function nomeOferta(oferta, eixo) {
    return oferta.pertence ? nome(oferta.pertence, eixo) : Regras.equip(oferta.equip).nomes[eixo];
  }

  // Devolve o motivo de não poder comprar, ou "" se pode
  function podeComprar(p, oferta, eixo) {
    garantir(p);
    if (p.dinheiro[eixo] < preco(oferta, eixo)) return "dinheiro não dá";
    if (oferta.pertence && naBolsa(p) >= BOLSA_MAX) return "bolsa cheia";
    if (oferta.equip && p.itens.includes(oferta.equip)) return "você já tem";
    if (oferta.equip && Regras.carga(p) + Regras.equip(oferta.equip).peso > Regras.cargaMax(p)) return "carga cheia";
    return "";
  }

  function comprar(p, oferta, eixo) {
    const motivo = podeComprar(p, oferta, eixo);
    if (motivo) return { erro: motivo };
    mudarDinheiro(p, eixo, -preco(oferta, eixo));
    if (oferta.pertence) ganhar(p, oferta.pertence);
    else Regras.alternar(p, "item", oferta.equip);
    return { linha: `Comprou: ${nomeOferta(oferta, eixo)} (−${dinheiroTexto(eixo, preco(oferta, eixo))})` };
  }

  return { garantir, pertence, nome, dinheiroTexto, naBolsa, tem, ganhar, tirar, mudarDinheiro, condicao, usar, preco, nomeOferta, podeComprar, comprar };
})();
