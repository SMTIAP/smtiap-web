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
  Check,
  Building2,
  User,
  Loader2,
  Menu,
  X,
  type LucideIcon,
  LineChart,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import api from "../api/api";
import { useDarkMode } from "../App";
import { useTenant, type TenantInfo } from "../contexts/TenantContext";

const roleLinks: Record<
  string,
  { to: string; label: string; icon: LucideIcon }[]
> = {
  super_admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutGrid },
    { to: "/created-surveys", label: "Surveys", icon: ClipboardList },
    { to: "/templates", label: "Templates", icon: FileText },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/subscription", label: "Subscription", icon: CreditCard },
    { to: "/role-management", label: "Employees", icon: Users },
    { to: "/reports", label: "Reports", icon: LineChart },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutGrid },
    { to: "/created-surveys", label: "Surveys", icon: ClipboardList },
    { to: "/templates", label: "Templates", icon: FileText },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/subscription", label: "Subscription", icon: CreditCard },
    { to: "/role-management", label: "Employees", icon: Users },
    { to: "/reports", label: "Reports", icon: LineChart },
  ],
  creator: [
    { to: "/admin", label: "Dashboard", icon: LayoutGrid },
    { to: "/created-surveys", label: "Surveys", icon: ClipboardList },
    { to: "/templates", label: "Templates", icon: FileText },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ],
  billing_manager: [
    { to: "/subscription", label: "Billing", icon: CreditCard },
  ],
  viewer: [
    { to: "/admin", label: "Dashboard", icon: LayoutGrid },
    { to: "/created-surveys", label: "Surveys", icon: ClipboardList },
  ],
};

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
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidePanelRef = useRef<HTMLDivElement>(null);
  // Local tenant cache from /me so roles appear immediately after login
  const [localTenants, setLocalTenants] = useState<TenantInfo[]>([]);
  // Loading state — true until /me resolves
  const [pageLoading, setPageLoading] = useState(true);

  const { darkMode, toggleDarkMode } = useDarkMode();
  const {
    tenants,
    activeTenant,
    setActiveTenant,
    clearActiveTenant,
    isSystemContext,
  } = useTenant();

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
          // Deduplicate by tenantId._id — keep only the last occurrence (latest role)
          const raw: TenantInfo[] = res.data.tenants ?? [];
          const seen = new Map<string, TenantInfo>();
          for (const t of raw) seen.set(t.tenantId._id, t);
          setLocalTenants(Array.from(seen.values()));
        }
      })
      .catch(() => {
        if (mounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      })
      .finally(() => {
        if (mounted) setPageLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  // Close dropdown / side panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        sidePanelRef.current &&
        !sidePanelRef.current.contains(e.target as Node)
      ) {
        setSidePanelOpen(false);
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
    window.location.href = "/auth";
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    viewer: "Viewer",
    creator: "Creator",
    billing_manager: "Billing Manager",
  };

  // Resolve effective role:
  // - System context (no tenant) → user.role from the User model
  // - Tenant context → activeTenant.role from UserTenantRole
  const effectiveRole = isSystemContext
    ? (user?.role ?? "admin")
    : (activeTenant?.role ?? user?.role ?? "admin");

  const getDashboardRoute = (role?: string) => {
    switch (role) {
      case "creator":
      case "creater":
        return "/admin";
      case "billing_manager":
        return "/admin";
      case "super_admin":
        return "/super-admin-dashboard";
      case "admin":
      default:
        return "/admin";
    }
  };

  const links = roleLinks[effectiveRole] ?? roleLinks.admin;

  if (pageLoading) {
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white dark:bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-[#5C38E1]" />
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Loading…
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav
        className={`sticky top-0 z-100 w-full h-17.5 transition-colors duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${isLanding ? "bg-white dark:bg-[#0F172A]" : "bg-white dark:bg-[#0F172A] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]"}`}
      >
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
            {/* Notifications */}
            <NotificationBell />
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun size={16} className="text-yellow-400" />
              ) : (
                <Moon size={16} className="text-slate-500" />
              )}
            </button>

            {/* Mobile hamburger — visible only when authenticated & not on landing */}
            {isAuthenticated && !isLanding && (
              <button
                onClick={() => setSidePanelOpen((prev) => !prev)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                aria-label="Toggle navigation menu"
              >
                {sidePanelOpen ? (
                  <X size={18} className="text-slate-600 dark:text-slate-300" />
                ) : (
                  <Menu
                    size={18}
                    className="text-slate-600 dark:text-slate-300"
                  />
                )}
              </button>
            )}

            {/* Landing page auth buttons */}
            {isLanding && !isAuthenticated && (
              <>
                <Link
                  to="/auth"
                  className="text-[14px] font-bold text-[#475569] dark:text-slate-300 hover:text-[#5C38E1] dark:hover:text-purple-400 transition-colors"
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
                    <span className="hidden md:flex flex-col items-start">
                      <span className="text-[14px] font-bold text-[#1e1b4b] dark:text-white max-w-30 truncate leading-tight">
                        {user.username}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 truncate max-w-30 leading-tight">
                        {isSystemContext
                          ? roleLabels[user?.role ?? ""] ||
                            user?.role ||
                            "Admin"
                          : `${roleLabels[activeTenant?.role ?? ""] || activeTenant?.role || ""} · ${activeTenant?.tenantId.name || ""}`}
                      </span>
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

                        {/* Active Context Badge */}
                        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                          {isSystemContext ? (
                            <>
                              <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 truncate">
                                My Account
                              </span>
                              <span className="ml-auto text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">
                                {roleLabels[user?.role ?? ""] ||
                                  user?.role ||
                                  "Admin"}
                              </span>
                            </>
                          ) : activeTenant ? (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 truncate">
                                {activeTenant.tenantId.name}
                              </span>
                              <span className="ml-auto text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">
                                {roleLabels[activeTenant.role] ||
                                  activeTenant.role}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {/* Context Switcher — always shown when user has tenants */}
                      {(localTenants.length > 0 ? localTenants : tenants)
                        .length > 0 && (
                        <div className="px-2 pt-2 pb-1 border-b border-slate-100 dark:border-slate-700">
                          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Switch Role
                          </div>

                          {/* "My Account" — system-level context */}
                          <button
                            onClick={() => {
                              clearActiveTenant();
                              setDropdownOpen(false);
                              const role = user?.role ?? "admin";
                              window.location.href = getDashboardRoute(role);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 mb-0.5 ${
                              isSystemContext
                                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
                                : "text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-100 dark:hover:border-indigo-800 border border-transparent hover:scale-[1.01]"
                            }`}
                          >
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate flex-1 text-left">
                              My Account
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase shrink-0">
                              {roleLabels[user?.role ?? ""] ||
                                user?.role ||
                                "Admin"}
                            </span>
                            {isSystemContext && (
                              <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                          </button>

                          {/* Tenant entries */}
                          {(localTenants.length > 0
                            ? localTenants
                            : tenants
                          ).map((t) => (
                            <button
                              key={t.tenantId._id}
                              onClick={() => {
                                setActiveTenant(t);
                                setDropdownOpen(false);
                                window.location.href = getDashboardRoute(
                                  t.role,
                                );
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 mb-0.5 ${
                                !isSystemContext &&
                                activeTenant?.tenantId._id === t.tenantId._id
                                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
                                  : "text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-100 dark:hover:border-indigo-800 border border-transparent hover:scale-[1.01]"
                              }`}
                            >
                              <Building2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate flex-1 text-left">
                                {t.tenantId.name}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase shrink-0">
                                {roleLabels[t.role] || t.role}
                              </span>
                              {!isSystemContext &&
                                activeTenant?.tenantId._id ===
                                  t.tenantId._id && (
                                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                )}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Dashboard link */}
                      <div className="px-2 pt-2 pb-1 border-b border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate(getDashboardRoute(effectiveRole));
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {roleLabels[effectiveRole] || "User"} Dashboard
                        </button>
                      </div>

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

      {/* Mobile side panel */}
      {isAuthenticated && !isLanding && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${
              sidePanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setSidePanelOpen(false)}
          />

          {/* Drawer */}
          <div
            ref={sidePanelRef}
            className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-[#0F172A] shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
              sidePanelOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full overflow-y-auto">
              {/* User info header */}
              {user && (
                <div className="px-5 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
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
                  <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    {isSystemContext ? (
                      <>
                        <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 truncate">
                          My Account
                        </span>
                        <span className="ml-auto text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">
                          {roleLabels[user?.role ?? ""] ||
                            user?.role ||
                            "Admin"}
                        </span>
                      </>
                    ) : activeTenant ? (
                      <>
                        <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 truncate">
                          {activeTenant.tenantId.name}
                        </span>
                        <span className="ml-auto text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">
                          {roleLabels[activeTenant.role] || activeTenant.role}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Nav links */}
              <div className="flex-1 px-3 pt-4 pb-2 space-y-1">
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Navigation
                </p>
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setSidePanelOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`
                    }
                  >
                    <link.icon size={18} />
                    {link.label}
                  </NavLink>
                ))}
              </div>

              {/* Bottom actions */}
              <div className="px-3 pt-2 pb-6 border-t border-slate-100 dark:border-slate-800 space-y-1">
                {/* Dark mode */}
                <button
                  onClick={() => {
                    toggleDarkMode();
                    setSidePanelOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  {darkMode ? (
                    <Sun size={18} className="text-yellow-400" />
                  ) : (
                    <Moon size={18} className="text-slate-400" />
                  )}
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </> /* end NavBar fragment */
  );
}
