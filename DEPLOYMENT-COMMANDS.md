# 🚀 Commandes Rapides - Déploiement OntoWave

## 📋 Commandes de Base

### Build et Tests

```bash
# Build NPM package
npm run build:npm

# Sync vers docs/
npm run sync:docs

# Tests protection
npm run test -- tests/protect-docs.test.ts

# Tous les tests
npm test

# Tests locaux docs/
npm run serve:docs  # http://localhost:8080
```

### Publication

```bash
# Publication NPM complète (automatique via CI/CD)
git tag v1.0.1
git push origin v1.0.1

# Publication manuelle (déconseillée)
npm run build:npm
npm run sync:docs
npm publish
```

## 🤖 Workflows GitHub Actions

### Déclencher Manuellement

```bash
# Via GitHub UI
# Actions → Select workflow → Run workflow

# Via GitHub CLI
gh workflow run deploy-github-pages.yml
gh workflow run deploy-npm.yml
gh workflow run regression-tests.yml
```

### Voir l'état

```bash
# Lister les workflows
gh run list

# Voir les logs
gh run view --log

# Voir le statut
gh run view
```

## 📦 Scénarios de Déploiement

### 1. Mise à jour contenu docs/

```bash
# Éditer contenu
vim docs/index.html

# Commit et push
git add docs/
git commit -m "docs: update content"
git push origin main

# ✅ GitHub Actions déploie automatiquement docs/ → ontowave.org
```

### 2. Nouvelle version NPM

```bash
# Incrémenter version
npm version patch  # 1.0.0 → 1.0.1
# ou
npm version minor  # 1.0.0 → 1.1.0
# ou
npm version major  # 1.0.0 → 2.0.0

# Build et sync
npm run build:npm
npm run sync:docs

# Commit
git add package.json package-lock.json dist/ docs/ontowave.min.js
git commit -m "chore: release v$(node -p 'require(\"./package.json\").version')"

# Tag
git tag v$(node -p 'require("./package.json").version')

# Push
git push origin main --tags

# ✅ GitHub Actions:
#   1. Build NPM
#   2. Tests régression
#   3. Publish to npm
#   4. Sync to docs/
#   5. Deploy to ontowave.org
```

### 3. Hotfix Production

```bash
# Branche hotfix
git checkout -b hotfix/critical-bug

# Fix
vim src/core/logic.ts

# Test local
npm test
npm run test -- tests/protect-docs.test.ts

# Commit
git add src/
git commit -m "fix: critical bug"

# Merge et version
git checkout main
git merge hotfix/critical-bug
npm version patch

# Build et deploy
npm run build:npm
npm run sync:docs
git add .
git commit -m "chore: hotfix v$(node -p 'require(\"./package.json\").version')"
git tag v$(node -p 'require("./package.json").version')
git push origin main --tags

# ✅ Déploiement automatique
```

## 🧪 Tests et Validation

### Tests Locaux

```bash
# Tests protection (7 tests)
npx vitest run tests/protect-docs.test.ts

# Tests unitaires
npm test

# Tests E2E
npm run serve:docs  # Terminal 1
npx playwright test tests/e2e/production-deployment.spec.cjs  # Terminal 2

# Lint et type check
npm run lint
npm run type-check
```

### Validation Build

```bash
# Build
npm run build:npm

# Vérifier outputs
ls -lh dist/
ls -lh docs/ontowave.min.js

# Vérifier que docs/ n'est PAS écrasé
test -f docs/index.html && echo "✅ docs/index.html OK" || echo "❌ RÉGRESSION!"
grep -q "window.ontoWaveConfig" docs/index.html && echo "✅ Config OK" || echo "❌ RÉGRESSION!"
```

### Validation Production

