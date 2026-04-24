import { 
  ChevronRight, ExternalLink, Zap, Lock, Activity,
  Globe, Brain, Shield, Save, Settings as SettingsIcon
} from 'lucide-react';
import { SecurityService } from '../lib/security';

const AI_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini', url: 'https://aistudio.google.com/' },
  { id: 'openai', name: 'OpenAI GPT-4o', url: 'https://platform.openai.com/' },
  { id: 'anthropic', name: 'Anthropic Claude', url: 'https://console.anthropic.com/' },
  { id: 'groq', name: 'Groq (Llama 3.3)', url: 'https://console.groq.com/' },
  { id: 'deepseek', name: 'DeepSeek', url: 'https://platform.deepseek.com/' },
  { id: 'mistral', name: 'Mistral AI', url: 'https://console.mistral.ai/' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/settings/api' },
  { id: 'cohere', name: 'Cohere', url: 'https://dashboard.cohere.com/' },
  { id: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.co/settings/tokens' },
  { id: 'xai', name: 'X.AI (Grok)', url: 'https://console.x.ai/' },
];

function Settings({ onBack, onTestConnection }) {
  const [mode, setMode] = useState(localStorage.getItem('ai_mode') || 'local');
  const [keys, setKeys] = useState({});
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(null); // ID of provider being tested

  useEffect(() => {
    // We don't load the plain keys for all, we just set masks if they exist
    const initialKeys = {};
    AI_PROVIDERS.forEach(p => {
      if (localStorage.getItem(`5scripts_ai_apikey_${p.id}`)) {
        initialKeys[p.id] = 'stored_securely';
      }
    });
    setKeys(initialKeys);
  }, []);

  const handleSave = async () => {
    localStorage.setItem('ai_mode', mode);
    
    // Save each key securely if modified
    for (const id in keys) {
      if (keys[id] && keys[id] !== 'stored_securely') {
        const encrypted = await SecurityService.encrypt(keys[id]);
        if (encrypted) {
          localStorage.setItem(`5scripts_ai_apikey_${id}`, encrypted);
          // If we had old keys in the JSON object, we should probably clean them up eventually
        }
      }
    }
    
    // Clean up old format if exists
    localStorage.removeItem('ai_keys');

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async (providerId) => {
    // 1. Save keys first
    await handleSave();
    
    setTesting(providerId);
    try {
      const result = await onTestConnection({ 
        mode, 
        provider: providerId,
        apiKey: keys[providerId] === 'stored_securely' ? null : keys[providerId]
      });
      alert(`✅ Ligação bem-sucedida (${providerId})!\n\n${result}`);
    } catch (err) {
      alert(`❌ Falha na ligação:\n\n${err.message}`);
    } finally {
      setTesting(null);
    }
  };

  const updateKey = (id, val) => {
    setKeys(prev => ({ ...prev, [id]: val }));
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-accent-cyan" size={24} />
          <h2 className="text-xl font-bold tracking-tight">Configurações de IA</h2>
        </div>
        <button 
          onClick={onBack}
          className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all"
        >
          Voltar ao Dashboard <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Mode */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
              <Globe size={14} /> Modo de Conexão
            </h3>
            
            <div className="space-y-2">
              <button 
                onClick={() => setMode('local')}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  mode === 'local' 
                  ? 'bg-accent-cyan/10 border-accent-cyan/30 ring-1 ring-accent-cyan/20' 
                  : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${mode === 'local' ? 'text-accent-cyan' : 'text-white'}`}>Portal_AI (Local)</span>
                  <Zap size={16} className={mode === 'local' ? 'text-accent-cyan' : 'text-white/20'} />
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Usa o Gateway centralizado (Aether Bridge) rodando em localhost:1111. Ideal para desenvolvimento.
                </p>
              </button>

              <button 
                onClick={() => setMode('production')}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  mode === 'production' 
                  ? 'bg-accent-purple/10 border-accent-purple/30 ring-1 ring-accent-purple/20' 
                  : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${mode === 'production' ? 'text-accent-purple' : 'text-white'}`}>Conexão Direta (Produção)</span>
                  <Shield size={16} className={mode === 'production' ? 'text-accent-purple' : 'text-white/20'} />
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Conecta-se diretamente aos provedores usando suas chaves individuais salvas localmente.
                </p>
              </button>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              saved ? 'bg-green-500 text-black' : 'bg-white text-black hover:bg-accent-cyan'
            }`}
          >
            {saved ? <Shield size={18} /> : <Save size={18} />}
            {saved ? 'Salvo com Sucesso!' : 'Salvar Configurações'}
          </button>
        </div>

        {/* API Keys */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
              <Brain size={14} /> Chaves de API (10 Provedores)
            </h3>
            {mode === 'local' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                <Lock size={10} className="text-white/20" />
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter italic">Desativado em Modo Local</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_PROVIDERS.map((provider) => (
              <div key={provider.id} className={`space-y-2 transition-opacity ${mode === 'local' ? 'opacity-30 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">{provider.name}</label>
                  <a href={provider.url} target="_blank" rel="noreferrer" className="text-accent-cyan hover:underline text-[9px] flex items-center gap-1">
                    Obter Chave <ExternalLink size={8} />
                  </a>
                </div>
                <div className="relative group">
                  <input 
                    type="password"
                    placeholder={keys[provider.id] === 'stored_securely' ? '****************' : `Insira sua chave ${provider.name}...`}
                    value={keys[provider.id] === 'stored_securely' ? '' : (keys[provider.id] || '')}
                    onChange={(e) => updateKey(provider.id, e.target.value)}
                    disabled={keys[provider.id] === 'stored_securely'}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-4 pr-10 text-xs focus:outline-none focus:border-accent-cyan/30 transition-all font-mono disabled:opacity-50"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {keys[provider.id] === 'stored_securely' ? (
                      <button 
                        onClick={() => updateKey(provider.id, '')}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-accent-cyan transition-all"
                        title="Substituir Chave"
                      >
                        <Lock size={12} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleTest(provider.id)}
                        disabled={testing === provider.id || !keys[provider.id]}
                        className="p-1.5 hover:bg-accent-cyan/20 rounded-lg text-accent-cyan transition-all disabled:opacity-30"
                        title="Testar Conexão"
                      >
                        <Activity size={12} className={testing === provider.id ? 'animate-spin' : ''} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
