# 🔑 Guide Complet - Clés API Développeur Gratuites

## 🎯 Services IA avec API Gratuites

### 1. 🌐 DeepSeek (Recommandé - Excellent gratuit)

**🟢 Plan Gratuit Généreux :**
- **20$ de crédits gratuits** à l'inscription
- **Pas de carte bancaire** requise
- Modèles de qualité équivalente GPT-4

**📋 Étapes d'inscription :**
1. Aller sur : https://platform.deepseek.com/
2. Cliquer "Sign Up" (en haut à droite)
3. S'inscrire avec email/Google/GitHub
4. Aller dans "API Keys" dans le dashboard
5. Créer une nouvelle clé API
6. **Copier immédiatement** (ne s'affiche qu'une fois)

**⚙️ Configuration :**
```javascript
// Configuration DeepSeek dans XYPH - URLs Corrigées
const DEEPSEEK_CONFIG = {
    // Modèle de raisonnement avancé pour défis créatifs complexes
    reasoning: {
        apiUrl: 'https://api.deepseek.com/v1/chat/completions',
        model: 'deepseek-reasoner',  // Meilleur pour résolution créative
        apiKey: 'sk-xxxxxxxxxxxxxxxxxxxx'
    },
    
    // Modèle de code pour scripts et programmation
    coding: {
        apiUrl: 'https://api.deepseek.com/v1/chat/completions', 
        model: 'deepseek-coder',  // Spécialisé programmation
        apiKey: 'sk-xxxxxxxxxxxxxxxxxxxx'
    },
    
    // Modèle chat général (backup)
    general: {
        apiUrl: 'https://api.deepseek.com/v1/chat/completions',
        model: 'deepseek-chat',  // Usage général
        apiKey: 'sk-xxxxxxxxxxxxxxxxxxxx'
    }
};

// ALTERNATIVE: Si l'API principale ne fonctionne pas
const DEEPSEEK_CONFIG_ALTERNATIVE = {
    // URL alternative possible
    general: {
        apiUrl: 'https://api.deepseek.com/v1/chat/completions',
        model: 'deepseek-chat',
        apiKey: 'sk-xxxxxxxxxxxxxxxxxxxx'
    }
};

// Sélection intelligente selon le contexte XYPH
function selectDeepSeekModel(taskType) {
    switch (taskType) {
        case 'creative_challenge':
        case 'problem_solving':
        case 'innovation':
            return DEEPSEEK_CONFIG.reasoning;  // Raisonnement complexe
            
        case 'script_generation':
        case 'code_review':
        case 'optimization':
            return DEEPSEEK_CONFIG.coding;     // Spécialisé code
            
        default:
            return DEEPSEEK_CONFIG.general;    // Chat général
    }
}
```

---

### 2. 🏠 Ollama (Local - Totalement Gratuit)

**🟢 Avantages :**
- **100% gratuit** et local
- **Aucune limite** d'utilisation
- **Confidentialité totale** (hors ligne)
- Modèles Llama, CodeLlama, Mistral, etc.

**📋 Installation :**
1. Télécharger : https://ollama.ai/download
2. Installer Ollama sur ton PC
3. Ouvrir terminal et installer des modèles :

```bash
# Modèles recommandés pour XYPH
ollama pull llama3.1:8b        # Général (4GB)
ollama pull codellama:7b       # Code (3.8GB)
ollama pull mistral:7b         # Rapide (4.1GB)
ollama pull phi3:mini          # Léger (2.3GB)
```

**⚙️ Configuration :**
```javascript
// Configuration Ollama dans XYPH - Modèles Spécialisés
const OLLAMA_CONFIG = {
    // Modèle général pour créativité et conversation
    general: {
        apiUrl: 'http://localhost:11434/api/chat',
        model: 'llama3.1:8b',  // Excellent équilibre
        // Pas de clé API nécessaire
    },
    
    // Modèle spécialisé pour le code
    coding: {
        apiUrl: 'http://localhost:11434/api/chat', 
        model: 'codellama:7b',  // Optimisé programmation
        // Pas de clé API nécessaire
    },
    
    // Modèle léger pour tests rapides
    lightweight: {
        apiUrl: 'http://localhost:11434/api/chat',
        model: 'phi3:mini',  // Rapide et efficace
        // Pas de clé API nécessaire
    },
    
    // Modèle français optimisé (si disponible)
    french: {
        apiUrl: 'http://localhost:11434/api/chat',
        model: 'mistral:7b',  // Excellent en français
        // Pas de clé API nécessaire
    }
};

// Sélection intelligente Ollama selon le contexte
function selectOllamaModel(taskType, priority = 'balanced') {
    switch (taskType) {
        case 'script_generation':
        case 'code_review': 
            return OLLAMA_CONFIG.coding;      // CodeLlama pour code
            
        case 'quick_test':
        case 'simple_task':
            return OLLAMA_CONFIG.lightweight; // Phi3 pour rapidité
            
        case 'french_content':
        case 'creative_writing':
            return OLLAMA_CONFIG.french;      // Mistral pour français
            
        default:
            return OLLAMA_CONFIG.general;     // Llama3.1 par défaut
    }
}
```

---

### 3. ⚡ Groq (Ultra-rapide)

**🟢 Plan Gratuit :**
- **Jusqu'à 14,400 tokens/minute** gratuits
- Modèles **ultra-rapides** (Llama, Mixtral)
- Idéal pour les **tests et prototypages**

