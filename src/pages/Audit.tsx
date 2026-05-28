import BackButton from "../components/BackButton";
import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/api";
import { Download, Eraser} from "lucide-react";

interface AuditLogEntry {
  _id: string;
  user_id: { _id: string; username: string; email: string };
  action: string;
  entity: string;
  entity_id: string;
  createdAt: string;
  description: string;
  // timestamp: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function Audit() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [openExport, setOpenExport] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await api.get(
          "http://localhost:5000/api/audit-logs/filters/options",
        );
        if (response.data.success) {
          setActions(response.data.data.actions || []);
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setOpenExport(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  // Fetch logs
  const fetchLogs = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "10");

        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        if (actionFilter) params.append("action", actionFilter);

        const response = await api.get(
          `http://localhost:5000/api/audit-logs?${params.toString()}`,
        );

        if (response.data.success) {
          setLogs(response.data.data);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      } finally {
        setLoading(false);
      }
    },
    [fromDate, toDate, actionFilter],
  );

  // Fetch logs on filter change
  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    setActionFilter("");
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = [
      "Timestamp",
      "User",
      "Email",
      "Action",
      "Entity",
      "Entity ID",
      "Description",
    ];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toLocaleString(),
      log.user_id?.username ?? "",
      log.user_id?.email ?? "",
      log.action,
      log.entity,
      log.entity_id,
      log.description,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionColor = (action: string) => {
    const a = action.toLowerCase();
    if (a === "login") return "bg-blue-400";
    if (a === "logout") return "bg-gray-400";
    if (a === "create") return "bg-green-400";
    if (a === "update") return "bg-yellow-400";
    if (a === "delete") return "bg-red-400";
    if (a === "add") return "bg-green-700";
    if (a === "ai-analysis-run") return "bg-purple-700";
    if (a.startsWith("status_change")) return "bg-purple-400";
    return "bg-gray-400";
  };

  const formatAction = (action: string) => {
    if (action.startsWith("status_change_")) {
      const status = action.replace("status_change_", "");
      return `Status → ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="w-full max-w-6xl px-6 py-10 flex flex-col gap-10">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4 w-fit">
            <BackButton />
            <h2 className="text-3xl font-black tracking-tight text-[#0D141C] dark:text-white">
              Audit Trail
            </h2>
          </div>
        </div>

        <div className="w-full max-w-3xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-3">
            {/* From */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full md:w-[320px] px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 
                          bg-white dark:bg-slate-800 text-slate-800 dark:text-white 
                          shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* To */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full md:w-[320px] px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 
                          bg-white dark:bg-slate-800 text-slate-800 dark:text-white 
                          shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Action Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Action Type
              </label>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full md:w-[320px] px-4 py-2.5 text-sm rounded-xl 
                    border border-slate-200 dark:border-slate-700 
                    bg-white dark:bg-slate-800 
                    text-slate-700 dark:text-slate-200 
                    shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-indigo-400 
                    transition"
              >
                <option value="">All Actions</option>
                {actions.map((action) => (
                  <option key={action} value={action}  >
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center w-full">
          <div className="flex w-full justify-end gap-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 h-[40px] rounded-lg text-white font-semibold text-[13px] shadow-md transition-all duration-200 shrink-0 bg-gray-400 cursor opacity-70 hover:scale-[1.02]"
            >
              <Eraser size={16} />
              Clear
            </button>
            <div ref={dropdownRef} className="relative inline-block">
              <button
                onClick={() => setOpenExport((prev) => !prev)}
                className="flex items-center gap-1.5 px-4 h-[40px] rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-[13px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 shrink-0"
                        >
              <Download size={16} />
                Export
              </button>

              {openExport && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden z-50 animate-fade-in">
                  
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    Export CSV
                  </button>

                  <button
                    // onClick={exportExcel}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    Export Excel
                  </button>

                  <button
                    // onClick={exportPDF}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto mt-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              No audit logs found
            </div>
          ) : (
            <>
            <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              <table className="min-w-full border-separate border-spacing-y-1">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-100 dark:bg-slate-900">
                    <th className="text-left px-6 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Timestamp
                    </th>
                    <th className="text-left px-6 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Username
                    </th>
                    <th className="text-left px-6 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Type
                    </th>
                    <th className="text-left px-6 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Entity
                    </th>
                    <th className="text-left px-6 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log._id}
                      className="group bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition border-b border-slate-200 dark:border-slate-700"
                    >
                      <td className="px-6 py-3 text-slate-800 dark:text-slate-200 text-sm whitespace-nowrap border-b border-slate-200 dark:border-slate-700">
                        {formatTimestamp(log.createdAt)}
                      </td>

                      <td className="px-6 py-3 text-slate-800 dark:text-slate-200 text-sm font-medium border-b border-slate-200 dark:border-slate-700">
                        {log.user_id.username}
                      </td>

                      <td className="px-6 py-3 text-sm border-b border-slate-200 dark:border-slate-700">
                        <button
                          className={`px-3 py-1.5 ${getActionColor(log.action)} text-white text-xs rounded-md `}
                        >
                          {formatAction(log.action)}
                        </button>
                      </td>

                      <td className="px-6 py-3 text-slate-800 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-700">
                        {log.entity}
                      </td>

                      <td className="px-6 py-3 text-slate-700 dark:text-slate-300 text-sm max-w-[350px] break-words border-b border-slate-200 dark:border-slate-700">
                        {log.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt; Previous
                </button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchLogs(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      pagination.page === page
                        ? "flex items-center gap-1.5 px-4 h-[40px] rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-[13px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 shrink-0"
                        : "text-gray-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next &gt;
                </button>
              </div>

              {/* Entries Info */}
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-4">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalCount,
                )}{" "}
                of {pagination.totalCount} entries
              </p>

              <div className="mt-6 text-sm text-gray-500 dark:text-slate-400 text-center">
                <p>
                  Retention Policy: Logs are automatically purged after 1 year
                  (365 days)
                </p>
                <p>Next automatic purge: 31.12.2027</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
