from __future__ import annotations

import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from word_search.domain.services.word_normalizer import normalize_word


class N8nWorkflowClient:
    def __init__(self, webhook_url: str, timeout_seconds: int = 15) -> None:
        self._webhook_url = webhook_url.strip()
        self._timeout_seconds = timeout_seconds

    def fetch_words(self, language: str, count: int) -> list[dict[str, str]]:
        # Envía el idioma al workflow y espera un JSON con palabras validadas.
        if not self._webhook_url:
            raise RuntimeError("No se configuro la URL del workflow de n8n.")

        payload = json.dumps({"language": language}).encode("utf-8")
        request = Request(
            self._webhook_url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urlopen(request, timeout=self._timeout_seconds) as response:
                raw_payload = json.load(response)
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"El workflow de n8n no respondio correctamente: {exc}") from exc

        words = raw_payload.get("words")
        if not isinstance(words, list):
            raise RuntimeError("El workflow de n8n no devolvio la lista 'words'.")

        # Convierte la respuesta del workflow al formato que usa el dominio.
        cleaned_words: list[dict[str, str]] = []
        seen: set[str] = set()
        for item in words:
            original_word = str(item).strip()
            normalized = normalize_word(original_word)
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            cleaned_words.append({"original": original_word, "display": normalized})

        if len(cleaned_words) < count:
            raise RuntimeError("El workflow de n8n no devolvio suficientes palabras validas.")

        return cleaned_words[:count]
