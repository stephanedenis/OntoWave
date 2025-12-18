# Déploiement NPM - OntoWave Core et Plugins

## 📦 Architecture de Publication

OntoWave utilise une architecture modulaire permettant la publication séparée du noyau et des plugins.

### Structure des Packages

```
ontowave (noyau)
├── dist/ontowave.min.js        # Bundle standalone
├── dist/ontowave.js             # Version non-minifiée
└── dist/plugins/                # Plugins intégrés
    ├── prism.js
    ├── mermaid.js
    └── plantuml.js

@ontowave/plugin-* (plugins tiers)
└── dist/plugin-name.js
```

## 🚀 Publication du Noyau

### 1. Préparation

```bash
# S'assurer d'être sur main
git checkout main
git pull origin main

# Vérifier qu'il n'y a pas de changements non committés
git status

# Construire le bundle
npm run build:standalone
```

### 2. Vérification Pré-publication

```bash
# Tester le bundle localement
npm run serve:docs
# Ouvrir http://localhost:8080

# Vérifier la taille du bundle
ls -lh docs/ontowave.min.js

# Vérifier le contenu du package
npm pack --dry-run
```

### 3. Publication Automatique

```bash
# Utiliser le script de publication
./scripts/publish.sh

# Le script va:
# 1. Vérifier la branche et l'état git
# 2. Construire la version minifiée
# 3. Demander le type de version (patch/minor/major/prerelease)
# 4. Créer un tag git
# 5. Pousser sur GitHub
# 6. Publier sur NPM
```

### 4. Publication Manuelle

```bash
# Bump de version
npm version patch  # ou minor/major

# Login NPM (si nécessaire)
npm login

# Publier
npm publish --access public

# Pousser les tags
git push --follow-tags
```

## 🔌 Publication des Plugins

### Structure d'un Plugin NPM

```json
{
  "name": "@ontowave/plugin-analytics",
  "version": "1.0.0",
  "main": "dist/plugin-analytics.js",
  "peerDependencies": {
    "ontowave": "^1.0.0"
  },
  "keywords": ["ontowave", "plugin", "analytics"],
  "files": ["dist/", "README.md", "LICENSE"]
}
```

### Script de Build pour Plugins

```javascript
// rollup.config.js pour plugins
export default {
  input: 'src/plugin.ts',
  output: {
    file: 'dist/plugin-analytics.js',
    format: 'iife',
    name: 'OntoWavePluginAnalytics',
    globals: {
      ontowave: 'OntoWave'
    }
  },
  external: ['ontowave']
}
```

### Publication d'un Plugin

```bash
# Dans le répertoire du plugin
cd plugins/analytics

# Build
npm run build

# Test local
npm link
cd ../../your-test-project
npm link @ontowave/plugin-analytics

# Publication
npm publish --access public
```

## 🌐 Distribution CDN

Après publication sur NPM, les bundles sont automatiquement disponibles via:

### unpkg
```html
<script src="https://unpkg.com/ontowave@1.0.0/dist/ontowave.min.js"></script>
<script src="https://unpkg.com/@ontowave/plugin-analytics@1.0.0"></script>
```

### jsDelivr
```html
<script src="https://cdn.jsdelivr.net/npm/ontowave@1.0.0/dist/ontowave.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@ontowave/plugin-analytics@1.0.0"></script>
```

## 📋 Checklist de Publication

### Avant Publication
- [ ] Tests passent (`npm test`)
- [ ] Build réussit (`npm run build:standalone`)
- [ ] Documentation à jour
- [ ] CHANGELOG.md mis à jour
- [ ] Version bump appropriée
- [ ] Tous les commits poussés

### Après Publication
- [ ] Vérifier sur npmjs.com
- [ ] Tester l'installation (`npm install ontowave`)
- [ ] Tester via CDN (unpkg/jsDelivr)
- [ ] Mettre à jour le site de documentation
- [ ] Annoncer la release (GitHub, Twitter, etc.)

## 🔄 Workflow CI/CD (GitHub Actions)

### Publication Automatique sur Tag

```yaml
# .github/workflows/publish.yml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm run build:standalone
      - run: npm test
      
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

## 🎯 Stratégie de Versioning

OntoWave suit [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes dans l'API
- **MINOR** (1.0.0 → 1.1.0): Nouvelles fonctionnalités rétrocompatibles
- **PATCH** (1.0.0 → 1.0.1): Corrections de bugs

### Exemples

```bash
# Correction de bug
npm version patch
# 1.0.0 → 1.0.1

# Nouveau plugin intégré
npm version minor
# 1.0.0 → 1.1.0

# Refonte de l'API de configuration
npm version major
# 1.0.0 → 2.0.0

# Version de test
npm version prerelease --preid=beta
# 1.0.0 → 1.0.1-beta.0
```

## 🔐 Sécurité

### Token NPM

```bash
# Créer un token NPM (Automation type)
# https://www.npmjs.com/settings/YOUR_USERNAME/tokens

# Ajouter aux secrets GitHub
# Settings → Secrets → Actions → New repository secret
# Name: NPM_TOKEN
# Value: npm_xxxxxxxxxxxxx
```

### Validation 2FA

```bash
# Si 2FA activé sur NPM
npm publish --otp=123456
```

## 📚 Ressources

- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions NPM Publish](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
