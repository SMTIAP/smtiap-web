import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const hasRequested = useRef(false);

  useEffect(() => {
    // Prevent double requests in React 18 StrictMode
    if (hasRequested.current) return;
    hasRequested.current = true;

    if (!token || !email) {
      setStatus("error");
      setMessage("Verification parameters are missing. Please double-check your link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/verify-email?token=${token}&email=${email}`
        );
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Invalid or expired verification link."
        );
      }
    };

    verify();
  }, [token, email]);

  const handleResend = async () => {
    if (!email) return;
    try {
      setResendLoading(true);
      setResendMessage("");
      const res = await axios.post("http://localhost:5000/api/users/resend-verification", {
        email,
      });
      setResendMessage(res.data.message || "Verification link resent successfully.");
    } catch (err: any) {
      setResendMessage(
        err.response?.data?.message || "Failed to resend verification link. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-[#dce3f5] via-[#e8ecf5] to-[#d8dff2] font-nunito p-4">
      <div className="relative w-full max-w-[500px] bg-white rounded-[40px] shadow-[0_20px_60px_rgba(90,70,180,0.15),_0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden p-8 md:p-12 text-center flex flex-col items-center">
        {status === "loading" && (
          <div className="flex flex-col items-center py-6">
            {/* High-end loading animation */}
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-[#7b6ee0]/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[#7b6ee0] animate-spin"></div>
            </div>
            <h1 className="text-2xl font-black text-[#1a1a2e] mb-3 tracking-tight">
              Verifying Account
            </h1>
            <p className="text-[#6B7280] text-sm leading-relaxed max-w-[280px]">
              {message}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center py-4 animate-[fadeIn_0.5s_ease-out]">
            {/* Beautiful Animated Success Ring */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-8 border-2 border-emerald-100 shadow-[0_8px_30px_rgb(209,250,229,0.5)]">
              <svg
                className="w-10 h-10 text-emerald-500 animate-[scaleIn_0.3s_ease-out]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-black text-[#1a1a2e] mb-3 tracking-tight">
              Email Verified!
            </h1>
            <p className="text-[#6B7280] text-sm leading-relaxed mb-8 max-w-[320px]">
              {message} Your account is now fully active. You are ready to log in.
            </p>

            <button
              onClick={() => navigate("/auth")}
              className="px-8 py-3.5 bg-gradient-to-br from-[#7b6ee0] to-[#5a45b8] text-white rounded-full font-nunito text-[13px] font-[800] tracking-[1.5px] uppercase cursor-pointer transition-all duration-200 shadow-[0_4px_18px_rgba(90,69,184,0.3)] hover:shadow-[0_6px_22px_rgba(90,69,184,0.45)] hover:-translate-y-[1px] active:translate-y-0"
            >
              Sign In Now
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center py-4 animate-[fadeIn_0.5s_ease-out] w-full">
            {/* High-Contrast Error Indicator */}
            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-8 border-2 border-rose-100 shadow-[0_8px_30px_rgb(254,226,226,0.5)]">
              <svg
                className="w-10 h-10 text-rose-500 animate-[shake_0.4s_ease-in-out]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-[#1a1a2e] mb-3 tracking-tight">
              Verification Failed
            </h1>
            <p className="text-[#6B7280] text-sm leading-relaxed mb-6 max-w-[340px]">
              {message}
            </p>

            {email && (
              <div className="w-full bg-[#f8fafc] border border-slate-100 rounded-2xl p-5 mb-8 text-left">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Need another link?
                </p>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  We can send a new verification link to <span className="font-semibold text-slate-800">{email}</span>. It will expire in 24 hours.
                </p>
                
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="w-full py-3 bg-[#7b6ee0]/10 hover:bg-[#7b6ee0]/15 text-[#7b6ee0] font-bold text-xs tracking-wide rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  {resendLoading ? "Resending..." : "Resend Verification Link"}
                </button>

                {resendMessage && (
                  <p className="mt-3 text-[11px] font-semibold text-[#5a45b8] text-center bg-[#f3f0ff] p-2 rounded-lg">
                    {resendMessage}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => navigate("/auth")}
              className="text-[#6B7280] hover:text-[#1a1a2e] text-xs font-bold transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
