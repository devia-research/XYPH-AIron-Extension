# 🔍 XYPH Health Check - Vérification Complète du Système
# Vérifie que tous les composants XYPH sont correctement configurés

Write-Host "🔍 XYPH System Health Check" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

$healthReport = @{
    ExtensionFiles = @{ Status = "Unknown"; Details = @() }
    GitWorkflow = @{ Status = "Unknown"; Details = @() }
    APIConfiguration = @{ Status = "Unknown"; Details = @() }
    TestingSuite = @{ Status = "Unknown"; Details = @() }
    TrainingSystem = @{ Status = "Unknown"; Details = @() }
    OverallHealth = "Unknown"
}

function Test-ComponentHealth {
    param([string]$ComponentName, [scriptblock]$TestScript)
    
    Write-Host "🔍 Vérification : $ComponentName" -ForegroundColor Blue
    
    try {
        $result = & $TestScript
        if ($result.Status -eq "Healthy") {
            Write-Host "   ✅ $ComponentName : OK" -ForegroundColor Green
            foreach ($detail in $result.Details) {
                Write-Host "      • $detail" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ⚠️ $ComponentName : Problèmes détectés" -ForegroundColor Yellow
            foreach ($detail in $result.Details) {
                Write-Host "      • $detail" -ForegroundColor Yellow
            }
        }
        return $result
    } catch {
        Write-Host "   ❌ $ComponentName : Erreur critique" -ForegroundColor Red
        Write-Host "      • $($_.Exception.Message)" -ForegroundColor Red
        return @{ Status = "Critical"; Details = @($_.Exception.Message) }
    }
}

# Test 1: Fichiers d'extension
$healthReport.ExtensionFiles = Test-ComponentHealth "Extension Chrome" {
    $extensionPath = "F:\Scripts\ExtensionChrome"
    $requiredFiles = @("manifest.json", "background.js", "sidebar.js", "popup.html", "popup.js")
    $details = @()
    $allPresent = $true
    
    if (-not (Test-Path $extensionPath)) {
        return @{ Status = "Critical"; Details = @("Dossier d'extension non trouvé : $extensionPath") }
    }
    
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $extensionPath $file
        if (Test-Path $filePath) {
            $details += "$file présent"
        } else {
            $details += "$file MANQUANT"
            $allPresent = $false
        }
    }
    
    # Vérifier manifest.json
    $manifestPath = Join-Path $extensionPath "manifest.json"
    if (Test-Path $manifestPath) {
        try {
            $manifest = Get-Content $manifestPath | ConvertFrom-Json
            if ($manifest.manifest_version -eq 3) {
                $details += "Manifest v3 validé"
            } else {
                $details += "Manifest version incorrecte"
                $allPresent = $false
            }
        } catch {
            $details += "Manifest JSON invalide"
            $allPresent = $false
        }
    }
    
    # Vérifier interface conversationnelle
    $sidebarPath = Join-Path $extensionPath "sidebar.html"
    if (Test-Path $sidebarPath) {
        $sidebarContent = Get-Content $sidebarPath -Raw
        if ($sidebarContent -match "chat") {
            $details += "Interface conversationnelle activée"
        } else {
            $details += "Interface conversationnelle non détectée"
        }
    }
    
    $status = if ($allPresent) { "Healthy" } else { "Warning" }
    return @{ Status = $status; Details = $details }
}

# Test 2: Workflow Git
$healthReport.GitWorkflow = Test-ComponentHealth "Workflow Git" {
    $details = @()
    $isHealthy = $true
    
    # Vérifier si on est dans un repo Git
    if (-not (Test-Path ".git")) {
        return @{ Status = "Warning"; Details = @("Pas dans un repository Git") }
    }
    
    # Vérifier les branches
    try {
        $currentBranch = git rev-parse --abbrev-ref HEAD
        $details += "Branche actuelle : $currentBranch"
        
        $branches = git branch
        if ($branches -match "developpement") {
            $details += "Branche 'developpement' présente"
        } else {
            $details += "Branche 'developpement' manquante"
            $isHealthy = $false
        }
        
        if ($branches -match "main") {
            $details += "Branche 'main' présente"
        } else {
            $details += "Branche 'main' manquante"
            $isHealthy = $false
        }
    } catch {
        return @{ Status = "Critical"; Details = @("Erreur Git : $($_.Exception.Message)") }
    }
    
    # Vérifier les scripts de workflow
    $workflowScript = "F:\Scripts\ExtensionChrome\git-workflow-sync.ps1"
    if (Test-Path $workflowScript) {
        $details += "Script de workflow Git présent"
    } else {
        $details += "Script de workflow Git manquant"
        $isHealthy = $false
    }
    
    $status = if ($isHealthy) { "Healthy" } else { "Warning" }
    return @{ Status = $status; Details = $details }
}

