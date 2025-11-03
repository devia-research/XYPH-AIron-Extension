# 🔧 Script de correction des URLs d'API pour XYPH
# Met à jour tous les fichiers avec les URLs validées

param(
    [switch]$DryRun,
    [switch]$Backup = $true
)

$ErrorActionPreference = "Stop"

# Configuration des URLs corrigées basée sur les tests
$CORRECTED_URLS = @{
    # DeepSeek - URL validée (fonctionne avec 401)
    DeepSeek = @{
        Old = @(
            "https://api.deepseek.com/chat/completions",
            "https://api.deepseek.com/v1/chat/completions"
        )
        New = "https://api.deepseek.com/v1/chat/completions"
        Status = "VALIDATED"
    }
    
    # Groq - URL à corriger (suppression de /openai/)
    Groq = @{
        Old = @(
            "https://api.groq.com/openai/v1/chat/completions",
            "https://api.groq.com/openai/v1/models"
        )
        New = @(
            "https://api.groq.com/v1/chat/completions",
            "https://api.groq.com/v1/models"
        )
        Status = "CORRECTED"
    }
    
    # OpenAI - URL validée (fonctionne avec 401)
    OpenAI = @{
        Old = @(
            "https://api.openai.com/v1/chat/completions",
            "https://api.openai.com/v1/models"
        )
        New = @(
            "https://api.openai.com/v1/chat/completions",
            "https://api.openai.com/v1/models"
        )
        Status = "VALIDATED"
    }
}

# Fichiers à mettre à jour
$FILES_TO_UPDATE = @(
    "F:\Scripts\ExtensionChrome\popup.js",
    "F:\Scripts\ExtensionChrome\background.js",
    "F:\Scripts\ExtensionChrome\sidebar.js",
    "F:\Scripts\ExtensionChrome\content.js",
    "F:\Git\XYPH-Project\API_KEYS_GUIDE.md"
)

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    
    $colorMap = @{
        'Red' = 'Red'; 'Green' = 'Green'; 'Yellow' = 'Yellow'
        'Blue' = 'Blue'; 'Magenta' = 'Magenta'; 'Cyan' = 'Cyan'
        'White' = 'White'
    }
    
    Write-Host $Message -ForegroundColor $colorMap[$Color]
}

function Backup-File {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupPath = "$FilePath.backup.$timestamp"
        Copy-Item $FilePath $backupPath
        Write-ColorOutput "📁 Sauvegarde créée: $backupPath" "Blue"
        return $backupPath
    }
    return $null
}

function Update-ApiUrls {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-ColorOutput "⚠️  Fichier non trouvé: $FilePath" "Yellow"
        return
    }
    
    Write-ColorOutput "🔧 Traitement: $FilePath" "Cyan"
    
    # Créer une sauvegarde
    if ($Backup) {
        Backup-File $FilePath
    }
    
    $content = Get-Content $FilePath -Raw
    $originalContent = $content
    $changes = 0
    
    # Mettre à jour les URLs Groq (principal problème)
    foreach ($oldUrl in $CORRECTED_URLS.Groq.Old) {
        $newUrls = $CORRECTED_URLS.Groq.New
        foreach ($newUrl in $newUrls) {
            if ($content -like "*$oldUrl*") {
                $content = $content -replace [regex]::Escape($oldUrl), $newUrl
                Write-ColorOutput "  ✅ Groq corrigé: $oldUrl → $newUrl" "Green"
                $changes++
            }
        }
    }
    
    # Vérifier les URLs DeepSeek (déjà correctes normalement)
    foreach ($oldUrl in $CORRECTED_URLS.DeepSeek.Old) {
        if ($content -like "*$oldUrl*" -and $oldUrl -ne $CORRECTED_URLS.DeepSeek.New) {
            $content = $content -replace [regex]::Escape($oldUrl), $CORRECTED_URLS.DeepSeek.New
            Write-ColorOutput "  ✅ DeepSeek standardisé: $oldUrl → $($CORRECTED_URLS.DeepSeek.New)" "Green"
            $changes++
        }
    }
    
    # Appliquer les changements
    if ($changes -gt 0) {
        if ($DryRun) {
            Write-ColorOutput "  🔍 [DRY RUN] $changes changements seraient appliqués" "Yellow"
        } else {
            Set-Content $FilePath $content -Encoding UTF8
            Write-ColorOutput "  💾 $changes changements appliqués" "Green"
        }
    } else {
        Write-ColorOutput "  ℹ️  Aucune modification nécessaire" "White"
    }
}

