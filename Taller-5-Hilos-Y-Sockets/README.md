# Taller 5 - Hilos y Sockets

Proyecto de sopa de letras en Python con arquitectura limpia, sockets TCP, hilos y una interfaz grafica en `tkinter`.

## Caracteristicas

- Usa `uv` para ejecutar y administrar el proyecto.
- Puede consultar un workflow de `n8n` para obtener y validar palabras con Gemini.
- Mantiene fallback a la API `https://random-words-api.kushcreates.com/api`.
- Genera 10 palabras por partida en ingles (`en`) o espanol (`es`).
- Inicia un servidor TCP local y una interfaz cliente que se comunica por sockets.
- El tablero es dinamico, muestra temporizador y tiene opcion `Resolver`.
- Emplea hilos para aceptar clientes, atender conexiones y ubicar palabras en el tablero.

## Estructura Clean

```text
word_search/
|-- application/
|-- domain/
|-- infrastructure/
`-- presentation/
```

## Configuracion local

El archivo `.env` guarda valores locales y no se sube a GitHub gracias a `.gitignore`.
Debes poner tu nueva API key de Gemini en:

```text
.env
```

Ejemplo:

```env
N8N_WORDS_WEBHOOK_URL=http://localhost:5678/webhook/words-validator
N8N_TIMEOUT_SECONDS=60
GEMINI_API_KEY=tu_api_key_nueva_de_gemini
```

La app Python usa `N8N_WORDS_WEBHOOK_URL` y `N8N_TIMEOUT_SECONDS`.
`GEMINI_API_KEY` la usa `n8n`, no Python directamente.

## Integracion con n8n

1. Importa el workflow [Words Validation for Word Search.json](D:/Documentos/Universidad/Programacion-paralela-y-distribuida/Practica/Taller-5-Hilos-Y-Sockets/n8n/Words%20Validation%20for%20Word%20Search.json) en `n8n`.
2. En el nodo `Validate With Gemini`, usa una credencial `Header Auth` con:

```text
Name: x-goog-api-key
Value: tu_api_key_nueva_de_gemini
```

3. Publica el webhook:

```text
http://localhost:5678/webhook/words-validator
```

Si modificas el archivo del workflow en el proyecto, recuerda reimportarlo o actualizar el workflow publicado en `n8n`; de lo contrario, la app seguira usando la version anterior.

## Ejecucion con uv

En esta opcion no se agregan dependencias para cargar `.env` automaticamente. Define las variables de Python en PowerShell y luego ejecuta:

```powershell
$env:N8N_WORDS_WEBHOOK_URL="http://localhost:5678/webhook/words-validator"
$env:N8N_TIMEOUT_SECONDS="60"

uv run python main.py
```

Si `n8n` responde correctamente, en consola veras:

```text
[WORDS] Fuente utilizada: N8nWorkflowClient
```

Si `n8n` no responde, el servidor vuelve automaticamente a la API directa para no romper el juego.

## Ejecucion separada

Servidor:

```powershell
$env:N8N_WORDS_WEBHOOK_URL="http://localhost:5678/webhook/words-validator"
$env:N8N_TIMEOUT_SECONDS="60"

uv run python -m word_search.server_launcher
```

Cliente:

```powershell
uv run python -m word_search.client_launcher
```

Puedes abrir varios clientes en terminales distintas usando el mismo comando. Todos se conectan al servidor activo en `127.0.0.1:5050`.

Cliente y servidor embebido en una sola ejecucion:

```bash
uv run python main.py
```

## Como jugar

1. Escoge `es` o `en`.
2. Presiona `Nuevo juego`.
3. Selecciona la primera y la ultima letra de una palabra.
4. Usa `Resolver` para mostrar todas las palabras en el tablero.
