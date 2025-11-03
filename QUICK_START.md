# 🚀 Démarrage Rapide - AIron v3.0

Bienvenue ! Ce guide vous aidera à maîtriser AIron en **5 minutes**.

---

## 📦 Installation

### Étape 1 : Charger l'Extension

1. Ouvrez Chrome et allez à `chrome://extensions/`
2. Activez le **Mode développeur** (coin supérieur droit)
3. Cliquez sur **Charger l'extension non empaquetée**
4. Sélectionnez le dossier `f:\Git\XYPH-Project\extension`
5. ✅ AIron apparaît dans vos extensions !

### Étape 2 : Configurer l'API

1. Cliquez sur l'icône AIron (sidebar Chrome)
2. Dans la section **Configuration API** :
   - Choisissez votre **Fournisseur** (DeepSeek, OpenAI, etc.)
   - Entrez votre **Clé API**
   - Sélectionnez un **Modèle**
3. Cliquez **Sauvegarder la Configuration**

> **💡 Besoin d'une clé API ?** Consultez [API Keys Guide](../config/api/QUICK_SETUP.md)

---

## ⚡ Premiers Pas : 5 Actions Essentielles

### 1️⃣ Générer un Script Bash

```
1. Section "Prompt" → Entrez:
   "Script bash pour sauvegarder /home/user vers /backup avec timestamp"

2. Cliquez "Générer"

3. Résultat dans l'éditeur :
   #!/bin/bash
   timestamp=$(date +%Y%m%d_%H%M%S)
   tar -czf /backup/home_backup_$timestamp.tar.gz /home/user
   echo "Sauvegarde créée: home_backup_$timestamp.tar.gz"

4. Cliquez "Copier" pour utiliser
```

### 2️⃣ Analyser une Image

```
1. Section "Analyse Multimodale" → Sous-section "Analyse d'Images"

2. Cliquez "🖼️ Charger Image"

3. Sélectionnez une image (JPG, PNG, etc.)

4. L'IA analyse automatiquement :
   - Contenu visible
   - Couleurs et ambiance
   - Qualité technique
   - Suggestions d'amélioration
   - Usages potentiels

5. Résultat affiché dans la zone de sortie
```

### 3️⃣ Rechercher une Application

```
1. Section "Recherche & Téléchargement"

2. Cliquez "💻 Trouver App"

3. Entrez le nom : "éditeur vidéo gratuit"

4. L'IA recommande :
   - Top 3 applications gratuites
   - Fonctionnalités principales
   - Liens de téléchargement officiels
   - Configuration requise

5. Copiez le lien et téléchargez
```

### 4️⃣ Remplir un Formulaire Automatiquement

```
1. Naviguez vers une page avec un formulaire

2. Section "Interaction Page Web" → Cliquez "📝 Remplir Formulaire"

3. Entrez les données au format JSON :
   {
     "nom": "Dupont",
     "email": "jean@example.com",
     "message": "Test"
   }

4. Formulaire rempli instantanément !

5. Vérifiez et soumettez
```

### 5️⃣ Capturer et Analyser un Screenshot

```
1. Naviguez vers n'importe quelle page web

2. Section "Analyse d'Images" → Cliquez "📸 Screenshot"

3. Screenshot capturé automatiquement

4. L'IA analyse :
   - Design de la page
   - Éléments visuels
   - Palette de couleurs
   - Recommandations

5. Parfait pour audits UX/UI !
```

---

## 🎯 Cas d'Usage Avancés

### 🤖 Automatisation Multi-Étapes

**Objectif :** Scroller vers "Pricing" puis télécharger le PDF

```
1. Cliquer "🧭 Navigation Auto"

2. Décrire : "Scroller vers section Pricing et télécharger le PDF tarifaire"

3. L'IA génère un script JavaScript :
   
   // Trouver section Pricing
   const pricing = document.querySelector('#pricing');
   pricing.scrollIntoView({ behavior: 'smooth' });
   
   // Attendre le scroll
   setTimeout(() => {
     // Trouver lien PDF
     const pdf = document.querySelector('a[href*="pricing.pdf"]');
     pdf.click();
   }, 1000);

4. Vérifier le code (TOUJOURS !)

5. Confirmer → Exécution automatique
```

