import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/api";
import resetPasswordImg from "../assets/resetpassword.jpg";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.put("/reset-password", {
        email,
        tempPassword,
        newPassword,
      });
      toast.success(res.data.message);
      navigate("/auth");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-indigo-100">
      <div
        className="flex w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ minHeight: "460px" }}
      >
        {/* ── LEFT PANEL ── */}
        <div
          className="hidden md:flex flex-col justify-between p-8 relative overflow-hidden bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white"
          style={{
            width: "42%",
          }}
        >
          {/* Glow orb */}
          <div
            className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full opacity-10"
            style={{ background: "#A78BFA", filter: "blur(40px)" }}
          />

          <img src={resetPasswordImg} alt="Brand Logo" />

          {/* Testimonial */}
          <div className="z-10">
            <p
              className="text-[13.5px] leading-relaxed italic mb-5"
              style={{ color: "#EDE9FF" }}
            >
              Security is not a product, but a process. Resetting your
              credentials helps keep your account protected and your data
              secure. Enter the temporary password sent to your email, then set
              a new password.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div
          className="flex-1 flex flex-col justify-center px-10 py-10"
          style={{ background: "#FAF9FF" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-9">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#5C38E1" }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="6" stroke="white" strokeWidth="2" />
                <circle cx="10" cy="10" r="2" fill="white" />
              </svg>
            </div>
            <span
              className="font-bold text-[17px]"
              style={{ color: "#5C38E1" }}
            >
              MTSP
            </span>
          </div>

          {/* Heading */}
          <p
            className="text-[11.5px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: "#5C38E1" }}
          >
            Security
          </p>
          <h2
            className="text-[26px] font-bold leading-snug mb-7"
            style={{ fontFamily: "Georgia, serif", color: "#1A1040" }}
          >
            Set a New
            <br />
            Password Securely!
          </h2>

          {/* Error */}
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {/* Email field */}
          <label
            className="text-[12px] font-semibold mb-1.5 block"
            style={{ color: "#3D2E6E" }}
          >
            Email address <span style={{ color: "#5C38E1" }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 rounded-xl px-4 text-sm mb-4 outline-none border transition-all"
            style={{
              background: "#fff",
              border: "1.5px solid #D5CCEF",
              color: "#1A1040",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#5C38E1";
              e.target.style.boxShadow = "0 0 0 3px rgba(92,56,225,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#D5CCEF";
              e.target.style.boxShadow = "none";
            }}
          />

          {/* Temp Password field */}
          <label
            className="text-[12px] font-semibold mb-1.5 block"
            style={{ color: "#3D2E6E" }}
          >
            Temporary password <span style={{ color: "#5C38E1" }}>*</span>
          </label>
          <input
            type="text"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            placeholder="Paste the code from your email"
            className="w-full h-11 rounded-xl px-4 text-sm mb-4 outline-none border transition-all font-mono tracking-wider"
            style={{
              background: "#fff",
              border: "1.5px solid #D5CCEF",
              color: "#1A1040",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#5C38E1";
              e.target.style.boxShadow = "0 0 0 3px rgba(92,56,225,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#D5CCEF";
              e.target.style.boxShadow = "none";
            }}
          />

          {/* New Password field */}
          <label
            className="text-[12px] font-semibold mb-1.5 block"
            style={{ color: "#3D2E6E" }}
          >
            New password <span style={{ color: "#5C38E1" }}>*</span>
          </label>
          <div className="relative mb-5">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full h-11 rounded-xl px-4 pr-11 text-sm outline-none border transition-all"
              style={{
                background: "#fff",
                border: "1.5px solid #D5CCEF",
                color: "#1A1040",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#5C38E1";
                e.target.style.boxShadow = "0 0 0 3px rgba(92,56,225,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#D5CCEF";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full h-11 rounded-xl text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            style={{ background: loading ? "#9CA3AF" : "#5C38E1" }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#4828C5";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = "#5C38E1";
            }}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
