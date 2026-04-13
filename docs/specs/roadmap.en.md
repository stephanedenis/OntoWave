# OntoWave Roadmap

> Version: 1.0 — April 12, 2026  
> Status: **approved**

## Vision

**OntoWave** is an independent navigation core (~100KB, zero dependencies) for static sites and web applications. Lightweight extensions are loaded on demand based on content: Markdown, diagrams, math formulas, and beyond.

OntoWave integrates naturally into the Panini ecosystem (PaniniFS, PublicationEngine, Pensine-web) but does not depend on it and does not assume it. It can be used standalone by any project.

## Positioning

| What OntoWave is | What it is not |
|---|---|
| Navigation core (SPA, routing, fetch) | Static site generator |
| Embeddable presentation layer | Application framework |
| Lazy-load extension registry | CMS |
| Zero-dependency library (core) | Monolithic bundle |

## v1.1 — Reference Interface

**Goal**: stabilize what the user sees and touches. Immutable visual foundation.

**Completion criterion**: `npm run check` passes + `docs/index.html` respects the invariants of [specs/interface.en.md](interface.en.md).

| Issue | Title | Notes |
|---|---|---|
| #76 | Floating menu — frosted glass, pill, drag & drop | Full spec in [interface.en.md §4-5](interface.en.md) |
| #17 | Responsive and mobile-first interface | |

## v2.0 — Universal Content Navigator

**Goal**: modular architecture + integration API. Core drops below 200KB. Extensions load on demand. OntoWave can be embedded in a host project without taking over the entire page.

**Completion criterion**: `dist/ontowave.js` ≤ 200KB minified + `createApp({ container })` works.

| Issue | Title | Depends on | Notes |
|---|---|---|---|
| #72 | ContentRenderer and ExtensionRegistry types | — | Spec in [architecture.en.md §4-6](architecture.en.md) |
| #73 | Dynamic ExtensionRegistry in adapters/ | #72 | |
| #74 | Heavy engines extracted as ContentRenderer | #73 | Markdown, Mermaid, KaTeX, Highlight, PlantUML |
| #75 | Vite build split (core + dist/extensions/) | #74 | |
| #77 | Component mode: `createApp({ container })` | #73 | See §2 below |
| — | JSON ContentRenderer (first non-Markdown type) | #74 | Issue to create at implementation time |

### §1 Size Invariant

`dist/ontowave.js` **must never exceed 200KB** (minified, before gzip).

All heavy dependencies live in `dist/extensions/`. Extensions are not dependencies of the core.

### §2 Component Mode

In v2.0, `createApp()` accepts a `container` parameter:

```javascript
// Full-page mode (current behavior)
window.ontoWaveConfig = { roots: [...] }
// → OntoWave takes over <body>

// Component mode (new)
const app = createApp({ container: '#notes-viewer', roots: [...] })
app.start()
```

Without `container`, current behavior is preserved (`bootstrapDom()` creates the full shell).  
With `container`, OntoWave inserts itself into the existing element without touching the surrounding DOM.

Panini use case: Pensine-web and PublicationEngine can embed OntoWave in their own interface without DOM conflicts.

## Out of Scope

- **Separate npm packages** (`@ontowave/ext-markdown`): out of scope, to consider if the project gains external contributors
- **Visual config panel** (interface.en.md §6): issue to create in v2.1 once v2.0 is in place
- **SSR / pre-rendering**: out of scope
- **Panini-specific content types** (PaniniFS proprietary formats): issues to create in the relevant repos once v2.0 architecture is available
