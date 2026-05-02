import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/api";

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    api
      .get("/me")
      .then(() => setAuth(true))
      .catch(() => setAuth(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return auth ? children : <Navigate to="/" />;
}