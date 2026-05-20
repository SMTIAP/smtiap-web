import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileChartColumnIncreasing,
  LogOut,
  LayoutDashboard,
  LayoutGrid,
  ClipboardList,
  FileText,
  BarChart3,
  CreditCard,
  Users,
  Sun,
  Moon,
} from "lucide-react";
import api from "../api/api";
import { useDarkMode } from "../App";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid },
  { to: "/created-surveys", label: "Surveys", icon: ClipboardList },
  { to: "/templates", label: "Templates", icon: FileText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/subscription", label: "Subscription", icon: CreditCard },
  { to: "/role-management", label: "Employees", icon: Users },
];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === "/";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    username: string;
    email: string;
    role?: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    let mounted = true;
    api
      .get("/me")
      .then((res) => {
        if (mounted) {
          setIsAuthenticated(true);
          setUser({
            username: res.data.username,
            email: res.data.email,
            role: res.data.role,
          });
        }
      })
      .catch(() => {
        if (mounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      });
    return () => { mounted = false; };
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await api.post("/logout");
    } catch {
      // proceed regardless
    }
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    setDropdownOpen(false);
    navigate("/auth");
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "?";

  const roleLabels: Record<string, string> = {
    super_admin: "Organization Admin",
    admin: "Tenant Admin",
    viewer: "Viewer",
    creator: "Creator",
    billing_manager: "Billing Manager",
  };

  const getDashboardRoute = (role?: string) => {
    switch (role) {
      case "creator":
      case "creater":
        return "/creator-dashboard";
      case "super_admin":
      case "admin":
      default:
        return "/admin";
    }
  };

  // Hide dark mode toggle on landing page
  const showDarkToggle = !isLanding;

  return (
    <nav className={`sticky top-0 z-100 w-full h-17.5 transition-colors duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${isLanding ? "bg-white" : "bg-white dark:bg-[#0F172A] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]"}`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <Link
          to={isAuthenticated ? "/admin" : "/"}
          className="flex items-center gap-2 text-[20px] font-black tracking-tighter font-manrope text-[#0F172A] dark:text-white"
        >
          <span className="w-8 h-8 bg-[#5C38E1] rounded-lg rotate-12 flex items-center justify-center shadow-lg shadow-[#5C38E1]/20">
            <FileChartColumnIncreasing className="w-5 h-5 text-white" />
          </span>
          MTSP
        </Link>

        {/* Nav Links */}
        {isAuthenticated && !isLanding && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-bold transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm"
                      : "text-[#64748B] dark:text-slate-400 hover:text-[#334155] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`
                }
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">

          {/* Dark Mode Toggle — hidden on landing page */}
          {showDarkToggle && (
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode
                ? <Sun size={16} className="text-yellow-400" />
                : <Moon size={16} className="text-slate-500" />
              }
            </button>
          )}

          {/* Landing page auth buttons */}
          {isLanding && !isAuthenticated && (
            <>
              <Link
                to="/auth"
                className="text-[14px] font-bold text-[#475569] hover:text-[#5C38E1] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="bg-linear-to-br from-[#5C38E1] to-[#8E6BFF] text-white px-5 py-2 rounded-full font-bold text-[13px] shadow-xl shadow-purple-500/20 hover:scale-105 transition-transform"
              >
                Free Register
              </Link>
            </>
          )}

          {/* Authenticated user */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-3">
              {isLanding && (
                <Link
                  to="/admin"
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Go to Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5 text-[#5C38E1]" />
                </Link>
              )}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <span className="w-9 h-9 rounded-full bg-linear-to-br from-[#5C38E1] to-[#8E6BFF] flex items-center justify-center text-white text-[13px] font-extrabold shadow-md select-none">
                    {initials}
                  </span>
                  <span className="hidden md:block text-[14px] font-bold text-[#1e1b4b] dark:text-white max-w-30 truncate">
                    {user.username}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-linear-to-br from-[#5C38E1] to-[#8E6BFF] flex items-center justify-center text-white text-[14px] font-extrabold shrink-0">
                          {initials}
                        </span>
                        <div className="overflow-hidden">
                          <p className="text-[13px] font-bold text-[#1e1b4b] dark:text-white truncate">
                            {user.username}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dark mode toggle inside dropdown */}
                    <div className="px-2 pt-2 pb-1 border-b border-slate-100 dark:border-slate-700">
                      <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          {darkMode
                            ? <Sun className="w-4 h-4 text-yellow-400" />
                            : <Moon className="w-4 h-4 text-slate-400" />
                          }
                          {darkMode ? "Light Mode" : "Dark Mode"}
                        </span>
                        <span className={`w-8 h-4 rounded-full relative transition-all duration-200 ${darkMode ? "bg-indigo-600" : "bg-slate-200"}`}>
                          <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-200 shadow-sm ${darkMode ? "left-4" : "left-0.5"}`} />
                        </span>
                      </button>
                    </div>

                    {user.role && (
                      <div className="px-2 pt-2 pb-1 border-b border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => { setDropdownOpen(false); navigate(getDashboardRoute(user.role)); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {roleLabels[user.role] || "User"} Dashboard
                        </button>
                      </div>
                    )}

                    <div className="px-2 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}