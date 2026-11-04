// Nuvem da Oficina: guarda os textos do autor num repositório PRIVADO do GitHub,
// para que o celular e o PC vejam sempre a mesma coisa.
// Cada aparelho se conecta uma vez com um token do GitHub (só daquele repositório);
// o token fica guardado só no aparelho.
//
// Dois aparelhos podem mexer ao mesmo tempo: quando o arquivo na nuvem mudou desde a última
// vez, as mudanças são juntadas item a item (cada pergunta, NPC, missão e tabela), comparando
// com a última versão sincronizada. Só se os DOIS mexeram no mesmo item vence o deste aparelho.

const Nuvem = (() => {
  const CHAVE = "kosmos.oficina.nuvem";
  const ARQUIVO = "oficina.json";

  function config() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE)) || null;
    } catch {
      return null;
    }
  }

  function configurar(c) {
    try {
      if (c) localStorage.setItem(CHAVE, JSON.stringify(c));
      else localStorage.removeItem(CHAVE);
    } catch {}
  }

  // arquivo: "oficina.json" (padrão) ou outro arquivo do mesmo repositório (ex.: "diagramas.json")
  function url(c, arquivo = ARQUIVO) {
    return `https://api.github.com/repos/${c.repo}/contents/${arquivo}`;
  }

  function cabecalhos(c) {
    return { Authorization: `Bearer ${c.token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  }

  // base64 <-> texto UTF-8 (acentos, runas, símbolos)
  function paraBase64(texto) {
    const bytes = new TextEncoder().encode(texto);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function deBase64(b64) {
    const bin = atob(b64.replace(/\s/g, ""));
    return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
  }

  class Erro extends Error {
    constructor(status, mensagem) {
      super(mensagem);
      this.status = status;
    }
  }

  async function erroDe(r) {
    let msg = "";
    try {
      msg = (await r.json()).message || "";
    } catch {}
    const explicado = {
      401: "o token não é válido (ou expirou)",
      403: "o token não tem permissão de ler e escrever neste repositório",
      404: "repositório não encontrado (ou o token não tem acesso a ele)",
    }[r.status];
    return new Erro(r.status, explicado || msg || `erro ${r.status}`);
  }

  // { dados, sha } ou { dados: null, sha: null } se o arquivo ainda não existe no repositório
  async function baixar(c = config(), arquivo = ARQUIVO) {
    const r = await fetch(url(c, arquivo) + `?t=${Date.now()}`, { headers: cabecalhos(c), cache: "no-store" });
    if (r.status === 404) {
      // repositório existe mas o arquivo não? (o repositório inexistente também dá 404)
      const repo = await fetch(`https://api.github.com/repos/${c.repo}`, { headers: cabecalhos(c), cache: "no-store" });
      if (repo.ok) return { dados: null, sha: null };
      throw await erroDe(repo);
    }
    if (!r.ok) throw await erroDe(r);
    const j = await r.json();
    return { dados: JSON.parse(deBase64(j.content)), sha: j.sha };
  }

  // Grava; se outro aparelho salvou antes (sha diferente), lança Erro com status 409
  async function enviar(dados, sha, c = config(), arquivo = ARQUIVO) {
    const corpo = { message: `${arquivo === ARQUIVO ? "Oficina" : arquivo}: ${new Date().toLocaleString("pt-BR")}`, content: paraBase64(JSON.stringify(dados, null, 2) + "\n") };
    if (sha) corpo.sha = sha;
    const r = await fetch(url(c, arquivo), { method: "PUT", headers: { ...cabecalhos(c), "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
    if (r.status === 409 || r.status === 422) throw new Erro(409, "o arquivo mudou em outro aparelho");
    if (!r.ok) throw await erroDe(r);
    return (await r.json()).content.sha;
  }

  // ---------- Juntar (merge em três vias, item a item) ----------
  const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  function juntarLista(base = [], local = [], remoto = []) {
    const porId = (l) => new Map(l.map((x) => [x.id, x]));
    const B = porId(base), L = porId(local), R = porId(remoto);
    const ids = [...new Set([...remoto.map((x) => x.id), ...local.map((x) => x.id)])];
    const saida = [];
    for (const id of ids) {
      const b = B.get(id), l = L.get(id), r = R.get(id);
      const mudouAqui = !igual(b, l);
      if (mudouAqui) {
        if (l) saida.push(l); // editado ou criado aqui (apagado aqui: some)
      } else if (r) saida.push(r); // não mexi: vale o da nuvem (apagado lá: some)
    }
    return saida;
  }

  function juntarObjeto(base = {}, local = {}, remoto = {}) {
    const saida = {};
    for (const k of new Set([...Object.keys(remoto), ...Object.keys(local)])) {
      const v = !igual(base[k], local[k]) ? local[k] : remoto[k];
      if (v !== undefined) saida[k] = v;
    }
    return saida;
  }

  function juntar(base, local, remoto) {
    base = base || {};
    return {
      ...remoto,
      versao: remoto.versao || local.versao || 1,
      perguntas: juntarLista(base.perguntas, local.perguntas, remoto.perguntas),
      npcs: juntarLista(base.npcs, local.npcs, remoto.npcs),
      storylets: juntarLista(base.storylets, local.storylets, remoto.storylets),
      profissoes: juntarLista(base.profissoes, local.profissoes, remoto.profissoes),
      tabelas: juntarObjeto(base.tabelas, local.tabelas, remoto.tabelas),
      pontos: juntarObjeto(base.pontos, local.pontos, remoto.pontos),
    };
  }

  return { config, configurar, baixar, enviar, juntar, juntarLista, igual };
})();
