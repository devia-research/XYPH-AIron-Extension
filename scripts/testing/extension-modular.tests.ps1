# 🧪 Tests Extension Chrome XYPH - Structure Modulaire
# Tests adaptés pour la nouvelle organisation modulaire

param(
    [switch]$Verbose,
    [string]$OutputFile = "test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
)

$ErrorActionPreference = "Stop"

# Configuration des chemins modulaires
$PROJECT_ROOT = "../.."
$EXTENSION_PATH = "$PROJECT_ROOT\extension"
$CORE_PATH = "$EXTENSION_PATH\core"
$UI_PATH = "$EXTENSION_PATH\ui"
$CONFIG_PATH = "$PROJECT_ROOT\config\extension"
$TESTS_RESULTS_PATH = "$PROJECT_ROOT\tests\results"

# Structure pour les résultats
$testResults = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    totalTests = 0
    passedTests = 0
    failedTests = 0
    structure = "modular"
    tests = @()
    recommendations = @()
    failed = @()
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    
    $colorMap = @{
        'Red' = 'Red'; 'Green' = 'Green'; 'Yellow' = 'Yellow'
        'Blue' = 'Blue'; 'Magenta' = 'Magenta'; 'Cyan' = 'Cyan'
        'White' = 'White'
    }
    
    Write-Host $Message -ForegroundColor $colorMap[$Color]
}

function Test-Assert {
    param(
        [bool]$Condition,
        [string]$TestName,
        [string]$Details = "",
        [string]$SuccessMessage = "",
        [string]$FailureMessage = ""
    )
    
    $testResults.totalTests++
    
    if ($Condition) {
        $testResults.passedTests++
        $status = "✅"
        $color = "Green"
        $message = if ($SuccessMessage) { $SuccessMessage } else { $TestName }
    } else {
        $testResults.failedTests++
        $status = "❌"
        $color = "Red"
        $message = if ($FailureMessage) { $FailureMessage } else { $TestName }
        $testResults.failed += $TestName + $(if ($Details) { ": $Details" } else { "" })
    }
    
    Write-ColorOutput "   $status $message" $color
    if ($Verbose -and $Details) {
        Write-ColorOutput "      $Details" "Blue"
    }
    
    $testResults.tests += @{
        name = $TestName
        passed = $Condition
        details = $Details
    }
}

Write-ColorOutput "🧪 Tests Extension Chrome XYPH - Structure Modulaire" "Magenta"
Write-ColorOutput "====================================================" "Magenta"

Write-ColorOutput "`n📂 Test de la structure modulaire..." "Cyan"

# Tests de la structure de base
$requiredDirs = @{
    "Extension Core" = $CORE_PATH
    "Extension UI" = $UI_PATH
    "Extension UI Popup" = "$UI_PATH\popup"
    "Extension UI Sidebar" = "$UI_PATH\sidebar"
    "Extension UI Styles" = "$UI_PATH\styles"
    "Config Extension" = $CONFIG_PATH
}

foreach ($dirName in $requiredDirs.Keys) {
    $dirPath = $requiredDirs[$dirName]
    Test-Assert -Condition (Test-Path $dirPath) -TestName "Dossier $dirName" -Details $dirPath
}

Write-ColorOutput "`n📄 Test des fichiers essentiels..." "Cyan"

# Tests des fichiers dans la nouvelle structure
$essentialFiles = @{
    "manifest.json" = "$CORE_PATH\manifest.json"
    "background.js" = "$CORE_PATH\background.js"
    "content.js" = "$CORE_PATH\content.js"
    "popup.html" = "$UI_PATH\popup\popup.html"
    "popup.js" = "$UI_PATH\popup\popup.js"
    "sidebar.html" = "$UI_PATH\sidebar\sidebar.html"
    "sidebar.js" = "$UI_PATH\sidebar\sidebar.js"
    "content.css" = "$UI_PATH\styles\content.css"
}

foreach ($fileName in $essentialFiles.Keys) {
    $filePath = $essentialFiles[$fileName]
    Test-Assert -Condition (Test-Path $filePath) -TestName "$fileName existe" -Details "Module: $(Split-Path (Split-Path $filePath -Parent) -Leaf)"
}

Write-ColorOutput "`n📋 Test du manifest.json..." "Cyan"

