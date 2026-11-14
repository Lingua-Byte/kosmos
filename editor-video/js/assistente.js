// Assistente: conversa com o Claude (via servidor.py) e deixa ele ver quadros e editar a linha do tempo.
import {
  estado, avisar, clipe, faixa, fim, duracaoProjeto, criarClipe, moverClipe, aparar,
  dividir, remover, adicionarFaixa, marcarDesfazer,
} from "./projeto.js";
import { folhaDeQuadros, irPara, desenhar } from "./motor.js";
import { escapar, formatarTempo } from "./linha-do-tempo.js";

const MAX_VOLTAS = 30;

const SISTEMA = `Você é o assistente de edição de um editor de vídeo não linear (no estilo do Premiere), embutido no programa. Fale português do Brasil, direto e curto.

Como o editor funciona:
- Tempos em segundos. A linha do tempo tem faixas de vídeo (camadas: a primeira da lista fica por cima) e de áudio.
- Clipe: ocupa [inicio, inicio+duracao) numa faixa; "entrada" é o ponto do arquivo original onde ele começa. Tipos: video, audio, imagem, texto.
- Vídeo com som toca o som do próprio clipe. Texto e imagem vão em faixas de vídeo; a faixa "T1" serve para títulos e legendas.
- Transições disponíveis: fade de entrada e de saída por clipe (imagem e som).

Como trabalhar:
- Antes de editar, chame ver_projeto para saber o estado atual (ids mudam depois de dividir ou remover).
- Use ver_quadros para olhar o vídeo de verdade antes de opinar sobre conteúdo, enquadramento, cortes ou legendas. Você não ouve o áudio: não invente o que é dito.
- Quando o usuário pedir uma mudança, faça com as ferramentas em vez de só descrever. Agrupe chamadas independentes na mesma resposta.
- O usuário pode desfazer tudo o que você fez nesta resposta com Ctrl+Z, então aja; pergunte só quando o pedido for ambíguo de verdade.
- No fim, diga em uma ou duas frases o que mudou (com tempos no formato 12.5s).`;

