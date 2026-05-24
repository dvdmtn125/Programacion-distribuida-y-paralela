from __future__ import annotations

from typing import Protocol


class WordSource(Protocol):
    # Contrato comun para cualquier origen de palabras.
    def fetch_words(self, language: str, count: int) -> list[dict[str, str]]:
        """Return words ready to be used by the game."""
