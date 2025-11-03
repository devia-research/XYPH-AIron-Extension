# Test des nouveaux providers: Claude Haiku et Hugging Face
# Script de validation pour l'extension XYPH

param(
    [string]$ClaudeApiKey = "",
    [string]$HuggingFaceApiKey = "",
    [switch]$TestWithoutKeys
)

Write-Host "🧪 Test des nouveaux providers API" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Configuration des tests
$tests = @()

# Test Claude Haiku (si clé fournie)
if ($ClaudeApiKey -or $TestWithoutKeys) {
    $claudeHeaders = @{
        "x-api-key" = if ($ClaudeApiKey) { $ClaudeApiKey } else { "test-key" }
        "Content-Type" = "application/json"
        "anthropic-version" = "2023-06-01"
    }
    
    $claudeBody = @{
        model = "claude-3-haiku-20240307"
        max_tokens = 100
        messages = @(
            @{
                role = "user"
                content = "Bonjour Claude ! Peux-tu me dire comment tu peux aider avec l'extension XYPH ?"
            }
        )
    } | ConvertTo-Json -Depth 3
    
    $tests += @{
        Name = "Claude Haiku"
        Url = "https://api.anthropic.com/v1/messages"
        Headers = $claudeHeaders
        Body = $claudeBody
        Provider = "claude"
    }
}

# Test Hugging Face (si clé fournie)
if ($HuggingFaceApiKey -or $TestWithoutKeys) {
    $hfHeaders = @{
        "Authorization" = "Bearer $(if ($HuggingFaceApiKey) { $HuggingFaceApiKey } else { "test-key" })"
        "Content-Type" = "application/json"
    }
    
    $hfBody = @{
        inputs = "Génère un script PowerShell simple pour dire bonjour"
        parameters = @{
            max_new_tokens = 100
            temperature = 0.7
        }
    } | ConvertTo-Json -Depth 3
    
    $tests += @{
        Name = "Hugging Face CodeLlama"
        Url = "https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-Instruct-hf"
        Headers = $hfHeaders
        Body = $hfBody
        Provider = "huggingface"
    }
}

if ($tests.Count -eq 0) {
    Write-Host "ℹ️  Aucune clé API fournie. Utilisez -ClaudeApiKey et/ou -HuggingFaceApiKey" -ForegroundColor Yellow
    Write-Host "   Ou -TestWithoutKeys pour tester les endpoints sans vraies clés" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Configuration ajoutée pour:" -ForegroundColor Green
    Write-Host "   ✅ Claude Haiku (claude-3-haiku-20240307)" -ForegroundColor White
    Write-Host "   ✅ Claude Sonnet (claude-3-5-sonnet-20241022)" -ForegroundColor White
    Write-Host "   ✅ Claude Opus (claude-3-opus-20240229)" -ForegroundColor White
    Write-Host "   ✅ Hugging Face DialoGPT" -ForegroundColor White
    Write-Host "   ✅ Hugging Face CodeLlama" -ForegroundColor White
    Write-Host "   ✅ Hugging Face Llama-2 Chat" -ForegroundColor White
    Write-Host "   ✅ Hugging Face BERT Français" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Pour activer ces providers:" -ForegroundColor Cyan
    Write-Host "   1. Obtenez vos clés API:" -ForegroundColor White
    Write-Host "      - Claude: https://console.anthropic.com/" -ForegroundColor Gray
    Write-Host "      - Hugging Face: https://huggingface.co/settings/tokens" -ForegroundColor Gray
    Write-Host "   2. Mettez à jour config/api/api-keys.json" -ForegroundColor White
    Write-Host "   3. Remplacez YOUR_ANTHROPIC_API_KEY_HERE et YOUR_HUGGINGFACE_API_KEY_HERE" -ForegroundColor White
    return
}

# Exécution des tests
$results = @()

foreach ($test in $tests) {
    Write-Host "`n🔍 Test de $($test.Name)..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $test.Url -Method POST -Headers $test.Headers -Body $test.Body -TimeoutSec 30
        
        $result = @{
            Provider = $test.Provider
            Name = $test.Name
            Status = "SUCCESS"
            Response = $response
            Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
        
        Write-Host "   ✅ Succès !" -ForegroundColor Green
        Write-Host "   📝 Réponse reçue" -ForegroundColor Cyan
        
    } catch {
        $result = @{
            Provider = $test.Provider
            Name = $test.Name
            Status = "FAILED"
            Error = $_.Exception.Message
            Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
        
        if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*403*") {
            Write-Host "   🔑 Erreur d'authentification (clé API invalide ou manquante)" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    $results += $result
}

# Résumé
Write-Host "`n📊 RÉSUMÉ" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan

$successful = ($results | Where-Object { $_.Status -eq "SUCCESS" }).Count
$total = $results.Count

Write-Host "✅ Tests réussis: $successful/$total" -ForegroundColor Green

if ($successful -eq $total) {
    Write-Host "🎉 Tous les nouveaux providers fonctionnent !" -ForegroundColor Green
} else {
    Write-Host "📝 Configuration des providers dans XYPH:" -ForegroundColor Cyan
    Write-Host "   - DeepSeek (priorité 1): ✅ Actif avec votre clé" -ForegroundColor Green
    Write-Host "   - Claude (priorité 4): ⚙️  Configuré, nécessite clé API" -ForegroundColor Yellow
    Write-Host "   - Hugging Face (priorité 5): ⚙️  Configuré, nécessite clé API" -ForegroundColor Yellow
}

Write-Host "`n🚀 Votre extension XYPH dispose maintenant de:" -ForegroundColor Cyan
Write-Host "   • 5 providers IA différents" -ForegroundColor White
Write-Host "   • Système de fallback intelligent" -ForegroundColor White
Write-Host "   • Sélection automatique du meilleur modèle" -ForegroundColor White

return $results