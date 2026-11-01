// Fundo animado: galáxia espiral girando + campo de estrelas.
// Galaxia.dobra(true) acelera tudo (efeito de "salto" ao entrar no Kosmos).

const Galaxia = (() => {
  const canvas = document.getElementById("galaxia");
  const ctx = canvas.getContext("2d");
  let w, h, dpr;
  let estrelas = [];
  let particulas = [];
  let velocidade = 1;
  let alvoVelocidade = 1;
  let zoom = 1;
  let alvoZoom = 1;
  let tempo = 0;

  const CORES = ["#f5d78e", "#ffe9b8", "#c9d8ff", "#8fb4ff", "#e8a26a", "#ffffff"];

  function redimensionar() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function criar() {
    const area = w * h;
    estrelas = Array.from({ length: Math.round(area / 2500) }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: Math.random(),
      fase: Math.random() * Math.PI * 2,
    }));

    // Dois braços espirais com dispersão, mais densos no núcleo
    const n = w < 700 ? 1600 : 3200;
    particulas = Array.from({ length: n }, () => {
      const braco = Math.random() < 0.5 ? 0 : Math.PI;
      const r = Math.pow(Math.random(), 1.6);
      const disp = (Math.random() - 0.5) * (0.35 + r * 0.5);
      return {
        r,
        a: braco + r * 5.2 + disp,
        y: (Math.random() - 0.5) * 0.06 * (1 - r),
        cor: r < 0.18 ? CORES[Math.floor(Math.random() * 2)] : CORES[Math.floor(Math.random() * CORES.length)],
        tam: Math.random() * 1.5 + (r < 0.15 ? 0.8 : 0.6),
      };
    });
  }

  function quadro() {
    velocidade += (alvoVelocidade - velocidade) * 0.03;
    zoom += (alvoZoom - zoom) * 0.02;
    tempo += 0.0016 * velocidade;

    ctx.fillStyle = "rgba(3, 5, 14, " + (velocidade > 3 ? 0.25 : 1) + ")";
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const escala = Math.max(w, h) * 0.42 * zoom;

    // Estrelas de fundo: piscam em repouso, viram rastros no salto
    for (const e of estrelas) {
      if (velocidade > 1.5) {
        e.z -= 0.004 * velocidade;
        if (e.z <= 0.02) {
          e.z = 1;
          e.x = (Math.random() - 0.5) * 2;
          e.y = (Math.random() - 0.5) * 2;
        }
      }
      const px = cx + (e.x / e.z) * w * 0.25;
      const py = cy + (e.y / e.z) * h * 0.25;
      if (px < 0 || px > w || py < 0 || py > h) continue;
      const brilho = 0.35 + 0.65 * Math.abs(Math.sin(tempo * 3 + e.fase));
      ctx.fillStyle = `rgba(255,255,255,${brilho * (1 - e.z * 0.6)})`;
      if (velocidade > 1.5) {
        const px2 = cx + (e.x / (e.z + 0.02 * velocidade)) * w * 0.25;
        const py2 = cy + (e.y / (e.z + 0.02 * velocidade)) * h * 0.25;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px2, py2);
        ctx.lineTo(px, py);
        ctx.stroke();
      } else {
        ctx.fillRect(px, py, 1.2, 1.2);
      }
    }

    // Brilho do núcleo
    const nucleo = ctx.createRadialGradient(cx, cy, 0, cx, cy, escala * 0.35);
    nucleo.addColorStop(0, "rgba(255, 228, 170, 0.55)");
    nucleo.addColorStop(0.3, "rgba(230, 160, 100, 0.18)");
    nucleo.addColorStop(1, "rgba(40, 60, 140, 0)");
    ctx.fillStyle = nucleo;
    ctx.beginPath();
    ctx.ellipse(cx, cy, escala * 0.6, escala * 0.24, -0.45, 0, Math.PI * 2);
    ctx.fill();

    // Galáxia inclinada (-0.45 rad), achatada no eixo vertical
    const inclinacao = -0.45;
    const cosI = Math.cos(inclinacao);
    const sinI = Math.sin(inclinacao);
    for (const p of particulas) {
      const ang = p.a + tempo * (1.2 - p.r * 0.8);
      const gx = Math.cos(ang) * p.r;
      const gy = Math.sin(ang) * p.r * 0.36 + p.y;
      const x = cx + (gx * cosI - gy * sinI) * escala;
      const y = cy + (gx * sinI + gy * cosI) * escala;
      ctx.globalAlpha = 0.95 - p.r * 0.4;
      ctx.fillStyle = p.cor;
      ctx.fillRect(x, y, p.tam, p.tam);
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(quadro);
  }

  window.addEventListener("resize", () => {
    redimensionar();
    criar();
  });
  redimensionar();
  criar();
  requestAnimationFrame(quadro);

  return {
    dobra(ativo) {
      alvoVelocidade = ativo ? 14 : 1;
      alvoZoom = ativo ? 2.6 : 1;
    },
    repouso(z = 1) {
      alvoVelocidade = 0.6;
      alvoZoom = z;
    },
  };
})();
