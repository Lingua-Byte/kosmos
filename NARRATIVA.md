# KOSMOS — Bíblia narrativa: estrutura e missões

Como o KOSMOS conta a sua história: o que aprender com os RPGs de referência, a ordem dos eixos,
as missões fora do eixo (Travessias) e o arco das 17 missões principais.
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
  Em Port Halden isso é a KPHN e a rádio pirata; em Yudur (Proposta), a pregoeira e as canções; na Domus (Proposta), o
  mural de recados do refeitório.
- **Terminais e papéis.** A tragédia contada por quem não sabia que era tragédia: pedido de material,
  e-mail de colega, escala de plantão, e então os registros param.
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
Usar para **subir o nível**, sobretudo no Eixo Y, nunca para imitar. Não há personagens não humanos no KOSMOS
(decisão do autor).
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

Fallout 3 tem por volta de 17 missões principais e parece não ter fim, pelo que cada missão faz.

1. **A principal é um guia de viagem.** Cada missão manda o jogador para uma região nova e o obriga a atravessar
   outras. No caminho, ele tropeça em pessoas com problemas.
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
    mundo tem desenho. No KOSMOS as rimas são entre eixos (a porta com corrente da Martha; na proposta do Y, a parede do Aldric).

**A conta que importa:** 17 principais + umas 8 a 10 secundárias por região-base + 3 a 4 Travessias por eixo +
o fio de cada personagem. É isso que soa como "jogo grande".

---

## 3. Linear ou misturado?

### Recomendação: espinha linear, bordas misturadas (Proposta)

A **linha principal** segue a ordem que o autor já decidiu: **intro Z → X → Y → Z (endgame) → Lime (pós-jogo)**.
O **resto** (secundárias, Travessias, fios pessoais) se mistura entre os eixos.

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

**O que "linear" quer dizer aqui**
- Linear é a **ordem da linha principal**, não a ausência de saltos. Os saltos existem e são o fim de cada parte:
  Z0 → Prólogo X (o jogador cai no passado), X5 → Y1 (o trem), Y5 → Z1 (a câmara sob a Pedra).
- O próximo eixo abre quando acaba a **linha principal** do eixo atual (o clímax). Não é preciso fazer todas as
  secundárias: elas não trancam nada.
- Depois do salto, o eixo de antes **não fica livre**. Volta-se a ele por Travessia, pagando o preço (seção 4).
  Faz sentido na história, porque é o tempo que puxa o jogador para a frente, e não o jogador que escolhe.
  Também dá um motivo para fazer as secundárias antes do salto.
- Antes de o eixo abrir, ele só aparece em Vislumbres: cenas curtas escritas na própria missão, que não mudam a
  ordem da linha principal. A Travessia só é liberada tarde (seção 4).
- **Alternativa (para o autor pesar):** depois do salto, o eixo de antes continua livre, sem custo, como as regiões
  de Fallout. É mais confortável para quem quer completar tudo, mas tira o peso do salto e o sentido das Travessias
  para esse eixo.

**O que fica para trás**
- O ciclo X → Y → Z → X do `ATO_1.md` (uma missão de cada eixo, alternando). Vale como banco de ideias, não como
  ordem. As missões dele foram reaproveitadas na seção 5.
- A ideia de o jogador escolher em que eixo começar. Com a estrutura decidida (intro Z → Prólogo X), o começo é fixo.
  O replay muda o personagem (9 origens), não o eixo.

---

## 4. Travessias: missões de outro eixo, com custo (aprovada pelo autor; os detalhes são para testar)

> Nome provisório. "Eco" ficou de fora porque responderia a pergunta em aberto "ancestrais ou ecos?" e se
> confundiria com "Ecoado", nome de regra que já existe no jogo (`site/js/data.js`).

### 4.1 A ideia em uma frase
O jogador acha em seu eixo uma **âncora** (uma coisa que existe nos dois tempos) e pode gastar Ressonância,
que vira Dissonância, para viver por pouco tempo a vida da sua versão em outro eixo.

### 4.2 Por que combina com a lore
- **Só informação atravessa** (Para considerar, aba História, "Quem fala do Lime": lá isso vale para a IA; aqui a
  proposta estende ao jogador). Então de uma Travessia **não se traz objeto**:
  traz-se o que se sabe. Pista, palavra de runa, uma marca no personagem, um nome. Isso resolve o equilíbrio
  sozinho: ninguém volta do Y com uma espada para o X.
