# 🎨 Guide des Fonctionnalités Multimodales - AIron v3.0

## Vue d'ensemble

AIron ne se limite plus aux scripts ! Vous pouvez maintenant :
- 📸 **Analyser des images** (upload, URL, screenshot, édition IA)
- 🎥 **Analyser des vidéos** (fichiers locaux, YouTube)
- 🔍 **Rechercher et télécharger** (fichiers, applications)
- ✍️ **Interagir avec les pages web** (insertion texte, remplissage formulaires, navigation automatique)

---

## 📸 Analyse d'Images

### 1. Charger une Image

**Bouton : 🖼️ Charger Image**

1. Cliquez sur le bouton "Charger Image"
2. Sélectionnez une image depuis votre disque dur
3. L'image s'affichera en aperçu
4. L'IA analysera automatiquement l'image

**Analyse fournie :**
- ✅ Contenu principal et éléments visibles
- ✅ Couleurs dominantes et ambiance
- ✅ Qualité et aspects techniques
- ✅ Suggestions d'amélioration
- ✅ Usages potentiels ou contexte

**Exemple de résultat :**
```
ANALYSE D'IMAGE: photo_vacances.jpg

1. Contenu: Paysage de montagne avec coucher de soleil
2. Couleurs: Orangés dominants (ciel), verts foncés (forêt)
3. Qualité: Haute résolution, léger flou de mouvement
4. Suggestions: Améliorer le contraste, recadrer à gauche
5. Usage: Arrière-plan desktop, impression 30x40cm
```

### 2. Analyser depuis URL

**Bouton : 🌐 URL Image**

