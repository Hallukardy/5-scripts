# HALLUKARDY / 5-SCRIPTS (Windows Edition)

Este repositório contém uma coleção de 5 scripts poderosos para automação e manutenção do Windows, agora com um **Dashboard Web Premium** para controle total.

## 🚀 Como Iniciar

Para abrir o painel de controle dos scripts:

1. Dê um duplo clique no arquivo `start-dashboard.bat` na raiz do projeto.
2. O dashboard abrirá automaticamente no seu navegador.
3. Use a interface para configurar caminhos e executar os scripts com um clique.

## 📁 Scripts Inclusos

1.  **Caçador de Duplicatas**: Encontra arquivos duplicados por hash SHA-256.
2.  **Organizador de Downloads**: Move arquivos para subpastas por categoria.
3.  **Scanner de Espaço**: Identifica os maiores arquivos e pastas do disco.
4.  **Scanner de Wi-Fi**: Analisa redes próximas e recomenda o melhor canal.
5.  **Setup de Workspace**: Gerencia janelas e apps por perfis multi-monitor.

## 🛠️ Tecnologias

- **Backend**: Node.js, Express, Socket.io (para execução de PowerShell em tempo real).
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion.
- **Scripts**: PowerShell Core / 5.1+.

## ⚙️ Requisitos

- Windows 10/11.
- Node.js instalado (para o Dashboard).
- PowerShell com permissão de execução (o dashboard tenta contornar isso automaticamente com `-ExecutionPolicy Bypass`).

---
*Focado em performance e estética premium.*
