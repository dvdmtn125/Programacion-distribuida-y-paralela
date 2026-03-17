// Importar React para crear componentes
import React from "react";
// Importar createRoot de React DOM para renderizar la aplicación
import { createRoot } from "react-dom/client";
// Importar el componente principal App
import App from "./App.jsx";
// Importar estilos CSS
import "./styles.css";

// Crear el root de React y renderizar la aplicación en el elemento con id 'root'
createRoot(document.getElementById("root")).render(
  // Envolver en StrictMode para detectar problemas potenciales
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
