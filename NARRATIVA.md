# KOSMOS — Bíblia narrativa: estrutura e missões

Como o KOSMOS conta a sua história: o que aprender com os RPGs de referência, a ordem dos eixos,
as missões fora do eixo (Ecos) e o arco das 17 missões principais.
Os personagens estão em `PERSONAGENS.md`; os lugares (Port Halden, Yudur, Domus), em `LUGARES.md`.

**Selos usados aqui** (os mesmos da aba História):
- **Decidido**: já está no `CLAUDE.md` ou em `site/js/historia.js` como decidido.
- **Proposta**: ideia nova deste documento. Pode guiar a escrita, mas o autor confirma antes de virar regra.
- **Em aberto**: o jogo não pode responder ainda. O texto contorna.

**Referência principal: Fallout.** Os outros servem para coisas específicas:
TES antes de Morrowind (mundo escrito por quem vive nele), Neverwinter Nights (capítulos com missões em paralelo),
Resident Evil (slow burn e documentos que pioram), Interestelar (ciência com custo humano, no Eixo Z) e
Tolkien (profundidade de tempo e de língua, sobretudo no Eixo Y).

---

## 1. O que cada referência ensina

### 1.1 Fallout (a voz do jogo)
- **Missão nasce de alguém que quer uma coisa.** Ninguém pede "vá investigar a anomalia". Pedem a insulina da mãe,
  o irmão de volta, os vinte dólares que a Doris deve desde o Natal. A anomalia atravessa o pedido.
- **Toda missão tem pelo menos três saídas**: a força, a conversa (com teste de atributo visível) e a esperta
  (roubar, mentir, dar a volta, usar uma pista que o jogador trouxe de outro lugar). Às vezes uma quarta, ruim e
  tentadora.
- **A escolha grande chega cedo.** Fallout 3 põe uma decisão do tamanho de uma cidade nas primeiras horas.
  O jogador entende logo que o jogo leva as decisões dele a sério. No KOSMOS: ainda no Eixo X (ver X3, seção 5).
- **O mundo comenta o jogador.** Um rádio, um jornal, um boato que repete o que ele fez, pelo nome.
  Em Port Halden isso é a KPHN e a rádio pirata; em Yudur, a pregoeira e as canções; na Domus, o mural de recados do refeitório.
- **Terminais e papéis.** A tragédia contada por quem não sabia que era tragédia: pedido de material,
  e-mail de colega, escala de plantão. Depois, o silêncio.
- **Humor seco.** O mundo está acabando e o Abe reclama que ninguém comprou pão.
- **Finais em quadros.** No fim, uma tela por lugar e por pessoa importante: o que aconteceu com Maple Heights,
  com a Martha, com o Danny. É o que faz o jogador sentir que mexeu no mundo inteiro.
- **Fallout 1: o relógio.** A primeira missão tinha prazo, e o prazo dava peso a cada desvio.
  O KOSMOS já usa relógio (o dia do X1); cada eixo terá o seu (seção 5.4).

### 1.2 The Elder Scrolls (Arena e Daggerfall)
- **Livros com autor.** Cada documento puxa para o lado de quem escreveu. A verdade sai da comparação.
- **Boatos.** "Dizem que..." espalhado pela cidade, metade certo. O mundo parece maior que o mapa.
- **Linhas de missão de grupos.** Daggerfall tinha várias "carreiras" (guildas, cortes, templos) com missões
  próprias. No KOSMOS isso vira **missões em sequência ligadas a um grupo de pessoas**: a rede da Ouvinte,
  a Contenção, os copistas de Yudur, a tripulação dividida da Domus.
- **Cartas que chegam.** Daggerfall puxava a trama principal por cartas entregues ao jogador.
  O KOSMOS já tem isso: a carta do Harold, o pacote do Marcus. Vale como ferramenta recorrente.

### 1.3 Neverwinter Nights (a forma dos capítulos)
- **Capítulo = cidade-base + missões em paralelo.** O jogador chega, recebe três ou quatro tarefas que pode fazer
  em qualquer ordem, e só então vem o clímax do capítulo. Isso dá liberdade sem perder a moldura.
- **Companheiros com missão própria**, que destravam conversando com eles entre as missões.
- É a forma que este documento propõe para cada eixo (seção 5).