# Test 3: Configuration API
$healthReport.APIConfiguration = Test-ComponentHealth "Configuration API" {
    $details = @()
    $configPath = "F:\Git\XYPH-Project\api_config.json"
    $guidePresent = Test-Path "F:\Git\XYPH-Project\API_KEYS_GUIDE.md"
    $setupScript = Test-Path "F:\Git\XYPH-Project\setup_apis.ps1"
    
    $details += if ($guidePresent) { "Guide API présent" } else { "Guide API manquant" }
    $details += if ($setupScript) { "Script de setup présent" } else { "Script de setup manquant" }
    
    if (Test-Path $configPath) {
        try {
            $config = Get-Content $configPath | ConvertFrom-Json
            if ($config.providers) {
                $providerCount = $config.providers.PSObject.Properties.Count
                $details += "$providerCount provider(s) configuré(s)"
                
                foreach ($provider in $config.providers.PSObject.Properties) {
                    $details += "  → $($provider.Name) : $($provider.Value.enabled)"
                }
            } else {
                $details += "Aucun provider configuré"
            }
        } catch {
            $details += "Configuration API invalide"
        }
    } else {
        $details += "Fichier de configuration API absent"
    }
    
    # Vérifier Ollama si installé
    try {
        $ollamaVersion = ollama --version 2>$null
        if ($ollamaVersion) {
            $details += "Ollama installé : $ollamaVersion"
        }
    } catch {
        $details += "Ollama non installé (optionnel)"
    }
    
    $status = if ($guidePresent -and $setupScript) { "Healthy" } else { "Warning" }
    return @{ Status = $status; Details = $details }
}

# Test 4: Suite de tests
$healthReport.TestingSuite = Test-ComponentHealth "Suite de Tests" {
    $details = @()
    $testScript = "F:\Scripts\ExtensionChrome\extension.tests.ps1"
    
    if (Test-Path $testScript) {
        $details += "Script de tests présent"
        
        # Exécuter les tests
        try {
            $testResult = & $testScript
            if ($LASTEXITCODE -eq 0) {
                $details += "Tests réussis (dernière exécution)"
            } else {
                $details += "Tests échoués (dernière exécution)"
            }
        } catch {
            $details += "Erreur lors de l'exécution des tests"
        }
        
        # Vérifier les rapports de tests
        $reportFiles = Get-ChildItem "F:\Scripts\ExtensionChrome\test-results-*.json" -ErrorAction SilentlyContinue
        if ($reportFiles) {
            $latestReport = $reportFiles | Sort-Object LastWriteTime | Select-Object -Last 1
            $details += "Dernier rapport : $($latestReport.Name)"
        }
    } else {
        $details += "Script de tests manquant"
    }
    
    $status = if (Test-Path $testScript) { "Healthy" } else { "Warning" }
    return @{ Status = $status; Details = $details }
}

