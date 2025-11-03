# 📱 Installation AIron sur Android (Kiwi Browser)

## ✅ Prérequis
- Un smartphone Android
- Kiwi Browser installé (gratuit sur Play Store)
- Votre extension AIron (dossier `extension/`)

---

## 🚀 Étapes d'installation

### 1️⃣ Installer Kiwi Browser
1. Ouvrez **Google Play Store**
2. Recherchez **"Kiwi Browser"**
3. Installez l'application
4. Ouvrez Kiwi Browser

### 2️⃣ Préparer l'extension
**Option A: Depuis votre PC**
1. Compressez le dossier `extension/` en ZIP
   ```powershell
   Compress-Archive -Path "f:\Git\XYPH-Project\extension\*" -DestinationPath "f:\Git\XYPH-Project\AIron-Extension.zip"
   ```
2. Transférez `AIron-Extension.zip` sur votre téléphone (email, Drive, USB)

**Option B: Via GitHub**
1. Push votre extension sur GitHub
2. Téléchargez-la depuis votre téléphone

### 3️⃣ Installer l'extension dans Kiwi
1. Ouvrez **Kiwi Browser**
2. Appuyez sur les **3 points** (menu) en haut à droite
3. Sélectionnez **"Extensions"**
4. Activez le **"Mode développeur"** (en haut à droite)
5. Appuyez sur **"+ (depuis .zip)"** ou **"Charger l'extension non empaquetée"**
6. Naviguez vers `AIron-Extension.zip` ou le dossier décompressé
7. Sélectionnez et confirmez

### 4️⃣ Configuration
1. L'icône AIron apparaît dans la barre d'extensions
2. Cliquez dessus pour ouvrir la **sidebar**
3. Allez dans **Paramètres** (⚙️)
4. Configurez votre **clé API DeepSeek**
5. Sauvegardez

---

## 🎤 Fonctionnalités vocales sur Android

### ✅ Fonctions qui marchent:
- 🎤 **Reconnaissance vocale** (Chrome Speech API)
- 🔊 **Synthèse vocale (TTS)** en français
- 🗣️ **Commandes vocales** (génère, analyse, etc.)
- 🎙️ **Dictée vocale**
- 💬 **Chat naturel**

### ⚠️ Limitations possibles:
- Enregistrement audio peut nécessiter permissions supplémentaires
- Qualité voix TTS dépend du système Android
- Certaines API Web peuvent avoir restrictions

---

## 🧪 Test rapide

1. Ouvrez AIron dans Kiwi
2. Cliquez **"✓ Tester Micro"** → Autorisez
3. Cliquez **"🎤 Commande Vocale"**
4. Dites: *"Génère un script PowerShell"*
5. XYPH devrait répondre en français ET parler! 🔊

---

## 🔧 Dépannage

### Extension ne s'affiche pas
- Vérifiez que le fichier `manifest.json` est à la racine du dossier/ZIP
- Réinstallez l'extension
- Redémarrez Kiwi Browser

### Microphone ne marche pas
- Allez dans **Paramètres Android** → **Applications** → **Kiwi Browser**
- Autorisez **"Microphone"**
- Redémarrez Kiwi

### TTS ne parle pas
- Vérifiez les **paramètres de synthèse vocale Android**:
  - Paramètres → Accessibilité → Synthèse vocale
  - Installez une voix française si nécessaire

### Clé API ne se sauvegarde pas
- Utilisez `chrome.storage.local` (déjà configuré)
- Vérifiez les permissions dans `manifest.json`

---

## 📦 Structure de l'extension (pour référence)

```
extension/
├── manifest.json          ← OBLIGATOIRE à la racine
├── background.js
├── content.js
├── icons/
├── ui/
│   ├── sidebar/
│   │   ├── sidebar.html
│   │   └── sidebar.js    ← Système vocal complet
│   └── popup/
└── api/
```

---

## 🎯 Commandes vocales disponibles

| Commande | Action |
|----------|--------|
| "Génère un script..." | Génération de code |
| "Analyse cette image" | Vision multimodale |
| "Recherche fichier..." | Recherche intelligente |
| "Copie" | Copier le script |
| "Efface" / "Nettoie" | Vider l'éditeur |
| "Sauvegarde" | Sauvegarder dans bibliothèque |

---

## 📞 Support

Si l'installation échoue:
1. Vérifiez la version de Kiwi Browser (doit être récente)
2. Essayez de décompresser le ZIP manuellement
3. Vérifiez les logs: Menu Kiwi → Plus d'outils → Console développeur

---

**✅ Bon à savoir:** Kiwi Browser supporte les extensions Chrome Desktop sans modification! AIron devrait fonctionner tel quel. 🚀