### 1.4 Resident Evil (o começo)
- Rotina, depois um sintoma pequeno, depois o rastro. O monstro aparece pouco; o rastro aparece muito.
- O diário que piora: a letra vai se desfazendo e o jogador entende antes de quem escreve.
- Já está no `GUIA_ESCRITA.md`, seção 3. Vale para as primeiras cenas de **cada** eixo.

### 1.5 Interestelar (o Eixo Z)
- **A ciência tem preço em gente.** O filme não explica a dilatação do tempo numa aula: mostra o que ela custa
  (anos de recados acumulados). No KOSMOS, a física do buraco negro tem de custar alguma coisa a alguém
  dentro da Domus (seção 5.4, o relógio do Z, e `LUGARES.md`).
- **Explicação curta, feita por quem tem pressa.** Um personagem rabisca um desenho num papel porque precisa
  convencer outro a tomar uma decisão agora. Ninguém explica física por gosto.
- **Números concretos.** "Uma hora aqui são tantos anos lá" pega mais que "o tempo passa diferente".
  A DOMUS fala em números.
- **Procedimento.** Lista de verificação, contagem, confirmação de recebido. A rotina técnica é o "café frio"
  do Eixo Z: o detalhe mundano que deixa o estranho mais estranho.
- **A máquina com personalidade sem ser monstro.** A IA da Domus é útil, educada, literal. O desconforto vem de
  ela ser literal demais, não de ser má (ver `site/js/historia.js`, "Quem fala do Lime").
- Técnicas, não cenas: nada de reproduzir situações do filme.

### 1.6 Tolkien (profundidade, quando precisar)
Usar para **subir o nível**, sobretudo no Eixo Y, nunca para imitar. Não há personagens não humanos no KOSMOS.
- **A língua vem antes do nome.** Os nomes de Yudur saem da língua Yudur (kennings: a primeira runa diz o que é,
  as outras, como é). Um lugar se chama assim porque, um dia, alguém o descreveu assim. Hoje ninguém lembra por quê.
- **O tempo fundo.** Coisas mais velhas que as pessoas que moram perto delas: uma muralha que ninguém lembra de ter
  levantado, uma pedra com runas que os copistas não leem inteiras. A história aparece em pedaços (uma canção,
  um nome de lugar, um costume), nunca numa aula.
- **Começar em casa.** Antes da estrada, a mesa, a comida, o vizinho chato. É o mesmo slow burn do Fallout e do
  Resident Evil, com outra roupa.
- **A paisagem trabalha.** Distância a pé, tempo que faz, luz da hora, cansaço do caminho. Em Yudur, andar custa.
- **Dois registros de fala.** Gente simples fala simples; quem lê runas fala mais medido. O contraste mostra quem é
  quem. Sem arcaísmo forçado: nada de "vós", inversões ("disse ele o que vira") ou "outrora" a cada frase.
- **Canções dentro do mundo.** Versos curtos que os personagens sabem de cor e cantam errado. Uma canção pode
  carregar uma pista sem ninguém perceber.
- **A piedade que volta.** Poupar alguém no começo pesa no fim. O KOSMOS pode ter uma escolha de misericórdia cedo
  que só se paga no final (seção 5.3).
- **A virada boa que se ganha.** Quando tudo parece perdido, uma coisa pequena feita antes salva o dia. Funciona
  se foi plantada, e se for rara.

---

## 2. Por que 17 missões parecem um jogo enorme

Fallout 3 tem por volta de 17 missões principais e parece não ter fim. Não é o número: é o que as missões fazem.

1. **A principal é um guia de viagem.** Cada missão manda o jogador para uma região nova e o obriga a atravessar
   outras. No caminho, ele tropeça em pessoas com problemas. A principal é o fio; o mundo é o colar.
2. **Cada missão tem outra forma.** Uma é escolta, outra é infiltração, outra é só conversa, outra é cerco,
   outra é viagem, outra prende o jogador num lugar estranho com regras próprias. Nenhuma se parece com a anterior.
3. **Cidades-base cheias.** Um lugar com dez pessoas, cada uma com uma vontade, rende cinco missões secundárias
   sem esforço. Maple Heights já é isso (Abe, Martha, Sal, Petrakis, Hollis).
4. **Secundárias com arco próprio.** Algumas secundárias são tão longas e marcantes quanto a principal.
   O jogador lembra delas como "a história do vigia", não como "missão 23".