- **O personagem existe nos três tempos** (DESIGN, "Ficha única traduzida nos 3 eixos"). A Travessia mostra o que a
  versão dele daquele tempo estava vivendo. Se ela é parente ou só tem o mesmo padrão, o jogo não diz.
- **Ver mais custa.** Quem sabe demais dos outros eixos ou desperta ou se perde. O preço é a Ressonância do
  próprio personagem, não uma moeda inventada.

### 4.3 Decisões do autor (Decidido)
- **A Travessia é liberada tarde no jogo.** Não existe no começo.
- **O preço é Ressonância, que vira Dissonância.** Quem atravessa gasta pontos de Ressonância, e os pontos gastos
  passam para a Dissonância.
- **Isso explica para que serve ganhar Ressonância nos dados.** A Ressonância que vem dos Testes de Convergência
  é o que se gasta para atravessar. Cada Travessia empurra o personagem para o lado da loucura.

### 4.4 Quando se libera (Proposta)
- **No Eixo Y, depois do primeiro salto grande (X5 → Y1).** O jogador acabou de ser arrastado de um tempo para
  outro sem querer. É a hora de aprender a fazer isso por vontade própria.
- **Por personagem, a partir da Memória Cruzada (Ressonância 10).** A regra já existe: na Ressonância 10, um eixo
  oculto se revela na ficha. Só quem "lembra de uma vida que não viveu" consegue voltar a ela. A memória fica na ficha,
  mesmo que a Ressonância caia depois de pagar.
- **Destinos:** só os eixos que a linha principal já abriu. No Y, só se atravessa para o X (é o jeito de voltar a
  Port Halden). No Z, para o X e o Y.
- **Antes disso, só Vislumbres.** São cenas curtas e escritas na própria missão (1 a 3 telas, como o salto do
  Prólogo). O jogador não escolhe quando acontecem, não paga nada e não controla a cena. Servem de trailer e plantam
  pistas. Não são Travessia.

### 4.5 Âncoras
- **Âncora**: um objeto, lugar ou pessoa que rima com outro eixo. O terço riscado do padre Michael, o crachá do Homem
  de Terno, a fita "Parte 2", a parede do Teddy. Achar a âncora marca no Diário: *Travessia disponível (X)*.
- **Fio pessoal**: cada um dos 9 tem **1 Travessia por eixo** ligada ao próprio fio (ver `PERSONAGENS.md`).
  O fogo do Frank em 1987 rima com um fogo em Yudur e com um alarme de incêndio na Domus.
- Tamanho: 2 a 5 cenas, uma missão secundária de verdade, jogada normalmente.

### 4.6 O preço, em números (Proposta, para testar)
| | Custo |
|---|---|
| Travessia curta (2 ou 3 cenas) | 2 de Ressonância → +2 de Dissonância |
| Travessia longa (4 ou 5 cenas) | 3 de Ressonância → +3 de Dissonância |
| A partir da 3ª Travessia no mesmo eixo | +1 no custo (ajuste do designer, seção 4.7) |

- **Sem Ressonância suficiente, não se atravessa.** A âncora fica no Diário, esperando.
- **O relógio anda.** O tempo do eixo de onde se sai passa enquanto se está fora.
- **As marcas pesam dos dois lados.** Gastar pode fazer a Ressonância cair abaixo de uma marca (perde o efeito dela) e
  a Dissonância passar de uma marca (ganha o efeito ruim). O jogo mostra isso antes de o jogador confirmar:
  *"Atravessar: Ressonância 12 → 9 · Dissonância 4 → 7."*
- **Volta com marca:** se a Dissonância cruzar uma marca (5, 10, 15...) na Travessia, o personagem volta com um traço
  temporário até o fim da missão (ex.: "conta em voz baixa", −1 em conversas). Não tira vida; atrapalha.
- **O ciclo:** ganhar Ressonância nos testes → gastar na Travessia → a Dissonância sobe → o personagem precisa voltar
  a ganhar Ressonância para atravessar de novo, já mais perto da loucura.

**Por que a Ressonância vira Dissonância (Proposta, para a lore):** a Ressonância é o personagem afinado com a
própria versão de outro tempo. Atravessar à força gasta essa afinação, e o que sobra é ruído: as duas vidas
misturadas sem ordem. É o mesmo caminho dos Riscadores e Runáticos, só que mais devagar e por escolha.

