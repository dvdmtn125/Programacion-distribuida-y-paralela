from __future__ import annotations

import json
import socket
import threading
from contextlib import suppress

from word_search.application.game_service import GameService


class GameServer:
    def __init__(self, host: str = "127.0.0.1", port: int = 5050) -> None:
        # Prepara el socket TCP y el servicio que genera las partidas.
        self.host = host
        self.port = port
        self._game_service = GameService()
        self._server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self._running = threading.Event()
        self._accept_thread: threading.Thread | None = None
        self._client_threads: list[threading.Thread] = []

    def _log(self, message: str) -> None:
        print(f"[SERVER {self.host}:{self.port}] {message}")

    def _build_log_response(self, response: dict[str, object]) -> str:
        # Resume la respuesta para no imprimir el tablero completo en consola.
        if response.get("status") != "ok":
            return json.dumps(response, ensure_ascii=False)

        game = dict(response.get("game", {}))
        sanitized_game = {
            "language": game.get("language"),
            "size": game.get("size"),
            "words": game.get("words"),
        }
        return json.dumps({"status": "ok", "game": sanitized_game}, ensure_ascii=False)

    def start(self) -> None:
        # Levanta el servidor y crea el hilo que acepta conexiones.
        if self._running.is_set():
            return
        self._server_socket.bind((self.host, self.port))
        self._server_socket.listen()
        self._server_socket.settimeout(1)
        self._running.set()
        self._log("Servidor iniciado y esperando conexiones.")
        self._accept_thread = threading.Thread(target=self._accept_clients, daemon=True)
        self._accept_thread.start()

    def stop(self) -> None:
        # Detiene el socket y espera a que los hilos terminen.
        self._running.clear()
        self._log("Deteniendo servidor.")
        with suppress(OSError):
            self._server_socket.close()

        if self._accept_thread and self._accept_thread.is_alive():
            self._accept_thread.join(timeout=2)

        for thread in self._client_threads:
            if thread.is_alive():
                thread.join(timeout=2)

    def _accept_clients(self) -> None:
        # Atiende nuevas conexiones creando un hilo por cliente.
        while self._running.is_set():
            try:
                client_socket, address = self._server_socket.accept()
            except TimeoutError:
                continue
            except OSError:
                break

            self._log(f"Conexion aceptada desde {address[0]}:{address[1]}.")

            client_thread = threading.Thread(target=self._handle_client, args=(client_socket,), daemon=True)
            self._client_threads.append(client_thread)
            client_thread.start()

    def _handle_client(self, client_socket: socket.socket) -> None:
        # Procesa una solicitud JSON y devuelve una unica respuesta.
        with client_socket:
            file = client_socket.makefile(mode="rwb")
            raw_request = file.readline()
            if not raw_request:
                self._log("Se recibio una conexion vacia.")
                return

            decoded_request = raw_request.decode("utf-8").strip()
            self._log(f"Solicitud recibida: {decoded_request}")

            response = self._process_request(decoded_request)
            response_payload = json.dumps(response)
            self._log(f"Respuesta enviada: {self._build_log_response(response)}")
            file.write((response_payload + "\n").encode("utf-8"))
            file.flush()
            self._log("Comunicacion con cliente finalizada.")

    def _process_request(self, raw_request: str) -> dict[str, object]:
        # Interpreta la accion pedida por el cliente y genera la partida.
        try:
            request = json.loads(raw_request)
            action = request.get("action")
            if action != "start_game":
                raise ValueError("Accion no soportada.")

            language = str(request.get("language", "en"))
            game = self._game_service.create_game(language)
            return {
                "status": "ok",
                "game": {
                    "language": game.language,
                    "board": game.board,
                    "size": game.size,
                    "words": game.words,
                    "placements": [
                        {
                            "display_word": placement.display_word,
                            "normalized_word": placement.normalized_word,
                            "coordinates": placement.coordinates,
                        }
                        for placement in game.placements
                    ],
                },
            }
        except Exception as exc:
            return {"status": "error", "message": str(exc)}
