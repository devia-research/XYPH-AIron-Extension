# ============================================================
# Lanceur Rapide - Extension AI Script Commander
# ============================================================

param(
    [switch]$Test,
    [switch]$OpenChrome,
    [switch]$ShowInfo,
    [switch]$Help
)

$extensionPath = "f:\Git\XYPH-Project\extension"

function Write-Header {
    param([string]$Text)
    Write-Host "`n$('=' * 80)" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "$('=' * 80)`n" -ForegroundColor Cyan
}

function Show-Help {
    Write-Header "AI SCRIPT COMMANDER - LANCEUR RAPIDE"
    
    Write-Host @"
USAGE:
    .\launch-extension.ps1 [OPTIONS]

OPTIONS:
    -Test         Exécuter les tests de validation
    -OpenChrome   Ouvrir la page des extensions Chrome
    -ShowInfo     Afficher les informations de l'extension
    -Help         Afficher cette aide

EXEMPLES:
    .\launch-extension.ps1 -Test
    .\launch-extension.ps1 -OpenChrome
    .\launch-extension.ps1 -ShowInfo

CHEMIN DE L'EXTENSION:
    $extensionPath

INSTRUCTIONS DE CHARGEMENT MANUEL:
    1. Ouvrir Chrome/Edge
    2. Aller à: chrome://extensions/
    3. Activer "Mode développeur"
    4. Cliquer "Charger l'extension non empaquetée"
    5. Sélectionner: $extensionPath

"@
}

function Test-Extension {
    Write-Header "TESTS DE VALIDATION"
    
    if (Test-Path ".\scripts\testing\test-extension-final.ps1") {
        & ".\scripts\testing\test-extension-final.ps1"
    } else {
        Write-Host "❌ Script de test non trouvé" -ForegroundColor Red
    }
}

function Open-ChromeExtensions {
    Write-Header "OUVERTURE DE CHROME EXTENSIONS"
    
    Write-Host "🌐 Tentative d'ouverture de chrome://extensions/..." -ForegroundColor Yellow
    
    # Tenter d'ouvrir Chrome
    $chromePaths = @(
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    )
    
    $edgePaths = @(
        "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
    )
    
    $browserFound = $false
    
    # Essayer Chrome
    foreach ($path in $chromePaths) {
        if (Test-Path $path) {
            Write-Host "✅ Chrome trouvé: $path" -ForegroundColor Green
            Start-Process $path -ArgumentList "chrome://extensions/"
            $browserFound = $true
            break
        }
    }
    
    # Si Chrome non trouvé, essayer Edge
    if (-not $browserFound) {
        foreach ($path in $edgePaths) {
            if (Test-Path $path) {
                Write-Host "✅ Edge trouvé: $path" -ForegroundColor Green
                Start-Process $path -ArgumentList "edge://extensions/"
                $browserFound = $true
                break
            }
        }
    }
    
    if (-not $browserFound) {
        Write-Host "❌ Aucun navigateur trouvé" -ForegroundColor Red
        Write-Host "Ouvrez manuellement chrome://extensions/ ou edge://extensions/" -ForegroundColor Yellow
    } else {
        Write-Host "`n📋 INSTRUCTIONS:" -ForegroundColor Cyan
        Write-Host "1. Activer 'Mode développeur' (coin supérieur droit)" -ForegroundColor White
        Write-Host "2. Cliquer 'Charger l'extension non empaquetée'" -ForegroundColor White
        Write-Host "3. Sélectionner: $extensionPath" -ForegroundColor White
    }
}

