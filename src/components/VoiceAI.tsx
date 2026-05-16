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
  const navigate = useNavigate();

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        // setTranscript(result); -> This is now handled in handleSendPrompt
        handleSendPrompt(result);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
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
    } catch (error) {
      console.error("AI chat error", error);
      setResponseMsg("Sorry, I encountered an error connecting to the AI server.");
      speakText("Sorry, I encountered an error connecting to the AI server.");
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 w-80 mb-2 flex flex-col gap-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-700">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg min-h-[80px] max-h-[200px] overflow-y-auto">
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
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSendPrompt(textInput)}
              disabled={isLoading || !textInput.trim()}
              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center
                ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} 
                disabled:opacity-50`}
              title="Voice Input"
            >
               {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
      
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default VoiceAI;
