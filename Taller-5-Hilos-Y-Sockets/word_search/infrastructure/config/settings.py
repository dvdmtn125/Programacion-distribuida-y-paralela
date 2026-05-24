from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class AppSettings:
    # Reune la configuracion externa de la aplicacion.
    n8n_words_webhook_url: str | None
    n8n_timeout_seconds: int


def load_settings() -> AppSettings:
    # Lee variables de entorno y aplica valores seguros por defecto.
    timeout_value = os.getenv("N8N_TIMEOUT_SECONDS", "15").strip() or "15"
    try:
        timeout_seconds = int(timeout_value)
    except ValueError:
        timeout_seconds = 15

    webhook_url = os.getenv("N8N_WORDS_WEBHOOK_URL", "").strip() or None
    return AppSettings(
        n8n_words_webhook_url=webhook_url,
        n8n_timeout_seconds=max(1, timeout_seconds),
    )
