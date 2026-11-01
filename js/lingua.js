// =====================================================================
// As três línguas da Convergência
// ---------------------------------------------------------------------
// As línguas não traduzem palavras: traduzem CONCEITOS. Todo conceito é
// descrito uma única vez por uma fórmula feita de RAÍZES (ideias básicas),
// e cada língua escreve essa fórmula com a sua própria lógica:
//
//   Eixo X · Código Urbano  → fórmula matemática. Composto = função aplicada ("casa de…"),
//       como o construto do hebraico (beit cholim = casa dos doentes):
//       hospital = Λ(Δ(ψσ))   casa( alterado(mente·corpo) )
//       juntar = produto (ψσ) · muitos = potência (Λⁿ) · pequeno = raiz (√) · não = ¬
//       acumular = integral (∫ψdt) · todo = ∀ · não existe = ∄ · verbo = operador (𝒪(S))
//   Eixo Y · Runas Yudur    → as runas se juntam pelo significado antigo de cada uma.
//       hospital = ᛟᚺᛗᚢ   ("lar · ruptura · humano · corpo")
//   Eixo Z · Interface      → relações entre núcleos; estados escritos abaixo.
//       hospital = ⌂ ⊃ (◌⬡ | ≈)
//
// Fórmula de um conceito: { n: núcleo(s), r: relação, a: alvo, e: estado, neg, mod }
//   n e a podem ser raízes ou outros conceitos (o dicionário se constrói sobre si mesmo).
// Nomes próprios e palavras fora do dicionário são transcritos letra a letra:
//   X usa o alfabeto de nomeação (𝔸𝔹ℂ…), Y as runas fonéticas, Z as constelações (⠁⠃⠉…).
// =====================================================================

// ---------- Raízes ----------
// tipo: nucleo (coisas), relacao (verbos), estado, modo
const RAIZES = {
  // núcleos
  mente:        { nome: "mente",              tipo: "nucleo", x: "ψ", y: "ᛗ",  z: "◌" },
  corpo:        { nome: "corpo",              tipo: "nucleo", x: "σ", y: "ᚢ",  z: "⬡" },
  estrela:      { nome: "estrela / sol",      tipo: "nucleo", x: "S", y: "ᛋ",  z: "◉" },
  momento:      { nome: "tempo / momento",    tipo: "nucleo", x: "m", y: "ᛃ",  z: "⟡" },
  evento:       { nome: "evento / destino",   tipo: "nucleo", x: "e", y: "ᛈ",  z: "◈" },
  observador:   { nome: "observador",         tipo: "nucleo", x: "Ω", y: "ᛗᛞ", z: "⟁" },
  interface:    { nome: "interface",          tipo: "nucleo", x: "ℐ", y: "ᛗᛜ", z: "◎" },
  campo:        { nome: "campo desconhecido", tipo: "nucleo", x: "Φ", y: "ᛈᚦ", z: "◍" },
  casa:         { nome: "casa / lar",         tipo: "nucleo", x: "Λ", y: "ᛟ",  z: "⌂" },
  lugar:        { nome: "lugar / espaço",     tipo: "nucleo", x: "ℝ³", y: "ᚱᛟ", z: "⏣" },
  objeto:       { nome: "objeto / coisa",     tipo: "nucleo", x: "θ", y: "ᚷ",  z: "▢" },
  agua:         { nome: "água",               tipo: "nucleo", x: "≋", y: "ᛚ",  z: "◒" },
  fogo:         { nome: "fogo / calor",       tipo: "nucleo", x: "Q", y: "ᚲ",  z: "◓" },
  luz:          { nome: "luz",                tipo: "nucleo", x: "λ", y: "ᛞ",  z: "◐" },
  som:          { nome: "som / voz",          tipo: "nucleo", x: "ν", y: "ᚨ",  z: "◔" },
  vida:         { nome: "vida",               tipo: "nucleo", x: "β", y: "ᛒ",  z: "⊕" },
  morte:        { nome: "morte",              tipo: "nucleo", x: "¬β", y: "ᛇ", z: "⊖", xComposto: true },
  maquina:      { nome: "máquina",            tipo: "nucleo", x: "μ", y: "ᚷᛖ", z: "⬢" },
  movimento:    { nome: "movimento",          tipo: "nucleo", x: "v", y: "ᛖ",  z: "↝" },
  caminho:      { nome: "caminho / jornada",  tipo: "nucleo", x: "γ", y: "ᚱ",  z: "⤳" },
  linguagem:    { nome: "linguagem / palavra", tipo: "nucleo", x: "ℒ", y: "ᚨᚲ", z: "⌬" },
  conhecimento: { nome: "conhecimento",       tipo: "nucleo", x: "κ", y: "ᚲᛗ", z: "⟐" },
  protecao:     { nome: "proteção",           tipo: "nucleo", x: "Π", y: "ᛉ",  z: "⊡" },
  conflito:     { nome: "conflito / guerra",  tipo: "nucleo", x: "∇", y: "ᛏ",  z: "⨯" },
  riqueza:      { nome: "riqueza / troca",    tipo: "nucleo", x: "Σ", y: "ᚠ",  z: "⊞" },
  ordem:        { nome: "ordem / lei",        tipo: "nucleo", x: "≡", y: "ᛏᚨ", z: "≣" },
  ruptura:      { nome: "ruptura",            tipo: "nucleo", x: "∂", y: "ᚺ",  z: "⋔" },
  caos:         { nome: "caos",               tipo: "nucleo", x: "χ", y: "ᚦ",  z: "⁂" },
  alegria:      { nome: "alegria",            tipo: "nucleo", x: "η", y: "ᚹ",  z: "⊹" },
  potencial:    { nome: "possível / semente", tipo: "nucleo", x: "◇", y: "ᛜ",  z: "◦" },
  necessidade:  { nome: "necessário",         tipo: "nucleo", x: "□", y: "ᚾ",  z: "▪" },
  existir:      { nome: "existir",            tipo: "nucleo", x: "∃", y: "ᛞᛒ", z: "◆" },
  // relações (verbos)
  observar:     { nome: "observar / perceber", tipo: "relacao", x: "𝒪", y: "ᛞ", z: "⟜", frase: "que observa" },
  compreender:  { nome: "compreender",        tipo: "relacao", x: "𝒞", y: "ᚲ",  z: "⟛", frase: "que compreende" },
  transformar:  { nome: "transformar",        tipo: "relacao", x: "𝒯", y: "ᛇ",  z: "⟠", frase: "que transforma" },
  lembrar:      { nome: "lembrar",            tipo: "relacao", x: "𝓛", y: "ᛃ",  z: "⟲", frase: "que lembra" },
  gerar:        { nome: "gerar / criar",      tipo: "relacao", x: "𝒢", y: "ᛒ",  z: "⊸", frase: "que gera" },
  fixar:        { nome: "fixar / prender",    tipo: "relacao", x: "𝒡", y: "ᛁ",  z: "⊣", frase: "que fixa" },
  conter:       { nome: "conter / ter",       tipo: "relacao", x: "∋", y: "ᛟ",  z: "⊃", frase: "que contém" },
  emergir:      { nome: "emergir de",         tipo: "relacao", x: "⊢", y: "ᛜ",  z: "≺", frase: "que emerge de" },
  sincronizar:  { nome: "sincronizar",        tipo: "relacao", x: "≅", y: "ᚷ",  z: "⟡⟡", frase: "em sincronia com" },
  resistir:     { nome: "resistir",           tipo: "relacao", x: "⊥", y: "ᛉ",  z: "⟞", frase: "que resiste a" },
  aproximar:    { nome: "aproximar",          tipo: "relacao", x: "⇀", y: "ᛖ",  z: "⇢", frase: "que se aproxima de" },
  // estados
  ativo:        { nome: "ativo",              tipo: "estado", x: "⁺", y: "ᛞ",  z: "↑" },
  latente:      { nome: "latente",            tipo: "estado", x: "⁰", y: "ᛁ",  z: "~" },
  instavel:     { nome: "instável",           tipo: "estado", x: "Δ", y: "ᚺ",  z: "≈" },
  colapso:      { nome: "colapso",            tipo: "estado", x: "⌀", y: "ᛇ",  z: "⨂" },
  integracao:   { nome: "integração",         tipo: "estado", x: "I", y: "ᛜ",  z: "⊚" },
  desconhecido: { nome: "desconhecido",       tipo: "estado", x: "?", y: "ᛈ",  z: "⋯" },
  // modos
  nao:          { nome: "não / sem",          tipo: "modo", x: "¬", y: "ᚾ",  z: "⊘" },
  muito:        { nome: "muito / muitos",     tipo: "modo", x: "ⁿ", y: "(runa dobrada)", z: "⇈" },
  pouco:        { nome: "pouco / pequeno",    tipo: "modo", x: "√", y: "᛫",  z: "↓" },
};

// Símbolos exclusivos do Código Urbano: tempo e operadores matemáticos
const X_EXTRAS = [
  { s: "t", nome: "agora", tipo: "tempo" },
  { s: "t₀", nome: "passado", tipo: "tempo" },
  { s: "t₊", nome: "futuro", tipo: "tempo" },
  { s: "∫", nome: "acumular (integral)", tipo: "operador" },
  { s: "∑", nome: "conjunto de todos (soma)", tipo: "operador" },
  { s: "∀", nome: "para todo / sempre", tipo: "operador" },
  { s: "∄", nome: "não existe", tipo: "operador" },
];

// Runas que não são letras, só conceitos (entram nas cartas de runa)
const RUNAS_EXTRAS = { "ᚦ": "TH (caos)", "ᛜ": "NG (semente)" };

// Alfabetos de nomeação (nomes próprios e palavras sem conceito)
const NOMES_X = "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ";
const NOMES_Z = "⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵";

// ---------- Dicionário ----------
// pt: começos de palavras em português (sem acento) que levam ao conceito; "$" = palavra inteira.
const K = (id, cat, pt, f, extra = {}) => ({ id, cat, pt, f, ...extra });

