import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  Activity, ShieldCheck, Terminal as TerminalIcon, LayoutGrid, 
  Search, Filter, ShieldAlert, Cpu, Globe, HardDrive, Wrench,
  Stethoscope, Rocket, Brain, Settings as SettingsIcon
} from 'lucide-react';
import ScriptCard from './components/ScriptCard';
import Terminal from './components/Terminal';
import DuplicateManager from './components/DuplicateManager';
import Settings from './views/Settings';
import AISidebar from './components/AISidebar';
import { SecurityService } from './lib/security';

const socket = io('http://localhost:3002');

const CATEGORIES = {
  'Core': { label: 'Principais', icon: LayoutGrid, color: 'text-accent-cyan' },
  'System': { label: 'Limpeza e Reparo', icon: HardDrive, color: 'text-red-400' },
  'Network': { label: 'Rede e Internet', icon: Globe, color: 'text-accent-purple' },
  'Gaming': { label: 'Performance e Games', icon: Cpu, color: 'text-accent-gold' },
  'Hardware': { label: 'Hardware e Diagnóstico', icon: Stethoscope, color: 'text-green-400' },
  'Startup': { label: 'Inicialização e Apps', icon: Rocket, color: 'text-blue-400' },
  'Utility': { label: 'Utilidades', icon: Wrench, color: 'text-white/60' }
};

