# 🔄 Restructuration intelligente du projet XYPH
# Consolide tout dans un seul repository Git bien organisé

param(
    [switch]$DryRun,
    [switch]$Force
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

# Structure cible recommandée DÉTAILLÉE
$TARGET_STRUCTURE = @"
F:\Git\XYPH-Project\                 # Repository principal Git
├── .git\                            # Contrôle de version
├── extension\                       # 📁 Extension Chrome - Code source
│   ├── core\                        # Fonctionnalités principales
│   │   ├── manifest.json
│   │   ├── background.js
│   │   └── content.js
│   ├── ui\                          # Interface utilisateur
│   │   ├── popup\
│   │   │   ├── popup.html
│   │   │   ├── popup.js
│   │   │   └── popup.css
│   │   ├── sidebar\
│   │   │   ├── sidebar.html
│   │   │   ├── sidebar.js
│   │   │   └── sidebar.css
│   │   └── styles\
│   │       └── content.css
│   ├── api\                         # Intégrations API
│   │   ├── providers\
│   │   ├── configs\
│   │   └── fallback\
│   └── assets\                      # Ressources statiques
│       ├── icons\
│       └── images\
├── scripts\                         # 📁 Scripts d'automatisation
│   ├── deployment\                  # Scripts de déploiement
│   │   ├── deploy-extension.ps1
│   │   └── package-extension.ps1
│   ├── testing\                     # Scripts de test
│   │   ├── extension.tests.ps1
│   │   ├── api-tests.ps1
│   │   └── integration-tests.ps1
│   ├── development\                 # Scripts de développement
│   │   ├── git-workflow-sync.ps1
│   │   ├── setup-dev-env.ps1
│   │   └── build-watch.ps1
│   ├── maintenance\                 # Scripts de maintenance
│   │   ├── health_check.ps1
│   │   ├── cleanup.ps1
│   │   └── backup.ps1
│   └── api\                         # Scripts API
│       ├── test_api_endpoints.ps1
│       ├── setup_apis.ps1
│       └── validate_keys.ps1
├── docs\                           # 📁 Documentation complète
│   ├── user\                        # Documentation utilisateur
│   │   ├── README.md
│   │   ├── INSTALLATION.md
│   │   └── USER_GUIDE.md
│   ├── developer\                   # Documentation développeur
│   │   ├── API_REFERENCE.md
│   │   ├── ARCHITECTURE.md
│   │   └── CONTRIBUTING.md
│   ├── api\                         # Documentation API
│   │   ├── API_KEYS_GUIDE.md
│   │   ├── PROVIDERS.md
│   │   └── ENDPOINTS.md
│   └── training\                    # Documentation formation
│       ├── TRAINING_GUIDE.md
│       └── CREATIVE_TRAINING.md
├── tests\                          # 📁 Tests et validations
│   ├── unit\                        # Tests unitaires
│   │   ├── extension\
│   │   └── scripts\
│   ├── integration\                 # Tests d'intégration
│   │   ├── api\
│   │   └── workflow\
│   ├── e2e\                         # Tests end-to-end
│   │   └── scenarios\
│   ├── results\                     # Résultats des tests
│   │   ├── reports\
│   │   └── history\
│   └── data\                        # Données de test
│       ├── fixtures\
│       └── mocks\
├── config\                         # 📁 Configuration
│   ├── environments\                # Configs par environnement
│   │   ├── development.json
│   │   ├── testing.json
│   │   └── production.json
│   ├── api\                         # Configurations API
│   │   ├── providers.json
│   │   └── endpoints.json
│   ├── extension\                   # Configuration extension
│   │   ├── features.json
│   │   └── permissions.json
│   └── templates\                   # Templates de configuration
│       └── api-keys.template.json
├── tools\                          # 📁 Outils de développement
│   ├── validators\                  # Outils de validation
│   ├── generators\                  # Générateurs de code
│   └── analyzers\                   # Outils d'analyse
└── .github\                        # 📁 GitHub workflows (si applicable)
    ├── workflows\
    └── templates\
"@

$CURRENT_LOCATIONS = @{
    ExtensionFiles = "F:\Scripts\ExtensionChrome"
    GitProject = "F:\Git\XYPH-Project"
    TargetRoot = "F:\Git\XYPH-Project"
}

function Show-StructurePlan {
    Write-ColorOutput "🎯 PLAN DE RESTRUCTURATION" "Magenta"
    Write-ColorOutput "===========================" "Magenta"
    
    Write-ColorOutput "`n📋 Structure cible:" "Cyan"
    Write-Output $TARGET_STRUCTURE
    
    Write-ColorOutput "`n🔄 Migrations prévues:" "Blue"
    Write-ColorOutput "   📁 F:\Scripts\ExtensionChrome\*.* → F:\Git\XYPH-Project\extension\" "White"
    Write-ColorOutput "   📁 Scripts éparpillés → F:\Git\XYPH-Project\scripts\" "White"
    Write-ColorOutput "   📁 Documentation → F:\Git\XYPH-Project\docs\" "White"
    Write-ColorOutput "   📁 Tests → F:\Git\XYPH-Project\tests\" "White"
}

function Test-Prerequisites {
    Write-ColorOutput "`n🔍 Vérification des prérequis..." "Cyan"
    
    $issues = @()
    
    # Vérifier que les dossiers source existent
    if (-not (Test-Path $CURRENT_LOCATIONS.ExtensionFiles)) {
        $issues += "❌ Dossier extension introuvable: $($CURRENT_LOCATIONS.ExtensionFiles)"
    } else {
        Write-ColorOutput "   ✅ Dossier extension trouvé" "Green"
    }
    
    if (-not (Test-Path $CURRENT_LOCATIONS.GitProject)) {
        $issues += "❌ Dossier Git introuvable: $($CURRENT_LOCATIONS.GitProject)"
    } else {
        Write-ColorOutput "   ✅ Dossier Git trouvé" "Green"
    }
    
    # Vérifier Git status
    try {
        Push-Location $CURRENT_LOCATIONS.GitProject
        $gitStatus = git status --porcelain 2>$null
        if ($gitStatus) {
            $issues += "⚠️  Changements non commitées dans Git"
        } else {
            Write-ColorOutput "   ✅ Git repository propre" "Green"
        }
    } catch {
        $issues += "❌ Problème avec Git: $($_.Exception.Message)"
    } finally {
        Pop-Location
    }
    
    return $issues
}

function Create-NewStructure {
    param([string]$RootPath)
    
    $folders = @(
        # Extension structure détaillée
        "$RootPath\extension\core",
        "$RootPath\extension\ui\popup",
        "$RootPath\extension\ui\sidebar", 
        "$RootPath\extension\ui\styles",
        "$RootPath\extension\api\providers",
        "$RootPath\extension\api\configs",
        "$RootPath\extension\api\fallback",
        "$RootPath\extension\assets\icons",
        "$RootPath\extension\assets\images",
        
        # Scripts structure modulaire
        "$RootPath\scripts\deployment",
        "$RootPath\scripts\testing",
        "$RootPath\scripts\development", 
        "$RootPath\scripts\maintenance",
        "$RootPath\scripts\api",
        
        # Documentation organisée
        "$RootPath\docs\user",
        "$RootPath\docs\developer",
        "$RootPath\docs\api",
        "$RootPath\docs\training",
        
        # Tests complets
        "$RootPath\tests\unit\extension",
        "$RootPath\tests\unit\scripts",
        "$RootPath\tests\integration\api",
        "$RootPath\tests\integration\workflow",
        "$RootPath\tests\e2e\scenarios",
        "$RootPath\tests\results\reports",
        "$RootPath\tests\results\history",
        "$RootPath\tests\data\fixtures",
        "$RootPath\tests\data\mocks",
        
        # Configuration par environnement
        "$RootPath\config\environments",
        "$RootPath\config\api",
        "$RootPath\config\extension",
        "$RootPath\config\templates",
        
        # Outils de développement
        "$RootPath\tools\validators",
        "$RootPath\tools\generators",
        "$RootPath\tools\analyzers",
        
        # GitHub workflows
        "$RootPath\.github\workflows",
        "$RootPath\.github\templates"
    )
    
    Write-ColorOutput "`n📁 Création de la structure modulaire détaillée..." "Cyan"
    
    foreach ($folder in $folders) {
        if ($DryRun) {
            Write-ColorOutput "   🔍 [DRY RUN] Créerait: $folder" "Yellow"
        } else {
            if (-not (Test-Path $folder)) {
                New-Item -ItemType Directory -Path $folder -Force | Out-Null
                Write-ColorOutput "   ✅ Créé: $folder" "Green"
            } else {
                Write-ColorOutput "   ℹ️  Existe déjà: $folder" "Blue"
            }
        }
    }
}

function Move-ExtensionFiles {
    $source = $CURRENT_LOCATIONS.ExtensionFiles
    $target = "$($CURRENT_LOCATIONS.TargetRoot)\extension"
    
    Write-ColorOutput "`n📦 Migration modulaire des fichiers extension..." "Cyan"
    
    # Mapping intelligent des fichiers vers leurs modules
    $fileMapping = @{
        # Core files
        "core" = @("manifest.json", "background.js", "content.js")
        
        # UI files  
        "ui\popup" = @("popup.html", "popup.js", "popupl.html")
        "ui\sidebar" = @("sidebar.html", "sidebar.js", "sidebar-*.html")
        "ui\styles" = @("content.css", "*.css")
        
        # Test files vers tests
        "..\..\tests\results\history" = @("test-results-*.json")
        
        # Config files
        "..\..\config\extension" = @("launch.json")
        
        # Documentation
        "..\..\docs\user" = @("*DeepSeek*.html", "react-index.html")
    }
    
    foreach ($moduleDir in $fileMapping.Keys) {
        $patterns = $fileMapping[$moduleDir]
        $moduleTarget = Join-Path $target $moduleDir
        
        Write-ColorOutput "   📂 Module: $moduleDir" "Blue"
        
        foreach ($pattern in $patterns) {
            $files = Get-ChildItem "$source\$pattern" -ErrorAction SilentlyContinue
            foreach ($file in $files) {
                $targetFile = Join-Path $moduleTarget $file.Name
                
                if ($DryRun) {
                    Write-ColorOutput "      🔍 [DRY RUN] $($file.Name) → $moduleDir\" "Yellow"
                } else {
                    # Créer le dossier si nécessaire
                    $targetDir = Split-Path $targetFile -Parent
                    if (-not (Test-Path $targetDir)) {
                        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                    }
                    
                    if (Test-Path $targetFile) {
                        if ($Force) {
                            Copy-Item $file.FullName $targetFile -Force
                            Write-ColorOutput "      🔄 Remplacé: $($file.Name)" "Yellow"
                        } else {
                            Write-ColorOutput "      ⚠️  Existe déjà: $($file.Name) (utilisez -Force)" "Yellow"
                        }
                    } else {
                        Copy-Item $file.FullName $targetFile
                        Write-ColorOutput "      ✅ Copié: $($file.Name) → $moduleDir\" "Green"
                    }
                }
            }
        }
    }
}

function Move-Scripts {
    $source = $CURRENT_LOCATIONS.GitProject
    $target = "$($CURRENT_LOCATIONS.TargetRoot)\scripts"
    
    Write-ColorOutput "`n🔧 Migration modulaire des scripts..." "Cyan"
    
    # Mapping intelligent des scripts vers leurs modules
    $scriptMapping = @{
        "deployment" = @("deploy-extension.ps1", "package-extension.ps1")
        "testing" = @("extension.tests.ps1", "*test*.ps1", "health_check.ps1")
        "development" = @("git-workflow-sync.ps1", "restructure_project.ps1", "setup*.ps1")
        "maintenance" = @("*backup*.ps1", "*cleanup*.ps1", "*fix*.ps1")
        "api" = @("*api*.ps1", "*groq*.ps1", "*endpoint*.ps1")
    }
    
    # D'abord, copier depuis ExtensionChrome s'il y a des scripts là-bas
    $extensionScripts = Get-ChildItem "$($CURRENT_LOCATIONS.ExtensionFiles)\*.ps1" -ErrorAction SilentlyContinue
    if ($extensionScripts) {
        Write-ColorOutput "   📂 Scripts trouvés dans ExtensionChrome:" "Blue"
        foreach ($script in $extensionScripts) {
            # Déterminer le module approprié
            $moduleDir = "testing"  # Par défaut pour les scripts d'extension
            if ($script.Name -like "*deploy*") { $moduleDir = "deployment" }
            if ($script.Name -like "*git*") { $moduleDir = "development" }
            
            $targetFile = Join-Path "$target\$moduleDir" $script.Name
            
            if ($DryRun) {
                Write-ColorOutput "      🔍 [DRY RUN] $($script.Name) → scripts\$moduleDir\" "Yellow"
            } else {
                $targetDir = Split-Path $targetFile -Parent
                if (-not (Test-Path $targetDir)) {
                    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                }
                Copy-Item $script.FullName $targetFile
                Write-ColorOutput "      ✅ Copié: $($script.Name) → scripts\$moduleDir\" "Green"
            }
        }
    }
    
    # Ensuite, organiser les scripts du projet Git
    foreach ($moduleDir in $scriptMapping.Keys) {
        $patterns = $scriptMapping[$moduleDir]
        $moduleTarget = Join-Path $target $moduleDir
        
        Write-ColorOutput "   📂 Module: scripts\$moduleDir" "Blue"
        
        foreach ($pattern in $patterns) {
            $scripts = Get-ChildItem "$source\$pattern" -ErrorAction SilentlyContinue
            foreach ($script in $scripts) {
                $targetFile = Join-Path $moduleTarget $script.Name
                
                if ($DryRun) {
                    Write-ColorOutput "      🔍 [DRY RUN] $($script.Name) → scripts\$moduleDir\" "Yellow"
                } else {
                    if (-not (Test-Path $targetFile)) {
                        Move-Item $script.FullName $targetFile
                        Write-ColorOutput "      ✅ Déplacé: $($script.Name) → scripts\$moduleDir\" "Green"
                    } else {
                        Write-ColorOutput "      ℹ️  Existe déjà: $($script.Name)" "Blue"
                    }
                }
            }
        }
    }
}

function Move-Documentation {
    $source = $CURRENT_LOCATIONS.GitProject  
    $target = "$($CURRENT_LOCATIONS.TargetRoot)\docs"
    
    Write-ColorOutput "`n📚 Migration modulaire de la documentation..." "Cyan"
    
    # Mapping intelligent de la documentation vers ses modules
    $docMapping = @{
        "api" = @("API_*.md", "*API*.md", "ENDPOINT*.md", "CORRECTED_API*.md")
        "developer" = @("ARCHITECTURE*.md", "TECHNICAL*.md", "*DEVELOPMENT*.md")
        "training" = @("*TRAINING*.md", "*CREATIVE*.md", "COLLABORATIVE*.md")
        "user" = @("README.md", "SETUP*.md", "INSTALLATION*.md", "USER_GUIDE*.md")
        "reports" = @("*STATUS*.md", "*REPORT*.md", "*SUMMARY*.md")
    }
    
    foreach ($moduleDir in $docMapping.Keys) {
        $patterns = $docMapping[$moduleDir]
        $moduleTarget = Join-Path $target $moduleDir
        
        Write-ColorOutput "   📂 Module: docs\$moduleDir" "Blue"
        
        foreach ($pattern in $patterns) {
            $docs = Get-ChildItem "$source\$pattern" -ErrorAction SilentlyContinue
            foreach ($doc in $docs) {
                $targetFile = Join-Path $moduleTarget $doc.Name
                
                if ($DryRun) {
                    Write-ColorOutput "      🔍 [DRY RUN] $($doc.Name) → docs\$moduleDir\" "Yellow"
                } else {
                    $targetDir = Split-Path $targetFile -Parent
                    if (-not (Test-Path $targetDir)) {
                        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                    }
                    
                    if (-not (Test-Path $targetFile)) {
                        Move-Item $doc.FullName $targetFile
                        Write-ColorOutput "      ✅ Déplacé: $($doc.Name) → docs\$moduleDir\" "Green"
                    } else {
                        Write-ColorOutput "      ℹ️  Existe déjà: $($doc.Name)" "Blue"
                    }
                }
            }
        }
    }
    
    # Traiter les fichiers documentation restants (non catégorisés)
    $remainingDocs = Get-ChildItem "$source\*.md" -ErrorAction SilentlyContinue
    if ($remainingDocs) {
        Write-ColorOutput "   📂 Documentation non catégorisée → docs\user\" "Blue"
        foreach ($doc in $remainingDocs) {
            $targetFile = Join-Path "$target\user" $doc.Name
            
            if ($DryRun) {
                Write-ColorOutput "      🔍 [DRY RUN] $($doc.Name) → docs\user\" "Yellow"
            } else {
                if (-not (Test-Path $targetFile)) {
                    Move-Item $doc.FullName $targetFile
                    Write-ColorOutput "      ✅ Déplacé: $($doc.Name) → docs\user\" "Green"
                }
            }
        }
    }
}

function Update-GitIgnore {
    $gitignorePath = "$($CURRENT_LOCATIONS.TargetRoot)\.gitignore"
    
    $gitignoreContent = @"
# XYPH Project .gitignore

# Tests temporaires
tests/test-results/*.json
tests/api-tests/temp-*

# Logs
*.log
logs/

# Configuration sensible
config/*-keys.json
config/api-keys.*

# Sauvegardes
*.backup.*
backup/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/settings.json
.idea/

# Extension temporaires
extension/*.crx
extension/key.pem

# Scripts temporaires
scripts/temp-*
scripts/debug-*
"@

    if ($DryRun) {
        Write-ColorOutput "   🔍 [DRY RUN] Créerait .gitignore" "Yellow"
    } else {
        Set-Content $gitignorePath $gitignoreContent -Encoding UTF8
        Write-ColorOutput "   ✅ .gitignore créé" "Green"
    }
}

function Create-ModuleReadmes {
    $rootPath = $CURRENT_LOCATIONS.TargetRoot
    
    Write-ColorOutput "`n📝 Création des README modulaires..." "Cyan"
    
    # README pour chaque module principal
    $moduleReadmes = @{
        "extension\README.md" = @"
# 🧩 Extension Chrome XYPH

Code source de l'extension Chrome pour l'automatisation AI.

## 📁 Structure

- `core/` - Fichiers principaux (manifest, background, content)
- `ui/` - Interface utilisateur (popup, sidebar, styles)  
- `api/` - Intégrations API et providers
- `assets/` - Ressources statiques (icons, images)

## 🔧 Installation

```bash
# Charger l'extension en mode développeur
chrome://extensions/ → Mode développeur → Charger l'extension non empaquetée
```

## 🚀 Développement

```powershell
# Tester l'extension
..\scripts\testing\extension.tests.ps1

# Déployer
..\scripts\deployment\deploy-extension.ps1
```
"@

        "scripts\README.md" = @"
# 🔧 Scripts d'Automatisation XYPH

Scripts PowerShell pour le développement, test, et déploiement.

## 📁 Modules

- `deployment/` - Scripts de déploiement et packaging
- `testing/` - Tests automatisés et validation
- `development/` - Workflows Git et environnement dev
- `maintenance/` - Maintenance et outils utilitaires
- `api/` - Gestion et tests des APIs

## 🚀 Utilisation

```powershell
# Workflow de développement
.\development\git-workflow-sync.ps1 sync-dev

# Tests complets
.\testing\extension.tests.ps1

# Déploiement
.\deployment\deploy-extension.ps1
```
"@

        "docs\README.md" = @"
# 📚 Documentation XYPH

Documentation complète du projet organisée par audience.

## 📁 Structure

- `user/` - Documentation utilisateur finale
- `developer/` - Documentation technique développeur
- `api/` - Documentation des APIs et intégrations
- `training/` - Guides de formation et d'entraînement
- `reports/` - Rapports de statut et analyses

## 🎯 Navigation Rapide

- **Utilisateur** → `user/README.md`
- **Développeur** → `developer/ARCHITECTURE.md`
- **APIs** → `api/API_KEYS_GUIDE.md`
- **Formation** → `training/TRAINING_GUIDE.md`
"@

        "tests\README.md" = @"
# 🧪 Tests XYPH

Suite complète de tests pour l'extension et les scripts.

## 📁 Structure

- `unit/` - Tests unitaires (extension & scripts)
- `integration/` - Tests d'intégration (API & workflow)
- `e2e/` - Tests end-to-end complets
- `results/` - Résultats et historique des tests
- `data/` - Données de test (fixtures & mocks)

## 🚀 Exécution

```powershell
# Tests unitaires
..\scripts\testing\extension.tests.ps1

# Tests API
..\scripts\testing\api-tests.ps1

# Tests complets
..\scripts\testing\integration-tests.ps1
```
"@

        "config\README.md" = @"
# ⚙️ Configuration XYPH

Configurations par environnement et module.

## 📁 Structure

- `environments/` - Configs par environnement (dev/test/prod)
- `api/` - Configuration des providers API
- `extension/` - Configuration de l'extension Chrome
- `templates/` - Templates de configuration

## 🔧 Utilisation

```powershell
# Setup initial
..\scripts\api\setup_apis.ps1

# Validation
..\scripts\api\validate_keys.ps1
```

## 🔒 Sécurité

⚠️ **Ne jamais committer de clés API !**
Utiliser les templates et variables d'environnement.
"@

        "tools\README.md" = @"
# 🛠️ Outils de Développement XYPH

Outils et utilitaires pour le développement.

## 📁 Structure

- `validators/` - Outils de validation (code, config, APIs)
- `generators/` - Générateurs de code et templates
- `analyzers/` - Outils d'analyse et métriques

## 🚀 Utilisation

Ces outils supportent le workflow de développement et sont appelés par les scripts principaux.
"@
    }
    
    foreach ($relativePath in $moduleReadmes.Keys) {
        $fullPath = Join-Path $rootPath $relativePath
        $content = $moduleReadmes[$relativePath]
        
        if ($DryRun) {
            Write-ColorOutput "   🔍 [DRY RUN] Créerait: $relativePath" "Yellow"
        } else {
            $dir = Split-Path $fullPath -Parent
            if (-not (Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
            }
            
            Set-Content $fullPath $content -Encoding UTF8
            Write-ColorOutput "   ✅ Créé: $relativePath" "Green"
        }
    }
}
    $readmePath = "$($CURRENT_LOCATIONS.TargetRoot)\README.md"
    
    $readmeContent = @"
# 🚀 XYPH - Extension Chrome d'Automatisation AI

Extension Chrome intelligente pour la génération automatisée de scripts avec intégration IA multi-provider.

## 📁 Structure du Projet

```
XYPH-Project/
├── extension/          # Code source Extension Chrome
├── scripts/           # Scripts d'automatisation et déploiement  
├── docs/             # Documentation complète
├── tests/            # Tests automatisés
└── config/           # Configuration et APIs
```

## 🚀 Installation Rapide

```powershell
# Cloner et installer
git clone [repository-url]
cd XYPH-Project

# Tester l'extension
.\scripts\extension.tests.ps1

# Déployer
.\scripts\git-workflow-sync.ps1 test-and-deploy
```

## 🔧 APIs Supportées

- ✅ **DeepSeek** - Principal (gratuit)
- ✅ **Ollama** - Local (privé)  
- ✅ **OpenAI** - Backup (payant)

## 📚 Documentation

Voir `docs/` pour la documentation complète.

---
**Projet restructuré le $(Get-Date -Format "yyyy-MM-dd")** 🎯
"@

    if ($DryRun) {
        Write-ColorOutput "   🔍 [DRY RUN] Créerait README.md principal" "Yellow"
    } else {
        Set-Content $readmePath $readmeContent -Encoding UTF8
        Write-ColorOutput "   ✅ README.md principal créé" "Green"
    }
}

function Show-Summary {
    Write-ColorOutput "`n📊 RÉSUMÉ DE LA RESTRUCTURATION" "Magenta"
    Write-ColorOutput "===============================" "Magenta"
    
    Write-ColorOutput "`n✅ AVANTAGES de la nouvelle structure:" "Green"
    Write-ColorOutput "   • 📁 Tout centralisé dans un seul repository Git" "White"
    Write-ColorOutput "   • 🔄 Synchronisation Git simplifiée" "White"
    Write-ColorOutput "   • 📋 Structure logique et professionnelle" "White"
    Write-ColorOutput "   • 🔧 Scripts et extension liés" "White"
    Write-ColorOutput "   • 📚 Documentation centralisée" "White"
    
    Write-ColorOutput "`n🎯 PROCHAINES ÉTAPES:" "Cyan"
    Write-ColorOutput "   1. Tester la nouvelle structure" "White"
    Write-ColorOutput "   2. Mettre à jour les chemins dans les scripts" "White"
    Write-ColorOutput "   3. Commiter la restructuration" "White"
    Write-ColorOutput "   4. Supprimer l'ancienne structure" "White"
    
    Write-ColorOutput "`n💡 COMMANDES UTILES:" "Blue"
    Write-ColorOutput "   cd F:\Git\XYPH-Project" "White"
    Write-ColorOutput "   .\scripts\extension.tests.ps1" "White"
    Write-ColorOutput "   .\scripts\git-workflow-sync.ps1 test-and-deploy" "White"
}

# EXÉCUTION PRINCIPALE
Write-ColorOutput "🔄 RESTRUCTURATION XYPH PROJECT" "Magenta"
Write-ColorOutput "=================================" "Magenta"

if ($DryRun) {
    Write-ColorOutput "🔍 MODE DRY RUN - Aucune modification ne sera appliquée`n" "Yellow"
}

# Montrer le plan
Show-StructurePlan

# Vérifier les prérequis
$issues = Test-Prerequisites
if ($issues.Count -gt 0 -and -not $Force) {
    Write-ColorOutput "`n⚠️  PROBLÈMES DÉTECTÉS:" "Red"
    foreach ($issue in $issues) {
        Write-ColorOutput "   $issue" "Red"
    }
    Write-ColorOutput "`n💡 Utilisez -Force pour continuer malgré les avertissements" "Yellow"
    exit 1
}

# Exécuter la restructuration
Create-NewStructure -RootPath $CURRENT_LOCATIONS.TargetRoot
Move-ExtensionFiles
Move-Scripts  
Move-Documentation
Update-GitIgnore
Create-MainReadme

# Afficher le résumé
Show-Summary

if ($DryRun) {
    Write-ColorOutput "`n🔍 Utilisez sans -DryRun pour appliquer les changements" "Yellow"
} else {
    Write-ColorOutput "`n🎉 Restructuration terminée avec succès!" "Green"
    Write-ColorOutput "📁 Nouveau répertoire de travail: F:\Git\XYPH-Project" "Cyan"
}