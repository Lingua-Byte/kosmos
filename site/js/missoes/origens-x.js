// =====================================================================
// ORIGENS de Port Halden: a abertura própria de cada personagem pronto no prólogo do Urbano.
// ---------------------------------------------------------------------
// Modelo "Dragon Age: Origins": um prólogo por mundo, com uma origem curta para cada personagem.
// A origem troca o lugar onde a noite começa, o texto de abertura, e acrescenta:
//   · fio: o fio pessoal do personagem (uma linha no Diário que rende nos próximos atos)
//   · acoes: duas ações que só ele tem no lugar onde começa (se: { pronto })
// ponto: o ponto de entrada da profissão (decide as ações de profissão que também aparecem);
// "igreja" e "comunitario" não têm ações de profissão no prólogo: as da origem bastam.
// arte: a imagem do palco (imagens/x/abertura-<arte>.webp); sem ela, usa a do ponto.
// =====================================================================

const ORIGENS_X = {
  "frank-brennan": {
    ponto: "defesa", arte: "estacao-9",
    nome: "Estação 9 do Corpo de Bombeiros", onde: "na Estação 9 do Corpo de Bombeiros",
    desc: "O caminhão está lavado, as mangueiras enroladas, o turno quase acabando. Na parede, a placa de sempre: “EVERYONE GOES HOME.” Hoje ninguém da equipe voltou do último chamado.",
    abertura: `Frank Brennan está sentado no estribo do caminhão, na Estação 9, com um café que esfriou faz uma hora. Trinta anos de bombeiro. Dois para a aposentadoria.

Às 21h47 o telefone da parede toca. É o Joe Kessler, o antigo parceiro, aposentado desde 1988. Ele não liga há dez anos.

“Frank. O fogo da Delancey Street. O de oitenta e sete. Ele voltou a queimar, Frank. Só que agora ninguém está vendo.”

A linha fica muda. O alarme da estação dispara sozinho: três toques curtos, um longo.`,
    fio: { id: "fio-frank", nome: "O fogo da Delancey Street", prazo: "longa", nota: "Joe Kessler, o antigo parceiro, ligou depois de dez anos: o incêndio de 1987 “voltou a queimar”." },
    acoes: [
      {
        id: "frank-livro", texto: "Procurar o incêndio de 87 no livro de ocorrências", palavras: ["livro", "ocorrenc", "delancey", "87", "incendio"], situacao: "investigar",
        sucesso: { texto: "Página de 14 de março de 1987: “Delancey St., 21h47. Prédio vazio. Sem vítimas. Sem foco de origem.” Alguém escreveu a lápis, na margem: “as paredes estavam riscadas por dentro.” A letra é do Joe.", pista: "O incêndio da Delancey St. foi em 1987, às 21h47, num prédio de paredes riscadas.", efeitos: { marca: "delancey-87", quest: { id: "fio-frank", nome: "O fogo da Delancey Street", prazo: "longa", nota: "1987, 21h47, paredes riscadas por dentro. A letra na margem é do Joe." } } },
        falha: { texto: "A página de março de 1987 foi arrancada. Sobrou só a beirada, com um pedaço de carimbo: CONTENÇÃO.", efeitos: { quest: { id: "fio-frank", nome: "O fogo da Delancey Street", prazo: "longa", nota: "A página de 1987 foi arrancada. Carimbo da Contenção." } } },
      },
      {
        id: "frank-equipar", comum: true, texto: "Vestir a capa de bombeiro e pegar o machado", palavras: ["capa", "machado", "equip", "vestir"],
        resultado: { texto: "O peso da capa nos ombros é o único peso que ainda faz sentido hoje. O machado vai junto. Por via das dúvidas.", efeitos: { condicao: "-abalado" } },
      },
    ],
  },

  "rosa-delgado": {
    ponto: "defesa", arte: "viatura-412",
    nome: "Viatura 4-12, na frente do 4º Distrito", onde: "na viatura 4-12, na frente do 4º Distrito",
    desc: "O giroflex gira sem som. O rádio está aberto no canal do distrito, mas ninguém responde ao chamado há quarenta minutos. O banco do carona ainda está quente.",
    abertura: `A patrulheira Rosa Delgado está ao volante da viatura 4-12, parada na frente do 4º Distrito. O parceiro dela, o policial Dale Pruitt, estava no meio de uma frase quando parou de falar.

Ele abriu a porta, saiu do carro e foi andando para o centro, no passo de quem está atrasado para alguma coisa. Deixou o distintivo no painel.

No rádio, alguém repete o código de chamada da viatura dela, devagar, sem parar: “Quatro... doze. Quatro... doze.”`,
    fio: { id: "fio-rosa", nome: "O parceiro que foi embora", prazo: "longa", nota: "Dale Pruitt saiu da viatura no meio de uma frase e foi andando para o centro. Deixou o distintivo." },
    acoes: [
      {
        id: "rosa-radio", texto: "Responder ao rádio que repete “quatro-doze”", palavras: ["radio", "responder", "quatro", "doze", "412"], situacao: "convencer",
        sucesso: { texto: "“Aqui é a 4-12, identifique-se.” Silêncio. Depois, a voz do Dale, calma demais: “Rosa? Tá tudo bem. Vem ver. Daqui dá pra ver tudo.” Ao fundo, uma multidão respirando no mesmo ritmo.", pista: "Pelo rádio, o parceiro da Rosa chama do centro: “Daqui dá pra ver tudo.”", efeitos: { quest: { id: "fio-rosa", nome: "O parceiro que foi embora", prazo: "longa", nota: "Dale respondeu pelo rádio, do centro. Calmo demais." } } },
        falha: { texto: "A voz para de repetir. Começa a repetir outra coisa: o número do seu distintivo. Você desliga o rádio com a mão tremendo.", efeitos: { condicao: "abalado" } },
      },
      {
        id: "rosa-distintivo", comum: true, texto: "Guardar o distintivo do Dale", palavras: ["distintivo", "guardar", "dale", "pruitt"],
        resultado: { texto: "Você guarda o distintivo no bolso da camisa, do lado do seu. Um dia você devolve. Olhando nos olhos dele.", efeitos: { marca: "distintivo-pruitt" } },
      },
    ],
  },

  "marcus-bell": {
    ponto: "rua", arte: "harbor-street",
    nome: "Harbor Street, em cima da moto", onde: "em cima da moto, na Harbor Street",
    desc: "A bag térmica nas costas, o celular no suporte do guidão, o motor ligado. Os semáforos piscam todos juntos, amarelo, amarelo, amarelo, vermelho.",
    abertura: `Marcus Bell está parado na Harbor Street, em cima da moto, com a última entrega do dia na bag térmica.

O aplicativo apita. O endereço de entrega é o telhado do Edifício Aurora. O nome do destinatário é Marcus Bell. O remetente também.

O pacote é pequeno, pesa quase nada e está quente, como se tivesse acabado de sair de um forno. No campo de observações: “Entregar até 21h47 de amanhã. Não abra.”`,
    fio: { id: "fio-marcus", nome: "A entrega para si mesmo", prazo: "longa", nota: "Um pacote de Marcus Bell para Marcus Bell. Destino: o telhado do Edifício Aurora. Prazo: 21h47 de amanhã." },
    acoes: [
      {
        id: "marcus-pacote", texto: "Sacudir o pacote, só um pouco", palavras: ["pacote", "sacudir", "abrir", "caixa"], situacao: "perceber",
        sucesso: { texto: "Lá dentro, algo pequeno e duro bate nas paredes da caixa. Faz o barulho de uma fita cassete. E, por baixo, bem baixinho, uma música tocando.", pista: "O pacote misterioso parece ter uma fita cassete dentro, tocando.", efeitos: { flag: "pacote-fita" } },
        falha: { texto: "O pacote esquenta na sua mão até quase queimar. Você o devolve para a bag rápido.", efeitos: { exposicao: 1 } },
      },
      {
        id: "marcus-gorjeta", comum: true, tempo: 1, texto: "Fechar o dia no aplicativo e sacar as gorjetas", palavras: ["gorjeta", "sacar", "aplicativo", "fechar"],
        resultado: { texto: "Catorze entregas, sete gorjetas. O aplicativo transfere $ 70 e manda uma notificação nova: “Obrigado por entregar o futuro.” Você não lembra de terem mudado o slogan.", efeitos: { dinheiro: 70 } },
      },
    ],
  },

  "denise-carter": {
    ponto: "hospital", arte: "pronto-socorro",
    nome: "Pronto-socorro do St. Luke's", onde: "no pronto-socorro do St. Luke's Memorial",
    desc: "Seis horas de hora extra. Macas no corredor, o monitor de alguém apitando em algum lugar, o cheiro de café queimado da sala dos médicos. Ninguém no balcão da triagem.",
    abertura: `A Dra. Denise Carter está no pronto-socorro do St. Luke's, seis horas depois do fim do plantão.

No leito 9 está o Leo, nove anos, em coma há três semanas desde o acidente no ônibus escolar. Às 21h47 ele abriu os olhos, sentou na cama e disse, muito educado:

“A Dra. Carter pode vir? Eu preciso contar uma coisa pra ela antes de todo mundo ir embora.”

Quando a enfermeira foi te chamar, ele já tinha deitado de novo. Olhos fechados. Os dedos riscando o lençol.`,
    fio: { id: "fio-denise", nome: "O menino do leito 9", prazo: "longa", nota: "Leo, nove anos, em coma, acordou às 21h47 e chamou pela Dra. Carter. Depois voltou a dormir." },
    acoes: [
      {
        id: "denise-leo", npc: "leo", texto: "Sentar ao lado do Leo e escutar", palavras: ["leo", "leito", "menino", "escutar", "sentar"], situacao: "acalmar",
        sucesso: { texto: "Os lábios dele se mexem, quase sem som: “Eles não estão indo embora, doutora. Estão indo pra casa. Mas a casa não é aqui.” A mão dele aperta a sua. Gelada.", pista: "O menino do leito 9 diz que as pessoas “estão indo pra casa, mas a casa não é aqui”.", efeitos: { ressonancia: 1, quest: { id: "fio-denise", nome: "O menino do leito 9", prazo: "longa", nota: "“Estão indo pra casa. Mas a casa não é aqui.”" } } },
        falha: { texto: "Nada. Só os dedos riscando o lençol, sempre o mesmo traço. Você conta: três curtos, um longo.", efeitos: { condicao: "abalado" } },
      },
      {
        id: "denise-farmacia", comum: true, texto: "Pegar remédios no armário da farmácia interna", palavras: ["remedio", "farmacia", "armario", "pegar"],
        resultado: { texto: "Você assina o livro de retirada por hábito, mesmo sabendo que ninguém vai conferir hoje. Curativos, analgésicos, um calmante.", efeitos: { pertence: { remedio: 1, calmante: 1 } } },
      },
    ],
  },

  "michael-doyle": {
    ponto: "igreja", arte: "st-brendans",
    nome: "Igreja de St. Brendan's", onde: "na igreja de St. Brendan's, na beira do porto",
    desc: "Velas acesas, bancos vazios, o cheiro de cera e de maresia. A porta do confessionário está entreaberta. Lá fora, a sirene de nevoeiro do porto toca fora de hora.",
    abertura: `O padre Michael Doyle está sozinho na St. Brendan's, apagando as velas da missa das oito.

Às 21h, um homem entrou no confessionário. Não confessou nada que tivesse feito. Confessou o que ia fazer amanhã, às 21h47, em detalhes, com a voz tranquila de quem lê uma lista de compras. Depois agradeceu e foi embora.

No banco do confessionário ficou um terço. As contas estão riscadas com símbolos pequenos, feitos à unha.`,
    fio: { id: "fio-michael", nome: "A confissão do amanhã", prazo: "longa", nota: "Um homem confessou o que vai fazer amanhã às 21h47. Deixou um terço riscado com símbolos." },
    acoes: [
      {
        id: "michael-terco", texto: "Examinar o terço riscado", palavras: ["terco", "contas", "simbol", "examin"], situacao: "ler",
        sucesso: { texto: "Cada conta tem um símbolo. Você reza o terço inteiro passando os dedos por eles, e no fim entende uma frase, como quem lembra de uma oração esquecida: ∃ ψ(t). Existe uma mente. Agora.", pista: "No terço deixado no confessionário: ∃ ψ(t), “existe uma mente, agora”.", efeitos: { aprenderX: ["existir", "mente", "x-agora"], marca: "terco-riscado" } },
        falha: { texto: "As contas esquentam entre os seus dedos, uma a uma, como se alguém do outro lado estivesse rezando junto. Você larga o terço no banco.", efeitos: { dissonancia: 1 } },
      },
      {
        id: "michael-sino", comum: true, texto: "Tocar o sino para chamar quem estiver na rua", palavras: ["sino", "tocar", "chamar"],
        resultado: { texto: "Você puxa a corda. O sino toca, grave, por cima do porto inteiro. Duas pessoas param na calçada, piscam, como quem acorda, e entram na igreja sem saber por quê. Hoje, isso conta.", efeitos: { ressonancia: 1, condicao: "-abalado" } },
      },
    ],
  },

  "june-albright": {
    ponto: "comunitario", arte: "centro-comunitario",
    nome: "Centro comunitário da Maple Street", onde: "no bingo de terça do centro comunitário da Maple Street",
    desc: "Cartelas pela metade, xícaras de chá esfriando, o globo do bingo parado no meio de um giro. Das trinta senhoras de sempre, sobraram você e a Sra. Petrakis.",
    abertura: `June Albright foi enfermeira por quarenta anos. Hoje é a voluntária dos primeiros socorros do bingo de terça, no centro comunitário da Maple Street.

Às 21h47, no meio de uma rodada, todo mundo parou de marcar a cartela ao mesmo tempo. Levantaram, empurraram as cadeiras para baixo da mesa, educados, e saíram em fila.

Na sua bolsa, que ficou o tempo todo no seu colo, tem uma carta que não estava lá antes. A letra é do Harold, o seu marido. O Harold morreu há seis anos. A carta está datada de amanhã.`,
    fio: { id: "fio-june", nome: "A carta do Harold", prazo: "longa", nota: "Uma carta do falecido marido, Harold, datada de amanhã, apareceu na bolsa." },
    acoes: [
      {
        id: "june-carta", texto: "Ler a carta do Harold", palavras: ["carta", "harold", "ler", "marido"], situacao: "ler",
        sucesso: { texto: "“Junie. Não vá à praça. Eu sei que você vai, porque você sempre vai aonde precisam de você. Então leve a maleta. E quando a música parar, não solte a mão de quem estiver do seu lado. Te vejo do outro lado. Do outro lado mesmo. — H.”", pista: "A carta do Harold avisa: quando a música parar, não soltar a mão de quem estiver ao lado.", efeitos: { marca: "carta-harold", quest: { id: "fio-june", nome: "A carta do Harold", prazo: "longa", nota: "“Te vejo do outro lado. Do outro lado mesmo.”" } } },
        falha: { texto: "As linhas se mexem como se ele ainda estivesse escrevendo. Você dobra a carta e guarda no peito. Hoje, não.", efeitos: { condicao: "abalado" } },
      },
      {
        id: "june-petrakis", npc: "petrakis", comum: true, texto: "Acalmar a Sra. Petrakis", palavras: ["petrakis", "acalmar", "cha", "senhora"],
        resultado: { texto: "Ela segura sua mão com força. “June, querida, você viu? Eles nem terminaram o chá. Ninguém sai sem terminar o chá.” Você serve mais uma xícara para as duas. O chá ajuda as duas.", efeitos: { condicao: ["-abalado", "-cansaco"] } },
      },
    ],
  },

  "eli-navarro": {
    ponto: "universidade", arte: "laboratorio",
    nome: "Laboratório de Radiação", onde: "no laboratório de radiação da Universidade de Port Halden",
    desc: "Os sensores marcam um pico que não deveria existir. A impressora cospe gráficos sem parar. Ninguém atende o telefone da diretoria.",
    abertura: `Eli Navarro está há três dias no laboratório de radiação da universidade. Foi ele quem viu primeiro: os números subindo, sempre às 21h47, sempre no mesmo padrão.

Ele mandou os dados para a diretoria na segunda. Na terça, chegou a resposta, de um endereço que não é da universidade:

“Apague os arquivos. Não fale com a imprensa. Obrigado pela colaboração. — C.”

Ele não apagou. O pendrive está no bolso dele agora, pesando como se fosse de chumbo.`,
    fio: { id: "fio-eli", nome: "Os números que ninguém quis ouvir", prazo: "longa", nota: "Alguém assinando “C.” mandou apagar os dados. Eli guardou tudo num pendrive." },
    acoes: [
      {
        id: "eli-email", texto: "Rastrear de onde veio o e-mail assinado “C.”", palavras: ["email", "rastrear", "remetente", "assinado"], situacao: "investigar",
        sucesso: { texto: "O servidor de origem fica num prédio federal no centro, terceiro subsolo. O nome do domínio: contencao.gov. O e-mail foi enviado às 21h47 de três dias atrás. Antes de você mandar os dados.", pista: "O e-mail mandando apagar os dados veio da Diretoria de Contenção, antes de Eli enviá-los.", efeitos: { marca: "email-contencao", quest: { id: "fio-eli", nome: "Os números que ninguém quis ouvir", prazo: "longa", nota: "O e-mail veio da Contenção. E chegou antes dos dados." } } },
        falha: { texto: "A cada tentativa, o e-mail fica mais curto. Na quarta, sobra só a assinatura: “C.” Na quinta, nem ela.", efeitos: { exposicao: 1 } },
      },
      {
        id: "eli-copia", comum: true, texto: "Fazer uma segunda cópia do pendrive", palavras: ["copia", "pendrive", "backup", "copiar"],
        resultado: { texto: "Você copia tudo para um segundo pendrive e esconde dentro do forro do casaco. Se alguém pegar um, ainda sobra o outro.", efeitos: { marca: "pendrive-dados" } },
      },
    ],
  },

  "tess-monroe": {
    ponto: "arte", arte: "kphn",
    nome: "Estúdio da rádio KPHN", onde: "no estúdio da rádio KPHN, ao vivo",
    desc: "A luz vermelha de NO AR acesa, o café no copo de papel, o painel de ligações piscando. Todas as linhas piscam ao mesmo tempo. O técnico foi embora sem tirar os fones.",
    abertura: `Tess Monroe apresenta o “Port Halden After Dark”, da meia-noite às quatro, na KPHN. Hoje ela entrou mais cedo, porque o programa das nove não teve apresentador.

Há três noites, um ouvinte liga sempre às 21h47 pela linha 3. Nunca fala. Só respira, no ritmo de três curtas e uma longa.

Hoje, às 21h47, a linha 3 acende de novo. Dessa vez a voz fala. É a sua voz, Tess, dizendo devagar: “Você vai entender amanhã. Não desliga.”`,
    fio: { id: "fio-tess", nome: "A ligação da linha 3", prazo: "longa", nota: "Às 21h47, pela linha 3, uma voz igual à de Tess: “Você vai entender amanhã. Não desliga.”" },
    acoes: [
      {
        id: "tess-linha3", texto: "Não desligar a linha 3", palavras: ["linha", "nao deslig", "ouvir", "manter"], convergencia: 1,
        sucesso: { texto: "Você fica na linha. A sua voz, do outro lado, começa a cantar a melodia da rádio pirata, baixinho. Você percebe que está cantando junto, e que não sabe de onde conhece a letra.", efeitos: { flag: "ouviu-ouvinte", quest: { id: "fio-tess", nome: "A ligação da linha 3", prazo: "longa", nota: "Você não desligou. A voz cantou a melodia da rádio pirata." } } },
        falha: { texto: "Você bate o telefone. Todas as outras linhas param de piscar ao mesmo tempo. Só a 3 continua acesa.", efeitos: { quest: { id: "fio-tess", nome: "A ligação da linha 3", prazo: "longa", nota: "Você desligou. A linha 3 continuou acesa." } } },
      },
      {
        id: "tess-aviso", comum: true, texto: "Ir ao ar e mandar todo mundo ficar em casa", palavras: ["ar", "aviso", "microfone", "ficar em casa", "falar"],
        resultado: { texto: "“Aqui é Tess Monroe, KPHN. Se você está ouvindo isso: tranque a porta. Fique longe do centro. Não siga ninguém.” Você repete três vezes. Na terceira, percebe que falou no ritmo: três curtas, uma longa.", efeitos: { ressonancia: 1 } },
      },
    ],
  },

  "ray-okafor": {
    ponto: "rua", arte: "taxi",
    nome: "O seu táxi, na Linha 9", onde: "no seu táxi, parado no ponto da Linha 9",
    desc: "O taxímetro ligado, o rosário pendurado no retrovisor, a foto das filhas no painel. Lá fora, ninguém faz sinal. Todos andam para o mesmo lado.",
    abertura: `Ray Okafor dirige táxi em Port Halden há vinte anos. Hoje é motorista de aplicativo, mas o carro ainda é o mesmo, e o taxímetro antigo ainda funciona.

Às 21h40 entrou um passageiro no banco de trás. Terno cinza, sem bagagem. Pediu “Praça Central, por favor” e não disse mais nada.

Às 21h47 você olhou pelo retrovisor. O banco de trás está vazio. As portas estão travadas. E o taxímetro continua correndo, como se a corrida ainda não tivesse acabado.`,
    fio: { id: "fio-ray", nome: "O passageiro da Linha 9", prazo: "longa", nota: "Um passageiro de terno cinza pediu a Praça Central e sumiu do banco de trás. O taxímetro não para." },
    acoes: [
      {
        id: "ray-banco", texto: "Revistar o banco de trás", palavras: ["banco", "tras", "revistar", "passageiro"], situacao: "perceber",
        sucesso: { texto: "Entre o encosto e o assento, um crachá preso a um cordão azul: “Diretoria de Contenção”. Sem foto. No verso, a lápis: “Corrida paga até o fim. Não pare o taxímetro.”", pista: "O passageiro que sumiu do táxi tinha um crachá da Diretoria de Contenção.", efeitos: { marca: "cracha-contencao", quest: { id: "fio-ray", nome: "O passageiro da Linha 9", prazo: "longa", nota: "Ele era da Contenção. “Corrida paga até o fim. Não pare o taxímetro.”" } } },
        falha: { texto: "O banco ainda está morno. No vidro de trás, por dentro, alguém escreveu com o dedo, no embaçado: ∃. Você limpa com a manga. O vidro embaça de novo.", efeitos: { exposicao: 1 } },
      },
      {
        id: "ray-filhas", comum: true, texto: "Ligar para as filhas", palavras: ["filhas", "ligar", "telefone", "familia"],
        resultado: { texto: "A mais velha atende no segundo toque. “Pai? Tá tudo bem aqui. A gente trancou a porta, como você ensinou.” Você respira pela primeira vez em uma hora.", efeitos: { condicao: "-abalado" } },
      },
    ],
  },
};

// As ações das origens entram no lugar onde a noite começa (só para quem tem aquela origem)
(() => {
  const m = MISSOES["prologo-x"];
  const daOrigem = Object.entries(ORIGENS_X).flatMap(([pronto, o]) => o.acoes.map((a) => ({ ...a, se: { ...(a.se || {}), pronto } })));
  m.lugares.trabalho.acoes.unshift(...daOrigem);
  // a copa, a tomada da mesa, o colega e o ponto são do "escritório" genérico: nas origens, o lugar é outro
  for (const a of m.lugares.trabalho.acoes)
    if (["colega", "copa-cafe", "copa-lanche", "carregar", "ponto"].includes(a.id)) a.se = { ...(a.se || {}), semPronto: true };
})();
