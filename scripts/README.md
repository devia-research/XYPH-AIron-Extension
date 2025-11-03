# 🔧 Scripts d'Automatisation XYPH

Scripts PowerShell modulaires pour le développement, test, et déploiement.

## 📁 Modules

### 🚀 deployment/
Scripts de déploiement et packaging
- `deploy-extension.ps1` - Déploiement automatisé
- `package-extension.ps1` - Création des packages

### 🧪 testing/
Tests automatisés et validation
- `extension.tests.ps1` - Tests complets extension
- `api-tests.ps1` - Tests des APIs
- `integration-tests.ps1` - Tests d'intégration
- `health_check.ps1` - Vérification système

### 💻 development/
Workflows Git et environnement dev
- `git-workflow-sync.ps1` - Synchronisation Git
- `setup-dev-env.ps1` - Setup environnement
- `build-watch.ps1` - Surveillance changements

### 🛠️ maintenance/
Maintenance et outils utilitaires
- `fix_api_urls.ps1` - Correction URLs
- `cleanup.ps1` - Nettoyage fichiers
- `backup.ps1` - Sauvegarde projet

### 🌐 api/
Gestion et tests des APIs
- `setup_apis.ps1` - Configuration APIs
- `test_api_endpoints.ps1` - Tests endpoints
- `validate_keys.ps1` - Validation clés

## 🚀 Workflows Communs

### Développement quotidien
```powershell
# Synchroniser avec Git
.\development\git-workflow-sync.ps1 sync-dev

# Tester les changements
.\testing\extension.tests.ps1

# Vérifier les APIs
.\api\test_api_endpoints.ps1
```

### Déploiement
```powershell
# Tests complets
.\testing\integration-tests.ps1

# Déploiement
.\development\git-workflow-sync.ps1 test-and-deploy

# Vérification post-déploiement
.\testing\health_check.ps1
```

### Maintenance
```powershell
# Nettoyage
.\maintenance\cleanup.ps1

# Sauvegarde
.\maintenance\backup.ps1

# Réparation URLs
.\maintenance\fix_api_urls.ps1
```

## 📋 Bonnes Pratiques

1. **Toujours tester avant de déployer**
   ```powershell
   .\testing\extension.tests.ps1
   ```

2. **Synchroniser régulièrement**
   ```powershell
   .\development\git-workflow-sync.ps1 sync-dev
   ```

3. **Valider les APIs**
   ```powershell
   .\api\test_api_endpoints.ps1
   ```

4. **Surveiller la santé du système**
   ```powershell
   .\testing\health_check.ps1
   ```

---
**Scripts modulaires pour un workflow de développement efficace** 🎯