// Importar Router de Express para definir rutas.
import { Router } from "express";
// Importar controladores de mascotas.
import {
  createMascota,
  deleteMascota,
  getAllMascotas,
  getMascotaById,
  updateMascota,
} from "../controllers/mascotas.controller.js";

// Crear instancia del router.
const router = Router();

// Rutas CRUD de mascotas.
router.get("/", getAllMascotas);
router.get("/:id", getMascotaById);
router.post("/", createMascota);
router.put("/:id", updateMascota);
router.delete("/:id", deleteMascota);

// Exportar el router.
export default router;
