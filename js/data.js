// Dados do jogo KOSMOS — tudo que é regra ou texto do mundo fica aqui,
// para poder ser ajustado sem mexer no resto do código.

// Trilha sonora (vídeos da playlist "KOSMUS" no YouTube Music). Cada contexto toca a sua lista, em loop.
//   Fora de missão (abertura, personagens, criação, ficha, tradutor, Mesa) → "inicio", com Solar Wind.
//   Dentro de uma missão → a lista do eixo da missão (Urbano → x, Medieval → y, Espacial → z).
// Para mudar, é só mover os ids entre as listas.
const MUSICA = {
  contextos: {
    // tudo fora de missão. Solar Wind sempre primeiro.
    inicio: [
      "iDGU-Zyhjgk", // Solar Wind (feat. Steve Vai) — Matteo Mancuso
      // ainda sem eixo definido: tocam aqui até o autor decidir
      "8-UdX0PTP5I", // Aeolia — tonelabs
      "oTNV3q1HU7Q", // Eugene's Trick Bag — Steve Vai
      "pXMgPbMYIA8", // Teeth of the Hydra — Steve Vai
      "RVfGFmBFgoc", // Shape Of My Heart — Sting
      "taBM9cRUxog", // Shape Of My Heart — Blended Colours
      "gjFDkcEaKFw", // Shape of My Heart (Daft Punk Style) — PUBG Punk
      "YdaWQBkUfrY", // Shape of My Heart (A Minor Records Cypher) — toowhite
      "s5oSscNIyIs", // DAISIES — Justin Bieber
    ],
    // missões (incluindo os prólogos): as músicas do eixo
    x: [
      // "W9-KSIYmik8", // Tender Surrender — Steve Vai: a gravadora bloqueia tocar fora do YouTube. Trocar por outra versão.
      "lQpf8pW2YOw", // Like Always. Theme — GatiS
    ],
    y: [
      "nm2pykKggjE", // Home in the Shire — Ambient Worlds
      "3AXn5Qlbvqw", // Shape Of My Heart (Bardcore) — Early Style   · todo bardcore é Eixo Y
      "ADDluJUpEso", // Shape of my Heart (Bardcore Medieval Cover) — YAREMA
    ],
    z: [
      "fpl80fEhdts", // Cylinder Five — Chris Zabriskie
      "W3p_xIL75uk", // Sakura Serenity
      "lQpf8pW2YOw", // Like Always. Theme — GatiS
    ],
  },
  // Faixas que passam a tocar também na tela inicial depois de tocarem numa missão
  desbloqueiaInicio: ["lQpf8pW2YOw"],
};

// Os três eixos. Cada personagem existe nos três, mas começa conhecendo só um.
// Papéis, atributos e exposição são "traduzidos" pela mesma chave entre os eixos.
const EIXOS = {
  x: {
    id: "x",
    nome: "Eixo X",
    mundo: "Urbano",
    glifo: "∃",
    lema: "A população começa lentamente a perder individualidade.",
    descricao: "Horror de sobrevivência urbano: a cidade enlouquece numa noite. Comida, abrigo, gente para proteger e Riscadores nas ruas. A presença da Entidade gera radiação anômala, surtos e interferências elétricas.",
    papelRotulo: "Profissão",
    papeis: {
      tank: { nome: "Agente de Campo / Segurança", desc: "Linha de frente nas zonas de surto. Contém, protege, resiste." },
      healer: { nome: "Psiquiatra", desc: "Trata mentes em colapso. Entende os Ecoados melhor que ninguém." },
      support: { nome: "Especialista em Radiação / Epidemiologista", desc: "Mede, mapeia e prevê os picos de radiação anômala." },
    },
    atributos: {
      corpo: { nome: "Força", desc: "força física" },
      mente: { nome: "Mente", desc: "resistência aos efeitos da radiação" },
      essencia: { nome: "Espírito", desc: "baixo tende a Ecoado, alto tende a Desperto" },
    },
    exposicao: {
      nome: "Nível de Radiação",
      desc: "Tendência a tornar-se Ecoado ou Desperto.",
      limite: null,
      efeitos: "Quanto maior, mais perto de tornar-se Ecoado (ou Desperto, se o Espírito for alto).",
    },
    extra: null,
    afetados: "Ecoados / Despertos",
  },
  y: {
    id: "y",
    nome: "Eixo Y",
    mundo: "Medieval",
    glifo: "ᛉ",
    lema: "Muitos acreditam que a Tabula foi enviada pelos deuses.",
    descricao: "Fantasia sombria, horror religioso e investigação rúnica. O fenômeno é lido como magia, heresia ou linguagem proibida.",
    papelRotulo: "Classe",
    papeis: {
      tank: { nome: "Cavaleiro", desc: "Aço, juramento e a muralha entre o povo e o desconhecido." },
      healer: { nome: "Paladino", desc: "Cura, protege e conjura. Fé e lâmina na mesma mão." },
      support: { nome: "Oráculo Rúnico", desc: "Lê e traça runas. Treinado no Mosteiro de Yudur." },
    },
    atributos: {
      corpo: { nome: "Corpo", desc: "força física" },
      mente: { nome: "Mente", desc: "leitura de runas / resistência ao efeito das runas" },
      essencia: { nome: "Mana", desc: "poderes mágicos / resistência a tornar-se Runático" },
    },
    exposicao: {
      nome: "Influência de Runa",
      desc: "Quanto maior, mais próximo de um Runático.",
      limite: 15,
      efeitos: "Acima de 15: falar sozinho, escrever runas aleatórias. No máximo: Runático completo.",
    },
    extra: { tipo: "runas", nome: "Runas Conhecidas" },
    afetados: "Runáticos",
  },
  z: {
    id: "z",
    nome: "Eixo Z",
    mundo: "Espacial",
    glifo: "◉",
    lema: "A estrela responde à observação.",
    descricao: "Horror cósmico e exploração espacial. A humanidade detecta uma estrela anômala que aprende e altera a realidade local.",
    papelRotulo: "Profissão",
    papeis: {
      tank: { nome: "Oficial de Segurança", desc: "Protege a tripulação do que vem de fora — e de dentro." },
      healer: { nome: "Médico da Equipe", desc: "Mantém corpos e mentes funcionando longe de casa." },
      support: { nome: "Analista de Dados Estelares", desc: "Traduz os padrões da estrela em algo que humanos entendam." },
    },
    atributos: {
      corpo: { nome: "Físico", desc: "força física" },
      mente: { nome: "Mente", desc: "leitura de dados" },
      essencia: { nome: "Sintonia", desc: "resistência ao Campo Estelar" },
    },
    exposicao: {
      nome: "Sintonia Quântica",
      desc: "Quanto maior, mais Integração.",
      limite: 20,
      efeitos: "Acima de 20: reflexividade, andar lento, excesso de lucidez, sensação de “chegou minha hora”. No máximo: Integração — fim de jogo.",
    },
    extra: null,
    afetados: "Interfaces",
  },
};

