// Importar la instancia de Express.
import app from "./app.js";

// Definir el puerto (por defecto 4000).
const PORT = Number(process.env.PORT || 4000);

// Levantar el servidor y escuchar en el puerto indicado.
app.listen(PORT, () => {
  // Mostrar mensaje de inicio.
  console.log(`Backend ejecutandose en http://localhost:${PORT}`);
});
