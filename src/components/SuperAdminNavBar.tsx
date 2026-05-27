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
import { useDarkMode } from "../App";

interface SuperAdminUser {
  username: string;
  email: string;
  role: string;
}

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
            <p className="text-xs text-white/70">
              Organization Admin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            {darkMode ? <Moon size={16} /> : <Sun size={16} />}
            <span className="hidden sm:inline">Light Mode</span>
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
                <p className="text-sm font-semibold">{user?.username || "SuperAdmin"}</p>
                <p className="text-xs text-white/70">{user?.email || "superadmin@email"}</p>
              </div>
              <ChevronDown size={18} className="text-white/80" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 p-4 text-white shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                <div className="flex items-center gap-3 rounded-3xl bg-white/10 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-lg font-black">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user?.username || "SuperAdmin"}</p>
                    <p className="text-[13px] text-slate-300">{user?.email || "superadmin@example.com"}</p>
                  </div>
                </div>

                <div className="my-4 rounded-3xl bg-slate-900/80 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>Organization Admin</span>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className="rounded-full bg-white/10 px-3 py-1 text-[13px] text-white transition hover:bg-white/15"
                    >
                      {darkMode ? "Dark" : "Light"}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/super-admin-dashboard");
                  }}
                  className="flex w-full items-center gap-3 rounded-3xl bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <LayoutDashboard size={16} />
                  Super Admin Dashboard
                </button>

                <button
                  onClick={handleSignOut}
                  className="mt-3 flex w-full items-center gap-3 rounded-3xl bg-red-600 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-red-500"
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
