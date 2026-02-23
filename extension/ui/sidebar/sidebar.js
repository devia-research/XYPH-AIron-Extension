class SidebarScriptCommander {
    constructor() {
        this.apiKey = '';
        this.currentScriptType = 'powershell';
        this.isProcessing = false;
        this.scriptLibrary = []; // Bibliothèque de scripts
        
        // Voice Assistant State
        this.recognition = null;
        this.isListening = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordingStartTime = null;
        this.recordingInterval = null;
        
        // Text-to-Speech State
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.ttsEnabled = true; // TTS activé par défaut
        
        // Chat Memory / Conversation History
        this.chatHistory = []; // Historique des messages [{role: 'user'|'assistant', content: '...'}]
        this.maxHistoryLength = 20; // Garder les 20 derniers messages (10 échanges)
        
        this.settings = {
            theme: 'dark',
            autoSave: true,
            notifications: true,
            provider: 'deepseek',
            aiModel: 'deepseek-chat',
            apiEndpoint: 'https://api.deepseek.com/chat/completions',
            context: 'Vous êtes XYPH, un assistant vocal français expert en génération de scripts automatisés. Vous DEVEZ TOUJOURS répondre en FRANÇAIS, jamais en anglais. Vous analysez les demandes des utilisateurs et générez des scripts optimisés, sécurisés et bien documentés. IMPORTANT: Toutes vos réponses doivent être en français.',
            role: 'agent',
            temperature: 0.1,
            maxTokens: 3000,
            savedContexts: [],
            savedRoles: [],
            trainingScripts: [],
            taskTemplates: this.getDefaultTaskTemplates(),
            scriptFormats: this.getDefaultScriptFormats()
        };
        this.providerConfigs = {
            deepseek: {
                name: 'DeepSeek',
                apiKeyLabel: 'Clé API DeepSeek',
                endpoint: 'https://api.deepseek.com/chat/completions',
                placeholder: 'sk-...',
                models: ['deepseek-chat', 'deepseek-reasoner']
            },
            openai: {
                name: 'OpenAI',
                apiKeyLabel: 'Clé API OpenAI',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                placeholder: 'sk-...',
                models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']
            },
            anthropic: {
                name: 'Anthropic Claude',
                apiKeyLabel: 'Clé API Anthropic',
                endpoint: 'https://api.anthropic.com/v1/messages',
                placeholder: 'sk-ant-...',
                models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-haiku-4-5-20251001']
            },
            google: {
                name: 'Google Gemini',
                apiKeyLabel: 'Clé API Google',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
                placeholder: 'AIza...',
                models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash']
            },
            groq: {
                name: 'Groq',
                apiKeyLabel: 'Clé API Groq',
                endpoint: 'https://api.groq.com/openai/v1/chat/completions',
                placeholder: 'gsk_...',
                models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768']
            },
            custom: {
                name: 'Personnalisé',
                apiKeyLabel: 'Clé API',
                endpoint: '',
                placeholder: 'Votre clé API',
                models: []
            }
        };
        this.init();
    }

    async init() {
        await this.loadApiKey();
        await this.loadSettings();
        await this.loadScriptLibrary();
        this.setupEventListeners();
        this.applyTheme(this.settings.theme);
        this.updateStatus('🚀 Extension prête', 'success');
    }

    setupEventListeners() {
        // Helper pour ajouter des listeners en toute sécurité
        const addListener = (id, event, handler) => {
            const element = document.getElementById(id);
            if (element) element.addEventListener(event, handler);
        };

        // API Key
        addListener('apiKeyInput', 'input', (e) => {
            this.apiKey = e.target.value;
            this.saveApiKey();
        });

        // Script Type
        addListener('scriptTypeSelect', 'change', (e) => {
            this.currentScriptType = e.target.value;
            this.updateStatus(`📝 Mode ${e.target.value} sélectionné`, 'info');
        });

        // Buttons
        addListener('executeBtn', 'click', () => this.executeScript());
        addListener('analyzeBtn', 'click', () => this.analyzeScript());
        addListener('generateTaskBtn', 'click', () => this.showTaskGenerator());
        addListener('saveBtn', 'click', () => this.saveScript());
        addListener('clearBtn', 'click', () => this.clearScript());
        addListener('clearResultsBtn', 'click', () => this.clearResults());

        // Web Interaction Buttons
        addListener('analyzePageBtn', 'click', () => this.analyzeCurrentPage());
        addListener('extractTextBtn', 'click', () => this.extractPageText());
        addListener('extractLinksBtn', 'click', () => this.extractPageLinks());
        addListener('extractImagesBtn', 'click', () => this.extractPageImages());
        addListener('extractDataBtn', 'click', () => this.extractPageData());
        addListener('screenshotPageBtn', 'click', () => this.capturePageScreenshot());
        
        // File Upload
        addListener('uploadFileBtn', 'click', () => document.getElementById('fileUploadInput').click());
        addListener('fileUploadInput', 'change', (e) => this.handleFileUpload(e));

        // Settings
        addListener('themeSelect', 'change', (e) => this.changeTheme(e.target.value));
        addListener('autoSaveToggle', 'change', (e) => this.toggleAutoSave(e.target.checked));
        addListener('notificationsToggle', 'change', (e) => this.toggleNotifications(e.target.checked));

        // Advanced Settings
        addListener('providerSelect', 'change', (e) => this.changeProvider(e.target.value));
        addListener('aiModelSelect', 'change', (e) => this.changeAiModel(e.target.value));
        addListener('apiEndpointInput', 'input', (e) => this.updateApiEndpoint(e.target.value));
        addListener('contextInput', 'input', (e) => this.updateContext(e.target.value));
        addListener('roleSelect', 'change', (e) => this.updateRole(e.target.value));
        addListener('roleSelect', 'change', () => this.handleCustomRole());
        addListener('temperatureSlider', 'input', (e) => this.updateTemperature(e.target.value));
        addListener('maxTokensInput', 'input', (e) => this.updateMaxTokens(e.target.value));

        // Context and Role Management
        addListener('saveContextBtn', 'click', () => this.saveCurrentContext());
        addListener('loadContextBtn', 'click', () => this.showContextSelector());
        addListener('deleteContextBtn', 'click', () => this.deleteSelectedContext());
        addListener('saveRoleBtn', 'click', () => this.saveCurrentRole());
        addListener('loadRoleBtn', 'click', () => this.showRoleSelector());
        addListener('deleteRoleBtn', 'click', () => this.deleteSelectedRole());

        // Training Scripts Management
        addListener('saveTrainingScriptBtn', 'click', () => this.saveTrainingScript());
        addListener('loadTrainingScriptBtn', 'click', () => this.showTrainingScriptSelector());
        addListener('deleteTrainingScriptBtn', 'click', () => this.deleteTrainingScript());
        addListener('testConnectionBtn', 'click', () => this.testApiConnection());

        // Export/Import
        addListener('exportBtn', 'click', () => this.exportData());
        addListener('importBtn', 'click', () => this.importData());
        addListener('clearDataBtn', 'click', () => this.clearData());

        // Script Library Management
        addListener('addScriptBtn', 'click', () => this.addNewScript());
        addListener('importScriptFileBtn', 'click', () => {
            document.getElementById('importScriptInput').click();
        });
        addListener('importScriptInput', 'change', (e) => this.importScriptFile(e));
        addListener('exportAllScriptsBtn', 'click', () => this.exportAllScripts());
        addListener('scriptSearchInput', 'input', (e) => this.filterScripts(e.target.value));

        // Voice Assistant
        addListener('testMicPermissionBtn', 'click', () => this.testMicrophonePermission());
        addListener('voiceCommandBtn', 'click', () => this.startVoiceCommand());
        addListener('voiceDictationBtn', 'click', () => this.startVoiceDictation());
        addListener('uploadAudioBtn', 'click', () => {
            document.getElementById('audioUploadInput').click();
        });
        addListener('audioUploadInput', 'change', (e) => this.handleAudioUpload(e));
        addListener('recordAudioBtn', 'click', () => this.toggleAudioRecording());
        addListener('toggleTTSBtn', 'click', () => this.toggleTTSButton());

        // Multimodal Capabilities - Image Analysis
        addListener('uploadImageBtn', 'click', () => {
            document.getElementById('imageUploadInput').click();
        });
        addListener('imageUploadInput', 'change', (e) => this.handleImageUpload(e));
        addListener('analyzeImageUrlBtn', 'click', () => this.analyzeImageFromUrl());
        addListener('screenshotAnalyzeBtn', 'click', () => this.screenshotAndAnalyze());
        addListener('editImageAIBtn', 'click', () => this.editImageWithAI());

        // Video Analysis
        addListener('uploadVideoBtn', 'click', () => {
            document.getElementById('videoUploadInput').click();
        });
        addListener('videoUploadInput', 'change', (e) => this.handleVideoUpload(e));
        addListener('analyzeYoutubeBtn', 'click', () => this.analyzeYoutubeVideo());

        // Search & Download
        addListener('searchFileBtn', 'click', () => this.searchAndFindFile());
        addListener('searchAppBtn', 'click', () => this.searchAndFindApp());
        addListener('downloadAssistBtn', 'click', () => this.assistDownload());
        addListener('installAppBtn', 'click', () => this.assistInstall());

        // Page Interaction
        addListener('insertTextBtn', 'click', () => this.insertTextInPage());
        addListener('fillFormBtn', 'click', () => this.fillFormWithAI());
        addListener('clickElementBtn', 'click', () => this.clickElementWithAI());
        addListener('autoNavigateBtn', 'click', () => this.autoNavigateWithAI());

        // Preset scripts
        document.querySelectorAll('.preset-script').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadPresetScript(e.target.dataset.script));
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Chat button
        const chatBtn = document.getElementById('chatBtn');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => this.showChatInterface());
        }

        // Task examples - Correction CSP
        document.querySelectorAll('.task-example').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const task = e.target.closest('.task-example').dataset.task;
                if (task) this.quickGenerate(task);
            });
        });

        // Preset scripts - Correction CSP
        document.querySelectorAll('.preset-script').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.closest('.preset-script').dataset.preset;
                if (preset) this.loadPresetScript(preset);
            });
        });

        // Tab navigation - Utilise .tab au lieu de .tab-btn
        document.querySelectorAll('.tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab || e.target.closest('.tab').dataset.tab;
                if (tabName) this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Hide all tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
            pane.style.display = 'none';
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab pane
        const targetPane = document.getElementById(`${tabName}-tab`);
        if (targetPane) {
            targetPane.classList.add('active');
            targetPane.style.display = 'block';
        }

        // Add active class to selected tab button
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }

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
                // Charger le provider et mettre à jour l'interface
                const providerSelect = document.getElementById('providerSelect');
                if (providerSelect && this.settings.provider) {
                    providerSelect.value = this.settings.provider;
                    // Appliquer la configuration du provider sans notification
                    this.applyProviderConfig(this.settings.provider);
                }
                
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

        this.setProcessing(true);
        this.updateStatus('🔄 Exécution du script...', 'loading');

        try {
            // Envoyer le script au background pour exécution réelle
            const response = await chrome.runtime.sendMessage({
                action: 'executeScript',
                type: this.currentScriptType,
                script: script
            });

            if (response.error) {
                throw new Error(response.error);
            }

            // Afficher le résultat d'exécution
            this.showResult(`✅ SCRIPT EXÉCUTÉ AVEC SUCCÈS\n\n${response.result}`, 'success');
            this.updateStatus('✅ Exécution terminée', 'success');

        } catch (error) {
            this.showResult(`❌ Erreur lors de l'exécution: ${error.message}`, 'error');
            this.updateStatus('❌ Exécution échouée', 'error');
        } finally {
            this.setProcessing(false);
        }
    }

    // Analyser un script avec l'IA (sans l'exécuter)
    async analyzeScript() {
        const script = document.getElementById('scriptInput').value;
        if (!script.trim()) {
            this.showResult('❌ Aucun script à analyser', 'error');
            return;
        }

        if (!this.apiKey) {
            this.showResult('❌ Clé API manquante pour l\'analyse', 'error');
            return;
        }

        this.setProcessing(true);
        this.updateStatus('🔍 Analyse du script...', 'loading');

        try {
            const analysisPrompt = `En tant qu'expert en ${this.currentScriptType}, analysez ce script:

\`\`\`${this.currentScriptType}
${script}
\`\`\`

FOURNISSEZ:
1. 📋 RÉSUMÉ: Fonction principale
2. 🔍 ANALYSE: Fonctionnement détaillé
3. ⚠️  RISQUES: Sécurité, permissions
4. 🚀 RÉSULTAT ATTENDU: Que va-t-il faire ?
5. 🛠️  AMÉLIORATIONS: Optimisations possibles
6. 📊 ÉVALUATION: Note sur 10 (performance, sécurité)`;

            const analysis = await this.callAI(analysisPrompt);
            this.showResult(`🤖 ANALYSE COMPLÈTE\n\n${analysis}`, 'success');
            this.updateStatus('✅ Analyse terminée', 'success');

        } catch (error) {
            this.showResult(`❌ Erreur d'analyse: ${error.message}`, 'error');
            this.updateStatus('❌ Analyse échouée', 'error');
        } finally {
            this.setProcessing(false);
        }
    }

    // Optimiser un script avec l'IA
    async optimizeScript() {
        const script = document.getElementById('scriptInput').value;
        if (!script.trim()) {
            this.showResult('❌ Aucun script à optimiser', 'error');
            return;
        }

        if (!this.apiKey) {
            this.showResult('❌ Clé API manquante', 'error');
            return;
        }

        this.setProcessing(true);
        this.updateStatus('⚡ Optimisation du script...', 'loading');

        try {
            // Envoyer au background pour optimisation avec IA
            const response = await chrome.runtime.sendMessage({
                action: 'aiAssist',
                script: script,
                type: this.currentScriptType,
                aiAction: 'optimize-script',
                apiKey: this.apiKey
            });

            if (response.error) {
                throw new Error(response.error);
            }

            // Mettre à jour l'éditeur avec le script optimisé
            document.getElementById('scriptInput').value = response.result;
            this.showResult('✅ Script optimisé avec succès !', 'success');
            this.updateStatus('✅ Optimisation terminée', 'success');

        } catch (error) {
            this.showResult(`❌ Erreur d'optimisation: ${error.message}`, 'error');
            this.updateStatus('❌ Optimisation échouée', 'error');
        } finally {
            this.setProcessing(false);
        }
    }

    // Déboguer un script avec l'IA
    async debugScript() {
        const script = document.getElementById('scriptInput').value;
        if (!script.trim()) {
            this.showResult('❌ Aucun script à déboguer', 'error');
            return;
        }

        if (!this.apiKey) {
            this.showResult('❌ Clé API manquante', 'error');
            return;
        }

        this.setProcessing(true);
        this.updateStatus('🐛 Débogage du script...', 'loading');

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'aiAssist',
                script: script,
                type: this.currentScriptType,
                aiAction: 'debug-script',
                apiKey: this.apiKey
            });

            if (response.error) {
                throw new Error(response.error);
            }

            this.showResult(`🐛 ANALYSE DE DÉBOGAGE\n\n${response.result}`, 'success');
            this.updateStatus('✅ Débogage terminé', 'success');

        } catch (error) {
            this.showResult(`❌ Erreur de débogage: ${error.message}`, 'error');
            this.updateStatus('❌ Débogage échoué', 'error');
        } finally {
            this.setProcessing(false);
        }
    }

    // ========================================
    // INTERACTION AVEC LA PAGE WEB COURANTE
    // ========================================

    async analyzeCurrentPage() {
        this.updateStatus('🔍 Analyse de la page...', 'loading');
        this.setProcessing(true);

        try {
            // Obtenir l'onglet actif
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('Aucun onglet actif trouvé');
            }

            // Injecter script pour extraire infos de la page
            const pageInfo = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    return {
                        title: document.title,
                        url: window.location.href,
                        textLength: document.body.innerText.length,
                        linksCount: document.querySelectorAll('a').length,
                        imagesCount: document.querySelectorAll('img').length,
                        formsCount: document.querySelectorAll('form').length,
                        scriptsCount: document.querySelectorAll('script').length,
                        metaDescription: document.querySelector('meta[name="description"]')?.content || 'Aucune',
                        headings: {
                            h1: document.querySelectorAll('h1').length,
                            h2: document.querySelectorAll('h2').length,
                            h3: document.querySelectorAll('h3').length
                        }
                    };
                }
            });

            const info = pageInfo[0].result;

            // Si API configurée, demander analyse IA
            if (this.apiKey) {
                const aiAnalysis = await this.callAI(`Analyse cette page web et donne des insights:

URL: ${info.url}
Titre: ${info.title}
Description: ${info.metaDescription}
Contenu: ${info.textLength} caractères
Liens: ${info.linksCount}
Images: ${info.imagesCount}
Formulaires: ${info.formsCount}

Donne une analyse sur:
1. Type de site (blog, e-commerce, portfolio...)
2. Qualité SEO basique
3. Suggestions d'amélioration
4. Opportunités d'automatisation`);

                this.showResult(`🌐 ANALYSE DE LA PAGE\n\n${aiAnalysis}`, 'success');
            } else {
                this.showResult(`🌐 ANALYSE DE LA PAGE

📊 Informations basiques:
• URL: ${info.url}
• Titre: ${info.title}
• Description: ${info.metaDescription}

📈 Statistiques:
• Texte: ${info.textLength.toLocaleString()} caractères
• Liens: ${info.linksCount}
• Images: ${info.imagesCount}
• Formulaires: ${info.formsCount}
• Scripts: ${info.scriptsCount}

🏷️ Structure:
• H1: ${info.headings.h1}
• H2: ${info.headings.h2}
• H3: ${info.headings.h3}

💡 Configurez une clé API pour une analyse IA détaillée !`, 'success');
            }

            this.updateStatus('✅ Analyse terminée', 'success');

        } catch (error) {
            this.showResult(`❌ Erreur d'analyse: ${error.message}`, 'error');
            this.updateStatus('❌ Analyse échouée', 'error');
        } finally {
            this.setProcessing(false);
        }
    }

    async extractPageText() {
        this.updateStatus('📄 Extraction du texte...', 'loading');

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    // Extraire texte principal
                    const main = document.querySelector('main, article, .content, #content') || document.body;
                    return {
                        fullText: main.innerText,
                        paragraphs: Array.from(main.querySelectorAll('p')).map(p => p.innerText),
                        headings: Array.from(main.querySelectorAll('h1, h2, h3')).map(h => ({ 
                            level: h.tagName, 
                            text: h.innerText 
                        }))
                    };
                }
            });

            const data = result[0].result;
            
            // Mettre dans éditeur
            document.getElementById('scriptInput').value = data.fullText;
            
            this.showResult(`📄 TEXTE EXTRAIT

✅ ${data.fullText.length} caractères extraits
📝 ${data.paragraphs.length} paragraphes
🏷️ ${data.headings.length} titres

Le texte a été placé dans l'éditeur.
Vous pouvez maintenant l'analyser ou le traiter avec l'IA !`, 'success');

            this.updateStatus('✅ Texte extrait', 'success');

        } catch (error) {
            this.showResult(`❌ Erreur d'extraction: ${error.message}`, 'error');
        }
    }

    async extractPageLinks() {
        this.updateStatus('🔗 Extraction des liens...', 'loading');

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const links = Array.from(document.querySelectorAll('a[href]'));
                    return links.map(a => ({
                        text: a.innerText.trim().substring(0, 50),
                        href: a.href,
                        isExternal: !a.href.startsWith(window.location.origin)
                    }));
                }
            });

            const links = result[0].result;
            const internal = links.filter(l => !l.isExternal);
            const external = links.filter(l => l.isExternal);

            const linksText = [
                '=== LIENS INTERNES ===',
                ...internal.map(l => `${l.text} → ${l.href}`),
                '',
                '=== LIENS EXTERNES ===',
                ...external.map(l => `${l.text} → ${l.href}`)
            ].join('\n');

            document.getElementById('scriptInput').value = linksText;

            this.showResult(`🔗 LIENS EXTRAITS

✅ Total: ${links.length} liens
🏠 Internes: ${internal.length}
🌐 Externes: ${external.length}

Les liens ont été placés dans l'éditeur.`, 'success');

            this.updateStatus('✅ Liens extraits', 'success');

        } catch (error) {
            this.showResult(`❌ Erreur d'extraction: ${error.message}`, 'error');
        }
    }

    async extractPageImages() {
        this.updateStatus('🖼️ Extraction des images...', 'loading');

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const images = Array.from(document.querySelectorAll('img'));
                    return images.map(img => ({
                        src: img.src,
                        alt: img.alt || 'Sans description',
                        width: img.naturalWidth || img.width,
                        height: img.naturalHeight || img.height
                    }));
                }
            });

            const images = result[0].result;

            const imagesText = images.map((img, i) => 
                `${i + 1}. ${img.alt}\n   URL: ${img.src}\n   Dimensions: ${img.width}x${img.height}px`
            ).join('\n\n');

            document.getElementById('scriptInput').value = imagesText;

            this.showResult(`🖼️ IMAGES EXTRAITES

✅ Total: ${images.length} images
📏 Tailles variées détectées

Les informations des images ont été placées dans l'éditeur.
Vous pouvez générer un script pour les télécharger !`, 'success');

            this.updateStatus('✅ Images extraites', 'success');

        } catch (error) {
            this.showResult(`❌ Erreur d'extraction: ${error.message}`, 'error');
        }
    }

    async extractPageData() {
        this.updateStatus('📊 Extraction des données...', 'loading');

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    // Essayer de trouver des tableaux
                    const tables = Array.from(document.querySelectorAll('table'));
                    const tablesData = tables.map((table, i) => {
                        const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText);
                        const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => 
                            Array.from(tr.querySelectorAll('td')).map(td => td.innerText)
                        );
                        return { tableIndex: i + 1, headers, rows };
                    });

                    // Chercher aussi des listes
                    const lists = Array.from(document.querySelectorAll('ul, ol'));
                    const listsData = lists.slice(0, 5).map((list, i) => ({
                        listIndex: i + 1,
                        type: list.tagName,
                        items: Array.from(list.querySelectorAll('li')).map(li => li.innerText)
                    }));

                    return { tables: tablesData, lists: listsData };
                }
            });

            const data = result[0].result;

            let output = '';

            if (data.tables.length > 0) {
                output += '=== TABLEAUX EXTRAITS ===\n\n';
                data.tables.forEach(table => {
                    output += `Tableau ${table.tableIndex}:\n`;
                    output += `Colonnes: ${table.headers.join(' | ')}\n`;
                    output += `Lignes: ${table.rows.length}\n\n`;
                    table.rows.slice(0, 5).forEach(row => {
                        output += row.join(' | ') + '\n';
                    });
                    output += '\n';
                });
            }

            if (data.lists.length > 0) {
                output += '\n=== LISTES EXTRAITES ===\n\n';
                data.lists.forEach(list => {
                    output += `Liste ${list.listIndex} (${list.type}):\n`;
                    list.items.forEach(item => output += `• ${item}\n`);
                    output += '\n';
                });
            }

            if (output) {
                document.getElementById('scriptInput').value = output;
                this.showResult(`📊 DONNÉES EXTRAITES

✅ Tableaux: ${data.tables.length}
✅ Listes: ${data.lists.length}

Les données structurées ont été placées dans l'éditeur.`, 'success');
            } else {
                this.showResult('⚠️ Aucune donnée structurée trouvée sur cette page.', 'warning');
            }

            this.updateStatus('✅ Extraction terminée', 'success');

        } catch (error) {
            this.showResult(`❌ Erreur d'extraction: ${error.message}`, 'error');
        }
    }

    async capturePageScreenshot() {
        this.updateStatus('📸 Capture de la page...', 'loading');

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const dataUrl = await chrome.tabs.captureVisibleTab(null, {
                format: 'png',
                quality: 100
            });

            // Télécharger l'image
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `screenshot_${Date.now()}.png`;
            a.click();

            this.showResult(`📸 CAPTURE RÉUSSIE

✅ Screenshot sauvegardé !
📁 Nom: screenshot_${Date.now()}.png

L'image a été téléchargée dans votre dossier de téléchargements.`, 'success');

            this.updateStatus('✅ Capture sauvegardée', 'success');

        } catch (error) {
            this.showResult(`❌ Erreur de capture: ${error.message}`, 'error');
        }
    }

    // Upload et analyse de fichiers
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.updateStatus(`📂 Lecture de ${file.name}...`, 'loading');

        try {
            const text = await file.text();
            
            // Afficher nom du fichier
            document.getElementById('uploadedFileName').innerHTML = `
                ✅ Fichier chargé: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(2)} KB)
            `;

            // Mettre contenu dans éditeur
            document.getElementById('scriptInput').value = text;

            // Détection automatique du type
            const extension = file.name.split('.').pop().toLowerCase();
            const typeMap = {
                'ps1': 'powershell',
                'py': 'python',
                'sh': 'bash',
                'js': 'javascript',
                'bat': 'cmd'
            };
            
            if (typeMap[extension]) {
                document.getElementById('scriptTypeSelect').value = typeMap[extension];
                this.currentScriptType = typeMap[extension];
            }

            this.showResult(`📂 FICHIER CHARGÉ

✅ Nom: ${file.name}
📏 Taille: ${(file.size / 1024).toFixed(2)} KB
🔤 Lignes: ${text.split('\n').length}
📝 Type: ${extension.toUpperCase()}

Le contenu est dans l'éditeur. 
Vous pouvez maintenant l'analyser, l'optimiser ou le déboguer avec l'IA !`, 'success');

            this.updateStatus('✅ Fichier chargé', 'success');

        } catch (error) {
            this.showResult(`❌ Erreur de lecture: ${error.message}`, 'error');
            this.updateStatus('❌ Échec du chargement', 'error');
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
        
        // Si les éléments n'existent pas, utiliser console.log
        if (!statusIcon || !statusText) {
            const icons = {
                success: '🟢',
                error: '🔴',
                warning: '🟡',
                loading: '🔄',
                info: 'ℹ️'
            };
            console.log(`${icons[type] || icons.info} ${message}`);
            return;
        }
        
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
Write-Host "\n🔥 Top 5 processus (CPU):" -ForegroundColor Yellow
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
    print("\n🔥 Top 5 processus (CPU):")
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

    applyProviderConfig(provider) {
        const config = this.providerConfigs[provider];
        if (!config) return;
        
        // Mettre à jour le label de la clé API
        const apiKeyLabel = document.getElementById('apiKeyLabel');
        const apiKeyInput = document.getElementById('apiKeyInput');
        
        if (apiKeyLabel && config) {
            apiKeyLabel.textContent = config.apiKeyLabel + ' :';
            apiKeyInput.placeholder = config.placeholder;
        }
        
        // Afficher/masquer les groupes de modèles
        const allOptgroups = ['deepseek-models', 'openai-models', 'anthropic-models', 'google-models', 'groq-models'];
        allOptgroups.forEach(id => {
            const optgroup = document.getElementById(id);
            if (optgroup) {
                optgroup.style.display = 'none';
            }
        });
        
        // Afficher le bon groupe de modèles
        const targetOptgroup = document.getElementById(`${provider}-models`);
        if (targetOptgroup) {
            targetOptgroup.style.display = 'block';
        }
    }

    changeProvider(provider) {
        this.settings.provider = provider;
        const config = this.providerConfigs[provider];
        
        // Appliquer la configuration
        this.applyProviderConfig(provider);
        
        // Mettre à jour l'endpoint
        const endpointInput = document.getElementById('apiEndpointInput');
        if (endpointInput && config) {
            endpointInput.value = config.endpoint;
            this.settings.apiEndpoint = config.endpoint;
        }
        
        // Sélectionner le premier modèle du provider
        if (config.models && config.models.length > 0) {
            this.settings.aiModel = config.models[0];
            document.getElementById('aiModelSelect').value = config.models[0];
        }
        
        this.saveSettings();
        this.showResult(`✅ Provider changé vers: ${config.name}`, 'success');
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
                    <button class="close-btn" id="closeTaskModal">✕</button>
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
                            <div class="example-item" data-text="Organiser mes fichiers de téléchargement par type">
                                "Organiser mes fichiers de téléchargement par type"
                            </div>
                            <div class="example-item" data-text="Sauvegarder automatiquement mes dossiers importants">
                                "Sauvegarder automatiquement mes dossiers importants"
                            </div>
                            <div class="example-item" data-text="Extraire des données d'un site web">
                                "Extraire des données d'un site web"
                            </div>
                            <div class="example-item" data-text="Nettoyer les fichiers temporaires du système">
                                "Nettoyer les fichiers temporaires du système"
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelTaskModal">Annuler</button>
                    <button class="btn btn-primary" id="generateTaskBtn">🚀 Générer Script</button>
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
        
        // Ajouter les event listeners après que le modal soit dans le DOM
        setTimeout(() => {
            const closeBtn = document.getElementById('closeTaskModal');
            const cancelBtn = document.getElementById('cancelTaskModal');
            const generateBtn = document.getElementById('generateTaskBtn');
            const examples = document.querySelectorAll('.example-item');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => modal.remove());
            }
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => modal.remove());
            }
            if (generateBtn) {
                generateBtn.addEventListener('click', () => this.generateFromModal());
            }
            
            // Event listeners pour les exemples
            examples.forEach(example => {
                example.addEventListener('click', () => {
                    const taskDesc = document.getElementById('taskDescription');
                    if (taskDesc) {
                        taskDesc.value = example.dataset.text;
                    }
                });
            });
        }, 0);
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
                    <button class="close-chat" id="closeChatModal">✕</button>
                </div>
                
                <div class="chat-messages" id="chatMessages">
                    <div class="message assistant">
                        <div class="avatar">🤖</div>
                        <div class="content">
                            <p>Salut ! Je suis XYPH, votre assistant IA personnel. 👋</p>
                            <p>Je peux vous aider à :</p>
                            <ul>
                                <li>🔧 Générer des scripts automatisés</li>
                                <li>🔍 Analyser et optimiser du code</li>
                                <li>📊 Traiter et analyser des données</li>
                                <li>�️ Sécuriser votre système</li>
                                <li>� Résoudre des problèmes techniques</li>
                            </ul>
                            <p>Que puis-je faire pour vous aujourd'hui ?</p>
                        </div>
                    </div>
                </div>
                
                <div class="chat-suggestions">
                    <button class="suggestion-btn" data-message="Comment organiser mes fichiers automatiquement ?">
                        📁 Organiser mes fichiers
                    </button>
                    <button class="suggestion-btn" data-message="Peux-tu m'aider à créer un script de sauvegarde ?">
                        � Script sauvegarde
                    </button>
                    <button class="suggestion-btn" data-message="Comment automatiser des tâches répétitives ?">
                        ⚡ Automatisation
                    </button>
                    <button class="suggestion-btn" data-message="Montre-moi des exemples de scripts">
                        📚 Exemples
                    </button>
                </div>
                
                <div class="chat-input-container">
                    <div class="input-wrapper">
                        <button id="chatVoiceBtn" class="voice-btn" title="🎤 Commande vocale">
                            🎤
                        </button>
                        <textarea id="chatInput" placeholder="Tapez votre message... (Shift+Entrée pour nouvelle ligne)" rows="1"></textarea>
                        <button id="sendChatBtn">
                            <span class="send-icon">📤</span>
                        </button>
                    </div>
                    <div class="quick-actions">
                        <button class="quick-action-btn" data-message="Aide">❓ Aide</button>
                        <button class="quick-action-btn" data-message="Exemples">💡 Exemples</button>
                        <button class="quick-action-btn" data-message="Paramètres">⚙️ Config</button>
                        <button id="clearChatHistoryBtn" class="quick-action-btn" style="background: #ef4444;">🗑️ Effacer historique</button>
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
            
            .voice-btn {
                background: var(--secondary-color, #764ba2);
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                font-size: 18px;
            }
            
            .voice-btn:hover {
                background: #5a3a7a;
                transform: scale(1.05);
            }
            
            .voice-btn.listening {
                background: #ef4444;
                animation: pulse 1s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
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
        
        // Event listeners après que le modal soit dans le DOM
        setTimeout(() => {
            // Bouton fermer
            const closeBtn = document.getElementById('closeChatModal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => chatModal.remove());
            }
            
            // Bouton vocal dans le chat
            const chatVoiceBtn = document.getElementById('chatVoiceBtn');
            if (chatVoiceBtn) {
                chatVoiceBtn.addEventListener('click', () => this.startChatVoiceInput());
            }
            
            // Bouton envoyer
            const sendBtn = document.getElementById('sendChatBtn');
            if (sendBtn) {
                sendBtn.addEventListener('click', () => this.sendChatMessage());
            }
            
            // Boutons de suggestions
            const suggestionBtns = chatModal.querySelectorAll('.suggestion-btn');
            suggestionBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const message = btn.dataset.message;
                    if (message) this.sendChatMessage(message);
                });
            });
            
            // Boutons d'actions rapides
            const quickActionBtns = chatModal.querySelectorAll('.quick-action-btn');
            quickActionBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const message = btn.dataset.message;
                    if (message) this.sendChatMessage(message);
                });
            });
            
            // Bouton effacer historique
            const clearHistoryBtn = document.getElementById('clearChatHistoryBtn');
            if (clearHistoryBtn) {
                clearHistoryBtn.addEventListener('click', () => {
                    if (confirm('Effacer l\'historique de conversation?')) {
                        this.clearChatHistory();
                    }
                });
            }
            
            // Auto-resize du textarea
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
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
        }, 0);
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
            
            // 🔊 XYPH PARLE LA RÉPONSE (dans le chat aussi)
            this.speakResponse(response);
            
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
        // Si on a une clé API, TOUJOURS utiliser l'IA pour répondre naturellement
        if (this.apiKey) {
            try {
                return await this.generateAIResponse(message);
            } catch (error) {
                console.error('AI chat error:', error);
                // Si l'IA échoue, utiliser réponses de secours
                return this.getFallbackResponse(message);
            }
        }
        
        // Pas de clé API : réponses contextuelles basiques
        return this.getFallbackResponse(message);
    }

    getFallbackResponse(message) {
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
        
        // Réponse par défaut si aucun mot-clé
        return `Je comprends que vous voulez "${message}". Voici ce que je peux faire :

🔧 **Scripts automatisés** - Générer des scripts PowerShell, Python, Bash
🖼️ **Traitement d'images** - Analyser, retoucher, optimiser vos images  
🎬 **Édition vidéo** - Convertir, découper, améliorer vos vidéos
📊 **Analyse de données** - Extraire et traiter des informations
🔍 **Recherche intelligente** - Chercher et organiser l'information

⚠️ **Clé API manquante** - Configurez votre clé DeepSeek dans les Paramètres pour des conversations naturelles !`;
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
            // Contexte système pour le chat avec historique
            const chatSystemContext = `Tu es XYPH, un assistant IA ami et expert en automatisation. Tu discutes naturellement avec l'utilisateur comme un vrai assistant conversationnel.

CAPACITÉS:
- Générer scripts (PowerShell, Python, Bash, JavaScript, CMD)
- Traiter images et vidéos
- Automatiser tâches Chrome et système
- Analyser et optimiser du code
- Donner des conseils techniques

STYLE DE CONVERSATION:
- Naturel et amical comme un vrai assistant
- Utilise des emojis avec modération 😊
- Pose des questions de clarification si besoin
- Donne des réponses concises mais complètes
- Si demande technique: propose solutions concrètes
- Tu as accès à l'HISTORIQUE de la conversation, utilise-le pour rester contextuel

IMPORTANT: 
- Si c'est juste une salutation ou discussion générale, réponds naturellement
- Si c'est une demande technique, demande plus de détails ou propose directement une solution
- Reste toujours dans ton rôle d'assistant XYPH mais sois conversationnel
- Réfère-toi aux messages précédents quand c'est pertinent`;

            // Appeler l'API avec l'historique activé (useHistory = true)
            const response = await this.callAI(message, chatSystemContext, true);
            
            // Sauvegarder le message utilisateur et la réponse dans l'historique
            this.addToChatHistory('user', message);
            this.addToChatHistory('assistant', response);
            
            return response || "Je suis là pour t'aider ! Que puis-je faire pour toi ? 😊";
            
        } catch (error) {
            console.error('AI response error:', error);
            return `Oups, petit problème de connexion ! 😅 

Mais je suis toujours là ! Voici ce que je peux faire:

🔧 **Générer des scripts** - PowerShell, Python, Bash, JS
� **Analyser ton code** - Optimisation et débogage
🖼️ **Traiter des images/vidéos** - Automatisation
� **Discuter** - Conseils et solutions techniques

De quoi as-tu besoin ?`;
        }
    }

    // Méthode pour appeler l'API IA
    async callAI(prompt, systemContext = null, useHistory = false) {
        if (!this.apiKey) {
            throw new Error('Clé API manquante. Configurez votre clé dans les Paramètres.');
        }

        try {
            // Forcer le contexte français si non spécifié
            const finalContext = systemContext || this.settings.context;
            const frenchEnforcedContext = finalContext + '\n\nIMPORTANT: Vous DEVEZ répondre UNIQUEMENT en FRANÇAIS. Jamais en anglais ou autre langue.';
            
            // Construire les messages avec ou sans historique
            let messages = [
                {
                    role: 'system',
                    content: frenchEnforcedContext
                }
            ];

            // Si useHistory = true, ajouter l'historique avant le nouveau message
            if (useHistory && this.chatHistory.length > 0) {
                messages = messages.concat(this.chatHistory);
            }

            // Ajouter le nouveau message utilisateur
            messages.push({
                role: 'user',
                content: prompt
            });

            const requestBody = JSON.stringify({
                model: this.settings.aiModel,
                messages: messages,
                max_tokens: this.settings.maxTokens,
                temperature: this.settings.temperature
            });
            const requestHeaders = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            };

            // Retry loop with exponential backoff for transient failures
            const MAX_RETRIES = 2;
            let lastError;
            for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
                if (attempt > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
                }
                try {
                    const response = await this._fetchWithTimeout(
                        this.settings.apiEndpoint,
                        { method: 'POST', headers: requestHeaders, body: requestBody }
                    );

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        const err = new Error(`API Error ${response.status}: ${errorData.error?.message || 'Erreur inconnue'}`);
                        if ((response.status === 429 || response.status === 503) && attempt < MAX_RETRIES) {
                            lastError = err;
                            continue;
                        }
                        throw err;
                    }

                    const data = await response.json();
                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        return data.choices[0].message.content;
                    } else {
                        throw new Error('Format de réponse API invalide');
                    }
                } catch (err) {
                    const retryable = err.name === 'AbortError' || err.name === 'TypeError';
                    if (retryable && attempt < MAX_RETRIES) {
                        lastError = err;
                        continue;
                    }
                    throw err;
                }
            }
            throw lastError;

        } catch (error) {
            console.error('callAI error:', error);
            throw error;
        }
    }

    /**
     * Wraps fetch() with an AbortController deadline (default 30 s).
     * Prevents API calls from hanging indefinitely.
     * @param {string} url
     * @param {Object} options  — standard fetch init options
     * @param {number} [timeoutMs=30000]
     * @returns {Promise<Response>}
     */
    _fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        return fetch(url, { ...options, signal: controller.signal })
            .finally(() => clearTimeout(timeoutId));
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
            this.showResult(`📁 Script "${scriptKey}" chargé en ${this.currentScriptType}\n\n🤖 Script optimisé par l'agent IA avec fonctionnalités avancées`, 'success');
        }
    }

    // ==================== SCRIPT LIBRARY MANAGEMENT ====================

    async loadScriptLibrary() {
        const result = await chrome.storage.sync.get(['scriptLibrary']);
        if (result.scriptLibrary) {
            this.scriptLibrary = result.scriptLibrary;
        }
        this.renderScriptLibrary();
    }

    async saveScriptLibrary() {
        await chrome.storage.sync.set({ scriptLibrary: this.scriptLibrary });
    }

    renderScriptLibrary() {
        const container = document.getElementById('scriptLibraryList');
        if (!container) return;

        if (this.scriptLibrary.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-gray);">
                    <p style="font-size: 48px; margin-bottom: 10px;">📝</p>
                    <p>Aucun script sauvegardé</p>
                    <p style="font-size: 12px; margin-top: 10px;">Cliquez sur "➕ Nouveau Script" ou "📂 Importer Fichier"</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.scriptLibrary.map((script, index) => `
            <div class="script-card" data-index="${index}">
                <div class="script-card-header">
                    <div class="script-card-title">
                        ${this.getScriptIcon(script.type)}
                        ${script.name}
                        <span class="script-card-type">${script.type.toUpperCase()}</span>
                    </div>
                </div>
                <div class="script-card-meta">
                    📅 ${new Date(script.createdAt).toLocaleDateString('fr-FR')} • 
                    ${script.content.split('\n').length} lignes
                </div>
                ${script.description ? `<div class="script-card-description">${script.description}</div>` : ''}
                <div class="script-card-actions">
                    <button class="btn-load" onclick="scriptCommander.loadScriptToEditor(${index})">
                        ⚡ Charger
                    </button>
                    <button class="btn-edit" onclick="scriptCommander.editScript(${index})">
                        ✏️ Modifier
                    </button>
                    <button class="btn-duplicate" onclick="scriptCommander.duplicateScript(${index})">
                        📋 Dupliquer
                    </button>
                    <button class="btn-delete" onclick="scriptCommander.deleteScript(${index})">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `).join('');
    }

    getScriptIcon(type) {
        const icons = {
            'powershell': '⚡',
            'python': '🐍',
            'bash': '🐚',
            'javascript': '📜',
            'batch': '💻'
        };
        return icons[type] || '📝';
    }

    async addNewScript() {
        const name = prompt('Nom du script:');
        if (!name) return;

        const description = prompt('Description (optionnelle):') || '';
        const content = document.getElementById('scriptInput').value;

        if (!content.trim()) {
            this.showResult('❌ Aucun script dans l\'éditeur', 'error');
            return;
        }

        const newScript = {
            id: Date.now(),
            name: name,
            description: description,
            type: this.currentScriptType,
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.scriptLibrary.unshift(newScript);
        await this.saveScriptLibrary();
        this.renderScriptLibrary();
        this.showResult(`✅ Script "${name}" ajouté à la bibliothèque`, 'success');
    }

    async importScriptFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
            const fileName = file.name;
            const extension = fileName.split('.').pop().toLowerCase();

            const typeMap = {
                'ps1': 'powershell',
                'py': 'python',
                'sh': 'bash',
                'js': 'javascript',
                'bat': 'batch',
                'cmd': 'batch'
            };

            const scriptType = typeMap[extension] || 'powershell';

            const newScript = {
                id: Date.now(),
                name: fileName,
                description: `Importé depuis ${fileName}`,
                type: scriptType,
                content: content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.scriptLibrary.unshift(newScript);
            await this.saveScriptLibrary();
            this.renderScriptLibrary();
            this.showResult(`✅ Fichier "${fileName}" importé (${content.length} caractères)`, 'success');
        };

        reader.readAsText(file);
        event.target.value = ''; // Reset input
    }

    loadScriptToEditor(index) {
        const script = this.scriptLibrary[index];
        if (!script) return;

        document.getElementById('scriptInput').value = script.content;
        document.getElementById('scriptTypeSelect').value = script.type;
        this.currentScriptType = script.type;

        // Basculer vers l'onglet Agent IA
        this.switchTab('executor');
        this.showResult(`✅ Script "${script.name}" chargé dans l'éditeur`, 'success');
    }

    async editScript(index) {
        const script = this.scriptLibrary[index];
        if (!script) return;

        const newName = prompt('Nouveau nom:', script.name);
        if (!newName) return;

        const newDescription = prompt('Nouvelle description:', script.description);

        script.name = newName;
        script.description = newDescription || '';
        script.updatedAt = new Date().toISOString();

        await this.saveScriptLibrary();
        this.renderScriptLibrary();
        this.showResult(`✅ Script "${newName}" modifié`, 'success');
    }

    async duplicateScript(index) {
        const script = this.scriptLibrary[index];
        if (!script) return;

        const duplicate = {
            ...script,
            id: Date.now(),
            name: script.name + ' (Copie)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.scriptLibrary.unshift(duplicate);
        await this.saveScriptLibrary();
        this.renderScriptLibrary();
        this.showResult(`✅ Script "${script.name}" dupliqué`, 'success');
    }

    async deleteScript(index) {
        const script = this.scriptLibrary[index];
        if (!script) return;

        if (!confirm(`Supprimer le script "${script.name}" ?`)) return;

        this.scriptLibrary.splice(index, 1);
        await this.saveScriptLibrary();
        this.renderScriptLibrary();
        this.showResult(`🗑️ Script "${script.name}" supprimé`, 'info');
    }

    async exportAllScripts() {
        if (this.scriptLibrary.length === 0) {
            this.showResult('❌ Aucun script à exporter', 'error');
            return;
        }

        const dataStr = JSON.stringify(this.scriptLibrary, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `airon-scripts-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        this.showResult(`💾 ${this.scriptLibrary.length} scripts exportés`, 'success');
    }

    filterScripts(searchTerm) {
        const cards = document.querySelectorAll('.script-card');
        const term = searchTerm.toLowerCase();

        cards.forEach(card => {
            const index = parseInt(card.dataset.index);
            const script = this.scriptLibrary[index];
            
            const matches = 
                script.name.toLowerCase().includes(term) ||
                script.description.toLowerCase().includes(term) ||
                script.type.toLowerCase().includes(term) ||
                script.content.toLowerCase().includes(term);

            card.style.display = matches ? 'block' : 'none';
        });
    }

    // ==================== MULTIMODAL CAPABILITIES ====================

    // IMAGE ANALYSIS
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageData = e.target.result;
            
            // Afficher preview
            const preview = document.getElementById('imagePreview');
            const img = document.getElementById('previewImg');
            img.src = imageData;
            preview.style.display = 'block';

            // Analyser avec IA
            await this.analyzeImage(imageData, file.name);
        };
        reader.readAsDataURL(file);
    }

    async analyzeImage(imageData, fileName) {
        if (!this.apiKey) {
            this.showResult('❌ Clé API requise pour analyser les images', 'error');
            return;
        }

        this.updateStatus('🔍 Analyse de l\'image en cours...', 'info');
        
        const prompt = `Analyse cette image en détail. Décris:
1. Le contenu principal et les éléments visibles
2. Les couleurs dominantes et l'ambiance
3. La qualité et les aspects techniques
4. Des suggestions d'amélioration si applicable
5. Usage potentiel ou contexte`;

        try {
            const response = await this.callAI(prompt, {
                image: imageData,
                model: 'gpt-4-vision' // ou deepseek-vl si disponible
            });

            this.showResult(`📸 Analyse de "${fileName}":\n\n${response}`, 'success');
        } catch (error) {
            this.showResult(`❌ Erreur d'analyse: ${error.message}`, 'error');
        }
    }

    async analyzeImageFromUrl() {
        const url = prompt('URL de l\'image à analyser:');
        if (!url) return;

        this.updateStatus('📥 Téléchargement image...', 'info');
        
        try {
            // Télécharger l'image
            const response = await fetch(url);
            const blob = await response.blob();
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                await this.analyzeImage(e.target.result, url);
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            this.showResult(`❌ Impossible de charger l'image: ${error.message}`, 'error');
        }
    }

    async screenshotAndAnalyze() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
            
            await this.analyzeImage(screenshot, 'Screenshot');
        } catch (error) {
            this.showResult(`❌ Erreur screenshot: ${error.message}`, 'error');
        }
    }

    async editImageWithAI() {
        const instruction = prompt('Quelle modification voulez-vous apporter à l\'image?\n\nExemples:\n- Rendre le fond transparent\n- Améliorer la luminosité\n- Supprimer l\'arrière-plan\n- Changer les couleurs\n- Ajouter un effet');
        if (!instruction) return;

        this.updateStatus('✨ Édition IA en cours...', 'info');
        this.showResult('🔧 Fonction d\'édition d\'image avec IA en développement. Vous pouvez utiliser DALL-E 3 ou Midjourney via leurs APIs pour l\'instant.', 'info');
    }

    // VIDEO ANALYSIS
    async handleVideoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.updateStatus('🎬 Analyse vidéo...', 'info');
        
        const duration = await this.getVideoDuration(file);
        const size = (file.size / (1024 * 1024)).toFixed(2);

        this.showResult(`📹 Vidéo chargée:\n\nNom: ${file.name}\nTaille: ${size} MB\nDurée: ${duration}s\n\n🔧 L'analyse détaillée avec IA sera disponible prochainement.\nPour l'instant, vous pouvez utiliser des services comme Video Intelligence API de Google.`, 'info');
    }

    async getVideoDuration(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(Math.floor(video.duration));
            };
            
            video.src = URL.createObjectURL(file);
        });
    }

    async analyzeYoutubeVideo() {
        const url = prompt('URL YouTube à analyser:');
        if (!url) return;

        const videoId = this.extractYoutubeId(url);
        if (!videoId) {
            this.showResult('❌ URL YouTube invalide', 'error');
            return;
        }

        this.updateStatus('🎥 Analyse YouTube en cours...', 'info');
        
        const prompt = `Analyse la vidéo YouTube: ${url}\n\nDonne-moi:\n1. Titre et description\n2. Durée estimée\n3. Thématique principale\n4. Points clés à retenir\n5. Public cible`;

        const response = await this.callAI(prompt);
        this.showResult(`▶️ Analyse YouTube:\n\n${response}`, 'success');
    }

    extractYoutubeId(url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        return match ? match[1] : null;
    }

    // SEARCH & DOWNLOAD
    async searchAndFindFile() {
        const query = prompt('Quel fichier recherchez-vous?\n\nExemple: Document Excel budget 2024');
        if (!query) return;

        this.updateStatus('🔍 Recherche en cours...', 'info');

        const prompt = `Je cherche un fichier: "${query}"\n\nAide-moi à:\n1. Identifier le type de fichier exact\n2. Suggérer des emplacements probables (Téléchargements, Documents, Bureau, etc.)\n3. Proposer une commande PowerShell pour le trouver\n4. Donner des alternatives si introuvable`;

        const response = await this.callAI(prompt);
        this.showResult(`🔍 Résultats de recherche:\n\n${response}`, 'success');
    }

    async searchAndFindApp() {
        const appName = prompt('Quelle application cherchez-vous?\n\nExemple: Éditeur vidéo gratuit');
        if (!appName) return;

        this.updateStatus('💻 Recherche application...', 'info');

        const prompt = `Je cherche une application: "${appName}"\n\nRecommande-moi:\n1. Les 3 meilleures options gratuites\n2. Leurs fonctionnalités principales\n3. Liens de téléchargement officiels\n4. Configuration système requise\n5. Alternatives si nécessaire`;

        const response = await this.callAI(prompt);
        this.showResult(`💻 Applications recommandées:\n\n${response}`, 'success');
    }

    async assistDownload() {
        const fileUrl = prompt('URL du fichier à télécharger:');
        if (!fileUrl) return;

        try {
            const fileName = fileUrl.split('/').pop() || 'download';
            
            // Utiliser l'API Chrome Downloads
            chrome.downloads.download({
                url: fileUrl,
                filename: fileName,
                saveAs: true
            }, (downloadId) => {
                if (downloadId) {
                    this.showResult(`✅ Téléchargement démarré: ${fileName}`, 'success');
                } else {
                    this.showResult('❌ Erreur de téléchargement', 'error');
                }
            });
        } catch (error) {
            this.showResult(`❌ Erreur: ${error.message}`, 'error');
        }
    }

    async assistInstall() {
        const appName = prompt('Quelle application souhaitez-vous installer?');
        if (!appName) return;

        const prompt = `Guide-moi pour installer: "${appName}"\n\nFournis:\n1. Lien de téléchargement officiel sécurisé\n2. Étapes d'installation détaillées\n3. Configuration recommandée\n4. Script PowerShell d'installation automatique si possible\n5. Vérifications post-installation`;

        const response = await this.callAI(prompt);
        this.showResult(`📦 Guide d'installation:\n\n${response}`, 'success');
    }

    // PAGE INTERACTION
    async insertTextInPage() {
        const text = prompt('Texte à insérer dans la page:');
        if (!text) return;

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (textToInsert) => {
                    // Trouver le champ actif ou le premier input/textarea
                    let target = document.activeElement;
                    
                    if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) {
                        target = document.querySelector('input[type="text"], textarea, [contenteditable="true"]');
                    }

                    if (target) {
                        if (target.contentEditable === 'true') {
                            target.textContent = textToInsert;
                        } else {
                            target.value = textToInsert;
                        }
                        target.dispatchEvent(new Event('input', { bubbles: true }));
                        return `✅ Texte inséré dans ${target.tagName}`;
                    } else {
                        return '❌ Aucun champ de texte trouvé';
                    }
                },
                args: [text]
            }).then(results => {
                this.showResult(results[0].result, 'success');
            });
        } catch (error) {
            this.showResult(`❌ Erreur: ${error.message}`, 'error');
        }
    }

    async fillFormWithAI() {
        const data = prompt('Données du formulaire (format JSON):\n\nExemple:\n{"nom": "Dupont", "email": "test@example.com"}');
        if (!data) return;

        try {
            const formData = JSON.parse(data);
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (dataObj) => {
                    let filled = 0;
                    
                    Object.entries(dataObj).forEach(([key, value]) => {
                        // Chercher par name, id, placeholder
                        const input = document.querySelector(
                            `input[name="${key}"], input[id="${key}"], textarea[name="${key}"], [name*="${key}"]`
                        );
                        
                        if (input) {
                            input.value = value;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            filled++;
                        }
                    });

                    return `✅ ${filled} champ(s) rempli(s)`;
                },
                args: [formData]
            }).then(results => {
                this.showResult(results[0].result, 'success');
            });
        } catch (error) {
            this.showResult(`❌ Erreur: ${error.message}`, 'error');
        }
    }

    async clickElementWithAI() {
        const selector = prompt('Élément à cliquer (CSS selector ou texte):\n\nExemples:\n- #submit-button\n- .btn-primary\n- Soumettre');
        if (!selector) return;

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (sel) => {
                    let element = document.querySelector(sel);
                    
                    // Si pas trouvé par CSS, chercher par texte
                    if (!element) {
                        const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
                        element = buttons.find(btn => btn.textContent.trim().includes(sel));
                    }

                    if (element) {
                        element.click();
                        return `✅ Cliqué sur: ${element.tagName} "${element.textContent?.substring(0, 30)}"`;
                    } else {
                        return '❌ Élément non trouvé';
                    }
                },
                args: [selector]
            }).then(results => {
                this.showResult(results[0].result, 'success');
            });
        } catch (error) {
            this.showResult(`❌ Erreur: ${error.message}`, 'error');
        }
    }

    async autoNavigateWithAI() {
        const task = prompt('Tâche de navigation automatique:\n\nExemples:\n- Aller sur la page de connexion\n- Chercher "laptop" et ouvrir le premier résultat\n- Remplir le formulaire de contact');
        if (!task) return;

        const prompt = `Tâche de navigation web: "${task}"\n\nGénère un script JavaScript pour:\n1. Analyser la page actuelle\n2. Trouver les éléments nécessaires\n3. Exécuter les actions (clic, saisie, navigation)\n4. Gérer les erreurs\n\nFormat: Code JavaScript exécutable directement`;

        const response = await this.callAI(prompt);
        
        // Proposer d'exécuter le script
        if (confirm('Script de navigation généré. Voulez-vous l\'exécuter?\n\n' + response.substring(0, 200) + '...')) {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: new Function(response)
                });
                this.showResult('✅ Navigation automatique exécutée', 'success');
            } catch (error) {
                this.showResult(`❌ Erreur d'exécution: ${error.message}`, 'error');
            }
        } else {
            this.showResult(`🤖 Script généré:\n\n${response}`, 'info');
        }
    }

    // ============================================
    // VOICE ASSISTANT METHODS
    // ============================================

    async testMicrophonePermission() {
        this.updateStatus('🎤 Test du microphone...', 'info');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Succès! Permission accordée
            this.showResult(
                '✅ MICROPHONE AUTORISÉ!\n\n' +
                '🎤 Votre microphone fonctionne correctement.\n' +
                'Vous pouvez maintenant utiliser:\n\n' +
                '• Commande Vocale\n' +
                '• Dictée\n' +
                '• Enregistrement Audio\n\n' +
                '✨ Testez maintenant "🎤 Commande Vocale"!',
                'success'
            );
            
            // Arrêter le stream
            stream.getTracks().forEach(track => track.stop());
            
            // Changer le bouton en vert
            const btn = document.getElementById('testMicPermissionBtn');
            if (btn) {
                btn.textContent = '✅ Micro OK';
                btn.style.background = '#10b981';
            }
            
        } catch (error) {
            console.error('Permission micro refusée:', error);
            
            this.showResult(
                '❌ MICROPHONE BLOQUÉ!\n\n' +
                '🔧 Pour débloquer:\n\n' +
                '1. Regardez la barre d\'adresse Chrome\n' +
                '2. Cliquez sur l\'icône 🔒 ou ⓘ\n' +
                '3. Trouvez "Microphone"\n' +
                '4. Sélectionnez "Autoriser"\n' +
                '5. Rechargez cette page (F5)\n' +
                '6. Recliquez "✓ Tester Micro"\n\n' +
                '💡 Astuce: Chrome va vous demander "Autoriser l\'accès au micro?" → Cliquez AUTORISER!',
                'error'
            );
        }
    }

    async startChatVoiceInput() {
        const chatVoiceBtn = document.getElementById('chatVoiceBtn');
        const chatInput = document.getElementById('chatInput');
        
        if (!chatVoiceBtn || !chatInput) return;
        
        if (!this.recognition) {
            this.recognition = this.initSpeechRecognition();
            if (!this.recognition) return;
        }

        if (this.isListening) {
            this.stopVoiceRecognition();
            chatVoiceBtn.classList.remove('listening');
            chatVoiceBtn.textContent = '🎤';
            return;
        }

        chatVoiceBtn.classList.add('listening');
        chatVoiceBtn.textContent = '⏸️';
        this.isListening = true;

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            
            chatVoiceBtn.classList.remove('listening');
            chatVoiceBtn.textContent = '🎤';
            this.isListening = false;
            
            // Auto-envoyer après 1 seconde
            setTimeout(() => {
                this.sendChatMessage();
            }, 1000);
        };

        this.recognition.onerror = (event) => {
            console.error('Erreur reconnaissance vocale:', event.error);
            chatVoiceBtn.classList.remove('listening');
            chatVoiceBtn.textContent = '🎤';
            this.isListening = false;
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                chatVoiceBtn.classList.remove('listening');
                chatVoiceBtn.textContent = '🎤';
                this.isListening = false;
            }
        };

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Erreur démarrage reconnaissance:', error);
            chatVoiceBtn.classList.remove('listening');
            chatVoiceBtn.textContent = '🎤';
            this.isListening = false;
        }
    }

    initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showResult('❌ La reconnaissance vocale n\'est pas supportée par ce navigateur.\nUtilisez Chrome, Edge ou Safari.', 'error');
            return null;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'fr-FR';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        return recognition;
    }

    async startVoiceCommand() {
        // D'abord demander permission microphone AVANT d'initialiser la reconnaissance
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); // Libérer immédiatement
        } catch (error) {
            this.showResult(
                '❌ Permission microphone requise!\n\n' +
                'Pour utiliser la commande vocale:\n' +
                '1. Cliquez sur 🔒 (cadenas) dans la barre d\'adresse\n' +
                '2. Trouvez "Microphone"\n' +
                '3. Sélectionnez "Autoriser"\n' +
                '4. Rechargez cette page (F5)\n' +
                '5. Réessayez la commande vocale\n\n' +
                'OU\n\n' +
                'Chrome → Paramètres → Confidentialité → Microphone → Autoriser cette extension',
                'error'
            );
            return;
        }
        
        if (!this.recognition) {
            this.recognition = this.initSpeechRecognition();
            if (!this.recognition) return;
        }

        if (this.isListening) {
            this.stopVoiceRecognition();
            return;
        }

        const voiceStatus = document.getElementById('voiceStatus');
        const voiceStatusText = document.getElementById('voiceStatusText');
        
        voiceStatus.style.display = 'block';
        voiceStatusText.textContent = '🎤 Écoute... Dites votre commande';
        
        this.isListening = true;
        document.getElementById('voiceCommandBtn').textContent = '⏸️ Arrêter';
        document.getElementById('voiceCommandBtn').classList.add('btn-danger');

        this.recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            voiceStatusText.textContent = `📝 Commande reçue: "${transcript}"`;
            
            // Analyser la commande vocale
            await this.processVoiceCommand(transcript);
            
            setTimeout(() => {
                voiceStatus.style.display = 'none';
                this.stopVoiceRecognition();
            }, 2000);
        };

        this.recognition.onerror = (event) => {
            console.error('Erreur de reconnaissance vocale:', event.error);
            
            const voiceStatusElem = document.getElementById('voiceStatus');
            const voiceStatusTextElem = document.getElementById('voiceStatusText');
            
            if (voiceStatusElem && voiceStatusTextElem) {
                voiceStatusTextElem.textContent = `❌ Erreur: ${event.error}`;
            }
            
            // Message explicite selon l'erreur
            if (event.error === 'not-allowed') {
                this.showResult('❌ Permission microphone refusée!\n\nAutorisez le microphone dans Chrome:\n1. Clic sur 🔒 dans la barre d\'adresse\n2. Microphone → Autoriser', 'error');
            } else if (event.error === 'no-speech') {
                this.showResult('❌ Aucune parole détectée. Parlez plus fort!', 'error');
            } else {
                this.showResult(`❌ Erreur: ${event.error}`, 'error');
            }
            
            setTimeout(() => {
                if (voiceStatusElem) voiceStatusElem.style.display = 'none';
                this.stopVoiceRecognition();
            }, 3000);
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                voiceStatus.style.display = 'none';
                this.stopVoiceRecognition();
            }
        };

        try {
            this.recognition.start();
        } catch (error) {
            this.showResult(`❌ Erreur de démarrage: ${error.message}`, 'error');
            this.stopVoiceRecognition();
        }
    }

    stopVoiceRecognition() {
        this.isListening = false;
        document.getElementById('voiceCommandBtn').textContent = '🎤 Commande Vocale';
        document.getElementById('voiceCommandBtn').classList.remove('btn-danger');
        
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Ignorer si déjà arrêté
            }
        }
    }

    async processVoiceCommand(command) {
        const lowerCommand = command.toLowerCase();
        
        this.showResult(`🎤 Commande vocale: "${command}"`, 'info');
        
        // Commandes spécifiques
        if (lowerCommand.includes('génère') || lowerCommand.includes('crée') || lowerCommand.includes('écris')) {
            // Extraire le reste de la commande comme prompt
            const promptText = command.replace(/^(génère|crée|écris)\s+/i, '');
            this.updateStatus('🎤 Génération en cours...', 'info');
            const response = await this.callAI(promptText);
            this.showResult(`🤖 RÉSULTAT:\n\n${response}`, 'success');
            
            // 🔊 XYPH PARLE LA RÉPONSE
            this.speakResponse(response);
        }
        else if (lowerCommand.includes('analyse') && lowerCommand.includes('image')) {
            if (lowerCommand.includes('screenshot') || lowerCommand.includes('capture')) {
                await this.screenshotAndAnalyze();
            } else {
                this.showResult('🎤 Veuillez charger une image ou dire "analyse screenshot"', 'info');
            }
        }
        else if (lowerCommand.includes('analyse') && (lowerCommand.includes('vidéo') || lowerCommand.includes('youtube'))) {
            await this.analyzeYoutubeVideo();
        }
        else if (lowerCommand.includes('recherche') && lowerCommand.includes('fichier')) {
            await this.searchAndFindFile();
        }
        else if (lowerCommand.includes('recherche') && (lowerCommand.includes('application') || lowerCommand.includes('app'))) {
            await this.searchAndFindApp();
        }
        else if (lowerCommand.includes('télécharge')) {
            await this.assistDownload();
        }
        else if (lowerCommand.includes('installe')) {
            await this.assistInstall();
        }
        else if (lowerCommand.includes('remplis') && lowerCommand.includes('formulaire')) {
            await this.fillFormWithAI();
        }
        else if (lowerCommand.includes('clique')) {
            await this.clickElementWithAI();
        }
        else if (lowerCommand.includes('navigue')) {
            await this.autoNavigateWithAI();
        }
        else if (lowerCommand.includes('sauvegarde')) {
            await this.saveScriptToLibrary();
        }
        else if (lowerCommand.includes('copie')) {
            this.copyScript();
        }
        else if (lowerCommand.includes('efface') || lowerCommand.includes('nettoie')) {
            this.clearEditor();
        }
        else {
            // Commande générique - envoyer directement à l'IA
            this.updateStatus('🎤 Traitement de la commande...', 'info');
            const response = await this.callAI(command);
            this.showResult(`🤖 RÉSULTAT:\n\n${response}`, 'success');
            
            // 🔊 XYPH PARLE LA RÉPONSE
            this.speakResponse(response);
        }
    }

    async startVoiceDictation() {
        if (!this.recognition) {
            this.recognition = this.initSpeechRecognition();
            if (!this.recognition) return;
        }

        if (this.isListening) {
            this.stopVoiceRecognition();
            return;
        }

        const voiceStatus = document.getElementById('voiceStatus');
        const voiceStatusText = document.getElementById('voiceStatusText');
        
        voiceStatus.style.display = 'block';
        voiceStatusText.textContent = '🗣️ Dictée activée... Parlez';
        
        this.isListening = true;
        document.getElementById('voiceDictationBtn').textContent = '⏸️ Arrêter';
        document.getElementById('voiceDictationBtn').classList.add('btn-danger');

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            
            // Ajouter au prompt (pas remplacer)
            const promptField = document.getElementById('prompt');
            const currentValue = promptField.value;
            promptField.value = currentValue ? `${currentValue} ${transcript}` : transcript;
            
            voiceStatusText.textContent = `✅ Transcrit: "${transcript}"`;
            
            setTimeout(() => {
                voiceStatus.style.display = 'none';
                this.stopVoiceDictation();
            }, 2000);
        };

        this.recognition.onerror = (event) => {
            console.error('Erreur de dictée:', event.error);
            voiceStatusText.textContent = `❌ Erreur: ${event.error}`;
            setTimeout(() => {
                voiceStatus.style.display = 'none';
                this.stopVoiceDictation();
            }, 3000);
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                voiceStatus.style.display = 'none';
                this.stopVoiceDictation();
            }
        };

        try {
            this.recognition.start();
        } catch (error) {
            this.showResult(`❌ Erreur de démarrage: ${error.message}`, 'error');
            this.stopVoiceDictation();
        }
    }

    stopVoiceDictation() {
        this.isListening = false;
        document.getElementById('voiceDictationBtn').textContent = '🗣️ Dictée';
        document.getElementById('voiceDictationBtn').classList.remove('btn-danger');
        
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Ignorer si déjà arrêté
            }
        }
    }

    async handleAudioUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.updateStatus(`📁 Fichier audio: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} Mo)`, 'info');

        // Vérifier si c'est un fichier audio
        if (!file.type.startsWith('audio/')) {
            this.showResult('❌ Veuillez sélectionner un fichier audio valide', 'error');
            return;
        }

        // Créer FormData pour upload (Whisper API)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', 'whisper-1');

        try {
            this.updateStatus('🎧 Transcription de l\'audio en cours...', 'processing');

            // Option 1: Utiliser Whisper API (OpenAI)
            if (this.settings.provider === 'openai' && this.apiKey) {
                const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Erreur API: ${response.status}`);
                }

                const result = await response.json();
                const transcription = result.text;

                this.showResult(`📝 TRANSCRIPTION AUDIO:\n\n${transcription}\n\n✅ Durée: ${file.size > 1000000 ? 'Longue' : 'Courte'}\n✅ Format: ${file.type}`, 'success');
                
                // Proposer d'analyser la transcription
                if (confirm('Voulez-vous analyser cette transcription avec l\'IA?')) {
                    const analysis = await this.callAI(`Analyse cette transcription audio et fournis un résumé structuré:\n\n${transcription}`);
                    this.showResult(`🤖 ANALYSE DE LA TRANSCRIPTION:\n\n${analysis}`, 'info');
                }
            } else {
                // Option 2: Analyse locale basique (métadonnées uniquement)
                const audioInfo = await this.getAudioMetadata(file);
                this.showResult(`🎧 INFORMATIONS AUDIO:\n\nFichier: ${file.name}\nTaille: ${(file.size / 1024 / 1024).toFixed(2)} Mo\nType: ${file.type}\nDurée: ${audioInfo.duration ? audioInfo.duration.toFixed(2) + 's' : 'Non disponible'}\n\n⚠️ Transcription nécessite OpenAI Whisper API\nConfigurez votre clé OpenAI pour activer la transcription automatique.`, 'info');
            }
        } catch (error) {
            this.showResult(`❌ Erreur de transcription: ${error.message}`, 'error');
        }
    }

    async getAudioMetadata(file) {
        return new Promise((resolve) => {
            const audio = document.createElement('audio');
            audio.src = URL.createObjectURL(file);
            
            audio.addEventListener('loadedmetadata', () => {
                resolve({
                    duration: audio.duration,
                    type: file.type,
                    size: file.size
                });
                URL.revokeObjectURL(audio.src);
            });

            audio.addEventListener('error', () => {
                resolve({ duration: null, type: file.type, size: file.size });
                URL.revokeObjectURL(audio.src);
            });
        });
    }

    async toggleAudioRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            // Arrêter l'enregistrement
            this.stopAudioRecording();
        } else {
            // Démarrer l'enregistrement
            await this.startAudioRecording();
        }
    }

    async startAudioRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.recordingStartTime = Date.now();

            const recordingStatus = document.getElementById('audioRecordingStatus');
            const recordingTimer = document.getElementById('recordingTimer');
            
            recordingStatus.style.display = 'block';
            document.getElementById('recordAudioBtn').textContent = '⏹️ Arrêter';
            document.getElementById('recordAudioBtn').classList.add('btn-danger');

            // Timer d'enregistrement
            this.recordingInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                recordingTimer.textContent = `⏺️ Enregistrement: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = async () => {
                clearInterval(this.recordingInterval);
                recordingStatus.style.display = 'none';
                
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
                
                // Traiter comme upload audio
                await this.processRecordedAudio(audioFile);
                
                // Arrêter le stream
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            this.updateStatus('🔴 Enregistrement audio en cours...', 'processing');

        } catch (error) {
            this.showResult(`❌ Erreur d'accès au microphone: ${error.message}\n\nVérifiez les permissions du navigateur.`, 'error');
        }
    }

    stopAudioRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            document.getElementById('recordAudioBtn').textContent = '🔴 Enregistrer';
            document.getElementById('recordAudioBtn').classList.remove('btn-danger');
        }
    }

    async processRecordedAudio(audioFile) {
        this.updateStatus(`🎤 Audio enregistré: ${(audioFile.size / 1024).toFixed(2)} Ko`, 'success');

        if (confirm('Voulez-vous transcrire cet enregistrement avec Whisper AI?')) {
            // Créer un événement fake pour réutiliser handleAudioUpload
            const fakeEvent = {
                target: {
                    files: [audioFile]
                }
            };
            await this.handleAudioUpload(fakeEvent);
        } else {
            this.showResult(`🎤 Audio enregistré avec succès!\n\nTaille: ${(audioFile.size / 1024).toFixed(2)} Ko\nFormat: ${audioFile.type}\n\nUtilisez "Charger Audio" pour transcrire.`, 'success');
        }
    }

    // ============================================
    // TEXT-TO-SPEECH (TTS) - Web Speech Synthesis
    // ============================================

    /**
     * Fait parler XYPH avec la Web Speech Synthesis API
     * @param {string} text - Texte à vocaliser
     * @param {Object} options - Options de voix (rate, pitch, volume)
     */
    speakResponse(text, options = {}) {
        // Vérifier la disponibilité de l'API
        if (!('speechSynthesis' in window)) {
            console.error('❌ Speech Synthesis API non disponible');
            return;
        }

        // Si TTS désactivé, ne pas parler
        if (!this.ttsEnabled) {
            console.log('🔇 TTS désactivé');
            return;
        }

        // Arrêter la parole en cours si elle existe
        if (this.isSpeaking) {
            this.stopSpeaking();
        }

        // Nettoyer le texte (supprimer markdown, emojis excessifs)
        const cleanText = this.cleanTextForSpeech(text);

        // Créer l'utterance (énoncé)
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Configuration de la voix
        utterance.lang = 'fr-FR'; // Français
        utterance.rate = options.rate || 1.0; // Vitesse (0.1 à 10)
        utterance.pitch = options.pitch || 1.0; // Tonalité (0 à 2)
        utterance.volume = options.volume || 1.0; // Volume (0 à 1)

        // Sélectionner une voix française si disponible
        const voices = speechSynthesis.getVoices();
        const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
        if (frenchVoice) {
            utterance.voice = frenchVoice;
        }

        // Événements
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.currentUtterance = utterance;
            console.log('🔊 XYPH parle...');
            this.updateVoiceStatus('🔊 XYPH parle...', 'info');
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            console.log('✅ XYPH a fini de parler');
            this.updateVoiceStatus('✅ Terminé', 'success');
        };

        utterance.onerror = (event) => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            console.error('❌ Erreur TTS:', event.error);
            this.updateVoiceStatus(`❌ Erreur: ${event.error}`, 'error');
        };

        // Lancer la synthèse vocale
        speechSynthesis.speak(utterance);
    }

    /**
     * Nettoie le texte pour la synthèse vocale
     * - Supprime le markdown
     * - Supprime les emojis répétitifs
     * - Limite la longueur
     */
    cleanTextForSpeech(text) {
        let clean = text;

        // Supprimer les blocs de code
        clean = clean.replace(/```[\s\S]*?```/g, '[code]');
        
        // Supprimer le markdown (**, *, _, etc.)
        clean = clean.replace(/\*\*(.*?)\*\*/g, '$1'); // Gras
        clean = clean.replace(/\*(.*?)\*/g, '$1'); // Italique
        clean = clean.replace(/_(.*?)_/g, '$1'); // Souligné
        clean = clean.replace(/`(.*?)`/g, '$1'); // Code inline
        
        // Supprimer les liens markdown [texte](url)
        clean = clean.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
        
        // Limiter les emojis (garder max 1 par ligne)
        clean = clean.replace(/([\u{1F300}-\u{1F9FF}])\1+/gu, '$1');
        
        // Limiter la longueur (max 500 caractères pour TTS basique)
        if (clean.length > 500) {
            clean = clean.substring(0, 497) + '...';
        }

        return clean.trim();
    }

    /**
     * Arrête la parole en cours
     */
    stopSpeaking() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
            console.log('🔇 Parole arrêtée');
            this.updateVoiceStatus('🔇 Arrêté', 'info');
        }
    }

    /**
     * Active/désactive le TTS
     */
    toggleTTS() {
        this.ttsEnabled = !this.ttsEnabled;
        const status = this.ttsEnabled ? '✅ TTS activé' : '🔇 TTS désactivé';
        console.log(status);
        this.updateVoiceStatus(status, this.ttsEnabled ? 'success' : 'info');
        return this.ttsEnabled;
    }

    /**
     * Met à jour le statut vocal (helper)
     */
    updateVoiceStatus(message, type = 'info') {
        const statusDiv = document.getElementById('voiceStatus');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = type === 'error' ? 'error-message' : 
                                 type === 'success' ? 'success-message' : 
                                 'info-message';
            statusDiv.style.display = 'block';
        }
    }

    /**
     * Gère le bouton toggle TTS (UI)
     */
    toggleTTSButton() {
        const enabled = this.toggleTTS();
        const btn = document.getElementById('toggleTTSBtn');
        if (btn) {
            btn.textContent = enabled ? '🔊 TTS: ON' : '🔇 TTS: OFF';
            btn.style.background = enabled ? '#3b82f6' : '#6b7280';
        }
    }

    // ============================================
    // CHAT MEMORY / CONVERSATION HISTORY
    // ============================================

    /**
     * Ajoute un message à l'historique de conversation
     * @param {string} role - 'user' ou 'assistant'
     * @param {string} content - Contenu du message
     */
    addToChatHistory(role, content) {
        this.chatHistory.push({
            role: role,
            content: content
        });

        // Limiter la taille de l'historique (garder les N derniers messages)
        if (this.chatHistory.length > this.maxHistoryLength) {
            // Supprimer les messages les plus anciens
            this.chatHistory = this.chatHistory.slice(-this.maxHistoryLength);
        }
    }

    /**
     * Efface l'historique de conversation
     */
    clearChatHistory() {
        this.chatHistory = [];
        console.log('🗑️ Historique de conversation effacé');
        this.showResult('🗑️ Historique de conversation effacé', 'success');
    }

    /**
     * Obtient l'historique formaté pour affichage
     */
    getChatHistorySummary() {
        if (this.chatHistory.length === 0) {
            return 'Aucun historique de conversation';
        }

        return `📜 Historique: ${this.chatHistory.length} messages\n` +
               `Derniers échanges:\n` +
               this.chatHistory.slice(-6).map(msg => 
                   `${msg.role === 'user' ? '👤' : '🤖'}: ${msg.content.substring(0, 50)}...`
               ).join('\n');
    }
}

// Initialisation
const sidebar = new SidebarScriptCommander();