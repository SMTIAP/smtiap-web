import { useState, useEffect } from "react";
import PasswordInput from "../components/PasswordInput";
import axios from "axios";
import { GoogleIcon, GithubIcon, LinkedInIcon } from "./AuthPage";
import { validatePassword } from "../utils/passwordValidation";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown((prev) => prev - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    try {
      setResendLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/users/resend-verification",
        {
          email: registeredEmail,
        },
      );
      setMessage(res.data.message || "Verification link resent successfully!");
      setResendCountdown(60);
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "Failed to resend verification link.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (val.length === 0) {
      setPasswordError("");
    } else {
      const result = validatePassword(val);
      setPasswordError(result.valid ? "" : result.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation before submitting
    const validation = validatePassword(password);
    if (!validation.valid) {
      setPasswordError(validation.message);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          username,
          email,
          password,
        },
        { withCredentials: true },
      );

      setRegisteredEmail(email);
      setMessage(
        res.data.message ||
          "Registration successful! Please check your email to verify your account.",
      );
      console.log(res.data);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Registration failed");
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

  if (registeredEmail) {
    return (
      <div className="w-full flex flex-col items-center text-center animate-[fadeIn_0.5s_ease-out]">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-5 border border-indigo-100 shadow-[0_4px_15px_rgba(123,110,224,0.15)]">
          <svg
            className="w-8 h-8 text-[#7b6ee0]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-[24px] font-[900] text-[#1a1a2e] mb-[10px] tracking-[-0.5px]">
          Verify Your Email
        </h1>

        <p className="text-[13px] text-[#6B7280] font-semibold leading-relaxed mb-6 max-w-[280px]">
          We've sent a verification link to{" "}
          <span className="text-[#7b6ee0] font-bold">{registeredEmail}</span>.
          Please click the link to activate your account.
        </p>

        <div className="w-full bg-[#f8fafc] border border-slate-100 rounded-2xl p-4 mb-5">
          <p className="text-[11px] text-[#888] font-medium mb-3">
            Didn't receive the email?
          </p>
          <button
            onClick={handleResend}
            disabled={resendLoading || resendCountdown > 0}
            className="w-full py-2.5 bg-[#7b6ee0] hover:bg-[#5a45b8] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs tracking-wider rounded-xl transition-all duration-200"
          >
            {resendLoading
              ? "Resending..."
              : resendCountdown > 0
                ? `Resend in ${resendCountdown}s`
                : "Resend Verification Email"}
          </button>
        </div>

        {message && (
          <div className="mt-[6px] text-[11px] font-semibold text-[#5a45b8] bg-[#f3f0ff] py-2 px-4 rounded-lg w-full max-w-[280px]">
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-[22px] sm:text-[26px] font-[900] text-[#1a1a2e] mb-[14px] sm:mb-[18px] tracking-[-0.5px]">
        Sign Up
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
        or use your email for registration
      </p>

      <form onSubmit={handleSubmit} className="w-full">
        {/* username added (important for backend) */}
        <input
          className="w-full py-[11px] px-[16px] border-none rounded-[10px] bg-[#f0f1f7] font-nunito text-[14px] font-semibold text-[#333] outline-none mb-[12px] transition-all duration-200 placeholder:text-[#aaa] placeholder:font-medium focus:bg-[#ebebf8] focus:ring-[2.5px] focus:ring-[#7b6ee0]/35"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="w-full py-[11px] px-[16px] border-none rounded-[10px] bg-[#f0f1f7] font-nunito text-[14px] font-semibold text-[#333] outline-none mb-[12px] transition-all duration-200 placeholder:text-[#aaa] placeholder:font-medium focus:bg-[#ebebf8] focus:ring-[2.5px] focus:ring-[#7b6ee0]/35"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PasswordInput
          className={`w-full py-[11px] px-[16px] border-none rounded-[10px] bg-[#f0f1f7] font-nunito text-[14px] font-semibold text-[#333] outline-none transition-all duration-200 placeholder:text-[#aaa] placeholder:font-medium focus:bg-[#ebebf8] focus:ring-[2.5px] focus:ring-[#7b6ee0]/35 ${passwordError ? "mb-[2px]" : "mb-[12px]"}`}
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          required
        />
        {passwordError && (
          <p className="text-[11px] text-red-500 font-semibold mb-[10px] ml-[4px]">
            {passwordError}
          </p>
        )}

        <button
          type="submit"
          className="w-full p-[13px] bg-gradient-to-br from-[#7b6ee0] to-[#5a45b8] text-white border-none rounded-full font-nunito text-[13px] font-[800] tracking-[1.5px] uppercase cursor-pointer transition-all duration-200 shadow-[0_4px_18px_rgba(90,69,184,0.35)] mt-[4px] hover:shadow-[0_6px_22px_rgba(90,69,184,0.5)] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>

      {message && (
        <div className="mt-[10px] text-[12px] font-semibold">{message}</div>
      )}
    </div>
  );
}
