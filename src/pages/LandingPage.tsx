import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, Users } from "lucide-react";

const flatPath =
  "M 10 140 C 40 140, 60 135, 90 130 C 130 120, 180 125, 220 120 C 260 115, 310 130, 350 135 C 380 138, 390 140, 400 140";
const mountainPath =
  "M 10 140 C 40 140, 60 70, 100 90 C 140 110, 170 10, 220 40 C 270 70, 310 120, 350 80 C 380 50, 390 140, 400 140";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#2C2F32] selection:bg-[#5C38E1] selection:text-white overflow-x-hidden font-sans">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-purple-500/10 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full"
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white shadow-sm text-[#5C38E1] text-[12px] font-[800] tracking-wider uppercase mb-8">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
              </span>
              AI-Powered Response Analysis
            </div>
            <h1 className="text-[54px] md:text-[72px] leading-[0.95] font-[800] tracking-[-0.04em] text-[#1e1b4b] mb-8 font-manrope">
              Smart Surveys. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5C38E1] to-[#A391FF]">
                Instant Insights.
              </span>
            </h1>
            <p className="text-[19px] leading-relaxed text-[#595C5F] max-w-[540px] mb-10">
              Stop guessing. Build beautiful surveys using 200+ built-in
              templates and let our AI analyze every response to uncover hidden
              patterns in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <button className="bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white px-10 py-5 rounded-2xl font-[800] text-[18px] font-manrope shadow-2xl shadow-purple-500/30 hover:scale-105 transition-all">
                Choose a Template
              </button>
              <div className="flex items-center gap-4 pl-2">
                <div className="text-[14px] font-[600] text-[#475569]">
                  Powered by <span className="text-[#5C38E1]">AI</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Dashboard Stack */}
          <div className="relative min-h-[500px] flex items-center justify-center">
            <div className="relative w-full h-full max-w-[500px]">
              {/* Template Card */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -10 }}
                animate={{ opacity: 1, y: 0, rotate: -4 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute top-[-20px] left-[-40px] w-[260px] p-5 rounded-[24px] z-10 bg-white/45 backdrop-blur-xl border border-white/50 shadow-2xl"
              >
                <div className="text-[11px] font-[800] text-[#5C38E1] uppercase mb-4 tracking-widest">
                  Featured Templates
                </div>
                <div className="space-y-3">
                  <div className="h-10 bg-white/60 rounded-xl border border-white/50 flex items-center px-3 gap-2">
                    <ShoppingBag className="w-3 h-3" />
                    <span className="text-[10px] font-bold">
                      Post-Purchase Feedback
                    </span>
                  </div>
                  <div className="h-10 bg-[#5C38E1]/10 rounded-xl border border-[#5C38E1]/20 flex items-center px-3 gap-2">
                    <Users className="w-3 h-3 text-[#5C38E1]" />
                    <span className="text-[10px] font-bold text-[#5C38E1]">
                      Employee Net Promoter
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Main Results Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-full p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-20 bg-white/50 backdrop-blur-2xl border border-white/60 overflow-hidden"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <h3 className="font-[800] text-[#1e1b4b] text-[18px]">
                      Analyzed Results
                    </h3>
                    <p className="text-[12px] text-slate-500">
                      Auto-generated from 1,240 responses
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 rounded-full text-[10px] font-bold text-green-600">
                    LIVE
                  </div>
                </div>

                {/* AI Insight Bubble */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-10 p-4 bg-[#5C38E1]/5 rounded-2xl border border-[#5C38E1]/10 flex gap-4 items-start relative z-10"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#5C38E1]/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#5C38E1]" />
                  </div>
                  <p className="text-[13px] leading-relaxed text-slate-700">
                    <span className="font-bold">AI Observation:</span> 72% of
                    users mentioned "ease of use" as the primary reason for
                    retention.
                  </p>
                </motion.div>

                {/* Morphing Mountain SVG */}
                <div className="h-44 w-full relative">
                  <svg
                    viewBox="0 0 400 150"
                    className="w-full h-full overflow-visible"
                  >
                    <motion.path
                      d={mountainPath}
                      fill="none"
                      stroke="#5C38E1"
                      strokeWidth={4}
                      initial={{ d: flatPath }}
                      animate={{ d: mountainPath }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    />
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
