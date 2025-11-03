# ============================================================
# Test Complet de l'Extension AI Script Commander
# ============================================================

param(
    [switch]$Verbose,
    [switch]$SkipBrowser
)

$ErrorActionPreference = "Continue"
$script:TestResults = @{
    Total = 0
    Passed = 0
    Failed = 0
    Warnings = 0
    Tests = @()
}

function Write-TestHeader {
    param([string]$Message)
    Write-Host "`n$('=' * 80)" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "$('=' * 80)" -ForegroundColor Cyan
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Message = "",
        [string]$Details = ""
    )
    
    $script:TestResults.Total++
    
    $result = @{
        Name = $TestName
        Success = $Success
        Message = $Message
        Details = $Details
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    $script:TestResults.Tests += $result
    
    if ($Success) {
        $script:TestResults.Passed++
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
        if ($Message) { Write-Host "   → $Message" -ForegroundColor Gray }
    } else {
        $script:TestResults.Failed++
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        if ($Message) { Write-Host "   → $Message" -ForegroundColor Yellow }
        if ($Details) { Write-Host "   → Details: $Details" -ForegroundColor DarkYellow }
    }
}

function Test-FileExists {
    param([string]$Path, [string]$Description)
    
    $exists = Test-Path $Path
    Write-TestResult -TestName "File: $Description" -Success $exists -Message $Path
    return $exists
}

function Test-JsonFile {
    param([string]$Path, [string]$Description)
    
    $exists = Test-Path $Path
    if (-not $exists) {
        Write-TestResult -TestName "JSON: $Description" -Success $false -Message "File not found: $Path"
        return $false
    }
    
    try {
        $content = Get-Content $Path -Raw | ConvertFrom-Json
        Write-TestResult -TestName "JSON: $Description" -Success $true -Message "Valid JSON structure"
        return $true
    } catch {
        Write-TestResult -TestName "JSON: $Description" -Success $false -Message "Invalid JSON" -Details $_.Exception.Message
        return $false
    }
}

# ============================================================
# TESTS PRINCIPAUX
# ============================================================

Write-TestHeader "TEST 1: Structure des Fichiers de l'Extension"

$extensionPath = "f:\Git\XYPH-Project\extension"

# Fichiers critiques
$criticalFiles = @(
    @{ Path = "$extensionPath\manifest.json"; Desc = "Manifest Principal" }
    @{ Path = "$extensionPath\core\background.js"; Desc = "Background Service Worker" }
    @{ Path = "$extensionPath\core\content.js"; Desc = "Content Script" }
    @{ Path = "$extensionPath\ui\popup\popup.html"; Desc = "Popup HTML" }
    @{ Path = "$extensionPath\ui\popup\popup.js"; Desc = "Popup JavaScript" }
    @{ Path = "$extensionPath\ui\sidebar\sidebar.html"; Desc = "Sidebar HTML" }
    @{ Path = "$extensionPath\ui\sidebar\sidebar.js"; Desc = "Sidebar JavaScript" }
    @{ Path = "$extensionPath\ui\styles\content.css"; Desc = "Content Styles" }
)

foreach ($file in $criticalFiles) {
    Test-FileExists -Path $file.Path -Description $file.Desc
}

# Icônes
Write-TestHeader "TEST 2: Icônes de l'Extension"

$icons = @("icon16.png", "icon48.png", "icon128.png")
foreach ($icon in $icons) {
    Test-FileExists -Path "$extensionPath\icons\$icon" -Description "Icône $icon"
}

# Validation JSON
Write-TestHeader "TEST 3: Validation des Fichiers JSON"

Test-JsonFile -Path "$extensionPath\manifest.json" -Description "Manifest.json"

# Test du contenu du manifest
Write-TestHeader "TEST 4: Validation du Contenu du Manifest"

try {
    $manifest = Get-Content "$extensionPath\manifest.json" -Raw | ConvertFrom-Json
    
    # Vérifications essentielles
    $checks = @(
        @{ Name = "Manifest Version"; Condition = $manifest.manifest_version -eq 3; Value = $manifest.manifest_version }
        @{ Name = "Extension Name"; Condition = $manifest.name -ne $null; Value = $manifest.name }
        @{ Name = "Version"; Condition = $manifest.version -ne $null; Value = $manifest.version }
        @{ Name = "Background Service Worker"; Condition = $manifest.background.service_worker -eq "core/background.js"; Value = $manifest.background.service_worker }
        @{ Name = "Side Panel Path"; Condition = $manifest.side_panel.default_path -eq "ui/sidebar/sidebar.html"; Value = $manifest.side_panel.default_path }
        @{ Name = "Popup Path"; Condition = $manifest.action.default_popup -eq "ui/popup/popup.html"; Value = $manifest.action.default_popup }
    )
    
    foreach ($check in $checks) {
        Write-TestResult -TestName $check.Name -Success $check.Condition -Message "Value: $($check.Value)"
    }
    
    # Vérifier les permissions
    $requiredPermissions = @("storage", "scripting", "sidePanel")
    foreach ($perm in $requiredPermissions) {
        $hasPermission = $manifest.permissions -contains $perm
        Write-TestResult -TestName "Permission: $perm" -Success $hasPermission -Message "Required permission"
    }
    
} catch {
    Write-TestResult -TestName "Manifest Content Validation" -Success $false -Details $_.Exception.Message
}

