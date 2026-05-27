import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Tag,
  ChevronLeft,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { templateApi, type Category } from "../api/templateApi";
import SuperAdminNavBar from "../components/SuperAdminNavBar";

export default function SuperAdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await templateApi.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setAdding(true);
    setError(null);
    try {
      await templateApi.createCategory(newCategoryName.trim());
      setSuccess(`Category "${newCategoryName}" created successfully`);
      setNewCategoryName("");
      setShowAddModal(false);
      await fetchCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create category");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"? Templates using this category will still work.`)) {
      return;
    }
    try {
      await templateApi.deleteCategory(id);
      setSuccess(`Category "${name}" deleted successfully`);
      await fetchCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError("Failed to delete category");
      setTimeout(() => setError(null), 3000);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <SuperAdminNavBar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/super-admin-dashboard")}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-3 text-sm"
            >
              <ChevronLeft size={16} />
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag size={24} className="text-indigo-500" />
              Category Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Manage template categories used across the platform
            </p>
          </div>
          <button
            onClick={() => {
              setNewCategoryName("");
              setError(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        )}

        {/* Categories Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Tag size={18} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {category.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category._id, category.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Tag size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery ? "No categories match your search" : "No categories yet. Create your first category!"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => {
                  setNewCategoryName("");
                  setError(null);
                  setShowAddModal(true);
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
              >
                Add Category
              </button>
            )}
          </div>
        )}

        {/* Category Count */}
        {!loading && categories.length > 0 && (
          <div className="mt-6 text-center text-sm text-slate-400">
            Total {categories.length} categories
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Category</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategoryName("");
                  setError(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Customer Feedback, Employee Surveys"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCategoryName("");
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={adding}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}