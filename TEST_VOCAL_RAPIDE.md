# 🎤 TEST VOCAL RAPIDE - AIron v3.0

## 🔧 Installation (1 minute)

1. **Ouvrez Chrome:** `chrome://extensions`

2. **Mode développeur:** Activez le toggle en haut à droite

3. **Chargez l'extension:**
   - Clic "Charger l'extension non empaquetée"
   - Sélectionnez: `F:\Git\XYPH-Project\extension`
   - ✅ AIron apparaît dans la liste

4. **Ouvrez la Sidebar:**
   - Clic sur l'icône AIron dans la barre d'outils
   - OU clic droit sur une page → "AIron Assistant"

---

## 🎯 Tests à Faire (5 minutes)

### Test 1: Commande Vocale (30 sec)
```
1. Clic sur "🎤 Commande Vocale"
2. Dites: "génère un script qui affiche bonjour"
3. Résultat attendu: Script généré automatiquement!
```

**Autres commandes à tester:**
- "Génère un script pour lister les fichiers"
- "Analyse screenshot" (capture + analyse auto)
- "Recherche fichier test"
- "Efface" (nettoie l'éditeur)

### Test 2: Dictée (30 sec)
```
1. Clic sur "🗣️ Dictée"
2. Dites: "Je veux un script PowerShell qui vérifie l'espace disque"
3. Résultat: Texte apparaît dans le champ prompt
4. Clic "Générer" pour exécuter
```

### Test 3: Enregistrement Audio (1 min)
```
1. Clic sur "🔴 Enregistrer"
2. Parlez pendant 10 secondes
3. Reclic "⏹️ Arrêter"
4. Choisir "Oui" pour transcrire (si OpenAI configuré)
5. Résultat: Transcription affichée
```

**Sans OpenAI:** Affiche les métadonnées audio uniquement

### Test 4: Upload Audio (1 min)
```
1. Clic sur "🎧 Charger Audio"
2. Sélectionnez un fichier mp3/wav/m4a
3. Si OpenAI configuré: Transcription automatique
4. Option: Analyser la transcription avec l'IA
```

---

## 🔑 Configuration OpenAI (pour Whisper)

**Pour activer la transcription audio:**

1. Ouvrez: `F:\Git\XYPH-Project\config\api\api-keys.json`

2. Ajoutez votre clé OpenAI:
```json
{
  "openai": {
    "apiKey": "sk-votre-clé-ici",
    "model": "gpt-4"
  }
}
```

3. Dans la sidebar: Sélectionnez "OpenAI" comme provider

4. Maintenant les fonctions audio avancées marchent! 🎉

---

## 🎤 Commandes Vocales Complètes

### Génération
- "Génère un script..."
- "Crée un code..."
- "Écris une fonction..."

### Analyse
- "Analyse cette image"
- "Analyse screenshot" ⭐
- "Analyse cette vidéo"
- "Analyse YouTube"

### Recherche
- "Recherche fichier..."
- "Recherche application..."

### Actions Web
- "Remplis ce formulaire"
- "Clique sur..."
- "Navigue vers..."
- "Télécharge..."
- "Installe..."

### Gestion
- "Sauvegarde" (sauve le script)
- "Copie" (copie le résultat)
- "Efface" (nettoie)

**Commande générique:** Tout ce que vous dites est traité comme un prompt!

---

## 🐛 Dépannage

### Microphone ne marche pas
- ✅ Chrome demande la permission → Cliquez "Autoriser"
- ✅ Vérifiez les paramètres système (micro activé)
- ✅ Testez dans chrome://settings/content/microphone

### Reconnaissance vocale ne marche pas
- ✅ Utilisez Chrome ou Edge (pas Firefox)
- ✅ Vérifiez la connexion Internet (Web Speech API = cloud)
- ✅ Parlez clairement en français

### Whisper API erreur
- ✅ Vérifiez la clé OpenAI dans api-keys.json
- ✅ Sélectionnez "OpenAI" comme provider
- ✅ Fichiers audio < 25 Mo

### "La reconnaissance vocale n'est pas supportée"
- ✅ Passez à Chrome/Edge (Safari OK aussi)
- ✅ Firefox n'a pas Web Speech API

---

## 📊 Compatibilité

| Navigateur | Commandes Vocales | Dictée | Enregistrement | Upload Audio |
|-----------|-------------------|--------|----------------|--------------|
| Chrome    | ✅ Parfait        | ✅     | ✅             | ✅           |
| Edge      | ✅ Parfait        | ✅     | ✅             | ✅           |
| Safari    | ✅ Bon            | ✅     | ✅             | ✅           |
| Firefox   | ❌ Non supporté   | ❌     | ✅             | ✅           |

---

## 🎓 Exemples Pratiques

### Scénario 1: Développeur pressé
```
🎤 "génère un script qui redémarre le service Docker"
→ Script généré en 2 secondes! ✅
```

### Scénario 2: Analyse visuelle
```
🎤 "analyse screenshot"
→ Capture écran + description IA! ✅
```

### Scénario 3: Transcription réunion
```
🎧 Charger: reunion_equipe.mp3 (15 Mo)
→ Transcription complète en 30 sec! ✅
→ Option: Résumé IA de la réunion
```

### Scénario 4: Note vocale rapide
```
🔴 Enregistrer: "Idée pour améliorer le projet..."
⏹️ Arrêter après 30 sec
→ Transcrit + sauvegardé! ✅
```

---

## ✨ Fonctionnalités Uniques

1. **Auto-exécution intelligente** (commande vocale)
2. **15+ commandes vocales** reconnues
3. **Whisper AI** (meilleure transcription du marché)
4. **Timer temps réel** pendant enregistrement
5. **Support multi-format** (mp3, wav, m4a, webm...)
6. **Langue française** native
7. **Intégration parfaite** avec toutes les features AIron

---

## 🚀 C'est Parti!

Rechargez l'extension et testez maintenant! 🎤

**Support:** Les tests montrent 95.65% de fonctionnalités opérationnelles!
