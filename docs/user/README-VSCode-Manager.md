# 🚀 VS Code Environment Manager

## 📋 Vue d'ensemble

Ce système complet permet de **sauvegarder et restaurer** facilement tout votre environnement Visual Studio Code sur n'importe quel PC. Fini les heures à reconfigurer vos extensions, paramètres et comptes !

## 🎯 Fonctionnalités

### ✅ Sauvegarde Complète
- **Extensions** : Liste et réinstallation automatique
- **Paramètres** : settings.json, keybindings, snippets
- **Workspaces** : Historique et données des projets
- **Thèmes** : Thèmes et packs d'icônes personnalisés
- **Configuration terminaux** : Profils PowerShell
- **Archive portable** : Backup complet en ZIP

### 🔐 Sauvegarde Sécurisée (Optionnel)
- **Tokens d'authentification** : GitHub, Azure, etc.
- **Clés API** : OpenAI, DeepSeek, Groq, etc.
- **Credentials Git** : Configuration utilisateur
- **Variables d'environnement** : Clés secrètes
- **Chiffrement** : Protection par mot de passe

### 🔄 Restauration Intelligente
- **Script automatique** : Restauration en un clic
- **Validation** : Vérification de l'intégrité
- **Guide pas-à-pas** : Instructions détaillées
- **Rollback** : Possibilité d'annuler

## 🚀 Utilisation Rapide

### Interface Interactive (Recommandé)
```powershell
.\vscode-manager.ps1
```

### Export Rapide
```powershell
# Sauvegarde standard
.\vscode-manager.ps1 -Action export

# Sauvegarde avec données sensibles
.\vscode-manager.ps1 -Action export -IncludeSecrets

# Archive portable
.\vscode-manager.ps1 -Action export -CreatePortable
```

### Import/Restauration
```powershell
.\vscode-manager.ps1 -Action import
```

## 📁 Structure des Scripts

```
📦 VS Code Environment Manager
├── 🎮 vscode-manager.ps1              # Interface principale
├── 📦 export-vscode-config.ps1        # Export extensions/paramètres
├── 🔐 export-vscode-secrets.ps1       # Export données sensibles
└── 📖 README.md                       # Ce fichier
```

## 🎮 Menu Interactif

```
🚀 VS Code Environment Manager
===============================

1. 📦 Export Complet (Extensions + Paramètres)
2. 🔐 Export Sécurisé (+ Mots de passe/Tokens)
3. 📱 Export Portable (Archive ZIP)
4. 🔄 Import/Restauration
5. 📊 Analyse de l'environnement actuel
6. ❌ Quitter
```

## 📦 Contenu d'un Backup Complet

```
📂 VSCode-Backup-20241102-143020/
├── 📁 Extensions/
│   ├── 📄 extensions-list.json        # Liste des extensions
│   └── 📜 reinstall-extensions.ps1    # Script de réinstallation
├── 📁 Settings/
│   ├── ⚙️ settings.json               # Paramètres utilisateur
│   ├── ⌨️ keybindings.json            # Raccourcis clavier
│   └── 📝 snippets/                   # Snippets personnalisés
├── 📁 Workspaces/
│   ├── 🗂️ workspaceStorage/           # Données des workspaces
│   └── 📋 *.code-workspace            # Fichiers workspace
├── 📁 Themes/
│   └── 🎨 [Thèmes personnalisés]      # Thèmes et icônes
├── 📁 Terminal/
│   └── 💻 [Profils PowerShell]        # Configuration terminaux
├── 📁 Secure/ (optionnel)
│   ├── 🔒 vscode-secrets-encrypted.dat # Données chiffrées
│   ├── 🔓 DECRYPT.ps1                 # Script de déchiffrement
│   └── 📋 RESTORE_GUIDE.md            # Guide de restauration
├── 🔄 RESTORE.ps1                     # Script de restauration
├── 📋 MANIFEST.json                   # Métadonnées du backup
└── 📦 VSCode-Backup-20241102-143020.zip # Archive portable
```

## 🔐 Sécurité

### Données Standard (Sûres)
- ✅ Extensions publiques
- ✅ Paramètres de configuration
- ✅ Thèmes et snippets
- ✅ Raccourcis clavier

### Données Sensibles (Attention)
- ⚠️ Tokens d'authentification
- ⚠️ Clés API privées
- ⚠️ Mots de passe Git
- ⚠️ Variables d'environnement secrètes

### Protection
- 🔒 **Chiffrement DPAPI Windows** pour les données sensibles
- 🔑 **Mot de passe maître** requis pour déchiffrement
- 📁 **Stockage séparé** des données sensibles
- ⚠️ **Avertissements** explicites sur la sécurité

## 🛠️ Installation et Configuration

