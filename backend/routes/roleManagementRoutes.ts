import { Router } from "express";
import { getAllUsers, updateUserRole } from "../controllers/roleManagementController.js";
import User from "../models/User.js";

const router = Router();

router.get("/", getAllUsers);
router.put("/:userId/role", updateUserRole)

export default router;