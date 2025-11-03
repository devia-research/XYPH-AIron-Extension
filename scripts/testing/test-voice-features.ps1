# Test Voice Features - AIron v3.0
# Date: 2025-11-03
# Teste toutes les fonctionnalités vocales

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   TEST VOICE FEATURES - AIron v3.0" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @{
    Total = 0
    Passed = 0
    Failed = 0
    Warnings = 0
}

function Test-Feature {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$Category = "General"
    )
    
    $testResults.Total++
    Write-Host "[$Category] $Name..." -NoNewline
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host " ✓ PASS" -ForegroundColor Green
            $testResults.Passed++
            return $true
        } else {
            Write-Host " ✗ FAIL" -ForegroundColor Red
            $testResults.Failed++
            return $false
        }
    } catch {
        Write-Host " ✗ ERROR: $_" -ForegroundColor Red
        $testResults.Failed++
        return $false
    }
}

function Test-Warning {
    param([string]$Message)
    Write-Host "  ⚠️  $Message" -ForegroundColor Yellow
    $testResults.Warnings++
}

Write-Host "🔍 Phase 1: Vérification des fichiers modifiés" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta
Write-Host ""

# Test 1: Sidebar HTML - Voice UI
Test-Feature "Voice UI section dans sidebar.html" {
    $content = Get-Content "extension\ui\sidebar\sidebar.html" -Raw
    $hasVoiceSection = $content -match '🎤 Assistant Vocal'
    $hasVoiceCommandBtn = $content -match 'id="voiceCommandBtn"'
    $hasVoiceDictationBtn = $content -match 'id="voiceDictationBtn"'
    $hasUploadAudioBtn = $content -match 'id="uploadAudioBtn"'
    $hasRecordAudioBtn = $content -match 'id="recordAudioBtn"'
    $hasAudioInput = $content -match 'id="audioUploadInput"'
    $hasRecordingStatus = $content -match 'id="audioRecordingStatus"'
    $hasVoiceStatus = $content -match 'id="voiceStatus"'
    
    $allPresent = $hasVoiceSection -and $hasVoiceCommandBtn -and $hasVoiceDictationBtn -and 
                  $hasUploadAudioBtn -and $hasRecordAudioBtn -and $hasAudioInput -and 
                  $hasRecordingStatus -and $hasVoiceStatus
    
    if ($allPresent) {
        Write-Host "    ✓ Titre section présent" -ForegroundColor DarkGreen
        Write-Host "    ✓ 4 boutons présents (commande, dictée, upload, record)" -ForegroundColor DarkGreen
        Write-Host "    ✓ Input file audio présent" -ForegroundColor DarkGreen
        Write-Host "    ✓ 2 status divs présents" -ForegroundColor DarkGreen
    }
    
    return $allPresent
} -Category "HTML"

# Test 2: Sidebar JS - State Variables
Test-Feature "Variables d'état vocal dans constructor" {
    $content = Get-Content "extension\ui\sidebar\sidebar.js" -Raw
    $hasRecognition = $content -match 'this\.recognition\s*=\s*null'
    $hasIsListening = $content -match 'this\.isListening\s*=\s*false'
    $hasMediaRecorder = $content -match 'this\.mediaRecorder\s*=\s*null'
    $hasAudioChunks = $content -match 'this\.audioChunks\s*=\s*\[\]'
    $hasRecordingStartTime = $content -match 'this\.recordingStartTime\s*=\s*null'
    $hasRecordingInterval = $content -match 'this\.recordingInterval\s*=\s*null'
    
    $allPresent = $hasRecognition -and $hasIsListening -and $hasMediaRecorder -and 
                  $hasAudioChunks -and $hasRecordingStartTime -and $hasRecordingInterval
    
    if ($allPresent) {
        Write-Host "    ✓ 6 variables d'état initialisées" -ForegroundColor DarkGreen
    }
    
    return $allPresent
} -Category "JavaScript"

