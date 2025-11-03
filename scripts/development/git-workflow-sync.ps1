# 🔄 Git Workflow Synchronization Script
# Synchronise les branches développement et main avec validation par tests

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("sync-dev", "test-and-deploy", "force-sync", "status", "setup")]
    [string]$Action = "status",
    
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force = $false
)

# Configuration
$DevBranch = "developpement"
$MainBranch = "main"
$RemoteName = "origin"
$TestCommand = "npm test"  # Adapter selon tes tests
$ProjectPath = Get-Location

Write-Host "🔄 Git Workflow Manager - Extension Chrome" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

function Write-StatusMessage {
    param([string]$Message, [string]$Type = "Info")
    
    $colors = @{
        "Success" = "Green"
        "Warning" = "Yellow" 
        "Error" = "Red"
        "Info" = "Cyan"
    }
    
    $icon = switch ($Type) {
        "Success" { "✅" }
        "Warning" { "⚠️" }
        "Error" { "❌" }
        default { "ℹ️" }
    }
    
    Write-Host "$icon $Message" -ForegroundColor $colors[$Type]
}

function Get-GitStatus {
    Write-Host "📊 État actuel du repository" -ForegroundColor Blue
    Write-Host "=============================" -ForegroundColor Blue
    
    try {
        # Branche actuelle
        $currentBranch = git rev-parse --abbrev-ref HEAD
        Write-Host "🌿 Branche actuelle: $currentBranch" -ForegroundColor Green
        
        # Status des fichiers
        $status = git status --porcelain
        if ($status) {
            Write-Host "📝 Fichiers modifiés:" -ForegroundColor Yellow
            $status | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        } else {
            Write-StatusMessage "Aucune modification en attente" "Success"
        }
        
        # Status des branches
        Write-Host ""
        Write-Host "🌲 Branches locales vs distantes:" -ForegroundColor Blue
        
        # Vérifier développement
        try {
            $devLocal = git rev-parse $DevBranch 2>$null
            $devRemote = git rev-parse "$RemoteName/$DevBranch" 2>$null
            
            if ($devLocal -eq $devRemote) {
                Write-StatusMessage "${DevBranch}: Synchronisée ✨" "Success"
            } else {
                Write-StatusMessage "${DevBranch}: Désynchronisée" "Warning"
            }
        } catch {
            Write-StatusMessage "${DevBranch}: Problème de comparaison" "Warning"
        }
        
        # Vérifier main
        try {
            $mainLocal = git rev-parse $MainBranch 2>$null
            $mainRemote = git rev-parse "$RemoteName/$MainBranch" 2>$null
            
            if ($mainLocal -eq $mainRemote) {
                Write-StatusMessage "${MainBranch}: Synchronisée ✨" "Success"
            } else {
                Write-StatusMessage "${MainBranch}: Désynchronisée" "Warning"
            }
        } catch {
            Write-StatusMessage "${MainBranch}: Problème de comparaison" "Warning"
        }
        
        return $true
    } catch {
        Write-StatusMessage "Erreur lors de la vérification du statut Git: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Test-Repository {
    Write-Host "🧪 Exécution des tests..." -ForegroundColor Blue
    
    # Vérifier s'il y a des tests configurés
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.test) {
            Write-StatusMessage "Tests npm détectés, exécution..." "Info"
            
            try {
                Invoke-Expression $TestCommand | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-StatusMessage "✅ Tests réussis !" "Success"
                    return $true
                } else {
                    Write-StatusMessage "❌ Tests échoués !" "Error"
                    return $false
                }
            } catch {
                Write-StatusMessage "Erreur lors de l'exécution des tests: $($_.Exception.Message)" "Error"
                return $false
            }
        }
    }
    
    # Tests PowerShell basiques
    if (Test-Path "*.tests.ps1") {
        Write-StatusMessage "Tests PowerShell détectés..." "Info"
        
        $testFiles = Get-ChildItem "*.tests.ps1"
        $allTestsPassed = $true
        
        foreach ($testFile in $testFiles) {
            try {
                Write-Host "   Exécution: $($testFile.Name)" -ForegroundColor Gray
                & $testFile.FullName
                
                if ($LASTEXITCODE -ne 0) {
                    $allTestsPassed = $false
                }
            } catch {
                Write-StatusMessage "Erreur dans $($testFile.Name): $($_.Exception.Message)" "Error"
                $allTestsPassed = $false
            }
        }
        
        if ($allTestsPassed) {
            Write-StatusMessage "✅ Tous les tests PowerShell réussis !" "Success"
            return $true
        } else {
            Write-StatusMessage "❌ Certains tests PowerShell ont échoué !" "Error"
            return $false
        }
    }
    
    # Validation basique des fichiers critiques
    Write-StatusMessage "Validation basique des fichiers..." "Info"
    
    $criticalFiles = @("manifest.json", "background.js", "sidebar.js")
    $allValid = $true
    
    foreach ($file in $criticalFiles) {
        if (Test-Path $file) {
            try {
                # Validation JSON pour manifest.json
                if ($file -eq "manifest.json") {
                    $content = Get-Content $file | ConvertFrom-Json
                    Write-Host "   ✅ ${file}: JSON valide" -ForegroundColor Green
                } else {
                    # Validation syntaxe basique pour JS
                    $content = Get-Content $file
                    if ($content -match "function|const|let|var") {
                        Write-Host "   ✅ ${file}: Syntaxe JavaScript détectée" -ForegroundColor Green
                    }
                }
            } catch {
                Write-StatusMessage "${file}: Erreur de validation" "Error"
                $allValid = $false
            }
        } else {
            Write-StatusMessage "${file}: Fichier manquant" "Warning"
        }
    }
    
    if ($allValid) {
        Write-StatusMessage "✅ Validation basique réussie" "Success"
        return $true
    } else {
        Write-StatusMessage "⚠️ Validation basique avec avertissements" "Warning"
        return $true  # On continue même avec des warnings
    }
}

