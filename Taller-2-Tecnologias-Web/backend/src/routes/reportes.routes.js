// Importar Router de Express para definir rutas
import { Router } from "express";
// Importar controladores para los reportes
import { reporteClientes, reporteMedicamentos } from "../controllers/reportes.controller.js";

// Crear una instancia del router
const router = Router();

// Definir rutas para los reportes
// Reporte de clientes con total de mascotas
router.get("/clientes", reporteClientes);
// Reporte de medicamentos con total de mascotas vinculadas
router.get("/medicamentos", reporteMedicamentos);

// Exportar el router para usarlo en la aplicación
export default router;
