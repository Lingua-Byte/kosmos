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
// As posições seguem o mapa de referência do autor (Artes/mapa-port-halden-referencia.webp):
// universidade ao norte, porto e docas ao sul. forma = contorno do bairro (pontos x, y em %), desenhado com curvas; os desconhecidos ficam na névoa.
// =====================================================================

const CIDADE_X = {
  nome: "Port Halden",
  centro: { x: 50, y: 52, nome: "Praça Central" },
  bairros: {
    universidade: { nome: "Universidade", x: 52, y: 20, forma: [[30.6, 22.6], [34.3, 6.0], [42.6, 1.2], [55.6, 0], [64.8, 4.8], [70.4, 13.1], [69.4, 23.8], [61.1, 28.6], [42.6, 28.6]] },
    westside: { nome: "Westside", x: 26, y: 29, forma: [[2.8, 32.1], [7.4, 21.4], [18.5, 16.7], [29.6, 20.2], [32.4, 32.1], [31.5, 50.0], [25.9, 56.0], [13.9, 57.1], [4.6, 52.4]] },
    distrito9: { nome: "9º Distrito", x: 22, y: 64, forma: [[1.9, 59.5], [13.9, 58.3], [27.8, 60.1], [36.1, 67.3], [36.6, 78.0], [29.6, 82.7], [13.9, 83.3], [2.8, 76.2]] },
    docas: { nome: "Docas", x: 47, y: 79, forma: [[18.5, 83.9], [32.4, 77.4], [50.0, 76.2], [61.1, 76.8], [73.1, 83.9], [71.3, 92.3], [50.0, 94.6], [27.8, 93.8], [18.5, 90.5]] },
    centro: { nome: "Centro", x: 51, y: 38, forma: [[31.5, 32.1], [35.2, 29.2], [50.0, 28.6], [66.7, 29.2], [69.9, 38.1], [70.4, 58.9], [63.9, 69.6], [50.0, 73.2], [34.3, 70.8], [31.0, 59.5]] },
    maple: { nome: "Maple Heights", x: 87, y: 21, forma: [[64.8, 13.7], [69.4, 7.1], [79.6, 6.0], [92.6, 8.3], [99.5, 15.5], [100, 26.2], [97.2, 34.5], [88.0, 35.7], [74.1, 32.7], [68.5, 26.8]] },
    midtown: { nome: "Midtown", x: 87, y: 45, forma: [[71.3, 40.5], [78.7, 36.3], [92.6, 37.5], [96.3, 46.4], [93.5, 58.9], [83.3, 62.5], [72.7, 60.1]] },
    eastside: { nome: "Eastside", x: 84, y: 68, forma: [[59.3, 70.2], [72.2, 63.7], [88.9, 64.9], [99.5, 69.6], [100, 83.3], [92.6, 94.6], [78.7, 97.0], [74.5, 85.7], [63.9, 79.2]] },
  },
  lugares: {
    // Universidade
    universidade: { nome: "Instituto de Física", bairro: "universidade", x: 50, y: 6, icone: "Σ" },
    laboratorio: { nome: "Laboratório de Radiação", bairro: "universidade", x: 60, y: 14, icone: "☢" },
    // Westside
    kphn: { nome: "Rádio KPHN", bairro: "westside", x: 15, y: 35, icone: "◖" },
    hollister: { nome: "Hollister & Crane", bairro: "westside", x: 25, y: 41, icone: "▤" },
    "distrito-4": { nome: "4º Distrito", bairro: "westside", x: 15, y: 49, icone: "★" },
    galeria: { nome: "Galeria da 5ª Avenida", bairro: "westside", x: 25, y: 53, icone: "⌂" },
    // 9º Distrito
    "delegacia-9": { nome: "Delegacia do 9º Distrito", bairro: "distrito9", x: 14, y: 72, icone: "★" },
    ginasio: { nome: "Ginásio Lincoln", bairro: "distrito9", x: 28, y: 77, icone: "▦" },
    // Docas
    harbor: { nome: "Harbor Street", bairro: "docas", x: 35, y: 86, icone: "⚓" },
    "st-brendans": { nome: "St. Brendan's", bairro: "docas", x: 45, y: 88, icone: "✝" },
    metro: { nome: "Estação Rua 9", bairro: "docas", x: 53, y: 90, icone: "Ⓜ" },
    "ponto-linha9": { nome: "Ponto de táxi da Linha 9", bairro: "docas", x: 64, y: 86, icone: "◘" },
    // Centro
    aurora: { nome: "Edifício Aurora", bairro: "centro", x: 38, y: 45, icone: "▲" },
    federal: { nome: "Prédio Federal", bairro: "centro", x: 50, y: 67, icone: "⊟", segredo: true },
    atlantico: { nome: "Atlantic Tower", bairro: "centro", x: 63, y: 44, icone: "▥" },
    cerca: { nome: "A cerca do centro", bairro: "centro", x: 39, y: 65, icone: "⊠", segredo: true },
    biblioteca: { nome: "Biblioteca Municipal", bairro: "centro", x: 61, y: 60, icone: "❡" },
    // Maple Heights
    casa: { nome: "Sua casa", bairro: "maple", x: 78, y: 18, icone: "⌂" },
    comunitario: { nome: "Centro comunitário", bairro: "maple", x: 70, y: 23, icone: "♣" },
    drogaria: { nome: "Drogaria Goodwell", bairro: "maple", x: 81, y: 31, icone: "✚" },
    abe: { nome: "Conveniência do Abe", bairro: "maple", x: 90, y: 32, icone: "$" },
    // Midtown
    "st-lukes": { nome: "St. Luke's Memorial", bairro: "midtown", x: 80, y: 52, icone: "✚" },
    "st-lukes-ps": { nome: "Pronto-socorro do St. Luke's", bairro: "midtown", x: 89, y: 57, icone: "✚" },
    // Eastside
    "estacao-9": { nome: "Estação 9 dos Bombeiros", bairro: "eastside", x: 72, y: 74, icone: "♨" },
    viaduto: { nome: "Viaduto Leste", bairro: "eastside", x: 88, y: 75, icone: "≋" },
    delancey: { nome: "Delancey Street", bairro: "eastside", x: 88, y: 85, icone: "▣", segredo: true },
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
      eixo: "x", centro: C.centro, tensao: 0, bairros: bairros(ids), compacta: true,
      lugares: ids.map((id) => ({ id, nome: C.lugares[id].nome, icone: C.lugares[id].icone, x: C.lugares[id].x, y: C.lugares[id].y, trancado: true, bairro: C.bairros[C.lugares[id].bairro].nome })),
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