# Test 3: Event Listeners
Test-Feature "Event listeners pour boutons vocaux" {
    $content = Get-Content "extension\ui\sidebar\sidebar.js" -Raw
    $hasVoiceCommandListener = $content -match "addListener\('voiceCommandBtn'.*startVoiceCommand"
    $hasDictationListener = $content -match "addListener\('voiceDictationBtn'.*startVoiceDictation"
    $hasUploadListener = $content -match "addListener\('uploadAudioBtn'"
    $hasAudioInputListener = $content -match "addListener\('audioUploadInput'.*handleAudioUpload"
    $hasRecordListener = $content -match "addListener\('recordAudioBtn'.*toggleAudioRecording"
    
    $allPresent = $hasVoiceCommandListener -and $hasDictationListener -and 
                  $hasUploadListener -and $hasAudioInputListener -and $hasRecordListener
    
    if ($allPresent) {
        Write-Host "    ✓ 5 event listeners connectés" -ForegroundColor DarkGreen
    }
    
    return $allPresent
} -Category "JavaScript"

Write-Host ""
Write-Host "🔍 Phase 2: Vérification des méthodes vocales" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta
Write-Host ""

# Test 4-12: Méthodes implémentées
$methods = @(
    @{Name="initSpeechRecognition"; Pattern="initSpeechRecognition\(\)"; Description="Initialisation Speech API"},
    @{Name="startVoiceCommand"; Pattern="async\s+startVoiceCommand\(\)"; Description="Commande vocale"},
    @{Name="stopVoiceRecognition"; Pattern="stopVoiceRecognition\(\)"; Description="Arrêt reconnaissance"},
    @{Name="processVoiceCommand"; Pattern="async\s+processVoiceCommand\("; Description="Traitement commandes"},
    @{Name="startVoiceDictation"; Pattern="async\s+startVoiceDictation\(\)"; Description="Dictée vocale"},
    @{Name="stopVoiceDictation"; Pattern="stopVoiceDictation\(\)"; Description="Arrêt dictée"},
    @{Name="handleAudioUpload"; Pattern="async\s+handleAudioUpload\("; Description="Upload audio"},
    @{Name="getAudioMetadata"; Pattern="async\s+getAudioMetadata\("; Description="Métadonnées audio"},
    @{Name="toggleAudioRecording"; Pattern="async\s+toggleAudioRecording\(\)"; Description="Toggle enregistrement"},
    @{Name="startAudioRecording"; Pattern="async\s+startAudioRecording\(\)"; Description="Démarrage recording"},
    @{Name="stopAudioRecording"; Pattern="stopAudioRecording\(\)"; Description="Arrêt recording"},
    @{Name="processRecordedAudio"; Pattern="async\s+processRecordedAudio\("; Description="Traitement audio enregistré"}
)

$jsContent = Get-Content "extension\ui\sidebar\sidebar.js" -Raw

foreach ($method in $methods) {
    Test-Feature $method.Description {
        $found = $jsContent -match $method.Pattern
        if ($found) {
            Write-Host "    ✓ Méthode $($method.Name) trouvée" -ForegroundColor DarkGreen
        }
        return $found
    } -Category "Méthodes"
}

Write-Host ""
Write-Host "🔍 Phase 3: Vérification des fonctionnalités" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta
Write-Host ""

# Test 13: Commandes vocales supportées
Test-Feature "Mapping des commandes vocales" {
    $hasGenerateCommand = $jsContent -match "lowerCommand\.includes\('génère'\)"
    $hasAnalyzeImageCommand = $jsContent -match "lowerCommand\.includes\('analyse'\).*image"
    $hasSearchCommand = $jsContent -match "lowerCommand\.includes\('recherche'\)"
    $hasFillFormCommand = $jsContent -match "lowerCommand\.includes\('remplis'\)"
    $hasNavigateCommand = $jsContent -match "lowerCommand\.includes\('navigue'\)"
    $hasSaveCommand = $jsContent -match "lowerCommand\.includes\('sauvegarde'\)"
    $hasCopyCommand = $jsContent -match "lowerCommand\.includes\('copie'\)"
    $hasClearCommand = $jsContent -match "lowerCommand\.includes\('efface'\)"
    
    $commandCount = @($hasGenerateCommand, $hasAnalyzeImageCommand, $hasSearchCommand, 
                      $hasFillFormCommand, $hasNavigateCommand, $hasSaveCommand, 
                      $hasCopyCommand, $hasClearCommand) | Where-Object {$_} | Measure-Object | Select-Object -ExpandProperty Count
    
    if ($commandCount -ge 8) {
        Write-Host "    ✓ $commandCount commandes vocales détectées" -ForegroundColor DarkGreen
    }
    
    return $commandCount -ge 8
} -Category "Fonctionnalités"

