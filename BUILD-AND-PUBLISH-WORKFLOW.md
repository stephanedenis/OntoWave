# 🚀 OntoWave - Workflow de Build et Publication

## 🎯 Objectif

Ce document définit le workflow clair et sans régression pour :
1. **Distribution NPM** : Package `ontowave` distribué via npm
2. **Site vitrine** : `docs/` (ontowave.com) - contenu source, PAS un dossier de build

## ⚠️ PROBLÈME IDENTIFIÉ

**Configuration actuelle DANGEREUSE** :
```typescript
// vite.config.ts - PROBLÈME !
build: {
  outDir: 'docs',        // ❌ ÉCRASE docs/
  emptyOutDir: true,     // ❌ SUPPRIME TOUT
}
```

**Conséquence** : `npm run build` DÉTRUIT tout le contenu de `docs/` incluant :
- Configuration dogfooding (`docs/index.html`)
- Documentation (`docs/DOGFOODING-DEPLOYMENT.md`, etc.)
- Contenu markdown (`docs/*.md`)
- Structure de navigation (`docs/nav.yml`, `docs/sitemap.json`)

## 🏗️ NOUVELLE STRUCTURE

### Séparation Claire des Responsabilités

```
Panini-OntoWave/
├── src/                    # Code source TypeScript
│   ├── app.ts
│   ├── main.ts
│   ├── router.ts
│   └── core/
│       ├── logic.ts
│       ├── plugin-manager.ts
│       └── types.ts
│
├── dist/                   # 📦 BUILD NPM (distribué sur npm)
│   ├── ontowave.js         # Bundle standard
│   └── ontowave.min.js     # Bundle minifié
│
├── docs/                   # 🌐 SITE VITRINE (ontowave.com)
│   │                       # ⚠️ CONTENU SOURCE, PAS DE BUILD !
│   ├── index.html          # Page d'accueil avec dogfooding
│   ├── index.fr.md         # Contenu français
│   ├── index.en.md         # Contenu anglais
│   ├── nav.yml             # Navigation
│   ├── sitemap.json        # Plan du site
│   ├── ontowave.min.js     # 📋 COPIE depuis dist/ (script)
│   ├── assets/             # Assets statiques (images, etc.)
│   ├── panini/             # Documentation Panini
│   └── technical/          # Documentation technique
│
└── public-demo/            # 🎪 DÉMO PUBLIQUE (build Vite)
    │                       # Démo interactive pour tests
    ├── index.html          # Build Vite pour démo
    └── assets/             # Assets buildés par Vite
```

### Rôles Clarifiés

| Dossier | Type | Usage | Build | NPM | GitHub Pages |
|---------|------|-------|-------|-----|--------------|
| `src/` | Source | Code TypeScript | ❌ Non | ❌ Non | ❌ Non |
| `dist/` | Build | Distribution NPM | ✅ Vite | ✅ Oui | ❌ Non |
| `docs/` | Source | Site vitrine | ❌ Non | ❌ Non | ✅ Oui |
| `public-demo/` | Build | Démo interactive | ✅ Vite | ❌ Non | ⚠️ Optionnel |

## 🔧 CORRECTIONS À APPLIQUER

### 1. Vite Configuration

**Changement** : `docs/` → `public-demo/`

```typescript
// vite.config.ts - NOUVELLE VERSION SÛRE
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  server: { port: 5173 },
  build: {
    outDir: 'public-demo',        // ✅ Dossier de démo, pas docs/
    emptyOutDir: true,             // ✅ OK d'effacer public-demo/
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          katex: ['katex'],
          mermaid: ['mermaid'],
          md: ['markdown-it', 'markdown-it-anchor', 'markdown-it-footnote', 'markdown-it-container', 'highlight.js'],
          yaml: ['yaml'],
        },
      },
    },
  },
})
```

### 2. .gitignore

**Ajout** : Ignorer `public-demo/` (généré), garder `docs/` (source)

```gitignore
# Build outputs
dist/
public-demo/        # ✅ Démo buildée (ignorée)

# Keep docs/ (source content)
!docs/             # ✅ docs/ est du contenu source
```

### 3. Scripts Package.json