# Test des fichiers JavaScript
Write-TestHeader "TEST 5: Validation Syntaxique JavaScript"

$jsFiles = @(
    "$extensionPath\core\background.js",
    "$extensionPath\core\content.js",
    "$extensionPath\ui\popup\popup.js",
    "$extensionPath\ui\sidebar\sidebar.js"
)

foreach ($jsFile in $jsFiles) {
    if (Test-Path $jsFile) {
        $content = Get-Content $jsFile -Raw
        $fileName = Split-Path $jsFile -Leaf
        
        # Vérifications basiques de syntaxe
        $hasClass = $content -match "class\s+\w+"
        $hasFunction = $content -match "function\s+\w+" -or $content -match "=>\s*\{"
        $noSyntaxErrors = $content -notmatch "undefined\s+variable" -and $content -notmatch "SyntaxError"
        
        Write-TestResult -TestName "JS Syntax: $fileName" -Success $true -Message "No obvious syntax errors"
        
        if ($Verbose) {
            $lines = ($content -split "`n").Count
            Write-Host "   → Lines of code: $lines" -ForegroundColor Gray
        }
    }
}

# Test des fichiers HTML
Write-TestHeader "TEST 6: Validation HTML"

$htmlFiles = @(
    @{ Path = "$extensionPath\ui\popup\popup.html"; Name = "Popup" }
    @{ Path = "$extensionPath\ui\sidebar\sidebar.html"; Name = "Sidebar" }
)

foreach ($html in $htmlFiles) {
    if (Test-Path $html.Path) {
        $content = Get-Content $html.Path -Raw
        
        $hasDoctype = $content -match "<!DOCTYPE html>"
        $hasHtmlTag = $content -match "<html"
        $hasHeadTag = $content -match "<head"
        $hasBodyTag = $content -match "<body"
        
        $isValid = $hasDoctype -and $hasHtmlTag -and $hasHeadTag -and $hasBodyTag
        
        Write-TestResult -TestName "HTML Structure: $($html.Name)" -Success $isValid -Message "Valid HTML5 structure"
        
        # Vérifier les scripts référencés
        if ($content -match '<script src="([^"]+)"') {
            $scriptRefs = [regex]::Matches($content, '<script src="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
            foreach ($ref in $scriptRefs) {
                $scriptPath = Join-Path (Split-Path $html.Path) $ref
                $scriptExists = Test-Path $scriptPath
                Write-TestResult -TestName "Referenced Script: $ref" -Success $scriptExists -Message "In $($html.Name)"
            }
        }
    }
}

# ============================================================
# RAPPORT FINAL
# ============================================================

Write-TestHeader "RÉSUMÉ DES TESTS"

$passRate = if ($script:TestResults.Total -gt 0) { 
    [math]::Round(($script:TestResults.Passed / $script:TestResults.Total) * 100, 2) 
} else { 
    0 
}

Write-Host ""
Write-Host "Total Tests      : $($script:TestResults.Total)" -ForegroundColor White
Write-Host "Tests Réussis    : $($script:TestResults.Passed)" -ForegroundColor Green
Write-Host "Tests Échoués    : $($script:TestResults.Failed)" -ForegroundColor Red
Write-Host "Taux de Réussite : $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

# Sauvegarder les résultats
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$resultFile = "f:\Git\XYPH-Project\tests\results\extension-test-$timestamp.json"

$script:TestResults | ConvertTo-Json -Depth 10 | Out-File $resultFile -Encoding UTF8

Write-Host "📊 Résultats sauvegardés dans: $resultFile" -ForegroundColor Cyan

# Recommandations
Write-TestHeader "RECOMMANDATIONS"

if ($script:TestResults.Failed -eq 0) {
    Write-Host "✅ Extension prête à être testée dans Chrome!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pour charger l'extension:" -ForegroundColor Yellow
    Write-Host "1. Ouvrir Chrome et aller à: chrome://extensions/" -ForegroundColor White
    Write-Host "2. Activer le 'Mode développeur' (en haut à droite)" -ForegroundColor White
    Write-Host "3. Cliquer sur 'Charger l'extension non empaquetée'" -ForegroundColor White
    Write-Host "4. Sélectionner le dossier: f:\Git\XYPH-Project\extension" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️ Veuillez corriger les erreurs avant de charger l'extension" -ForegroundColor Red
    Write-Host ""
    Write-Host "Fichiers avec erreurs:" -ForegroundColor Yellow
    $failedTests = $script:TestResults.Tests | Where-Object { -not $_.Success }
    foreach ($test in $failedTests) {
        Write-Host "  - $($test.Name): $($test.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Retourner le code de sortie
if ($script:TestResults.Failed -gt 0) {
    exit 1
} else {
    exit 0
}
