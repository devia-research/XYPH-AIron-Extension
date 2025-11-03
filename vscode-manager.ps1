# 🚀 VS Code Environment Manager - Export/Import Complet
# Interface complète pour sauvegarder et restaurer l'environnement VS Code

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("export", "import", "interactive")]
    [string]$Action = "interactive",
    
    [Parameter(Mandatory=$false)]
    [string]$BackupPath = "F:\VSCode-Backup",
    
    [Parameter(Mandatory=$false)]
    [switch]$IncludeSecrets = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$CreatePortable = $false
)

function Show-Menu {
    Clear-Host
    Write-Host "🚀 VS Code Environment Manager" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Choisissez une action :" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. 📦 Export Complet (Extensions + Paramètres)" -ForegroundColor White
    Write-Host "2. 🔐 Export Sécurisé (+ Mots de passe/Tokens)" -ForegroundColor Red
    Write-Host "3. 📱 Export Portable (Archive ZIP)" -ForegroundColor Green
    Write-Host "4. 🔄 Import/Restauration" -ForegroundColor Blue
    Write-Host "5. 📊 Analyse de l'environnement actuel" -ForegroundColor Magenta
    Write-Host "6. ❌ Quitter" -ForegroundColor Gray
    Write-Host ""
    
    do {
        $choice = Read-Host "Votre choix (1-6)"
    } while ($choice -notmatch '^[1-6]$')
    
    return $choice
}

function Show-EnvironmentAnalysis {
    Write-Host "📊 Analyse de l'environnement VS Code actuel" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Extensions installées
    $extensions = code --list-extensions 2>$null
    Write-Host "🔌 Extensions installées : $($extensions.Count)" -ForegroundColor Blue
    
    # Top 10 des extensions
    if ($extensions.Count -gt 0) {
        Write-Host "   Top extensions :" -ForegroundColor Gray
        $extensions | Select-Object -First 10 | ForEach-Object {
            Write-Host "   • $_" -ForegroundColor DarkGray
        }
        if ($extensions.Count -gt 10) {
            Write-Host "   ... et $($extensions.Count - 10) autres" -ForegroundColor DarkGray
        }
    }
    
    Write-Host ""
    
    # Paramètres
    $settingsPath = "$env:APPDATA\Code\User\settings.json"
    if (Test-Path $settingsPath) {
        $settings = Get-Content $settingsPath | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($settings) {
            $settingsCount = $settings.PSObject.Properties.Count
            Write-Host "⚙️ Paramètres personnalisés : $settingsCount" -ForegroundColor Blue
        }
    } else {
        Write-Host "⚙️ Paramètres : Fichier non trouvé" -ForegroundColor Yellow
    }
    
    # Workspaces
    $workspaceStorage = "$env:APPDATA\Code\User\workspaceStorage"
    if (Test-Path $workspaceStorage) {
        $workspaces = Get-ChildItem $workspaceStorage -Directory
        Write-Host "🗂️ Workspaces sauvegardés : $($workspaces.Count)" -ForegroundColor Blue
    }
    
    # Thèmes
    $extensionsPath = "$env:USERPROFILE\.vscode\extensions"
    if (Test-Path $extensionsPath) {
        $themes = Get-ChildItem $extensionsPath -Directory | Where-Object { $_.Name -match "theme|icon" }
        Write-Host "🎨 Thèmes/Icônes installés : $($themes.Count)" -ForegroundColor Blue
    }
    
    # Estimation de la taille du backup
    $estimatedSize = 0
    if (Test-Path $extensionsPath) {
        $estimatedSize += (Get-ChildItem $extensionsPath -Recurse -File | Measure-Object -Property Length -Sum).Sum
    }
    if (Test-Path "$env:APPDATA\Code\User") {
        $estimatedSize += (Get-ChildItem "$env:APPDATA\Code\User" -Recurse -File | Measure-Object -Property Length -Sum).Sum
    }
    
    $estimatedSizeMB = [math]::Round($estimatedSize / 1MB, 2)
    Write-Host "📏 Taille estimée du backup : $estimatedSizeMB MB" -ForegroundColor Blue
    
    Write-Host ""
    Write-Host "Appuyez sur Entrée pour continuer..." -ForegroundColor Gray
    Read-Host
}

function Start-CompleteExport {
    param(
        [bool]$IncludeSecrets,
        [bool]$CreatePortable
    )
    
    Write-Host "📦 Démarrage de l'export complet..." -ForegroundColor Cyan
    Write-Host ""
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $exportPath = Join-Path $BackupPath "Complete-Export-$timestamp"
    
    # Export standard
    Write-Host "1️⃣ Export des extensions et paramètres..." -ForegroundColor Blue
    
    & "$PSScriptRoot\export-vscode-config.ps1" -ExportPath $BackupPath -BackupName "Complete-Export-$timestamp" -CreatePortableBackup:$CreatePortable
    
    # Export sécurisé si demandé
    if ($IncludeSecrets) {
        Write-Host ""
        Write-Host "2️⃣ Export des données sensibles..." -ForegroundColor Red
        
        $securePassword = Read-Host "Mot de passe pour chiffrer les données sensibles" -AsSecureString
        
        $secureExportPath = Join-Path $exportPath "Secure"
        
        & "$PSScriptRoot\export-vscode-secrets.ps1" -BackupPath $secureExportPath -MasterPassword $securePassword
    }
    
    Write-Host ""
    Write-Host "✅ Export complet terminé !" -ForegroundColor Green
    Write-Host "📁 Emplacement : $exportPath" -ForegroundColor White
    
    return $exportPath
}

