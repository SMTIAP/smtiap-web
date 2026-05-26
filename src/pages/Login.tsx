import { useState } from "react";
import PasswordInput from "../components/PasswordInput";
import axios from "axios";
import { GoogleIcon, GithubIcon, LinkedInIcon } from "./AuthPage";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

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
      setMessage(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

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
      <h1 className="text-[26px] font-[900] text-[#1a1a2e] mb-[18px] tracking-[-0.5px]">
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
        <div className="mt-[10px] text-[12px] font-semibold">{message}</div>
      )}
    </div>
  );
}
