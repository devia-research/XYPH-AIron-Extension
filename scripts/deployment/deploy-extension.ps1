param(
    [string]$ExtensionPath = ".",
    [string]$OutputPath = ".\ExtensionPackaged",
    [switch]$AutoInstall,
    [switch]$CreateZip,
    [switch]$UpdateVersion
)

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    # Mapping des couleurs vers les valeurs valides de ConsoleColor
    $colorMap = @{
        'Red' = 'Red'
        'Green' = 'Green'
        'Yellow' = 'Yellow'
        'Cyan' = 'Cyan'
        'Magenta' = 'Magenta'
        'White' = 'White'
        'Gray' = 'Gray'
    }
    $consoleColor = $colorMap[$Color]
    if (-not $consoleColor) {
        $consoleColor = 'White'
    }
    Write-Host $Message -ForegroundColor $consoleColor
}

function Test-Prerequisites {
    Write-ColorOutput "🔍 Vérification des prérequis..." "Cyan"
    
    # Vérifier Chrome
    $chromePath = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" -ErrorAction SilentlyContinue
    if (-not $chromePath) {
        Write-ColorOutput "❌ Chrome n'est pas installé" "Red"
        return $false
    }
    Write-ColorOutput "✓ Chrome détecté" "Green"
    
    # Vérifier le répertoire de l'extension
    if (-not (Test-Path "$ExtensionPath\manifest.json")) {
        Write-ColorOutput "❌ Fichier manifest.json introuvable dans $ExtensionPath" "Red"
        return $false
    }
    Write-ColorOutput "✓ Structure de l'extension valide" "Green"
    
    return $true
}

function Update-ExtensionVersion {
    param([string]$ManifestPath)
    
    try {
        $manifestContent = Get-Content $ManifestPath -Raw
        $manifest = $manifestContent | ConvertFrom-Json
        $versionParts = $manifest.version.Split('.')
        $versionParts[2] = [int]$versionParts[2] + 1
        $newVersion = $versionParts -join '.'
        
        $manifest.version = $newVersion
        $manifest | ConvertTo-Json -Depth 10 | Set-Content $ManifestPath
        
        Write-ColorOutput "✓ Version mise à jour: $newVersion" "Green"
        return $newVersion
	}
	catch {}
	}