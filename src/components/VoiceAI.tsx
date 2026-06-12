import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Loader2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Paintbrush,
  Columns,
  MessageSquare,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  tag?: string;
  timestamp: Date;
}

type Theme = 'peach' | 'blue' | 'lavender' | 'mint';

interface ThemeConfig {
  headerBg: string;
  headerText: string;
  badgeBg: string;
  badgeText: string;
  accentBg: string;
  accentText: string;
  buttonBg: string;
  buttonHoverBg: string;
  panelBorder: string;
  floatingBg: string;
}

const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  peach: {
    headerBg: 'bg-gradient-to-r from-[#FFF2E6] via-[#FFE3D1] to-[#FFF2E6]',
    headerText: 'text-[#5C381E]',
    badgeBg: 'bg-[#FFEBDC]',
    badgeText: 'text-[#9E5A2A]',
    accentBg: 'bg-[#FFEBDC]/60 border-[#FFEBDC]',
    accentText: 'text-[#9E5A2A]',
    buttonBg: 'bg-[#4CAF50]',
    buttonHoverBg: 'bg-[#43A047]',
    panelBorder: 'border-orange-100',
    floatingBg: 'bg-[#0082FC] hover:bg-[#0071DE]'
  },
  blue: {
    headerBg: 'bg-gradient-to-r from-[#F0F9FF] via-[#E0F2FE] to-[#F0F9FF]',
    headerText: 'text-[#0C4A6E]',
    badgeBg: 'bg-[#E0F2FE]',
    badgeText: 'text-[#0369A1]',
    accentBg: 'bg-[#E0F2FE]/60 border-[#E0F2FE]',
    accentText: 'text-[#0369A1]',
    buttonBg: 'bg-[#0284C7]',
    buttonHoverBg: 'bg-[#0369A1]',
    panelBorder: 'border-sky-100',
    floatingBg: 'bg-orange-500 hover:bg-orange-600'
  },
  lavender: {
    headerBg: 'bg-gradient-to-r from-[#FAF5FF] via-[#F3E8FF] to-[#FAF5FF]',
    headerText: 'text-[#581C87]',
    badgeBg: 'bg-[#F3E8FF]',
    badgeText: 'text-[#7E22CE]',
    accentBg: 'bg-[#F3E8FF]/60 border-[#F3E8FF]',
    accentText: 'text-[#7E22CE]',
    buttonBg: 'bg-[#9333EA]',
    buttonHoverBg: 'bg-[#7E22CE]',
    panelBorder: 'border-purple-100',
    floatingBg: 'bg-teal-600 hover:bg-teal-700'
  },
  mint: {
    headerBg: 'bg-gradient-to-r from-[#F0FDF4] via-[#D1FAE5] to-[#F0FDF4]',
    headerText: 'text-[#064E3B]',
    badgeBg: 'bg-[#D1FAE5]',
    badgeText: 'text-[#047857]',
    accentBg: 'bg-[#D1FAE5]/60 border-[#D1FAE5]',
    accentText: 'text-[#047857]',
    buttonBg: 'bg-[#10B981]',
    buttonHoverBg: 'bg-[#059669]',
    panelBorder: 'border-emerald-100',
    floatingBg: 'bg-[#9333EA] hover:bg-[#7E22CE]'
  },
};

const SUGGESTION_CHIPS = [
  "Create new survey",
  "View templates",
  "View all surveys",
  "View analytics",
  "Manage user roles",
  "Upgrade plan",
  "View audit logs",
];

