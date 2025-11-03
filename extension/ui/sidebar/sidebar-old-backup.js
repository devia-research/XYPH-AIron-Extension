class SidebarScriptCommander {
    constructor() {
        this.apiKey = '';
        this.currentScriptType = 'powershell';
        this.isProcessing = false;
        this.settings = {
            theme: 'dark',
            autoSave: true,
            notifications: true,
            aiModel: 'deepseek-chat',
            apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
            context: 'Vous êtes un agent expert en génération de scripts automatisés. Vous analysez les demandes des utilisateurs et générez des scripts optimisés, sécurisés et bien documentés selon le contexte fourni.',
            role: 'assistant',
            temperature: 0.1,
            maxTokens: 3000,
            savedContexts: [],
            savedRoles: [],
            trainingScripts: [],
            taskTemplates: this.getDefaultTaskTemplates(),
            scriptFormats: this.getDefaultScriptFormats()
        };
        this.init();
    }

    async init() {
        await this.loadApiKey();
        await this.loadSettings();
        this.setupEventListeners();
        this.applyTheme(this.settings.theme);
        this.updateStatus('🚀 Extension prête', 'success');
    }

    setupEventListeners() {
        // API Key
        document.getElementById('apiKeyInput').addEventListener('input', (e) => {
            this.apiKey = e.target.value;
            this.saveApiKey();
        });

        // Script Type
        document.getElementById('scriptType').addEventListener('change', (e) => {
            this.currentScriptType = e.target.value;
            this.updateStatus(`📝 Mode ${e.target.value} sélectionné`, 'info');
        });

        // Buttons
        document.getElementById('executeBtn').addEventListener('click', () => this.executeScript());
        document.getElementById('generateTaskBtn').addEventListener('click', () => this.showTaskGenerator());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveScript());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearScript());
        document.getElementById('clearResultsBtn').addEventListener('click', () => this.clearResults());

        // Settings
        document.getElementById('themeSelect').addEventListener('change', (e) => this.changeTheme(e.target.value));
        document.getElementById('autoSaveToggle').addEventListener('change', (e) => this.toggleAutoSave(e.target.checked));
        document.getElementById('notificationsToggle').addEventListener('change', (e) => this.toggleNotifications(e.target.checked));

        // Advanced Settings
        document.getElementById('aiModelSelect').addEventListener('change', (e) => this.changeAiModel(e.target.value));
        document.getElementById('apiEndpointInput').addEventListener('input', (e) => this.updateApiEndpoint(e.target.value));
        document.getElementById('contextInput').addEventListener('input', (e) => this.updateContext(e.target.value));
        document.getElementById('roleSelect').addEventListener('change', (e) => this.updateRole(e.target.value));
        document.getElementById('roleSelect').addEventListener('change', () => this.handleCustomRole());
        document.getElementById('temperatureSlider').addEventListener('input', (e) => this.updateTemperature(e.target.value));
        document.getElementById('maxTokensInput').addEventListener('input', (e) => this.updateMaxTokens(e.target.value));

        // Context and Role Management
        document.getElementById('saveContextBtn').addEventListener('click', () => this.saveCurrentContext());
        document.getElementById('loadContextBtn').addEventListener('click', () => this.showContextSelector());
        document.getElementById('deleteContextBtn').addEventListener('click', () => this.deleteSelectedContext());
        document.getElementById('saveRoleBtn').addEventListener('click', () => this.saveCurrentRole());
        document.getElementById('loadRoleBtn').addEventListener('click', () => this.showRoleSelector());
        document.getElementById('deleteRoleBtn').addEventListener('click', () => this.deleteSelectedRole());

        // Training Scripts Management
        document.getElementById('saveTrainingScriptBtn').addEventListener('click', () => this.saveTrainingScript());
        document.getElementById('loadTrainingScriptBtn').addEventListener('click', () => this.showTrainingScriptSelector());
        document.getElementById('deleteTrainingScriptBtn').addEventListener('click', () => this.deleteTrainingScript());
        document.getElementById('testConnectionBtn').addEventListener('click', () => this.testApiConnection());

        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => this.importData());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearData());

        // Preset scripts
        document.querySelectorAll('.preset-script').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadPresetScript(e.target.dataset.script));
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab content
        document.getElementById(`${tabName}Tab`).style.display = 'block';

        // Add active class to selected tab button
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Load specific tab data
        if (tabName === 'settings') {
            this.loadAdvancedSettings();
        }

        this.updateStatus(`📋 Onglet ${tabName} activé`, 'info');
    }

    async loadApiKey() {
        const result = await chrome.storage.sync.get(['apiKey']);
        if (result.apiKey) {
            this.apiKey = result.apiKey;
            document.getElementById('apiKeyInput').value = this.apiKey;
        }
    }

    async saveApiKey() {
        await chrome.storage.sync.set({ apiKey: this.apiKey });
    }

    async loadSettings() {
        const result = await chrome.storage.sync.get(['settings']);
        if (result.settings) {
            this.settings = { ...this.settings, ...result.settings };
            document.getElementById('themeSelect').value = this.settings.theme;
            document.getElementById('autoSaveToggle').checked = this.settings.autoSave;
            document.getElementById('notificationsToggle').checked = this.settings.notifications;
            
            // Load advanced settings
            if (document.getElementById('aiModelSelect')) {
                document.getElementById('aiModelSelect').value = this.settings.aiModel;
                document.getElementById('apiEndpointInput').value = this.settings.apiEndpoint;
                document.getElementById('contextInput').value = this.settings.context;
                document.getElementById('roleSelect').value = this.settings.role;
                document.getElementById('temperatureSlider').value = this.settings.temperature;
                document.getElementById('temperatureValue').textContent = this.settings.temperature;
                document.getElementById('maxTokensInput').value = this.settings.maxTokens;
            }
        }
    }

    async executeScript() {
        if (this.isProcessing) {
            this.showResult('⏳ Traitement en cours...', 'warning');
            return;
        }

        const script = document.getElementById('scriptInput').value;
        if (!script.trim()) {
            // Si pas de script, proposer une génération
            const userRequest = prompt('Décrivez la tâche que vous voulez automatiser:');
            if (userRequest) {
                await this.handleTaskRequest(userRequest);
            } else {
                this.showResult('❌ Aucun script à exécuter', 'error');
            }
            return;
        }

        if (!this.apiKey) {
            this.showResult('❌ Clé API manquante', 'error');
            return;
        }

        this.setProcessing(true);
        this.updateStatus('🔄 Analyse et exécution...', 'loading');

        try {
            // Analyse intelligente du script
            const analysisPrompt = `En tant qu'agent expert, analysez ce script ${this.currentScriptType} et fournissez:

SCRIPT À ANALYSER:
\`\`\`${this.currentScriptType}
${script}
\`\`\`

FOURNISSEZ:
1. 📋 RÉSUMÉ: Que fait ce script en une phrase
2. 🔍 ANALYSE DÉTAILLÉE: Fonctionnement étape par étape
3. ⚠️  POINTS D'ATTENTION: Risques, prérequis, permissions
4. 🚀 SIMULATION D'EXÉCUTION: Résultats attendus
5. 🛠️  AMÉLIORATIONS POSSIBLES: Suggestions d'optimisation
6. 📊 ÉVALUATION: Performance, sécurité, maintenabilité (sur 10)

Soyez précis et professionnel dans votre analyse.`;

            const response = await fetch(this.settings.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.settings.aiModel,
                    messages: [
                        {
                            role: 'system',
                            content: this.settings.context
                        },
                        {
                            role: this.settings.role,
                            content: analysisPrompt
                        }
                    ],
                    max_tokens: this.settings.maxTokens,
                    temperature: this.settings.temperature
                })
            });

            const data = await response.json();

            if (data.choices && data.choices[0]) {
                const analysis = data.choices[0].message.content;
                this.showResult(`🤖 ANALYSE COMPLÈTE DU SCRIPT\n\n${analysis}\n\n⚡ Script analysé par l'agent AI Script Commander`, 'success');
                this.updateStatus('✅ Analyse terminée', 'success');
            } else {
                throw new Error('Réponse invalide de l\'API');
            }

        } catch (error) {
            this.showResult(`❌ Erreur: ${error.message}`, 'error');
            this.updateStatus('❌ Erreur lors de l\'analyse', 'error');
        } finally {
            this.setProcessing(false);
        }
    }

    // Nouvelle méthode pour gérer les demandes de tâches
    async handleTaskRequest(userRequest) {
        this.updateStatus('🧠 Analyse de la demande...', 'loading');
        
        // Analyser la demande
        const analysis = await this.analyzeTaskRequest(userRequest);
        
        if (analysis) {
            this.showResult(`🔍 ANALYSE DE VOTRE DEMANDE:
            
📝 Tâche identifiée: ${analysis.extractedTask}
🏷️  Type: ${analysis.taskType}
💻 Langage suggéré: ${analysis.suggestedLanguage}
📊 Complexité: ${analysis.estimatedComplexity}
🔧 Outils requis: ${analysis.requiredTools?.join(', ') || 'Standard'}
🎯 Confiance: ${Math.round(analysis.confidence * 100)}%

Génération du script en cours...`, 'info');

            // Générer le script
            await this.generateTaskScript(
                analysis.extractedTask, 
                analysis.taskType, 
                analysis.suggestedLanguage
            );
        } else {
            // Fallback: génération basique
            await this.generateTaskScript(userRequest, 'file-management', 'powershell');
        }
    }

    changeTheme(theme) {
        this.settings.theme = theme;
        this.applyTheme(theme);
        this.saveSettings();
    }

    applyTheme(theme) {
        document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    }

    toggleAutoSave(enabled) {
        this.settings.autoSave = enabled;
        this.saveSettings();
        this.showResult(`✅ Sauvegarde automatique ${enabled ? 'activée' : 'désactivée'}`, 'info');
    }

    toggleNotifications(enabled) {
        this.settings.notifications = enabled;
        this.saveSettings();
        this.showResult(`✅ Notifications ${enabled ? 'activées' : 'désactivées'}`, 'info');
    }

    async saveSettings() {
        await chrome.storage.sync.set({ settings: this.settings });
        this.applyTheme(this.settings.theme);
        this.showResult('✅ Paramètres sauvegardés', 'success');
    }

    async exportData() {
        const data = await chrome.storage.sync.get(null);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_script_commander_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showResult('✅ Données exportées', 'success');
    }

    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            const text = await file.text();
            const data = JSON.parse(text);
            await chrome.storage.sync.set(data);
            await this.loadSettings();
            await this.loadApiKey();
            this.showResult('✅ Données importées', 'success');
        };
        input.click();
    }

    async clearData() {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ?')) {
            await chrome.storage.sync.clear();
            await this.loadSettings();
            await this.loadApiKey();
            this.showResult('✅ Données effacées', 'success');
        }
    }

    showResult(message, type = 'info') {
        const resultElement = document.getElementById('executionResult');
        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b'
        };

        resultElement.style.borderLeft = `4px solid ${colors[type]}`;
        resultElement.textContent = message;
        resultElement.scrollTop = resultElement.scrollHeight;
    }

    clearResults() {
        document.getElementById('executionResult').textContent = 'Les résultats apparaîtront ici...';
        document.getElementById('executionResult').style.borderLeft = '';
    }

    clearScript() {
        document.getElementById('scriptInput').value = '';
        this.showResult('📝 Éditeur vidé', 'info');
    }

    async saveScript() {
        const script = document.getElementById('scriptInput').value;
        if (!script.trim()) {
            this.showResult('❌ Aucun script à sauvegarder', 'error');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
        const filename = `script_${this.currentScriptType}_${timestamp}.${this.getFileExtension()}`;
        const blob = new Blob([script], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.showResult(`💾 Script sauvegardé: ${filename}`, 'success');
    }

    getFileExtension() {
        const extensions = {
            powershell: 'ps1',
            python: 'py',
            bash: 'sh',
            javascript: 'js',
            cmd: 'bat'
        };
        return extensions[this.currentScriptType] || 'txt';
    }

    setProcessing(processing) {
        this.isProcessing = processing;
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            if (processing) {
                btn.disabled = true;
            } else {
                btn.disabled = false;
            }
        });
    }

    updateStatus(message, type = 'info') {
        const statusIcon = document.getElementById('statusIcon');
        const statusText = document.getElementById('statusText');
        
        const icons = {
            success: '🟢',
            error: '🔴',
            warning: '🟡',
            loading: '🔄',
            info: 'ℹ️'
        };

        statusIcon.textContent = icons[type] || icons.info;
        statusText.textContent = message;
        statusText.className = type;
    }

    loadPresetScript(scriptKey) {
        const scripts = {
            'file-organizer': {
                powershell: `# Organisateur de fichiers PowerShell
param(
    [string]$Path = ".",
    [string]$Destination = ".\\Organized",
    [switch]$ByExtension,
    [switch]$ByDate,
    [switch]$Recursive
)

Write-Host "🔍 Organisation des fichiers..." -ForegroundColor Green

$files = Get-ChildItem -Path $Path -File -Recurse:$Recursive
Write-Host "📁 $($files.Count) fichiers trouvés" -ForegroundColor Cyan

foreach ($file in $files) {
    if ($ByExtension) {
        $category = $file.Extension.TrimStart('.')
        if ([string]::IsNullOrEmpty($category)) { $category = "SansExtension" }
    }
    elseif ($ByDate) {
        $category = $file.LastWriteTime.ToString("yyyy-MM")
    }
    else {
        $category = "Files"
    }

    $targetDir = Join-Path $Destination $category
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    Copy-Item $file.FullName $targetDir -Force
    Write-Host "✓ $($file.Name) -> $category" -ForegroundColor Green
}

Write-Host "✅ Organisation terminée!" -ForegroundColor Green`,
                python: `# Organisateur de fichiers Python
import os
import shutil
from datetime import datetime

def organize_files(source_path=".", destination="./Organized", by_extension=True, by_date=False, recursive=False):
    print("🔍 Organisation des fichiers...")

    files = []
    if recursive:
        for root, _, filenames in os.walk(source_path):
            for filename in filenames:
                files.append(os.path.join(root, filename))
    else:
        files = [os.path.join(source_path, f) for f in os.listdir(source_path)
                if os.path.isfile(os.path.join(source_path, f))]

    print(f"📁 {len(files)} fichiers trouvés")

    for file_path in files:
        filename = os.path.basename(file_path)

        if by_extension:
            _, ext = os.path.splitext(filename)
            category = ext[1:] if ext else "SansExtension"
        elif by_date:
            mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
            category = mtime.strftime("%Y-%m")
        else:
            category = "Files"

        target_dir = os.path.join(destination, category)
        os.makedirs(target_dir, exist_ok=True)

        shutil.copy2(file_path, os.path.join(target_dir, filename))
        print(f"✓ {filename} -> {category}")

    print("✅ Organisation terminée!")

if __name__ == "__main__":
    organize_files()`
            },
            'web-automation': {
                powershell: `# Automation Web PowerShell
param(
    [string]$Url = "https://example.com",
    [string]$Action = "screenshot"
)

function Get-PageLinks {
    param([string]$Url)
    $webClient = New-Object System.Net.WebClient
    $html = $webClient.DownloadString($Url)
    $links = [regex]::Matches($html, 'href="(http[^"]*)"') | ForEach-Object { $_.Groups[1].Value }
    return $links
}

Write-Host "🌐 Automation web..." -ForegroundColor Green

if ($Action -eq "links") {
    $links = Get-PageLinks -Url $Url
    Write-Host "🔗 Liens trouvés:" -ForegroundColor Cyan
    $links | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "📸 Capture d'écran simulée de $Url" -ForegroundColor Yellow
}

Write-Host "✅ Automation terminée!" -ForegroundColor Green`,
                python: `# Automation Web Python
import requests
from bs4 import BeautifulSoup

def scrape_website(url, action="links"):
    print(f"🌐 Scraping de {url}")

    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')

        if action == "links":
            links = [a['href'] for a in soup.find_all('a', href=True)
                    if a['href'].startswith('http')]
            print(f"🔗 {len(links)} liens trouvés:")
            for link in links[:10]:  # Afficher seulement les 10 premiers
                print(f"  {link}")
        else:
            print("📄 Contenu de la page extrait")

    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    scrape_website("https://example.com")`
            },
            'system-info': {
                powershell: `# Informations système PowerShell
Write-Host "🖥️ Informations Système" -ForegroundColor Green

$computerInfo = Get-ComputerInfo
$os = $computerInfo.WindowsProductName
$memory = [math]::Round($computerInfo.TotalPhysicalMemory / 1GB, 2)
$architecture = $computerInfo.OsArchitecture

Write-Host "Système: $os" -ForegroundColor Cyan
Write-Host "Architecture: $architecture" -ForegroundColor Cyan
Write-Host "Mémoire: $memory GB" -ForegroundColor Cyan
Write-Host "Processeur: $($computerInfo.CsProcessors[0].Name)" -ForegroundColor Cyan

# Processes
$processes = Get-Process | Sort-Object CPU -Descending | Select-Object -First 5
Write-Host "\\n🔥 Top 5 processus (CPU):" -ForegroundColor Yellow
$processes | ForEach-Object { Write-Host "  $($_.Name): $($_.CPU)%" -ForegroundColor White }`,
                python: `# Informations système Python
import platform
import psutil
import socket

def system_info():
    print("🖥️ Informations Système")
    
    # Système
    print(f"Système: {platform.system()} {platform.release()}")
    print(f"Architecture: {platform.architecture()[0]}")
    print(f"Processeur: {platform.processor()}")
    print(f"Hôte: {socket.gethostname()}")
    
    # Mémoire
    memory = psutil.virtual_memory()
    print(f"Mémoire: {memory.total // (1024**3)} GB total, {memory.percent}% utilisé")
    
    # Disque
    disk = psutil.disk_usage('/')
    print(f"Disque: {disk.total // (1024**3)} GB total, {disk.percent}% utilisé")
    
    # Processus
    print("\\n🔥 Top 5 processus (CPU):")
    for proc in sorted(psutil.process_iter(['name', 'cpu_percent']),
                      key=lambda x: x.info['cpu_percent'] or 0, reverse=True)[:5]:
        print(f"  {proc.info['name']}: {proc.info['cpu_percent']}%")

if __name__ == "__main__":
    system_info()`
            }
        };

        const script = scripts[scriptKey]?.[this.currentScriptType];
        if (script) {
            document.getElementById('scriptInput').value = script;
            this.showResult(`📁 Script "${scriptKey}" chargé en ${this.currentScriptType}`, 'success');
        }
    }

    // === NOUVEAUX PARAMÈTRES AVANCÉS ===

    loadAdvancedSettings() {
        // Charger les contextes sauvegardés
        this.updateContextList();
        this.updateRoleList();
        this.updateTrainingScriptList();
    }

    changeAiModel(model) {
        this.settings.aiModel = model;
        this.saveSettings();
        this.showResult(`🤖 Modèle changé vers: ${model}`, 'success');
    }

    updateApiEndpoint(endpoint) {
        this.settings.apiEndpoint = endpoint;
        this.saveSettings();
        this.showResult(`🔗 Point de terminaison API mis à jour`, 'info');
    }

    updateContext(context) {
        this.settings.context = context;
        this.saveSettings();
    }

    updateRole(role) {
        this.settings.role = role;
        this.saveSettings();
        this.showResult(`👤 Rôle changé vers: ${role}`, 'info');
    }

    updateTemperature(temperature) {
        this.settings.temperature = parseFloat(temperature);
        document.getElementById('temperatureValue').textContent = temperature;
        this.saveSettings();
    }

    updateMaxTokens(maxTokens) {
        this.settings.maxTokens = parseInt(maxTokens);
        this.saveSettings();
    }

    async testApiConnection() {
        if (!this.apiKey) {
            this.showResult('❌ Clé API manquante', 'error');
            return;
        }

        this.setProcessing(true);
        this.updateStatus('🔄 Test de connexion...', 'loading');

        try {
            const response = await fetch(this.settings.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.settings.aiModel,
                    messages: [
                        {
                            role: 'system',
                            content: this.settings.context
                        },
                        {
                            role: 'user',
                            content: 'Test de connexion - répondez simplement "OK"'
                        }
                    ],
                    max_tokens: 10,
                    temperature: this.settings.temperature
                })
            });

            if (response.ok) {
                this.showResult('✅ Connexion API réussie!', 'success');
                this.updateStatus('✅ API connectée', 'success');
            } else {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

        } catch (error) {
            this.showResult(`❌ Erreur de connexion: ${error.message}`, 'error');
            this.updateStatus('❌ Connexion échouée', 'error');
        } finally {
            this.setProcessing(false);
        }
    }

    // === GESTION DES CONTEXTES ===

    saveCurrentContext() {
        const context = document.getElementById('contextInput').value;
        if (!context.trim()) {
            this.showResult('❌ Contexte vide', 'error');
            return;
        }

        const name = prompt('Nom pour ce contexte:');
        if (!name) return;

        const contextObj = {
            id: Date.now(),
            name: name,
            content: context,
            createdAt: new Date().toISOString()
        };

        this.settings.savedContexts.push(contextObj);
        this.saveSettings();
        this.updateContextList();
        this.showResult(`💾 Contexte "${name}" sauvegardé`, 'success');
    }

    showContextSelector() {
        if (this.settings.savedContexts.length === 0) {
            this.showResult('❌ Aucun contexte sauvegardé', 'warning');
            return;
        }

        const select = document.getElementById('savedContextsSelect');
        const selectedId = select.value;
        const context = this.settings.savedContexts.find(c => c.id == selectedId);
        
        if (context) {
            document.getElementById('contextInput').value = context.content;
            this.updateContext(context.content);
            this.showResult(`📋 Contexte "${context.name}" chargé`, 'success');
        }
    }

    deleteSelectedContext() {
        const select = document.getElementById('savedContextsSelect');
        const selectedId = select.value;
        
        if (!selectedId) {
            this.showResult('❌ Aucun contexte sélectionné', 'warning');
            return;
        }

        if (confirm('Supprimer ce contexte?')) {
            this.settings.savedContexts = this.settings.savedContexts.filter(c => c.id != selectedId);
            this.saveSettings();
            this.updateContextList();
            this.showResult('🗑️ Contexte supprimé', 'success');
        }
    }

    updateContextList() {
        const select = document.getElementById('savedContextsSelect');
        if (!select) return;

        select.innerHTML = '<option value="">-- Sélectionner un contexte --</option>';
        this.settings.savedContexts.forEach(context => {
            const option = document.createElement('option');
            option.value = context.id;
            option.textContent = `${context.name} (${new Date(context.createdAt).toLocaleDateString()})`;
            select.appendChild(option);
        });
    }

    // === GESTION DES RÔLES ===

    saveCurrentRole() {
        const role = document.getElementById('roleSelect').value;
        const customRole = document.getElementById('customRoleInput').value;

        if (role === 'custom' && !customRole.trim()) {
            this.showResult('❌ Rôle personnalisé vide', 'error');
            return;
        }

        const name = prompt('Nom pour ce rôle:');
        if (!name) return;

        const roleObj = {
            id: Date.now(),
            name: name,
            value: role === 'custom' ? customRole : role,
            isCustom: role === 'custom',
            createdAt: new Date().toISOString()
        };

        this.settings.savedRoles.push(roleObj);
        this.saveSettings();
        this.updateRoleList();
        this.showResult(`💾 Rôle "${name}" sauvegardé`, 'success');
    }

    showRoleSelector() {
        if (this.settings.savedRoles.length === 0) {
            this.showResult('❌ Aucun rôle sauvegardé', 'warning');
            return;
        }

        const select = document.getElementById('savedRolesSelect');
        const selectedId = select.value;
        const role = this.settings.savedRoles.find(r => r.id == selectedId);
        
        if (role) {
            if (role.isCustom) {
                document.getElementById('roleSelect').value = 'custom';
                document.getElementById('customRoleInput').value = role.value;
                document.getElementById('customRoleInput').style.display = 'block';
            } else {
                document.getElementById('roleSelect').value = role.value;
                document.getElementById('customRoleInput').style.display = 'none';
            }
            this.updateRole(role.value);
            this.showResult(`👤 Rôle "${role.name}" chargé`, 'success');
        }
    }

    deleteSelectedRole() {
        const select = document.getElementById('savedRolesSelect');
        const selectedId = select.value;
        
        if (!selectedId) {
            this.showResult('❌ Aucun rôle sélectionné', 'warning');
            return;
        }

        if (confirm('Supprimer ce rôle?')) {
            this.settings.savedRoles = this.settings.savedRoles.filter(r => r.id != selectedId);
            this.saveSettings();
            this.updateRoleList();
            this.showResult('🗑️ Rôle supprimé', 'success');
        }
    }

    updateRoleList() {
        const select = document.getElementById('savedRolesSelect');
        if (!select) return;

        select.innerHTML = '<option value="">-- Sélectionner un rôle --</option>';
        this.settings.savedRoles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.textContent = `${role.name} (${role.isCustom ? 'Personnalisé' : 'Standard'})`;
            select.appendChild(option);
        });
    }

    // === GESTION DES SCRIPTS D'ENTRAINEMENT ===

    saveTrainingScript() {
        const script = document.getElementById('scriptInput').value;
        if (!script.trim()) {
            this.showResult('❌ Aucun script à sauvegarder', 'error');
            return;
        }

        const name = prompt('Nom pour ce script d\'entraînement:');
        if (!name) return;

        const description = prompt('Description (optionnelle):') || '';

        const trainingScript = {
            id: Date.now(),
            name: name,
            description: description,
            content: script,
            scriptType: this.currentScriptType,
            createdAt: new Date().toISOString()
        };

        this.settings.trainingScripts.push(trainingScript);
        this.saveSettings();
        this.updateTrainingScriptList();
        this.showResult(`💾 Script d'entraînement "${name}" sauvegardé`, 'success');
    }

    showTrainingScriptSelector() {
        if (this.settings.trainingScripts.length === 0) {
            this.showResult('❌ Aucun script d\'entraînement sauvegardé', 'warning');
            return;
        }

        const select = document.getElementById('savedTrainingScriptsSelect');
        const selectedId = select.value;
        const script = this.settings.trainingScripts.find(s => s.id == selectedId);
        
        if (script) {
            document.getElementById('scriptInput').value = script.content;
            document.getElementById('scriptType').value = script.scriptType;
            this.currentScriptType = script.scriptType;
            this.showResult(`📋 Script "${script.name}" chargé`, 'success');
        }
    }

    deleteTrainingScript() {
        const select = document.getElementById('savedTrainingScriptsSelect');
        const selectedId = select.value;
        
        if (!selectedId) {
            this.showResult('❌ Aucun script sélectionné', 'warning');
            return;
        }

        if (confirm('Supprimer ce script d\'entraînement?')) {
            this.settings.trainingScripts = this.settings.trainingScripts.filter(s => s.id != selectedId);
            this.saveSettings();
            this.updateTrainingScriptList();
            this.showResult('🗑️ Script d\'entraînement supprimé', 'success');
        }
    }

    updateTrainingScriptList() {
        const select = document.getElementById('savedTrainingScriptsSelect');
        if (!select) return;

        select.innerHTML = '<option value="">-- Sélectionner un script --</option>';
        this.settings.trainingScripts.forEach(script => {
            const option = document.createElement('option');
            option.value = script.id;
            option.textContent = `${script.name} (${script.scriptType}) - ${new Date(script.createdAt).toLocaleDateString()}`;
            select.appendChild(option);
        });
    }

    // Gestion du rôle personnalisé
    handleCustomRole() {
        const roleSelect = document.getElementById('roleSelect');
        const customRoleInput = document.getElementById('customRoleInput');
        
        if (roleSelect.value === 'custom') {
            customRoleInput.style.display = 'block';
            customRoleInput.addEventListener('input', (e) => {
                this.updateRole(e.target.value);
            });
        } else {
            customRoleInput.style.display = 'none';
        }
    }

    // === AGENT GÉNÉRATEUR DE SCRIPTS ===

    getDefaultTaskTemplates() {
        return {
            'file-management': {
                name: 'Gestion de fichiers',
                description: 'Organiser, trier, renommer, copier des fichiers',
                context: 'Spécialisé dans la manipulation et l\'organisation de fichiers et dossiers.',
                examples: [
                    'Organiser les fichiers par date de modification',
                    'Renommer en masse selon un pattern',
                    'Supprimer les doublons',
                    'Créer une structure de dossiers'
                ]
            },
            'web-automation': {
                name: 'Automatisation web',
                description: 'Scraping, automatisation de navigation, APIs',
                context: 'Expert en automatisation d\'interactions web et extraction de données.',
                examples: [
                    'Extraire des données d\'un site web',
                    'Automatiser un processus de connexion',
                    'Surveiller des changements sur une page',
                    'Télécharger des fichiers automatiquement'
                ]
            },
            'system-administration': {
                name: 'Administration système',
                description: 'Maintenance, surveillance, configuration système',
                context: 'Spécialisé dans l\'administration et la maintenance des systèmes.',
                examples: [
                    'Surveiller l\'utilisation des ressources',
                    'Nettoyer les fichiers temporaires',
                    'Configurer des services',
                    'Créer des rapports système'
                ]
            },
            'data-processing': {
                name: 'Traitement de données',
                description: 'Analyse, transformation, export de données',
                context: 'Expert en traitement, analyse et transformation de données.',
                examples: [
                    'Convertir des formats de fichiers',
                    'Analyser des logs',
                    'Générer des rapports',
                    'Nettoyer des données CSV'
                ]
            },
            'security-automation': {
                name: 'Automatisation sécurité',
                description: 'Scripts de sécurité, audit, surveillance',
                context: 'Spécialisé dans la sécurité informatique et l\'audit automatisé.',
                examples: [
                    'Scanner les vulnérabilités',
                    'Audit des permissions',
                    'Surveillance des connexions',
                    'Backup automatique sécurisé'
                ]
            }
        };
    }

    getDefaultScriptFormats() {
        return {
            'powershell': {
                name: 'PowerShell',
                extension: 'ps1',
                template: `# {title}
# Créé par AI Script Commander
# Date: {date}
# Description: {description}

param(
    {parameters}
)

# Configuration
$ErrorActionPreference = "Stop"

try {
    Write-Host "🚀 Démarrage: {title}" -ForegroundColor Green
    
    {main_code}
    
    Write-Host "✅ Terminé avec succès!" -ForegroundColor Green
}
catch {
    Write-Error "❌ Erreur: $($_.Exception.Message)"
    exit 1
}`,
                best_practices: [
                    'Utiliser param() pour les paramètres',
                    'Gérer les erreurs avec try/catch',
                    'Utiliser Write-Host pour le feedback',
                    'Définir $ErrorActionPreference'
                ]
            },
            'python': {
                name: 'Python',
                extension: 'py',
                template: `#!/usr/bin/env python3
"""
{title}
Créé par AI Script Commander
Date: {date}
Description: {description}
"""

import sys
import logging
from typing import Optional

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main({parameters}) -> int:
    """Fonction principale du script."""
    try:
        logger.info("🚀 Démarrage: {title}")
        
        {main_code}
        
        logger.info("✅ Terminé avec succès!")
        return 0
        
    except Exception as e:
        logger.error(f"❌ Erreur: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())`,
                best_practices: [
                    'Utiliser type hints',
                    'Gérer les erreurs avec try/except',
                    'Utiliser logging pour les messages',
                    'Structurer avec une fonction main()'
                ]
            },
            'bash': {
                name: 'Bash',
                extension: 'sh',
                template: `#!/bin/bash
# {title}
# Créé par AI Script Commander
# Date: {date}
# Description: {description}

set -euo pipefail

# Configuration
readonly SCRIPT_NAME="{title}"
readonly LOG_FILE="/tmp/{title}.log"

# Fonction de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Fonction de nettoyage
cleanup() {
    log "🧹 Nettoyage en cours..."
}
trap cleanup EXIT

main() {
    log "🚀 Démarrage: $SCRIPT_NAME"
    
    {main_code}
    
    log "✅ Terminé avec succès!"
}

# Exécution
main "$@"`,
                best_practices: [
                    'Utiliser set -euo pipefail',
                    'Implémenter du logging',
                    'Gérer le nettoyage avec trap',
                    'Structurer avec des fonctions'
                ]
            }
        };
    }

    // Méthode pour générer un script basé sur une tâche
    async generateTaskScript(taskDescription, taskType, scriptLanguage) {
        if (!this.apiKey) {
            this.showResult('❌ Clé API manquante', 'error');
            return;
        }

        this.setProcessing(true);
        this.updateStatus('🤖 Génération du script...', 'loading');

        try {
            const taskTemplate = this.settings.taskTemplates[taskType];
            const scriptFormat = this.settings.scriptFormats[scriptLanguage];
            
            const enhancedContext = `${this.settings.context}

CONTEXTE SPÉCIALISÉ: ${taskTemplate?.context || 'Génération de script général'}

TÂCHE À ACCOMPLIR: ${taskDescription}

EXIGENCES:
- Langage: ${scriptLanguage}
- Suivre les bonnes pratiques pour ${scriptLanguage}
- Code production-ready avec gestion d'erreurs
- Commentaires explicatifs en français
- Optimisé pour la performance et la sécurité

FORMAT ATTENDU:
${scriptFormat?.best_practices?.map(practice => `- ${practice}`).join('\n') || ''}

TEMPLATE DE BASE:
${scriptFormat?.template || 'Template standard'}

EXEMPLES SIMILAIRES:
${taskTemplate?.examples?.join('\n- ') || 'Aucun exemple spécifique'}`;

            const prompt = `Génère un script ${scriptLanguage} complet et professionnel pour cette tâche:

"${taskDescription}"

Le script doit être:
1. Entièrement fonctionnel et prêt à l'emploi
2. Bien documenté avec des commentaires explicatifs
3. Robuste avec une gestion d'erreurs appropriée
4. Optimisé pour la performance
5. Sécurisé et respectant les bonnes pratiques

Fournis uniquement le code du script, sans explications supplémentaires.`;

            const response = await fetch(this.settings.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.settings.aiModel,
                    messages: [
                        {
                            role: 'system',
                            content: enhancedContext
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: this.settings.maxTokens,
                    temperature: this.settings.temperature
                })
            });

            const data = await response.json();

            if (data.choices && data.choices[0]) {
                const generatedScript = data.choices[0].message.content;
                
                // Nettoyer le script (enlever les marqueurs de code si présents)
                const cleanScript = generatedScript
                    .replace(/```\w*\n?/g, '')
                    .replace(/```/g, '')
                    .trim();

                document.getElementById('scriptInput').value = cleanScript;
                document.getElementById('scriptType').value = scriptLanguage;
                this.currentScriptType = scriptLanguage;

                this.showResult(`✅ Script ${scriptLanguage} généré avec succès!\n\nTâche: ${taskDescription}\nType: ${taskTemplate?.name || 'Général'}\n\nLe script est maintenant dans l'éditeur et prêt à être exécuté ou modifié.`, 'success');
                this.updateStatus('✅ Script généré', 'success');

                // Sauvegarder automatiquement si activé
                if (this.settings.autoSave) {
                    this.saveGeneratedScript(taskDescription, taskType, cleanScript);
                }

            } else {
                throw new Error('Réponse invalide de l\'API');
            }

        } catch (error) {
            this.showResult(`❌ Erreur lors de la génération: ${error.message}`, 'error');
            this.updateStatus('❌ Génération échouée', 'error');
        } finally {
            this.setProcessing(false);
        }
    }

    // Sauvegarder un script généré
    async saveGeneratedScript(taskDescription, taskType, script) {
        const timestamp = new Date().toISOString();
        const scriptObj = {
            id: Date.now(),
            name: `Auto: ${taskDescription.substring(0, 50)}...`,
            description: `Généré automatiquement - Type: ${taskType}`,
            content: script,
            scriptType: this.currentScriptType,
            taskType: taskType,
            createdAt: timestamp,
            isGenerated: true
        };

        this.settings.trainingScripts.push(scriptObj);
        await this.saveSettings();
        this.updateTrainingScriptList();
    }

    // Analyser une demande en langage naturel
    async analyzeTaskRequest(userRequest) {
        if (!this.apiKey) {
            return null;
        }

        try {
            const analysisPrompt = `Analyse cette demande d'automatisation et détermine:

DEMANDE: "${userRequest}"

Réponds UNIQUEMENT avec un JSON valide dans ce format:
{
    "taskType": "file-management|web-automation|system-administration|data-processing|security-automation",
    "suggestedLanguage": "powershell|python|bash|javascript",
    "confidence": 0.0-1.0,
    "extractedTask": "description claire de la tâche",
    "estimatedComplexity": "simple|medium|complex",
    "requiredTools": ["liste", "des", "outils"]
}`;

            const response = await fetch(this.settings.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.settings.aiModel,
                    messages: [
                        {
                            role: 'system',
                            content: 'Tu es un analyseur de tâches d\'automatisation. Réponds uniquement avec du JSON valide.'
                        },
                        {
                            role: 'user',
                            content: analysisPrompt
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.1
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                try {
                    return JSON.parse(data.choices[0].message.content);
                } catch (e) {
                    console.error('Erreur parsing JSON:', e);
                    return null;
                }
            }
        } catch (error) {
            console.error('Erreur analyse:', error);
        }
        return null;
    }

    // Interface du générateur de tâches
    showTaskGenerator() {
        const taskTypes = Object.keys(this.settings.taskTemplates);
        
        const modal = document.createElement('div');
        modal.className = 'task-generator-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🤖 Générateur de Scripts IA</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="taskDescription">Décrivez votre tâche :</label>
                        <textarea id="taskDescription" placeholder="Ex: Je veux organiser mes photos par date et les renommer automatiquement" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="taskTypeSelect">Type de tâche :</label>
                        <select id="taskTypeSelect">
                            <option value="">🔍 Détection automatique</option>
                            ${taskTypes.map(type => {
                                const template = this.settings.taskTemplates[type];
                                return `<option value="${type}">${template.name} - ${template.description}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="languageSelect">Langage préféré :</label>
                        <select id="languageSelect">
                            <option value="">🔍 Détection automatique</option>
                            <option value="powershell">PowerShell - Windows, gestion système</option>
                            <option value="python">Python - Multiplateforme, data science</option>
                            <option value="bash">Bash - Linux/macOS, administration</option>
                            <option value="javascript">JavaScript - Web, automation</option>
                        </select>
                    </div>
                    
                    <div class="examples-section">
                        <h4>💡 Exemples de demandes :</h4>
                        <div class="examples-grid">
                            <div class="example-item" onclick="document.getElementById('taskDescription').value = this.textContent">
                                "Organiser mes fichiers de téléchargement par type"
                            </div>
                            <div class="example-item" onclick="document.getElementById('taskDescription').value = this.textContent">
                                "Sauvegarder automatiquement mes dossiers importants"
                            </div>
                            <div class="example-item" onclick="document.getElementById('taskDescription').value = this.textContent">
                                "Extraire des données d'un site web"
                            </div>
                            <div class="example-item" onclick="document.getElementById('taskDescription').value = this.textContent">
                                "Nettoyer les fichiers temporaires du système"
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Annuler</button>
                    <button class="btn btn-primary" onclick="window.sidebarInstance.generateFromModal()">🚀 Générer Script</button>
                </div>
            </div>
        `;

        // Ajouter les styles pour le modal
        const style = document.createElement('style');
        style.textContent = `
            .task-generator-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .modal-content {
                background: var(--bg-color, #1e293b);
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                max-height: 80%;
                overflow: auto;
                color: var(--text-color, white);
            }
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid var(--border-color, #475569);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-body {
                padding: 20px;
            }
            .modal-footer {
                padding: 20px;
                border-top: 1px solid var(--border-color, #475569);
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            .examples-section {
                margin-top: 15px;
            }
            .examples-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-top: 10px;
            }
            .example-item {
                padding: 8px;
                background: var(--surface-color, #334155);
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s;
            }
            .example-item:hover {
                background: var(--primary-color, #667eea);
            }
            .close-btn {
                background: none;
                border: none;
                color: var(--text-color, white);
                font-size: 18px;
                cursor: pointer;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Exposer l'instance pour les callbacks
        window.sidebarInstance = this;
    }

    async generateFromModal() {
        const taskDescription = document.getElementById('taskDescription').value;
        const taskType = document.getElementById('taskTypeSelect').value;
        const language = document.getElementById('languageSelect').value;
        
        if (!taskDescription.trim()) {
            alert('Veuillez décrire votre tâche');
            return;
        }
        
        // Fermer le modal
        document.querySelector('.task-generator-modal').remove();
        
        // Générer le script
        if (taskType && language) {
            await this.generateTaskScript(taskDescription, taskType, language);
        } else {
            await this.handleTaskRequest(taskDescription);
        }
    }

    // Interface de chat conversationnel
    showChatInterface() {
        const chatModal = document.createElement('div');
        chatModal.className = 'chat-interface-modal';
        chatModal.innerHTML = `
            <div class="chat-container">
                <div class="chat-header">
                    <h3>💬 Parlez avec XYPH</h3>
                    <div class="chat-status">
                        <span class="status-dot online"></span>
                        <span>En ligne</span>
                    </div>
                    <button class="close-chat" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
                </div>
                
                <div class="chat-messages" id="chatMessages">
                    <div class="message assistant">
                        <div class="avatar">🤖</div>
                        <div class="content">
                            <p>Salut ! Je suis XYPH, votre assistant IA personnel. 👋</p>
                            <p>Je peux vous aider à :</p>
                            <ul>
                                <li>🔧 Générer des scripts automatisés</li>
                                <li>🔍 Analyser et retoucher des images</li>
                                <li>🎬 Traiter des vidéos</li>
                                <li>📊 Extraire et analyser des données</li>
                                <li>🛡️ Sécuriser votre système</li>
                            </ul>
                            <p>Que puis-je faire pour vous aujourd'hui ?</p>
                        </div>
                    </div>
                </div>
                
                <div class="chat-suggestions">
                    <button class="suggestion-btn" onclick="window.sidebarInstance.sendChatMessage('Comment organiser mes fichiers automatiquement ?')">
                        📁 Organiser mes fichiers
                    </button>
                    <button class="suggestion-btn" onclick="window.sidebarInstance.sendChatMessage('Peux-tu analyser cette image pour moi ?')">
                        🖼️ Analyser une image
                    </button>
                    <button class="suggestion-btn" onclick="window.sidebarInstance.sendChatMessage('Je veux créer un script de sauvegarde')">
                        💾 Script sauvegarde
                    </button>
                    <button class="suggestion-btn" onclick="window.sidebarInstance.sendChatMessage('Montre-moi la documentation complète')">
                        📚 Documentation
                    </button>
                </div>
                
                <div class="chat-input-container">
                    <div class="input-wrapper">
                        <textarea id="chatInput" placeholder="Tapez votre message... (Shift+Entrée pour nouvelle ligne)" rows="1"></textarea>
                        <button id="sendChatBtn" onclick="window.sidebarInstance.sendChatMessage()">
                            <span class="send-icon">📤</span>
                        </button>
                    </div>
                    <div class="quick-actions">
                        <button onclick="window.sidebarInstance.sendChatMessage('Aide')">❓ Aide</button>
                        <button onclick="window.sidebarInstance.sendChatMessage('Exemples')">💡 Exemples</button>
                        <button onclick="window.sidebarInstance.sendChatMessage('Paramètres')">⚙️ Config</button>
                    </div>
                </div>
            </div>
        `;

        // Styles pour l'interface de chat
        const chatStyles = document.createElement('style');
        chatStyles.textContent = `
            .chat-interface-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }
            
            .chat-container {
                background: linear-gradient(135deg, #1e293b, #334155);
                border-radius: 16px;
                width: 90%;
                max-width: 600px;
                height: 80%;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                border: 1px solid #475569;
            }
            
            .chat-header {
                padding: 20px;
                border-bottom: 1px solid #475569;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #0f172a;
                border-radius: 16px 16px 0 0;
            }
            
            .chat-status {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #10b981;
                font-size: 14px;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10b981;
                animation: pulse 2s infinite;
            }
            
            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .message {
                display: flex;
                gap: 12px;
                max-width: 85%;
            }
            
            .message.user {
                align-self: flex-end;
                flex-direction: row-reverse;
            }
            
            .message.assistant {
                align-self: flex-start;
            }
            
            .avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                background: var(--primary-color, #667eea);
                flex-shrink: 0;
            }
            
            .message.user .avatar {
                background: var(--secondary-color, #764ba2);
            }
            
            .content {
                background: var(--surface-color, #334155);
                padding: 12px 16px;
                border-radius: 12px;
                color: white;
                line-height: 1.5;
            }
            
            .message.user .content {
                background: var(--primary-color, #667eea);
            }
            
            .content ul {
                margin: 8px 0;
                padding-left: 20px;
            }
            
            .content li {
                margin: 4px 0;
            }
            
            .chat-suggestions {
                padding: 0 20px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 10px;
            }
            
            .suggestion-btn {
                background: var(--surface-color, #334155);
                border: 1px solid #475569;
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .suggestion-btn:hover {
                background: var(--primary-color, #667eea);
                border-color: var(--primary-color, #667eea);
            }
            
            .chat-input-container {
                padding: 20px;
                border-top: 1px solid #475569;
                background: #0f172a;
                border-radius: 0 0 16px 16px;
            }
            
            .input-wrapper {
                display: flex;
                gap: 10px;
                align-items: flex-end;
            }
            
            #chatInput {
                flex: 1;
                background: var(--surface-color, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 12px;
                color: white;
                font-family: inherit;
                font-size: 14px;
                resize: none;
                min-height: 20px;
                max-height: 80px;
                line-height: 1.4;
            }
            
            #chatInput:focus {
                outline: none;
                border-color: var(--primary-color, #667eea);
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
            }
            
            #sendChatBtn {
                background: var(--primary-color, #667eea);
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            #sendChatBtn:hover {
                background: var(--primary-dark, #5a67d8);
                transform: scale(1.05);
            }
            
            .quick-actions {
                display: flex;
                gap: 8px;
                margin-top: 10px;
                justify-content: center;
            }
            
            .quick-actions button {
                background: transparent;
                border: 1px solid #475569;
                color: #94a3b8;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .quick-actions button:hover {
                background: var(--surface-color, #334155);
                color: white;
            }
            
            .close-chat {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.2s;
            }
            
            .close-chat:hover {
                background: rgba(255,255,255,0.1);
            }
            
            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #94a3b8;
                font-style: italic;
                font-size: 13px;
                padding: 8px 0;
            }
            
            .typing-dots {
                display: flex;
                gap: 4px;
            }
            
            .typing-dot {
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #94a3b8;
                animation: typing 1.4s ease-in-out infinite;
            }
            
            .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typing {
                0%, 60%, 100% { opacity: 0.3; }
                30% { opacity: 1; }
            }
        `;
        
        document.head.appendChild(chatStyles);
        document.body.appendChild(chatModal);
        
        // Auto-resize du textarea
        const chatInput = document.getElementById('chatInput');
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 80) + 'px';
        });
        
        // Envoyer message avec Entrée (Shift+Entrée pour nouvelle ligne)
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });
        
        // Focus sur l'input
        chatInput.focus();
    }

    async sendChatMessage(predefinedMessage = null) {
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');
        
        const message = predefinedMessage || chatInput.value.trim();
        if (!message) return;
        
        // Effacer l'input si ce n'est pas un message prédéfini
        if (!predefinedMessage) {
            chatInput.value = '';
            chatInput.style.height = 'auto';
        }
        
        // Ajouter le message de l'utilisateur
        this.addChatMessage(message, 'user');
        
        // Indicateur de frappe
        this.showTypingIndicator();
        
        try {
            // Traiter le message et générer une réponse
            const response = await this.processChatMessage(message);
            
            // Supprimer l'indicateur de frappe
            this.hideTypingIndicator();
            
            // Ajouter la réponse de l'assistant
            this.addChatMessage(response, 'assistant');
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addChatMessage("Désolé, j'ai rencontré une erreur. Pouvez-vous réessayer ?", 'assistant');
            console.error('Chat error:', error);
        }
    }

    addChatMessage(content, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        
        messageDiv.innerHTML = `
            <div class="avatar">${avatar}</div>
            <div class="content">
                ${this.formatChatMessage(content)}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    formatChatMessage(content) {
        // Conversion markdown simple
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        
        return formatted;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="avatar">🤖</div>
            <div class="content">
                <span>XYPH écrit</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async processChatMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // Réponses contextuelles basées sur des mots-clés
        if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
            return this.getHelpResponse();
        }
        
        if (lowerMessage.includes('documentation') || lowerMessage.includes('doc')) {
            return this.getDocumentationResponse();
        }
        
        if (lowerMessage.includes('exemples') || lowerMessage.includes('exemple')) {
            return this.getExamplesResponse();
        }
        
        if (lowerMessage.includes('paramètres') || lowerMessage.includes('config')) {
            return this.getSettingsResponse();
        }
        
        if (lowerMessage.includes('fichier') || lowerMessage.includes('organiser')) {
            return this.getFileOrganizationResponse();
        }
        
        if (lowerMessage.includes('image') || lowerMessage.includes('photo')) {
            return this.getImageProcessingResponse();
        }
        
        if (lowerMessage.includes('script') || lowerMessage.includes('automatiser')) {
            return this.getScriptGenerationResponse();
        }
        
        if (lowerMessage.includes('vidéo') || lowerMessage.includes('video')) {
            return this.getVideoProcessingResponse();
        }
        
        // Si on a une clé API, utiliser l'IA pour répondre
        if (this.settings.apiKey) {
            return await this.generateAIResponse(message);
        }
        
        // Réponse par défaut
        return `Je comprends que vous voulez "${message}". Voici ce que je peux faire :

🔧 **Scripts automatisés** - Générer des scripts PowerShell, Python, Bash
🖼️ **Traitement d'images** - Analyser, retoucher, optimiser vos images  
🎬 **Édition vidéo** - Convertir, découper, améliorer vos vidéos
📊 **Analyse de données** - Extraire et traiter des informations
🔍 **Recherche intelligente** - Chercher et organiser l'information

Voulez-vous que je vous aide avec une de ces tâches ?`;
    }

    getHelpResponse() {
        return `# 🤖 Guide d'aide XYPH

## Commandes principales :
- **"Génère un script"** - Création automatique de scripts
- **"Analyse cette image"** - Traitement et analyse d'images
- **"Organise mes fichiers"** - Scripts d'organisation automatique
- **"Documentation"** - Guide complet des fonctionnalités
- **"Exemples"** - Cas d'usage concrets

## Comment me parler :
- Décrivez simplement ce que vous voulez faire
- Utilisez un langage naturel
- Précisez le type de fichiers/tâches

## Exemples de demandes :
- "Je veux organiser mes photos par date"
- "Crée un script de sauvegarde automatique"
- "Analyse cette capture d'écran"
- "Comment automatiser cette tâche répétitive ?"

Que voulez-vous faire maintenant ? 😊`;
    }

    getDocumentationResponse() {
        return `# 📚 Documentation XYPH - Assistant IA Complet

## 🎯 Fonctionnalités principales

### 🔧 Génération de Scripts
- **PowerShell** - Scripts Windows, gestion système
- **Python** - Scripts multiplateforme, data science
- **Bash** - Scripts Linux/macOS, administration
- **JavaScript** - Automatisation web, manipulation DOM
- **Batch** - Scripts Windows simples

### 🖼️ Traitement d'Images
- **Analyse OCR** - Extraction de texte avec Tesseract.js
- **Redimensionnement** - Optimisation automatique
- **Filtres** - Amélioration, correction de couleurs
- **Détection d'objets** - IA de reconnaissance
- **Compression** - Réduction de taille intelligente

### 🎬 Édition Vidéo
- **Conversion** - Formats MP4, WebM, AVI
- **Découpage** - Extraction de segments
- **Compression** - Optimisation taille/qualité
- **Sous-titres** - Génération automatique
- **Effets** - Filtres et transitions

### 🔍 Recherche Intelligente
- **Recherche contextuelle** - Dans vos conversations
- **Extraction de données** - Sites web, documents
- **Organisation** - Classement automatique
- **Suggestions** - Basées sur l'historique

## 🤖 Modèles IA Recommandés (Gratuits/Abordables)

### Gratuits :
- **Ollama** (Local) - Llama 3.1, CodeLlama, Phi-3
- **Hugging Face** - Modèles open source
- **Groq** - API rapide, quota gratuit généreux

### Abordables :
- **DeepSeek** - 0.14$/1M tokens (excellent rapport qualité/prix)
- **OpenRouter** - Accès à plusieurs modèles
- **Anthropic Claude** - 3$/1M tokens (très capable)

## ⚙️ Configuration recommandée
1. Installez Ollama pour utilisation locale
2. Configurez une clé DeepSeek pour l'IA cloud
3. Activez toutes les permissions pour fonctionnalités complètes

Voulez-vous que je vous aide à configurer un modèle spécifique ?`;
    }

    getExamplesResponse() {
        return `# 💡 Exemples pratiques XYPH

## 🗂️ Organisation de fichiers
**"Organise mes téléchargements par type"**
→ Script qui trie automatiquement images, documents, vidéos

**"Renomme mes photos avec la date"**
→ Script qui lit les métadonnées EXIF et renomme

## 🔒 Sécurité & Maintenance
**"Nettoie mon système"**
→ Script qui supprime fichiers temporaires, cache

**"Sauvegarde automatique"**
→ Script de sauvegarde incrémentale avec compression

## 🌐 Web Automation
**"Extrait les prix de ce site"**
→ Script de scraping avec détection automatique

**"Télécharge toutes les images de cette page"**
→ Script de téléchargement en lot

## 🖼️ Traitement d'images
**"Redimensionne toutes mes photos"**
→ Traitement par lot avec préservation qualité

**"Extrait le texte de cette capture"**
→ OCR automatique avec correction

## 🎬 Vidéos
**"Convertit cette vidéo en MP4"**
→ Conversion avec optimisation

**"Extrait l'audio de cette vidéo"**
→ Extraction audio haute qualité

Choisissez un exemple ou décrivez votre besoin ! 🚀`;
    }

    getSettingsResponse() {
        return `# ⚙️ Configuration XYPH

## 🔑 API & Modèles IA
**Modèles recommandés :**
- **DeepSeek Coder** - Excellent pour scripts (0.14$/1M tokens)
- **Ollama Local** - Gratuit, private, Code Llama 3.1
- **Groq Llama** - Très rapide, quota gratuit généreux

## 🛠️ Configuration rapide
1. **Clé API** : Ajoutez votre clé DeepSeek ou OpenAI
2. **Modèle** : Choisissez selon vos besoins
3. **Contextes** : Définissez vos environnements de travail
4. **Rôles** : Personnalisez l'expertise de XYPH

## 🎯 Contextes prédéfinis
- **Développeur Web** - Scripts JS, CSS, HTML
- **Admin Système** - PowerShell, Bash, sécurité
- **Data Analyst** - Python, extraction, analyse
- **Créatif** - Images, vidéos, automation créative

Voulez-vous que j'ouvre les paramètres pour vous ?`;
    }

    getFileOrganizationResponse() {
        return `# 📁 Organisation automatique de fichiers

## Ce que XYPH peut faire :

### 🔄 Tri intelligent
- **Par type** : Documents, images, vidéos, code
- **Par date** : Création, modification, accès
- **Par taille** : Petits, moyens, volumineux
- **Par projet** : Détection automatique des groupes

### 📸 Spécial photos
- **Tri par date EXIF** : Lecture métadonnées caméra
- **Détection doublons** : Suppression intelligente
- **Renommage automatique** : Format personnalisable
- **Géolocalisation** : Tri par lieu si disponible

### 🏗️ Scripts générés
- **PowerShell** : Windows, gestion avancée
- **Python** : Multiplateforme, très flexible
- **Bash** : Linux/macOS, intégration système

**Exemple de demande :**
"Organise mon dossier Téléchargements : mets les images dans Images/, les PDF dans Documents/, et supprime les fichiers plus vieux que 30 jours"

Décrivez votre dossier et vos préférences ! 📂`;
    }

    getImageProcessingResponse() {
        return `# 🖼️ Traitement d'images avec XYPH

## 🔍 Analyse avancée
- **OCR** : Extraction de texte (multi-langues)
- **Détection d'objets** : Reconnaissance IA
- **Métadonnées** : EXIF, géolocalisation, appareil
- **Qualité** : Netteté, exposition, couleurs

## ✏️ Retouche automatique
- **Redimensionnement** : Préservation qualité
- **Compression** : Optimisation intelligente
- **Filtres** : Amélioration, correction
- **Recadrage** : Détection visages, règle des tiers

## 🔄 Traitement par lot
- **Formats** : JPEG, PNG, WebP, TIFF
- **Watermark** : Ajout de filigrane
- **Renommage** : Basé sur contenu ou date
- **Organisation** : Tri automatique

## 🎨 Cas d'usage
- **E-commerce** : Standardisation produits
- **Archives** : Numérisation et OCR
- **Web** : Optimisation taille/qualité
- **Print** : Préparation impression

Envoyez-moi une image ou décrivez votre besoin ! 📷`;
    }

    getVideoProcessingResponse() {
        return `# 🎬 Édition vidéo avec XYPH

## 🔄 Conversion & Compression
- **Formats** : MP4, WebM, AVI, MOV
- **Codecs** : H.264, H.265, VP9
- **Qualité** : Optimisation automatique
- **Taille** : Compression intelligente

## ✂️ Montage automatique
- **Découpage** : Segments par temps/scène
- **Fusion** : Assemblage de clips
- **Transitions** : Fondu, glissement
- **Vitesse** : Accélération/ralenti

## 🔊 Audio & Sous-titres
- **Extraction audio** : MP3, WAV, FLAC
- **Normalisation** : Volume équilibré
- **Sous-titres** : Génération automatique
- **Synchronisation** : Audio/vidéo parfaite

## 🤖 IA avancée
- **Détection scènes** : Coupures automatiques
- **Stabilisation** : Correction tremblements
- **Amélioration** : Netteté, couleurs
- **Reconnaissance** : Objets, visages, texte

## 📱 Formats optimisés
- **Web** : Streaming, réseaux sociaux
- **Mobile** : iOS, Android
- **TV** : 4K, HDR
- **Archive** : Conservation long terme

Partagez votre vidéo ou expliquez votre projet ! 🎥`;
    }

    async generateAIResponse(message) {
        try {
            const prompt = `Tu es XYPH, un assistant IA spécialisé dans l'automatisation, le traitement d'images/vidéos, et la génération de scripts. 

Contexte : L'utilisateur utilise une extension Chrome que tu contrôles. Tu peux générer des scripts PowerShell, Python, Bash, JavaScript, traiter des images, éditer des vidéos, et automatiser des tâches.

Message utilisateur : "${message}"

Réponds de manière conviviale, précise et actionnable. Si c'est une demande technique, propose des solutions concrètes. Utilise des emojis pour rendre ça plus sympa.

Garde tes réponses concises mais informatives.`;

            const response = await this.callAI(prompt);
            return response || "Je travaille sur votre demande ! En attendant, utilisez les boutons d'aide pour explorer mes fonctionnalités. 🚀";
            
        } catch (error) {
            console.error('AI response error:', error);
            return `Désolé, j'ai un petit problème de connexion ! 😅 

En attendant, voici ce que je peux vous proposer pour "${message}" :

🔧 Utilisez le **Générateur de Scripts** pour automatiser votre tâche
📚 Consultez la **Documentation** pour voir tous mes pouvoirs
💡 Regardez les **Exemples** pour vous inspirer

Voulez-vous que j'ouvre une de ces sections ?`;
        }
    }

    // Méthode pour générer une réponse rapide sans IA
    quickGenerate(taskDescription) {
        // Fermer les suggestions
        const suggestions = document.querySelectorAll('.task-example');
        suggestions.forEach(btn => btn.style.display = 'none');
        
        // Simuler la génération
        this.addChatMessage(`Je génère un script pour : "${taskDescription}"`, 'assistant');
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateTaskScript(taskDescription, '', '').then(() => {
                this.addChatMessage('✅ Script généré ! Vous pouvez le voir dans l\'éditeur ci-dessous.', 'assistant');
            });
        }, 2000);
    }

    // Méthode pour ajouter la méthode quickGenerate à l'instance globale
    setupGlobalMethods() {
        window.sidebar = this;
        
        // Exposer les méthodes utiles
        window.quickGenerate = (task) => this.quickGenerate(task);
        window.showChatInterface = () => this.showChatInterface();
        window.sendChatMessage = (msg) => this.sendChatMessage(msg);
    }

    // Système d'entraînement et d'amélioration continue
    initTrainingSystem() {
        this.trainingData = {
            scripts: new Map(),
            prompts: new Map(),
            feedback: new Map(),
            patterns: new Map()
        };
        
        this.loadTrainingData();
    }

    // Collecter automatiquement les données d'entraînement
    async collectTrainingData(userRequest, generatedScript, userFeedback, scriptType) {
        const trainingEntry = {
            timestamp: new Date().toISOString(),
            userRequest: userRequest,
            generatedScript: generatedScript,
            scriptType: scriptType,
            feedback: userFeedback,
            success: userFeedback?.rating >= 3,
            improvements: userFeedback?.suggestions || '',
            context: {
                url: window.location?.href || '',
                userAgent: navigator.userAgent,
                language: navigator.language
            }
        };

        // Stocker pour l'entraînement
        const key = `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.trainingData.scripts.set(key, trainingEntry);
        
        // Sauvegarder automatiquement
        await this.saveTrainingData();
        
        // Analyser les patterns pour amélioration immédiate
        this.analyzeAndImprove(trainingEntry);
    }

    // Analyser les patterns pour amélioration continue
    analyzeAndImprove(entry) {
        // Extraire les patterns de réussite
        if (entry.success) {
            const pattern = this.extractSuccessPattern(entry);
            this.trainingData.patterns.set(pattern.id, pattern);
        }
        
        // Identifier les points d'amélioration
        if (!entry.success && entry.improvements) {
            this.identifyImprovementAreas(entry);
        }
    }

    extractSuccessPattern(entry) {
        return {
            id: `pattern_${Date.now()}`,
            requestType: this.categorizeRequest(entry.userRequest),
            scriptTemplate: this.extractTemplate(entry.generatedScript),
            keywords: this.extractKeywords(entry.userRequest),
            context: entry.context,
            success_rate: 1.0
        };
    }

    // Améliorer les prompts basés sur le feedback
    improvePromptBasedOnFeedback(originalPrompt, feedback, userRequest) {
        let improvedPrompt = originalPrompt;
        
        // Si le script n'était pas assez détaillé
        if (feedback.includes('plus détaillé') || feedback.includes('plus complet')) {
            improvedPrompt += `
            
IMPORTANT: Génère un script très détaillé avec :
- Commentaires explicatifs pour chaque section
- Gestion d'erreurs robuste
- Logging complet
- Paramètres configurables
- Documentation intégrée`;
        }
        
        // Si le script n'était pas adapté au contexte
        if (feedback.includes('pas adapté') || feedback.includes('contexte')) {
            improvedPrompt += `
            
CONTEXTE UTILISATEUR: Analyse le contexte suivant et adapte le script :
- Demande: "${userRequest}"
- Environnement détecté: ${this.detectUserEnvironment()}
- Préférences: ${JSON.stringify(this.getUserPreferences())}`;
        }
        
        return improvedPrompt;
    }

    // Créer des prompts d'entraînement optimisés
    generateTrainingPrompts() {
        return {
            // Prompt de base avec apprentissage
            basePrompt: `Tu es XYPH, un assistant IA expert en automatisation qui APPREND de chaque interaction.

HISTORIQUE D'APPRENTISSAGE:
${this.getRecentSuccessPatterns()}

DONNÉES D'AMÉLIORATION:
${this.getImprovementInsights()}

CONTEXTE ACTUEL:
- OS: ${this.detectOS()}
- Compétences utilisateur: ${this.assessUserSkill()}
- Préférences: ${this.getUserStylePreferences()}`,

            // Prompt pour génération de scripts
            scriptPrompt: `Génère un script ${this.currentScriptType} optimisé qui :

1. ANALYSE le contexte et les besoins exacts
2. UTILISE les patterns de réussite identifiés
3. ÉVITE les erreurs communes détectées
4. INCLUT les améliorations suggérées par les utilisateurs
5. ADAPTE le niveau de complexité au profil utilisateur

EXEMPLES DE RÉUSSITE:
${this.getBestExamples()}

POINTS D'ATTENTION:
${this.getCommonPitfalls()}`,

            // Prompt pour amélioration continue
            improvementPrompt: `Analyse cette interaction et identifie :
1. Ce qui a bien fonctionné
2. Ce qui peut être amélioré
3. Les patterns à retenir
4. Les modifications à apporter au prochain script similaire`
        };
    }

    // Système de feedback intelligent
    async requestFeedback(scriptGenerated, userRequest) {
        const feedbackModal = document.createElement('div');
        feedbackModal.className = 'feedback-modal';
        feedbackModal.innerHTML = `
            <div class="feedback-container">
                <div class="feedback-header">
                    <h3>🎯 Aidez XYPH à s'améliorer</h3>
                    <p>Comment évaluez-vous ce script généré ?</p>
                </div>
                
                <div class="feedback-content">
                    <div class="rating-section">
                        <label>Note globale :</label>
                        <div class="star-rating">
                            <span class="star" data-rating="1">⭐</span>
                            <span class="star" data-rating="2">⭐</span>
                            <span class="star" data-rating="3">⭐</span>
                            <span class="star" data-rating="4">⭐</span>
                            <span class="star" data-rating="5">⭐</span>
                        </div>
                    </div>
                    
                    <div class="criteria-section">
                        <h4>Évaluation détaillée :</h4>
                        <div class="criteria">
                            <label><input type="checkbox" name="criteria" value="correct"> ✅ Le script fait ce qui était demandé</label>
                            <label><input type="checkbox" name="criteria" value="complete"> 📋 Le script est complet</label>
                            <label><input type="checkbox" name="criteria" value="optimized"> ⚡ Le script est optimisé</label>
                            <label><input type="checkbox" name="criteria" value="safe"> 🔒 Le script semble sécurisé</label>
                            <label><input type="checkbox" name="criteria" value="documented"> 📚 Le script est bien documenté</label>
                        </div>
                    </div>
                    
                    <div class="improvement-section">
                        <label for="improvements">Suggestions d'amélioration :</label>
                        <textarea id="improvements" placeholder="Que pourrait faire XYPH pour mieux répondre à ce type de demande ?"></textarea>
                    </div>
                    
                    <div class="example-section">
                        <label><input type="checkbox" id="saveExample"> 💾 Sauvegarder comme exemple de réussite</label>
                        <label><input type="checkbox" id="sharePattern"> 🔄 Partager ce pattern avec la communauté</label>
                    </div>
                </div>
                
                <div class="feedback-actions">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Ignorer</button>
                    <button class="btn btn-primary" onclick="window.sidebarInstance.submitFeedback()">💡 Améliorer XYPH</button>
                </div>
            </div>
        `;

        // Styles pour le feedback
        const feedbackStyles = document.createElement('style');
        feedbackStyles.textContent = `
            .feedback-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .feedback-container {
                background: var(--bg-color, #1e293b);
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                color: white;
            }
            .feedback-header {
                padding: 20px;
                border-bottom: 1px solid #475569;
                text-align: center;
            }
            .feedback-content {
                padding: 20px;
            }
            .rating-section, .criteria-section, .improvement-section, .example-section {
                margin-bottom: 20px;
            }
            .star-rating {
                display: flex;
                gap: 5px;
                justify-content: center;
                margin: 10px 0;
            }
            .star {
                font-size: 24px;
                cursor: pointer;
                transition: all 0.2s;
                filter: grayscale(100%);
            }
            .star:hover, .star.active {
                filter: grayscale(0%);
                transform: scale(1.2);
            }
            .criteria {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .criteria label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }
            #improvements {
                width: 100%;
                min-height: 80px;
                background: var(--surface-color, #334155);
                border: 1px solid #475569;
                border-radius: 6px;
                padding: 10px;
                color: white;
                font-family: inherit;
            }
            .feedback-actions {
                padding: 20px;
                border-top: 1px solid #475569;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
        `;
        
        document.head.appendChild(feedbackStyles);
        document.body.appendChild(feedbackModal);
        
        // Gestionnaire d'événements pour les étoiles
        const stars = feedbackModal.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach((s, index) => {
                    s.classList.toggle('active', index < rating);
                });
                feedbackModal.dataset.rating = rating;
            });
        });
    }

    async submitFeedback() {
        const modal = document.querySelector('.feedback-modal');
        const rating = parseInt(modal.dataset.rating) || 0;
        const criteria = Array.from(modal.querySelectorAll('input[name="criteria"]:checked')).map(cb => cb.value);
        const improvements = modal.querySelector('#improvements').value;
        const saveExample = modal.querySelector('#saveExample').checked;
        const sharePattern = modal.querySelector('#sharePattern').checked;
        
        const feedback = {
            rating,
            criteria,
            improvements,
            saveExample,
            sharePattern,
            timestamp: new Date().toISOString()
        };
        
        // Enregistrer le feedback pour amélioration
        await this.processFeedbackForImprovement(feedback);
        
        modal.remove();
        this.showResult('✅ Merci ! XYPH va utiliser vos retours pour s\'améliorer.', 'success');
    }

    async processFeedbackForImprovement(feedback) {
        // Mettre à jour les patterns de réussite
        if (feedback.rating >= 4 && feedback.saveExample) {
            await this.saveAsSuccessPattern();
        }
        
        // Analyser les suggestions d'amélioration
        if (feedback.improvements) {
            await this.analyzeImprovementSuggestions(feedback.improvements);
        }
        
        // Ajuster les prompts pour la prochaine fois
        this.adjustPromptsBasedOnFeedback(feedback);
    }

    // Améliorer la méthode loadPresetScript pour inclure plus d'exemples
    loadPresetScript(scriptKey) {
        const scripts = {
            'file-organizer': {
                powershell: `# 📁 Organisateur de Fichiers Intelligent
# Créé par AI Script Commander - $(Get-Date)
# Organise automatiquement les fichiers par type, date ou taille

param(
    [string]$SourcePath = ".",
    [string]$DestinationPath = ".\\Organized",
    [ValidateSet("Extension", "Date", "Size", "Smart")]
    [string]$OrganizeBy = "Smart",
    [switch]$WhatIf,
    [switch]$Recursive
)

$ErrorActionPreference = "Stop"

# Configuration des catégories intelligentes
$Categories = @{
    'Documents' = @('.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt')
    'Images' = @('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp')
    'Videos' = @('.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm')
    'Audio' = @('.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma')
    'Archives' = @('.zip', '.rar', '.7z', '.tar', '.gz', '.bz2')
    'Code' = @('.js', '.py', '.ps1', '.bat', '.sh', '.html', '.css', '.sql')
}

try {
    Write-Host "🚀 Démarrage de l'organisation intelligente" -ForegroundColor Green
    Write-Host "📂 Source: $SourcePath" -ForegroundColor Cyan
    Write-Host "📁 Destination: $DestinationPath" -ForegroundColor Cyan
    Write-Host "🔧 Méthode: $OrganizeBy" -ForegroundColor Cyan
    
    $files = Get-ChildItem -Path $SourcePath -File -Recurse:$Recursive
    Write-Host "📊 $($files.Count) fichiers trouvés" -ForegroundColor Yellow
    
    foreach ($file in $files) {
        $targetFolder = switch ($OrganizeBy) {
            "Extension" { 
                $ext = $file.Extension.TrimStart('.').ToLower()
                if ($ext) { $ext } else { "NoExtension" }
            }
            "Date" { 
                $file.LastWriteTime.ToString("yyyy-MM") 
            }
            "Size" {
                $sizeKB = [math]::Round($file.Length / 1KB, 2)
                if ($sizeKB -lt 100) { "Small_0-100KB" }
                elseif ($sizeKB -lt 1000) { "Medium_100KB-1MB" }
                else { "Large_1MB+" }
            }
            "Smart" {
                $ext = $file.Extension.ToLower()
                $category = $Categories.GetEnumerator() | Where-Object { $_.Value -contains $ext } | Select-Object -First 1
                if ($category) { $category.Name } else { "Others" }
            }
        }
        
        $targetPath = Join-Path $DestinationPath $targetFolder
        
        if (-not $WhatIf) {
            if (-not (Test-Path $targetPath)) {
                New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
                Write-Host "📁 Créé: $targetPath" -ForegroundColor Green
            }
            
            $destinationFile = Join-Path $targetPath $file.Name
            if (Test-Path $destinationFile) {
                $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
                $newName = "$($file.BaseName)_$timestamp$($file.Extension)"
                $destinationFile = Join-Path $targetPath $newName
            }
            
            Copy-Item $file.FullName $destinationFile -Force
        }
        
        Write-Host "✓ $($file.Name) → $targetFolder" -ForegroundColor $(if($WhatIf){'Yellow'}else{'Green'})
    }
    
    Write-Host "✅ Organisation terminée! $($files.Count) fichiers traités" -ForegroundColor Green
    if ($WhatIf) { Write-Host "⚠️  Mode simulation - aucun fichier déplacé" -ForegroundColor Yellow }
    
} catch {
    Write-Error "❌ Erreur: $($_.Exception.Message)"
}`,
                python: `#!/usr/bin/env python3
"""
📁 Organisateur de Fichiers Intelligent
Créé par AI Script Commander
Organise automatiquement les fichiers par type, date ou taille intelligente
"""

import os
import shutil
import argparse
from datetime import datetime
from pathlib import Path
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FileOrganizer:
    def __init__(self):
        self.categories = {
            'Documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
            'Images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
            'Videos': ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'],
            'Audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma'],
            'Archives': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
            'Code': ['.js', '.py', '.ps1', '.bat', '.sh', '.html', '.css', '.sql']
        }
    
    def categorize_file(self, file_path: Path, method: str) -> str:
        """Catégorise un fichier selon la méthode choisie"""
        if method == "extension":
            ext = file_path.suffix.lower()[1:] if file_path.suffix else "no_extension"
            return ext
        
        elif method == "date":
            mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
            return mtime.strftime("%Y-%m")
        
        elif method == "size":
            size_kb = file_path.stat().st_size / 1024
            if size_kb < 100:
                return "Small_0-100KB"
            elif size_kb < 1024:
                return "Medium_100KB-1MB"
            else:
                return "Large_1MB+"
        
        elif method == "smart":
            ext = file_path.suffix.lower()
            for category, extensions in self.categories.items():
                if ext in extensions:
                    return category
            return "Others"
        
        return "Unknown"
    
    def organize_files(self, source_path: str, dest_path: str, method: str = "smart", 
                      recursive: bool = False, dry_run: bool = False) -> dict:
        """Organise les fichiers selon la méthode spécifiée"""
        
        logger.info(f"🚀 Démarrage de l'organisation intelligente")
        logger.info(f"📂 Source: {source_path}")
        logger.info(f"📁 Destination: {dest_path}")
        logger.info(f"🔧 Méthode: {method}")
        
        source = Path(source_path)
        destination = Path(dest_path)
        
        if not source.exists():
            raise FileNotFoundError(f"Le dossier source n'existe pas: {source_path}")
        
        # Collecter tous les fichiers
        pattern = "**/*" if recursive else "*"
        files = [f for f in source.glob(pattern) if f.is_file()]
        
        logger.info(f"📊 {len(files)} fichiers trouvés")
        
        stats = {"moved": 0, "errors": 0, "categories": {}}
        
        for file_path in files:
            try:
                category = self.categorize_file(file_path, method)
                category_path = destination / category
                
                if not dry_run:
                    category_path.mkdir(parents=True, exist_ok=True)
                    
                    # Gérer les conflits de noms
                    dest_file = category_path / file_path.name
                    if dest_file.exists():
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                        name_parts = file_path.stem, timestamp, file_path.suffix
                        dest_file = category_path / f"{name_parts[0]}_{name_parts[1]}{name_parts[2]}"
                    
                    shutil.copy2(file_path, dest_file)
                    stats["moved"] += 1
                
                # Statistiques
                stats["categories"][category] = stats["categories"].get(category, 0) + 1
                
                status = "✓" if not dry_run else "🔍"
                logger.info(f"{status} {file_path.name} → {category}")
                
            except Exception as e:
                logger.error(f"❌ Erreur avec {file_path.name}: {e}")
                stats["errors"] += 1
        
        # Résumé
        logger.info(f"✅ Organisation terminée!")
        logger.info(f"📊 Statistiques:")
        for category, count in stats["categories"].items():
            logger.info(f"   {category}: {count} fichiers")
        
        if dry_run:
            logger.info("⚠️  Mode simulation - aucun fichier déplacé")
        
        return stats

def main():
    parser = argparse.ArgumentParser(description="Organisateur de fichiers intelligent")
    parser.add_argument("source", help="Dossier source")
    parser.add_argument("-d", "--destination", default="./Organized", help="Dossier de destination")
    parser.add_argument("-m", "--method", choices=["extension", "date", "size", "smart"], 
                       default="smart", help="Méthode d'organisation")
    parser.add_argument("-r", "--recursive", action="store_true", help="Traitement récursif")
    parser.add_argument("--dry-run", action="store_true", help="Mode simulation")
    
    args = parser.parse_args()
    
    try:
        organizer = FileOrganizer()
        organizer.organize_files(
            args.source, 
            args.destination, 
            args.method, 
            args.recursive, 
            args.dry_run
        )
        return 0
    except Exception as e:
        logger.error(f"❌ Erreur fatale: {e}")
        return 1

if __name__ == "__main__":
    exit(main())`
            }
        };

        const script = scripts[scriptKey]?.[this.currentScriptType];
        if (script) {
            document.getElementById('scriptInput').value = script;
            this.showResult(`📁 Script "${scriptKey}" chargé en ${this.currentScriptType}\\n\\n🤖 Script optimisé par l'agent IA avec fonctionnalités avancées`, 'success');
        }
    }
}

// Initialisation
const sidebar = new SidebarScriptCommander();