# ============================================================
# Test Fonctionnel de l'Extension AI Script Commander
# ============================================================

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

function Write-TestHeader {
    param([string]$Message)
    Write-Host "`n$('=' * 80)" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "$('=' * 80)" -ForegroundColor Cyan
}

Write-TestHeader "GUIDE DE TEST MANUEL - Extension AI Script Commander"

Write-Host @"

Ce script vous guide à travers les tests fonctionnels de l'extension.

📋 ÉTAPES DE TEST:

════════════════════════════════════════════════════════════════════════════════
1️⃣  CHARGEMENT DE L'EXTENSION
════════════════════════════════════════════════════════════════════════════════

   ✅ Ouvrir Chrome/Edge
   ✅ Naviguer vers: chrome://extensions/
   ✅ Activer le "Mode développeur" (coin supérieur droit)
   ✅ Cliquer sur "Charger l'extension non empaquetée"
   ✅ Sélectionner: f:\Git\XYPH-Project\extension
   
   ✔️ Vérifier: L'extension apparaît dans la liste sans erreurs
   ✔️ Vérifier: L'icône de l'extension s'affiche dans la barre d'outils

════════════════════════════════════════════════════════════════════════════════
2️⃣  TEST DU POPUP
════════════════════════════════════════════════════════════════════════════════

   ✅ Cliquer sur l'icône de l'extension dans la barre d'outils
   ✅ Le popup devrait s'afficher
   
   ✔️ Vérifier: Interface utilisateur visible
   ✔️ Vérifier: Pas d'erreurs dans la console (F12)

════════════════════════════════════════════════════════════════════════════════
3️⃣  TEST DU PANNEAU LATÉRAL (SIDEBAR)
════════════════════════════════════════════════════════════════════════════════

   ✅ Clic droit sur l'icône → "Ouvrir le panneau latéral"
      OU
   ✅ Depuis le popup, chercher un bouton pour ouvrir le sidebar
   
   ✔️ Vérifier: Le panneau latéral s'ouvre sur le côté
   ✔️ Vérifier: Interface complète avec:
      - Sélection du type de script (PowerShell, Python, Bash, etc.)
      - Zone de texte pour écrire des scripts
      - Boutons d'action IA (Générer, Optimiser, Expliquer)
      - Zone de résultats
   ✔️ Vérifier: Pas d'erreurs dans la console

════════════════════════════════════════════════════════════════════════════════
4️⃣  TEST DE GÉNÉRATION DE SCRIPT
════════════════════════════════════════════════════════════════════════════════

   ✅ Dans le sidebar, sélectionner "PowerShell"
   ✅ Dans la zone de texte, écrire: "Lister tous les fichiers du dossier actuel"
   ✅ Cliquer sur le bouton "Générer Script" ou similaire
   
   ✔️ Vérifier: L'extension contacte l'API DeepSeek
   ✔️ Vérifier: Un script PowerShell est généré
   ✔️ Vérifier: Le script est syntaxiquement correct
   
   NOTE: Si l'API DeepSeek n'est pas configurée:
   - Aller dans les paramètres/settings
   - Entrer votre clé API DeepSeek
   - Réessayer

