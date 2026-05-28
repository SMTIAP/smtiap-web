import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";

import {
  Sparkles,
  ShoppingBag,
  Users,
  CheckCircle2,
  LayoutTemplate,
  BrainCircuit,
  PieChart,
  Mail,
  FileChartColumnIncreasing,
} from "lucide-react";

import mountainChartSvg from "../assets/mountain-chart.svg";

export default function LandingPage() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-slate-950 text-[#2C2F32] dark:text-slate-200 selection:bg-[#5C38E1] selection:text-white overflow-x-hidden font-sans">
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
      <section className="relative pt-28 sm:pt-36 lg:pt-44 pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-full border border-white dark:border-slate-700 shadow-sm text-[#5C38E1] dark:text-purple-400 text-[12px] font-[800] tracking-wider uppercase mb-8">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
              </span>
              AI-Powered Response Analysis
            </div>
            <h1 className="text-[36px] sm:text-[54px] md:text-[72px] leading-[0.95] font-[800] tracking-[-0.03em] sm:tracking-[-0.04em] text-[#1e1b4b] dark:text-slate-100 mb-6 sm:mb-8 font-manrope">
              Smart Surveys. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5C38E1] to-[#A391FF]">
                Instant Insights.
              </span>
            </h1>
            <p className="text-[16px] sm:text-[19px] leading-relaxed text-[#595C5F] dark:text-slate-400 max-w-[540px] mb-8 sm:mb-10">
              Stop guessing. Build beautiful surveys using 200+ built-in
              templates and let our AI analyze every response to uncover hidden
              patterns in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/templates">
                <button className="bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white px-10 py-5 rounded-2xl font-[800] text-[18px] font-manrope shadow-2xl shadow-purple-500/30 hover:scale-105 transition-all">
                  Choose a Template
                </button>
              </Link>
              <div className="flex items-center gap-4 pl-2">
                <div className="text-[14px] font-[600] text-[#475569] dark:text-slate-400">
                  Powered by{" "}
                  <span className="text-[#5C38E1] dark:text-purple-400">
                    AI
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Dashboard Stack */}
          <div className="relative min-h-[420px] sm:min-h-[500px] flex items-center justify-center px-2 sm:px-0">
            <div className="relative w-full h-full max-w-[500px]">
              {/* Template Card */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -10 }}
                animate={{ opacity: 1, y: 0, rotate: -4 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute top-[-20px] left-[-20px] sm:left-[-40px] w-[220px] sm:w-[260px] p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] z-10 bg-white/45 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-2xl"
              >
                <div className="text-[11px] font-[800] text-[#5C38E1] dark:text-purple-400 uppercase mb-4 tracking-widest">
                  Featured Templates
                </div>
                <div className="space-y-3">
                  <div className="h-10 bg-white/60 dark:bg-slate-700/60 rounded-xl border border-white/50 dark:border-slate-600/50 flex items-center px-3 gap-2">
                    <ShoppingBag className="w-3 h-3 text-[#2C2F32] dark:text-slate-300" />
                    <span className="text-[10px] font-bold text-[#2C2F32] dark:text-slate-300">
                      Post-Purchase Feedback
                    </span>
                  </div>
                  <div className="h-10 bg-[#5C38E1]/10 dark:bg-purple-500/20 rounded-xl border border-[#5C38E1]/20 dark:border-purple-500/30 flex items-center px-3 gap-2">
                    <Users className="w-3 h-3 text-[#5C38E1] dark:text-purple-400" />
                    <span className="text-[10px] font-bold text-[#5C38E1] dark:text-purple-400">
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
                className="relative w-full p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-20 bg-white/50 dark:bg-slate-800/70 backdrop-blur-2xl border border-white/60 dark:border-slate-700/60 overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6 sm:mb-8">
                  <div className="space-y-1">
                    <h3 className="font-[800] text-[#1e1b4b] dark:text-slate-100 text-[16px] sm:text-[18px]">
                      Analyzed Results
                    </h3>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">
                      Auto-generated from 1,240 responses
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/50 rounded-full text-[10px] font-bold text-green-600 dark:text-green-400">
                    LIVE
                  </div>
                </div>

                {/* AI Insight Bubble */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6 sm:mb-10 p-3 sm:p-4 bg-[#5C38E1]/5 dark:bg-purple-500/10 rounded-2xl border border-[#5C38E1]/10 dark:border-purple-500/20 flex gap-3 sm:gap-4 items-start relative z-10"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#5C38E1]/10 dark:bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#5C38E1] dark:text-purple-400" />
                  </div>
                  <p className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="font-bold">AI Observation:</span> 72% of
                    users mentioned "ease of use" as the primary reason for
                    retention.
                  </p>
                </motion.div>

                {/* Morphing Mountain SVG */}
                <div className="h-32 sm:h-44 w-full relative">
                  <img
                    src={mountainChartSvg}
                    alt="Analyzed Mountain Graph"
                    className="w-full h-full object-contain overflow-visible"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Analysis Dashboard Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/45 dark:bg-slate-800/60 backdrop-blur-xl rounded-[32px] sm:rounded-[60px] p-6 sm:p-12 lg:p-20 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center border border-white/50 dark:border-slate-700/50"
          >
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-[28px] sm:text-[40px] md:text-[52px] font-[800] text-[#1e1b4b] dark:text-slate-100 leading-[1.1] tracking-tight font-manrope">
                See the answers <br />
                before they're typed.
              </h2>
              <p className="text-[15px] sm:text-[18px] text-[#595C5F] dark:text-slate-400 leading-relaxed">
                Our real-time analysis engine categorizes responses, flags
                sentiment shifts, and creates visual summaries instantly. Spend
                less time reading and more time acting.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                {[
                  {
                    title: "Auto-Categorization",
                    desc: "AI tags open-ended responses.",
                  },
                  {
                    title: "Sentiment Tracking",
                    desc: "Detect mood shifts in real-time.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[#5C38E1]">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-bold text-[14px]">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Animated Bar Chart Visual */}
            <div className="relative bg-white/40 dark:bg-slate-800/40 p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] border border-white/60 dark:border-slate-700/60 shadow-inner min-h-[220px] sm:min-h-[300px] flex flex-col justify-end">
              <div className="flex justify-between items-end gap-2 sm:gap-3 h-36 sm:h-48">
                {[35, 65, 45, 95, 55, 80].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    transition={{
                      delay: 0.1 * i,
                      duration: 0.8,
                      type: "spring",
                    }}
                    className={`flex-1 rounded-t-2xl transform-gpu ${i === 3 ? "bg-[#5C38E1]" : "bg-purple-200"}`}
                    style={{ height: `${height}%`, originY: 1 }}
                  />
                ))}
              </div>
              <div className="absolute top-4 sm:top-10 right-4 sm:right-10">
                <div className="bg-white/70 dark:bg-slate-700/80 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11px] font-bold border border-white dark:border-slate-600 shadow-lg dark:text-slate-200">
                  Pattern Detected: High Growth
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {[
            {
              icon: LayoutTemplate,
              title: "20+ Smart Templates",
              desc: "From HR feedback to product market fit. Launch optimized surveys in seconds.",
              stat: "Fast Setup",
            },
            {
              icon: BrainCircuit,
              title: "AI Sentiment Engine",
              desc: "Our engine identifies sarcasm, frustration, and delight in open-ended text.",
              stat: "80% Analysis Accuracy",
            },
            {
              icon: PieChart,
              title: "Interactive Reports",
              desc: "Export response data into stunning live dashboards and shareable PDF reports.",
              stat: "Real-time Insights",
            },
          ].map((feat, i) => {
            const isActive = hovered === i;
            return (
              <motion.div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className={`p-6 sm:p-8 lg:p-10 rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] duration-500 border 
                  ${isActive ? "bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white shadow-2xl lg:-translate-y-8" : "bg-white/45 dark:bg-slate-800/50 backdrop-blur-xl border-white dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700/80"}`}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 ${isActive ? "bg-white/20" : "bg-purple-100 dark:bg-purple-500/20"}`}
                >
                  <feat.icon
                    className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${isActive ? "text-white" : "text-[#5C38E1] dark:text-purple-400"}`}
                  />
                </div>
                <h3 className="text-[20px] sm:text-[22px] lg:text-[24px] font-[800] mb-3 sm:mb-4 font-manrope dark:text-slate-100">
                  {feat.title}
                </h3>
                <p
                  className={`transition-colors duration-500 text-[14px] sm:text-[15px] ${isActive ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {feat.desc}
                </p>
                {
                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-300 dark:border-slate-600 text-[13px] sm:text-[14px] font-bold dark:text-slate-300">
                    {feat.stat}
                  </div>
                }
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#5C38E1] to-[#A391FF] blur-[100px] opacity-20" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/50 dark:bg-slate-800/60 backdrop-blur-2xl p-8 sm:p-16 md:p-24 rounded-[32px] sm:rounded-[60px] relative z-10 text-center border border-white/60 dark:border-slate-700/60"
          >
            <h2 className="text-[28px] sm:text-[44px] md:text-[60px] font-[800] text-[#1e1b4b] dark:text-slate-100 mb-6 sm:mb-8 tracking-tighter leading-none font-manrope">
              Turn your data into <br />
              <span className="text-[#5C38E1] dark:text-purple-400">
                decisions.
              </span>
            </h2>
            <p className="text-[15px] sm:text-[19px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8 sm:mb-12">
              Join 10,000+ teams using MTSP to build smarter surveys and analyze
              results with AI.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <button className="bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-[800] text-[16px] sm:text-[20px] shadow-2xl shadow-purple-500/30 hover:scale-105 transition-all">
                  Start For Free
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-8 border-t border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-12 lg:gap-16 mb-12 sm:mb-20">
            <div className="sm:col-span-2">
              <div className="text-[20px] sm:text-[22px] font-[900] text-[#0F172A] dark:text-slate-100 font-manrope mb-4 sm:mb-6 flex items-center gap-2">
                <FileChartColumnIncreasing className="text-[#5C38E1] dark:text-purple-400" />{" "}
                MTSP
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed text-[14px] sm:text-[15px]">
                Revolutionizing data collection through intelligent design and
                advanced machine learning response analysis.
              </p>
            </div>
            <div>
              <h4 className="font-[800] text-[15px] mb-6 dark:text-slate-300">
                Capabilities
              </h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400 text-[14px]">
                {[
                  { name: "AI Analysis", link: "/analytics" },
                  { name: "Templates", link: "/templates" },
                  { name: "Sentiment", link: "/" },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.link}
                      className="hover:text-[#5C38E1] dark:hover:text-purple-400 transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-[800] text-[15px] mb-6 dark:text-slate-300">
                Resources
              </h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400 text-[14px]">
                {[
                  { name: "Templates", link: "/templates" },
                  { name: "Live Support", link: "/" },
                  { name: "Reports", link: "/" },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.link}
                      className="hover:text-[#5C38E1] transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:col-span-2">
              <div className="bg-white/40 dark:bg-slate-800/50 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200/50 dark:bg-purple-500/20 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                <h4 className="font-[800] text-[#1e1b4b] dark:text-slate-100 text-[16px] mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#5C38E1] dark:text-purple-400" />{" "}
                  Have an Inquiry?
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-5 leading-relaxed">
                  Need custom enterprise features or have specific questions?
                  Contact our team.
                </p>
                <a
                  href="mailto:contact@mtsp.com"
                  className="inline-flex items-center gap-2 text-[13px] font-[700] text-white bg-[#5C38E1] px-5 py-2.5 rounded-xl hover:bg-[#4E20BD] transition-all hover:shadow-lg hover:shadow-purple-500/20"
                >
                  Send us an email
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center pt-8 sm:pt-12 border-t border-slate-100 dark:border-slate-800 gap-4 sm:gap-6">
            <p className="text-slate-400 dark:text-slate-500 text-[13px] text-center w-full">
              © 2026 MTSP Analytics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