const ORDEM_EIXOS = ["x", "y", "z"];
const PAPEIS = { tank: "Tank", healer: "Healer", support: "Support" };

const REGRAS = {
  pontosIniciais: 4,
  atributoMax: 10,
  exposicaoMax: 39,
  ressonanciaMax: 30,
  tracosMin: 2,
  tracosMax: 3,
  habilidades: 3,
};

// Sistema de dados: parada de d6.
// Rola (atributo + 1) d6; cada 5 ou 6 é um sucesso; a dificuldade diz quantos sucessos são necessários.
// Cada 1 rolado é um "sinal" da Entidade — o mestre pode cobrar +1 de exposição por sinal.
const DADOS = {
  faces: 6,
  sucessoMin: 5,
  sinal: 1,
  dadosExtras: 1, // dados = atributo + 1
  dificuldades: { 1: "Normal", 2: "Difícil", 3: "Extremo" },
  historico: 30,
};

// Teste de Convergência: exposição intensa → rola com a essência do eixo (Espírito / Mana / Sintonia).
// Passou → + Ressonância (aceita o fenômeno). Falhou → + Dissonância (resiste no caos).
// A exposição do eixo sobe sempre. A intensidade diz quantos pontos.
const CONVERGENCIA = {
  atributo: "essencia",
  tags: ["convergencia"],
  dificuldade: 1,
  intensidades: { 1: "Leve", 2: "Intensa", 3: "Avassaladora" },
};

// ---------- Habilidades e equipamentos ----------
// Cada item existe nos três eixos com nomes diferentes (a ficha se "traduz").
// usos: "passiva" (sempre vale), ou { cena: n } / { sessao: n } — renovam em "Nova cena" / "Nova sessão".
// dados: quantos dados extras dá nos testes dos atributos listados.
// acao: efeito usado direto da ficha (reduzir exposição, dissonância…).

const LIMITES = {
  pontosHabilidade: 3, // para gastar na criação
  cargaBase: 3, // carga = cargaBase + Corpo (Força / Corpo / Físico)
};

// tags: em que situações o item ajuda (ver SITUACOES). pistas: palavras da descrição do personagem
// que fazem o jogo sugerir aquela habilidade.
const HABILIDADES = [
  { chave: "conducao", custo: 1, usos: { cena: 1 }, tags: ["fuga"], dados: 2,
    efeito: "+2 dados para fugir, perseguir ou manobrar.",
    pistas: ["motorista", "piloto", "taxista", "caminhoneir", "uber", "carro", "dirig", "corrida", "entregador", "motoboy", "cavalari"],
    nomes: { x: "Direção Defensiva", y: "Montaria", z: "Pilotagem" } },
  { chave: "combate", custo: 2, usos: { cena: 1 }, tags: ["combate", "proteger"], dados: 2,
    efeito: "+2 dados para lutar ou proteger alguém.",
    pistas: ["policial", "soldado", "militar", "seguranca", "lutador", "boxe", "guarda", "cavaleiro", "mercenari", "marciais", "vigilante"],
    nomes: { x: "Defesa Pessoal", y: "Esgrima", z: "Combate em Gravidade Zero" } },
  { chave: "vigor", custo: 1, usos: "passiva", tags: ["forca", "fuga", "combate"], dados: 1,
    efeito: "+1 dado sempre que o corpo é exigido (forçar, fugir, lutar).",
    pistas: ["atleta", "esport", "bombeir", "academia", "operari", "pedreir", "corredor", "ferreir", "estivador", "fazendeir"],
    nomes: { x: "Condicionamento Físico", y: "Resistência de Batalha", z: "Treino de Adaptação" } },
  { chave: "investigacao", custo: 1, usos: { cena: 1 }, tags: ["investigar"], dados: 2,
    efeito: "+2 dados para procurar pistas.",
    pistas: ["detetive", "jornalista", "investig", "pesquisador", "cientista", "estudante", "professor", "analista", "bibliotecari", "reporter"],
    nomes: { x: "Investigação", y: "Erudição", z: "Análise de Padrões" } },
  { chave: "simbolos", custo: 2, usos: { cena: 1 }, tags: ["simbolos"], dados: 2,
    efeito: "+2 dados para ler símbolos da Convergência.",
    pistas: ["linguista", "matematic", "programador", "hacker", "criptograf", "escriba", "arqueolog", "simbolo", "runa", "tradutor"],
    nomes: { x: "Criptografia Urbana", y: "Leitura Rúnica", z: "Decodificação de Sinais" } },
  { chave: "conversa", custo: 1, usos: { cena: 1 }, tags: ["social"], dados: 2,
    efeito: "+2 dados para convencer ou acalmar alguém — inclusive afetados.",
    pistas: ["vendedor", "advogad", "negociador", "diplomata", "politic", "atendente", "comerciante", "mercador", "corretor", "bardo"],
    nomes: { x: "Negociação", y: "Diplomacia", z: "Protocolo de Contato" } },
  { chave: "cuidado", custo: 2, usos: { sessao: 1 }, acao: { reduz: "exposicao", qtd: 2 },
    efeito: "Remove 2 de exposição do eixo atual.",
    pistas: ["medic", "enfermeir", "psicolog", "psiquiatra", "terapeuta", "curandeir", "paramedic", "cuidador", "farmaceutic"],
    nomes: { x: "Intervenção de Crise", y: "Imposição de Mãos", z: "Protocolo Médico" } },
  { chave: "ancora", custo: 2, usos: { sessao: 1 }, rerrolar: "convergencia",
    efeito: "Rola de novo um Teste de Convergência.",
    pistas: ["religios", "padre", "freira", "pastor", "monge", "rotina", "meditac", "disciplin", "devot"],
    nomes: { x: "Rotina Inabalável", y: "Oração", z: "Meditação Orbital" } },
];

