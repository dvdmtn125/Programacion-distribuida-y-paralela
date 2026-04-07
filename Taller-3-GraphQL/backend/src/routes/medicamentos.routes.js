// Importar Router de Express para definir rutas.
import { Router } from "express";
// Importar controladores de medicamentos.
import {
  createMedicamento,
  deleteMedicamento,
  getAllMedicamentos,
  getMedicamentoById,
  updateMedicamento,
} from "../controllers/medicamentos.controller.js";

// Crear instancia del router.
const router = Router();

// Rutas CRUD de medicamentos.
router.get("/", getAllMedicamentos);
router.get("/:id", getMedicamentoById);
router.post("/", createMedicamento);
router.put("/:id", updateMedicamento);
router.delete("/:id", deleteMedicamento);

// Exportar el router.
export default router;
