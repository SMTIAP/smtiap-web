import { Router } from "express";
import { getUserById } from "../controllers/userController.js";

const router = Router();

router.get("/:id", getUserById);

export default router;