const EQUIPAMENTOS = [
  { chave: "comunicador", peso: 1, usos: "passiva", tags: ["investigar", "social"], dados: 1,
    efeito: "+1 dado para conseguir informação ou ajuda.",
    nomes: { x: "Smartphone", y: "Corvo Mensageiro", z: "Comunicador de Pulso" } },
  { chave: "veiculo", peso: 3, usos: "passiva", tags: ["fuga"], dados: 1,
    efeito: "+1 dado para fugir. Leva você longe.",
    nomes: { x: "Carro", y: "Cavalo", z: "Módulo de Transporte" } },
  { chave: "luz", peso: 1, usos: "passiva", tags: ["investigar", "perigo"], dados: 1,
    efeito: "+1 dado para procurar e perceber no escuro.",
    nomes: { x: "Lanterna", y: "Tocha", z: "Holofote de Capacete" } },
  { chave: "arma_leve", peso: 1, usos: { cena: 2 }, tags: ["combate"], dados: 1,
    efeito: "+1 dado para lutar.",
    nomes: { x: "Pistola", y: "Adaga", z: "Pistola de Pulso" } },
  { chave: "arma_pesada", peso: 2, usos: { cena: 1 }, tags: ["combate"], dados: 2,
    efeito: "+2 dados para lutar. Chama atenção.",
    nomes: { x: "Espingarda", y: "Espada Longa", z: "Rifle de Plasma" } },
  { chave: "protecao", peso: 2, usos: "passiva", tags: ["proteger", "forca"], dados: 1,
    efeito: "+1 dado para proteger alguém e resistir a ferimentos.",
    nomes: { x: "Colete Balístico", y: "Cota de Malha", z: "Traje Pressurizado" } },
  { chave: "kit_medico", peso: 1, usos: { sessao: 2 }, acao: { reduz: "exposicao", qtd: 1 },
    efeito: "Remove 1 de exposição do eixo atual.",
    nomes: { x: "Kit de Primeiros Socorros", y: "Ervas e Ataduras", z: "Injetor Médico" } },
  { chave: "detector", peso: 1, usos: "passiva", tags: ["convergencia", "perigo"], dados: 1,
    efeito: "+1 dado na Convergência e para sentir perigo: você sabe o que enfrenta.",
    nomes: { x: "Contador Geiger", y: "Pêndulo Rúnico", z: "Sensor de Campo Estelar" } },
  { chave: "ferramentas", peso: 1, usos: "passiva", tags: ["conserto"], dados: 1,
    efeito: "+1 dado para abrir, consertar ou desmontar.",
    nomes: { x: "Kit de Ferramentas", y: "Gazuas", z: "Multiferramenta" } },
  { chave: "objeto_pessoal", peso: 1, usos: { sessao: 1 }, acao: { reduz: "dissonancia", qtd: 1 },
    efeito: "Remove 1 de Dissonância: algo te lembra quem você é.",
    nomes: { x: "Foto da Família", y: "Relíquia de Casa", z: "Holograma de Casa" } },
];

// ---------- Situações ----------
// O jogo decide a dificuldade, não o jogador. As tags ligam traços, habilidades e itens automaticamente.
// (Quando existir o modo de cenas, cada cena escolhe a situação; por enquanto o jogador escolhe o que tenta fazer.)
const SITUACOES = [
  { id: "forcar", atributo: "corpo", dificuldade: 1, tags: ["forca"], nome: "Forçar, empurrar ou carregar" },
  { id: "resistir", atributo: "corpo", dificuldade: 1, tags: ["forca"], nome: "Resistir a dor, frio ou cansaço" },
  { id: "fugir", atributo: "corpo", dificuldade: 1, tags: ["fuga"], nome: "Fugir ou perseguir" },
  { id: "lutar", atributo: "corpo", dificuldade: 2, tags: ["combate"], nome: "Lutar" },
  { id: "proteger", atributo: "corpo", dificuldade: 2, tags: ["proteger"], nome: "Proteger alguém" },
  { id: "investigar", atributo: "mente", dificuldade: 1, tags: ["investigar"], nome: "Procurar pistas" },
  { id: "perceber", atributo: "mente", dificuldade: 1, tags: ["perigo"], nome: "Perceber um perigo" },
  { id: "consertar", atributo: "mente", dificuldade: 1, tags: ["conserto"], nome: "Abrir, consertar ou desmontar" },
  { id: "convencer", atributo: "mente", dificuldade: 2, tags: ["social"], nome: "Convencer ou negociar" },
  { id: "ler", atributo: "mente", dificuldade: 2, tags: ["simbolos"], nome: "Ler símbolos da Convergência" },
  { id: "acalmar", atributo: "essencia", dificuldade: 2, tags: ["social"], nome: "Acalmar alguém afetado" },
  { id: "medo", atributo: "essencia", dificuldade: 1, tags: ["medo"], nome: "Manter a calma diante do horror" },
  { id: "sentir", atributo: "essencia", dificuldade: 1, tags: ["perigo", "convergencia"], nome: "Sentir o fenômeno" },
];

// Como o jogo chama a dificuldade PARA ESTE personagem, pela chance real de passar
const CHANCE_ROTULOS = [
  { min: 0.75, nome: "Fácil" },
  { min: 0.45, nome: "Médio" },
  { min: 0.2, nome: "Difícil" },
  { min: 0, nome: "Quase impossível" },
];

// ---------- Ressonância e Dissonância mudam o jogo ----------
// Ao atingir cada marca, o efeito liga sozinho. dados: { atributo: +/- dados }.

const RESSONANCIA_LIMIARES = [
  { em: 5, nome: "Percepção Cruzada", efeito: "+1 dado em testes de Mente.", dados: { mente: 1 } },
  { em: 10, nome: "Memória Cruzada", efeito: "Um eixo oculto se revela: você lembra de uma vida que não viveu.", revela: true },
  { em: 15, nome: "Atração", efeito: "O fenômeno puxa você: Testes de Convergência pedem 2 sucessos.", convergenciaDif: 1 },
  { em: 20, nome: "Lucidez", efeito: "+1 dado em Mente e em Essência.", dados: { mente: 1, essencia: 1 } },
  { em: 25, nome: "Desprendimento", efeito: "O corpo deixa de importar: −2 dados no Corpo.", dados: { corpo: -2 } },
  { em: 30, nome: "Integração", efeito: "Você se torna Interface. Fim de jogo — mas não necessariamente morte.", fim: true },
];

