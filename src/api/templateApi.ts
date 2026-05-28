import axios from "axios";

// Create a separate axios instance for templates
const templateApiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

templateApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const activeTenantId = localStorage.getItem("activeTenantId");
  if (activeTenantId && activeTenantId !== "__system__") {
    config.headers["x-tenant-id"] = activeTenantId;
  }
  return config;
});

export interface TemplateQuestion {
  type: "short_text" | "long_text" | "multiple_choice" | "checkboxes" | "rating" | "number" | "date";
  label: string;
  max?: number;
  min?: number;
  options?: string[];
  placeholder?: string;
}

export interface Template {
  _id: string;
  title: string;
  description: string;
  category: string;
  usedCount: string;
  gradient: string;
  icon: string;
  aiPrompt: string;
  previewQuestions: TemplateQuestion[];
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  isActive: boolean;
}

export const templateApi = {
  getTemplates: async (): Promise<Template[]> => {
    const response = await templateApiClient.get("/templates");
    return response.data.data;
  },

  getTemplateById: async (id: string): Promise<Template> => {
    const response = await templateApiClient.get(`/templates/${id}`);
    return response.data.data;
  },

  createTemplate: async (data: Partial<Template>): Promise<Template> => {
    const response = await templateApiClient.post("/templates", data);
    return response.data.data;
  },

  updateTemplate: async (id: string, data: Partial<Template>): Promise<Template> => {
    const response = await templateApiClient.put(`/templates/${id}`, data);
    return response.data.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await templateApiClient.delete(`/templates/${id}`);
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await templateApiClient.get("/templates/categories/all");
    return response.data.data;
  },

  createCategory: async (name: string): Promise<Category> => {
    const response = await templateApiClient.post("/templates/categories", { name });
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await templateApiClient.delete(`/templates/categories/${id}`);
  },

  incrementUsageCount: async (id: string): Promise<{ usedCount: string }> => {
    const response = await templateApiClient.post(`/templates/${id}/increment-usage`);
    return response.data.data;
  },
};