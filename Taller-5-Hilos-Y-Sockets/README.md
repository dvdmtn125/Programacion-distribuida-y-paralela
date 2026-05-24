# Taller 5 - Hilos y Sockets

Proyecto de sopa de letras en Python con arquitectura limpia, sockets TCP, hilos y una interfaz grafica en `tkinter`.

## Caracteristicas

- Usa `uv` para ejecutar y administrar el proyecto.
- Puede consultar un workflow de `n8n` para obtener y validar palabras.
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

## Ejecucion con uv

```bash
uv run python main.py
```

## Integracion con n8n

1. Importa el workflow [word_search_words_workflow.json](D:/Documentos/Universidad/Programacion-paralela-y-distribuida/Practica/Taller-5-Hilos-Y-Sockets/n8n/word_search_words_workflow.json) en `n8n`.
2. Configura tu clave de Gemini en el nodo `Validate With Gemini`.
3. Expone el webhook del workflow real, por ejemplo:

```text
http://localhost:5678/webhook/words-validator
```

4. Antes de ejecutar la app, define:

```powershell
$env:N8N_WORDS_WEBHOOK_URL="http://localhost:5678/webhook/words-validator"
```

Opcionalmente puedes ajustar el timeout:

```powershell
$env:N8N_TIMEOUT_SECONDS="15"
```

El JSON del repo ya esta saneado para que no guarde la clave de Gemini dentro del archivo; configúrala directamente en `n8n`.
Si modificas el archivo del workflow en el proyecto, recuerda reimportarlo o actualizar el workflow publicado en `n8n`; de lo contrario, la app seguira usando la version anterior.

Si `n8n` no responde, el servidor vuelve automaticamente a la API directa para no romper el juego.

## Ejecucion separada

Servidor:

```bash
uv run python -m word_search.server_launcher
```

Cliente y servidor embebido:

```bash
uv run python main.py
```

## Como jugar

1. Escoge `es` o `en`.
2. Presiona `Nuevo juego`.
3. Selecciona la primera y la ultima letra de una palabra.
4. Usa `Resolver` para mostrar todas las palabras en el tablero.
