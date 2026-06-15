import { useState } from "react";
import PasswordInput from "../components/PasswordInput";
import axios from "axios";
import { GoogleIcon, GithubIcon, LinkedInIcon } from "./AuthPage";
import { useNavigate } from "react-router-dom";

// Sign-in form with email/password, social logins, and resend-verification flow.
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    if (!email) return;
    try {
      setResendLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/users/resend-verification",
        {
          email,
        },
      );
      setMessage(
        res.data.message ||
          "Verification email resent! Please check your inbox.",
      );
      setNeedsVerification(false);
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "Failed to resend verification email.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setNeedsVerification(false);

      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email,
          password,
        },
        { withCredentials: true },
      );
      const userRole = res.data.role;
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "creater") {
        navigate("/admin");
      } else if (userRole === "super_admin") {
        navigate("/super-admin-dashboard");
      } else {
        navigate("/admin");
      }

      setMessage("Login successful ✔");
      console.log(res.data);
    } catch (err: any) {
      if (
        err.response?.status === 401 &&
        err.response?.data?.message?.includes("verify")
      ) {
        setNeedsVerification(true);
      }
      setMessage(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Redirect to backend OAuth endpoints for social authentication.
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/users/google";
  };

  const handleGithubLogin = () => {
    window.location.href = "http://localhost:5000/api/users/github";
  };

  const handleLinkedInLogin = () => {
    window.location.href = "http://localhost:5000/api/users/linkedin";
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-[22px] sm:text-[26px] font-[900] text-[#1a1a2e] mb-[14px] sm:mb-[18px] tracking-[-0.5px]">
        Sign In
      </h1>

      <div className="flex gap-[10px] mb-[16px]">
        <button
          className="w-[42px] h-[42px] border-[1.5px] border-[#e0e0e8] rounded-[10px] bg-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-[#7b6ee0] hover:shadow-[0_2px_10px_rgba(123,110,224,0.2)] hover:-translate-y-[2px]"
          onClick={handleGoogleLogin}
        >
          <GoogleIcon />
        </button>

        <button
          className="w-[42px] h-[42px] border-[1.5px] border-[#e0e0e8] rounded-[10px] bg-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-[#7b6ee0] hover:shadow-[0_2px_10px_rgba(123,110,224,0.2)] hover:-translate-y-[2px]"
          onClick={handleGithubLogin}
        >
          <GithubIcon />
        </button>

        <button
          className="w-[42px] h-[42px] border-[1.5px] border-[#e0e0e8] rounded-[10px] bg-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-[#7b6ee0] hover:shadow-[0_2px_10px_rgba(123,110,224,0.2)] hover:-translate-y-[2px]"
          onClick={handleLinkedInLogin}
        >
          <LinkedInIcon />
        </button>
      </div>

      <p className="text-[12px] text-[#aaa] font-semibold mb-[16px] tracking-[0.3px]">
        or use your email for login
      </p>

      <form onSubmit={handleSubmit} className="w-full">
        <input
          className="w-full py-[11px] px-[16px] border-none rounded-[10px] bg-[#f0f1f7] font-nunito text-[14px] font-semibold text-[#333] outline-none mb-[12px] transition-all duration-200 placeholder:text-[#aaa] placeholder:font-medium focus:bg-[#ebebf8] focus:ring-[2.5px] focus:ring-[#7b6ee0]/35"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PasswordInput
          className="w-full py-[11px] px-[16px] border-none rounded-[10px] bg-[#f0f1f7] font-nunito text-[14px] font-semibold text-[#333] outline-none mb-[12px] transition-all duration-200 placeholder:text-[#aaa] placeholder:font-medium focus:bg-[#ebebf8] focus:ring-[2.5px] focus:ring-[#7b6ee0]/35"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full p-[13px] bg-gradient-to-br from-[#7b6ee0] to-[#5a45b8] text-white border-none rounded-full font-nunito text-[13px] font-[800] tracking-[1.5px] uppercase cursor-pointer transition-all duration-200 shadow-[0_4px_18px_rgba(90,69,184,0.35)] mt-[4px] hover:shadow-[0_6px_22px_rgba(90,69,184,0.5)] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-sm mt-4 text-center">
          <a href="/forgot-password" className="text-[#7b6ee0] hover:underline">
            Forgot Password?
          </a>
        </p>
      </form>

      {message && (
        <div
          className={`mt-[10px] text-[12px] font-semibold ${needsVerification ? "text-rose-500" : "text-[#5a45b8]"}`}
        >
          {message}
        </div>
      )}

      {needsVerification && (
        <div className="w-full bg-[#f3f0ff] border border-[#e5e0fa] text-[#5a45b8] rounded-[14px] p-4 mt-[14px] text-xs text-center flex flex-col items-center animate-[fadeIn_0.3s_ease-out]">
          <p className="font-bold mb-2">Account is not verified yet</p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendLoading}
            className="w-full py-2 bg-gradient-to-br from-[#7b6ee0] to-[#5a45b8] text-white rounded-full font-bold text-[10px] uppercase tracking-wide cursor-pointer transition-all duration-200 hover:shadow-[0_2px_8px_rgba(90,69,184,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {resendLoading ? "Resending..." : "Resend Verification Email"}
          </button>
        </div>
      )}
    </div>
  );
}