const CONCEITOS = [
  // Convergência
  K("convergencia", "Convergência", ["converg"], { r: "aproximar", a: "mundo" }, { x: "∑ℝ³ → ℝ³" }),
  K("entidade", "Convergência", ["entidade"], { n: ["estrela", "mente"] }),
  K("ecoado", "Convergência", ["ecoad", "eco$", "ecos$"], { n: "pessoa", r: "sincronizar", a: "estrela" }),
  K("desperto", "Convergência", ["despert"], { n: "pessoa", e: "ativo", r: "observar", a: "estrela" }),
  K("runatico", "Convergência", ["runatic"], { n: "pessoa", e: "instavel", r: "gerar", a: "runa" }),
  K("interface", "Convergência", ["interface"], { n: "interface" }),
  K("lime", "Convergência", ["lime$", "limes$", "fenda", "rasgo"], { n: "lugar", e: "instavel", r: "emergir", a: "campo" }),
  K("tabula", "Convergência", ["tabula"], { n: "objeto", e: "ativo", r: "conter", a: "runa" }),
  K("runa", "Convergência", ["runa", "simbolo", "glifo"], { n: ["linguagem", "objeto"] }),
  K("ressonancia", "Convergência", ["resson"], { n: "som", r: "sincronizar", a: "estrela" }),
  K("dissonancia", "Convergência", ["disson"], { n: "som", r: "resistir", a: "estrela" }),
  K("radiacao", "Convergência", ["radiac", "radioativ"], { n: "luz", e: "instavel", r: "emergir", a: "estrela" }),
  K("sinal", "Convergência", ["sinal", "sinais"], { n: "luz", r: "conter", a: "linguagem" }),
  K("padrao", "Convergência", ["padr"], { n: "ordem", mod: "muito" }),
  K("pulso", "Convergência", ["pulso", "pulsa"], { n: "movimento", e: "ativo" }),
  K("campo", "Convergência", ["campo"], { n: "campo" }),
  K("observador", "Convergência", ["observador"], { n: "observador" }),
  K("mudanca", "Convergência", ["mudanc"], { n: "ruptura" }, { x: "Δ", tipo: "resultado" }),
  K("vazio", "Convergência", ["vazi", "nada$", "ausenc"], { n: "existir", neg: true }, { x: "⌀", tipo: "resultado" }),
  K("existir", "Convergência", ["exist", "ha$", "haver"], { n: "existir" }, { tipo: "existir" }),

  // Pessoas
  K("pessoa", "Pessoas", ["pessoa", "gente", "human", "individuo", "alguem", "homem", "homens", "mulher", "ele$", "ela$", "eles$", "elas$"], { n: ["mente", "corpo"] }),
  K("eu", "Pessoas", ["eu$", "me$", "mim$", "comigo"], { n: "mente" }),
  K("voce", "Pessoas", ["voce", "tu$", "te$", "ti$", "contigo"], { n: "observador" }),
  K("crianca", "Pessoas", ["crianc", "menin", "bebe", "garot"], { n: "pessoa", mod: "pouco" }),
  K("velho", "Pessoas", ["velh", "idos", "ancia"], { n: "pessoa", r: "conter", a: "passado" }),
  K("amigo", "Pessoas", ["amig", "aliad", "companheir"], { n: "pessoa", r: "conter", a: "alegria" }),
  K("inimigo", "Pessoas", ["inimig", "adversari"], { n: "pessoa", r: "gerar", a: "conflito" }),
  K("familia", "Pessoas", ["famili", "pai$", "mae$", "irma", "filh", "parente"], { n: "casa", r: "conter", a: "vida" }),
  K("doente", "Pessoas", ["doente", "enfermo", "paciente"], { n: "pessoa", e: "instavel" }),
  K("multidao", "Pessoas", ["multid", "povo", "populac", "turba", "aglomer", "mob$", "mobs$"], { n: "pessoa", mod: "muito" }),
  K("medico", "Pessoas", ["medic", "doutor", "enfermeir", "curandeir", "psiquiatra"], { n: "pessoa", r: "transformar", a: "doenca" }),
  K("soldado", "Pessoas", ["soldad", "guerreir", "cavaleir", "policia", "guarda$", "guardas$", "militar", "agente"], { n: "pessoa", r: "conter", a: "conflito" }),
  K("sacerdote", "Pessoas", ["monge", "padre", "sacerdot", "pastor", "freira", "religios", "oraculo"], { n: "pessoa", r: "observar", a: "deus" }),
  K("lider", "Pessoas", ["rei$", "rainha", "lider", "chefe", "governant", "comandant", "capitao", "abade"], { n: "pessoa", r: "conter", a: "ordem" }),
  K("estranho", "Pessoas", ["estranh"], { n: "pessoa", e: "desconhecido" }),
  K("tripulacao", "Pessoas", ["tripula", "equipe"], { n: "pessoa", mod: "muito", r: "conter", a: "nave" }),
  K("astronauta", "Pessoas", ["astronaut", "cosmonaut"], { n: "pessoa", r: "aproximar", a: "estrela" }),
  K("cientista", "Pessoas", ["cientist", "pesquisador", "analista", "estudios", "sabio"], { n: "pessoa", r: "compreender", a: "evento" }),

  // Corpo e mente
  K("corpo", "Corpo e mente", ["corpo"], { n: "corpo" }),
  K("mente", "Corpo e mente", ["mente$", "mentes$", "mental", "consciencia", "psique", "alma"], { n: "mente" }),
  K("cabeca", "Corpo e mente", ["cabec", "cerebr"], { n: "corpo", r: "conter", a: "mente" }),
  K("olho", "Corpo e mente", ["olho", "olhos", "olhar"], { n: "corpo", r: "observar" }),
  K("mao", "Corpo e mente", ["mao$", "maos$", "dedo"], { n: "corpo", r: "fixar" }),
  K("boca", "Corpo e mente", ["boca", "labio"], { n: "corpo", r: "gerar", a: "som" }),
  K("sangue", "Corpo e mente", ["sangue"], { n: "agua", r: "conter", a: "vida" }),
  K("coracao", "Corpo e mente", ["coracao"], { n: ["corpo", "vida"] }),
  K("sonho", "Corpo e mente", ["sonh", "visao", "visoes"], { n: "mente", e: "latente", r: "gerar", a: "lugar" }),
  K("memoria", "Corpo e mente", ["memori", "lembranc", "recordac"], { n: "mente", r: "conter", a: "passado" }, { x: "∫ψdt" }),
  K("pensamento", "Corpo e mente", ["pensa", "ideia", "razao"], { n: "mente", e: "ativo" }),
  K("sono", "Corpo e mente", ["sono", "dorm"], { n: "mente", e: "latente" }),
  K("doenca", "Corpo e mente", ["doen", "enferm", "ferid", "machuc", "epidemi", "infecc"], { n: "vida", e: "instavel" }),
  K("loucura", "Corpo e mente", ["louc", "insan", "delir", "surto"], { n: "mente", e: "instavel" }),
  K("dor", "Corpo e mente", ["dor$", "dores", "sofr"], { n: "corpo", e: "instavel" }),
  K("cura", "Corpo e mente", ["cura", "curar", "sarar", "tratament"], { r: "transformar", a: "doenca" }),

  // Lugares
  K("lugar", "Lugares", ["lugar", "local", "sitio", "zona", "area$", "regiao"], { n: "lugar" }),
  K("mundo", "Lugares", ["mundo", "realidade", "universo", "eixo", "dominio"], { n: "lugar", mod: "muito" }, { x: "∑ℝ³" }),
  K("casa", "Lugares", ["casa", "lar$", "moradia", "residenc", "apartament", "predio"], { n: "casa" }),
  K("cidade", "Lugares", ["cidade", "urban", "metropol", "vila$", "aldeia"], { n: "casa", mod: "muito" }),
  K("rua", "Lugares", ["rua$", "ruas$", "estrada", "avenida", "caminho", "trilha", "corredor", "passagem"], { n: "caminho" }),
  K("hospital", "Lugares", ["hospital", "clinica", "enfermaria"], { n: "casa", r: "conter", a: "doente" }),
  K("escola", "Lugares", ["escola", "universidade", "faculdade", "academia"], { n: "casa", r: "conter", a: "livro" }),
  K("biblioteca", "Lugares", ["bibliotec", "arquivo"], { n: "casa", r: "conter", a: "conhecimento" }),
  K("mercado", "Lugares", ["mercado", "loja", "comercio", "feira", "concessionaria", "taverna"], { n: "casa", r: "conter", a: "riqueza" }),
  K("delegacia", "Lugares", ["delegacia", "tribunal", "quartel"], { n: "casa", r: "conter", a: "lei" }),
  K("prisao", "Lugares", ["prisao", "cela", "cadeia", "masmorra"], { n: "casa", r: "fixar", a: "pessoa" }),
  K("templo", "Lugares", ["templo", "igreja", "mosteiro", "capela", "santuario", "catedral"], { n: "casa", r: "conter", a: "deus" }),
  K("castelo", "Lugares", ["castelo", "fortaleza", "muralha"], { n: "casa", r: "conter", a: "protecao" }),
  K("metro", "Lugares", ["metro", "estacao", "plataforma", "tunel", "subterran"], { n: "caminho", r: "conter", a: "maquina" }),
  K("porta", "Lugares", ["porta", "portao", "entrada", "saida"], { n: "objeto", r: "conter", a: "caminho" }),
  K("cripta", "Lugares", ["cripta", "tumul", "cemiteri", "sepult"], { n: "casa", r: "conter", a: "morte" }),
  K("floresta", "Lugares", ["floresta", "bosque", "arvore", "selva"], { n: "lugar", mod: "muito", r: "conter", a: "vida" }),
  K("ceu", "Lugares", ["ceu", "espaco", "cosmo", "kosmo", "firmamento"], { n: "lugar", r: "conter", a: "estrela" }),
  K("planeta", "Lugares", ["planeta", "terra$", "lua$", "luas$"], { n: ["lugar", "objeto"], r: "aproximar", a: "estrela" }),
  K("nave", "Lugares", ["nave", "modulo", "foguete", "base$"], { n: "maquina", r: "aproximar", a: "estrela" }),

  // Natureza
  K("agua", "Natureza", ["agua", "chuva"], { n: "agua" }),
  K("mar", "Natureza", ["mar$", "mares", "oceano", "rio$", "rios$", "lago"], { n: "agua", mod: "muito" }),
  K("fogo", "Natureza", ["fogo", "chama", "incend", "calor", "queim", "quente"], { n: "fogo" }),
  K("frio", "Natureza", ["frio", "gelo", "neve", "congel", "gelad"], { n: "fogo", neg: true }),
  K("luz", "Natureza", ["luz", "luzes", "brilh", "clar", "ilumin"], { n: "luz" }),
  K("escuridao", "Natureza", ["escur", "sombra", "treva"], { n: "luz", neg: true }),
  K("estrela", "Natureza", ["estrel", "sol$", "astro"], { n: "estrela" }),
  K("som", "Natureza", ["som$", "sons$", "ruido", "barulho", "voz$", "vozes", "grito", "frequenc"], { n: "som" }),
  K("musica", "Natureza", ["music", "cancao", "melodi", "refrao", "radio$"], { n: "som", r: "sincronizar", a: "alegria" }),
  K("silencio", "Natureza", ["silenc", "quiet"], { n: "som", neg: true }),
  K("ar", "Natureza", ["ar$", "vento", "respir"], { n: "movimento", e: "latente" }),
  K("pedra", "Natureza", ["pedra", "rocha", "metal", "ferro", "aco$"], { n: "objeto", r: "fixar" }),
  K("vida", "Natureza", ["vida", "viv"], { n: "vida" }),
  K("morte", "Natureza", ["mort", "morre", "morri", "falec", "cadaver"], { n: "morte" }),
  K("animal", "Natureza", ["animal", "bicho", "ave$", "aves$"], { n: ["corpo", "vida"] }),

  // Tempo
  K("tempo", "Tempo", ["tempo", "hora", "instante", "momento"], { n: "momento" }),
  K("agora", "Tempo", ["agora", "presente$", "hoje"], { n: "momento", e: "ativo" }, { x: "t", tipo: "tempo" }),
  K("passado", "Tempo", ["passad", "antes$", "ontem", "antig"], { n: "momento", e: "latente" }, { x: "t₀", tipo: "tempo" }),
  K("futuro", "Tempo", ["futur", "depois$", "amanha", "proxim"], { n: "momento", r: "aproximar" }, { x: "t₊", tipo: "tempo" }),
  K("nunca", "Tempo", ["nunca", "jamais"], { n: "momento", neg: true }, { x: "∄t", tipo: "tempo" }),
  K("sempre", "Tempo", ["sempre", "etern", "infinit"], { n: "momento", mod: "muito" }, { x: "∀t" }),
  K("dia", "Tempo", ["dia$", "dias$", "manha$", "amanhec"], { n: "momento", r: "conter", a: "luz" }),
  K("noite", "Tempo", ["noite", "madrugad"], { n: "momento", r: "conter", a: "escuridao" }),
  K("ciclo", "Tempo", ["ano$", "anos$", "ciclo"], { n: "momento", r: "lembrar" }),
  K("fim", "Tempo", ["fim$", "final", "termin", "acab"], { n: "momento", e: "colapso" }),
  K("inicio", "Tempo", ["inicio", "comec", "origem"], { n: "momento", r: "emergir" }),

  // Objetos
  K("objeto", "Objetos", ["objeto", "coisa", "item"], { n: "objeto" }),
  K("arma", "Objetos", ["arma", "espada", "pistola", "faca", "adaga", "lanca", "rifle", "espingarda", "machado"], { n: "objeto", r: "gerar", a: "conflito" }),
  K("armadura", "Objetos", ["escudo", "armadura", "colete", "elmo", "capacete", "traje"], { n: "objeto", r: "conter", a: "protecao" }),
  K("livro", "Objetos", ["livro", "pergaminh", "carta$", "cartas$", "papel", "documento", "diario", "registro"], { n: "objeto", r: "conter", a: "linguagem" }),
  K("chave", "Objetos", ["chave"], { n: "objeto", r: "transformar", a: "porta" }),
  K("telefone", "Objetos", ["telefon", "celular", "smartphone", "comunicador"], { n: "maquina", r: "gerar", a: "som" }),
  K("tela", "Objetos", ["televis", "tv$", "tela", "monitor", "telejornal"], { n: "maquina", r: "gerar", a: "luz" }),
  K("carro", "Objetos", ["carro", "veiculo", "onibus", "caminhao", "trem$", "moto$"], { n: "maquina", r: "gerar", a: "movimento" }),
  K("dinheiro", "Objetos", ["dinheir", "moeda", "ouro", "prata", "riqueza", "pagar"], { n: "riqueza" }),
  K("vela", "Objetos", ["vela$", "velas$", "tocha", "lampada", "lanterna"], { n: "objeto", r: "gerar", a: "luz" }),
  K("computador", "Objetos", ["computador", "dados$", "sistema", "programa", "codigo"], { n: "maquina", r: "conter", a: "conhecimento" }),
  K("medidor", "Objetos", ["medidor", "sensor", "detector", "geiger", "contador"], { n: "maquina", r: "observar", a: "radiacao" }),

  // Ações
  K("observar", "Ações", ["observ", "olha", "ver$", "vendo", "viu$", "vi$", "viram", "vimos", "visto", "vej", "enxerg", "perceb", "percep", "assist"], { r: "observar" }),
  K("compreender", "Ações", ["compreend", "entend", "saber", "sabe$", "sei$", "conhec"], { r: "compreender" }),
  K("transformar", "Ações", ["transform", "mudar", "muda$", "mudou", "mudando", "alter", "virou"], { r: "transformar" }),
  K("lembrar", "Ações", ["lembr", "record"], { r: "lembrar" }),
  K("esquecer", "Ações", ["esquec"], { r: "lembrar", neg: true }),
  K("gerar", "Ações", ["gera$", "gerar", "gerou", "gerando", "geram", "criar", "criou", "cria$", "produz", "fabric"], { r: "gerar" }),
  K("fixar", "Ações", ["fix", "prend", "parar", "parou"], { r: "fixar" }),
  K("conter", "Ações", ["contem", "conter", "guardar", "ter$", "tem$", "tinha", "possu"], { r: "conter" }),
  K("emergir", "Ações", ["emerg", "surg", "aparec", "brot", "nasc"], { r: "emergir" }),
  K("sincronizar", "Ações", ["sincron", "junt", "unir", "uniu"], { r: "sincronizar" }),
  K("resistir", "Ações", ["resist"], { r: "resistir" }),
  K("aproximar", "Ações", ["aproxim", "cheg", "vir$", "vem$", "venh", "veio"], { r: "aproximar" }),
  K("andar", "Ações", ["anda", "andar", "camin", "mov"], { n: "movimento", e: "ativo" }),
  K("fugir", "Ações", ["fug", "escap"], { r: "resistir", a: "perigo" }),
  K("falar", "Ações", ["falar", "falou", "fala$", "falando", "falam", "dizer", "disse", "diz$", "conversa", "pergunt", "respond"], { r: "gerar", a: "linguagem" }),
  K("ouvir", "Ações", ["ouv", "escut"], { r: "observar", a: "som" }),
  K("ler", "Ações", ["ler$", "leu$", "lendo", "leitura"], { r: "compreender", a: "linguagem" }),
  K("escrever", "Ações", ["escrev", "escrit"], { r: "fixar", a: "linguagem" }),
  K("lutar", "Ações", ["lut", "atac", "agred", "bater", "golpe"], { r: "gerar", a: "conflito" }),
  K("proteger", "Ações", ["proteg", "defend", "salv"], { n: "protecao", e: "ativo" }),
  K("matar", "Ações", ["matar", "matou", "mata$", "matando", "assassin"], { r: "gerar", a: "morte" }),
  K("ajudar", "Ações", ["ajud", "socorr"], { r: "gerar", a: "protecao" }),
  K("sentir", "Ações", ["sent"], { r: "observar", a: "corpo" }),
  K("cantar", "Ações", ["cant"], { r: "gerar", a: "musica" }),
  K("abrir", "Ações", ["abr"], { r: "transformar", a: "porta" }),
  K("fechar", "Ações", ["fech", "tranc"], { r: "fixar", a: "porta" }),
  K("voltar", "Ações", ["volt", "retorn"], { r: "lembrar", a: "caminho" }),
  K("esperar", "Ações", ["esper", "aguard"], { r: "fixar", a: "momento" }),
  K("procurar", "Ações", ["procur", "busc", "investig", "pesquis"], { r: "compreender", a: "evento" }),
  K("chamar", "Ações", ["chamar", "chamou", "chamado", "convoc"], { r: "aproximar", a: "som" }),

  // Sentimentos
  K("medo", "Sentimentos", ["medo", "pavor", "terror", "horror", "panico", "assust"], { n: "mente", r: "resistir", a: "escuridao" }),
  K("amor", "Sentimentos", ["amor", "amar$", "amo$", "ama$", "amad", "carinh", "paix"], { n: "mente", r: "sincronizar", a: "mente" }),
  K("raiva", "Sentimentos", ["odio", "raiv", "furi", "ira$"], { n: "mente", r: "gerar", a: "conflito" }),
  K("alegria", "Sentimentos", ["alegr", "feliz", "felicid", "riso", "rir$", "sorri"], { n: "alegria" }),
  K("tristeza", "Sentimentos", ["trist", "chor", "luto", "saudade"], { n: "alegria", neg: true }),
  K("esperanca", "Sentimentos", ["esperanc", "fe$", "crenca", "acredit"], { n: "mente", r: "aproximar", a: "futuro" }),
  K("solidao", "Sentimentos", ["sozinh", "solidao", "isolad"], { n: "mente", r: "conter", a: "vazio" }),
  K("confianca", "Sentimentos", ["confi"], { n: "mente", r: "sincronizar", a: "pessoa" }),
  K("desconfianca", "Sentimentos", ["desconfi", "suspeit", "duvid"], { n: "mente", neg: true, r: "sincronizar", a: "pessoa" }),
  K("coragem", "Sentimentos", ["corag", "bravur", "ousad"], { n: "mente", r: "resistir", a: "medo" }),

  // Sociedade
  K("deus", "Sociedade", ["deus", "deuses", "divin", "sagrad", "santo"], { n: "luz", mod: "muito", r: "conter", a: "mente" }),
  K("magia", "Sociedade", ["magia", "magic", "feitic", "encant", "bruxa"], { n: "runa", e: "ativo" }),
  K("lei", "Sociedade", ["lei$", "leis$", "regra", "ordem", "justic"], { n: "ordem" }),
  K("guerra", "Sociedade", ["guerra", "batalha", "combate", "conflito"], { n: "conflito", mod: "muito" }),
  K("trabalho", "Sociedade", ["trabalh", "emprego", "oficio", "profiss", "servico"], { n: "corpo", r: "gerar", a: "riqueza" }),
  K("noticia", "Sociedade", ["noticia", "jornal", "informac", "boato", "rumor", "mensag"], { n: "linguagem", r: "aproximar", a: "pessoa" }),
  K("segredo", "Sociedade", ["segred", "ocult", "escondid", "proibid"], { n: "conhecimento", e: "latente" }),
  K("heresia", "Sociedade", ["heresi", "herege", "blasfem"], { n: "linguagem", r: "resistir", a: "deus" }),
  K("ritual", "Sociedade", ["culto", "seita", "ritual", "rito$", "oracao", "rezar"], { n: "multidao", r: "observar", a: "deus" }),
  K("governo", "Sociedade", ["governo", "conselho", "reino", "imperio"], { n: "ordem", r: "conter", a: "multidao" }),
  K("conhecimento", "Sociedade", ["conhecimento", "sabedoria", "ciencia", "estudo"], { n: "conhecimento" }),
  K("linguagem", "Sociedade", ["lingua", "idioma", "palavra", "alfabeto", "escrita"], { n: "linguagem" }),

  // Qualidades
  K("perigo", "Qualidades", ["perig", "ameac", "risco"], { n: "evento", r: "aproximar", a: "morte" }),
  K("verdade", "Qualidades", ["verdad", "real$", "certo"], { n: "conhecimento", r: "fixar" }),
  K("mentira", "Qualidades", ["mentir", "falso", "falsa", "engan"], { n: "conhecimento", neg: true }),
  K("possivel", "Qualidades", ["possiv", "talvez", "pode$", "poder"], { n: "potencial" }),
  K("necessario", "Qualidades", ["necessar", "precis", "deve$", "dever"], { n: "necessidade" }),
  K("caos", "Qualidades", ["caos", "caotic", "desordem"], { n: "caos" }),
  K("novo", "Qualidades", ["novo$", "nova$", "novos$", "novas$"], { n: "potencial", e: "ativo" }),

  // Coisas do dia a dia (também servem de âncora para o léxico do WordNet)
  K("planta", "Natureza", ["planta", "erva", "flor$", "flores$", "folha"], { n: "vida", r: "emergir", a: "lugar" }),
  K("comida", "Objetos", ["comida", "alimento", "pao$", "refeic"], { n: "objeto", r: "gerar", a: "vida" }),
  K("roupa", "Objetos", ["roupa", "vestido", "camisa", "manto", "capa$"], { n: "objeto", r: "conter", a: "corpo" }),
  K("materia", "Objetos", ["materia", "material", "substancia"], { n: "objeto", e: "latente" }),
  K("ferramenta", "Objetos", ["ferrament", "martelo", "utensilio"], { n: "objeto", r: "transformar" }),
  K("instrumento", "Objetos", ["instrument", "violao", "guitarra", "piano", "tambor"], { n: "objeto", r: "gerar", a: "musica" }),
  K("cor", "Natureza", ["cor$", "cores$"], { n: "luz", r: "conter", a: "objeto" }),
  K("comer", "Ações", ["comer", "comeu", "come$", "comendo"], { r: "transformar", a: "comida" }),
  K("beber", "Ações", ["beber", "bebeu", "bebe$", "bebendo"], { r: "transformar", a: "agua" }),
  K("destruir", "Ações", ["destrui", "destroi", "aniquil"], { r: "transformar", a: "vazio" }),

  // Estados (como palavras soltas: modificam o conceito anterior)
  K("ativo", "Estados", ["ativ", "acordad"], { e: "ativo" }, { tipo: "estado" }),
  K("latente", "Estados", ["latent", "adormec", "dormente"], { e: "latente" }, { tipo: "estado" }),
  K("instavel", "Estados", ["instav", "instabil"], { e: "instavel" }, { tipo: "estado" }),
  K("colapso", "Estados", ["colaps", "desmoron"], { e: "colapso" }, { tipo: "estado" }),
  K("integracao", "Estados", ["integr"], { e: "integracao" }, { tipo: "estado" }),
  K("desconhecido", "Estados", ["desconhecid", "misteri", "incognit"], { e: "desconhecido" }, { tipo: "estado" }),
];

