import { NavLink, Link, useLocation } from "react-router-dom";
import { FileChartColumnIncreasing } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/created-surveys", label: "Surveys" },
  { to: "/templates", label: "Templates" },
  { to: "/analytics", label: "Analytics" },
  { to: "/subscription", label: "Subscription" },
  { to: "/role-management", label: "Employees" },
];

export default function NavBar() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className="sticky top-0 z-[100] bg-[#F4F6FA]/80 backdrop-blur-xl border-b border-white/30 h-[70px]">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-[20px] font-[900] tracking-tighter font-manrope"
        >
          <span className="w-8 h-8 bg-[#5C38E1] rounded-lg rotate-12 flex items-center justify-center shadow-lg shadow-[#5C38E1]/20">
            <FileChartColumnIncreasing className="w-5 h-5 text-white" />
          </span>
          MTSP
        </Link>

        <div className="hidden md:flex items-center gap-5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-[14px] font-[700] transition-colors ${
                  isActive
                    ? "text-[#5C38E1]"
                    : "text-[#475569] hover:text-[#5C38E1]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {isLanding && (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-[14px] font-[700] text-[#475569] hover:text-[#5C38E1] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white px-5 py-2 rounded-full font-[700] text-[13px] shadow-xl shadow-purple-500/20 hover:scale-105 transition-transform"
            >
              Create Free Survey
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
