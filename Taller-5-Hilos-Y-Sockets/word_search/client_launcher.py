import os

from word_search.presentation.gui.app import WordSearchApp


def main() -> None:
    # Abre solo la interfaz y se conecta a un servidor ya levantado.
    server_host = os.getenv("WORD_SEARCH_SERVER_HOST", "127.0.0.1")
    server_port = int(os.getenv("WORD_SEARCH_SERVER_PORT", "5050"))
    app = WordSearchApp(server_host=server_host, server_port=server_port)
    app.run()
