import { useEffect, useState, type JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../api/api";

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    api
      .get("/me")
      .then(() => {
        if (mounted) {
          setAuth(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setAuth(false);
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
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}
