# 🚀 Script de Collecte Automatique pour Entraînement XYPH
# Automatise la collecte de données d'entraînement et l'amélioration continue

param(
    [string]$TrainingPath = "F:\XYPH-Training",
    [switch]$InitializeStructure,
    [switch]$CollectDaily,
    [switch]$AnalyzePatterns,
    [switch]$GenerateReport
)

# Configuration
$ErrorActionPreference = "Stop"
$TrainingConfig = @{
    MaxScriptsPerDay = 50
    MinSuccessRate = 0.8
    FeedbackCategories = @('accuracy', 'completeness', 'optimization', 'safety', 'documentation')
    ScriptTypes = @('powershell', 'python', 'bash', 'javascript', 'cmd')
}

function Initialize-TrainingStructure {
    Write-Host "🏗️  Initialisation de la structure d'entraînement..." -ForegroundColor Cyan
    
    $folders = @(
        "$TrainingPath\01_Scripts_Reussis\PowerShell",
        "$TrainingPath\01_Scripts_Reussis\Python", 
        "$TrainingPath\01_Scripts_Reussis\Bash",
        "$TrainingPath\01_Scripts_Reussis\JavaScript",
        "$TrainingPath\02_Prompts_Optimaux\Generation_Scripts",
        "$TrainingPath\02_Prompts_Optimaux\Analyse_Images",
        "$TrainingPath\02_Prompts_Optimaux\Traitement_Videos",
        "$TrainingPath\02_Prompts_Optimaux\Extraction_Donnees",
        "$TrainingPath\03_Feedback_Utilisateurs\Positifs",
        "$TrainingPath\03_Feedback_Utilisateurs\Ameliorations",
        "$TrainingPath\04_Patterns_Reussite\Templates",
        "$TrainingPath\04_Patterns_Reussite\Workflows",
        "$TrainingPath\05_Metriques\Daily",
        "$TrainingPath\05_Metriques\Weekly",
        "$TrainingPath\05_Metriques\Reports"
    )
    
    foreach ($folder in $folders) {
        if (-not (Test-Path $folder)) {
            New-Item -ItemType Directory -Path $folder -Force | Out-Null
            Write-Host "✅ Créé: $folder" -ForegroundColor Green
        }
    }
    
    # Créer fichiers de configuration
    $configPath = "$TrainingPath\config.json"
    $TrainingConfig | ConvertTo-Json -Depth 3 | Out-File $configPath -Encoding UTF8
    
    Write-Host "🎯 Structure d'entraînement initialisée dans: $TrainingPath" -ForegroundColor Green
}

