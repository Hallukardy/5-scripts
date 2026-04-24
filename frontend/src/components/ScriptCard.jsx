import React, { useState } from 'react';
import { 
  Play, Folder, Search, Wifi, Settings, Download, Trash2, Cpu, 
  ShieldAlert, Activity, Globe, Zap, HardDrive, RefreshCcw, 
  Terminal as TerminalIcon, Battery, Power, Key, List, FileSearch,
  Stethoscope, Rocket, ShoppingCart, Layout
} from 'lucide-react';

const icons = {
  // Core
  'cacar-duplicatas': Trash2,
  'organizar-downloads': Download,
  'scanner-espaco': Search,
  'scanner-wifi': Wifi,
  'setup-workspace': Settings,
  // System
  'sfc-scannow': ShieldAlert,
  'dism-restore': RefreshCcw,
  'dism-cleanup': Trash2,
  'chkdsk': HardDrive,
  'cleanmgr': Trash2,
  'prefetch-folder': Folder,
  'user-temp': Folder,
  'system-temp': Folder,
  // Network
  'flush-dns': Globe,
  'winsock-reset': RefreshCcw,
  'ip-reset': Zap,
  'ip-renew': Globe,
  // Gaming
  'chris-titus': Zap,
  'disable-hpet': Cpu,
  'disable-dynamic-tick': Activity,
  'winget-upgrade': Download,
  'ultimate-performance': Zap,
  'disable-hibernation': Battery,
  'system-info': FileSearch,
  // Hardware
  'mem-diag': Stethoscope,
  'disk-health-wmic': HardDrive,
  'battery-report': Battery,
  // Startup
  'msconfig': Settings,
  'winget-list': List,
  'wsreset': ShoppingCart,
  // Utility
  'power-energy': Battery,
  'shutdown-timer': Power,
  'cipher-wipe': Key,
  'tasklist': List,
  'driver-query': FileSearch
};

const ScriptCard = ({ id, meta, onRun, isRunning, isAdmin }) => {
  const [path, setPath] = useState('D:\\GitHub');
  const Icon = icons[id] || TerminalIcon;

  const handleRun = () => {
    if (meta.requiresPath && !path) {
      alert(`Por favor, defina o campo: ${meta.pathPlaceholder || 'Pasta alvo'}`);
      return;
    }
    onRun(id, path);
  };

  const showAdminWarning = meta.requiresAdmin && !isAdmin;

  return (
    <div className={`glass-card p-5 rounded-2xl flex flex-col transition-all duration-300 ${isRunning ? 'active-pulse scale-[1.02] border-accent-cyan/50' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg bg-white/5 border border-white/10 ${isRunning ? 'text-accent-cyan shadow-[0_0_10px_rgba(0,242,255,0.2)]' : 'text-white/40'}`}>
          <Icon size={20} />
        </div>
        
        <div className="flex gap-2">
          {meta.requiresAdmin && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
              isAdmin ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <ShieldAlert size={10} />
              <span>Admin</span>
            </div>
          )}
          
          <button
            onClick={handleRun}
            disabled={isRunning || (meta.requiresAdmin && !isAdmin)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isRunning 
                ? 'bg-accent-cyan/10 text-accent-cyan cursor-not-allowed' 
                : (meta.requiresAdmin && !isAdmin)
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                  : 'bg-accent-cyan text-black hover:bg-white hover:scale-105 active:scale-95'
            }`}
          >
            <Play size={12} fill="currentColor" />
            <span>{isRunning ? 'Rodando' : 'Executar'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-base font-bold mb-2 group-hover:text-accent-cyan transition-colors">{meta.name}</h3>
        <p className="text-[11px] text-white/50 leading-relaxed font-medium">
          {meta.description}
        </p>
      </div>

      {meta.requiresPath && (
        <div className="mt-5 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-accent-cyan">
            {id === 'shutdown-timer' ? <Power size={14} /> : <Folder size={14} />}
          </div>
          <input
            type="text"
            placeholder={meta.pathPlaceholder || "Caminho da pasta"}
            value={path}
            onChange={(e) => setPath(e.target.value)}
            disabled={isRunning}
            className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/40 transition-all font-mono placeholder:text-white/10"
          />
        </div>
      )}
      
      {showAdminWarning && (
        <div className="mt-3 text-[10px] text-red-400/80 font-semibold italic flex items-center gap-1.5">
          <ShieldAlert size={10} />
          <span>Privilégios de Administrador Necessários</span>
        </div>
      )}
    </div>
  );
};

export default ScriptCard;
