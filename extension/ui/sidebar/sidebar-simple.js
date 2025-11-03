// Sidebar Script Commander - Version simplifiée et fonctionnelle
class SidebarScriptCommander {
    constructor() {
        this.apiKey = '';
        this.currentScriptType = 'powershell';
        this.isProcessing = false;
        this.init();
    }

    async init() {
        await this.loadApiKey();
        this.setupEventListeners();
        this.updateStatus('🚀 Extension prête', 'success');
    }

    setupEventListeners() {
        // API Key
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', (e) => {
                this.apiKey = e.target.value;
                this.saveApiKey();
            });
        }

        // Script Type
        const scriptType = document.getElementById('scriptType');
        if (scriptType) {
            scriptType.addEventListener('change', (e) => {
                this.currentScriptType = e.target.value;
                this.updateStatus(`📝 Mode ${e.target.value} sélectionné`, 'info');
            });
        }

        // Main Buttons
        this.addClickListener('executeBtn', () => this.executeScript());
        this.addClickListener('generateTaskBtn', () => this.generateScript());
        this.addClickListener('analyzeBtn', () => this.analyzeScript());
        this.addClickListener('optimizeBtn', () => this.optimizeScript());
        this.addClickListener('saveBtn', () => this.saveScript());
        this.addClickListener('clearBtn', () => this.clearScript());

        // Quick examples
        document.querySelectorAll('.quick-example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const task = e.target.dataset.task;
                this.loadQuickExample(task);
            });
        });

        // Form buttons
        this.addClickListener('detectFormsBtn', () => this.detectForms());
        this.addClickListener('fillFormsBtn', () => this.fillForms());

        // Scraping buttons
        this.addClickListener('startScrapingBtn', () => this.startScraping());
        this.addClickListener('generateScraperBtn', () => this.generateScraper());
    }

    addClickListener(id, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
        }
    }

    async loadApiKey() {
        try {
            const result = await chrome.storage.sync.get(['deepseekApiKey']);
            this.apiKey = result.deepseekApiKey || '';
            const input = document.getElementById('apiKeyInput');
            if (input) input.value = this.apiKey;
        } catch (error) {
            console.error('Erreur chargement API key:', error);
        }
    }

    async saveApiKey() {
        try {
            await chrome.storage.sync.set({ deepseekApiKey: this.apiKey });
            this.updateStatus('✅ Clé API sauvegardée', 'success');
        } catch (error) {
            console.error('Erreur sauvegarde API key:', error);
        }
    }

    async generateScript() {
        const input = document.getElementById('scriptInput');
        if (!input || !input.value.trim()) {
            this.updateStatus('❌ Veuillez entrer une description', 'error');
            return;
        }

        if (!this.apiKey) {
            this.updateStatus('❌ Veuillez configurer votre clé API DeepSeek', 'error');
            return;
        }

        this.updateStatus('🤖 Génération en cours...', 'info');
        this.isProcessing = true;

        try {
            const prompt = `Génère un script ${this.currentScriptType} pour: ${input.value}

Exigences:
- Code propre et bien commenté
- Gestion des erreurs
- Prêt à l'emploi
- Commentaires en français

Fournis uniquement le code, sans explications supplémentaires.`;

            const response = await this.callDeepSeekAPI(prompt);
            
            if (response) {
                input.value = this.extractCode(response);
                this.showResult('✅ Script généré avec succès !');
                this.updateStatus('✅ Génération terminée', 'success');
            }
        } catch (error) {
            this.showResult(`❌ Erreur: ${error.message}`);
            this.updateStatus('❌ Erreur de génération', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    async analyzeScript() {
        const input = document.getElementById('scriptInput');
        if (!input || !input.value.trim()) {
            this.updateStatus('❌ Aucun script à analyser', 'error');
            return;
        }

        if (!this.apiKey) {
            this.updateStatus('❌ Veuillez configurer votre clé API', 'error');
            return;
        }

        this.updateStatus('🔍 Analyse en cours...', 'info');

        try {
            const prompt = `Analyse ce script ${this.currentScriptType} et fournis:
1. Ce qu'il fait
2. Points forts
3. Points faibles
4. Suggestions d'amélioration

Script:
\`\`\`${this.currentScriptType}
${input.value}
\`\`\``;

            const response = await this.callDeepSeekAPI(prompt);
            this.showResult(response || 'Analyse terminée');
            this.updateStatus('✅ Analyse terminée', 'success');
        } catch (error) {
            this.showResult(`❌ Erreur: ${error.message}`);
            this.updateStatus('❌ Erreur d\'analyse', 'error');
        }
    }

    async optimizeScript() {
        const input = document.getElementById('scriptInput');
        if (!input || !input.value.trim()) {
            this.updateStatus('❌ Aucun script à optimiser', 'error');
            return;
        }

        if (!this.apiKey) {
            this.updateStatus('❌ Veuillez configurer votre clé API', 'error');
            return;
        }

        this.updateStatus('⚡ Optimisation en cours...', 'info');

        try {
            const prompt = `Optimise ce script ${this.currentScriptType}:

\`\`\`${this.currentScriptType}
${input.value}
\`\`\`

Améliore:
- Performance
- Lisibilité
- Gestion des erreurs
- Bonnes pratiques

Fournis uniquement le code optimisé.`;

            const response = await this.callDeepSeekAPI(prompt);
            if (response) {
                input.value = this.extractCode(response);
                this.showResult('✅ Script optimisé !');
                this.updateStatus('✅ Optimisation terminée', 'success');
            }
        } catch (error) {
            this.showResult(`❌ Erreur: ${error.message}`);
            this.updateStatus('❌ Erreur d\'optimisation', 'error');
        }
    }

    async executeScript() {
        const input = document.getElementById('scriptInput');
        if (!input || !input.value.trim()) {
            this.updateStatus('❌ Aucun script à exécuter', 'error');
            return;
        }

        this.updateStatus('▶️ Exécution en cours...', 'info');

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'executeScript',
                type: this.currentScriptType,
                script: input.value
            });

            if (response.error) {
                this.showResult(`❌ Erreur: ${response.error}`);
                this.updateStatus('❌ Erreur d\'exécution', 'error');
            } else {
                this.showResult(`✅ Exécution réussie!\n\n${response.result}`);
                this.updateStatus('✅ Exécution terminée', 'success');
            }
        } catch (error) {
            this.showResult(`❌ Erreur: ${error.message}`);
            this.updateStatus('❌ Erreur d\'exécution', 'error');
        }
    }

    saveScript() {
        const input = document.getElementById('scriptInput');
        if (!input || !input.value.trim()) {
            this.updateStatus('❌ Aucun script à sauvegarder', 'error');
            return;
        }

        const extensions = {
            powershell: 'ps1',
            python: 'py',
            bash: 'sh',
            javascript: 'js',
            cmd: 'bat'
        };

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `script_${this.currentScriptType}_${timestamp}.${extensions[this.currentScriptType] || 'txt'}`;

        const blob = new Blob([input.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        this.updateStatus(`💾 Script sauvegardé: ${filename}`, 'success');
    }

    clearScript() {
        const input = document.getElementById('scriptInput');
        if (input) {
            input.value = '';
            this.showResult('Résultats effacés');
            this.updateStatus('📝 Éditeur vidé', 'info');
        }
    }

    async callDeepSeekAPI(prompt) {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 3000
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }

    extractCode(text) {
        // Extraire le code des blocs markdown
        const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/;
        const match = text.match(codeBlockRegex);
        return match ? match[1].trim() : text.trim();
    }

    loadQuickExample(task) {
        const examples = {
            'file-organizer': {
                powershell: `# Organisateur de fichiers
param([string]$Path = ".", [string]$Dest = "./Organized")

Get-ChildItem -Path $Path -File | ForEach-Object {
    $ext = $_.Extension.TrimStart('.')
    if ([string]::IsNullOrEmpty($ext)) { $ext = "NoExtension" }
    
    $targetDir = Join-Path $Dest $ext
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force
    }
    
    Copy-Item $_.FullName -Destination $targetDir
    Write-Host "✓ $($_.Name) -> $ext"
}`,
                python: `# Organisateur de fichiers
import os
import shutil
from pathlib import Path

def organize_files(source='.', dest='./Organized'):
    for file in Path(source).glob('*'):
        if file.is_file():
            ext = file.suffix[1:] or 'NoExtension'
            target_dir = Path(dest) / ext
            target_dir.mkdir(exist_ok=True)
            shutil.copy2(file, target_dir)
            print(f"✓ {file.name} -> {ext}")

organize_files()`
            },
            'backup': {
                powershell: `# Script de sauvegarde
$source = Read-Host "Dossier source"
$dest = "Backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item -Path $source -Destination $dest -Recurse
Compress-Archive -Path $dest -DestinationPath "$dest.zip"
Write-Host "✅ Sauvegarde créée: $dest.zip"`,
                python: `# Script de sauvegarde
import shutil
from datetime import datetime

source = input("Dossier source: ")
dest = f"Backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
shutil.copytree(source, dest)
shutil.make_archive(dest, 'zip', dest)
print(f"✅ Sauvegarde créée: {dest}.zip")`
            },
            'cleaner': {
                powershell: `# Nettoyeur système
$tempPaths = @($env:TEMP, "C:\\Windows\\Temp")
$removed = 0

foreach ($path in $tempPaths) {
    if (Test-Path $path) {
        Get-ChildItem $path -Recurse -Force -ErrorAction SilentlyContinue | 
        Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        $removed++
    }
}
Write-Host "✅ $removed dossiers nettoyés"`
            },
            'scraper': {
                python: `# Web scraper simple
import requests
from bs4 import BeautifulSoup

url = input("URL: ")
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

links = [a.get('href') for a in soup.find_all('a', href=True)]
print(f"✅ {len(links)} liens trouvés")
for link in links[:10]:
    print(link)`
            }
        };

        const script = examples[task]?.[this.currentScriptType] || examples[task]?.powershell;
        if (script) {
            const input = document.getElementById('scriptInput');
            if (input) input.value = script;
            this.updateStatus(`📁 Exemple "${task}" chargé`, 'success');
        }
    }

    async detectForms() {
        this.updateStatus('🔍 Détection des formulaires...', 'info');

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'detectForms' });

            if (response && response.forms) {
                const formResults = document.getElementById('formResults');
                if (formResults) {
                    formResults.textContent = `✅ ${response.forms.length} formulaire(s) détecté(s)\n\n` + 
                        JSON.stringify(response.forms, null, 2);
                }
                this.updateStatus(`✅ ${response.forms.length} formulaire(s) trouvé(s)`, 'success');
            }
        } catch (error) {
            const formResults = document.getElementById('formResults');
            if (formResults) {
                formResults.textContent = `❌ Erreur: ${error.message}`;
            }
            this.updateStatus('❌ Erreur de détection', 'error');
        }
    }

    async fillForms() {
        this.updateStatus('✏️ Remplissage en cours...', 'info');

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'autoFillForm',
                dataType: 'french'
            });

            if (response && response.success) {
                this.updateStatus(`✅ ${response.filledFields.length} champ(s) rempli(s)`, 'success');
            }
        } catch (error) {
            this.updateStatus('❌ Erreur de remplissage', 'error');
        }
    }

    async startScraping() {
        const urlInput = document.getElementById('scrapeUrl');
        const typeSelect = document.getElementById('scrapeType');

        if (!urlInput || !urlInput.value) {
            this.updateStatus('❌ Veuillez entrer une URL', 'error');
            return;
        }

        this.updateStatus('🌐 Scraping en cours...', 'info');

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'webScraping',
                url: urlInput.value,
                type: typeSelect?.value || 'links'
            });

            if (response.results) {
                const scrapeResults = document.getElementById('scrapeResults');
                if (scrapeResults) {
                    scrapeResults.textContent = `✅ ${response.results.length} élément(s) trouvé(s)\n\n` +
                        response.results.slice(0, 20).join('\n');
                }
                this.updateStatus(`✅ ${response.results.length} élément(s) extrait(s)`, 'success');
            }
        } catch (error) {
            this.updateStatus('❌ Erreur de scraping', 'error');
        }
    }

    async generateScraper() {
        const urlInput = document.getElementById('scrapeUrl');
        if (!urlInput || !urlInput.value) {
            this.updateStatus('❌ Veuillez entrer une URL', 'error');
            return;
        }

        const input = document.getElementById('scriptInput');
        if (input) {
            input.value = `// Génération d'un scraper pour ${urlInput.value}...`;
        }

        await this.generateScript();
    }

    showResult(message) {
        const resultArea = document.getElementById('resultArea');
        if (resultArea) {
            resultArea.textContent = message;
        }
    }

    updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('statusMessage');
        if (!statusElement) return;

        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b'
        };

        statusElement.style.borderLeftColor = colors[type];
        statusElement.textContent = message;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Sidebar Script Commander chargé');
    window.sidebar = new SidebarScriptCommander();
});
