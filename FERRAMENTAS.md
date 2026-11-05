# KOSMOS — Ferramentas gratuitas, mecânicas e IA

Plano para levar o KOSMOS de "RPG de texto" a "indie puxando para AAA" **sem gastar nada** até o lançamento.
Referências: Fallout 1 e 2, TES (Arena/Daggerfall), Neverwinter Nights. A ideia é pegar **mecânicas**, nunca copiar
nomes, arte ou conteúdo desses jogos.

> Regra de ouro: limites de planos gratuitos mudam. Antes de ligar qualquer serviço, conferir o limite do dia.
> Nenhuma chave de API vai no código do site (o site é público): chaves ficam num "porteiro" (ver §3.3).

---

## 1. O que o projeto já usa (e continua valendo)

| Para quê | Ferramenta | Custo |
|---|---|---|
| Site no ar | GitHub Pages | grátis |
| Conta e saves na nuvem | Supabase (`ferramentas/supabase.sql`, `js/conta.js`) | grátis até 50 mil usuários/mês |
| Apps Android e Windows | Capacitor + Electron, gerados no GitHub Actions | grátis |
| Falas breves (barks) | edge-tts (`ferramentas/gerar_barks.py`) | grátis* |
| Narrador neural | Piper no navegador (`js/narrador.js`) | grátis |
| Dados da Oficina/Criador | repositório privado do GitHub (`js/nuvem.js`) | grátis |
| Desenvolvimento | Claude Code (plano que o autor já tem) | já pago |

\* edge-tts usa um serviço da Microsoft de forma não oficial. Para jogar entre amigos, tudo bem; **para vender**,
trocar por Piper (ver a licença de cada voz) ou por vozes gravadas por gente.

---

## 2. Ferramentas gratuitas por área

### 2.1 Visual 2.5D (o "jeito Fallout")
Fallout 1 e 2 eram **modelos 3D renderizados em imagem**, vistos em perspectiva isométrica. Dá para fazer igual, de graça:

- **Blender** — modelar cenários e personagens simples e renderizar com câmera isométrica fixa → vira PNG/sprite.
  É o caminho mais "AAA barato": uma cena modelada gera dezenas de imagens (dia, noite, destruída).
- **Krita** (pintura), **GIMP** (edição), **Inkscape** (vetor; o jogo já desenha mapas em SVG).
- **LibreSprite** ou **Piskel** — pixel art (alternativas grátis ao Aseprite).
- **Tiled** — editor de mapas em grade, com modo isométrico; exporta JSON que o jogo lê.
- **PixiJS** (biblioteca JS, grátis) — desenhar os mapas e cenas 2.5D no navegador com luz, fumaça, chuva,
  partículas de radiação. Combina com o site atual (JS puro), sem trocar de motor.

**Bancos de arte gratuitos (conferir a licença de cada um):**
Kenney.nl (CC0), Quaternius (modelos 3D CC0), Poly Haven (texturas e luz CC0), OpenGameArt, itch.io (filtro "free"),
Mixamo (animações 3D grátis com conta Adobe).

### 2.2 Som e música
- **Audacity** (editar áudio), **LMMS** ou **Bosca Ceoil** (compor), **jsfxr** (efeitos retrô no navegador).
- **Freesound.org** (efeitos; ver CC0 / CC-BY), **FreePD** (músicas de domínio público).
- Ambiente em camadas no próprio jogo (Web Audio): vento, sirene distante, rádio chiando — muda com a tensão da cena.

### 2.3 Narrativa
- O **Criador** (`diagramas.html`) continua sendo o lugar das missões. Não trocar.
- **Twine** — só para rascunhar uma ideia rápido no celular; depois passa para o Criador.

### 2.4 Testes e qualidade
- **Playwright** (já instalado nas sessões da web) — um robô que abre o site e **joga as missões sozinho**,
  clicando em todas as escolhas, procurando cena sem saída, botão quebrado, texto vazio.
- **GitHub Actions** — roda esse robô a cada mudança (grátis em repositório público).

### 2.5 Lançamento (mais para frente)
- **itch.io** — publicar grátis, com página, doações e venda; ótimo para RPG indie.
- Steam cobra taxa de entrada: deixar para quando houver dinheiro.

---

## 3. Inteligência artificial

### 3.1 No desenvolvimento (já disponível, sem custo extra)
O Claude Code do autor permite criar **agentes** (subagentes) e **skills** dentro do projeto. Ficam em arquivos
no repositório, então valem no PC e no Android.

**Agentes sugeridos** (`.claude/agents/<nome>.md`):

| Agente | O que faz |
|---|---|
| **guardião da lore** | lê `historia.js` e o `CLAUDE.md` e confere se um texto novo contradiz algo "Decidido" (ex.: chamar Riscadores de facção, inventar entidade). |
| **testador de missões** | abre o jogo com Playwright, percorre todos os caminhos de uma missão e lista becos sem saída e erros. |
| **balanceador** | simula mil testes de atributo/combate e diz se uma cena está fácil ou impossível demais. |
| **revisor de texto** | corta parágrafos longos (telas sem rolagem), confere tom de cada eixo e voz de cada personagem. |
| **diretor de arte** | escreve o briefing de cada arte faltando (`ARTES_FALTANDO.md`) no estilo do eixo. |

**Skills sugeridas** (`.claude/skills/<nome>/SKILL.md`), listas de passos que o Claude segue sempre igual:
- *nova missão do X* → criar no formato do Criador, entrada em `LIGACOES_X`, barks + perfil de balbucio dos NPCs novos.
- *novo NPC* → voz em `gerar_barks.py`, perfil em `js/vozes.js`, retrato em `imagens/npcs/`.
- *lore nova* → atualizar `historia.js` com o selo certo (Decidido / Para considerar / Em aberto).

