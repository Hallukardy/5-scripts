import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, Send, X, Bot, User, Sparkles, 
  Terminal, AlertTriangle, Lightbulb 
} from 'lucide-react';

function AISidebar({ isOpen, onClose, chat, onSendMessage, isTyping }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-[#0c0c0e] border-l border-white/5 shadow-2xl z-[100] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center border border-accent-cyan/20">
            <Brain className="text-accent-cyan" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Assistente AI</h3>
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">Especialista em Windows</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all">
          <X size={18} />
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 opacity-40">
            <Sparkles size={40} strokeWidth={1} />
            <div className="space-y-1">
              <p className="text-xs font-bold">Como posso ajudar?</p>
              <p className="text-[10px]">Posso explicar resultados de scripts, sugerir correções ou criar novos comandos.</p>
            </div>
          </div>
        )}

        {chat.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`p-2 h-max rounded-lg ${msg.role === 'user' ? 'bg-accent-purple/20' : 'bg-white/5'}`}>
              {msg.role === 'user' ? <User size={12} /> : <Bot size={12} className="text-accent-cyan" />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] leading-relaxed ${
              msg.role === 'user' ? 'bg-accent-purple/10 border border-accent-purple/20 ml-auto' : 'bg-white/[0.03] border border-white/5'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-pulse">
            <div className="p-2 h-max rounded-lg bg-white/5">
              <Bot size={12} className="text-accent-cyan" />
            </div>
            <div className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl flex gap-1">
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <div className="w-1 h-1 rounded-full bg-white/40 delay-100" />
              <div className="w-1 h-1 rounded-full bg-white/40 delay-200" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <div className="relative">
          <textarea 
            rows="2"
            placeholder="Pergunte sobre um script ou erro..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:border-accent-cyan/30 transition-all resize-none"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-accent-cyan text-black rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AISidebar;
