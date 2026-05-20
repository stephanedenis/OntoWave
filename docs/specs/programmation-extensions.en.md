# Guide — OntoWave Programming & Extensions

**Language**: English — [Version française](programmation-extensions.fr.md)  
**Status**: Practical reference (current v1.x) + v2.0 target

---

## 1. Purpose

This guide centralizes:

- what is **currently usable** programmatically in OntoWave (v1.x)
- what exists as **advanced/internal API** (plugins)
- what is still **v2.0 target** (lazy extension registry)

> This document separates current v1.x reality from v2.0 architecture targets.

---

## 2. API usable today (v1.x)

### 2.1 Standard integration (CDN)

OntoWave works without custom app code via CDN script:

```html
<script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
```

The library auto-initializes rendering.

### 2.2 Configuration injection

Two supported modes (see also `interface.en.md`):

1. `window.ontoWaveConfig` (recommended)
2. `window.__ONTOWAVE_BUNDLE__` (low-level, useful to inject multiple files)

Recommended example:

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

### 2.3 Programmatic initialization (JS bundle)

The entry point exposes `initOntoWave()` (see `src/index.ts`).

Typical bundler usage:

```ts
import { initOntoWave } from 'ontowave'

await initOntoWave()
```

---

## 3. Configurable behavior

The effective config type is in `src/core/types.ts` (`AppConfig`).

Main fields:

- `roots: Array<{ base: string; root: string }>`
- `engine?: 'legacy' | 'v2'`
- `i18n?: { default: string; supported: string[] }`
- `ui?: { header?: boolean; sidebar?: boolean; toc?: boolean; footer?: boolean; minimal?: boolean; menu?: boolean }`
- `glossary?: ...`

Important rule:

- `ui.menu === false` explicitly hides the floating menu
- otherwise, the floating menu is present by default when OntoWave bootstraps the DOM

---

## 4. Plugin API (current state)

### 4.1 What exists in code

Plugin types available in `src/core/types.ts`:

- `OntoWavePlugin`
- `PluginContext`
- `PluginManager`

Available hooks:

- `onStart`
- `onStop`
- `beforeRender`
- `afterRender`
- `onRouteChange`

Manager available in `src/core/plugins.ts` via `createPluginManager()`.

### 4.2 Important note

In v1.x, this plugin API is mostly intended for source-level/advanced integration.

- `createApp(...)` accepts `plugins` (see `src/app.ts`)
- but the standard public entry point `initOntoWave()` does not yet expose a stable CDN-facing plugin registration flow

Practical conclusion:

- **plugin API exists for advanced/source integration**
- **not yet a fully stabilized CDN plug-and-play public extension API**

### 4.3 Example (advanced integration)

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

## 5. Rendering extensions (v2.0 target)

Target architecture is specified in `architecture.en.md`:

- `ContentRenderer`
- `ExtensionRegistry`
- lazy loading via `dist/extensions/*.js`

Target modules include:

- `dist/extensions/markdown.js`
- `dist/extensions/mermaid.js`
- `dist/extensions/katex.js`
- `dist/extensions/highlight.js`

Current status:

- this is the official direction
- it is not yet fully the public runtime shipped in v1.x

---

## 6. References

- `docs/specs/interface.en.md`
- `docs/specs/architecture.en.md`
- `docs/specs/roadmap.en.md`
- `src/core/types.ts`
- `src/core/plugins.ts`
- `src/app.ts`
- `src/index.ts`
