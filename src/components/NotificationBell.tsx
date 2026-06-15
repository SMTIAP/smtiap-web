import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, ExternalLink, Loader2 } from "lucide-react";

interface NotificationItem {
  _id: string;
  type: string;
  data?: { message?: string; surveyId?: string; surveyName?: string };
  read_at: string | null;
  created_at: string;
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

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// Notification bell icon with dropdown: lists recent notifications, marks read, polls for unread count.
export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count periodically
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/unread-count`, {
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setUnreadCount(data.count);
    } catch {
      // silently fail
    }
  }, []);

  // Fetch recent notifications for the dropdown
  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/notifications?limit=5`, {
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setNotifications(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling for unread count
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open) fetchRecent();
  }, [open, fetchRecent]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
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
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

  const handleSeeAll = () => {
    setOpen(false);
    navigate("/notifications");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        title="Notifications"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell size={16} className="text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-md">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-90 max-h-120 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <Check size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="text-slate-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
                <Bell size={24} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {notifications.map((notif) => {
                  const isUnread = !notif.read_at;
                  return (
                    <li
                      key={notif._id}
                      className={`px-4 py-3 transition-colors ${
                        isUnread
                          ? "bg-indigo-50/60 dark:bg-indigo-900/20"
                          : "bg-white dark:bg-slate-800"
                      } hover:bg-indigo-100 dark:hover:bg-indigo-900/50`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Unread dot */}
                        {isUnread && (
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        )}
                        {!isUnread && (
                          <span className="mt-1.5 w-2 h-2 shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              isUnread
                                ? "font-semibold text-slate-800 dark:text-white"
                                : "text-slate-600 dark:text-slate-400"
                            } line-clamp-2`}
                          >
                            {notif.data?.message ?? "No message"}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                            {formatTimestamp(notif.created_at)}
                          </p>
                        </div>

                        {/* Mark as read button */}
                        {isUnread && (
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="shrink-0 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Mark as read"
                          >
                            <Check size={14} className="text-slate-400" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-2.5">
            <button
              onClick={handleSeeAll}
              className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 py-1 transition-colors"
            >
              <span>See all notifications</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