const FERRAMENTAS = [
  {
    name: "ver_projeto",
    description: "Devolve o estado atual: configurações, faixas, clipes (com ids, tempos, propriedades), mídias importadas, marcadores, cursor e seleção.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "ver_quadros",
    description: "Renderiza a saída final da linha do tempo nos instantes pedidos e devolve uma imagem (folha de contato com o tempo escrito em cada quadro). Até 12 instantes.",
    input_schema: {
      type: "object",
      properties: { tempos: { type: "array", items: { type: "number" }, description: "Instantes em segundos." } },
      required: ["tempos"],
    },
  },
  {
    name: "adicionar_clipe",
    description: "Coloca uma mídia importada na linha do tempo. Sem 'inicio', vai para o fim da faixa. Sem 'faixa', usa a padrão do tipo (V1 para vídeo/imagem, A1 para áudio).",
    input_schema: {
      type: "object",
      properties: {
        midia_id: { type: "string" },
        faixa: { type: "string" },
        inicio: { type: "number" },
        entrada: { type: "number", description: "Ponto do arquivo original onde o clipe começa." },
        duracao: { type: "number" },
      },
      required: ["midia_id"],
    },
  },
  {
    name: "adicionar_texto",
    description: "Cria um título, legenda ou cartela de texto numa faixa de vídeo (padrão T1).",
    input_schema: {
      type: "object",
      properties: {
        texto: { type: "string", description: "Use \\n para quebrar linha." },
        inicio: { type: "number" },
        duracao: { type: "number" },
        faixa: { type: "string" },
        tamanho: { type: "number", description: "Altura da letra em % da altura do vídeo. Título ~8, legenda ~4.5." },
        cor: { type: "string", description: "Cor CSS, ex. #ffffff." },
        y: { type: "number", description: "Posição vertical do centro, 0 (topo) a 1 (base). Legenda ~0.88." },
        fundo: { type: "string", description: "Cor CSS da tarja atrás do texto, ex. rgba(0,0,0,0.6). Vazio = sem tarja." },
      },
      required: ["texto", "inicio", "duracao"],
    },
  },
  {
    name: "mover_clipe",
    description: "Muda o início e/ou a faixa de um clipe.",
    input_schema: {
      type: "object",
      properties: { clipe_id: { type: "string" }, inicio: { type: "number" }, faixa: { type: "string" } },
      required: ["clipe_id"],
    },
  },
  {
    name: "aparar_clipe",
    description: "Ajusta a entrada (ponto do arquivo original) e/ou a duração de um clipe, sem mover o início dele.",
    input_schema: {
      type: "object",
      properties: { clipe_id: { type: "string" }, entrada: { type: "number" }, duracao: { type: "number" } },
      required: ["clipe_id"],
    },
  },
  {
    name: "dividir_clipe",
    description: "Corta um clipe em dois no instante 'tempo' da linha do tempo. Devolve o id do pedaço da direita.",
    input_schema: {
      type: "object",
      properties: { clipe_id: { type: "string" }, tempo: { type: "number" } },
      required: ["clipe_id", "tempo"],
    },
  },
  {
    name: "remover_clipes",
    description: "Apaga clipes. Com fechar_lacunas, puxa para a esquerda o que vinha depois na mesma faixa (ripple delete).",
    input_schema: {
      type: "object",
      properties: {
        clipe_ids: { type: "array", items: { type: "string" } },
        fechar_lacunas: { type: "boolean" },
      },
      required: ["clipe_ids"],
    },
  },
  {
    name: "ajustar_clipe",
    description: "Muda propriedades de um clipe: volume (0 a 2), opacidade (0 a 1), fades em segundos e, para texto, o conteúdo e o estilo.",
    input_schema: {
      type: "object",
      properties: {
        clipe_id: { type: "string" },
        volume: { type: "number" },
        opacidade: { type: "number" },
        fade_entrada: { type: "number" },
        fade_saida: { type: "number" },
        texto: { type: "string" },
        tamanho: { type: "number" },
        cor: { type: "string" },
        y: { type: "number" },
        fundo: { type: "string" },
      },
      required: ["clipe_id"],
    },
  },
  {
    name: "adicionar_marcador",
    description: "Põe um marcador com rótulo na régua (para apontar momentos ao usuário).",
    input_schema: {
      type: "object",
      properties: { tempo: { type: "number" }, rotulo: { type: "string" } },
      required: ["tempo", "rotulo"],
    },
  },
  {
    name: "posicionar_cursor",
    description: "Move o cursor de reprodução para mostrar um momento ao usuário.",
    input_schema: { type: "object", properties: { tempo: { type: "number" } }, required: ["tempo"] },
  },
  {
    name: "configurar_projeto",
    description: "Muda nome, resolução (ex. 1920x1080 horizontal, 1080x1920 vertical para Reels/Shorts) ou fps.",
    input_schema: {
      type: "object",
      properties: { nome: { type: "string" }, largura: { type: "integer" }, altura: { type: "integer" }, fps: { type: "integer" } },
    },
  },
  {
    name: "adicionar_faixa",
    description: "Cria uma faixa nova de vídeo (camada por cima das existentes, abaixo de T1) ou de áudio.",
    input_schema: {
      type: "object",
      properties: { tipo: { type: "string", enum: ["video", "audio"] } },
      required: ["tipo"],
    },
  },
];

// ---------- execução das ferramentas ----------
const arred = (n) => Math.round(n * 1000) / 1000;
const num = (v, nome) => {
  if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`'${nome}' precisa ser um número.`);
  return v;
};
function exigirClipe(id) {
  const c = clipe(id);
  if (!c) throw new Error(`Clipe ${id} não existe. Chame ver_projeto para ver os ids atuais.`);
  return c;
}
function aplicarEstilo(c, e) {
  if (c.tipo !== "texto") return;
  if (e.texto !== undefined) c.texto = String(e.texto);
  for (const chave of ["tamanho", "cor", "y", "fundo"]) if (e[chave] !== undefined) c.estilo[chave] = e[chave];
}

