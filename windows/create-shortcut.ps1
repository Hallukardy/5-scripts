$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.IO.Path]::Combine($env:USERPROFILE, "Desktop")
$ShortcutPath = Join-Path $DesktopPath "Iniciar Projetos.lnk"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File D:\GitHub\5-scripts\windows\iniciar-projetos.ps1"
$Shortcut.WindowStyle = 1
$Shortcut.IconLocation = "powershell.exe,0"
$Shortcut.Description = "Inicia Portal_AI, APP_APICountDown e Claude Usage"
$Shortcut.Save()

Write-Host "Atalho criado com sucesso no Desktop!" -ForegroundColor Green
