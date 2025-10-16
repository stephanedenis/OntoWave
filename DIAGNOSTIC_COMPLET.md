# 🔍 Diagnostic Complet - Support .puml dans Builds

## ✅ Ce Qui Fonctionne

### Dev Server (Vite)
```bash
npm run dev
# http://localhost:5173
# ✅ Test: tests/e2e/test-puml-simple.spec.cjs → PASSE
```

**Pourquoi ça marche?**
- Vite charge `src/main.ts` directement (TypeScript)
- `config.json` avec `engine: "v1"` active le legacy path
- Le legacy path fait `import('./plantuml')` dynamiquement
- Le module `src/plantuml.ts` est chargé et fonctionne

## ❌ Ce Qui Ne Fonctionne Pas

### Build docs/ (Vite build)
```bash
npm run build
# Génère docs/ avec docs/index.html
# ❌ Test: tests/e2e/test-docs-regression.spec.cjs → ÉCHOUE
```

**Problème 1: Moteur v2 vs v1**
```html
<!-- docs/index.html généré par Vite -->
<div id="app"></div>  ← Moteur v2
<script type="module" src="/assets/index-ChYFx6qc.js"></script>
```

MAIS `config.json` demande:
```json
{ "engine": "v1" }
```

**Résultat**: Le bundle v2 se charge mais ne supporte PAS les fichiers .puml

**Problème 2: Imports dynamiques exclus**

Le code v1 legacy dans `src/main.ts` ligne 237:
```typescript
} else {
    // Legacy path: import legacy modules dynamically to keep bundle small if unused
    const [{ getCurrentRoute, onRouteChange }, { createMd, rewriteLinks }, { loadPlantUML, renderPlantUMLSVG }] = await Promise.all([
      import('./router'),
      import('./markdown'),
      import('./plantuml'),  // ← IMPORT DYNAMIQUE
    ])
```

Quand Vite compile, il fait du **tree-shaking** et voit:
- Condition `if (engine === 'v2')` → code v2 inclus (défaut)
- Condition `else` (v1) → import dynamique → **EXCLU DU BUNDLE** par optimisation

**Vérification**:
```bash
grep -o "loadPlantUML\|renderPlantUMLSVG" docs/assets/*.js
# Résultat: (vide) ← Fonctions absentes du build
```

### Bundle Standalone (dist/ontowave.min.js)

**Même problème**: Les imports dynamiques du v1 ne sont pas inclus

```bash
grep -o "loadPlantUML\|renderPlantUMLSVG" dist/ontowave.min.js
# Résultat: (vide) ← Fonctions absentes
```

## 🎯 Solutions Possibles

### Solution 1: Ajouter Support .puml au Moteur v2 ⭐ RECOMMANDÉ

**Avantage**: Le build par défaut fonctionnerait avec .puml

**Étapes**:
1. Créer `src/adapters/plantuml-content.ts` (comme `markdown-content.ts`)
2. Ajouter détection `.puml` dans `src/core/router.ts`
3. Modifier `src/app.ts` pour gérer les routes .puml
4. Rebuild → le code sera dans le bundle v2

**Fichiers à modifier**:
- `src/app.ts` - Ajouter branche pour `.endsWith('.puml')`
- `src/adapters/plantuml-content.ts` - Nouveau adapter (copie des fonctions actuelles)
- `src/core/router.ts` - Si besoin, ajouter détection puml

### Solution 2: Forcer Inclusion du Code v1 dans le Bundle

**Modifier `vite.config.ts`**:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          katex: ['katex'],
          mermaid: ['mermaid'],
          md: ['markdown-it', ...],
          plantuml: ['./src/plantuml'],  // ← AJOUTER CECI
          yaml: ['yaml'],
        },
      },
    },
  },
})
```

**Problème**: Même avec ça, le code v1 dans le `else` pourrait être tree-shakéen

**Alternative**: Modifier `src/main.ts` pour importer toujours:
```typescript
import { loadPlantUML, renderPlantUMLSVG } from './plantuml'

// Plus tard, dans le else (v1):
// Utiliser directement au lieu d'import dynamique
```

### Solution 3: Build Séparés v1 et v2

Créer deux configs Vite:
- `vite.config.v1.ts` → Build pour v1 avec container
- `vite.config.v2.ts` → Build pour v2 avec #app

**Problème**: Complexe et double maintenance

## ✅ Recommandation Finale

**SOLUTION 1 est la meilleure**:
1. Port le support .puml dans le moteur v2
2. Un seul bundle qui supporte tout
3. Pas besoin de spécifier `engine: "v1"` pour .puml
4. Le build `docs/` fonctionnera automatiquement

### Prochaines Étapes

1. ✅ Créer `src/adapters/plantuml-content.ts`
2. ✅ Modifier `src/app.ts` pour détecter `.puml`
3. ✅ Tester avec `npm run dev`
4. ✅ Build `npm run build`
5. ✅ Vérifier que `grep -i plantuml docs/assets/*.js` trouve le code
6. ✅ Test `tests/e2e/test-docs-regression.spec.cjs`

---

## 📋 Résumé de l'État Actuel

**Fichiers en place**:
- ✅ `src/plantuml.ts` - Module complet
- ✅ `docs/config.json` - Configuration avec engine="v1"
- ✅ `docs/index-minimal.md` - Contenu de test
- ✅ `docs/architecture.puml` - Diagramme de test
- ✅ Tests e2e créés et fonctionnels (dev)

**À corriger**:
- ❌ Code .puml pas dans le bundle de production
- ❌ Moteur v2 ne supporte pas .puml
- ❌ Build docs/ utilise v2 mais config demande v1

**Test pour validation finale**:
```bash
# Après correction:
npm run build
grep -i "loadPlantUML" docs/assets/*.js
# Devrait trouver du code

npx playwright test tests/e2e/test-docs-regression.spec.cjs
# Devrait PASSER ✅
```
