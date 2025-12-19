# ✅ CORRECTION APPLIQUÉE : Prévention Régression docs/

## 🎯 Problème Identifié

**Configuration dangereuse** dans `vite.config.ts` :
```typescript
build: {
  outDir: 'docs',        // ❌ ÉCRASE docs/ à chaque build
  emptyOutDir: true,     // ❌ SUPPRIME TOUT le contenu
}
```

**Conséquence** :
- `npm run build` DÉTRUIT tout le contenu de `docs/`
- Configuration dogfooding PERDUE
- Documentation EFFACÉE
- Site ontowave.com CASSÉ
- **RÉGRESSION SYSTÉMATIQUE**

## ✅ Solution Appliquée

### 1. Séparation Claire des Responsabilités

| Dossier | Type | Rôle | Git |
|---------|------|------|-----|
| `src/` | Source | Code TypeScript | ✅ Versionné |
| `dist/` | Build | Distribution NPM | ✅ Versionné |
| `docs/` | **Source** | Site vitrine ontowave.com | ✅ Versionné |
| `public-demo/` | Build | Démo interactive Vite | ❌ Ignoré |

### 2. Changements Appliqués

#### A. vite.config.ts
```diff
  build: {
-   outDir: 'docs',
+   outDir: 'public-demo',
    emptyOutDir: true,
```

#### B. .gitignore
```diff
+ # Build outputs
+ dist/
+ public-demo/
+ test-results/
```

#### C. package.json (nouveaux scripts)
```json
{
  "scripts": {
    "build:npm": "npm run build:standalone",
    "sync:docs": "cp dist/ontowave.min.js docs/ontowave.min.js",
    "serve:demo": "npx http-server ./public-demo -p 8081 -c-1 --cors"
  }
}
```

### 3. Tests de Protection (7 tests)

Fichier : `tests/protect-docs.test.ts`

```typescript
✅ docs/ doit contenir index.html
✅ docs/index.html doit avoir configuration dogfooding
✅ vite.config.ts ne doit PAS pointer vers docs/
✅ vite.config.ts doit pointer vers public-demo/
✅ docs/ontowave.min.js doit exister
✅ .gitignore doit contenir public-demo/
✅ docs/ ne doit PAS être dans .gitignore
```

**Résultat** : 7/7 tests PASSENT ✅

### 4. GitHub Actions

Fichier : `.github/workflows/protect-docs.yml`

Validation automatique sur chaque PR/push :
- ✅ docs/index.html existe
- ✅ Configuration dogfooding présente
- ✅ vite.config.ts ne cible pas docs/
- ✅ vite.config.ts cible public-demo/
- ✅ .gitignore contient public-demo/
- ✅ docs/ontowave.min.js existe

## 📊 Résultats

### Avant (Problématique)

```
npm run build
  ↓
[Vite] Building to docs/...
  ↓
[Vite] Emptying docs/...
  ↓
❌ TOUT docs/ SUPPRIMÉ
❌ Configuration dogfooding PERDUE
❌ Site ontowave.com CASSÉ
```

### Après (Solution)

```
npm run build
  ↓
[Vite] Building to public-demo/...
  ↓
[Vite] Emptying public-demo/...
  ↓
✅ docs/ NON TOUCHÉ
✅ Configuration dogfooding PRÉSERVÉE
✅ Site ontowave.com INTACT
```

## 🔄 Nouveau Workflow de Publication

### 1. Build NPM

```bash
npm run build:npm      # dist/ontowave.js + dist/ontowave.min.js
npm run sync:docs      # Copie vers docs/ontowave.min.js
```

### 2. Validation

```bash
npm test -- tests/protect-docs.test.ts    # 7/7 tests passent
npm run serve:docs                        # Test http://localhost:8080
```

### 3. Publication

```bash
git add dist/ docs/ontowave.min.js
git commit -m "chore: build npm package"
npm run publish:npm                       # Publication NPM
git push origin main                      # Déploiement GitHub Pages
```

## 📚 Documentation Créée

1. [BUILD-AND-PUBLISH-WORKFLOW.md](BUILD-AND-PUBLISH-WORKFLOW.md) - Workflow complet détaillé
2. [QUICK-PUBLISH-GUIDE.md](QUICK-PUBLISH-GUIDE.md) - Guide rapide de publication
3. `tests/protect-docs.test.ts` - Tests de protection automatiques
4. `.github/workflows/protect-docs.yml` - CI/CD validation

## ✅ Validation Finale

### Tests de Protection

```bash
$ npx vitest run tests/protect-docs.test.ts

✓ tests/protect-docs.test.ts (7)
  ✓ docs/ doit contenir index.html
  ✓ docs/index.html doit avoir configuration dogfooding
  ✓ vite.config.ts ne doit PAS pointer vers docs/
  ✓ vite.config.ts doit pointer vers public-demo/
  ✓ docs/ontowave.min.js doit exister
  ✓ .gitignore doit contenir public-demo/
  ✓ docs/ ne doit PAS être dans .gitignore

Test Files  1 passed (1)
     Tests  7 passed (7)
```

### Structure Validée

```bash
$ ls -lh docs/ontowave.min.js dist/ontowave.min.js
-rw-r--r-- 1 user user 70K dist/ontowave.min.js
-rw-r--r-- 1 user user 70K docs/ontowave.min.js  ✅ Synchronisé

$ cat vite.config.ts | grep outDir
    outDir: 'public-demo',  ✅ Correct

$ cat .gitignore | grep public-demo
public-demo/  ✅ Ignoré
```

## 🎯 Bénéfices

1. **Aucune Régression Possible** : docs/ est protégé par construction
2. **Tests Automatiques** : 7 tests valident la configuration
3. **CI/CD Protection** : GitHub Actions bloque les erreurs
4. **Workflow Clair** : Documentation complète du processus
5. **Séparation Claire** : Build (public-demo/) vs Contenu (docs/)

## 🚀 Prochaines Étapes

1. Tester le workflow complet de publication NPM
2. Valider le déploiement GitHub Pages
3. Documenter dans README.md principal

---

**Date** : 19/12/2025  
**Statut** : ✅ CORRECTION APPLIQUÉE ET VALIDÉE  
**Tests** : 7/7 PASSENT  
**CI/CD** : CONFIGURÉ
