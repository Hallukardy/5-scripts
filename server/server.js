const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const spawn = require('cross-spawn');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const { callProvider } = require('./services/aiProviders');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const SCRIPTS_DIR = path.join(__dirname, '../windows');

const scriptsMetadata = {
    // ── CORE SCRIPTS (Original 5) ──
    'cacar-duplicatas': {
        name: 'Caçador de Duplicatas',
        description: 'Encontra arquivos duplicados por hash SHA-256.',
        filename: 'cacar-duplicatas.ps1',
        requiresPath: true,
        category: 'Core'
    },
    'organizar-downloads': {
        name: 'Organizar Downloads',
        description: 'Organiza arquivos por extensão em subpastas.',
        filename: 'organizar-downloads.ps1',
        requiresPath: true,
        category: 'Core'
    },
    'scanner-espaco': {
        name: 'Scanner de Espaço',
        description: 'Analisa o disco e mostra os maiores arquivos/pastas.',
        filename: 'scanner-espaco.ps1',
        requiresPath: true,
        category: 'Core'
    },
    'scanner-wifi': {
        name: 'Scanner de Wi-Fi',
        description: 'Analisa redes e recomenda os melhores canais.',
        filename: 'scanner-wifi.ps1',
        requiresPath: false,
        category: 'Core'
    },
    'setup-workspace': {
        name: 'Setup de Workspace',
        description: 'Gerencia janelas e apps por perfis.',
        filename: 'setup-workspace.ps1',
        requiresPath: false,
        category: 'Core'
    },

    // ── LIMPEZA E REPARO (Sistema) ──
    'sfc-scannow': {
        name: 'SFC Scannow',
        description: 'Corrige arquivos corrompidos do sistema.',
        command: 'sfc /scannow',
        requiresAdmin: true,
        category: 'System'
    },
    'dism-restore': {
        name: 'DISM Restore Health',
        description: 'Repara a imagem do Windows usando o Windows Update.',
        command: 'dism /online /cleanup-image /restorehealth',
        requiresAdmin: true,
        category: 'System'
    },
    'dism-cleanup': {
        name: 'DISM Component Cleanup',
        description: 'Limpa arquivos antigos de atualizações do Windows.',
        command: 'dism /online /cleanup-image /startcomponentcleanup',
        requiresAdmin: true,
        category: 'System'
    },
    'chkdsk': {
        name: 'CHKDSK',
        description: 'Verifica e repara erros no HD/SSD.',
        command: 'chkdsk %PATH% /f /r',
        requiresAdmin: true,
        requiresPath: true,
        pathPlaceholder: 'Letra da unidade (ex: C:)',
        category: 'System'
    },
    'cleanmgr': {
        name: 'CleanMgr',
        description: 'Abre a ferramenta de limpeza de disco nativa.',
        command: 'cleanmgr',
        category: 'System'
    },
    'prefetch-folder': {
        name: 'Abrir Prefetch',
        description: 'Abre a pasta de arquivos temporários de boot para limpeza manual.',
        command: 'explorer C:\\Windows\\Prefetch',
        category: 'System'
    },
    'user-temp': {
        name: 'Abrir Temp (Usuário)',
        description: 'Abre a pasta de arquivos temporários do seu usuário.',
        command: 'explorer $env:TEMP',
        isPowerShell: true,
        category: 'System'
    },
    'system-temp': {
        name: 'Abrir Temp (Sistema)',
        description: 'Abre a pasta de arquivos temporários geral do Windows.',
        command: 'explorer C:\\Windows\\Temp',
        category: 'System'
    },

    // ── OTIMIZACAO DE REDE ──
    'flush-dns': {
        name: 'Flush DNS',
        description: 'Limpa o cache DNS para resolver erros de carregamento.',
        command: 'ipconfig /flushdns',
        category: 'Network'
    },
    'winsock-reset': {
        name: 'Netsh Winsock Reset',
        description: 'Restaura o catálogo de rede (corrige quedas de Wi-Fi).',
        command: 'netsh winsock reset',
        requiresAdmin: true,
        category: 'Network'
    },
    'ip-reset': {
        name: 'Reset IP',
        description: 'Redefine as configurações de endereço IP.',
        command: 'netsh int ip reset',
        requiresAdmin: true,
        category: 'Network'
    },
    'ip-renew': {
        name: 'Renew IP',
        description: 'Solicita um novo endereço IP ao roteador.',
        command: 'ipconfig /renew',
        category: 'Network'
    },

    // ── DESEMPENHO E GAMES ──
    'chris-titus': {
        name: 'Script Chris Titus',
        description: 'Otimização definitiva para debloat e performance.',
        command: 'iwr -useb https://christitus.com/win | iex',
        isPowerShell: true,
        category: 'Gaming'
    },
    'disable-hpet': {
        name: 'Desativar HPET',
        description: 'Reduz latência em jogos desativando High Precision Event Timer.',
        command: 'bcdedit /set useplatformclock false',
        requiresAdmin: true,
        category: 'Gaming'
    },
    'disable-dynamic-tick': {
        name: 'Desativar Dynamic Tick',
        description: 'Melhora a estabilidade do processador em tarefas pesadas.',
        command: 'bcdedit /set disabledynamictick yes',
        requiresAdmin: true,
        category: 'Gaming'
    },
    'winget-upgrade': {
        name: 'Winget Upgrade All',
        description: 'Atualiza todos os programas instalados de uma só vez.',
        command: 'winget upgrade --all',
        category: 'Gaming'
    },
    'ultimate-performance': {
        name: 'Desempenho Máximo',
        description: 'Libera o plano de energia oculto focado 100% em performance.',
        command: 'powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61',
        requiresAdmin: true,
        category: 'Gaming'
    },
    'disable-hibernation': {
        name: 'Desativar Hibernação',
        description: 'Libera gigabytes de espaço e evita escritas desnecessárias no SSD.',
        command: 'powercfg -h off',
        requiresAdmin: true,
        category: 'Gaming'
    },
    'system-info': {
        name: 'System Info',
        description: 'Mostra detalhes técnicos completos do PC.',
        command: 'systeminfo',
        category: 'Gaming'
    },

    // ── HARDWARE E DIAGNÓSTICO ──
    'mem-diag': {
        name: 'Diagnóstico de Memória',
        description: 'Reinicia o PC para testar a saúde da sua memória RAM.',
        command: 'mdsched.exe',
        category: 'Hardware'
    },
    'disk-health-wmic': {
        name: 'Saúde do Disco (WMIC)',
        description: 'Comando rápido para saber se o seu HD ou SSD está saudável.',
        command: 'wmic diskdrive get status',
        category: 'Hardware'
    },
    'battery-report': {
        name: 'Relatório de Bateria',
        description: 'Gera um arquivo HTML detalhado sobre o desgaste da bateria.',
        command: 'powercfg /batteryreport /output "$env:USERPROFILE\\Desktop\\battery-report.html"',
        isPowerShell: true,
        category: 'Hardware'
    },

    // ── STARTUP E PROCESSOS ──
    'msconfig': {
        name: 'MSConfig',
        description: 'Abre o configurador do sistema para gerenciar o boot.',
        command: 'msconfig',
        category: 'Startup'
    },
    'winget-list': {
        name: 'Winget List',
        description: 'Lista programas e mostra atualizações de segurança pendentes.',
        command: 'winget list',
        category: 'Startup'
    },
    'wsreset': {
        name: 'WSReset (Loja)',
        description: 'Conserta a Microsoft Store quando ela trava ou não atualiza apps.',
        command: 'wsreset.exe',
        requiresAdmin: true,
        category: 'Startup'
    },

    // ── ORGANIZACAO E UTILIDADES ──
    'power-energy': {
        name: 'Relatório de Energia',
        description: 'Gera um relatório de saúde da bateria (60 segundos).',
        command: 'powercfg /energy',
        requiresAdmin: true,
        category: 'Utility'
    },
    'shutdown-timer': {
        name: 'Shutdown Timer',
        description: 'Programa o PC para desligar em um tempo determinado.',
        command: 'shutdown -s -t %PATH%',
        requiresPath: true,
        pathPlaceholder: 'Segundos (ex: 3600 para 1h)',
        category: 'Utility'
    },
    'cipher-wipe': {
        name: 'Cipher Wiping',
        description: 'Sobrescreve espaço vazio para evitar recuperação de arquivos.',
        command: 'cipher /w:%PATH%',
        requiresPath: true,
        pathPlaceholder: 'Letra da unidade (ex: C:)',
        category: 'Utility'
    },
    'tasklist': {
        name: 'Tasklist',
        description: 'Lista todos os processos rodando no sistema.',
        command: 'tasklist',
        category: 'Utility'
    },
    'driver-query': {
        name: 'Driver Query',
        description: 'Lista todos os drivers instalados e suas versões.',
        command: 'driverquery',
        category: 'Utility'
    },
    'open-github-folder': {
        name: 'Abrir Pasta GitHub',
        description: 'Abre o diretório D:\\GitHub no Windows Explorer.',
        command: 'explorer D:\\GitHub',
        category: 'Core'
    }
};

