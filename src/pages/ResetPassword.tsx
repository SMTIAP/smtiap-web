import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import resetPasswordImg from "../assets/resetpassword.jpg";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleReset = async () => {
    try {
      const res = await api.put(`/reset-password/${token}`, { password });
      alert(res.data.message);
      navigate("/auth");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-indigo-100">
      <div className="flex w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl" style={{ minHeight: "460px" }}>

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

          {/* Brand badge */}
          <div className="flex items-center gap-2 z-10 bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white">
          </div>
           <img src={resetPasswordImg} alt="Brand Logo" />

          {/* Testimonial */}
          <div className="z-10">
            <p className="text-[13.5px] leading-relaxed italic mb-5" style={{ color: "#EDE9FF" }}>
              Security is not a product, but a process. Resetting your credentials helps keep your account protected and your data secure.
              Enter your new password below to reset your account password. Make sure it's strong and secure.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col justify-center px-10 py-10" style={{ background: "#FAF9FF" }}>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-9">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#5C38E1" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="6" stroke="white" strokeWidth="2" />
                <circle cx="10" cy="10" r="2" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-[17px]" style={{ color: "#5C38E1" }}>MTSP</span>
          </div>

          {/* Heading */}
          <p className="text-[11.5px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#5C38E1" }}>
            Security
          </p>
          <h2 className="text-[26px] font-bold leading-snug mb-7" style={{ fontFamily: "Georgia, serif", color: "#1A1040" }}>
            Set a New<br />Password Securely!
          </h2>

          {/* Password field */}
          <label className="text-[12px] font-semibold mb-1.5 block" style={{ color: "#3D2E6E" }}>
            New password <span style={{ color: "#5C38E1" }}>*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full h-11 rounded-xl px-4 text-sm mb-5 outline-none border transition-all"
            style={{ background: "#fff", border: "1.5px solid #D5CCEF", color: "#1A1040" }}
            onFocus={(e) => {
              e.target.style.borderColor = "#5C38E1";
              e.target.style.boxShadow = "0 0 0 3px rgba(92,56,225,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#D5CCEF";
              e.target.style.boxShadow = "none";
            }}
          />

          {/* Submit */}
          <button
            onClick={handleReset}
            className="w-full h-11 rounded-xl text-white text-sm font-bold transition-colors"
            style={{ background: "#5C38E1" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4828C5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#5C38E1")}
          >
            Reset Password
          </button>
        </div>

      </div>
    </div>
  );
}