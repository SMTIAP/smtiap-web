import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Send, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Declare global interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceAI: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [alwaysOn, setAlwaysOn] = useState(() => {
    return localStorage.getItem('voice_assistant_always_on') === 'true';
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  const navigate = useNavigate();

  const recognitionRef = useRef<any>(null);
  const alwaysOnRef = useRef(alwaysOn);
  alwaysOnRef.current = alwaysOn;

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const isSpeakingRef = useRef(isSpeaking);
  isSpeakingRef.current = isSpeaking;

  const manuallyStoppedRef = useRef(false);

  // Initialize Web Speech API
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
        // Auto-restart if alwaysOn is true, window is open, not speaking, and not manually stopped
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

  // Stop mic immediately when assistant panel is minimized
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
      setTranscript('');
      setResponseMsg('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSendPrompt = async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    setTranscript(text);
    setTextInput('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/chat', { prompt: text });
      
      setResponseMsg(data.response_message);
      speakText(data.response_message);

      if (data.action === 'navigate' && data.path) {
        // Wait a bit for the speech to start before navigating
        setTimeout(() => {
          navigate(data.path);
        }, 1500);
      }
    } catch (error: any) {
      console.error("AI chat error", error);
      const errMsg = error.response?.data?.error || "Sorry, I encountered an error connecting to the AI server.";
      setResponseMsg(errMsg);
      speakText(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      // Stop recognition while speaking to prevent feedback loops
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => {
        setIsSpeaking(false);
        // Restart recognition after speaking finishes if in always-on mode
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 text-slate-700">
      {isOpen && (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 w-80 mb-2 flex flex-col gap-3">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-gray-700">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg min-h-[80px] max-h-[200px] overflow-y-auto border border-gray-100">
            {transcript && <p className="text-sm text-gray-600 mb-2"><strong>You:</strong> {transcript}</p>}
            {responseMsg && <p className="text-sm text-blue-600"><strong>AI:</strong> {responseMsg}</p>}
            {!transcript && !responseMsg && <p className="text-sm text-gray-400 italic">How can I help you navigate?</p>}
          </div>

          <div className="flex gap-2 items-center">
            <input 
              type="text" 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt(textInput)}
              placeholder="Type a command..." 
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-800"
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSendPrompt(textInput)}
              disabled={isLoading || !textInput.trim()}
              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center cursor-pointer
                ${isListening 
                  ? (alwaysOn ? 'bg-blue-100 text-blue-600 animate-pulse border border-blue-200' : 'bg-red-100 text-red-600 animate-pulse') 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} 
                disabled:opacity-50`}
              title={isListening ? (alwaysOn ? "Mic Always On (Click to pause)" : "Stop Voice Input") : "Voice Input"}
            >
               {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
            <span className="text-xs font-semibold text-gray-500">Always On Listening</span>
            <button 
              onClick={() => {
                const nextVal = !alwaysOn;
                setAlwaysOn(nextVal);
                localStorage.setItem('voice_assistant_always_on', String(nextVal));
                // If turning it on, and not currently listening, start it!
                if (nextVal && !isListening && !isSpeaking) {
                  manuallyStoppedRef.current = false;
                  setTranscript('');
                  setResponseMsg('');
                  try {
                    recognitionRef.current?.start();
                    setIsListening(true);
                  } catch (err) {
                    console.error("Failed to start voice on setting toggle:", err);
                  }
                }
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${alwaysOn ? 'bg-blue-600' : 'bg-gray-200'}`}
              title={alwaysOn ? "Voice input will remain active continuously" : "Click to enable continuous hands-free voice input"}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${alwaysOn ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      )}
      
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 cursor-pointer"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default VoiceAI;