// Como o conceito aparece no dicionário (quando o id não basta)
const ROTULOS = {
  convergencia: "Convergência", ressonancia: "Ressonância", dissonancia: "Dissonância", radiacao: "Radiação",
  padrao: "Padrão", runatico: "Runático", mudanca: "Mudança", eu: "Eu", voce: "Você", crianca: "Criança",
  multidao: "Multidão", medico: "Médico / curandeiro", soldado: "Soldado / guerreiro", sacerdote: "Sacerdote / monge",
  lider: "Líder / rei", tripulacao: "Tripulação", cabeca: "Cabeça", olho: "Olho", mao: "Mão", coracao: "Coração",
  memoria: "Memória", prisao: "Prisão", doente: "Doente", doenca: "Doença / ferida", ceu: "Céu / espaço", agua: "Água", escuridao: "Escuridão",
  musica: "Música", silencio: "Silêncio", inicio: "Início", metro: "Metrô / túnel", noticia: "Notícia / mensagem",
  esperanca: "Esperança", solidao: "Solidão", confianca: "Confiança", desconfianca: "Desconfiança",
  possivel: "Possível", necessario: "Necessário", instavel: "Instável", integracao: "Integração",
  ciclo: "Ciclo / ano", tela: "Tela / televisão", telefone: "Telefone / rádio", vela: "Vela / tocha",
  armadura: "Armadura / escudo", livro: "Livro / documento", arma: "Arma", raiva: "Raiva / ódio", templo: "Templo / mosteiro",
};

