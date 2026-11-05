// =====================================================================
// Missão: A MANHÃ SEGUINTE — Ato 1, Eixo X (Urbano). Plano em ATO_1.md, seção 3 (X1).
// ---------------------------------------------------------------------
// A noite do Pulso acabou, mas Port Halden não voltou ao normal. A Diretoria de Contenção
// cercou o centro, distribui ração e recolhe quem anda sozinho. O jogador acorda em casa sem
// lembrar de ter voltado e precisa atravessar o dia: água, comida, abrigo, as pessoas que salvou.
//
// O fio do Ato 1 é a Contagem: o Teddy conta números de trás para frente. Juntando os sinais
// (pistas), o jogador descobre que é uma contagem em minutos que termina na sexta, às 21:47.
// O relógio é o dia; cheio, vem o toque de recolher.
//
// Paga os fios do prólogo pelas marcas do personagem (se: { marca, semMarca, algumaMarca }):
// salvou:Danny, salvou:Teddy, salvou:Sr. Hollis, caderno-helena, cracha-contencao, arquivo-contencao,
// moura-desconfia, vigia-412, frequencia-94.7, fita-parte-2.
// =====================================================================

(() => {
  const MISSOES = window.MISSOES || (window.MISSOES = {});
  const temMarca = (ctx, k) => ctx.grupo.some((p) => (p.marcas || []).includes(k));

  MISSOES["x1-manha"] = {
    id: "x1-manha",
    eixo: "x",
    titulo: "A Manhã Seguinte",
    subtitulo: "Ato 1 · Eixo X — Urbano",
    resumo: "A noite acabou, a loucura não. A Contenção cercou o centro e o toque de recolher começa às seis. Ache quem você salvou, arrume comida e água, e descubra o que o Teddy está contando.",
    fase: "Padrões",
    faseTag: "Ato 1 · Padrões",
    relogioMax: 14, // o dia: das seis da manhã ao toque de recolher
    pistasParaMarco: 4,
    marcoTexto: "Voltar à Drogaria Goodwell: entender a contagem do Teddy",
    marcoDica: "Com 4 sinais da contagem você pode voltar à Drogaria Goodwell quando quiser. No toque de recolher, não há mais escolha.",
    mapaDica: "O centro está cercado pela Contenção.",
    textoFinal: "Fim de A Manhã Seguinte. Em Yudur, alguém conta os mesmos números (próxima missão do Ato 1, ainda não escrita).",
    inicio: "abertura",
    lugarInicial: "casa",
    centroMapa: { x: 50, y: 50, nome: "Centro (cercado)" },

    npcs: {
      helen: "Dra. Helen Vance", moore: "Agente Moore", martha: "Martha Kowalski", teddy: "Teddy",
      abe: "Abe", sal: "Sal, o porteiro", danny: "Danny", "homem-terno": "O Homem de Terno",
      hollis: "Sr. Hollis, do 302", petrakis: "Sra. Petrakis", oswald: "Oswald, o vigia",
      rita: "Rita Alvarez", guarda: "Guarda da Contenção", saqueador: "Um saqueador", walt: "Walt Brody",
    },

    // a profissão ainda decide algumas coisas (o mesmo ponto de entrada do prólogo)
    trabalho(p) {
      return MISSOES["prologo-x"].trabalho(p);
    },

    caminho(daqui, destino, temVeiculo) {
      if (temVeiculo) return "caminho-carro";
      if (destino === "casa") return "caminho-escada";
      return "caminho-calcada";
    },

    ambiente(relogio) {
      if (relogio <= 3) return "Manhã cinzenta. As ruas estão vazias, a não ser pelos caminhões brancos e por quem ficou parado onde a noite o deixou.";
      if (relogio <= 7) return "Meio-dia. Filas em toda parte. Nos muros, os riscos de giz da noite já viraram paisagem.";
      if (relogio <= 10) return "A tarde cai rápido. Os alto-falantes repetem o horário do toque de recolher a cada quinze minutos.";
      return "Quase seis. Portas batendo, persianas descendo. Quem ainda está na rua anda depressa, sem olhar para ninguém.";
    },

    eventosRelogio: [
      { em: 3, flag: "comunicado", texto: "Alto-falantes nos postes: “Diretoria de Contenção. Ferva toda a água. Toque de recolher às 18h. Fique em casa. Fique com os seus.”" },
      { em: 6, flag: "recolhendo", texto: "Caminhões brancos começam a recolher quem anda sozinho e sem rumo. Ninguém diz para onde levam." },
      { em: 9, flag: "sirene", texto: "Uma sirene longa corta a cidade: três horas para o toque de recolher." },
    ],

    emTodaParte: [
      {
        id: "parado", texto: "Esconder o homem parado na esquina antes que o caminhão chegue", palavras: ["escond", "homem", "esquina", "caminhao", "proteger"],
        situacao: "proteger", se: { flag: "recolhendo" },
        sucesso: {
          texto: "Você o puxa para um vão de porta. O caminhão passa devagar, os faróis varrendo a calçada, e segue.\n\nEle pisca, como quem acorda de um cochilo. “Três mil e… não. Perdi a conta. Obrigado. Eu acho.”",
          pista: "Um homem na rua também contava números para trás, na casa dos três mil.",
          efeitos: { ressonancia: 1, quest: { id: "recolhidos", nome: "Os caminhões brancos", prazo: "media", nota: "A Contenção recolhe quem anda sozinho. Você escondeu um homem." } },
        },
        falha: {
          texto: "Ele não se mexe. Dois homens de macacão branco descem, o seguram pelos braços com uma gentileza ensaiada e o põem na carroceria. Um deles anota o seu rosto com os olhos.",
          efeitos: { condicao: "abalado", quest: { id: "recolhidos", nome: "Os caminhões brancos", prazo: "media", nota: "A Contenção recolhe quem anda sozinho. Eles viram você." } },
        },
      },
    ],

    // ---------- Cenas da história ----------
    cenas: {
      abertura: {
        titulo: "Quarta-feira, 6h12",
        texto: (ctx) => {
          const salto = ctx.p.revelados && ctx.p.revelados.y
            ? "Na boca, gosto de cera de vela. Nos ouvidos, o eco de um sino: três batidas rápidas, uma longa. Você esteve em outro lugar. Tem certeza disso, do jeito que se tem certeza de um sonho."
            : "Na cabeça, só um zumbido, e uma música que para no meio do refrão.";
          const papel = {
            tank: "No celular, uma mensagem da central: “Todo o efetivo se apresente aos postos de ração da Contenção. Não se aproximem da cerca.”",
            healer: "No celular, uma mensagem do St. Luke's: “Todos os profissionais de saúde, compareçam. Pacientes demais. Ninguém de alta.”",
            support: "No celular, um aviso da universidade: “Campus fechado por ordem da Diretoria de Contenção até segunda ordem.”",
          }[ctx.p.papel] || "";
          return `Você acorda no chão da sala, de sapatos, com a porta trancada por dentro. Não lembra de ter voltado para casa.

${salto}

Lá fora, um silêncio de domingo numa quarta-feira. Um caminhão branco passa devagar, sem placa, com o logotipo de um olho dentro de um quadrado.

${papel}

Na TV, ligada sem som, a mesma faixa passa sem parar: “O CENTRO ESTÁ FECHADO. TOQUE DE RECOLHER ÀS 18H.”

A noite acabou. O que vem agora é sobreviver ao dia.`;
        },
        opcoes: [
          { texto: "Levantar e ver o que sobrou", palavras: ["levant", "ver", "comec", "sair", "olhar"], resultado: { ir: "lugar:casa" } },
        ],
      },

      chamado: {
        titulo: "O toque de recolher",
        // pelo botão (sinais suficientes) o jogador escolhe ir antes; com o relógio cheio, o toque o obriga
        texto: (ctx) => ctx.camp.relogio >= 14
          ? `A sirene toca e não para. Persianas descem pela rua inteira, uma atrás da outra, como dominós.

Os caminhões brancos agora andam em comboio. Quem está na calçada às seis é recolhido, sem pergunta.

Você não chega em casa a tempo. A Drogaria Goodwell fica a dois quarteirões, e a Martha disse que a porta dos fundos estaria aberta.`
          : `Os números não saem da sua cabeça. A TV, a parede, as mãos das pessoas: todos descendo, um a um, no mesmo ritmo.

Você precisa ver o Teddy de novo. Agora.

Faltam poucas horas para o toque de recolher, e os caminhões brancos já rondam a avenida da drogaria.`,
        opcoes: [
          {
            texto: "Correr até a Drogaria pelos becos", palavras: ["corr", "beco", "drogaria", "fug"], situacao: "fugir",
            sucesso: { texto: "Becos, uma cerca de arame, um latão de lixo. Os faróis passam pela boca do beco um segundo depois de você.", ir: "cena:contagem" },
            falha: { texto: "Um holofote te pega na esquina. Você corre assim mesmo, rasga a mão no arame e cai pela porta dos fundos da drogaria.", efeitos: { condicao: "ferido", exposicao: 1 }, ir: "cena:contagem" },
          },
          {
            texto: "Ir de carro, com os faróis apagados", palavras: ["carro", "dirig", "farol", "veiculo"], req: { item: "veiculo" },
            resultado: { texto: "Faróis apagados, motor baixo, duas ruas na contramão. Você estaciona atrás da drogaria quando o comboio entra na avenida.", ir: "cena:contagem" },
          },
        ],
      },

      contagem: {
        titulo: "Os fundos da Drogaria Goodwell",
        texto: (ctx) => {
          const martha = temMarca(ctx, "salvou:Teddy")
            ? "A Martha tranca a porta atrás de você. “Ele estava bem. Falou comigo o dia todo. Aí escureceu e ele voltou para a parede.”"
            : "A Martha tranca a porta atrás de você sem dizer nada. Ela não dorme desde terça.";
          return `${martha}

Nos fundos, à luz de uma lanterna, o Teddy está sentado de frente para a parede. Números escritos a caneta cobrem o reboco, do rodapé até onde o braço dele alcança. Todos em ordem decrescente.

“Três mil, quatrocentos e noventa e um”, ele diz. Um minuto depois: “Três mil, quatrocentos e noventa.”`;
        },
        opcoes: [
          {
            texto: "Fazer a conta: minutos até onde?", palavras: ["conta", "minuto", "calcul", "numero", "contagem"], situacao: "ler",
            sucesso: { texto: "Um número por minuto. Três mil e quatrocentos minutos são uns dois dias e meio. Você conta nos dedos duas vezes, para ter certeza.\n\nSexta-feira. 21:47.\n\nA mesma hora em que tudo começou.", ir: "cena:salto" },
            falha: { texto: "Os números escorregam da cabeça. Até que a Martha fala, baixinho, olhando o relógio da parede: “É um por minuto. Eu marquei. Acaba na sexta. Às nove e quarenta e sete da noite.”", ir: "cena:salto" },
          },
          {
            texto: "Sentar ao lado dele e contar junto", palavras: ["sentar", "junto", "ouvir", "teddy"], convergencia: 2,
            sucesso: { texto: "Você conta junto, em voz baixa. Na décima vez, sabe o próximo número antes dele. Na vigésima, sabe que alguém, muito longe, está contando junto com vocês dois.", ir: "cena:salto" },
            falha: { texto: "Você tenta acompanhar e perde o ritmo. O Teddy para, vira a cabeça devagar e te olha pela primeira vez. “Não atrapalha. Eles também estão contando.”", ir: "cena:salto" },
          },
        ],
      },

      salto: {
        titulo: "Sexta-feira, 21:47",
        final: true,
        texto: `“Três mil, quatrocentos e oitenta e sete.”

A lanterna pisca. Três rápidas, uma longa.

Por um instante, a parede da farmácia é de pedra. Velas no chão. Um homem magro, de costas, escreve números com carvão, na mesma letra torta do Teddy. Do outro lado de uma porta, uma mulher chama: “Aldric. Aldric, vem comer.”

Depois é reboco de novo, e a Martha segurando o seu braço.

Seja o que for que termina na sexta às 21:47, não termina só aqui.`,
        memoria: "Uma parede de pedra coberta de números a carvão. Um homem chamado Aldric contando de trás para frente, como o Teddy.",
        marca: "contagem-sexta",
        opcoes: [],
      },
    },

    // ---------- Lugares ----------
    lugares: {
      casa: {
        nome: "Sua casa",
        icone: "⌂",
        mapa: { x: 82, y: 16 },
        descricao: "O apartamento está como você deixou, menos pela lama seca nos sapatos e pela porta trancada por dentro. A água da torneira sai com cheiro de moeda.",
        acoes: [
          {
            id: "tv", texto: "Ligar o som da TV", palavras: ["tv", "televis", "jornal", "notic"],
            resultado: { texto: "Um porta-voz da Diretoria de Contenção, de terno cinza, lê um papel: “Incidente de saúde pública localizado. Situação sob controle. Distribuição de ração no Ginásio Lincoln.”\n\nNo canto da tela, um contador de audiência pisca: 3.802... 3.801... Ninguém no estúdio comenta.", pista: "O contador da TV também desce de um em um: 3.802, 3.801…" },
          },
          {
            id: "agua", comum: true, tempo: 0, texto: "Ferver água e encher as garrafas", palavras: ["agua", "ferver", "garrafa", "torneira"],
            resultado: { texto: "Você ferve três panelas e enche todas as garrafas que acha. A água fica com gosto de moeda mesmo assim, mas é água.", efeitos: { condicao: "-cansaco" } },
          },
          {
            id: "comer", comum: true, tempo: 0, texto: "Comer o que sobrou na geladeira", palavras: ["comer", "geladeira", "comida", "cafe da manha"],
            resultado: { texto: "Dois ovos, uma fatia de pão murcho, café requentado. A geladeira está quase vazia. Amanhã vai ser outro problema.", efeitos: { condicao: "-fome" } },
          },
          {
            id: "dormir", comum: true, repetivel: true, tempo: 2, texto: "Dormir mais um pouco", palavras: ["dormir", "deitar", "descans", "sono"],
            resultado: { texto: "Você dorme mal, de roupa, com uma cadeira escorando a porta. Sonha com um sino. Acorda com a luz já alta.", efeitos: { condicao: "-cansaco", dissonancia: -1 } },
          },
          {
            id: "banho", comum: true, repetivel: true, tempo: 0, texto: "Tomar um banho frio", palavras: ["banho", "chuveiro", "lavar"],
            resultado: { texto: "O aquecedor não liga. A água gelada tira a lama e um pouco da névoa da cabeça.", efeitos: { condicao: "-abalado" } },
          },
          {
            id: "maos", texto: "Olhar as próprias mãos", palavras: ["maos", "olhar", "unhas", "dedos"], situacao: "perceber",
            sucesso: { texto: "Debaixo das unhas, pó de giz. Na palma, a lápis, alguém escreveu um número: 3.840. Na sua letra.", pista: "Você acordou com 3.840 escrito na palma da mão, na sua letra." },
            falha: { texto: "Suas mãos estão sujas de giz e você não lembra de nada. O coração dispara, e você esfrega até a pele arder.", efeitos: { condicao: "abalado" } },
          },
          {
            id: "hollis", npc: "hollis", texto: "Bater no 302: o Sr. Hollis voltou para casa", palavras: ["hollis", "302", "vizinho"], situacao: "acalmar", se: { marca: "salvou:Sr. Hollis" },
            sucesso: {
              texto: "“Ah, bom dia! Entre, entre. A moça do retrato? Não faço ideia de quem seja. Estava aqui quando eu acordei, com o número dela na geladeira.”\n\nVocê liga. A filha atende chorando. O Sr. Hollis fala com ela com toda a educação do mundo, como quem fala com uma estranha simpática.",
              efeitos: { ressonancia: 1, quest: { id: "hollis", nome: "O Sr. Hollis não lembra", prazo: "media", nota: "Ele voltou para casa, mas esqueceu a filha. Ela vem buscá-lo." } },
            },
            falha: {
              texto: "Ele abre a porta com a corrente passada. “Não compro nada, obrigado.” Não te reconhece. Atrás dele, a TV mostra o contador descendo.",
              efeitos: { condicao: "abalado", quest: { id: "hollis", nome: "O Sr. Hollis não lembra", prazo: "media", nota: "Ele não reconhece mais ninguém. Nem você." } },
            },
          },
          {
            id: "petrakis", npc: "petrakis", comum: true, tempo: 1, texto: "Ver como está a Sra. Petrakis", palavras: ["petrakis", "vizinha", "senhora"],
            resultado: { texto: "“Eu falei que não saía, não falei? Não saí. Agora você me diz: quem vai dar comida pro gato do 4B? Toma, enlatado. Eu estoquei desde o furacão de 2011. Ninguém ri mais de mim agora, né?”", efeitos: { pertence: { comida: 2 }, condicao: "-abalado" } },
          },
          {
            id: "sal", npc: "sal", comum: true, tempo: 0, texto: "Descer até a portaria e falar com o Sal", palavras: ["sal", "porteiro", "portaria"],
            resultado: { texto: "“Trinta anos nesta guarita e nunca vi a rua desse jeito, meu chapa. Os de branco passaram aqui às cinco. Perguntaram quem mora sozinho. Eu disse que ninguém. Café?”", efeitos: { condicao: ["-cansaco", "-abalado"] } },
          },
          {
            id: "lata", comum: true, tempo: 0, texto: "Conferir o dinheiro que sobrou", palavras: ["dinheiro", "carteira", "lata", "conferir"],
            resultado: { texto: "Debaixo da lata de biscoito, uma nota que você esqueceu que tinha guardado. Os caixas eletrônicos da rua estão desligados desde ontem.", efeitos: { dinheiro: 20 } },
          },
        ],
      },

      racao: {
        nome: "Posto de ração (Ginásio Lincoln)",
        icone: "◫",
        mapa: { x: 20, y: 62 },
        descricao: "A quadra da escola virou um armazém: paletes de caixas brancas, grades de metal, uma fila que dá a volta no quarteirão. Na parede, o placar do jogo de sábado ainda marca LINCOLN 54, VISITANTES 51.",
        loja: { nome: "Barraca na saída do ginásio (preço de crise)", itens: [{ pertence: "comida" }, { pertence: "cafe" }, { pertence: "bateria" }] },
        acoes: [
          {
            id: "fila", texto: "Enfrentar a fila da ração", palavras: ["fila", "racao", "esperar", "caixa"], tempo: 2,
            resultado: { texto: "Duas horas de fila. Na mesa, um homem de macacão branco confere o seu documento, anota alguma coisa e entrega uma caixa: enlatados, água, pilhas e um panfleto. “FIQUE EM CASA. FIQUE COM OS SEUS.”", efeitos: { pertence: { comida: 2, bateria: 1 } } },
          },
          {
            id: "rita", npc: "rita", texto: "A mulher na sua frente foi barrada da fila: ajudar", palavras: ["mulher", "rita", "ajudar", "barrada", "crianca"], situacao: "convencer",
            sucesso: {
              texto: "Você fala com o guarda até ele cansar de discutir. Ela sai com a caixa no colo e o filho pela mão.\n\n“Rita. Rita Alvarez. Eles disseram que meu endereço é dentro da cerca, que eu não existo mais aqui fora. Eu moro lá há onze anos. Obrigada. De verdade.”",
              efeitos: { ressonancia: 1, flag: "rita-ajudada", quest: { id: "racao", nome: "Ração da Contenção", prazo: "curta", estado: "concluida", nota: "Quem morava dentro da cerca ficou sem cadastro. Você conseguiu a caixa da Rita." } },
            },
            falha: {
              texto: "O guarda põe a mão no coldre sem pressa. “Próximo.” A Rita vai embora com o menino. Você ainda tem a sua caixa, se quiser dar a ela.",
              efeitos: { quest: { id: "racao", nome: "Ração da Contenção", prazo: "curta", nota: "A Rita foi barrada: o endereço dela fica dentro da cerca." } },
            },
          },
          {
            id: "rita-dar", texto: "Dar a sua comida para a Rita e o menino", palavras: ["dar", "comida", "rita", "menino"], req: { pertence: "comida" }, se: { semFlag: "rita-ajudada" },
            resultado: {
              texto: "Ela hesita, depois aceita. O menino abre a lata ali mesmo, com as mãos. A Rita não diz nada. Aperta o seu braço e some na multidão.",
              efeitos: { consumir: "comida", flag: "rita-ajudada", ressonancia: 1, dissonancia: -1, quest: { id: "racao", nome: "Ração da Contenção", prazo: "curta", estado: "concluida", nota: "Você dividiu a sua comida com a Rita e o filho." } },
            },
          },
          {
            id: "moore", npc: "moore", texto: "Falar com o Agente Moore, que coordena a distribuição", palavras: ["moore", "agente", "defesa civil", "coordena"], situacao: "convencer",
            sucesso: {
              texto: (ctx) => `${temMarca(ctx, "moura-desconfia") ? "“Você de novo. Eu anotei o seu nome ontem, sabia?” Ele suspira. " : ""}“Olha, eu sou Defesa Civil. Vinte anos. Esses de branco chegaram ontem à noite com uma ordem assinada que eu nunca vi igual. Eu distribuo comida. Não pergunto o que tem nos caminhões. Mas eu conto os caminhões. E nenhum volta cheio do jeito que saiu.”`,
              pista: "Moore conta os caminhões da Contenção: eles levam gente e não a trazem de volta.",
              efeitos: { quest: { id: "recolhidos", nome: "Os caminhões brancos", prazo: "media", nota: "Moore desconfia da Contenção: os caminhões levam gente e voltam vazios." } },
            },
            falha: { texto: "“Pega a sua caixa e vai pra casa, cidadão. Toque de recolher às seis.” Ele nem levanta os olhos da prancheta.", efeitos: { condicao: "abalado" } },
          },
          {
            id: "voluntario", comum: true, tempo: 2, texto: "Trabalhar como voluntário descarregando caixas", palavras: ["volunt", "trabalh", "descarreg", "ajudar"],
            resultado: { texto: "Duas horas carregando paletes. No fim, o supervisor te paga em dinheiro vivo, sem recibo, e enfia duas latas no seu bolso. “Não viu nada.”", efeitos: { dinheiro: 40, pertence: { comida: 1 }, condicao: "cansaco" } },
          },
        ],
      },

      drogaria: {
        nome: "Drogaria Goodwell",
        icone: "✚",
        mapa: { x: 30, y: 30 },
        descricao: (ctx) => temMarca(ctx, "salvou:Teddy")
          ? "A vitrine está rachada, mas a porta abre. A Martha está atrás do balcão, de cardigã e olheiras. Dos fundos, uma voz de homem conta baixinho."
          : "A grade está meio descida. Lá dentro, a Martha arruma prateleiras que ninguém vai comprar. Dos fundos, alguém conta baixinho, sem parar.",
        loja: { nome: "Drogaria Goodwell", itens: [{ pertence: "remedio" }, { pertence: "calmante" }, { pertence: "cafe" }, { equip: "kit_medico" }] },
        acoes: [
          {
            id: "martha", npc: "martha", texto: "Falar com a Martha", palavras: ["martha", "falar", "balcao"],
            resultado: {
              texto: (ctx) => temMarca(ctx, "salvou:Teddy")
                ? "“Você. Graças a Deus. Ele voltou a falar ontem, sabia? Pediu panqueca. Panqueca! Mas hoje de manhã sentou na frente da parede de novo e começou a contar. Não é como antes. Agora ele conta para trás.”"
                : "“Ele não para. Desde terça. Eu tentei de tudo, até o calmante de cavalo que o Dr. Patel deixou. Ele só conta. E agora conta para trás. Você sabe o que isso quer dizer? Porque eu não sei.”",
              efeitos: { flag: "martha", quest: { id: "teddy", nome: "O que o Teddy conta", prazo: "media", nota: "O Teddy conta números de trás para frente nos fundos da drogaria." } },
            },
          },
          {
            id: "parede", texto: "Olhar os números que o Teddy escreveu", palavras: ["parede", "numero", "teddy", "fundos", "olhar"], situacao: "perceber", se: { flag: "martha" },
            sucesso: { texto: "Os números descem de um em um, sem pular nenhum. No canto, a Martha anotou a lápis a hora de alguns: 07:10, 3.762. 07:11, 3.761. Um por minuto.", pista: "O Teddy conta para trás, um número por minuto." },
            falha: { texto: "Você tenta seguir a coluna de números e ela parece continuar para dentro da parede. Você desvia os olhos com enjoo.", efeitos: { exposicao: 1 } },
          },
          {
            id: "saque", npc: "saqueador", grupo: "saque", texto: "Dois homens forçam a grade dos fundos: proteger a Martha", palavras: ["proteger", "saque", "ladrao", "grade", "defender"], situacao: "proteger", se: { relogioMin: 4 },
            sucesso: {
              texto: "Você chega antes que a grade ceda. Um deles mostra uma faca, o outro olha para você, para a Martha, e puxa o amigo pelo braço.\n\n“Tá bom, tá bom. A gente só quer insulina pra minha mãe, droga.”\n\nA Martha joga uma caixa pela grade. Eles somem.",
              efeitos: { flag: "saque-protegido", pertence: { remedio: 1 }, quest: { id: "saque", nome: "Drogaria saqueada", prazo: "curta", estado: "concluida", nota: "Você defendeu a drogaria. A Martha deu a insulina mesmo assim." } },
            },
            falha: {
              texto: "A grade cede. Um empurrão te joga contra a prateleira. Quando você levanta, eles já levaram meia farmácia, e a Martha está sentada no chão, segurando o pulso.",
              efeitos: { condicao: "ferido", quest: { id: "saque", nome: "Drogaria saqueada", prazo: "curta", estado: "perdida", nota: "Saquearam a drogaria. A Martha se machucou." } },
            },
          },
          {
            id: "saque-levar", grupo: "saque", texto: "Dois homens forçam a grade dos fundos: aproveitar e levar remédios também", palavras: ["levar", "pegar", "roubar", "aproveitar"], se: { relogioMin: 4 },
            resultado: {
              texto: "Na confusão, você enche os bolsos: analgésico, curativo, calmante. A Martha vê. Não diz nada. Isso é pior do que se dissesse.",
              efeitos: { pertence: { remedio: 2, calmante: 1 }, dissonancia: 1, quest: { id: "saque", nome: "Drogaria saqueada", prazo: "curta", estado: "perdida", nota: "Você levou remédios no saque. A Martha viu." } },
            },
          },
        ],
      },

      hospital: {
        nome: "St. Luke's Memorial",
        icone: "✚",
        mapa: { x: 82, y: 64 },
        descricao: "Ambulâncias paradas na rampa, portas abertas, ninguém dentro. No saguão, macas no corredor e uma faixa nova: “TRIAGEM DA CONTENÇÃO: TERCEIRO ANDAR”.",
        loja: { nome: "Lanchonete do hospital", itens: [{ pertence: "comida" }, { pertence: "cafe" }] },
        acoes: [
          {
            id: "triagem", texto: "Ajudar na triagem do pronto-socorro", palavras: ["triagem", "ajudar", "pronto-socorro", "pacientes"], situacao: "acalmar",
            sucesso: {
              texto: "Você separa quem sangra de quem só não sabe onde está. Uma enfermeira te passa um copo de café e uma pulseira de voluntário. “Os que só não sabem onde estão, a Contenção leva lá pra cima.”",
              pista: "Os pacientes desorientados são levados para a triagem da Contenção, no terceiro andar.",
              efeitos: { dinheiro: 30, condicao: "-abalado" },
            },
            falha: { texto: "Um homem segura o seu pulso e repete, sem parar: “Três mil, setecentos e oito.” A enfermeira o solta de você com cuidado.", efeitos: { condicao: "abalado" } },
          },
          {
            id: "helen", npc: "helen", texto: "Procurar a Dra. Helen Vance", palavras: ["helen", "psiquiatra", "doutora", "medica"], se: { semMarca: "caderno-helena" },
            resultado: {
              texto: "“A gente se conhece? Desculpa. Não dormi. Eles levaram meus pacientes para o terceiro andar e não me deixam subir. Se você souber de algum padrão, qualquer um, me procura. Eu tenho um caderno e nenhuma resposta.”",
              efeitos: { quest: { id: "helena", nome: "O caderno da Dra. Helen", prazo: "media", nota: "Helen perdeu os pacientes para a Contenção, no terceiro andar." } },
            },
          },
          {
            id: "helen-2", npc: "helen", texto: "Encontrar a Dra. Helen: o caderno, parte 2", palavras: ["helen", "caderno", "parte", "sonho"], situacao: "convencer", se: { marca: "caderno-helena" },
            sucesso: {
              texto: "“Você guardou a cópia. Ótimo. Então olha a parte dois. Antes de subirem, eu entrevistei cada um. Todos sonharam com o mesmo lugar: um corredor de metal, uma janela redonda, um planeta enorme do lado de fora. E todos acordaram contando. Para trás.”",
              pista: "Os pacientes da Helen sonham com uma nave e acordam contando para trás.",
              efeitos: { memoria: "Um corredor de metal, uma janela redonda e um planeta enorme do lado de fora.", memoriaMin: 5, quest: { id: "helena", nome: "O caderno da Dra. Helen", prazo: "media", nota: "Parte 2: todos sonham com uma nave e acordam contando para trás." } },
            },
            falha: { texto: "Ela folheia o caderno rápido demais e fecha. “Não aqui. Tem câmera nova no corredor. Volta outra hora.”", efeitos: { exposicao: 1 } },
          },
          {
            id: "terceiro", texto: "Subir escondido até o terceiro andar", palavras: ["subir", "terceiro", "andar", "escada", "esconder"], situacao: "perceber", se: { relogioMin: 2 },
            sucesso: {
              texto: "Pela fresta da porta corta-fogo: um corredor de leitos, todos ocupados, todos virados para a mesma parede. Homens de branco medem alguma coisa com aparelhos que você nunca viu. Um quadro branco, com letra de máquina: “CONTAGEM ESTIMADA: SEX. 21:47”.",
              pista: "No quadro da Contenção: “Contagem estimada: sexta, 21:47”.",
              efeitos: { flag: "terceiro-andar", quest: { id: "recolhidos", nome: "Os caminhões brancos", prazo: "media", nota: "A Contenção mantém os afetados no terceiro andar do St. Luke's. Eles sabem da contagem." } },
            },
            falha: { texto: "Um segurança de branco aparece no patamar. “Área restrita.” Ele te acompanha até a saída e fotografa o seu rosto com o celular.", efeitos: { exposicao: 1, condicao: "abalado" } },
          },
          {
            id: "lanche", comum: true, tempo: 0, texto: "Comer alguma coisa na lanchonete", palavras: ["comer", "lanchonete", "lanche"], req: { dinheiro: 8 },
            resultado: { texto: "Sopa de máquina e um pão de queijo de ontem. Quente, pelo menos.", efeitos: { dinheiro: -8, condicao: "-fome" } },
          },
        ],
      },

      abe: {
        nome: "Conveniência do Abe",
        icone: "◧",
        mapa: { x: 62, y: 82 },
        descricao: "O Abe abriu, porque o Abe sempre abre. Metade das prateleiras está vazia, os preços foram riscados e reescritos à mão. Na parede de fora, alguém desenhou um mapa a giz.",
        loja: { nome: "Conveniência do Abe", itens: [{ pertence: "comida" }, { pertence: "cafe" }, { pertence: "bebida" }, { pertence: "bateria" }, { equip: "luz" }] },
        acoes: [
          {
            id: "abe", npc: "abe", comum: true, tempo: 0, texto: "Conversar com o Abe", palavras: ["abe", "conversar", "dono", "balcao"],
            resultado: { texto: "“Quarenta e dois anos neste balcão. Fechei no dia do 11 de setembro e me arrependi. Não fecho mais. O preço subiu porque o caminhão não veio, não porque eu quero. Pra você, desconto de vizinho. Pega um café, é por conta.”", efeitos: { condicao: "-cansaco" } },
          },
          {
            id: "danny", npc: "danny", texto: "O Danny está esperando na calçada", palavras: ["danny", "rapaz", "moletom", "calcada"], se: { marca: "salvou:Danny" },
            resultado: {
              texto: "“Eu falei que ia te achar! Eu falei.”\n\nEle mostra as mãos, brancas de giz. “Não consigo parar de desenhar. Mas olha, não é risco, é mapa. Esse aqui é o metrô. A Estação Rua 9. Eu nunca entrei lá. E esses números do lado… eles mudam toda vez que eu desenho. Sempre um a menos.”",
              pista: "O Danny desenha o metrô a giz, com números que diminuem a cada desenho.",
              efeitos: { flag: "danny", quest: { id: "danny", nome: "Danny e o giz", prazo: "longa", nota: "O Danny desenha mapas do metrô (Estação Rua 9) que ele nunca viu." } },
            },
          },
          {
            id: "mapa-giz", texto: "Examinar o mapa de giz na parede", palavras: ["mapa", "giz", "parede", "desenho", "examin"], situacao: "ler", se: { semMarca: "salvou:Danny" },
            sucesso: { texto: "É a planta de uma estação de metrô, desenhada com régua invisível. Embaixo, uma coluna de números, cada um riscado e reescrito um a menos. O último: 3.655.", pista: "Um mapa de giz do metrô, com uma coluna de números que desce." },
            falha: { texto: "Os traços parecem frescos, mas a parede está seca. Por um segundo, você jura que um deles se mexeu.", efeitos: { dissonancia: 1 } },
          },
          {
            id: "radio", texto: "Pedir ao Abe para sintonizar o rádio na 94.7", palavras: ["radio", "94", "frequencia", "ouvinte", "sintoniz"], se: { marca: "frequencia-94.7" },
            resultado: {
              texto: "Estática, depois a voz rouca da Ouvinte: “...para quem ainda está ouvindo. Eles estão recolhendo quem conta. Se alguém na sua casa conta para trás, não deixa levarem. A gente precisa deles até sexta.”\n\nO Abe desliga devagar. “Essa moça. Ela sempre sabe as coisas antes.”",
              pista: "A Ouvinte avisa na 94.7: a Contenção recolhe quem conta, e “precisamos deles até sexta”.",
            },
          },
          {
            id: "fiado", comum: true, tempo: 0, texto: "Pedir ao Abe para pendurar na conta", palavras: ["fiado", "pendurar", "conta", "credito"], se: { relogioMin: 5 },
            resultado: { texto: "Ele anota o seu nome num caderninho de capa dura, numa página cheia de nomes. “Paga quando o mundo voltar.” E te dá duas latas.", efeitos: { pertence: { comida: 2 } } },
          },
        ],
      },

      cerca: {
        nome: "A cerca do centro",
        icone: "▦",
        mapa: { x: 58, y: 38 },
        descricao: "Grades de três metros, lonas brancas, holofotes desligados à luz do dia. Do outro lado, a Praça Central está limpa demais: nenhum giz, nenhum banco fora do lugar. Como se a noite nunca tivesse acontecido.",
        acoes: [
          {
            id: "espiar", texto: "Espiar pela fresta da lona", palavras: ["espiar", "fresta", "lona", "olhar", "praca"], situacao: "perceber",
            sucesso: { texto: "Homens de branco lavam os muros com mangueiras de alta pressão. A água escorre cinza de giz. Num prédio que eles ainda não lavaram, os números descem em colunas de dez andares.", pista: "Dentro da cerca, a Contenção lava os muros. Num prédio, colunas enormes de números descendo." },
            falha: { texto: "Um holofote acende na sua cara em pleno dia. Uma voz no alto-falante: “Afaste-se da cerca.”", efeitos: { exposicao: 1 } },
          },
          {
            id: "guarda", npc: "guarda", texto: "Mostrar o crachá da Contenção ao guarda", palavras: ["cracha", "guarda", "mostrar", "contencao"], situacao: "convencer", se: { marca: "cracha-contencao" },
            sucesso: {
              texto: "Ele olha o crachá, olha a foto raspada, olha você. Abaixa a voz. “Isso é de um supervisor de campo. Ele sumiu na terça. Se você está com isso, ou ele te deu, ou ele está morto.” E deixa você passar até a primeira barreira, onde uma prancheta esquecida mostra uma lista: nomes, endereços e um número ao lado de cada um, todos na casa dos três mil.",
              pista: "A Contenção tem uma lista de pessoas que contam, com o número em que cada uma está.",
              efeitos: { quest: { id: "homem-terno", nome: "Quem era o Homem de Terno", prazo: "longa", nota: "Ele era supervisor de campo da Contenção. Sumiu na terça." } },
            },
            falha: { texto: "“Onde você arrumou isso?” Ele toma o crachá da sua mão e chama alguém pelo rádio. Você vai embora antes de ver quem vem.", efeitos: { condicao: "abalado", exposicao: 1 } },
          },
          {
            id: "oswald", npc: "oswald", texto: "Oswald, o vigia, está do lado de dentro da cerca", palavras: ["oswald", "vigia", "dentro"], se: { marca: "vigia-412" },
            resultado: {
              texto: "Ele está de uniforme impecável, do lado de dentro da grade, como se ainda estivesse no posto da Atlantic Tower. Te reconhece.\n\n“Terminei a minha conta. Quatrocentos e doze dias. Agora é a vez dos outros. Eles contam minutos, eu contava dias. A gente chega, sabe? Todo mundo chega.”\n\nUm homem de branco o leva pelo cotovelo. Ele não resiste.",
              pista: "Oswald terminou a contagem dele (412 dias). “Agora é a vez dos outros.”",
              efeitos: { condicao: "abalado", quest: { id: "oswald", nome: "O vigia Oswald", prazo: "longa", estado: "concluida", nota: "Oswald terminou a conta e foi levado pela Contenção." } },
            },
          },
          {
            id: "walt", npc: "walt", texto: "Um velho encara a cerca, de braços cruzados: puxar conversa", palavras: ["velho", "walt", "conversa", "aposentado", "metro"], situacao: "convencer",
            sucesso: {
              texto: (ctx) => `“Walt Brody. Trabalhei trinta anos no metrô. Ontem à noite a Estação Rua 9 encheu de gente esperando trem. A linha está fechada há anos. Hoje cedo: cerca, caminhão branco, todo mundo assinando papel. Disseram que foi vazamento de gás.”${temMarca(ctx, "arquivo-contencao") ? "\n\nVocê lembra da pasta do Moore: a Rua 9 estava na lista da Contenção. Walt vê a sua cara e ri sem graça. “É. Também não acreditei no gás.”" : ""}\n\n“Sabe o que mais? Uns contavam, em voz alta. Pararam quando chegou no zero.”`,
              pista: "Na noite passada, na Estação Rua 9, havia gente contando. Pararam no zero.",
              efeitos: { quest: { id: "rua-9", nome: "A noite da Rua 9", prazo: "longa", nota: "Walt Brody, do metrô: ontem a Estação Rua 9, fechada há anos, encheu de gente esperando trem. Uns contavam até zero." } },
            },
            falha: { texto: "“Não falo com repórter.” Ele cospe no chão e vai embora mancando.", efeitos: {} },
          },
        ],
      },
    },
  };
})();
