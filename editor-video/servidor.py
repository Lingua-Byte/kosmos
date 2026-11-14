"""
Servidor do Editor de Vídeo com Claude.

- Serve a pasta editor-video/ em http://127.0.0.1:8765 (só neste computador).
- POST /api/claude   repassa a conversa do assistente para a API do Claude
                     (a chave fica aqui, nunca no navegador).
- POST /api/converter converte a exportação WebM em MP4 com o ffmpeg, se houver.
- GET  /api/estado   diz se há chave configurada e se o ffmpeg existe.

Chave: defina ANTHROPIC_API_KEY (ou faça `ant auth login`) antes de rodar.

Uso:  python editor-video/servidor.py          (porta 8765)
      python editor-video/servidor.py 9000     (outra porta)
"""

import http.server
import json
import os
import shutil
import socketserver
import subprocess
import sys
import tempfile

try:
    import anthropic
except ImportError:  # o editor funciona sem o assistente
    anthropic = None

PORTA = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
PASTA = os.path.dirname(os.path.abspath(__file__))
MODELO = os.environ.get("EDITOR_MODELO", "claude-opus-5-5")
LIMITE_CORPO = 40 * 1024 * 1024        # conversa com imagens de quadros
LIMITE_VIDEO = 4 * 1024 * 1024 * 1024  # exportação para converter

_cliente = None


def cliente():
    global _cliente
    if _cliente is None:
        _cliente = anthropic.Anthropic()
    return _cliente


def tem_credencial():
    if anthropic is None:
        return False
    if os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"):
        return True
    # Perfil salvo por `ant auth login` (a SDK lê sozinha).
    perfis = os.path.join(os.environ.get("XDG_CONFIG_HOME") or os.path.expanduser("~/.config"), "anthropic")
    return bool(os.environ.get("ANTHROPIC_PROFILE")) or os.path.isdir(perfis)


def perguntar_ao_claude(pedido):
    """Uma volta da conversa. O laço de ferramentas roda no navegador,
    que é onde está a linha do tempo."""
    resposta = cliente().beta.messages.create(
        model=MODELO,
        max_tokens=16000,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        output_config={"effort": pedido.get("esforco") or "medium"},
        cache_control={"type": "ephemeral"},
        system=pedido["system"],
        tools=pedido.get("tools") or [],
        messages=pedido["messages"],
    )
    return resposta.to_dict()


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PASTA, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, formato, *args):
        if "/api/" in (self.path or ""):
            super().log_message(formato, *args)

    def responder(self, status, dados):
        corpo = json.dumps(dados, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def do_GET(self):
        if self.path.startswith("/api/estado"):
            return self.responder(200, {
                "assistente": tem_credencial(),
                "sdk": anthropic is not None,
                "ffmpeg": shutil.which("ffmpeg") is not None,
                "modelo": MODELO,
            })
        if self.path.endswith(".py"):
            return self.send_error(404)
        super().do_GET()

    def do_POST(self):
        if self.path == "/api/claude":
            return self.api_claude()
        if self.path == "/api/converter":
            return self.api_converter()
        self.send_error(404)

    def ler_corpo(self, limite):
        tamanho = int(self.headers.get("Content-Length") or 0)
        if tamanho <= 0 or tamanho > limite:
            return None
        return self.rfile.read(tamanho)

    def api_claude(self):
        if anthropic is None:
            return self.responder(500, {"erro": "Instale a SDK: pip install anthropic"})
        if not tem_credencial():
            return self.responder(401, {"erro": "Sem chave da API. Defina ANTHROPIC_API_KEY (ou rode `ant auth login`) e reinicie o servidor."})
        corpo = self.ler_corpo(LIMITE_CORPO)
        if corpo is None:
            return self.responder(413, {"erro": "Conversa grande demais. Comece uma nova."})
        try:
            pedido = json.loads(corpo)
            return self.responder(200, perguntar_ao_claude(pedido))
        except anthropic.AuthenticationError:
            return self.responder(401, {"erro": "Chave inválida. Confira ANTHROPIC_API_KEY."})
        except anthropic.PermissionDeniedError:
            return self.responder(403, {"erro": "A chave não tem permissão para este modelo."})
        except anthropic.RateLimitError as e:
            espera = e.response.headers.get("retry-after", "60")
            return self.responder(429, {"erro": f"Limite de uso atingido. Tente em {espera}s."})
        except anthropic.BadRequestError as e:
            return self.responder(400, {"erro": f"Pedido recusado pela API: {e.message}"})
        except anthropic.APIStatusError as e:
            return self.responder(502, {"erro": f"Erro da API ({e.status_code}). Tente de novo."})
        except anthropic.APIConnectionError:
            return self.responder(502, {"erro": "Sem conexão com a API do Claude."})
        except Exception as e:  # sem credencial, JSON inválido etc.
            return self.responder(500, {"erro": str(e)})

    def api_converter(self):
        if shutil.which("ffmpeg") is None:
            return self.responder(501, {"erro": "ffmpeg não encontrado."})
        corpo = self.ler_corpo(LIMITE_VIDEO)
        if corpo is None:
            return self.responder(413, {"erro": "Vídeo vazio ou grande demais."})
        with tempfile.TemporaryDirectory() as pasta:
            entrada = os.path.join(pasta, "entrada.webm")
            saida = os.path.join(pasta, "saida.mp4")
            with open(entrada, "wb") as f:
                f.write(corpo)
            processo = subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", entrada,
                 "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                 "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                 "-movflags", "+faststart", saida],
                capture_output=True, text=True,
            )
            if processo.returncode != 0:
                return self.responder(500, {"erro": processo.stderr[-400:]})
            with open(saida, "rb") as f:
                video = f.read()
        self.send_response(200)
        self.send_header("Content-Type", "video/mp4")
        self.send_header("Content-Length", str(len(video)))
        self.end_headers()
        self.wfile.write(video)


class Servidor(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    with Servidor(("127.0.0.1", PORTA), Handler) as servidor:
        print(f"Editor de vídeo: http://127.0.0.1:{PORTA}")
        if not tem_credencial():
            print("Aviso: sem chave da API. O editor abre, mas o assistente fica desligado.")
            print("       Defina ANTHROPIC_API_KEY ou rode `ant auth login`.")
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            pass