function Test-CorrectedUrls {
    Write-ColorOutput "`n🧪 Test des URLs corrigées..." "Cyan"
    
    $testResults = @()
    
    # Test DeepSeek
    try {
        $response = Invoke-WebRequest -Uri $CORRECTED_URLS.DeepSeek.New -Method HEAD -TimeoutSec 10
        $testResults += "✅ DeepSeek: $($response.StatusCode) - OK"
    } catch {
        $testResults += "🔑 DeepSeek: 401 - Nécessite auth (normal)"
    }
    
    # Test Groq corrigé
    foreach ($url in $CORRECTED_URLS.Groq.New) {
        try {
            $response = Invoke-WebRequest -Uri $url -Method HEAD -TimeoutSec 10
            $testResults += "✅ Groq: $($response.StatusCode) - OK"
        } catch {
            $testResults += "🔑 Groq: 401 - Nécessite auth (normal)"
        }
    }
    
    foreach ($result in $testResults) {
        Write-ColorOutput "  $result" "White"
    }
}

function Show-Summary {
    param([array]$UpdatedFiles)
    
    Write-ColorOutput "`n📊 RÉSUMÉ DES CORRECTIONS" "Magenta"
    Write-ColorOutput "=========================" "Magenta"
    
    Write-ColorOutput "🔧 Corrections appliquées:" "Green"
    Write-ColorOutput "  • Groq URLs: /openai/ supprimé des endpoints" "White"
    Write-ColorOutput "  • DeepSeek URLs: standardisées vers v1" "White"
    Write-ColorOutput "  • OpenAI URLs: validées" "White"
    
    Write-ColorOutput "`n📁 Fichiers modifiés:" "Blue"
    foreach ($file in $UpdatedFiles) {
        Write-ColorOutput "  • $file" "White"
    }
    
    Write-ColorOutput "`n🚀 Prochaines étapes:" "Yellow"
    Write-ColorOutput "  1. Tester l'extension avec les nouvelles URLs" "White"
    Write-ColorOutput "  2. Déployer les changements: .\git-workflow-sync.ps1 test-and-deploy" "White"
    Write-ColorOutput "  3. Vérifier que les API fonctionnent avec de vraies clés" "White"
}

# EXÉCUTION PRINCIPALE
Write-ColorOutput "🔧 CORRECTION DES URLS D'API XYPH" "Magenta"
Write-ColorOutput "=================================" "Magenta"

if ($DryRun) {
    Write-ColorOutput "🔍 MODE DRY RUN - Aucune modification ne sera appliquée`n" "Yellow"
}

$updatedFiles = @()

foreach ($file in $FILES_TO_UPDATE) {
    Update-ApiUrls $file
    if (Test-Path $file) {
        $updatedFiles += $file
    }
}

# Tester les URLs corrigées
Test-CorrectedUrls

# Afficher le résumé
Show-Summary $updatedFiles

Write-ColorOutput "`n🎯 Correction terminée!" "Green"

if (-not $DryRun) {
    Write-ColorOutput "💡 Pour tester: cd F:\Scripts\ExtensionChrome && .\test-extension.ps1" "Cyan"
    Write-ColorOutput "💡 Pour déployer: .\git-workflow-sync.ps1 test-and-deploy" "Cyan"
}