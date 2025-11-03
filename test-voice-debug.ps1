# Script de debug pour tester la fonction vocale
# Date: 2025-11-03

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEBUG VOICE ASSISTANT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que les fichiers sont bien modifiés
Write-Host "1. Vérification des fichiers..." -ForegroundColor Yellow
Write-Host ""

$jsContent = Get-Content "extension\ui\sidebar\sidebar.js" -Raw

# Vérifier la méthode startVoiceCommand
if ($jsContent -match "async startVoiceCommand\(\)") {
    Write-Host "  ✅ Méthode startVoiceCommand trouvée" -ForegroundColor Green
} else {
    Write-Host "  ❌ Méthode startVoiceCommand MANQUANTE" -ForegroundColor Red
}

# Vérifier l'event listener
if ($jsContent -match "addListener\('voiceCommandBtn'") {
    Write-Host "  ✅ Event listener voiceCommandBtn trouvé" -ForegroundColor Green
} else {
    Write-Host "  ❌ Event listener voiceCommandBtn MANQUANT" -ForegroundColor Red
}

# Vérifier le HTML
$htmlContent = Get-Content "extension\ui\sidebar\sidebar.html" -Raw
if ($htmlContent -match 'id="voiceCommandBtn"') {
    Write-Host "  ✅ Bouton voiceCommandBtn trouvé dans HTML" -ForegroundColor Green
} else {
    Write-Host "  ❌ Bouton voiceCommandBtn MANQUANT dans HTML" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Vérification console Chrome..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Pour voir les erreurs JavaScript:" -ForegroundColor White
Write-Host "  1. Ouvrez Chrome: chrome://extensions" -ForegroundColor Gray
Write-Host "  2. Trouvez AIron et cliquez 'Recharger' ⟳" -ForegroundColor Gray
Write-Host "  3. Ouvrez la sidebar AIron" -ForegroundColor Gray
Write-Host "  4. Appuyez F12 pour ouvrir DevTools" -ForegroundColor Gray
Write-Host "  5. Onglet 'Console'" -ForegroundColor Gray
Write-Host "  6. Cliquez sur '🎤 Commande Vocale'" -ForegroundColor Gray
Write-Host "  7. Regardez si des erreurs s'affichent en rouge" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Test de syntaxe JavaScript..." -ForegroundColor Yellow
Write-Host ""

# Vérifier les accolades
$openBraces = ($jsContent | Select-String -Pattern "{" -AllMatches).Matches.Count
$closeBraces = ($jsContent | Select-String -Pattern "}" -AllMatches).Matches.Count

Write-Host "  Accolades ouvertes: $openBraces" -ForegroundColor Cyan
Write-Host "  Accolades fermées: $closeBraces" -ForegroundColor Cyan

if ($openBraces -eq $closeBraces) {
    Write-Host "  ✅ Équilibre des accolades OK" -ForegroundColor Green
} else {
    Write-Host "  ❌ PROBLÈME: Accolades déséquilibrées!" -ForegroundColor Red
    Write-Host "  Différence: $($openBraces - $closeBraces)" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Vérification de l'extension dans le navigateur..." -ForegroundColor Yellow
Write-Host ""

# Créer un fichier HTML de test
$testHtml = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Voice Assistant</title>
</head>
<body>
    <h1>Test Voice Assistant - AIron</h1>
    
    <button id="voiceCommandBtn" style="padding: 20px; font-size: 18px; cursor: pointer;">
        🎤 Commande Vocale
    </button>
    
    <div id="voiceStatus" style="display: none; margin-top: 20px; padding: 10px; background: #d1ecf1;">
        <span id="voiceStatusText">🎤 Écoute...</span>
    </div>
    
    <div id="result" style="margin-top: 20px; padding: 10px; background: #f8f9fa;"></div>
    
    <script>
        class VoiceTest {
            constructor() {
                this.recognition = null;
                this.isListening = false;
                this.init();
            }
            
            init() {
                document.getElementById('voiceCommandBtn').addEventListener('click', () => {
                    this.startVoiceCommand();
                });
            }
            
            initSpeechRecognition() {
                if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                    document.getElementById('result').innerHTML = '❌ La reconnaissance vocale n\'est pas supportée par ce navigateur.<br>Utilisez Chrome, Edge ou Safari.';
                    return null;
                }

                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                
                recognition.lang = 'fr-FR';
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;

                return recognition;
            }
            
            async startVoiceCommand() {
                console.log('🎤 startVoiceCommand appelée!');
                
                if (!this.recognition) {
                    console.log('🔧 Initialisation de SpeechRecognition...');
                    this.recognition = this.initSpeechRecognition();
                    if (!this.recognition) {
                        console.log('❌ SpeechRecognition non disponible');
                        return;
                    }
                }

                if (this.isListening) {
                    console.log('⏸️ Arrêt de l\'écoute...');
                    this.stopVoiceRecognition();
                    return;
                }

                const voiceStatus = document.getElementById('voiceStatus');
                const voiceStatusText = document.getElementById('voiceStatusText');
                
                voiceStatus.style.display = 'block';
                voiceStatusText.textContent = '🎤 Écoute... Dites votre commande';
                
                this.isListening = true;
                document.getElementById('voiceCommandBtn').textContent = '⏸️ Arrêter';
                
                console.log('🎤 Démarrage de l\'écoute...');

                this.recognition.onresult = async (event) => {
                    const transcript = event.results[0][0].transcript;
                    console.log('📝 Transcription reçue:', transcript);
                    
                    voiceStatusText.textContent = `📝 Commande reçue: "${transcript}"`;
                    document.getElementById('result').innerHTML = `<strong>Vous avez dit:</strong><br>${transcript}`;
                    
                    setTimeout(() => {
                        voiceStatus.style.display = 'none';
                        this.stopVoiceRecognition();
                    }, 3000);
                };

                this.recognition.onerror = (event) => {
                    console.error('❌ Erreur de reconnaissance vocale:', event.error);
                    voiceStatusText.textContent = `❌ Erreur: ${event.error}`;
                    document.getElementById('result').innerHTML = `❌ Erreur: ${event.error}`;
                    
                    setTimeout(() => {
                        voiceStatus.style.display = 'none';
                        this.stopVoiceRecognition();
                    }, 3000);
                };

                this.recognition.onend = () => {
                    console.log('🔚 Reconnaissance terminée');
                    if (this.isListening) {
                        voiceStatus.style.display = 'none';
                        this.stopVoiceRecognition();
                    }
                };

                try {
                    this.recognition.start();
                    console.log('✅ Reconnaissance démarrée!');
                } catch (error) {
                    console.error('❌ Erreur de démarrage:', error);
                    document.getElementById('result').innerHTML = `❌ Erreur: ${error.message}`;
                    this.stopVoiceRecognition();
                }
            }
            
            stopVoiceRecognition() {
                console.log('⏹️ stopVoiceRecognition appelée');
                this.isListening = false;
                document.getElementById('voiceCommandBtn').textContent = '🎤 Commande Vocale';
                
                if (this.recognition) {
                    try {
                        this.recognition.stop();
                        console.log('✅ Reconnaissance arrêtée');
                    } catch (e) {
                        console.log('⚠️ Reconnaissance déjà arrêtée');
                    }
                }
            }
        }
        
        // Initialisation
        console.log('🚀 Initialisation du test vocal...');
        const test = new VoiceTest();
        console.log('✅ Test vocal prêt!');
    </script>
</body>
</html>
"@

$testHtml | Out-File "test-voice-standalone.html" -Encoding UTF8

Write-Host "  ✅ Fichier de test créé: test-voice-standalone.html" -ForegroundColor Green
Write-Host ""

Write-Host "5. INSTRUCTIONS DE TEST:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Option A - Test autonome (recommandé):" -ForegroundColor White
Write-Host "  1. Ouvrez le fichier: test-voice-standalone.html" -ForegroundColor Gray
Write-Host "  2. Appuyez F12 pour ouvrir Console" -ForegroundColor Gray
Write-Host "  3. Cliquez '🎤 Commande Vocale'" -ForegroundColor Gray
Write-Host "  4. Parlez quand Chrome demande permission micro" -ForegroundColor Gray
Write-Host "  5. Vérifiez les logs dans Console" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 Option B - Test dans l'extension:" -ForegroundColor White
Write-Host "  1. Chrome → chrome://extensions" -ForegroundColor Gray
Write-Host "  2. Trouvez 'AIron' et cliquez ⟳ RECHARGER" -ForegroundColor Gray
Write-Host "  3. Ouvrez la sidebar AIron" -ForegroundColor Gray
Write-Host "  4. F12 → Onglet Console" -ForegroundColor Gray
Write-Host "  5. Tapez: document.getElementById('voiceCommandBtn')" -ForegroundColor Gray
Write-Host "  6. Si 'null' → le bouton n'existe pas!" -ForegroundColor Gray
Write-Host "  7. Cliquez '🎤 Commande Vocale'" -ForegroundColor Gray
Write-Host "  8. Regardez les erreurs en rouge dans Console" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Lancez le test maintenant!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Proposer d'ouvrir le fichier
$response = Read-Host "Voulez-vous ouvrir test-voice-standalone.html maintenant? (O/N)"
if ($response -eq 'O' -or $response -eq 'o') {
    Start-Process "test-voice-standalone.html"
    Write-Host "✅ Fichier ouvert dans le navigateur!" -ForegroundColor Green
}
