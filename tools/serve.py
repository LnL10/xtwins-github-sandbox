"""Serve a pasta website/ em http://localhost:8765/xtwins-github-sandbox/ (o mesmo caminho do GitHub Pages).

Uso: python tools/serve.py [porta]
A partir do docker compose do xTwins: http://host.docker.internal:8765/xtwins-github-sandbox/
"""

import http.server
import sys
from functools import partial
from pathlib import Path

PREFIX = "/xtwins-github-sandbox"
WEBSITE = Path(__file__).resolve().parent.parent / "website"


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".svg": "image/svg+xml"}

    def translate_path(self, path):
        if path == PREFIX:
            path = PREFIX + "/"
        if not path.startswith(PREFIX + "/"):
            return str(WEBSITE / "__nao_existe__")
        return super().translate_path(path[len(PREFIX):])

    def send_error(self, code, message=None, explain=None):
        if code == 404:  # como no GitHub Pages: 404.html
            body = (WEBSITE / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def log_message(self, format, *args):
        pass


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    server = http.server.ThreadingHTTPServer(("0.0.0.0", port), partial(Handler, directory=str(WEBSITE)))
    print(f"Loja Aurora em http://localhost:{port}{PREFIX}/")
    server.serve_forever()


if __name__ == "__main__":
    main()