**📋 Étapes d'inscription :**
1. Aller sur : https://console.groq.com/
2. "Sign Up" avec Google/GitHub
3. Aller dans "API Keys"
4. "Create API Key"
5. Nommer la clé (ex: "XYPH-Development")
6. Copier la clé

**⚙️ Configuration :**
```javascript
// Configuration Groq dans XYPH
const GROQ_CONFIG = {
    apiUrl: 'https://api.groq.com/v1/chat/completions',
    model: 'llama3-70b-8192',  // ou 'mixtral-8x7b-32768'
    apiKey: 'gsk_xxxxxxxxxxxxxxxxxxxx'
};
```

---

### 4. 🔥 OpenAI (Limité mais gratuit)

**🟡 Plan Gratuit (Nouveau compte) :**
- **5$ de crédits gratuits** pour nouveaux comptes
- **Expire après 3 mois**
- Nécessite numéro de téléphone

**📋 Étapes d'inscription :**
1. Aller sur : https://platform.openai.com/
2. "Sign Up" 
3. Vérifier email + téléphone
4. Aller dans "API Keys"
5. "Create new secret key"
6. Copier la clé

**⚙️ Configuration :**
```javascript
// Configuration OpenAI dans XYPH
const OPENAI_CONFIG = {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',  // Moins cher que GPT-4
    apiKey: 'sk-xxxxxxxxxxxxxxxxxxxx'
};
```

---

## 🌟 Alternatives Gratuites Supplémentaires

### 5. 🤗 Hugging Face (Gratuit avec limitations)

**🟢 Plan Gratuit :**
- **1000 requêtes/mois** gratuites
- Accès à de nombreux modèles open-source

**📋 Inscription :**
1. https://huggingface.co/
2. Settings → Access Tokens
3. "New token" → "Read"

### 6. 🎭 Cohere (Généreux gratuit)

**🟢 Plan Gratuit :**
- **5M tokens/mois** gratuits
- Excellent pour le texte

**📋 Inscription :**
1. https://cohere.ai/
2. Dashboard → API Keys

### 7. 🔮 Anthropic Claude (Trial)

**🟡 Plan Trial :**
- **5$ de crédits gratuits**
- Claude 3 Haiku (moins cher)

**📋 Inscription :**
1. https://console.anthropic.com/

---

## 📊 Comparaison des Services

| Service | Gratuit | Qualité | Vitesse | Local | Recommandation |
|---------|---------|---------|---------|-------|----------------|
| **DeepSeek** | 20$ crédits | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | 🥇 **OPTIMAL** |
| **Ollama** | ∞ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | 🥈 **PRIVÉ** |
| **Groq** | 14k tok/min | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | 🥉 **RAPIDE** |
| **OpenAI** | 5$ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | 💰 Limité |

---

## 🛠️ Configuration Multi-API pour XYPH

Créons un système qui utilise plusieurs APIs automatiquement :

```javascript
// Configuration intelligente XYPH
const AI_PROVIDERS = {
    primary: {
        name: 'DeepSeek',
        config: DEEPSEEK_CONFIG,
        costPerToken: 0.00014 // Très économique
    },
    fallback: {
        name: 'Ollama',
        config: OLLAMA_CONFIG,
        costPerToken: 0 // Gratuit
    },
    speed: {
        name: 'Groq',
        config: GROQ_CONFIG,
        costPerToken: 0 // Gratuit dans limites
    }
};

// Auto-sélection intelligente
function selectBestProvider(requestType, priority = 'cost') {
    if (priority === 'speed') return AI_PROVIDERS.speed;
    if (priority === 'privacy') return AI_PROVIDERS.fallback;
    return AI_PROVIDERS.primary; // Par défaut
}
```

---

## 🔐 Sécurisation des Clés API

### ⚠️ Règles de Sécurité IMPORTANTES :

1. **JAMAIS dans le code source** public
2. **Utiliser des variables d'environnement**
3. **Limiter les permissions** des clés
4. **Surveiller l'utilisation**

### 💾 Stockage Sécurisé dans XYPH :

```javascript
// Dans l'extension Chrome - Storage sécurisé
async function saveApiKey(provider, apiKey) {
    await chrome.storage.local.set({
        [`${provider}_api_key`]: apiKey
    });
}

async function getApiKey(provider) {
    const result = await chrome.storage.local.get(`${provider}_api_key`);
    return result[`${provider}_api_key`];
}
```

---

## 🎯 Plan d'Action Recommandé

### Phase 1 : Setup Immédiat (15 minutes)
```bash
# 1. DeepSeek (priorité 1)
# → Inscription + 20$ gratuits
# → Intégration dans XYPH

# 2. Ollama (priorité 2) 
# → Installation locale
# → Téléchargement llama3.1:8b
```

### Phase 2 : Backup APIs (10 minutes)
```bash
# 3. Groq (backup rapide)
# → Inscription + clé API

# 4. Hugging Face (secours)
# → Token gratuit
```

### Phase 3 : Tests (5 minutes)
```bash
# 5. Tests dans XYPH
# → Validation de chaque API
# → Configuration multi-provider
```

---

## 📝 Script d'Installation Automatique

Veux-tu que je crée un script PowerShell qui :
- ✅ Installe Ollama automatiquement
- ✅ Télécharge les modèles recommandés
- ✅ Configure XYPH avec les APIs
- ✅ Teste toutes les connexions

**💡 Conseil Pro :** Commence par **DeepSeek + Ollama** - tu auras le meilleur des deux mondes : qualité cloud + confidentialité locale !

**🚀 Ready to go ?** Dis-moi quels services tu veux configurer en premier et je t'aide avec les scripts d'installation !
