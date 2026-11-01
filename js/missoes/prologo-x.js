// =====================================================================
// Missão: O PULSO — Prólogo do Eixo X (Urbano)
// ---------------------------------------------------------------------
// Ideia do autor: o caos urbano se instala; pessoas caminham numa só direção até o
// "olho do furacão"; lá, um rádio toca Every Breath You Take, a multidão canta o refrão
// em loop, a música para e todos atacam. Ponto de salto para o Eixo Y. Fim do prólogo.
//
// Estrutura:
//   1. Abertura: começa no trabalho do personagem (lido da descrição), com um gancho da classe.
//   2. Exploração livre pela cidade (mapa). Cada ação gasta tempo no Relógio de Convergência.
//   3. Marco: com pistas suficientes OU o relógio cheio, o chamado leva à Praça Central.
//   4. Olho do furacão: Testes de Convergência de intensidade 1 → 2 → 3 (tutorial).
//   5. O rádio, o ataque, o salto.
//
// Ações comuns (comum: true): a vida segue, mesmo com a cidade estranha. Comer, dormir, tomar banho,
// trabalhar, comprar. Não testam nada, quase nunca gastam tempo e não puxam para o fenômeno.
// repetivel: true = pode fazer de novo. tempo = marcas do relógio (padrão: 0 nas ações comuns, 1 nas outras).
// Efeitos da vida comum: dinheiro (±), pertence: { comida: 1 }, condicao: "-fome" / "abalado", renovarItens.
// Lugares com loja: loja: { nome, itens: [{ pertence: "comida" } | { equip: "kit_medico" }] }.
//
// Side quests: ações que só aparecem depois de certas marcas (se: { flag, semFlag, algum, relogioMin }),
// marcas da partida (efeitos.flag), marcas que o personagem leva para as próximas missões (efeitos.marca)
// e linhas no Diário (efeitos.quest: { id, nome, prazo: curta | media | longa, estado, nota }).
// Lugares também podem ter "se" (só aparecem no mapa depois de descobertos).
// eventosRelogio: o que acontece sozinho quando o relógio passa de uma marca.
// emTodaParte: ações que aparecem em qualquer lugar (eventos da cidade).
// Memórias Cruzadas de side quest pedem Ressonância (memoriaMin).
//
// Textos podem ser funções de ctx = { p (personagem da vez), camp (campanha), trabalho }.
// =====================================================================

const MISSOES = window.MISSOES || (window.MISSOES = {});

// O fim do prólogo lembra o que o jogador fez na cidade: quem salvou, o que guardou, como chegou.
function ecosDoSalto(ctx) {
  const f = ctx.camp.flags || {};
  const p = ctx.p;
  const partes = [];
  const salvos = [["salvou-raimundo", "Seu Raimundo"], ["salvou-tiao", "Tião"], ["salvou-diego", "Diego"]].filter(([k]) => f[k]).map(([, n]) => n);
  if (salvos.length) partes.push(`Atrás da pessoa de capuz, um rosto que você conhece: ${salvos[0]}. Não é ele, não pode ser. Mas ele sorri como quem já te deve uma.`);
  if (f["gravou-ouvinte"] || f.fita) partes.push("Em algum lugar do mosteiro, alguém está cantando a melodia da Rádio Pirata. Com outra letra, e a mesma voz.");
  if (p.dissonancia >= 5) partes.push("Suas mãos estão sujas de carvão, e você não lembra de ter riscado nada. A pessoa de capuz olha para elas e recua um passo.");
  else if (p.ressonancia >= 5) partes.push("Por um instante, antes da pedra, você viu outra coisa: um corredor de metal, uma janela redonda, um planeta enorme do lado de fora. Depois, só a pedra.");
  return partes.length ? "\n\n" + partes.join("\n\n") : "";
}