const DISSONANCIA_LIMIARES = [
  { em: 5, nome: "Adrenalina", efeito: "+1 dado no Corpo.", dados: { corpo: 1 } },
  { em: 10, nome: "Fissura", efeito: "−1 dado em testes de Mente.", dados: { mente: -1 } },
  { em: 15, nome: "Paranoia", efeito: "Você não confia em ninguém: habilidades de conversa ficam bloqueadas.", bloqueia: "conversa" },
  { em: 20, nome: "Perda de Controle", efeito: "Cada sinal ◉ rolado também marca +1 Dissonância.", sinaisDissonancia: true },
  { em: 25, nome: "Fúria", efeito: "+1 dado no Corpo, −1 dado em Essência.", dados: { corpo: 1, essencia: -1 } },
  { em: 30, nome: "Colapso", efeito: "O personagem se perde no caos. Fim de jogo.", fim: true },
];

// ---------- Runas como cartas (Eixo Y) ----------
// Começa com cartas viradas para baixo; Mente define quantas. Aprender mais: teste de Mente.
const RUNAS_CARTAS = {
  iniciais: (mente) => 2 + 2 * mente,
  estudo: { dificuldade: 2, usos: { cena: 1 }, tags: ["simbolos"] },
};

// Traço central: lista fechada. Cada traço ajuda em um tipo de situação e atrapalha em outro (±1 dado).
const TRACOS = [
  { nome: "Protetor", bonus: ["proteger"], penalidade: ["fuga"],
    efeito: "+1 dado para proteger alguém. −1 para fugir: você não deixa ninguém para trás." },
  { nome: "Busca conhecimento", bonus: ["investigar", "simbolos"], penalidade: ["convergencia"],
    efeito: "+1 dado para investigar e ler símbolos. −1 na Convergência: a curiosidade te expõe." },
  { nome: "Proatividade", bonus: ["fuga", "forca"], penalidade: ["investigar"],
    efeito: "+1 dado para agir rápido (fugir, forçar). −1 para investigar: falta paciência." },
  { nome: "Empatia", bonus: ["social"], penalidade: ["combate"],
    efeito: "+1 dado para convencer e acalmar. −1 para lutar: você hesita em ferir." },
  { nome: "Desconfiança", bonus: ["perigo"], penalidade: ["social"],
    efeito: "+1 dado para perceber perigo. −1 para convencer e acalmar: ninguém confia em você." },
  { nome: "Coragem", bonus: ["medo", "combate"], penalidade: ["perigo"],
    efeito: "+1 dado para manter a calma e lutar. −1 para perceber perigo: você vai em frente." },
  { nome: "Frieza", bonus: ["convergencia"], penalidade: ["social"],
    efeito: "+1 dado na Convergência: você observa sem se entregar. −1 para convencer e acalmar." },
  { nome: "Instinto de sobrevivência", bonus: ["perigo", "fuga"], penalidade: ["proteger"],
    efeito: "+1 dado para perceber perigo e fugir. −1 para proteger alguém: você se salva primeiro." },
  { nome: "Teimosia", bonus: ["forca"], penalidade: ["fuga"],
    efeito: "+1 dado para forçar e aguentar dor, frio e cansaço. −1 para fugir: você não recua." },
  { nome: "Fé", bonus: ["medo"], penalidade: ["simbolos"],
    efeito: "+1 dado para manter a calma diante do horror. −1 para ler símbolos: você recusa o que não entende." },
  { nome: "Mãos habilidosas", bonus: ["conserto"], penalidade: ["combate"],
    efeito: "+1 dado para abrir, consertar e desmontar. −1 para lutar: suas mãos são de outro ofício." },
  { nome: "Liderança", bonus: ["proteger", "social"], penalidade: ["investigar"],
    efeito: "+1 dado para proteger e convencer. −1 para investigar: você olha para o grupo, não para os detalhes." },
  { nome: "Sensibilidade", bonus: ["convergencia"], penalidade: ["medo"],
    efeito: "+1 dado na Convergência e para sentir o fenômeno. −1 para manter a calma: você sente demais." },
  { nome: "Raiva contida", bonus: ["combate", "forca"], penalidade: ["social"],
    efeito: "+1 dado para lutar e forçar. −1 para convencer e acalmar: dá para ver no seu rosto." },
];

const SEXOS = { homem: "Homem", mulher: "Mulher" };

const IDADE = { min: 16, max: 90 };

// Alfabeto Rúnico Yudur — Eixo Y (ignora acentos)
const RUNAS = {
  A: "ᚨ", B: "ᛒ", C: "ᚲ", D: "ᛞ", E: "ᛖ", F: "ᚠ", G: "ᚷ", H: "ᚺ", I: "ᛁ",
  J: "ᛃ", K: "ᚲ", L: "ᛚ", M: "ᛗ", N: "ᚾ", O: "ᛟ", P: "ᛈ", Q: "ᚲ", R: "ᚱ",
  S: "ᛋ", T: "ᛏ", U: "ᚢ", V: "ᚡ", W: "ᚹ", X: "ᛉ", Y: "ᛇ", Z: "ᛉ",
};

function paraRunas(texto) {
  return texto
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .split("")
    .map((c) => RUNAS[c] || (c === " " ? " · " : ""))
    .join("");
}

// Formas de escrita rúnica — a forma altera o efeito narrativo da runa
const FORMAS_RUNICAS = {
  linear: "Linear",
  circular: "Circular",
  espelhada: "Espelhada",
  incompleta: "Incompleta",
  repetitiva: "Repetitiva",
};

// Código Urbano (X) e Interface (Z): ver js/lingua.js

