// Opções do jogo: volumes e liga/desliga de música, sons dos menus, vozes dos personagens e narrador,
// seu próprio serviço de música e instalar o app. Fica guardado no aparelho.
// O menu abre pelo botão ⚙ (sempre no canto, junto do controle de música).

const Opcoes = (() => {
  const CHAVE = "kosmos.opcoes";
  const PADRAO = {
    musica: { ligada: true, volume: 60 },
    sons: { ligados: true, volume: 80 },
    vozes: { ligadas: true, volume: 100 },
    narrador: { volume: 100 },
    digitacao: { ligada: true, volume: 60 },
  };
  let atual = null;

  function ler() {
    if (atual) return atual;
    let salvo = {};
    try {
      salvo = JSON.parse(localStorage.getItem(CHAVE)) || {};
    } catch {}
    atual = {};
    for (const k of Object.keys(PADRAO)) atual[k] = { ...PADRAO[k], ...(salvo[k] || {}) };
    // escolhas antigas (antes deste menu)
    try {
      if (!salvo.sons && localStorage.getItem("kosmos.sons") === "0") atual.sons.ligados = false;
      if (!salvo.vozes && localStorage.getItem("kosmos.vozes") === "0") atual.vozes.ligadas = false;
    } catch {}
    return atual;
  }

  function mudar(grupo, mudancas) {
    ler();
    Object.assign(atual[grupo], mudancas);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(atual));
    } catch {}
    aplicar(grupo);
  }

  // avisa cada parte do jogo do que mudou
  function aplicar(grupo) {
    const o = ler();
    if (grupo === "musica" && typeof Musica !== "undefined") {
      Musica.volume(o.musica.volume);
      Musica.definirLigada(o.musica.ligada);
    }
    if (grupo === "vozes" && typeof Vozes !== "undefined" && !o.vozes.ligadas) Vozes.parar();
  }

  const get = (grupo) => ler()[grupo];

  // ---------- Instalar o app ----------
  let pedidoInstalar = null;
  addEventListener("beforeinstallprompt", (ev) => {
    ev.preventDefault();
    pedidoInstalar = ev;
  });
  // já é o app? (instalado pelo navegador, o .exe do PC ou o .apk do Android)
  const instalado = () =>
    matchMedia("(display-mode: standalone)").matches || navigator.standalone === true ||
    /Electron|KOSMOS-App|; wv\)/.test(navigator.userAgent);

  // ---------- O menu ----------
  const SERVICOS = [
    ["YouTube Music", "https://music.youtube.com/playlist?list=PL4qiQiekZJhaGHSaOrmfxzpOyo64ap_ok", "a playlist do KOSMOS"],
    ["Spotify", "https://open.spotify.com/", ""],
    ["Deezer", "https://www.deezer.com/", ""],
    ["Apple Music", "https://music.apple.com/", ""],
  ];

  function linha(grupo, chaveLigado, rotulo, desc, teste) {
    const o = get(grupo);
    const ligado = chaveLigado ? o[chaveLigado] : true;
    return `
      <div class="op-linha">
        <div class="op-cabeca">
          <strong>${rotulo}</strong>
          ${chaveLigado ? `<button class="op-chave ${ligado ? "on" : ""}" data-op-ligar="${grupo}:${chaveLigado}" aria-pressed="${ligado}">${ligado ? "Ligado" : "Desligado"}</button>` : ""}
        </div>
        ${desc ? `<p class="op-desc">${desc}</p>` : ""}
        <div class="op-volume">
          <span>Volume</span>
          <input type="range" min="0" max="100" step="5" value="${o.volume}" data-op-volume="${grupo}" aria-label="Volume: ${rotulo}">
          <b data-op-valor="${grupo}">${o.volume}%</b>
          ${teste ? `<button class="op-testar" data-op-testar="${grupo}">Testar</button>` : ""}
        </div>
      </div>`;
  }

  function html() {
    const narr = null; // o narrador (voz que lê o texto) saiu: agora as vozes são à moda antiga
    return `
      <div class="op-topo"><h2>Opções</h2><button class="op-fechar" data-op-fechar>Fechar</button></div>
      ${contaHtml()}
      ${jogoHtml()}
      <section class="op-secao"><h3>Som</h3>
        ${linha("musica", "ligada", "Música do jogo", typeof MusicaPropria !== "undefined" && MusicaPropria.conexao() ? "A trilha de cada eixo (as suas músicas, guardadas no aparelho)." : "A trilha de cada eixo (YouTube).")}
        ${linha("sons", "ligados", "Sons dos menus", "Os cliques e “clunks” de abrir mapa, diário, bolsa, ficha.", true)}
        ${linha("vozes", "ligadas", "Vozes dos personagens", "Como nos RPGs antigos: uma palavra curta e um som de voz próprio de cada um quando fala.", true)}
        ${linha("digitacao", "ligada", "Som de digitação", "O tique leve enquanto o texto da missão aparece.", true)}
        ${narr ? `
        <div class="op-linha">
          <div class="op-cabeca"><strong>Narrador</strong>
            <button class="op-chave ${narr.ligado ? "on" : ""}" data-op-narrador="ligado" aria-pressed="${narr.ligado}">${narr.ligado ? "Ligado" : "Desligado"}</button></div>
          <p class="op-desc">Lê em voz alta o texto das cenas.</p>
          <div class="op-volume"><span>Voz</span>
            <select data-op-narrador="voz"><option value="aparelho" ${narr.voz !== "neural" ? "selected" : ""}>Do aparelho</option><option value="neural" ${narr.voz === "neural" ? "selected" : ""}>Neural (baixa ~60 MB uma vez)</option></select></div>
          <div class="op-volume"><span>Volume</span>
            <input type="range" min="0" max="100" step="5" value="${get("narrador").volume}" data-op-volume="narrador" aria-label="Volume do narrador">
            <b data-op-valor="narrador">${get("narrador").volume}%</b></div>
        </div>` : ""}
      </section>
      ${trilhaPropriaHtml()}
      <section class="op-secao"><h3>Sua música</h3>
        <p class="op-desc">Prefere ouvir a sua própria música enquanto joga? Desligue a música do jogo e abra o seu app. Os sons, as vozes e o narrador continuam por cima.</p>
        <button class="op-acao" data-op-minha-musica>Usar a minha música (desliga a trilha do jogo)</button>
        <div class="op-servicos">${SERVICOS.map(([nome, url, extra]) => `<a href="${url}" target="_blank" rel="noopener" class="op-servico">${nome}${extra ? `<small>${extra}</small>` : ""}</a>`).join("")}</div>
        <p class="op-desc pequeno">Tocar o Spotify, o Deezer ou o Apple Music <i>dentro</i> do jogo exige uma conta de desenvolvedor em cada serviço (e Premium, no caso do Spotify). Dá para fazer depois, se você quiser.</p>
      </section>
      ${instalado() ? "" : `<section class="op-secao"><h3>App</h3>
        ${`<p class="op-desc">Instale o KOSMOS como app (Android ou PC): abre em tela cheia, com ícone próprio, e se atualiza sozinho.</p>
             <div class="op-servicos">
               <a class="op-servico" href="https://github.com/Lingua-Byte/kosmos/releases/download/apps/KOSMOS.apk" download>⬇ Android<small>KOSMOS.apk</small></a>
               <a class="op-servico" href="https://github.com/Lingua-Byte/kosmos/releases/download/apps/KOSMOS-instalador.exe" download>⬇ PC (Windows)<small>instalador .exe</small></a>
             </div>
             <button class="op-acao" data-op-instalar>Instalar pelo navegador</button>
`}
      </section>`}`;
  }

  // Conectar este aparelho às músicas do autor (repositório privado). O token é digitado pelo
  // próprio autor e fica só neste aparelho (é a mesma conexão da Oficina).
  function trilhaPropriaHtml() {
    if (typeof MusicaPropria === "undefined") return "";
    const c = MusicaPropria.conexao();
    return `<section class="op-secao"><h3>Trilha do autor</h3>
      ${c
        ? `<p class="op-desc">Conectado a <b>${c.repo}</b>. As músicas tocam no lugar do YouTube e ficam guardadas neste aparelho depois da primeira vez.</p>
           <button class="op-acao" data-op-trilha="desconectar">Desconectar (volta ao YouTube)</button>`
        : `<p class="op-desc">Toca as suas músicas (pasta <i>musicas/</i> do repositório privado) no lugar do YouTube. Use o mesmo token da Oficina.</p>
           <div class="op-trilha-form">
             <input id="op-trilha-repo" value="Lingua-Byte/kosmos-autor" autocomplete="off" aria-label="Repositório">
             <input id="op-trilha-token" type="password" placeholder="Token do GitHub" autocomplete="off" aria-label="Token">
             <button class="op-acao" data-op-trilha="conectar">Conectar</button>
           </div>
           <p class="op-desc pequeno" id="op-trilha-erro"></p>`}
    </section>`;
  }

  async function trilhaPropria(acao) {
    if (acao === "desconectar") {
      MusicaPropria.conectar(null);
      return location.reload();
    }
    const c = { repo: dialogo.querySelector("#op-trilha-repo").value.trim(), token: dialogo.querySelector("#op-trilha-token").value.trim() };
    const erro = dialogo.querySelector("#op-trilha-erro");
    if (!/^[\w.-]+\/[\w.-]+$/.test(c.repo) || !c.token) {
      erro.textContent = "Preencha o repositório (dono/nome) e o token.";
      return;
    }
    erro.textContent = "Conectando…";
    try {
      const n = await MusicaPropria.testar(c);
      erro.textContent = `Achei ${n} músicas. Recarregando…`;
    } catch (e) {
      erro.textContent = `Não conectou: ${e.message}.`;
      return;
    }
    MusicaPropria.conectar(c);
    setTimeout(() => location.reload(), 600);
  }

  // Conta na nuvem (conta.js): entrar com e-mail + código, para continuar no celular e no PC
  let contaEmail = "";
  let contaPasso = "email"; // "email" | "codigo"
  let contaMsg = "";
  function contaHtml() {
    if (typeof Conta === "undefined" || !Conta.configurada()) return "";
    const u = Conta.usuario();
    const sync = Conta.ultimaSync();
    return `<section class="op-secao"><h3>Conta</h3>
      ${u ? `
        <p class="op-desc">Conectado como <b>${esc(u.email)}</b>. Personagens, partidas e saves ficam iguais no celular, no PC e nos apps.${sync ? ` Última sincronização: ${sync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.` : ""}</p>
        <div class="op-jogo"><button class="op-acao" data-op-conta="sync">Sincronizar agora</button><button class="op-acao" data-op-conta="sair">Sair da conta</button></div>`
      : contaPasso === "email" ? `
        <p class="op-desc">Entre para continuar o mesmo jogo no celular e no PC. Sem senha: você recebe um código por e-mail.</p>
        <div class="op-trilha-form"><input id="op-conta-email" type="email" inputmode="email" autocomplete="email" placeholder="seu e-mail" value="${esc(contaEmail)}"><button class="op-acao" data-op-conta="enviar">Receber código</button></div>`
      : `
        <p class="op-desc">Mandamos um código para <b>${esc(contaEmail)}</b>. Digite aqui (olhe também no spam).</p>
        <div class="op-trilha-form"><input id="op-conta-codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="código"><button class="op-acao" data-op-conta="confirmar">Entrar</button><button class="op-acao" data-op-conta="voltar">Outro e-mail</button></div>`}
      ${contaMsg ? `<p class="op-desc pequeno">${contaMsg}</p>` : ""}
    </section>`;
  }

  async function conta(acao) {
    const redesenhar = () => (dialogo.innerHTML = html());
    try {
      if (acao === "enviar") {
        contaEmail = dialogo.querySelector("#op-conta-email").value.trim();
        if (!/^\S+@\S+\.\S+$/.test(contaEmail)) { contaMsg = "Digite um e-mail válido."; return redesenhar(); }
        contaMsg = "Enviando…";
        redesenhar();
        await Conta.enviarCodigo(contaEmail);
        contaPasso = "codigo";
        contaMsg = "";
      }
      if (acao === "confirmar") {
        contaMsg = "Entrando…";
        const codigo = dialogo.querySelector("#op-conta-codigo").value;
        redesenhar();
        await Conta.confirmarCodigo(contaEmail, codigo);
        contaPasso = "email";
        contaMsg = "Pronto! O seu progresso agora fica na nuvem.";
      }
      if (acao === "voltar") { contaPasso = "email"; contaMsg = ""; }
      if (acao === "sync") { contaMsg = "Sincronizando…"; redesenhar(); await Conta.sincronizar(); contaMsg = "Sincronizado."; }
      if (acao === "sair") {
        if (!confirm("Sair da conta neste aparelho? O progresso continua na nuvem e neste aparelho.")) return;
        await Conta.sair();
        contaMsg = "";
      }
    } catch (e) {
      contaMsg = `Não deu: ${e.message}.`;
    }
    redesenhar();
  }

  // Jogo: salvar/carregar e voltar ao menu inicial
  function jogoHtml() {
    const naInicial = document.querySelector("#tela-inicio.ativa");
    const temSaves = typeof Saves !== "undefined";
    const emJogo = typeof Cenas !== "undefined" && Cenas.emJogo() && document.querySelector("#tela-cena.ativa");
    if (naInicial && !(temSaves && Saves.todos().length)) return "";
    return `<section class="op-secao"><h3>Jogo</h3>
      <div class="op-jogo">
        ${temSaves && (emJogo || Saves.todos().length) ? `<button class="op-acao" data-op-jogo="saves">${emJogo ? "Salvar e carregar" : "Carregar jogo"}</button>` : ""}
        ${naInicial ? "" : `<button class="op-acao" data-op-jogo="menu">Voltar ao menu inicial</button>`}
      </div>
      ${emJogo ? `<p class="op-desc pequeno">A partida fica gravada ao sair: dá para continuar pela Mesa.</p>` : ""}
    </section>`;
  }

  let dialogo = null;

  function abrir() {
    if (!dialogo) {
      dialogo = document.createElement("dialog");
      dialogo.className = "dialogo-opcoes";
      document.body.append(dialogo);
      dialogo.addEventListener("click", clique);
      dialogo.addEventListener("input", entrada);
      dialogo.addEventListener("change", troca);
    }
    dialogo.innerHTML = html();
    if (typeof Som !== "undefined") Som.tocar("abrir");
    dialogo.showModal();
  }

  function fechar() {
    if (typeof Som !== "undefined") Som.tocar("fechar");
    dialogo.close();
  }

  function clique(ev) {
    const t = ev.target.closest("button, a");
    if (!t) {
      if (ev.target === dialogo) fechar(); // tocou fora
      return;
    }
    if (t.hasAttribute("data-op-fechar")) return fechar();
    if (t.dataset.opLigar) {
      const [grupo, chave] = t.dataset.opLigar.split(":");
      mudar(grupo, { [chave]: !get(grupo)[chave] });
      if (typeof Som !== "undefined") Som.tocar("clique");
      dialogo.innerHTML = html();
    }
    if (t.dataset.opNarrador === "ligado") {
      Narrador.configurar({ ligado: !Narrador.config().ligado });
      if (typeof Som !== "undefined") Som.tocar("clique");
      dialogo.innerHTML = html();
    }
    if (t.dataset.opTestar === "sons") Som.tocar("abrir");
    if (t.dataset.opTestar === "digitacao") [0, 60, 120, 180, 240].forEach((d) => setTimeout(() => Som.tecla(), d));
    if (t.dataset.opTestar === "vozes") Vozes.testar();
    if (t.hasAttribute("data-op-minha-musica")) {
      mudar("musica", { ligada: false });
      dialogo.innerHTML = html();
    }
    if (t.dataset.opTrilha) trilhaPropria(t.dataset.opTrilha);
    if (t.dataset.opConta) conta(t.dataset.opConta);
    if (t.dataset.opJogo === "saves") {
      dialogo.close();
      return Saves.abrir();
    }
    if (t.dataset.opJogo === "menu") {
      dialogo.close();
      return voltarAoMenu();
    }
    if (t.hasAttribute("data-op-instalar")) {
      if (!instalar()) location.href = "instalar.html";
    }
  }

  function entrada(ev) {
    const t = ev.target;
    if (!t.dataset.opVolume) return;
    const grupo = t.dataset.opVolume;
    mudar(grupo, { volume: +t.value });
    dialogo.querySelector(`[data-op-valor="${grupo}"]`).textContent = `${t.value}%`;
  }

  function troca(ev) {
    const t = ev.target;
    if (t.dataset.opVolume === "sons") Som.tocar("clique"); // ouvir o volume novo
    if (t.dataset.opNarrador === "voz") Narrador.configurar({ voz: t.value });
  }

  // instala direto se o navegador já ofereceu; senão, a página com os passos de cada aparelho
  function instalar() {
    if (pedidoInstalar) {
      pedidoInstalar.prompt();
      pedidoInstalar = null;
      return true;
    }
    return false;
  }

  // o botão ⚙ fica no canto, junto do controle de música
  addEventListener("DOMContentLoaded", () => {
    const link = document.getElementById("link-instalar");
    if (link) {
      if (instalado()) link.hidden = true;
      link.addEventListener("click", (ev) => {
        if (instalar()) ev.preventDefault();
      });
    }
    const b = document.createElement("button");
    b.className = "btn-redondo btn-opcoes";
    b.title = "Opções (volumes, música, app)";
    b.setAttribute("aria-label", "Opções");
    b.textContent = "⚙";
    b.addEventListener("click", abrir);
    document.querySelector(".controle-musica")?.append(b);
  });

  return { get, mudar, abrir, instalar };
})();
