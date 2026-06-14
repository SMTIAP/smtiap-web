import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, ArrowLeft, CheckCheck, Loader2 } from "lucide-react";

// Notification item returned by the API, with optional survey context.
interface NotificationItem {
  _id: string;
  type: string;
  data?: { message?: string; surveyId?: string; surveyName?: string };
  read_at: string | null;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const authHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  const id = localStorage.getItem("activeTenantId");
  if (id && id !== "__system__") headers["x-tenant-id"] = id;
  return headers;
};

// Format ISO timestamp to DD.MM.YYYY HH:mm for consistent locale-independent display.
function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Paginated notification list with mark-as-read functionality.
export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const [markingAll, setMarkingAll] = useState(false);

  // Fetch paginated notifications from the API.
  const fetchNotifications = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/notifications?page=${page}&limit=20`,
        { headers: authHeaders(), credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setPagination(data.pagination);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  // Mark a single notification as read and optimistically update local state.
  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: authHeaders(),
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read_at: new Date().toISOString() } : n,
        ),
      );
    } catch {
      // silently fail
    }
  };

  // Mark all unread notifications as read, then optimistically update local state.
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: "PATCH",
        headers: authHeaders(),
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.read_at ? n : { ...n, read_at: new Date().toISOString() },
        ),
      );
    } catch {
      // silently fail
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="w-full max-w-3xl px-6 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <ArrowLeft
                size={16}
                className="text-slate-600 dark:text-slate-300"
              />
            </button>
            <h1 className="text-2xl font-black tracking-tight text-[#0D141C] dark:text-white">
              Notifications
            </h1>
            {pagination.totalCount > 0 && (
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                ({pagination.totalCount})
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCheck size={14} />
              )}
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 size={28} className="animate-spin mb-3" />
            <p className="text-sm font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <Bell size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-bold text-slate-500 dark:text-slate-400">
              No notifications yet
            </p>
            <p className="text-sm mt-1">
              You'll see notifications here when someone adds you or updates
              your role.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
              {notifications.map((notif) => {
                const isUnread = !notif.read_at;
                return (
                  <div
                    key={notif._id}
                    className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                      isUnread
                        ? "bg-indigo-50/40 dark:bg-indigo-900/10"
                        : "bg-white dark:bg-slate-800"
                    } hover:bg-indigo-100 dark:hover:bg-indigo-900/50`}
                  >
                    {/* Unread indicator */}
                    <div className="flex flex-col items-center pt-1">
                      {isUnread ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-transparent shrink-0" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          isUnread
                            ? "font-semibold text-slate-800 dark:text-white"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {notif.data?.message ?? "No message"}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                        {formatTimestamp(notif.created_at)}
                      </p>
                    </div>

                    {/* Mark as read */}
                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Mark as read"
                      >
                        <Check size={15} className="text-slate-400" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  onClick={() => fetchNotifications(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchNotifications(page)}
                    className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                      pagination.page === page
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => fetchNotifications(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