5. **Escolha grande cedo e consequência tarde.** O que o jogador decide no X volta no Y e no Z, pelo nome.
6. **Um motivo pessoal simples.** Fallout 3 é "achar o pai". O mundo pode estar acabando, mas o jogador anda por
   uma razão pequena. No KOSMOS, o **fio pessoal** de cada um dos 9 faz esse papel.
7. **O mundo fala sozinho.** Rádio, boatos, documentos, pichações, cartazes. O jogador sente que há vida fora da tela.
8. **Lugares sem missão.** Um apartamento com uma cena pronta (a mesa posta para dois, um prato intocado) e nenhum
   NPC. Conta uma história em três linhas e o jogador sai achando que viu um mundo.
9. **O final mostra tudo que mudou.** Os quadros do fim fazem as 17 missões parecerem 50.
10. **Rimas.** Uma situação aparece de novo em outro lugar, com outra roupa. O jogador reconhece e sente que o
    mundo tem desenho. No KOSMOS as rimas são entre eixos (a porta com corrente da Martha, a parede do Aldric).

**A conta que importa:** 17 principais + umas 8 a 10 secundárias por região-base + 3 a 4 Ecos por eixo +
o fio de cada personagem. É isso que soa como "jogo grande".

---

## 3. Linear ou misturado?

### Recomendação: espinha linear, bordas misturadas (Proposta)

A **linha principal** segue a ordem que o autor já decidiu: **intro Z → X → Y → Z (endgame) → Lime (pós-jogo)**.
O **resto** (secundárias, Ecos, fios pessoais) se mistura entre os eixos.

**Por que a espinha deve ser linear**
- **A ordem é a história.** Z → X → Y → Z é uma viagem no tempo: o jogador é jogado no passado, vai mais fundo,
  e volta ao presente real. Misturar a linha principal apaga a revelação de que os eixos são tempos.
- **Cada eixo tem um gênero.** O X é sobrevivência e precisa de relógio contínuo. Interromper a noite de Port
  Halden para passar uma hora na Domus quebra a tensão.
- **Slow burn precisa de chão.** Cada eixo começa na rotina. Três rotinas misturadas viram três começos.
- **Escrever e testar.** Um eixo de cada vez dá para escrever, testar e publicar. Três ao mesmo tempo triplica o
  trabalho antes do primeiro teste.

**Por que as bordas devem se misturar**
- O jogador quer ver os outros eixos antes da hora: dá vontade, e vontade é o que puxa o jogo.
- As pistas cruzadas (a contagem, o ritmo de três curtos e um longo, 21h47) ficam mais fortes quando o jogador
  vê de relance o outro lado.
- É o lugar perfeito para a ideia do autor: **missões de outro eixo, com custo** (seção 4).

**O que fica para trás**
- O ciclo X → Y → Z → X do `ATO_1.md` (uma missão de cada eixo, alternando). Vale como banco de ideias, não como
  ordem. As missões dele foram reaproveitadas na seção 5.
- A ideia de o jogador escolher em que eixo começar. Com a estrutura decidida (intro Z → Prólogo X), o começo é fixo.
  O replay muda o personagem (9 origens), não o eixo.

---

## 4. Ecos: missões de outro eixo, com custo (Proposta, para testar)

### 4.1 A ideia em uma frase
O jogador acha em seu eixo uma **âncora** (uma coisa que existe nos dois tempos) e pode pagar um preço de
Convergência para viver, por pouco tempo, o eco de si mesmo em outro eixo.

### 4.2 Por que combina com a lore
- **Só informação atravessa** (aba História, "Quem fala do Lime"). Então de um Eco **não se traz objeto**:
  traz-se o que se sabe. Pista, palavra de runa, uma marca no personagem, um nome. Isso resolve o equilíbrio
  sozinho: ninguém volta do Y com uma espada para o X.
- **Os ecos existem** (DESIGN, "Ficha única traduzida nos 3 eixos"). O Eco não cria nada: ele mostra o que o eco
  do personagem estava vivendo naquele tempo.
- **Ver mais custa.** Quem sabe demais dos outros eixos ou desperta ou se perde. O preço é a mesma regra do jogo,
  não uma moeda inventada.