**Mise à jour** : Séparer clairement les builds

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",                                    // Build démo → public-demo/
    "build:npm": "npm run build:standalone",                  // Build NPM → dist/
    "build:standalone": "node tools/build-standalone.mjs",    // Génère dist/ontowave.min.js
    "build:package": "npx uglifyjs dist/ontowave.js -o dist/ontowave.min.js -c -m",
    
    "sync:docs": "cp dist/ontowave.min.js docs/ontowave.min.js",  // ✅ Copie vers docs/
    
    "serve:docs": "npx http-server ./docs -p 8080 -c-1 --cors",
    "serve:demo": "npx http-server ./public-demo -p 8081 -c-1 --cors",
    
    "prebuild": "npm run sitemap && npm run pageslist",
    "prepublish:npm": "npm run build:npm && npm run sync:docs",   // ✅ Sync avant publish
    
    "publish:npm": "./scripts/publish.sh",
    "prepublishOnly": "npm run build:package",
    "prepare": "npm run build:package"
  }
}
```

## 🔄 WORKFLOW DE PUBLICATION

### A. Publication NPM

**Objectif** : Publier `dist/ontowave.min.js` sur npm

```bash
# 1. Build du package NPM
npm run build:npm              # Génère dist/ontowave.js + dist/ontowave.min.js

# 2. Copie vers docs/ pour GitHub Pages
npm run sync:docs              # Copie dist/ontowave.min.js → docs/ontowave.min.js

# 3. Commit des changements
git add dist/ docs/ontowave.min.js
git commit -m "chore: build npm package v1.0.x"

# 4. Publication NPM (avec tests)
npm run publish:npm            # Exécute scripts/publish.sh
```

### B. Déploiement GitHub Pages (docs/)

**Objectif** : Déployer docs/ (contenu source) sur ontowave.com

```bash
# 1. Vérifier que docs/ contient le bon bundle
ls -lh docs/ontowave.min.js    # Doit exister et être récent

# 2. Vérifier la configuration dogfooding
cat docs/index.html            # window.ontoWaveConfig doit être présent

# 3. Tester localement
npm run serve:docs             # http://localhost:8080

# 4. Commit et push
git add docs/
git commit -m "docs: update site content"
git push origin main

# 5. GitHub Actions déploie automatiquement docs/ → ontowave.com
```

### C. Démo Interactive (public-demo/)

**Objectif** : Build Vite pour tests et démo locale (optionnel)

```bash
# 1. Build de la démo
npm run build                  # Génère public-demo/

# 2. Test local
npm run serve:demo             # http://localhost:8081

# 3. public-demo/ est ignoré par git (pas commité)
```

## 📋 CHECKLIST AVANT PUBLICATION

### ✅ Pré-requis

- [ ] Branche `main` à jour
- [ ] Tous les tests passent (`npm test`)
- [ ] Aucun changement non commité
- [ ] Version incrémentée dans `package.json`

### ✅ Build NPM

- [ ] `npm run build:npm` réussi
- [ ] `dist/ontowave.js` généré
- [ ] `dist/ontowave.min.js` généré et minifié
- [ ] Taille bundle < 200 KB

### ✅ Sync docs/

- [ ] `npm run sync:docs` exécuté
- [ ] `docs/ontowave.min.js` à jour (même taille que `dist/`)
- [ ] Configuration dogfooding présente dans `docs/index.html`
- [ ] Test local : `npm run serve:docs` → http://localhost:8080

### ✅ Publication NPM

- [ ] `npm run publish:npm` réussi
- [ ] Version publiée sur npmjs.com
- [ ] CDN unpkg.com accessible
- [ ] CDN jsdelivr.com accessible

### ✅ Déploiement GitHub Pages

- [ ] Changements docs/ commités
- [ ] Push sur `main` réussi
- [ ] GitHub Actions job réussi
- [ ] Site https://ontowave.com accessible
- [ ] Configuration dogfooding fonctionne

## 🚨 PROTECTIONS ANTI-RÉGRESSION

### 1. Git Hook Pre-commit

Créer `.git/hooks/pre-commit` :

```bash
#!/bin/bash
# Protection anti-régression : vérifier que docs/ n'est pas vidé

