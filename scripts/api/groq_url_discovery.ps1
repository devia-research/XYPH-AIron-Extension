# 🔍 Recherche exhaustive des URLs Groq fonctionnelles
# Teste plusieurs variantes d'URLs pour Groq

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    
    $colorMap = @{
        'Red' = 'Red'; 'Green' = 'Green'; 'Yellow' = 'Yellow'
        'Blue' = 'Blue'; 'Magenta' = 'Magenta'; 'Cyan' = 'Cyan'
        'White' = 'White'
    }
    
    Write-Host $Message -ForegroundColor $colorMap[$Color]
}

function Test-QuickEndpoint {
    param([string]$Url)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method HEAD -TimeoutSec 10 -ErrorAction SilentlyContinue
        return @{
            StatusCode = $response.StatusCode
            Success = $true
            Message = "Endpoint accessible"
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        return @{
            StatusCode = $statusCode
            Success = ($statusCode -ne 404)
            Message = $_.Exception.Message
        }
    }
}

# URLs Groq à tester (toutes les variantes possibles)
$GROQ_URLS_TO_TEST = @(
    "https://api.groq.com/openai/v1/chat/completions",
    "https://api.groq.com/v1/chat/completions", 
    "https://api.groq.com/chat/completions",
    "https://api.groq.com/openai/v1/models",
    "https://api.groq.com/v1/models",
    "https://api.groq.com/models",
    "https://api.groq.com",
    "https://api.groq.com/v1",
    "https://api.groq.com/openai",
    "https://api.groq.com/openai/v1",
    "https://console.groq.com/docs/api-reference#chat-create",
    "https://groq.com/api/v1/chat/completions"
)

Write-ColorOutput "🔍 RECHERCHE EXHAUSTIVE URLs GROQ" "Magenta"
Write-ColorOutput "==================================" "Magenta"

Write-ColorOutput "`nTest de toutes les variantes d'URLs Groq..." "Cyan"

$workingUrls = @()
$failingUrls = @()

foreach ($url in $GROQ_URLS_TO_TEST) {
    Write-ColorOutput "`n🌐 Test: $url" "Blue"
    
    $result = Test-QuickEndpoint -Url $url
    
    switch ($result.StatusCode) {
        200 { 
            Write-ColorOutput "   ✅ 200 - FONCTIONNE PARFAITEMENT" "Green"
            $workingUrls += $url
        }
        401 { 
            Write-ColorOutput "   ✅ 401 - URL VALIDE (nécessite auth)" "Green"
            $workingUrls += $url
        }
        400 { 
            Write-ColorOutput "   ✅ 400 - URL VALIDE (format requête)" "Green"
            $workingUrls += $url
        }
        403 { 
            Write-ColorOutput "   ⚠️  403 - Accès refusé" "Yellow"
        }
        404 { 
            Write-ColorOutput "   ❌ 404 - URL INEXISTANTE" "Red"
            $failingUrls += $url
        }
        429 { 
            Write-ColorOutput "   ⚠️  429 - Rate limited" "Yellow"
        }
        default { 
            Write-ColorOutput "   ❓ $($result.StatusCode) - Statut inattendu" "Yellow"
        }
    }
}

# Recherche sur la documentation officielle Groq
Write-ColorOutput "`n📚 Recherche documentation Groq..." "Cyan"

$docUrls = @(
    "https://console.groq.com/docs",
    "https://console.groq.com/docs/quickstart",
    "https://console.groq.com/docs/api-reference",
    "https://groq.com/docs"
)

foreach ($url in $docUrls) {
    $result = Test-QuickEndpoint -Url $url
    if ($result.Success) {
        Write-ColorOutput "   ✅ Documentation accessible: $url" "Green"
    } else {
        Write-ColorOutput "   ❌ Documentation inaccessible: $url" "Red"
    }
}

# Résumé
Write-ColorOutput "`n📊 RÉSUMÉ DE LA RECHERCHE" "Magenta"
Write-ColorOutput "==========================" "Magenta"

Write-ColorOutput "`n✅ URLs FONCTIONNELLES ($($workingUrls.Count)):" "Green"
foreach ($url in $workingUrls) {
    Write-ColorOutput "   • $url" "White"
}

Write-ColorOutput "`n❌ URLs NON FONCTIONNELLES ($($failingUrls.Count)):" "Red"
foreach ($url in $failingUrls) {
    Write-ColorOutput "   • $url" "White"
}

# Recommandation basée sur les résultats
Write-ColorOutput "`n🎯 RECOMMANDATION:" "Magenta"

if ($workingUrls.Count -gt 0) {
    $recommendedUrl = $workingUrls | Where-Object { $_ -like "*chat/completions*" } | Select-Object -First 1
    if (-not $recommendedUrl) {
        $recommendedUrl = $workingUrls[0]
    }
    
    Write-ColorOutput "   🚀 URL recommandée: $recommendedUrl" "Green"
    Write-ColorOutput "   💡 Utiliser cette URL dans XYPH" "Cyan"
} else {
    Write-ColorOutput "   ⚠️  Aucune URL Groq ne fonctionne actuellement" "Yellow"
    Write-ColorOutput "   🔧 Vérifier la documentation officielle ou utiliser une alternative" "Cyan"
}

Write-ColorOutput "`n📝 Note: Groq peut avoir des endpoints différents selon la région ou l'authentification" "Blue"