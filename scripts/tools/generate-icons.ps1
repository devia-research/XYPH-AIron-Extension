# Générateur d'icônes pour l'extension XYPH
# Crée les icônes manquantes au format SVG et PNG

param(
    [string]$OutputPath = "F:\Git\XYPH-Project\extension\icons",
    [switch]$Verbose
)

Write-Host "🎨 Génération des icônes XYPH" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Créer le dossier s'il n'existe pas
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Design de l'icône XYPH - Style moderne avec gradients
$svgTemplate = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 SIZE SIZE" width="SIZE" height="SIZE">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#7C3AED;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fond avec coins arrondis -->
  <rect x="MARGIN" y="MARGIN" width="INNER_SIZE" height="INNER_SIZE" rx="RADIUS" ry="RADIUS" fill="url(#grad1)" />
  
  <!-- Lettre X stylisée -->
  <path d="M X_PATH" fill="white" fill-opacity="0.9" stroke="white" stroke-width="STROKE_WIDTH"/>
  
  <!-- Lettre Y stylisée -->
  <path d="M Y_PATH" fill="white" fill-opacity="0.9" stroke="white" stroke-width="STROKE_WIDTH"/>
  
  <!-- Points décoratifs -->
  <circle cx="DOT1_X" cy="DOT1_Y" r="DOT_SIZE" fill="url(#grad2)" />
  <circle cx="DOT2_X" cy="DOT2_Y" r="DOT_SIZE" fill="url(#grad2)" />
  
  <!-- Badge "AI" -->
  <rect x="BADGE_X" y="BADGE_Y" width="BADGE_W" height="BADGE_H" rx="BADGE_R" fill="url(#grad2)" />
  <text x="TEXT_X" y="TEXT_Y" font-family="Arial, sans-serif" font-size="TEXT_SIZE" font-weight="bold" fill="white" text-anchor="middle">AI</text>
</svg>
"@

# Fonctions pour calculer les tailles selon la résolution
function Get-IconSizes($size) {
    $margin = [math]::Max(2, $size * 0.05)
    $innerSize = $size - (2 * $margin)
    $radius = [math]::Max(4, $size * 0.15)
    $strokeWidth = [math]::Max(1, $size * 0.03)
    
    return @{
        Size = $size
        Margin = $margin
        InnerSize = $innerSize
        Radius = $radius
        StrokeWidth = $strokeWidth
        
        # Coordonnées pour X (croix stylisée)
        XPath = "$($size * 0.25),$($size * 0.25) L$($size * 0.75),$($size * 0.75) M$($size * 0.75),$($size * 0.25) L$($size * 0.25),$($size * 0.75)"
        
        # Coordonnées pour Y (fourche stylisée)  
        YPath = "$($size * 0.3),$($size * 0.3) L$($size * 0.5),$($size * 0.5) L$($size * 0.7),$($size * 0.3) M$($size * 0.5),$($size * 0.5) L$($size * 0.5),$($size * 0.7)"
        
        # Points décoratifs
        Dot1X = $size * 0.8
        Dot1Y = $size * 0.2
        Dot2X = $size * 0.2
        Dot2Y = $size * 0.8
        DotSize = [math]::Max(2, $size * 0.04)
        
        # Badge AI
        BadgeX = $size * 0.65
        BadgeY = $size * 0.65
        BadgeW = $size * 0.3
        BadgeH = $size * 0.2
        BadgeR = $size * 0.05
        TextX = $size * 0.8
        TextY = $size * 0.78
        TextSize = [math]::Max(8, $size * 0.12)
    }
}

# Générer les icônes aux différentes tailles
$sizes = @(16, 48, 128)

