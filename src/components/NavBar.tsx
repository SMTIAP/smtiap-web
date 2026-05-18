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
} from "lucide-react";
import api from "../api/api";

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

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

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
        return "/admin"; // fallback to default admin dashboard
    }
  };

  return (
    <nav className="sticky top-0 z-100 w-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] h-17.5">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link
          to={isAuthenticated ? "/admin" : "/"}
          className="flex items-center gap-2 text-[20px] font-[900] tracking-tighter font-manrope"
        >
          <span className="w-8 h-8 bg-[#5C38E1] rounded-lg rotate-12 flex items-center justify-center shadow-lg shadow-[#5C38E1]/20">
            <FileChartColumnIncreasing className="w-5 h-5 text-white" />
          </span>
          MTSP
        </Link>

        {isAuthenticated && !isLanding && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-[700] transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-[#64748B] hover:text-[#334155] hover:bg-gray-50"
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
          {isLanding && !isAuthenticated && (
            <>
              <Link
                to="/auth"
                className="text-[14px] font-[700] text-[#475569] hover:text-[#5C38E1] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white px-5 py-2 rounded-full font-[700] text-[13px] shadow-xl shadow-purple-500/20 hover:scale-105 transition-transform"
              >
                Free Register
              </Link>
            </>
          )}

          {isAuthenticated && user && (
            <div className="flex items-center gap-3">
              {isLanding && (
                <Link
                  to="/admin"
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
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
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] flex items-center justify-center text-white text-[13px] font-[800] shadow-md select-none">
                    {initials}
                  </span>
                  <span className="hidden md:block text-[14px] font-[700] text-[#1e1b4b] max-w-[120px] truncate">
                    {user.username}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] flex items-center justify-center text-white text-[14px] font-[800] shrink-0">
                          {initials}
                        </span>
                        <div className="overflow-hidden">
                          <p className="text-[13px] font-[700] text-[#1e1b4b] truncate">
                            {user.username}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    {user.role && (
                      <div className="px-2 pt-2 pb-1 border-b border-slate-100">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate(getDashboardRoute(user.role));
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-[600] text-indigo-600 hover:bg-indigo-50 transition-colors border-2 border-transparent hover:border-indigo-100"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {roleLabels[user.role] || "User"} Dashboard
                        </button>
                      </div>
                    )}
                    <div className="px-2 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-[600] text-red-500 hover:bg-red-50 transition-colors"
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
