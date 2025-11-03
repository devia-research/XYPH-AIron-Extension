// Background service worker for AI Script Commander
class BackgroundService {
    constructor() {
        this.setupMessageListener();
        this.setupContextMenus();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'executeScript':
                    const result = await this.executeScript(request.type, request.script);
                    sendResponse({ result });
                    break;
                    
                case 'aiAssist':
                    const aiResult = await this.assistWithAI(request.script, request.type, request.aiAction, request.apiKey);
                    sendResponse({ result: aiResult });
                    break;
                    
                case 'webScraping':
                    const scrapingResult = await this.performWebScraping(request.url, request.type, request.filter);
                    sendResponse({ results: scrapingResult });
                    break;
                    
                default:
                    sendResponse({ error: `Action non supportée: ${request.action}` });
            }
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    async executeScript(type, script) {
        // Simulation d'exécution - Dans la réalité, utiliser une API native
        return new Promise((resolve) => {
            setTimeout(() => {
                const results = {
                    powershell: `📊 Exécution PowerShell simulée\n\nScript exécuté: ${script.substring(0, 200)}...\n\n✅ Résultat: Script exécuté avec succès\n⏱️ Temps: 2.3s\n💾 Mémoire: 45MB`,
                    python: `🐍 Exécution Python simulée\n\nScript exécuté: ${script.substring(0, 200)}...\n\n✅ Résultat: Script exécuté avec succès\n⏱️ Temps: 1.8s\n💾 Mémoire: 38MB`,
                    bash: `🐚 Exécution Bash simulée\n\nScript exécuté: ${script.substring(0, 200)}...\n\n✅ Résultat: Script exécuté avec succès\n⏱️ Temps: 1.2s\n💾 Mémoire: 28MB`,
                    javascript: `📝 Auto-remplissage exécuté\n\nLes champs de formulaire ont été remplis automatiquement avec des données réalistes.`,
                    cmd: `🪟 Exécution CMD simulée\n\nScript exécuté: ${script.substring(0, 200)}...\n\n✅ Résultat: Commandes exécutées avec succès`
                };
                resolve(results[type] || `Script ${type} exécuté: ${script}`);
            }, 2000);
        });
    }

    async assistWithAI(script, type, aiAction, apiKey) {
        if (!apiKey) {
            throw new Error('Clé API DeepSeek non configurée');
        }

        const prompts = {
            'generate-script': `En tant qu'expert en programmation, génère un script ${type} professionnel et optimisé pour la tâche suivante. Le script doit être bien commenté, gérer les erreurs et suivre les meilleures pratiques.

Tâche: ${script || "Générer un script utilitaire polyvalent"}

Exigences:
- Code propre et bien structuré
- Gestion des erreurs robuste
- Commentaires en français
- Optimisé pour les performances
- Facile à maintenir

Fournis le code complet prêt à l'emploi.`,

            'optimize-script': `Optimise ce script ${type} pour de meilleures performances et maintenabilité:

\`\`\`${type}
${script}
\`\`\`

Améliorations demandées:
- Optimisation des performances
- Meilleure gestion des erreurs
- Réduction de la complexité
- Amélioration de la lisibilité
- Suppression du code redondant

Explique brièvement les optimisations apportées.`,

            'explain-script': `Analyse et explique ce script ${type} en détail:

\`\`\`${type}
${script}
\`\`\`

Fournis:
1. Explication du fonctionnement
2. Points forts et faiblesses
3. Suggestions d'amélioration
4. Cas d'utilisation appropriés
5. Sécurité et considérations techniques`,

            'debug-script': `Débogue ce script ${type} et identifie les problèmes:

\`\`\`${type}
${script}
\`\`\`

Recherche:
- Erreurs de syntaxe
- Problèmes de logique
- Fuites de mémoire
- Vulnérabilités de sécurité
- Optimisations manquées

Fournis le code corrigé et explique les corrections.`,

            'convert-script': `Convertit ce script en ${type}:

\`\`\`
${script}
\`\`\`

Assure-toi que:
- La logique est préservée
- Les spécificités du langage sont respectées
- Les bonnes pratiques sont suivies
- Le code est fonctionnellement équivalent

Fournis le code converti complet.`
        };

        const prompt = prompts[aiAction] || prompts['generate-script'];

        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 4000,
                    temperature: 0.7,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            throw new Error(`Erreur DeepSeek: ${error.message}`);
        }
    }

    async performWebScraping(url, type, filter) {
        // Simulation de scraping - Dans la réalité, utiliser l'API scripting
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockResults = {
                    'scripts': [
                        'script.js',
                        'app.py',
                        'utils.ps1',
                        'main.cpp',
                        'helper.sh'
                    ],
                    'links': [
                        'https://example.com/page1',
                        'https://example.com/page2',
                        'https://example.com/download',
                        'https://example.com/contact'
                    ],
                    'texts': [
                        'Welcome to our website',
                        'Latest news and updates',
                        'Contact information',
                        'About our company'
                    ],
                    'images': [
                        'banner.png',
                        'logo.jpg',
                        'product.webp',
                        'team-photo.jpeg'
                    ],
                    'tables': [
                        'User Data Table',
                        'Product Catalog',
                        'Price List',
                        'Inventory Status'
                    ]
                };
                
                let results = mockResults[type] || mockResults.scripts;
                
                if (filter) {
                    results = results.filter(item => 
                        item.toLowerCase().includes(filter.toLowerCase())
                    );
                }
                
                resolve(results);
            }, 1500);
        });
    }

    setupContextMenus() {
        chrome.contextMenus.create({
            id: "generate-script",
            title: "🤖 Générer script avec IA",
            contexts: ["selection"]
        });

        chrome.contextMenus.create({
            id: "extract-code",
            title: "📝 Extraire code de la sélection",
            contexts: ["selection"]
        });

        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
    }

    async handleContextMenuClick(info, tab) {
        switch (info.menuItemId) {
            case "generate-script":
                await this.generateScriptFromSelection(info.selectionText, tab);
                break;
            case "extract-code":
                await this.extractCodeFromSelection(info.selectionText, tab);
                break;
        }
    }

    async generateScriptFromSelection(selection, tab) {
        // Stocker la sélection pour l'utiliser dans le popup
        await chrome.storage.session.set({ 
            lastSelection: selection,
            action: 'generate-from-selection'
        });
        
        // Ouvrir le popup ou envoyer un message
        chrome.action.openPopup();
    }

    async extractCodeFromSelection(selection, tab) {
        // Implémentation de l'extraction de code
        console.log("Extraction de code:", selection);
    }
}

// Initialisation du service
const backgroundService = new BackgroundService();