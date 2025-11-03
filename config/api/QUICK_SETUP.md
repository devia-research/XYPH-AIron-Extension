# 🔑 RÉPONSE RAPIDE : OÙ METTRE VOS CLÉS API

## 📍 **EMPLACEMENT EXACTE**

```
F:\Git\XYPH-Project\config\api\api-keys.json
```

## 🚀 **SETUP EN 30 SECONDES**

### 1. Le fichier existe déjà ! 
✅ **Fichier créé:** `F:\Git\XYPH-Project\config\api\api-keys.json`

### 2. Éditez le fichier avec vos clés :
```powershell
notepad "F:\Git\XYPH-Project\config\api\api-keys.json"
```

### 3. Remplacez les placeholders :
```json
{
  "providers": {
    "deepseek": {
      "apiKey": "COLLEZ_VOTRE_CLÉ_DEEPSEEK_ICI",
      "enabled": true
    },
    "ollama": {
      "apiKey": "",
      "enabled": true
    }
  }
}
```

## 🔑 **OBTENIR VOS CLÉS GRATUITES**

### **DeepSeek (Gratuit - Recommandé)**
1. 🌐 Aller sur : https://console.deepseek.com
2. 📝 Créer un compte
3. 🔑 API Keys → Create New Key
4. 📋 Copier la clé dans le fichier

### **Ollama (Local - Gratuit)**
1. 📥 Télécharger : https://ollama.ai
2. 💻 Installer Ollama
3. ⚡ Exécuter : `ollama pull llama3.2`
4. ✅ Pas de clé API nécessaire !

## 🛡️ **SÉCURITÉ GARANTIE**

- ✅ Le fichier est **automatiquement ignoré** par Git
- ✅ Vos clés **restent privées**
- ✅ **Jamais commitées** dans le repository

## 🧪 **TESTER**

```powershell
cd F:\Git\XYPH-Project
.\scripts\api\test_api_endpoints.ps1
```

---

## 📋 **RÉSUMÉ ULTRA RAPIDE**

1. **Fichier :** `F:\Git\XYPH-Project\config\api\api-keys.json` ✅ (existe déjà)
2. **Éditer :** `notepad "config\api\api-keys.json"`
3. **Clé gratuite :** DeepSeek sur console.deepseek.com
4. **Tester :** `.\scripts\api\test_api_endpoints.ps1`

**🎯 C'est tout ! Vos clés API sont configurées et sécurisées !**