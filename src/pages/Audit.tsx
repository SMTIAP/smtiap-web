import BackButton from "../components/BackButton";
import { useState, useEffect, useCallback } from "react";
import api from "../api/api";

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
            <h1 className="text-[#1E293B] dark:text-white font-inter text-3xl font-bold leading-9">
              Audit Trail
            </h1>
          </div>
        </div>

        <div className="flex flex-col w-full max-w-150 gap-4">
          <div className="flex items-center gap-4">
            {/* From Date */}
            <div className="flex flex-col gap-2 flex-1">
              <label
                htmlFor="from-date"
                className="text-gray-700 dark:text-slate-300 font-inter text-sm font-medium"
              >
                From
              </label>
              <input
                type="date"
                id="from-date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-2 flex-1">
              <label
                htmlFor="to-date"
                className="text-gray-700 dark:text-slate-300 font-inter text-sm font-medium"
              >
                To
              </label>
              <input
                type="date"
                id="to-date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Action Type */}
            <div className="flex flex-col gap-2 flex-1">
              <label
                htmlFor="action-type"
                className="text-gray-700 dark:text-slate-300 font-inter text-sm font-medium"
              >
                Action Type
              </label>
              <select
                id="action-type"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Action</option>
                {actions.map((action) => (
                  <option key={action} value={action}>
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
              className="bg-gray-400 cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90"
            >
              Clear
            </button>
            <div className="relative inline-block">
              <button
                onClick={handleExportCSV}
                disabled={logs.length === 0}
                className="bg-blue-400 cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export CSV
              </button>
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
              <table className="min-w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg transition-colors duration-300">
                <thead className="bg-gray-100 dark:bg-slate-900">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                      Timestamp
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                      Username
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                      Type
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                      Entity
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-b border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                        {formatTimestamp(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                        {log.user_id.username}
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                        <button
                          className={`px-3 py-1 ${getActionColor(log.action)} text-white text-sm rounded`}
                        >
                          {formatAction(log.action)}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                        {log.entity}
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-slate-200 w-[300px] max-w-[300px] whitespace-normal break-words">
                        {log.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
                        ? "bg-blue-500 text-white"
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