1. Cliquez sur "URL Image"
2. Entrez l'URL complète de l'image (http:// ou https://)
3. L'image sera téléchargée et analysée

**Formats supportés :** JPG, PNG, GIF, WebP, BMP

**Exemple d'URL :**
```
https://example.com/images/photo.jpg
```

### 3. Capturer et Analyser Screenshot

**Bouton : 📸 Screenshot**

1. Naviguez vers la page web souhaitée
2. Ouvrez AIron dans la sidebar
3. Cliquez sur "Screenshot"
4. L'IA analysera automatiquement le screenshot de l'onglet actif

**Cas d'usage :**
- 🎨 Analyser le design d'un site web
- 🐛 Documenter un bug visuellement
- 📊 Extraire des données d'un graphique
- 🖼️ Identifier des éléments visuels

### 4. Éditer avec IA (DALL-E)

**Bouton : ✨ Éditer avec IA**

1. Chargez d'abord une image (bouton 🖼️)
2. Cliquez sur "Éditer avec IA"
3. Décrivez la modification souhaitée

**Exemples de modifications :**
- "Rendre le fond transparent"
- "Améliorer la luminosité de 30%"
- "Supprimer l'arrière-plan"
- "Changer les couleurs en tons sépia"
- "Ajouter un effet de flou artistique"

> **Note :** Cette fonctionnalité nécessite une clé API DALL-E (OpenAI). Elle sera implémentée dans une prochaine version.

---

## 🎥 Analyse de Vidéos

### 1. Charger une Vidéo

**Bouton : 🎥 Charger Vidéo**

1. Cliquez sur "Charger Vidéo"
2. Sélectionnez un fichier vidéo depuis votre disque
3. L'IA extraira les métadonnées :
   - Nom du fichier
   - Taille (en Mo)
   - Durée (en secondes)

**Formats supportés :** MP4, WebM, AVI, MOV, MKV

**Exemple de résultat :**
```
MÉTADONNÉES VIDÉO

Fichier: tutorial_python.mp4
Taille: 145.3 Mo
Durée: 12 min 34 sec

[Analyse complète disponible prochainement avec Google Video Intelligence API]
```

### 2. Analyser Vidéo YouTube

**Bouton : ▶️ YouTube URL**

1. Copiez l'URL d'une vidéo YouTube
2. Cliquez sur "YouTube URL"
3. Collez l'URL
4. L'IA analysera la vidéo

**Formats d'URL acceptés :**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
```

**Analyse fournie :**
- ✅ Titre et description de la vidéo
- ✅ Durée estimée
- ✅ Thématique principale
- ✅ Points clés à retenir
- ✅ Public cible

**Exemple de résultat :**
```
ANALYSE YOUTUBE

1. Titre: "Tutoriel Python - Les Bases en 20 Minutes"
2. Durée: 19:43
3. Thématique: Introduction à la programmation Python
4. Points clés:
   - Variables et types de données
   - Boucles for/while
   - Fonctions et modules
   - Bonnes pratiques
5. Public: Débutants en programmation
```

---

## 🔍 Recherche et Téléchargement

### 1. Trouver un Fichier

**Bouton : 📁 Trouver Fichier**

1. Cliquez sur "Trouver Fichier"
2. Décrivez le fichier recherché
3. L'IA fournira :
   - Type de fichier exact
   - Emplacements probables
   - Commandes PowerShell pour le trouver
   - Alternatives si introuvable

**Exemples de requêtes :**
- "Mon dernier rapport PDF sur les ventes"
- "Image de logo PNG avec fond transparent"
- "Fichier Excel budget 2024"
- "Vidéo MP4 enregistrée hier"

**Exemple de résultat :**
```
RECHERCHE DE FICHIER: "rapport ventes Q4 2024"

1. Type: PDF (Portable Document Format)

2. Emplacements probables:
   - C:\Users\[User]\Documents\
   - C:\Users\[User]\Downloads\
   - C:\Users\[User]\Desktop\

3. Commande PowerShell:
   Get-ChildItem -Path C:\Users\[User] -Recurse -Filter "*ventes*Q4*2024*.pdf" -ErrorAction SilentlyContinue

4. Alternatives:
   - Vérifier OneDrive/SharePoint
   - Rechercher dans Outlook (pièces jointes)
   - Consulter l'historique du navigateur
```

### 2. Trouver une Application

**Bouton : 💻 Trouver App**

1. Cliquez sur "Trouver App"
2. Décrivez l'application souhaitée
3. L'IA recommandera les 3 meilleures options

**Informations fournies :**
- ✅ Top 3 applications gratuites
- ✅ Fonctionnalités principales
- ✅ Liens de téléchargement officiels
- ✅ Configuration système requise
- ✅ Alternatives premium

**Exemple de résultat :**
```
RECOMMANDATIONS D'APPLICATIONS: "éditeur vidéo gratuit"

1. DaVinci Resolve (FREE)
   Fonctionnalités:
   - Montage professionnel multi-pistes
   - Étalonnage colorimétrique avancé
   - Effets visuels et transitions
   - Export 4K illimité
   
   Téléchargement: https://www.blackmagicdesign.com/products/davinciresolve
   Requis: Windows 10/11, 16GB RAM, GPU 4GB
   
2. Shotcut (OPEN SOURCE)
   Fonctionnalités:
   - Interface intuitive
   - Support tous formats vidéo
   - Filtres audio/vidéo
   - Pas de filigrane
   
   Téléchargement: https://shotcut.org/download/
   Requis: Windows 7+, 4GB RAM
   
3. OpenShot (OPEN SOURCE)
   Fonctionnalités:
   - Timeline multi-pistes
   - Animations 3D
   - Plus de 400 transitions
   - Facile pour débutants
   
   Téléchargement: https://www.openshot.org/download/
   Requis: Windows 7+, 4GB RAM
```

### 3. Assistant Téléchargement

**Bouton : ⬇️ Télécharger**

1. Cliquez sur "Télécharger"
2. Entrez l'URL du fichier à télécharger
3. Choisissez l'emplacement de sauvegarde
4. Le téléchargement démarre automatiquement

**Fonctionnalités :**
- 🔒 Détection automatique du nom de fichier
- 📂 Choix du dossier de destination
- ⚡ Utilise le gestionnaire de téléchargements Chrome
- 📊 Progression visible dans Chrome

**Formats supportés :** Tous (PDF, ZIP, EXE, ISO, MP4, etc.)

**Exemple :**
```
URL: https://releases.ubuntu.com/22.04/ubuntu-22.04.3-desktop-amd64.iso
Fichier détecté: ubuntu-22.04.3-desktop-amd64.iso
Taille: ~4.6 GB

[Téléchargement en cours via Chrome Downloads...]
```

### 4. Assistant Installation

**Bouton : 📦 Installer**

1. Cliquez sur "Installer"
2. Entrez le nom de l'application à installer
3. L'IA fournira un guide complet d'installation

**Guide d'installation inclut :**
- ✅ Lien de téléchargement officiel sécurisé
- ✅ Étapes d'installation détaillées
- ✅ Configuration recommandée
- ✅ Script PowerShell d'installation automatique
- ✅ Vérifications post-installation

**Exemple de résultat :**
```
GUIDE D'INSTALLATION: "VS Code"

1. TÉLÉCHARGEMENT OFFICIEL
   https://code.visualstudio.com/Download
   Version: Stable (Recommandée)
   Fichier: VSCodeUserSetup-x64-1.85.0.exe

2. ÉTAPES D'INSTALLATION
   a) Lancer le fichier .exe téléchargé
   b) Accepter les conditions d'utilisation
   c) Cocher:
      ☑ Créer une icône sur le Bureau
      ☑ Ajouter au PATH (important!)
      ☑ Enregistrer VS Code comme éditeur par défaut
      ☑ Ajouter au menu contextuel
   d) Cliquer sur "Installer"
   e) Lancer VS Code

