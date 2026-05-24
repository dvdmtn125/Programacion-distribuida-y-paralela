from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class WordPlacement:
    # Representa una palabra y las coordenadas donde fue colocada.
    original_word: str
    display_word: str
    normalized_word: str
    coordinates: list[tuple[int, int]]


@dataclass(frozen=True)
class WordSearchGame:
    # Agrupa toda la informacion necesaria para una partida.
    language: str
    board: list[list[str]]
    placements: list[WordPlacement]
    words: list[str]
    size: int
    metadata: dict[str, str] = field(default_factory=dict)