### 4.7 Ressonância e Dissonância: o que ganham e o que custam (parte aplicada no jogo, parte proposta)

> **Situação (designer de mecânicas, com permissão do autor):** as marcas novas, o mínimo de 2 dados na
> Convergência, a Ressonância parando no 29 e os furos 1 a 4 abaixo estão **aplicados no jogo**. A troca
> (Ressonância por menos Dissonância) e a Travessia **continuam proposta**: dependem das próximas missões.
**Decidido pelo autor:** a partir de certo ponto de Ressonância, o jogador pode gastá-la para baixar a Dissonância.
Guardar Ressonância precisa dar um benefício claro, e acumular Dissonância, um malefício claro.
A troca ainda **não tem nome** (opções do designer: *Aquietar*, *Recolher-se*, *Firmar*; nenhuma adotada).

**O problema das marcas de hoje** (`site/js/data.js`):
- A Ressonância 15 (Atração) castiga quem guarda. A Tess fica sem saída: com 1 dado, ela não consegue os 2 sucessos.
- A Dissonância 5 (Adrenalina) dá um dado a mais no Corpo. Ninguém quer baixar o que ajuda.
- A Dissonância 20 (Perda de Controle) vira bola de neve: depois dela, o Colapso é quase certo.
- Nada impede chegar a 30 por acidente. O Padre Michael chega à Integração em 8 de cada 10 partidas.

**Marcas da Ressonância** (Aplicado no jogo, `site/js/data.js`; cada marca é um ganho, o perigo só começa no 25)
| Marca | Nome | Efeito |
|---|---|---|
| 5 | Percepção Cruzada | +1 dado em Mente (como hoje) |
| 10 | Memória Cruzada | revela um eixo (como antes); libera a Travessia (proposta) |
| 15 | Pressentimento (novo) | 1 vez por missão, rola de novo um teste comum que falhou (aplicado); libera a troca (proposta) |
| 20 | Lucidez | +1 dado em Mente e em Essência (como hoje) |
| 25 | Atração (veio do 15) | a Convergência pede 2 sucessos; −1 dado no Corpo (era −2) |
| 29 | Beira (novo) | a Ressonância para aqui; o 30 só vem por escolha, numa cena (a cena ainda não existe) |
| 30 | Integração | fim de jogo (como hoje) |

**Marcas da Dissonância** (Aplicado no jogo; cada marca é um malefício, e piora aos poucos)
| Marca | Nome | Efeito |
|---|---|---|
| 5 | Inquietação (no lugar da Adrenalina) | −1 dado para convencer e acalmar |
| 10 | Fissura | −1 dado em Mente (como hoje) |
| 15 | Paranoia | habilidades de conversa bloqueadas (como hoje) |
| 20 | Ruído (novo) | −1 dado em Essência, inclusive na Convergência |
| 25 | Perda de Controle (veio do 20, mais branda) | cada ◉ só no Teste de Convergência soma +1 |
| 30 | Colapso | fim de jogo (como hoje) |

**A troca** (Proposta, ainda não está no jogo)
- A partir da Ressonância **15**. Gastam-se 2 de Ressonância para baixar 1 de Dissonância.
- No máximo 3 de Dissonância por descanso, e só em descanso.
- Por que a partir de 15, e não de 20: quem mais precisa da troca (Frank, Rosa e Eli) raramente chega a 20 sem gastar
  antes. E no 15 a escolha dói, porque trocar pode custar o Pressentimento.

**A Travessia, ajustada** (Proposta, ainda não está no jogo)
- Liberada depois do Y1, com Ressonância 10. Curta custa 2, longa custa 3.
- O custo sobe +1 só a partir da 3ª Travessia no mesmo eixo.
- São 7 no total: 4 para o X e 3 para o Y.
- Ninguém atravessa se a Dissonância ficar em 20 ou mais depois de pagar. Na tela: "A âncora não responde."
- O Teste de Convergência rola no mínimo 2 dados (resolve a Tess). **Aplicado no jogo.**

