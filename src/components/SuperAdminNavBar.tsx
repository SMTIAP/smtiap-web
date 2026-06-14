import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  LayoutDashboard,
  User,
} from "lucide-react";
import api from "../api/api";
import { useDarkMode } from "../contexts/DarkModeContext";

interface SuperAdminUser {
  username: string;
  email: string;
  role: string;
}

// Navigation bar for the super admin panel with role badge, dark mode toggle, and sign-out.
export default function SuperAdminNavBar() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<SuperAdminUser | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .get("/me")
      .then((res) => {
        if (mounted) {
          setUser(res.data);
        }
      })
      .catch(() => {
        if (mounted) setUser(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await api.post("/logout");
    } catch {
      // ignore logout failure
    }
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const initials = user?.username
    ? user.username
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SA";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-transparent bg-linear-to-r from-[#4C1D95] to-[#8B5CF6] shadow-xl shadow-purple-500/20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/15 text-xl font-black shadow-lg shadow-white/10">
            SA
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
              SuperAdmin
            </p>
            <p className="text-xs text-white/70">Organization Admin</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-all"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <Sun size={16} className="text-yellow-300" />
            ) : (
              <Moon size={16} className="text-white" />
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-3xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-sm font-black">
                {initials}
              </span>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold">
                  {user?.username || "SuperAdmin"}
                </p>
                <p className="text-xs text-white/70">
                  {user?.email || "superadmin@email"}
                </p>
              </div>
              <ChevronDown size={18} className="text-white/80" />
            </button>

            {dropdownOpen && (
              <div
                className={`absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border-2 shadow-2xl transition-all duration-200 ${
                  darkMode
                    ? "border-purple-400 bg-slate-900 text-white shadow-purple-500/30"
                    : "border-indigo-400 bg-white text-slate-800 shadow-indigo-200/50"
                }`}
              >
                {/* User Info Section */}
                <div
                  className={`flex items-center gap-3 p-4 ${
                    darkMode
                      ? "bg-white/5 border-b border-purple-400/30"
                      : "bg-indigo-50 border-b border-indigo-200"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black ${
                      darkMode
                        ? "bg-purple-500/30 text-purple-300"
                        : "bg-indigo-200 text-indigo-700"
                    }`}
                  >
                    {initials}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        darkMode ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {user?.username || "SuperAdmin"}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {user?.email || "superadmin@example.com"}
                    </p>
                  </div>
                </div>

                {/* Role & Theme Section */}
                <div
                  className={`p-4 border-b ${
                    darkMode ? "border-purple-400/30" : "border-indigo-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        darkMode ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      <User size={16} />
                      <span>Organization Admin</span>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        darkMode
                          ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-400"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-300"
                      }`}
                    >
                      {darkMode ? "Light" : "Dark"}
                    </button>
                  </div>
                </div>

                {/* Dashboard Link */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/super-admin-dashboard");
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition-all ${
                    darkMode
                      ? "text-slate-300 hover:bg-white/5 hover:text-white"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Super Admin Dashboard
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className={`flex w-full items-center gap-3 rounded-b-2xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                    darkMode
                      ? "text-red-400 hover:bg-red-500/10 hover:text-red-300 border-t border-purple-400/30"
                      : "text-red-600 hover:bg-red-50 border-t border-indigo-200"
                  }`}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
