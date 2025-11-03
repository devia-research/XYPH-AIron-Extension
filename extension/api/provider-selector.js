/**
 * Sélecteur intelligent de providers IA pour XYPH
 * Choisit automatiquement le meilleur provider selon le type de tâche
 */

class XYPHProviderSelector {
    constructor() {
        this.providers = {
            deepseek: {
                name: "DeepSeek",
                models: ["deepseek-reasoner", "deepseek-chat"],
                strengths: ["reasoning", "coding", "multilingual"],
                cost: "free",
                priority: 1
            },
            claude: {
                name: "Claude",
                models: ["claude-3-haiku-20240307", "claude-3-5-sonnet-20241022", "claude-3-opus-20240229"],
                strengths: ["reasoning", "analysis", "writing", "safety"],
                cost: "paid",
                priority: 4
            },
            huggingface: {
                name: "Hugging Face",
                models: ["microsoft/DialoGPT-medium", "codellama/CodeLlama-7b-Instruct-hf", "meta-llama/Llama-2-7b-chat-hf"],
                strengths: ["opensource", "experimentation", "specialized"],
                cost: "free",
                priority: 5
            },
            ollama: {
                name: "Ollama",
                models: ["llama3.2", "codellama", "mistral"],
                strengths: ["local", "privacy", "offline"],
                cost: "free",
                priority: 2
            },
            openai: {
                name: "OpenAI",
                models: ["gpt-4", "gpt-3.5-turbo"],
                strengths: ["general", "reliable", "popular"],
                cost: "paid",
                priority: 3
            }
        };

        this.taskCategories = {
            coding: {
                patterns: [/code|script|fonction|program|debug|javascript|powershell|html|css|json/i],
                preferredProviders: ["deepseek", "huggingface", "claude"],
                notes: "Code generation and debugging"
            },
            reasoning: {
                patterns: [/analyser|expliquer|logique|problème|solution|raisonne|comprendre/i],
                preferredProviders: ["deepseek", "claude", "openai"],
                notes: "Complex reasoning and analysis"
            },
            chat: {
                patterns: [/bonjour|salut|conversation|aide|question/i],
                preferredProviders: ["claude", "huggingface", "deepseek"],
                notes: "General conversation"
            },
            french: {
                patterns: [/français|france|écrire en français/i],
                preferredProviders: ["deepseek", "claude", "huggingface"],
                notes: "French language tasks"
            },
            privacy: {
                patterns: [/local|privé|confidentiel|sécurisé|offline/i],
                preferredProviders: ["ollama"],
                notes: "Privacy-focused local processing"
            },
            experimentation: {
                patterns: [/test|expériment|prototype|essai/i],
                preferredProviders: ["huggingface", "ollama", "deepseek"],
                notes: "Testing and experimentation"
            }
        };
    }