function Show-ExtensionInfo {
    Write-Header "INFORMATIONS DE L'EXTENSION"
    
    if (-not (Test-Path "$extensionPath\manifest.json")) {
        Write-Host "❌ Manifest.json non trouvé" -ForegroundColor Red
        return
    }
    
    try {
        $manifest = Get-Content "$extensionPath\manifest.json" -Raw | ConvertFrom-Json
        
        Write-Host "📦 NOM:              " -NoNewline -ForegroundColor Yellow
        Write-Host $manifest.name -ForegroundColor White
        
        Write-Host "🔢 VERSION:          " -NoNewline -ForegroundColor Yellow
        Write-Host $manifest.version -ForegroundColor White
        
        Write-Host "📋 DESCRIPTION:      " -NoNewline -ForegroundColor Yellow
        Write-Host $manifest.description -ForegroundColor White
        
        Write-Host "🔧 MANIFEST VERSION: " -NoNewline -ForegroundColor Yellow
        Write-Host $manifest.manifest_version -ForegroundColor White
        
        Write-Host "`n🔑 PERMISSIONS:" -ForegroundColor Cyan
        foreach ($perm in $manifest.permissions) {
            Write-Host "  ✅ $perm" -ForegroundColor Green
        }
        
        Write-Host "`n🌐 HOST PERMISSIONS:" -ForegroundColor Cyan
        foreach ($hostPerm in $manifest.host_permissions) {
            Write-Host "  ✅ $hostPerm" -ForegroundColor Green
        }
        
        Write-Host "`n📂 STRUCTURE:" -ForegroundColor Cyan
        Write-Host "  Background:    $($manifest.background.service_worker)" -ForegroundColor White
        Write-Host "  Popup:         $($manifest.action.default_popup)" -ForegroundColor White
        Write-Host "  Side Panel:    $($manifest.side_panel.default_path)" -ForegroundColor White
        
        Write-Host "`n📁 CHEMIN COMPLET:" -ForegroundColor Cyan
        Write-Host "  $extensionPath" -ForegroundColor White
        
        # Statistiques de fichiers
        Write-Host "`n📊 STATISTIQUES:" -ForegroundColor Cyan
        
        $jsFiles = Get-ChildItem -Path $extensionPath -Filter "*.js" -Recurse | Where-Object { $_.FullName -notmatch "node_modules" }
        $jsLines = ($jsFiles | ForEach-Object { (Get-Content $_.FullName).Count } | Measure-Object -Sum).Sum
        
        Write-Host "  Fichiers JS:   $($jsFiles.Count) ($jsLines lignes)" -ForegroundColor White
        
        $htmlFiles = Get-ChildItem -Path $extensionPath -Filter "*.html" -Recurse
        Write-Host "  Fichiers HTML: $($htmlFiles.Count)" -ForegroundColor White
        
        $cssFiles = Get-ChildItem -Path $extensionPath -Filter "*.css" -Recurse
        Write-Host "  Fichiers CSS:  $($cssFiles.Count)" -ForegroundColor White
        
        $iconFiles = Get-ChildItem -Path "$extensionPath\icons" -Filter "*.png" -ErrorAction SilentlyContinue
        Write-Host "  Icônes PNG:    $($iconFiles.Count)" -ForegroundColor White
        
        # Vérifier si prêt
        Write-Host "`n✅ STATUT: " -NoNewline -ForegroundColor Cyan
        Write-Host "PRÊT ET OPÉRATIONNEL" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Erreur lors de la lecture du manifest" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Yellow
    }
}

function Show-QuickStart {
    Write-Header "DÉMARRAGE RAPIDE"
    
    Write-Host @"
🚀 ÉTAPES POUR UTILISER L'EXTENSION:

1️⃣  CHARGER L'EXTENSION
   - Ouvrir Chrome/Edge
   - Aller à chrome://extensions/
   - Activer "Mode développeur"
   - Charger l'extension depuis: $extensionPath

2️⃣  CONFIGURATION
   - Cliquer sur l'icône de l'extension
   - Aller dans Paramètres
   - (Optionnel) Ajouter votre clé API DeepSeek

3️⃣  UTILISATION
   - Clic droit sur l'icône → "Ouvrir le panneau latéral"
   - Choisir le type de script (PowerShell, Python, etc.)
   - Utiliser les boutons IA pour générer/optimiser du code

📚 DOCUMENTATION:
   - Guide complet: f:\Git\XYPH-Project\EXTENSION_READY.md
   - Tests: .\scripts\testing\test-extension-final.ps1

"@
}

# ============================================================
# MENU PRINCIPAL
# ============================================================

if ($Help) {
    Show-Help
    exit 0
}

if ($Test) {
    Test-Extension
    exit 0
}

if ($OpenChrome) {
    Open-ChromeExtensions
    exit 0
}

if ($ShowInfo) {
    Show-ExtensionInfo
    exit 0
}

# Menu interactif si aucun paramètre
Write-Header "AI SCRIPT COMMANDER - MENU PRINCIPAL"

Write-Host "Que voulez-vous faire?`n" -ForegroundColor Yellow

Write-Host "1. " -NoNewline -ForegroundColor Cyan
Write-Host "Afficher les informations de l'extension"

Write-Host "2. " -NoNewline -ForegroundColor Cyan
Write-Host "Exécuter les tests de validation"

Write-Host "3. " -NoNewline -ForegroundColor Cyan
Write-Host "Ouvrir Chrome Extensions"

Write-Host "4. " -NoNewline -ForegroundColor Cyan
Write-Host "Afficher le guide de démarrage rapide"

Write-Host "5. " -NoNewline -ForegroundColor Cyan
Write-Host "Ouvrir le dossier de l'extension"

Write-Host "6. " -NoNewline -ForegroundColor Cyan
Write-Host "Quitter"

Write-Host ""
$choice = Read-Host "Votre choix (1-6)"

switch ($choice) {
    "1" { Show-ExtensionInfo }
    "2" { Test-Extension }
    "3" { Open-ChromeExtensions }
    "4" { Show-QuickStart }
    "5" { 
        Write-Host "`n📂 Ouverture du dossier..." -ForegroundColor Yellow
        explorer.exe $extensionPath
    }
    "6" { 
        Write-Host "`n👋 Au revoir!" -ForegroundColor Green
        exit 0
    }
    default { 
        Write-Host "`n❌ Choix invalide" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✨ Terminé!`n" -ForegroundColor Green