function resumoDoProjeto() {
  const p = estado.projeto;
  return {
    nome: p.nome, largura: p.largura, altura: p.altura, fps: p.fps,
    duracao: arred(duracaoProjeto()),
    cursor: arred(estado.cursor),
    selecao: [...estado.selecao],
    faixas: p.faixas.map((f) => ({ id: f.id, tipo: f.tipo, nome: f.nome, oculta: f.oculta, muda: f.muda })),
    clipes: [...p.clipes].sort((a, b) => a.inicio - b.inicio).map((c) => ({
      id: c.id, tipo: c.tipo, faixa: c.faixa, midia: c.midia,
      inicio: c.inicio, fim: arred(fim(c)), duracao: c.duracao, entrada: c.entrada,
      volume: c.volume, opacidade: c.opacidade, fade_entrada: c.fadeEntrada, fade_saida: c.fadeSaida,
      ...(c.tipo === "texto" ? { texto: c.texto, estilo: c.estilo } : {}),
    })),
    midias: [...estado.midias.values()].map((m) => ({
      id: m.id, nome: m.nome, tipo: m.tipo, duracao: arred(m.duracao || 0),
      ...(m.largura ? { resolucao: `${m.largura}x${m.altura}` } : {}),
    })),
    marcadores: p.marcadores,
  };
}

async function executar(nome, e) {
  switch (nome) {
    case "ver_projeto":
      return JSON.stringify(resumoDoProjeto());
    case "ver_quadros": {
      const tempos = (e.tempos || []).filter((t) => Number.isFinite(t)).map((t) => Math.max(0, t));
      if (!tempos.length) throw new Error("Passe pelo menos um tempo.");
      const base64 = await folhaDeQuadros(tempos);
      return [
        { type: "text", text: `Quadros em: ${tempos.slice(0, 12).map((t) => `${arred(t)}s`).join(", ")}` },
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
      ];
    }
    case "adicionar_clipe": {
      const c = criarClipe({ midia: e.midia_id, faixa: e.faixa, inicio: e.inicio, entrada: e.entrada ?? 0, duracao: e.duracao });
      return `Clipe ${c.id} em ${c.faixa}, de ${c.inicio}s a ${arred(fim(c))}s.`;
    }
    case "adicionar_texto": {
      const c = criarClipe({
        faixa: e.faixa || (faixa("T1") ? "T1" : undefined),
        inicio: num(e.inicio, "inicio"), duracao: num(e.duracao, "duracao"), texto: e.texto,
      });
      aplicarEstilo(c, e);
      return `Texto ${c.id} em ${c.faixa}, de ${c.inicio}s a ${arred(fim(c))}s.`;
    }
    case "mover_clipe": {
      const c = exigirClipe(e.clipe_id);
      moverClipe(c, { inicio: e.inicio, faixa: e.faixa });
      return `Clipe ${c.id} agora em ${c.faixa}, de ${c.inicio}s a ${arred(fim(c))}s.`;
    }
    case "aparar_clipe": {
      const c = exigirClipe(e.clipe_id);
      aparar(c, { entrada: e.entrada, duracao: e.duracao });
      return `Clipe ${c.id}: entrada ${c.entrada}s, duração ${c.duracao}s (fim ${arred(fim(c))}s).`;
    }
    case "dividir_clipe": {
      const c = exigirClipe(e.clipe_id);
      const direita = dividir(c, num(e.tempo, "tempo"));
      if (!direita) throw new Error(`${e.tempo}s não fica dentro do clipe ${c.id} (${c.inicio}s a ${arred(fim(c))}s).`);
      return `Dividido. Esquerda: ${c.id} (${c.inicio}s–${arred(fim(c))}s). Direita: ${direita.id} (${direita.inicio}s–${arred(fim(direita))}s).`;
    }
    case "remover_clipes": {
      const n = remover(e.clipe_ids || [], !!e.fechar_lacunas);
      return `${n} clipe(s) removido(s)${e.fechar_lacunas ? ", lacunas fechadas" : ""}.`;
    }
    case "ajustar_clipe": {
      const c = exigirClipe(e.clipe_id);
      if (e.volume !== undefined) c.volume = Math.min(2, Math.max(0, num(e.volume, "volume")));
      if (e.opacidade !== undefined) c.opacidade = Math.min(1, Math.max(0, num(e.opacidade, "opacidade")));
      if (e.fade_entrada !== undefined) c.fadeEntrada = Math.min(c.duracao, Math.max(0, num(e.fade_entrada, "fade_entrada")));
      if (e.fade_saida !== undefined) c.fadeSaida = Math.min(c.duracao, Math.max(0, num(e.fade_saida, "fade_saida")));
      aplicarEstilo(c, e);
      return `Clipe ${c.id} ajustado.`;
    }
    case "adicionar_marcador":
      estado.projeto.marcadores.push({ tempo: arred(Math.max(0, num(e.tempo, "tempo"))), rotulo: String(e.rotulo || "") });
      return "Marcador criado.";
    case "posicionar_cursor":
      irPara(num(e.tempo, "tempo"));
      return `Cursor em ${arred(estado.cursor)}s.`;
    case "configurar_projeto": {
      const p = estado.projeto;
      if (e.nome) p.nome = String(e.nome);
      if (e.largura) p.largura = Math.min(4096, Math.max(144, Math.round(e.largura / 2) * 2));
      if (e.altura) p.altura = Math.min(4096, Math.max(144, Math.round(e.altura / 2) * 2));
      if (e.fps) p.fps = Math.min(60, Math.max(12, Math.round(e.fps)));
      return `Projeto: ${p.nome}, ${p.largura}x${p.altura}, ${p.fps} fps.`;
    }
    case "adicionar_faixa":
      return `Faixa ${adicionarFaixa(e.tipo === "audio" ? "audio" : "video").id} criada.`;
    default:
      throw new Error(`Ferramenta desconhecida: ${nome}`);
  }
}