# Test 14: Web Speech API support
Test-Feature "Vérification compatibilité Web Speech API" {
    $hasWebkitCheck = $jsContent -match "webkitSpeechRecognition"
    $hasSpeechRecognitionCheck = $jsContent -match "SpeechRecognition"
    $hasCompatibilityCheck = $jsContent -match "La reconnaissance vocale n'est pas supportée"
    
    $allChecks = $hasWebkitCheck -and $hasSpeechRecognitionCheck -and $hasCompatibilityCheck
    
    if ($allChecks) {
        Write-Host "    ✓ Détection compatibilité navigateur" -ForegroundColor DarkGreen
    }
    
    return $allChecks
} -Category "Fonctionnalités"

# Test 15: Whisper API integration
Test-Feature "Intégration Whisper API (OpenAI)" {
    $hasWhisperEndpoint = $jsContent -match "audio/transcriptions"
    $hasWhisperModel = $jsContent -match "whisper-1"
    $hasFormData = $jsContent -match "new FormData\(\)"
    $hasFileAppend = $jsContent -match "formData\.append\('file'"
    
    $allPresent = $hasWhisperEndpoint -and $hasWhisperModel -and $hasFormData -and $hasFileAppend
    
    if ($allPresent) {
        Write-Host "    ✓ Whisper API configuré" -ForegroundColor DarkGreen
    }
    
    return $allPresent
} -Category "Fonctionnalités"

# Test 16: MediaRecorder API
Test-Feature "Gestion enregistrement microphone" {
    $hasGetUserMedia = $jsContent -match "navigator\.mediaDevices\.getUserMedia"
    $hasMediaRecorder = $jsContent -match "new MediaRecorder\(stream\)"
    $hasAudioChunks = $jsContent -match "this\.audioChunks\.push"
    $hasTimer = $jsContent -match "recordingInterval.*setInterval"
    
    $allPresent = $hasGetUserMedia -and $hasMediaRecorder -and $hasAudioChunks -and $hasTimer
    
    if ($allPresent) {
        Write-Host "    ✓ Enregistrement microphone configuré" -ForegroundColor DarkGreen
    }
    
    return $allPresent
} -Category "Fonctionnalités"

Write-Host ""
Write-Host "🔍 Phase 4: Vérification gestion d'erreurs" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta
Write-Host ""

# Test 17: Error handling
Test-Feature "Gestion d'erreurs complète" {
    $hasRecognitionError = $jsContent -match "recognition\.onerror"
    $hasMicrophoneError = $jsContent -match "Erreur d'accès au microphone"
    $hasAPIError = $jsContent -match "Erreur API"
    $hasTryCatch = ($jsContent | Select-String -Pattern "try\s*{" -AllMatches).Matches.Count -ge 3
    
    $allPresent = $hasRecognitionError -and $hasMicrophoneError -and $hasAPIError -and $hasTryCatch
    
    if ($allPresent) {
        Write-Host "    ✓ Gestion d'erreurs implémentée" -ForegroundColor DarkGreen
    }
    
    return $allPresent
} -Category "Qualité"

# Test 18: UI feedback
Test-Feature "Feedback utilisateur (status, timer)" {
    $hasVoiceStatus = $jsContent -match "voiceStatus.*style\.display"
    $hasRecordingTimer = $jsContent -match "recordingTimer\.textContent"
    $hasButtonUpdate = $jsContent -match "classList\.(add|remove)\('btn-danger'\)"
    
    $allPresent = $hasVoiceStatus -and $hasRecordingTimer -and $hasButtonUpdate
    
    if ($allPresent) {
        Write-Host "    ✓ Feedback UI présent" -ForegroundColor DarkGreen
    }
    
    return $allPresent
} -Category "Qualité"

# Test 19: Langue française
Test-Feature "Configuration langue française" {
    $hasFrenchLang = $jsContent -match 'recognition\.lang\s*=\s*.*fr-FR'
    
    if ($hasFrenchLang) {
        Write-Host "    ✓ Reconnaissance vocale en français" -ForegroundColor DarkGreen
    }
    
    return $hasFrenchLang
} -Category "Qualité"

Write-Host ""
Write-Host "🔍 Phase 5: Analyse de code" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta
Write-Host ""

# Test 20: Code quality
$jsLines = Get-Content "extension\ui\sidebar\sidebar.js"
$voiceMethodsStart = ($jsLines | Select-String -Pattern "VOICE ASSISTANT METHODS" | Select-Object -First 1).LineNumber
$voiceMethodsEnd = ($jsLines | Select-String -Pattern "// Initialisation" | Select-Object -First 1).LineNumber