const FRASES = [
  "O pulso já começou.", "A proximidade altera aquilo que permanece.", "Eles não caminham, eles convergem.",
  "A estrela não busca destruir.", "O instante está sendo alongado.", "Você já está parcialmente sincronizado.",
  "Os sinais coincidem nos três domínios.", "A integração exige consentimento.", "A tentativa de contenção acelerou o processo.",
  "A separação foi apenas percepção.", "Quem está realmente observando?", "Você reconhece este padrão?",
  "Por que você voltou aqui?", "Alguém esperava por você.", "O observador modifica o evento.",
  "A repetição indica aproximação.", "O silêncio também transmite dados.", "O atraso é apenas aparente.",
  "A leitura está incompleta.", "O padrão reapareceu.", "Algo respondeu antes da pergunta.",
  "A presença foi registrada.", "A ausência também é um sinal.", "O erro revelou o caminho.",
  "O sistema não reconhece esta forma.", "A convergência está em andamento.", "O limite foi ultrapassado.",
  "A tradução falhou.", "O significado permanece ativo.", "A observação gerou alteração.",
  "O campo tornou-se instável.", "O evento ainda não terminou.", "A distância deixou de importar.",
  "O tempo não está uniforme aqui.", "A leitura exige adaptação.", "A estrutura está mudando.",
  "A interpretação depende do observador.", "O contato foi estabelecido.", "A conexão persiste.",
  "O eco antecede a origem.", "O padrão não é natural.", "A resposta foi antecipada.",
  "O estado anterior não pode ser restaurado.", "A análise indica consciência.", "O sistema registra intenção.",
  "O sinal retorna amplificado.", "A origem permanece oculta.", "A interface está se formando.",
  "O processo não pode ser revertido.", "O fenômeno está aprendendo.", "A estabilidade é temporária.",
  "O alinhamento foi detectado.", "O evento repete-se em múltiplos níveis.", "A realidade ajustou-se ao contato.",
  "O registro excede parâmetros conhecidos.", "A energia segue aumentando.", "O centro deslocou-se.",
  "O observador tornou-se participante.", "A leitura exige presença.", "O padrão responde à atenção.",
  "A tentativa foi percebida.", "O fluxo foi interrompido.", "A continuidade foi preservada.",
  "O fenômeno reconheceu você.", "A diferença está diminuindo.", "A aproximação é inevitável.",
  "O processo busca equilíbrio.", "A compreensão altera o resultado.", "O contato deixou marcas.",
  "O campo reage à intenção.", "A sequência perdeu ordem.", "O início e o fim coincidem.",
  "O sistema aguarda decisão.", "A escolha redefine o estado.", "A resposta depende de quem observa.",
  "Você sente isso também?", "Quem você era antes do contato?", "O que você está disposto a perder?",
  "Você confia naquilo que vê?", "E se o erro for necessário?", "Algo em você mudou.",
  "Você não deveria lembrar disso.", "Por que apenas você consegue ouvir?", "A estrela já conhece sua decisão.",
  "Você foi chamado ou escolheu vir?", "Há algo seguindo seus passos.", "Nem todos atravessam intactos.",
  "Alguém precisa permanecer.", "O caminho correto não é o mais seguro.", "Você ainda pode voltar — por enquanto.",
  "O que acontece se ninguém decidir?", "Isso já aconteceu antes.", "Você já esteve aqui.",
  "A história tenta se corrigir.", "Algo espera resposta.", "A decisão não pode ser adiada.",
  "Quem você salva define quem você se torna.",
];

function fraseAleatoria() {
  return FRASES[Math.floor(Math.random() * FRASES.length)];
}

// ---------- Vida comum: dinheiro, pertences e condições ----------
// Cada vida do personagem tem a sua carteira (a moeda muda de eixo para eixo).
// Pertences são coisas do dia a dia que se gastam; como os equipamentos, existem nos três eixos
// com outro nome (a bolsa se "traduz"). Não pesam na carga, mas a bolsa tem limite.
// Condições são o corpo cobrando: fome, cansaço, ferimento, abalo. Cada uma tira 1 dado
// de um atributo até ser resolvida com uma ação comum (comer, dormir, um curativo, um banho).

const MOEDAS = {
  x: { nome: "dólares", formato: (v) => `$ ${v}` },
  y: { nome: "pratas", formato: (v) => `${v} ${v === 1 ? "prata" : "pratas"}` },
  z: { nome: "créditos", formato: (v) => `${v} ${v === 1 ? "crédito" : "créditos"}` },
};

const DINHEIRO_INICIAL = { x: 120, y: 15, z: 120 };

const BOLSA_MAX = 10; // unidades de pertences que cabem na bolsa

// efeito: tira: [condições que resolve] · poe: [condições que causa] · dissonancia: ± · renovarItens: usos de equipamento voltam
const PERTENCES = [
  { chave: "comida", nomes: { x: "Sanduíche", y: "Pão e queijo", z: "Ração de bordo" }, preco: { x: 8, y: 2, z: 12 }, tira: ["fome"], efeito: "Mata a fome." },
  { chave: "cafe", nomes: { x: "Café", y: "Chá de ervas", z: "Estimulante" }, preco: { x: 3, y: 1, z: 4 }, tira: ["cansaco"], efeito: "Espanta o cansaço por um tempo." },
  { chave: "remedio", nomes: { x: "Analgésico e curativos", y: "Unguento e ataduras", z: "Kit de sutura" }, preco: { x: 12, y: 3, z: 20 }, tira: ["ferido"], efeito: "Cuida de um ferimento." },
  { chave: "calmante", nomes: { x: "Calmante", y: "Infusão de valeriana", z: "Sedativo leve" }, preco: { x: 18, y: 4, z: 30 }, tira: ["abalado"], dissonancia: -1, efeito: "Acalma: −1 Dissonância." },
  { chave: "bebida", nomes: { x: "Cerveja", y: "Hidromel", z: "Destilado da hidroponia" }, preco: { x: 5, y: 1, z: 10 }, tira: ["abalado"], poe: ["cansaco"], efeito: "Relaxa, mas cansa." },
  { chave: "bateria", nomes: { x: "Bateria portátil", y: "Óleo de lamparina", z: "Célula de energia" }, preco: { x: 25, y: 2, z: 25 }, renovarItens: true, efeito: "Recarrega os equipamentos: usos voltam." },
];

const CONDICOES = {
  fome: { nome: "Com fome", dados: { corpo: -1 }, resolve: "comer" },
  cansaco: { nome: "Cansado", dados: { mente: -1 }, resolve: "dormir ou um café" },
  ferido: { nome: "Ferido", dados: { corpo: -1 }, resolve: "um curativo" },
  abalado: { nome: "Abalado", dados: { essencia: -1 }, resolve: "um banho, uma conversa, algo que acalme" },
};

// Preço de equipamentos vendidos em lojas (por eixo)
const PRECO_EQUIPAMENTO = {
  luz: { x: 20, y: 2, z: 30 },
  kit_medico: { x: 45, y: 8, z: 70 },
  ferramentas: { x: 35, y: 6, z: 60 },
  comunicador: { x: 400, y: 20, z: 300 },
  protecao: { x: 250, y: 40, z: 350 },
};

// ---------- Profissões e pontos de entrada ----------
// A mesma pessoa nos três eixos: o que ela faz em cada mundo e onde a história dela começa ali.
// Escrito na Oficina do Autor (aba Profissões); cada ponto de entrada tem a sua abertura nas missões.
// Na criação, o jogador escolhe na lista ou escreve a sua ("Outra") e escolhe o ponto de entrada.
// papel: a classe que vem com a profissão (tank = linha de frente, healer = cuidado, support = apoio).

