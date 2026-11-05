# KOSMOS — Documento de design

Decisões tomadas até agora. A lore completa está em `Explicacao Completa Rpg Convergencia Cosmica.docx`;
este arquivo guarda **como o jogo funciona** e o que já foi decidido.

---

## 1. Princípios

- **Cada eixo funciona sozinho.** Urbano, Medieval e Espacial precisam ser jogos completos por si só.
  As mecânicas servem aos três mundos.
- **A trama principal puxa forte.** Os três mundos levam ao mesmo ponto: o Lime.
- **Sem mestre.** O jogo decide dificuldade, consequências e o que destrava. O mínimo possível de coisas abertas;
  quando o jogador escreve livremente, o jogo interpreta.
- **Aberto, mas com moldura.** O jogador explora, mas o destino de cada fase é fixo.
- **Camada de línguas opcional.** Quem não liga para línguas joga normalmente; quem gosta encontra profundidade.
- **Mesa = tela base do jogo.** Escolher quem joga, sozinho ou em grupo. (Funcionamento e estética: a definir pelo autor.)

## 2. Os três eixos

| | Eixo X — Urbano | Eixo Y — Medieval | Eixo Z — Espacial |
|---|---|---|---|
| Estética | mundo na **atualidade**; interface no tema verde original (concreto, fluorescente, radiação) | fantasia, tipo em aberto (low, high ou mistura) | interface **azul holográfica**; **cassette futurism só nos gadgets e nas telas deles** |
| Gênero | **sobrevivência** (uma noite em que a cidade enlouquece) | | |
| O fenômeno aparece como | radiação anômala, surtos | runas (nada religioso) | estrela que observa |
| Afetados | Ecoados / Despertos | Runáticos | Interfaces |
| Perdidos sem volta (mobs) | **Riscadores** | **Runáticos** | a definir |
| Lúcidos (veem os outros eixos) | a definir | **Despertos** | a definir |
| Língua | Código Urbano (matemático) | Yudur (runas) | Interface (relacional) |
| Classes | escolhidas na criação | escolhidas na criação | **pré-definidas: tripulação da nave** |

### Os que se perdem e os que despertam
- **Ressonância e Dissonância são nomes de regra**, não palavras do mundo: os nomes dentro da lore
  são os que as pessoas de cada eixo usariam.
- **Runáticos (Y) e Riscadores (X) são a mesma coisa: mobs.** Ecos de personagens com Dissonância tão
  alta que enlouqueceram sem volta. Os Riscadores riscam os códigos sem parar (paredes, chão, vidro);
  é o nome da rua. Não são uma facção.
- **Despertos (Y)** são o oposto: Ressonância alta a ponto de entender que existem os outros eixos.
  Isolam-se, têm ar de oráculo, cuidam das próprias coisas e são inofensivos.
- Os ecos só sabem dos outros mundos a partir de certo nível de Ressonância; a Dissonância também
  daria esse conhecimento, mas quem segue por ela enlouquece.

### Eixo Z — a nave Domus
- Os jogadores começam **dentro da nave Domus**, com classes pré-definidas (função na tripulação).
- A Domus está se aproximando do **Lime** sem que a tripulação saiba.
  É isso que causa a sensação de "a realidade observando o jogador".
- A aproximação afeta as pessoas **positivamente ou negativamente** (Ressonância / Dissonância).
- As runas e os códigos urbanos que os afetados escrevem são **pistas**: aproximam o jogador da verdade, sempre aos poucos.

### Eixo X — prólogo (ideia do autor)
- O caos urbano se instala aos poucos: noticiários, surtos "psicológicos", algo de radiação.
- Pessoas desorientadas caminham numa só direção; quanto mais perto do "olho do furacão", mais afetadas.
- No centro: radiação alta, multidão aglomerada. Um rádio toca *Every Breath You Take* (só na primeira vez;
  se o jogador estiver sem som, pedir para ligar). A multidão canta o refrão em loop; a música para;
  os afetados atacam. **Ponto de salto** para o Eixo Y. Fim do prólogo.
- Serve de tutorial de Ressonância/Dissonância (Testes de Convergência com intensidade crescente).
- ⚠️ A música é comercial: tocar pelo player do YouTube serve para jogar entre amigos; para publicar, precisa de licença
  ou de uma faixa própria.

### Prólogos
- Cada eixo tem seu prólogo, **pensado isoladamente**, terminando num salto para outro eixo.
- O eixo seguinte começa **no meio da ação** (não é um segundo prólogo): é o Ato 1, já na fase de Padrões.
- Escritos/por escrever pelo autor: Urbano (ideia pronta), Medieval (pronto), Espacial (a escrever).

### Estrutura simplificada (decisão do autor, 03/11/2026)
- O jogo **começa com uma história de contextualização no Eixo Z** (a Domus), depois vem o
  **Prólogo no Eixo X** (Port Halden). Os eixos **Y e Z só se liberam mais tarde**; o **Z é o Endgame**.
- Os 9 personagens ficam, e cada um tem uma **tendência**: herói, anti-herói ou vilão. Ainda não
  está definido quem é quem, nem se a tendência aparece para o jogador.