$manifestPath = "$CORE_PATH\manifest.json"
if (Test-Path $manifestPath) {
    try {
        $manifest = Get-Content $manifestPath | ConvertFrom-Json
        
        Test-Assert -Condition ($manifest.manifest_version -eq 3) -TestName "Manifest version 3"
        Test-Assert -Condition ($manifest.name) -TestName "Nom de l'extension défini"
        Test-Assert -Condition ($manifest.version) -TestName "Version définie"
        Test-Assert -Condition ($manifest.permissions -contains "activeTab") -TestName "Permission activeTab"
        Test-Assert -Condition ($manifest.action) -TestName "Action définie"
        
    } catch {
        Test-Assert -Condition $false -TestName "Manifest JSON valide" -Details $_.Exception.Message
    }
} else {
    $testResults.recommendations += "Créer le fichier manifest.json dans $CORE_PATH"
}

Write-ColorOutput "`n📜 Test du JavaScript modulaire..." "Cyan"

# Tests JavaScript avec nouveaux chemins
$jsFiles = @{
    "background.js" = "$CORE_PATH\background.js"
    "sidebar.js" = "$UI_PATH\sidebar\sidebar.js"
    "popup.js" = "$UI_PATH\popup\popup.js"
}

foreach ($jsName in $jsFiles.Keys) {
    $jsPath = $jsFiles[$jsName]
    if (Test-Path $jsPath) {
        $content = Get-Content $jsPath -Raw
        
        Test-Assert -Condition ($content -like "*chrome.*") -TestName "$jsName utilise Chrome API"
        
        if ($jsName -eq "background.js") {
            Test-Assert -Condition ($content -like "*chrome.action*") -TestName "background.js utilise chrome.action"
            Test-Assert -Condition ($content -notlike "*chrome.browserAction*") -TestName "background.js n'utilise pas l'ancienne API"
        }
        
        if ($jsName -eq "sidebar.js") {
            Test-Assert -Condition ($content -like "*showChatInterface*" -or $content -like "*chat*") -TestName "Fonction chat présente dans sidebar.js"
        }
        
        if ($jsName -eq "popup.js") {
            Test-Assert -Condition ($content -like "*DOMContentLoaded*") -TestName "popup.js gère DOMContentLoaded"
        }
    } else {
        Test-Assert -Condition $false -TestName "$jsName accessible" -Details "Chemin: $jsPath"
    }
}

Write-ColorOutput "`n🌐 Test des fichiers HTML modulaires..." "Cyan"

$htmlFiles = @{
    "popup.html" = "$UI_PATH\popup\popup.html"
    "sidebar.html" = "$UI_PATH\sidebar\sidebar.html"
}

foreach ($htmlName in $htmlFiles.Keys) {
    $htmlPath = $htmlFiles[$htmlName]
    if (Test-Path $htmlPath) {
        $content = Get-Content $htmlPath -Raw
        
        Test-Assert -Condition ($content -like "*<html*") -TestName "$htmlName structure HTML valide"
        Test-Assert -Condition ($content -like "*<title*") -TestName "$htmlName a un titre"
        
        $jsReference = $htmlName.Replace(".html", ".js")
        Test-Assert -Condition ($content -like "*$jsReference*") -TestName "$htmlName référence $jsReference"
    } else {
        Test-Assert -Condition $false -TestName "$htmlName accessible" -Details "Chemin: $htmlPath"
    }
}

Write-ColorOutput "`n📏 Test de la taille des fichiers..." "Cyan"

foreach ($fileName in $essentialFiles.Keys) {
    $filePath = $essentialFiles[$fileName]
    if (Test-Path $filePath) {
        $size = (Get-Item $filePath).Length
        Test-Assert -Condition ($size -gt 0) -TestName "$fileName non vide" -Details "$size bytes"
        Test-Assert -Condition ($size -lt 1MB) -TestName "$fileName taille raisonnable" -Details "$([math]::Round($size/1KB, 2)) KB"
    }
}

Write-ColorOutput "`n🔍 Test de syntaxe JSON..." "Cyan"

# Test des fichiers JSON dans la nouvelle structure
$jsonFiles = Get-ChildItem -Path $PROJECT_ROOT -Recurse -Filter "*.json" | Where-Object { $_.Name -notlike "test-results*" }

