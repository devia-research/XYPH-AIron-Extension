# Script de rechargement rapide de l'extension
# Date: 2025-11-03

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CORRECTION APPLIQUÉE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Problème corrigé:" -ForegroundColor Green
Write-Host "  - generateScript() n'existait pas" -ForegroundColor Yellow
Write-Host "  - Remplacé par processChatMessage()" -ForegroundColor Green
Write-Host ""

Write-Host "🎤 Maintenant les commandes vocales vont:" -ForegroundColor Cyan
Write-Host "  1. Écouter votre voix" -ForegroundColor White
Write-Host "  2. Transcrire en texte" -ForegroundColor White
Write-Host "  3. Envoyer au CHAT avec l'IA" -ForegroundColor White
Write-Host "  4. Afficher la réponse" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ÉTAPES POUR TESTER" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Ouvrez Chrome:" -ForegroundColor Magenta
Write-Host "    chrome://extensions" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  Trouvez AIron et cliquez:" -ForegroundColor Magenta
Write-Host "    ⟳ RECHARGER" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  Ouvrez la sidebar AIron" -ForegroundColor Magenta
Write-Host ""

Write-Host "4️⃣  Appuyez F12 (Console DevTools)" -ForegroundColor Magenta
Write-Host ""

Write-Host "5️⃣  Cliquez '🎤 Commande Vocale'" -ForegroundColor Magenta
Write-Host ""

Write-Host "6️⃣  Dites une commande:" -ForegroundColor Magenta
Write-Host "    'génère un script qui affiche bonjour'" -ForegroundColor Cyan
Write-Host "    'analyse screenshot'" -ForegroundColor Cyan
Write-Host "    'recherche fichier test'" -ForegroundColor Cyan
Write-Host ""

Write-Host "7️⃣  Vérifiez la console:" -ForegroundColor Magenta
Write-Host "    - Doit voir: 🎤 Commande: ..." -ForegroundColor Gray
Write-Host "    - Puis: Réponse de l'IA dans le chat" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "💡 ASTUCES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  • Chrome demande permission micro → Autoriser" -ForegroundColor White
Write-Host "  • Parlez clairement en français" -ForegroundColor White
Write-Host "  • Attendez 2 secondes après avoir parlé" -ForegroundColor White
Write-Host "  • La console montre tous les logs" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTEZ MAINTENANT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Proposer d'ouvrir Chrome extensions
$response = Read-Host "Voulez-vous ouvrir chrome://extensions maintenant? (O/N)"
if ($response -eq 'O' -or $response -eq 'o') {
    Start-Process "chrome://extensions"
    Write-Host ""
    Write-Host "✅ Chrome ouvert!" -ForegroundColor Green
    Write-Host "   → Cherchez AIron" -ForegroundColor Yellow
    Write-Host "   → Cliquez ⟳ RECHARGER" -ForegroundColor Yellow
    Write-Host ""
}
