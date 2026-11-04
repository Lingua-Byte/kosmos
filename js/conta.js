// Conta do jogador na nuvem (Supabase): entra com e-mail e senha (criados no próprio jogo),
// e o progresso (personagens, partidas, saves) fica o mesmo no celular, no PC e nos apps.
//
// Como funciona:
//   · Uma linha por jogador na tabela "progresso" (ferramentas/supabase.sql), só ele lê e grava.
//   · Este aparelho manda o que mudou (confere a cada poucos segundos e ao sair da tela) e,
//     ao abrir o jogo ou entrar na conta, busca o da nuvem e junta: nada se perde — personagens,
//     partidas e saves se juntam pelo id; se o mesmo item mudou nos dois, vale o mais recente.
//   · Sem configuração (conta-config.js vazio), nada disso liga: o jogo segue só no aparelho.

const Conta = (() => {
  const CHAVES = { personagens: "kosmos.personagens", campanhas: "kosmos.campanhas", saves: "kosmos.saves", cinematicas: "kosmos.cinematicas-vistas" };
  const ATUAL = "kosmos.campanhaAtual"; // texto puro, não JSON
  const ESTADO = "kosmos.conta.estado"; // { enviadoEm, assinatura, alteradoEm }
  const configurada = () => !!(typeof CONTA_CONFIG !== "undefined" && CONTA_CONFIG.url && CONTA_CONFIG.chave);

  let cliente = null;
  let usuario = null;
  let carregando = null;
  let ultimaSync = null;
  let ocupado = false;

  const ler = (k, padrao) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? padrao;
    } catch {
      return padrao;
    }
  };
  const gravar = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  };
  const estado = () => ler(ESTADO, {});

  // o progresso deste aparelho, num pacote só
  function pacote() {
    let atual = null;
    try {
      atual = localStorage.getItem(ATUAL);
    } catch {}
    return {
      personagens: ler(CHAVES.personagens, []), campanhas: ler(CHAVES.campanhas, {}),
      saves: ler(CHAVES.saves, []), cinematicas: ler(CHAVES.cinematicas, []), campanhaAtual: atual,
    };
  }
  const assinar = (p) => JSON.stringify([p.personagens, p.campanhas, p.saves, p.cinematicas, p.campanhaAtual]);

  // ---------- Carregar o Supabase só quando há configuração ----------
  function iniciarCliente() {
    if (!configurada()) return Promise.resolve(null);
    if (cliente) return Promise.resolve(cliente);
    if (carregando) return carregando;
    carregando = new Promise((ok) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.0/dist/umd/supabase.js";
      s.onload = () => {
        cliente = window.supabase.createClient(CONTA_CONFIG.url, CONTA_CONFIG.chave, { auth: { persistSession: true, storageKey: "kosmos.conta.sessao" } });
        ok(cliente);
      };
      s.onerror = () => ok(null);
      document.head.appendChild(s);
    });
    return carregando;
  }

  // ---------- Entrar, criar conta e sair ----------
  // (o projeto não pede confirmação por e-mail: criou, já entrou)
  async function entrar(email, senha) {
    const c = await iniciarCliente();
    if (!c) throw new Error("sem conexão com o servidor de contas");
    const { data, error } = await c.auth.signInWithPassword({ email, password: senha });
    if (error) throw new Error(traduzir(error.message));
    usuario = data.user;
    await sincronizar({ primeiraVez: true });
    return usuario;
  }

  async function criarConta(email, senha) {
    const c = await iniciarCliente();
    if (!c) throw new Error("sem conexão com o servidor de contas");
    const { data, error } = await c.auth.signUp({ email, password: senha });
    if (error) throw new Error(traduzir(error.message));
    if (!data.session) throw new Error("conta criada, mas não entrou; tente Entrar");
    usuario = data.user;
    await sincronizar({ primeiraVez: true });
    return usuario;
  }

  async function sair() {
    const c = await iniciarCliente();
    if (c) await c.auth.signOut();
    usuario = null;
    gravar(ESTADO, {});
  }

  function traduzir(msg) {
    if (/rate limit|too many/i.test(msg)) return "muitas tentativas; espere alguns minutos";
    if (/invalid login credentials/i.test(msg)) return "e-mail ou senha errados";
    if (/already registered|already exists/i.test(msg)) return "esse e-mail já tem conta; use Entrar";
    if (/password/i.test(msg) && /(least|short|weak)/i.test(msg)) return "a senha precisa ter pelo menos 6 caracteres";
    if (/email/i.test(msg) && /invalid/i.test(msg)) return "e-mail inválido";
    return msg;
  }

  // ---------- Juntar o deste aparelho com o da nuvem ----------
  function juntarListaPorId(local = [], remota = [], localMaisNovo) {
    const mapa = new Map(remota.map((x) => [x.id, x]));
    for (const x of local) if (!mapa.has(x.id) || localMaisNovo) mapa.set(x.id, x);
    return [...mapa.values()];
  }
  function juntarObjeto(local = {}, remoto = {}, localMaisNovo) {
    return localMaisNovo ? { ...remoto, ...local } : { ...local, ...remoto };
  }
  function juntar(local, remoto, localMaisNovo) {
    return {
      personagens: juntarListaPorId(local.personagens, remoto.personagens, localMaisNovo),
      campanhas: juntarObjeto(local.campanhas, remoto.campanhas, localMaisNovo),
      saves: juntarListaPorId(local.saves, remoto.saves, localMaisNovo).sort((a, b) => (a.quando < b.quando ? 1 : -1)),
      cinematicas: [...new Set([...(local.cinematicas || []), ...(remoto.cinematicas || [])])],
      campanhaAtual: (localMaisNovo ? local.campanhaAtual : remoto.campanhaAtual) || local.campanhaAtual,
    };
  }

  function aplicar(p) {
    gravar(CHAVES.personagens, p.personagens);
    gravar(CHAVES.campanhas, p.campanhas);
    gravar(CHAVES.saves, p.saves);
    gravar(CHAVES.cinematicas, p.cinematicas);
    try {
      if (p.campanhaAtual) localStorage.setItem(ATUAL, p.campanhaAtual);
    } catch {}
  }

  async function enviar(p) {
    const agora = new Date().toISOString();
    const { error } = await cliente.from("progresso").upsert({ usuario: usuario.id, dados: p, atualizado_em: agora });
    if (error) throw new Error(error.message);
    gravar(ESTADO, { ...estado(), enviadoEm: agora, assinatura: assinar(p) });
    ultimaSync = new Date();
  }

  // busca o da nuvem, junta com o daqui e manda de volta o resultado
  async function sincronizar({ primeiraVez = false } = {}) {
    if (!usuario || ocupado) return;
    ocupado = true;
    try {
      const { data, error } = await cliente.from("progresso").select("dados, atualizado_em").eq("usuario", usuario.id).maybeSingle();
      if (error) throw new Error(error.message);
      const local = pacote();
      const st = estado();
      if (!data) return await enviar(local); // primeira vez nesta conta: sobe o que tem aqui
      const remotoMudou = data.atualizado_em !== st.enviadoEm;
      const localMudou = assinar(local) !== st.assinatura;
      if (!remotoMudou && !localMudou) {
        ultimaSync = new Date();
        return;
      }
      if (remotoMudou) {
        const localMaisNovo = localMudou && (st.alteradoEm || "") > data.atualizado_em;
        const junto = primeiraVez || localMudou ? juntar(local, data.dados || {}, localMaisNovo) : { ...pacote(), ...(data.dados || {}) };
        aplicar(junto);
        await enviar(junto);
        if (typeof avisar === "function") avisar("☁ Progresso da nuvem atualizado neste aparelho");
        atualizarTelas();
      } else await enviar(local);
    } catch (e) {
      console.warn("Conta: não sincronizou", e);
    } finally {
      ocupado = false;
    }
  }

  // depois de trazer coisas da nuvem, a lista de personagens e a Mesa mostram o novo
  function atualizarTelas() {
    if (document.querySelector("#tela-personagens.ativa") && typeof abrirPersonagens === "function") abrirPersonagens();
    if (document.querySelector("#tela-mesa.ativa") && typeof Cenas !== "undefined") Cenas.abrirMesa();
    if (typeof mostrarCarregarInicio === "function") mostrarCarregarInicio();
  }

  // confere de tempos em tempos se algo mudou aqui e manda
  let enviarAgendado = null;
  setInterval(() => {
    if (!usuario || ocupado) return;
    const p = pacote();
    const st = estado();
    if (assinar(p) !== st.assinatura) {
      gravar(ESTADO, { ...st, alteradoEm: new Date().toISOString() });
      clearTimeout(enviarAgendado);
      enviarAgendado = setTimeout(() => sincronizar(), 4000);
    }
  }, 5000);
  // saiu do app: manda já; voltou: busca o que mudou nos outros aparelhos
  document.addEventListener("visibilitychange", () => usuario && sincronizar());

  // ao abrir o jogo: se já tem sessão, sincroniza
  (async () => {
    if (!configurada()) return;
    const c = await iniciarCliente();
    if (!c) return;
    const { data } = await c.auth.getSession();
    usuario = data.session ? data.session.user : null;
    if (usuario) sincronizar();
    atualizarTelas();
    c.auth.onAuthStateChange((_ev, sessao) => {
      usuario = sessao ? sessao.user : null;
      atualizarTelas();
    });
  })();

  return {
    configurada, entrar, criarConta, sair, sincronizar,
    usuario: () => usuario,
    ultimaSync: () => ultimaSync,
  };
})();
