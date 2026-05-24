from word_search.infrastructure.network.socket_server import GameServer
from word_search.presentation.gui.app import WordSearchApp


def main() -> None:
    # Inicia el servidor local antes de abrir la interfaz.
    server = GameServer()
    server.start()

    try:
        app = WordSearchApp(server_host=server.host, server_port=server.port)
        app.run()
    finally:
        # Siempre libera el socket al cerrar la aplicacion.
        server.stop()
