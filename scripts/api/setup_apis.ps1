# 🚀 Script d'Installation Automatique des APIs IA
# Configure automatiquement DeepSeek, Ollama, Groq et OpenAI pour XYPH

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "deepseek", "ollama", "groq", "openai", "test")]
    [string]$Service = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipOllama = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$QuickSetup = $false
)

# Configuration globale
$XYPHPath = "F:\Git\XYPH-Project"
$ConfigPath = Join-Path $XYPHPath "api_config.json"
$LogFile = Join-Path $XYPHPath "setup_log.txt"

Write-Host "🤖 XYPH API Setup - Configuration Automatique" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

function Write-Log {
    param([string]$Message, [string]$Type = "Info")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Type] $Message"
    
    # Affichage console avec couleurs
    $color = switch ($Type) {
        "Success" { "Green" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
        default { "White" }
    }
    
    $icon = switch ($Type) {
        "Success" { "✅" }
        "Warning" { "⚠️" }
        "Error" { "❌" }
        default { "ℹ️" }
    }
    
    Write-Host "$icon $Message" -ForegroundColor $color
    
    # Log vers fichier
    $logEntry | Add-Content -Path $LogFile -Encoding UTF8
}

function Test-InternetConnection {
    try {
        $response = Invoke-WebRequest -Uri "https://www.google.com" -UseBasicParsing -TimeoutSec 5
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Install-Ollama {
    Write-Log "Installation d'Ollama..." "Info"
    
    # Vérifier si Ollama est déjà installé
    try {
        $ollamaVersion = ollama --version 2>$null
        if ($ollamaVersion) {
            Write-Log "Ollama déjà installé : $ollamaVersion" "Success"
            return $true
        }
    } catch {
        # Ollama pas installé, on continue
    }
    
    try {
        if (-not (Test-InternetConnection)) {
            Write-Log "Pas de connexion internet pour installer Ollama" "Warning"
            return $false
        }
        
        Write-Log "Téléchargement d'Ollama..." "Info"
        $ollamaUrl = "https://ollama.ai/download/windows"
        $tempPath = Join-Path $env:TEMP "ollama-setup.exe"
        
        # Télécharger l'installateur
        Invoke-WebRequest -Uri $ollamaUrl -OutFile $tempPath -UseBasicParsing
        
        Write-Log "Installation d'Ollama (peut nécessiter les privilèges admin)..." "Warning"
        Start-Process -FilePath $tempPath -Wait -ArgumentList "/S"
        
        # Vérifier l'installation
        Start-Sleep -Seconds 5
        $ollamaPath = "${env:LOCALAPPDATA}\Programs\Ollama\ollama.exe"
        if (Test-Path $ollamaPath) {
            Write-Log "Ollama installé avec succès !" "Success"
            
            # Ajouter au PATH pour la session actuelle
            $env:PATH += ";${env:LOCALAPPDATA}\Programs\Ollama"
            
            return $true
        } else {
            Write-Log "Échec de l'installation d'Ollama" "Error"
            return $false
        }
        
    } catch {
        Write-Log "Erreur lors de l'installation d'Ollama : $($_.Exception.Message)" "Error"
        return $false
    }
}

function Setup-OllamaModels {
    Write-Log "Configuration des modèles Ollama..." "Info"
    
    $recommendedModels = @(
        @{ Name = "llama3.1:8b"; Description = "Modèle général performant"; Size = "4GB" },
        @{ Name = "phi3:mini"; Description = "Modèle léger et rapide"; Size = "2.3GB" },
        @{ Name = "codellama:7b"; Description = "Spécialisé en programmation"; Size = "3.8GB" }
    )
    
    Write-Host ""
    Write-Host "📦 Modèles Ollama recommandés :" -ForegroundColor Yellow
    for ($i = 0; $i -lt $recommendedModels.Count; $i++) {
        $model = $recommendedModels[$i]
        Write-Host "   $($i+1). $($model.Name) - $($model.Description) ($($model.Size))" -ForegroundColor Gray
    }
    
    if (-not $QuickSetup) {
        $choice = Read-Host "Quels modèles installer ? (1-3, ou 'all' pour tous, 'skip' pour ignorer)"
    } else {
        $choice = "1"  # Installer seulement le modèle de base en mode rapide
    }
    
    $modelsToInstall = @()
    
    if ($choice -eq "all") {
        $modelsToInstall = $recommendedModels
    } elseif ($choice -eq "skip") {
        Write-Log "Installation des modèles ignorée" "Warning"
        return $true
    } else {
        try {
            $selectedIndices = $choice -split "," | ForEach-Object { [int]$_.Trim() - 1 }
            foreach ($index in $selectedIndices) {
                if ($index -ge 0 -and $index -lt $recommendedModels.Count) {
                    $modelsToInstall += $recommendedModels[$index]
                }
            }
        } catch {
            Write-Log "Sélection invalide, installation du modèle par défaut" "Warning"
            $modelsToInstall = @($recommendedModels[0])
        }
    }
    
    foreach ($model in $modelsToInstall) {
        Write-Log "Installation du modèle $($model.Name)..." "Info"
        try {
            & ollama pull $model.Name
            if ($LASTEXITCODE -eq 0) {
                Write-Log "Modèle $($model.Name) installé avec succès" "Success"
            } else {
                Write-Log "Échec de l'installation du modèle $($model.Name)" "Error"
            }
        } catch {
            Write-Log "Erreur lors de l'installation du modèle $($model.Name) : $($_.Exception.Message)" "Error"
        }
    }
    
    return $true
}

function Setup-ApiKeys {
    Write-Log "Configuration des clés API..." "Info"
    
    $apiConfig = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        providers = @{}
    }
    
    # DeepSeek
    if ($Service -eq "all" -or $Service -eq "deepseek") {
        Write-Host ""
        Write-Host "🌐 Configuration DeepSeek" -ForegroundColor Blue
        Write-Host "========================" -ForegroundColor Blue
        Write-Host "1. Aller sur : https://platform.deepseek.com/" -ForegroundColor Gray
        Write-Host "2. S'inscrire (20$ gratuits)" -ForegroundColor Gray
        Write-Host "3. Aller dans 'API Keys'" -ForegroundColor Gray
        Write-Host "4. Créer une nouvelle clé" -ForegroundColor Gray
        Write-Host ""
        
        if (-not $QuickSetup) {
            $deepseekKey = Read-Host "Entrez votre clé API DeepSeek (ou 'skip' pour ignorer)"
        } else {
            $deepseekKey = "skip"
        }
        
        if ($deepseekKey -and $deepseekKey -ne "skip") {
            $apiConfig.providers.deepseek = @{
                apiKey = $deepseekKey
                apiUrl = "https://api.deepseek.com/v1/chat/completions"
                model = "deepseek-chat"
                enabled = $true
            }
            Write-Log "DeepSeek configuré" "Success"
        }
    }
    
    # Groq
    if ($Service -eq "all" -or $Service -eq "groq") {
        Write-Host ""
        Write-Host "⚡ Configuration Groq" -ForegroundColor Blue
        Write-Host "====================" -ForegroundColor Blue
        Write-Host "1. Aller sur : https://console.groq.com/" -ForegroundColor Gray
        Write-Host "2. S'inscrire avec Google/GitHub" -ForegroundColor Gray
        Write-Host "3. Aller dans 'API Keys'" -ForegroundColor Gray
        Write-Host "4. 'Create API Key'" -ForegroundColor Gray
        Write-Host ""
        
        if (-not $QuickSetup) {
            $groqKey = Read-Host "Entrez votre clé API Groq (ou 'skip' pour ignorer)"
        } else {
            $groqKey = "skip"
        }
        
        if ($groqKey -and $groqKey -ne "skip") {
            $apiConfig.providers.groq = @{
                apiKey = $groqKey
                apiUrl = "https://api.groq.com/openai/v1/chat/completions"
                model = "llama3-70b-8192"
                enabled = $true
            }
            Write-Log "Groq configuré" "Success"
        }
    }
    
    # OpenAI
    if ($Service -eq "all" -or $Service -eq "openai") {
        Write-Host ""
        Write-Host "🔥 Configuration OpenAI" -ForegroundColor Blue
        Write-Host "======================" -ForegroundColor Blue
        Write-Host "1. Aller sur : https://platform.openai.com/" -ForegroundColor Gray
        Write-Host "2. S'inscrire + vérifier téléphone" -ForegroundColor Gray
        Write-Host "3. Aller dans 'API Keys'" -ForegroundColor Gray
        Write-Host "4. 'Create new secret key'" -ForegroundColor Gray
        Write-Host ""
        
        if (-not $QuickSetup) {
            $openaiKey = Read-Host "Entrez votre clé API OpenAI (ou 'skip' pour ignorer)"
        } else {
            $openaiKey = "skip"
        }
        
        if ($openaiKey -and $openaiKey -ne "skip") {
            $apiConfig.providers.openai = @{
                apiKey = $openaiKey
                apiUrl = "https://api.openai.com/v1/chat/completions"
                model = "gpt-3.5-turbo"
                enabled = $true
            }
            Write-Log "OpenAI configuré" "Success"
        }
    }
    
    # Ollama (local)
    if (-not $SkipOllama -and ($Service -eq "all" -or $Service -eq "ollama")) {
        $apiConfig.providers.ollama = @{
            apiUrl = "http://localhost:11434/api/chat"
            model = "llama3.1:8b"
            enabled = $true
            local = $true
        }
        Write-Log "Ollama configuré (local)" "Success"
    }
    
    # Sauvegarder la configuration
    $apiConfig | ConvertTo-Json -Depth 3 | Out-File -FilePath $ConfigPath -Encoding UTF8
    Write-Log "Configuration sauvegardée dans $ConfigPath" "Success"
    
    return $apiConfig
}

function Test-ApiConnections {
    param([object]$Config)
    
    Write-Log "Test des connexions API..." "Info"
    
    if (-not $Config.providers) {
        Write-Log "Aucune configuration API trouvée" "Warning"
        return
    }
    
    foreach ($providerName in $Config.providers.Keys) {
        $provider = $Config.providers[$providerName]
        
        if (-not $provider.enabled) {
            Write-Log "$providerName : Désactivé" "Warning"
            continue
        }
        
        Write-Log "Test de $providerName..." "Info"
        
        try {
            if ($providerName -eq "ollama") {
                # Test Ollama local
                $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 5
                if ($response.StatusCode -eq 200) {
                    Write-Log "$providerName : ✅ Connexion OK" "Success"
                } else {
                    Write-Log "$providerName : ❌ Service local inaccessible" "Error"
                }
            } else {
                # Test APIs cloud
                $headers = @{
                    "Authorization" = "Bearer $($provider.apiKey)"
                    "Content-Type" = "application/json"
                }
                
                $body = @{
                    model = $provider.model
                    messages = @(
                        @{
                            role = "user"
                            content = "Test"
                        }
                    )
                    max_tokens = 10
                } | ConvertTo-Json -Depth 3
                
                $response = Invoke-WebRequest -Uri $provider.apiUrl -Method POST -Headers $headers -Body $body -UseBasicParsing -TimeoutSec 10
                
                if ($response.StatusCode -eq 200) {
                    Write-Log "$providerName : ✅ API fonctionnelle" "Success"
                } else {
                    Write-Log "$providerName : ⚠️ Réponse inattendue ($($response.StatusCode))" "Warning"
                }
            }
        } catch {
            if ($_.Exception.Message -match "401|403") {
                Write-Log "$providerName : ❌ Clé API invalide" "Error"
            } elseif ($_.Exception.Message -match "timeout") {
                Write-Log "$providerName : ⚠️ Timeout (service peut être lent)" "Warning"
            } else {
                Write-Log "$providerName : ❌ Erreur : $($_.Exception.Message)" "Error"
            }
        }
    }
}

function Show-Summary {
    param([object]$Config)
    
    Write-Host ""
    Write-Host "📋 Résumé de la Configuration" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Green
    
    if ($Config.providers) {
        $enabledProviders = $Config.providers.Keys | Where-Object { $Config.providers[$_].enabled }
        
        Write-Host "✅ Providers configurés : $($enabledProviders.Count)" -ForegroundColor Green
        foreach ($provider in $enabledProviders) {
            $config = $Config.providers[$provider]
            $isLocal = if ($config.local) { " (Local)" } else { "" }
            Write-Host "   • $provider$isLocal" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "🎯 Prochaines étapes :" -ForegroundColor Cyan
    Write-Host "   1. Charger l'extension XYPH dans Chrome" -ForegroundColor Gray
    Write-Host "   2. Configurer les clés API dans l'interface" -ForegroundColor Gray
    Write-Host "   3. Commencer ton premier défi créatif !" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "📁 Fichiers créés :" -ForegroundColor Yellow
    Write-Host "   • Configuration : $ConfigPath" -ForegroundColor Gray
    Write-Host "   • Log d'installation : $LogFile" -ForegroundColor Gray
}

function Create-XYPHConfiguration {
    param([object]$ApiConfig)
    
    Write-Log "Création de la configuration XYPH..." "Info"
    
    # Script de configuration pour l'extension Chrome
    $jsConfig = @"
// Configuration XYPH - Générée automatiquement
const XYPH_AI_CONFIG = {
    providers: {
"@

    foreach ($providerName in $ApiConfig.providers.Keys) {
        $provider = $ApiConfig.providers[$providerName]
        $jsConfig += @"

        $providerName: {
            enabled: $($provider.enabled.ToString().ToLower()),
            apiUrl: '$($provider.apiUrl)',
            model: '$($provider.model)',
            local: $($provider.local.ToString().ToLower())
        },
"@
    }

    $jsConfig += @"

    },
    
    // Sélection automatique du meilleur provider
    selectProvider: function(priority = 'cost') {
        const available = Object.keys(this.providers).filter(p => this.providers[p].enabled);
        
        if (priority === 'speed' && available.includes('groq')) return 'groq';
        if (priority === 'privacy' && available.includes('ollama')) return 'ollama';
        if (available.includes('deepseek')) return 'deepseek';
        
        return available[0] || null;
    },
    
    // Configuration pour XYPH
    xyphSettings: {
        creativityLevel: 'high',
        personalityMode: 'friendly',
        learningMode: 'adaptive',
        debugMode: false
    }
};

// Export pour l'extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XYPH_AI_CONFIG;
}
"@

    $jsConfigPath = Join-Path $XYPHPath "xyph_config.js"
    $jsConfig | Out-File -FilePath $jsConfigPath -Encoding UTF8
    
    Write-Log "Configuration JavaScript créée : $jsConfigPath" "Success"
}

# ===========================
# EXECUTION PRINCIPALE
# ===========================

# Créer le dossier de logs
if (-not (Test-Path $XYPHPath)) {
    New-Item -ItemType Directory -Path $XYPHPath -Force | Out-Null
}

Write-Log "Démarrage de la configuration XYPH API" "Info"

# Test de connexion internet
if (-not (Test-InternetConnection)) {
    Write-Log "⚠️ Connexion internet limitée - certaines fonctionnalités seront désactivées" "Warning"
}

$success = $true

# Installation d'Ollama (si demandé)
if (-not $SkipOllama -and ($Service -eq "all" -or $Service -eq "ollama")) {
    if (Install-Ollama) {
        Setup-OllamaModels | Out-Null
    } else {
        $success = $false
    }
}

# Configuration des clés API
$apiConfig = Setup-ApiKeys

# Test des connexions
if ($Service -eq "test" -or (-not $QuickSetup)) {
    Test-ApiConnections -Config $apiConfig
}

# Création de la configuration XYPH
Create-XYPHConfiguration -ApiConfig $apiConfig

# Résumé
Show-Summary -Config $apiConfig

if ($success) {
    Write-Log "🎉 Configuration XYPH terminée avec succès !" "Success"
    exit 0
} else {
    Write-Log "⚠️ Configuration terminée avec des avertissements" "Warning"
    exit 1
}