import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Sparkles, 
  LayoutTemplate, 
  Zap, 
  Lock, 
  PieChart, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  HelpCircle,
  CheckCircle2,
  Mail
} from 'lucide-react';

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // SVG Path Data for the Mountain Morph
  const flatPath = "M 10 140 C 40 140, 60 135, 90 130 C 130 120, 180 125, 220 120 C 260 115, 310 130, 350 135 C 380 138, 390 140, 400 140";
  const mountainPath = "M 10 140 C 40 140, 60 70, 100 90 C 140 110, 170 10, 220 40 C 270 70, 310 120, 350 80 C 380 50, 390 140, 400 140";

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

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#F4F6FA]/70 backdrop-blur-xl border-b border-white/30 h-[76px]">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div className="flex items-center gap-2 text-[22px] font-[900] tracking-tighter font-manrope">
            <div className="w-8 h-8 bg-[#5C38E1] rounded-lg rotate-12 flex items-center justify-center shadow-lg shadow-[#5C38E1]/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            MTSP
          </div>
          
          <div className="hidden lg:flex items-center gap-4 bg-white/40 border border-white/60 p-1.5 rounded-full shadow-inner pr-5">
            <div className="bg-[#5C38E1]/10 text-[#5C38E1] px-3 py-1 rounded-full text-[12px] font-[800] flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5C38E1]"></span>
              </span>
              24/7 AI Active
            </div>
            <div className="text-[13px] font-[600] text-slate-500">
              <span className="text-[#5C38E1] font-[800]">1k+</span> insights extracted
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[15px] font-[600] text-[#475569] hover:text-[#5C38E1] transition-colors">Sign In</Link>
            <Link to="/register" className="bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white px-7 py-2.5 rounded-full font-[700] text-[14px] shadow-xl shadow-purple-500/20 hover:scale-105 transition-transform inline-block text-center">
              Create Free Survey
            </Link>
          </div>
        </div>
      </nav>

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
              Smart Surveys. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5C38E1] to-[#A391FF]">Instant Insights.</span>
            </h1>
            <p className="text-[19px] leading-relaxed text-[#595C5F] max-w-[540px] mb-10">
              Stop guessing. Build beautiful surveys using 200+ built-in templates and let our AI analyze every response to uncover hidden patterns in real-time.
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
                <div className="text-[11px] font-[800] text-[#5C38E1] uppercase mb-4 tracking-widest">Featured Templates</div>
                <div className="space-y-3">
                  <div className="h-10 bg-white/60 rounded-xl border border-white/50 flex items-center px-3 gap-2">
                    <ShoppingBag className="w-3 h-3" />
                    <span className="text-[10px] font-bold">Post-Purchase Feedback</span>
                  </div>
                  <div className="h-10 bg-[#5C38E1]/10 rounded-xl border border-[#5C38E1]/20 flex items-center px-3 gap-2">
                    <Users className="w-3 h-3 text-[#5C38E1]" />
                    <span className="text-[10px] font-bold text-[#5C38E1]">Employee Net Promoter</span>
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
                    <h3 className="font-[800] text-[#1e1b4b] text-[18px]">Analyzed Results</h3>
                    <p className="text-[12px] text-slate-500">Auto-generated from 1,240 responses</p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 rounded-full text-[10px] font-bold text-green-600">LIVE</div>
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
                    <span className="font-bold">AI Observation:</span> 72% of users mentioned "ease of use" as the primary reason for retention.
                  </p>
                </motion.div>

                {/* Morphing Mountain SVG */}
                <div className="h-44 w-full relative">
                  <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#5C38E1" stopOpacity="1" />
                        <stop offset="100%" stopColor="#8E6BFF" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                    <motion.path 
                      initial={{ d: flatPath, pathLength: 0 }}
                      animate={{ d: mountainPath, pathLength: 1 }}
                      transition={{ 
                        pathLength: { duration: 2, ease: "easeInOut" },
                        d: { duration: 1.5, delay: 1.5, ease: "backOut" }
                      }}
                      fill="none" 
                      stroke="url(#curveGrad)" 
                      strokeWidth="12" 
                      strokeLinecap="round"
                    />
                    
                    {/* Highlight point anchored at Peak 2 (x=220) */}
                    <motion.g 
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.8, type: "spring", stiffness: 100 }}
                    >
                      <circle cx="210" cy="22" r="8" fill="#5C38E1" stroke="white" strokeWidth="4" className="shadow-lg" />
                    </motion.g>
                  </svg>
                </div>
              </motion.div>

              {/* Sentiment Meter Overlay */}
              <motion.div 
                initial={{ opacity: 0, x: 20, rotate: 10 }}
                animate={{ opacity: 1, x: 0, rotate: 3 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute bottom-[-30px] right-[-20px] w-[200px] p-5 rounded-[24px] z-30 bg-white/60 backdrop-blur-xl border border-white shadow-2xl"
              >
                <div className="text-[11px] font-[800] text-slate-400 uppercase mb-3">Overall Sentiment</div>
                <div className="flex items-center gap-3">
                  <div className="text-[24px] font-black text-[#5C38E1]">94%</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 1, delay: 3.2 }}
                      className="h-full bg-gradient-to-r from-green-400 to-[#5C38E1]" 
                    />
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Visual Analysis Dashboard Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/45 backdrop-blur-xl rounded-[60px] p-12 lg:p-20 grid lg:grid-cols-2 gap-16 items-center border border-white/50"
          >
            <div className="space-y-8">
              <h2 className="text-[40px] md:text-[52px] font-[800] text-[#1e1b4b] leading-[1.1] tracking-tight font-manrope">
                See the answers <br/>before they're typed.
              </h2>
              <p className="text-[18px] text-[#595C5F] leading-relaxed">
                Our real-time analysis engine categorizes responses, flags sentiment shifts, and creates visual summaries instantly. Spend less time reading and more time acting.
              </p>
              <div className="grid grid-cols-2 gap-8">
                {[
                  { title: 'Auto-Categorization', desc: 'AI tags open-ended responses.' },
                  { title: 'Sentiment Tracking', desc: 'Detect mood shifts in real-time.' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[#5C38E1]">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-bold text-[14px]">{item.title}</span>
                    </div>
                    <p className="text-[13px] text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Animated Bar Chart Visual */}
            <div className="relative bg-white/40 p-8 rounded-[40px] border border-white/60 shadow-inner min-h-[300px] flex flex-col justify-end">
              <div className="flex justify-between items-end gap-3 h-48">
                {[35, 65, 45, 95, 55, 80].map((height, i) => (
                  <motion.div 
                    key={i}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    transition={{ delay: 0.1 * i, duration: 0.8, type: "spring" }}
                    className={`flex-1 rounded-t-2xl transform-gpu ${i === 3 ? 'bg-[#5C38E1]' : 'bg-purple-200'}`}
                    style={{ height: `${height}%`, originY: 1 }}
                  />
                ))}
              </div>
              <div className="absolute top-10 right-10">
                <div className="bg-white/70 backdrop-blur-md px-4 py-2 rounded-xl text-[11px] font-bold border border-white shadow-lg">
                  Pattern Detected: High Growth
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">
          {[
            { 
              icon: LayoutTemplate, 
              title: '20+ Smart Templates', 
              desc: 'From HR feedback to product market fit. Launch optimized surveys in seconds.' 
            },
            { 
              icon: BrainCircuit, 
              title: 'AI Sentiment Engine', 
              desc: 'Our engine identifies sarcasm, frustration, and delight in open-ended text.', 
              featured: true 
            },
            { 
              icon: PieChart, 
              title: 'Interactive Reports', 
              desc: 'Export response data into stunning live dashboards and shareable PDF reports.' 
            }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className={`p-10 rounded-[40px] transition-all duration-500 border ${feat.featured ? 'bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white shadow-2xl lg:-translate-y-8' : 'bg-white/45 backdrop-blur-xl border-white hover:bg-white'}`}
            >
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 ${feat.featured ? 'bg-white/20' : 'bg-purple-100'}`}>
                <feat.icon className={`w-8 h-8 ${feat.featured ? 'text-white' : 'text-[#5C38E1]'}`} />
              </div>
              <h3 className="text-[24px] font-[800] mb-4 font-manrope">{feat.title}</h3>
              <p className={feat.featured ? 'text-white/80' : 'text-slate-500'}>{feat.desc}</p>
              {feat.featured && (
                <div className="mt-8 pt-8 border-t border-white/20 text-[14px] font-bold">
                  80% Analysis Accuracy
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#5C38E1] to-[#A391FF] blur-[100px] opacity-20" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/50 backdrop-blur-2xl p-16 md:p-24 rounded-[60px] relative z-10 text-center border border-white/60"
          >
            <h2 className="text-[44px] md:text-[60px] font-[800] text-[#1e1b4b] mb-8 tracking-tighter leading-none font-manrope">
              Turn your data into <br/>
              <span className="text-[#5C38E1]">decisions.</span>
            </h2>
            <p className="text-[19px] text-slate-500 max-w-xl mx-auto mb-12">
              Join 10,000+ teams using MTSP to build smarter surveys and analyze results with AI.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-gradient-to-br from-[#5C38E1] to-[#8E6BFF] text-white px-12 py-5 rounded-3xl font-[800] text-[20px] shadow-2xl shadow-purple-500/30 hover:scale-105 transition-all">
                Start For Free
              </button>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Footer */}
      <footer className="pt-24 pb-12 px-8 border-t border-slate-200 bg-white/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-16 mb-20">
            <div className="col-span-2">
              <div className="text-[22px] font-[900] text-[#0F172A] font-manrope mb-6 flex items-center gap-2">
                <BrainCircuit className="text-[#5C38E1]" /> MTSP
              </div>
              <p className="text-slate-500 max-w-xs leading-relaxed text-[15px]">
                Revolutionizing data collection through intelligent design and advanced machine learning response analysis.
              </p>
            </div>
            <div>
              <h4 className="font-[800] text-[15px] mb-6">Capabilities</h4>
              <ul className="space-y-4 text-slate-500 text-[14px]">
                {['AI Builder', 'Templates', 'Sentiment'].map(item => (
                  <li key={item}><a href="#" className="hover:text-[#5C38E1] transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-[800] text-[15px] mb-6">Resources</h4>
              <ul className="space-y-4 text-slate-500 text-[14px]">
                {['Library', 'Case Studies', 'API'].map(item => (
                  <li key={item}><a href="#" className="hover:text-[#5C38E1] transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            
            <div className="col-span-2">
              <div className="bg-white/40 p-6 rounded-2xl border border-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200/50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                <h4 className="font-[800] text-[#1e1b4b] text-[16px] mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#5C38E1]" /> Have an Inquiry?
                </h4>
                <p className="text-slate-500 text-[13px] mb-5 leading-relaxed">
                  Need custom enterprise features or have specific questions? Contact our team.
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
          <div className="flex flex-col md:flex-row justify-center items-center pt-12 border-t border-slate-100 gap-6">
            <p className="text-slate-400 text-[13px] text-center w-full">© 2026 MTSP Analytics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;