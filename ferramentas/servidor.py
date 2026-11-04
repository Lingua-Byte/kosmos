"""
Servidor de desenvolvimento do KOSMOS.

- Serve a pasta site/ para o computador E para o celular na mesma rede Wi-Fi.
- Nunca deixa o navegador guardar arquivos velhos (sem cache).
- /__versao responde com a data da última mudança em site/: as páginas abertas
  (computador ou celular) recarregam sozinhas quando algo muda.

Uso:  python ferramentas/servidor.py          (porta 5173)
"""

import http.server
import json
import os
import socket
import socketserver
import sys

PORTA = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")


def ultima_mudanca():
    maior = 0.0
    for raiz, _pastas, arquivos in os.walk(SITE):
        for nome in arquivos:
            if nome.endswith(".json") and raiz.endswith("dados"):
                continue  # léxicos são grandes e só mudam ao rodar os geradores
            try:
                maior = max(maior, os.path.getmtime(os.path.join(raiz, nome)))
            except OSError:
                pass
    return maior


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SITE, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path.startswith("/__versao"):
            corpo = json.dumps({"versao": ultima_mudanca()}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(corpo)))
            self.end_headers()
            self.wfile.write(corpo)
            return
        super().do_GET()

    # A Oficina do Autor salva aqui o que foi escrito: site/dados/oficina.json
    # (a versão anterior fica em ferramentas/oficina-anterior.json, fora do site)
    def do_POST(self):
        if self.path == "/__missao":
            return self.publicar_missao()
        if self.path != "/__oficina":
            self.send_error(404)
            return
        try:
            tamanho = int(self.headers.get("Content-Length", 0))
            if tamanho > 20_000_000:
                raise ValueError("grande demais")
            dados = json.loads(self.rfile.read(tamanho).decode("utf-8"))
            if not isinstance(dados, dict) or "storylets" not in dados or "npcs" not in dados:
                raise ValueError("formato inesperado")
        except (ValueError, UnicodeDecodeError) as erro:
            self.send_error(400, str(erro))
            return
        destino = os.path.join(SITE, "dados", "oficina.json")
        novo = json.dumps(dados, ensure_ascii=False, indent=2) + "\n"
        if os.path.exists(destino):
            with open(destino, encoding="utf-8") as f:
                antigo = f.read()
            if antigo != novo:
                with open(os.path.join(os.path.dirname(SITE), "ferramentas", "oficina-anterior.json"), "w", encoding="utf-8") as f:
                    f.write(antigo)
        with open(destino, "w", encoding="utf-8") as f:
            f.write(novo)
        corpo = b'{"ok": true}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    # Criador de missões (diagramas.html → Publicar), no PC: grava site/missoes/<id>.json e o índice
    def publicar_missao(self):
        try:
            tamanho = int(self.headers.get("Content-Length", 0))
            if tamanho > 20_000_000:
                raise ValueError("grande demais")
            missao = json.loads(self.rfile.read(tamanho).decode("utf-8"))
            mid = str(missao.get("id", ""))
            if not mid or not all(c.isalnum() or c in "-_" for c in mid) or "cenas" not in missao:
                raise ValueError("missão sem id ou sem cenas")
        except (ValueError, UnicodeDecodeError, AttributeError) as erro:
            self.send_error(400, str(erro))
            return
        pasta = os.path.join(SITE, "missoes")
        os.makedirs(pasta, exist_ok=True)
        with open(os.path.join(pasta, mid + ".json"), "w", encoding="utf-8") as f:
            f.write(json.dumps(missao, ensure_ascii=False, indent=2) + "\n")
        indice = os.path.join(pasta, "indice.json")
        ids = []
        if os.path.exists(indice):
            with open(indice, encoding="utf-8") as f:
                ids = json.load(f)
        if mid not in ids:
            ids.append(mid)
        with open(indice, "w", encoding="utf-8") as f:
            f.write(json.dumps(ids, ensure_ascii=False, indent=2) + "\n")
        corpo = b'{"ok": true}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def log_message(self, formato, *args):
        if "/__versao" not in (str(args[0]) if args else ""):
            super().log_message(formato, *args)


def ip_local():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


class Servidor(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    with Servidor(("0.0.0.0", PORTA), Handler) as srv:
        print(f"KOSMOS no computador:  http://localhost:{PORTA}")
        print(f"KOSMOS no celular:     http://{ip_local()}:{PORTA}   (mesma rede Wi-Fi)")
        srv.serve_forever()
