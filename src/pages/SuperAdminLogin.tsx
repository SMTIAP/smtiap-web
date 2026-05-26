import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";
import axios from "axios";

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/super-admin/login",
        { email, password },
        { withCredentials: true },
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (res.data.role !== "super_admin") {
        setMessage("Only super admins can sign in here.");
        return;
      }

      navigate("/super-admin-dashboard");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Super Admin Login
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Use your super admin credentials. Registration is disabled for this route.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            type="email"
            placeholder="superadmin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <PasswordInput
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {message && (
          <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-700/10 dark:text-red-200">
            {message}
          </div>
        )}

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          Want regular access instead? <a href="/auth" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Use the normal login page</a>.
        </p>
      </div>
    </div>
  );
}