# Test 5: Système d'entraînement
$healthReport.TrainingSystem = Test-ComponentHealth "Système d'Entraînement" {
    $details = @()
    $trainingFiles = @(
        "F:\Git\XYPH-Project\CREATIVE_TRAINING.md",
        "F:\Git\XYPH-Project\PRACTICAL_CREATIVE_TRAINING_GUIDE.md",
        "F:\Git\XYPH-Project\creative_training_demo.ps1"
    )
    
    $allPresent = $true
    foreach ($file in $trainingFiles) {
        $fileName = Split-Path $file -Leaf
        if (Test-Path $file) {
            $details += "$fileName présent"
        } else {
            $details += "$fileName manquant"
            $allPresent = $false
        }
    }
    
    # Vérifier dossier d'entraînement
    $trainingDir = "F:\XYPH-Training"
    if (Test-Path $trainingDir) {
        $details += "Dossier d'entraînement créé"
        
        $subdirs = Get-ChildItem $trainingDir -Directory -ErrorAction SilentlyContinue
        if ($subdirs) {
            $details += "$($subdirs.Count) sous-dossier(s) d'entraînement"
        }
    } else {
        $details += "Dossier d'entraînement absent (sera créé automatiquement)"
    }
    
    $status = if ($allPresent) { "Healthy" } else { "Warning" }
    return @{ Status = $status; Details = $details }
}

# Calcul de la santé globale
$healthyCount = 0
$totalComponents = 5

foreach ($component in $healthReport.Keys) {
    if ($component -ne "OverallHealth" -and $healthReport[$component].Status -eq "Healthy") {
        $healthyCount++
    }
}

$healthPercentage = [math]::Round(($healthyCount / $totalComponents) * 100)

$healthReport.OverallHealth = switch ($healthPercentage) {
    { $_ -ge 90 } { "Excellent" }
    { $_ -ge 70 } { "Good" }
    { $_ -ge 50 } { "Warning" }
    default { "Critical" }
}

# Rapport final
Write-Host ""
Write-Host "📊 Rapport de Santé Globale" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

$healthColor = switch ($healthReport.OverallHealth) {
    "Excellent" { "Green" }
    "Good" { "Yellow" }
    "Warning" { "Yellow" }
    "Critical" { "Red" }
}

Write-Host "🏥 État général : $($healthReport.OverallHealth) ($healthPercentage%)" -ForegroundColor $healthColor
Write-Host "✅ Composants sains : $healthyCount/$totalComponents" -ForegroundColor Green

# Recommandations
Write-Host ""
Write-Host "💡 Recommandations :" -ForegroundColor Cyan

$hasWarnings = $false
foreach ($componentName in $healthReport.Keys) {
    if ($componentName -ne "OverallHealth") {
        $component = $healthReport[$componentName]
        if ($component.Status -eq "Warning" -or $component.Status -eq "Critical") {
            $hasWarnings = $true
            Write-Host "   ⚠️ $componentName nécessite attention" -ForegroundColor Yellow
        }
    }
}

if (-not $hasWarnings) {
    Write-Host "   🎉 Tous les systèmes sont opérationnels !" -ForegroundColor Green
    Write-Host "   🚀 XYPH est prêt pour l'action créative !" -ForegroundColor Green
}

# Actions suggérées
Write-Host ""
Write-Host "🎯 Actions Suggérées :" -ForegroundColor Blue

if ($healthReport.ExtensionFiles.Status -ne "Healthy") {
    Write-Host "   🔧 Vérifier les fichiers de l'extension Chrome" -ForegroundColor Gray
}

if ($healthReport.APIConfiguration.Status -ne "Healthy") {
    Write-Host "   🤖 Configurer les APIs : .\setup_apis.ps1" -ForegroundColor Gray
}

if ($healthReport.TestingSuite.Status -ne "Healthy") {
    Write-Host "   🧪 Exécuter les tests : .\extension.tests.ps1" -ForegroundColor Gray
}

if ($healthReport.OverallHealth -eq "Excellent") {
    Write-Host ""
    Write-Host "🌟 Système XYPH en parfait état !" -ForegroundColor Green
    Write-Host "🎨 Prêt pour les défis créatifs !" -ForegroundColor Yellow
    Write-Host "🚀 Commencez votre première session avec XYPH !" -ForegroundColor Cyan
}

# Sauvegarder le rapport
$reportPath = "F:\Git\XYPH-Project\health_check_report.json"
$healthReport | ConvertTo-Json -Depth 3 | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host ""
Write-Host "📁 Rapport sauvegardé : $reportPath" -ForegroundColor Gray