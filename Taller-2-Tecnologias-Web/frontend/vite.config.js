// Importar la función para definir la configuración de Vite
import { defineConfig } from "vite";
// Importar el plugin de React para Vite
import react from "@vitejs/plugin-react";

// Exportar la configuración de Vite
export default defineConfig({
  // Usar el plugin de React
  plugins: [react()],
});
