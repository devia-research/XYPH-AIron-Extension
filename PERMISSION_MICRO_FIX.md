# 🎤 CORRECTION PERMISSION MICROPHONE

## ❌ Problème Détecté:
```
Erreur: not-allowed
→ Permission microphone REFUSÉE par Chrome
```

## ✅ SOLUTION (2 étapes):

### Étape 1: Autoriser le Microphone dans Chrome

**Option A - Via l'icône cadenas:**
1. Ouvrez la sidebar AIron
2. Clic sur **🔒** (ou ⓘ) dans la barre d'adresse Chrome
3. Cherchez "Microphone"
4. Sélectionnez **"Autoriser"**
5. Rechargez l'extension (F5 ou ⟳)

**Option B - Via les paramètres:**
1. Chrome → `chrome://settings/content/microphone`
2. Section "Autorisé à utiliser le microphone"
3. Clic "Ajouter"
4. Ajoutez: `chrome-extension://*`
5. OU trouvez l'ID de l'extension AIron dans la liste

**Option C - Réinitialiser et réautoriser:**
1. `chrome://extensions`
2. Trouvez AIron
3. Clic sur "Détails"
4. Tout en bas: "Autorisations du site"
5. Réinitialisez les permissions
6. Rechargez l'extension
7. Au prochain clic vocal → Chrome redemandera permission → **Autoriser**

### Étape 2: Tester à nouveau

Après avoir autorisé:

1. **Rechargez l'extension**: `chrome://extensions` → AIron → ⟳
2. **Ouvrez sidebar AIron**
3. **Clic "🎤 Commande Vocale"**
4. Chrome peut redemander permission → **AUTORISER**
5. **Parlez**: "génère un script hello world"
6. ✅ Devrait fonctionner!

---

## 🔍 Vérification

**Test rapide:**
```powershell
# Ouvrir la page de test
Start-Process "test-voice-simple.html"
```

Si ça marche dans `test-voice-simple.html` mais pas dans l'extension:
→ C'est uniquement un problème de permission Chrome pour l'extension

Si ça ne marche nulle part:
→ Vérifiez que votre microphone fonctionne (Paramètres Windows → Son)

---

## 📋 Checklist Debug

- [ ] Microphone fonctionne dans Windows (testez avec Enregistreur vocal)
- [ ] `test-voice-simple.html` fonctionne
- [ ] Permission autorisée dans Chrome pour l'extension
- [ ] Extension rechargée après avoir donné permission
- [ ] Pas d'autre application qui bloque le micro

---

## 💡 Astuce

Après avoir autorisé, **rechargez TOUJOURS l'extension** sinon la permission ne sera pas active!

```
chrome://extensions → AIron → ⟳ RECHARGER
```

---

## 🎯 Ce qui va s'afficher maintenant

**Avant (erreur):**
```
❌ Erreur: not-allowed
```

**Après (succès):**
```
🎤 Écoute... Dites votre commande
📝 Commande reçue: "génère un script..."
🤖 RÉSULTAT: [Script généré]
```