════════════════════════════════════════════════════════════════════════════════
5️⃣  TEST D'OPTIMISATION DE SCRIPT
════════════════════════════════════════════════════════════════════════════════

   ✅ Écrire un script simple dans la zone de texte:
      Get-ChildItem | Where-Object {`$_.Length -gt 1000}
   
   ✅ Cliquer sur "Optimiser Script"
   
   ✔️ Vérifier: Le script est analysé
   ✔️ Vérifier: Des suggestions d'optimisation sont fournies
   ✔️ Vérifier: Un script amélioré est proposé

════════════════════════════════════════════════════════════════════════════════
6️⃣  TEST D'EXPLICATION DE SCRIPT
════════════════════════════════════════════════════════════════════════════════

   ✅ Sélectionner Python
   ✅ Coller ce code:
      def fibonacci(n):
          return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)
   
   ✅ Cliquer sur "Expliquer Script"
   
   ✔️ Vérifier: Une explication détaillée est fournie
   ✔️ Vérifier: Les forces/faiblesses sont mentionnées
   ✔️ Vérifier: Des suggestions d'amélioration sont proposées

════════════════════════════════════════════════════════════════════════════════
7️⃣  TEST DU WEB SCRAPING
════════════════════════════════════════════════════════════════════════════════

   ✅ Ouvrir une page web simple (ex: https://example.com)
   ✅ Dans le sidebar, chercher l'option "Web Scraping"
   ✅ Sélectionner un type de scraping (liens, textes, images)
   ✅ Lancer le scraping
   
   ✔️ Vérifier: Les données de la page sont extraites
   ✔️ Vérifier: Les résultats s'affichent correctement
   ✔️ Vérifier: Option d'export disponible

════════════════════════════════════════════════════════════════════════════════
8️⃣  TEST DE DÉTECTION DE FORMULAIRES
════════════════════════════════════════════════════════════════════════════════

   ✅ Ouvrir une page avec un formulaire
   ✅ Dans le sidebar, chercher "Détecter Formulaires" ou "Auto-Fill"
   ✅ Lancer la détection
   
   ✔️ Vérifier: Les formulaires de la page sont détectés
   ✔️ Vérifier: Les champs sont listés correctement
   ✔️ Vérifier: Possibilité de remplir automatiquement

════════════════════════════════════════════════════════════════════════════════
9️⃣  TEST DE SAUVEGARDE DE SCRIPT
════════════════════════════════════════════════════════════════════════════════

   ✅ Générer ou écrire un script
   ✅ Cliquer sur "Sauvegarder" ou "Download"
   
   ✔️ Vérifier: Le fichier est téléchargé
   ✔️ Vérifier: L'extension du fichier est correcte (.ps1, .py, .sh, etc.)
   ✔️ Vérifier: Le contenu du fichier est correct

════════════════════════════════════════════════════════════════════════════════
🔟  TEST DES PARAMÈTRES
════════════════════════════════════════════════════════════════════════════════

   ✅ Ouvrir la section Paramètres/Settings
   ✅ Modifier la langue (si disponible)
   ✅ Configurer la clé API DeepSeek
   ✅ Sauvegarder les paramètres
   
   ✔️ Vérifier: Les paramètres sont sauvegardés
   ✔️ Vérifier: Les changements sont appliqués immédiatement
   ✔️ Vérifier: Les paramètres persistent après rechargement

════════════════════════════════════════════════════════════════════════════════
"@

Write-Host "`n"
Write-TestHeader "VÉRIFICATION AUTOMATIQUE DES COMPOSANTS"

# Vérification de la structure des fichiers
$extensionPath = "f:\Git\XYPH-Project\extension"

Write-Host "`n📁 Fichiers principaux:" -ForegroundColor Yellow
@(
    "manifest.json",
    "core/background.js",
    "core/content.js",
    "ui/popup/popup.html",
    "ui/popup/popup.js",
    "ui/sidebar/sidebar.html",
    "ui/sidebar/sidebar.js"
) | ForEach-Object {
    $path = Join-Path $extensionPath $_
    if (Test-Path $path) {
        Write-Host "  ✅ $_" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $_ (MANQUANT)" -ForegroundColor Red
    }
}

Write-Host "`n🎨 Icônes:" -ForegroundColor Yellow
@("icon16.png", "icon48.png", "icon128.png") | ForEach-Object {
    $path = Join-Path $extensionPath "icons\$_"
    if (Test-Path $path) {
        Write-Host "  ✅ $_" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $_ (MANQUANT)" -ForegroundColor Red
    }
}

# Vérifier le manifest
Write-Host "`n📋 Configuration Manifest:" -ForegroundColor Yellow
try {
    $manifest = Get-Content "$extensionPath\manifest.json" -Raw | ConvertFrom-Json
    Write-Host "  ✅ Nom: $($manifest.name)" -ForegroundColor Green
    Write-Host "  ✅ Version: $($manifest.version)" -ForegroundColor Green
    Write-Host "  ✅ Manifest Version: $($manifest.manifest_version)" -ForegroundColor Green
    Write-Host "  ✅ Permissions: $($manifest.permissions -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Erreur de lecture du manifest" -ForegroundColor Red
}

# Analyser les fichiers JavaScript pour les fonctionnalités
Write-Host "`n🔧 Fonctionnalités détectées:" -ForegroundColor Yellow

$backgroundJs = Get-Content "$extensionPath\core\background.js" -Raw
$contentJs = Get-Content "$extensionPath\core\content.js" -Raw
$sidebarJs = Get-Content "$extensionPath\ui\sidebar\sidebar.js" -Raw

$features = @{
    "Génération de Scripts" = ($sidebarJs -match "generate.*script" -or $backgroundJs -match "generateScript")
    "Optimisation de Scripts" = ($sidebarJs -match "optimize.*script" -or $backgroundJs -match "optimizeScript")
    "Explication de Scripts" = ($sidebarJs -match "explain.*script" -or $backgroundJs -match "explainScript")
    "Web Scraping" = ($contentJs -match "scraping" -or $backgroundJs -match "scraping")
    "Auto-Fill Formulaires" = ($contentJs -match "autoFill" -or $contentJs -match "FormFiller")
    "Intégration DeepSeek API" = ($sidebarJs -match "deepseek" -or $backgroundJs -match "deepseek")
    "Sauvegarde de Scripts" = ($sidebarJs -match "download.*script" -or $sidebarJs -match "saveScript")
    "Gestion du Storage" = ($backgroundJs -match "chrome\.storage" -or $sidebarJs -match "chrome\.storage")
}

foreach ($feature in $features.GetEnumerator() | Sort-Object Name) {
    if ($feature.Value) {
        Write-Host "  ✅ $($feature.Key)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $($feature.Key) (non détecté)" -ForegroundColor Yellow
    }
}

Write-Host "`n"
Write-TestHeader "RÉSUMÉ ET PROCHAINES ÉTAPES"

Write-Host @"

✅ STATUT: Extension prête pour les tests

📍 CHEMIN DE L'EXTENSION: f:\Git\XYPH-Project\extension

🚀 ACTIONS RECOMMANDÉES:

1. Charger l'extension dans Chrome/Edge
2. Ouvrir la console développeur (F12) pour voir les logs
3. Tester chaque fonctionnalité listée ci-dessus
4. Noter les bugs ou comportements inattendus
5. Vérifier les performances et la réactivité

⚙️ CONFIGURATION REQUISE:

- Clé API DeepSeek (pour les fonctionnalités IA)
- Navigateur Chrome/Edge avec mode développeur activé
- Connexion Internet (pour les appels API)

📝 RAPPORT DE BUGS:

Si vous rencontrez des problèmes:
1. Ouvrir la console (F12)
2. Copier le message d'erreur
3. Noter les étapes de reproduction
4. Documenter dans un fichier de rapport

════════════════════════════════════════════════════════════════════════════════

Appuyez sur Entrée pour terminer...
"@

Read-Host

Write-Host "`n✨ Tests terminés! Bonne chance avec votre extension! ✨`n" -ForegroundColor Green
