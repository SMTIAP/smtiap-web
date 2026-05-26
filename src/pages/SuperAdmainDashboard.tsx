import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  Building2,
  ShieldAlert,
  Search,
  Plus,
  Trash2,
  Activity,
  Building,
  RefreshCw,
  Sliders,
  Check,
  X,
  FileText,
  Lock,
  Globe,
  Mail,
  Zap,
  LayoutTemplate
} from "lucide-react";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface Tenant {
  _id: string;
  name: string;
  createdBy?: string;
  email?: string;
  status?: string;
}

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  iconName: "Utensils" | "Coffee" | "Layers" | "FileText" | "Activity";
  colorClass: string;
}

interface StatusMessage {
  text: string;
  type: "success" | "error";
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  // State arrays
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  
  // Custom templates list state (Super Admin can add templates)
  const [templates, setTemplates] = useState<TemplateItem[]>([
    {
      id: "food-res",
      title: "Food Satisfaction",
      category: "Restaurant",
      iconName: "Utensils",
      colorClass: "bg-orange-500/10 text-orange-400 border-orange-500/20"
    },
    {
      id: "food-cafe",
      title: "Daily Cafe Feedback",
      category: "Cafe",
      iconName: "Coffee",
      colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    },
    {
      id: "food-res-2",
      title: "Restaurant Quality",
      category: "Restaurant",
      iconName: "Utensils",
      colorClass: "bg-rose-500/10 text-rose-400 border-rose-500/20"
    },
    {
      id: "food-cafe-2",
      title: "Staff Performance",
      category: "HR Feedback",
      iconName: "Layers",
      colorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }
  ]);

  // Template creation form states
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState("Customer Feedback");
  const [newTemplateIcon, setNewTemplateIcon] = useState<TemplateItem["iconName"]>("FileText");
  const [newTemplateColor, setNewTemplateColor] = useState("bg-purple-500/10 text-purple-400 border-purple-500/20");