3. CONFIGURATION RECOMMANDÉE
   - Installer extensions: Python, GitLens, Prettier
   - Thème: Dark+ (par défaut)
   - Font: 'Fira Code' avec ligatures

4. SCRIPT POWERSHELL (Installation automatique)
   # Télécharger et installer VS Code
   $url = "https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user"
   $output = "$env:TEMP\VSCodeSetup.exe"
   Invoke-WebRequest -Uri $url -OutFile $output
   Start-Process -FilePath $output -ArgumentList "/VERYSILENT /MERGETASKS=!runcode" -Wait
   
   # Installer extensions
   code --install-extension ms-python.python
   code --install-extension eamodio.gitlens
   code --install-extension esbenp.prettier-vscode

5. VÉRIFICATIONS POST-INSTALLATION
   ✓ Ouvrir PowerShell et taper: code --version
   ✓ Devrait afficher la version installée
   ✓ Créer un fichier test.py et vérifier la coloration syntaxique
```

---

## ✍️ Interaction avec Pages Web

### 1. Insérer du Texte

**Bouton : ✏️ Insérer Texte**

1. Placez votre curseur dans un champ de saisie sur la page web
2. Cliquez sur "Insérer Texte"
3. Entrez le texte à insérer
4. Le texte sera automatiquement inséré dans le champ actif

**Cas d'usage :**
- 💬 Réponses prédéfinies pour forums
- 📧 Templates d'emails
- 🔐 Insertion de mots de passe (depuis coffre-fort)
- 📝 Signatures automatiques

**Exemple :**
```
Texte à insérer: "Merci pour votre message. Je reviendrai vers vous dans les 24h."

[Le texte sera inséré dans le champ actif]
```

### 2. Remplir Formulaire avec IA

**Bouton : 📝 Remplir Formulaire**

1. Ouvrez une page avec un formulaire
2. Cliquez sur "Remplir Formulaire"
3. Entrez les données au format JSON
4. L'IA remplira automatiquement les champs correspondants

**Format JSON :**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "telephone": "0123456789",
  "message": "Demande d'information sur vos services"
}
```

