import { Request, Response } from "express";
import Template from "../models/Template";
import Category from "../models/Category";

// Get all templates (public for org admins)
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await Template.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select("-__v");
    
    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
    });
  }
};

// Get single template by ID
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch template",
    });
  }
};

// Create new template (Super Admin only)
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      gradient,
      coverImage,
      estimatedTime,
      previewQuestions,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !gradient) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const template = await Template.create({
      title,
      description,
      category,
      gradient,
      coverImage,
      estimatedTime: estimatedTime || "quick",
      previewQuestions: previewQuestions || [],
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: template,
      message: "Template created successfully",
    });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create template",
    });
  }
};

// Update template (Super Admin only)
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.status(200).json({
      success: true,
      data: template,
      message: "Template updated successfully",
    });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update template",
    });
  }
};

// Delete template (Soft delete - Super Admin only)
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete template",
    });
  }
};

// ============ USAGE COUNT CONTROLLER ============

// Increment template usage count (called when template is used)
export const incrementUsageCount = async (req: Request, res: Response) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }
    
    // Parse current count (e.g., "95,000+" -> 95000, "0+" -> 0)
    let currentCount = 0;
    if (template.usedCount) {
      const match = template.usedCount.match(/\d+/);
      if (match) {
        currentCount = parseInt(match[0]);
      }
    }
    
    // Increment count
    const newCount = currentCount + 1;
    template.usedCount = newCount.toLocaleString() + "+";
    
    await template.save();
    
    res.status(200).json({
      success: true,
      data: { usedCount: template.usedCount },
      message: "Usage count updated successfully",
    });
  } catch (error) {
    console.error("Error incrementing usage count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update usage count",
    });
  }
};

// ============ CATEGORY CONTROLLERS ============

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select("-__v");
    
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// Create new category (Super Admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// Delete category (Soft delete - Super Admin only)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};