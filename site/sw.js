// Service worker do app KOSMOS: faz o jogo instalável e funcionar sem internet,
// sem nunca prender uma versão velha.
//   · Código e textos (html, js, css, json): sempre busca a versão nova na rede;
//     só usa a cópia guardada se estiver sem internet. Toda mudança publicada chega no próximo abrir.
//   · Imagens, áudio e vídeo: usa a cópia guardada (são pesados) e atualiza em segundo plano.
//   · Outros sites (YouTube, fontes, vozes neurais): passam direto, sem cache.

const CACHE = "kosmos-app";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (ev) => ev.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.includes("/__")) return; // servidor do PC (recarregar, Oficina)
  if (req.headers.has("range")) return; // vídeo pedido aos pedaços: direto da rede

  const pesado = /\.(webp|png|jpe?g|gif|mp3|mp4|webm|ogg)$/i.test(url.pathname);
  ev.respondWith(pesado ? guardadoPrimeiro(req) : redePrimeiro(req));
});

async function redePrimeiro(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req, { cache: "no-store" });
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const guardado = await cache.match(req, { ignoreSearch: true });
    if (guardado) return guardado;
    throw new Error("sem internet e sem cópia guardada");
  }
}

async function guardadoPrimeiro(req) {
  const cache = await caches.open(CACHE);
  const guardado = await cache.match(req);
  const daRede = fetch(req)
    .then((res) => {
      if (res.ok && res.status === 200) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return guardado || (await daRede) || new Response("", { status: 404 });
}
