from __future__ import annotations

import json
import socket


class GameClient:
    def __init__(self, host: str, port: int) -> None:
        # Cliente usado por la GUI para pedir partidas al servidor.
        self._host = host
        self._port = port

    def _log(self, message: str) -> None:
        print(f"[CLIENT {self._host}:{self._port}] {message}")

    def _build_log_response(self, response: dict[str, object]) -> str:
        # Resume la respuesta para los logs sin exponer el tablero.
        if response.get("status") != "ok":
            return json.dumps(response, ensure_ascii=False)

        game = dict(response.get("game", {}))
        sanitized_game = {
            "language": game.get("language"),
            "size": game.get("size"),
            "words": game.get("words"),
        }
        return json.dumps({"status": "ok", "game": sanitized_game}, ensure_ascii=False)

    def request_game(self, language: str) -> dict[str, object]:
        # Envia al servidor el idioma seleccionado y espera la partida generada.
        request = {"action": "start_game", "language": language}
        self._log(f"Abriendo conexion para solicitar partida en idioma '{language}'.")
        with socket.create_connection((self._host, self._port), timeout=10) as connection:
            self._log("Conexion establecida.")
            file = connection.makefile(mode="rwb")
            request_payload = json.dumps(request)
            self._log(f"Solicitud enviada: {request_payload}")
            file.write((request_payload + "\n").encode("utf-8"))
            file.flush()
            raw_response = file.readline()

        if not raw_response:
            raise RuntimeError("El servidor no devolvio informacion.")

        decoded_response = raw_response.decode("utf-8").strip()
        response = json.loads(decoded_response)
        self._log(f"Respuesta recibida: {self._build_log_response(response)}")
        if response.get("status") != "ok":
            raise RuntimeError(str(response.get("message", "No fue posible iniciar el juego.")))
        self._log("Partida recibida correctamente.")
        return response["game"]
