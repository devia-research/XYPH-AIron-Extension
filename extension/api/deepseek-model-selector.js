/**
 * Sélecteur de modèles DeepSeek pour l'extension XYPH
 * Choisit automatiquement le bon modèle selon le type de tâche
 */

class DeepSeekModelSelector {
    constructor() {
        this.models = {
            reasoner: "deepseek-reasoner",    // Pour logique complexe, raisonnement ET génération de code
            chat: "deepseek-chat"             // Pour conversations générales
        };
        
        this.taskPatterns = {
            coding: [
                /code|fonction|script|program|debug|syntax|error|javascript|html|css|json/i,
                /écrire|créer|générer.*code|programmer|développer/i,
                /fix|corriger|réparer.*bug|erreur/i
            ],
            reasoning: [
                /analyser|expliquer|pourquoi|comment|logique|raisonne/i,
                /problème|solution|résoudre|décider|choisir/i,
                /comparer|évaluer|optimiser|stratégie/i,
                /planifier|organiser|structurer/i
            ],
            general: [
                /salut|bonjour|aide|question|simple/i,
                /qu'est-ce|quoi|qui|où|quand/i
            ]
        };
    }

    /**
     * Sélectionne le meilleur modèle selon le prompt utilisateur
     * @param {string} userPrompt - Le message de l'utilisateur
     * @param {string} context - Contexte optionnel (web, extension, etc.)
     * @returns {string} Nom du modèle DeepSeek à utiliser
     */
    selectModel(userPrompt, context = '') {
        const fullText = (userPrompt + ' ' + context).toLowerCase();
        
        // Vérifier d'abord si c'est une tâche de code ou raisonnement complexe
        for (const pattern of this.taskPatterns.coding) {
            if (pattern.test(fullText)) {
                console.log('🔧 Utilisation du modèle Reasoner pour:', userPrompt.substring(0, 50));
                return this.models.reasoner;
            }
        }
        
        // Ensuite vérifier si c'est du raisonnement complexe
        for (const pattern of this.taskPatterns.reasoning) {
            if (pattern.test(fullText)) {
                console.log('🧠 Utilisation du modèle Reasoner pour:', userPrompt.substring(0, 50));
                return this.models.reasoner;
            }
        }
        
        // Par défaut, utiliser le chat général
        console.log('💬 Utilisation du modèle Chat pour:', userPrompt.substring(0, 50));
        return this.models.chat;
    }

    /**
     * Force l'utilisation d'un modèle spécifique
     * @param {string} modelType - Type de modèle (reasoner, coder, chat)
     * @returns {string} Nom du modèle DeepSeek
     */
    forceModel(modelType) {
        if (this.models[modelType]) {
            console.log(`🎯 Modèle forcé: ${this.models[modelType]}`);
            return this.models[modelType];
        }
        throw new Error(`Modèle inconnu: ${modelType}. Disponibles: ${Object.keys(this.models).join(', ')}`);
    }

    /**
     * Obtient tous les modèles disponibles
     * @returns {Object} Liste des modèles
     */
    getAvailableModels() {
        return { ...this.models };
    }

    /**
     * Optimise les paramètres selon le modèle choisi
     * @param {string} model - Nom du modèle
     * @param {Object} baseParams - Paramètres de base
     * @returns {Object} Paramètres optimisés
     */
    optimizeParams(model, baseParams = {}) {
        const optimized = { ...baseParams };
        
        switch (model) {
            case this.models.reasoner:
                // Reasoner: Plus de tokens pour le raisonnement complexe
                optimized.max_tokens = optimized.max_tokens || 2000;
                optimized.temperature = optimized.temperature || 0.7;
                break;
                
            case this.models.coder:
                // Coder: Précision maximale pour le code
                optimized.max_tokens = optimized.max_tokens || 1500;
                optimized.temperature = optimized.temperature || 0.1;
                break;
                
            case this.models.chat:
                // Chat: Équilibré pour les conversations
                optimized.max_tokens = optimized.max_tokens || 1000;
                optimized.temperature = optimized.temperature || 0.5;
                break;
        }
        
        return optimized;
    }
}

// Export pour utilisation dans l'extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeepSeekModelSelector;
} else if (typeof window !== 'undefined') {
    window.DeepSeekModelSelector = DeepSeekModelSelector;
}