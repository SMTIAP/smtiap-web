import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import fogotPasswordImg from "../assets/fogotpasswprd.jpg";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await api.post("/users/forgot-password", { email });
      window.location.href = res.data.resetUrl;
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-indigo-100">
      <div className="flex w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl" style={{ minHeight: "460px" }}>

        {/* ── LEFT PANEL ── */}
        <div
          className="hidden md:flex flex-col justify-between p-8 relative overflow-hidden bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white "
          style={{
            width: "42%",
          }}
        >
          {/* Brand badge */}
          <div className="flex items-center gap-2 z-10">
            
          </div>
         <img src={fogotPasswordImg} alt="Brand Logo" />

          {/* Testimonial */}
          <div className="z-10">
            <p className="text-[13.5px] leading-relaxed italic mb-5" style={{ color: "#FAF7F4" }}>
              Security is not a product, but a process. Resetting your credentials helps keep your account protected and your data secure.
              Forgot your password? Enter your email address and we'll send you a link to reset it.
            </p>
            
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col justify-center px-10 py-10 bg-white">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-9">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center  bg-indigo-600">
              <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="6" stroke="white" strokeWidth="2" />
                <circle cx="10" cy="10" r="2" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-[17px]" style={{ color: "#5C38E1" }}>MTSP</span>
          </div>

          {/* Heading */}
          <p className="text-[11.5px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#5C38E1" }}>
            Forgot?
          </p>
          <h2 className="text-[26px] font-bold leading-snug mb-7" style={{ fontFamily: "Georgia, serif", color: "#1A1007" }}>
            Reset your<br />Password Securely!
          </h2>

          {/* Email field */}
          <label className="text-[12px] font-semibold mb-1.5 block" style={{ color: "#5C4A38" }}>
            Email address <span style={{ color: "#E8652A" }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 rounded-xl px-4 text-sm mb-5 outline-none border transition-all"
            style={{
              background: "#fff",
              border: "1.5px solid #5C38E1",
              color: "#1A1007",
              fontFamily: "inherit",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#5C38E1";
              e.target.style.boxShadow = "0 0 0 3px rgba(232,101,42,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#DDD5CC";
              e.target.style.boxShadow = "none";
            }}
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full h-11 rounded-xl text-white text-sm font-bold transition-colors "
            style={{ background: "#5C38E1" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#8E6BFF")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#5C38E1")}
          >
            Reset Password
          </button>
        </div>

      </div>
    </div>
  );
}