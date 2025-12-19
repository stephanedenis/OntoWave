# 🚀 Guide de Publication OntoWave

## Validation Rapide

Avant toute publication, exécutez les tests de protection :

```bash
npm run test -- tests/protect-docs.test.ts
```

**Résultats attendus** : 7/7 tests passés ✅

## Publication NPM

### 1. Build du Package

```bash
# Build complet NPM (dist/)
npm run build:npm
```

**Génère** :
- `dist/ontowave.js` (bundle standard)
- `dist/ontowave.min.js` (bundle minifié)

### 2. Sync vers docs/

```bash
# Copie dist/ontowave.min.js → docs/ontowave.min.js
npm run sync:docs
```

**Vérifie** :
```bash
ls -lh docs/ontowave.min.js dist/ontowave.min.js
# Doivent avoir la même taille
```

### 3. Validation Locale

```bash
# Tester docs/ localement
npm run serve:docs
# Ouvrir http://localhost:8080
```

**Vérifier** :
- ✅ Page charge correctement
- ✅ README.md depuis GitHub s'affiche
- ✅ Configuration dogfooding fonctionne

### 4. Commit et Publish

```bash
# Commit des changements
git add dist/ docs/ontowave.min.js
git commit -m "chore: build npm package v1.0.x"

# Publication NPM
npm run publish:npm
```

## Déploiement GitHub Pages (ontowave.com)

### Automatique

GitHub Actions déploie automatiquement `docs/` vers ontowave.com sur chaque push `main`.

```bash
# Commit docs/
git add docs/
git commit -m "docs: update site content"
git push origin main
```

### Validation Post-Déploiement

1. Attendre GitHub Actions (1-2 min)
2. Ouvrir https://ontowave.com
3. Vérifier :
   - ✅ Dogfooding fonctionne
   - ✅ README.md GitHub charge
   - ✅ Navigation correcte

## Tests de Démo (Optionnel)

### Build Démo Interactive

```bash
# Build Vite → public-demo/
npm run build
```

**Génère** :
- `public-demo/index.html`
- `public-demo/assets/` (chunks buildés)

### Test Local

```bash
# Serveur démo
npm run serve:demo
# Ouvrir http://localhost:8081
```

**Note** : `public-demo/` est ignoré par git (pas commité).

## Checklist Complète

### Avant Publication

- [ ] Tous les tests passent : `npm test`
- [ ] Tests de protection OK : `npm run test -- tests/protect-docs.test.ts`
- [ ] Branche `main` à jour
- [ ] Aucun changement non commité
- [ ] Version incrémentée dans `package.json`

### Build NPM

- [ ] `npm run build:npm` réussi
- [ ] `dist/ontowave.js` généré
- [ ] `dist/ontowave.min.js` minifié
- [ ] Taille < 100 KB

### Sync docs/

- [ ] `npm run sync:docs` exécuté
- [ ] `docs/ontowave.min.js` à jour
- [ ] Test local : `npm run serve:docs`
- [ ] Configuration dogfooding fonctionne

### Publication

- [ ] `npm run publish:npm` réussi
- [ ] Version publiée sur npmjs.com
- [ ] CDN unpkg.com accessible
- [ ] CDN jsdelivr.com accessible

### GitHub Pages

- [ ] Changements docs/ commités
- [ ] Push `main` réussi
- [ ] GitHub Actions job réussi
- [ ] https://ontowave.com accessible

## Workflow Complet (Commande Unique)

```bash
# Publication complète NPM + GitHub Pages
npm run build:npm && \
npm run sync:docs && \
npm test -- tests/protect-docs.test.ts && \
git add dist/ docs/ontowave.min.js && \
git commit -m "chore: build and publish v1.0.x" && \
npm run publish:npm && \
git push origin main
```

## Dépannage

### docs/ontowave.min.js manquant

```bash
npm run build:npm
npm run sync:docs
```

### vite.config.ts pointe vers docs/

**Erreur critique** ! Corriger immédiatement :

```typescript
// vite.config.ts
build: {
  outDir: 'public-demo',  // ✅ Correct
  // outDir: 'docs',      // ❌ JAMAIS !
}
```

### Tests de protection échouent

Lire les messages d'erreur et corriger :

```bash
npx vitest run tests/protect-docs.test.ts --reporter=verbose
```

## Scripts Utiles

| Commande | Description |
|----------|-------------|
| `npm run build:npm` | Build distribution NPM → `dist/` |
| `npm run sync:docs` | Copie `dist/` → `docs/` |
| `npm run build` | Build démo Vite → `public-demo/` |
| `npm run serve:docs` | Test local docs/ (port 8080) |
| `npm run serve:demo` | Test local demo/ (port 8081) |
| `npm run publish:npm` | Publication NPM complète |
| `npm test` | Tous les tests (unit + protection) |

---

**Date** : 19/12/2025  
**Version** : 1.0  
**Statut** : ✅ OPÉRATIONNEL
