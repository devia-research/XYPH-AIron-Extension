# 🔄 Restructuration XYPH - Version modulaire simplifiée

param(
    [switch]$Execute
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    
    $colorMap = @{
        'Red' = 'Red'; 'Green' = 'Green'; 'Yellow' = 'Yellow'
        'Blue' = 'Blue'; 'Magenta' = 'Magenta'; 'Cyan' = 'Cyan'
        'White' = 'White'
    }
    
    Write-Host $Message -ForegroundColor $colorMap[$Color]
}

$ROOT = "F:\Git\XYPH-Project"
$EXTENSION_SOURCE = "F:\Scripts\ExtensionChrome"

# Structure modulaire à créer
$MODULES = @(
    "extension\core",
    "extension\ui\popup", 
    "extension\ui\sidebar",
    "extension\ui\styles",
    "extension\api\providers",
    "extension\api\configs",
    "extension\assets",
    "scripts\deployment",
    "scripts\testing",
    "scripts\development",
    "scripts\maintenance", 
    "scripts\api",
    "docs\user",
    "docs\developer",
    "docs\api",
    "docs\training",
    "tests\unit\extension",
    "tests\unit\scripts",
    "tests\integration",
    "tests\results",
    "tests\data",
    "config\environments",
    "config\api",
    "config\extension",
    "tools\validators",
    "tools\generators"
)

Write-ColorOutput "🔄 RESTRUCTURATION MODULAIRE XYPH" "Magenta"
Write-ColorOutput "==================================" "Magenta"

if (-not $Execute) {
    Write-ColorOutput "🔍 MODE PREVIEW - Utilisez -Execute pour appliquer" "Yellow"
}

Write-ColorOutput "`n📁 Création de la structure modulaire..." "Cyan"

foreach ($module in $MODULES) {
    $fullPath = Join-Path $ROOT $module
    
    if ($Execute) {
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-ColorOutput "   ✅ Créé: $module" "Green"
        } else {
            Write-ColorOutput "   ℹ️  Existe: $module" "Blue"
        }
    } else {
        Write-ColorOutput "   📂 Créerait: $module" "Yellow"
    }
}

Write-ColorOutput "`n📦 Organisation des fichiers extension..." "Cyan"

# Mapping des fichiers extension
$extensionMapping = @{
    "extension\core" = @("manifest.json", "background.js", "content.js")
    "extension\ui\popup" = @("popup.html", "popup.js", "popupl.html")
    "extension\ui\sidebar" = @("sidebar*.html", "sidebar*.js")
    "extension\ui\styles" = @("*.css")
    "tests\results" = @("test-results-*.json")
    "config\extension" = @("launch.json")
}

foreach ($targetModule in $extensionMapping.Keys) {
    $patterns = $extensionMapping[$targetModule]
    $targetPath = Join-Path $ROOT $targetModule
    
    Write-ColorOutput "   📂 Module: $targetModule" "Blue"
    
    foreach ($pattern in $patterns) {
        $files = Get-ChildItem "$EXTENSION_SOURCE\$pattern" -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            if ($Execute) {
                $targetFile = Join-Path $targetPath $file.Name
                Copy-Item $file.FullName $targetFile -Force
                Write-ColorOutput "      ✅ Copié: $($file.Name)" "Green"
            } else {
                Write-ColorOutput "      📄 Copierait: $($file.Name)" "Yellow"
            }
        }
    }
}

Write-ColorOutput "`n🔧 Organisation des scripts..." "Cyan"

# Mapping des scripts
$scriptMapping = @{
    "scripts\testing" = @("*test*.ps1", "*health*.ps1")
    "scripts\development" = @("git-workflow*.ps1", "restructure*.ps1")
    "scripts\deployment" = @("deploy*.ps1")
    "scripts\api" = @("*api*.ps1", "*groq*.ps1", "*endpoint*.ps1")
    "scripts\maintenance" = @("*fix*.ps1", "*backup*.ps1")
}

foreach ($targetModule in $scriptMapping.Keys) {
    $patterns = $scriptMapping[$targetModule]
    $targetPath = Join-Path $ROOT $targetModule
    
    Write-ColorOutput "   📂 Module: $targetModule" "Blue"
    
    foreach ($pattern in $patterns) {
        # Chercher dans le projet Git
        $files = Get-ChildItem "$ROOT\$pattern" -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            if ($Execute) {
                $targetFile = Join-Path $targetPath $file.Name
                if (-not (Test-Path $targetFile)) {
                    Move-Item $file.FullName $targetFile
                    Write-ColorOutput "      ✅ Déplacé: $($file.Name)" "Green"
                }
            } else {
                Write-ColorOutput "      📄 Déplacerait: $($file.Name)" "Yellow"
            }
        }
        
        # Chercher dans ExtensionChrome aussi
        $files = Get-ChildItem "$EXTENSION_SOURCE\$pattern" -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            if ($Execute) {
                $targetFile = Join-Path $targetPath $file.Name
                Copy-Item $file.FullName $targetFile -Force
                Write-ColorOutput "      ✅ Copié: $($file.Name)" "Green"
            } else {
                Write-ColorOutput "      📄 Copierait: $($file.Name)" "Yellow"
            }
        }
    }
}