```bash
# Test site local
npm run serve:docs
xdg-open http://localhost:8080

# Test site production
curl -I https://ontowave.org

# Test CDN npm
PACKAGE_VERSION=$(node -p 'require("./package.json").version')
curl -I "https://unpkg.com/ontowave@$PACKAGE_VERSION/dist/ontowave.min.js"
curl -I "https://cdn.jsdelivr.net/npm/ontowave@$PACKAGE_VERSION/dist/ontowave.min.js"
```

## 🔒 Protection Anti-Régression

### Vérifications Automatiques

```bash
# Vérifier vite.config.ts
cat vite.config.ts | grep outDir
# Doit afficher: outDir: 'public-demo',

# Vérifier .gitignore
cat .gitignore | grep public-demo
# Doit afficher: public-demo/

# Tests protection
npm run test -- tests/protect-docs.test.ts
# Doit afficher: ✓ 7 passed (7)
```

### En cas de Régression Détectée

```bash
# 1. Identifier le commit problématique
git log --oneline docs/

# 2. Voir les changements
git show <commit-hash>

# 3. Revert
git revert <commit-hash>

# 4. Push
git push origin main

# 5. Vérifier
npm run test -- tests/protect-docs.test.ts
```

## 📊 Monitoring

### Voir les déploiements GitHub Pages

```bash
# Via GitHub CLI
gh api repos/{owner}/{repo}/pages/builds | jq '.[] | {status, created_at}'

# Via UI
# https://github.com/{owner}/{repo}/deployments
```

### Voir les publications NPM

```bash
# Dernières versions
npm view ontowave versions --json | jq '.[-5:]'

# Info package
npm view ontowave

# Téléchargements
npm view ontowave downloads
```

### Logs Workflows

```bash
# Logs dernière exécution
gh run list --limit 1
gh run view --log

# Logs workflow spécifique
gh run list --workflow=deploy-github-pages.yml
gh run view <run-id> --log
```

## 🛠️ Maintenance

### Nettoyer Artifacts

```bash
# Nettoyer dist/
rm -rf dist/

# Nettoyer public-demo/
rm -rf public-demo/

# Nettoyer node_modules/
rm -rf node_modules/
npm ci

# Rebuild
npm run build:npm
```

### Mettre à jour Dépendances

```bash
# Vérifier outdated
npm outdated

# Update minor/patch
npm update

# Update major (prudence!)
npm install <package>@latest

# Tester après update
npm test
npm run test -- tests/protect-docs.test.ts
```

## 🎯 Checklist Pré-Publication

```bash
# ✅ Tests passent
npm test

# ✅ Protection docs/
npm run test -- tests/protect-docs.test.ts

# ✅ Build réussi
npm run build:npm

# ✅ Sync docs/
npm run sync:docs

# ✅ Version incrémentée
git diff package.json

# ✅ No uncommitted changes
git status

# ✅ Branch main
git branch --show-current

# ✅ Tag créé
git tag | tail -1

# 🚀 PRÊT POUR PUBLICATION!
git push origin main --tags
```

## 📚 Ressources

### Documentation

- [AUTOMATED-DEPLOYMENT.md](AUTOMATED-DEPLOYMENT.md) - Guide complet workflows
- [BUILD-AND-PUBLISH-WORKFLOW.md](BUILD-AND-PUBLISH-WORKFLOW.md) - Workflow détaillé
- [QUICK-PUBLISH-GUIDE.md](QUICK-PUBLISH-GUIDE.md) - Guide publication
- [CORRECTION-REGRESSION-DOCS.md](CORRECTION-REGRESSION-DOCS.md) - Corrections appliquées

### Liens Utiles

- Site: https://ontowave.org
- NPM: https://www.npmjs.com/package/ontowave
- CDN unpkg: https://unpkg.com/ontowave/
- CDN jsdelivr: https://cdn.jsdelivr.net/npm/ontowave/
- GitHub: https://github.com/stephanedenis/OntoWave

---

**Date** : 19/12/2025  
**Version** : 1.0  
**Statut** : ✅ PRÊT POUR PRODUCTION
