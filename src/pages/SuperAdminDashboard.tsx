import { useEffect, useState, type FormEvent } from "react";
import { 
  Building2, 
  FileText, 
  ShieldCheck, 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  UserPlus, 
  Shield, 
  Calendar,
  Layers,
  Sparkles,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Coins,
  Ban,
  ArrowRightLeft,
  X,
  ChevronRight,
  LayoutTemplate,
  Tag
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import SuperAdminNavBar from "../components/SuperAdminNavBar";

interface SuperAdminUser {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface TenantEntry {
  _id: string;
  name: string;
  country: string;
  address: string;
  description: string;
  plan: "free" | "premium";
  domain: string;
  orgType: string;
  status: "active" | "inactive" | "suspended";
  createdBy: { _id: string; username: string; email: string } | null;
  creditBalance: number;
}

interface AuditLogEntry {
  _id: string;
  user_id: { _id: string; username: string; email: string } | null;
  action: string;
  entity: string;
  entity_id: string;
  createdAt: string;
  description: string;
}

const roleLabels: Record<string, string> = {
  admin: "Tenant Admin",
  creator: "Creator",
  viewer: "Viewer",
  billing_manager: "Billing Manager",
  super_admin: "Super Admin",
};

export default function SuperAdminDashboard() {
  const [user, setUser] = useState<SuperAdminUser | null>(null);
  const [managedUsers, setManagedUsers] = useState<SuperAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [createMessage, setCreateMessage] = useState("");
  const [roleUpdates, setRoleUpdates] = useState<Record<string, string>>({});
  
  // Stats state
  const [stats, setStats] = useState({
    activeTenants: 0,
    totalUsers: 0,
    totalSurveys: 0,
    totalAuditLogs: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Recent logs state
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Tenant administration states
  const [tenants, setTenants] = useState<TenantEntry[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [tenantsSearch, setTenantsSearch] = useState("");

  // Credit allocation states
  const [selectedTenantForCredits, setSelectedTenantForCredits] = useState<TenantEntry | null>(null);
  const [creditAmount, setCreditAmount] = useState<number | "">("");
  const [creditReason, setCreditReason] = useState("");
  const [creditError, setCreditError] = useState("");
  const [creditSuccess, setCreditSuccess] = useState("");
  const [adjustingCredits, setAdjustingCredits] = useState(false);

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin",
  });
  
  // Template count state
  const [templatesCount, setTemplatesCount] = useState(0);
  
  const navigate = useNavigate();

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch template count
  const fetchTemplateCount = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/templates", {
        headers: authHeaders(),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTemplatesCount(data.data?.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch template count:", err);
    }
  };

  // Fetch live stats & current user profile
  const fetchDashboardData = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/super-admin/dashboard", {
        headers: authHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to load platform overview metrics");
      }

      const data = await response.json();
      setUser(data.user);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard details");
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch platform managed users
  const fetchManagedUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/super-admin/users", {
        headers: authHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Unable to load user list");
      }

      const data = await response.json();
      setManagedUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load user list");
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch all tenant/organization workspaces
  const fetchTenants = async () => {
    setTenantsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/super-admin/tenants", {
        headers: authHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to load organization workspace list");
      }

      const data = await response.json();
      setTenants(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load organizations");
    } finally {
      setTenantsLoading(false);
    }
  };

  // Fetch 5 most recent security logs
  const fetchRecentLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/audit-logs?page=1&limit=5", {
        headers: authHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load security logs trail");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setRecentLogs(data.data);
      }
    } catch (err: unknown) {
      console.error("Error loading recent logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        fetchDashboardData(),
        fetchManagedUsers(),
        fetchTenants(),
        fetchRecentLogs(),
        fetchTemplateCount(),
      ]);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateUser = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setCreateError("");
    setCreateMessage("");

    if (!newUser.username || !newUser.email || !newUser.password) {
      setCreateError("Please complete name, email, and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/super-admin/users", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(newUser),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      setCreateMessage("User created successfully.");
      setNewUser({ username: "", email: "", password: "", role: "admin" });
      setRoleUpdates((prev) => ({ ...prev, [data._id]: data.role }));
      
      fetchManagedUsers();
      fetchDashboardData();
      fetchRecentLogs();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  const handleUpdateUserRole = async (userId: string, selectedRole: string) => {
    if (!selectedRole) return;
    setError("");

    try {
      const response = await fetch(`http://localhost:5000/api/super-admin/users/${userId}`, {
        method: "PATCH",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update user role");
      }

      setRoleUpdates((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });

      fetchManagedUsers();
      fetchDashboardData();
      fetchRecentLogs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to update role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Delete this user from the platform?")) {
      return;
    }

    setError("");
    try {
      const response = await fetch(`http://localhost:5000/api/super-admin/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      fetchManagedUsers();
      fetchDashboardData();
      fetchRecentLogs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to delete user");
    }
  };

  const handleUpdateTenant = async (tenantId: string, status?: string, plan?: string) => {
    setError("");
    try {
      const body: Record<string, string> = {};
      if (status) body.status = status;
      if (plan) body.plan = plan;

      const response = await fetch(`http://localhost:5000/api/super-admin/tenants/${tenantId}`, {
        method: "PATCH",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update organization parameters");
      }

      fetchTenants();
      fetchDashboardData();
      fetchRecentLogs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to update tenant settings");
    }
  };

  const handleAdjustCredits = async () => {
    if (!selectedTenantForCredits || creditAmount === "" || isNaN(Number(creditAmount))) {
      setCreditError("Please specify a valid numeric credit amount.");
      return;
    }

    setAdjustingCredits(true);
    setCreditError("");
    setCreditSuccess("");

    try {
      const response = await fetch(`http://localhost:5000/api/super-admin/tenants/${selectedTenantForCredits._id}/credits`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({
          amount: Number(creditAmount),
          reason: creditReason || "Super Admin Manual Adjustment",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to allocate credits");
      }

      setCreditSuccess(`Successfully adjusted balance by ${creditAmount} credits.`);
      setCreditAmount("");
      setCreditReason("");
      
      setTimeout(() => {
        setSelectedTenantForCredits(null);
        setCreditSuccess("");
      }, 1500);

      fetchTenants();
      fetchDashboardData();
      fetchRecentLogs();
    } catch (err: unknown) {
      setCreditError(err instanceof Error ? err.message : "Unable to adjust credit ledgers");
    } finally {
      setAdjustingCredits(false);
    }
  };

  const filteredUsers = managedUsers.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredTenants = tenants.filter((t) => {
    return (
      t.name.toLowerCase().includes(tenantsSearch.toLowerCase()) ||
      t.domain.toLowerCase().includes(tenantsSearch.toLowerCase())
    );
  });

  const getLogActionBadge = (action: string) => {
    const act = action.toLowerCase();
    if (act === "login") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50";
    if (act === "create") return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50";
    if (act === "update") return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50";
    if (act === "delete") return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-100 dark:border-rose-900/50";
    return "bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border border-slate-100 dark:border-slate-900/50";
  };

  const formatLogTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold tracking-wider">Loading Platform Control Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300 text-slate-800 dark:text-slate-200">
      
      {/* Accent Stripe */}
      <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <SuperAdminNavBar />
      
      <div className="flex max-w-6xl py-10 px-6 flex-col items-start gap-10 w-full">
        
        {/* Hero Greeting Card */}
        <div className="relative w-full rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md p-8 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-700 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Platform Console Active
                </span>
              </div>
              <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-1.5">
                Platform control hub
              </h1>
              <p className="text-gray-400 dark:text-slate-400 text-sm max-w-xl">
                Direct administrative power over global accounts, active organization instances, subscription packages, and dynamic operational statistics.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 shrink-0">
              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 shadow-sm text-center min-w-32">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Active User</p>
                <p className="mt-1.5 text-lg font-extrabold text-slate-800 dark:text-white truncate max-w-[120px]">
                  {user?.username || "SuperAdmin"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 shadow-sm text-center min-w-32">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Global Role</p>
                <p className="mt-1.5 text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  {roleLabels[user?.role ?? "super_admin"]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid - Changed to 5 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5 w-full">
          
          {/* Card 1: Users & Team */}
          <div 
            onClick={() => {
              document
                .getElementById("super-admin-users")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 p-6 flex flex-col cursor-pointer"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-sm shrink-0">
                <Users size={20} className="text-white" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-300">
                {managedUsers.length} Users
              </span>
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1.5">Users & team</h3>
            <p className="text-gray-400 dark:text-slate-400 text-sm leading-relaxed mb-5">Configure and modify platform-wide staff credentials.</p>
            <div className="border-t border-gray-50 dark:border-slate-700 pt-4 mt-auto">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                Configure team <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          {/* Card 2: Organization Plans */}
          <div 
            onClick={() => {
              document
                .getElementById("super-admin-tenants")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 p-6 flex flex-col cursor-pointer"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br from-purple-500 to-violet-600 shadow-sm shrink-0">
                <Building2 size={20} className="text-white" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/40 dark:text-purple-300">
                {tenants.length} Tenants
              </span>
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1.5">Organization plans</h3>
            <p className="text-gray-400 dark:text-slate-400 text-sm leading-relaxed mb-5">Adjust plans, suspend domains, or grant core credits.</p>
            <div className="border-t border-gray-50 dark:border-slate-700 pt-4 mt-auto">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                Manage Tenants <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          {/* Card 3: Security Trail */}
          <div 
            onClick={() => navigate("/audit-log")}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 p-6 flex flex-col cursor-pointer"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br from-sky-500 to-blue-600 shadow-sm shrink-0">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-900/40 dark:text-sky-300">
                Logs Trail
              </span>
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1.5">Security trail</h3>
            <p className="text-gray-400 dark:text-slate-400 text-sm leading-relaxed mb-5">Inspect audit actions and global transaction timelines.</p>
            <div className="border-t border-gray-50 dark:border-slate-700 pt-4 mt-auto">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                Explore logs <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          {/* Card 4: System Metrics */}
          <div 
            onClick={() => navigate("/analytics")}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 p-6 flex flex-col cursor-pointer"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 shadow-sm shrink-0">
                <FileText size={20} className="text-white" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 dark:text-emerald-300">
                Metrics Active
              </span>
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1.5">System metrics</h3>
            <p className="text-gray-400 dark:text-slate-400 text-sm leading-relaxed mb-5">Track feedback surveys and system growth details.</p>
            <div className="border-t border-gray-50 dark:border-slate-700 pt-4 mt-auto">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                Review analytics <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          {/* Card 5: Templates Library - NEW */}
          <div 
            onClick={() => navigate("/super-admin/templates")}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-300 p-6 flex flex-col cursor-pointer"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br from-orange-500 to-pink-600 shadow-sm shrink-0">
                <LayoutTemplate size={20} className="text-white" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/40 dark:text-orange-300">
                {templatesCount} Templates
              </span>
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1.5">Templates Library</h3>
            <p className="text-gray-400 dark:text-slate-400 text-sm leading-relaxed mb-5">Create and manage survey templates for organization admins.</p>
            <div className="border-t border-gray-50 dark:border-slate-700 pt-4 mt-auto">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                Manage Templates <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>

        </div>

        {/* Dynamic Operational Metrics Deck */}
        <div className="w-full">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 dark:text-white text-xl font-extrabold leading-8">
                Platform operational metrics:
              </h2>
              <button 
                onClick={fetchDashboardData}
                disabled={statsLoading}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition disabled:opacity-50"
                title="Refetch operational counts"
              >
                <RefreshCw size={14} className={statsLoading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
              
              {/* Stat 1: Active Tenants */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/40">
                    <Building2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {statsLoading ? "..." : stats.activeTenants}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Active tenants
                    </p>
                  </div>
                </div>
              </div>

              {/* Stat 2: Total Accounts */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/40">
                    <Users size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {statsLoading ? "..." : stats.totalUsers}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Registered users
                    </p>
                  </div>
                </div>
              </div>

              {/* Stat 3: Total Surveys */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/40">
                    <FileText size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {statsLoading ? "..." : stats.totalSurveys}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Compiled surveys
                    </p>
                  </div>
                </div>
              </div>

              {/* Stat 4: Total Footprints */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-900/40">
                    <Shield size={20} className="text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {statsLoading ? "..." : stats.totalAuditLogs}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Audit footprint
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Global User Control Panel Section */}
        <section id="super-admin-users" className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 w-full">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={22} className="text-indigo-500" />
              Global administrative management
            </h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed font-sans">
              Review credential levels, establish new workspace staff, adjust client permissions, or delete deprecated accounts permanently.
            </p>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            
            {/* User management list and filter panel */}
            <div className="space-y-4">
              
              {/* Search, Filter, and Action Bar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search accounts by username or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none transition duration-200 focus:border-indigo-500/50"
                  />
                </div>

                {/* Role Selector Filter */}
                <div className="relative w-full sm:w-52">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Filter size={14} />
                  </span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-3 pl-9 pr-8 text-sm text-slate-800 dark:text-slate-200 outline-none transition duration-200 focus:border-indigo-500/50 appearance-none cursor-pointer"
                  >
                    <option value="">All Account Levels</option>
                    <option value="admin">Tenant Admins</option>
                    <option value="creator">Creators</option>
                    <option value="viewer">Viewers</option>
                    <option value="billing_manager">Billing Managers</option>
                  </select>
                </div>

                {/* Refresh list button */}
                <button
                  onClick={fetchManagedUsers}
                  disabled={usersLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition disabled:opacity-50"
                >
                  <RefreshCw size={14} className={usersLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {/* Table Container */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-4">
                <div className="flex items-center justify-between pb-4">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-wide">Platform users</h3>
                  <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                    {filteredUsers.length} matched users
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3 font-semibold">User Details</th>
                        <th className="px-4 py-3 font-semibold">Authorization</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((managedUser) => {
                        const pendingRole = roleUpdates[managedUser._id] ?? managedUser.role;
                        const isCurrentUser = managedUser._id === user?._id;
                        const isSuperAdmin = managedUser.role === "super_admin";
                        
                        return (
                          <tr
                            key={managedUser._id}
                            className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <div className="font-bold text-slate-900 dark:text-white text-sm">{managedUser.username}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{managedUser.email}</div>
                            </td>
                            
                            <td className="px-4 py-4">
                              <select
                                value={pendingRole}
                                onChange={(e) =>
                                  setRoleUpdates((prev) => ({
                                    ...prev,
                                    [managedUser._id]: e.target.value,
                                  }))
                                }
                                disabled={isCurrentUser || isSuperAdmin}
                                className="w-full max-w-[180px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none transition focus:border-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <option value="admin">Tenant Admin</option>
                                <option value="creator">Creator</option>
                                <option value="viewer">Viewer</option>
                                <option value="billing_manager">Billing Manager</option>
                              </select>
                            </td>
                            
                            <td className="px-4 py-4 text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => handleUpdateUserRole(managedUser._id, pendingRole)}
                                  disabled={
                                    isCurrentUser ||
                                    isSuperAdmin ||
                                    pendingRole === managedUser.role
                                  }
                                  className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-white transition ${
                                    isCurrentUser || isSuperAdmin || pendingRole === managedUser.role
                                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                      : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/10"
                                  }`}
                                  title="Save role update"
                                >
                                  <Save size={12} />
                                  Save
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(managedUser._id)}
                                  disabled={isCurrentUser || isSuperAdmin}
                                  className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
                                    isCurrentUser || isSuperAdmin
                                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                      : "bg-rose-50 dark:bg-rose-950 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600"
                                  }`}
                                  title="Delete platform account"
                                >
                                  <Trash2 size={12} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredUsers.length === 0 && !usersLoading && (
                        <tr>
                          <td colSpan={3} className="px-4 py-12 text-center text-sm text-slate-400">
                            No platform users match your search and filter parameters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Add New User Panel */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6 text-slate-700 dark:text-slate-200 shadow-sm h-fit">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus size={18} className="text-indigo-500" />
                Provision new credential
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Establish a secure user record and role assignment directly in the system databases.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Full name</label>
                  <input
                    value={newUser.username}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="Account name details"
                    className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email address</label>
                  <input
                    value={newUser.email}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="username@platform.com"
                    className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Access password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimum 8 characters"
                    className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Platform authorization</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500/50 cursor-pointer"
                  >
                    <option value="admin">Tenant Admin</option>
                    <option value="creator">Creator</option>
                    <option value="viewer">Viewer</option>
                    <option value="billing_manager">Billing Manager</option>
                  </select>
                </div>
                
                <button
                  onClick={handleCreateUser}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition duration-300 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 mt-2"
                >
                  Add Platform User
                </button>
                
                {createError && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-100 dark:border-rose-900/50 p-3 text-xs text-rose-600 dark:text-rose-400">
                    <AlertCircle size={14} />
                    {createError}
                  </div>
                )}
                {createMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900/50 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={14} />
                    {createMessage}
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Global Organization & Subscription Controls Section */}
        <section id="super-admin-tenants" className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 w-full">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 size={22} className="text-indigo-500" />
              Global organization & subscription controls
            </h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed font-sans">
              Review and regulate registered corporate tenants, toggle active/suspended statuses, upgrade package tiers, and manually distribute promotional credits.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            
            {/* Tenant search and refresh header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search tenants by organization name or domain address..."
                  value={tenantsSearch}
                  onChange={(e) => setTenantsSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none transition duration-200 focus:border-indigo-500/50"
                />
              </div>
              
              <button
                onClick={fetchTenants}
                disabled={tenantsLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={tenantsLoading ? "animate-spin" : ""} />
                Refresh Tenants
              </button>
            </div>

            {/* Inline Credit Adjustment Modal Overlay */}
            {selectedTenantForCredits && (
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-6 shadow-md relative overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => {
                    setSelectedTenantForCredits(null);
                    setCreditError("");
                    setCreditSuccess("");
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg p-1 bg-white/10 hover:bg-white/20"
                >
                  <X size={16} />
                </button>

                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Coins size={16} className="text-amber-500 animate-bounce" />
                  Credit balance override: <span className="text-indigo-600 dark:text-indigo-300">{selectedTenantForCredits.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust credit balances dynamically. Enter a positive number to add credits, or a negative number to subtract credits.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-3 items-end">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Adjustment amount</label>
                    <input 
                      type="number"
                      placeholder="e.g. 500 or -200"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-850 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reason for adjustment</label>
                      <input 
                        type="text"
                        placeholder="e.g. Billing promotion / credit grant"
                        value={creditReason}
                        onChange={(e) => setCreditReason(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-850 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      onClick={handleAdjustCredits}
                      disabled={adjustingCredits}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition disabled:opacity-50 h-fit"
                    >
                      Adjust Credits
                    </button>
                  </div>
                </div>

                {creditError && (
                  <p className="mt-3 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {creditError}
                  </p>
                )}
                {creditSuccess && (
                  <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={12} />
                    {creditSuccess}
                  </p>
                )}
              </div>
            )}

            {/* Tenants Table Container */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm text-slate-650 dark:text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-3 font-semibold">Organization Profile</th>
                      <th className="px-4 py-3 font-semibold">Workspace Owner</th>
                      <th className="px-4 py-3 font-semibold">Package Tier</th>
                      <th className="px-4 py-3 font-semibold">Operational Status</th>
                      <th className="px-4 py-3 font-semibold text-center">Credit ledger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((tenant) => {
                      return (
                        <tr 
                          key={tenant._id}
                          className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{tenant.name}</div>
                            <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 tracking-wide">{tenant.domain}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{tenant.country || "Global Region"}</div>
                           </td>
                          <td className="px-4 py-4">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {tenant.createdBy ? tenant.createdBy.username : "Platform System"}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {tenant.createdBy ? tenant.createdBy.email : "daemon@core"}
                            </div>
                           </td>
                          <td className="px-4 py-4">
                            <select
                              value={tenant.plan}
                              onChange={(e) => handleUpdateTenant(tenant._id, undefined, e.target.value)}
                              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:border-indigo-500"
                            >
                              <option value="free">Free Tier</option>
                              <option value="premium">Premium Pack</option>
                            </select>
                           </td>
                          <td className="px-4 py-4">
                            <select
                              value={tenant.status}
                              onChange={(e) => handleUpdateTenant(tenant._id, e.target.value)}
                              className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs outline-none cursor-pointer focus:border-indigo-500 font-bold ${
                                tenant.status === "suspended" ? "text-rose-600 dark:text-rose-400" : tenant.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"
                              }`}
                            >
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                              <option value="inactive">Inactive</option>
                            </select>
                           </td>
                          <td className="px-4 py-4 text-center">
                            <div className="inline-flex flex-col items-center gap-2">
                              <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                                <Coins size={12} />
                                {tenant.creditBalance}
                              </div>
                              <button
                                  onClick={() => {
                                    setSelectedTenantForCredits(tenant);
                                    setCreditError("");
                                    setCreditSuccess("");
                                  }}
                                  className="inline-flex items-center gap-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 transition hover:bg-indigo-500/10 hover:border-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-300"
                                >
                                <Plus size={10} />
                                Adjust
                              </button>
                            </div>
                           </td>
                         </tr>
                      );
                    })}
                    {filteredTenants.length === 0 && !tenantsLoading && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">
                          No registered organizations match your search parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>

        {/* Security Trail Preview Section */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 w-full">
          <div className="flex items-center justify-between pb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={20} className="text-indigo-500" />
                Live security audit trail preview
              </h2>
              <p className="mt-1 text-xs text-slate-400 font-sans">
                Most recent transactions performed globally by operators on the platform.
              </p>
            </div>

            <div className="inline-flex gap-2">
              <button
                onClick={fetchRecentLogs}
                disabled={logsLoading}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition disabled:opacity-50"
                title="Refresh security feed"
              >
                <RefreshCw size={14} className={logsLoading ? "animate-spin" : ""} />
              </button>
              <button 
                onClick={() => navigate("/audit-log")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-300"
              >
                <Eye size={12} />
                Full Audit Log
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            {logsLoading ? (
              <div className="text-center py-12 text-sm text-slate-400 flex flex-col items-center gap-3">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                Querying live audit records...
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="text-center py-12 text-sm text-slate-400">
                No active logs are recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentLogs.map((log) => (
                  <div 
                    key={log._id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wider border uppercase ${getLogActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {log.user_id ? log.user_id.username : "System Daemon"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({log.user_id ? log.user_id.email : "system@kernel"})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-400 leading-relaxed max-w-3xl">
                        {log.description}
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center text-[10px] text-slate-400 dark:text-slate-500 gap-1.5 shrink-0">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} className="text-slate-350 dark:text-slate-650" />
                        {formatLogTimestamp(log.createdAt)}
                      </div>
                      <div className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-900/50">
                        {log.entity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}