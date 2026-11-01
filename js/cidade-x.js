// =====================================================================
// O MAPA DE PORT HALDEN: os bairros e os lugares fixos da cidade, iguais em todas as missões.
// ---------------------------------------------------------------------
// · Cada lugar tem um id, nome, bairro e posição (x, y de 0 a 100) no mapa.
// · Cada personagem conhece uma parte da cidade (CONHECE: onde mora, onde trabalha, o que a
//   profissão faz conhecer). O resto ele descobre jogando: chegando lá, ou alguém contando
//   (efeito revela: ["id"] numa ação). O que ele conhece fica na ficha (p.mapa.x) para sempre.
// · As missões continuam com os seus lugares; LIGACOES diz qual lugar da cidade é cada um.
//   O lugar inicial "trabalho" do prólogo depende de quem joga (ORIGENS_X[...].cidade ou o ponto).
// · Lugar da missão que o personagem não conhece aparece como "?" e custa +1 no relógio
//   (achar o caminho). Os lugares conhecidos fora da missão aparecem apagados no mapa.
// As posições seguem três colunas (oeste 16, centro 50, leste 84) para os nomes não se encostarem.
// =====================================================================

const CIDADE_X = {
  nome: "Port Halden",
  centro: { x: 50, y: 50, nome: "Praça Central" },
  bairros: {
    universidade: { nome: "Universidade", x: 33, y: 11 },
    westside: { nome: "Westside", x: 33, y: 30 },
    distrito9: { nome: "9º Distrito", x: 33, y: 58 },
    docas: { nome: "Docas", x: 33, y: 85 },
    centro: { nome: "Centro", x: 67, y: 41 },
    maple: { nome: "Maple Heights", x: 67, y: 12 },
    midtown: { nome: "Midtown", x: 67, y: 55 },
    eastside: { nome: "Eastside", x: 67, y: 80 },
  },
  lugares: {
    // Universidade
    universidade: { nome: "Instituto de Física", bairro: "universidade", x: 50, y: 6, icone: "Σ" },
    laboratorio: { nome: "Laboratório de Radiação", bairro: "universidade", x: 50, y: 16, icone: "☢" },
    // Westside
    kphn: { nome: "Rádio KPHN", bairro: "westside", x: 16, y: 8, icone: "◖" },
    hollister: { nome: "Hollister & Crane", bairro: "westside", x: 16, y: 18, icone: "▤" },
    "distrito-4": { nome: "4º Distrito", bairro: "westside", x: 16, y: 29, icone: "★" },
    galeria: { nome: "Galeria da 5ª Avenida", bairro: "westside", x: 16, y: 40, icone: "⌂" },
    // 9º Distrito
    "delegacia-9": { nome: "Delegacia do 9º Distrito", bairro: "distrito9", x: 16, y: 52, icone: "★" },
    ginasio: { nome: "Ginásio Lincoln", bairro: "distrito9", x: 16, y: 64, icone: "▦" },
    // Docas
    harbor: { nome: "Harbor Street", bairro: "docas", x: 16, y: 78, icone: "⚓" },
    "st-brendans": { nome: "St. Brendan's", bairro: "docas", x: 16, y: 90, icone: "✝" },
    metro: { nome: "Estação Rua 9", bairro: "docas", x: 50, y: 80, icone: "Ⓜ" },
    "ponto-linha9": { nome: "Ponto de táxi da Linha 9", bairro: "docas", x: 50, y: 90, icone: "◘" },
    // Centro
    aurora: { nome: "Edifício Aurora", bairro: "centro", x: 50, y: 27, icone: "▲" },
    federal: { nome: "Prédio Federal", bairro: "centro", x: 50, y: 37, icone: "⊟", segredo: true },
    atlantico: { nome: "Atlantic Tower", bairro: "centro", x: 50, y: 61, icone: "▥" },
    cerca: { nome: "A cerca do centro", bairro: "centro", x: 50, y: 70, icone: "⊠", segredo: true },
    // Maple Heights
    casa: { nome: "Sua casa", bairro: "maple", x: 84, y: 6, icone: "⌂" },
    comunitario: { nome: "Centro comunitário", bairro: "maple", x: 84, y: 16, icone: "♣" },
    drogaria: { nome: "Drogaria Goodwell", bairro: "maple", x: 84, y: 27, icone: "✚" },
    abe: { nome: "Conveniência do Abe", bairro: "maple", x: 84, y: 37, icone: "$" },
    // Midtown
    "st-lukes": { nome: "St. Luke's Memorial", bairro: "midtown", x: 84, y: 49, icone: "✚" },
    "st-lukes-ps": { nome: "Pronto-socorro do St. Luke's", bairro: "midtown", x: 84, y: 59, icone: "✚" },
    // Eastside
    "estacao-9": { nome: "Estação 9 dos Bombeiros", bairro: "eastside", x: 84, y: 70, icone: "♨" },
    viaduto: { nome: "Viaduto Leste", bairro: "eastside", x: 84, y: 80, icone: "≋" },
    delancey: { nome: "Delancey Street", bairro: "eastside", x: 84, y: 90, icone: "▣", segredo: true },
  },
};

// Qual lugar da cidade é cada lugar das missões
const LIGACOES_X = {
  "prologo-x": {
    casa: "casa", hospital: "st-lukes", delegacia: "delegacia-9", metro: "metro", mercado: "abe",
    universidade: "universidade", aurora: "aurora", atlantico: "atlantico", viaduto: "viaduto", farmacia: "drogaria",
  },
  "x1-manha": { casa: "casa", racao: "ginasio", drogaria: "drogaria", hospital: "st-lukes", abe: "abe", cerca: "cerca" },
};

