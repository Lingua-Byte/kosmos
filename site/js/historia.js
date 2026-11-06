// A história do KOSMOS: o que o autor decidiu, o que está para considerar e o que segue em aberto.
// Aparece na aba "História" da Oficina (só leitura). Para mudar, edite este arquivo.
// estado: "decidido" | "considerar" | "aberto"

const HISTORIA = {
  intro:
    "A espinha da história do KOSMOS. Cada parte tem um selo: <b>Decidido</b> (o autor confirmou), <b>Para considerar</b> (proposta aceita para pensar) e <b>Em aberto</b> (ainda sem resposta).",
  secoes: [
    {
      titulo: "Os eixos são três pontos no tempo",
      estado: "decidido",
      html: `
        <p>Os eixos não são “três mundos”. São três momentos da mesma realidade, ligados por causa e consequência.</p>
        <table class="tabela">
          <thead><tr><th>Eixo</th><th>Para a história</th><th>Para o jogador</th></tr></thead>
          <tbody>
            <tr><td>ᛉ Y · Medieval</td><td>passado distante</td><td>passado</td></tr>
            <tr><td>∃ X · Port Halden</td><td>passado</td><td><b>presente</b> (onde começa a jogar)</td></tr>
            <tr><td>◉ Z · Domus</td><td><b>presente real</b></td><td>futuro</td></tr>
          </tbody>
        </table>
        <p>O fenômeno não é uma criatura nem uma entidade. É <b>consequência</b>: algo aconteceu e está causando tudo isso.</p>`,
    },
    {
      titulo: "Por que X, Y e Z",
      estado: "decidido",
      html: `
        <p><b>As letras vêm do próprio buraco negro.</b> Num buraco negro que gira, o <b>eixo Z é o eixo de rotação</b>, e o <b>anel do centro fica deitado no plano de X e Y</b> (isso é física real).</p>
        <ul>
          <li>A <b>Domus</b> desce ao longo do eixo Z, em direção ao anel. Por isso ela é o Z.</li>
          <li>O <b>anel é o Lime</b>, no plano de X e Y.</li>
          <li>Dentro do horizonte, espaço e tempo trocam de papel: <b>X e Y deixam de ser largura e profundidade e passam a apontar para tempos</b>. Ali estão o presente do jogador (X) e o passado (Y). Essa parte é ficção.</li>
          <li>Quem deu os nomes foi <b>a tripulação ou a IA da Domus</b>, com as coordenadas que qualquer cientista usaria. Elas chamam de X e Y as direções onde acham ecos de gente, sem saber que são épocas. <b>O nome é uma pista:</b> o jogador acha que são letras de mapa e descobre que são coordenadas de tempo.</li>
        </ul>
        <p><b>No Lime, o tempo vira um lugar onde se anda.</b> Ir ao passado é como andar para um lado. Os três tempos viram três direções que se cruzam na origem (0,0,0), e épocas diferentes ficam lado a lado, como cômodos de uma casa. É assim que o jogador entende o Lime quando chega lá.</p>
        <p>A ordem das letras não é cronológica: elas dizem a <b>posição em relação ao buraco negro</b>, não a ordem no tempo.</p>`,
    },
    {
      titulo: "O Eixo Y é outro tempo, não outro mundo",
      estado: "decidido",
      html: `
        <ul>
          <li>O Y é o <b>passado</b> da mesma realidade, não um mundo de fantasia à parte.</li>
          <li>As pessoas do Y <b>leem runas</b>. A princípio, é isso.</li>
          <li><b>Nada religioso:</b> sem heresia, sem igreja, sem deuses explicando o fenômeno.</li>
          <li><b>Mesmo chão:</b> o Y acontece no lugar onde um dia vai existir Port Halden, muito antes da cidade. Andar pelo Y é andar pela mesma terra em outro tempo.</li>
        </ul>`,
    },
    {
      titulo: "Yudur por dentro",
      estado: "aberto",
      html: `
        <ul>
          <li>A <b>Pedra da Lei</b> é o cartório do vale, não um altar. Ela e as runas da base são mais velhas que o povo; ninguém lembra quem a pôs ali.</li>
          <li>Quem manda é a <b>Senhora do Vale</b>, pelo celeiro e pelas talhas. O que fica gravado, decidem os <b>copistas da Casa Fria</b>.</li>
          <li>Cada pessoa tem um nome de boca e um <b>nome de Pedra</b>. Na <b>noite mais longa</b>, os mortos são lidos e a família responde "lembrado". É lembrança, não reza.</li>
          <li>A pior pena é o <b>exílio</b> além dos marcos. Para o povo, o Runático é "gravador sem marca": primeiro crime, depois doença, depois medo.</li>
        </ul>
        <p><b>Rascunho do Claude, ainda sem a participação do autor.</b> Detalhes em <b>YUDUR.md</b>.</p>`,
    },
    {
      titulo: "A Domus e o buraco negro",
      estado: "decidido",
      html: `
        <p><b>Confirmado pelo autor em 05/11/2026:</b> a Domus cruzou o horizonte; vista de fora, parece parada; a “estrela que observa” é luz, não um olho.</p>
        <ul>
          <li>A Domus, numa missão de exploração, <b>já atravessou o horizonte de um buraco negro</b> sem perceber. Num buraco negro supermassivo a borda é suave: não há solavanco, alarme nem nave despedaçada.</li>
          <li>Visto de fora, quem cai parece <b>congelar na borda para sempre</b>. A base da missão vê a Domus parada e sem resposta: daí ela “vagar sem contato” (detalhe secundário, que já vem explicado).</li>
          <li>Dentro do horizonte, <b>espaço e tempo trocam de papel</b>: o centro deixa de ser um lugar e vira um momento que não se pode evitar. <b>A Domus cair é a Domus avançar no tempo.</b></li>
          <li>A “estrela que observa” é a luz de fora chegando concentrada, com o disco brilhante em volta do centro escuro: parece um olho, sem ser um.</li>
        </ul>`,
    },
    {
      titulo: "A missão da Domus e o nó (ideias do autor)",
      estado: "considerar",
      html: `
        <p>Ideias do autor em 05/11/2026, para desenvolver junto com ele. O objetivo da missão e o que a IA quer <b>seguem em aberto</b>.</p>
        <ul>
          <li><b>A IA da Domus entrou num loop temporal</b>, causado pelo nó do tempo, e já não consegue saber a origem da missão.</li>
          <li><b>Dentro do jogo, a missão é ser guiado por um sinal estranho</b> que está codificando a criação da Domus. Os personagens podem interpretar o código como um sinal alienígena.</li>
          <li>Depois, o mesmo código passa a ser <b>a rota para a Domus seguir até o Lime</b>. Isso precisa aparecer <b>aos poucos, em algumas missões do Eixo X</b>.</li>
          <li><b>Para depois:</b> e se a IA estiver enviando os códigos para a <b>criação da Domus</b>? (A nave seria construída a partir de uma mensagem que ela mesma manda.)</li>
          <li><b>O tempo:</b> os <b>26.000 anos</b> vêm de uma sugestão antiga do Claude (não ficou salva): 26.000 anos-luz é a distância real da Terra até <b>Sagitário A*</b>, o buraco negro do centro da galáxia. A ideia do autor: é relatividade. Dentro da Domus passam de <b>50 a 100 anos</b>; lá fora, <b>26.000</b> (paradoxo dos gêmeos: viajando a 99,9993% da velocidade da luz, 26.000 anos-luz cabem em 100 anos de bordo). Em aberto: se o buraco negro é mesmo Sagitário A*.</li>
          <li><b>Por que o Y existe (ideia do autor):</b> por ambiguidade nos cálculos, a IA enviou <b>códigos cruzados para dois pontos do tempo</b>. Um é Port Halden (X); o outro é o Y.</li>
          <li><b>De onde vem a ambiguidade (ideia do autor):</b> a Domus desce pelo eixo Z, rumo ao anel do buraco negro. A geometria do anel causa a ambiguidade. (Explicação para considerar: visto do eixo, o anel é igual em todas as direções do plano XY; a conta da IA não tem como preferir uma direção e se divide em duas, X e Y.)</li>
          <li><b>Duas respostas na conta (decidido pelo autor):</b> as equações de um buraco negro que gira dão duas soluções para quase tudo (por isso ele tem duas bordas). A conta da IA para achar onde mandar o código também dá duas; presa no loop, sem saber a origem da missão, ela manda para as duas: o X e o Y.</li>
          <li><b>Sem o Y, o Lime não existe (decidido pelo autor):</b> o Lime é o anel e fica no plano XY. Um plano precisa de duas direções; só com o X, seria uma linha. Os dois pontos de chegada do código formam o plano onde o anel está.</li>
          <li><b>Frases partidas entre os tempos (ideia do autor, para desenvolver com o designer de mecânicas):</b> em algumas missões, não em todas, uma frase chega com uma metade no X (em cálculo, o Código Urbano) e a outra no Y (em runas). Quando o personagem junta as duas metades traduzidas e percebe que elas se completam, isso é uma <b>Memória Cruzada</b>.</li>
          <li><b>O Y é a fundação de Port Halden</b> (decidido pelo autor em 05/11/2026). <b>Port Halden fica no mesmo chão de Yudur.</b> A cidade não precisa ser nos Estados Unidos: o jeito americano foi escolhido para ficar mais jogável, e pode ser um ponto nórdico (a ver depois). Como a fundação se liga ao código, e o motivo do Y nas regras do jogo, seguem em aberto.</li>
          <li><b>Para quem está no Lime, tudo acontece num instante (decidido pelo autor).</b> Vistos pela IA, o passado do Y que leva à fundação de Port Halden e o presente do X, em que o <b>Instituto de Física recebe os códigos</b>, acontecem ao mesmo tempo. (Quem recebe primeiro no Instituto: talvez o Eli Navarro, a ver depois.)</li>
          <li><b>Yudur já existia (decidido pelo autor).</b> O que o jogo mostra no Y são os acontecimentos que vão levar à fundação da cidade.</li>
          <li><b>A conta das duas respostas (para considerar):</b> o jogo se passa em <b>−26.000</b> (X) e por volta de <b>−27.000</b> (Y), contados a partir do Lime. As bordas de um buraco negro que gira ficam em r± = M·(1 ± √(1 − giro²)) (física real). A IA usa as duas respostas como "quanto voltar no tempo" (ficção): uma cai em −26.000, a outra em −26.000 × r₊/r₋. Com o giro em <b>0,9998</b>, a segunda dá <b>−27.061</b>: uns 1.060 anos antes de Port Halden, perto do ano 1000. Um giro quase máximo, como o do buraco negro do Interestelar, e que também explica a enorme diferença de tempo dentro e fora da Domus. Ambientação do Y: um assentamento nórdico na América do Norte por volta do ano 1000 é a favorita, mas segue em aberto.</li>
          <li><b>A linha do tempo (confirmada pelo autor):</b> de Port Halden (X) ao lançamento da Domus (Z) passam de <b>50 a 100 anos</b>; o mundo acha que o sinal é alienígena. Do lançamento até o Lime passam <b>26.000 anos</b>, sem que a tripulação saiba.</li>
          <li><b>A intro do Z mostra os dois momentos (decidido pelo autor em 06/11/2026):</b> o lançamento da Domus e a chegada perto do anel. É por causa da relatividade: entre um e outro passam 50 a 100 anos dentro da nave e 26.000 anos para quem ficou. <b>A intro é o lançamento e acaba com a nave parada, "congelada"</b> (decidido pelo autor em 06/11/2026), como ela é vista de fora quando cruza o horizonte. Ninguém está olhando: é só a imagem de fora. <b>A IA de dentro da Domus percebe a quebra; visto de fora, é tudo um momento</b> (autor, 06/11/2026): por dentro o relógio segue, e só a conta da IA, que traduz a hora de bordo para a da base, vai ao infinito; por fora, a nave fica parada em 21:47 para sempre.</li>
          <li><b>A conta da IA no jogo (decidido pelo autor em 06/11/2026):</b> o registro de mira (CALCULO_DA_IA.md) aparece inteiro num terminal da Domus; pedaços dele vazam aos poucos em Port Halden, sem explicação; o Muro é esse registro, uma linha por missão, nas três línguas, no <b>Viaduto Leste</b> de Port Halden, onde os Riscadores já riscam no Prólogo (um easter egg opcional, do começo ao fim do jogo, e não a ligação entre as missões); e a última linha (não existe critério para saber qual é a origem) vira a escolha do final, quando o jogador fala com a IA.</li>
          <li><b>Falar com a IA (ideia do autor):</b> no endgame, o jogador precisa se comunicar com a IA da Domus nas línguas do jogo, escrevendo, e não só lendo.</li>
          <li><b>Uma missão com a IA:</b> o jogador ajuda a IA a descobrir a ponta inicial do nó (o momento em que a Domus foi criada pela primeira vez) e segue a linha do tempo até o momento em que o jogo está. Escrever <b>junto com os agentes de lore e de mecânica</b>.</li>
        </ul>`,
    },
    {
      titulo: "21h47: a hora em que a Domus cruzou",
      estado: "decidido",
      html: `
        <ul>
          <li><b>21h47 é a hora do relógio de bordo da Domus quando ela cruzou o horizonte do buraco negro.</b> É por isso que tudo em Port Halden acontece às 21h47.</li>
          <li>Na intro do Z, a hora aparece num momento banal (um relógio de cozinha, um registro automático), sem ninguém apontar para ela. O jogador só liga os pontos muito depois.</li>
          <li>Ideia para considerar: o número aparece em objetos (relógios, etiquetas, livros de registro), não na narração apontando para ele, para não cansar.</li>
        </ul>
        <p><b>Por que a conta tropeça (para considerar):</b> a DOMUS converte a hora de bordo para a hora da base, e nessa conta a hora da base vai ao infinito exatamente na borda. A conta tropeça e o relógio da cabine pula um minuto. A IA marca as mensagens com o tempo de bordo dela; por isso a mesma hora aparece em Port Halden e em Yudur.</p>
        <p>Mais propostas para a história (ordem das 17 missões, Travessias entre eixos, personagens e lugares) estão em <b>NARRATIVA.md</b>, <b>PERSONAGENS.md</b> e <b>LUGARES.md</b>.</p>`,
    },
    {
      titulo: "O Lime",
      estado: "considerar",
      html: `
        <ul>
          <li>O Lime é <b>um lugar físico e também um momento</b>: o ponto onde passado, presente e futuro se encontram.</li>
          <li>Num buraco negro que gira, o centro não é um ponto, é um <b>anel</b>. O Lime é esse anel: literalmente um nó no espaço-tempo.</li>
          <li>As pessoas misturadas do Lime (alguém que lê runas, usa espada e viaja no espaço) são <b>pessoas de épocas diferentes coexistindo</b>.</li>
        </ul>`,
    },
    {
      titulo: "O efeito vai do futuro para o passado",
      estado: "considerar",
      html: `
        <ul>
          <li>Quanto mais a Domus cai, mais o tempo se dobra, e o passado começa a sentir.</li>
          <li><b>Em X:</b> radiação sem origem, surtos, gente caminhando para o epicentro. É energia do futuro chegando a uma época que só sabe medi-la como radiação.</li>
          <li><b>Em Y:</b> a mesma energia, aparecendo nas runas que eles leem.</li>
          <li><b>Em Z:</b> a estrela que observa.</li>
        </ul>`,
    },
    {
      titulo: "A radiação em Port Halden",
      estado: "decidido",
      html: `
        <ul>
          <li><b>Decidido pelo autor:</b> o epicentro da radiação são as <b>casas dos personagens</b>. Em algum momento eles passam a ser procurados por isso (talvez pelo lado do Instituto de Física).</li>
          <li>A <b>luz azul com uma espécie de acelerador</b> fica escondida no <b>subsolo da Atlantic Tower</b>.</li>
          <li>Em aberto: como isso convive com a Praça Central, para onde a multidão caminha no Prólogo.</li>
        </ul>`,
    },
    {
      titulo: "Por que Port Halden",
      estado: "considerar",
      html: `
        <ul>
          <li>O fenômeno se concentra <b>nas pessoas, não no planeta</b>: as versões de X dos 9 tripulantes vivem em Port Halden.</li>
          <li>O epicentro na Praça Central é o ponto de X ligado à nave.</li>
          <li><b>Não é global ainda.</b> O raio cresce conforme a Domus cai: primeiro surtos isolados, depois a cidade, depois o passado mais fundo (Y). Esse é o relógio do jogo.</li>
        </ul>`,
    },
    {
      titulo: "A ordem do jogo é uma viagem no tempo",
      estado: "considerar",
      html: `
        <p><b>Z</b> (intro: o presente real) → <b>X</b> (o jogador é jogado no passado) → <b>Y</b> (mais fundo no passado) → <b>Z</b> (endgame: a volta ao presente) → <b>Lime</b> (onde todos os tempos se encontram).</p>
        <p>Isso explica por que o Z é o endgame: é para lá que tudo está voltando.</p>`,
    },
    {
      titulo: "Os códigos e as línguas",
      estado: "considerar",
      html: `
        <ul>
          <li>Os códigos são <b>uma mensagem da IA da Domus, que está no Lime</b>, escrita no jeito de cada época.</li>
          <li><b>Runas (Y) → Código Urbano (X) → Interface (Z)</b>: a mesma escrita ao longo da história. Quem aprende as runas tem vantagem para decifrar o código.</li>
          <li><b>Riscadores</b> recebem a mensagem sem conseguir entendê-la e a copiam sem parar, como um rádio preso numa estação. <b>Despertos</b> conseguem ler.</li>
        </ul>`,
    },
    {
      titulo: "Quem fala do Lime: a IA da Domus",
      estado: "decidido",
      html: `
        <p><b>Decidido pelo autor: quem fala do Lime é a IA da Domus.</b> As mensagens, os códigos e a voz por trás deles são dela.</p>
        <p>Ideias que acompanham a decisão (ainda para considerar):</p>
        <ul>
          <li><b>Só uma máquina chegaria ao Lime.</b> Corpos humanos não aguentam; uma IA é informação e pode se preservar. Ela não chega antes: ela dura.</li>
          <li><b>Só manda informação, não matéria:</b> por isso chegam mensagens, não pessoas. Canal estreito = mensagens em fragmentos, pistas aos poucos.</li>
          <li><b>Mira no que conhece:</b> o perfil de cada tripulante (genoma, exames, padrão neural). Procura essas assinaturas no passado, e isso leva a Port Halden.</li>
          <li><b>A radiação é efeito colateral</b> da transmissão, não um ataque.</li>
          <li><b>A Interface (língua do Z) é a língua dela.</b> O Código Urbano parece matemático porque é uma máquina tentando se fazer entender.</li>
          <li><b>O jogador a conhece na intro</b> como o sistema de bordo, prestativo e comum. Muito depois, percebe que a voz por trás dos códigos é ela.</li>
        </ul>
        <p><b>Cuidados:</b> evitar o clichê da IA vilã (saída: o motivo dela é literal, não maligno; ela segue uma diretriz da missão de um jeito que ninguém previu, e “tornar-se Interface” vira fundir-se com ela). E o laço no tempo: ela pode ter causado a própria viagem, se a anomalia que a missão foi estudar era o sinal dela mesma.</p>
        <p><b>O que ela quer</b> segue em aberto (veja as perguntas abaixo).</p>`,
    },
    {
      titulo: "O que é ciência e o que é ficção",
      estado: "considerar",
      html: `
        <p>Regra do autor: explicação o mais científica possível, sem travar a ficção.</p>
        <table class="tabela">
          <thead><tr><th>Ideia</th><th>Nível</th></tr></thead>
          <tbody>
            <tr><td>Cruzar o horizonte de um buraco negro supermassivo sem perceber</td><td class="nivel-real">Real</td></tr>
            <tr><td>Visto de fora, quem cai parece congelar para sempre</td><td class="nivel-real">Real</td></tr>
            <tr><td>Dentro do horizonte, o centro vira um momento no futuro</td><td class="nivel-real">Real</td></tr>
            <tr><td>Buraco negro que gira (Kerr) tem um anel no centro, e as equações permitem caminhos que voltam no tempo perto dele</td><td class="nivel-esp">Especulativo: está nas equações, mas a maioria dos físicos acha essa região instável</td></tr>
            <tr><td>A luz de fora chegando concentrada para quem cai em direção ao anel</td><td class="nivel-esp">Especulativo, com base real</td></tr>
            <tr><td>Mandar mensagens ao passado pelo anel</td><td class="nivel-fic">Ficção</td></tr>
            <tr><td>O sinal procurar pessoas pelo perfil genético</td><td class="nivel-fic">Ficção</td></tr>
          </tbody>
        </table>`,
    },
    {
      titulo: "Perguntas que seguem em aberto",
      estado: "aberto",
      html: `
        <ul>
          <li><b>O objetivo da missão:</b> A) resgate ou investigação de uma nave anterior que parou de transmitir; B) mapeamento de uma anomalia que ninguém sabe que é um buraco negro, com erro de cálculo.</li>
          <li><b>O que a IA da Domus quer?</b> Avisar (“não venham”), chamar (“venham”) ou algo ambíguo. Isso define quais finais são certos: impedir, aceitar ou controlar a convergência.</li>
          <li><b>Ancestrais ou ecos?</b> As versões de X e Y são antepassados da tripulação (pelo sangue) ou pessoas sem parentesco com o mesmo padrão?</li>
          <li><b>As tendências dos 9</b> (herói, anti-herói, vilão): quem é quem.</li>
        </ul>`,
    },
    {
      titulo: "Roteiro para pensar a história",
      estado: "considerar",
      html: `
        <p>A ordem que ajuda a destravar, do mundo para os personagens:</p>
        <ol>
          <li><b>O que está errado no mundo?</b> A causa, numa frase, mesmo que o jogador só descubra no fim.</li>
          <li><b>O que acontece se ninguém fizer nada?</b> O relógio que dá urgência.</li>
          <li><b>Quem quer alguma coisa?</b> Pessoas e grupos de Port Halden com desejos que se chocam: quem lucra com a crise, quem quer fugir, quem quer controlar a cidade. (Os Riscadores são mobs, não facção.)</li>
          <li><b>Onde termina?</b> O que chegar ao Lime resolve, ou não.</li>
          <li><b>Só então, os personagens:</b> para cada um dos 9, o que quer e o que tem a perder.</li>
        </ol>
        <p>Atalho: escrever o <b>ponto de virada do fim do Prólogo X</b>, o momento que muda tudo e empurra o jogador para o próximo eixo.</p>`,
    },
  ],
};