if git diff --cached --name-only | grep -q "^docs/"; then
  # Vérifier que docs/index.html existe encore
  if [ ! -f "docs/index.html" ]; then
    echo "❌ ERREUR: docs/index.html a été supprimé !"
    echo "⚠️  docs/ ne doit PAS être un dossier de build."
    exit 1
  fi
  
  # Vérifier que le contenu dogfooding est présent
  if ! grep -q "window.ontoWaveConfig" docs/index.html; then
    echo "⚠️  ATTENTION: Configuration dogfooding manquante dans docs/index.html"
    echo "Voulez-vous continuer ? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
      exit 1
    fi
  fi
fi

exit 0
```

### 2. Test Automatique

Créer `tests/protect-docs.test.js` :

```javascript
import { test, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'

test('docs/ doit contenir index.html', () => {
  expect(existsSync('docs/index.html')).toBe(true)
})

test('docs/index.html doit avoir configuration dogfooding', () => {
  const content = readFileSync('docs/index.html', 'utf-8')
  expect(content).toContain('window.ontoWaveConfig')
  expect(content).toContain('externalDataSources')
})

test('vite.config.ts ne doit PAS pointer vers docs/', () => {
  const config = readFileSync('vite.config.ts', 'utf-8')
  expect(config).not.toMatch(/outDir:\s*['"]docs['"]/)
})

test('docs/ontowave.min.js doit exister', () => {
  expect(existsSync('docs/ontowave.min.js')).toBe(true)
})
```

### 3. GitHub Actions Validation

Créer `.github/workflows/protect-docs.yml` :

```yaml
name: Protect docs/ Content

on:
  pull_request:
    paths:
      - 'docs/**'
      - 'vite.config.ts'

jobs:
  validate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check docs/index.html exists
        run: |
          if [ ! -f "docs/index.html" ]; then
            echo "❌ docs/index.html missing!"
            exit 1
          fi
      
      - name: Check dogfooding config
        run: |
          if ! grep -q "window.ontoWaveConfig" docs/index.html; then
            echo "⚠️ Dogfooding config missing in docs/index.html"
            exit 1
          fi
      
      - name: Check vite.config.ts
        run: |
          if grep -q 'outDir.*docs' vite.config.ts; then
            echo "❌ vite.config.ts should NOT use docs/ as outDir!"
            exit 1
          fi
```

## 📊 COMPARAISON AVANT/APRÈS

### ❌ AVANT (Problématique)

```
npm run build
  → Vite build vers docs/
  → emptyOutDir: true
  → ❌ TOUT docs/ est SUPPRIMÉ
  → ❌ Configuration dogfooding PERDUE
  → ❌ Documentation EFFACÉE
  → ❌ RÉGRESSION SYSTÉMATIQUE
```

### ✅ APRÈS (Solution)

```
npm run build:npm
  → Build standalone vers dist/
  → docs/ NON TOUCHÉ
  → ✅ Configuration dogfooding PRÉSERVÉE
  → ✅ Documentation INTACTE
  → ✅ Sync manuel : npm run sync:docs

npm run build
  → Vite build vers public-demo/
  → emptyOutDir: true OK (c'est un dossier de build)
  → ✅ docs/ NON TOUCHÉ
  → ✅ AUCUNE RÉGRESSION
```

## 🎯 CONCLUSION

**Principes Clés** :

1. **docs/ = CONTENU SOURCE** (jamais un dossier de build)
2. **dist/ = BUILD NPM** (distribution package)
3. **public-demo/ = BUILD DEMO** (tests interactifs, optionnel)
4. **Sync explicite** : `npm run sync:docs` copie dist/ → docs/
5. **Tests automatiques** : Protections anti-régression
6. **Workflow clair** : Build NPM → Sync docs/ → Publish

**Avantages** :

- ✅ Aucune régression possible sur docs/
- ✅ Séparation claire des responsabilités
- ✅ Workflow de publication documenté
- ✅ Protections automatiques (git hooks, tests, CI)
- ✅ docs/ contient du contenu géré manuellement
- ✅ dist/ contient les builds npm
- ✅ public-demo/ contient les builds de test (ignoré git)

---

**Date** : 19/12/2025  
**Version** : 1.0  
**Statut** : 🟡 CORRECTIONS À APPLIQUER
