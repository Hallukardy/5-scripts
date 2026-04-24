import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const DuplicateManager = ({ data, onComplete, onCancel }) => {
  // data is an array of { Hash, Files: [{ Path, Size }] }
  const [selectedPaths, setSelectedPaths] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Default: select the first file of each group to KEEP
    const initial = new Set();
    data.forEach(group => {
      if (group.Files.length > 0) {
        initial.add(group.Files[0].Path);
      }
    });
    setSelectedPaths(initial);
  }, [data]);

  const togglePath = (path, groupPaths) => {
    const next = new Set(selectedPaths);
    if (next.has(path)) {
      // Logic: Cannot unselect if it's the only one selected in the group
      const selectedInGroup = groupPaths.filter(p => next.has(p));
      if (selectedInGroup.length <= 1) {
        return; // Rule: Must keep at least one
      }
      next.delete(path);
    } else {
      next.add(path);
    }
    setSelectedPaths(next);
  };

  const getFilesToDelete = () => {
    const toDelete = [];
    data.forEach(group => {
      group.Files.forEach(file => {
        if (!selectedPaths.has(file.Path)) {
          toDelete.push(file.Path);
        }
      });
    });
    return toDelete;
  };

  const calculateRecoverable = () => {
    let total = 0;
    data.forEach(group => {
      group.Files.forEach(file => {
        if (!selectedPaths.has(file.Path)) {
          total += file.Size;
        }
      });
    });
    return total;
  };

  const formatSize = (bytes) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  const handleDelete = async () => {
    const toDelete = getFilesToDelete();
    if (toDelete.length === 0) return;

    if (!confirm(`Você está prestes a deletar PERMANENTEMENTE ${toDelete.length} arquivos. Deseja prosseguir?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch('http://localhost:3002/api/delete-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: toDelete })
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      alert('Erro ao deletar arquivos: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (results) {
    return (
      <div className="glass-card p-8 rounded-2xl max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <CheckCircle size={40} />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">Processo Concluído</h2>
        <p className="text-white/60 mb-8">
          Foram deletados <span className="text-white font-bold">{results.deleted.length}</span> arquivos com sucesso.
          {results.errors.length > 0 && (
            <span className="block text-red-400 mt-2">Ocorreram erros em {results.errors.length} arquivos.</span>
          )}
        </p>
        <button 
          onClick={onComplete}
          className="bg-accent-cyan text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 rounded-2xl max-w-6xl mx-auto flex flex-col h-[80vh]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold glow-cyan italic uppercase tracking-tighter">Gerenciador de Duplicatas</h2>
          <p className="text-white/40 text-sm">Organizado por grupos de arquivos idênticos</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/30 uppercase tracking-widest mb-1">Espaço a Recuperar</div>
          <div className="text-3xl font-black text-accent-gold">{formatSize(calculateRecoverable())}</div>
        </div>
      </div>

      <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-xl p-4 mb-6 flex gap-4 items-start">
        <Info className="text-accent-purple shrink-0 mt-1" size={20} />
        <div className="text-sm text-white/80 leading-relaxed">
          <span className="font-bold text-white">Regra de Seleção:</span> Marque os arquivos que deseja <span className="text-accent-cyan font-bold italic">MANTER</span>. 
          Os arquivos desmarcados serão deletados permanentemente do seu disco. 
          Você deve deixar pelo menos 1 arquivo marcado em cada grupo.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {data.map((group, gIdx) => (
          <div key={group.Hash} className="mb-8 last:mb-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono text-white/20">GRUPO {gIdx + 1}</span>
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-xs font-mono text-white/20">SHA-256: {group.Hash.substring(0, 16)}...</span>
            </div>
            
            <div className="grid gap-2">
              {group.Files.map(file => {
                const isSelected = selectedPaths.has(file.Path);
                return (
                  <label 
                    key={file.Path}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-accent-cyan/5 border-accent-cyan/30 text-white' 
                        : 'bg-black/20 border-white/5 text-white/40 hover:border-white/20'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePath(file.Path, group.Files.map(f => f.Path))}
                      className="w-5 h-5 rounded border-white/10 bg-black/40 text-accent-cyan focus:ring-accent-cyan focus:ring-offset-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm truncate">{file.Path}</div>
                    </div>
                    <div className="text-xs font-mono opacity-50 px-2 py-1 bg-white/5 rounded border border-white/5">
                      {formatSize(file.Size)}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4 border-t border-white/5 pt-6">
        <button 
          onClick={onCancel}
          className="px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-colors font-bold"
        >
          Cancelar
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting || getFilesToDelete().length === 0}
          className="flex-1 bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
        >
          {isDeleting ? (
            'Processando...'
          ) : (
            <>
              <Trash2 size={20} />
              <span>Deletar {getFilesToDelete().length} arquivos selecionados</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DuplicateManager;
