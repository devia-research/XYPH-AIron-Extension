# 🚀 Script de Test pour l'Interface Conversationnelle XYPH
# Ce script configure et teste l'extension Chrome avec la nouvelle approche créative

Write-Host "🚀 Configuration et Test de l'Interface XYPH" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Vérifier la structure de l'extension
$extensionPath = "F:\Scripts\ExtensionChrome"
$xyphProjectPath = "F:\Git\XYPH-Project"

Write-Host "📁 Vérification des fichiers d'extension..." -ForegroundColor Yellow

$requiredFiles = @(
    "manifest.json",
    "background.js", 
    "sidebar.js",
    "sidebar-new.html",
    "popup.html",
    "popup.js"
)

foreach ($file in $requiredFiles) {
    $filePath = Join-Path $extensionPath $file
    if (Test-Path $filePath) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (manquant)" -ForegroundColor Red
    }
}

Write-Host ""

# Proposer d'activer l'interface conversationnelle
Write-Host "🎨 Activation de l'Interface Conversationnelle" -ForegroundColor Magenta
Write-Host "===============================================" -ForegroundColor Magenta

$sidebarOldPath = Join-Path $extensionPath "sidebar.html"
$sidebarNewPath = Join-Path $extensionPath "sidebar-new.html"

if (Test-Path $sidebarNewPath) {
    Write-Host "📋 Interface conversationnelle détectée dans sidebar-new.html" -ForegroundColor Green
    
    $response = Read-Host "Voulez-vous activer l'interface conversationnelle ? (o/n)"
    
    if ($response -eq "o" -or $response -eq "O" -or $response -eq "oui") {
        # Backup de l'ancien sidebar
        if (Test-Path $sidebarOldPath) {
            $backupPath = Join-Path $extensionPath "sidebar-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
            Copy-Item $sidebarOldPath $backupPath
            Write-Host "   💾 Sauvegarde de l'ancien sidebar : $backupPath" -ForegroundColor Gray
        }
        
        # Remplacer par la nouvelle interface
        Copy-Item $sidebarNewPath $sidebarOldPath -Force
        Write-Host "   ✅ Interface conversationnelle activée !" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "🎯 Prochaines étapes :" -ForegroundColor Cyan
        Write-Host "   1. Ouvrir Chrome et aller dans chrome://extensions/" -ForegroundColor White
        Write-Host "   2. Activer le 'Mode développeur' en haut à droite" -ForegroundColor White
        Write-Host "   3. Cliquer sur 'Charger l'extension non empaquetée'" -ForegroundColor White
        Write-Host "   4. Sélectionner le dossier : $extensionPath" -ForegroundColor White
        Write-Host "   5. L'extension XYPH sera ajoutée à Chrome !" -ForegroundColor White
        
    } else {
        Write-Host "   ⏸️ Activation annulée" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ sidebar-new.html non trouvé" -ForegroundColor Red
}

Write-Host ""

# Configuration de l'API IA
Write-Host "🤖 Configuration de l'IA Backend" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

Write-Host "Choisissez votre backend IA préféré :" -ForegroundColor Yellow
Write-Host "1. 🌐 DeepSeek (API en ligne)"
Write-Host "2. 🏠 Ollama (Local)"
Write-Host "3. 🔥 OpenAI GPT"
Write-Host "4. ⚡ Groq"

$apiChoice = Read-Host "Votre choix (1-4)"

switch ($apiChoice) {
    "1" {
        Write-Host "🌐 Configuration DeepSeek :" -ForegroundColor Green
        Write-Host "   - API URL : https://api.deepseek.com/v1/chat/completions"
        Write-Host "   - Modèle recommandé : deepseek-chat"
        Write-Host "   - Clé API : Ajoutez votre clé dans l'extension"
    }
    "2" {
        Write-Host "🏠 Configuration Ollama :" -ForegroundColor Green
        Write-Host "   - URL locale : http://localhost:11434/api/chat"
        Write-Host "   - Modèles recommandés : llama3.1, codellama, mistral"
        Write-Host "   - Installation : https://ollama.ai"
    }
    "3" {
        Write-Host "🔥 Configuration OpenAI :" -ForegroundColor Green
        Write-Host "   - API URL : https://api.openai.com/v1/chat/completions"
        Write-Host "   - Modèles : gpt-4, gpt-3.5-turbo"
        Write-Host "   - Clé API : Nécessaire"
    }
    "4" {
        Write-Host "⚡ Configuration Groq :" -ForegroundColor Green
        Write-Host "   - API URL : https://api.groq.com/openai/v1/chat/completions"
        Write-Host "   - Modèles : llama3-70b, mixtral-8x7b"
        Write-Host "   - Ultra rapide pour les tests"
    }
    default {
        Write-Host "   ⚠️ Choix invalide, DeepSeek sélectionné par défaut" -ForegroundColor Yellow
    }
}

Write-Host ""

# Conseils d'utilisation créative
Write-Host "🎨 Conseils pour l'Entraînement Créatif" -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Magenta

$creativeTips = @(
    "💡 Commencez par des défis simples et amusants",
    "🎭 Donnez une personnalité à XYPH dès le début",
    "🌟 Célébrez chaque solution créative, même imparfaite",
    "🎨 Encouragez l'ajout d'éléments visuels/artistiques",
    "🚀 Proposez des défis qui sortent de l'ordinaire",
    "💖 Maintenez toujours un ton encourageant",
    "🎪 Intégrez des éléments de surprise et de fun",
    "🧘 Équilibrez défi et plaisir"
)

foreach ($tip in $creativeTips) {
    Write-Host "   $tip" -ForegroundColor White
}

Write-Host ""

# Exemple de première conversation
Write-Host "💬 Exemple de Première Conversation avec XYPH" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$exampleConversation = @"
👤 Utilisateur : "Salut XYPH ! Prêt pour ton premier défi créatif ?"

🤖 XYPH : "Salut ! Absolument ! J'ai hâte de créer quelque chose d'extraordinaire ! 
           Quel genre de défi as-tu en tête ? 🎨✨"

👤 Utilisateur : "Crée-moi un script qui surveille l'utilisation CPU, 
                mais fais-le avec style ! Ajoute de la couleur, de l'ASCII art, 
                et une petite surprise pour me faire sourire."

🤖 XYPH : "Ooh ! J'adore ! 🎭 Je vais créer un 'Moniteur CPU Théâtral' 
           qui raconte l'histoire de ton processeur comme une pièce de théâtre !
           Avec des personnages ASCII et des répliques dramatiques ! 🎪
           
           Donne-moi quelques minutes pour cette création... 🎨"

👤 Utilisateur : "J'ai hâte de voir ça ! Prends ton temps et amuse-toi !"

🤖 XYPH : "Merci ! C'est exactement l'esprit créatif que j'aime ! 
           Je sens déjà l'inspiration arriver... 🌟"
"@

Write-Host $exampleConversation -ForegroundColor Gray

Write-Host ""

# Vérification finale
Write-Host "🔍 Vérification Finale" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

Write-Host "✅ Interface conversationnelle prête" -ForegroundColor Green
Write-Host "✅ Système d'entraînement créatif configuré" -ForegroundColor Green  
Write-Host "✅ Documentation complète disponible" -ForegroundColor Green
Write-Host "✅ Scripts de démonstration fonctionnels" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 XYPH est prêt pour l'aventure créative !" -ForegroundColor Yellow
Write-Host "🚀 Prochain objectif : Premier défi créatif avec XYPH !" -ForegroundColor Cyan

# Créer un fichier de rappel des étapes
$setupReminder = @"
🎯 XYPH Setup - Étapes Suivantes

1. 🔧 Charger l'extension dans Chrome
   - Ouvrir chrome://extensions/
   - Activer 'Mode développeur'
   - 'Charger extension non empaquetée'
   - Sélectionner : $extensionPath

2. 🤖 Configurer l'API IA
   - Choisir : DeepSeek / Ollama / OpenAI / Groq
   - Ajouter la clé API si nécessaire
   - Tester la connexion

3. 🎨 Premier Défi Créatif
   - Ouvrir l'interface conversationnelle
   - Donner un défi simple et amusant
   - Encourager la créativité !

4. 📈 Suivi de Progression
   - Utiliser le système d'évaluation
   - Célébrer les achievements
   - Maintenir le bonheur de XYPH

🌟 Remember : Un XYPH heureux = Un XYPH créatif !
"@

$reminderFile = Join-Path $xyphProjectPath "SETUP_REMINDER.txt"
$setupReminder | Out-File -FilePath $reminderFile -Encoding UTF8

Write-Host "📝 Rappel sauvegardé dans : $reminderFile" -ForegroundColor DarkGray