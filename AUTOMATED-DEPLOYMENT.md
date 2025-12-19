# 🤖 Déploiement Automatisé avec Tests de Régression

## Vue d'ensemble

OntoWave utilise **3 workflows GitHub Actions** pour un déploiement entièrement automatisé avec tests de régression rigoureux :

1. **🌐 GitHub Pages (ontowave.org)** - Déploiement du site vitrine
2. **📦 NPM Package** - Publication sur npm
3. **🧪 Regression Tests** - Tests continus

## 🌐 Workflow GitHub Pages

**Fichier** : `.github/workflows/deploy-github-pages.yml`

### Déclenchement

```yaml
on:
  push:
    branches: [main]
    paths: ['docs/**', 'dist/ontowave.min.js']
  workflow_dispatch:
```

### Pipeline (4 étapes)

#### 1️⃣ Tests de Régression (obligatoires)
- ✅ Tests de protection docs/
- ✅ Validation structure docs/
- ✅ Validation taille bundle (< 100 KB)
- ✅ Validation sécurité (pas de credentials)

#### 2️⃣ Tests E2E Playwright (optionnels)
- 🎭 Tests production-deployment.spec.cjs
- 🎭 Configuration dogfooding
- 🎭 Sources externes
- 📸 Screenshots sauvegardés

#### 3️⃣ Déploiement
- 🚀 Upload artifact docs/
- 🚀 Deploy to GitHub Pages
- ✅ URL: https://ontowave.org

#### 4️⃣ Validation Post-Déploiement
- 🌐 Test HTTP 200
- ✅ Site accessible

### Protection

**Si un test échoue** : Le déploiement est **BLOQUÉ** ❌

```yaml
needs: [regression-tests, e2e-tests]
if: success()
```

## 📦 Workflow NPM

**Fichier** : `.github/workflows/deploy-npm.yml`

### Déclenchement

```yaml
on:
  push:
    tags: ['v*.*.*']          # Ex: v1.0.1
  workflow_dispatch:           # Manuel
```

### Pipeline (7 étapes)

#### 1️⃣ Validation Pré-Build
- ✅ Lint
- ✅ Unit tests
- ✅ Type check
- 🔐 Security audit
- 📋 Version validation (tag = package.json)

#### 2️⃣ Build NPM
- 🏗️ `npm run build:npm`
- 📦 Génère dist/ontowave.js + dist/ontowave.min.js
- 📏 Validation taille (< 200 KB / < 100 KB)
- 🔍 Validation contenu dist/

#### 3️⃣ Tests de Régression
- ✅ Tests protection docs/
- ✅ Tests unitaires
- 🔍 Test import package

#### 4️⃣ Dry Run Publication
- 🧪 `npm publish --dry-run`
- 📋 Affiche les fichiers qui seront publiés

#### 5️⃣ Publication NPM
- 🚀 `npm publish`
- 📦 Package publié sur npmjs.com
- 🔑 Utilise `secrets.NPM_TOKEN`

#### 6️⃣ Validation Post-Publication
- 🌐 Test CDN unpkg.com
- 🌐 Test CDN jsdelivr.com
- ✅ Accessibilité validée

#### 7️⃣ Sync vers docs/
- 🔄 `npm run sync:docs`
- 📤 Commit automatique
- ✅ docs/ontowave.min.js à jour

### Protection

Chaque étape dépend du succès de la précédente :

```yaml
needs: [pre-build-validation]
needs: [build, regression-tests]
needs: [build, regression-tests, dry-run]
needs: publish
```

## 🧪 Workflow Tests de Régression

**Fichier** : `.github/workflows/regression-tests.yml`

### Déclenchement

```yaml
on:
  pull_request:              # Sur chaque PR
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'      # Quotidien à 2h UTC
  workflow_dispatch:          # Manuel
```

### Tests (5 catégories)

#### 1️⃣ Tests Structurels
- ✅ Protection docs/
- ✅ vite.config.ts correct
- ✅ .gitignore correct

#### 2️⃣ Tests Fonctionnels
- ✅ Lint
- ✅ Type check
- ✅ Unit tests

#### 3️⃣ Tests de Build
- 🏗️ Build NPM
- 🔍 Validation outputs
- ✅ docs/ préservé (détection régression)
- 📏 Tailles bundles

#### 4️⃣ Tests E2E
- 🎭 Playwright sur docs/
- 📸 Screenshots

#### 5️⃣ Tests de Sécurité
- 🔐 npm audit
- 🔍 Pas de credentials hardcodés

### Rapport Final

Génère un rapport de synthèse dans GitHub Summary :

```markdown
# 📊 Rapport de Tests de Régression

## Résultats
- 🏗️ Tests Structurels: success
- 🧪 Tests Fonctionnels: success
- 🏗️ Tests de Build: success
- 🎭 Tests E2E: success
- 🔐 Tests de Sécurité: success
```

## 🔄 Scénarios de Déploiement

### Scénario 1 : Mise à jour contenu docs/

```bash
# 1. Modifier docs/index.html ou docs/*.md
vim docs/index.html

# 2. Commit
git add docs/
git commit -m "docs: update homepage"
git push origin main
```

**GitHub Actions** :
1. ✅ Regression tests
2. 🚀 Deploy GitHub Pages
3. ✅ Post-deploy validation
4. 🌐 https://ontowave.org mis à jour

### Scénario 2 : Nouvelle version NPM