### 4.3 Dois tamanhos
| | **Vislumbre** | **Eco** |
|---|---|---|
| Quando | antes de o eixo abrir na linha principal | depois que o eixo abriu |
| Tamanho | 1 a 3 cenas, curtas | 2 a 5 cenas, uma missão secundária de verdade |
| Controle | o jogador vê pelos olhos do eco e faz uma ou duas escolhas | joga normalmente |
| O que traz | uma pista, uma imagem, uma palavra | pistas, vocabulário, marcas que abrem saídas em missões principais |
| Exemplo | no X, um Vislumbre de Yudur: um sino, uma pedra, uma mulher contando ervas | no Z, um Eco de Port Halden em que o jogador procura o Leo no St. Luke's |

Assim, no começo do jogo (só X aberto), os Vislumbres do Y e do Z servem de **trailer**: dão vontade e plantam pistas,
sem estragar a revelação.

### 4.4 Como se libera
- **Âncora**: um objeto, lugar ou pessoa que rima com outro eixo. O terço riscado do padre Michael, o crachá do Homem
  de Terno, a fita "Parte 2", a parede do Teddy. Achar a âncora marca no Diário: *Eco disponível (Y)*.
- **Fio pessoal**: cada um dos 9 tem **1 Eco por eixo** ligado ao próprio fio (ver `PERSONAGENS.md`).
  O fogo do Frank em 1987 rima com um fogo em Yudur e com um alarme de incêndio na Domus.
- **Ressonância**: algumas âncoras só "acendem" a partir de certa marca de Ressonância (5, 10...). Quem tem
  Dissonância alta também as vê, mas paga mais.

### 4.5 O preço
O custo usa o que o jogo já tem. Nada de moeda nova.
1. **Entrar é um Teste de Convergência** (Essência). Passou: +1 Ressonância. Falhou: +1 Dissonância.
   A exposição sobe sempre (regra atual).
2. **O relógio anda.** O tempo do eixo de onde se sai passa enquanto se está fora. No X, isso pesa (o toque de
   recolher chega mais cedo). É a versão KOSMOS da radiação do Fallout: o atalho custa.
3. **O preço sobe no mesmo ato.** 1º Eco do ato: dificuldade Fácil; 2º: Médio; 3º em diante: Difícil.
   Quem faz todos, faz com medo.
4. **Voltar é outro teste** só se a Dissonância estiver numa marca (5, 10, 15...). Falhar a volta deixa um
   **traço de eco** temporário até o fim da missão (ex.: "conta em voz baixa", −1 em conversas). Não mata, incomoda.

### 4.6 Limites (para não quebrar o 30)
A Ressonância ou Dissonância 30 é fim de jogo. Então:
- No máximo **3 Ecos por ato de eixo** valendo pontos; os seguintes só custam relógio.
- Meta de teste: quem faz **todos** os Ecos chega ao fim do Z com no máximo **+8 a +10** pontos vindos deles.
  Quem não faz nenhum precisa conseguir terminar o jogo.
- Nenhum Eco é obrigatório para terminar uma missão principal. Ele abre uma saída melhor, nunca a única.

### 4.7 Como testar (protocolo)
Antes de escrever muitos Ecos, montar **2 Vislumbres e 1 Eco** e jogar com três perfis:
| Perfil | Faz | O que medir |
|---|---|---|
| Apressado | nenhum Eco | termina o X sem travar? sente falta de alguma coisa? |
| Curioso | só os do próprio fio | os Ecos melhoram a história do personagem? o preço parece justo? |
| Completo | todos | onde chegam Ressonância e Dissonância no fim do X? alguém passa perto de 30? |

Perguntas para o teste: o jogador entende que trazer um objeto é impossível? O preço assusta na medida certa
(hesita, mas paga)? O relógio andando incomoda ou só irrita?

Para o motor (quando for a hora): uma missão com `eco: { eixo, ancora, tamanho }`, feita no Criador como qualquer
outra. A missão publicada continua com o mesmo formato (`Criador.exportar` ↔ `MissoesDados.adaptar`).

---

## 5. O arco das 17 missões principais (Proposta)

### 5.1 A forma de cada eixo
Igual a um capítulo de Neverwinter Nights:
**abertura linear → três missões em paralelo (qualquer ordem) → clímax do eixo → salto.**
O que muda de um eixo para o outro é o **formato** das missões (seção 2, item 2), para a forma não cansar.