**Exemplo, passo a passo.** O Ray está numa lareira, entre o Y2 e o Y3, com **Ressonância 17 e Dissonância 11**.
Tem o Pressentimento (15) e sofre de Inquietação (5) e Fissura (10). Achou uma âncora: uma Travessia curta para Port
Halden, que custa 2.
1. **Guardar.** Mantém o Pressentimento e se aproxima da Lucidez (20). Segue com −1 em conversa e −1 em Mente.
2. **Atravessar.** Fica com Ressonância 15 e Dissonância 13. Ganha uma pista para o X5 e mantém o Pressentimento, mas
   fica a 2 pontos da Paranoia.
3. **Trocar.** Gasta 4 de Ressonância e baixa 2 de Dissonância: fica com 13 e 9. Perde o Pressentimento, sai da
   Fissura, volta a pensar direito. Não ganha história.
No Y3 ele falha numa Convergência de intensidade 2 (+2 de Dissonância). Quem trocou volta a 11, e a Fissura volta.
Quem atravessou vai a 15 e perde as conversas. Cada caminho tem um preço, e o jogador o vê antes de pagar.

**A simulação** (4.000 partidas por personagem e por perfil, nas 17 missões; as missões do X2 em diante ainda não
existem, então as Convergências delas são supostas)
| Cenário | Chega a 10 no começo do Y | Colapso: apressado / curioso / completo / cauteloso | Integração sem querer |
|---|---|---|---|
| Regras de hoje, com os números antigos desta seção | 86% | 39% / 71% / 98% / 35% | 14% (Michael 84%) |
| Marcas novas, troca a partir de 15 e Travessia ajustada | 89% | 2% / 7% / 18% / 0% | 0% |
| O mesmo, mais −3 de Dissonância a cada salto entre eixos | 89% | 0% / 2% / 8% / 0% | 0% |

**Quanto cada missão deve dar (guia para o Criador)**
- X2 e X3: 1 Convergência obrigatória de intensidade 2, mais 1 opcional de 1.
- X4: 1 obrigatória de 1, mais 1 opcional de 2.
- X5: 2 obrigatórias (1 e 2), mais 1 opcional de 2.
- Y2 a Y4: 1 obrigatória de 1, mais 1 opcional de 2. Y5: 2 obrigatórias (1 e 3).
- Z1 a Z4: 1 obrigatória de 2, mais 1 opcional de 2 ou 3. Z5: 2 obrigatórias (2 e 3).
- Fora da Convergência, no máximo 1 ou 2 opções por missão com "+1 de Dissonância se falhar". O Prólogo tem 14.

**Furos que o designer achou** (estado em novembro de 2026)
1. **Corrigido (Aplicado no jogo).** Na ficha, o Teste de Convergência e as rolagens de atributo viraram **ensaio**:
   mostram a chance e os dados, mas não gastam nada e não marcam nada. As barras de Ressonância e Dissonância da
   ficha ficaram só de leitura. Os pontos só vêm das missões.
2. **Corrigido (Aplicado no jogo).** "Dormir" (e qualquer ação que se repete) baixa a Dissonância **1 vez por missão**;
   nas outras vezes tira só o cansaço, e a tela avisa. A Foto da Família agora tem 3 usos que acabam (ver 4.7.1).
   Os botões "Nova cena" e "Nova sessão" saíram da ficha: as habilidades por cena voltam sozinhas a cada cena da
   história ou troca de lugar, e as por missão no começo de cada missão.
3. **Corrigido (Aplicado no jogo).** Ressonância e Dissonância ficam entre 0 e 30 em todo lugar (dados, escolhas das
   missões, pertences, ficha e o teste de storylets da Oficina). A Ressonância que se ganha para no 29 (Beira).
4. **Corrigido (Aplicado no jogo).** Calmantes (nos três eixos) baixam a Dissonância no máximo **2 vezes por
   missão**; o abalo passa sempre.
5. Para o guardião da lore: a tela de dados dizia "sinal ◉ da Entidade". **Trocado** por "sinal ◉". Ainda há
   "Entidade" em textos de `data.js` (descrição do Eixo X e comentários), que são do autor.

#### 4.7.1 Itens: usos que acabam (Aplicado no jogo; decisão do autor, números do designer)
**A regra, para o jogador:** cada item tem um número de usos. Gastar um uso dá o dado do item num teste (o jogador
escolhe, na janela dos dados) ou faz a ação dele. Os usos não voltam sozinhos.

