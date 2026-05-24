from word_search.infrastructure.network.socket_server import GameServer


def main() -> None:
    # Permite ejecutar el servidor por separado para pruebas manuales.
    server = GameServer()
    server.start()
    print(f"Servidor escuchando en {server.host}:{server.port}")

    try:
        while True:
            input("Presiona Enter para detener el servidor...\n")
            break
    finally:
        server.stop()