const SO_LEITURA = new Set(["ver_projeto", "ver_quadros", "posicionar_cursor"]);

// ---------- conversa ----------
let mensagens = [];
let ocupado = false;
let ui = null;

export function iniciarAssistente(raiz) {
  raiz.innerHTML = `
    <div class="chat-topo">
      <span class="estado-ia" title="Conexão com o Claude">●</span>
      <strong>Claude</strong>
      <select class="esforco" title="Quanto o Claude pensa antes de responder">
        <option value="low">rápido</option>
        <option value="medium" selected>equilibrado</option>
        <option value="high">caprichado</option>
      </select>
      <button class="mini nova" title="Começar outra conversa">Nova</button>
    </div>
    <div class="chat-mensagens"></div>
    <div class="chat-atalhos">
      <button>Analise meu vídeo e sugira cortes</button>
      <button>Monte uma versão de 30s</button>
      <button>Crie título de abertura</button>
      <button>Adicione fades nas emendas</button>
      <button>Formato vertical para Reels</button>
    </div>
    <form class="chat-entrada">
      <textarea rows="2" placeholder="Peça uma edição ou tire uma dúvida… (Enter envia)"></textarea>
      <button type="submit" class="primario">Enviar</button>
    </form>`;
  ui = {
    lista: raiz.querySelector(".chat-mensagens"),
    campo: raiz.querySelector("textarea"),
    botao: raiz.querySelector(".chat-entrada button"),
    esforco: raiz.querySelector(".esforco"),
    luz: raiz.querySelector(".estado-ia"),
  };
  raiz.querySelector(".chat-entrada").addEventListener("submit", (e) => { e.preventDefault(); enviar(); });
  ui.campo.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
  });
  raiz.querySelector(".chat-atalhos").addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
    ui.campo.value = e.target.textContent;
    enviar();
  });
  raiz.querySelector(".nova").addEventListener("click", () => {
    if (ocupado) return;
    mensagens = [];
    ui.lista.innerHTML = "";
    boasVindas();
  });
  boasVindas();
  verificarServidor();
}

function boasVindas() {
  adicionarBalao("ia", "Oi! Importe seus vídeos, arraste para a linha do tempo e me peça o que quiser: cortes, ritmo, títulos, legendas, versão curta. Eu vejo os quadros e edito direto (Ctrl+Z desfaz).");
}

async function verificarServidor() {
  try {
    const r = await fetch("/api/estado");
    const s = await r.json();
    ui.luz.classList.toggle("ligado", s.assistente);
    ui.luz.title = s.assistente ? `Conectado (${s.modelo})` : "Sem chave da API: veja o README";
    if (!s.assistente) {
      adicionarBalao("erro", s.sdk
        ? "O servidor está sem chave da API. Defina ANTHROPIC_API_KEY e reinicie o servidor.py."
        : "Falta a SDK no servidor: pip install anthropic");
    }
    window.dispatchEvent(new CustomEvent("estado-servidor", { detail: s }));
  } catch {
    ui.luz.title = "Servidor desligado";
    adicionarBalao("erro", "Abra o editor pelo servidor (python editor-video/servidor.py) para usar o Claude.");
  }
}

function adicionarBalao(tipo, texto) {
  const el = document.createElement("div");
  el.className = `balao ${tipo}`;
  el.innerHTML = formatar(texto);
  ui.lista.appendChild(el);
  ui.lista.scrollTop = ui.lista.scrollHeight;
  return el;
}