| Item (X / Y / Z) | Usos | Ao zerar | Como recupera |
|---|---|---|---|
| Lanterna / Tocha / Holofote | 5 | fica apagada | bateria (pertence), tomada na missão, ou outra |
| Smartphone / Corvo / Comunicador | 6 | fica sem carga | bateria, tomada, ou outro |
| Contador Geiger / Pêndulo / Sensor | 4 | fica sem carga | bateria, tomada, ou outro |
| Carro / Cavalo / Módulo | 6 | fica parado | achar outro na missão (ex.: gasolina = `item: veiculo`) |
| Colete / Cota de Malha / Traje | 4 | fica danificado | achar ou comprar outro |
| Pistola / Adaga / Pistola de Pulso | 4 | fica sem munição | achar outra |
| Espingarda / Espada Longa / Rifle | 3 | fica sem munição | achar outra |
| Kit de Ferramentas / Gazuas / Multiferramenta | 5 | fica gasto | achar ou comprar outro |
| Kit de Primeiros Socorros / Ervas / Injetor | 3 | **some** (consumível) | comprar ou achar outro |
| Foto da Família / Relíquia / Holograma | 3 | fica, sem efeito | achar outro objeto pessoal |

- **Ganhar de novo um item que já se tem enche os usos dele** (um de cada por personagem). Isso vale para compra e
  para o efeito "ganha equipamento" do Criador, que continua igual (`item: "luz"`).
- **Item zerado não serve como requisito:** a escolha "Descer com a lanterna" trava com a lanterna apagada, e a
  alternativa "Descer no escuro" aparece. O carro sem combustível não encurta a viagem. As escolhas que pedem o item
  **não gastam** uso; só o dado e a ação gastam. Assim o jogador decide: gastar a lanterna nos testes ou guardar.
- **Bateria portátil / Óleo de lamparina / Célula de energia** enche lanterna, celular e medidor de uma vez.
- **Equipamento inicial:** cada um dos 9 prontos começa com o seu conjunto, cheio. O personagem criado escolhe o seu na
  criação; depois da primeira missão, a ficha não deixa mais trocar (itens se acham e se compram jogando).
- **Saves antigos:** o personagem com `itens: ["luz", ...]` e `usos: {}` abre com todos os itens cheios; os usos
  antigos por cena ou sessão dos itens são descartados. Na ficha, o personagem guarda `cargas: { luz: 5, ... }`.
- **Itens exclusivos de um personagem:** proposta, ainda não estão no jogo (ver o relatório do designer). Quando
  entrarem, o campo será `exclusivo: "<id do pronto>"` no item de `data.js`, e a missão de origem o entrega com o
  efeito "ganha equipamento" de sempre.

**Simulação (Prólogo + X1, 4.000 partidas por personagem, jogador cuidadoso).** Suposto: 10 testes no Prólogo e 8 no
X1, sorteados pela frequência das situações nas missões publicadas; Convergências de intensidade 1, 2 e 3 no Prólogo
e 2 no X1; 4 e 2 escolhas com "+1 de Dissonância se falhar"; nenhuma bateria comprada.
| | Dissonância média no fim do X1 | Pior caso | Chega a 10 |
|---|---|---|---|
| Regras antigas (dormir 2 a 3 vezes, Foto renovando) | 0,0 a 2,4 | 9 | 0% |
| Regras novas | 0,7 (Michael) a 5,5 (Frank, Rosa) | 12 | até 6% |
Itens: o celular e a lanterna são os que mais acabam (convencer, acalmar e investigar são os testes mais comuns);
quem gasta sempre termina o X1 com o celular em 0 ou 1 e a lanterna em 0. Quem só gasta quando a chance é baixa
guarda a lanterna inteira. O carro, o kit e as ferramentas quase não se gastam nessas duas missões.

### 4.8 Limites (para não chegar a 30 sem querer)
Ressonância 30 (Integração) e Dissonância 30 (Colapso) são fim de jogo.
- Quem faz **todas** as Travessias deve terminar o Z com a Dissonância alta, mas abaixo de 30 se jogar com cuidado.
  Quem não faz nenhuma precisa conseguir terminar o jogo.
- Nenhuma Travessia é obrigatória para terminar uma missão principal. Ela abre uma saída melhor, nunca a única.
- O que se traz de volta é só conhecimento (pistas, palavras de runa, marcas), nunca objeto.

