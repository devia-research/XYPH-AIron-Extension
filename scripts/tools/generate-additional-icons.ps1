# Créateur d'icônes additionnelles pour XYPH
# Génère des icônes spécialisées (toolbar, favicon, etc.)

param(
    [string]$OutputPath = "F:\Git\XYPH-Project\extension\icons"
)

Write-Host "🎨 Création d'icônes additionnelles XYPH" -ForegroundColor Cyan

Add-Type -AssemblyName System.Drawing

# Icône toolbar optimisée (16x16 très simple)
Write-Host "🔧 Création icône toolbar..." -ForegroundColor Yellow

$bitmap = New-Object System.Drawing.Bitmap(16, 16)
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None # Pixel perfect

# Couleurs optimisées pour petite taille
$blue = [System.Drawing.Color]::FromArgb(79, 70, 229)
$white = [System.Drawing.Color]::White
$green = [System.Drawing.Color]::FromArgb(16, 185, 129)

# Fond simple
$brush = New-Object System.Drawing.SolidBrush($blue)
$g.FillRectangle($brush, 1, 1, 14, 14)

# Bordure
$pen = New-Object System.Drawing.Pen($white, 1)
$g.DrawRectangle($pen, 0, 0, 15, 15)

# Texte "X" centré
$font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush($white)
$g.DrawString("X", $font, $textBrush, 4, 1)

# Point d'accent
$accentBrush = New-Object System.Drawing.SolidBrush($green)
$g.FillRectangle($accentBrush, 12, 12, 3, 3)

$toolbarPath = Join-Path $OutputPath "toolbar-icon.png"
$bitmap.Save($toolbarPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Nettoyer
$g.Dispose()
$bitmap.Dispose()
$brush.Dispose()
$pen.Dispose()
$font.Dispose()
$textBrush.Dispose()
$accentBrush.Dispose()

Write-Host "   ✅ toolbar-icon.png créé" -ForegroundColor Green

# Favicon 32x32
Write-Host "🔧 Création favicon..." -ForegroundColor Yellow

$favicon = New-Object System.Drawing.Bitmap(32, 32)
$g2 = [System.Drawing.Graphics]::FromImage($favicon)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Fond dégradé pour favicon
$brush1 = New-Object System.Drawing.SolidBrush($blue)
$brush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(124, 58, 237))

$g2.FillRectangle($brush1, 2, 2, 28, 28)
$g2.FillRectangle($brush2, 2, 16, 28, 14)

# Texte "XY"
$font2 = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$textBrush2 = New-Object System.Drawing.SolidBrush($white)

$textFormat = New-Object System.Drawing.StringFormat
$textFormat.Alignment = [System.Drawing.StringAlignment]::Center
$textFormat.LineAlignment = [System.Drawing.StringAlignment]::Center

$textRect = New-Object System.Drawing.RectangleF(0, 0, 32, 32)
$g2.DrawString("XY", $font2, $textBrush2, $textRect, $textFormat)

$faviconPath = Join-Path $OutputPath "favicon.png"
$favicon.Save($faviconPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Nettoyer
$g2.Dispose()
$favicon.Dispose()
$brush1.Dispose()
$brush2.Dispose()
$font2.Dispose()
$textBrush2.Dispose()
$textFormat.Dispose()

Write-Host "   ✅ favicon.png créé" -ForegroundColor Green

# Icône large pour Store (512x512 simulation)
Write-Host "🔧 Création icône store..." -ForegroundColor Yellow

$store = New-Object System.Drawing.Bitmap(256, 256) # 256 au lieu de 512 pour performance
$g3 = [System.Drawing.Graphics]::FromImage($store)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Fond avec gradient simulation
$brushBase = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(79, 70, 229))
$brushAccent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(236, 72, 153))

$g3.FillRectangle($brushBase, 10, 10, 236, 236)
$g3.FillRectangle($brushAccent, 10, 128, 236, 118)

# Texte principal "XYPH"
$fontLarge = New-Object System.Drawing.Font("Arial", 72, [System.Drawing.FontStyle]::Bold)
$textBrushLarge = New-Object System.Drawing.SolidBrush($white)

$textFormatLarge = New-Object System.Drawing.StringFormat
$textFormatLarge.Alignment = [System.Drawing.StringAlignment]::Center
$textFormatLarge.LineAlignment = [System.Drawing.StringAlignment]::Center

$textRectLarge = New-Object System.Drawing.RectangleF(0, 0, 256, 180)
$g3.DrawString("XYPH", $fontLarge, $textBrushLarge, $textRectLarge, $textFormatLarge)

# Badge "AI Extension"
$badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 185, 129))
$g3.FillRectangle($badgeBrush, 50, 200, 156, 30)

$fontBadge = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$badgeRect = New-Object System.Drawing.RectangleF(50, 200, 156, 30)
$g3.DrawString("AI Extension", $fontBadge, $textBrushLarge, $badgeRect, $textFormatLarge)

$storePath = Join-Path $OutputPath "store-icon.png"
$store.Save($storePath, [System.Drawing.Imaging.ImageFormat]::Png)

# Nettoyer
$g3.Dispose()
$store.Dispose()
$brushBase.Dispose()
$brushAccent.Dispose()
$fontLarge.Dispose()
$textBrushLarge.Dispose()
$textFormatLarge.Dispose()
$badgeBrush.Dispose()
$fontBadge.Dispose()

Write-Host "   ✅ store-icon.png créé" -ForegroundColor Green

Write-Host "`n🎉 Icônes additionnelles créées !" -ForegroundColor Green
Write-Host "📁 Contenu du dossier icons:" -ForegroundColor Cyan

Get-ChildItem $OutputPath | Sort-Object Name | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 1)
    $type = if ($_.Extension -eq ".svg") { "📄" } else { "🖼️ " }
    Write-Host "   $type $($_.Name) - $sizeKB KB" -ForegroundColor White
}