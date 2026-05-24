from __future__ import annotations

import math
import random
import threading
from dataclasses import dataclass

from word_search.domain.entities import WordPlacement, WordSearchGame


Direction = tuple[int, int]


@dataclass(frozen=True)
class BoardWord:
    # Version lista para insertar en el tablero.
    original_word: str
    display_word: str
    normalized_word: str


class BoardGenerationError(RuntimeError):
    """Raised when the board cannot be generated."""


class BoardGenerator:
    # Permite ubicar palabras en horizontal, vertical y diagonal.
    DIRECTIONS: tuple[Direction, ...] = (
        (-1, 0),
        (1, 0),
        (0, -1),
        (0, 1),
        (-1, -1),
        (-1, 1),
        (1, -1),
        (1, 1),
    )

    def __init__(self, rng: random.Random | None = None) -> None:
        self._rng = rng or random.Random()

    def generate(self, language: str, words: list[BoardWord]) -> WordSearchGame:
        # El taller pide exactamente 10 palabras por partida.
        if len(words) != 10:
            raise ValueError("Se requieren exactamente 10 palabras para iniciar el juego.")

        # Las palabras largas se ubican primero para reducir conflictos.
        ordered_words = sorted(words, key=lambda item: len(item.normalized_word), reverse=True)
        board_size = self._calculate_board_size(ordered_words)
        board = [["" for _ in range(board_size)] for _ in range(board_size)]
        placements: list[WordPlacement] = []
        errors: list[Exception] = []
        lock = threading.Lock()

        def place_word(word: BoardWord) -> None:
            # Cada palabra se intenta ubicar en su propio hilo.
            for _ in range(2_000):
                direction = self._rng.choice(self.DIRECTIONS)
                start_row = self._rng.randrange(board_size)
                start_col = self._rng.randrange(board_size)
                coordinates = self._build_coordinates(
                    start_row=start_row,
                    start_col=start_col,
                    direction=direction,
                    length=len(word.normalized_word),
                )
                if not coordinates:
                    continue

                with lock:
                    # El bloqueo evita escrituras concurrentes sobre el mismo tablero.
                    if self._can_place(board, word.normalized_word, coordinates):
                        for (row, col), letter in zip(coordinates, word.normalized_word, strict=True):
                            board[row][col] = letter
                        placements.append(
                            WordPlacement(
                                original_word=word.original_word,
                                display_word=word.display_word,
                                normalized_word=word.normalized_word,
                                coordinates=coordinates,
                            )
                        )
                        return

            errors.append(BoardGenerationError(f"No se pudo ubicar la palabra: {word.display_word}"))

        threads = [threading.Thread(target=place_word, args=(word,), daemon=True) for word in ordered_words]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()

        if errors:
            message = "; ".join(str(error) for error in errors)
            raise BoardGenerationError(message)

        # Las celdas restantes se rellenan al final con letras aleatorias.
        self._fill_empty_cells(board)
        sorted_placements = sorted(placements, key=lambda item: item.display_word)
        return WordSearchGame(
            language=language,
            board=board,
            placements=sorted_placements,
            words=[item.display_word for item in sorted_placements],
            size=board_size,
            metadata={"generated_by": "socket_server"},
        )

    def _calculate_board_size(self, words: list[BoardWord]) -> int:
        # Ajusta el tamano segun las longitudes totales del conjunto.
        total_letters = sum(len(word.normalized_word) for word in words)
        longest_word = max(len(word.normalized_word) for word in words)
        return max(12, longest_word + 2, math.ceil(math.sqrt(total_letters * 2.2)))

    def _build_coordinates(
        self,
        start_row: int,
        start_col: int,
        direction: Direction,
        length: int,
    ) -> list[tuple[int, int]] | None:
        row_step, col_step = direction
        coordinates: list[tuple[int, int]] = []
        for offset in range(length):
            row = start_row + (row_step * offset)
            col = start_col + (col_step * offset)
            coordinates.append((row, col))

        if any(min(row, col) < 0 for row, col in coordinates):
            return None

        board_limit = max(max(row for row, _ in coordinates), max(col for _, col in coordinates))
        if board_limit < 0:
            return None

        return coordinates

    def _can_place(
        self,
        board: list[list[str]],
        word: str,
        coordinates: list[tuple[int, int]],
    ) -> bool:
        # Solo permite cruces cuando la letra coincide.
        size = len(board)
        for (row, col), letter in zip(coordinates, word, strict=True):
            if row >= size or col >= size:
                return False
            current = board[row][col]
            if current not in ("", letter):
                return False
        return True

    def _fill_empty_cells(self, board: list[list[str]]) -> None:
        # Completa espacios vacios para formar la sopa de letras.
        for row_index, row in enumerate(board):
            for col_index, value in enumerate(row):
                if not value:
                    board[row_index][col_index] = self._rng.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
