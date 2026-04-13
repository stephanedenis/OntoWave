# Rétrospective : Dérive de Conception OntoWave

**Date de rédaction** : 2026-04-10  
**Contexte** : Analyse post-mortem de la dérive entre le principe fondateur ("la page HTML doit être quasi-vide") et l'état du projet avant `13ebc0e`.  
**Résolution** : Restaurée dans `13ebc0e feat(bootstrap): HTML quasi-vide — la librairie crée tout le DOM`

---

## 1. Le Principe Fondateur (Rappel)

OntoWave est une bibliothèque qui **crée tout le DOM**. Une page utilisateur correcte ressemble à ceci :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Mon site</title>
</head>
<body>
  <script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
</body>
</html>
```

La librairie lit sa configuration (fichier `config.json` bundlé ou fetché), crée `#app`, construit le menu flottant, gère le routing, le multilingue, les diagrammes. **L'utilisateur n'a rien à faire en HTML.**

Ce principe a été exprimé très tôt dans le projet :  
- **22 oct 2025 `9445204`** : *"Revert to minimal index.html with @latest CDN"* — `docs/index.html` réduit à 5 lignes (head + 1 script CDN)

---

## 2. Chronologie de la Dérive

### Phase 1 — Fondations (avant v1.0.25, sept–oct 2025)

Le projet démarre avec l'ancienne librairie monolithique JS (~550KB, API `new OntoWave({...})`). La page HTML avait donc un `<div id="ontowave">` et un bloc `<script>` d'initialisation — **normal** pour l'époque.

Commit `9445204` simplifie encore davantage à un pur CDN sans configuration inline.

### Phase 2 — Migration invisible (nov 2025 – mars 2026)

La source `src/main.ts` évolue en profondeur : nouvelle API (`roots`, `i18n`), TypeScript strict, architecture modulaire. Mais **le `dist/` n'est jamais reconstruit** depuis cette source — l'ancienne librairie JS continue d'être servie sur CDN.

Résultat : deux librairies incompatibles coexistent silencieusement :
- **CDN** : ancienne API `locales`/`sources` (~550KB monolithique)
- **`src/`** : nouvelle API `roots`/`i18n` (TypeScript, jamais compilée vers `dist/`)

Ce manque de synchronisation est documenté dans l'**issue #46** (avril 2026) — mais il existait depuis des mois.

### Phase 3 — PR #47 : le premier domino (8 avril 2026)

Issue #45 : *"P0 — toutes les pages de démos affichent le contenu de la page d'accueil"*

Cause : Les démos HTML utilisaient la nouvelle API (`roots`/`i18n`) mais le CDN servait l'ancienne librairie. Celle-ci ignorait les clés inconnues et chargeait le fallback.