// Palavras que só ligam a frase (não têm conceito próprio)
const PALAVRAS_LIGACAO = new Set(
  ("o a os as um uma uns umas de do da dos das no na nos nas num numa em e é ser era foi sao sou somos seja " +
   "que se por pelo pela pelos pelas para pra pro com como mas ou ao aos à às este esta estes estas isso isto " +
   "esse essa esses essas aquele aquela aquilo meu minha meus minhas seu sua seus suas teu tua nosso nossa lhe " +
   "la lá aqui ali entao quando onde porque pois tambem so ainda esta estou estava estao estar já ja quem qual " +
   "sobre entre ate até mesmo cada outro outra outros outras algo apenas so naquilo nisso nisto disso disto daquilo " +
   "for fosse fossem esteve estive estiveram estivesse enquanto seria sera serao sido estado vez").split(" ")
);

// Palavras que mudam o conceito vizinho.
// antes: valem para a palavra seguinte ("muitas casas", "nenhuma pessoa", "todos os mundos").
// depois: valem para a palavra anterior ("casa grande", "estrela pequena").
const MODIFICADORES = {
  muito: { antes: ["muito", "muita", "muitos", "muitas", "tanto", "tanta", "tantos", "tantas"], depois: ["grande", "grandes", "enorme", "enormes", "imenso", "imensa", "gigante", "gigantes"] },
  pouco: { antes: ["pouco", "pouca", "poucos", "poucas", "quase"], depois: ["pequeno", "pequena", "pequenos", "pequenas"] },
  todo: { antes: ["todo", "toda", "todos", "todas", "cada"], depois: [] },
  nenhum: { antes: ["nenhum", "nenhuma", "ninguem"], depois: [] },
  nao: { antes: ["nao", "nem", "sem"], depois: [] },
};
// Os mesmos modificadores em outros idiomas
[
  ["muito", "antes", "many much lots muchos muchas mucho mucha beaucoup tant molti molte molto tanti"],
  ["muito", "depois", "big large huge giant enormous grand grande grands grandes enorme enormes énorme gros"],
  ["pouco", "antes", "few little pocos pocas poco poca peu pochi poche poco"],
  ["pouco", "depois", "small tiny pequeño pequeña pequeños pequeñas petit petite petits petites piccolo piccola piccoli"],
  ["todo", "antes", "all every each todos todas cada tous toutes tout toute chaque tutti tutte tutto ogni"],
  ["nenhum", "antes", "no none nobody nothing ninguno ninguna nadie aucun aucune personne nessuno nessuna"],
  ["nao", "antes", "not without dont never sin pas sans jamais senza mai"],
].forEach(([mod, lado, palavras]) => MODIFICADORES[mod][lado].push(...palavras.normalize("NFD").replace(/[̀-ͯ]/g, "").split(" ")));