function Start-ImportProcess {
    Write-Host "🔄 Processus d'import/restauration" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Sélection du backup
    Write-Host "Sélectionnez le backup à restaurer :" -ForegroundColor Yellow
    
    if (Test-Path $BackupPath) {
        $backups = Get-ChildItem $BackupPath -Directory | Where-Object { $_.Name -match "Backup|Export" } | Sort-Object CreationTime -Descending
        
        if ($backups.Count -gt 0) {
            Write-Host ""
            for ($i = 0; $i -lt $backups.Count; $i++) {
                $backup = $backups[$i]
                $date = $backup.CreationTime.ToString("yyyy-MM-dd HH:mm")
                Write-Host "$($i + 1). $($backup.Name) ($date)" -ForegroundColor White
            }
            
            Write-Host "0. Parcourir manuellement..." -ForegroundColor Gray
            Write-Host ""
            
            do {
                $choice = Read-Host "Votre choix (0-$($backups.Count))"
            } while ($choice -notmatch "^[0-$($backups.Count)]$")
            
            if ($choice -eq "0") {
                $selectedBackup = Read-Host "Chemin complet vers le dossier de backup"
            } else {
                $selectedBackup = $backups[$choice - 1].FullName
            }
        } else {
            Write-Host "Aucun backup automatique trouvé." -ForegroundColor Yellow
            $selectedBackup = Read-Host "Chemin complet vers le dossier de backup"
        }
    } else {
        $selectedBackup = Read-Host "Chemin complet vers le dossier de backup"
    }
    
    if (-not (Test-Path $selectedBackup)) {
        Write-Host "❌ Backup non trouvé : $selectedBackup" -ForegroundColor Red
        return
    }
    
    Write-Host ""
    Write-Host "📂 Backup sélectionné : $selectedBackup" -ForegroundColor Green
    
    # Vérification du contenu
    $restoreScript = Join-Path $selectedBackup "RESTORE.ps1"
    $secureFolder = Join-Path $selectedBackup "Secure"
    
    if (Test-Path $restoreScript) {
        Write-Host "✅ Script de restauration trouvé" -ForegroundColor Green
        
        $confirm = Read-Host "Lancer la restauration ? (o/n)"
        if ($confirm -eq "o" -or $confirm -eq "O") {
            & $restoreScript
        }
    } else {
        Write-Host "❌ Script de restauration non trouvé" -ForegroundColor Red
    }
    
    # Restauration des données sécurisées
    if (Test-Path $secureFolder) {
        Write-Host ""
        Write-Host "🔐 Données sécurisées détectées" -ForegroundColor Blue
        
        $restoreSecure = Read-Host "Restaurer aussi les données sensibles ? (o/n)"
        if ($restoreSecure -eq "o" -or $restoreSecure -eq "O") {
            $securePassword = Read-Host "Mot de passe de déchiffrement" -AsSecureString
            
            $decryptScript = Join-Path $secureFolder "DECRYPT.ps1"
            if (Test-Path $decryptScript) {
                & $decryptScript -MasterPassword $securePassword
            }
        }
    }
}

function New-QuickBackup {
    Write-Host "⚡ Sauvegarde rapide" -ForegroundColor Yellow
    Write-Host "===================" -ForegroundColor Yellow
    Write-Host ""
    
    $quickName = "Quick-Backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    & "$PSScriptRoot\export-vscode-config.ps1" -ExportPath $BackupPath -BackupName $quickName
    
    Write-Host ""
    Write-Host "✅ Sauvegarde rapide terminée !" -ForegroundColor Green
}

# Menu principal interactif
if ($Action -eq "interactive") {
    do {
        $choice = Show-Menu
        
        switch ($choice) {
            "1" {
                Clear-Host
                New-QuickBackup
                Write-Host ""
                Read-Host "Appuyez sur Entrée pour continuer"
            }
            "2" {
                Clear-Host
                $exportPath = Start-CompleteExport -IncludeSecrets $true -CreatePortable $false
                Write-Host ""
                Read-Host "Appuyez sur Entrée pour continuer"
            }
            "3" {
                Clear-Host
                $exportPath = Start-CompleteExport -IncludeSecrets $false -CreatePortable $true
                Write-Host ""
                Read-Host "Appuyez sur Entrée pour continuer"
            }
            "4" {
                Clear-Host
                Start-ImportProcess
                Write-Host ""
                Read-Host "Appuyez sur Entrée pour continuer"
            }
            "5" {
                Clear-Host
                Show-EnvironmentAnalysis
            }
            "6" {
                Write-Host "Au revoir ! 👋" -ForegroundColor Green
                exit
            }
        }
    } while ($true)
}
elseif ($Action -eq "export") {
    Start-CompleteExport -IncludeSecrets $IncludeSecrets -CreatePortable $CreatePortable
}
elseif ($Action -eq "import") {
    Start-ImportProcess
}

Write-Host ""
Write-Host "📋 Commandes disponibles :" -ForegroundColor Cyan
Write-Host "   .\vscode-manager.ps1                                    # Menu interactif" -ForegroundColor Gray
Write-Host "   .\vscode-manager.ps1 -Action export                     # Export rapide" -ForegroundColor Gray
Write-Host "   .\vscode-manager.ps1 -Action export -IncludeSecrets     # Export sécurisé" -ForegroundColor Gray
Write-Host "   .\vscode-manager.ps1 -Action import                     # Import/Restauration" -ForegroundColor Gray