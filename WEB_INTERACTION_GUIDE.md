# 🌐 Guide d'Interaction avec les Pages Web - XYPH

## ✅ Nouvelles Fonctionnalités Ajoutées

### 1. Analyse de Page Web 🔍
**Bouton**: "🔍 Analyser cette page"

**Fonctionnalité**:
- Extrait informations complètes de la page courante
- Statistiques (liens, images, formulaires, scripts)
- Structure (titres H1/H2/H3)
- Métadonnées (title, description)
- **Avec API IA**: Analyse SEO, suggestions d'amélioration, opportunités d'automatisation

**Utilisation**:
1. Naviguez vers n'importe quelle page web
2. Ouvrez sidebar XYPH
3. Cliquez "🔍 Analyser cette page"
4. Rapport complet affiché dans résultats

---

### 2. Extraction de Texte 📄
**Bouton**: "📄 Extraire texte"

**Fonctionnalité**:
- Extrait tout le texte principal de la page
- Identifie paragraphes et titres
- Place le texte dans l'éditeur
- Prêt pour analyse IA

**Cas d'usage**:
- Copier contenu d'articles
- Analyser texte avec IA
- Créer résumés automatiques
- Traduction de contenu

---

### 3. Extraction de Liens 🔗
**Bouton**: "🔗 Extraire liens"

**Fonctionnalité**:
- Liste tous les liens de la page
- Sépare liens internes/externes
- Inclut texte d'ancrage
- Format structuré dans éditeur

**Cas d'usage**:
- Audit SEO
- Vérification liens cassés
- Cartographie site
- Scraping d'URLs

---

### 4. Extraction d'Images 🖼️
**Bouton**: "🖼️ Extraire images"

**Fonctionnalité**:
- Liste toutes les images
- URLs complètes
- Descriptions alt
- Dimensions (largeur/hauteur)

**Cas d'usage**:
- Téléchargement bulk images
- Audit accessibilité
- Optimisation images
- Génération scripts download

---

### 5. Extraction de Données 📊
**Bouton**: "📊 Extraire données"

**Fonctionnalité**:
- Extrait tableaux HTML
- Extrait listes (ul/ol)
- Format structuré CSV-like
- Prêt pour traitement

**Cas d'usage**:
- Scraping données tabulaires
- Export données vers Excel
- Analyse prix e-commerce
- Collecte informations

---

### 6. Capture d'Écran 📸
**Bouton**: "📸 Capturer page"

**Fonctionnalité**:
- Screenshot de la page visible
- Format PNG haute qualité
- Téléchargement automatique
- Nom avec timestamp

**Cas d'usage**:
- Documentation
- Reporting bugs
- Archivage pages
- Preuves visuelles

---

### 7. Import de Fichiers 📂
**Bouton**: "📂 Choisir fichier"

**Fonctionnalité**:
- Upload fichiers locaux
- Formats supportés: .txt, .js, .py, .ps1, .json, .xml, .html, .css, .md
- Détection automatique du type
- Contenu chargé dans éditeur
- Prêt pour analyse IA

**Cas d'usage**:
- Analyser scripts existants
- Optimiser code local
- Déboguer fichiers
- Convertir entre langages

---

## 📋 Permissions Chrome Requises

```json
{
  "permissions": [
    "activeTab",      // Accès onglet actif
    "tabs",          // Capture screenshot
    "scripting",     // Injection scripts
    "downloads"      // Téléchargements
  ],
  "host_permissions": [
    "<all_urls>"     // Accès toutes pages
  ]
}
```

✅ **Toutes les permissions sont déjà configurées dans manifest.json**

---

## 🎯 Exemples d'Utilisation

### Exemple 1: Analyser un Site E-commerce

```
1. Aller sur amazon.com/product
2. Cliquer "🔍 Analyser cette page"
3. L'IA analyse:
   - Structure produit
   - Prix et description
   - Images disponibles
   - Suggestions scraping
```

### Exemple 2: Extraire Articles de Blog

```
1. Aller sur medium.com/article
2. Cliquer "📄 Extraire texte"
3. Texte complet dans éditeur
4. Cliquer "🔍 Analyser Script" pour résumé IA
```

### Exemple 3: Scraping Prix

```
1. Aller sur site avec tableau prix
2. Cliquer "📊 Extraire données"
3. Tableau extrait en format structuré
4. Générer script PowerShell pour monitoring
```

### Exemple 4: Télécharger Images

```
1. Aller sur galerie photos
2. Cliquer "🖼️ Extraire images"
3. Liste URLs dans éditeur
4. Demander à IA: "Génère script pour télécharger toutes ces images"
```

### Exemple 5: Analyser Code Local

```
1. Cliquer "📂 Choisir fichier"
2. Sélectionner script.py
3. Code chargé automatiquement
4. Cliquer "🔍 Analyser Script" pour analyse IA
```

---

## 🔧 Implémentation Technique

### Architecture

