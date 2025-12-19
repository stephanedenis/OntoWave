# 📚 OntoWave Documentation

Bienvenue dans la documentation OntoWave hébergée sur [ontowave.org](https://ontowave.org) !

## 🌊 Qu'est-ce qu'OntoWave ?

OntoWave est une bibliothèque JavaScript légère pour créer de la documentation interactive à partir de Markdown avec :
- 🌍 Support multilingue (FR/EN)
- 🎨 Coloration syntaxique Prism
- 📊 Diagrammes Mermaid
- 🔷 Rendu PlantUML
- 📐 Formules mathématiques (KaTeX)
- 🔌 Système de plugins extensible

## 📖 Documentation Principale

### Pour les Utilisateurs

- [🏠 Page d'accueil](https://ontowave.org)
- [📋 Release Notes](https://ontowave.org/release-notes.md) - **NOUVEAU** Historique des versions avec liens CDN
- [🗺️ Roadmap](https://ontowave.org/ROADMAP.md) - Feuille de route du projet
- [🚀 Guide de démarrage](https://ontowave.org/panini/README.md)

### Pour les Développeurs

- [🏗️ Architecture fractale](https://ontowave.org/panini/fractal-architecture.md)
- [🔌 Système de plugins](https://ontowave.org/PLUGIN-SYSTEM.md)
- [🌐 Intégration écosystème](https://ontowave.org/panini/ecosystem-integration.md)
- [📖 Documentation technique](https://ontowave.org/technical/)

## 🔗 Liens Rapides

### CDN

```html
<!-- unpkg -->
<script src="https://unpkg.com/ontowave@latest/dist/ontowave.min.js"></script>

<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/ontowave@latest/dist/ontowave.min.js"></script>
```

### NPM

```bash
npm install ontowave
```

### GitHub

- [📦 Repository](https://github.com/stephanedenis/OntoWave)
- [🐛 Issues](https://github.com/stephanedenis/OntoWave/issues)
- [💬 Discussions](https://github.com/stephanedenis/OntoWave/discussions)

## 📋 Release Notes

**Nouveau !** Consultez l'historique complet des versions avec liens CDN :

- [📋 Release Notes (EN)](https://ontowave.org/release-notes.md)
- [📋 Notes de Version (FR)](https://ontowave.org/release-notes.fr.md)
- [📋 Release Notes (EN detailed)](https://ontowave.org/release-notes.en.md)

**Dernière version** : v1.0.24  
**24 versions documentées** : v1.0.1 - v1.0.24  
**Liens CDN** : unpkg + jsDelivr pour toutes versions

## 🎯 Versions

### Actuelle

- **v1.0.24** (25 oct 2025) - Fix bouton Home en mode routing

### Prévues

- **v1.1.0** (Déc 2025) - Performance & UX
- **v1.2.0** (Mars 2026) - Extensibilité
- **v2.0.0** (Sept 2026) - Architecture Next-Gen

## 🗂️ Structure du dossier docs/

```
docs/
├── index.html                              # Page principale (dogfooding)
├── ontowave.min.js                         # Build OntoWave
├── release-notes.md                        # Release notes (EN)
├── release-notes.fr.md                     # Notes de version (FR)
├── release-notes.en.md                     # Release notes (EN detailed)
├── RELEASE-NOTES-GUIDE.md                  # Guide de maintenance
├── RELEASE-NOTES-IMPLEMENTATION-SUMMARY.md # Résumé implémentation
├── DOGFOODING-DEPLOYMENT.md                # Stratégie déploiement
├── pages.txt                               # Liste des pages
├── sitemap.json                            # Plan du site
├── assets/                                 # Assets compilés
├── standalone/                             # Versions standalone
├── panini/                                 # Documentation Panini
│   ├── README.md
│   ├── fractal-architecture.md
│   ├── semantic-model.md
│   └── ecosystem-integration.md
└── technical/                              # Documentation technique
    ├── deployment/
    ├── development/
    ├── issues/
    └── reports/
```

## 🎨 Philosophie Dogfooding

Ce site démontre OntoWave en l'utilisant pour sa propre documentation :

- ✅ **Sources externes** : Documentation chargée depuis GitHub
- ✅ **Configuration inline** : `window.ontoWaveConfig` dans index.html
- ✅ **Support CORS** : Chargement cross-origin
- ✅ **Multilingue** : FR/EN avec bascule automatique
- ✅ **Toutes les fonctionnalités** : Prism, Mermaid, PlantUML, Math

## 🚀 Déploiement

### GitHub Pages

Le site est automatiquement déployé sur [ontowave.org](https://ontowave.org) via GitHub Actions :

1. **Regression tests** : Validation avant déploiement
2. **E2E tests** : Tests de bout en bout
3. **Deploy** : Publication sur GitHub Pages
4. **Post-validation** : Vérification après déploiement

### Configuration DNS

- **CNAME** : `ontowave.org` → GitHub Pages
- **SSL/TLS** : Certificat Let's Encrypt automatique

## 🔧 Développement Local

### Servir le site localement

```bash
# Depuis la racine du projet
python3 -m http.server 8080 --directory docs

# Ou utiliser la tâche VS Code
# Task: "Serve docs on http://127.0.0.1:8080"
```

### Accès local

```
http://127.0.0.1:8080
```

## 📝 Maintenance

### Ajouter une nouvelle page

1. Créer le fichier `.md` dans le dossier approprié
2. Mettre à jour `pages.txt` si nécessaire
3. Ajouter au `sitemap.json`
4. Commit et push (déploiement automatique)

### Mettre à jour les release notes

Voir [RELEASE-NOTES-GUIDE.md](./RELEASE-NOTES-GUIDE.md) pour le workflow complet.

## 📊 Statistiques

- **Pages totales** : 50+ pages de documentation
- **Langues supportées** : 2 (FR, EN)
- **Versions documentées** : 24 (v1.0.1 - v1.0.24)
- **Taille du site** : ~10 MB
- **Temps de chargement** : < 2s

## 💬 Support

- 🐛 **Bugs** : [GitHub Issues](https://github.com/stephanedenis/OntoWave/issues)
- 💬 **Discussions** : [GitHub Discussions](https://github.com/stephanedenis/OntoWave/discussions)
- 📧 **Contact** : Via profil GitHub

## 📄 Licence

OntoWave est distribué sous licence [CC-BY-NC-SA-4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

---

**Dernière mise à jour** : Décembre 2025  
**Statut** : ✅ Production-Ready

---

[🏠 Accueil](https://ontowave.org) | [📋 Release Notes](https://ontowave.org/release-notes.md) | [🗺️ Roadmap](https://ontowave.org/ROADMAP.md) | [📦 NPM](https://www.npmjs.com/package/ontowave) | [🐙 GitHub](https://github.com/stephanedenis/OntoWave)
