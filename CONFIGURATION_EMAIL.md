# 📧 Configuration Email - Instructions

## ⚠️ IMPORTANT : Configuration requise pour recevoir les emails du formulaire de contact

### 🎯 Objectif
Permettre au site d'envoyer des emails via votre compte Gmail **jeannoseloi@gmail.com**

---

## 📝 Étapes à suivre (5 minutes)

### **Étape 1 : Activer la validation en 2 étapes**

1. Ouvrir : https://myaccount.google.com/security
2. Se connecter avec **jeannoseloi@gmail.com**
3. Dans la section "Connexion à Google", cliquer sur **"Validation en deux étapes"**
4. Suivre les instructions pour l'activer (SMS ou appli Google Authenticator)

---

### **Étape 2 : Créer un mot de passe d'application**

1. Ouvrir : https://myaccount.google.com/apppasswords
2. Se connecter si demandé
3. Dans "Sélectionner l'application", choisir **"Autre (nom personnalisé)"**
4. Taper : **"Portfolio Site Web"**
5. Cliquer sur **"GÉNÉRER"**
6. **COPIER** le mot de passe affiché (16 caractères, exemple: `abcd efgh ijkl mnop`)
   ⚠️ Ce mot de passe ne sera affiché qu'une seule fois !

---

### **Étape 3 : Mettre à jour le fichier `.env`**

1. Ouvrir le fichier `.env` à la racine du projet
2. Remplacer la ligne :
   ```
   SMTP_PASS=VOTRE_MOT_DE_PASSE_APPLICATION_ICI
   ```
   Par :
   ```
   SMTP_PASS=abcd efgh ijkl mnop
   ```
   (en remplaçant par votre vrai mot de passe généré à l'étape 2)

3. **Sauvegarder** le fichier `.env`

---

### **Étape 4 : Redémarrer le serveur**

Dans le terminal :
```bash
# Arrêter le serveur (Ctrl+C)
# Puis le redémarrer
npm start
```

---

## ✅ Test

1. Aller sur le site : http://localhost:3002
2. Remplir le formulaire de contact
3. Cliquer sur "Envoyer"
4. Vous devriez recevoir :
   - ✉️ Un email avec le message du client sur **jeannoseloi@gmail.com**
   - ✉️ Le client reçoit une confirmation automatique

---

## 🔒 Sécurité

- ✅ Ne **JAMAIS** partager ce mot de passe d'application
- ✅ Le fichier `.env` est dans `.gitignore` (non publié sur GitHub)
- ✅ Si compromis, vous pouvez le révoquer et en créer un nouveau

---

## 💡 Problèmes courants

### "Invalid login" ou "Bad credentials"
➡️ Le mot de passe d'application est incorrect ou pas encore créé
➡️ Solution : Refaire l'étape 2

### "2-Step Verification required"
➡️ La validation en 2 étapes n'est pas activée
➡️ Solution : Faire l'étape 1 d'abord

### Emails non reçus
➡️ Vérifier le dossier SPAM de Gmail
➡️ Vérifier que `PHOTOGRAPHER_EMAIL` dans `.env` est correct

---

## 📞 Support

Si vous avez des questions, contactez votre développeur.

**Fichier créé le :** 1er octobre 2025