    /**
     * Sélectionne le meilleur provider selon le prompt et les préférences
     * @param {string} userPrompt - Le message de l'utilisateur
     * @param {Object} options - Options de sélection
     * @returns {Object} Provider et modèle recommandés
     */
    selectBestProvider(userPrompt, options = {}) {
        const {
            preferFree = true,
            allowPaid = false,
            forceLocal = false,
            taskHint = null
        } = options;

        const fullText = userPrompt.toLowerCase();
        let taskType = taskHint;

        // Détection automatique du type de tâche si non spécifié
        if (!taskType) {
            for (const [category, config] of Object.entries(this.taskCategories)) {
                for (const pattern of config.patterns) {
                    if (pattern.test(fullText)) {
                        taskType = category;
                        break;
                    }
                }
                if (taskType) break;
            }
        }

        // Par défaut: tâche générale
        taskType = taskType || 'chat';

        console.log(`🎯 Tâche détectée: ${taskType}`);

        // Obtenir les providers recommandés pour cette tâche
        const recommendedProviders = this.taskCategories[taskType]?.preferredProviders || ['deepseek'];

        // Filtrer selon les préférences
        let availableProviders = recommendedProviders.filter(providerName => {
            const provider = this.providers[providerName];
            if (!provider) return false;

            // Forcer local si demandé
            if (forceLocal && providerName !== 'ollama') return false;

            // Filtrer par coût
            if (!allowPaid && provider.cost === 'paid') return false;

            return true;
        });

        // Fallback si aucun provider disponible
        if (availableProviders.length === 0) {
            if (forceLocal) {
                availableProviders = ['ollama'];
            } else if (preferFree) {
                availableProviders = ['deepseek', 'huggingface', 'ollama'];
            } else {
                availableProviders = ['deepseek'];
            }
        }

        // Sélectionner le provider avec la plus haute priorité
        const selectedProviderName = availableProviders.reduce((best, current) => {
            const bestPriority = this.providers[best]?.priority || 999;
            const currentPriority = this.providers[current]?.priority || 999;
            return currentPriority < bestPriority ? current : best;
        });

        const selectedProvider = this.providers[selectedProviderName];
        const selectedModel = this.selectModelForTask(selectedProviderName, taskType);

        const result = {
            provider: selectedProviderName,
            model: selectedModel,
            taskType: taskType,
            reasoning: `${selectedProvider.name} sélectionné pour ${taskType}`,
            cost: selectedProvider.cost,
            strengths: selectedProvider.strengths
        };

        console.log(`🤖 Provider sélectionné: ${result.provider} (${result.model})`);
        console.log(`💡 Raison: ${result.reasoning}`);

        return result;
    }

    /**
     * Sélectionne le meilleur modèle pour un provider et une tâche donnés
     * @param {string} providerName - Nom du provider
     * @param {string} taskType - Type de tâche
     * @returns {string} Nom du modèle
     */
    selectModelForTask(providerName, taskType) {
        const provider = this.providers[providerName];
        if (!provider || !provider.models.length) return null;

        switch (providerName) {
            case 'deepseek':
                // Reasoner pour code et raisonnement complexe
                if (taskType === 'coding' || taskType === 'reasoning') return 'deepseek-reasoner';
                return 'deepseek-chat'; // Chat pour conversations générales

            case 'claude':
                if (taskType === 'coding' || taskType === 'chat') return 'claude-3-haiku-20240307';
                if (taskType === 'reasoning') return 'claude-3-5-sonnet-20241022';
                return 'claude-3-haiku-20240307'; // Par défaut (plus rapide)

            case 'huggingface':
                if (taskType === 'coding') return 'codellama/CodeLlama-7b-Instruct-hf';
                if (taskType === 'french') return 'dbmdz/bert-base-french-europeana-cased';
                return 'microsoft/DialoGPT-medium'; // Par défaut

            default:
                return provider.models[0]; // Premier modèle par défaut
        }
    }

    /**
     * Obtient la configuration complète pour un provider
     * @param {string} providerName - Nom du provider
     * @returns {Object} Configuration du provider
     */
    getProviderConfig(providerName) {
        return this.providers[providerName] || null;
    }

    /**
     * Liste tous les providers disponibles avec leurs capacités
     * @returns {Object} Liste des providers
     */
    listProviders() {
        return Object.entries(this.providers).map(([name, config]) => ({
            name,
            displayName: config.name,
            models: config.models,
            strengths: config.strengths,
            cost: config.cost,
            priority: config.priority
        }));
    }

    /**
     * Teste la disponibilité d'un provider
     * @param {string} providerName - Nom du provider à tester
     * @returns {Promise<boolean>} True si disponible
     */
    async testProviderAvailability(providerName) {
        // Cette méthode pourrait faire un ping vers l'API
        // Pour l'instant, on retourne true pour les providers configurés
        return this.providers.hasOwnProperty(providerName);
    }
}

// Export pour utilisation dans l'extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XYPHProviderSelector;
} else if (typeof window !== 'undefined') {
    window.XYPHProviderSelector = XYPHProviderSelector;
}