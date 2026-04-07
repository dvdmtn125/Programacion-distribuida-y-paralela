// Importar Router de Express para definir rutas.
import { Router } from "express";
// Importar controladores de clientes.
import {
  createCliente,
  deleteCliente,
  getAllClientes,
  getClienteByCedula,
  updateCliente,
} from "../controllers/clientes.controller.js";

// Crear instancia del router.
const router = Router();

// Rutas CRUD de clientes.
router.get("/", getAllClientes);
router.get("/:cedula", getClienteByCedula);
router.post("/", createCliente);
router.put("/:cedula", updateCliente);
router.delete("/:cedula", deleteCliente);

// Exportar el router.
export default router;
