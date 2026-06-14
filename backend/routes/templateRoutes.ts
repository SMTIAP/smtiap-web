// Template and category routes: public browsing, super admin management.
import express from "express";
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getCategories,
  createCategory,
  deleteCategory,
  incrementUsageCount,
} from "../controllers/templateController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";

const router = express.Router();

// Authenticated users can browse templates and categories.
router.get("/", protect, getTemplates);
router.get("/:id", protect, getTemplateById);
router.get("/categories/all", protect, getCategories);

// Increment usage count (any authenticated user can call this)
router.post("/:id/increment-usage", protect, incrementUsageCount);

// Super Admin only routes
router.post("/", protect, authorizeRoles("super_admin"), createTemplate);
router.put("/:id", protect, authorizeRoles("super_admin"), updateTemplate);
router.delete("/:id", protect, authorizeRoles("super_admin"), deleteTemplate);
router.post(
  "/categories",
  protect,
  authorizeRoles("super_admin"),
  createCategory,
);
router.delete(
  "/categories/:id",
  protect,
  authorizeRoles("super_admin"),
  deleteCategory,
);

export default router;