const VoiceAI: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showAllChips, setShowAllChips] = useState(false);
  const [theme, setTheme] = useState<Theme>('peach');
  const [alwaysOn, setAlwaysOn] = useState(() => {
    return localStorage.getItem('voice_assistant_always_on') === 'true';
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(() => {
    return localStorage.getItem('voice_assistant_speech_enabled') !== 'false';
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hi! I am your Form Copilot. I can help you create surveys, suggest questions, navigate the dashboard, or answer questions. What can I do for you today?",
      timestamp: new Date()
    }
  ]);

  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setAttachedFile({ name: file.name, content });
      };
      reader.readAsText(file);
    }
  };

  const alwaysOnRef = useRef(alwaysOn);
  alwaysOnRef.current = alwaysOn;

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const isSpeakingRef = useRef(isSpeaking);
  isSpeakingRef.current = isSpeaking;

  const manuallyStoppedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        handleSendPrompt(result);
      };

      recognition.onend = () => {
        if (alwaysOnRef.current && isOpenRef.current && !isSpeakingRef.current && !manuallyStoppedRef.current) {
          try {
            recognition.start();
            setIsListening(true);
          } catch (err) {
            console.error("Auto-restart speech recognition failed:", err);
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (!isOpen && isListening) {
      manuallyStoppedRef.current = true;
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  }, [isOpen, isListening]);

  const toggleListening = () => {
    if (isListening) {
      manuallyStoppedRef.current = true;
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      manuallyStoppedRef.current = false;
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleChipAction = (chip: string) => {
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: chip,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    
    let responseText = "";
    let navigatePath = "";
    
    switch (chip) {
      case "View analytics":
        responseText = "Opening analytics dashboard...";
        navigatePath = "/analytics";
        break;
      case "View all surveys":
        responseText = "Opening your surveys...";
        navigatePath = "/created-surveys";
        break;
      case "View templates":
        responseText = "Opening template library...";
        navigatePath = "/templates";
        break;
      case "Create new survey":
        responseText = "Creating a new survey for you...";
        navigatePath = "/create-new-survey";
        break;
      case "Manage user roles":
        responseText = "Opening role management...";
        navigatePath = "/role-management";
        break;
      case "Upgrade plan":
        responseText = "Opening subscription page...";
        navigatePath = "/subscription";
        break;
      case "View audit logs":
        responseText = "Opening audit logs...";
        navigatePath = "/audit-log";
        break;
      default:
        setActiveTag(chip);
        inputRef.current?.focus();
        return;
    }
    
    const aiMsg: Message = {
      id: Math.random().toString(),
      sender: 'ai',
      text: responseText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMsg]);
    speakText(responseText);
    
    setTimeout(() => {
      navigate(navigatePath);
    }, 1000);
  };

  const handleSendPrompt = async (text: string) => {
    const promptText = text.trim();
    if (!promptText && !activeTag && !attachedFile) return;

    let userPrompt = activeTag ? `[${activeTag}] ${promptText}`.trim() : promptText;
    let userMsgText = promptText || activeTag || '';

    if (attachedFile) {
      userMsgText = `📎 ${attachedFile.name}${promptText ? ': ' + promptText : ''}`;
      userPrompt = `[Attached File: ${attachedFile.name}]\nFile Content:\n${attachedFile.content}\n\nUser request: ${userPrompt || "Please generate a complete survey based on these questions and answers."}`;
    }

    setIsLoading(true);
    setTextInput('');
    setAttachedFile(null);

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userMsgText,
      tag: activeTag || undefined,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    setActiveTag(null);

    try {
      const historyPayload = messages.slice(-10).map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));
      const { data } = await axios.post('http://localhost:5000/api/ai/chat', {
        prompt: userPrompt,
        history: historyPayload
      });

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: data.response_message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      speakText(data.response_message);

      if (data.action === 'navigate' && data.path) {
        setTimeout(() => {
          navigate(data.path);
        }, 1500);
      } else if (data.action === 'generate' && data.surveyData) {
        setTimeout(() => {
          navigate('/add-questions', {
            state: {
              formData: {
                customizeBranding: false,
                logo: null,
                websiteUrl: "",
                themeColor: "#6366F1",
                backgroundColor: "#94A3B8",
                surveyTitle: data.surveyData.surveyTitle || "AI-Generated Survey",
                description: data.surveyData.description || "",
                isAnonymous: false,
              },
              aiGeneratedPages: data.surveyData.pages,
            },
          });
        }, 1500);
      }
    } catch (error: any) {
      console.error("AI chat error", error);
      const errMsg = error.response?.data?.error || "Sorry, I encountered an error connecting to the AI server.";
      const errMsgObj: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: errMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsgObj]);
      speakText(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!speechEnabled) return;
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.onend = () => {
        setIsSpeaking(false);
        if (alwaysOnRef.current && isOpenRef.current && !manuallyStoppedRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
              setIsListening(true);
            } catch (err) {
              console.error("Failed to restart recognition after speaking finished:", err);
            }
          }, 300);
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        if (alwaysOnRef.current && isOpenRef.current && !manuallyStoppedRef.current) {
          try {
            recognitionRef.current?.start();
            setIsListening(true);
          } catch (err) {
            console.error("Failed to restart recognition after speaking error:", err);
          }
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleAlwaysOn = () => {
    const nextVal = !alwaysOn;
    setAlwaysOn(nextVal);
    localStorage.setItem('voice_assistant_always_on', String(nextVal));
    if (nextVal && !isListening && !isSpeaking) {
      manuallyStoppedRef.current = false;
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start voice on setting toggle:", err);
      }
    }
  };

  const toggleSpeech = () => {
    const nextVal = !speechEnabled;
    setSpeechEnabled(nextVal);
    localStorage.setItem('voice_assistant_speech_enabled', String(nextVal));
    if (!nextVal && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (alwaysOn && !isListening && !manuallyStoppedRef.current) {
        try {
          recognitionRef.current?.start();
          setIsListening(true);
        } catch (err) {
          console.error("Failed to restart recognition after muting:", err);
        }
      }
    }
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['peach', 'blue', 'lavender', 'mint'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const handleChipClick = (chip: string) => {
    handleChipAction(chip);
  };

  const currentTheme = THEME_CONFIGS[theme];
  const displayedChips = showAllChips ? SUGGESTION_CHIPS : SUGGESTION_CHIPS.slice(0, 4);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 text-slate-700 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`relative bg-white w-[350px] sm:w-[380px] rounded-3xl shadow-2xl border ${currentTheme.panelBorder} flex flex-col overflow-hidden max-h-[550px]`}
          >
            <button
              onClick={cycleTheme}
              className={`absolute -top-3.5 -right-3.5 w-9 h-9 rounded-full ${currentTheme.floatingBg} text-white shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 z-[60]`}
              title="Change theme color"
            >
              <Paintbrush className="w-4 h-4" />
            </button>

            <div className={`flex justify-between items-center ${currentTheme.headerBg} p-4 rounded-t-3xl border-b border-gray-100/50 shrink-0`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="/copilot_cat_avatar.png"
                    alt="Form Copilot Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&auto=format&fit=crop&q=60";
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className={`text-[15px] font-extrabold ${currentTheme.headerText}`}>Form Copilot</h3>
                    <span className="bg-[#000E54] text-white text-[9px] font-black uppercase px-1 py-0.5 rounded tracking-wide leading-none">AI</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold">
                    <span>SMTIAP Form Specialist</span>
                    <span className="text-gray-300">•</span>
                    {isListening ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-600 font-extrabold bg-green-50 px-1.5 py-0.5 rounded animate-pulse border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Listening
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-bold bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        Mic Off
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleSpeech}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer
                    ${speechEnabled ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-black/5'}`}
                  title={speechEnabled ? "Mute voice response" : "Unmute voice response"}
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition-colors cursor-pointer">
                  <Columns className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-4 pt-3 flex flex-col gap-1.5 shrink-0">
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                {displayedChips.map((chip, index) => (
                  <button
                    key={index}
                    onClick={() => handleChipClick(chip)}
                    className="px-3 py-1.5 text-xs font-semibold border border-gray-200 hover:border-orange-300 hover:bg-orange-50/20 text-gray-600 hover:text-orange-950 rounded-full transition-all duration-200 cursor-pointer shadow-sm bg-white shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAllChips(!showAllChips)}
                className="text-xs font-bold text-[#0082FC] hover:text-[#0071DE] flex items-center gap-0.5 ml-1 mt-0.5 cursor-pointer focus:outline-none w-fit"
              >
                {showAllChips ? (
                  <>Show less <ChevronUp className="w-3.5 h-3.5 font-bold" /></>
                ) : (
                  <>Show more <ChevronDown className="w-3.5 h-3.5 font-bold" /></>
                )}
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-thin scrollbar-thumb-gray-200 min-h-[120px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <img
                      src="/copilot_cat_avatar.png"
                      alt="AI"
                      className="w-6 h-6 rounded-full object-cover shrink-0 border border-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=40";
                      }}
                    />
                  )}
                  <div className="flex flex-col gap-0.5 max-w-[calc(100%-32px)]">
                    {msg.tag && (
                      <span className="text-[10px] uppercase font-bold text-orange-600 self-start bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                        {msg.tag}
                      </span>
                    )}
                    <div
                      className={`text-[13px] px-3.5 py-2.5 rounded-2xl leading-relaxed shadow-sm break-words whitespace-normal
                        ${msg.sender === 'user'
                          ? 'bg-slate-100 text-slate-800 rounded-tr-none'
                          : 'bg-blue-50/60 text-slate-800 rounded-tl-none border border-blue-100/50'}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50 bg-white shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Continuous Voice Input</span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold ${alwaysOn ? 'text-orange-600' : 'text-gray-400'}`}>
                  {alwaysOn ? 'ON' : 'OFF'}
                </span>
                <button
                  onClick={toggleAlwaysOn}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${alwaysOn ? 'bg-orange-500' : 'bg-gray-200'}`}
                  title={alwaysOn ? "Voice input remains active" : "Enable hands-free mode"}
                >
                  <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${alwaysOn ? 'translate-x-3' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-2.5 shadow-md hover:shadow-lg focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100/40 transition-all flex flex-col gap-2.5 mx-4 mb-4 mt-2 shrink-0">
              <div className="flex flex-wrap items-center gap-1.5 px-1 pt-0.5">
                {activeTag && (
                  <span className={`flex items-center gap-1 ${currentTheme.badgeBg} ${currentTheme.badgeText} text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 border`}>
                    {activeTag}
                    <button
                      onClick={() => setActiveTag(null)}
                      className="hover:text-red-600 font-bold ml-1 focus:outline-none cursor-pointer text-xs"
                    >
                      &times;
                    </button>
                  </span>
                )}
                {attachedFile && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 border border-blue-200">
                    📎 {attachedFile.name}
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="hover:text-red-600 font-bold ml-1 focus:outline-none cursor-pointer text-xs"
                    >
                      &times;
                    </button>
                  </span>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt(textInput)}
                  placeholder={isListening ? "Listening... Speak now..." : (activeTag ? "Add details or details..." : "Ask me to build a form...")}
                  className="flex-1 bg-transparent text-sm focus:outline-none text-slate-800 py-1.5 px-1 min-w-[120px]"
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-gray-100/60">
                <div className="flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8.5 h-8.5 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                    title="Add attachment (.txt)"
                  >
                    <Plus className="w-4 h-4 font-bold" />
                  </button>
                  <div className="flex items-center gap-2">
                    {isListening && (
                      <div className="flex items-end gap-[3px] h-5 px-1 pb-1">
                        <span className="voice-wave-bar h-1"></span>
                        <span className="voice-wave-bar h-1"></span>
                        <span className="voice-wave-bar h-1"></span>
                        <span className="voice-wave-bar h-1"></span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={toggleListening}
                      disabled={isLoading}
                      className={`w-8.5 h-8.5 rounded-full border flex items-center justify-center transition-all cursor-pointer
                        ${isListening
                          ? 'bg-red-500 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                          : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                      title={isListening ? "Voice Input is ON - Click to turn off" : "Voice Input is OFF - Click to turn on"}
                    >
                      {isListening ? <Mic className="w-4.5 h-4.5 animate-pulse" /> : <MicOff className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendPrompt(textInput)}
                  disabled={isLoading || (!textInput.trim() && !activeTag && !attachedFile)}
                  className={`px-4 py-2 ${currentTheme.buttonBg} hover:${currentTheme.buttonHoverBg} text-white rounded-full flex items-center gap-1.5 font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <><span className="text-sm font-black">↑</span> Send</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 cursor-pointer relative"
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
};

export default VoiceAI;