foreach ($size in $sizes) {
    Write-Host "🔧 Génération icône ${size}x${size}..." -ForegroundColor Yellow
    
    $props = Get-IconSizes $size
    
    # Remplacer les placeholders dans le template SVG
    $svg = $svgTemplate
    $svg = $svg -replace "SIZE", $props.Size
    $svg = $svg -replace "MARGIN", $props.Margin
    $svg = $svg -replace "INNER_SIZE", $props.InnerSize
    $svg = $svg -replace "RADIUS", $props.Radius
    $svg = $svg -replace "STROKE_WIDTH", $props.StrokeWidth
    $svg = $svg -replace "X_PATH", $props.XPath
    $svg = $svg -replace "Y_PATH", $props.YPath
    $svg = $svg -replace "DOT1_X", $props.Dot1X
    $svg = $svg -replace "DOT1_Y", $props.Dot1Y
    $svg = $svg -replace "DOT2_X", $props.Dot2X
    $svg = $svg -replace "DOT2_Y", $props.Dot2Y
    $svg = $svg -replace "DOT_SIZE", $props.DotSize
    $svg = $svg -replace "BADGE_X", $props.BadgeX
    $svg = $svg -replace "BADGE_Y", $props.BadgeY
    $svg = $svg -replace "BADGE_W", $props.BadgeW
    $svg = $svg -replace "BADGE_H", $props.BadgeH
    $svg = $svg -replace "BADGE_R", $props.BadgeR
    $svg = $svg -replace "TEXT_X", $props.TextX
    $svg = $svg -replace "TEXT_Y", $props.TextY
    $svg = $svg -replace "TEXT_SIZE", $props.TextSize
    
    # Sauvegarder le SVG
    $svgPath = Join-Path $OutputPath "icon$size.svg"
    $svg | Out-File -FilePath $svgPath -Encoding UTF8
    
    if ($Verbose) {
        Write-Host "   📄 SVG sauvegardé: $svgPath" -ForegroundColor Gray
    }
}

Write-Host "✅ Icônes SVG générées avec succès !" -ForegroundColor Green

# Instructions pour la conversion PNG (si besoin)
Write-Host "`n📋 ÉTAPES SUIVANTES:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "🎨 Icônes SVG créées dans: $OutputPath" -ForegroundColor White
Write-Host ""
Write-Host "💡 Pour convertir en PNG (si nécessaire):" -ForegroundColor Yellow
Write-Host "   1. Utilisez un outil comme Inkscape, GIMP, ou un convertisseur en ligne" -ForegroundColor Gray
Write-Host "   2. Ou gardez les SVG (Chrome supporte nativement)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Options de conversion automatique:" -ForegroundColor Yellow
Write-Host "   • Inkscape CLI: inkscape icon.svg --export-png=icon.png --export-width=SIZE" -ForegroundColor Gray
Write-Host "   • ImageMagick: convert icon.svg icon.png" -ForegroundColor Gray
Write-Host "   • Online: convertio.co, cloudconvert.com" -ForegroundColor Gray

# Créer aussi une version PNG simple avec PowerShell (basique)
Write-Host "`n🎯 Création d'icônes PNG de base..." -ForegroundColor Yellow

# Utiliser .NET pour créer des PNGs simples
Add-Type -AssemblyName System.Drawing

foreach ($size in $sizes) {
    try {
        $bitmap = New-Object System.Drawing.Bitmap($size, $size)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        
        # Fond avec gradient (approximation)
        $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            [System.Drawing.Point]::new(0, 0),
            [System.Drawing.Point]::new($size, $size),
            [System.Drawing.Color]::FromArgb(79, 70, 229),
            [System.Drawing.Color]::FromArgb(236, 72, 153)
        )
        
        $rect = New-Object System.Drawing.Rectangle(2, 2, $size-4, $size-4)
        $graphics.FillRectangle($brush, $rect)
        
        # Texte "XY"
        $font = New-Object System.Drawing.Font("Arial", [math]::Max(8, $size/6), [System.Drawing.FontStyle]::Bold)
        $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $text = "XY"
        $textSize = $graphics.MeasureString($text, $font)
        $x = ($size - $textSize.Width) / 2
        $y = ($size - $textSize.Height) / 2
        $graphics.DrawString($text, $font, $textBrush, $x, $y)
        
        # Sauvegarder
        $pngPath = Join-Path $OutputPath "icon$size.png"
        $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        Write-Host "   ✅ PNG créé: icon$size.png" -ForegroundColor Green
        
        # Nettoyer les ressources
        $graphics.Dispose()
        $bitmap.Dispose()
        $brush.Dispose()
        $font.Dispose()
        $textBrush.Dispose()
        
    } catch {
        Write-Host "   ⚠️  Erreur PNG pour taille $size : $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 GÉNÉRATION D'ICÔNES TERMINÉE !" -ForegroundColor Green
Write-Host "Dossier: $OutputPath" -ForegroundColor Cyan

# Lister les fichiers créés
$createdFiles = Get-ChildItem $OutputPath | Sort-Object Name
Write-Host "`n📁 Fichiers créés:" -ForegroundColor Cyan
$createdFiles | ForEach-Object {
    $size = [math]::Round($_.Length / 1KB, 1)
    Write-Host "   📄 $($_.Name) ($size KB)" -ForegroundColor White
}

return $createdFiles