### 4.9 Como testar
Antes de escrever muitas Travessias, montar **1 Travessia do Y para o X** e jogar com três perfis:
| Perfil | Faz | O que medir |
|---|---|---|
| Apressado | nenhuma Travessia | termina o Y sem travar? sente falta de alguma coisa? |
| Curioso | só as do próprio fio | as Travessias melhoram a história do personagem? o preço parece justo? |
| Completo | todas | onde chega a Dissonância no fim do Z? alguém passa perto de 30? |
| Cauteloso | algumas, e troca Ressonância por menos Dissonância sempre que pode | chega a 20 de Ressonância? a troca sobra ou falta? |

Perguntas para o teste: o jogador hesita antes de pagar, mas paga? Entende de onde vem a Ressonância que gasta?
Entende que não pode trazer objetos? Quem chega a 20 prefere trocar ou guardar?

Para o motor (quando for a hora): uma missão com `travessia: { eixo, ancora, custo }`, feita no Criador como
qualquer outra. A missão publicada continua com o mesmo formato (`Criador.exportar` ↔ `MissoesDados.adaptar`).

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
O jogador é um tripulante da Domus no dia 412 de viagem, um turno qualquer. Lista de verificação, refeitório, um colega reclamando do
café reciclado, a DOMUS lembrando um aniversário. O medidor do casco marca 0,3 acima do normal; a técnica de turno escreve "sensor sujo?" no mural e vai jantar. Às 21h47 de bordo, nada acontece, a não ser que o relógio da cabine pula um minuto. O jogador vai
dormir. Corte para Port Halden.
- Curta: 6 a 10 telas. Serve para o jogador conhecer a voz da DOMUS **como sistema comum** (decidido em História).
- Planta: o ritmo de três curtos e um longo (um alarme de teste), o dia 412 (o mesmo número do livro do vigia
  Oswald, que fecha a conta dele na mesma semana em Port Halden), a palavra "Domus" num crachá.

**Prólogo X · A Noite** — *existe (`prologo-x`)*
Começa numa noite comum em Maple Heights e termina com metade do bairro na Praça Central, ouvindo uma música
que ninguém sabe de onde vem. Dali, o salto.

**X1 · A Manhã Seguinte** — *existe (`x1-manha`)*
Maple Heights acorda com a cerca da Contenção no fim da rua, sem luz, e com o Abe sem ter o que vender além de
água. Paga os fios do prólogo. Descobre a Contagem do Teddy: termina na
sexta, às 21h47. Abre o mapa e as três missões em paralelo.

**As três de Port Halden (qualquer ordem)**

**X2 · Frequência 94.7** — *escolta e fuga (do `ATO_1.md`)*
A Ouvinte teve de sair do telhado do Edifício Aurora e agora transmite de telhado em telhado; a Contenção a caça. As fitas dela têm datas que ainda não chegaram.
Quem chama o jogador é um rapaz da rede que precisa levar uma bateria de carro até o telhado onde a Ouvinte vai
transmitir, e não tem como subir sozinho. Salvar a Ouvinte ou as fitas, nem sempre as duas.
- Grupo: a rede da rádio pirata (gente que guarda pedaços da música).

**X3 · A Cerca** — *infiltração e a escolha grande (Proposta)*
Entrar no perímetro da Contenção, no Prédio Federal, terceiro subsolo, de onde saiu o e-mail de "C.".
Lá dentro estão os dados de Eli, o Arquivo de 1987 e uma lista de nomes com endereços de Port Halden: quem a
Contenção vai recolher na sexta.
- **A escolha grande do X**: o que fazer com a lista. Ler na KPHN para a cidade inteira (pânico, saques, mas
  muita gente foge a tempo); entregar à Defesa Civil (lento, burocrático, algumas famílias salvas; e a Contenção é uma diretoria da própria
  Defesa Civil, que nem o Agente Moore conhece); queimar
  (a Contenção não sabe que você sabe); usar para salvar só os seus (Martha, Teddy, Danny, Hollis).
  Volta no X5 (quem está na estação), no Y (a pregoeira canta o que você fez, com outros nomes) e nos quadros finais.
- Grupo: a Contenção. Tem gente que deixa passar (o guarda do X1, com o crachá).
- A lista é a versão completa da que o jogador já viu na prancheta do X1 (nomes, endereços, um número na casa dos três mil).