### Prérequis
- Windows 10/11
- PowerShell 5.1+
- Visual Studio Code installé
- Accès en écriture au répertoire de backup

### Installation
1. Téléchargez tous les scripts dans un dossier
2. Ouvrez PowerShell en tant qu'administrateur
3. Exécutez : `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
4. Lancez : `.\vscode-manager.ps1`

### Configuration Initiale
```powershell
# Définir le chemin de sauvegarde par défaut
$BackupPath = "F:\VSCode-Backup"  # Modifiez selon vos besoins

# Premier backup
.\vscode-manager.ps1 -Action export -BackupPath $BackupPath
```

## 📊 Exemples d'Utilisation

### Scénario 1 : Nouveau PC
```powershell
# Sur l'ancien PC
.\vscode-manager.ps1 -Action export -CreatePortable

# Sur le nouveau PC
.\vscode-manager.ps1 -Action import
# Sélectionner l'archive copiée
```

### Scénario 2 : Sauvegarde Régulière
```powershell
# Automatiser avec une tâche planifiée
.\vscode-manager.ps1 -Action export -BackupPath "D:\Backups\VSCode"
```

### Scénario 3 : Partage d'Équipe
```powershell
# Export sans données sensibles pour partage
.\vscode-manager.ps1 -Action export
# Partager le dossier (sans /Secure/)
```

### Scénario 4 : Développeur avec Secrets
```powershell
# Backup complet avec chiffrement
.\vscode-manager.ps1 -Action export -IncludeSecrets
# Entrer un mot de passe fort
```

## 🚨 Dépannage

### Problèmes Courants

#### "Scripts désactivés"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### "VS Code non trouvé"
```powershell
# Vérifier l'installation
code --version
# Redémarrer PowerShell après installation VS Code
```

#### "Erreur de déchiffrement"
- Vérifiez le mot de passe
- Assurez-vous d'être sur le même utilisateur Windows
- Le fichier peut être corrompu

#### "Extensions non installées"
- Vérifiez la connexion internet
- Relancez : `.\reinstall-extensions.ps1`
- Certaines extensions peuvent nécessiter une authentification manuelle

### Logs et Diagnostic
Chaque backup génère un fichier `MANIFEST.json` avec les détails :
```json
{
  "backup_info": {
    "created_date": "2024-11-02 14:30:20",
    "computer_name": "MON-PC",
    "user_name": "monuser",
    "vscode_version": "1.84.2"
  }
}
```

## 📈 Maintenance

### Nettoyage des Anciens Backups
```powershell
# Supprimer les backups de plus de 30 jours
Get-ChildItem "F:\VSCode-Backup" | Where-Object { 
    $_.Name -match "Backup-\d{8}" -and 
    $_.CreationTime -lt (Get-Date).AddDays(-30) 
} | Remove-Item -Recurse -Force
```

### Mise à Jour des Scripts
1. Téléchargez les nouvelles versions
2. Comparez avec `git diff` ou manuellement
3. Testez sur un backup de test avant utilisation

## 🤝 Contributions

### Fonctionnalités Demandées
- [ ] Support Linux/macOS
- [ ] Interface graphique
- [ ] Synchronisation cloud automatique
- [ ] Backup incrémental
- [ ] Restauration sélective

### Structure de Développement
```
📂 Project/
├── 📁 src/
│   ├── core/          # Fonctions de base
│   ├── export/        # Modules d'export
│   ├── import/        # Modules d'import
│   └── security/      # Chiffrement et sécurité
├── 📁 tests/          # Tests unitaires
├── 📁 docs/           # Documentation
└── 📁 examples/       # Exemples d'utilisation
```

## 📜 Licence et Avertissements

### Utilisation
Ce script est fourni "tel quel" sans garantie. Testez toujours sur un environnement de test avant utilisation en production.

### Sécurité
- Ne partagez jamais vos backups avec données sensibles
- Utilisez des mots de passe forts pour le chiffrement
- Stockez les backups dans un endroit sécurisé
- Révoquez les tokens en cas de compromission

### Responsabilité
L'utilisateur est responsable de :
- La sécurité de ses données
- Le respect des licences des extensions
- La conformité aux politiques d'entreprise

---

## 🎯 Résumé

**VS Code Environment Manager** vous permet de :

✅ **Sauvegarder** : Extensions, paramètres, thèmes, secrets  
✅ **Restaurer** : En quelques clics sur n'importe quel PC  
✅ **Sécuriser** : Chiffrement des données sensibles  
✅ **Automatiser** : Scripts et interface intuitive  
✅ **Partager** : Configuration d'équipe standardisée  

**Fini les configurations perdues !** 🎉

---

*Généré pour le projet XYPH - $(Get-Date -Format "yyyy-MM-dd")*