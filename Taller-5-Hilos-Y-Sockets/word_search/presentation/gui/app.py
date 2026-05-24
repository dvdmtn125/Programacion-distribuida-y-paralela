from __future__ import annotations

import tkinter as tk
from tkinter import messagebox, ttk
from typing import Any

from word_search.infrastructure.network.socket_client import GameClient


class WordSearchApp:
    # Paleta centralizada para mantener un estilo consistente.
    BG = "#f3efe7"
    PANEL = "#fffdf8"
    PANEL_ALT = "#fbf6ec"
    BORDER = "#d7c7a5"
    TEXT = "#2d2417"
    MUTED = "#7a6a54"
    GOLD = "#b8892d"
    GOLD_DARK = "#8d6621"
    ACCENT = "#2f6f62"
    ACCENT_DARK = "#1e5147"
    SELECTED = "#e2c98b"
    SOLVED = "#9dc7a5"
    CELL = "#fffaf0"
    CELL_TEXT = "#433622"

    def __init__(self, server_host: str, server_port: int) -> None:
        # La GUI trabaja como cliente del servidor socket local.
        self._client = GameClient(server_host, server_port)
        self._root = tk.Tk()
        self._root.title("Sopa de letras - Hilos y Sockets")
        self._root.geometry("1120x760")
        self._root.minsize(980, 680)
        self._root.configure(bg=self.BG)
        self._root.protocol("WM_DELETE_WINDOW", self._on_close)

        self._language = tk.StringVar(value="es")
        self._status = tk.StringVar(value="Selecciona un idioma y crea una partida nueva.")
        self._timer = tk.StringVar(value="00:00")
        self._summary = tk.StringVar(value="Sin partida activa")
        self._start_cell: tuple[int, int] | None = None
        self._selected_cells: list[tuple[int, int]] = []
        self._buttons: dict[tuple[int, int], tk.Button] = {}
        self._word_labels: dict[str, tk.Label] = {}
        self._words_canvas: tk.Canvas | None = None
        self._words_inner: tk.Frame | None = None
        self._solved_words: set[str] = set()
        self._current_game: dict[str, Any] | None = None
        self._elapsed_seconds = 0
        self._timer_job: str | None = None

        self._setup_styles()
        self._build_layout()

    def run(self) -> None:
        self._root.mainloop()

    def _setup_styles(self) -> None:
        # Ajusta el estilo base de ttk para armonizarlo con la paleta propia.
        style = ttk.Style()
        if "clam" in style.theme_names():
            style.theme_use("clam")

        style.configure(
            "Panel.TCombobox",
            fieldbackground=self.PANEL,
            background=self.PANEL,
            foreground=self.TEXT,
            bordercolor=self.BORDER,
            lightcolor=self.BORDER,
            darkcolor=self.BORDER,
            arrowsize=16,
            padding=6,
        )
        style.map(
            "Panel.TCombobox",
            fieldbackground=[("readonly", self.PANEL)],
            selectbackground=[("readonly", self.PANEL)],
            selectforeground=[("readonly", self.TEXT)],
        )

    def _build_layout(self) -> None:
        # Construye la ventana completa una sola vez. A partir de aqui solo se actualiza contenido.
        shell = tk.Frame(self._root, bg=self.BG, padx=24, pady=24)
        shell.pack(fill="both", expand=True)

        hero = tk.Frame(shell, bg=self.GOLD_DARK, padx=28, pady=24, highlightthickness=1, highlightbackground="#73521b")
        hero.pack(fill="x")

        left_header = tk.Frame(hero, bg=self.GOLD_DARK)
        left_header.pack(side="left", fill="both", expand=True)

        tk.Label(
            left_header,
            text="Sopa de Letras",
            font=("Georgia", 28, "bold"),
            bg=self.GOLD_DARK,
            fg="#fff8ea",
        ).pack(anchor="w")

        tk.Label(
            left_header,
            text="Arquitectura clean, sockets TCP y generacion concurrente de palabras.",
            font=("Segoe UI", 11),
            bg=self.GOLD_DARK,
            fg="#f6ead0",
        ).pack(anchor="w", pady=(8, 0))

        stats = tk.Frame(hero, bg=self.GOLD_DARK)
        stats.pack(side="right", padx=(24, 0))

        self._build_stat_card(stats, "Idioma", self._language, width=120).pack(side="left", padx=(0, 12))
        self._build_stat_card(stats, "Tiempo", self._timer, width=120).pack(side="left")

        main = tk.Frame(shell, bg=self.BG)
        main.pack(fill="both", expand=True, pady=(20, 0))

        left_column = tk.Frame(main, bg=self.BG)
        left_column.pack(side="left", fill="both", expand=True)

        control_card = self._create_card(left_column, self.PANEL_ALT, padx=20, pady=18)
        control_card.pack(fill="x")

        top_controls = tk.Frame(control_card, bg=self.PANEL_ALT)
        top_controls.pack(fill="x")

        label_block = tk.Frame(top_controls, bg=self.PANEL_ALT)
        label_block.pack(side="left")

        tk.Label(
            label_block,
            text="Panel de juego",
            font=("Segoe UI", 16, "bold"),
            bg=self.PANEL_ALT,
            fg=self.TEXT,
        ).pack(anchor="w")

        tk.Label(
            label_block,
            text="Escoge idioma, genera un tablero nuevo y encuentra las 10 palabras.",
            font=("Segoe UI", 10),
            bg=self.PANEL_ALT,
            fg=self.MUTED,
        ).pack(anchor="w", pady=(4, 0))

        actions = tk.Frame(top_controls, bg=self.PANEL_ALT)
        actions.pack(side="right")

        ttk.Combobox(
            actions,
            textvariable=self._language,
            state="readonly",
            width=8,
            values=("es", "en"),
            style="Panel.TCombobox",
        ).pack(side="left", padx=(0, 10))

        self._create_button(actions, "Nuevo juego", self._start_game, self.GOLD, "#fffaf0").pack(side="left")
        self._create_button(actions, "Resolver", self._reveal_solution, self.ACCENT, "#f6fffc").pack(side="left", padx=8)
        self._create_button(actions, "Limpiar", self._clear_selection, "#d8c5a1", self.TEXT).pack(side="left")

        summary_row = tk.Frame(control_card, bg=self.PANEL_ALT)
        summary_row.pack(fill="x", pady=(16, 0))

        self._summary_chip = tk.Label(
            summary_row,
            textvariable=self._summary,
            font=("Segoe UI", 10, "bold"),
            bg="#f0e1be",
            fg=self.GOLD_DARK,
            padx=14,
            pady=8,
        )
        self._summary_chip.pack(side="left")

        board_card = self._create_card(left_column, self.PANEL, padx=20, pady=20)
        board_card.pack(fill="both", expand=True, pady=(18, 0))

        board_header = tk.Frame(board_card, bg=self.PANEL)
        board_header.pack(fill="x", pady=(0, 16))

        tk.Label(
            board_header,
            text="Tablero",
            font=("Segoe UI", 16, "bold"),
            bg=self.PANEL,
            fg=self.TEXT,
        ).pack(side="left")

        tk.Label(
            board_header,
            text="Selecciona inicio y fin de cada palabra.",
            font=("Segoe UI", 10),
            bg=self.PANEL,
            fg=self.MUTED,
        ).pack(side="right")

        self._board_frame = tk.Frame(board_card, bg=self.PANEL)
        self._board_frame.pack(fill="both", expand=True)

        right_column = tk.Frame(main, bg=self.BG, width=300)
        right_column.pack(side="left", fill="y", padx=(20, 0))
        right_column.pack_propagate(False)

        words_card = self._create_card(right_column, self.PANEL, padx=18, pady=18)
        words_card.pack(fill="both", expand=True)

        tk.Label(
            words_card,
            text="Palabras ocultas",
            font=("Georgia", 18, "bold"),
            bg=self.PANEL,
            fg=self.TEXT,
        ).pack(anchor="w")

        tk.Label(
            words_card,
            text="Las encontradas cambian de color automaticamente.",
            font=("Segoe UI", 10),
            bg=self.PANEL,
            fg=self.MUTED,
        ).pack(anchor="w", pady=(6, 14))

        words_list_shell = tk.Frame(words_card, bg=self.PANEL)
        words_list_shell.pack(fill="both", expand=True)

        self._words_canvas = tk.Canvas(
            words_list_shell,
            bg=self.PANEL,
            highlightthickness=0,
            bd=0,
            relief="flat",
        )
        words_scrollbar = tk.Scrollbar(words_list_shell, orient="vertical", command=self._words_canvas.yview)
        self._words_canvas.configure(yscrollcommand=words_scrollbar.set)

        words_scrollbar.pack(side="right", fill="y")
        self._words_canvas.pack(side="left", fill="both", expand=True)

        self._words_inner = tk.Frame(self._words_canvas, bg=self.PANEL)
        self._words_canvas.create_window((0, 0), window=self._words_inner, anchor="nw")
        self._words_inner.bind("<Configure>", self._update_words_scrollregion)
        self._words_canvas.bind("<Configure>", self._resize_words_window)

        legend = self._create_card(right_column, self.PANEL_ALT, padx=18, pady=16)
        legend.pack(fill="x", pady=(18, 0))

        tk.Label(
            legend,
            text="Guia visual",
            font=("Segoe UI", 13, "bold"),
            bg=self.PANEL_ALT,
            fg=self.TEXT,
        ).pack(anchor="w")

        self._build_legend_item(legend, self.SELECTED, "Seleccion actual").pack(anchor="w", pady=(10, 6))
        self._build_legend_item(legend, self.SOLVED, "Palabra resuelta").pack(anchor="w", pady=6)
        self._build_legend_item(legend, self.CELL, "Celda disponible").pack(anchor="w", pady=6)

        status_card = self._create_card(right_column, self.PANEL_ALT, padx=18, pady=16)
        status_card.pack(fill="x", pady=(18, 0))

        tk.Label(
            status_card,
            text="Estado",
            font=("Segoe UI", 13, "bold"),
            bg=self.PANEL_ALT,
            fg=self.GOLD_DARK,
        ).pack(anchor="w")

        tk.Label(
            status_card,
            textvariable=self._status,
            font=("Segoe UI", 10),
            bg=self.PANEL_ALT,
            fg=self.TEXT,
            anchor="w",
            justify="left",
            wraplength=240,
        ).pack(fill="x", pady=(8, 0))

    def _create_card(self, parent: tk.Misc, bg: str, padx: int, pady: int) -> tk.Frame:
        return tk.Frame(parent, bg=bg, padx=padx, pady=pady, highlightthickness=1, highlightbackground=self.BORDER)

    def _create_button(self, parent: tk.Misc, text: str, command: Any, bg: str, fg: str) -> tk.Button:
        return tk.Button(
            parent,
            text=text,
            command=command,
            font=("Segoe UI", 10, "bold"),
            bg=bg,
            fg=fg,
            activebackground=self._darken(bg),
            activeforeground=fg,
            relief="flat",
            bd=0,
            padx=14,
            pady=10,
            cursor="hand2",
        )

    def _build_stat_card(self, parent: tk.Misc, title: str, variable: tk.StringVar, width: int) -> tk.Frame:
        card = tk.Frame(parent, bg="#f7ead0", width=width, padx=14, pady=10, highlightthickness=1, highlightbackground="#d8b97c")
        card.pack_propagate(False)

        tk.Label(
            card,
            text=title.upper(),
            font=("Segoe UI", 8, "bold"),
            bg="#f7ead0",
            fg=self.GOLD_DARK,
        ).pack(anchor="w")

        tk.Label(
            card,
            textvariable=variable,
            font=("Georgia", 16, "bold"),
            bg="#f7ead0",
            fg=self.TEXT,
        ).pack(anchor="w", pady=(6, 0))
        return card

    def _build_legend_item(self, parent: tk.Misc, color: str, text: str) -> tk.Frame:
        row = tk.Frame(parent, bg=self.PANEL_ALT)
        swatch = tk.Frame(row, bg=color, width=18, height=18, highlightthickness=1, highlightbackground=self.BORDER)
        swatch.pack(side="left")
        swatch.pack_propagate(False)
        tk.Label(
            row,
            text=text,
            font=("Segoe UI", 10),
            bg=self.PANEL_ALT,
            fg=self.TEXT,
        ).pack(side="left", padx=(10, 0))
        return row

    def _darken(self, color: str) -> str:
        color = color.lstrip("#")
        red = max(0, int(color[0:2], 16) - 18)
        green = max(0, int(color[2:4], 16) - 18)
        blue = max(0, int(color[4:6], 16) - 18)
        return f"#{red:02x}{green:02x}{blue:02x}"

    def _update_words_scrollregion(self, _event: tk.Event | None) -> None:
        if self._words_canvas is not None:
            self._words_canvas.configure(scrollregion=self._words_canvas.bbox("all"))

    def _resize_words_window(self, event: tk.Event) -> None:
        # Hace que el contenedor interno aproveche todo el ancho del area desplazable.
        if self._words_canvas is None or self._words_inner is None:
            return
        window_items = self._words_canvas.find_all()
        if window_items:
            self._words_canvas.itemconfigure(window_items[0], width=event.width)

    def _start_game(self) -> None:
        # Pide una nueva partida al servidor y refresca tablero, palabras y cronometro.
        try:
            game = self._client.request_game(self._language.get())
        except Exception as exc:
            messagebox.showerror("Error", str(exc))
            return

        self._current_game = game
        self._solved_words.clear()
        self._render_board(game["board"])
        self._render_word_list(game["words"])
        self._clear_selection()
        self._summary.set(f"{len(game['words'])} palabras | tablero {game['size']}x{game['size']}")
        self._status.set("Juego iniciado. Marca la primera y la ultima letra de cada palabra.")
        self._start_timer()

    def _render_board(self, board: list[list[str]]) -> None:
        # Reconstruye visualmente el tablero cada vez que llega una partida nueva.
        for widget in self._board_frame.winfo_children():
            widget.destroy()

        self._buttons.clear()
        size = len(board)

        grid_shell = tk.Frame(self._board_frame, bg=self.PANEL)
        grid_shell.pack(expand=True)

        for row in range(size):
            grid_shell.grid_rowconfigure(row, weight=1)
            for col in range(size):
                grid_shell.grid_columnconfigure(col, weight=1)
                button = tk.Button(
                    grid_shell,
                    text=board[row][col],
                    width=3,
                    height=1,
                    font=("Consolas", 13, "bold"),
                    bg=self.CELL,
                    fg=self.CELL_TEXT,
                    activebackground=self.SELECTED,
                    activeforeground=self.CELL_TEXT,
                    relief="flat",
                    bd=0,
                    highlightthickness=1,
                    highlightbackground="#eadbbd",
                    padx=0,
                    pady=10,
                    cursor="hand2",
                    command=lambda current_row=row, current_col=col: self._on_cell_click(current_row, current_col),
                )
                button.grid(row=row, column=col, padx=3, pady=3, sticky="nsew")
                self._buttons[(row, col)] = button

    def _render_word_list(self, words: list[str]) -> None:
        # Muestra la lista objetivo dentro de un panel desplazable.
        if self._words_inner is None:
            return

        for widget in self._words_inner.winfo_children():
            widget.destroy()

        self._word_labels.clear()
        for word in words:
            chip = tk.Label(
                self._words_inner,
                text=word,
                font=("Segoe UI", 11, "bold"),
                bg="#f8f1e2",
                fg=self.TEXT,
                anchor="w",
                padx=12,
                pady=10,
                highlightthickness=1,
                highlightbackground="#eadbbd",
            )
            chip.pack(fill="x", pady=4)
            self._word_labels[word] = chip

        self._root.update_idletasks()
        self._update_words_scrollregion(None)

    def _on_cell_click(self, row: int, col: int) -> None:
        # La seleccion del jugador se define con un clic inicial y uno final.
        if self._current_game is None:
            return

        if self._start_cell is None:
            self._clear_selection()
            self._start_cell = (row, col)
            self._selected_cells = [self._start_cell]
            self._paint_cells(self._selected_cells, self.SELECTED)
            return

        end_cell = (row, col)
        if end_cell == self._start_cell:
            self._clear_selection()
            return

        line = self._build_line(self._start_cell, end_cell)
        if not line:
            self._status.set("La seleccion debe estar en linea recta.")
            self._clear_selection()
            return

        self._clear_selection()
        self._selected_cells = line
        self._paint_cells(line, "#d8b46a")
        self._check_solution(line)
        self._start_cell = None

    def _build_line(
        self,
        start: tuple[int, int],
        end: tuple[int, int],
    ) -> list[tuple[int, int]] | None:
        # Convierte dos extremos en una linea valida horizontal, vertical o diagonal.
        row_step = end[0] - start[0]
        col_step = end[1] - start[1]

        step_row = 0 if row_step == 0 else row_step // abs(row_step)
        step_col = 0 if col_step == 0 else col_step // abs(col_step)

        if row_step != 0 and col_step != 0 and abs(row_step) != abs(col_step):
            return None
        if step_row == 0 and step_col == 0:
            return None

        distance = max(abs(row_step), abs(col_step))
        line: list[tuple[int, int]] = []
        for offset in range(distance + 1):
            line.append((start[0] + (step_row * offset), start[1] + (step_col * offset)))
        return line

    def _check_solution(self, line: list[tuple[int, int]]) -> None:
        # Compara la seleccion con las coordenadas reales enviadas por el servidor.
        if self._current_game is None:
            return

        for placement in self._current_game["placements"]:
            word = placement["display_word"]
            coordinates = [tuple(item) for item in placement["coordinates"]]
            if word in self._solved_words:
                continue
            if line == coordinates or line == list(reversed(coordinates)):
                self._solved_words.add(word)
                self._mark_word_as_solved(word, coordinates)
                print(f"[GAME] Palabra encontrada correctamente: {word}")
                found = len(self._solved_words)
                total = len(self._current_game["words"])
                self._summary.set(f"{found} de {total} resueltas")
                if found == total:
                    self._stop_timer()
                    self._status.set(f"GANASTE. Completaste la sopa en {self._timer.get()}.")
                    messagebox.showinfo("Victoria", f"GANASTE\n\nCompletaste la sopa en {self._timer.get()}.")
                else:
                    self._status.set(f"Encontraste '{word}'. Quedan {total - found} palabras.")
                return

        self._status.set("La seleccion no coincide con una palabra valida.")

    def _mark_word_as_solved(self, word: str, coordinates: list[tuple[int, int]]) -> None:
        # Resalta tanto la palabra en el tablero como su chip en el panel lateral.
        self._paint_cells(coordinates, self.SOLVED)
        label = self._word_labels.get(word)
        if label:
            label.configure(bg="#dcefdc", fg=self.ACCENT_DARK, highlightbackground="#b8d8b8")

    def _reveal_solution(self) -> None:
        # Muestra todas las palabras pendientes y detiene el tiempo de juego.
        if self._current_game is None:
            return

        for placement in self._current_game["placements"]:
            if placement["display_word"] in self._solved_words:
                continue
            coordinates = [tuple(item) for item in placement["coordinates"]]
            word = placement["display_word"]
            self._mark_word_as_solved(word, coordinates)
            self._solved_words.add(word)

        total = len(self._current_game["words"])
        self._summary.set(f"{total} de {total} resueltas")
        self._stop_timer()
        print("[GAME] Se revelaron todas las palabras del tablero.")
        self._status.set("Se mostro la solucion completa del tablero.")

    def _paint_cells(self, coordinates: list[tuple[int, int]], color: str) -> None:
        # Aplica un color a todas las celdas indicadas.
        for coordinate in coordinates:
            button = self._buttons.get(coordinate)
            if button:
                button.configure(bg=color)

    def _clear_selection(self) -> None:
        # Limpia solo la seleccion temporal y conserva el resaltado de palabras correctas.
        for coordinate, button in self._buttons.items():
            if self._current_game and self._coordinate_is_solved(coordinate):
                button.configure(bg=self.SOLVED)
            else:
                button.configure(bg=self.CELL)
        self._start_cell = None
        self._selected_cells = []

    def _coordinate_is_solved(self, coordinate: tuple[int, int]) -> bool:
        # Indica si una celda ya pertenece a una palabra encontrada o revelada.
        if self._current_game is None:
            return False
        for placement in self._current_game["placements"]:
            if placement["display_word"] in self._solved_words and coordinate in [tuple(item) for item in placement["coordinates"]]:
                return True
        return False

    def _start_timer(self) -> None:
        # Reinicia el cronometro al comenzar cada partida.
        self._stop_timer()
        self._elapsed_seconds = 0
        self._tick_timer()

    def _tick_timer(self) -> None:
        # Actualiza el tiempo mostrado una vez por segundo.
        minutes, seconds = divmod(self._elapsed_seconds, 60)
        self._timer.set(f"{minutes:02d}:{seconds:02d}")
        self._elapsed_seconds += 1
        self._timer_job = self._root.after(1000, self._tick_timer)

    def _stop_timer(self) -> None:
        if self._timer_job:
            self._root.after_cancel(self._timer_job)
            self._timer_job = None

    def _on_close(self) -> None:
        # Evita dejar callbacks del temporizador corriendo al cerrar la ventana.
        self._stop_timer()
        self._root.destroy()
