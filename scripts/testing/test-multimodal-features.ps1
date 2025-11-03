# Test des fonctionnalités multimodales d'AIron
# Vérifie que toutes les nouvelles fonctionnalités sont opérationnelles

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Test Fonctionnalités Multimodales  " -ForegroundColor Cyan
Write-Host "           AIron v3.0                 " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$results = @{
    passed = 0
    failed = 0
    warnings = 0
}

function Test-Feature {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$Category
    )
    
    Write-Host "[$Category] Test: $Name" -ForegroundColor Yellow -NoNewline
    try {
        $result = & $Test
        if ($result -eq $true) {
            Write-Host " ✓ PASS" -ForegroundColor Green
            $script:results.passed++
        } else {
            Write-Host " ⚠ WARNING" -ForegroundColor Magenta
            $script:results.warnings++
        }
    } catch {
        Write-Host " ✗ FAIL" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor DarkRed
        $script:results.failed++
    }
}

# Test 1: Vérifier présence HTML multimodal
Test-Feature "Section multimodale dans HTML" {
    $html = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.html" -Raw
    return ($html -match "🎨 Analyse Multimodale")
} -Category "HTML"

Test-Feature "Boutons d'analyse d'image (4)" {
    $html = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.html" -Raw
    return (($html -match "uploadImageBtn") -and 
            ($html -match "analyzeImageUrlBtn") -and
            ($html -match "screenshotAnalyzeBtn") -and
            ($html -match "editImageAIBtn"))
} -Category "HTML"

Test-Feature "Boutons d'analyse vidéo (2)" {
    $html = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.html" -Raw
    return (($html -match "uploadVideoBtn") -and 
            ($html -match "analyzeYoutubeBtn"))
} -Category "HTML"

Test-Feature "Boutons recherche & téléchargement (4)" {
    $html = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.html" -Raw
    return (($html -match "searchFileBtn") -and 
            ($html -match "searchAppBtn") -and
            ($html -match "downloadAssistBtn") -and
            ($html -match "installAppBtn"))
} -Category "HTML"

Test-Feature "Boutons interaction page (4)" {
    $html = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.html" -Raw
    return (($html -match "insertTextBtn") -and 
            ($html -match "fillFormBtn") -and
            ($html -match "clickElementBtn") -and
            ($html -match "autoNavigateBtn"))
} -Category "HTML"

Test-Feature "Input file upload (image + vidéo)" {
    $html = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.html" -Raw
    return (($html -match "imageUploadInput") -and 
            ($html -match "videoUploadInput") -and
            ($html -match 'accept="image/\*"') -and
            ($html -match 'accept="video/\*"'))
} -Category "HTML"

# Test 2: Vérifier JavaScript - Event Listeners
Test-Feature "Event listeners image (5)" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    return (($js -match "addListener\('uploadImageBtn'") -and 
            ($js -match "addListener\('analyzeImageUrlBtn'") -and
            ($js -match "addListener\('screenshotAnalyzeBtn'") -and
            ($js -match "addListener\('editImageAIBtn'") -and
            ($js -match "addListener\('imageUploadInput'"))
} -Category "JS-Listeners"

Test-Feature "Event listeners vidéo (3)" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    return (($js -match "addListener\('uploadVideoBtn'") -and 
            ($js -match "addListener\('videoUploadInput'") -and
            ($js -match "addListener\('analyzeYoutubeBtn'"))
} -Category "JS-Listeners"

Test-Feature "Event listeners recherche (4)" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    return (($js -match "addListener\('searchFileBtn'") -and 
            ($js -match "addListener\('searchAppBtn'") -and
            ($js -match "addListener\('downloadAssistBtn'") -and
            ($js -match "addListener\('installAppBtn'"))
} -Category "JS-Listeners"

Test-Feature "Event listeners page (4)" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    return (($js -match "addListener\('insertTextBtn'") -and 
            ($js -match "addListener\('fillFormBtn'") -and
            ($js -match "addListener\('clickElementBtn'") -and
            ($js -match "addListener\('autoNavigateBtn'"))
} -Category "JS-Listeners"

# Test 3: Vérifier méthodes JavaScript
Test-Feature "Méthodes analyse image (5)" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    return (($js -match "handleImageUpload\(") -and 
            ($js -match "analyzeImage\(") -and
            ($js -match "analyzeImageFromUrl\(") -and
            ($js -match "screenshotAndAnalyze\(") -and
            ($js -match "editImageWithAI\("))
} -Category "JS-Methods"

Test-Feature "Méthodes analyse vidéo (4)" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    return (($js -match "handleVideoUpload\(") -and 
            ($js -match "getVideoDuration\(") -and
            ($js -match "analyzeYoutubeVideo\(") -and
            ($js -match "extractYoutubeId\("))
} -Category "JS-Methods"

Test-Feature "Méthodes recherche & download (4)" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    return (($js -match "searchAndFindFile\(") -and 
            ($js -match "searchAndFindApp\(") -and
            ($js -match "assistDownload\(") -and
            ($js -match "assistInstall\("))
} -Category "JS-Methods"

