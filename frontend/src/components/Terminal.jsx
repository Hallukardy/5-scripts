import React, { useEffect, useRef } from 'react';

const Terminal = ({ logs }) => {
  const terminalEndRef = useRef(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  return (
    <div className="glass-card flex flex-col h-64 rounded-xl overflow-hidden mt-8">
      <div className="bg-[#1a1a1e] px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">System Output</span>
      </div>
      <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-black/40">
        {logs.length === 0 ? (
          <div className="text-white/20 italic">Aguardando execução...</div>
        ) : (
          <div className="min-w-max">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className={`whitespace-pre mb-1 ${
                  log.type === 'stderr' ? 'text-red-400' : 
                  log.type === 'info' ? 'text-accent-cyan' : 
                  'text-white/80'
                }`}
              >
                {log.data}
              </div>
            ))}
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default Terminal;
