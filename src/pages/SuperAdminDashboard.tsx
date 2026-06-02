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

  // FIXED: Scroll to section with navbar offset
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Find the navbar - adjust selector to match your actual navbar
      const navbar = document.querySelector('nav') || document.querySelector('.navbar') || document.querySelector('header');
      const navHeight = navbar ? navbar.getBoundingClientRect().height : 80;
      
      // Get element position and calculate offset
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navHeight - 15; // 15px extra padding for breathing room
      
      // Smooth scroll to adjusted position
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
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
        
        {/* Hero Greeting Card - REMOVED Active User and Global Role cards */}
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
          </div>
        </div>

        {/* Feature Cards Grid - 5 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5 w-full">
          
          {/* Card 1: Users & Team */}
          <div 
            onClick={() => scrollToSection("super-admin-users")}
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
            onClick={() => scrollToSection("super-admin-tenants")}
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
            onClick={() => scrollToSection("security-trail-section")}
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
                View Audit Trail <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          {/* Card 4: System Metrics */}
          <div 
            onClick={() => scrollToSection("metrics-section")}
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
                View Metrics <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          {/* Card 5: Templates Library */}
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

        {/* Dynamic Operational Metrics Deck - Added ID for scrolling */}
        <div id="metrics-section" className="w-full scroll-mt-24">
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
        <section id="super-admin-users" className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 w-full scroll-mt-24">
          {/* User management header */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={22} className="text-indigo-500" />
              Global administrative management
            </h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed font-sans">
              Review credential levels, establish new workspace staff, adjust client permissions, or delete deprecated accounts permanently.
            </p>
          </div>

          {/* Search and filter bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search accounts by username or email."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none cursor-pointer"
                >
                  <option value="">All Account Levels</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Tenant Admin</option>
                  <option value="creator">Creator</option>
                  <option value="viewer">Viewer</option>
                  <option value="billing_manager">Billing Manager</option>
                </select>
              </div>
              
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error/Message display */}
          {error && (
            <div className="mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3 flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="text-xs text-rose-700 dark:text-rose-300">{error}</span>
            </div>
          )}

          {/* Users table */}
          <div className="mt-6 overflow-x-auto">
            {usersLoading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No platform users match your current search filters.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">User Details</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Authorization</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-4">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{u.username}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                       </td>
                      <td className="py-4">
                        {roleUpdates[u._id] !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                              {roleLabels[roleUpdates[u._id]]}
                            </span>
                            <button
                              onClick={() => handleUpdateUserRole(u._id, roleUpdates[u._id])}
                              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                              title="Save role"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setRoleUpdates((prev) => {
                                  const updated = { ...prev };
                                  delete updated[u._id];
                                  return updated;
                                });
                              }}
                              className="text-slate-400 hover:text-slate-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => setRoleUpdates((prev) => ({ ...prev, [u._id]: e.target.value }))}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Tenant Admin</option>
                            <option value="creator">Creator</option>
                            <option value="viewer">Viewer</option>
                            <option value="billing_manager">Billing Manager</option>
                          </select>
                        )}
                       </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Create new user form */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={16} className="text-indigo-500" />
              <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Provision new credential
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Establish a secure user record and role assignment directly in the system databases.
            </p>
            
            {createError && (
              <div className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-2.5 flex items-center gap-2">
                <AlertCircle size={12} className="text-rose-600" />
                <span className="text-xs text-rose-700 dark:text-rose-300">{createError}</span>
              </div>
            )}
            {createMessage && (
              <div className="mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2.5 flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span className="text-xs text-emerald-700 dark:text-emerald-300">{createMessage}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="FULL NAME"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <input
                type="password"
                placeholder="TEMPORARY PASSWORD"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="admin">Tenant Admin</option>
                <option value="creator">Creator</option>
                <option value="viewer">Viewer</option>
                <option value="billing_manager">Billing Manager</option>
              </select>
            </div>
            <button
              onClick={handleCreateUser}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <UserPlus size={14} />
              Create User Account
            </button>
          </div>
        </section>

        {/* Global Organization & Subscription Controls Section */}
        <section id="super-admin-tenants" className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 w-full scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 size={20} className="text-purple-500" />
                Workspace & tenant registry
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                View, filter, and manage all organization instances registered on the platform.
              </p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by tenant or domain"
                value={tenantsSearch}
                onChange={(e) => setTenantsSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          {tenantsLoading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No organization workspaces registered yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredTenants.map((tenant) => (
                <div key={tenant._id} className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4 transition hover:border-slate-200 dark:hover:border-slate-600">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="font-bold text-slate-800 dark:text-white truncate">{tenant.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          tenant.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                          tenant.status === "suspended" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" :
                          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {tenant.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          tenant.plan === "premium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {tenant.plan}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{tenant.domain}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Coins size={10} />
                          Credits: {tenant.creditBalance}
                        </span>
                        <span>📍 {tenant.country}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateTenant(tenant._id, tenant.status === "active" ? "suspended" : "active")}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          tenant.status === "active" 
                            ? "border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400"
                        }`}
                      >
                        {tenant.status === "active" ? <Ban size={12} /> : <CheckCircle2 size={12} />}
                        {tenant.status === "active" ? "Suspend" : "Activate"}
                      </button>
                      
                      <button
                        onClick={() => handleUpdateTenant(tenant._id, undefined, tenant.plan === "premium" ? "free" : "premium")}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <ArrowRightLeft size={12} />
                        Switch to {tenant.plan === "premium" ? "Free" : "Premium"}
                      </button>
                      
                      <button
                        onClick={() => setSelectedTenantForCredits(tenant)}
                        className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-950/30 dark:text-indigo-400"
                      >
                        <Coins size={12} />
                        Allocate Credits
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Security Trail Preview Section */}
        <section id="security-trail-section" className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 w-full scroll-mt-24">
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