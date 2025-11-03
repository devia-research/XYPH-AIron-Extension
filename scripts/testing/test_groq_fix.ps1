# 🧪 Test spécifique pour valider l'URL Groq corrigée
# Vérifie que l'URL problématique a été résolue

param(
    [string]$ApiKey = "",
    [switch]$DetailedOutput
)

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

function Test-GroqEndpoint {
    param([string]$Url, [string]$ApiKey)
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($ApiKey) {
        $headers["Authorization"] = "Bearer $ApiKey"
    }
    
    $body = @{
        model = "llama3-70b-8192"
        messages = @(
            @{
                role = "user"
                content = "Hello, test message"
            }
        )
        max_tokens = 10
    } | ConvertTo-Json -Depth 4
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method POST -Headers $headers -Body $body -TimeoutSec 15
        return @{
            Success = $true
            StatusCode = 200
            Message = "API fonctionne correctement"
            Response = $response
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        # 401 = Normal sans clé API ou clé invalide
        # 404 = URL incorrecte
        # 400 = Problème de format de requête mais URL correcte
        
        return @{
            Success = ($statusCode -ne 404)  # 404 = URL incorrecte, autres codes = URL correcte
            StatusCode = $statusCode
            Message = $errorMessage
            IsUrlCorrect = ($statusCode -ne 404)
        }
    }
}

# URLs à tester
$URLS_TO_TEST = @{
    "Groq Correct (v1)" = "https://api.groq.com/v1/chat/completions"
    "Groq Incorrect (openai)" = "https://api.groq.com/openai/v1/chat/completions"
}

Write-ColorOutput "🧪 TEST DE VALIDATION GROQ URL" "Magenta"
Write-ColorOutput "===============================" "Magenta"

Write-ColorOutput "`n🔍 Test des endpoints Groq..." "Cyan"

$testResults = @{}

foreach ($testName in $URLS_TO_TEST.Keys) {
    $url = $URLS_TO_TEST[$testName]
    Write-ColorOutput "`n🌐 Test: $testName" "Blue"
    Write-ColorOutput "   URL: $url" "White"
    
    $result = Test-GroqEndpoint -Url $url -ApiKey $ApiKey
    $testResults[$testName] = $result
    
    if ($result.StatusCode -eq 404) {
        Write-ColorOutput "   ❌ URL INCORRECTE (404 Not Found)" "Red"
    } elseif ($result.StatusCode -eq 401) {
        Write-ColorOutput "   ✅ URL CORRECTE (401 = Nécessite authentification)" "Green"
    } elseif ($result.StatusCode -eq 400) {
        Write-ColorOutput "   ✅ URL CORRECTE (400 = Format de requête)" "Green"
    } elseif ($result.Success) {
        Write-ColorOutput "   ✅ URL CORRECTE ET FONCTIONNE" "Green"
    } else {
        Write-ColorOutput "   ⚠️  Statut inattendu: $($result.StatusCode)" "Yellow"
    }
    
    if ($DetailedOutput) {
        Write-ColorOutput "      Détails: $($result.Message)" "White"
    }
}

# Vérification dans les fichiers
Write-ColorOutput "`n📁 Vérification dans les fichiers XYPH..." "Cyan"

$filesToCheck = @(
    "F:\Scripts\ExtensionChrome\popup.js",
    "F:\Scripts\ExtensionChrome\background.js", 
    "F:\Scripts\ExtensionChrome\sidebar.js",
    "F:\Git\XYPH-Project\API_KEYS_GUIDE.md"
)

$incorrectUrlFound = $false

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        if ($content -like "*api.groq.com/openai/*") {
            Write-ColorOutput "   ❌ URL incorrecte trouvée dans: $file" "Red"
            $incorrectUrlFound = $true
            
            # Montrer les lignes problématiques
            $lines = Get-Content $file
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -like "*api.groq.com/openai/*") {
                    Write-ColorOutput "      Ligne $($i+1): $($lines[$i].Trim())" "Yellow"
                }
            }
        } else {
            Write-ColorOutput "   ✅ Aucune URL incorrecte dans: $(Split-Path $file -Leaf)" "Green"
        }
    }
}

# Résumé final
Write-ColorOutput "`n📊 RÉSUMÉ DU TEST" "Magenta"
Write-ColorOutput "=================" "Magenta"

$correctUrlWorks = $testResults["Groq Correct (v1)"].IsUrlCorrect
$incorrectUrlFails = -not $testResults["Groq Incorrect (openai)"].IsUrlCorrect

Write-ColorOutput "`n🔗 Test des URLs:" "Blue"
if ($correctUrlWorks) {
    Write-ColorOutput "   ✅ URL correcte fonctionne: https://api.groq.com/v1/chat/completions" "Green"
} else {
    Write-ColorOutput "   ❌ URL correcte ne fonctionne pas" "Red"
}

if ($incorrectUrlFails) {
    Write-ColorOutput "   ✅ URL incorrecte échoue: https://api.groq.com/openai/v1/chat/completions" "Green"
} else {
    Write-ColorOutput "   ❌ URL incorrecte fonctionne encore (problème!)" "Red"
}

Write-ColorOutput "`n📁 Vérification fichiers:" "Blue"
if (-not $incorrectUrlFound) {
    Write-ColorOutput "   ✅ Aucune URL incorrecte dans les fichiers XYPH" "Green"
} else {
    Write-ColorOutput "   ❌ URLs incorrectes trouvées dans les fichiers" "Red"
}

# Verdict final
$allGood = $correctUrlWorks -and $incorrectUrlFails -and (-not $incorrectUrlFound)

Write-ColorOutput "`n🎯 VERDICT FINAL:" "Magenta"
if ($allGood) {
    Write-ColorOutput "   ✅ PROBLÈME GROQ RÉSOLU!" "Green"
    Write-ColorOutput "   🚀 XYPH est prêt avec les URLs corrigées" "Green"
} else {
    Write-ColorOutput "   ❌ PROBLÈME PERSISTANT" "Red"
    Write-ColorOutput "   🔧 Actions nécessaires identifiées ci-dessus" "Yellow"
}

Write-ColorOutput "`n💡 Note: Les codes 401/400 sont normaux sans clé API valide" "Cyan"