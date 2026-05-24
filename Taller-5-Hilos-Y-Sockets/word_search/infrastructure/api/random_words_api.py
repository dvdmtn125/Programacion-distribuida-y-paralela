from __future__ import annotations

import json
import random
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

from word_search.domain.services.word_normalizer import normalize_word


class RandomWordsApiClient:
    BASE_URL = "https://random-words-api.kushcreates.com/api"

    def __init__(self, rng: random.Random | None = None) -> None:
        self._rng = rng or random.Random()

    def fetch_words(self, language: str, count: int) -> list[dict[str, str]]:
        # Intenta obtener palabras desde la API y usa respaldo local si algo falla.
        try:
            with urlopen(f"{self.BASE_URL}?language={language}", timeout=15) as response:
                payload = json.load(response)
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
            payload = self._fallback_payload(language)

        cleaned_words = self._clean_payload(payload, language=language)
        if len(cleaned_words) < count:
            cleaned_words.extend(self._clean_payload(self._fallback_payload(language), language=language))

        unique: list[dict[str, str]] = []
        seen: set[str] = set()
        for item in cleaned_words:
            normalized = normalize_word(item["display"])
            if normalized in seen:
                continue
            seen.add(normalized)
            unique.append(item)

        if len(unique) < count:
            raise RuntimeError("No fue posible obtener suficientes palabras para iniciar el juego.")

        return self._rng.sample(unique, count)

    def _clean_payload(self, payload: Any, language: str) -> list[dict[str, str]]:
        # Filtra palabras poco utiles para el juego y las deja en un formato uniforme.
        cleaned: list[dict[str, str]] = []
        if not isinstance(payload, list):
            return cleaned

        for item in payload:
            if not isinstance(item, dict):
                continue
            word = str(item.get("word", "")).strip()
            if not word:
                continue
            normalized = normalize_word(word)
            if len(normalized) < 4 or len(normalized) > 12:
                continue
            cleaned.append(
                {
                    "original": word,
                    "display": normalized if language == "en" else normalized,
                }
            )
        return cleaned

    def _fallback_payload(self, language: str) -> list[dict[str, str]]:
        # Respaldo local para no depender por completo de la red.
        if language == "es":
            return [
                {"word": "computadora"},
                {"word": "ventana"},
                {"word": "servidor"},
                {"word": "cliente"},
                {"word": "escuela"},
                {"word": "paralelo"},
                {"word": "socket"},
                {"word": "algoritmo"},
                {"word": "variable"},
                {"word": "teclado"},
                {"word": "monitor"},
                {"word": "python"},
            ]

        return [
            {"word": "computer"},
            {"word": "network"},
            {"word": "thread"},
            {"word": "socket"},
            {"word": "science"},
            {"word": "window"},
            {"word": "teacher"},
            {"word": "library"},
            {"word": "display"},
            {"word": "project"},
            {"word": "student"},
            {"word": "campus"},
        ]