| Parte | Missões | Região-base | Gênero |
|---|---|---|---|
| Intro | Z0 | a Domus (um turno) | rotina técnica, slow burn curtíssimo |
| Eixo X | Prólogo, X1, X2, X3, X4, X5 | Maple Heights, depois a cidade | sobrevivência |
| Eixo Y | Y1, Y2, Y3, Y4, Y5 | o vale de Yudur | viagem, comunidade, inverno |
| Eixo Z | Z1, Z2, Z3, Z4, Z5 | a Domus inteira | tripulação dividida, ciência com custo |
| Pós-jogo | Lime (2 missões + segundo final) | a origem (0,0,0) | fora do tempo |

1 + 6 + 5 + 5 = **17 principais**. O Lime fica de fora da conta: é o pós-jogo.

### 5.2 Missão por missão

**Z0 · Turno da Noite** — *rotina (Proposta)*
O jogador é um tripulante da Domus num turno qualquer. Lista de verificação, refeitório, um colega reclamando do
café reciclado, a DOMUS lembrando um aniversário. Uma leitura de instrumento fora do lugar, que alguém anota e
ninguém resolve. Às 21h47 de bordo, nada acontece, a não ser que o relógio da cabine pula um minuto. O jogador vai
dormir. Corte para Port Halden.
- Curta: 6 a 10 telas. Serve para o jogador conhecer a voz da DOMUS **como sistema comum** (decidido em História).
- Planta: o ritmo de três curtos e um longo (um alarme de teste), o número 412, a palavra "Domus" num crachá.

**Prólogo X · A Noite** — *existe (`prologo-x`)*
A noite em que a cidade enlouquece. Termina na Praça Central, na música, no salto.

**X1 · A Manhã Seguinte** — *existe (`x1-manha`)*
Sobreviver ao dia cercado pela Contenção. Paga os fios do prólogo. Descobre a Contagem do Teddy: termina na
sexta, às 21h47. Abre o mapa e as três missões em paralelo.

**As três de Port Halden (qualquer ordem)**

**X2 · Frequência 94.7** — *escolta e fuga (do `ATO_1.md`)*
A Ouvinte transmite de telhado em telhado e a Contenção a caça. As fitas dela têm datas que ainda não chegaram.
Salvar a Ouvinte ou as fitas, nem sempre as duas.
- Grupo: a rede da rádio pirata (gente que guarda pedaços da música).

**X3 · A Cerca** — *infiltração e a escolha grande (Proposta)*
Entrar no perímetro da Contenção, no Prédio Federal, terceiro subsolo, de onde saiu o e-mail de "C.".
Lá dentro estão os dados de Eli, o Arquivo de 1987 e uma lista de nomes com endereços de Port Halden: quem a
Contenção vai recolher na sexta.
- **A escolha grande do X**: o que fazer com a lista. Ler na KPHN para a cidade inteira (pânico, saques, mas
  muita gente foge a tempo); entregar à Defesa Civil (lento, burocrático, algumas famílias salvas); queimar
  (a Contenção não sabe que você sabe); usar para salvar só os seus (Martha, Teddy, Danny, Hollis).
  Volta no X5 (quem está na estação), no Y (a pregoeira canta o que você fez, com outros nomes) e nos quadros finais.
- Grupo: a Contenção. Tem gente decente lá dentro (o guarda do X1).

**X4 · 1987** — *investigação em documentos e conversa (Proposta)*
A primeira vez. O fogo da Delancey Street, o apagão da Estação Rua 9, o trem que nunca chegou. Tudo às 21h47.
O jogador junta o que sobrou: o caderno do Joe Kessler, o vigia Oswald, um aposentado do metrô, a página arrancada
com o carimbo da Contenção. Missão quase sem combate, com relógio curto (antes do toque de recolher).
- Descoberta: em 1987 a coisa parou sozinha. Ninguém sabe por quê. (A causa fica para o Z.)
- Grupo: os velhos de Port Halden, que lembram e foram desmentidos.

**X5 · Estação Rua 9** — *sobrevivência total (do `ATO_1.md`)*
Sexta, 21h47. A Contagem chega a zero. O trem de 1987 chega. A Contenção quer fechar a estação com gente dentro.
Aqui, e só aqui, o X vira sobrevivência de verdade: sair vivo com quem der. Dentro do trem, pela janela, outro tempo.
Salto para o Y. A partir daqui a linha principal está em Yudur.

