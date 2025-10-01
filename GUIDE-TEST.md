# 🧪 Guide de Test - click.storm51

## 🚀 Comment tester le site

### 1. **Démarrer le serveur**
```bash
cd C:\Users\kyria\Eloi-photo
npm start
```
Le site sera disponible sur : **http://localhost:3002**

---

## ✅ **Tests à Effectuer**

### 🍪 **Test des Cookies RGPD**

1. **Réinitialiser les cookies :**
   - Ouvrez : http://localhost:3002/test-cookies.html
   - Cliquez sur "🗑️ Supprimer les cookies"

2. **Tester la bannière :**
   - Retournez sur : http://localhost:3002/
   - Attendez 2 secondes → La bannière cookies doit apparaître en bas
   - Cliquez sur "Accepter" → La bannière doit disparaître
   - Rechargez la page → La bannière ne doit plus réapparaître

3. **Test des paramètres :**
   - Réinitialisez avec test-cookies.html
   - Retournez sur le site
   - Cliquez sur "Paramètres" → Accepte automatiquement (comportement normal)

---

### 🌐 **Test des Icônes Sociales**

1. **Vérifier les icônes :**
   - Allez dans le footer du site
   - Les icônes doivent être des **vraies icônes SVG** (Instagram, Facebook, LinkedIn, Behance)
   - ❌ Plus d'emojis comme 📷 📘 💼 🎨

2. **Test du hover :**
   - Survolez les icônes → Elles doivent changer de couleur
   - Curseur personnalisé doit s'agrandir

---

### 🎨 **Test du Mode Sombre/Clair**

1. **Toggle de thème :**
   - Cliquez sur l'icône 🌙 en haut à droite
   - Le site doit passer en mode clair
   - L'icône doit changer en ☀️
   - Rechargez → Le thème doit être sauvegardé

---

### 📱 **Test du Responsive**

1. **Mode mobile :**
   - Réduisez la fenêtre ou F12 → mode mobile
   - Menu hamburger doit apparaître
   - Navigation doit être fonctionnelle
   - Bannière cookies doit s'adapter

---

### 📧 **Test du Formulaire de Contact**

1. **Validation :**
   - Essayez de soumettre un formulaire vide
   - Des erreurs doivent apparaître en rouge
   - Tapez un email invalide → Erreur spécifique

2. **Soumission valide :**
   - Remplissez tous les champs requis
   - Cliquez "Envoyer"
   - Message d'erreur SMTP attendu (normal sans config email)

---

### 🖼️ **Test du Portfolio**

1. **Filtres :**
   - Cliquez sur "Mariage", "Portrait", etc.
   - Les images doivent se filtrer avec animation

2. **Lightbox :**
   - Cliquez sur une image
   - Lightbox doit s'ouvrir
   - Navigation avec flèches ← →
   - Fermeture avec Échap ou clic à côté

---

### ❓ **Test de la FAQ**

1. **Accordéons :**
   - Cliquez sur une question
   - La réponse doit s'ouvrir/fermer
   - Une seule réponse ouverte à la fois

---

## 🐛 **Problèmes Résolus**

### ✅ **Icônes Sociales**
- **Avant :** Emojis 📷 📘 💼 🎨
- **Après :** Vraies icônes SVG Instagram, Facebook, LinkedIn, Behance

### ✅ **Cookies RGPD**
- **Problème :** Clic sur "Accepter" ne fonctionnait pas
- **Cause :** Bannière n'était pas visible + fonction incomplète
- **Solution :**
  - Amélioré la logique d'affichage
  - Ajouté vérification de l'élément DOM
  - Animation de disparition améliorée

---

## 🔧 **Si quelque chose ne fonctionne pas**

### 🍪 **Bannière cookies ne s'affiche pas :**
```javascript
// Dans la console du navigateur :
localStorage.removeItem('cookiesAccepted');
location.reload();
// Attendez 2 secondes
```

### 🎨 **Thème ne change pas :**
```javascript
// Dans la console :
localStorage.removeItem('theme');
location.reload();
```

### 📱 **Problème d'affichage :**
- Vérifiez la console (F12) pour d'éventuelles erreurs
- Rechargez la page (Ctrl + F5)

---

## 📊 **Résultat Attendu**

- ✅ Bannière cookies fonctionnelle
- ✅ Vraies icônes sociales SVG
- ✅ Mode sombre/clair sauvegardé
- ✅ Formulaire avec validation
- ✅ Portfolio interactif avec lightbox
- ✅ FAQ avec accordéons
- ✅ Design responsive
- ✅ Animations fluides
- ✅ Navigation active

**Score attendu : 100% ✅**

---

## 📞 **Pour tester en production**

1. Configurez vos paramètres SMTP dans `.env`
2. Remplacez les images par vos vraies photos
3. Modifiez les informations de contact
4. Déployez sur votre hébergeur

**Le site est prêt pour la production ! 🚀**