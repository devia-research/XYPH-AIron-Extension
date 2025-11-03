# Test de validation complète pour l'extension XYPH avec icônes
# Vérifie tous les composants : icônes, manifest, API, structure

param(
    [switch]$Verbose,
    [string]$ExtensionPath = "F:\Git\XYPH-Project\extension"
)

Write-Host "🧪 TEST COMPLET EXTENSION XYPH" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

$results = @{
    Icons = @()
    Manifest = @()
    API = @()
    Structure = @()
    Overall = "PENDING"
}

# Test 1: Validation des icônes
Write-Host "`n📸 TEST DES ICÔNES" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow

$iconPath = Join-Path $ExtensionPath "icons"
$requiredIcons = @("icon16.png", "icon48.png", "icon128.png")

foreach ($icon in $requiredIcons) {
    $fullPath = Join-Path $iconPath $icon
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        $result = @{
            Name = $icon
            Status = "✅ TROUVÉ"
            Size = "$([math]::Round($size/1KB, 1)) KB"
            Path = $fullPath
        }
        Write-Host "   ✅ $icon - $($result.Size)" -ForegroundColor Green
    } else {
        $result = @{
            Name = $icon
            Status = "❌ MANQUANT"
            Size = "N/A"
            Path = $fullPath
        }
        Write-Host "   ❌ $icon - MANQUANT" -ForegroundColor Red
    }
    $results.Icons += $result
}

# Icônes additionnelles
$additionalIcons = @("toolbar-icon.png", "favicon.png", "store-icon.png")
foreach ($icon in $additionalIcons) {
    $fullPath = Join-Path $iconPath $icon
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Write-Host "   🎯 $icon - $([math]::Round($size/1KB, 1)) KB" -ForegroundColor Cyan
    }
}

# Test 2: Validation du manifest
Write-Host "`n📋 TEST DU MANIFEST" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow

$manifestPath = Join-Path $ExtensionPath "manifest.json"
if (Test-Path $manifestPath) {
    try {
        $manifest = Get-Content $manifestPath | ConvertFrom-Json
        
        # Vérifier les champs obligatoires
        $requiredFields = @("manifest_version", "name", "version", "description", "permissions", "icons")
        foreach ($field in $requiredFields) {
            if ($manifest.PSObject.Properties.Name -contains $field) {
                Write-Host "   ✅ $field : $($manifest.$field)" -ForegroundColor Green
                $results.Manifest += @{ Field = $field; Status = "OK"; Value = $manifest.$field }
            } else {
                Write-Host "   ❌ $field : MANQUANT" -ForegroundColor Red
                $results.Manifest += @{ Field = $field; Status = "MISSING"; Value = $null }
            }
        }
        
        # Vérifier les chemins d'icônes dans le manifest
    if ($manifest.icons) {
            Write-Host "   🔍 Vérification des chemins d'icônes..." -ForegroundColor Cyan
            foreach ($size in $manifest.icons.PSObject.Properties.Name) {
                $iconPath = $manifest.icons.$size
        $resolvedPath = Join-Path $ExtensionPath $iconPath
                if (Test-Path $resolvedPath) {
                    Write-Host "      ✅ Icône ${size}px : $iconPath" -ForegroundColor Green
                } else {
                    Write-Host "      ❌ Icône ${size}px : $iconPath (introuvable)" -ForegroundColor Red
                }
            }
        }
        
    } catch {
        Write-Host "   ❌ Erreur lecture manifest: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Manifest introuvable: $manifestPath" -ForegroundColor Red
}

# Test 3: Validation API
Write-Host "`n🔌 TEST DE LA CONFIGURATION API" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow

$apiConfigPath = "F:\Git\XYPH-Project\config\api\api-keys.json"
if (Test-Path $apiConfigPath) {
    try {
        $apiConfig = Get-Content $apiConfigPath | ConvertFrom-Json
        
        Write-Host "   📊 Providers configurés:" -ForegroundColor Cyan
        foreach ($provider in $apiConfig.providers.PSObject.Properties.Name) {
            $config = $apiConfig.providers.$provider
            $status = if ($config.enabled) { "✅ ACTIF" } else { "⚪ INACTIF" }
            $priority = $config.priority
            Write-Host "      $status $provider (priorité $priority) - $($config.model)" -ForegroundColor White
            
            $results.API += @{
                Provider = $provider
                Status = if ($config.enabled) { "ENABLED" } else { "DISABLED" }
                Model = $config.model
                Priority = $priority
            }
        }
        
        # Test fallback
        if ($apiConfig.fallback) {
            Write-Host "   🔄 Ordre de fallback: $($apiConfig.fallback.order -join ' → ')" -ForegroundColor Cyan
        }
        
    } catch {
        Write-Host "   ❌ Erreur lecture config API: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  Configuration API introuvable: $apiConfigPath" -ForegroundColor Yellow
}

# Test 4: Structure de l'extension
Write-Host "`n📁 TEST DE LA STRUCTURE" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow

$manifestRootPath = Join-Path $ExtensionPath "manifest.json"
if (Test-Path $manifestRootPath) {
    Write-Host "   ✅ manifest.json (racine)" -ForegroundColor Green
} else {
    Write-Host "   ❌ manifest.json manquant à la racine" -ForegroundColor Red
}

$expectedStructure = @{
    "core" = @("background.js", "content.js")
    "ui" = @("popup", "sidebar", "styles")
    "api" = @("provider-selector.js", "deepseek-model-selector.js")
    "icons" = @("icon16.png", "icon48.png", "icon128.png")
}

foreach ($folder in $expectedStructure.Keys) {
    $folderPath = Join-Path $ExtensionPath $folder
    if (Test-Path $folderPath) {
        Write-Host "   ✅ Dossier $folder/" -ForegroundColor Green
        
        if ($folder -ne "ui") { # ui a des sous-dossiers
            foreach ($file in $expectedStructure[$folder]) {
                $filePath = Join-Path $folderPath $file
                if (Test-Path $filePath) {
                    $size = (Get-Item $filePath).Length
                    Write-Host "      ✅ $file ($([math]::Round($size/1KB, 1)) KB)" -ForegroundColor Green
                } else {
                    Write-Host "      ❌ $file (manquant)" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "   ❌ Dossier $folder/ (manquant)" -ForegroundColor Red
    }
}

# Résumé final
Write-Host "`n📊 RÉSUMÉ FINAL" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

$iconSuccess = ($results.Icons | Where-Object { $_.Status -like "*TROUVÉ*" }).Count
$iconTotal = $results.Icons.Count
$manifestSuccess = ($results.Manifest | Where-Object { $_.Status -eq "OK" }).Count
$manifestTotal = $results.Manifest.Count
$apiEnabled = ($results.API | Where-Object { $_.Status -eq "ENABLED" }).Count
$apiTotal = $results.API.Count

Write-Host "📸 Icônes: $iconSuccess/$iconTotal OK" -ForegroundColor $(if($iconSuccess -eq $iconTotal){"Green"}else{"Yellow"})
Write-Host "📋 Manifest: $manifestSuccess/$manifestTotal OK" -ForegroundColor $(if($manifestSuccess -eq $manifestTotal){"Green"}else{"Yellow"})
Write-Host "🔌 API: $apiEnabled/$apiTotal actifs" -ForegroundColor $(if($apiEnabled -gt 0){"Green"}else{"Yellow"})

$overallScore = [math]::Round((($iconSuccess + $manifestSuccess + $apiEnabled) / ($iconTotal + $manifestTotal + [math]::Max($apiTotal,1))) * 100, 1)

if ($overallScore -ge 90) {
    $results.Overall = "EXCELLENT"
    Write-Host "`n🎉 EXTENSION PRÊTE ! Score: $overallScore%" -ForegroundColor Green
    Write-Host "✅ Tous les composants sont fonctionnels" -ForegroundColor Green
    Write-Host "🚀 Vous pouvez charger l'extension dans Chrome" -ForegroundColor Green
} elseif ($overallScore -ge 70) {
    $results.Overall = "BON"
    Write-Host "`n✅ Extension fonctionnelle ! Score: $overallScore%" -ForegroundColor Yellow
    Write-Host "⚠️  Quelques éléments à améliorer" -ForegroundColor Yellow
} else {
    $results.Overall = "PROBLÈMES"
    Write-Host "`n⚠️  Problèmes détectés ! Score: $overallScore%" -ForegroundColor Red
    Write-Host "🔧 Vérifiez les erreurs ci-dessus" -ForegroundColor Red
}

Write-Host "`n🔧 PROCHAINES ÉTAPES:" -ForegroundColor Cyan
Write-Host "1. Aller dans chrome://extensions/" -ForegroundColor White
Write-Host "2. Activer le 'Mode développeur'" -ForegroundColor White
Write-Host "3. Cliquer 'Charger l'extension non empaquetée'" -ForegroundColor White
Write-Host "4. Sélectionner le dossier: $ExtensionPath" -ForegroundColor White

return $results