**Y1 · Três Batidas e Uma Longa** — *perseguição (do `ATO_1.md`, sem religião)*
O jogador acorda no meio da ação: o sino toca, a guarda do vale corre atrás dele, e ele não sabe por quê.
O eco dele foi visto tocando a Pedra da Lei de noite, e a Pedra amanheceu com runas que ninguém gravou.
Primeiras runas. Provar que não foi ele, ou fugir.
- O sino toca três batidas rápidas e uma longa. O jogador reconhece; o eco dele, não.

**As três de Yudur (qualquer ordem)**

**Y2 · O Irmão que Conta** — *escolha moral (do `ATO_1.md`, refeito)*
Mabel, a herbalista, esconde o irmão Aldric, que conta números de frente para a parede, como o Teddy.
Theodric, o mestre-copista, quer estudá-lo. A Senhora do Vale quer mandá-lo para além dos marcos (o exílio,
que em Yudur é a pena para quem traz desgraça). Proteger, entregar ao copista ou à Senhora.
- Rima com a porta com corrente da Martha.

**Y3 · A Estrada dos Marcos** — *viagem (Proposta)*
A primeira viagem de verdade do jogo. Seguir a estrada de pedras marcadas para fora do vale, até a torre do
Desperto, com Runáticos nos caminhos e o inverno chegando. A paisagem trabalha: o frio, a comida que acaba,
o vau que subiu. No caminho, a Muralha Velha, que ninguém de Yudur lembra quem levantou.
- O Desperto fala por enigmas porque vê demais (é lúcido, inofensivo, isolado: regra do DESIGN).

**Y4 · O Registro do Amanhã** — *cerco e comunidade (Proposta)*
A Pedra da Lei, onde os copistas gravam nascimentos, dívidas e mortes, amanhece com nomes de mortos que ainda
estão vivos, com a data da lua seguinte. Yudur se divide: os que querem apagar a Pedra, os que querem obedecer a
ela, os que querem fugir. Runáticos rondam a paliçada. Proteger o vale durante as noites até a data.
- Rima com a carta do Harold e a confissão do amanhã: em todo tempo, chegam registros do futuro.

**Y5 · A Câmara sob a Pedra** — *descida (do `ATO_1.md`, "A Cripta da Tabula", refeito)*
Embaixo da Pedra há uma câmara que os copistas mantêm fechada. Lá dentro, as runas se reorganizam e mostram a
contagem, a rua molhada de Port Halden e um corredor de metal. O jogador entende, pela primeira vez sem dúvida,
que não está em outro mundo: está em outro **tempo**. Salto para a Domus.

**Z1 · Turno 412** — *retorno (do `ATO_1.md`)*
De volta à Domus, onde tudo começou. Mas o jogador agora sabe de Port Halden e de Yudur. A nave não está como ele
deixou: passou tempo, gente mudou de lugar, a hidroponia cresce em espiral. O técnico Oren Vasko não dorme.
Aparecem os mobs do Z (forma e nome: o autor decide).

**As três da Domus (qualquer ordem)**

**Z2 · Os Pacotes da Base** — *o preço do tempo (Proposta)*
As mensagens da base, que chegavam uma por dia, começam a chegar mais rápido. Dez por hora. Depois anos de
transmissões num minuto. O jogador lê, na ordem, a base desistir da Domus, a homenagem aos mortos que ainda
estão vivos, o mundo de fora seguindo sem eles. A Comandante Arasaki manda apagar. A operadora de comunicações
guarda. É a missão Interestelar do jogo: a física cobrando em gente. Ciência: ver `LUGARES.md`, Domus.

**Z3 · A Contagem da DOMUS** — *investigar ou obedecer (do `ATO_1.md`)*
A IA faz uma contagem que ninguém programou e responde com educação que "está dentro dos parâmetros". A tripulação
se divide entre a Comandante e quem quer abrir os registros. Conversa, pressão, motim pequeno. O jogador fica com
a DOMUS frente a frente, num terminal, e ela é **gentil e literal**.

