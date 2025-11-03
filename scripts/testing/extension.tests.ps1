# 🧪 Tests unitaires pour l'Extension Chrome XYPH
# Tests basiques pour valider l'intégrité avant déploiement

Write-Host "🧪 Tests Extension Chrome XYPH" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

$TestResults = @{
    Passed = 0
    Failed = 0
    Details = @()
}

function Test-Assert {
    param(
        [bool]$Condition,
        [string]$TestName,
        [string]$ErrorMessage = ""
    )
    
    if ($Condition) {
        Write-Host "   ✅ $TestName" -ForegroundColor Green
        $TestResults.Passed++
        $TestResults.Details += @{ Test = $TestName; Result = "PASS"; Message = "" }
    } else {
        Write-Host "   ❌ $TestName : $ErrorMessage" -ForegroundColor Red
        $TestResults.Failed++
        $TestResults.Details += @{ Test = $TestName; Result = "FAIL"; Message = $ErrorMessage }
    }
}

# Test 1: Fichiers essentiels présents
Write-Host "📂 Test des fichiers essentiels..." -ForegroundColor Blue

Test-Assert (Test-Path "manifest.json") "manifest.json existe"
Test-Assert (Test-Path "background.js") "background.js existe"
Test-Assert (Test-Path "sidebar.js") "sidebar.js existe"
Test-Assert (Test-Path "popup.html") "popup.html existe"
Test-Assert (Test-Path "popup.js") "popup.js existe"

# Test 2: Validation du manifest.json
Write-Host "📄 Test du manifest.json..." -ForegroundColor Blue

try {
    $manifest = Get-Content "manifest.json" | ConvertFrom-Json
    
    Test-Assert ($manifest.manifest_version -eq 3) "Manifest version 3" "Version manifest incorrecte"
    Test-Assert (![string]::IsNullOrEmpty($manifest.name)) "Nom de l'extension défini" "Nom manquant"
    Test-Assert (![string]::IsNullOrEmpty($manifest.version)) "Version définie" "Version manquante"
    Test-Assert ($manifest.permissions -contains "activeTab") "Permission activeTab" "Permission activeTab manquante"
    Test-Assert ($null -ne $manifest.action) "Action définie" "Action manquante"
    
} catch {
    Test-Assert $false "Manifest.json valide" "JSON invalide: $($_.Exception.Message)"
}

# Test 3: Validation du JavaScript
Write-Host "📜 Test du JavaScript..." -ForegroundColor Blue

# Test background.js
if (Test-Path "background.js") {
    $backgroundContent = Get-Content "background.js" -Raw
    Test-Assert ($backgroundContent -match "chrome\.action") "background.js utilise chrome.action" "API chrome.action non trouvée"
    Test-Assert ($backgroundContent -notmatch "chrome\.browserAction") "background.js n'utilise pas l'ancienne API" "Ancienne API browserAction détectée"
} else {
    Test-Assert $false "background.js accessible"
}

# Test sidebar.js
if (Test-Path "sidebar.js") {
    $sidebarContent = Get-Content "sidebar.js" -Raw
    Test-Assert ($sidebarContent -match "function.*[Cc]hat|[Cc]hat.*function") "sidebar.js contient les fonctions chat" "Fonctions chat manquantes"
    Test-Assert ($sidebarContent -match "showChatInterface") "Fonction showChatInterface présente" "showChatInterface manquante"
    Test-Assert ($sidebarContent -match "sendChatMessage") "Fonction sendChatMessage présente" "sendChatMessage manquante"
} else {
    Test-Assert $false "sidebar.js accessible"
}

# Test popup.js
if (Test-Path "popup.js") {
    $popupContent = Get-Content "popup.js" -Raw
    Test-Assert ($popupContent -match "document\.addEventListener.*DOMContentLoaded") "popup.js gère DOMContentLoaded" "Event listener DOMContentLoaded manquant"
} else {
    Test-Assert $false "popup.js accessible"
}

# Test 4: Validation HTML
Write-Host "🌐 Test des fichiers HTML..." -ForegroundColor Blue

# Test popup.html
if (Test-Path "popup.html") {
    $popupHtml = Get-Content "popup.html" -Raw
    Test-Assert ($popupHtml -match "<html") "popup.html structure HTML" "Structure HTML invalide"
    Test-Assert ($popupHtml -match "<title>") "popup.html a un titre" "Titre manquant"
    Test-Assert ($popupHtml -match "popup\.js") "popup.html référence popup.js" "Référence au script manquante"
} else {
    Test-Assert $false "popup.html accessible"
}

# Test sidebar.html ou sidebar-new.html
$sidebarHtml = $null
if (Test-Path "sidebar.html") {
    $sidebarHtml = Get-Content "sidebar.html" -Raw
    $sidebarFile = "sidebar.html"
} elseif (Test-Path "sidebar-new.html") {
    $sidebarHtml = Get-Content "sidebar-new.html" -Raw
    $sidebarFile = "sidebar-new.html"
}

if ($sidebarHtml) {
    Test-Assert ($sidebarHtml -match "<html") "$sidebarFile structure HTML" "Structure HTML invalide"
    Test-Assert ($sidebarHtml -match "sidebar\.js") "$sidebarFile référence sidebar.js" "Référence au script manquante"
    Test-Assert ($sidebarHtml -match "chat") "$sidebarFile contient interface chat" "Interface chat manquante"
} else {
    Test-Assert $false "Fichier sidebar HTML présent"
}

