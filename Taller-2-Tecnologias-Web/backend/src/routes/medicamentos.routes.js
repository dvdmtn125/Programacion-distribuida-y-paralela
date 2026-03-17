// Importar Router de Express para definir rutas
import { Router } from "express";
// Importar controladores para manejar las operaciones de medicamentos
import {
  createMedicamento,
  deleteMedicamento,
  getAllMedicamentos,
  getMedicamentoById,
  updateMedicamento,
} from "../controllers/medicamentos.controller.js";

// Crear una instancia del router
const router = Router();

// Definir rutas para operaciones CRUD de medicamentos
// Obtener todos los medicamentos
router.get("/", getAllMedicamentos);
// Obtener un medicamento por ID
router.get("/:id", getMedicamentoById);
// Crear un nuevo medicamento
router.post("/", createMedicamento);
// Actualizar un medicamento por ID
router.put("/:id", updateMedicamento);
// Eliminar un medicamento por ID
router.delete("/:id", deleteMedicamento);

// Exportar el router para usarlo en la aplicación
export default router;