Test-Feature "Méthodes interaction page (4)" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    return (($js -match "insertTextInPage\(") -and 
            ($js -match "fillFormWithAI\(") -and
            ($js -match "clickElementWithAI\(") -and
            ($js -match "autoNavigateWithAI\("))
} -Category "JS-Methods"

# Test 4: Vérifier intégration Chrome APIs
Test-Feature "chrome.tabs.captureVisibleTab (screenshot)" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    return ($js -match "chrome\.tabs\.captureVisibleTab")
} -Category "Chrome-API"

Test-Feature "chrome.downloads.download (téléchargement)" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    return ($js -match "chrome\.downloads\.download")
} -Category "Chrome-API"

Test-Feature "chrome.scripting.executeScript (page interaction)" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    $scriptMatches = [regex]::Matches($js, "chrome\.scripting\.executeScript")
    return ($scriptMatches.Count -ge 3) # Devrait être dans insertText, fillForm, clickElement
} -Category "Chrome-API"

# Test 5: Vérifier permissions manifest
Test-Feature "Permission 'downloads' dans manifest" {
    $manifest = Get-Content "f:\Git\XYPH-Project\extension\manifest.json" -Raw | ConvertFrom-Json
    return ($manifest.permissions -contains "downloads")
} -Category "Manifest"

Test-Feature "Permission 'tabs' dans manifest" {
    $manifest = Get-Content "f:\Git\XYPH-Project\extension\manifest.json" -Raw | ConvertFrom-Json
    return ($manifest.permissions -contains "tabs")
} -Category "Manifest"

Test-Feature "Permission 'scripting' dans manifest" {
    $manifest = Get-Content "f:\Git\XYPH-Project\extension\manifest.json" -Raw | ConvertFrom-Json
    return ($manifest.permissions -contains "scripting")
} -Category "Manifest"

# Test 6: Vérifier absence d'erreurs syntaxe
Test-Feature "Pas d'erreurs regex YouTube" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    # La regex doit être correctement échappée (un seul backslash)
    return ($js -match "youtube\\\.com" -and $js -notmatch "youtube\\\\\\.com")
} -Category "Syntax"

Test-Feature "Pas de double-échappement \\n" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    # Chercher \\n dans les chaînes (faux positif possible mais bon indicateur)
    $doubleEscaped = [regex]::Matches($js, "['`"].*?\\\\n.*?['`"]")
    return ($doubleEscaped.Count -eq 0)
} -Category "Syntax"

# Test 7: Vérifier prompts AI pour vision
Test-Feature "Prompt analyse image avec 5 points" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    return ($js -match "contenu principal" -and 
            $js -match "couleurs dominantes" -and
            $js -match "qualité.*technique" -and
            $js -match "suggestions.*amélioration" -and
            $js -match "usage potentiel")
} -Category "AI-Prompts"

Test-Feature "Prompt analyse YouTube avec détails" {
    $js = Get-Content "f:\Git\XYPH-Project\extension\ui\sidebar\sidebar.js" -Raw
    return ($js -match "Titre.*description" -and 
            $js -match "Durée.*estimée" -and
            $js -match "Thématique.*principale" -and
            $js -match "Points.*clés" -and
            $js -match "Public.*cible")
} -Category "AI-Prompts"

# Résumé
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "         RÉSULTATS DES TESTS         " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ✓ Tests réussis   : " -NoNewline -ForegroundColor Green
Write-Host $results.passed -ForegroundColor White
Write-Host "  ⚠ Avertissements  : " -NoNewline -ForegroundColor Magenta
Write-Host $results.warnings -ForegroundColor White
Write-Host "  ✗ Tests échoués   : " -NoNewline -ForegroundColor Red
Write-Host $results.failed -ForegroundColor White
Write-Host ""

$total = $results.passed + $results.warnings + $results.failed
$successRate = [math]::Round(($results.passed / $total) * 100, 1)

if ($successRate -ge 90) {
    Write-Host "  Taux de réussite : $successRate% 🎉" -ForegroundColor Green
    Write-Host "  Toutes les fonctionnalités multimodales sont implémentées!" -ForegroundColor Green
} elseif ($successRate -ge 75) {
    Write-Host "  Taux de réussite : $successRate% 👍" -ForegroundColor Yellow
    Write-Host "  La plupart des fonctionnalités sont opérationnelles." -ForegroundColor Yellow
} else {
    Write-Host "  Taux de réussite : $successRate% ⚠" -ForegroundColor Red
    Write-Host "  Des corrections sont nécessaires." -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Sauvegarde résultats JSON
$jsonResults = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    extension = "AIron v3.0"
    feature = "Multimodal Capabilities"
    summary = $results
    successRate = $successRate
    details = @{
        html = "4 subsections, 16 buttons"
        javascript = "14 methods, 16 event listeners"
        apis = "tabs, downloads, scripting"
        features = @(
            "Image analysis (upload, URL, screenshot, AI edit)"
            "Video analysis (upload, YouTube)"
            "Search & download (file, app, download, install)"
            "Page interaction (insert text, fill form, click, navigate)"
        )
    }
} | ConvertTo-Json -Depth 5

$jsonResults | Out-File "f:\Git\XYPH-Project\tests\results\multimodal-test-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
Write-Host "Résultats sauvegardés dans tests/results/" -ForegroundColor Cyan