**Z4 · O Casco** — *atividade fora da nave (Proposta)*
Algo bate no casco, três curtos e um longo. Sair em traje, preso a um cabo, e ver com os próprios olhos o céu que
a tripulação só via por instrumento: a luz de fora chegando toda junta. A missão mais silenciosa do jogo.
- Rima com o telhado do Edifício Aurora (o pacote do Marcus) e com o vau de Yudur (atravessar o que não se deve).

**Z5 · O Horizonte** — *clímax e primeiro final*
O observatório lacrado. A estrela que observa, que não observa nada (é luz, não olho). A decisão sobre a Domus.
**Primeiro final**, com quadros de Port Halden, Yudur e Domus pelo que o jogador fez nos três tempos.
O que exatamente se decide depende do que a IA quer (Em aberto). Por isso Z5 fica para o fim da escrita.

**Pós-jogo · O Lime** (2 missões + segundo final)
O tempo vira lugar. A origem (0,0,0). Gente de épocas diferentes lado a lado. A IA, que durou até ali. Os fios
pessoais terminam. Segundo final.

### 5.3 Fios que atravessam as 17
- **A Contagem** (Teddy, Aldric, a DOMUS): X1 → X5, Y2, Z3.
- **O registro do amanhã** (carta do Harold, confissão do amanhã, a Pedra, os pacotes da base): o futuro escreve
  para o passado. Prólogo → Y4 → Z2.
- **21h47** e **três curtos, um longo**: em todo eixo.
- **A escolha grande** (X3) volta em X5, Y1 (a canção), Z2 (a base sabe? ninguém sabe) e nos quadros finais.
- **A misericórdia que volta** (Proposta): um Riscador poupado no Prólogo, um Runático acolhido em Yudur.
  No Z5 isso abre uma saída que não existe para quem nunca poupou ninguém.

### 5.4 Três relógios para três tempos (Proposta)
Cada eixo mede o tempo de um jeito. Isso reforça que são tempos, sem ninguém precisar dizer.
| Eixo | O relógio | Escala |
|---|---|---|
| X | as horas até o toque de recolher; a Contagem até sexta, 21h47 | horas |
| Y | as luas até a data na Pedra; o inverno | dias e estações |
| Z | o contador de pacotes da base, cada vez mais rápido | anos de fora por minuto de dentro |

### 5.5 Secundárias: quantas e de onde
- **Por região-base**: 8 a 10. As do `ATO_1.md` (seção 4) servem de banco: reescrever as do Y sem religião
  (sem "Ordem", "herege", "fogueira", "mosteiro", "Abade", "Irmã"; ver `PERSONAGENS.md`, Yudur).
- **Ecos**: 3 a 4 por eixo + 1 por personagem em cada eixo que não é o dele.
- **Linhas de grupo** (à moda de Daggerfall): 3 a 5 missões em sequência com a rede da Ouvinte (X),
  os copistas (Y), a facção da tripulação que o jogador apoiar (Z).
- **Lugares sem missão**: pelo menos 3 por região-base.

---

## 6. Antes de escrever uma missão (checklist)
- [ ] Quem quer o quê? (um NPC, uma vontade pequena e concreta)
- [ ] Qual é a forma? (não repetir a da missão anterior)
- [ ] Três saídas: força, conversa, esperta. Uma delas usa algo trazido de outro lugar ou de um Eco.
- [ ] Começa na rotina. O estranho entra no tamanho certo.
- [ ] Que documento ou boato conta o mundo por fora?
- [ ] Que consequência volta depois, e onde?
- [ ] Que rima com outro eixo?
- [ ] O relógio deste eixo anda?
- [ ] Passou pelo `editor-de-texto` e pelo `guardiao-da-lore`? Rodou `node ferramentas/testar.js`?

## 7. Perguntas para o autor
1. A estrutura de 17 (intro Z + 6 X + 5 Y + 5 Z) e o Lime como pós-jogo: segue?
2. Os Ecos: pode montar 2 Vislumbres e 1 Eco para o primeiro teste?
3. A escolha grande do X (a lista da Contenção no X3): serve?
4. As tendências dos 9 (herói, anti-herói, vilão): `PERSONAGENS.md` traz um ponto de virada para cada um,
   escrito para funcionar com qualquer tendência. Quem é quem?
5. O que a IA quer (avisar, chamar, ambíguo)? Isso decide o Z5.