**Fonctionnement :**
- L'IA recherche les champs par :
  - Attribut `name`
  - Attribut `id`
  - Attribut `placeholder`
- Remplit automatiquement les valeurs
- Déclenche les événements de validation

**Exemple de résultat :**
```
FORMULAIRE REMPLI

✓ Champ 'nom' rempli: "Dupont"
✓ Champ 'prenom' rempli: "Jean"
✓ Champ 'email' rempli: "jean.dupont@example.com"
✓ Champ 'telephone' rempli: "0123456789"
✓ Champ 'message' rempli: "Demande d'information..."

Total: 5 champs remplis avec succès
```

### 3. Cliquer sur un Élément

**Bouton : 👆 Cliquer Élément**

1. Cliquez sur "Cliquer Élément"
2. Entrez le sélecteur CSS ou le texte du bouton
3. L'IA trouvera et cliquera sur l'élément

**Exemples de sélecteurs :**
```css
/* Par ID */
#submit-button

/* Par classe */
.btn-primary

/* Par texte du bouton */
Valider

/* Par attribut */
[data-action="submit"]
```

**Cas d'usage :**
- 🤖 Automatisation de clics répétitifs
- 🧪 Tests d'interface utilisateur
- 📊 Navigation automatique dans des dashboards
- ⚡ Raccourcis pour actions fréquentes

**Exemple :**
```
Sélecteur: "Connexion"

[Recherche de l'élément...]
✓ Bouton trouvé: <button class="login-btn">Connexion</button>
✓ Clic effectué avec succès
```

### 4. Navigation Automatique

**Bouton : 🧭 Navigation Auto**

1. Cliquez sur "Navigation Auto"
2. Décrivez la tâche de navigation souhaitée
3. L'IA générera un script JavaScript d'automatisation
4. Confirmez l'exécution du script

**Exemples de tâches :**
- "Scroller jusqu'à la section 'Pricing'"
- "Cliquer sur tous les boutons 'Accepter les cookies'"
- "Remplir le formulaire de contact et soumettre"
- "Télécharger tous les fichiers PDF de la page"

**Exemple de résultat :**
```
TÂCHE: "Scroller jusqu'à la section Pricing"

SCRIPT GÉNÉRÉ:
--------------------------------
// Trouver la section Pricing
const pricingSection = document.querySelector('#pricing, [data-section="pricing"], h2:contains("Pricing")');

if (pricingSection) {
  // Scroller avec animation fluide
  pricingSection.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'start' 
  });
  
  console.log('✓ Navigation vers section Pricing réussie');
} else {
  console.error('✗ Section Pricing introuvable');
}
--------------------------------

Exécuter ce script ? [OK] [Annuler]
```

**⚠️ Sécurité :**
- Le script est toujours affiché avant exécution
- Vous devez confirmer manuellement
- Vérifiez le code pour éviter les actions non désirées

---

## 🔧 Configuration Requise

### Permissions Chrome

AIron nécessite les permissions suivantes pour les fonctionnalités multimodales :

| Permission | Usage |
|------------|-------|
| `tabs` | Capture de screenshots, accès à l'onglet actif |
| `downloads` | Téléchargement assisté de fichiers |
| `scripting` | Injection de scripts pour interaction avec pages |
| `storage` | Sauvegarde des préférences et scripts |
| `<all_urls>` | Accès aux images depuis URLs externes |

### APIs Externes (Optionnelles)

Pour certaines fonctionnalités avancées :

| Fonctionnalité | API Requise | Status |
|----------------|-------------|--------|
| Analyse d'image | GPT-4 Vision / DeepSeek-VL | ✅ Implémenté |
| Édition d'image IA | DALL-E 3 (OpenAI) | 🔜 Prochainement |
| Analyse vidéo complète | Google Video Intelligence | 🔜 Prochainement |
| Analyse YouTube | YouTube Data API v3 | 🔄 Optionnel |

