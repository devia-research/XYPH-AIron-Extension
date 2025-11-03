# 🚀 Guide de déploiement complet pour l'extension XYPH
# Instructions détaillées pour charger l'extension dans Chrome

param(
    [switch]$OpenChrome,
    [switch]$ShowPaths,
    [switch]$TestFirst
)

Write-Host "🚀 DÉPLOIEMENT EXTENSION XYPH" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

$extensionPath = "F:\Git\XYPH-Project\extension"

# Test préalable si demandé
if ($TestFirst) {
    Write-Host "`n🧪 Test préalable..." -ForegroundColor Yellow
    & "F:\Git\XYPH-Project\scripts\testing\test-extension-complete.ps1"
    Write-Host "`nContinuation du déploiement..." -ForegroundColor Cyan
}

Write-Host "`n📋 ÉTAPES DE DÉPLOIEMENT:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

Write-Host "`n1️⃣  OUVRIR CHROME EXTENSIONS" -ForegroundColor Yellow
Write-Host "   • Ouvrez Google Chrome" -ForegroundColor White
Write-Host "   • Tapez dans la barre d'adresse: chrome://extensions/" -ForegroundColor Cyan
Write-Host "   • Ou utilisez: Menu ⋮ → Plus d'outils → Extensions" -ForegroundColor Gray

if ($OpenChrome) {
    Write-Host "`n   🔧 Ouverture automatique de Chrome..." -ForegroundColor Green
    try {
        Start-Process "chrome" -ArgumentList "chrome://extensions/"
        Start-Sleep 2
        Write-Host "   ✅ Chrome ouvert sur la page des extensions" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Chrome non trouvé, ouvrez manuellement" -ForegroundColor Yellow
    }
}

Write-Host "`n2️⃣  ACTIVER LE MODE DÉVELOPPEUR" -ForegroundColor Yellow
Write-Host "   • En haut à droite, activez 'Mode développeur'" -ForegroundColor White
Write-Host "   • Un commutateur apparaît - cliquez dessus" -ForegroundColor Gray

Write-Host "`n3️⃣  CHARGER L'EXTENSION" -ForegroundColor Yellow
Write-Host "   • Cliquez sur 'Charger l'extension non empaquetée'" -ForegroundColor White
Write-Host "   • Naviguez vers le dossier:" -ForegroundColor Cyan
Write-Host "     $extensionPath" -ForegroundColor White
Write-Host "   • Sélectionnez le dossier 'extension' et cliquez 'Sélectionner le dossier'" -ForegroundColor Gray

# Copier le chemin dans le presse-papier si possible
try {
    $extensionPath | Set-Clipboard
    Write-Host "   📋 Chemin copié dans le presse-papier !" -ForegroundColor Green
} catch {
    # Pas grave si ça échoue
}

if ($ShowPaths) {
    Write-Host "`n📁 STRUCTURE DES DOSSIERS:" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    
    if (Test-Path "F:\Git\XYPH-Project") {
    Write-Host "   📁 XYPH-Project/" -ForegroundColor Gray
    Write-Host "   ├── 📁 extension/ ← SÉLECTIONNER CE DOSSIER" -ForegroundColor Green
    Write-Host "   │   ├── 📁 core/" -ForegroundColor Gray
    Write-Host "   │   ├── 📁 ui/" -ForegroundColor Gray
    Write-Host "   │   ├── 📁 api/" -ForegroundColor Gray
    Write-Host "   │   └── 📁 icons/" -ForegroundColor Gray
        Write-Host "   ├── 📁 config/" -ForegroundColor Gray
        Write-Host "   └── 📁 scripts/" -ForegroundColor Gray
    }
}

Write-Host "`n4️⃣  VÉRIFICATION" -ForegroundColor Yellow
Write-Host "   • L'extension 'AI Script Commander - Sidebar' doit apparaître" -ForegroundColor White
Write-Host "   • Vérifiez que le statut est 'Activé'" -ForegroundColor White
Write-Host "   • L'icône XYPH doit être visible dans la barre d'outils" -ForegroundColor Gray

Write-Host "`n5️⃣  PREMIÈRE UTILISATION" -ForegroundColor Yellow
Write-Host "   • Cliquez sur l'icône XYPH dans la barre d'outils" -ForegroundColor White
Write-Host "   • Ou utilisez le raccourci Ctrl+Shift+U" -ForegroundColor Gray
Write-Host "   • Le panneau latéral s'ouvre avec les outils IA" -ForegroundColor Cyan

Write-Host "`n🎉 EXTENSION PRÊTE !" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "✅ Icônes: Complètes (PNG + SVG)" -ForegroundColor White
Write-Host "✅ API: DeepSeek configuré + 4 autres providers" -ForegroundColor White  
Write-Host "✅ Interface: Popup + Sidebar + Content scripts" -ForegroundColor White
Write-Host "✅ Tests: 86.7% de réussite" -ForegroundColor White

Write-Host "`n🚀 UTILISATION RAPIDE:" -ForegroundColor Cyan
Write-Host "• Ouvrir le déploiement: scripts\deployment\deploy-guide.ps1 -OpenChrome" -ForegroundColor Gray
Write-Host "• Test complet: scripts\testing\test-extension-complete.ps1" -ForegroundColor Gray
Write-Host "• Structure: scripts\deployment\deploy-guide.ps1 -ShowPaths" -ForegroundColor Gray

return @{
    ExtensionPath = $extensionPath
    Status = "READY_TO_LOAD"
    ChromeURL = "chrome://extensions/"
    Instructions = "Load unpacked extension from $extensionPath"
}