// src/pages/SuperAdminAuditLog.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Eraser, ArrowLeft, RefreshCw, Eye } from "lucide-react";
import SuperAdminNavBar from "../components/SuperAdminNavBar";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface AuditLogEntry {
  _id: string;
  user_id: { _id: string; username: string; email: string } | null;
  tenant_id?: { _id: string; name: string } | null;
  action: string;
  entity: string;
  entity_id: string;
  createdAt: string;
  description: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function SuperAdminAuditLog() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });

  // Filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [entities, setEntities] = useState<string[]>([]);
  const [tenants, setTenants] = useState<{ _id: string; name: string }[]>([]);

  const token = localStorage.getItem("token");
  const authHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  // Fetch filter options from super admin endpoints
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Get distinct actions from super admin endpoint
        const actionsRes = await fetch(`${API_BASE}/api/super-admin/audit-actions`, {
          headers: authHeaders(),
        });
        const actionsData = await actionsRes.json();
        if (actionsData.success) setActions(actionsData.data);

        // Get distinct entities from super admin endpoint
        const entitiesRes = await fetch(`${API_BASE}/api/super-admin/audit-entities`, {
          headers: authHeaders(),
        });
        const entitiesData = await entitiesRes.json();
        if (entitiesData.success) setEntities(entitiesData.data);

        // Get all tenants for filtering
        const tenantsRes = await fetch(`${API_BASE}/api/super-admin/tenants`, {
          headers: authHeaders(),
        });
        const tenantsData = await tenantsRes.json();
        setTenants(tenantsData);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };
    fetchFilters();
  }, []);

  // Fetch logs from super admin endpoint
  const fetchLogs = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");

      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      if (actionFilter) params.append("action", actionFilter);
      if (entityFilter) params.append("entity", entityFilter);
      if (tenantFilter) params.append("tenantId", tenantFilter);

      const response = await fetch(`${API_BASE}/api/super-admin/audit-logs?${params.toString()}`, {
        headers: authHeaders(),
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, actionFilter, entityFilter, tenantFilter]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    setActionFilter("");
    setEntityFilter("");
    setTenantFilter("");
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Timestamp", "User", "Email", "Tenant", "Action", "Entity", "Description"];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toLocaleString(),
      log.user_id?.username ?? "System",
      log.user_id?.email ?? "",
      log.tenant_id?.name ?? "Platform-wide",
      log.action,
      log.entity,
      log.description,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `super-admin-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export started");
  };

  const getActionColor = (action: string) => {
    const a = action.toLowerCase();
    if (a === "login") return "bg-emerald-500";
    if (a === "logout") return "bg-gray-500";
    if (a === "create") return "bg-green-500";
    if (a === "update") return "bg-amber-500";
    if (a === "delete") return "bg-red-500";
    if (a === "add") return "bg-green-700";
    if (a === "ai-analysis-run") return "bg-purple-700";
    if (a.startsWith("status_change")) return "bg-purple-500";
    return "bg-indigo-500";
  };

  const formatAction = (action: string) => {
    if (action.startsWith("status_change_")) {
      const status = action.replace("status_change_", "");
      return `Status → ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <SuperAdminNavBar />

      <div className="w-full max-w-7xl px-6 py-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate("/super-admin-dashboard")}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-3 text-sm"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-black tracking-tight text-[#0D141C] dark:text-white flex items-center gap-3">
              <Eye size={28} className="text-indigo-500" />
              Super Admin Audit Log
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Complete platform-wide audit trail - all tenants, all users
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Action
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Actions</option>
                {actions.map((action) => (
                  <option key={action} value={action}>{formatAction(action)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Entity
              </label>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Entities</option>
                {entities.map((entity) => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Tenant
              </label>
              <select
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Tenants</option>
                <option value="__system__">Platform-wide (System)</option>
                {tenants.map((tenant) => (
                  <option key={tenant._id} value={tenant._id}>{tenant.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <Eraser size={16} />
              Clear Filters
            </button>
            <button
              onClick={() => fetchLogs(1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Apply Filters
            </button>
            <button
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                <Eye size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No audit logs found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tenant</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Entity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-white">
                            {log.user_id?.username || "System"}
                          </p>
                          <p className="text-xs text-slate-400">{log.user_id?.email || "system@kernel"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {log.tenant_id?.name || "🌍 Platform-wide"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${getActionColor(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{log.entity}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 max-w-md break-words">{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => fetchLogs(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchLogs(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}

          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 text-center text-xs text-slate-400">
            Total {pagination.totalCount} audit records found
          </div>
        </div>
      </div>
    </div>
  );
}