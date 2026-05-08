import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/api";

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
  api
    .get("/users/me")
    .then((res) => {
      console.log("USER:", res.data);
      setAuth(true);
    })
    .catch((err) => {
      console.log("ERROR:", err.response?.data);
      setErrorMsg(err.response?.data?.message || "Unknown error");
      setAuth(false);
    })
    .finally(() => setLoading(false));
}, []);
  if (loading) return <p>Checking authentication...</p>;

  if (!auth) return <div className="p-10 text-center"><h2 className="text-2xl text-red-500 font-bold">Not Authorized</h2><p>ProtectedRoute blocked access because /api/users/me failed.</p><p className="mt-2 text-sm text-gray-600 bg-gray-100 p-2 rounded inline-block">Reason: {errorMsg}</p><br/><button onClick={() => window.location.href='/auth'} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Go to Login</button></div>;

  return children;
}