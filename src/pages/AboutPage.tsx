import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BrainCircuit,
  LayoutTemplate,
  PieChart,
  FileChartColumnIncreasing,
  HeadphonesIcon,
  BarChart3,
  Sparkles,
  MessageSquare,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Mail,
} from "lucide-react";

const sections = [
  {
    id: "ai-analysis",
    title: "AI Analysis",
    icon: BrainCircuit,
    description:
      "Unlock the full potential of your survey data with our advanced AI analysis engine. Every response is processed in real-time using machine learning models trained to detect patterns, trends, and anomalies that human review would miss.",
    features: [
      "Real-time response categorization — AI tags open-ended answers into meaningful groups automatically.",
      "Pattern recognition — Identifies recurring themes across thousands of responses instantly.",
      "Smart summarization — Generates concise executive summaries of your survey results.",
      "Anomaly detection — Flags unusual response patterns that may indicate data quality issues.",
    ],
    stats: [
      { label: "Analysis Accuracy", value: "95%" },
      { label: "Responses Processed", value: "10K+/min" },
      { label: "Data Points Analyzed", value: "1M+" },
    ],
  },
  {
    id: "templates",
    title: "Templates",
    icon: LayoutTemplate,
    description:
      "Jump-start your surveys with 200+ professionally designed templates. Whether you need employee feedback, customer satisfaction surveys, market research, or academic questionnaires, our template library has you covered.",
    features: [
      "200+ pre-built templates across 15+ industries and use cases.",
      "Fully customizable — modify questions, branding, and logic to fit your needs.",
      "Best-practice question design — crafted by survey methodology experts.",
      "Template categories include: HR, Education, Healthcare, Retail, SaaS, and more.",
    ],
    stats: [
      { label: "Available Templates", value: "200+" },
      { label: "Industry Categories", value: "15+" },
      { label: "Avg. Setup Time", value: "< 2 min" },
    ],
  },
  {
    id: "sentiment",
    title: "Sentiment Analysis",
    icon: MessageSquare,
    description:
      "Go beyond numbers and understand how your respondents truly feel. Our sentiment engine uses natural language processing (NLP) to detect emotion, tone, and intent in open-ended responses.",
    features: [
      "Emotion detection — Identifies joy, frustration, confusion, and satisfaction in text responses.",
      "Sarcasm recognition — Advanced NLP models trained to detect nuanced language.",
      "Sentiment trending — Track how sentiment evolves over time across multiple surveys.",
      "Language support — Analyze responses in multiple languages with high accuracy.",
    ],
    stats: [
      { label: "Sentiment Accuracy", value: "88%" },
      { label: "Languages Supported", value: "12+" },
      { label: "Processing Speed", value: "Real-time" },
    ],
  },
  {
    id: "live-support",
    title: "Live Support",
    icon: HeadphonesIcon,
    description:
      "We're here to help whenever you need us. Our support team consists of survey experts and technical specialists ready to assist with everything from setup questions to advanced customization.",
    features: [
      "Email support with guaranteed 24-hour response time.",
      "Live chat during business hours for quick questions.",
      "Dedicated account managers for enterprise plans.",
      "Comprehensive FAQ and troubleshooting guides available 24/7.",
    ],
    stats: [
      { label: "Avg. Response Time", value: "< 4 hrs" },
      { label: "Customer Satisfaction", value: "98%" },
      { label: "Support Tier", value: "Free + Premium" },
    ],
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    icon: BarChart3,
    description:
      "Transform raw survey data into actionable insights with powerful reporting tools. Create stunning visual dashboards, export PDF reports, and share findings with your team with one click.",
    features: [
      "Interactive dashboards — Filter, drill down, and explore your data visually.",
      "PDF export — Generate polished, presentation-ready reports instantly.",
      "Scheduled reports — Automate report delivery to your team via email.",
      "Custom metrics — Define and track the KPIs that matter most to your business.",
    ],
    stats: [
      { label: "Report Types", value: "10+" },
      { label: "Export Formats", value: "PDF, CSV, PNG" },
      { label: "Auto-schedule", value: "Daily/Weekly" },
    ],
  },
];

