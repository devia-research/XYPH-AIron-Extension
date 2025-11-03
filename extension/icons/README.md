# 🎨 Icônes Extension XYPH

Collection complète d'icônes pour l'extension Chrome AI Script Commander.

## 📁 Structure des Icônes

### 🔧 Icônes Standard (Manifest)
- `icon16.png` - Icône 16x16 pour la barre d'outils Chrome
- `icon48.png` - Icône 48x48 pour la page des extensions
- `icon128.png` - Icône 128x128 pour le Chrome Web Store

### 🎯 Icônes Spécialisées
- `toolbar-icon.png` - Icône optimisée 16x16 pour toolbar (pixel perfect)
- `favicon.png` - Favicon 32x32 pour les pages web
- `store-icon.png` - Icône 256x256 pour le Chrome Web Store (grande taille)

### 📄 Versions SVG
- `icon16.svg` - Version vectorielle 16x16
- `icon48.svg` - Version vectorielle 48x48  
- `icon128.svg` - Version vectorielle 128x128

## 🎨 Design

### Palette de Couleurs
- **Bleu Principal**: `#4F46E5` (RGB: 79, 70, 229)
- **Violet Accent**: `#7C3AED` (RGB: 124, 58, 237)
- **Rose Accent**: `#EC4899` (RGB: 236, 72, 153)
- **Vert Badge**: `#10B981` (RGB: 16, 185, 129)
- **Blanc**: `#FFFFFF` pour le texte

### Éléments de Design
- **Logo Principal**: "XYPH" en typographie moderne
- **Badge AI**: Indicateur vert avec "AI" 
- **Style**: Gradient moderne avec coins arrondis
- **Optimisation**: Chaque taille optimisée pour sa résolution

## 🔧 Utilisation

### Dans le Manifest
```json
"icons": {
  "16": "../icons/icon16.png",
  "48": "../icons/icon48.png", 
  "128": "../icons/icon128.png"
}
```

### Rechargement d'Extension
Après modification des icônes :
1. Aller dans `chrome://extensions/`
2. Cliquer sur "Recharger" pour l'extension XYPH
3. Les nouvelles icônes apparaissent immédiatement

## 🛠️ Régénération

Pour régénérer les icônes :
```powershell
# Icônes de base (PNG + SVG)
& "scripts/tools/generate-icons.ps1" -Verbose

# Icônes PNG simplifiées
& "scripts/tools/generate-png-icons.ps1"

# Icônes additionnelles (toolbar, favicon, store)
& "scripts/tools/generate-additional-icons.ps1"
```

## 📊 Statistiques

| Fichier | Taille | Format | Usage |
|---------|--------|--------|-------|
| icon16.png | 0.3 KB | PNG | Toolbar Chrome |
| icon48.png | 0.9 KB | PNG | Page Extensions |
| icon128.png | 2.1 KB | PNG | Chrome Store |
| toolbar-icon.png | 0.3 KB | PNG | Toolbar optimisée |
| favicon.png | 0.5 KB | PNG | Favicon web |
| store-icon.png | 3.5 KB | PNG | Store (grande) |
| *.svg | ~1.5 KB | SVG | Versions vectorielles |

## 🎯 Formats Supportés

- **PNG**: Format standard pour Chrome extensions
- **SVG**: Versions vectorielles (supportées par Chrome)
- **Résolutions**: 16x16, 32x32, 48x48, 128x128, 256x256

## 🔄 Historique

- **v1.0** - Icônes PNG de base générées
- **v1.1** - Ajout versions SVG avec gradients
- **v1.2** - Icônes spécialisées (toolbar, favicon, store)
- **v1.3** - Optimisation pixel-perfect pour petites tailles

---

*Générées automatiquement par les scripts XYPH le 3 novembre 2025*