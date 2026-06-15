import { useEffect, useState, type JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../api/api";
import Unauthorized from "../pages/Unauthorized";

interface Props {
  children: JSX.Element;
  allowedRoles?: string[];
}

// Route guard: redirects unauthenticated users or blocks users without the required role.
export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    api
      .get("/me")
      .then((res) => {
        if (mounted) {
          setAuth(true);
          setUserRole(res.data.role);
        }
      })
      .catch(() => {
        if (mounted) {
          setAuth(false);
          setUserRole(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  if (loading) {
    return (
      <p className="p-4 text-center text-slate-600">
        Checking authentication...
      </p>
    );
  }

  if (!auth) {
    return <Unauthorized />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    if (userRole === "creator" || userRole === "creater") {
      return <Navigate to="/creator-dashboard" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return children;
}
