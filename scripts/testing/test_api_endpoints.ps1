# 🔍 Test des URLs API - Vérification des Endpoints

Write-Host "🔍 Test des URLs API pour XYPH" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

$testResults = @()

function Test-ApiEndpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "🌐 Test de $Name..." -ForegroundColor Blue
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            TimeoutSec = 10
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        $result = @{
            Name = $Name
            Url = $Url
            Status = "OK"
            StatusCode = $response.StatusCode
            Details = "Endpoint accessible"
        }
        
        Write-Host "   ✅ $Name : OK (Code $($response.StatusCode))" -ForegroundColor Green
        
    } catch {
        $errorMessage = $_.Exception.Message
        $statusCode = "N/A"
        
        # Extraire le code d'erreur HTTP si disponible
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        
        $result = @{
            Name = $Name
            Url = $Url
            Status = "Error"
            StatusCode = $statusCode
            Details = $errorMessage
        }
        
        # Analyser le type d'erreur
        if ($errorMessage -match "401|Unauthorized") {
            Write-Host "   🔑 $Name : Nécessite authentification (Code 401)" -ForegroundColor Yellow
            $result.Status = "Auth Required"
        } elseif ($errorMessage -match "404|Not Found") {
            Write-Host "   ❌ $Name : Endpoint non trouvé (Code 404)" -ForegroundColor Red
        } elseif ($errorMessage -match "timeout") {
            Write-Host "   ⏱️ $Name : Timeout" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ $Name : Erreur - $errorMessage" -ForegroundColor Red
        }
    }
    
    return $result
}

# Tests des différentes URLs DeepSeek
Write-Host "🧠 Test des endpoints DeepSeek" -ForegroundColor Magenta
Write-Host "==============================" -ForegroundColor Magenta

$deepseekUrls = @(
    @{ Name = "DeepSeek v1"; Url = "https://api.deepseek.com/v1/chat/completions" },
    @{ Name = "DeepSeek direct"; Url = "https://api.deepseek.com/chat/completions" },
    @{ Name = "DeepSeek base"; Url = "https://api.deepseek.com" },
    @{ Name = "DeepSeek models"; Url = "https://api.deepseek.com/v1/models" },
    @{ Name = "DeepSeek health"; Url = "https://api.deepseek.com/health" }
)

foreach ($endpoint in $deepseekUrls) {
    $result = Test-ApiEndpoint -Name $endpoint.Name -Url $endpoint.Url
    $testResults += $result
}

Write-Host ""

# Test Ollama local
Write-Host "🏠 Test Ollama local" -ForegroundColor Magenta
Write-Host "===================" -ForegroundColor Magenta

$ollamaUrls = @(
    @{ Name = "Ollama Health"; Url = "http://localhost:11434" },
    @{ Name = "Ollama API"; Url = "http://localhost:11434/api/tags" },
    @{ Name = "Ollama Chat"; Url = "http://localhost:11434/api/chat" },
    @{ Name = "Ollama Generate"; Url = "http://localhost:11434/api/generate" }
)

foreach ($endpoint in $ollamaUrls) {
    $result = Test-ApiEndpoint -Name $endpoint.Name -Url $endpoint.Url
    $testResults += $result
}

Write-Host ""

# Test Groq
Write-Host "⚡ Test Groq" -ForegroundColor Magenta
Write-Host "============" -ForegroundColor Magenta

$groqUrls = @(
    @{ Name = "Groq API"; Url = "https://api.groq.com/openai/v1/chat/completions" },
    @{ Name = "Groq Models"; Url = "https://api.groq.com/openai/v1/models" }
)

foreach ($endpoint in $groqUrls) {
    $result = Test-ApiEndpoint -Name $endpoint.Name -Url $endpoint.Url
    $testResults += $result
}

Write-Host ""

# Test OpenAI
Write-Host "🔥 Test OpenAI" -ForegroundColor Magenta
Write-Host "==============" -ForegroundColor Magenta

$openaiUrls = @(
    @{ Name = "OpenAI API"; Url = "https://api.openai.com/v1/chat/completions" },
    @{ Name = "OpenAI Models"; Url = "https://api.openai.com/v1/models" }
)

foreach ($endpoint in $openaiUrls) {
    $result = Test-ApiEndpoint -Name $endpoint.Name -Url $endpoint.Url
    $testResults += $result
}

Write-Host ""

# Résumé des résultats
Write-Host "📊 Résumé des Tests" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green

