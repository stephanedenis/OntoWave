# OntoWave Roadmap

> Status: **approved** — versioned by git

## Vision

**OntoWave** is a navigation library for static sites and web applications. It transforms Markdown files into interactive documentation in the browser, with hash URL-based SPA routing.

**Current state (v1.x)**: monolithic bundle (~4.7MB unzipped), everything is bundled.  
**v2.0 target**: core ≤ 200KB (zero dependencies) + extensions loaded on demand.

OntoWave integrates naturally into the Panini ecosystem (PaniniFS, PublicationEngine, Pensine-web) but does not depend on it and does not assume it. It can be used standalone by any project.

## Positioning

| What OntoWave is | What it is not |
|---|---|
| Navigation library (SPA, routing, fetch) | Static site generator |
| Embeddable presentation layer | Application framework |
| Zero-dependency library (core target v2.0) | CMS |

## v1.1 — Interface and Configuration API

**Goal**: stabilize what the user sees and touches + recommended configuration API. Immutable foundation for v2.0.

**Completion criterion**: `npm run check` passes + `docs/index.html` respects the invariants of [specs/interface.en.md](interface.en.md).

| Issue | Title | Notes |
|---|---|---|
| #76 | Floating menu — frosted glass, pill, drag & drop | Full spec in [interface.en.md §4-5](interface.en.md) |
| #17 | Responsive and mobile-first interface | |
| to create | Implement `window.ontoWaveConfig` as syntactic sugar | Ref: [interface.en.md §2](interface.en.md) — converts object to `__ONTOWAVE_BUNDLE__['/config.json']` |
| to create | Demo pages in two versions (CDN @latest + local CI) | Ref: [interface.en.md §11](interface.en.md) |

## v2.0 — Universal Content Navigator

**Goal**: modular architecture + integration API. Core drops below 200KB. Extensions load on demand. OntoWave can be embedded in a host project without taking over the entire page.

**Completion criterion**: `dist/ontowave.js` ≤ 200KB minified + `createApp({ container })` works.

### Scope Decision (current v2 direction)

For now, the v2 core is limited to:

- routing + content loading
- **fr/en** internationalization (browser language + host config)
- built-in minimal rendering for **`.md`** and **`.txt`** files

Out of v2 core (for now):

- structured navigation (`nav.yml`)
- search (`search-index.json`)

Everything else should be handled through lazy-loaded extensions, including advanced render engines and optional UI/tooling modules.

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