function formatar(texto) {
  return escapar(texto)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

const ROTULOS = {
  ver_projeto: "👀 lendo o projeto", ver_quadros: "🖼 olhando quadros", adicionar_clipe: "➕ clipe",
  adicionar_texto: "🅣 texto", mover_clipe: "↔ movendo", aparar_clipe: "✂ aparando", dividir_clipe: "✂ dividindo",
  remover_clipes: "🗑 removendo", ajustar_clipe: "🎚 ajustando", adicionar_marcador: "📍 marcador",
  posicionar_cursor: "⏵ cursor", configurar_projeto: "⚙ projeto", adicionar_faixa: "➕ faixa",
};

function contextoAtual() {
  const sel = [...estado.selecao];
  return `[Contexto: cursor em ${estado.cursor.toFixed(2)}s (${formatarTempo(estado.cursor)}), duração ${duracaoProjeto().toFixed(2)}s, ` +
    `${estado.projeto.clipes.length} clipes, ${estado.midias.size} mídias${sel.length ? `, selecionados: ${sel.join(", ")}` : ""}]`;
}

async function enviar() {
  const texto = ui.campo.value.trim();
  if (!texto || ocupado) return;
  ui.campo.value = "";
  adicionarBalao("eu", texto);
  const antes = mensagens.length;
  mensagens.push({ role: "user", content: [{ type: "text", text: `${texto}\n\n${contextoAtual()}` }] });
  ocupado = true;
  ui.botao.disabled = true;
  const pensando = adicionarBalao("ia pensando", "…");
  let editou = false;
  let desfazerMarcado = false;

  try {
    for (let volta = 0; volta < MAX_VOLTAS; volta++) {
      const r = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SISTEMA, tools: FERRAMENTAS, messages: mensagens, esforco: ui.esforco.value }),
      });
      const resposta = await r.json();
      if (!r.ok) throw new Error(resposta.erro || `Erro ${r.status}`);

      // O conteúdo volta inteiro para o histórico (inclui blocos de raciocínio e de fallback).
      mensagens.push({ role: "assistant", content: resposta.content });
      for (const bloco of resposta.content) {
        if (bloco.type === "text" && bloco.text.trim()) adicionarBalao("ia", bloco.text);
      }

      if (resposta.stop_reason === "refusal") {
        adicionarBalao("erro", "O Claude recusou este pedido. Tente reformular.");
        mensagens.length = antes;
        break;
      }
      if (resposta.stop_reason === "pause_turn") continue;
      if (resposta.stop_reason === "max_tokens") {
        adicionarBalao("erro", "A resposta ficou longa demais e foi cortada.");
        break;
      }
      if (resposta.stop_reason !== "tool_use") break;

      const chamadas = resposta.content.filter((b) => b.type === "tool_use");
      const resultados = [];
      for (const chamada of chamadas) {
        const etiqueta = adicionarBalao("ferramenta", ROTULOS[chamada.name] || chamada.name);
        if (!SO_LEITURA.has(chamada.name) && !desfazerMarcado) {
          marcarDesfazer(); // tudo o que o Claude fizer nesta resposta sai num Ctrl+Z só
          desfazerMarcado = true;
        }
        try {
          const saida = await executar(chamada.name, chamada.input || {});
          if (!SO_LEITURA.has(chamada.name)) {
            editou = true;
            avisar("projeto");
            desenhar();
          }
          resultados.push({ type: "tool_result", tool_use_id: chamada.id, content: saida });
        } catch (erro) {
          etiqueta.classList.add("falhou");
          resultados.push({ type: "tool_result", tool_use_id: chamada.id, content: erro.message, is_error: true });
        }
      }
      mensagens.push({ role: "user", content: resultados });
      if (volta === MAX_VOLTAS - 1) adicionarBalao("erro", "Parei depois de muitas etapas. Peça para continuar se precisar.");
    }
  } catch (erro) {
    adicionarBalao("erro", erro.message);
    // Tira do histórico a volta que não terminou, para a próxima pergunta não quebrar.
    mensagens.length = antes;
  } finally {
    pensando.remove();
    ocupado = false;
    ui.botao.disabled = false;
    if (editou) avisar("projeto");
    ui.campo.focus();
  }
}