function Collect-DailyData {
    Write-Host "📊 Collecte des données quotidiennes..." -ForegroundColor Cyan
    
    $today = Get-Date -Format "yyyy-MM-dd"
    $dailyLogPath = "$TrainingPath\05_Metriques\Daily\$today.json"
    
    # Simuler la collecte depuis l'extension Chrome
    # En réalité, ceci serait fait par l'extension elle-même
    $dailyData = @{
        date = $today
        scripts_generated = 0
        success_rate = 0.0
        user_interactions = @()
        feedback_received = @()
        patterns_identified = @()
        improvements_made = @()
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    
    # Lire les données depuis le stockage Chrome (simulation)
    $chromeDataPath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Local Extension Settings"
    
    # Pour l'instant, créer des données d'exemple
    $dailyData.scripts_generated = Get-Random -Minimum 5 -Maximum 25
    $dailyData.success_rate = [math]::Round((Get-Random -Minimum 70 -Maximum 95) / 100, 2)
    
    # Simuler quelques interactions
    for ($i = 0; $i -lt $dailyData.scripts_generated; $i++) {
        $interaction = @{
            id = "interaction_$i"
            user_request = "Exemple de demande $i"
            script_type = $TrainingConfig.ScriptTypes | Get-Random
            generated_script = "# Script généré exemple $i"
            execution_success = (Get-Random) -gt 0.2
            user_rating = Get-Random -Minimum 1 -Maximum 6
            feedback_text = ""
            timestamp = (Get-Date).AddHours(-$(Get-Random -Maximum 12)).ToString("yyyy-MM-dd HH:mm:ss")
        }
        $dailyData.user_interactions += $interaction
        
        if ($interaction.user_rating -ge 4) {
            $dailyData.feedback_received += @{
                type = "positive"
                rating = $interaction.user_rating
                comment = "Script efficace et bien documenté"
            }
        }
    }
    
    # Sauvegarder les données quotidiennes
    $dailyData | ConvertTo-Json -Depth 4 | Out-File $dailyLogPath -Encoding UTF8
    
    Write-Host "✅ Données collectées pour $today - $($dailyData.scripts_generated) scripts générés" -ForegroundColor Green
}

function Analyze-Patterns {
    Write-Host "🔍 Analyse des patterns de réussite..." -ForegroundColor Cyan
    
    # Lire tous les logs quotidiens
    $dailyLogs = Get-ChildItem "$TrainingPath\05_Metriques\Daily\*.json" | 
                 ForEach-Object { Get-Content $_.FullName | ConvertFrom-Json }
    
    if (-not $dailyLogs) {
        Write-Warning "Aucune donnée quotidienne trouvée. Exécutez d'abord -CollectDaily"
        return
    }
    
    # Analyser les patterns
    $analysis = @{
        total_scripts = ($dailyLogs | Measure-Object scripts_generated -Sum).Sum
        average_success_rate = [math]::Round(($dailyLogs | Measure-Object success_rate -Average).Average, 2)
        top_script_types = @{}
        success_patterns = @()
        improvement_areas = @()
        trends = @{}
    }
    
    # Analyser les types de scripts les plus demandés
    foreach ($log in $dailyLogs) {
        foreach ($interaction in $log.user_interactions) {
            $type = $interaction.script_type
            if ($analysis.top_script_types.ContainsKey($type)) {
                $analysis.top_script_types[$type]++
            } else {
                $analysis.top_script_types[$type] = 1
            }
        }
    }
    
    # Identifier les patterns de réussite
    $successfulScripts = $dailyLogs | ForEach-Object { 
        $_.user_interactions | Where-Object { $_.user_rating -ge 4 } 
    }
    
    # Analyser les demandes récurrentes réussies
    $successfulRequests = $successfulScripts | Group-Object { 
        ($_.user_request -split ' ')[0..2] -join ' ' 
    } | Where-Object Count -gt 1 | Sort-Object Count -Descending
    
    foreach ($pattern in $successfulRequests[0..4]) {
        $analysis.success_patterns += @{
            request_pattern = $pattern.Name
            frequency = $pattern.Count
            average_rating = [math]::Round(($pattern.Group | Measure-Object user_rating -Average).Average, 1)
        }
    }
    
    # Identifier les domaines d'amélioration
    $lowRatedScripts = $dailyLogs | ForEach-Object { 
        $_.user_interactions | Where-Object { $_.user_rating -le 2 } 
    }
    
    if ($lowRatedScripts) {
        $commonIssues = $lowRatedScripts | Group-Object script_type | Sort-Object Count -Descending
        foreach ($issue in $commonIssues[0..2]) {
            $analysis.improvement_areas += @{
                script_type = $issue.Name
                issue_frequency = $issue.Count
                suggested_focus = "Améliorer la qualité des scripts $($issue.Name)"
            }
        }
    }
    
    # Calculer les tendances
    if ($dailyLogs.Count -gt 1) {
        $recentLogs = $dailyLogs | Sort-Object date | Select-Object -Last 7
        $olderLogs = $dailyLogs | Sort-Object date | Select-Object -First ($dailyLogs.Count - 7)
        
        if ($olderLogs) {
            $recentAvg = ($recentLogs | Measure-Object success_rate -Average).Average
            $olderAvg = ($olderLogs | Measure-Object success_rate -Average).Average
            $analysis.trends.success_rate_change = [math]::Round($recentAvg - $olderAvg, 3)
            
            $recentScripts = ($recentLogs | Measure-Object scripts_generated -Average).Average
            $olderScripts = ($olderLogs | Measure-Object scripts_generated -Average).Average
            $analysis.trends.usage_change = [math]::Round($recentScripts - $olderScripts, 1)
        }
    }
    
    # Sauvegarder l'analyse
    $analysisPath = "$TrainingPath\05_Metriques\latest_analysis.json"
    $analysis | ConvertTo-Json -Depth 4 | Out-File $analysisPath -Encoding UTF8
    
    Write-Host "🎯 Analyse terminée:" -ForegroundColor Green
    Write-Host "   • Scripts générés: $($analysis.total_scripts)" -ForegroundColor Yellow
    Write-Host "   • Taux de réussite moyen: $($analysis.average_success_rate * 100)%" -ForegroundColor Yellow
    Write-Host "   • Patterns identifiés: $($analysis.success_patterns.Count)" -ForegroundColor Yellow
    
    return $analysis
}

function Generate-TrainingReport {
    Write-Host "📋 Génération du rapport d'entraînement..." -ForegroundColor Cyan
    
    $analysisPath = "$TrainingPath\05_Metriques\latest_analysis.json"
    if (-not (Test-Path $analysisPath)) {
        Write-Warning "Aucune analyse trouvée. Exécutez d'abord -AnalyzePatterns"
        return
    }
    
    $analysis = Get-Content $analysisPath | ConvertFrom-Json
    $reportDate = Get-Date -Format "yyyy-MM-dd"
    $reportPath = "$TrainingPath\05_Metriques\Reports\training_report_$reportDate.md"
    
    $reportContent = @"
# 🤖 XYPH - Rapport d'Entraînement du $reportDate

## 📊 Métriques Générales

- **Scripts générés**: $($analysis.total_scripts)
- **Taux de réussite moyen**: $($analysis.average_success_rate * 100)%
- **Types de scripts les plus demandés**: 
"@

    # Ajouter les types de scripts populaires
    $topTypes = $analysis.top_script_types.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 3
    foreach ($type in $topTypes) {
        $reportContent += "`n  - $($type.Key): $($type.Value) scripts"
    }

    $reportContent += @"

## 🎯 Patterns de Réussite Identifiés

"@

    foreach ($pattern in $analysis.success_patterns) {
        $reportContent += "`n- **$($pattern.request_pattern)**: $($pattern.frequency) occurrences, note moyenne $($pattern.average_rating)/5"
    }

    $reportContent += @"

## 🔧 Domaines d'Amélioration

"@

    foreach ($area in $analysis.improvement_areas) {
        $reportContent += "`n- **$($area.script_type)**: $($area.issue_frequency) problèmes identifiés"
        $reportContent += "`n  - Action: $($area.suggested_focus)"
    }

    if ($analysis.trends.success_rate_change) {
        $trendEmoji = if ($analysis.trends.success_rate_change -gt 0) { "📈" } else { "📉" }
        $reportContent += @"

## 📈 Tendances

- **Évolution du taux de réussite**: $trendEmoji $($analysis.trends.success_rate_change * 100)%
- **Évolution de l'usage**: $($analysis.trends.usage_change) scripts/jour en moyenne
"@
    }

    $reportContent += @"

## 🚀 Recommandations

### Actions Prioritaires:
1. **Optimiser les scripts $($analysis.improvement_areas[0].script_type)** - Focus sur la qualité
2. **Créer des templates** pour les patterns de réussite identifiés
3. **Améliorer les prompts** pour les cas d'échec récurrents

### Prompts Suggérés:
```
# Pour améliorer $($analysis.improvement_areas[0].script_type)
"Génère un script $($analysis.improvement_areas[0].script_type) avec:
- Gestion d'erreurs robuste
- Documentation détaillée
- Validation des entrées
- Logging complet
- Tests intégrés"
```

### Objectifs Semaine Prochaine:
- Taux de réussite cible: $(($analysis.average_success_rate + 0.05) * 100)%
- Réduire les échecs en $($analysis.improvement_areas[0].script_type) de 50%
- Collecter 20+ exemples de scripts réussis

---
*Rapport généré automatiquement le $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*
"@

    $reportContent | Out-File $reportPath -Encoding UTF8
    
    Write-Host "✅ Rapport généré: $reportPath" -ForegroundColor Green
    
    # Afficher le résumé dans la console
    Write-Host "`n🎯 RÉSUMÉ EXÉCUTIF:" -ForegroundColor Cyan
    Write-Host "📊 Performance actuelle: $($analysis.average_success_rate * 100)%" -ForegroundColor Yellow
    
    if ($analysis.trends.success_rate_change -gt 0) {
        Write-Host "📈 Tendance: En amélioration (+$($analysis.trends.success_rate_change * 100)%)" -ForegroundColor Green
    } elseif ($analysis.trends.success_rate_change -lt 0) {
        Write-Host "📉 Tendance: En baisse ($($analysis.trends.success_rate_change * 100)%)" -ForegroundColor Red
    }
    
    Write-Host "🔧 Focus d'amélioration: $($analysis.improvement_areas[0].script_type)" -ForegroundColor Magenta
    Write-Host "🎯 Pattern le plus réussi: $($analysis.success_patterns[0].request_pattern)" -ForegroundColor Green
}

function Show-Usage {
    Write-Host @"
🤖 XYPH Training Data Collector

USAGE:
    .\Collect-TrainingData.ps1 [OPTIONS]

OPTIONS:
    -InitializeStructure    Créer la structure de dossiers d'entraînement
    -CollectDaily          Collecter les données de la journée
    -AnalyzePatterns       Analyser les patterns de réussite
    -GenerateReport        Générer un rapport complet
    
EXEMPLES:
    # Configuration initiale
    .\Collect-TrainingData.ps1 -InitializeStructure
    
    # Collecte quotidienne (à automatiser)
    .\Collect-TrainingData.ps1 -CollectDaily
    
    # Analyse complète
    .\Collect-TrainingData.ps1 -AnalyzePatterns -GenerateReport
    
    # Workflow complet
    .\Collect-TrainingData.ps1 -CollectDaily -AnalyzePatterns -GenerateReport

AUTOMATISATION:
    Ajoutez à votre tâche planifiée Windows:
    schtasks /create /tn "XYPH Training" /tr "powershell.exe -File 'C:\path\to\Collect-TrainingData.ps1' -CollectDaily" /sc daily /st 23:30

"@ -ForegroundColor Cyan
}

# Main Logic
try {
    Write-Host "🤖 XYPH Training Data Collector" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    if ($InitializeStructure) {
        Initialize-TrainingStructure
    }
    
    if ($CollectDaily) {
        Collect-DailyData
    }
    
    if ($AnalyzePatterns) {
        $analysis = Analyze-Patterns
    }
    
    if ($GenerateReport) {
        Generate-TrainingReport
    }
    
    if (-not ($InitializeStructure -or $CollectDaily -or $AnalyzePatterns -or $GenerateReport)) {
        Show-Usage
    }
    
    Write-Host "`n✅ Opérations terminées avec succès!" -ForegroundColor Green
    
} catch {
    Write-Error "❌ Erreur: $($_.Exception.Message)"
    exit 1
}