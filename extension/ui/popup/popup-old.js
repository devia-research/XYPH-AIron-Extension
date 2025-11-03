// Event listener pour le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ XYPH Extension popup loaded');
    new PopupController();
});

class PopupController {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExtensionStatus();
    }

    setupEventListeners() {
        // Bouton principal - Ouvrir le panneau latéral
        const openSidebarBtn = document.getElementById('openSidebar');
        if (openSidebarBtn) {
            openSidebarBtn.addEventListener('click', () => this.openSidePanel());
        }

        // Nouveau script
        const newScriptBtn = document.getElementById('newScript');
        if (newScriptBtn) {
            newScriptBtn.addEventListener('click', () => this.openSidePanelWithAction('new'));
        }

        // Paramètres
        const settingsBtn = document.getElementById('settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSidePanelWithAction('settings'));
        }

        // Raccourcis rapides
        const quickGenerateBtn = document.getElementById('quickGenerate');
        if (quickGenerateBtn) {
            quickGenerateBtn.addEventListener('click', () => this.quickGenerate());
        }

        const quickAutoFillBtn = document.getElementById('quickAutoFill');
        if (quickAutoFillBtn) {
            quickAutoFillBtn.addEventListener('click', () => this.quickAutoFill());
        }

        const quickScrapeBtn = document.getElementById('quickScrape');
        if (quickScrapeBtn) {
            quickScrapeBtn.addEventListener('click', () => this.quickScrape());
        }
    }

    async openSidePanel() {
        try {
            // Ouvrir le panneau latéral
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (chrome.sidePanel) {
                await chrome.sidePanel.open({ windowId: tab.windowId });
                this.showStatus('✅ Panneau latéral ouvert', 'success');
                
                // Fermer le popup après un court délai
                setTimeout(() => window.close(), 500);
            } else {
                // Fallback: ouvrir dans un nouvel onglet si sidePanel n'est pas disponible
                chrome.tabs.create({ url: chrome.runtime.getURL('ui/sidebar/sidebar.html') });
                this.showStatus('✅ Interface ouverte dans un nouvel onglet', 'success');
            }
        } catch (error) {
            console.error('Erreur ouverture panneau:', error);
            this.showStatus('❌ Erreur lors de l\'ouverture du panneau', 'error');
        }
    }

    async openSidePanelWithAction(action) {
        try {
            await this.openSidePanel();
            // Envoyer un message pour l'action spécifique
            chrome.runtime.sendMessage({ action: 'sidePanelAction', data: action });
        } catch (error) {
            console.error('Erreur action panneau:', error);
        }
    }

    async quickGenerate() {
        this.showStatus('🎯 Ouverture du générateur de scripts...', 'info');
        await this.openSidePanelWithAction('generate');
    }

    async quickAutoFill() {
        this.showStatus('📝 Activation de l\'auto-remplissage...', 'info');
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Envoyer un message au content script pour détecter les formulaires
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'detectForms'
            });

            if (response && response.forms && response.forms.length > 0) {
                this.showStatus(`✅ ${response.forms.length} formulaire(s) détecté(s)`, 'success');
                await this.openSidePanelWithAction('autofill');
            } else {
                this.showStatus('⚠️ Aucun formulaire détecté sur cette page', 'warning');
            }
        } catch (error) {
            console.error('Erreur auto-fill:', error);
            this.showStatus('❌ Impossible de détecter les formulaires', 'error');
        }
    }

    async quickScrape() {
        this.showStatus('🌐 Préparation du scraping...', 'info');
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Ouvrir le panneau avec l'URL actuelle
            chrome.runtime.sendMessage({ 
                action: 'sidePanelAction', 
                data: 'scrape',
                url: tab.url 
            });
            
            await this.openSidePanel();
        } catch (error) {
            console.error('Erreur scraping:', error);
            this.showStatus('❌ Erreur lors du scraping', 'error');
        }
    }

    async checkExtensionStatus() {
        try {
            // Vérifier si l'extension est bien configurée
            const result = await chrome.storage.sync.get(['deepseekApiKey', 'settings']);
            
            if (result.deepseekApiKey) {
                this.showStatus('✅ Extension configurée et prête', 'success');
            } else {
                this.showStatus('⚠️ Clé API DeepSeek non configurée', 'warning');
            }
        } catch (error) {
            console.error('Erreur vérification status:', error);
            this.showStatus('⚠️ Vérification de l\'état...', 'info');
        }
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('statusMessage');
        if (!statusElement) return;

        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b'
        };

        statusElement.style.borderLeftColor = colors[type];
        statusElement.style.background = `rgba(${this.hexToRgb(colors[type])}, 0.1)`;
        statusElement.textContent = message;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '59, 130, 246';
    }
}

        // AI Actions
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleAIAction(action);
            });
        });

        // Auto-fill actions
        document.getElementById('executeAutoFill').addEventListener('click', () => this.executeAutoFill());
        document.getElementById('generateAutoFillScript').addEventListener('click', () => this.generateAutoFillScript());
        document.getElementById('testAutoFill').addEventListener('click', () => this.testAutoFill());

        // Web scraping actions
        document.getElementById('startScraping').addEventListener('click', () => this.startScraping());
        document.getElementById('generateScraper').addEventListener('click', () => this.generateScraper());
        document.getElementById('downloadScraped').addEventListener('click', () => this.downloadScraped());

        // Settings
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());

        // Navigation items
        document.querySelectorAll('.nav-item[data-script]').forEach(item => {
            item.addEventListener('click', (e) => {
                const scriptType = e.target.closest('.nav-item').dataset.script;
                this.loadPresetScript(scriptType);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.executeScript();
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'G') {
                e.preventDefault();
                this.handleAIAction('generate-script');
            }
        });
    }

    setupTabNavigation() {
        document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
            item.addEventListener('click', (e) => {
                const tabId = e.target.closest('.nav-item').dataset.tab;
                
                // Update active nav item
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                e.target.closest('.nav-item').classList.add('active');
                
                // Show corresponding tab
                document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    async executeScript() {
        const script = document.getElementById('scriptInput').value.trim();
        if (!script) {
            this.showResult('❌ Veuillez entrer un script à exécuter', 'error');
            return;
        }

        this.showResult('⚡ Exécution en cours...', 'info');

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'executeScript',
                type: this.currentScriptType,
                script: script
            });

            if (response.error) {
                this.showResult(`❌ Erreur: ${response.error}`, 'error');
            } else {
                this.showResult(`✅ Succès!\n\n${response.result}`, 'success');
            }
        } catch (error) {
            this.showResult(`❌ Erreur d'exécution: ${error.message}`, 'error');
        }
    }

    async handleAIAction(action) {
        const script = document.getElementById('scriptInput').value.trim();
        
        if (!this.apiKey) {
            this.showResult('❌ Veuillez configurer votre clé API DeepSeek', 'error');
            return;
        }

        if (!script && action !== 'generate-script') {
            this.showResult('❌ Veuillez entrer un script à traiter', 'error');
            return;
        }

        this.showResult('🤖 IA en train de réfléchir...', 'info');

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'aiAssist',
                type: this.currentScriptType,
                script: script,
                aiAction: action,
                apiKey: this.apiKey
            });

            if (response.error) {
                this.showResult(`❌ Erreur IA: ${response.error}`, 'error');
            } else {
                if (action === 'generate-script' || action === 'optimize-script') {
                    document.getElementById('scriptInput').value = this.extractCodeFromResponse(response.result);
                }
                this.showResult(`🤖 Réponse IA:\n\n${response.result}`, 'success');
            }
        } catch (error) {
            this.showResult(`❌ Erreur IA: ${error.message}`, 'error');
        }
    }

    extractCodeFromResponse(response) {
        // Extract code from markdown code blocks
        const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/;
        const match = response.match(codeBlockRegex);
        return match ? match[1] : response;
    }

    async executeAutoFill() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'autoFillForm',
                dataType: document.getElementById('dataType').value,
                fields: this.getSelectedFields()
            });

            if (response.success) {
                this.showResult(`✅ Auto-remplissage réussi! ${response.filledFields.length} champs remplis.`, 'success');
            } else {
                this.showResult('❌ Aucun champ de formulaire détecté', 'error');
            }
        } catch (error) {
            this.showResult(`❌ Erreur auto-remplissage: ${error.message}`, 'error');
        }
    }

    async generateAutoFillScript() {
        const fields = this.getSelectedFields();
        const dataType = document.getElementById('dataType').value;
        
        const prompt = `Génère un script ${this.currentScriptType} pour l'auto-remplissage de formulaires web avec les caractéristiques suivantes:
- Type de données: ${dataType}
- Champs à remplir: ${fields.join(', ')}
- Doit gérer les doublons et les champs dynamiques
- Interface utilisateur propre et professionnelle`;

        document.getElementById('scriptInput').value = `// Script d'auto-remplissage en cours de génération...\n// Type: ${dataType}\n// Champs: ${fields.join(', ')}`;
        
        await this.handleAIAction('generate-script');
    }

    getSelectedFields() {
        const checkboxes = document.querySelectorAll('input[name="fields"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    async startScraping() {
        const url = document.getElementById('scrapeUrl').value;
        const scrapeType = document.getElementById('scrapeType').value;
        const filter = document.getElementById('scrapeFilter').value;

        if (!url) {
            this.showResult('❌ Veuillez entrer une URL à scraper', 'error');
            return;
        }

        this.showResult('🌐 Début du scraping...', 'info');

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'webScraping',
                url: url,
                type: scrapeType,
                filter: filter
            });

            if (response.error) {
                this.showResult(`❌ Erreur scraping: ${response.error}`, 'error');
            } else {
                this.showResult(`✅ Scraping terminé!\n\nÉléments trouvés: ${response.results.length}\n\n${response.results.slice(0, 10).join('\n')}${response.results.length > 10 ? '\n...' : ''}`, 'success');
            }
        } catch (error) {
            this.showResult(`❌ Erreur scraping: ${error.message}`, 'error');
        }
    }

    async generateScraper() {
        const url = document.getElementById('scrapeUrl').value;
        const scrapeType = document.getElementById('scrapeType').value;
        const filter = document.getElementById('scrapeFilter').value;

        const prompt = `Crée un script ${this.currentScriptType} de web scraping avec les spécifications:
- URL cible: ${url}
- Type de données: ${scrapeType}
- Filtre: ${filter}
- Doit gérer les pages dynamiques et les délais
- Export des résultats en format structuré`;

        document.getElementById('scriptInput').value = `// Script de scraping en cours de génération...\n// Cible: ${url}\n// Type: ${scrapeType}`;
        
        await this.handleAIAction('generate-script');
    }

    async downloadScraped() {
        // Implementation for downloading scraped data
        this.showResult('📥 Fonctionnalité de téléchargement en développement...', 'info');
    }

    async loadPresetScript(scriptKey) {
        const scripts = {
            'file-organizer': {
                powershell: `# Organisateur de fichiers PowerShell
param(
    [string]$Path = ".",
    [string]$Destination = ".\Organized",
    [switch]$ByExtension,
    [switch]$ByDate,
    [switch]$Recursive
)

function New-TimeStamp {
    return Get-Date -Format "yyyyMMdd_HHmmss"
}

Write-Host "🔍 Analyse du répertoire: $Path" -ForegroundColor Green

if (-not (Test-Path $Path)) {
    Write-Error "Le chemin source n'existe pas: $Path"
    exit 1
}

if (-not (Test-Path $Destination)) {
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
}

$files = Get-ChildItem -Path $Path -File -Recurse:$Recursive
$totalSize = ($files | Measure-Object -Property Length -Sum).Sum

Write-Host "📁 $($files.Count) fichiers trouvés ($([math]::Round($totalSize/1MB, 2)) MB)" -ForegroundColor Cyan

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
    
    $newName = "$($file.BaseName)_$(New-TimeStamp)$($file.Extension)"
    $targetPath = Join-Path $targetDir $newName
    
    try {
        Copy-Item $file.FullName $targetPath -Force
        Write-Host "✓ $($file.Name) -> $category/$newName" -ForegroundColor Green
    }
    catch {
        Write-Warning "Erreur avec $($file.Name): $($_.Exception.Message)"
    }
}

Write-Host "✅ Organisation terminée!" -ForegroundColor Green`,
                python: `# Organisateur de fichiers Python
import os
import shutil
from datetime import datetime
from pathlib import Path

def organize_files(source_path=".", destination="./Organized", by_extension=True, by_date=False, recursive=False):
    source = Path(source_path)
    destination = Path(destination)
    
    if not source.exists():
        print(f"❌ Le chemin source n'existe pas: {source_path}")
        return
    
    destination.mkdir(exist_ok=True)
    
    if recursive:
        files = list(source.rglob("*"))
    else:
        files = list(source.glob("*"))
    
    files = [f for f in files if f.is_file()]
    total_size = sum(f.stat().st_size for f in files)
    
    print(f"🔍 {len(files)} fichiers trouvés ({total_size / 1024 / 1024:.2f} MB)")
    
    for file_path in files:
        if by_extension:
            category = file_path.suffix[1:] if file_path.suffix else "SansExtension"
        elif by_date:
            mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
            category = mtime.strftime("%Y-%m")
        else:
            category = "Files"
        
        target_dir = destination / category
        target_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        new_name = f"{file_path.stem}_{timestamp}{file_path.suffix}"
        target_path = target_dir / new_name
        
        try:
            shutil.copy2(file_path, target_path)
            print(f"✓ {file_path.name} -> {category}/{new_name}")
        except Exception as e:
            print(f"⚠️ Erreur avec {file_path.name}: {e}")
    
    print("✅ Organisation terminée!")

if __name__ == "__main__":
    organize_files()`
            },
            'web-automation': {
                powershell: `# Automation Web PowerShell
param(
    [string]$Url,
    [string]$Action = "screenshot",
    [int]$Delay = 2
)

function Take-Screenshot {
    param([string]$Url, [string]$OutputPath = ".\screenshot.png")
    
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    
    # Utiliser Selenium pour les captures web
    Write-Host "📸 Capture de $Url" -ForegroundColor Yellow
    # Implémentation Selenium ici...
}

function Extract-Links {
    param([string]$Url)
    
    $webClient = New-Object System.Net.WebClient
    $html = $webClient.DownloadString($Url)
    
    $links = [regex]::Matches($html, 'href="(.*?)"') | 
             ForEach-Object { $_.Groups[1].Value } |
             Where-Object { $_ -match "^http" }
    
    return $links
}

Write-Host "🌐 Démarrage de l'automation web..." -ForegroundColor Green

if ($Action -eq "screenshot") {
    Take-Screenshot -Url $Url
}
elseif ($Action -eq "extract-links") {
    $links = Extract-Links -Url $Url
    Write-Host "🔗 Liens trouvés:" -ForegroundColor Cyan
    $links | ForEach-Object { Write-Host "  $_" }
}

Write-Host "✅ Automation terminée!" -ForegroundColor Green`,
                python: `# Automation Web Python
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import requests
from bs4 import BeautifulSoup

class WebAutomator:
    def __init__(self):
        self.driver = None
        
    def start_browser(self):
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        self.driver = webdriver.Chrome(options=options)
        
    def take_screenshot(self, url, output_path="screenshot.png"):
        self.driver.get(url)
        time.sleep(2)
        self.driver.save_screenshot(output_path)
        print(f"📸 Capture sauvegardée: {output_path}")
        
    def extract_links(self, url):
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        links = [a.get('href') for a in soup.find_all('a', href=True)]
        return [link for link in links if link.startswith('http')]
        
    def close(self):
        if self.driver:
            self.driver.quit()

def main():
    automator = WebAutomator()
    try:
        automator.start_browser()
        automator.take_screenshot("https://example.com")
        links = automator.extract_links("https://example.com")
        print(f"🔗 {len(links)} liens trouvés")
    finally:
        automator.close()

if __name__ == "__main__":
    main()`
            }
        };

        const script = scripts[scriptKey]?.[this.currentScriptType];
        if (script) {
            document.getElementById('scriptInput').value = script;
            this.showResult(`📁 Script "${scriptKey}" chargé en ${this.currentScriptType}`, 'success');
        } else {
            this.showResult(`❌ Script non disponible pour ${scriptKey} en ${this.currentScriptType}`, 'error');
        }
    }

    testAutoFill() {
        const testData = this.generateTestData();
        Object.keys(testData).forEach(key => {
            const element = document.getElementById(`preview-${key}`);
            if (element) element.value = testData[key];
        });
        this.showResult('✅ Données de test générées pour l\'aperçu', 'success');
    }

    generateTestData() {
        const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Michel'];
        const lastNames = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return {
            username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            password: this.generatePassword(),
            firstname: firstName,
            lastname: lastName
        };
    }

    generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    updateFormPreview() {
        // Update form preview with current settings
        const testData = this.generateTestData();
        Object.keys(testData).forEach(key => {
            const element = document.getElementById(`preview-${key}`);
            if (element) element.value = testData[key];
        });
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
    }

    clearResults() {
        document.getElementById('executionResult').textContent = 'Les résultats de l\'exécution apparaîtront ici...';
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

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
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

    async saveApiKey() {
        const apiKey = document.getElementById('apiKey').value.trim();
        if (apiKey) {
            await chrome.storage.sync.set({ deepseekApiKey: apiKey });
            this.apiKey = apiKey;
            this.showResult('✅ Clé API sauvegardée', 'success');
        } else {
            this.showResult('❌ Veuillez entrer une clé API', 'error');
        }
    }

    async saveSettings() {
        this.settings = {
            language: document.getElementById('defaultLanguage').value,
            defaultScript: document.getElementById('defaultScript').value,
            backupFormat: document.getElementById('backupFormat').value
        };
        
        await chrome.storage.sync.set({ settings: this.settings });
        this.showResult('✅ Paramètres sauvegardés', 'success');
    }
}

// Initialisation
const scriptCommander = new AIScriptCommander();