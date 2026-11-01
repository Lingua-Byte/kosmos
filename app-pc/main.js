// App de PC do KOSMOS: uma janela própria que abre o jogo publicado.
// O jogo em si continua no site (lingua-byte.github.io/kosmos), então toda mudança publicada
// aparece no app sem precisar gerar outro .exe. Sem internet, usa o que ficou guardado do último uso.

const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const JOGO = "https://lingua-byte.github.io/kosmos/";

// música e vozes podem começar sem esperar um clique (é um jogo, não um site)
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

function criarJanela() {
  const janela = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 360,
    minHeight: 600,
    title: "KOSMOS",
    backgroundColor: "#03050e",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "icone.png"),
  });

  janela.loadURL(JOGO);

  // sem internet e sem nada guardado ainda: uma tela explicando
  janela.webContents.on("did-fail-load", (_ev, _codigo, _desc, url, principal) => {
    if (principal && url.startsWith(JOGO)) janela.loadFile(path.join(__dirname, "offline.html"));
  });

  // links para fora do jogo (Spotify, YouTube Music...) abrem no navegador
  janela.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(JOGO)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });

  // F11: tela cheia
  janela.webContents.on("before-input-event", (_ev, tecla) => {
    if (tecla.type === "keyDown" && tecla.key === "F11") janela.setFullScreen(!janela.isFullScreen());
  });
}

app.whenReady().then(criarJanela);
app.on("window-all-closed", () => app.quit());