### 📊 Analyse de Vidéo YouTube

**Objectif :** Résumer un tutoriel de 30 minutes

```
1. Copier l'URL YouTube du tutoriel

2. Section "Analyse Vidéo" → Cliquer "▶️ YouTube URL"

3. Coller : https://www.youtube.com/watch?v=dQw4w9WgXcQ

4. L'IA analyse :
   - Titre et description
   - Durée
   - Thématique principale
   - Points clés à retenir (liste numérotée)
   - Public cible

5. Gagnez 30 minutes en lisant le résumé !
```

### 🔍 Retrouver un Fichier Perdu

**Objectif :** Trouver "rapport_ventes_Q4_2024.xlsx"

```
1. Cliquer "📁 Trouver Fichier"

2. Décrire : "Mon fichier Excel de rapport des ventes du Q4 2024"

3. L'IA suggère :
   - Type : Fichier Excel (.xlsx)
   - Emplacements probables :
     * C:\Users\[User]\Documents\
     * C:\Users\[User]\Downloads\
   - Commande PowerShell :
     Get-ChildItem -Recurse -Filter "*ventes*Q4*2024*.xlsx"

4. Copier la commande PowerShell

5. Ouvrir PowerShell → Coller → Exécuter

6. Fichier trouvé ! 🎉
```

---

## 📚 Bibliothèque de Scripts

### Sauvegarder vos Scripts Favoris

```
1. Générez un script utile

2. Cliquez "💾 Sauvegarder dans Bibliothèque"

3. Donnez un nom : "Backup MySQL"

4. Ajoutez des tags : "database, backup, mysql"

5. Script sauvegardé dans Chrome Sync !
```

### Réutiliser un Script

```
1. Section "Bibliothèque de Scripts"

2. Recherchez par nom ou tag

3. Cliquez "⚡ Charger" sur le script

4. Script chargé dans l'éditeur

5. Modifiez si nécessaire → Générez
```

### Organiser vos Scripts

**8 actions disponibles :**

| Action | Icône | Fonction |
|--------|-------|----------|
| Nouveau | ➕ | Créer un nouveau script vide |
| Importer | 📂 | Importer depuis fichier .txt/.md |
| Rechercher | 🔍 | Filtrer par nom/tag |
| Charger | ⚡ | Charger dans l'éditeur |
| Modifier | ✏️ | Éditer nom/description/tags |
| Dupliquer | 📋 | Créer une copie |
| Supprimer | 🗑️ | Supprimer définitivement |
| Exporter | 💾 | Exporter tous en ZIP |

---

## ⚙️ Configuration Avancée

### Changer de Fournisseur API

**Passer de DeepSeek à OpenAI :**

```
1. Section "Configuration API"

2. Sélecteur "Fournisseur" → Choisir "OpenAI"

3. Interface mise à jour automatiquement :
   - Label : "Clé API OpenAI"
   - Endpoint : https://api.openai.com/v1/chat/completions
   - Modèles : gpt-4o, gpt-4-turbo, gpt-3.5-turbo

4. Entrer votre clé OpenAI

5. Sélectionner modèle : "gpt-4o"

6. Sauvegarder
```

### Personnaliser les Modèles

**Ajouter un fournisseur custom :**

```
1. Fournisseur → "Custom (Personnalisé)"

2. Configurer :
   - Endpoint API : https://votre-api.com/v1/chat
   - Clé API : votre_clé_secrète
   - Nom du modèle : votre-modele-v1

3. Tester avec un prompt simple

4. Sauvegarder si fonctionnel
```

---

## 🐛 Résolution de Problèmes Courants

### ❌ "Erreur API : Invalid Key"

**Solution :**
1. Vérifier que la clé est correcte (copier/coller sans espaces)
2. Tester la clé sur le site du fournisseur
3. Vérifier les quotas/crédits restants
4. Régénérer une nouvelle clé si nécessaire

### ❌ "Impossible de capturer le screenshot"

**Solution :**
1. Assurez-vous que l'onglet est actif (cliquez dessus)
2. Certains onglets système ne peuvent être capturés :
   - `chrome://` pages
   - `about:` pages
   - Extensions store
3. Essayez sur une vraie page web (ex: google.com)

### ❌ "Script d'interaction ne fonctionne pas"

