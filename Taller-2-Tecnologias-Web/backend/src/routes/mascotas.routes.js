// Importar Router de Express para definir rutas
import { Router } from "express";
// Importar controladores para manejar las operaciones de mascotas
import {
  createMascota,
  deleteMascota,
  getAllMascotas,
  getMascotaById,
  updateMascota,
} from "../controllers/mascotas.controller.js";

// Crear una instancia del router
const router = Router();

// Definir rutas para operaciones CRUD de mascotas
// Obtener todas las mascotas
router.get("/", getAllMascotas);
// Obtener una mascota por ID
router.get("/:id", getMascotaById);
// Crear una nueva mascota
router.post("/", createMascota);
// Actualizar una mascota por ID
router.put("/:id", updateMascota);
// Eliminar una mascota por ID
router.delete("/:id", deleteMascota);

// Exportar el router para usarlo en la aplicación
export default router;