# Test 5: Taille des fichiers (pas trop gros)
Write-Host "📏 Test de la taille des fichiers..." -ForegroundColor Blue

$files = @("manifest.json", "background.js", "sidebar.js", "popup.js")
foreach ($file in $files) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Test-Assert ($size -lt 1MB) "$file taille raisonnable" "Fichier trop volumineux (${size} bytes)"
        Test-Assert ($size -gt 0) "$file non vide" "Fichier vide"
    }
}

# Test 6: Syntaxe JSON
Write-Host "🔍 Test de syntaxe JSON..." -ForegroundColor Blue

$jsonFiles = Get-ChildItem "*.json"
foreach ($jsonFile in $jsonFiles) {
    try {
        Get-Content $jsonFile.FullName | ConvertFrom-Json | Out-Null
        Test-Assert $true "$($jsonFile.Name) syntaxe JSON valide"
    } catch {
        Test-Assert $false "$($jsonFile.Name) syntaxe JSON valide" "Erreur JSON: $($_.Exception.Message)"
    }
}

# Test 7: Permissions de sécurité
Write-Host "🔒 Test des permissions de sécurité..." -ForegroundColor Blue

if (Test-Path "manifest.json") {
    try {
        $manifest = Get-Content "manifest.json" | ConvertFrom-Json
        
        # Vérifier qu'on n'a pas de permissions dangereuses
        $dangerousPermissions = @("tabs", "history", "bookmarks", "topSites")
        $hasUnsafePermissions = $false
        
        if ($manifest.permissions) {
            foreach ($permission in $dangerousPermissions) {
                if ($manifest.permissions -contains $permission) {
                    $hasUnsafePermissions = $true
                    break
                }
            }
        }
        
        Test-Assert (-not $hasUnsafePermissions) "Aucune permission dangereuse" "Permissions sensibles détectées"
        Test-Assert ($manifest.permissions -contains "storage") "Permission storage présente" "Permission storage recommandée"
        
    } catch {
        Test-Assert $false "Analyse des permissions réussie" "Erreur lors de l'analyse: $($_.Exception.Message)"
    }
}

# Test 8: Configuration XYPH spécifique
Write-Host "🤖 Test configuration XYPH..." -ForegroundColor Blue

if (Test-Path "sidebar.js") {
    $sidebarContent = Get-Content "sidebar.js" -Raw
    Test-Assert ($sidebarContent -match "XYPH") "Référence XYPH présente" "Nom XYPH non trouvé"
    Test-Assert ($sidebarContent -match "creative|créati") "Aspects créatifs présents" "Éléments créatifs non détectés"
    Test-Assert ($sidebarContent -match "collectTrainingData|training") "Système d'entraînement présent" "Système d'entraînement non détecté"
}

# Résultats finaux
Write-Host ""
Write-Host "📊 Résultats des tests:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

$totalTests = $TestResults.Passed + $TestResults.Failed
$successRate = if ($totalTests -gt 0) { [math]::Round(($TestResults.Passed / $totalTests) * 100, 1) } else { 0 }

Write-Host "✅ Tests réussis: $($TestResults.Passed)" -ForegroundColor Green
Write-Host "❌ Tests échoués: $($TestResults.Failed)" -ForegroundColor Red
Write-Host "📈 Taux de réussite: $successRate%" -ForegroundColor $(if($successRate -ge 80){"Green"}elseif($successRate -ge 60){"Yellow"}else{"Red"})

# Détail des échecs si nécessaire
if ($TestResults.Failed -gt 0) {
    Write-Host ""
    Write-Host "❌ Détails des échecs:" -ForegroundColor Red
    foreach ($detail in $TestResults.Details) {
        if ($detail.Result -eq "FAIL") {
            Write-Host "   • $($detail.Test): $($detail.Message)" -ForegroundColor Red
        }
    }
}

# Recommandations
Write-Host ""
Write-Host "💡 Recommandations:" -ForegroundColor Yellow

if ($TestResults.Failed -eq 0) {
    Write-Host "🎉 Tous les tests passent ! Extension prête pour le déploiement." -ForegroundColor Green
    $exitCode = 0
} elseif ($TestResults.Failed -le 2) {
    Write-Host "⚠️ Quelques problèmes mineurs détectés. Correction recommandée avant déploiement." -ForegroundColor Yellow
    $exitCode = 1
} else {
    Write-Host "🚨 Problèmes significatifs détectés. Correction nécessaire avant déploiement." -ForegroundColor Red
    $exitCode = 2
}

# Sauvegarde du rapport de test
$testReport = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    total_tests = $totalTests
    passed = $TestResults.Passed
    failed = $TestResults.Failed
    success_rate = $successRate
    details = $TestResults.Details
    exit_code = $exitCode
} | ConvertTo-Json -Depth 3

$reportFile = "test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$testReport | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "📁 Rapport sauvegardé: $reportFile" -ForegroundColor Gray

# Exit avec le code approprié pour l'intégration CI/CD
exit $exitCode