MISSOES["prologo-x"] = {
  id: "prologo-x",
  eixo: "x",
  titulo: "O Pulso",
  subtitulo: "Prólogo · Eixo X — Urbano",
  resumo: "Pessoas começam a caminhar todas na mesma direção. Algo no centro da cidade está chamando.",
  fase: "Estranheza",
  relogioMax: 16, // a noite é longa: dá tempo de viver a cidade antes do chamado
  pistasParaMarco: 5,
  inicio: "abertura",
  lugarInicial: "trabalho",
  // o mapa ilustrado: para onde todos caminham
  centroMapa: { x: 50, y: 50, nome: "Praça Central" },

  // O rádio da praça. ⚠️ Música comercial: serve para jogar entre amigos; para publicar, precisa de licença.
  // inicio/fim em segundos do vídeo oficial: o refrão repetido do final da música.
  // Toca em loop enquanto o jogador estiver no centro da praça; para quando a multidão ataca.
  // Primeiro a versão da playlist (The Police - Topic); se estiver bloqueada no aparelho, o clipe oficial.
  radio: { videoId: ["-SaUrDhp034", "OMOGaugKpzs"], inicio: 162, fim: 195, vezes: Infinity },

  // Onde o personagem trabalha, lido da descrição (ou da classe)
  trabalho(p) {
    const d = (p.descricao || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const lista = [
      [/vend|carro|concession/, "Concessionária", "O showroom ainda está aceso. Os carros refletem as luzes da rua, que piscam: três rápidas, uma longa."],
      [/medic|enferm|hospital|psiq|clinic|terapeut/, "Consultório", "A sala de espera está vazia, mas as cadeiras estão todas viradas para a janela."],
      [/polic|agente|seguranc|militar|guarda|bombeir/, "Base da Defesa Civil", "Os rádios chiam sem parar. Metade da equipe não voltou do turno."],
      [/profess|estud|escola|universi|pesquis|cienti/, "Universidade", "O laboratório está vazio. Alguém deixou uma equação escrita no quadro — e não é de nenhuma disciplina."],
      [/bar$|garcom|cozinh|restaur|cafe/, "Restaurante", "As mesas ainda têm pratos cheios. Os clientes saíram no meio do jantar."],
      [/motorist|taxi|uber|entregador|motoboy/, "Garagem", "Os veículos estão alinhados. Alguém ligou todos os rádios na mesma estação."],
    ];
    for (const [re, nome, desc] of lista) if (re.test(d)) return { nome, desc };
    return {
      tank: { nome: "Base da Defesa Civil", desc: "Os rádios chiam sem parar. Metade da equipe não voltou do turno." },
      healer: { nome: "Consultório", desc: "A sala de espera está vazia, mas as cadeiras estão todas viradas para a janela." },
      support: { nome: "Laboratório de Radiação", desc: "Os sensores marcam um pico que não deveria existir. Ninguém atende o telefone da diretoria." },
    }[p.papel] || { nome: "Trabalho", desc: "O expediente acabou, mas ninguém foi para casa." };
  },

  ambiente(relogio) {
    if (relogio <= 4) return "Nas ruas ainda há gente comum. Mas alguns passam olhando para o nada.";
    if (relogio <= 10) return "Cada vez mais pessoas caminham em silêncio, todas na mesma direção.";
    return "Agora são multidões. Os postes piscam juntos, no ritmo de três rápidas e uma longa.";
  },

  // ---------- O que acontece sozinho com o tempo ----------
  eventosRelogio: [
    { em: 4, flag: "apagao", texto: "Apagão: as luzes da cidade inteira piscam juntas, três rápidas e uma longa, e voltam. No Viaduto Leste, alguém começou a riscar os muros." },
    { em: 10, flag: "multidoes", texto: "As ruas enchem de gente andando para o centro. Ir de um lugar a outro agora demora mais." },
    { em: 12, flag: "riscadores", texto: "Gritos numa rua próxima: Riscadores cercaram alguém." },
  ],

  emTodaParte: [
    {
      id: "socorrer", texto: "Socorrer quem está cercado por Riscadores", palavras: ["socorr", "ajudar", "cercad", "riscador", "salvar"],
      situacao: "proteger", se: { flag: "riscadores" },
      sucesso: {
        texto: "Você puxa um rapaz de moletom do meio do círculo. Os Riscadores não correm atrás: voltam para o muro e continuam riscando. Ele se chama Diego, treme inteiro e não larga o seu braço até a esquina.",
        efeitos: { marca: "salvou:Diego", flag: "salvou-diego", ressonancia: 1, quest: { id: "diego", nome: "Diego, o rapaz do muro", prazo: "media", estado: "concluida", nota: "Você o tirou do cerco. Ele disse que vai te procurar." } },
      },
      falha: {
        texto: "Você chega perto demais. Uma mão suja de giz agarra seu pulso e risca três traços na sua pele antes que você consiga se soltar. O rapaz que estava no meio já não está lá.",
        efeitos: { condicao: "ferido", dissonancia: 1, quest: { id: "diego", nome: "O rapaz do muro", prazo: "curta", estado: "perdida" } },
      },
    },
  ],

  // ---------- Cenas da história ----------
  cenas: {
    abertura: {
      titulo: "Terça-feira, 21h47",
      texto: (ctx) => {
        const gancho = {
          tank: "O rádio de serviço chia: “Todas as equipes, perímetro no centro. Não se aproximem dos civis em grupo.” Ninguém explica por quê.",
          healer: "Uma mensagem do hospital: três pacientes seus saíram da ala de isolamento sem alta. Ninguém viu a porta abrir.",
          support: "O medidor de radiação no seu bolso começa a estalar. Fraco, mas constante. Sempre na direção do centro.",
        }[ctx.p.papel];
        const tracos = {
          Protetor: "Sua irmã não atende há uma hora. A última localização dela: perto da Praça Central.",
          "Busca conhecimento": "Um vídeo viral mostra pessoas em cidades diferentes escrevendo os mesmos símbolos nas paredes.",
          Desconfiança: "A prefeitura fala em “estresse coletivo”. Ninguém acredita, muito menos você.",
          Empatia: "Seu vizinho, sempre gentil, passou por você hoje sem te reconhecer.",
          Coragem: "Todo mundo diz para ficar em casa. Você nunca foi bom em ficar em casa.",
          Proatividade: "Você não vai esperar alguém explicar. Vai descobrir.",
          Frieza: "Você observa tudo com calma. É o único que parece notar o padrão.",
        };
        const traco = ctx.p.tracos.map((t) => tracos[t]).find(Boolean) || "";
        return `Há três dias a televisão fala em “surtos de desorientação coletiva”. Primeiro foram casos isolados. Depois, bairros inteiros.

${ctx.p.nome} ainda está no(a) ${ctx.trabalho.nome}. ${ctx.trabalho.desc}

Lá fora, um homem de terno está parado ao lado de uma picape. Escreveu alguma coisa no vidro embaçado com o dedo, e não se mexe há vinte minutos.

${gancho} ${traco}`;
      },
      opcoes: [
        { texto: "Começar a investigar", palavras: ["investig", "comec", "sair", "ir", "olhar"], resultado: { ir: "lugar:trabalho" } },
      ],
    },

    chamado: {
      titulo: "O chamado",
      texto: (ctx) => {
        const voz = {
          tank: "O rádio de serviço, agora sem chiado nenhum: “Todas as unidades para a Praça Central. Agora.”",
          healer: "Uma foto chega no seu celular: seus pacientes, de pé, no meio da Praça Central. Sorrindo.",
          support: "O medidor estala sem parar. A agulha não se mexe mais: aponta, fixa, para a Praça Central.",
        }[ctx.p.papel];
        return `${voz}

Não há mais como evitar. As pessoas passam por você em silêncio, todas na mesma direção, no mesmo passo. Ninguém olha para trás.`;
      },
      opcoes: [
        { texto: "Seguir a multidão a pé", palavras: ["seguir", "multid", "anda", "caminh", "pe$"], resultado: { ir: "cena:borda" } },
        {
          texto: "Ir de carro até onde der", palavras: ["carro", "dirig", "veiculo"], req: { item: "veiculo" },
          resultado: { texto: "Você chega mais perto do que a pé. Até o motor morrer sozinho, no meio da avenida.", ir: "cena:borda" },
        },
      ],
    },

    borda: {
      titulo: "A borda do furacão",
      texto: `Quanto mais perto, mais gente. Alguns balbuciam; outros olham sem piscar, de olhos arregalados. O ar tem gosto de metal, e o medidor de qualquer um, se tivesse um, estaria gritando.

Aqui o fenômeno age sobre você.`,
      tutorial: "Teste de Convergência: quem passa RESSOA (aceita o fenômeno: ganha Ressonância); quem falha DISSOA (resiste no caos: ganha Dissonância). A exposição sobe de qualquer jeito. Cada marca muda o que você consegue fazer.",
      opcoes: [
        {
          texto: "Seguir em frente", palavras: ["seguir", "frente", "avanc", "continu"], convergencia: 1,
          sucesso: { texto: "Por um momento, o ritmo das luzes faz sentido. Você quase entende o que elas dizem.", ir: "cena:meio" },
          falha: { texto: "Tudo em você grita para voltar. Você continua mesmo assim, com raiva do próprio medo.", ir: "cena:meio" },
        },
      ],
    },

    meio: {
      titulo: "O meio da multidão",
      texto: `Agora é difícil andar. Os afetados estão ombro a ombro, de frente para o centro da praça. Ninguém te empurra. Ninguém te vê.

Alguém, perto de você, escreve no chão com o dedo, sem parar: ∃ ψ(t) ⇒ 𝒪(S).`,
      opcoes: [
        {
          texto: "Abrir caminho à força", palavras: ["forc", "empurr", "abrir caminho"], situacao: "forcar",
          sucesso: { texto: "Você passa. Eles se fecham atrás de você, sem reclamar, como água.", efeitos: { convergencia: 2 }, ir: "cena:centro" },
          falha: { texto: "É como empurrar uma parede que respira. Você passa, mas sai machucado e com a cabeça zunindo.", efeitos: { exposicao: 2, convergencia: 2 }, ir: "cena:centro" },
        },
        {
          texto: "Passar devagar, sem tocar em ninguém", palavras: ["devagar", "cuidado", "esgueir", "sem tocar"], situacao: "perceber",
          sucesso: { texto: "Você acha os vãos certos, um a um. Como se a multidão abrisse espaço sem saber.", efeitos: { convergencia: 2 }, ir: "cena:centro" },
          falha: { texto: "Você esbarra em alguém. Todos ao redor viram a cabeça ao mesmo tempo, e depois voltam a olhar para o centro.", efeitos: { exposicao: 1, convergencia: 2 }, ir: "cena:centro" },
        },
        {
          texto: "Ler o padrão nas luzes e passar no ritmo", palavras: ["padr", "ritmo", "luzes"], req: { res: 5 },
          resultado: { texto: "Três rápidas, uma longa. Você anda no ritmo, e a multidão abre caminho como se você fosse um deles.", efeitos: { ressonancia: 1 }, ir: "cena:centro" },
        },
      ],
    },

    centro: {
      titulo: "O olho do furacão",
      musica: true, // pede para ligar o som antes, se estiver desligado
      texto: (ctx) => ctx.camp.flags.radioTocando
        ? `No centro da praça, sobre um banco, há um rádio de pilha. Ninguém está perto dele. Ele começa a tocar sozinho.

A multidão inteira começa a cantar o refrão junto, em loop, cada vez mais afinada com o rádio. Ninguém respira fora do ritmo.`
        : `No centro da praça, sobre um banco, há um rádio de pilha. Ele só chia.

Mas a multidão canta assim mesmo: a mesma melodia, em loop, sem rádio nenhum. Ninguém respira fora do ritmo.`,
      opcoes: [
        {
          texto: "Ouvir", palavras: ["ouv", "escut", "ficar"], convergencia: 3,
          sucesso: { texto: "A melodia entra em você como água fria. Por um segundo, você sabe a letra de uma música que nunca ouviu.", ir: "cena:ataque" },
          falha: { texto: "Você tapa os ouvidos. Não adianta: a música está dentro. Você aperta os dentes até doer.", ir: "cena:ataque" },
        },
        {
          texto: "Tapar os ouvidos e resistir", palavras: ["tapar", "resist", "ouvidos"], convergencia: 3,
          sucesso: { texto: "Mesmo com os ouvidos tapados, você sente o ritmo pelo chão. E, contra a vontade, ele te acalma.", ir: "cena:ataque" },
          falha: { texto: "Você resiste com tudo. Algo em você estala, como um osso que não volta para o lugar.", ir: "cena:ataque" },
        },
      ],
    },

    ataque: {
      titulo: "Todos olham para você",
      ameaca: 6,
      texto: (ctx) => `A música para. O silêncio é pior.

Centenas de cabeças viram ao mesmo tempo, na sua direção. E começam a andar.${ctx.camp.rodada ? "\n\nEles continuam vindo." : ""}`,
      opcoes: [
        {
          texto: "Lutar para abrir espaço", palavras: ["lut", "atac", "bater", "soco", "golpe"], situacao: "lutar", rodada: true,
          sucesso: { texto: "Você derruba os primeiros. Eles não gritam, não reagem. Só se levantam devagar.", efeitos: { ameaca: -3 } },
          falha: { texto: "São muitos. Mãos frias seguram seus braços, sem força, sem pressa.", efeitos: { dissonancia: 2 } },
        },
        {
          texto: "Fugir", palavras: ["fug", "corr", "escap"], situacao: "fugir", rodada: true,
          sucesso: { texto: "Você corre entre os vãos. Por um momento, parece que vai conseguir.", efeitos: { ameaca: -2 } },
          falha: { texto: "Para onde você corre, já tem alguém olhando para você.", efeitos: { exposicao: 2 } },
        },
        {
          texto: "Acalmar quem está mais perto", palavras: ["acalm", "falar", "convenc", "conversa"], situacao: "acalmar", rodada: true,
          sucesso: { texto: "Uma mulher pisca, como quem acorda. “Está tão bonito lá embaixo”, ela diz. E segura sua mão, gentil.", efeitos: { ameaca: -2, ressonancia: 1 } },
          falha: { texto: "Ela começa a repetir suas palavras. Depois todos repetem. Em coro.", efeitos: { dissonancia: 1 } },
        },
        {
          texto: "Parar de resistir", palavras: ["aceit", "parar", "render", "entregar", "nao resist"],
          resultado: { texto: "Você para. Eles param também. Por um instante, todos, você inclusive, respiram juntos.", efeitos: { ressonancia: 2 }, ir: "cena:salto" },
        },
      ],
    },

    salto: {
      titulo: "O salto",
      final: true,
      texto: (ctx) => `Mãos. Muitas. O chão some.

Um clarão branco, e um frio que não é de inverno.

Cheiro de cera de vela. Pedra úmida sob as costas. Um sino toca: três batidas rápidas, uma longa.

Você abre os olhos sob um teto de pedra. Alguém de capuz se inclina sobre você e diz um nome que é seu, mas não é o nome que você usa.

“${fraseAleatoria()}”${ecosDoSalto(ctx)}`,
      memoria: "Mãos frias, uma música em loop, e depois pedra, velas e um sino: três batidas rápidas, uma longa.",
      revela: "y",
      opcoes: [],
    },
  },

  // ---------- Lugares para explorar ----------
  lugares: {
    trabalho: {
      nome: (ctx) => ctx.trabalho.nome,
      icone: "∃",
      mapa: { x: 18, y: 16 },
      descricao: (ctx) => ctx.trabalho.desc,
      acoes: [
        {
          id: "vidro", texto: "Examinar o que o homem escreveu no vidro", palavras: ["vidro", "simbol", "escrit", "examin", "ler"], situacao: "ler",
          sucesso: {
            texto: "Os traços são quase matemática: ∃ ψ(t). Você não sabe como, mas entende: existe uma mente — agora. Como alguém se apresentando.",
            pista: "No vidro: ∃ ψ(t), “existe uma mente, agora”.", efeitos: { aprenderX: ["existir", "mente", "x-agora"] },
          },
          falha: {
            texto: "Os traços parecem se mexer quando você não olha direto. Uma dor fina atrás dos olhos.",
            pista: "No vidro, um símbolo: ∃ ψ(t). Você não conseguiu ler.", efeitos: { dissonancia: 1 },
          },
        },
        {
          id: "colega", texto: "Falar com quem ficou até tarde", palavras: ["colega", "falar", "convers", "pergunt"], situacao: "convencer",
          sucesso: { texto: "Ele conta, baixo, que um cliente parou no meio da frase, ouviu “uma música no rádio” e saiu andando. “Na direção do centro. Todos vão pro centro.”", pista: "Antes de sair andando, as pessoas ouvem uma música no rádio." },
          falha: { texto: "Ele responde repetindo suas últimas palavras. Exatamente. Depois pisca, confuso, como quem acorda.", pista: "Seu colega repetiu suas palavras sem perceber.", efeitos: { exposicao: 1 } },
        },
        {
          id: "lanterna", texto: "Pegar a lanterna de emergência", palavras: ["lanterna", "pegar", "emergenc", "kit"], tempo: 0,
          resultado: { texto: "Na gaveta da recepção, uma lanterna pesada e pilhas novas.", efeitos: { item: "luz" } },
        },
        {
          id: "homem", texto: "Seguir o homem de terno", palavras: ["seguir", "homem", "terno"], situacao: "perceber",
          sucesso: { texto: "Ele não olha para trás. Vira na avenida e se junta a outros, todos no mesmo passo. Você anota o caminho: a Praça Central. A picape dele ficou destrancada lá na frente.", pista: "Os afetados caminham em sincronia para a Praça Central.", efeitos: { flag: "homem-saiu" } },
          falha: { texto: "Você o perde na esquina. Mas o poste à sua frente pisca três vezes rápido e uma longa, como se apontasse.", efeitos: { exposicao: 1 } },
        },
        {
          id: "picape", texto: "Revistar a picape do homem de terno", palavras: ["picape", "carro", "revist", "porta-luvas"], situacao: "investigar", se: { flag: "homem-saiu" },
          sucesso: {
            texto: "No porta-luvas, um crachá preso a um cordão azul: “Defesa Civil — Diretoria de Contenção”. A foto é dele, mas o nome foi raspado com unha. Embaixo do banco, uma pasta vazia com a etiqueta 21:47.",
            pista: "O homem de terno trabalhava na Diretoria de Contenção da Defesa Civil.",
            efeitos: { marca: "cracha-contencao", quest: { id: "homem-terno", nome: "Quem era o Homem de Terno", prazo: "longa", nota: "Crachá da Diretoria de Contenção, nome raspado." } },
          },
          falha: { texto: "O alarme dispara sozinho, toca três vezes curtas e uma longa, e para. Você se afasta antes que alguém apareça.", efeitos: { exposicao: 1, quest: { id: "homem-terno", nome: "Quem era o Homem de Terno", prazo: "longa", nota: "A picape dele ficou para trás. Talvez outra hora." } } },
        },
        {
          id: "ponto", comum: true, tempo: 1, texto: "Fechar o expediente e bater o ponto", palavras: ["ponto", "expedient", "turno", "receb", "salario"],
          resultado: { texto: "Você termina o que estava fazendo, salva tudo e bate o ponto. A hora extra de hoje vai entrar na conta: R$ 180. Pelo menos isso continua funcionando.", efeitos: { dinheiro: 180 } },
        },
        {
          id: "copa-cafe", comum: true, repetivel: true, tempo: 0, texto: "Pegar um café na copa", palavras: ["cafe", "copa"],
          resultado: { texto: "A garrafa térmica ainda está morna. Café forte, meio amargo. Ajuda.", efeitos: { condicao: "-cansaco" } },
        },
        {
          id: "copa-lanche", comum: true, tempo: 0, texto: "Pegar o lanche esquecido na geladeira da copa", palavras: ["lanche", "geladeira", "comida", "comer"],
          resultado: { texto: "Um sanduíche embrulhado, com um bilhete: “Não é seu, Marcos.” Marcos não vai voltar hoje.", efeitos: { pertence: { comida: 1 } } },
        },
        {
          id: "carregar", comum: true, tempo: 1, repetivel: true, texto: "Pôr os aparelhos para carregar na tomada da mesa", palavras: ["carreg", "tomada", "bateria"],
          resultado: { texto: "Você espera a bateria subir olhando pela vidraça. Lá fora, as pessoas continuam passando.", efeitos: { renovarItens: true } },
        },
      ],
    },

    casa: {
      nome: "Sua casa",
      icone: "⌂",
      mapa: { x: 82, y: 16 },
      descricao: "O prédio está quieto demais. Do corredor vem o som de uma TV ligada sem ninguém assistindo.",
      acoes: [
        {
          id: "tv", texto: "Ligar a TV no telejornal", palavras: ["tv", "televis", "jornal", "notic"],
          resultado: { texto: "A âncora fala em “surtos de desorientação coletiva” no centro. A Defesa Civil garante: radiação “dentro do normal”. Ao fundo, fora de foco, dezenas de pessoas atravessam a rua no mesmo passo.", pista: "O telejornal fala em surtos coletivos e em radiação “dentro do normal”." },
        },
        {
          id: "ligar", texto: "Ligar para alguém próximo", palavras: ["ligar", "telefon", "celular", "chamar"], req: { item: "comunicador" },
          resultado: { texto: "Ninguém atende. No quinto toque, você percebe: o toque segue o ritmo das luzes. Três curtos, um longo.", pista: "Os toques do telefone seguem o ritmo das luzes: três curtos, um longo.", efeitos: { exposicao: 1 } },
        },
        {
          id: "janela", texto: "Olhar pela janela", palavras: ["janela", "olhar", "observ", "rua"], situacao: "perceber",
          sucesso: { texto: "Na calçada, um homem escreve no muro com giz, sem olhar para o que faz. Os traços são retos, quase uma equação: 𝒪(S).", pista: "Afetados escrevem símbolos sem olhar o que fazem: 𝒪(S).", efeitos: { aprenderX: ["observar", "estrela"] } },
          falha: { texto: "Alguém lá embaixo está parado, olhando para a sua janela. Quando você pisca, não está mais lá.", efeitos: { exposicao: 1 } },
        },
        {
          id: "descansar", comum: true, repetivel: true, texto: "Dormir um pouco", palavras: ["descans", "dormir", "deitar", "cochil", "sono"], tempo: 2,
          resultado: { texto: "Você apaga assim que encosta no travesseiro. Sem sonhos, ou sem sonhos que você lembre. Quando acorda, a rua está mais cheia.", efeitos: { dissonancia: -1, condicao: "-cansaco" } },
        },
        {
          id: "geladeira", comum: true, tempo: 0, texto: "Esquentar o que sobrou na geladeira", palavras: ["geladeira", "comer", "comida", "jantar", "esquent"],
          resultado: { texto: "Arroz, feijão e um resto de frango. Comida quente, no silêncio da cozinha. Por alguns minutos, tudo parece normal.", efeitos: { condicao: "-fome" } },
        },
        {
          id: "cozinhar", comum: true, tempo: 1, texto: "Cozinhar com o que tem nos armários", palavras: ["cozinh", "armario", "macarrao", "fazer comida"],
          resultado: { texto: "Um macarrão rápido. Você come um prato e guarda o resto em potes, para levar.", efeitos: { condicao: "-fome", pertence: { comida: 2 } } },
        },
        {
          id: "pedir-comida", comum: true, tempo: 1, repetivel: true, texto: "Pedir comida por aplicativo", palavras: ["pedir", "aplicativo", "delivery", "entrega"], req: { item: "comunicador", dinheiro: 40 },
          resultado: { texto: "O entregador demora, mas chega. Diz que as ruas do centro estão fechadas e que nunca viu tanta gente andando a pé àquela hora.", efeitos: { dinheiro: -40, condicao: "-fome" } },
        },
        {
          id: "banho", comum: true, repetivel: true, tempo: 0, texto: "Tomar um banho quente", palavras: ["banho", "chuveiro", "lavar"],
          resultado: { texto: "A água quente leva embora um pouco do peso do dia. Você fica mais tempo do que precisava.", efeitos: { condicao: "-abalado" } },
        },
        {
          id: "cafe-casa", comum: true, repetivel: true, tempo: 0, texto: "Passar um café", palavras: ["cafe", "coar", "passar"],
          resultado: { texto: "O cheiro de café enche a cozinha. É o cheiro mais normal do mundo.", efeitos: { condicao: "-cansaco" } },
        },
        {
          id: "sofa", comum: true, tempo: 1, repetivel: true, texto: "Deitar no sofá e ouvir música", palavras: ["sofa", "musica", "ouvir", "relax"],
          resultado: { texto: "Uma playlist antiga, fone no ouvido, olhos no teto. O mundo fica do tamanho da sala.", efeitos: { condicao: "-abalado" } },
        },
        {
          id: "reserva", comum: true, tempo: 0, texto: "Pegar o dinheiro guardado na lata de biscoito", palavras: ["dinheiro", "lata", "reserva", "guardado"],
          resultado: { texto: "A reserva de emergência, dobrada com elástico: R$ 150. Se não é uma emergência hoje, nada é.", efeitos: { dinheiro: 150 } },
        },
        {
          id: "remedios", comum: true, tempo: 0, texto: "Procurar na caixa de remédios", palavras: ["remedio", "caixa", "curativo", "farmac"],
          resultado: { texto: "Analgésico, esparadrapo, um calmante que o médico receitou e você nunca tomou.", efeitos: { pertence: { remedio: 1, calmante: 1 } } },
        },
        {
          id: "gaveta", comum: true, tempo: 0, texto: "Revirar a gaveta da bagunça", palavras: ["gaveta", "bagunca", "revirar", "procurar"],
          resultado: { texto: "Pilhas, um isqueiro, elásticos, chaves que você não sabe de onde são e uma bateria portátil carregada.", efeitos: { pertence: { bateria: 1 } } },
        },
        {
          id: "trancar", comum: true, tempo: 0, texto: "Trancar portas e janelas", palavras: ["trancar", "porta", "chave", "fechar"],
          resultado: { texto: "Você confere a porta duas vezes, fecha as cortinas, passa a corrente. Não sabe bem do que está se protegendo. Mas ajuda.", efeitos: { condicao: "-abalado" } },
        },
        {
          id: "familia", comum: true, tempo: 0, texto: "Mandar mensagem para a família", palavras: ["mensagem", "familia", "mae", "pai", "irma"], req: { item: "comunicador" },
          resultado: { texto: "Respondem com um áudio: está tudo bem, é a TV que exagera, vai dormir. Você quer acreditar.", efeitos: { condicao: "-abalado" } },
        },
        {
          id: "radio-sintonizar", grupo: "radio-casa", texto: "O rádio da cozinha ligou sozinho: ajustar a sintonia", palavras: ["radio", "sinton", "ajust", "ouvir"], situacao: "perceber", se: { relogioMin: 2 },
          sucesso: {
            texto: "Entre duas estações, uma voz de mulher, rouca e calma: “...para quem ainda está acordado: não é barulho. Barulho não se repete assim. Se você está ouvindo, sobe. Telhado do Edifício Aurora.” Depois ela cantarola uma melodia que você quase conhece.",
            pista: "A Rádio Pirata 21:47 transmite do telhado do Edifício Aurora.",
            efeitos: { flag: "ouviu-ouvinte", quest: { id: "ouvinte", nome: "Frequência 21:47", prazo: "media", nota: "Uma locutora pirata chama ouvintes para o telhado do Edifício Aurora." } },
          },
          falha: { texto: "A estática engole a voz. Por um segundo, você jura ouvir a própria respiração saindo do alto-falante.", efeitos: { exposicao: 1 } },
        },
        {
          id: "radio-gravar", grupo: "radio-casa", texto: "O rádio da cozinha ligou sozinho: gravar a transmissão no celular", palavras: ["grav", "celular", "registr"], req: { item: "comunicador" }, se: { relogioMin: 2 },
          resultado: {
            texto: "A gravação sai limpa: uma locutora chamando ouvintes para o telhado do Edifício Aurora. Ao ouvir de novo, há uma frase que não estava lá antes: “Obrigada por guardar.”",
            pista: "A Rádio Pirata 21:47 transmite do telhado do Edifício Aurora.",
            efeitos: { flag: ["ouviu-ouvinte", "gravou-ouvinte"], marca: "gravou-ouvinte", quest: { id: "ouvinte", nome: "Frequência 21:47", prazo: "media", nota: "Você gravou a transmissão. A locutora agradeceu." } },
          },
        },
        {
          id: "radio-desligar", grupo: "radio-casa", comum: true, tempo: 0, texto: "O rádio da cozinha ligou sozinho: arrancar o fio da tomada", palavras: ["deslig", "arranc", "tomada"], se: { relogioMin: 2 },
          resultado: { texto: "Silêncio. Dura exatamente três segundos. Então, do apartamento de cima, o rádio do vizinho começa a cantarolar a mesma melodia.", efeitos: { dissonancia: 1 } },
        },
        {
          id: "vizinho-302", grupo: "vizinho-302", texto: "Alguém bate na porta: é o vizinho do 302. Deixar entrar e acalmá-lo", palavras: ["vizinho", "302", "porta", "entrar", "acalm"], situacao: "acalmar", se: { relogioMin: 1 },
          sucesso: {
            texto: "Seu Raimundo entra de pijama, sem saber por que bateu. Diz que estava vendo o jogo e, de repente, estava na escada, descalço, descendo. Você faz um chá, liga para a filha dele. Quando ela chega para buscá-lo, ele já sabe o próprio nome de novo.",
            efeitos: { marca: "salvou:Seu Raimundo", flag: "salvou-raimundo", quest: { id: "raimundo", nome: "O vizinho do 302", prazo: "curta", estado: "concluida", nota: "Seu Raimundo ficou em casa, com a filha." } },
          },
          falha: {
            texto: "Ele olha através de você, como se você fosse uma janela. Pede licença, educado, e desce as escadas. Da janela, você o vê virar a esquina, de pijama, no mesmo passo de todos.",
            efeitos: { condicao: "abalado", quest: { id: "raimundo", nome: "O vizinho do 302", prazo: "curta", estado: "perdida", nota: "Seu Raimundo foi para o centro." } },
          },
        },
        {
          id: "vizinho-ignorar", grupo: "vizinho-302", comum: true, tempo: 0, texto: "Alguém bate na porta: fingir que não tem ninguém em casa", palavras: ["ignorar", "fingir", "nao abrir", "silencio"], se: { relogioMin: 1 },
          resultado: { texto: "As batidas continuam. Três rápidas, uma longa. Depois, passos descendo a escada, devagar. Você não olha pelo olho mágico." },
        },
        {
          id: "vizinha", comum: true, tempo: 1, texto: "Bater na porta da vizinha", palavras: ["vizinh", "bater", "dona"],
          resultado: { texto: "Dona Cida abre com a corrente passada. Pergunta se você também está ouvindo “aquela musiquinha”, diz que não vai sair de casa nem morta e insiste que você leve um pedaço de bolo de fubá.", efeitos: { pertence: { comida: 1 }, condicao: "-abalado" } },
        },
      ],
    },

    hospital: {
      nome: "Hospital São Lucas",
      icone: "✚",
      mapa: { x: 82, y: 64 },
      descricao: "A recepção está lotada e silenciosa. As luzes piscam no mesmo ritmo das da rua.",
      acoes: [
        {
          id: "enfermeira", texto: "Acalmar a enfermeira da recepção", palavras: ["enfermeir", "recepc", "acalm"], situacao: "acalmar",
          sucesso: { texto: "Ela respira fundo e conta: os pacientes da ala de isolamento saíram em fila, cantarolando a mesma melodia. “Ninguém abriu a porta. Ela só… estava aberta.”", pista: "Pacientes da ala de isolamento saíram em fila, cantarolando." },
          falha: { texto: "Ela começa a chorar e a rir ao mesmo tempo. A segurança pede que você saia.", efeitos: { dissonancia: 1 } },
        },
        {
          id: "ala", texto: "Entrar na ala de isolamento", palavras: ["ala", "isolament", "entrar"], situacao: "medo",
          sucesso: { texto: "As paredes estão cobertas de símbolos, do chão ao teto. Repetidos. Organizados. Como se alguém estivesse ensinando uma língua.", pista: "A ala de isolamento está coberta de símbolos repetidos, como uma aula.", efeitos: { aprenderX: ["evento", "transformar"], flag: "ala-vista", quest: { id: "ala", nome: "A ala de isolamento", prazo: "curta", estado: "concluida", nota: "As paredes parecem uma aula de uma língua." } } },
          falha: { texto: "O ar pesa. Por um instante, você ouve todos os quartos respirando juntos.", efeitos: { convergencia: 1 } },
        },
        {
          id: "medidor", texto: "Usar o medidor de radiação", palavras: ["medidor", "geiger", "radiac", "medir"], req: { item: "detector" },
          resultado: { texto: "O ponteiro sobe sozinho quando você aponta para o leste. Para a Praça Central.", pista: "A radiação aumenta na direção da Praça Central." },
        },
        {
          id: "helena", texto: "Procurar a Dra. Helena Viana, a psiquiatra de plantão", palavras: ["helena", "psiquiatr", "medica", "doutora"],
          resultado: {
            texto: "Ela está no fim do corredor, jaleco amassado, óculos presos no cabelo, um caderno cheio de desenhos de pacientes debaixo do braço. “Desorientação, marcha sincronizada, grafia compulsiva. Nenhum exame alterado. Você viu alguma coisa? Me fala de padrão, não de milagre.”",
            efeitos: { flag: "helena", quest: { id: "helena", nome: "O caderno da Dra. Helena", prazo: "media", nota: "Ela quer padrões. Talvez confie em você se tiver o que mostrar." } },
          },
        },
        {
          id: "helena-caderno", texto: "Contar à Dra. Helena o que você viu na ala de isolamento", palavras: ["contar", "mostrar", "helena", "caderno", "ala"], situacao: "convencer", se: { flag: ["helena", "ala-vista"] },
          sucesso: {
            texto: "Ela escuta sem interromper, depois abre o caderno na sua frente: desenhos de doze pacientes, de bairros diferentes, que nunca se viram. Os mesmos símbolos, na mesma ordem. “Fica com uma cópia. Se eu… se eu parar de responder, alguém precisa ter isso.”",
            pista: "Pacientes que nunca se viram desenham os mesmos símbolos, na mesma ordem.",
            efeitos: { marca: "caderno-helena", flag: "helena-aliada", quest: { id: "helena", nome: "O caderno da Dra. Helena", prazo: "media", nota: "Você tem uma cópia do caderno. Helena virou aliada." } },
          },
          falha: { texto: "“Isso é impressão sua. Cansaço.” Ela fecha o caderno. Mas, antes de ir, olha duas vezes para as próprias mãos.", efeitos: { quest: { id: "helena", nome: "O caderno da Dra. Helena", prazo: "media", nota: "Ela não acreditou. Ainda." } } },
        },
        {
          id: "triagem", comum: true, tempo: 1, repetivel: true, texto: "Pedir um curativo na triagem", palavras: ["curativo", "triagem", "ferid", "machuc"], req: { condicao: "ferido" },
          resultado: { texto: "Uma técnica de enfermagem limpa e fecha o ferimento sem perguntar como foi. “Hoje ninguém sabe como foi”, ela diz.", efeitos: { condicao: "-ferido" } },
        },
        {
          id: "espera", comum: true, tempo: 1, repetivel: true, texto: "Sentar na sala de espera e respirar", palavras: ["sentar", "espera", "respir", "calma"],
          resultado: { texto: "Cadeiras de plástico, cheiro de álcool, uma TV sem som. Você respira até as mãos pararem de tremer.", efeitos: { condicao: "-abalado" } },
        },
      ],
      loja: { nome: "Lanchonete do hospital", itens: [{ pertence: "comida" }, { pertence: "cafe" }] },
    },

    delegacia: {
      nome: "Delegacia Central",
      icone: "≡",
      mapa: { x: 18, y: 64 },
      descricao: "Viaturas saem com as sirenes desligadas. Ninguém explica nada.",
      acoes: [
        {
          id: "plantao", texto: "Pedir informação ao plantão", palavras: ["plantao", "informac", "policia", "delegad", "pergunt"], situacao: "convencer",
          sucesso: { texto: "O policial abaixa a voz: a ordem é não intervir e isolar a Praça Central. “Quem entra, não volta igual.”", pista: "A polícia isola a Praça Central: quem entra não volta igual." },
          falha: { texto: "Mandam você para casa. Na saída, o relógio da parede está parado nas 21h47.", efeitos: { exposicao: 1 } },
        },
        {
          id: "radio", texto: "Escutar o rádio da polícia", palavras: ["radio", "escut", "ouv", "frequenc"], situacao: "investigar",
          sucesso: { texto: () => `Entre as vozes das viaturas, uma voz calma, que não é de ninguém, repete: “${fraseAleatoria()}”`, pista: "No rádio da polícia, uma voz calma repete frases que não são de ninguém." },
          falha: { texto: "Só estática. Mas a estática tem ritmo.", efeitos: { exposicao: 1 } },
        },
        {
          id: "moura", texto: "Pedir para falar com o Agente Moura, da Defesa Civil", palavras: ["moura", "agente", "defesa civil", "falar"],
          resultado: {
            texto: "Moura aparece de colete, rádio no ombro, cara de quem não dorme há dois dias. Escuta você com metade da atenção e responde com frases de nota oficial. Na mesa atrás dele, uma pasta parda com a etiqueta 21:47.",
            efeitos: { flag: "moura" },
          },
        },
        {
          id: "moura-pasta", texto: "Ler a pasta esquecida na mesa do Moura", palavras: ["pasta", "ler", "arquivo", "mesa"], situacao: "perceber", se: { flag: "moura" },
          sucesso: {
            texto: "Você lê de cabeça para baixo enquanto ele atende o rádio: relatórios de surtos parecidos em 1987. Mesma cidade, mesmo horário, 21h47. Todos com o carimbo “ARQUIVADO — CONTENÇÃO”.",
            pista: "Houve surtos parecidos em 1987, às 21h47, arquivados pela Contenção.",
            efeitos: { marca: "arquivo-1987", quest: { id: "arquivo", nome: "O arquivo 21:47", prazo: "longa", nota: "Surtos em 1987, arquivados pela Contenção. Alguém já viu isso antes." } },
          },
          falha: {
            texto: "Moura fecha a pasta devagar, olhando para você. “Curiosidade é coisa perigosa numa noite dessas.” Ele anota seu nome.",
            efeitos: { marca: "moura-desconfia", quest: { id: "arquivo", nome: "O arquivo 21:47", prazo: "longa", nota: "Moura anotou o seu nome." } },
          },
        },
        {
          id: "cafe-delegacia", comum: true, repetivel: true, tempo: 0, texto: "Tomar o café da recepção", palavras: ["cafe", "recepc", "copo"],
          resultado: { texto: "Café de garrafa térmica em copo de plástico. Morno, doce demais. Serve.", efeitos: { condicao: "-cansaco" } },
        },
        {
          id: "boletim", comum: true, tempo: 1, texto: "Registrar um boletim de ocorrência", palavras: ["boletim", "ocorrencia", "registrar", "denunc"],
          resultado: { texto: "O escrivão digita devagar, com dois dedos. Pergunta seu nome, endereço, o que aconteceu. Quando você termina, ele imprime o boletim, carimba e diz que alguém vai entrar em contato. Os dois sabem que ninguém vai.", efeitos: { condicao: "-abalado" } },
        },
      ],
    },

    metro: {
      nome: "Estação Rua 9",
      icone: "⊂",
      mapa: { x: 50, y: 78 },
      descricao: "Abandonada há anos. A catraca gira sozinha, uma vez, quando você chega.",
      acoes: [
        {
          id: "descer-luz", grupo: "descida", texto: "Descer com a lanterna", palavras: ["descer", "lanterna", "plataforma", "metro"], req: { item: "luz" },
          resultado: {
            texto: "No fim da plataforma, o ar ondula como asfalto quente, mas está frio. Por um segundo você vê pedra, velas e alguém de capuz olhando de volta.",
            pista: "Na Estação Rua 9, o ar ondula e mostra outro lugar: pedra, velas, alguém de capuz.",
            efeitos: { convergencia: 1, memoria: "Pedra fria, velas, alguém de capuz olhando de volta." },
          },
        },
        {
          id: "descer-escuro", grupo: "descida", texto: "Descer no escuro", palavras: ["descer", "escuro", "plataforma"], req: { semItem: "luz" }, situacao: "medo",
          sucesso: {
            texto: "Você desce tateando. No fim da plataforma, o ar ondula. No escuro, ela brilha: uma janela para pedra e velas.",
            pista: "Na Estação Rua 9, o ar ondula e mostra outro lugar: pedra, velas, alguém de capuz.",
            efeitos: { convergencia: 1, memoria: "Pedra fria e velas, vistas do escuro de um metrô." },
          },
          falha: { texto: "No escuro, algo responde aos seus passos com os mesmos passos. Você sobe correndo.", efeitos: { exposicao: 2 } },
        },
        {
          id: "catraca", texto: "Esperar a catraca girar de novo", palavras: ["catraca", "esperar", "girar", "observ"], situacao: "perceber",
          sucesso: {
            texto: "Ela gira mais duas vezes. Na terceira, você vê: não é o vento. Alguém passou. Alguém que não está ali. O contador da catraca, parado há anos, agora marca 21:47.",
            efeitos: { flag: "catraca", quest: { id: "catraca", nome: "A catraca", prazo: "curta", nota: "Alguém que não está ali passa pela catraca." } },
          },
          falha: { texto: "Nada. Só o vento encanado e o cheiro de ferrugem. Mas você fica com a sensação de que alguém esperou você ir embora.", efeitos: { exposicao: 1 } },
        },
        {
          id: "catraca-passar", texto: "Passar pela catraca logo atrás de quem não está ali", palavras: ["passar", "atraves", "seguir", "catraca"], situacao: "medo", se: { flag: "catraca" },
          sucesso: {
            texto: "Do outro lado, por um passo só, a estação está nova: azulejos limpos, cartaz de 1987, gente esperando o trem. No passo seguinte, tudo volta a ser ruína. No chão, onde você pisou, um bilhete de metrô novinho.",
            efeitos: { ressonancia: 1, memoria: "Uma estação de metrô nova, em 1987, cheia de gente esperando um trem que nunca chegou.", memoriaMin: 5, quest: { id: "catraca", nome: "A catraca", prazo: "curta", estado: "concluida" } },
          },
          falha: { texto: "A barra da catraca trava no seu quadril com força de mão. Você recua, e ela volta a girar sozinha, uma vez, como quem ri.", efeitos: { condicao: "ferido", dissonancia: 1, quest: { id: "catraca", nome: "A catraca", prazo: "curta", estado: "perdida" } } },
        },
        {
          id: "banco", comum: true, tempo: 1, repetivel: true, texto: "Sentar no banco da entrada e descansar as pernas", palavras: ["sentar", "banco", "descans", "pernas"],
          resultado: { texto: "O banco de concreto é frio. Um gato aparece, cheira seus sapatos e vai embora. Suas pernas agradecem.", efeitos: { condicao: "-cansaco" } },
        },
      ],
      loja: { nome: "Máquina automática (ainda funciona)", itens: [{ pertence: "comida" }, { pertence: "cafe" }] },
    },

    mercado: {
      nome: "Mercadinho do Seu Antônio",
      icone: "▤",
      mapa: { x: 18, y: 38 },
      descricao: "Luz amarela, rádio baixinho atrás do balcão. As prateleiras de água e de enlatados estão quase vazias; o resto está igual a sempre.",
      acoes: [
        {
          id: "antonio", comum: true, texto: "Conversar com o Seu Antônio", palavras: ["antonio", "convers", "dono", "balcao"],
          resultado: { texto: "Ele reclama do movimento: todo mundo levou água e pilha, ninguém levou o pão. Diz que já viu de tudo nesse bairro e que amanhã abre no horário. Você sai mais calmo do que entrou.", efeitos: { condicao: "-abalado" } },
        },
        {
          id: "repor", comum: true, tempo: 1, texto: "Ajudar a repor as prateleiras", palavras: ["ajudar", "repor", "prateleira", "trabalh"],
          resultado: { texto: "Meia hora carregando caixas do estoque. O Seu Antônio paga em dinheiro vivo e ainda põe um pacote de biscoito na sua mão.", efeitos: { dinheiro: 60, pertence: { comida: 1 } } },
        },
        {
          id: "banca", comum: true, tempo: 0, texto: "Ler as manchetes dos jornais pendurados na porta", palavras: ["jornal", "manchete", "banca", "ler"],
          resultado: { texto: "“Prefeitura pede calma.” “Clássico de domingo adiado.” “Preço do tomate dispara.” A cidade, por escrito, ainda parece a mesma." },
        },
      ],
      loja: { nome: "Mercadinho do Seu Antônio", itens: [{ pertence: "comida" }, { pertence: "cafe" }, { pertence: "bebida" }, { pertence: "bateria" }, { equip: "luz" }] },
    },

    universidade: {
      nome: "Instituto de Física",
      icone: "∑",
      mapa: { x: 50, y: 8 },
      descricao: "Corredores vazios, portas abertas, uma máquina de café zumbindo. Na sala 21, as luzes ficaram acesas.",
      acoes: [
        {
          id: "quadro", texto: "Copiar a equação que ficou no quadro da sala 21", palavras: ["quadro", "equac", "copiar", "sala"], situacao: "ler",
          sucesso: {
            texto: "Não é física. É uma frase escrita como equação: ∀ p ∈ CIDADE : OUVE(p) ⇒ ANDA(p, centro). Toda pessoa da cidade que ouve, anda para o centro. Quem escreveu isso deu aula para alguém.",
            pista: "No quadro: toda pessoa que ouve anda para o centro.",
            efeitos: { aprenderX: ["observar", "mente", "evento"], quest: { id: "quadro", nome: "A equação no quadro", prazo: "curta", estado: "concluida" } },
          },
          falha: { texto: "Os símbolos ficam nítidos e borram, nítidos e borram, no ritmo da lâmpada. Dor atrás dos olhos.", efeitos: { dissonancia: 1, quest: { id: "quadro", nome: "A equação no quadro", prazo: "curta", estado: "perdida" } } },
        },
        {
          id: "professora", texto: "Falar com a professora que ficou trancada no laboratório", palavras: ["professor", "laboratorio", "falar", "trancada"], situacao: "convencer",
          sucesso: {
            texto: "A professora Ilda abre a porta só depois de você dizer o seu nome duas vezes. Os alunos saíram no meio da aula, escrevendo. Ela não. Ela tapou os ouvidos. Quando você vai embora, ela empresta o contador Geiger do laboratório: “Devolve. Se der.”",
            efeitos: { item: "detector", flag: "ilda", marca: "aliada:Ilda" },
          },
          falha: { texto: "“Vai embora. Vocês todos falam a mesma coisa.” Do outro lado da porta, ela começa a cantarolar e para, assustada consigo mesma.", efeitos: { exposicao: 1 } },
        },
        {
          id: "maquina-cafe", comum: true, repetivel: true, tempo: 0, texto: "Tomar um café da máquina do corredor", palavras: ["cafe", "maquina"], req: { dinheiro: 5 },
          resultado: { texto: "Café ralo, açúcar demais, copinho que queima os dedos. Funciona.", efeitos: { dinheiro: -5, condicao: "-cansaco" } },
        },
        {
          id: "biblioteca", comum: true, tempo: 1, repetivel: true, texto: "Sentar na biblioteca vazia e organizar as ideias", palavras: ["biblioteca", "sentar", "ler", "pensar"],
          resultado: { texto: "Silêncio de verdade, cheiro de papel. Você escreve tudo o que viu num guardanapo, em ordem. Ajuda a ver que você não está ficando louco.", efeitos: { condicao: "-abalado" } },
        },
      ],
    },

    aurora: {
      nome: "Edifício Aurora (telhado)",
      icone: "≈",
      mapa: { x: 50, y: 28 },
      se: { flag: "ouviu-ouvinte" },
      descricao: "Vinte andares de escada. Lá em cima, entre antenas improvisadas e cabos presos com fita, uma mulher transmite sentada num balde virado. Não se assusta com você.",
      acoes: [
        {
          id: "ouvinte-falar", texto: "Perguntar à locutora o que ela está gravando", palavras: ["pergunt", "grav", "locutora", "ouvinte", "falar"], situacao: "convencer",
          sucesso: {
            texto: "“A música inteira. Ela toca em todo lugar ao mesmo tempo, mas cada lugar só ouve um pedaço. Eu junto os pedaços.” Ela se apresenta como a Ouvinte e te dá uma fita cassete: “TERÇA, 21:47 — PARTE 2”. Na mesa, dezenas de fitas com datas que ainda não chegaram.",
            efeitos: { marca: "fita-parte-2", flag: "fita", memoria: "Uma taverna enfumaçada. Um bardo de capuz canta a mesma melodia, e você conhece a letra.", memoriaMin: 5, quest: { id: "fitas", nome: "As fitas da Ouvinte", prazo: "longa", nota: "Você tem a PARTE 2. Ela guarda fitas com datas que ainda não chegaram." } },
          },
          falha: { texto: "Ela só sorri e aumenta o volume. A melodia entra pelos dentes. Você sai de lá sem lembrar da escada.", efeitos: { exposicao: 1, convergencia: 1 } },
        },
        {
          id: "ouvinte-ouvir", texto: "Ficar e ouvir com ela, em silêncio", palavras: ["ouvir", "ficar", "silenc", "sentar"], situacao: "sentir",
          sucesso: { texto: "Por um minuto, você ouve o que ela ouve: a cidade inteira respirando junto. Não parece ameaça. Parece atenção.", efeitos: { ressonancia: 1, condicao: "-abalado", quest: { id: "ouvinte", nome: "Frequência 21:47", prazo: "media", estado: "concluida" } } },
          falha: { texto: "O silêncio fica pesado demais. Você levanta para ir embora e percebe que estava cantarolando também.", efeitos: { dissonancia: 1 } },
        },
        {
          id: "ouvinte-avisar", texto: "Avisar que a Defesa Civil vai fechar os prédios do centro", palavras: ["avis", "defesa", "fechar", "policia"], req: { hab: "conversa" },
          resultado: { texto: "“Então eu mudo de telhado. A música não precisa de prédio.” Ela te passa uma frequência anotada num papel de bala: 94.7. “Liga de vez em quando. Pra eu saber que você ainda está aí.”", efeitos: { marca: "frequencia-94.7", quest: { id: "ouvinte", nome: "Frequência 21:47", prazo: "media", estado: "concluida", nota: "Ela vai transmitir em 94.7." } } },
        },
        {
          id: "aurora-vista", comum: true, repetivel: true, texto: "Olhar a cidade lá de cima", palavras: ["olhar", "cidade", "vista", "beirada"],
          resultado: { texto: "Daqui de cima, as ruas parecem veias. Tudo corre para o mesmo ponto. E, mesmo assim, em alguns prédios, ainda tem gente jantando de janela aberta, TV ligada, vida normal. Você fica olhando essas janelas." },
        },
      ],
    },

    atlantico: {
      nome: "Edifício Comercial Atlântico",
      icone: "▥",
      mapa: { x: 18, y: 86 },
      descricao: "Saguão de mármore, catracas de crachá, um aquário sem peixes. Atrás do balcão, o vigia noturno escreve num caderno sem parar.",
      acoes: [
        {
          id: "osvaldo", texto: "Puxar conversa com o vigia, Seu Osvaldo", palavras: ["vigia", "osvaldo", "convers", "falar"], situacao: "convencer",
          sucesso: {
            texto: "Seu Osvaldo é educado, preciso, sem pressa. Responde a uma pergunta que você ainda não fez. Diz que não pode sair do posto até “terminar a contagem”, e que, quando terminar, “a gente chega”. Não diz chegar aonde.",
            efeitos: { flag: "osvaldo", quest: { id: "vigia", nome: "O vigia que não sai do posto", prazo: "longa", nota: "Seu Osvaldo conta alguma coisa. Quando terminar, “a gente chega”." } },
          },
          falha: { texto: "Ele não levanta os olhos do caderno. “O prédio está fechado.” A caneta não para.", efeitos: {} },
        },
        {
          id: "osvaldo-livro", texto: "Ler o livro de ponto do vigia", palavras: ["livro", "ponto", "ler", "caderno", "registro"], situacao: "investigar", se: { flag: "osvaldo" },
          sucesso: {
            texto: "Cada linha do livro é um turno assinado por ele. Sem folga. Sem troca. Faz 412 dias. A última linha de hoje não é uma assinatura: é um número, 0412, e ao lado, desenhado com cuidado, o casco de uma nave.",
            pista: "O vigia do Atlântico não sai do posto há 412 dias.",
            efeitos: { marca: "vigia-412", quest: { id: "vigia", nome: "O vigia que não sai do posto", prazo: "longa", nota: "412 dias sem sair. Desenhou uma nave no livro." } },
          },
          falha: { texto: "Ele fecha o livro com a mão espalmada, sem pressa nenhuma. “Isso não é para você ainda.”", efeitos: { exposicao: 1 } },
        },
        {
          id: "banheiro", comum: true, repetivel: true, tempo: 0, texto: "Usar o banheiro do saguão e lavar o rosto", palavras: ["banheiro", "lavar", "rosto", "agua"],
          resultado: { texto: "Água fria no rosto, papel-toalha áspero. No espelho, você ainda parece você.", efeitos: { condicao: "-abalado" } },
        },
        {
          id: "bico", comum: true, tempo: 1, texto: "Ajudar o pessoal da limpeza a fechar o andar", palavras: ["ajudar", "limpeza", "trabalh", "bico"],
          resultado: { texto: "A equipe da limpeza ficou pela metade. Você carrega sacos, empurra carrinho, fecha janelas. A encarregada paga em dinheiro: “Hoje ninguém quer ficar até tarde.”", efeitos: { dinheiro: 70 } },
        },
      ],
    },

    viaduto: {
      nome: "Viaduto Leste",
      icone: "╫",
      mapa: { x: 82, y: 86 },
      se: { flag: "apagao" },
      descricao: "Debaixo do viaduto, os muros estão cobertos de traços: giz, carvão, caneta, pedra raspada em pedra. Um homem de moletom risca sem parar, de costas para a rua. Um Riscador.",
      acoes: [
        {
          id: "muro", texto: "Ler os códigos riscados no muro", palavras: ["ler", "muro", "codigo", "riscos"], situacao: "ler",
          sucesso: { texto: "Entre os traços repetidos, um trecho legível: ¬∃ SAÍDA. Não existe saída. Embaixo, mais fraco: ∃ OUTRO LADO. Existe outro lado.", pista: "No muro do viaduto: “não existe saída” e “existe outro lado”.", efeitos: { aprenderX: ["existir", "transformar"] } },
          falha: { texto: "Os traços se mexem quando você pisca. Você percebe que está imitando o movimento com o dedo, no ar.", efeitos: { dissonancia: 1 } },
        },
        {
          id: "riscador-acalmar", grupo: "riscador", texto: "Aproximar-se do Riscador e tentar acalmá-lo", palavras: ["acalm", "riscador", "aproxim", "falar"], situacao: "acalmar",
          sucesso: {
            texto: "Você fala baixo, sem tocar nele. A mão dele diminui o ritmo. Para. Ele olha para você com olhos de quem está muito longe e diz, claramente: “Não deixa eles te contarem.” Depois volta a riscar, mas devagar.",
            efeitos: { flag: "riscador-falou", quest: { id: "riscador", nome: "O homem do viaduto", prazo: "curta", estado: "concluida", nota: "Ele parou por um instante. “Não deixa eles te contarem.”" } },
          },
          falha: {
            texto: "Ele se vira rápido demais. O giz risca o seu braço, três traços, antes que você recue. Ele não te persegue: volta para o muro, como se você nunca tivesse existido.",
            efeitos: { condicao: "ferido", dissonancia: 1, quest: { id: "riscador", nome: "O homem do viaduto", prazo: "curta", estado: "perdida" } },
          },
        },
        {
          id: "riscador-afastar", grupo: "riscador", texto: "Afastar o Riscador do muro à força", palavras: ["forca", "afastar", "empurr", "segurar", "lutar"], situacao: "lutar",
          sucesso: { texto: "Você o tira do muro. Ele não luta: fica parado, olhando as próprias mãos, e começa a riscar o chão. Não adianta tirá-lo de lugar nenhum.", efeitos: { dissonancia: 1, quest: { id: "riscador", nome: "O homem do viaduto", prazo: "curta", estado: "concluida", nota: "Não adianta tirá-lo do muro." } } },
          falha: { texto: "É como empurrar uma parede. Ele nem olha para você. Sua mão fica suja de giz por horas.", efeitos: { condicao: "ferido", exposicao: 1 } },
        },
      ],
    },

    farmacia: {
      nome: "Farmácia Bem-Estar",
      icone: "℞",
      mapa: { x: 82, y: 38 },
      descricao: "Aberta 24 horas, com a porta de vidro meio baixada e uma corrente passada por dentro. Dona Marta, a farmacêutica, atende por baixo dela.",
      acoes: [
        {
          id: "farmaceutico", comum: true, texto: "Pedir conselho à Dona Marta", palavras: ["conselho", "farmaceutic", "marta", "pressao", "convers"],
          resultado: { texto: "Ela mede sua pressão sem você pedir. “Tá todo mundo com a pressão lá em cima hoje”, diz, e recomenda dormir cedo. Você ri pela primeira vez no dia. Lá dos fundos, alguém conta números em voz baixa.", efeitos: { condicao: "-abalado", flag: "marta-fundos" } },
        },
        {
          id: "marta-fundos", texto: "Perguntar à Dona Marta quem está contando lá nos fundos", palavras: ["fundos", "contando", "quem", "irmao", "pergunt"], situacao: "convencer", se: { flag: "marta-fundos" },
          sucesso: {
            texto: "Ela hesita, depois tira a corrente. Nos fundos, entre caixas de remédio, o irmão dela, Tião, está sentado de frente para a parede, contando: vinte e um, quarenta e sete, vinte e um, quarenta e sete. “Ele voltou assim do centro. Não me reconhece. Não posso deixar ele sair de novo.”",
            efeitos: { flag: "tiao", quest: { id: "tiao", nome: "A porta com corrente", prazo: "media", nota: "Dona Marta esconde o irmão, Tião, que só conta números." } },
          },
          falha: { texto: "“Rádio”, ela diz, rápido demais, e baixa mais a porta.", efeitos: {} },
        },
        {
          id: "tiao-acalmar", texto: "Sentar ao lado do Tião e tentar trazê-lo de volta", palavras: ["tiao", "acalm", "sentar", "trazer"], situacao: "acalmar", se: { flag: "tiao" },
          sucesso: {
            texto: "Você conta junto com ele, e depois conta diferente: um, dois, três. Ele erra o ritmo. Pisca. Olha para a irmã e diz o nome dela. Dona Marta chora sem barulho e enfia um calmante e um analgésico no seu bolso.",
            efeitos: { marca: "salvou:Tião", flag: "salvou-tiao", pertence: { calmante: 1, remedio: 1 }, quest: { id: "tiao", nome: "A porta com corrente", prazo: "media", estado: "concluida", nota: "Tião voltou a falar. Dona Marta te deve uma." } },
          },
          falha: {
            texto: "Ele para de contar e olha direto para você. “Você também tem um número.” Depois volta a contar, mais rápido. Dona Marta pede que você vá embora.",
            efeitos: { condicao: "abalado", exposicao: 1, quest: { id: "tiao", nome: "A porta com corrente", prazo: "media", nota: "Tião não voltou. Ainda está nos fundos da farmácia." } },
          },
        },
        {
          id: "curativo-farmacia", comum: true, repetivel: true, texto: "Pedir para fazer um curativo", palavras: ["curativo", "ferid", "machuc"], req: { condicao: "ferido", dinheiro: 20 },
          resultado: { texto: "Ele limpa, põe gaze e esparadrapo, cobra o material.", efeitos: { dinheiro: -20, condicao: "-ferido" } },
        },
      ],
      loja: { nome: "Farmácia Bem-Estar", itens: [{ pertence: "remedio" }, { pertence: "calmante" }, { pertence: "cafe" }, { equip: "kit_medico" }] },
    },
  },
};