// Onde fica o "trabalho" de quem não é personagem pronto (pelo ponto de entrada da profissão)
const PONTO_CIDADE_X = {
  hospital: "st-lukes-ps", defesa: "delegacia-9", universidade: "laboratorio", comercio: "galeria",
  escritorio: "hollister", rua: "harbor", arte: "kphn", casa: "casa",
};

// O que cada personagem pronto já conhece da cidade antes de começar
const CONHECE_X = {
  todos: ["casa"],
  "frank-brennan": ["estacao-9", "viaduto", "delancey", "st-lukes", "abe", "delegacia-9"],
  "rosa-delgado": ["distrito-4", "delegacia-9", "harbor", "ginasio", "atlantico", "galeria"],
  "marcus-bell": ["harbor", "aurora", "hollister", "galeria", "abe", "drogaria", "kphn", "atlantico"],
  "denise-carter": ["st-lukes-ps", "st-lukes", "drogaria", "comunitario"],
  "michael-doyle": ["st-brendans", "harbor", "metro", "comunitario", "ginasio"],
  "june-albright": ["comunitario", "drogaria", "abe", "st-lukes"],
  "eli-navarro": ["laboratorio", "universidade", "metro", "abe"],
  "tess-monroe": ["kphn", "hollister", "galeria", "metro", "aurora"],
  // taxista há vinte anos: conhece a cidade inteira, menos o que é segredo
  "ray-okafor": "tudo",
};

const Cidade = (() => {
  const C = CIDADE_X;

  // onde fica, na cidade, o lugar de uma missão (o "trabalho" depende de quem abriu a partida)
  function idDe(m, lugarId, dono) {
    if (lugarId === "trabalho" && m.trabalho) {
      const t = m.trabalho(dono);
      return t.cidade || PONTO_CIDADE_X[t.ponto] || null;
    }
    return (LIGACOES_X[m.id] || {})[lugarId] || null;
  }

  const lugar = (id) => C.lugares[id] || null;

  // o mapa do personagem: começa com o que ele já conhece
  function garantir(p) {
    if (!p.mapa) p.mapa = {};
    if (!p.mapa.x) {
      const base = CONHECE_X[p.pronto];
      const ids = base === "tudo"
        ? Object.keys(C.lugares).filter((id) => !C.lugares[id].segredo)
        : [...CONHECE_X.todos, ...(base || [])];
      p.mapa.x = [...new Set(ids)];
    }
    return p.mapa.x;
  }

  const conhece = (p, id) => !!id && garantir(p).includes(id);

  // marca lugares como conhecidos; devolve os nomes dos novos
  function conhecer(p, ids) {
    const lista = garantir(p);
    const novos = [].concat(ids || []).filter((id) => C.lugares[id] && !lista.includes(id));
    lista.push(...novos);
    return novos.map((id) => C.lugares[id].nome);
  }

  // bairros: conhecido se o personagem conhece algum lugar dele
  function bairros(conhecidos) {
    return Object.entries(C.bairros).map(([id, b]) => ({
      ...b, id, conhecido: Object.entries(C.lugares).some(([lid, l]) => l.bairro === id && conhecidos.includes(lid)),
    }));
  }

  // o mapa fora das missões (na ficha): só o que o personagem conhece
  function mapaDaFicha(p) {
    const ids = garantir(p);
    const total = Object.values(C.lugares).filter((l) => !l.segredo).length;
    const html = Mapas.html({
      eixo: "x", centro: C.centro, tensao: 0, bairros: bairros(ids),
      lugares: ids.map((id) => ({ id, nome: C.lugares[id].nome, icone: C.lugares[id].icone, x: C.lugares[id].x, y: C.lugares[id].y, fora: true })),
    });
    return { html, conhecidos: ids.length, total };
  }

  return { idDe, lugar, garantir, conhece, conhecer, bairros, mapaDaFicha, dados: C };
})();

// As missões passam a usar as posições da cidade
for (const [mid, mapa] of Object.entries(LIGACOES_X)) {
  const m = MISSOES[mid];
  if (!m) continue;
  for (const [lid, cid] of Object.entries(mapa)) if (m.lugares[lid] && CIDADE_X.lugares[cid]) m.lugares[lid].mapa = { x: CIDADE_X.lugares[cid].x, y: CIDADE_X.lugares[cid].y };
}
// Onde cada origem começa na cidade
if (typeof ORIGENS_X !== "undefined") {
  Object.assign(ORIGENS_X["frank-brennan"], { cidade: "estacao-9" });
  Object.assign(ORIGENS_X["rosa-delgado"], { cidade: "distrito-4" });
  Object.assign(ORIGENS_X["marcus-bell"], { cidade: "harbor" });
  Object.assign(ORIGENS_X["denise-carter"], { cidade: "st-lukes-ps" });
  Object.assign(ORIGENS_X["michael-doyle"], { cidade: "st-brendans" });
  Object.assign(ORIGENS_X["june-albright"], { cidade: "comunitario" });
  Object.assign(ORIGENS_X["eli-navarro"], { cidade: "laboratorio" });
  Object.assign(ORIGENS_X["tess-monroe"], { cidade: "kphn" });
  Object.assign(ORIGENS_X["ray-okafor"], { cidade: "ponto-linha9" });
}