```bash
# 1. Incrémenter version
npm version patch  # 1.0.0 → 1.0.1

# 2. Build et sync
npm run build:npm
npm run sync:docs

# 3. Commit
git add package.json dist/ docs/ontowave.min.js
git commit -m "chore: release v1.0.1"

# 4. Tag et push
git push origin main
git push origin v1.0.1
```

**GitHub Actions** :
1. ✅ Pre-build validation
2. 🏗️ Build NPM
3. ✅ Regression tests
4. 🧪 Dry run
5. 🚀 Publish to NPM
6. ✅ Post-publish validation
7. 🔄 Sync to docs/
8. 🚀 Deploy GitHub Pages

### Scénario 3 : Pull Request

```bash
# 1. Créer une branche
git checkout -b feature/my-feature

# 2. Faire des modifications
# ... code ...

# 3. Commit et push
git push origin feature/my-feature

# 4. Créer PR sur GitHub
```

**GitHub Actions** :
- 🧪 Regression tests (automatique sur PR)
- ✅ Validation avant merge
- ❌ Bloque le merge si tests échouent

## 🚨 Détection de Régression

### Régression Détectée : docs/ écrasé

**Test** : `tests/protect-docs.test.ts`

```typescript
test('docs/ doit contenir index.html', () => {
  expect(existsSync('docs/index.html')).toBe(true)
})

test('vite.config.ts ne doit PAS pointer vers docs/', () => {
  const config = readFileSync('vite.config.ts', 'utf-8')
  expect(config).not.toMatch(/outDir:\s*['"]docs['"]/)
})
```

**Si régression** :
```
❌ RÉGRESSION: vite.config.ts pointe vers docs/
❌ RÉGRESSION: docs/index.html supprimé!
❌ RÉGRESSION: Configuration dogfooding perdue!
```

**Action** : Workflow BLOQUÉ ❌

### Régression Détectée : Bundle trop gros

**Test** : Validation taille

```bash
if [ $MIN_SIZE -gt 102400 ]; then
  echo "⚠️ RÉGRESSION: Bundle minifié trop gros: $MIN_SIZE bytes"
  exit 1
fi
```

**Action** : Build ÉCHOUÉ ❌

### Régression Détectée : Tests échouent

**Test** : Unit tests

```bash
npm test
```

**Action** : Publication BLOQUÉE ❌

## 📊 Monitoring et Rapports

### GitHub Summary

Chaque workflow génère un rapport détaillé :

```markdown
# 🚀 Déploiement Réussi

✅ Site déployé sur: https://ontowave.org

## 📊 Détails
- Commit: abc123...
- Auteur: user
- Date: 2025-12-19 10:30:00 UTC
```

### Artifacts

Les workflows sauvegardent :
- 📸 Screenshots Playwright (7 jours)
- 📦 Build artifacts (7 jours)

### Notifications

GitHub envoie des notifications :
- ✅ Déploiement réussi
- ❌ Déploiement échoué
- ⚠️ Tests de régression échoués

## 🔧 Configuration Requise

### GitHub Secrets

```yaml
NPM_TOKEN: "npm_xxxxxxxxxxxxx"  # Token npm avec droits publish
```

**Création** :
1. npmjs.com → Settings → Access Tokens
2. Generate New Token (Automation)
3. GitHub → Settings → Secrets → New repository secret

### GitHub Pages

**Configuration** :
- Settings → Pages
- Source: GitHub Actions
- Branch: (géré par workflow)

### Permissions

```yaml
permissions:
  contents: write
  pages: write
  id-token: write
  packages: write
```

## ✅ Checklist Configuration

### Configuration Initiale

- [ ] Secret `NPM_TOKEN` configuré
- [ ] GitHub Pages activé (mode Actions)
- [ ] Workflows committés dans `.github/workflows/`
- [ ] Tests protection créés (`tests/protect-docs.test.ts`)
- [ ] `vite.config.ts` pointe vers `public-demo/`
- [ ] `.gitignore` contient `public-demo/`

### Validation Workflows

- [ ] Workflow GitHub Pages fonctionne
- [ ] Workflow NPM fonctionne
- [ ] Workflow Regression Tests fonctionne
- [ ] Tests de régression passent (7/7)
- [ ] Déploiement manuel réussi (`workflow_dispatch`)

### Test Régression

- [ ] Modifier `vite.config.ts` → outDir: 'docs'
- [ ] Push → Workflow DOIT échouer ❌
- [ ] Restaurer → Workflow DOIT passer ✅

## 🎯 Bénéfices

1. **Déploiement Automatique** : Push → Tests → Deploy
2. **Protection Totale** : Impossible de casser docs/
3. **Tests Rigoureux** : 7 catégories de tests
4. **Rollback Facile** : Git revert + re-deploy
5. **Traçabilité** : Chaque déploiement documenté
6. **Confiance** : Tests avant chaque déploiement
7. **Zero Downtime** : Déploiement atomique

## 📚 Documentation Complémentaire

- [BUILD-AND-PUBLISH-WORKFLOW.md](BUILD-AND-PUBLISH-WORKFLOW.md) - Workflow détaillé
- [QUICK-PUBLISH-GUIDE.md](QUICK-PUBLISH-GUIDE.md) - Guide rapide
- [CORRECTION-REGRESSION-DOCS.md](CORRECTION-REGRESSION-DOCS.md) - Corrections appliquées

---

**Date** : 19/12/2025  
**Statut** : ✅ WORKFLOWS CONFIGURÉS  
**Protection** : 🔒 RÉGRESSION IMPOSSIBLE
