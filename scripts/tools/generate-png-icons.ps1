# Générateur PNG simple pour les icônes XYPH
# Crée des icônes PNG basiques en utilisant une approche bitmap pure

param(
    [string]$OutputPath = "F:\Git\XYPH-Project\extension\icons"
)

Write-Host "🖼️  Génération PNG simplifiée pour XYPH" -ForegroundColor Cyan

Add-Type -AssemblyName System.Drawing

$sizes = @(16, 48, 128)

foreach ($size in $sizes) {
    try {
        Write-Host "🎯 Création PNG ${size}x${size}..." -ForegroundColor Yellow
        
        # Créer bitmap et graphics
        $bitmap = New-Object System.Drawing.Bitmap($size, $size)
        $g = [System.Drawing.Graphics]::FromImage($bitmap)
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        
        # Couleurs
        $blue = [System.Drawing.Color]::FromArgb(79, 70, 229)
        $purple = [System.Drawing.Color]::FromArgb(124, 58, 237) 
        $white = [System.Drawing.Color]::White
        
        # Fond dégradé (simulation avec rectangles)
        $brush1 = New-Object System.Drawing.SolidBrush($blue)
        $brush2 = New-Object System.Drawing.SolidBrush($purple)
        
        # Fond principal
        $margin = [math]::Max(1, $size * 0.05)
        $innerSize = $size - (2 * $margin)
        $g.FillRectangle($brush1, $margin, $margin, $innerSize, $innerSize)
        
        # Overlay pour effet dégradé
        $g.FillRectangle($brush2, $margin, $margin + $innerSize/2, $innerSize, $innerSize/2)
        
        # Texte principal selon la taille
        $mainText = if ($size -le 20) { "X" } elseif ($size -le 50) { "XY" } else { "XYPH" }
        $fontSize = switch ($size) {
            16 { 10 }
            48 { 24 }
            128 { 64 }
            default { $size / 3 }
        }
        
        $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
        $textBrush = New-Object System.Drawing.SolidBrush($white)
        
        # Centrer le texte
        $textFormat = New-Object System.Drawing.StringFormat
        $textFormat.Alignment = [System.Drawing.StringAlignment]::Center
        $textFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
        
        $textRect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
        $g.DrawString($mainText, $font, $textBrush, $textRect, $textFormat)
        
        # Petit badge "AI" pour les grandes tailles
        if ($size -ge 48) {
            $green = [System.Drawing.Color]::FromArgb(16, 185, 129)
            $badgeBrush = New-Object System.Drawing.SolidBrush($green)
            
            $badgeSize = [math]::Max(12, $size * 0.25)
            $badgeX = $size - $badgeSize - 2
            $badgeY = $size - $badgeSize - 2
            
            $g.FillEllipse($badgeBrush, $badgeX, $badgeY, $badgeSize, $badgeSize)
            
            # Texte "AI" dans le badge
            $badgeFont = New-Object System.Drawing.Font("Arial", [math]::Max(6, $badgeSize * 0.4), [System.Drawing.FontStyle]::Bold)
            $badgeRect = New-Object System.Drawing.RectangleF($badgeX, $badgeY, $badgeSize, $badgeSize)
            $g.DrawString("AI", $badgeFont, $textBrush, $badgeRect, $textFormat)
            
            $badgeBrush.Dispose()
            $badgeFont.Dispose()
        }
        
        # Sauvegarder PNG
        $pngPath = Join-Path $OutputPath "icon$size.png"
        $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        Write-Host "   ✅ Créé: icon$size.png" -ForegroundColor Green
        
        # Nettoyer
        $g.Dispose()
        $bitmap.Dispose()
        $brush1.Dispose()
        $brush2.Dispose()
        $font.Dispose()
        $textBrush.Dispose()
        $textFormat.Dispose()
        
    } catch {
        Write-Host "   ❌ Erreur $size : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Vérifier les fichiers créés
Write-Host "`n📋 Fichiers dans le dossier icons:" -ForegroundColor Cyan
Get-ChildItem $OutputPath | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 1)
    Write-Host "   📄 $($_.Name) - $sizeKB KB" -ForegroundColor White
}

Write-Host "`n✅ Icônes PNG créées avec succès !" -ForegroundColor Green