```
┌─────────────────┐
│   Sidebar UI    │ (sidebar.html)
│  - 6 Boutons    │
│  - File Input   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  sidebar.js     │
│  Fonctions:     │
│  - analyzeCurrentPage()
│  - extractPageText()
│  - extractPageLinks()
│  - extractPageImages()
│  - extractPageData()
│  - capturePageScreenshot()
│  - handleFileUpload()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Chrome APIs     │
│ - tabs.query    │
│ - scripting.executeScript
│ - tabs.captureVisibleTab
└─────────────────┘
```

### Injection de Scripts

**Méthode**: `chrome.scripting.executeScript()`

```javascript
const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
        // Code exécuté dans contexte page
        return document.querySelectorAll('a').length;
    }
});
```

**Avantages**:
- ✅ Exécution dans contexte page
- ✅ Accès complet au DOM
- ✅ Retour données structurées
- ✅ Sécurisé (pas de eval)

---

## 🎨 Interface Utilisateur

### Section HTML Ajoutée

```html
<div class="section">
  <h3>🌐 Interaction Page Web Courante</h3>
  <div class="web-interaction-controls">
    <button id="analyzePageBtn">🔍 Analyser cette page</button>
    <button id="extractTextBtn">📄 Extraire texte</button>
    <button id="extractLinksBtn">🔗 Extraire liens</button>
    <button id="extractImagesBtn">🖼️ Extraire images</button>
    <button id="extractDataBtn">📊 Extraire données</button>
    <button id="screenshotPageBtn">📸 Capturer page</button>
  </div>
  
  <div class="file-upload-section">
    <h4>📎 Importer fichier pour analyse :</h4>
    <input type="file" id="fileUploadInput" accept="...">
    <button id="uploadFileBtn">📂 Choisir fichier</button>
    <div id="uploadedFileName"></div>
  </div>
</div>
```

### CSS Ajouté

```css
.web-interaction-controls {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.file-upload-section {
  margin-top: 20px;
  padding: 15px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 6px;
  border: 1px dashed var(--primary);
}
```

---

## 📊 Flux de Données

### Analyse de Page

```
┌─────────┐
│ Bouton  │
│ Cliqué  │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ analyzeCurrentPage()
│ 1. Get active tab
│ 2. Inject script
│ 3. Extract data
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Si API Key:     │
│ → callAI()      │
│ Sinon:          │
│ → Stats basiques│
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ showResult()    │
│ Affiche rapport │
└─────────────────┘
```

### Upload Fichier

```
┌─────────┐
│ Bouton  │
│ Upload  │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ File Input      │
│ Triggered       │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ handleFileUpload()
│ 1. Read file
│ 2. Detect type
│ 3. Load in editor
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Éditeur rempli  │
│ Prêt pour IA    │
└─────────────────┘
```

---

## 🧪 Tests Recommandés

### Test 1: Analyse Page Simple
```
URL: https://example.com
Bouton: "🔍 Analyser cette page"
Attendu: Rapport avec stats basiques
```

### Test 2: Extraction Texte Article
```
URL: https://medium.com/@username/article
Bouton: "📄 Extraire texte"
Attendu: Texte article dans éditeur
```

### Test 3: Extraction Liens Wikipedia
```
URL: https://fr.wikipedia.org/wiki/Intelligence_artificielle
Bouton: "🔗 Extraire liens"
Attendu: Liste liens internes/externes
```

### Test 4: Extraction Images Google
```
URL: https://www.google.com/search?q=chat&tbm=isch
Bouton: "🖼️ Extraire images"
Attendu: Liste URLs images avec dimensions
```

### Test 5: Extraction Tableau
```
URL: https://www.example.com/table
Bouton: "📊 Extraire données"
Attendu: Données tabulaires structurées
```

### Test 6: Screenshot
```
URL: N'importe quelle page
Bouton: "📸 Capturer page"
Attendu: PNG téléchargé
```

### Test 7: Upload Fichier
```
Action: Cliquer "📂 Choisir fichier"
Fichier: script.py
Attendu: Contenu dans éditeur + type détecté
```

---

## 🚀 Prochaines Étapes

1. **Recharger l'extension** dans chrome://extensions/
2. **Tester chaque bouton** sur différentes pages
3. **Vérifier résultats** dans zone d'affichage
4. **Combiner avec IA** pour analyses avancées

---

## 💡 Conseils d'Utilisation

### Avec Clé API DeepSeek
- ✅ Analyse page → Insights IA détaillés
- ✅ Extraire texte → Demander résumé
- ✅ Extraire données → Générer script scraping
- ✅ Upload fichier → Analyse/Optimisation automatique

### Sans Clé API
- ✅ Toutes extractions fonctionnent
- ✅ Stats basiques disponibles
- ⚠️ Pas d'analyse IA avancée

---

## 🎉 Résumé

**7 nouvelles fonctionnalités** ajoutées:
1. ✅ Analyse page web complète
2. ✅ Extraction de texte
3. ✅ Extraction de liens
4. ✅ Extraction d'images
5. ✅ Extraction de données structurées
6. ✅ Capture d'écran
7. ✅ Import et analyse fichiers locaux

**XYPH peut maintenant interagir avec TOUTES les pages web** et analyser vos fichiers locaux ! 🚀