**X4 · 1987** — *investigação em documentos e conversa (Proposta)*
Em março de 1987, às 21h47, pegou fogo um prédio vazio na Delancey Street, a Estação Rua 9 apagou e um trem saiu
e não chegou. O jogador junta o que sobrou: o caderno do Joe Kessler, o livro de turnos do vigia Oswald (ele foi levado no X1; está no
terceiro andar do St. Luke's, com os afetados), o Walt Brody, que trabalhou trinta anos no metrô e viu a Estação
Rua 9 cheia em 87, e a página arrancada com o carimbo da Contenção. Em 87 disseram que foi vazamento de gás. Missão quase sem combate, com relógio curto (antes do toque de recolher).
- Descoberta: em 1987 tudo parou sozinho na mesma noite. Ninguém sabe por quê. (A causa fica para o Z.)
- Grupo: os velhos de Port Halden, que lembram e foram desmentidos.

**X5 · Estação Rua 9** — *sobrevivência total (do `ATO_1.md`)*
Sexta, 21h47. A Contagem chega a zero. O trem de 1987 chega. A Contenção quer fechar a estação com gente dentro.
Aqui, e só aqui, o X vira sobrevivência de verdade: sair vivo com quem der. Pela janela do trem passa uma encosta com neve e uma paliçada de madeira.
Salto para o Y. A partir daqui a linha principal está em Yudur.

**Y1 · Três Batidas e Uma Longa** — *perseguição (do `ATO_1.md`, sem religião)*
O jogador acorda na pele do eco, numa manhã de tarefa: buscar água, acertar uma talha com o vizinho. No meio da
conta, o sino toca, e a guarda vem na direção dele. Ele não sabe por quê.
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
O Theodric paga o jogador para copiar as runas da torre antes de o inverno fechar a estrada. É a primeira viagem
de verdade do jogo: Seguir a estrada de pedras marcadas para fora do vale, até a torre do
Desperto, com Runáticos nos caminhos e o inverno chegando. A paisagem trabalha: o frio, a comida que acaba,
o vau que subiu. No caminho, a Muralha Velha, que ninguém de Yudur lembra quem levantou.
- O Desperto é lúcido, inofensivo e isolado (regra do DESIGN). Fala simples e erra os tempos: pergunta quanto vai
  custar o pão no ano que vem como quem pergunta do ano passado.

**Y4 · O Registro do Amanhã** — *cerco e comunidade (Proposta)*
A Pedra da Lei, onde os copistas gravam nascimentos, dívidas e mortes, amanhece com nomes de mortos que ainda
estão vivos, com a data da lua seguinte. Yudur se divide, e cada lado tem rosto: o moleiro quer raspar a Pedra, a guarda quer
obedecer a ela, a Mabel quer fugir com o irmão. Runáticos rondam a paliçada. Proteger o vale durante as noites até a data.
- Rima com a carta do Harold e a confissão do amanhã: em todo tempo, chegam registros do futuro.

**Y5 · A Câmara sob a Pedra** — *descida (do `ATO_1.md`, "A Cripta da Tabula", refeito)*
Embaixo da Pedra há uma câmara que os copistas mantêm fechada. Lá dentro, as runas se reorganizam e mostram a
contagem, a rua molhada de Port Halden e um corredor de metal, gravados em pedra mais velha que o vale.
Daí em diante não dá mais para fingir que é outro mundo. Salto para a Domus.

**Z1 · O Turno Seguinte** — *retorno (Proposta; era "Turno 412" no `ATO_1.md`)*
O jogador acorda no beliche da Z0, com o café ainda na caneca. No mural, os recados são de semanas depois: passou tempo, gente mudou de lugar, a hidroponia cresce em espiral. O técnico Oren Vasko não dorme.
Aparecem os mobs do Z (forma e nome: o autor decide).

**As três da Domus (qualquer ordem)**

**Z2 · Os Pacotes da Base** — *o preço do tempo (Proposta)*
As mensagens da base, que chegavam uma por dia, começam a chegar mais rápido. Dez por hora. Depois anos de
transmissões num minuto. O jogador lê, na ordem, a base desistir da Domus, a placa que a base inaugura com os quarenta nomes da
tripulação, o mundo de fora seguindo sem eles. A Comandante Arasaki manda apagar. A operadora de comunicações
guarda, porque uma das mensagens é da mãe dela. Ciência: ver `LUGARES.md`, Domus.

**Z3 · A Contagem da DOMUS** — *investigar ou obedecer (do `ATO_1.md`)*
A IA faz uma contagem que ninguém programou, responde que "está dentro dos parâmetros" e se oferece para imprimir
os parâmetros. A tripulação se divide entre a Comandante e quem quer abrir os registros. Termina num motim pequeno:
seis pessoas trancadas na ponte, discutindo quem vai buscar a janta. O jogador fica com
a DOMUS frente a frente, num terminal, e ela é **gentil e literal**.

**Z4 · O Casco** — *atividade fora da nave (Proposta)*
O ruído dos tíquetes do setor 4 volta, três curtos e um longo, e agora ninguém pode fingir que é o casco
esfriando. Sair em traje, preso a um cabo, e ver com os próprios olhos o céu que
a tripulação só via por instrumento: a luz de fora chegando toda junta.
- Rima com o telhado do Edifício Aurora (o pacote do Marcus) e com o vau de Yudur (atravessar o que não se deve).

**Z5 · O Horizonte** — *clímax e primeiro final*
O observatório lacrado. A estrela que observa: o brilho da luz de fora, bem na frente da Proa. A decisão sobre a Domus.
**Primeiro final**, com quadros de Port Halden, Yudur e Domus pelo que o jogador fez nos três tempos.
O que exatamente se decide depende do que a IA quer (Em aberto). Por isso Z5 fica para o fim da escrita.

**Pós-jogo · O Lime** (2 missões + segundo final)
No Lime, os tempos viram lugares lado a lado, na origem (0,0,0). Gente de épocas diferentes lado a lado. A IA, que durou até ali. Os fios
pessoais terminam. Segundo final.

### 5.3 Fios que atravessam as 17
- **A Contagem** (Teddy, Aldric, a DOMUS): X1 → X5, Y2, Z3.
- **O registro do amanhã** (carta do Harold, confissão do amanhã, a Pedra, os pacotes da base): o futuro escreve
  para o passado. Prólogo → Y4 → Z2.
- **21h47** e **três curtos, um longo**: em todo eixo.
- **A escolha grande** (X3) volta em X5, Y1 (a canção), Z2 (a base sabe? ninguém sabe) e nos quadros finais.
- **A misericórdia que volta** (Proposta; o Prólogo ainda não tem a ação de poupar, precisa ser criada): um Riscador
  poupado no Prólogo, um Runático acolhido em Yudur.
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
- **Travessias**: 3 a 4 por eixo + 1 por personagem em cada eixo que não é o dele.
- **Linhas de grupo** (à moda de Daggerfall): 3 a 5 missões em sequência com a rede da Ouvinte (X),
  os copistas (Y), a facção da tripulação que o jogador apoiar (Z).
- **Lugares sem missão**: pelo menos 3 por região-base.

---

## 6. Antes de escrever uma missão (checklist)
- [ ] Quem quer o quê? (um NPC, uma vontade pequena e concreta)
- [ ] Qual é a forma? (não repetir a da missão anterior)
- [ ] Três saídas: força, conversa, esperta. Uma delas usa algo trazido de outro lugar ou de uma Travessia.
- [ ] Começa na rotina. O estranho entra no tamanho certo.
- [ ] Que documento ou boato conta o mundo por fora?
- [ ] Que consequência volta depois, e onde?
- [ ] Que rima com outro eixo?
- [ ] O relógio deste eixo anda?
- [ ] Passou pelo `editor-de-texto` e pelo `guardiao-da-lore`? Rodou `node ferramentas/testar.js`?

## 7. Perguntas para o autor
0. Port Halden fica onde ficava Yudur? (`LUGARES.md` 1.2) A) sim, e o lugar vira uma segunda causa do epicentro;
   B) só rima de paisagem, sem explicar nada (é o que o texto usa por enquanto); C) não.
1. A estrutura de 17 (intro Z + 6 X + 5 Y + 5 Z) e o Lime como pós-jogo: segue?
2. As Travessias: o nome serve? Liberar no Y, a partir da Memória Cruzada (Ressonância 10), serve? Pode montar
   1 Travessia do Y para o X para o primeiro teste?
3. A escolha grande do X (a lista da Contenção no X3): serve?
4. As tendências dos 9 (herói, anti-herói, vilão): `PERSONAGENS.md` traz um ponto de virada para cada um,
   escrito para funcionar com qualquer tendência. Quem é quem?
5. O que a IA quer (avisar, chamar, ambíguo)? Isso decide o Z5.
