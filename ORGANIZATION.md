# Organisation du Projet OntoWave

## 📁 Structure des Dossiers

### 🏗️ Dossiers Principaux

- **`src/`** - Code source principal
- **`dist/`** - Fichiers de distribution (build)
- **`docs/`** - Documentation complète (site web + technique + exemples)
- **`tests/`** - Tests automatisés, scripts de validation et exemples de test
- **`archive/`** - Fichiers temporaires et de debug

### 📋 Détail des Dossiers

#### `docs/`
```
docs/
├── index.html           # Point d'entrée du site web
├── index.fr.md         # Page d'accueil française
├── index.en.md         # Page d'accueil anglaise
├── ontowave.min.js     # Bibliothèque OntoWave
├── nav.yml             # Navigation du site
├── sitemap.json        # Plan du site
├── CNAME               # Configuration domaine personnalisé
├── 404.html            # Page d'erreur
├── demo/               # Exemples démonstratifs ET tests intégrés
│   ├── basic/          # Exemples de base (minimal, simple, avec config)
│   ├── advanced/       # Exemples avancés (diagnostic, multilang, drag-disable)
│   ├── testing/        # Tests intégrés pour validation continue
│   ├── minimal.html
│   ├── advanced.html
│   ├── full-config.html
│   └── *.md            # Contenu et documentation des exemples
└── technical/          # Documentation technique
    ├── development/    # Documentation de développement
    │   ├── api.md
    │   ├── config.md
    │   ├── examples.md
    │   ├── DRAG_DISABLE_FEATURE.md
    │   ├── README-PACKAGE.md
    │   ├── SETUP-MINIMAL.md
    │   ├── SOLUTION-COMPLETE.md
    │   └── test-modes.md
    ├── deployment/     # Guides de déploiement
    │   ├── ACTIONS_MANUELLES_GITHUB.md
    │   ├── DEPLOIEMENT_COMPLET.md
    │   ├── DEPLOYMENT-STRATEGIES.md
    │   ├── GITHUB_PAGES_SETUP.md
    │   └── PUBLISH.md
    ├── reports/        # Rapports et corrections
    │   ├── CORRECTIFS_APPLIQUES.md
    │   ├── CORRECTIONS_PRISM_MULTILANG.md
    │   ├── CORRECTIONS_REGRESSIONS.md
    │   ├── IMPROVEMENTS-SUMMARY.md
    │   ├── IMPROVEMENTS_SUMMARY.md
    │   ├── RAPPORT_RESTAURATION.md
    │   ├── RAPPORT_TESTS_PLAYWRIGHT.md
    │   ├── RESUME_AMELIORATIONS_UTILISATION.md
    │   └── VALIDATION_REPORT.md
    └── issues/         # Documentation des problèmes
        ├── issue-examples-validation.md
        └── issue-prism-intermittent.md
```

#### `tests/`
```
tests/
├── e2e/             # Tests end-to-end Playwright
├── examples/        # Exemples migrés (sauvegarde)
│   ├── advanced/    # Exemples avancés pour tests
│   └── testing/     # Fichiers de test HTML
├── cleanup-drag-tests.sh
├── restore-ontowave.sh
├── test_fix_verification.py
├── test_hex_encoding.js
├── test_manual.py
├── test_plantuml_fix.py
├── test_utf8_encoding.cjs
├── test_utf8_encoding.js
└── validate-consistency.sh
```

#### `archive/`
```
archive/
├── debug/           # Captures d'écran et fichiers de debug
│   ├── debug-minimal-test.png
│   ├── debug-ontowave-load.png
│   ├── debug-ontowave-test.png
│   ├── debug-switch-language.png
│   ├── diagnostic-ontowave.png
│   ├── investigation-ontowave.png
│   ├── test-complet-ontowave.png
│   └── test_results.png
└── temp/            # Fichiers temporaires
    ├── captures/
    ├── copilotage/
    ├── ISSUES/
    ├── server.log
    └── test-results/
```

## 🎯 Racine Nettoyée

La racine du projet ne contient maintenant que les fichiers essentiels :

### ⚙️ Configuration
- `package.json` / `package-lock.json` - Configuration npm
- `tsconfig.json` - Configuration TypeScript
- `vite.config.ts` / `vitest.config.ts` - Configuration Vite
- `eslint.config.js` / `.eslintrc.cjs` - Configuration ESLint
- `playwright.config.js` - Configuration Playwright
- `pytest.ini` / `requirements.txt` - Configuration Python
- `.prettierrc` / `.prettierignore` - Configuration Prettier
- `cspell.json` - Configuration correcteur orthographique

### 📄 Documentation Principale
- `README.md` - Documentation principale du projet
- `LICENSE` - Licence du projet
- `ORGANIZATION.md` - Documentation de l'organisation (ce fichier)

### 🔧 Fichiers Système
- `.gitignore` / `.npmignore` - Exclusions Git/npm
- `.github/` - Configuration GitHub Actions
- `.vscode/` - Configuration VS Code
- `index.html` - Point d'entrée web principal

### 📦 Environnements
- `node_modules/` - Dépendances npm
- `.venv/` / `venv/` - Environnements virtuels Python
- `.pytest_cache/` - Cache pytest

## 🚀 Avantages de cette Organisation

1. **🎯 Clarté** - Chaque type de fichier a sa place
2. **🔍 Navigation** - Plus facile de trouver ce qu'on cherche
3. **🧹 Propreté** - Racine épurée avec seulement l'essentiel
4. **📚 Documentation Unifiée** - Tout dans `docs/` (site web + technique)
5. **🧪 Tests** - Centralisation de tous les tests
6. **📋 Exemples** - Organisation par niveau de complexité
7. **🗄️ Archive** - Conservation des fichiers de debug sans encombrer
8. **🌐 GitHub Pages** - Structure optimale pour la publication

## 📝 Notes

- Les fichiers de la racine sont maintenant limités aux essentiels
- **Toute la documentation** est centralisée dans `docs/` :
  - Site web public dans `docs/` (racine)
  - Documentation technique dans `docs/technical/`
## 🎯 Bénéfices de la Structure Optimisée

### ✅ Racine Propre et Professionnelle
- Suppression des fichiers obsolètes (`index.html`, `index.md`)
- Élimination des doublons (dossier `public/` supprimé)
- Structure conforme aux standards GitHub

### 📚 Documentation Centralisée dans `docs/`
- **Toute** la documentation (utilisateur + technique) dans `docs/`
- Exemples exhaustifs dans `docs/demo/` servant à la fois de :
  - 🎨 **Démonstrations** pour les utilisateurs
  - 🧪 **Tests intégrés** pour validation continue
- Optimisation GitHub Pages native

### 🧪 Tests et Exemples Unifiés
- `docs/demo/` contient des exemples qui servent également de tests
- Garantie du bon fonctionnement des démonstrations
- `tests/examples/` sauvegarde les anciens exemples
- Réduction de la duplication de code

### 🌐 Structure GitHub Pages Optimale
- `docs/` contient tout ce qui doit être publié
- Navigation intuitive pour les utilisateurs
- Maintenance simplifiée
- Conformité aux bonnes pratiques open source

## 📋 Règles d'Organisation

- Les exemples de base sont classés dans `docs/demo/basic/`
- Les exemples avancés sont dans `docs/demo/advanced/`
- Les tests intégrés sont dans `docs/demo/testing/`
- Les fichiers temporaires sont archivés dans `archive/`
- Cette organisation respecte les conventions des projets open source
- La structure `docs/` est optimisée pour GitHub Pages