**Tarefas agendadas**: o Claude Code pode rodar sozinho, por exemplo toda madrugada, o testador de missões
e deixar um relatório. Consome a cota do plano, então usar com moderação.

### 3.2 Dentro do jogo (para o jogador)
Princípio do KOSMOS: **"sem mestre; quando o jogador escreve livremente, o jogo interpreta"**. A IA entra aí,
como intérprete — **não** como autora da história (a lore é do autor) e **não** como voz (vozes à moda antiga).

Opções gratuitas, da mais segura para a mais arriscada:

1. **IA dentro do navegador, sem internet e sem conta** — *Transformers.js* com um modelo pequeno de
   "parecença de frases" (~25 MB, baixa uma vez e fica guardado, como o Piper).
   O jogador escreve *"tento acalmar a vizinha"* e o jogo descobre qual escolha da cena chega mais perto.
   Melhora o texto livre que hoje funciona por palavras-chave. **Recomendado como primeiro passo.**
2. **IA do próprio Chrome** (modelo embutido em versões recentes do Chrome no PC) — grátis e local,
   mas só existe em alguns aparelhos: usar como bônus, nunca como obrigação.
3. **APIs com plano gratuito** (Google Gemini, Groq, OpenRouter com modelos ":free") — mais espertas, permitem
   NPC respondendo pergunta aberta dentro de limites. Contras: limite diário, o plano grátis pode usar os dados
   para treino, e exigem o "porteiro" abaixo. Se cair, o jogo volta para a opção 1.

> A API do Claude é paga por uso; a assinatura do Claude Code não cobre o jogo chamando a IA.
> Por isso o Claude fica no **desenvolvimento**, e o jogo usa as opções acima.

**Usos bons para a IA no jogo:**
- interpretar o texto livre e escolher a saída certa da cena;
- NPC responder perguntas sobre **o que ele sabe** (ficha curta escrita pelo autor), recusando o resto;
- "Diário" resumindo a jornada do personagem com as palavras do jogo;
- variações curtas de falas de multidão (os Riscadores murmurando), sempre de uma lista revisada.

**Usos a evitar:** inventar lore, decidir finais, gerar missões principais, ler texto em voz alta.

### 3.3 O "porteiro" (só se usar a opção 3)
Um **Cloudflare Worker** (grátis, 100 mil chamadas/dia) recebe o pedido do jogo, coloca a chave escondida e
repassa para a IA. Ele também limita quantas perguntas cada jogador faz por hora. Sem isso, qualquer um copia a
chave do site.

---

## 4. Mecânicas: o que pegar das referências

Adaptadas a um RPG de texto, em telas sem rolagem. Marcadas pela prioridade sugerida.

### Prioridade alta (combinam com o que já existe)
1. **Testes visíveis no diálogo** — escolhas como `[Mente] Convencer o guarda` mostrando a chance
   (ex.: "provável", "arriscado"). É o que deixa um RPG "de ficha" gostoso.
2. **Relógio da noite** (X) — cada ação gasta tempo; fome, frio, medo e munição pesam. O fim da noite é o
   prazo, como um cronômetro de campanha. É o coração da sobrevivência.
3. **Reputação por lugar** — cada bairro de Port Halden lembra o que o personagem fez (ajudou, roubou,
   abandonou). Abre e fecha portas. Liga com a tendência herói / anti-herói / vilão.
4. **Companheiros com aprovação** — os 9 prontos reagem às escolhas uns dos outros; aprovação baixa, eles
   discordam ou vão embora; alta, desbloqueia o fio pessoal no Diário.
5. **Epílogo em quadros** — no fim, uma tela por lugar e por pessoa contando o que aconteceu por causa do
   jogador. Perfeito para o "segundo final" do Lime.

### Prioridade média
6. **Combate por turnos com pontos de ação** — mirar, correr, cobrir, usar item; em texto, cada turno uma tela.
   Mirar em parte do corpo vira "mirar na arma / nas pernas / no rádio".
7. **Talentos a cada poucos níveis** e **traços** com um lado bom e um ruim, escolhidos na criação.
8. **Peso e escambo** — `Regras.carga` já existe; trocar item por item com NPC, preço muda com reputação.
9. **Minijogo de decifrar** — terminais da Domus (Interface), códigos riscados (Código Urbano) e runas (Yudur):
   o jogador deduz a palavra pelas letras certas, usando a camada de línguas que já existe.
10. **Notas e terminais espalhados** — lore contada por papéis, gravações e telas, que o jogador acha explorando.

### Prioridade baixa (quando o núcleo estiver pronto)
11. **Missões secundárias por modelo** — "levar remédio a alguém", "achar abrigo para uma família": um gerador
    monta a partir de peças escritas pelo autor (lugar + pessoa + necessidade + complicação). Sem IA.
12. **Mapa-mundi com encontros no caminho** — viajar entre lugares do mapa gasta tempo e pode render um evento.
13. **Furtividade e arrombamento** com o mesmo sistema de testes.

---

## 5. Ordem sugerida

1. **Agentes e skills do Claude Code** (guardião da lore, testador, nova missão). Custo zero, efeito imediato.
2. **Testador automático** rodando no GitHub Actions.
3. **Testes visíveis, relógio da noite e reputação** no Prólogo X.
4. **Texto livre com IA no navegador** (Transformers.js).
5. **Arte 2.5D** com Blender + PixiJS nas cenas e mapas (menus seguem com a galáxia).
6. **Companheiros com aprovação** e **epílogo em quadros**.
7. Combate por pontos de ação, talentos, minijogo de decifrar.
8. Perto do lançamento: trocar vozes de serviço não oficial, revisar licenças de arte e música, página no itch.io.