const PONTOS_ENTRADA = {
  "x": [
    {
      "id": "hospital",
      "nome": "Hospital",
      "descricao": "St. Luke's Memorial e as clínicas do centro: corredores cheios, pacientes que saem andando."
    },
    {
      "id": "defesa",
      "nome": "Distrito policial e Defesa Civil",
      "descricao": "Rádios chiando, viaturas sem sirene, ordens que ninguém explica."
    },
    {
      "id": "universidade",
      "nome": "Universidade e laboratório",
      "descricao": "Equações no quadro que não são de nenhuma disciplina; sensores marcando picos."
    },
    {
      "id": "comercio",
      "nome": "Comércio",
      "descricao": "Lojas de conveniência, lanchonetes e bares de esquina, que fecham cedo demais."
    },
    {
      "id": "escritorio",
      "nome": "Escritório",
      "descricao": "Torres de vidro, bancos e firmas; o expediente acabou, mas ninguém foi para casa."
    },
    {
      "id": "rua",
      "nome": "Rua e obras",
      "descricao": "Quem trabalha nas ruas vê primeiro: as pessoas andando todas para o mesmo lado."
    },
    {
      "id": "arte",
      "nome": "Arte e mídia",
      "descricao": "Estúdios, rádios, teatros: onde o som e as imagens começam a se repetir."
    },
    {
      "id": "casa",
      "nome": "Casa",
      "descricao": "Quem trabalha ou vive em casa: a TV ligada, os vizinhos estranhos, o prédio quieto demais."
    }
  ],
  "y": [
    {
      "id": "mosteiro",
      "nome": "Mosteiro de Yudur",
      "descricao": "Onde se guarda a Tábula. Monges, copistas, noviços e o Abade Theodric."
    },
    {
      "id": "castelo",
      "nome": "Castelo do senhor",
      "descricao": "A corte de um nobre de Yudur: guardas, escudeiros, criados, escrivães."
    },
    {
      "id": "vila",
      "nome": "Vila e mercado",
      "descricao": "Forno, taverna, feira: onde os boatos correm primeiro."
    },
    {
      "id": "oficinas",
      "nome": "Oficinas das guildas",
      "descricao": "Ferreiros, pedreiros, carpinteiros e ourives, sob as regras das guildas."
    },
    {
      "id": "campo",
      "nome": "Campo",
      "descricao": "Plantações, rebanhos e aldeias pequenas, longe de tudo."
    },
    {
      "id": "floresta",
      "nome": "Floresta",
      "descricao": "Caçadores, lenhadores e carvoeiros; trilhas onde as runas aparecem nas cascas."
    },
    {
      "id": "estrada",
      "nome": "Estrada",
      "descricao": "Mensageiros, mascates, peregrinos e bardos, sempre de passagem."
    },
    {
      "id": "mina",
      "nome": "Mina e pedreira",
      "descricao": "Onde se corta a pedra, e às vezes se encontra o que não devia."
    }
  ],
  "z": [
    {
      "id": "ponte",
      "nome": "Ponte de comando",
      "descricao": "Comandante Arasaki, navegação, comunicações: de onde se vê o Lime chegando."
    },
    {
      "id": "motores",
      "nome": "Engenharia e motores",
      "descricao": "Reator, propulsores, corredores quentes e barulhentos."
    },
    {
      "id": "enfermaria",
      "nome": "Enfermaria",
      "descricao": "Exames, sono monitorado, a tripulação que começa a não dormir."
    },
    {
      "id": "hidroponia",
      "nome": "Hidroponia",
      "descricao": "O jardim da nave: comida, oxigênio e as luzes azuis do turno da noite."
    },
    {
      "id": "laboratorio",
      "nome": "Laboratório científico",
      "descricao": "Sensores de campo estelar, dados que não fecham, a IA DOMUS calculando."
    },
    {
      "id": "seguranca",
      "nome": "Segurança",
      "descricao": "Arsenal, patrulhas, celas; quem guarda as regras da nave."
    },
    {
      "id": "servicos",
      "nome": "Serviços e refeitório",
      "descricao": "Cozinha, estoque, manutenção, limpeza: quem mantém a vida a bordo funcionando."
    },
    {
      "id": "alojamentos",
      "nome": "Alojamentos e escola",
      "descricao": "Famílias, colonos, crianças, aposentados: a vida comum dentro da Domus."
    }
  ]
};

