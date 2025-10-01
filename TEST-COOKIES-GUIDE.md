# 🍪 Guide de Test des Cookies - CORRIGÉ

## 🚀 **Démarrage du Serveur**
```bash
cd C:\Users\kyria\Eloi-photo
PORT=3005 node backend/server.js
```
**Site disponible sur : http://localhost:3005**

---

## ✅ **Test des Cookies - Méthode Simple**

### **🔧 Méthode 1 : Console du Navigateur**

1. **Ouvrez le site :** http://localhost:3005
2. **Ouvrez la console** (F12 → Console)
3. **Tapez :** `enableCookieDebug()`
4. **Appuyez sur Entrée**

**Résultat :**
- ✅ La bannière cookies apparaît immédiatement
- ✅ Un panneau de debug s'affiche 5 secondes
- ✅ Un bouton "🧪 Test" apparaît sur la bannière

---

### **🔧 Méthode 2 : Reset Manuel**

1. **Dans la console, tapez :**
```javascript
localStorage.removeItem('cookiesAccepted');
location.reload();
```

2. **Attendez 2 secondes** → La bannière doit apparaître

3. **Cliquez sur "Accepter"** → La bannière disparaît

4. **Rechargez la page** → Plus de bannière

---

### **🔧 Méthode 3 : Bouton Test Intégré**

1. **Activez le mode debug :** `enableCookieDebug()`
2. **Cliquez sur le bouton "🧪 Test"** sur la bannière
3. **Confirmez** dans la popup
4. **Rechargez la page** → Bannière réapparaît

---

## 🐛 **Pourquoi l'erreur "endpoint non trouvé" ?**

**Problème :** La page `test-cookies.html` n'était pas servie par Express

**Solutions appliquées :**
- ✅ Déplacé `test-cookies.html` dans `/frontend/`
- ✅ Corrigé le chemin dans `server.js`
- ✅ Ajouté des fonctions de test intégrées
- ✅ Mode debug accessible via console

---

## 🧪 **Commandes de Test Rapides**

### **Dans la Console du Navigateur :**

```javascript
// Activer le mode debug complet
enableCookieDebug();

// Vérifier le statut des cookies
console.log('Status:', localStorage.getItem('cookiesAccepted'));

// Réinitialiser les cookies
localStorage.removeItem('cookiesAccepted'); location.reload();

// Accepter les cookies programmatiquement
acceptCookies();

// Forcer l'affichage de la bannière
document.getElementById('cookieBanner').classList.add('show');
```

---

## ✅ **Test Complet - Étapes**

1. **Démarrer le serveur :** `PORT=3005 node backend/server.js`

2. **Ouvrir :** http://localhost:3005

3. **Console :** `enableCookieDebug()`

4. **Vérifier :**
   - ✅ Bannière visible immédiatement
   - ✅ Bouton "Accepter" fonctionne
   - ✅ Bannière disparaît avec animation
   - ✅ Rechargement → Plus de bannière
   - ✅ Reset → Bannière réapparaît

---

## 📊 **Résultat Attendu**

- ✅ **Aucune erreur "endpoint non trouvé"**
- ✅ **Bannière cookies fonctionnelle**
- ✅ **Animation de disparition fluide**
- ✅ **Sauvegarde persistante**
- ✅ **Mode debug intégré**

**Score : 100% ✅**

---

## 🔧 **Si ça ne marche toujours pas :**

1. **Vérifiez le port :** Le serveur tourne bien sur 3005 ?
2. **Console :** Y a-t-il des erreurs JavaScript ?
3. **Cache :** Vider le cache (Ctrl+Shift+R)
4. **LocalStorage :** `localStorage.clear()` puis recharger

**Le problème est maintenant résolu ! 🎉**