**Solution :**
1. Vérifier le sélecteur CSS :
   - Ouvrir DevTools (F12)
   - Copier le sélecteur exact de l'élément
2. Attendre le chargement complet de la page
3. Certains sites bloquent l'injection de scripts (CSP)

### ❌ "Téléchargement bloqué"

**Solution :**
1. Chrome Settings → Privacy → Site Settings → Downloads
2. Autoriser les téléchargements multiples
3. Vérifier que le site ne nécessite pas d'authentification
4. Essayer avec un navigateur en mode incognito

---

## 💡 Astuces Pro

### 1. Raccourcis d'Efficacité

- **Ctrl+C** sur la zone de sortie = Copie automatique
- **Rechargement rapide** : Clic droit sur l'icône → Recharger
- **Historique des prompts** : Utilisez les flèches ↑↓ dans le champ prompt
- **Édition rapide** : Double-clic sur un script de la bibliothèque = Édition

### 2. Prompts Optimisés

**❌ Mauvais prompt :**
> "script python"

**✅ Bon prompt :**
> "Script Python pour analyser un CSV, filtrer les lignes où 'status' = 'active', et exporter en JSON"

**🌟 Excellent prompt :**
> "Script Python avec gestion d'erreurs pour :
> 1. Lire data.csv
> 2. Filtrer lignes avec status='active' ET date > 2024-01-01
> 3. Transformer en JSON avec format : {id, name, status, timestamp}
> 4. Sauvegarder dans output.json
> 5. Logger les erreurs dans errors.log"

### 3. Organisation de la Bibliothèque

**Système de tags recommandé :**

```
# Par langage
python, javascript, bash, powershell, sql

# Par fonction
backup, deploy, test, monitor, cleanup

# Par projet
projet-A, client-X, internal

# Par complexité
simple, intermediate, advanced

# Exemple de script bien tagué :
Nom: "Backup MySQL Automatique"
Tags: "database, backup, mysql, bash, advanced, projet-A"
Description: "Sauvegarde quotidienne avec rotation sur 7 jours"
```

### 4. Workflows Combinés

**Exemple : Analyse Complète d'un Site**

```
1. Screenshot de la page (📸)
   → Analyse du design

2. Navigation auto (🧭)
   → Extraction des liens importants

3. Génération script (✨)
   → Script de scraping basé sur l'analyse

4. Sauvegarde dans bibliothèque (💾)
   → Réutilisation future
```

---

## 📖 Aller Plus Loin

### Documentation Complète

- 📘 [Guide Multimodal Complet](../docs/user/MULTIMODAL_GUIDE.md) (700+ lignes)
- 🔧 [Résumé d'Implémentation](../MULTIMODAL_IMPLEMENTATION_SUMMARY.md)
- 🔑 [Configuration des APIs](../config/api/QUICK_SETUP.md)
- 🎓 [Formation Créative](../docs/training/CREATIVE_TRAINING.md)

### Exemples de Code

Consultez `tests/data/` pour des exemples de :
- Prompts optimisés
- Scripts générés
- Données JSON pour formulaires
- Sélecteurs CSS courants

### Communauté

- 🐛 [Rapporter un Bug](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)
- 📧 [Support Email](mailto:support@airon.dev)

---

## 🎯 Checklist de Démarrage

Cochez au fur et à mesure :

- [ ] Extension installée et visible dans Chrome
- [ ] Clé API configurée et testée
- [ ] Premier script généré avec succès
- [ ] Image analysée (upload ou screenshot)
- [ ] Vidéo YouTube résumée
- [ ] Application recherchée et téléchargée
- [ ] Formulaire rempli automatiquement
- [ ] Script sauvegardé dans la bibliothèque
- [ ] Navigation automatique testée
- [ ] Documentation complète parcourue

---

## 🏆 Vous Êtes Prêt !

Félicitations ! Vous maîtrisez maintenant les bases d'AIron.

**Prochaines étapes :**
1. Explorer les 14 fonctionnalités multimodales
2. Créer votre première automation complexe
3. Organiser votre bibliothèque de scripts
4. Partager vos meilleurs scripts avec la communauté

---

**⚡ AIron v3.0 - Votre Assistant IA Multimodal**

*Transformez votre workflow en quelques clics* 🚀
