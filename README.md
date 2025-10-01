# click.storm51 - Portfolio Photographe Professionnel

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/click-storm51)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

Un site web portfolio moderne et professionnel pour Eloi, photographe spécialisé dans les mariages, portraits et événements dans la Marne (51).

![Preview du site](frontend/assets/images/og-image.jpg)

## 🌟 Fonctionnalités

### ✨ Design & UX
- **Design moderne** avec animations fluides et effets visuels
- **Mode sombre/clair** avec sauvegarde des préférences
- **Responsive design** optimisé pour tous les appareils
- **Curseur personnalisé** et interactions avancées
- **Écran de chargement** animé avec logo

### 📸 Portfolio
- **Galerie interactive** avec filtrage par catégories
- **Lightbox avancée** avec navigation clavier
- **Lazy loading** pour optimiser les performances
- **Images optimisées** en multiple formats (WebP, JPEG)

### 💼 Fonctionnalités Business
- **Formulaire de contact** fonctionnel avec backend
- **Validation en temps réel** et envoi d'emails
- **Section témoignages** avec système d'étoiles
- **FAQ interactive** avec accordéons
- **Tarifs détaillés** par service

### 🔧 Technique
- **Backend Node.js/Express** sécurisé
- **Optimisation SEO** complète (Schema.org, meta tags)
- **Conformité RGPD** avec gestion des cookies
- **PWA ready** avec manifest.json
- **Performance optimisée** (compression, cache)

## 🚀 Installation

### Prérequis

