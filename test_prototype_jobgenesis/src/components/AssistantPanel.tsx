import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { chatWithInterviewer } from '../lib/gemini';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface Props {
  currentCode: string;
  problemContext: string;
}

export const AssistantPanel = ({ currentCode, problemContext }: Props) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your interviewer today. I've reviewed the problem statement. Feel free to ask clarifying questions or for a hint if you get stuck." }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Build history for the stateless function
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chatWithInterviewer(history, userMsg, currentCode, problemContext);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "I lost connection to the server. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-800 border-l border-dark-700">
      <div className="h-14 border-b border-dark-700 flex items-center px-4 gap-2 bg-dark-800/50 backdrop-blur">
        <div className="p-1.5 bg-purple-500/10 rounded-lg">
          <Bot size={18} className="text-purple-400" />
        </div>
        <span className="font-semibold text-gray-200 tracking-wide text-sm uppercase">AI Interviewer</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-dark-700 text-gray-100 rounded-bl-none border border-dark-600'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-dark-700 rounded-2xl rounded-bl-none p-4 border border-dark-600 flex items-center gap-2">
              <Loader2 className="animate-spin text-purple-400" size={16} />
              <span className="text-xs text-gray-400">Analyzing code...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-dark-700 bg-dark-900">
        <div className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for a hint..."
            className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-500"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 top-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-1.5 rounded-lg transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="mt-2 flex justify-center">
            <p className="text-[10px] text-gray-600 flex items-center gap-1">
                <Sparkles size={10} /> Powered by Gemini 1.5
            </p>
        </div>
      </div>
    </div>
  );
};