foreach ($file in $jsonFiles) {
    try {
        $content = Get-Content $file.FullName | ConvertFrom-Json
        Test-Assert -Condition $true -TestName "$($file.Name) syntaxe JSON valide"
    } catch {
        Test-Assert -Condition $false -TestName "$($file.Name) syntaxe JSON valide" -Details $_.Exception.Message
    }
}

Write-ColorOutput "`n🔒 Test de sécurité modulaire..." "Cyan"

if (Test-Path $manifestPath) {
    $manifest = Get-Content $manifestPath | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($manifest) {
        $dangerousPermissions = @("tabs", "history", "bookmarks", "<all_urls>")
        $hasPermissions = $manifest.permissions -ne $null
        
        if ($hasPermissions) {
            $dangerous = $manifest.permissions | Where-Object { $_ -in $dangerousPermissions }
            Test-Assert -Condition ($dangerous.Count -eq 0) -TestName "Aucune permission dangereuse"
        }
        
        Test-Assert -Condition ($manifest.permissions -contains "storage") -TestName "Permission storage présente"
    }
}

Write-ColorOutput "`n🤖 Test configuration XYPH modulaire..." "Cyan"

# Vérifier la présence de références XYPH dans les bons modules
$xyphFiles = Get-ChildItem -Path $EXTENSION_PATH -Recurse -Include "*.js", "*.html" -ErrorAction SilentlyContinue

$xyphFound = $false
$creativityFound = $false

foreach ($file in $xyphFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -like "*XYPH*" -or $content -like "*xyph*") {
        $xyphFound = $true
    }
    if ($content -like "*creative*" -or $content -like "*Creative*") {
        $creativityFound = $true
    }
}

Test-Assert -Condition $xyphFound -TestName "Référence XYPH présente"
Test-Assert -Condition $creativityFound -TestName "Aspects créatifs présents"

# Calcul du taux de réussite
$successRate = [math]::Round(($testResults.passedTests / $testResults.totalTests) * 100, 1)

Write-ColorOutput "`n📊 Résultats des tests:" "Magenta"
Write-ColorOutput "======================" "Magenta"
Write-ColorOutput "✅ Tests réussis: $($testResults.passedTests)" "Green"
Write-ColorOutput "❌ Tests échoués: $($testResults.failedTests)" "Red"
Write-ColorOutput "📈 Taux de réussite: $successRate%" $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

if ($testResults.failedTests -gt 0) {
    Write-ColorOutput "`n❌ Détails des échecs:" "Red"
    foreach ($failure in $testResults.failed) {
        Write-ColorOutput "   • $failure" "Red"
    }
}

Write-ColorOutput "`n💡 Recommandations:" "Blue"
if ($successRate -ge 90) {
    Write-ColorOutput "🎉 Excellent ! Structure modulaire opérationnelle." "Green"
    $testResults.recommendations += "Structure modulaire bien organisée"
} elseif ($successRate -ge 70) {
    Write-ColorOutput "✅ Bonne structure, quelques ajustements mineurs nécessaires." "Yellow"
    $testResults.recommendations += "Corriger les problèmes mineurs identifiés"
} else {
    Write-ColorOutput "🚨 Problèmes significatifs dans la structure modulaire." "Red"
    $testResults.recommendations += "Restructuration nécessaire - vérifier l'organisation des modules"
}

# Recommandations spécifiques à la structure modulaire
if ($testResults.failedTests -gt 0) {
    $testResults.recommendations += "Vérifier que tous les fichiers sont dans les bons modules"
    $testResults.recommendations += "Utiliser les chemins relatifs corrects pour la structure modulaire"
}

# Sauvegarder les résultats
$testResults.successRate = $successRate

# Créer le dossier de résultats s'il n'existe pas
if (-not (Test-Path $TESTS_RESULTS_PATH)) {
    New-Item -ItemType Directory -Path $TESTS_RESULTS_PATH -Force | Out-Null
}

$outputPath = Join-Path $TESTS_RESULTS_PATH $OutputFile
$testResults | ConvertTo-Json -Depth 3 | Set-Content $outputPath -Encoding UTF8

Write-ColorOutput "📁 Rapport sauvegardé: $outputPath" "Blue"

# Code de sortie basé sur le taux de réussite
if ($successRate -lt 70) {
    exit 1
} else {
    exit 0
}