function App() {
  const [scripts, setScripts] = useState({});
  const [logs, setLogs] = useState([]);
  const [runningScript, setRunningScript] = useState(null);
  const [scriptResult, setScriptResult] = useState(null);
  const [showManager, setShowManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'settings'
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [aiChat, setAiChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {

    // Fetch script metadata
    fetch('http://localhost:3002/api/scripts')
      .then(res => res.json())
      .then(data => setScripts(data));

    // Check Admin status
    fetch('http://localhost:3002/api/admin-check')
      .then(res => res.json())
      .then(data => setIsAdmin(data.isAdmin));

    // Socket listeners
    socket.on('output', (log) => {
      setLogs(prev => [...prev, log]);
    });

    socket.on('script-result', (result) => {
      setScriptResult(result);
    });

    socket.on('done', () => {
      setRunningScript(null);
    });

    return () => {
      socket.off('output');
      socket.off('script-result');
      socket.off('done');
    };
  }, []);

  const runScript = (scriptId, targetPath) => {
    setLogs([]); 
    setScriptResult(null); 
    setShowManager(false);
    setRunningScript(scriptId);
    socket.emit('run-script', { scriptId, targetPath });
  };

  const handleAISendMessage = async (text, overrideOptions = null) => {
    const userMsg = { role: 'user', content: text };
    if (!overrideOptions) setAiChat(prev => [...prev, userMsg]);
    setIsTyping(true);
    if (!overrideOptions) setShowAISidebar(true);

    try {
      const mode = overrideOptions?.mode || localStorage.getItem('ai_mode') || 'local';
      const provider = overrideOptions?.provider || 'gemini';
      
      let apiKey = overrideOptions?.apiKey;
      if (!apiKey) {
        const encrypted = localStorage.getItem(`5scripts_ai_apikey_${provider}`);
        if (encrypted) {
          apiKey = await SecurityService.decrypt(encrypted);
        }
      }

      const response = await fetch('http://localhost:3002/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: overrideOptions ? [userMsg] : [...aiChat, userMsg],
          mode,
          provider,
          apiKey
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro na resposta da IA');

      const content = data.choices?.[0]?.message?.content || "Desculpe, encontrei um erro ao processar sua solicitação.";
      
      if (overrideOptions) return content;

      const assistantMsg = { role: 'assistant', content };
      setAiChat(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('AI Error:', error);
      if (overrideOptions) throw error;
      setAiChat(prev => [...prev, { role: 'assistant', content: `Erro: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const testAIConnection = async (testConfig) => {
    return handleAISendMessage("Responda apenas 'OK' se estiver funcionando.", {
      ...testConfig,
      apiKey: testConfig.apiKey // if it's already plain text from UI
    });
  };

  const explainLogs = () => {
    const terminalText = logs.map(l => l.data).join('\n').slice(-2000);
    handleAISendMessage(`Explore os logs do terminal abaixo e me explique o que aconteceu de forma concisa:\n\n${terminalText}`);
  };

  const filteredScripts = Object.entries(scripts).filter(([id, meta]) => {
    const matchesSearch = meta.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          meta.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || meta.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 glass-card p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-cyan via-accent-purple to-accent-gold flex items-center justify-center active-pulse shadow-[0_0_20px_rgba(0,242,255,0.2)]">
            <Activity className="text-black" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter glow-cyan italic leading-none">HALLUKARDY / 5-SCRIPTS</h1>
            <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">Ultimate Windows Toolset v2.0</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
            isAdmin ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-500 active-pulse'
          }`}>
            {isAdmin ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
            <span className="font-bold uppercase tracking-widest">{isAdmin ? 'Modo Administrador' : 'Acesso Limitado'}</span>
          </div>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <button 
            onClick={() => setView(view === 'dashboard' ? 'settings' : 'dashboard')}
            className={`p-3 rounded-2xl border transition-all ${
              view === 'settings' ? 'bg-accent-cyan text-black border-accent-cyan' : 'bg-white/5 border-white/5 hover:border-white/10 text-white/60'
            }`}
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      {view === 'settings' ? (
        <Settings 
          onBack={() => setView('dashboard')} 
          onTestConnection={testAIConnection}
        />
      ) : (
        <div className="flex-1 flex flex-col gap-6">
          {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Buscar ferramenta pelo nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-accent-cyan/30 focus:bg-white/[0.08] transition-all text-sm"
          />
        </div>
        <div className="flex flex-wrap lg:flex-nowrap gap-2">
          <button 
            onClick={() => setShowAISidebar(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all"
          >
            <Brain size={14} />
            <span>Assistente AI</span>
          </button>
          <div className="h-8 w-px bg-white/5 hidden lg:block" />
          <button 
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeCategory === 'All' ? 'bg-accent-cyan text-black border-accent-cyan shadow-[0_0_15px_rgba(0,242,255,0.2)]' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'
            }`}
          >
            Todos
          </button>
          {Object.entries(CATEGORIES).map(([id, cat]) => (
            <button 
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeCategory === id ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'
              }`}
            >
              <cat.icon size={14} className={cat.color} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard or Manager View */}
      {showManager && scriptResult ? (
        <DuplicateManager 
          data={scriptResult} 
          onComplete={() => { setShowManager(false); setScriptResult(null); }}
          onCancel={() => setShowManager(false)}
        />
      ) : (
        <div className="contents">
          {/* Grouped View */}
          {Object.entries(CATEGORIES).map(([catId, cat]) => {
            const scriptsInCat = filteredScripts.filter(([_, meta]) => meta.category === catId);
            if (scriptsInCat.length === 0 && activeCategory !== 'All') return null;
            if (scriptsInCat.length === 0 && activeCategory === 'All' && searchTerm) return null;
            
            return (
              <section key={catId} className="space-y-4">
                <div className="flex items-center gap-4 px-2">
                  <cat.icon size={18} className={cat.color} />
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">{cat.label}</h2>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {scriptsInCat.map(([id, meta]) => (
                    <ScriptCard
                      key={id}
                      id={id}
                      meta={meta}
                      onRun={runScript}
                      isRunning={runningScript === id}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Empty State */}
          {filteredScripts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-4">
              <Search size={48} strokeWidth={1} />
              <p className="font-medium tracking-wide">Nenhuma ferramenta encontrada para sua busca.</p>
            </div>
          )}

          {/* Manager Button */}
          {scriptResult && !runningScript && (
            <div className="fixed bottom-8 right-8 z-50 animate-bounce">
              <button 
                onClick={() => setShowManager(true)}
                className="bg-accent-gold text-black px-6 py-4 rounded-2xl flex items-center gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/20 hover:scale-105 active:scale-95 transition-all"
              >
                <LayoutGrid size={24} />
                <div className="text-left">
                  <div className="font-bold text-base leading-none mb-1">Gerenciar Resultados</div>
                  <div className="text-[10px] opacity-70 uppercase tracking-widest font-black">Limpeza de Duplicatas Disponível</div>
                </div>
              </button>
            </div>
          )}

          {/* Terminal Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-white/40 font-bold uppercase text-[10px] tracking-[0.2em]">
                <TerminalIcon size={12} />
                <span>Log do Sistema</span>
              </div>
              <div className="flex items-center gap-4">
                {logs.length > 0 && (
                  <button 
                    onClick={explainLogs}
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-accent-cyan hover:text-white transition-all"
                  >
                    <Brain size={10} /> Explicar com AI
                  </button>
                )}
                {runningScript && (
                  <div className="flex items-center gap-2 text-accent-cyan animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Processando...</span>
                  </div>
                )}
              </div>
            </div>
            <Terminal logs={logs} />
          </div>
        </div>
      )}
    </div>
  )}

      {/* AI Sidebar */}
      <AISidebar 
        isOpen={showAISidebar}
        onClose={() => setShowAISidebar(false)}
        chat={aiChat}
        onSendMessage={handleAISendMessage}
        isTyping={isTyping}
      />

      {/* Footer */}
      <footer className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/10 text-[10px] font-mono uppercase tracking-[0.3em]">
        <div className="flex items-center gap-4">
          <span>&copy; 2026 Hallukardy Scripts</span>
          <span className="hidden md:inline text-white/5">|</span>
          <span>Open Source Automation Project</span>
        </div>
        <div className="flex gap-6">
          <span className="text-accent-cyan/30">Stable Release</span>
          <span>Node v24.14.1</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
