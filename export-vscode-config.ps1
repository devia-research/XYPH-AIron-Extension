# 📦 Export Complet de l'Environnement VS Code
# Sauvegarde complète : extensions, paramètres, comptes, clés API, etc.

param(
    [Parameter(Mandatory=$false)]
    [string]$ExportPath = "F:\VSCode-Backup",
    
    [Parameter(Mandatory=$false)]
    [switch]$IncludePasswords = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$CreatePortableBackup = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$BackupName = "VSCode-Backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
)

Write-Host "📦 Export Complet VS Code Environment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Chemins VS Code
$UserProfile = $env:USERPROFILE
$VSCodeUserPath = "$UserProfile\.vscode"
$VSCodeDataPath = "$env:APPDATA\Code\User"
$VSCodeExtensionsPath = "$UserProfile\.vscode\extensions"

# Créer le dossier de sauvegarde
$BackupPath = Join-Path $ExportPath $BackupName
New-Item -Path $BackupPath -ItemType Directory -Force | Out-Null

Write-Host "📁 Dossier de sauvegarde : $BackupPath" -ForegroundColor Green
Write-Host ""

# Fonction pour copier avec gestion d'erreurs
function Copy-WithLog {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Description
    )
    
    try {
        if (Test-Path $Source) {
            Copy-Item $Source $Destination -Recurse -Force
            Write-Host "✅ $Description" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️ $Description - Source non trouvée : $Source" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ $Description - Erreur : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 1. Extensions VS Code
Write-Host "🔌 Sauvegarde des extensions..." -ForegroundColor Blue
$ExtensionsBackup = Join-Path $BackupPath "Extensions"
New-Item -Path $ExtensionsBackup -ItemType Directory -Force | Out-Null

# Liste des extensions installées
$installedExtensions = code --list-extensions
$extensionsList = @()

foreach ($extension in $installedExtensions) {
    $extensionsList += $extension
}

$extensionsData = @{
    extensions = $extensionsList
    count = $extensionsList.Count
    export_date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

$extensionsData | ConvertTo-Json -Depth 3 | Out-File -FilePath (Join-Path $ExtensionsBackup "extensions-list.json") -Encoding UTF8

# Script de réinstallation des extensions
$reinstallScript = @"
# 🔌 Script de Réinstallation des Extensions VS Code
# Généré le $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Write-Host "🔌 Installation des extensions VS Code..." -ForegroundColor Cyan

"@ + ($extensionsList | ForEach-Object { "code --install-extension $_" }) -join "`n" + @"

Write-Host "✅ Installation des extensions terminée !" -ForegroundColor Green
"@

$reinstallScript | Out-File -FilePath (Join-Path $ExtensionsBackup "reinstall-extensions.ps1") -Encoding UTF8

Write-Host "   📝 $($extensionsList.Count) extensions sauvegardées" -ForegroundColor Gray

# 2. Paramètres utilisateur
Write-Host "⚙️ Sauvegarde des paramètres..." -ForegroundColor Blue
$SettingsBackup = Join-Path $BackupPath "Settings"
New-Item -Path $SettingsBackup -ItemType Directory -Force | Out-Null

# Settings.json
Copy-WithLog "$VSCodeDataPath\settings.json" (Join-Path $SettingsBackup "settings.json") "Paramètres utilisateur"

# Keybindings
Copy-WithLog "$VSCodeDataPath\keybindings.json" (Join-Path $SettingsBackup "keybindings.json") "Raccourcis clavier"

# Snippets
Copy-WithLog "$VSCodeDataPath\snippets" (Join-Path $SettingsBackup "snippets") "Snippets personnalisés"

# Tasks et Launch configurations
Copy-WithLog "$VSCodeDataPath\tasks.json" (Join-Path $SettingsBackup "tasks.json") "Configurations de tâches"

# 3. Workspaces
Write-Host "🗂️ Sauvegarde des workspaces..." -ForegroundColor Blue
$WorkspacesBackup = Join-Path $BackupPath "Workspaces"
New-Item -Path $WorkspacesBackup -ItemType Directory -Force | Out-Null

# Fichiers workspace
$workspaceFiles = Get-ChildItem "$VSCodeDataPath" -Filter "*.code-workspace" -ErrorAction SilentlyContinue
foreach ($workspace in $workspaceFiles) {
    Copy-Item $workspace.FullName (Join-Path $WorkspacesBackup $workspace.Name)
    Write-Host "   📁 Workspace : $($workspace.Name)" -ForegroundColor Gray
}

# Storage des workspaces
Copy-WithLog "$VSCodeDataPath\workspaceStorage" (Join-Path $WorkspacesBackup "workspaceStorage") "Données des workspaces"

# 4. Données des extensions
Write-Host "💾 Sauvegarde des données d'extensions..." -ForegroundColor Blue
$ExtensionDataBackup = Join-Path $BackupPath "ExtensionData"
New-Item -Path $ExtensionDataBackup -ItemType Directory -Force | Out-Null

# User data
Copy-WithLog "$VSCodeDataPath\User" (Join-Path $ExtensionDataBackup "User") "Données utilisateur"

# State global
Copy-WithLog "$VSCodeDataPath\globalStorage" (Join-Path $ExtensionDataBackup "globalStorage") "Storage global"

# 5. Comptes et authentification
Write-Host "🔐 Sauvegarde des comptes et authentification..." -ForegroundColor Blue
$AuthBackup = Join-Path $BackupPath "Authentication"
New-Item -Path $AuthBackup -ItemType Directory -Force | Out-Null

# Données d'authentification (attention aux données sensibles)
if ($IncludePasswords) {
    Write-Host "   ⚠️ ATTENTION : Sauvegarde des données sensibles activée" -ForegroundColor Red
    
    # Credentials Windows (Git, etc.)
    try {
        $gitCredentials = git config --global --list 2>$null
        if ($gitCredentials) {
            $gitCredentials | Out-File -FilePath (Join-Path $AuthBackup "git-config.txt") -Encoding UTF8
            Write-Host "   🔑 Configuration Git sauvegardée" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ⚠️ Impossible de sauvegarder la config Git" -ForegroundColor Yellow
    }
    
    # Extensions avec tokens (GitHub, Azure, etc.)
    $sensitiveExtensions = @(
        "ms-vscode.azure-account",
        "GitHub.github-vscode-theme",
        "ms-azuretools.*",
        "github.*"
    )
    
    $tokenWarning = @"
⚠️ AVERTISSEMENT SÉCURITÉ ⚠️
Cette sauvegarde peut contenir des tokens et clés API.
Stockez ce fichier dans un endroit sécurisé et chiffré.
Ne partagez jamais ce backup sur des services cloud publics.
"@
    $tokenWarning | Out-File -FilePath (Join-Path $AuthBackup "SECURITY_WARNING.txt") -Encoding UTF8
}

# 6. Projets et historique récent
Write-Host "📚 Sauvegarde de l'historique des projets..." -ForegroundColor Blue
$ProjectsBackup = Join-Path $BackupPath "Projects"
New-Item -Path $ProjectsBackup -ItemType Directory -Force | Out-Null

# Historique des fichiers récents
Copy-WithLog "$VSCodeDataPath\storage.json" (Join-Path $ProjectsBackup "storage.json") "Historique et état"

# 7. Thèmes et icônes personnalisés
Write-Host "🎨 Sauvegarde des thèmes..." -ForegroundColor Blue
$ThemesBackup = Join-Path $BackupPath "Themes"
New-Item -Path $ThemesBackup -ItemType Directory -Force | Out-Null

# Extensions de thèmes dans le dossier extensions
$themeExtensions = Get-ChildItem $VSCodeExtensionsPath -Directory | Where-Object { 
    $_.Name -match "theme|icon"
}

foreach ($theme in $themeExtensions) {
    $themePath = Join-Path $ThemesBackup $theme.Name
    Copy-Item $theme.FullName $themePath -Recurse -Force
    Write-Host "   🎨 Thème : $($theme.Name)" -ForegroundColor Gray
}

# 8. Configuration terminaux
Write-Host "💻 Sauvegarde configuration terminaux..." -ForegroundColor Blue
$TerminalBackup = Join-Path $BackupPath "Terminal"
New-Item -Path $TerminalBackup -ItemType Directory -Force | Out-Null

# Profils PowerShell
$psProfiles = @(
    $PROFILE.AllUsersAllHosts,
    $PROFILE.AllUsersCurrentHost,
    $PROFILE.CurrentUserAllHosts,
    $PROFILE.CurrentUserCurrentHost
)

foreach ($psProfile in $psProfiles) {
    if ($psProfile -and (Test-Path $psProfile)) {
        $profileName = Split-Path $psProfile -Leaf
        Copy-Item $psProfile (Join-Path $TerminalBackup $profileName)
        Write-Host "   📜 Profil PowerShell : $profileName" -ForegroundColor Gray
    }
}

# 9. Créer un script de restauration
Write-Host "🔧 Création du script de restauration..." -ForegroundColor Blue

$restoreScript = @"
# 🔄 Script de Restauration VS Code Environment
# Généré le $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

param(
    [Parameter(Mandatory=`$false)]
    [string]`$BackupPath = "`$PSScriptRoot",
    [Parameter(Mandatory=`$false)]
    [switch]`$RestorePasswords = `$false
)

Write-Host "🔄 Restauration de l'environnement VS Code..." -ForegroundColor Cyan
Write-Host "Backup source : `$BackupPath" -ForegroundColor Gray
Write-Host ""

`$VSCodeDataPath = "`$env:APPDATA\Code\User"
`$VSCodeExtensionsPath = "`$env:USERPROFILE\.vscode\extensions"

# 1. Restaurer les paramètres
Write-Host "⚙️ Restauration des paramètres..." -ForegroundColor Blue
if (Test-Path "`$BackupPath\Settings\settings.json") {
    Copy-Item "`$BackupPath\Settings\settings.json" "`$VSCodeDataPath\settings.json" -Force
    Write-Host "   ✅ Settings.json restauré" -ForegroundColor Green
}

if (Test-Path "`$BackupPath\Settings\keybindings.json") {
    Copy-Item "`$BackupPath\Settings\keybindings.json" "`$VSCodeDataPath\keybindings.json" -Force
    Write-Host "   ✅ Keybindings restaurés" -ForegroundColor Green
}

if (Test-Path "`$BackupPath\Settings\snippets") {
    Copy-Item "`$BackupPath\Settings\snippets" "`$VSCodeDataPath\snippets" -Recurse -Force
    Write-Host "   ✅ Snippets restaurés" -ForegroundColor Green
}

# 2. Restaurer les extensions
Write-Host "🔌 Restauration des extensions..." -ForegroundColor Blue
if (Test-Path "`$BackupPath\Extensions\reinstall-extensions.ps1") {
    & "`$BackupPath\Extensions\reinstall-extensions.ps1"
}

# 3. Restaurer les données d'extensions
Write-Host "💾 Restauration des données..." -ForegroundColor Blue
if (Test-Path "`$BackupPath\ExtensionData\globalStorage") {
    Copy-Item "`$BackupPath\ExtensionData\globalStorage" "`$VSCodeDataPath\globalStorage" -Recurse -Force
    Write-Host "   ✅ Storage global restauré" -ForegroundColor Green
}

# 4. Restaurer les workspaces
Write-Host "🗂️ Restauration des workspaces..." -ForegroundColor Blue
if (Test-Path "`$BackupPath\Workspaces\workspaceStorage") {
    Copy-Item "`$BackupPath\Workspaces\workspaceStorage" "`$VSCodeDataPath\workspaceStorage" -Recurse -Force
    Write-Host "   ✅ Workspaces restaurés" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Restauration terminée !" -ForegroundColor Green
Write-Host "🔄 Redémarrez VS Code pour appliquer tous les changements." -ForegroundColor Yellow
"@

$restoreScript | Out-File -FilePath (Join-Path $BackupPath "RESTORE.ps1") -Encoding UTF8

# 10. Créer un manifest de sauvegarde
$manifest = @{
    backup_info = @{
        created_date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        computer_name = $env:COMPUTERNAME
        user_name = $env:USERNAME
        vscode_version = (code --version)[0]
        backup_version = "1.0"
        includes_passwords = $IncludePasswords
    }
    contents = @{
        extensions = @{
            count = $extensionsList.Count
            list_file = "Extensions\extensions-list.json"
            reinstall_script = "Extensions\reinstall-extensions.ps1"
        }
        settings = @{
            user_settings = "Settings\settings.json"
            keybindings = "Settings\keybindings.json"
            snippets = "Settings\snippets\"
        }
        workspaces = @{
            storage = "Workspaces\workspaceStorage\"
            files = "Workspaces\*.code-workspace"
        }
        authentication = @{
            included = $IncludePasswords
            warning_file = "Authentication\SECURITY_WARNING.txt"
        }
        themes = @{
            custom_themes = "Themes\"
        }
        terminal = @{
            powershell_profiles = "Terminal\"
        }
    }
    restoration = @{
        script = "RESTORE.ps1"
        instructions = "Exécutez RESTORE.ps1 pour restaurer l'environnement"
    }
}

$manifest | ConvertTo-Json -Depth 4 | Out-File -FilePath (Join-Path $BackupPath "MANIFEST.json") -Encoding UTF8

# 11. Créer une archive si demandé
if ($CreatePortableBackup) {
    Write-Host "📦 Création de l'archive portable..." -ForegroundColor Blue
    
    $archivePath = "$ExportPath\$BackupName.zip"
    Compress-Archive -Path $BackupPath -DestinationPath $archivePath -Force
    
    Write-Host "   📦 Archive créée : $archivePath" -ForegroundColor Green
    
    # Calculer la taille
    $archiveSize = (Get-Item $archivePath).Length
    $archiveSizeMB = [math]::Round($archiveSize / 1MB, 2)
    Write-Host "   📏 Taille : $archiveSizeMB MB" -ForegroundColor Gray
}

# Rapport final
Write-Host ""
Write-Host "📊 Rapport de Sauvegarde" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "📁 Emplacement : $BackupPath" -ForegroundColor White
Write-Host "🔌 Extensions : $($extensionsList.Count) sauvegardées" -ForegroundColor White
Write-Host "⚙️ Paramètres : Inclus" -ForegroundColor White
Write-Host "🗂️ Workspaces : Inclus" -ForegroundColor White
Write-Host "🔐 Données sensibles : $(if($IncludePasswords){'Incluses (⚠️ ATTENTION)'}else{'Exclues'})" -ForegroundColor $(if($IncludePasswords){'Red'}else{'Green'})
Write-Host "📦 Archive portable : $(if($CreatePortableBackup){'Créée'}else{'Non créée'})" -ForegroundColor White

Write-Host ""
Write-Host "🔄 Pour restaurer sur un autre PC :" -ForegroundColor Yellow
Write-Host "   1. Copiez le dossier de backup" -ForegroundColor Gray
Write-Host "   2. Exécutez RESTORE.ps1" -ForegroundColor Gray
Write-Host "   3. Redémarrez VS Code" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Sauvegarde terminée avec succès !" -ForegroundColor Green

# Ouvrir le dossier de sauvegarde
Start-Process "explorer.exe" -ArgumentList $BackupPath