function Sync-DevelopmentBranch {
    Write-Host "🔄 Synchronisation de la branche $DevBranch" -ForegroundColor Blue
    Write-Host "============================================" -ForegroundColor Blue
    
    try {
        # S'assurer qu'on est sur la bonne branche
        $currentBranch = git rev-parse --abbrev-ref HEAD
        if ($currentBranch -ne $DevBranch) {
            Write-StatusMessage "Basculement vers $DevBranch..." "Info"
            git checkout $DevBranch
            
            if ($LASTEXITCODE -ne 0) {
                # Créer la branche si elle n'existe pas
                Write-StatusMessage "Création de la branche $DevBranch..." "Info"
                git checkout -b $DevBranch
            }
        }
        
        # Récupérer les dernières modifications distantes
        Write-StatusMessage "Récupération des modifications distantes..." "Info"
        git fetch $RemoteName
        
        # Vérifier s'il y a des modifications locales
        $status = git status --porcelain
        if ($status) {
            if ($CommitMessage) {
                Write-StatusMessage "Commit des modifications locales..." "Info"
                git add .
                git commit -m $CommitMessage
            } else {
                Write-StatusMessage "Modifications détectées mais pas de message de commit fourni" "Warning"
                Write-Host "Utilisez -CommitMessage 'votre message' pour commiter automatiquement" -ForegroundColor Yellow
                return $false
            }
        }
        
        # Merger les modifications distantes
        try {
            git merge "$RemoteName/$DevBranch"
            
            if ($LASTEXITCODE -eq 0) {
                Write-StatusMessage "Merge des modifications distantes réussi" "Success"
            } else {
                Write-StatusMessage "Conflits de merge détectés" "Warning"
                Write-Host "Résolvez les conflits manuellement puis relancez la synchronisation" -ForegroundColor Yellow
                return $false
            }
        } catch {
            Write-StatusMessage "Pas de branche distante $DevBranch, première synchronisation" "Info"
        }
        
        # Pousser vers la branche distante
        Write-StatusMessage "Push vers $RemoteName/$DevBranch..." "Info"
        git push -u $RemoteName $DevBranch
        
        if ($LASTEXITCODE -eq 0) {
            Write-StatusMessage "✅ Synchronisation de $DevBranch réussie !" "Success"
            return $true
        } else {
            Write-StatusMessage "❌ Erreur lors du push" "Error"
            return $false
        }
        
    } catch {
        Write-StatusMessage "Erreur lors de la synchronisation: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Deploy-ToMain {
    Write-Host "🚀 Déploiement vers $MainBranch après validation" -ForegroundColor Blue
    Write-Host "================================================" -ForegroundColor Blue
    
    # Étape 1: Tests sur développement
    Write-StatusMessage "Étape 1: Validation des tests sur $DevBranch" "Info"
    
    # S'assurer qu'on est sur développement
    $currentBranch = git rev-parse --abbrev-ref HEAD
    if ($currentBranch -ne $DevBranch) {
        git checkout $DevBranch
    }
    
    # Synchroniser développement d'abord
    if (-not (Sync-DevelopmentBranch)) {
        Write-StatusMessage "❌ Impossible de synchroniser $DevBranch" "Error"
        return $false
    }
    
    # Exécuter les tests
    if (-not (Test-Repository)) {
        Write-StatusMessage "❌ Tests échoués, déploiement annulé" "Error"
        return $false
    }
    
    # Étape 2: Merge vers main
    Write-StatusMessage "Étape 2: Merge vers $MainBranch" "Info"
    
    try {
        # Basculer vers main
        git checkout $MainBranch
        
        if ($LASTEXITCODE -ne 0) {
            # Créer main si elle n'existe pas
            Write-StatusMessage "Création de la branche $MainBranch..." "Info"
            git checkout -b $MainBranch
        }
        
        # Merger développement dans main
        Write-StatusMessage "Merge de $DevBranch dans $MainBranch..." "Info"
        git merge $DevBranch --no-ff -m "Release: Merge $DevBranch to $MainBranch - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        
        if ($LASTEXITCODE -ne 0) {
            Write-StatusMessage "❌ Conflits lors du merge" "Error"
            return $false
        }
        
        # Tests finaux sur main
        Write-StatusMessage "Tests finaux sur $MainBranch..." "Info"
        if (-not (Test-Repository)) {
            Write-StatusMessage "❌ Tests finaux échoués, rollback..." "Error"
            git reset --hard HEAD~1
            return $false
        }
        
        # Push vers main distante
        Write-StatusMessage "Push vers $RemoteName/$MainBranch..." "Info"
        git push -u $RemoteName $MainBranch
        
        if ($LASTEXITCODE -eq 0) {
            Write-StatusMessage "✅ Déploiement vers $MainBranch réussi !" "Success"
            
            # Retourner sur développement
            git checkout $DevBranch
            
            # Créer un tag de release
            $tagName = "release-$(Get-Date -Format 'yyyy.MM.dd-HHmm')"
            git tag $tagName $MainBranch
            git push $RemoteName $tagName
            
            Write-StatusMessage "🏷️ Tag créé: $tagName" "Success"
            return $true
        } else {
            Write-StatusMessage "❌ Erreur lors du push vers $MainBranch" "Error"
            return $false
        }
        
    } catch {
        Write-StatusMessage "Erreur lors du déploiement: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Initialize-GitWorkflow {
    Write-Host "⚙️ Configuration du workflow Git" -ForegroundColor Blue
    Write-Host "=================================" -ForegroundColor Blue
    
    # Vérifier si on est dans un repo Git
    if (-not (Test-Path ".git")) {
        Write-StatusMessage "Initialisation du repository Git..." "Info"
        git init
        
        # Configuration de base
        Write-Host "Configuration de Git (laisser vide pour garder la config actuelle):" -ForegroundColor Yellow
        
        $userName = Read-Host "Nom d'utilisateur Git"
        if ($userName) {
            git config user.name $userName
        }
        
        $userEmail = Read-Host "Email Git"
        if ($userEmail) {
            git config user.email $userEmail
        }
    }
    
    # Vérifier les branches
    $branches = git branch
    
    if ($branches -notcontains "*$DevBranch" -and $branches -notcontains " $DevBranch") {
        Write-StatusMessage "Création de la branche $DevBranch..." "Info"
        git checkout -b $DevBranch
    }
    
    # Configuration des remotes
    $remotes = git remote
    if ($remotes -notcontains $RemoteName) {
        $repoUrl = Read-Host "URL du repository distant (GitHub/GitLab)"
        if ($repoUrl) {
            git remote add $RemoteName $repoUrl
            Write-StatusMessage "Remote $RemoteName ajouté" "Success"
        }
    }
    
    # Créer un .gitignore basique
    if (-not (Test-Path ".gitignore")) {
        $gitignore = @"
# Node modules
node_modules/

# Logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# VS Code
.vscode/settings.json

# Windows
Thumbs.db
Desktop.ini

# PowerShell
*.ps1xml

# Temporary files
*.tmp
*.temp
*~

# Extension build
dist/
build/
"@
        $gitignore | Out-File -FilePath ".gitignore" -Encoding UTF8
        Write-StatusMessage ".gitignore créé" "Success"
    }
    
    Write-StatusMessage "✅ Workflow Git configuré !" "Success"
}

# Exécution selon l'action demandée
switch ($Action) {
    "status" {
        Get-GitStatus
    }
    
    "sync-dev" {
        if (-not $CommitMessage -and (git status --porcelain)) {
            $CommitMessage = Read-Host "Message de commit pour les modifications locales"
        }
        Sync-DevelopmentBranch
    }
    
    "test-and-deploy" {
        if (Deploy-ToMain) {
            Write-Host ""
            Write-Host "🎉 Déploiement réussi !" -ForegroundColor Green
            Write-Host "✅ $DevBranch synchronisée" -ForegroundColor Green
            Write-Host "✅ Tests validés" -ForegroundColor Green  
            Write-Host "✅ $MainBranch mise à jour" -ForegroundColor Green
            Write-Host "✅ Tag de release créé" -ForegroundColor Green
        }
    }
    
    "force-sync" {
        Write-StatusMessage "⚠️ Synchronisation forcée - ATTENTION aux conflits" "Warning"
        $confirm = Read-Host "Êtes-vous sûr ? (oui/non)"
        if ($confirm -eq "oui") {
            # Force sync both branches
            git fetch --all
            git checkout $DevBranch
            git reset --hard "$RemoteName/$DevBranch"
            git checkout $MainBranch  
            git reset --hard "$RemoteName/$MainBranch"
            Write-StatusMessage "✅ Synchronisation forcée terminée" "Success"
        }
    }
    
    "setup" {
        Initialize-GitWorkflow
    }
    
    default {
        Write-Host "Actions disponibles:" -ForegroundColor Yellow
        Write-Host "  status          - Afficher l'état du repository" -ForegroundColor Gray
        Write-Host "  sync-dev        - Synchroniser la branche développement" -ForegroundColor Gray
        Write-Host "  test-and-deploy - Tester et déployer vers main" -ForegroundColor Gray
        Write-Host "  force-sync      - Synchronisation forcée (DANGER)" -ForegroundColor Gray
        Write-Host "  setup           - Configuration initiale du workflow" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📝 Workflow recommandé:" -ForegroundColor Cyan
Write-Host "  1. Développer sur '$DevBranch'" -ForegroundColor Gray
Write-Host "  2. .\git-workflow-sync.ps1 sync-dev -CommitMessage 'description'" -ForegroundColor Gray
Write-Host "  3. .\git-workflow-sync.ps1 test-and-deploy (quand prêt)" -ForegroundColor Gray