# 🧩 Extension Chrome XYPH

Code source modulaire de l'extension Chrome pour l'automatisation AI.

## 📁 Structure

```
extension/
├── core/               # 🔧 Fichiers principaux
│   ├── manifest.json   # Configuration extension
│   ├── background.js   # Service worker
│   └── content.js      # Script injection
├── ui/                 # 🎨 Interface utilisateur
│   ├── popup/          # Interface popup
│   ├── sidebar/        # Interface sidebar
│   └── styles/         # Feuilles de style
├── api/                # 🌐 Intégrations API
│   ├── providers/      # Providers AI (DeepSeek, Ollama, OpenAI)
│   ├── configs/        # Configurations API
│   └── fallback/       # Système de fallback
└── assets/             # 📁 Ressources statiques
    ├── icons/          # Icônes extension
    └── images/         # Images et assets
```

## 🔧 Installation Développeur

```bash
# Chrome Developer Mode
1. Ouvrir chrome://extensions/
2. Activer "Mode développeur"
3. "Charger l'extension non empaquetée"
4. Sélectionner le dossier extension/
```

## 🚀 Développement

```powershell
# Tester l'extension
..\scripts\testing\extension.tests.ps1

# Surveiller les changements
..\scripts\development\build-watch.ps1

# Déployer
..\scripts\deployment\deploy-extension.ps1
```

## 🧪 Tests

```powershell
# Tests unitaires UI
..\scripts\testing\extension.tests.ps1

# Tests d'intégration API
..\scripts\testing\api-tests.ps1
```

## 📋 Checklist Développement

- [ ] Modifier le code dans le bon module
- [ ] Tester avec `extension.tests.ps1`
- [ ] Vérifier les permissions dans `manifest.json`
- [ ] Valider les APIs avec `api-tests.ps1`
- [ ] Recharger l'extension dans Chrome
- [ ] Tester l'interface utilisateur

---
**Structure modulaire pour faciliter le développement et la maintenance** 🎯