- Node.js 16+ ([Télécharger](https://nodejs.org/))
- npm ou yarn
- Un serveur SMTP pour l'envoi d'emails

### 1. Cloner le projet

```bash
git clone https://github.com/yourusername/click-storm51.git
cd click-storm51
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Copiez le fichier d'exemple et configurez vos variables d'environnement :

```bash
cp .env.example .env
```

Éditez le fichier `.env` :

```env
# Configuration serveur
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://votre-domaine.fr
WEBSITE_URL=https://votre-domaine.fr

# Configuration email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application

# Email du photographe
PHOTOGRAPHER_EMAIL=contact@clickstorm51.fr
```

### 4. Personnalisation

#### Informations personnelles
Modifiez les fichiers suivants avec vos informations :

- `frontend/index.html` : Remplacez les informations de contact
- `frontend/mentions-legales.html` : Ajoutez vos informations légales
- `frontend/politique-confidentialite.html` : Personnalisez la politique

#### Images
1. Placez vos images dans `frontend/assets/images/original/`
2. Exécutez l'optimisation :

```bash
npm run optimize-images
```

#### Logo et Favicon
1. Placez votre logo (nommé `logo.png`) dans `frontend/assets/images/original/`
2. L'optimisation générera automatiquement tous les favicons

### 5. Démarrage

#### Développement
```bash
npm run dev
```

#### Production
```bash
npm start
```

Le site sera accessible sur `http://localhost:3000`

## 📁 Structure du projet

```
click-storm51/
├── backend/                    # Backend Node.js/Express
│   ├── routes/                 # Routes API
│   │   └── contact.js         # Route formulaire contact
│   ├── middleware/            # Middlewares personnalisés
│   ├── models/               # Modèles de données
│   ├── config/               # Configuration
│   └── server.js             # Serveur principal
├── frontend/                  # Frontend statique
│   ├── assets/               # Ressources statiques
│   │   ├── css/              # Feuilles de style
│   │   ├── js/               # Scripts JavaScript
│   │   └── images/           # Images optimisées
│   ├── index.html            # Page principale
│   ├── mentions-legales.html # Mentions légales
│   ├── politique-confidentialite.html # Politique confidentialité
│   └── sitemap.xml           # Plan du site
├── scripts/                   # Scripts utilitaires
│   └── optimize-images.js    # Optimisation d'images
├── package.json              # Dépendances et scripts
├── .env.example              # Configuration exemple
└── README.md                 # Documentation
```

## 🎨 Personnalisation

### Couleurs et thème

Modifiez les variables CSS dans `frontend/assets/css/style.css` :

```css
:root {
    --primary: #0a0a0a;
    --accent: #ff6b35;          /* Couleur principale */
    --text-primary: #ffffff;
    /* ... autres variables */
}
```

### Portfolio

Pour ajouter des photos au portfolio :

1. Ajoutez vos images dans le HTML (`frontend/index.html`)
2. Respectez la structure existante avec les catégories
3. Optimisez les images avec le script fourni

### Services et tarifs

Modifiez la section services dans `frontend/index.html` :

```html
<div class="service-card">
    <div class="service-content">
        <div class="service-icon">💒</div>
        <h3>Votre service</h3>
        <p>Description du service...</p>
        <div class="service-price">À partir de XXX€</div>
    </div>
</div>
```

## 📧 Configuration Email

### Gmail (recommandé)

1. Activez l'authentification à 2 facteurs
2. Générez un mot de passe d'application
3. Utilisez ces paramètres :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
```

### Autres fournisseurs

- **Outlook** : `smtp-mail.outlook.com:587`
- **Yahoo** : `smtp.mail.yahoo.com:587`
- **Serveur dédié** : Consultez votre hébergeur

## 🔧 Scripts disponibles

```bash
# Démarrage en développement avec rechargement automatique
npm run dev

# Démarrage en production
npm start

# Optimisation des images
npm run optimize-images

# Construction et optimisation
npm run build

# Minification CSS
npm run minify-css
```

## 🚀 Déploiement

### Option 1: Serveur VPS/Dédié

1. Transférez les fichiers sur votre serveur
2. Installez Node.js et PM2
3. Configurez un reverse proxy (Nginx/Apache)
4. Démarrez avec PM2 :

```bash
pm2 start backend/server.js --name "click-storm51"
pm2 startup
pm2 save
```

### Option 2: Plateformes cloud

#### Vercel (Frontend uniquement)
```bash
npm install -g vercel
vercel --prod
```

#### Heroku (Full-stack)
```bash
# Créer une app Heroku
heroku create votre-app-name

# Configurer les variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set SMTP_HOST=smtp.gmail.com
# ... autres variables

# Déployer
git push heroku main
```

### Option 3: Netlify + Netlify Functions

1. Déployez le frontend sur Netlify
2. Convertissez les routes backend en Netlify Functions
3. Configurez les variables d'environnement

## 🔐 Sécurité

### Checklist de sécurité

- [ ] Variables d'environnement configurées
- [ ] HTTPS activé en production
- [ ] Headers de sécurité (Helmet.js)
- [ ] Rate limiting activé
- [ ] Validation des entrées utilisateur
- [ ] CORS configuré correctement
- [ ] Mots de passe SMTP sécurisés

### Headers de sécurité

Le projet inclut automatiquement :
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

## 📊 SEO et Performance

### SEO inclus
- ✅ Meta tags optimisés
- ✅ Schema.org markup
- ✅ Sitemap.xml
- ✅ Balises Open Graph
- ✅ URLs canoniques
- ✅ Optimisation mobile

### Performance
- ✅ Images optimisées (WebP + JPEG)
- ✅ Lazy loading
- ✅ Compression gzip
- ✅ Cache headers
- ✅ CSS/JS minifiés
- ✅ Preconnect des ressources externes

## 🧪 Tests

### Test local

1. Vérifiez que le formulaire de contact fonctionne
2. Testez la navigation et les animations
3. Validez l'affichage sur mobile/desktop
4. Testez le mode sombre/clair

### Validation

- **HTML** : [W3C Validator](https://validator.w3.org/)
- **CSS** : [CSS Validator](https://jigsaw.w3.org/css-validator/)
- **Performance** : [PageSpeed Insights](https://pagespeed.web.dev/)
- **SEO** : [Google Search Console](https://search.google.com/search-console)

## 🐛 Dépannage

### Problèmes courants

#### Le formulaire ne fonctionne pas
1. Vérifiez la configuration SMTP dans `.env`
2. Consultez les logs du serveur
3. Testez la connexion SMTP

#### Images non optimisées
1. Vérifiez que Sharp est installé : `npm install sharp`
2. Placez les images dans `frontend/assets/images/original/`
3. Exécutez `npm run optimize-images`

#### Erreur de démarrage
1. Vérifiez Node.js version 16+
2. Supprimez `node_modules` et réinstallez
3. Vérifiez les variables d'environnement

### Logs

Les logs sont disponibles dans :
- Console du navigateur (frontend)
- Terminal/console serveur (backend)
- Fichiers PM2 si utilisé

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Commitez vos changements (`git commit -m 'Ajouter une fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

- **Email** : contact@clickstorm51.fr
- **Issues** : [GitHub Issues](https://github.com/yourusername/click-storm51/issues)
- **Documentation** : [Wiki](https://github.com/yourusername/click-storm51/wiki)

## 🙏 Crédits

- **Développement** : Équipe click.storm51
- **Design** : Inspiré des meilleures pratiques UX/UI
- **Images** : [Unsplash](https://unsplash.com) (à remplacer par vos photos)
- **Icons** : Emojis Unicode

---

<div align="center">
  <p>Développé avec ❤️ pour les photographes passionnés</p>
  <p><strong>click.storm51</strong> - L'art de capturer l'émotion</p>
</div>