app.get('/api/scripts', (req, res) => {
    res.json(scriptsMetadata);
});


app.get('/api/admin-check', (req, res) => {
    // Check for admin rights by trying to run a net session command
    const ps = spawn('powershell.exe', ['-Command', '([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")']);
    let output = '';
    ps.stdout.on('data', d => output += d.toString());
    ps.on('close', () => {
        res.json({ isAdmin: output.trim().toLowerCase() === 'true' });
    });
});

// ── AI SERVICE ──
app.post('/api/ai/chat', async (req, res) => {
    const { messages, provider, mode, apiKey } = req.body;
    
    // Mode Logic: Local (Portal_AI) or Production (Direct)
    const isLocal = mode === 'local';
    const baseUrl = isLocal ? 'http://localhost:1111/v1' : null; // Portal_AI default
    
    try {
        if (isLocal) {
            // Portal_AI (Aether Bridge) Proxy
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer aether`
                },
                body: JSON.stringify({
                    model: 'architect-tier',
                    messages
                })
            });
            const data = await response.json();
            return res.json(data);
        }
        
        // Production Mode: callProvider
        const finalKey = apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];
        if (!finalKey) {
            return res.status(400).json({ error: `API Key for ${provider} is missing.` });
        }

        const content = await callProvider(provider, messages, finalKey);
        res.json({ choices: [{ message: { content } }] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sanitization helper
function sanitizePath(unsafePath) {
    if (!unsafePath) return null;
    // Remove characters that might be used for expansion/injection in PS
    return unsafePath.replace(/[;&|`$<>]/g, '');
}

app.post('/api/delete-files', (req, res) => {
    const { paths } = req.body;
    if (!paths || !Array.isArray(paths)) {
        return res.status(400).json({ error: 'Paths must be an array' });
    }

    const results = { deleted: [], errors: [] };
    paths.forEach(filePath => {
        try {
            const sanitized = sanitizePath(filePath);
            if (!sanitized || sanitized !== filePath) {
                results.errors.push({ path: filePath, error: 'Invalid or unsafe path' });
                return;
            }

            if (fs.existsSync(filePath)) {
                // Security: Basic check to prevent deleting system files
                const lowerPath = filePath.toLowerCase();
                if (lowerPath.includes('c:\\windows') || lowerPath.includes('c:\\program files')) {
                     results.errors.push({ path: filePath, error: 'Access denied: System folder' });
                     return;
                }

                fs.unlinkSync(filePath);
                results.deleted.push(filePath);
            } else {
                results.errors.push({ path: filePath, error: 'File not found' });
            }
        } catch (err) {
            results.errors.push({ path: filePath, error: err.message });
        }
    });

    res.json(results);
});

io.on('connection', (socket) => {
    socket.on('run-script', ({ scriptId, targetPath }) => {
        const script = scriptsMetadata[scriptId];
        if (!script) {
            socket.emit('output', { type: 'stderr', data: 'Script não encontrado.\n' });
            return;
        }

        let child;
        let isCollectingJson = false;
        let jsonBuffer = '';

        if (script.filename) {
            // Internal PS1 Script
            const scriptPath = path.join(SCRIPTS_DIR, script.filename);
            const args = ['-ExecutionPolicy', 'Bypass', '-File', scriptPath];
            
            const sanitizedPath = sanitizePath(targetPath);
            if (script.requiresPath && sanitizedPath) {
                args.push(sanitizedPath);
                if (scriptId === 'cacar-duplicatas') {
                    args.push('-Json');
                    isCollectingJson = true;
                }
            }
            socket.emit('output', { type: 'info', data: `Executando Script: ${script.name}${isCollectingJson ? ' (Modo Análise)' : ''}...\n` });
            child = spawn('powershell.exe', args);
        } else {
            // Raw Command
            let cmdStr = script.command;
            if (script.requiresPath && targetPath) {
                cmdStr = cmdStr.replace('%PATH%', targetPath);
            }
            
            socket.emit('output', { type: 'info', data: `Executando Comando: ${cmdStr}\n` });
            
            if (script.isPowerShell) {
                child = spawn('powershell.exe', ['-Command', cmdStr]);
            } else {
                // Run in cmd or powershell as needed
                child = spawn('powershell.exe', ['-Command', cmdStr]);
            }
        }

        child.stdout.on('data', (data) => {
            const str = data.toString();
            if (isCollectingJson) {
                jsonBuffer += str;
            } else {
                socket.emit('output', { type: 'stdout', data: str });
            }
        });

        child.stderr.on('data', (data) => {
            socket.emit('output', { type: 'stderr', data: data.toString() });
        });

        child.on('close', (code) => {
            if (isCollectingJson && code === 0) {
                try {
                    const result = JSON.parse(jsonBuffer);
                    socket.emit('script-result', result);
                } catch (e) {
                    socket.emit('output', { type: 'stderr', data: 'Falha ao processar dados JSON.\n' });
                }
            }
            socket.emit('output', { type: 'info', data: `\n[FIM] Processo finalizado com código ${code}.\n` });
            socket.emit('done', { code });
        });
    });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
