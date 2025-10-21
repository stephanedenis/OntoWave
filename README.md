# 🌊 OntoWave

[![npm version](https://img.shields.io/npm/v/ontowave.svg)](https://www.npmjs.com/package/ontowave)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Bibliothèque JavaScript moderne pour le rendu markdown professionnel avec support complet des tableaux**

## ✨ Fonctionnalités

- 🎯 **Tableaux Markdown** avec alignements complets (gauche, centre, droite)
- 🎨 **Styles CSS professionnels** automatiques (hover, zebra striping, responsive)
- 📦 **Sans dépendances** - Tout en un seul fichier minifié
- 🚀 **Auto-chargement** depuis fichiers markdown
- 🔢 **Syntaxe KaTeX** pour équations mathématiques
- 📊 **Diagrammes Mermaid** pour visualisations
- 📄 **YAML Front Matter** pour métadonnées

## 🚀 Installation

### Via NPM

```bash
npm install ontowave
```

### Via CDN (unpkg.com)

```html
<!-- Dernière version (recommandé pour démo) -->
<script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>

<!-- Version fixe (recommandé pour production) -->
<script src="https://unpkg.com/ontowave@1.0.2/dist/ontowave.min.js"></script>
```

## 💻 Utilisation Rapide

### HTML Minimal

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OntoWave Demo</title>
</head>
<body>
    <div id="content"></div>
    <script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
</body>
</html>
```

### JavaScript/TypeScript

```javascript
import ontowave from 'ontowave';

// Rendu markdown
const html = ontowave.render('# Hello World');
document.getElementById('content').innerHTML = html;
```

## 📋 Exemples

### Tableau avec Alignements

```markdown
| Produit | Quantité | Prix |
|:--------|:--------:|-----:|
| Ordinateur | 2 | 1799.98€ |
| Souris | 5 | 127.50€ |
| **TOTAL** | **7** | **1927.48€** |
```

**Rendu :**

| Produit | Quantité | Prix |
|:--------|:--------:|-----:|
| Ordinateur | 2 | 1799.98€ |
| Souris | 5 | 127.50€ |
| **TOTAL** | **7** | **1927.48€** |

### Syntaxe d'Alignement

- `:---` ou `---` → Gauche (défaut)
- `:---:` → Centre
- `---:` → Droite

## 🔗 Liens Utiles

- 📦 **NPM Package** : [npmjs.com/package/ontowave](https://www.npmjs.com/package/ontowave)
- 🌐 **Site Web** : [ontowave.org](https://ontowave.org)
- 📚 **Démo Tableaux** : [ontowave.org/demo-tables.md](https://ontowave.org/demo-tables.md)
- 🐙 **GitHub Repository** : [github.com/stephanedenis/OntoWave](https://github.com/stephanedenis/OntoWave)
- 🎨 **Pages de Test** :
  - [test-npm-minimal.html](test-npm-minimal.html) - HTML minimal
  - [test-npm-auto.html](test-npm-auto.html) - Avec auto-loading
  - [demo-npm-simple.html](demo-npm-simple.html) - Démo simple

## 📖 Documentation

### Styles CSS Automatiques

OntoWave applique automatiquement des styles professionnels :

- **Classes CSS** : `.text-left`, `.text-center`, `.text-right`
- **Bordures** : Bordures collapse avec couleurs harmonieuses
- **Hover** : Effet de survol sur les lignes
- **Zebra Striping** : Lignes alternées pour meilleure lisibilité
- **Responsive** : S'adapte aux petits écrans

### Configuration

OntoWave fonctionne automatiquement au chargement :

1. Détecte `div#content` dans votre HTML
2. Cherche `index.md` (ou fichier configuré)
3. Charge et transforme le markdown en HTML
4. Applique les styles de tableaux automatiquement

## 🆕 Release Notes

### v1.0.2 - 16 octobre 2025

#### 🎯 Corrections Majeures
- ✅ **Fix complet des alignements de tableaux markdown**
  - Support des 3 syntaxes : `:---`, `:---:`, `---:`
  - Application correcte des classes CSS `.text-left`, `.text-center`, `.text-right`
  - Gestion des cellules vides et contenu mixte

#### 🚀 Améliorations Infrastructure
- ✅ **Suppression des commentaires CSS dans JavaScript**
  - Nettoyage des fichiers source (`ontowave.js`)
  - Mise à jour du build distribué (`dist/ontowave.min.js`)
  - Script automatisé : `scripts/clean-css-comments.sh`

- ✅ **Workflow GitHub Actions NPM automatique**
  - Publication automatique sur NPM lors des PR merge
  - Tests non-bloquants avec `continue-on-error: true`
  - Commit automatique des build artifacts
  - Permissions correctes : `contents: write, packages: write`

- ✅ **CDN unpkg.com disponible**
  - Version automatique : `https://unpkg.com/ontowave/dist/ontowave.min.js`
  - Version fixe : `https://unpkg.com/ontowave@1.0.2/dist/ontowave.min.js`
  - Résolution sémantique : `@latest`, `@1`, `@1.0`

#### 🧪 Tests et Validation
- ✅ **Pages de test minimales créées**
  - `test-npm-minimal.html` - HTML minimal (11 lignes)
  - `test-npm-auto.html` - Avec auto-loading markdown
  - Test Playwright : Validation du chargement depuis unpkg.com

#### 📚 Documentation
- ✅ **Documentation complète**
  - `README.md` - Guide principal avec exemples
  - `docs/index.md` - Documentation site web
  - `docs/demo-tables.md` - Démonstration complète des tableaux
  - `SUCCESS_NPM_PUBLISH.md` - Journal du succès NPM
  - `HISTORIQUE_ERREURS_WORKFLOW.md` - Historique debug workflow
  - `README_TEST_NPM_MINIMAL.md` - Guide des pages de test

#### 🛠️ Outils Développeur
- ✅ **Scripts d'automatisation**
  - `scripts/clean-css-comments.sh` - Nettoyage CSS
  - `scripts/configure-agent-autonomy.sh` - Config anti-pager
  - `scripts/watch-workflow-safe.sh` - Surveillance workflow

#### 🎉 Règles d'Autonomie Agents
- ✅ **Documentation REGLES_AUTONOMIE_AGENTS.md**
  - Interdictions strictes : pagers (vi, less, more)
  - Solutions obligatoires : `export PAGER=""`, `git config core.editor ""`
  - Checklist complète pour agents autonomes

### v1.0.1 - 16 octobre 2025

#### Première Publication Réussie
- 🎉 Package publié sur NPM
- ✅ Workflow GitHub Actions fonctionnel
- ✅ Build automatique et déploiement

## 🛠️ Développement

### Build

```bash
# Installation
npm install

# Build
npm run build

# Tests
npm test

# Tests E2E (Playwright)
npx playwright test
```

### Structure du Projet

```
ontowave/
├── src/
│   └── ontowave.js          # Source principale
├── dist/
│   └── ontowave.min.js      # Build minifié
├── docs/
│   ├── index.html           # Site web principal
│   ├── index.md             # Documentation
│   └── demo-tables.md       # Démo tableaux
├── tests/
│   └── e2e/
│       ├── test-minimal.spec.js
│       └── test-demo-npm.spec.js
├── scripts/
│   ├── clean-css-comments.sh
│   └── configure-agent-autonomy.sh
├── test-npm-minimal.html    # Test minimal
├── test-npm-auto.html       # Test auto-loading
└── package.json
```

## 🤝 Contribution

Les contributions sont les bienvenues! Veuillez :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Guidelines

- Suivre les règles d'autonomie agents (voir `REGLES_AUTONOMIE_AGENTS.md`)
- Pas de pagers interactifs (vi, less, more)
- Tests automatisés requis
- Documentation à jour

## 📄 Licence

MIT License - Copyright (c) 2025 Stéphane Denis

Voir [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

**Stéphane Denis**

- GitHub: [@stephanedenis](https://github.com/stephanedenis)
- NPM: [npmjs.com/~stephanedenis](https://www.npmjs.com/~stephanedenis)

## 🙏 Remerciements

- Projet créé dans le cadre de l'écosystème Panini
- Inspiration : Philosophie de l'autonomie des agents
- Technologies : marked.js, KaTeX, Mermaid, YAML

---

**OntoWave** - *Parce que le markdown mérite un rendu professionnel* 🌊

[![NPM](https://nodei.co/npm/ontowave.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/ontowave)
