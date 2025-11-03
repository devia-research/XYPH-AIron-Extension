# 🔑 Guide Complet - Où Mettre Vos Clés API

## 📍 **EMPLACEMENT PRINCIPAL**

```
F:\Git\XYPH-Project\config\api\api-keys.json
```

**⚠️ ATTENTION :** Ce fichier ne doit JAMAIS être commité dans Git !

---

## 🚀 **SETUP RAPIDE - 3 ÉTAPES**

### 1️⃣ **Créer votre fichier de clés**
```powershell
# Aller dans le dossier du projet
cd F:\Git\XYPH-Project

# Copier le template
Copy-Item "config\api\api-keys.template.json" "config\api\api-keys.json"
```

### 2️⃣ **Ajouter vos clés API**
Éditez `config\api\api-keys.json` :

```json
{
  "providers": {
    "deepseek": {
      "apiKey": "sk-xxxxxxxxxxxxxxxxxxxxx",
      "enabled": true
    },
    "ollama": {
      "apiKey": "",
      "enabled": true
    },
    "openai": {
      "apiKey": "sk-xxxxxxxxxxxxxxxxxxxxx", 
      "enabled": false
    }
  }
}
```

### 3️⃣ **Tester la configuration**
```powershell
.\scripts\api\setup_apis.ps1
```

---

## 🔐 **MÉTHODES DE CONFIGURATION**

### **Méthode 1: Fichier JSON (Recommandée)**
```
📁 F:\Git\XYPH-Project\config\api\api-keys.json
```

### **Méthode 2: Variables d'environnement**
```powershell
# PowerShell
$env:DEEPSEEK_API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxx"
$env:OPENAI_API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxx"
```

### **Méthode 3: Extension Chrome Storage**
```javascript
// Stockage sécurisé dans l'extension
chrome.storage.sync.set({
  'deepseekApiKey': 'sk-xxxxxxxxxxxxxxxxxxxxx'
});
```

---

## 🛡️ **SÉCURITÉ - RÈGLES IMPORTANTES**

### ✅ **À FAIRE**
- ✅ Utiliser `config\api\api-keys.json`
- ✅ Ajouter à `.gitignore` (déjà fait)
- ✅ Permissions fichier restrictives
- ✅ Tester avec des clés de développement

### ❌ **À NE JAMAIS FAIRE**
- ❌ Committer les clés dans Git
- ❌ Partager les fichiers de clés
- ❌ Coder en dur dans le code source
- ❌ Envoyer par email ou chat

---

## 🔧 **CONFIGURATION PAR PROVIDER**

### **🤖 DeepSeek (Recommandé - Gratuit)**
1. Aller sur [console.deepseek.com](https://console.deepseek.com)
2. Créer un compte / Se connecter
3. Aller dans API Keys
4. Créer une nouvelle clé
5. Copier dans `config\api\api-keys.json`:
```json
{
  "providers": {
    "deepseek": {
      "apiKey": "sk-xxxxxxxxxxxxxxxxx",
      "enabled": true,
      "priority": 1
    }
  }
}
```

### **🏠 Ollama (Local - Pas de clé)**
1. Installer Ollama: [ollama.ai](https://ollama.ai)
2. Télécharger un modèle: `ollama pull llama3.2`
3. Configuration:
```json
{
  "providers": {
    "ollama": {
      "apiKey": "",
      "enabled": true,
      "priority": 2
    }
  }
}
```

### **🔥 OpenAI (Payant - Backup)**
1. Aller sur [platform.openai.com](https://platform.openai.com)
2. API Keys → Create new secret key
3. Configuration:
```json
{
  "providers": {
    "openai": {
      "apiKey": "sk-xxxxxxxxxxxxxxxxx",
      "enabled": false,
      "priority": 3
    }
  }
}
```

---

## 🔄 **UTILISATION DANS L'EXTENSION**

### **Chargement automatique**
L'extension charge automatiquement depuis :
1. `config\api\api-keys.json` (priorité)
2. Variables d'environnement  
3. Chrome storage

### **Code d'exemple**
```javascript
// L'extension utilise automatiquement vos clés
// Aucune modification de code nécessaire !

// Test dans la console:
console.log('API configurées:', await loadApiKeys());
```

---

## 🧪 **VALIDATION DE LA CONFIGURATION**

### **Script de test**
```powershell
# Tester toutes les APIs
.\scripts\api\test_api_endpoints.ps1

# Setup initial des APIs
.\scripts\api\setup_apis.ps1

# Validation des clés
.\scripts\api\validate_keys.ps1
```

### **Tests manuels**
```powershell
# Test DeepSeek
curl -H "Authorization: Bearer sk-xxxxx" https://api.deepseek.com/v1/models

# Test OpenAI  
curl -H "Authorization: Bearer sk-xxxxx" https://api.openai.com/v1/models

# Test Ollama
curl http://localhost:11434/api/tags
```

---

## 📋 **CHECKLIST CONFIGURATION**

- [ ] **Fichier créé**: `config\api\api-keys.json`
- [ ] **Clé DeepSeek ajoutée** (gratuite)
- [ ] **Ollama installé** (local)
- [ ] **Tests API passent**: `.\scripts\api\test_api_endpoints.ps1`
- [ ] **Extension fonctionne**: Tester dans Chrome
- [ ] **Fichier ignoré par Git**: Vérifier `.gitignore`

---

## 🆘 **DÉPANNAGE**

### **Erreur "API Key non trouvée"**
```powershell
# Vérifier l'emplacement
Test-Path "F:\Git\XYPH-Project\config\api\api-keys.json"

# Vérifier le contenu
Get-Content "config\api\api-keys.json" | ConvertFrom-Json
```

### **Erreur "Unauthorized"**
- Vérifier que la clé API est correcte
- Vérifier les quotas sur la plateforme
- Tester avec curl directement

### **Ollama ne fonctionne pas**
```powershell
# Vérifier qu'Ollama est démarré
curl http://localhost:11434

# Lister les modèles
ollama list
```

---

## 🎯 **RÉSUMÉ**

**📍 Emplacement principal :** `F:\Git\XYPH-Project\config\api\api-keys.json`

**🚀 Commande rapide :**
```powershell
cd F:\Git\XYPH-Project
Copy-Item "config\api\api-keys.template.json" "config\api\api-keys.json"
# Éditer le fichier avec vos clés
.\scripts\api\setup_apis.ps1
```

**🔐 Sécurité :** Le fichier est automatiquement ignoré par Git - Vos clés restent privées !

---
*Configuration sécurisée et modulaire pour XYPH* 🛡️