Fix (PR #47) : Réécriture des 8 fichiers HTML de démos avec l'ancienne API. Résout le P0 — mais cimente la divergence plutôt que de la corriger.

### Phase 4 — PR #48 : correction de l'écart CDN (9 avril 2026)

Issue #46 fermée. La TS source est enfin compilée :
- `dist/ontowave.js` reconstruit depuis `src/main.ts`
- Bugs corrigés dans `view.ts`, `main.ts`, `enhance.ts`, `search.ts`
- Les 8 démos migrées vers la nouvelle API

Dans ce même commit, `docs/index.html` pointait encore vers les **assets Vite SPA** (`/assets/index-D7mvmPJW.js`) — artefact d'un `npm run build` qui avait écrasé le fichier. C'est techniquement correct pour le mode dev Vite, mais pas pour le déploiement GitHub Pages qui devrait charger `ontowave.min.js` en mode CDN.

### Phase 5 — `5994148` : LA DÉRIVE (10 avril 2026)

Commit : **`feat(look): restaurer chrome CDN + tests E2E + correction police`**

**Contexte** : Les tests E2E échouaient en mode headless Linux car les polices système (Roboto, DejaVu Sans) n'étaient pas chargées → hauteur de certains éléments = 0px. La solution rapide : ajouter `font-family: ..., 'DejaVu Sans',...` au CSS dans `docs/index.html`.

**Effets de bord en cascade** :

1. Pour ajouter le CSS de police, il faut une balise `<style>` dans le HTML
2. Tant qu'il y a un `<style>`, autant mettre tout le layout CSS dedans
3. Tant qu'il y a le layout CSS dans le HTML, autant définir le DOM HTML correspondant (`#site-header`, `#sidebar`, `#layout`, `#toc`, `#floating-menu`)
4. `docs/index.html` passe de 11 lignes à 175 lignes

**Ce que le commit message dit être la vraie raison** :
> *"docs/index.html: restaurer header, sidebar, TOC, floating-menu et charger ontowave.min.js (bundle CDN IIFE) au lieu du build Vite SPA"*

La phrase "au lieu du build Vite SPA" révèle l'autre motivation : remplacer le pointeur vers `/assets/index-D7mvmPJW.js` (SPA Vite) par le vrai bundle CDN (`ontowave.min.js`). C'est la bonne décision. Mais le "restaurer header, sidebar, TOC" est la dérive : **ces éléments étaient dans le HTML, pas dans la librairie.**

### Phase 6 — Rattrapages cosmétiques (même jour)

Voyant l'interface inadéquate dans le navigateur, deux commits essaient de corriger le look :
- `27af0fa feat(ux): interface minimaliste — icône vague (cercle rose)` : ajoute CSS + JS inline dans `docs/index.html` pour le menu flottant rose
- Ce commit corrige le *look* mais aggrave la *conception* : c'est toujours l'HTML qui pilote l'UI

---

## 3. Analyse des Causes Racines

### Cause 1 : Absence de mécanisme de bootstrapping dans la librairie

La librairie `main.ts` supposait que `#app` existait déjà dans le DOM. Il n'y avait pas de chemin de code pour le cas "page vide". Donc quand `docs/index.html` devait être chargé sans structure DOM, la tentation était de la mettre dans l'HTML.

**Fix** : `bootstrapDom(cfg)` dans `main.ts` — crée tout le DOM quand `#app` est absent.

### Cause 2 : Confusion entre "page de test" et "déploiement de référence"

`index.html` dans dev (`/`) et `docs/index.html` en production servaient deux usages différents :
- Dev : rich HTML template avec chrome complet pour tester tous les composants
- Prod : page utilisateur minimale montrant comment la librairie s'utilise

Ces deux usages ont fusionné dans un seul fichier, forçant le chrome dans la prod.

**Fix** : `index.html` (dev) reste un template riche ; `docs/index.html` est la référence utilisateur minimale.

### Cause 3 : La CI ne gardait pas `docs/index.html`

Un `npm run build` écrasait `docs/index.html` avec les assets Vite SPA. Un script `restore-github-pages-files.sh` a été ajouté pour contrecarrer cela — mais c'est un anti-pattern : lutter contre le build plutôt que le configurer correctement.

### Cause 4 : Pas de test sur le contrat "HTML minimal"

Aucun test ne vérifiait que `docs/index.html` ne dépassait pas N lignes, ou ne contenait pas de `#site-header`, ou ne définissait pas son propre DOM. Une telle assertion aurait rendu la dérive visible immédiatement.

### Cause 5 : Deux versions de la librairie (6 mois d'écart)

La divergence entre `dist/` (ancienne librairie) et `src/` (nouvelle TS) a été la source profonde de tous les problèmes : les pages HTML devaient compenser les manques de la librairie, ce qui les rendait de plus en plus complexes.

---

## 4. Ce Qui A Bien Fonctionné

- **Issue #46** : La dette technique a été identifiée et documentée correctement
- **PR #48** : La migration des démos a été bien exécutée (8 pages, nouvelle API)
- **Leçons apprises** (`copilotage/journal/lessons_learned.md`) : le pattern "demo = cas de test" est bien établi
- **`.github/copilot-instructions.md`** (créé session 2026-04-01) : les conventions sont maintenant formalisées
- **La correction finale `13ebc0e`** : le `bootstrapDom()` est idiomatique et idempotent — les pages avec `#app` ne sont pas touchées

---

## 5. État Après Correction

### `docs/index.html` (14 lignes fonctionnelles)
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OntoWave - Micro-application pour sites statiques</title>
    <meta name="description" content="...">
</head>
<body>
<noscript><!-- 300 lignes de SEO bilingue --></noscript>
    <script src="/ontowave.min.js"></script>
</body>
</html>
```

### `src/main.ts` — `bootstrapDom(cfg)` (pattern correct)
```typescript
function bootstrapDom(cfg) {
  if (document.getElementById('app')) return; // idempotent
  // Crée <style id="ow-bootstrap-styles">
  // Crée #ow-content > #app
  // Crée #floating-menu > #floating-toggle (wave SVG) + .ow-float-panel
  // Lit langs depuis cfg.i18n.supported ou cfg.roots
  // Attache les handlers
}
// Appelé juste après le chargement de config
bootstrapDom(cfg);
```

---

## 6. Mesures Préventives Recommandées

### Immédiat
- [ ] Ajouter un test `npm run check:html` qui vérifie que `docs/index.html` ne contient pas `#site-header`, `#sidebar`, `#layout`, ni de bloc `<style>` significatif
- [ ] Documenter le contrat dans `.github/copilot-instructions.md` : *"docs/index.html ne doit contenir que : DOCTYPE, head (meta/title), noscript SEO, script CDN — toute UI est créée par la librairie"*

### À moyen terme
- [ ] Corriger la CI pour que `npm run build` ne puisse jamais écraser `docs/index.html`
- [ ] Supprimer `tools/restore-github-pages-files.sh` (anti-pattern) une fois la CI propre
- [ ] Issue #17 (mobile responsive) et #18 (dark mode) : à implémenter via `bootstrapDom`, pas via le HTML consommateur

### Structurel
- [ ] Smoke-test sur le site public qui vérifie que `docs/index.html` ne dépasse pas 30 lignes
- [ ] La librairie doit encoder le principe : aucun comportement ne peut être obtenu seulement en ajoutant du HTML/CSS à la page consommatrice

---

## 7. Chronologie Condensée

```
Sept 2025   Début : librairie class-based, HTML avec <div id="ontowave"> + <script>
Oct 2025    9445204 — "Revert to minimal index.html" : 5 lignes, principle correct ✅
Oct–mars    src/main.ts évolue, dist/ jamais reconstruit → 2 librairies incompatibles
Avr 8       #45 P0 : démos cassées → PR #47 : fix symptôme (ancienne API dans HTML)
Avr 9       #46 dette tech → PR #48 : dist/ reconstruit, démos migrées ✅
Avr 10      5994148 — "restaurer chrome CDN" : 175 lignes HTML, DÉRIVE ❌
Avr 10      27af0fa — correctif look : CSS/JS inline dans HTML, aggrave la dérive ❌
Avr 10      13ebc0e — bootstrapDom() : librairie crée tout, HTML = 14 lignes ✅
```

---

*Document produit pour mémoire de projet et orientation des prochains sprints.*