const PROFISSOES = [
 {
  "id": "medico",
  "x": {
   "nome": "Médico(a)",
   "ponto": "hospital"
  },
  "y": {
   "nome": "Curandeiro(a) do mosteiro",
   "ponto": "mosteiro"
  },
  "z": {
   "nome": "Médico(a) de bordo",
   "ponto": "enfermaria"
  },
  "papel": "healer"
 },
 {
  "id": "enfermeiro",
  "x": {
   "nome": "Enfermeiro(a)",
   "ponto": "hospital"
  },
  "y": {
   "nome": "Irmão(ã) enfermeiro(a)",
   "ponto": "mosteiro"
  },
  "z": {
   "nome": "Enfermeiro(a) de bordo",
   "ponto": "enfermaria"
  },
  "papel": "healer"
 },
 {
  "id": "psicologo",
  "x": {
   "nome": "Psicólogo(a) ou psiquiatra",
   "ponto": "hospital"
  },
  "y": {
   "nome": "Confessor(a)",
   "ponto": "mosteiro"
  },
  "z": {
   "nome": "Psicólogo(a) de bordo",
   "ponto": "enfermaria"
  },
  "papel": "healer"
 },
 {
  "id": "farmaceutico",
  "x": {
   "nome": "Farmacêutico(a)",
   "ponto": "hospital"
  },
  "y": {
   "nome": "Boticário(a)",
   "ponto": "vila"
  },
  "z": {
   "nome": "Técnico(a) de suprimentos médicos",
   "ponto": "enfermaria"
  },
  "papel": "healer"
 },
 {
  "id": "veterinario",
  "x": {
   "nome": "Veterinário(a)",
   "ponto": "hospital"
  },
  "y": {
   "nome": "Pastor(a)",
   "ponto": "campo"
  },
  "z": {
   "nome": "Técnico(a) do biotério",
   "ponto": "laboratorio"
  },
  "papel": "healer"
 },
 {
  "id": "policial",
  "x": {
   "nome": "Policial",
   "ponto": "defesa"
  },
  "y": {
   "nome": "Guarda da vila",
   "ponto": "vila"
  },
  "z": {
   "nome": "Oficial de segurança",
   "ponto": "seguranca"
  },
  "papel": "tank"
 },
 {
  "id": "bombeiro",
  "x": {
   "nome": "Bombeiro(a)",
   "ponto": "defesa"
  },
  "y": {
   "nome": "Vigia do fogo",
   "ponto": "vila"
  },
  "z": {
   "nome": "Técnico(a) de contenção de incêndio",
   "ponto": "motores"
  },
  "papel": "tank"
 },
 {
  "id": "agente-da-defesa-civil",
  "x": {
   "nome": "Agente da Defesa Civil",
   "ponto": "defesa"
  },
  "y": {
   "nome": "Arauto do senhor",
   "ponto": "castelo"
  },
  "z": {
   "nome": "Oficial de protocolo",
   "ponto": "ponte"
  },
  "papel": "tank"
 },
 {
  "id": "militar",
  "x": {
   "nome": "Militar",
   "ponto": "defesa"
  },
  "y": {
   "nome": "Soldado(a)",
   "ponto": "castelo"
  },
  "z": {
   "nome": "Guarda do arsenal",
   "ponto": "seguranca"
  },
  "papel": "tank"
 },
 {
  "id": "seguranca-particular",
  "x": {
   "nome": "Segurança particular",
   "ponto": "defesa"
  },
  "y": {
   "nome": "Cavaleiro(a)",
   "ponto": "castelo"
  },
  "z": {
   "nome": "Escolta da Comandante",
   "ponto": "seguranca"
  },
  "papel": "tank"
 },
 {
  "id": "professor",
  "x": {
   "nome": "Professor(a)",
   "ponto": "universidade"
  },
  "y": {
   "nome": "Mestre-escola do mosteiro",
   "ponto": "mosteiro"
  },
  "z": {
   "nome": "Instrutor(a) da escola de bordo",
   "ponto": "alojamentos"
  },
  "papel": "support"
 },
 {
  "id": "pesquisador",
  "x": {
   "nome": "Pesquisador(a) ou cientista",
   "ponto": "universidade"
  },
  "y": {
   "nome": "Alquimista",
   "ponto": "oficinas"
  },
  "z": {
   "nome": "Cientista do laboratório",
   "ponto": "laboratorio"
  },
  "papel": "support"
 },
 {
  "id": "estudante",
  "x": {
   "nome": "Estudante",
   "ponto": "universidade"
  },
  "y": {
   "nome": "Noviço(a)",
   "ponto": "mosteiro"
  },
  "z": {
   "nome": "Cadete",
   "ponto": "ponte"
  },
  "papel": "support"
 },
 {
  "id": "tecnico",
  "x": {
   "nome": "Técnico(a) de radiação",
   "ponto": "universidade"
  },
  "y": {
   "nome": "Astrólogo(a)",
   "ponto": "castelo"
  },
  "z": {
   "nome": "Técnico(a) de sensores",
   "ponto": "laboratorio"
  },
  "papel": "support"
 },
 {
  "id": "geografo",
  "x": {
   "nome": "Geógrafo(a)",
   "ponto": "universidade"
  },
  "y": {
   "nome": "Cartógrafo(a)",
   "ponto": "castelo"
  },
  "z": {
   "nome": "Navegador(a)",
   "ponto": "ponte"
  },
  "papel": "support"
 },
 {
  "id": "padre-pastor",
  "x": {
   "nome": "Padre, pastor(a) ou religioso(a)",
   "ponto": "casa"
  },
  "y": {
   "nome": "Monge ou monja",
   "ponto": "mosteiro"
  },
  "z": {
   "nome": "Capelão de bordo",
   "ponto": "alojamentos"
  },
  "papel": "healer"
 },
 {
  "id": "padeiro",
  "x": {
   "nome": "Padeiro(a)",
   "ponto": "comercio"
  },
  "y": {
   "nome": "Forneiro(a)",
   "ponto": "vila"
  },
  "z": {
   "nome": "Cozinheiro(a) de bordo",
   "ponto": "servicos"
  },
  "papel": "healer"
 },
 {
  "id": "comerciante",
  "x": {
   "nome": "Comerciante",
   "ponto": "comercio"
  },
  "y": {
   "nome": "Mercador(a)",
   "ponto": "vila"
  },
  "z": {
   "nome": "Intendente",
   "ponto": "servicos"
  },
  "papel": "support"
 },
 {
  "id": "garcom-garconete",
  "x": {
   "nome": "Garçom, garçonete ou bartender",
   "ponto": "comercio"
  },
  "y": {
   "nome": "Taberneiro(a)",
   "ponto": "vila"
  },
  "z": {
   "nome": "Atendente do refeitório",
   "ponto": "servicos"
  },
  "papel": "support"
 },
 {
  "id": "vendedor",
  "x": {
   "nome": "Vendedor(a) de carros",
   "ponto": "comercio"
  },
  "y": {
   "nome": "Negociante de cavalos",
   "ponto": "estrada"
  },
  "z": {
   "nome": "Operador(a) do hangar",
   "ponto": "motores"
  },
  "papel": "support"
 },
 {
  "id": "advogado",
  "x": {
   "nome": "Advogado(a)",
   "ponto": "escritorio"
  },
  "y": {
   "nome": "Escrivão(ã) da corte",
   "ponto": "castelo"
  },
  "z": {
   "nome": "Oficial de registro",
   "ponto": "ponte"
  },
  "papel": "support"
 },
 {
  "id": "bancario",
  "x": {
   "nome": "Bancário(a) ou contador(a)",
   "ponto": "escritorio"
  },
  "y": {
   "nome": "Coletor(a) de impostos",
   "ponto": "castelo"
  },
  "z": {
   "nome": "Contador(a) de recursos",
   "ponto": "servicos"
  },
  "papel": "support"
 },
 {
  "id": "programador",
  "x": {
   "nome": "Programador(a)",
   "ponto": "escritorio"
  },
  "y": {
   "nome": "Copista",
   "ponto": "mosteiro"
  },
  "z": {
   "nome": "Programador(a) da DOMUS",
   "ponto": "laboratorio"
  },
  "papel": "support"
 },
 {
  "id": "secretario",
  "x": {
   "nome": "Secretário(a)",
   "ponto": "escritorio"
  },
  "y": {
   "nome": "Criado(a) do castelo",
   "ponto": "castelo"
  },
  "z": {
   "nome": "Assistente da ponte",
   "ponto": "ponte"
  },
  "papel": "support"
 },
 {
  "id": "motorista-de-aplicativo",
  "x": {
   "nome": "Taxista ou motorista de aplicativo",
   "ponto": "rua"
  },
  "y": {
   "nome": "Carroceiro(a)",
   "ponto": "estrada"
  },
  "z": {
   "nome": "Piloto(a) de transporte interno",
   "ponto": "motores"
  },
  "papel": "support"
 },
 {
  "id": "entregador",
  "x": {
   "nome": "Entregador(a) ou motoboy",
   "ponto": "rua"
  },
  "y": {
   "nome": "Mensageiro(a)",
   "ponto": "estrada"
  },
  "z": {
   "nome": "Técnico(a) de logística",
   "ponto": "servicos"
  },
  "papel": "tank"
 },
 {
  "id": "camelo",
  "x": {
   "nome": "Vendedor(a) ambulante",
   "ponto": "rua"
  },
  "y": {
   "nome": "Mascate",
   "ponto": "estrada"
  },
  "z": {
   "nome": "Trocador(a) do mercado de bordo",
   "ponto": "servicos"
  },
  "papel": "support"
 },
 {
  "id": "pedreiro",
  "x": {
   "nome": "Operário(a) da construção",
   "ponto": "rua"
  },
  "y": {
   "nome": "Pedreiro(a) da guilda",
   "ponto": "mina"
  },
  "z": {
   "nome": "Técnico(a) de manutenção estrutural",
   "ponto": "motores"
  },
  "papel": "tank"
 },
 {
  "id": "mecanico",
  "x": {
   "nome": "Mecânico(a)",
   "ponto": "rua"
  },
  "y": {
   "nome": "Ferreiro(a)",
   "ponto": "oficinas"
  },
  "z": {
   "nome": "Engenheiro(a) de motores",
   "ponto": "motores"
  },
  "papel": "tank"
 },
 {
  "id": "eletricista",
  "x": {
   "nome": "Eletricista",
   "ponto": "rua"
  },
  "y": {
   "nome": "Cerieiro(a) (faz velas)",
   "ponto": "oficinas"
  },
  "z": {
   "nome": "Técnico(a) do reator",
   "ponto": "motores"
  },
  "papel": "support"
 },
 {
  "id": "jardineiro",
  "x": {
   "nome": "Jardineiro(a)",
   "ponto": "rua"
  },
  "y": {
   "nome": "Herbalista",
   "ponto": "campo"
  },
  "z": {
   "nome": "Técnico(a) de hidroponia",
   "ponto": "hidroponia"
  },
  "papel": "healer"
 },
 {
  "id": "piloto",
  "x": {
   "nome": "Piloto(a) de avião",
   "ponto": "rua"
  },
  "y": {
   "nome": "Falcoeiro(a)",
   "ponto": "castelo"
  },
  "z": {
   "nome": "Piloto(a) da Domus",
   "ponto": "ponte"
  },
  "papel": "support"
 },
 {
  "id": "mineiro",
  "x": {
   "nome": "Mineiro(a) ou operário(a)",
   "ponto": "rua"
  },
  "y": {
   "nome": "Mineiro(a)",
   "ponto": "mina"
  },
  "z": {
   "nome": "Técnico(a) de coleta de minério",
   "ponto": "motores"
  },
  "papel": "tank"
 },
 {
  "id": "musico",
  "x": {
   "nome": "Músico(a) ou DJ",
   "ponto": "arte"
  },
  "y": {
   "nome": "Bardo",
   "ponto": "estrada"
  },
  "z": {
   "nome": "Músico(a) da sala de lazer",
   "ponto": "alojamentos"
  },
  "papel": "healer"
 },
 {
  "id": "jornalista",
  "x": {
   "nome": "Jornalista ou radialista",
   "ponto": "arte"
  },
  "y": {
   "nome": "Cronista",
   "ponto": "castelo"
  },
  "z": {
   "nome": "Operador(a) de comunicações",
   "ponto": "ponte"
  },
  "papel": "support"
 },
 {
  "id": "ator",
  "x": {
   "nome": "Ator ou atriz",
   "ponto": "arte"
  },
  "y": {
   "nome": "Saltimbanco",
   "ponto": "estrada"
  },
  "z": {
   "nome": "Animador(a) de lazer",
   "ponto": "alojamentos"
  },
  "papel": "support"
 },
 {
  "id": "artista-plastico",
  "x": {
   "nome": "Artista plástico ou pintor(a)",
   "ponto": "arte"
  },
  "y": {
   "nome": "Iluminador(a) de manuscritos",
   "ponto": "mosteiro"
  },
  "z": {
   "nome": "Designer de hologramas",
   "ponto": "laboratorio"
  },
  "papel": "support"
 },
 {
  "id": "desempregado",
  "x": {
   "nome": "Desempregado(a)",
   "ponto": "casa"
  },
  "y": {
   "nome": "Andarilho(a)",
   "ponto": "estrada"
  },
  "z": {
   "nome": "Tripulante em licença",
   "ponto": "alojamentos"
  },
  "papel": "tank"
 },
 {
  "id": "aposentado",
  "x": {
   "nome": "Aposentado(a)",
   "ponto": "casa"
  },
  "y": {
   "nome": "Ancião(ã) da vila",
   "ponto": "vila"
  },
  "z": {
   "nome": "Veterano(a) aposentado(a)",
   "ponto": "alojamentos"
  },
  "papel": "healer"
 },
 {
  "id": "dono",
  "x": {
   "nome": "Dono(a) de casa",
   "ponto": "casa"
  },
  "y": {
   "nome": "Camponês(a)",
   "ponto": "campo"
  },
  "z": {
   "nome": "Colono(a)",
   "ponto": "alojamentos"
  },
  "papel": "healer"
 },
 {
  "id": "trabalhador",
  "x": {
   "nome": "Trabalhador(a) remoto(a)",
   "ponto": "casa"
  },
  "y": {
   "nome": "Tecelão(ã)",
   "ponto": "vila"
  },
  "z": {
   "nome": "Técnico(a) do turno da noite",
   "ponto": "servicos"
  },
  "papel": "support"
 },
 {
  "id": "guarda-florestal",
  "x": {
   "nome": "Guarda-florestal",
   "ponto": "rua"
  },
  "y": {
   "nome": "Caçador(a)",
   "ponto": "floresta"
  },
  "z": {
   "nome": "Técnico(a) de reciclagem de ar",
   "ponto": "hidroponia"
  },
  "papel": "tank"
 },
 {
  "id": "marceneiro",
  "x": {
   "nome": "Marceneiro(a)",
   "ponto": "comercio"
  },
  "y": {
   "nome": "Lenhador(a) ou carpinteiro(a)",
   "ponto": "floresta"
  },
  "z": {
   "nome": "Técnico(a) de fabricação",
   "ponto": "servicos"
  },
  "papel": "tank"
 }
];