// Palavras de ligação de cada idioma (artigos, preposições, pronomes…)
const LIGACAO_IDIOMA = {
  pt: PALAVRAS_LIGACAO,
  en: new Set("the a an of and or to in on at by for from with as is are was were be been being that which who whom this these those it its he she they we you i me my your his her their our him them us but if then so than there here what when where why how do does did has have had will would can could should may might must shall up out about into over after before just also only very".split(" ")),
  es: new Set("el la los las un una unos unas de del y e o u a al en con por para que es son era fue ser estar esta estan este esto estos estas ese esa eso lo le les se su sus mi mis tu tus nos pero si como mas ya muy tambien yo el ella ellos ellas usted".split(" ")),
  fr: new Set("le la les l un une des de du d et ou a au aux en dans par pour que qui qu est sont etait etre ce cet cette ces il elle ils elles je j tu nous vous on se sa son ses mon ma mes ton ta tes ne n plus mais si comme sur avec y".split(" ")),
  it: new Set("il lo la i gli le l un uno una di del dello della dei degli delle e ed o a al alla in nel nella con per che e sono era essere questo questa questi queste quello quella si suo sua suoi mio mia tuo tua ma se come piu su da io lui lei noi voi loro".split(" ")),
};

const IDIOMAS = { pt: "Português", en: "English", es: "Español", fr: "Français", it: "Italiano" };

// Como cada língua escreve "todo" e "nenhum" (no X são quantificadores: ∀ e ∄)
const QUANTIFICADORES = {
  todo: { y: "ᛟ", z: "⇈" },
  nenhum: { y: "ᚾ", z: "⊘" },
};

// =====================================================================
// Motor das línguas
// =====================================================================