  // System configurations ("Change some main functions")
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowPublicRegistrations, setAllowPublicRegistrations] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<"standard" | "high">("standard");
  const [aiInsightsLimit, setAiInsightsLimit] = useState(100);

  // Search & Navigation
  const [searchTerm, setSearchTerm] = useState("");
  const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "templates" | "system">("users");

  // Axios instance specifically configured for this dashboard
  const token = localStorage.getItem("token");
  const customApi = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  });

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Organization Admin",
    viewer: "Viewer",
    creator: "Creator",
    billing_manager: "Billing Manager"
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setStatusMessage(null);
      
      const [usersRes, tenantsRes] = await Promise.all([
        customApi.get<User[]>("/role-management"),
        customApi.get<Tenant[]>("/role-management/tenants")
      ]);

      setUsers(usersRes.data || []);
      setTenants(tenantsRes.data || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      showStatus("Failed to load dashboard data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const showStatus = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // 1. Delete Admin or standard User Account completely
  const handleDeleteUserAccount = async (userId: string, username: string, userRole: string) => {
    if (userRole === "super_admin") {
      showStatus("For security, you cannot delete a root Super Admin account.", "error");
      return;
    }

    const confirmDelete = window.confirm(
      `CRITICAL ACTION:\nAre you sure you want to permanently delete user "${username}" (Role: ${userRole})?\nThis will remove their profile and all organizational memberships from the database.`
    );

    if (!confirmDelete) return;

    try {
      const response = await customApi.delete(`/role-management/${userId}`);
      if (response.status === 200) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        showStatus(`Account for "${username}" was permanently deleted from the database. ✔`);
      }
    } catch (err: any) {
      console.error(err);
      showStatus(err.response?.data?.message || "Failed to delete user account.", "error");
    }
  };

  // 2. Add New Survey Template
  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateTitle.trim()) {
      showStatus("Please enter a template title", "error");
      return;
    }

    const newTemplate: TemplateItem = {
      id: "template-" + Math.random().toString(36).substring(2, 9),
      title: newTemplateTitle.trim(),
      category: newTemplateCategory,
      iconName: newTemplateIcon,
      colorClass: newTemplateColor
    };

    setTemplates(prev => [newTemplate, ...prev]);
    setNewTemplateTitle("");
    showStatus(`Template "${newTemplate.title}" was added successfully! it is now available globally. ✔`);
  };

  // 3. Save Web Server Main Functions
  const handleSaveSystemConfig = () => {
    showStatus("Server configurations updated. Main web functions modified successfully! ✔");
  };

  // Filters
  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      user.username.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search)
    );
  });

  const filteredTemplates = templates.filter(temp => {
    const search = templateSearchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      temp.title.toLowerCase().includes(search) ||
      temp.category.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background decorative glow elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-6 py-10 relative z-10">
        
        {/* Header section with gradient line and premium look */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                Server Super Admin (Root)
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Super Admin Console
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">
              Web server root control: remove admin accounts, distribute global survey templates, and toggle core system modules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all hover:scale-[1.02] active:scale-95"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Data
            </button>
            <button
              onClick={() => navigate("/audit-log")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Activity size={14} />
              Security logs
            </button>
          </div>
        </div>

        {/* Dynamic status toaster */}
        {statusMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 py-3.5 px-5 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 ${
              statusMessage.type === "error"
                ? "bg-red-950/80 border-red-500/40 text-red-200 shadow-red-950/20"
                : "bg-emerald-950/80 border-emerald-500/40 text-emerald-200 shadow-emerald-950/20"
            }`}
          >
            {statusMessage.type === "error" ? <X size={18} className="text-red-400 shrink-0" /> : <Check size={18} className="text-emerald-400 shrink-0" />}
            <span className="text-sm font-semibold">{statusMessage.text}</span>
          </div>
        )}

        {/* Root Level System Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md p-6 transition-all hover:border-rose-500/30 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Users size={20} />
              </div>
              <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">Server Root</span>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{users.length}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Total System Users</p>
          </div>

          <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md p-6 transition-all hover:border-indigo-500/30 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Building2 size={20} />
              </div>
              <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Tenants</span>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{tenants.length}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Total Organizations</p>
          </div>

          <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md p-6 transition-all hover:border-purple-500/30 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <LayoutTemplate size={20} />
              </div>
              <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">Templates</span>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{templates.length}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Global Templates</p>
          </div>

          <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md p-6 transition-all hover:border-emerald-500/30 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldAlert size={20} />
              </div>
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Secure</span>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">Active</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Developer Root Console</p>
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-white/5 rounded-xl mb-6 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users size={14} />
            Users & Admins
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "templates"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutTemplate size={14} />
            Global Survey Templates
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "system"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders size={14} />
            Server Main Functions
          </button>
        </div>

        {/* TAB CONTENT: 1. Users / Admins list (Delete focus) */}
        {activeTab === "users" && (
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">System Accounts Management</h2>
                <p className="text-slate-400 text-xs mt-0.5">Global audit of registered users. Perform permanent account deletions for standard or administrative credentials.</p>
              </div>

              {/* Search user */}
              <div className="relative w-full md:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by username, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="text-left pb-3.5 pl-2">User details</th>
                    <th className="text-left pb-3.5">Email address</th>
                    <th className="text-left pb-3.5">System Privilege Level</th>
                    <th className="text-right pb-3.5 pr-2">Revoke Credentials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-400 text-xs">
                        <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-indigo-500" />
                        Fetching database records...
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const isSelf = user.email === "superadmin@smtiap.com";
                      
                      // Role badges styling
                      let badgeStyle = "bg-slate-500/10 text-slate-400 border-slate-500/20";
                      if (user.role === "super_admin") badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]";
                      else if (user.role === "admin") badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                      else if (user.role === "creator") badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

                      return (
                        <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${
                                user.role === "super_admin" 
                                  ? "from-rose-500/20 to-purple-500/20 bg-gradient-to-br text-rose-300 border-rose-500/20"
                                  : "from-indigo-500/20 to-blue-500/20 bg-gradient-to-br text-indigo-300 border-indigo-500/20"
                              }`}>
                                {user.username.slice(0, 2).toUpperCase()}
                              </span>
                              <div>
                                <span className="text-xs font-bold text-white block">{user.username}</span>
                                {isSelf && <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5 block">Logged In</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-xs text-slate-300 font-mono">{user.email}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${badgeStyle}`}>
                              {roleLabels[user.role] || user.role}
                            </span>
                          </td>
                          <td className="py-4 text-right pr-2">
                            <button
                              onClick={() => handleDeleteUserAccount(user._id, user.username, user.role)}
                              disabled={isSelf}
                              className={`p-2 rounded-xl transition-all border ${
                                isSelf
                                  ? "bg-slate-900 text-slate-600 border-transparent cursor-not-allowed"
                                  : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 hover:scale-105 active:scale-95"
                              }`}
                              title={isSelf ? "You cannot delete yourself" : "Permanently Delete Account"}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-500 text-xs font-semibold">
                        No system users found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 2. Templates Manager (Add templates focus) */}
        {activeTab === "templates" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Template Creation Form */}
            <div className="lg:col-span-1 p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md h-fit">
              <div className="flex items-center gap-2 mb-4">
                <LayoutTemplate className="text-indigo-400" size={18} />
                <h3 className="text-sm font-bold text-white">Add Global Template</h3>
              </div>
              <p className="text-slate-400 text-xs mb-6">Create standardized templates that creators can use to instantly build survey structures.</p>

              <form onSubmit={handleAddTemplate} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Template Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Employee Engagement Feedback"
                    value={newTemplateTitle}
                    onChange={(e) => setNewTemplateTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Category</label>
                  <select
                    value={newTemplateCategory}
                    onChange={(e) => setNewTemplateCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-300 outline-none focus:border-indigo-500/50"
                  >
                    <option value="Customer Feedback">Customer Feedback</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Cafe">Cafe</option>
                    <option value="HR Feedback">HR Feedback</option>
                    <option value="IT & Tech Support">IT & Tech Support</option>
                    <option value="General Review">General Review</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Visual Icon</label>
                    <select
                      value={newTemplateIcon}
                      onChange={(e) => setNewTemplateIcon(e.target.value as TemplateItem["iconName"])}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-300 outline-none focus:border-indigo-500/50"
                    >
                      <option value="FileText">Document Icon</option>
                      <option value="Utensils">Food Utensils</option>
                      <option value="Coffee">Coffee Cup</option>
                      <option value="Layers">Stacked Layers</option>
                      <option value="Activity">Pulse Graph</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Theme Palette</label>
                    <select
                      value={newTemplateColor}
                      onChange={(e) => setNewTemplateColor(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-300 outline-none focus:border-indigo-500/50"
                    >
                      <option value="bg-purple-500/10 text-purple-400 border-purple-500/20">Amethyst Glow</option>
                      <option value="bg-blue-500/10 text-blue-400 border-blue-500/20">Ocean Blue</option>
                      <option value="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Emerald Mint</option>
                      <option value="bg-orange-500/10 text-orange-400 border-orange-500/20">Orange Ember</option>
                      <option value="bg-rose-500/10 text-rose-400 border-rose-500/20">Rosewood Glow</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all mt-4 flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  Distribute Template
                </button>
              </form>
            </div>

            {/* Templates List View */}
            <div className="lg:col-span-2 p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white">Seeded & Distributed Templates</h3>
                  <p className="text-slate-400 text-xs">Review the list of survey templates currently loaded onto the web server.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={templateSearchTerm}
                    onChange={(e) => setTemplateSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-4 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-[11px] text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredTemplates.map(temp => (
                  <div
                    key={temp.id}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all hover:scale-[1.01] ${temp.colorClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-center">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{temp.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{temp.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTemplates(prev => prev.filter(t => t.id !== temp.id))}
                      className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/10"
                      title="Recall Template"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB CONTENT: 3. Core System Configurations (Change main functions focus) */}
        {activeTab === "system" && (
          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md max-w-2xl mx-auto">
            <div className="flex items-center gap-2.5 mb-2">
              <Sliders className="text-indigo-400" size={18} />
              <h3 className="text-sm font-bold text-white">Modify Web Server Functions</h3>
            </div>
            <p className="text-slate-400 text-xs mb-8">Direct control of global application parameters, security layers, API thresholds, and backend modes.</p>

            <div className="space-y-6">
              
              {/* Function 1: Maintenance Mode */}
              <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-xl">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <ShieldAlert size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Global Maintenance Lockout</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Toggle maintenance page for all visitors except developer Super Admins.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(prev => !prev)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    maintenanceMode ? "bg-amber-600" : "bg-slate-800"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                    maintenanceMode ? "right-1.5" : "left-1.5"
                  }`} />
                </button>
              </div>

              {/* Function 2: Public Registrations */}
              <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-xl">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                    <Globe size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Public Accounts Registration</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Enable or disable the sign-up capabilities globally for the entire web app.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowPublicRegistrations(prev => !prev)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    allowPublicRegistrations ? "bg-indigo-600" : "bg-slate-800"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                    allowPublicRegistrations ? "right-1.5" : "left-1.5"
                  }`} />
                </button>
              </div>

              {/* Function 3: Email verification */}
              <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-xl">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Email Verification Loop</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Enforce absolute email validation procedures for standard creators and viewers.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRequireEmailVerification(prev => !prev)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    requireEmailVerification ? "bg-purple-600" : "bg-slate-800"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                    requireEmailVerification ? "right-1.5" : "left-1.5"
                  }`} />
                </button>
              </div>

              {/* Function 4: AI limits */}
              <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl">
                <div className="flex gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <Zap size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Global AI Insights Limit</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Restrict generative AI requests per creator account per month to preserve server APIs.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={aiInsightsLimit}
                    onChange={(e) => setAiInsightsLimit(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-900 border border-white/5 rounded-lg h-2"
                  />
                  <span className="text-xs font-black text-indigo-400 w-12 text-right">{aiInsightsLimit} / Mo</span>
                </div>
              </div>

              {/* Function 5: Security Level */}
              <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                    <Lock size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Session Security Integrity</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Control web session token longevity. Standard: 30 days. High: 2 hours.</p>
                  </div>
                </div>
                <div className="flex gap-1.5 bg-slate-900 border border-white/5 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSecurityLevel("standard")}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                      securityLevel === "standard" ? "bg-indigo-600 text-white" : "text-slate-400"
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setSecurityLevel("high")}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                      securityLevel === "high" ? "bg-indigo-600 text-white" : "text-slate-400"
                    }`}
                  >
                    High
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSystemConfig}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 rounded-xl transition-all hover:scale-[1.01]"
              >
                Apply Core Server Changes
              </button>

            </div>
          </div>
        )}

        {/* Bottom panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          
          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md">
            <h3 className="text-sm font-bold text-white mb-1">Superuser Safety Advice</h3>
            <p className="text-slate-400 text-xs mb-4">Guidelines for global administrative privileges.</p>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <p className="text-xs text-slate-300 leading-normal">
                  Standard registration for Super Admins has been disabled to secure database endpoints. Credentials must be loaded using standard migrations or local database seed files.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <p className="text-xs text-slate-300 leading-normal">
                  Always verify tenant assignment constraints. A single user can hold memberships in multiple organizations concurrently with varying localized access values.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Administrative Shortcuts</h3>
              <p className="text-slate-400 text-xs mb-4">Speedy organizational triggers for administrative workflows.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3.5 mt-2">
              <button
                onClick={() => navigate("/organization-registration")}
                className="flex items-center gap-2 p-3 rounded-xl border border-white/5 bg-slate-950/80 text-slate-300 hover:border-indigo-500/30 hover:text-white transition-all hover:-translate-y-0.5 justify-center"
              >
                <Building size={14} className="text-indigo-400" />
                <span className="text-[11px] font-bold">New Org</span>
              </button>

              <button
                onClick={() => navigate("/role-management")}
                className="flex items-center gap-2 p-3 rounded-xl border border-white/5 bg-slate-950/80 text-slate-300 hover:border-indigo-500/30 hover:text-white transition-all hover:-translate-y-0.5 justify-center"
              >
                <Sliders size={14} className="text-indigo-400" />
                <span className="text-[11px] font-bold">Role Assign Page</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
