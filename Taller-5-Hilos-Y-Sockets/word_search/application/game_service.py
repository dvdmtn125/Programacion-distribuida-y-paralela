from __future__ import annotations

from typing import Iterable

from word_search.application.ports.word_source import WordSource
from word_search.domain.entities import WordSearchGame
from word_search.domain.services.board_generator import BoardGenerator, BoardWord
from word_search.domain.services.word_normalizer import normalize_word
from word_search.infrastructure.api.random_words_api import RandomWordsApiClient
from word_search.infrastructure.automation.n8n_words_workflow import N8nWorkflowClient
from word_search.infrastructure.config.settings import AppSettings, load_settings


class GameService:
    def __init__(
        self,
        word_sources: Iterable[WordSource] | None = None,
        board_generator: BoardGenerator | None = None,
        settings: AppSettings | None = None,
    ) -> None:
        # Carga la configuracion y deja listas las fuentes de palabras disponibles.
        self._settings = settings or load_settings()
        self._word_sources = list(word_sources or self._build_default_sources())
        self._board_generator = board_generator or BoardGenerator()

    def create_game(self, language: str) -> WordSearchGame:
        # Orquesta el caso de uso principal: obtener palabras y construir la partida.
        normalized_language = self._normalize_language(language)
        fetched_words = self._fetch_words(normalized_language, count=10)
        board_words = [
            BoardWord(
                original_word=item["original"],
                display_word=item["display"],
                normalized_word=normalize_word(item["display"]),
            )
            for item in fetched_words
        ]
        return self._board_generator.generate(normalized_language, board_words)

    def _build_default_sources(self) -> list[WordSource]:
        # Si existe un webhook de n8n configurado, se usa primero.
        # Si falla o no existe, se mantiene la API directa como respaldo.
        sources: list[WordSource] = []
        if self._settings.n8n_words_webhook_url:
            sources.append(
                N8nWorkflowClient(
                    webhook_url=self._settings.n8n_words_webhook_url,
                    timeout_seconds=self._settings.n8n_timeout_seconds,
                )
            )
        sources.append(RandomWordsApiClient())
        return sources

    def _fetch_words(self, language: str, count: int) -> list[dict[str, str]]:
        # Intenta cada fuente en orden hasta conseguir suficientes palabras validas.
        errors: list[str] = []
        for source in self._word_sources:
            try:
                words = source.fetch_words(language=language, count=count)
                print(f"[WORDS] Fuente utilizada: {source.__class__.__name__}")
                return words
            except Exception as exc:
                print(f"[WORDS] Fallback activado tras fallo en {source.__class__.__name__}: {exc}")
                errors.append(f"{source.__class__.__name__}: {exc}")

        raise RuntimeError(
            "No fue posible obtener palabras para la partida. "
            + " | ".join(errors)
        )

    def _normalize_language(self, language: str) -> str:
        # Acepta varias formas de escribir el idioma para hacer mas tolerante la entrada.
        selected = language.strip().lower()
        if selected in {"ingles", "inglés", "english", "en"}:
            return "en"
        if selected in {"espanol", "español", "spanish", "es"}:
            return "es"
        raise ValueError("Idioma no soportado. Usa 'en' o 'es'.")
