// Importar Router de Express para definir rutas.
import { Router } from "express";
// Importar controladores de reportes.
import { reporteClientes, reporteMedicamentos } from "../controllers/reportes.controller.js";

// Crear instancia del router.
const router = Router();

// Rutas de reportes.
router.get("/clientes", reporteClientes);
router.get("/medicamentos", reporteMedicamentos);

// Exportar el router.
export default router;