$accessible = $testResults | Where-Object { $_.Status -eq "OK" -or $_.Status -eq "Auth Required" }
$errors = $testResults | Where-Object { $_.Status -eq "Error" }

Write-Host "✅ Endpoints accessibles : $($accessible.Count)" -ForegroundColor Green
Write-Host "❌ Endpoints en erreur : $($errors.Count)" -ForegroundColor Red

if ($accessible.Count -gt 0) {
    Write-Host ""
    Write-Host "🌟 Endpoints fonctionnels :" -ForegroundColor Green
    foreach ($endpoint in $accessible) {
        Write-Host "   • $($endpoint.Name) : $($endpoint.Url)" -ForegroundColor Gray
    }
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️ Endpoints problématiques :" -ForegroundColor Yellow
    foreach ($endpoint in $errors) {
        Write-Host "   • $($endpoint.Name) : $($endpoint.Details)" -ForegroundColor Red
    }
}

# Recommandations spécifiques
Write-Host ""
Write-Host "💡 Recommandations :" -ForegroundColor Cyan

# Vérifier DeepSeek
$deepseekWorking = $accessible | Where-Object { $_.Name -like "*DeepSeek*" }
if ($deepseekWorking) {
    $bestDeepSeek = $deepseekWorking | Select-Object -First 1
    Write-Host "   🧠 DeepSeek : Utiliser $($bestDeepSeek.Url)" -ForegroundColor Green
} else {
    Write-Host "   🧠 DeepSeek : Aucun endpoint accessible - vérifier la documentation officielle" -ForegroundColor Red
}

# Vérifier Ollama
$ollamaWorking = $accessible | Where-Object { $_.Name -like "*Ollama*" }
if ($ollamaWorking) {
    Write-Host "   🏠 Ollama : Service local détecté et fonctionnel" -ForegroundColor Green
} else {
    Write-Host "   🏠 Ollama : Service local non démarré - installer ou lancer Ollama" -ForegroundColor Yellow
}

# Vérifier Groq
$groqWorking = $accessible | Where-Object { $_.Name -like "*Groq*" }
if ($groqWorking) {
    Write-Host "   ⚡ Groq : API accessible" -ForegroundColor Green
} else {
    Write-Host "   ⚡ Groq : Vérifier la connectivité internet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Actions suggérées :" -ForegroundColor Blue

if (-not $ollamaWorking) {
    Write-Host "   1. Installer Ollama : https://ollama.ai/download" -ForegroundColor Gray
    Write-Host "   2. Lancer Ollama : ollama serve" -ForegroundColor Gray
}

if (-not $deepseekWorking) {
    Write-Host "   3. Vérifier la documentation DeepSeek officielle" -ForegroundColor Gray
    Write-Host "   4. Tester avec une clé API valide" -ForegroundColor Gray
}

Write-Host "   5. Utiliser Groq comme alternative rapide" -ForegroundColor Gray
Write-Host "   6. Configurer les fallbacks dans XYPH" -ForegroundColor Gray

# Sauvegarder les résultats
$reportPath = "F:\Git\XYPH-Project\api_endpoints_test.json"
$testResults | ConvertTo-Json -Depth 2 | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host ""
Write-Host "📁 Rapport sauvegardé : $reportPath" -ForegroundColor Gray

# Générer la configuration mise à jour
Write-Host ""
Write-Host "⚙️ Configuration mise à jour pour XYPH :" -ForegroundColor Yellow

$workingEndpoints = $accessible | Where-Object { $_.Status -eq "Auth Required" }

if ($workingEndpoints) {
    Write-Host ""
    Write-Host "// Configuration XYPH avec URLs validées" -ForegroundColor Green
    Write-Host "const VALIDATED_CONFIG = {" -ForegroundColor Gray
    
    foreach ($endpoint in $workingEndpoints) {
        if ($endpoint.Name -like "*DeepSeek*") {
            Write-Host "    deepseek: { apiUrl: '$($endpoint.Url)' }," -ForegroundColor Gray
        } elseif ($endpoint.Name -like "*Groq*") {
            Write-Host "    groq: { apiUrl: '$($endpoint.Url)' }," -ForegroundColor Gray
        } elseif ($endpoint.Name -like "*OpenAI*") {
            Write-Host "    openai: { apiUrl: '$($endpoint.Url)' }," -ForegroundColor Gray
        }
    }
    
    Write-Host "};" -ForegroundColor Gray
}