---

## 📊 Limites et Restrictions

### Images
- **Taille max :** 10 Mo
- **Résolution max :** 4096x4096 px
- **Formats :** JPG, PNG, GIF, WebP, BMP

### Vidéos
- **Taille max :** 500 Mo (upload)
- **Durée max :** 30 minutes (analyse)
- **Formats :** MP4, WebM, AVI, MOV, MKV

### Téléchargements
- Respecte les limites du gestionnaire Chrome
- Dépend de l'espace disque disponible

### Interaction Web
- Fonctionne uniquement sur pages accessibles (pas de CSP strict)
- Certains sites peuvent bloquer l'injection de scripts
- Toujours respecter les conditions d'utilisation des sites

---

## 🐛 Résolution de Problèmes

### Image ne s'affiche pas
✅ Vérifiez que l'URL est accessible publiquement  
✅ Essayez de télécharger l'image manuellement d'abord  
✅ Certaines images sont protégées par CORS

### Screenshot échoue
✅ Assurez-vous que l'onglet est actif  
✅ Certains onglets (chrome://, about:) ne peuvent être capturés  
✅ Rechargez la page et réessayez

### Téléchargement bloqué
✅ Chrome peut bloquer les téléchargements automatiques  
✅ Vérifiez les paramètres de sécurité Chrome  
✅ Certains sites nécessitent une authentification

### Script d'interaction ne fonctionne pas
✅ Vérifiez que le sélecteur CSS est correct  
✅ Attendez que la page soit complètement chargée  
✅ Certains sites ont des protections anti-automation

---

## 💡 Astuces et Bonnes Pratiques

### Analyse d'Images
1. 📸 **Qualité :** Utilisez des images haute résolution pour une meilleure analyse
2. 🎨 **Contexte :** Ajoutez une description textuelle pour des résultats plus précis
3. 🔍 **Zoom :** Capturez des screenshots en plein écran pour plus de détails

### Analyse Vidéo
1. ⏱️ **Durée :** Les vidéos courtes (< 5 min) sont analysées plus rapidement
2. 🎬 **YouTube :** Préférez les vidéos avec sous-titres pour une meilleure analyse
3. 📝 **Notes :** Copiez l'analyse dans l'éditeur pour référence future

### Téléchargements
1. 🔐 **Sécurité :** Vérifiez toujours la source avant de télécharger
2. 📂 **Organisation :** Créez des dossiers dédiés par type de fichier
3. 🧹 **Nettoyage :** Supprimez régulièrement les fichiers téléchargés inutilisés

### Interaction Web
1. 🎯 **Sélecteurs :** Utilisez des IDs plutôt que des classes pour plus de fiabilité
2. ⏳ **Timing :** Ajoutez des délais (`setTimeout`) pour les pages dynamiques
3. 🧪 **Test :** Testez vos scripts sur des pages de test avant usage en production

---

## 🔗 Ressources Complémentaires

- 📘 [Documentation complète AIron](../user/README.md)
- 🎓 [Guide d'entraînement créatif](CREATIVE_TRAINING.md)
- 🔌 [Configuration des APIs](../../config/api/README.md)
- 🐛 [Rapporter un bug](https://github.com/your-repo/issues)

---

## 📝 Changelog

### v3.0.0 (2024)
- ✨ Ajout analyse d'images (upload, URL, screenshot)
- ✨ Ajout analyse de vidéos (upload, YouTube)
- ✨ Ajout recherche de fichiers/applications
- ✨ Ajout assistant téléchargement et installation
- ✨ Ajout interaction avec pages web (4 fonctionnalités)
- 🔧 16 nouveaux boutons dans l'interface
- 🔧 14 nouvelles méthodes JavaScript
- 🔧 Intégration Chrome APIs (tabs, downloads, scripting)

---

**🎨 AIron v3.0 - Votre Assistant IA Multimodal Complet**