const Lingua = (() => {
  const conceitoPorId = new Map(CONCEITOS.map((c) => [c.id, c]));
  const norm = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  // ---------- Escrever um conceito ----------

  const cache = { x: new Map(), y: new Map(), z: new Map() };

  // Uma referência (em n ou a) é primeiro uma raiz; se não for, um conceito do dicionário
  function escreverRef(ref, lang) {
    if (RAIZES[ref]) return RAIZES[ref][lang];
    const c = conceitoPorId.get(ref);
    if (!c) return "";
    return escrever(c, lang);
  }

  const complexo = (s) => /[ |]/.test(s);

  // X: um símbolo só (ou com índice: t₀, ℝ³) dispensa parênteses; o resto vai entre parênteses
  const simples = (s) => {
    const a = Array.from(s);
    if (a.length <= 1 || (a.length === 2 && /[₀₊³ⁿ⁺⁰]/.test(a[1]))) return true;
    // operador de prefixo sobre algo simples: Δλ, ¬β, √x
    if (/^[Δ¬√∄∀]/.test(s)) return simples(a.slice(1).join(""));
    // um único grupo entre parênteses, com ou sem expoente: (ψσ)ⁿ
    if (s.startsWith("(")) {
      let nivel = 0;
      for (let i = 0; i < a.length; i++) {
        if (a[i] === "(") nivel++;
        if (a[i] === ")") nivel--;
        if (nivel === 0) return i === a.length - 1 || (i === a.length - 2 && /[ⁿ⁺⁰]/.test(a[i + 1]));
      }
    }
    return false;
  };
  const emBloco = (s) => (simples(s) ? s : `(${s})`);
  // "casa de…", "luz que vem de…": construto, escrito como função aplicada
  const CONSTRUTO = ["conter", "emergir"];
  // relações entre dois termos, escritas no meio: ψσ ≅ S
  const INFIXO = ["sincronizar", "resistir", "aproximar"];

  function estadoX(core, e) {
    if (e === "instavel") return "Δ" + emBloco(core);
    if (e === "integracao") return emBloco(core) + "→I";
    return emBloco(core) + RAIZES[e].x;
  }

  function modoX(core, mod) {
    if (mod === "nao") return "¬" + emBloco(core);
    if (mod === "nenhum") return "∄" + emBloco(core);
    if (mod === "todo") return "∀" + emBloco(core);
    if (mod === "pouco") return "√" + emBloco(core);
    return emBloco(core) + "ⁿ";
  }

  function escrever(c, lang) {
    if (cache[lang].has(c.id)) return cache[lang].get(c.id);
    const s = c[lang] || montar(c.f, lang);
    cache[lang].set(c.id, s);
    return s;
  }

  function montar(f, lang) {
    const nucleos = f.n ? [].concat(f.n) : [];
    const alvo = f.a ? escreverRef(f.a, lang) : "";
    const rel = f.r ? RAIZES[f.r][lang] : "";

    if (lang === "x") {
      // núcleos juntos = produto: ψσ (mente·corpo)
      let core = nucleos.map((n) => {
        const s = escreverRef(n, lang);
        return nucleos.length > 1 && !/^[\p{L}\p{N}₀₊³]+$/u.test(s) ? `(${s})` : s;
      }).join("");
      if (f.neg && core) core = modoX(core, "nao");
      if (f.mod && core) core = modoX(core, f.mod);
      if (f.e && core) core = estadoX(core, f.e);
      if (!f.r) return core;
      const r = !core && f.neg ? "¬" + rel : rel;
      // f(x)(y): uma função já aplicada pode ser aplicada de novo sem parênteses extras
      if (CONSTRUTO.includes(f.r)) return core ? `${simples(core) || (/\)$/.test(core) && !/[\s·]/.test(core)) ? core : `(${core})`}(${alvo})` : `(${alvo})`;
      if (INFIXO.includes(f.r)) return [core, r, alvo.includes(" ") ? `(${alvo})` : alvo].filter(Boolean).join(" ");
      if (!core) return alvo ? `${r}(${alvo})` : r;
      return `${emBloco(core)}·${r}${alvo ? `(${alvo})` : ""}`;
    }

    let core = nucleos.map((n) => {
      const s = escreverRef(n, lang);
      return nucleos.length > 1 && complexo(s) ? `(${s})` : s;
    }).join("");

    if (lang === "y") {
      if (f.neg && core) core = "ᚾ" + core;
      if (f.mod === "muito") core += core;
      if (f.mod === "pouco") core += "᛫";
      if (f.e) core = ["instavel", "latente"].includes(f.e) ? RAIZES[f.e].y + core : core + RAIZES[f.e].y;
      if (!f.r) return core;
      // o medieval é concreto: junta a coisa e o alvo, sem o verbo (o verbo só aparece se não houver alvo)
      if (core) return core + (alvo || rel);
      return (f.neg ? "ᚾ" : "") + rel + alvo;
    }

    // z
    if (f.neg && core) core = "⊘" + core;
    const topo = [core, f.r ? (!core && f.neg ? "⊘" : "") + rel : "", alvo && complexo(alvo) ? `(${alvo})` : alvo].filter(Boolean);
    const estados = [f.e ? RAIZES[f.e].z : "", f.mod ? RAIZES[f.mod].z : ""].filter(Boolean);
    return topo.join(" ") + (estados.length ? " | " + estados.join(" ") : "");
  }

  // Leitura em português da fórmula (para o dicionário)
  function explicar(c) {
    const f = c.f;
    const nomeRef = (ref) => (RAIZES[ref] ? RAIZES[ref].nome : conceitoPorId.has(ref) ? rotulo(conceitoPorId.get(ref)).toLowerCase() : ref);
    const partes = [];
    if (f.neg) partes.push("não");
    if (f.n) partes.push([].concat(f.n).map(nomeRef).join(" + "));
    if (f.mod) partes.push(RAIZES[f.mod].nome.split(" / ")[0]);
    if (f.e) partes.push(RAIZES[f.e].nome);
    if (f.r) partes.push(f.n ? RAIZES[f.r].frase : RAIZES[f.r].nome);
    if (f.a) partes.push(nomeRef(f.a));
    return partes.join(" · ");
  }

  // ---------- Nomes próprios ----------

  function transcrever(palavra, lang) {
    const letras = norm(palavra).toUpperCase().replace(/[^A-Z]/g, "");
    if (lang === "y") return letras.split("").map((l) => RUNAS[l]).join("");
    const alfabeto = Array.from(lang === "x" ? NOMES_X : NOMES_Z);
    return "⟨" + letras.split("").map((l) => alfabeto[l.charCodeAt(0) - 65]).join("") + "⟩";
  }

  // ---------- Achar o conceito de uma palavra ----------

  // Dicionário feito à mão (português): devolve o conceito e quão "colado" na palavra o radical está
  function buscarManual(palavra) {
    const p = norm(palavra);
    let melhor = null;
    let tamanho = 0;
    let exato = false;
    for (const c of CONCEITOS) {
      for (const raiz of c.pt) {
        const e = raiz.endsWith("$");
        const r = e ? raiz.slice(0, -1) : raiz;
        if ((e ? p === r : p.startsWith(r)) && r.length > tamanho) {
          melhor = c;
          tamanho = r.length;
          exato = e || r === p;
        }
      }
    }
    // radical curto numa palavra longa ("cant" em "cantina") é palpite fraco
    return melhor ? { conceito: melhor, forte: exato || tamanho >= p.length - 3 } : null;
  }

  // Ordem: dicionário do jogo (radical colado) → léxico com a palavra exata →
  //        dicionário do jogo (radical) → léxico com a forma de dicionário ("observando" → observar)
  function conceitoDaPalavra(palavra, idioma = "pt") {
    const manual = idioma === "pt" ? buscarManual(palavra) : null;
    if (manual && manual.forte) return manual.conceito;
    // gerúndio/particípio ("observando", "running") quase sempre é verbo: vai direto para a forma de dicionário
    const flexionada = { pt: /(ando|endo|indo)$/, en: /(ing|ed)$/, es: /(ando|iendo)$/, it: /(ando|endo)$/, fr: /ant$/ }[idioma];
    const exata = flexionada && flexionada.test(norm(palavra)) ? null : buscarLexico(palavra, idioma, true);
    return exata || (manual && manual.conceito) || buscarLexico(palavra, idioma) || null;
  }

  // ---------- Léxicos do WordNet (qualquer palavra real, em 5 idiomas) ----------

  const LEXICOS = {};
  const LEXICOS_Y = {}; // Yudur: palavra → runas, gerado de ferramentas/gerar_yudur.py
  let carregando = null;

  function carregarLexicos() {
    if (!carregando) {
      const baixar = (arquivo, destino, id) =>
        fetch(`dados/${arquivo}-${id}.json`)
          .then((r) => (r.ok ? r.json() : {}))
          .then((dados) => (destino[id] = dados))
          .catch(() => (destino[id] = {}));
      carregando = Promise.all(
        Object.keys(IDIOMAS).flatMap((id) => [baixar("lexico", LEXICOS, id), baixar("yudur", LEXICOS_Y, id)])
      );
    }
    return carregando;
  }

  // Formas de dicionário possíveis de uma palavra flexionada ("casas" → casa, "running" → run)
  const REGRAS_LEMA = {
    pt: [[/amente$/, "o"], [/mente$/, ""], [/veis$/, "vel"], [/oes$/, "ao"], [/aes$/, "ao"], [/ais$/, "al"], [/eis$/, "el"], [/ns$/, "m"], [/res$/, "r"], [/zes$/, "z"], [/s$/, ""],
      [/as$/, "o"], [/a$/, "o"], [/ando$/, "ar"], [/endo$/, "er"], [/indo$/, "ir"], [/aram$/, "ar"], [/eram$/, "er"], [/iram$/, "ir"],
      [/avam$/, "ar"], [/ava$/, "ar"], [/ou$/, "ar"], [/eu$/, "er"], [/iu$/, "ir"], [/ado$/, "ar"], [/ada$/, "ar"], [/ido$/, "er"],
      [/ido$/, "ir"], [/am$/, "ar"], [/em$/, "er"], [/em$/, "ir"], [/ia$/, "er"], [/ia$/, "ir"], [/o$/, "ar"], [/o$/, "er"], [/o$/, "ir"],
      [/a$/, "ar"], [/e$/, "er"], [/e$/, "ir"], [/mos$/, "r"]],
    en: [[/ily$/, "y"], [/ly$/, ""], [/ies$/, "y"], [/ves$/, "f"], [/es$/, ""], [/s$/, ""], [/ied$/, "y"], [/(\w)\1ed$/, "$1"], [/ed$/, ""], [/ed$/, "e"],
      [/(\w)\1ing$/, "$1"], [/ing$/, ""], [/ing$/, "e"], [/ier$/, "y"], [/iest$/, "y"], [/er$/, ""], [/est$/, ""]],
    es: [[/ces$/, "z"], [/es$/, ""], [/s$/, ""], [/a$/, "o"], [/as$/, "o"], [/ando$/, "ar"], [/iendo$/, "er"], [/iendo$/, "ir"],
      [/ado$/, "ar"], [/ido$/, "er"], [/ido$/, "ir"], [/aron$/, "ar"], [/ieron$/, "er"], [/o$/, "ar"], [/o$/, "er"], [/a$/, "ar"], [/e$/, "er"]],
    fr: [[/aux$/, "al"], [/x$/, ""], [/s$/, ""], [/es$/, ""], [/e$/, ""], [/ent$/, "er"], [/ez$/, "er"], [/ons$/, "er"],
      [/ees?$/, "er"], [/e$/, "er"], [/ait$/, "er"], [/is$/, "ir"], [/it$/, "ir"]],
    it: [[/i$/, "o"], [/i$/, "e"], [/e$/, "a"], [/he$/, "a"], [/hi$/, "o"], [/ando$/, "are"], [/endo$/, "ere"], [/endo$/, "ire"],
      [/ato$/, "are"], [/uto$/, "ere"], [/ito$/, "ire"], [/o$/, "are"], [/a$/, "are"], [/e$/, "ere"]],
  };

  function formasDicionario(palavra, idioma) {
    const p = norm(palavra);
    const formas = [p];
    for (const [re, troca] of REGRAS_LEMA[idioma] || []) if (re.test(p)) formas.push(p.replace(re, troca));
    return formas;
  }

  const cacheLexico = new Map();

  // "n:casa>doente|muito" → conceito montado sobre os conceitos do dicionário
  function conceitoDoLexico(palavra, idioma, codigo) {
    const id = `lex:${idioma}:${palavra}`;
    if (cacheLexico.has(id)) return cacheLexico.get(id);
    const [, tipo, resto] = codigo.match(/^(\w):(.*)$/);
    const [corpo, tamanho] = resto.split("|");
    let [cabeca, mod] = corpo.split(">");
    let neg = false;
    if (tipo === "a") {
      neg = cabeca.startsWith("!");
      cabeca = cabeca.replace("!", "");
    }
    const base = conceitoPorId.get(cabeca);
    let f;
    if (!mod) f = { n: cabeca };
    else if (tipo === "v" && base && base.f.r && !base.f.n && !base.f.a) f = { r: base.f.r, a: mod, neg: base.f.neg };
    else f = { n: cabeca, r: "conter", a: mod };
    if (neg) f.neg = true;
    if (tamanho) f.mod = tamanho;
    // sem modificador, a palavra é o próprio conceito-âncora
    const c = !mod && !neg && !tamanho && base
      ? base
      : { id, cat: "Léxico", pt: [], f, lexico: { palavra, idioma, cabeca, mod } };
    cacheLexico.set(id, c);
    return c;
  }

  function buscarLexico(palavra, idioma, soExata = false) {
    const lex = LEXICOS[idioma];
    if (!lex) return null;
    const formas = soExata ? [norm(palavra)] : formasDicionario(palavra, idioma);
    for (const forma of formas) {
      if (lex[forma]) return conceitoDoLexico(forma, idioma, lex[forma]);
    }
    return soExata || idioma === "en" ? null : buscarCognato(formas);
  }

  // Línguas latinas: palavra que falta no léxico próprio costuma ter um "primo" em inglês
  // (inevitável → inevitable, aparente → apparent, múltiplo → multiple, natural → natural)
  const COGNATOS = [
    [/vel$/, "ble"], [/vel$/, "able"], [/ente$/, "ent"], [/ante$/, "ant"], [/cao$/, "tion"], [/sao$/, "sion"],
    [/dade$/, "ty"], [/tad$/, "ty"], [/ico$/, "ic"], [/ica$/, "ic"], [/oso$/, "ous"], [/osa$/, "ous"], [/ivo$/, "ive"],
    [/iva$/, "ive"], [/o$/, "e"], [/a$/, "e"], [/o$/, ""], [/a$/, ""], [/e$/, ""], [/ir$/, "e"], [/ar$/, "ate"],
    [/plo$/, "ple"], [/ta$/, "te"], [/to$/, "te"],
  ];

  function buscarCognato(formas) {
    const en = LEXICOS.en;
    if (!en) return null;
    for (const forma of formas) {
      if (forma.length < 5) continue; // palavras curtas dão falso parente demais
      const candidatos = [forma, ...COGNATOS.filter(([re]) => re.test(forma)).map(([re, t]) => forma.replace(re, t))];
      for (const c of candidatos) if (en[c]) return conceitoDoLexico(c, "en", en[c]);
    }
    return null;
  }

  // Idioma com mais palavras reconhecidas (palavras de ligação valem mais: são as mais típicas)
  function detectarIdioma(texto) {
    const palavras = (texto.match(/[\p{L}]+/gu) || []).map(norm);
    if (!palavras.length) return "pt";
    let melhor = "pt";
    let pontos = -1;
    for (const id of Object.keys(IDIOMAS)) {
      let p = 0;
      for (const w of palavras) {
        if (LIGACAO_IDIOMA[id].has(w)) p += 2;
        else if (LEXICOS[id] && formasDicionario(w, id).some((f) => LEXICOS[id][f])) p += 1;
        else if (id === "pt" && buscarManual(w)?.forte) p += 1;
      }
      if (p > pontos) {
        pontos = p;
        melhor = id;
      }
    }
    return melhor;
  }

  function tipoDe(c) {
    if (c.tipo) return c.tipo;
    if (c.f.r && !c.f.n) return c.f.a ? "verbo-completo" : "verbo";
    return "nucleo";
  }

  // Quebra o texto em peças: conceito, modificador, nome próprio ou ligação
  // buscador: como achar o sentido de uma palavra (padrão: conceitos do X/Z; o Yudur passa o seu)
  function analisar(texto, idioma = "auto", buscador = null) {
    const pecas = [];
    pecas.idioma = idioma === "auto" ? detectarIdioma(texto) : idioma;
    const frases = texto.split(/([.!?;\n]+)/);
    for (const trecho of frases) {
      if (/^[.!?;\n]+$/.test(trecho)) {
        pecas.push({ tipo: "fim-frase" });
        continue;
      }
      // cada frase pode estar num idioma diferente
      const idiomaFrase = idioma === "auto" && trecho.trim() ? detectarIdioma(trecho) : pecas.idioma;
      const ligacao = LIGACAO_IDIOMA[idiomaFrase];
      const palavras = trecho.match(/"[^"]+"|[\p{L}\p{N}-]+/gu) || [];
      palavras.forEach((bruta) => {
        if (bruta.startsWith('"')) return pecas.push({ tipo: "nome", palavra: bruta.replace(/"/g, "") });
        // "tornou-se", "ajustou-se": o pronome colado não muda o conceito
        const original = bruta.includes("-") ? bruta.split("-")[0] || bruta : bruta;
        const n = norm(original);
        // a ligação do idioma vem primeiro: o "no" do português não é o "no" do inglês
        if (ligacao.has(n)) return pecas.push({ tipo: "ligacao", palavra: original });
        for (const [mod, lados] of Object.entries(MODIFICADORES)) {
          if (lados.antes.includes(n)) return pecas.push({ tipo: "mod", mod, lado: "antes", palavra: original });
          if (lados.depois.includes(n)) return pecas.push({ tipo: "mod", mod, lado: "depois", palavra: original });
        }
        if (buscador) {
          const y = buscador(original, idiomaFrase);
          if (y) return pecas.push({ tipo: "y", y, palavra: original });
        } else {
          const c = conceitoDaPalavra(original, idiomaFrase);
          if (c) return pecas.push({ tipo: tipoDe(c), conceito: c, palavra: original });
        }
        // Palavra com maiúscula que não está no dicionário = nome próprio; o resto fica sem tradução
        const nome = /^\p{Lu}/u.test(original);
        pecas.push({ tipo: nome ? "nome" : "sem-conceito", palavra: original });
      });
    }
    return pecas;
  }

  // ---------- Montar uma frase em cada língua ----------

  // Aplica um modificador a uma escrita já pronta
  function modificar(escrita, mod, lang) {
    if (lang === "x") return modoX(escrita, mod);
    if (lang === "y") {
      if (mod === "nao") return "ᚾ" + escrita;
      if (QUANTIFICADORES[mod]) return QUANTIFICADORES[mod].y + escrita;
      return mod === "muito" ? escrita + escrita : escrita + "᛫";
    }
    if (mod === "nao") return "⊘" + escrita;
    if (mod === "nenhum") return "⊘" + escrita;
    if (mod === "todo") return escrita.includes("|") ? `${escrita} ⇈` : `${escrita} | ⇈`;
    return escrita.includes("|") ? `${escrita} ${RAIZES[mod].z}` : `${escrita} | ${RAIZES[mod].z}`;
  }

  function aplicarEstado(escrita, estado, lang) {
    const s = RAIZES[estado][lang];
    if (lang === "x") return estadoX(escrita, estado);
    if (lang === "y") return ["instavel", "latente"].includes(estado) ? s + escrita : escrita + s;
    return escrita.includes("|") ? `${escrita} ${s}` : `${escrita} | ${s}`;
  }

  // Devolve [{ escrita, origem: [peças] }] — cada bloco é uma unidade escrita na língua
  function frase(texto, lang, idioma = "auto") {
    if (lang === "y") return Yudur.frase(texto, idioma);
    const pecas = analisar(texto, idioma);
    const blocos = [];
    const pendentes = [];
    let temImplica = false;
    const ultimo = () => blocos[blocos.length - 1];

    for (let i = 0; i < pecas.length; i++) {
      const p = pecas[i];
      if (p.tipo === "fim-frase") {
        blocos.push({ quebra: true });
        temImplica = false;
        continue;
      }
      if (p.tipo === "ligacao") continue;
      // nada fica sem símbolo: palavra que nenhum dicionário conhece é escrita letra a letra
      if (p.tipo === "sem-conceito") {
        blocos.push({ escrita: transcrever(p.palavra, lang), pecas: [p], nome: true });
        continue;
      }
      if (p.tipo === "mod") {
        if (p.lado === "antes") pendentes.push(p.mod);
        else if (ultimo() && !ultimo().quebra && !ultimo().sintaxe) {
          ultimo().escrita = modificar(ultimo().escrita, p.mod, lang);
          ultimo().pecas.push(p);
        }
        continue;
      }
      if (p.tipo === "nome") {
        blocos.push({ escrita: transcrever(p.palavra, lang), pecas: [p], nome: true });
        continue;
      }
      const c = p.conceito;
      let escrita = escrever(c, lang);
      // "muitas casas", "nenhuma pessoa": o modificador que veio antes vale para esta palavra
      while (pendentes.length) escrita = modificar(escrita, pendentes.pop(), lang);

      if (p.tipo === "estado") {
        if (ultimo() && !ultimo().quebra && !ultimo().sintaxe) {
          ultimo().escrita = aplicarEstado(ultimo().escrita, c.f.e, lang);
          ultimo().pecas.push(p);
        } else blocos.push({ escrita, pecas: [p] });
        continue;
      }

      if (lang === "x") {
        // tempo se prende ao conceito anterior: ψ(t)
        if (p.tipo === "tempo" && ultimo() && !ultimo().quebra && !ultimo().sintaxe && !ultimo().tempo) {
          ultimo().escrita += `(${escrita})`;
          ultimo().tempo = true;
          ultimo().pecas.push(p);
          continue;
        }
        if (p.tipo === "verbo" || p.tipo === "verbo-completo" || p.tipo === "resultado") {
          const temAntes = ultimo() && !ultimo().quebra;
          // "gerando mudança" vira só "→ Δ"
          const prox = pecas.slice(i + 1).find((q) => !["ligacao", "sem-conceito"].includes(q.tipo));
          if (p.tipo === "verbo" && c.f.r === "gerar" && prox && prox.tipo === "resultado") continue;
          if (p.tipo === "resultado") {
            blocos.push({ escrita: "→", sintaxe: true });
            blocos.push({ escrita, pecas: [p] });
            continue;
          }
          if (temAntes && !temImplica) {
            blocos.push({ escrita: "⇒", sintaxe: true });
            temImplica = true;
          }
          // verbo sem objeto pega o próximo conceito como argumento: 𝒪(S)
          if (p.tipo === "verbo" && prox && ["nucleo", "existir", "tempo"].includes(prox.tipo)) {
            const j = pecas.indexOf(prox);
            const arg = escrever(prox.conceito, lang);
            blocos.push({ escrita: `${escrita}(${arg})`, pecas: [p, prox] });
            i = j;
            continue;
          }
        }
      }
      blocos.push({ escrita, pecas: [p], tipo: p.tipo });
    }
    return blocos;
  }

  // ---------- Conhecimento ----------
  // X e Z: o personagem conhece elementos (símbolos). Y: conhece runas (as cartas).

  function elementos(lang) {
    const lista = [];
    for (const [id, r] of Object.entries(RAIZES)) {
      if (lang === "x" && r.xComposto) continue;
      if (lang === "y") continue;
      if (id === "muito" && lang === "y") continue;
      lista.push({ s: r[lang], nome: r.nome, tipo: r.tipo, id });
    }
    if (lang === "x") X_EXTRAS.forEach((t) => lista.push({ s: t.s, nome: t.nome, tipo: t.tipo, id: "x-" + t.nome }));
    lista.push({ s: lang === "x" ? "⟨𝔸𝔹ℂ⟩" : "⟨⠁⠃⠉⟩", nome: "alfabeto de nomeação", tipo: "nomes", id: "nomes" });
    return lista;
  }

  const ELEM = { x: elementos("x"), z: elementos("z") };
  const ORDENADOS = {
    x: ELEM.x.filter((e) => e.id !== "nomes").sort((a, b) => b.s.length - a.s.length),
    z: ELEM.z.filter((e) => e.id !== "nomes").sort((a, b) => b.s.length - a.s.length),
  };
  const SINTAXE = { x: new Set(Array.from("()[]⟨⟩ ·⇒→,d/=")), z: new Set(Array.from(" |()⟨⟩·")) };
  const NOMES_SET = { x: new Set(Array.from(NOMES_X)), z: new Set(Array.from(NOMES_Z)) };

  // Quebra uma escrita em símbolos conhecidos da língua
  function tokens(escrita, lang) {
    const out = [];
    const chars = Array.from(escrita);
    for (let i = 0; i < chars.length; ) {
      const ch = chars[i];
      if (lang === "y") {
        out.push({ s: ch, runa: Boolean(ch.trim()) && !"·᛫() ".includes(ch) });
        i++;
        continue;
      }
      if (SINTAXE[lang].has(ch)) {
        out.push({ s: ch, sintaxe: true });
        i++;
        continue;
      }
      const resto = chars.slice(i).join("");
      const el = ORDENADOS[lang].find((e) => resto.startsWith(e.s));
      if (el) {
        out.push({ s: el.s, id: el.id });
        i += Array.from(el.s).length;
      } else if (NOMES_SET[lang].has(ch)) {
        out.push({ s: ch, id: "nomes" });
        i++;
      } else {
        out.push({ s: ch, sintaxe: true });
        i++;
      }
    }
    return out;
  }

  function conhecidos(p, lang) {
    if (!p) return null; // sem personagem = sem filtro
    if (lang === "y") return new Set(p.runas || []);
    return new Set((p.linguas && p.linguas[lang]) || []);
  }

  // Escreve mostrando só o que o personagem conhece; o resto vira ░
  function filtrar(escrita, lang, p) {
    const sabe = conhecidos(p, lang);
    if (!sabe) return { escrita, completo: true };
    let completo = true;
    const s = tokens(escrita, lang)
      .map((t) => {
        if (lang === "y") {
          if (!t.runa || sabe.has(t.s)) return t.s;
          completo = false;
          return "░";
        }
        if (t.sintaxe || sabe.has(t.id)) return t.s;
        completo = false;
        return "░";
      })
      .join("");
    return { escrita: s, completo };
  }

  function conhece(c, lang, p) {
    return filtrar(escrever(c, lang), lang, p).completo;
  }

  // ---------- Decodificar ----------

  let reverso = null;
  function montarReverso() {
    reverso = {};
    for (const lang of ["x", "y", "z"]) {
      const mapa = new Map();
      for (const c of CONCEITOS) {
        const s = escrever(c, lang);
        if (!mapa.has(s)) mapa.set(s, c);
      }
      reverso[lang] = [...mapa.entries()].sort((a, b) => Array.from(b[0]).length - Array.from(a[0]).length);
    }
  }

  // Lê uma sequência de símbolos: conceitos inteiros primeiro, depois elementos soltos
  function decodificar(texto, lang, p) {
    if (!reverso) montarReverso();
    const pedacos = [];
    let i = 0;
    const chars = Array.from(texto);
    while (i < chars.length) {
      const resto = chars.slice(i).join("");
      if (/^\s/.test(resto) || (lang === "y" && "·᛫".includes(chars[i]))) {
        i++;
        continue;
      }
      // nome entre ⟨ ⟩
      if (resto.startsWith("⟨")) {
        const fim = resto.indexOf("⟩");
        const dentro = Array.from(resto.slice(1, fim > 0 ? fim : undefined));
        const alfabeto = Array.from(lang === "x" ? NOMES_X : NOMES_Z);
        const nome = dentro.map((ch) => (alfabeto.indexOf(ch) >= 0 ? String.fromCharCode(65 + alfabeto.indexOf(ch)) : "?")).join("");
        pedacos.push({ s: "⟨" + dentro.join("") + "⟩", leitura: nome, tipo: "nome", conhecido: !p || conhecidos(p, lang)?.has("nomes") });
        i += dentro.length + (fim > 0 ? 2 : 1);
        continue;
      }
      const achado = reverso[lang].find(([s]) => s.length > 1 && resto.startsWith(s));
      if (achado) {
        const [s, c] = achado;
        pedacos.push({ s, leitura: rotulo(c).toLowerCase(), conceito: c, conhecido: conhece(c, lang, p) });
        i += Array.from(s).length;
        continue;
      }
      // elemento solto
      if (lang === "y") {
        const ch = chars[i];
        const letras = Object.entries(RUNAS).filter(([, r]) => r === ch).map(([l]) => l).join("/");
        const conceitoRaiz = Object.entries(RAIZES).find(([, r]) => r.y === ch);
        pedacos.push({
          s: ch,
          leitura: conceitoRaiz ? conceitoRaiz[1].nome : letras || ch,
          letras,
          conhecido: !p || (p.runas || []).includes(ch),
        });
        i++;
        continue;
      }
      const el = ORDENADOS[lang].find((e) => resto.startsWith(e.s));
      if (el) {
        pedacos.push({ s: el.s, leitura: el.nome, conhecido: !p || conhecidos(p, lang).has(el.id) });
        i += Array.from(el.s).length;
      } else {
        pedacos.push({ s: chars[i], leitura: SINTAXE[lang]?.has(chars[i]) ? chars[i] : "?", sintaxe: SINTAXE[lang]?.has(chars[i]) });
        i++;
      }
    }
    return pedacos;
  }

  // ---------- Conhecimento total (para o personagem de teste) ----------

  function tudo() {
    return {
      x: ELEM.x.map((e) => e.id),
      z: ELEM.z.map((e) => e.id),
      y: [...new Set([...Object.values(RUNAS), ...Object.keys(RUNAS_EXTRAS)])],
    };
  }

  const rotulo = (c) => ROTULOS[c.id] || c.id.charAt(0).toUpperCase() + c.id.slice(1);

  // =================================================================
  // Yudur (Eixo Y): vocabulário próprio, independente das fórmulas do X e do Z
  // =================================================================
  const Yudur = (() => {
    const PALAVRAS = YUDUR.palavras.map(([palavra, runas, leitura, cat, pt]) => ({
      palavra, runas, leitura, cat, pt: pt.split(/\s+/).filter(Boolean),
    }));
    const porRunas = new Map();
    PALAVRAS.forEach((w) => { if (!porRunas.has(w.runas)) porRunas.set(w.runas, w); });
    const imagem = (r) => (YUDUR.runas[r] ? YUDUR.runas[r][0] : r === "᛫" ? "pequeno" : r);
    const leituraDasRunas = (runas) => Array.from(runas).map(imagem).join(" · ");

    function buscarManualY(palavra) {
      const p = norm(palavra);
      let melhor = null;
      let tamanho = 0;
      let exato = false;
      for (const w of PALAVRAS) {
        for (const raiz of w.pt) {
          const e = raiz.endsWith("$");
          const r = e ? raiz.slice(0, -1) : raiz;
          if ((e ? p === r : p.startsWith(r)) && r.length > tamanho) {
            melhor = w;
            tamanho = r.length;
            exato = e || r === p;
          }
        }
      }
      return melhor ? { w: melhor, forte: exato || tamanho >= p.length - 3 } : null;
    }

    // Uma palavra gerada pelo léxico ganha o nome e a leitura da palavra feita à mão com as mesmas runas
    function deRunas(runas, palavra, fonte) {
      const w = porRunas.get(runas);
      return w ? { ...w, fonte, original: palavra } : { palavra, runas, leitura: leituraDasRunas(runas), cat: "Léxico", fonte, original: palavra };
    }

    function buscarLexicoY(palavra, idioma, soExata) {
      const lex = LEXICOS_Y[idioma];
      if (!lex) return null;
      const formas = soExata ? [norm(palavra)] : formasDicionario(palavra, idioma);
      for (const f of formas) if (lex[f]) return deRunas(lex[f], f, "léxico");
      if (soExata || idioma === "en" || !LEXICOS_Y.en) return null;
      for (const f of formas) {
        if (f.length < 5) continue;
        const candidatos = [f, ...COGNATOS.filter(([re]) => re.test(f)).map(([re, t]) => f.replace(re, t))];
        for (const c of candidatos) if (LEXICOS_Y.en[c]) return deRunas(LEXICOS_Y.en[c], c, "léxico");
      }
      return null;
    }

    function palavraY(palavra, idioma = "pt") {
      const manual = idioma === "pt" ? buscarManualY(palavra) : null;
      if (manual && manual.forte) return { ...manual.w, fonte: "vocabulário" };
      const flexionada = { pt: /(ando|endo|indo)$/, en: /(ing|ed)$/, es: /(ando|iendo)$/, it: /(ando|endo)$/, fr: /ant$/ }[idioma];
      const exata = flexionada && flexionada.test(norm(palavra)) ? null : buscarLexicoY(palavra, idioma, true);
      return exata || (manual && { ...manual.w, fonte: "vocabulário" }) || buscarLexicoY(palavra, idioma, false) || null;
    }

    // ---------- Conhecimento ----------
    // Saber a runa = saber a letra e a imagem dela (e as palavras de uma runa só).
    // Palavras compostas são aprendidas uma a uma (p.vocabY guarda as runas de cada palavra aprendida).
    const sabeLetra = (p, r) => !p || r === "᛫" || (p.runas || []).includes(r);
    function sabePalavra(p, runas) {
      if (!p || p.vocabTotal) return true;
      const letras = Array.from(runas).filter((r) => r !== "᛫");
      if (letras.length === 1) return sabeLetra(p, letras[0]);
      return (p.vocabY || []).includes(runas);
    }
    const letrasFiltradas = (texto, p) => Array.from(texto).map((r) => (sabeLetra(p, r) ? r : "░")).join("");

    // ---------- Frase ----------
    function modificar(runas, mod) {
      if (mod === "nao" || mod === "nenhum") return "ᚾ" + runas;
      if (mod === "pouco") return runas + "᛫";
      return runas + runas; // muito / todo: runa repetida amplifica
    }

    function frase(texto, idioma = "auto") {
      const pecas = analisar(texto, idioma, palavraY);
      const blocos = [];
      const pendentes = [];
      const ultimo = () => blocos[blocos.length - 1];
      for (const p of pecas) {
        if (p.tipo === "fim-frase") {
          blocos.push({ quebra: true });
          continue;
        }
        if (p.tipo === "ligacao") continue;
        if (p.tipo === "mod") {
          if (p.lado === "antes") pendentes.push(p.mod);
          else if (ultimo() && !ultimo().quebra && ultimo().y) ultimo().runas = modificar(ultimo().runas, p.mod);
          continue;
        }
        if (p.tipo === "y") {
          let runas = p.y.runas;
          while (pendentes.length) runas = modificar(runas, pendentes.pop());
          blocos.push({ y: p.y, runas, palavra: p.palavra, escrita: runas });
        } else {
          // nome próprio ou palavra sem sentido no Yudur: escrita letra a letra
          blocos.push({ nome: true, palavra: p.palavra, escrita: transcrever(p.palavra, "y") });
        }
      }
      blocos.idioma = pecas.idioma;
      return blocos;
    }

    // Como um personagem escreve o bloco: palavra conhecida → runas sagradas; desconhecida → letra a letra
    function escreverPara(bloco, p) {
      if (bloco.y && sabePalavra(p, bloco.y.runas)) return { escrita: bloco.runas, sagrada: true, conhecida: true };
      const fonetica = bloco.nome ? bloco.escrita : transcrever(bloco.palavra, "y");
      return { escrita: letrasFiltradas(fonetica, p), sagrada: false, conhecida: false };
    }

    // ---------- Ler runas ----------
    function decodificar(texto, p) {
      return texto.split(/[\s·]+/).filter(Boolean).map((palavra) => {
        const w = porRunas.get(palavra);
        if (w) {
          const ok = sabePalavra(p, w.runas);
          return { s: palavra, leitura: ok ? w.palavra : "?", conhecido: ok, dica: ok ? w.leitura : leituraConhecida(palavra, p) };
        }
        // não é palavra do vocabulário: lê como letras
        const letras = Array.from(palavra).map((r) => (sabeLetra(p, r) ? Object.entries(RUNAS).find(([, v]) => v === r)?.[0] || "?" : "?")).join("");
        return { s: palavra, leitura: letras, conhecido: !letras.includes("?"), dica: "lido letra a letra" };
      });
    }

    // Pista para palavras desconhecidas: a imagem das runas que o personagem conhece
    const leituraConhecida = (runas, p) => Array.from(runas).map((r) => (sabeLetra(p, r) ? imagem(r) : "?")).join(" · ");

    return {
      PALAVRAS, palavraY, frase, escreverPara, decodificar, sabePalavra, sabeLetra, leituraDasRunas, imagem,
      inicial: (papel) => YUDUR.vocabularioInicial[papel] || [],
    };
  })();

  return {
    escrever, explicar, transcrever, analisar, frase, filtrar, conhece, decodificar, elementos: (lang) => ELEM[lang], tudo,
    conceitoDaPalavra, rotulo, carregarLexicos, detectarIdioma, Yudur,
    lexicosProntos: () => Object.keys(LEXICOS_Y).length === Object.keys(IDIOMAS).length,
  };
})();
