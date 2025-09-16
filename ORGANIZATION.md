# Organisation du Projet OntoWave

## 📁 Structure des Dossiers

### 🏗️ Dossiers Principaux

- **`src/`** - Code source principal
- **`dist/`** - Fichiers de distribution (build)
- **`docs/`** - Documentation du site web GitHub Pages
- **`tests/`** - Tests automatisés et scripts de validation
- **`examples/`** - Exemples d'utilisation
- **`documentation/`** - Documentation technique et rapports
- **`archive/`** - Fichiers temporaires et de debug

### 📋 Détail des Dossiers

#### `documentation/`
```
documentation/
├── development/     # Documentation de développement
│   ├── api.md
│   ├── config.md
│   ├── examples.md
│   ├── DRAG_DISABLE_FEATURE.md
│   ├── README-PACKAGE.md
│   ├── SETUP-MINIMAL.md
│   ├── SOLUTION-COMPLETE.md
│   └── test-modes.md
├── deployment/      # Guides de déploiement
│   ├── ACTIONS_MANUELLES_GITHUB.md
│   ├── DEPLOIEMENT_COMPLET.md
│   ├── DEPLOYMENT-STRATEGIES.md
│   ├── GITHUB_PAGES_SETUP.md
│   └── PUBLISH.md
├── reports/         # Rapports et corrections
│   ├── CORRECTIFS_APPLIQUES.md
│   ├── CORRECTIONS_PRISM_MULTILANG.md
│   ├── CORRECTIONS_REGRESSIONS.md
│   ├── IMPROVEMENTS-SUMMARY.md
│   ├── IMPROVEMENTS_SUMMARY.md
│   ├── RAPPORT_RESTAURATION.md
│   ├── RAPPORT_TESTS_PLAYWRIGHT.md
│   ├── RESUME_AMELIORATIONS_UTILISATION.md
│   └── VALIDATION_REPORT.md
└── issues/          # Documentation des problèmes
    ├── issue-examples-validation.md
    └── issue-prism-intermittent.md
```

#### `examples/`
```
examples/
├── basic/           # Exemples de base
│   ├── cdn-example.html
│   ├── example-minimal.html
│   ├── example-simple.html
│   ├── minimal.html
│   └── with-config.html
├── advanced/        # Exemples avancés
│   ├── demo-drag-disable.html
│   ├── diagnostic-multilang.html
│   ├── hybrid-loading.html
│   ├── test-multilingual-config.html
│   └── test-prism-multilang.html
└── tests/           # Fichiers de test HTML
    ├── debug-test.html
    ├── test-direct.html
    ├── test-drag-disable.html
    ├── test-drag-simple.html
    ├── test-hover-fix.html
    ├── test-language-buttons.html
    ├── test-logos-update.html
    ├── test-simple.html
    ├── test-validation-menu.html
    └── validation-drag.html
```

#### `tests/`
```
tests/
├── e2e/             # Tests end-to-end Playwright (existant)
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
- `index.md` - Page d'index

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
4. **📚 Documentation** - Classement logique par thème
5. **🧪 Tests** - Centralisation de tous les tests
6. **📋 Exemples** - Organisation par niveau de complexité
7. **🗄️ Archive** - Conservation des fichiers de debug sans encombrer

## 📝 Notes

- Les fichiers de la racine sont maintenant limités aux essentiels
- La documentation est organisée par domaine (dev, déploiement, rapports)
- Les exemples sont classés par difficulté
- Les fichiers temporaires sont archivés mais conservés
- Cette organisation respecte les conventions des projets open source
