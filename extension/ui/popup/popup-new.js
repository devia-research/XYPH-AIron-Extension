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
