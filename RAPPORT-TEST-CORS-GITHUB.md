# Rapport de Test - Correction GitHub CORS

## Date: 18 décembre 2025

## Objectifs
1. ✅ Éliminer la requête `/config.json` (404)
2. ✅ Utiliser `window.ontoWaveConfig` en priorité
3. ✅ Charger du contenu depuis GitHub Raw via CORS
4. ✅ Éviter la page blanche

## Corrections Appliquées

### 1. Priorité de Configuration (main.ts & config.ts)
**Problème:** L'application tentait de charger `/config.json` même quand `window.ontoWaveConfig` était défini.

**Solution:** Ordre de priorité implémenté:
```typescript
// 1. window.ontoWaveConfig (priorité maximale)
if ((window as any).ontoWaveConfig) {
  cfg = (window as any).ontoWaveConfig
  console.log('[OntoWave] Using window.ontoWaveConfig')
}
// 2. Bundle embarqué
else if (getJsonFromBundle('/config.json')) { ... }
// 3. Fichier externe (avec gestion d'erreur)
else {
  try {
    cfg = await fetch('/config.json').then(r => r.json())
  } catch (e) {
    cfg = {} // Pas d'erreur si absent
  }
}
```

### 2. Routage Initial (main.ts lignes 66-70)
**Problème:** Redirection forcée vers `#index.md` ignorant `sources[defaultLocale]`.

**Solution:**
```typescript
if (location.hash === '' || location.hash === '#/' || location.hash === '#') {
  const defaultSource = cfg.sources?.[cfg.defaultLocale || 'fr']
  location.hash = defaultSource ? `#${defaultSource}` : '#index.md'
  return
}
```

### 3. Structure HTML (test-github-cors.html)
**Problème:** Absence de `<div id="app">` nécessaire à OntoWave.

**Solution:** Ajout de la structure HTML complète avec `<div id="app">` et styles de base.

### 4. Logs de Débogage (logic.ts)
**Ajouté:** Console logs dans `resolveCandidates` pour tracer:
- Détection des sources externes (`@sourceName/path`)
- Parsing du nom de source et du chemin
- Construction des URLs complètes
- Candidats retournés

## Tests Playwright Effectués

### Test 1: verify-github-cors-fix.spec.cjs
**Résultats:**
- ✅ config.json NON demandé
- ✅ window.ontoWaveConfig utilisé
- ✅ Page contient du contenu (pas blanche)
- ✅ Aucune erreur console
- ❌ **Requête GitHub Raw non effectuée**

### Test 2: inspection.spec.cjs
**Résultats:**
- ✅ Hash correct: `#@github-ontowave/README.md`
- ✅ Config correctement chargée
- ❌ **App innerHTML reste inchangé** ("Chargement du README.md depuis GitHub...")
- ❌ **Aucune requête réseau vers GitHub**

## Problème Restant

### Symptôme
Malgré:
- Configuration correcte des `externalDataSources`
- Hash correct `#@github-ontowave/README.md`
- Code de résolution présent dans `resolveCandidates`
- Appel à `loadMarkdown` avec `cfg.externalDataSources`

**Aucune requête vers `raw.githubusercontent.com` n'est effectuée.**

### Hypothèses
1. ✅ `setExternalDataSources` appelé (log confirmé)
2. ✅ `resolveCandidates` reçoit `externalSources` en paramètre
3. ❓ Les logs de débogage n'ont pas été testés (build incomplet)
4. ❓ Possible problème de synchronisation entre modules
5. ❓ Route non déclenchée correctement après changement de hash

### Prochaines Étapes
1. **Compléter le build** avec logs de débogage dans `resolveCandidates`
2. **Tester avec test-cors-debug.html** qui intercepte tous les fetch
3. **Vérifier** si `renderRoute` est appelé après le changement de hash
4. **Tracer** l'exécution complète de `loadMarkdown` → `resolveCandidates` → `fetchText`

## Fichiers Modifiés

- ✅ src/main.ts (config priority, routing)
- ✅ src/adapters/browser/config.ts (config loading)
- ✅ src/core/logic.ts (debug logs)
- ✅ docs/test-github-cors.html (HTML structure)
- ✅ docs/test-cors-debug.html (debug page with fetch intercept)
- ✅ tests/e2e/verify-github-cors-fix.spec.cjs (comprehensive test)
- ✅ tests/e2e/inspection.spec.cjs (state inspection)
- ✅ tests/e2e/debug-github-final.spec.cjs (detailed logs)

## Status: 🟡 PARTIELLEMENT RÉSOLU

**Résolu:**
- ✅ Pas de requête config.json
- ✅ window.ontoWaveConfig utilisé
- ✅ Page pas blanche
- ✅ Aucune erreur console
- ✅ Hash correct

**En cours:**
- ⏳ Chargement effectif du contenu GitHub
- ⏳ Requête CORS vers raw.githubusercontent.com