if ($voiceMethodsStart -and $voiceMethodsEnd) {
    $voiceCodeLines = $voiceMethodsEnd - $voiceMethodsStart
    Write-Host "  📊 Lignes de code vocal: $voiceCodeLines" -ForegroundColor Cyan
    
    if ($voiceCodeLines -ge 300) {
        Write-Host "    ✓ Implémentation complète (300+ lignes)" -ForegroundColor Green
        $testResults.Passed++
    } else {
        Test-Warning "Implémentation semble incomplète ($voiceCodeLines lignes)"
    }
    $testResults.Total++
}

# Count methods
$methodCount = ($methods | ForEach-Object { 
    if ($jsContent -match $_.Pattern) { 1 } else { 0 }
}) | Measure-Object -Sum | Select-Object -ExpandProperty Sum

Write-Host "  📊 Méthodes implémentées: $methodCount / $($methods.Count)" -ForegroundColor Cyan

# Check HTML size
$htmlContent = Get-Content "extension\ui\sidebar\sidebar.html" -Raw
$htmlLines = ($htmlContent -split "`n").Count
Write-Host "  📊 Lignes HTML totales: $htmlLines" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔍 Phase 6: Recommandations" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta
Write-Host ""

# Vérifier permissions manifest
$manifestContent = Get-Content "extension\manifest.json" -Raw
$hasMicrophonePermission = $manifestContent -match '"microphone"'

if (-not $hasMicrophonePermission) {
    Test-Warning "Permission 'microphone' non trouvée dans manifest.json"
    Write-Host "    💡 Peut être nécessaire pour certains navigateurs" -ForegroundColor Yellow
    Write-Host "    💡 Web Speech API fonctionne souvent sans cette permission" -ForegroundColor Yellow
}

# Vérifier si Whisper API doc est présente
Write-Host ""
Write-Host "  📝 Pour tester l'extension:" -ForegroundColor Cyan
Write-Host "    1. Rechargez l'extension dans Chrome (chrome://extensions)" -ForegroundColor White
Write-Host "    2. Ouvrez la sidebar AIron" -ForegroundColor White
Write-Host "    3. Testez 'Commande Vocale' avec: 'génère un script hello world'" -ForegroundColor White
Write-Host "    4. Testez 'Dictée' pour transcrire du texte" -ForegroundColor White
Write-Host "    5. Pour Whisper: Configurez votre clé OpenAI" -ForegroundColor White
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   RÉSULTATS DES TESTS" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$passRate = [math]::Round(($testResults.Passed / $testResults.Total) * 100, 2)

Write-Host "Total tests:    $($testResults.Total)" -ForegroundColor White
Write-Host "Réussis:        $($testResults.Passed)" -ForegroundColor Green
Write-Host "Échoués:        $($testResults.Failed)" -ForegroundColor $(if($testResults.Failed -gt 0){"Red"}else{"Gray"})
Write-Host "Avertissements: $($testResults.Warnings)" -ForegroundColor Yellow
Write-Host "Taux de réussite: $passRate%" -ForegroundColor $(if($passRate -ge 90){"Green"}elseif($passRate -ge 70){"Yellow"}else{"Red"})
Write-Host ""

if ($passRate -eq 100) {
    Write-Host "✅ PARFAIT! Toutes les fonctionnalités vocales sont implémentées!" -ForegroundColor Green
} elseif ($passRate -ge 90) {
    Write-Host "✅ EXCELLENT! L'implémentation vocale est quasi-complète!" -ForegroundColor Green
} elseif ($passRate -ge 70) {
    Write-Host "⚠️  BON, mais certains éléments manquent" -ForegroundColor Yellow
} else {
    Write-Host "❌ ATTENTION: Implémentation incomplète" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Export results
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$resultsPath = "tests\results\voice-test-results-$timestamp.json"

$resultsObject = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    summary = $testResults
    passRate = $passRate
    voiceCodeLines = $voiceCodeLines
    methodsImplemented = $methodCount
    totalMethods = $methods.Count
}

$resultsObject | ConvertTo-Json -Depth 10 | Out-File $resultsPath -Encoding UTF8

Write-Host "Resultats sauvegardes: $resultsPath" -ForegroundColor Cyan
Write-Host ""
