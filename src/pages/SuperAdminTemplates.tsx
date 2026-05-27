import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  LayoutTemplate,
  ChevronLeft,
  Tag,
} from "lucide-react";
import { templateApi, type Template } from "../api/templateApi";
import { getIcon } from "../utils/iconMap";
import SuperAdminNavBar from "../components/SuperAdminNavBar";

export default function SuperAdminTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateApi.getTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete template "${title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await templateApi.deleteTemplate(id);
      await fetchTemplates();
    } catch (err) {
      console.error("Failed to delete template:", err);
      alert("Failed to delete template");
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <SuperAdminNavBar />

      <div className="max-w-7xl mx-auto px-6 py-8">
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
              <LayoutTemplate size={24} className="text-indigo-500" />
              Template Library
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Create and manage survey templates for organization admins
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/super-admin/categories")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm"
            >
              <Tag size={16} />
              Manage Categories
            </button>
            <button
              onClick={() => navigate("/super-admin/templates/new")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
            >
              <Plus size={16} />
              Create Template
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates by title, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
          />
        </div>

        {/* Rest of your component remains the same... */}
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchTemplates}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Templates Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((template) => {
              const Icon = getIcon(template.icon);
              return (
                <div
                  key={template._id}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`h-28 bg-gradient-to-br ${template.gradient} flex items-center justify-center relative`}>
                    <Icon size={44} className="text-white drop-shadow" />
                    <div className="absolute top-3 right-3 flex gap-1">
                      <button
                        onClick={() => navigate(`/super-admin/templates/${template._id}/edit`)}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(template._id, template.title)}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500/80 text-white transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {template.title}
                      </h3>
                      <span className="shrink-0 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
                      {template.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Used {template.usedCount} times
                      </span>
                      <button
                        onClick={() => navigate(`/super-admin/templates/${template._id}/edit`)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Edit Template →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <LayoutTemplate size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery ? "No templates match your search" : "No templates yet. Create your first template!"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate("/super-admin/templates/new")}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
              >
                Create Template
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}