- Consequência: por enquanto só o Urbano precisa de origens (as 9 de `origens-x.js`). Origens do
  Medieval e do Espacial ficam para quando esses eixos abrirem.

### Personagens e prólogos (modelo "Dragon Age: Origins")
- **9 personagens prontos**, 3 por classe (Tank, Healer, Support). A criação própria está desligada por enquanto.
- **3 prólogos, um por mundo**, cada um com **9 origens curtas** (a abertura de cada personagem
  naquele mundo, no ponto de entrada da profissão dele). São 3 corpos de prólogo + 27 origens.
- A história principal é uma só. O que faz cada personagem ser o protagonista:
  a origem, o **fio pessoal** (uma linha no Diário que rende nos atos seguintes, como as missões
  de companheiro), as reações dos NPCs e o final próprio no epílogo.
- Urbano pronto: `site/js/missoes/origens-x.js` (os 9 fios de Port Halden: o fogo da Delancey St.,
  o parceiro que foi embora, a entrega para si mesmo, o menino do leito 9, a confissão do amanhã,
  a carta do Harold, os números que ninguém quis ouvir, a ligação da linha 3, o passageiro da Linha 9).

## 3. O Lime e o fim do jogo

- O **Lime é um lugar físico** onde os três mundos se encontram.
- Lá existem pessoas dos três mundos, com **combinações dos três**: alguém que lê runas, usa espada e viaja no espaço;
  um homem moderno com armadura de paladino; todas as misturas possíveis.
- **Fim do jogo e rejogabilidade:** no final, o jogador escolhe **um dos três mundos para focar**.
- Finais possíveis (da lore): impedir a convergência, aceitá-la, controlá-la, destruir a estrela, tornar-se Interface.

## 4. Mecânicas (já no site)

- **Ficha única traduzida nos 3 eixos.** O personagem existe nos três mundos sem saber; eixos ocultos se revelam
  por Memória Cruzada (Ressonância 10).
- **Atributos:** Corpo / Mente / Essência (Força·Corpo·Físico / Mente / Espírito·Mana·Sintonia), 4 pontos iniciais.
- **Dados:** parada de d6 = atributo + 1. Cada 5–6 é sucesso; cada 1 é um **sinal ◉** (+1 exposição).
- **Situações:** o jogo define a dificuldade e mostra a chance real do personagem ("Médio para Charles · 54%").
- **Traços:** lista fechada, cada um com +1 numa situação e −1 em outra.
- **Habilidades e equipamentos:** catálogo com custo, peso e usos; tudo existe nos 3 mundos com outro nome.
- **Ressonância / Dissonância:** marcas a cada 5 pontos mudam os dados e as opções; 30 = fim de jogo.
- **Travessia** (decisão do autor, 05/11/2026): missão em outro eixo, liberada tarde no jogo. Custa Ressonância, que
  vira Dissonância; é para isso que serve a Ressonância ganha nos dados. Detalhes em `NARRATIVA.md`, seção 4.
- **Teste de Convergência:** usa a Essência; passou → Ressonância, falhou → Dissonância; exposição sobe sempre.
- **Runas como cartas** (Eixo Y): começam viradas; a classe e a Mente decidem quantas.

## 5. Línguas

- **Lógica própria em cada eixo**, simples para quem joga e rica para quem gosta.
- **Yudur (Y):** 25 runas-imagem do Futhark; palavras de 1 a 3 runas, a primeira diz o que é, as outras como é
  (kennings: ᛗᚷᚠ rei = humano que dá riqueza). Só palavras que fazem sentido num mundo medieval de fantasia.
  438 palavras feitas à mão + ~98 mil geradas (5 idiomas). Alfabeto pela classe: Oráculo todas, Paladino metade,
  Cavaleiro pela Mente. Palavras compostas são aprendidas jogando.
- **Código Urbano (X):** fórmula matemática em construto ("casa de doentes" = Λ(Δ(ψσ))). *A refazer com lógica própria.*
  Base proposta pelo autor (`elementos_da_linguagem_matematica.pdf`): linguagem matemático-semântica em que
  símbolos funcionam como palavras e conectivos, com predicados:
  `= é/significa · + e/junto com · ∈ pertence a · ∀ todo · ∃ existe · ⇒ implica/então · ∧ e · ¬ não ·
  → transforma-se em · ∑ conjunto/soma`.
  Exemplo: `∀ p ∈ PESSOAS : DOENTE(p) ⇒ ACOLHE(HOSPITAL, p)` = "toda pessoa doente é acolhida pelo hospital".
  Cada expressão deve ter uma tradução definida (sem ambiguidade).
- **Interface (Z):** relações entre núcleos, estados embaixo. *A refazer com lógica própria.*
- Qualquer palavra real tem tradução; nomes e palavras sem sentido no mundo são escritos letra a letra.

## 6. Em aberto

- Tipo de fantasia do Eixo Y (low, high ou mistura): fica em aberto por enquanto.
- Prólogo do Eixo Z (autor vai escrever) e texto do prólogo Medieval (autor tem).
- Funcionamento e estética da Mesa.
- Como se aprendem palavras e símbolos durante o jogo.
- Modo de cenas (opções prontas + resposta livre interpretada).