Write-ColorOutput "`n📚 Organisation de la documentation..." "Cyan"

# Mapping de la documentation
$docMapping = @{
    "docs\api" = @("API_*.md", "*API*.md")
    "docs\training" = @("*TRAINING*.md", "*CREATIVE*.md")
    "docs\user" = @("README.md", "SETUP*.md")
    "docs\developer" = @("*ARCHITECTURE*.md", "*TECHNICAL*.md")
}

foreach ($targetModule in $docMapping.Keys) {
    $patterns = $docMapping[$targetModule]
    $targetPath = Join-Path $ROOT $targetModule
    
    Write-ColorOutput "   📂 Module: $targetModule" "Blue"
    
    foreach ($pattern in $patterns) {
        $files = Get-ChildItem "$ROOT\$pattern" -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            if ($Execute) {
                $targetFile = Join-Path $targetPath $file.Name
                if (-not (Test-Path $targetFile)) {
                    Move-Item $file.FullName $targetFile
                    Write-ColorOutput "      ✅ Déplacé: $($file.Name)" "Green"
                }
            } else {
                Write-ColorOutput "      📄 Déplacerait: $($file.Name)" "Yellow"
            }
        }
    }
}

# Traiter la doc restante
$remainingDocs = Get-ChildItem "$ROOT\*.md" -ErrorAction SilentlyContinue
if ($remainingDocs) {
    Write-ColorOutput "   📂 Documentation restante → docs\user" "Blue"
    foreach ($doc in $remainingDocs) {
        if ($Execute) {
            $targetFile = Join-Path "$ROOT\docs\user" $doc.Name
            Move-Item $doc.FullName $targetFile
            Write-ColorOutput "      ✅ Déplacé: $($doc.Name)" "Green"
        } else {
            Write-ColorOutput "      📄 Déplacerait: $($doc.Name)" "Yellow"
        }
    }
}

Write-ColorOutput "`n📋 Création du README principal..." "Cyan"

$mainReadme = @"
# 🚀 XYPH - Extension Chrome d'Automatisation AI

Extension Chrome intelligente pour la génération automatisée de scripts avec intégration IA multi-provider.

## 📁 Structure Modulaire

``````
XYPH-Project/
├── extension/          # 🧩 Extension Chrome
│   ├── core/          # Fichiers principaux
│   ├── ui/            # Interface utilisateur  
│   ├── api/           # Intégrations API
│   └── assets/        # Ressources
├── scripts/           # 🔧 Scripts d'automatisation
│   ├── deployment/    # Déploiement
│   ├── testing/       # Tests
│   ├── development/   # Développement
│   ├── maintenance/   # Maintenance
│   └── api/           # Gestion API
├── docs/              # 📚 Documentation
│   ├── user/          # Utilisateur
│   ├── developer/     # Développeur
│   ├── api/           # APIs
│   └── training/      # Formation
├── tests/             # 🧪 Tests
│   ├── unit/          # Tests unitaires
│   ├── integration/   # Tests intégration
│   └── results/       # Résultats
├── config/            # ⚙️ Configuration
│   ├── environments/  # Par environnement
│   ├── api/           # APIs
│   └── extension/     # Extension
└── tools/             # 🛠️ Outils dev
    ├── validators/    # Validation
    └── generators/    # Génération
``````

## 🚀 Démarrage Rapide

``````powershell
# Tests
.\scripts\testing\extension.tests.ps1

# Développement
.\scripts\development\git-workflow-sync.ps1 sync-dev

# Déploiement
.\scripts\deployment\deploy-extension.ps1
``````

## 🔧 APIs Supportées

- ✅ **DeepSeek** - Principal (gratuit)
- ✅ **Ollama** - Local (privé)  
- ✅ **OpenAI** - Backup (payant)

---
**Projet restructuré le $(Get-Date -Format "yyyy-MM-dd")** 🎯
"@

if ($Execute) {
    Set-Content "$ROOT\README.md" $mainReadme -Encoding UTF8
    Write-ColorOutput "   ✅ README principal créé" "Green"
} else {
    Write-ColorOutput "   📄 Créerait README principal" "Yellow"
}

Write-ColorOutput "`n📊 RÉSUMÉ" "Magenta"
Write-ColorOutput "=========" "Magenta"

if ($Execute) {
    Write-ColorOutput "✅ Restructuration terminée avec succès!" "Green"
    Write-ColorOutput "📁 Structure modulaire créée dans: $ROOT" "Cyan"
    Write-ColorOutput "🔧 Nouveau workflow:" "Blue"
    Write-ColorOutput "   cd $ROOT" "White"
    Write-ColorOutput "   .\scripts\testing\extension.tests.ps1" "White"
    Write-ColorOutput "   .\scripts\development\git-workflow-sync.ps1" "White"
} else {
    Write-ColorOutput "🔍 Preview terminé. Utilisez -Execute pour appliquer." "Yellow"
    Write-ColorOutput "💡 Commande: .\restructure_modular.ps1 -Execute" "Cyan"
}

Write-ColorOutput "`n🎯 Structure modulaire professionnelle prête!" "Green"