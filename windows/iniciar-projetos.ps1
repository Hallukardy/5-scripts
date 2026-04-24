# Script para iniciar projetos diários usando Windows Terminal (Abas)
# Criado por Antigravity

Write-Host "Iniciando projetos diários no Windows Terminal..." -ForegroundColor Cyan

# Verifica se o Windows Terminal está instalado
if (Get-Command wt -ErrorAction SilentlyContinue) {
    # Abre o primeiro projeto na aba atual/nova
    # E adiciona as outras como novas abas (-w 0 foca na mesma janela)
    
    # 1. Portal_AI
    wt -d "D:\GitHub\Portal_AI" powershell -NoExit -Command "npm run dev" `; `
       new-tab -d "D:\GitHub\APP_APICountDown" powershell -NoExit -Command "npm run dev" `; `
       new-tab -d "D:\GitHub\claude-usage" powershell -NoExit -Command "python cli.py dashboard"
    
    Write-Host "Projetos abertos em abas do Windows Terminal!" -ForegroundColor Green
} else {
    Write-Host "Windows Terminal não detectado. Usando janelas separadas do PowerShell..." -ForegroundColor Yellow
    
    # Fallback para janelas separadas se não houver WT
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\GitHub\Portal_AI; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\GitHub\APP_APICountDown; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\GitHub\claude-usage; python cli.py dashboard"
    
    Write-Host "Projetos abertos em janelas separadas!" -ForegroundColor Green
}
