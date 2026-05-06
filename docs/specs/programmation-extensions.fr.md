# Guide — Programmation & Extensions OntoWave

**Langue** : Français (référence) — [English version](programmation-extensions.en.md)  
**Statut** : Référence pratique (v1.x actuel) + projection v2.0

---

## 1. Objectif du document

Ce guide centralise :

- ce qui est **utilisable aujourd'hui** par programmation dans OntoWave (v1.x)
- ce qui existe en **API interne/avancée** (plugins)
- ce qui est encore **cible v2.0** (registry d'extensions lazy)

> Ce document évite de mélanger la réalité v1.x et la cible d'architecture v2.0.

---

## 2. API utilisable aujourd'hui (v1.x)

### 2.1 Intégration standard (CDN)

OntoWave peut fonctionner sans code applicatif, via script CDN :

```html
<script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
```

La librairie initialise automatiquement le rendu.

### 2.2 Injection de configuration

Deux modes supportés (voir aussi `interface.fr.md`) :

1. `window.ontoWaveConfig` (recommandé)
2. `window.__ONTOWAVE_BUNDLE__` (bas niveau, utile pour injecter plusieurs fichiers)

Exemple recommandé :

```html
<script>
window.ontoWaveConfig = {
  roots: [
    { base: 'fr', root: '/content/fr' },
    { base: 'en', root: '/content/en' }
  ],
  i18n: { default: 'fr', supported: ['fr', 'en'] }
}
</script>
<script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
```

### 2.3 Initialisation programmatique (bundle JS)

Le point d'entrée expose `initOntoWave()` (voir `src/index.ts`).

Usage type bundler :

```ts
import { initOntoWave } from 'ontowave'

await initOntoWave()
```

---

## 3. Configuration pilotable

Le type effectif de config se trouve dans `src/core/types.ts` (`AppConfig`).

Champs principaux :

- `roots: Array<{ base: string; root: string }>`
- `engine?: 'legacy' | 'v2'`
- `i18n?: { default: string; supported: string[] }`
- `ui?: { header?: boolean; sidebar?: boolean; toc?: boolean; footer?: boolean; minimal?: boolean; menu?: boolean }`
- `glossary?: ...`

Règle importante :

- `ui.menu === false` masque explicitement le menu flottant
- sinon, le menu est présent par défaut quand OntoWave bootstrappe le DOM

---

## 4. API plugin (état actuel)

### 4.1 Ce qui existe en code

Types plugin disponibles dans `src/core/types.ts` :

- `OntoWavePlugin`
- `PluginContext`
- `PluginManager`

Hooks disponibles :

- `onStart`
- `onStop`
- `beforeRender`
- `afterRender`
- `onRouteChange`

Gestionnaire disponible dans `src/core/plugins.ts` via `createPluginManager()`.

### 4.2 Point d'attention (important)

En v1.x, cette API plugin est surtout utilisée au niveau code source/app interne.

- `createApp(...)` accepte `plugins` (voir `src/app.ts`)
- mais l'entrée publique standard `initOntoWave()` n'expose pas encore un mécanisme stable de registration plugin pour les intégrateurs CDN

Conclusion pratique :

- **API plugin = disponible pour intégration avancée / code source**
- **pas encore une API publique CDN stabilisée “plug-and-play”**

### 4.3 Exemple (intégration avancée)

```ts
import { createApp } from './app'

const plugin = {
  name: 'demo-plugin',
  beforeRender(md: string) {
    return md.replace('TODO', 'DONE')
  }
}

const app = createApp({
  config,
  content,
  router,
  view,
  md,
  plugins: [plugin]
})

await app.start()
```

---

## 5. Extensions de rendu (cible v2.0)

La spec d'architecture cible est décrite dans `architecture.fr.md` :

- `ContentRenderer`
- `ExtensionRegistry`
- chargement lazy via `dist/extensions/*.js`

Exemples de modules visés :

- `dist/extensions/markdown.js`
- `dist/extensions/mermaid.js`
- `dist/extensions/katex.js`
- `dist/extensions/highlight.js`

Statut actuel :

- cette architecture est la direction officielle
- elle n'est pas encore complètement le runtime public livré en v1.x

---

## 6. Références

- `docs/specs/interface.fr.md`
- `docs/specs/architecture.fr.md`
- `docs/specs/roadmap.fr.md`
- `src/core/types.ts`
- `src/core/plugins.ts`
- `src/app.ts`
- `src/index.ts`
