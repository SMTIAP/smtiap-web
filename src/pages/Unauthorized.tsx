import { Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#dce3f5] via-[#e8ecf5] to-[#d8dff2] p-6">
      <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(90,70,180,0.18)] p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-[28px] font-[900] text-[#1a1a2e] mb-3 font-manrope">
          Access Denied
        </h1>

        <p className="text-[15px] text-slate-500 leading-relaxed mb-8">
          You need to sign in to access this page. Please log in with your
          credentials to continue.
        </p>

        <Link
          to="/auth"
          className="inline-flex items-center gap-2 bg-gradient-to-br from-[#7b6ee0] to-[#5a45b8] text-white px-8 py-3.5 rounded-full font-[800] text-[14px] tracking-[0.5px] shadow-lg shadow-purple-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Sign In
        </Link>

        <p className="mt-6 text-[12px] text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/auth"
            className="text-[#7b6ee0] font-semibold hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
