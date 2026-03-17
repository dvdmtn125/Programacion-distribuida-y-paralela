// Importar Router de Express para definir rutas
import { Router } from "express";
// Importar controladores para manejar las operaciones de clientes
import {
  createCliente,
  deleteCliente,
  getAllClientes,
  getClienteByCedula,
  updateCliente,
} from "../controllers/clientes.controller.js";

// Crear una instancia del router
const router = Router();

// Definir rutas para operaciones CRUD de clientes
// Obtener todos los clientes
router.get("/", getAllClientes);
// Obtener un cliente por cédula
router.get("/:cedula", getClienteByCedula);
// Crear un nuevo cliente
router.post("/", createCliente);
// Actualizar un cliente por cédula
router.put("/:cedula", updateCliente);
// Eliminar un cliente por cédula
router.delete("/:cedula", deleteCliente);

// Exportar el router para usarlo en la aplicación
export default router;