export default function AboutPage() {
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

      {/* Hero Header */}
      <section className="relative pt-28 sm:pt-36 lg:pt-44 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-full border border-white dark:border-slate-700 shadow-sm text-[#5C38E1] dark:text-purple-400 text-[12px] font-[800] tracking-wider uppercase mb-6">
              <FileChartColumnIncreasing className="w-4 h-4" />
              Platform Overview
            </div>
            <h1 className="text-[36px] sm:text-[54px] md:text-[64px] leading-[0.95] font-[800] tracking-[-0.03em] text-[#1e1b4b] dark:text-slate-100 mb-6 font-manrope">
              Everything you need to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5C38E1] to-[#A391FF]">
                understand your data.
              </span>
            </h1>
            <p className="text-[16px] sm:text-[19px] leading-relaxed text-[#595C5F] dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Explore our platform's capabilities — from AI-powered analysis and
              sentiment detection to customizable templates and interactive
              reports.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="px-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full text-[13px] font-[600] text-slate-600 dark:text-slate-300 border border-white dark:border-slate-700 hover:bg-[#5C38E1] hover:text-white hover:border-[#5C38E1] transition-all"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sections */}
      <div className="px-4 sm:px-6 pb-24 sm:pb-32">
        <div className="max-w-6xl mx-auto space-y-20 sm:space-y-28">
          {sections.map((section, index) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="scroll-mt-28"
            >
              <div
                className={`grid lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-16 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Content */}
                <div
                  className={`lg:col-span-3 ${
                    index % 2 === 1 ? "lg:col-start-3" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-[#5C38E1] dark:text-purple-400" />
                    </div>
                    <h2 className="text-[28px] sm:text-[36px] font-[800] text-[#1e1b4b] dark:text-slate-100 font-manrope">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-[15px] sm:text-[17px] text-[#595C5F] dark:text-slate-400 leading-relaxed mb-6">
                    {section.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {section.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#5C38E1] dark:text-purple-400 mt-0.5 shrink-0" />
                        <span className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-4 sm:gap-6">
                    {section.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-white/50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <div className="text-[18px] font-[800] text-[#5C38E1] dark:text-purple-400">
                          {stat.value}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-[600]">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Card */}
                <div
                  className={`lg:col-span-2 ${
                    index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""
                  }`}
                >
                  <div className="bg-white/40 dark:bg-slate-800/40 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-white/60 dark:border-slate-700/60 shadow-inner min-h-[200px] flex flex-col items-center justify-center text-center">
                    <section.icon className="w-16 h-16 sm:w-20 sm:h-20 text-[#5C38E1]/30 dark:text-purple-500/30 mb-4" />
                    <div className="text-[14px] font-[700] text-slate-400 dark:text-slate-500">
                      {section.title}
                    </div>
                    <div className="text-[11px] text-slate-300 dark:text-slate-600 mt-1">
                      Powered by MTSP Analytics
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="pb-24 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/50 dark:bg-slate-800/60 backdrop-blur-2xl p-8 sm:p-16 rounded-[32px] sm:rounded-[60px] text-center border border-white/60 dark:border-slate-700/60"
          >
            <h2 className="text-[28px] sm:text-[40px] font-[800] text-[#1e1b4b] dark:text-slate-100 mb-4 font-manrope">
              Ready to get started?
            </h2>
            <p className="text-[15px] sm:text-[17px] text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-8">
              Create your first survey in minutes. No credit card required.
            </p>
            <Link to="/register">
              <button className="bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-[800] text-[16px] sm:text-[20px] shadow-2xl shadow-purple-500/30 hover:scale-105 transition-all inline-flex items-center gap-2">
                Start For Free <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
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
                  { name: "AI Analysis", link: "/about#ai-analysis" },
                  { name: "Templates", link: "/about#templates" },
                  { name: "Sentiment", link: "/about#sentiment" },
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
                  { name: "Live Support", link: "/about#live-support" },
                  { name: "Reports", link: "/about#reports" },
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
                <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-3 leading-relaxed">
                  Need custom enterprise features or have specific questions?
                  Reach out to our team.
                </p>
                <p className="text-[15px] font-[700] text-[#5C38E1] dark:text-purple-400">
                  adminmtsp@gmail.com
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center pt-8 sm:pt-12 border-t border-slate-100 dark:border-slate-800 gap-4 sm:gap-6">
            <p className="text-slate-400 dark:text-slate-500 text-[13px] text-center w-full">
              &copy; 2026 MTSP Analytics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
