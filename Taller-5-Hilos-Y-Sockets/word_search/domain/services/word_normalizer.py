from __future__ import annotations

import re
import unicodedata


def normalize_word(word: str) -> str:
    # Normaliza la palabra para el tablero: sin acentos, simbolos y en mayusulas.
    normalized = unicodedata.normalize("NFD", word)
    normalized = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    normalized = re.sub(r"[^A-Za-z]", "", normalized)
    return normalized.upper()
