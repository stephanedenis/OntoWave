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

`dist/ontowave.js` must stay **strictly below the announced threshold** for the current iteration (minified, before gzip).

The threshold may be adjusted during early v2 refactoring iterations, but:

- the active value must be documented in this roadmap
- CI must enforce that value as a blocking gate
- the threshold must converge toward the final target (smallest possible core)

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

### §3 Implementation Plan (recommended order)

1. Batch A — type contracts and safety rails

- Finalize `ContentRenderer`, `ExtensionRegistry`, and `ExtensionConfig` in `src/core/types.ts`.
- Lock the minimal core API (`.md` and `.txt`) with zero external dependencies.
- Add unit tests for type contracts and extension resolution.

2. Batch B — dynamic browser registry

- Implement `src/adapters/browser/extension-registry.ts` with `register/load/resolve`.
- Wire the registry into the rendering flow without changing the current public API.
- Ensure missing extensions never block minimal core rendering.

3. Batch C — extract Markdown as base extension

- Move advanced Markdown rendering to `src/extensions/markdown.ts`.
- Keep a minimal core `.md` fallback if the extension is unavailable.
- Implement two-pass rendering: minimal render then second render after extension load.
- Add non-regression tests for baseline Markdown rendering.

4. Batch D — extract heavy engines as lazy extensions

- Extract Mermaid, KaTeX, Highlight, and PlantUML into separate modules.
- Trigger lazy loading only when content requires it.
- Test loading order and absence of unnecessary loads.

5. Batch E — build split + component mode

- Update `vite.config.dist.ts` to output core + `dist/extensions/*`.
- Implement `createApp({ container })` without breaking full-page mode.
- Measure final core size and validate the ≤ 200KB invariant.

### §3 bis Refactor Strategy

The v2 refactor may start from a cleaned baseline (legacy removal/rebuild) as long as the following invariants are preserved:

- functional compatibility of existing documentation navigation flows
- visual equivalence of the floating menu (current signature preserved)
- explicit configuration rules and `⚠️` error signaling remain intact

### §4 v2 Test Plan (mandatory)

1. Unit tests (Vitest)

- Extension resolution by URL and content type.
- Core fallback for `.md` and `.txt` when no extension is available.
- Initial fr/en language selection (hash, config, browser).
- Link rewriting with explicit extensions and anchors.

2. Browser integration tests

- Effective lazy loading: extension not loaded before use, then loaded on demand.
- Verify two-pass rendering behavior (before/after extension load).
- Hash navigation non-regression for explicit `.md` links.
- Component mode: no side effects outside target container.

3. Playwright E2E tests

- Deep crawl of docs/demo links (FR + EN) with no console errors.
- Behavior validation when an extension is missing (clean degradation).
- Verify `⚠️` badge in compact state and details in expanded menu.
- Floating menu present by default (except when `ui.menu === false`).

4.1 i18n configuration tests

- Default monolingual mode when `i18n` is absent.
- Explicit error when `i18n` is defined without `i18n.mode`.
- Validation for both `suffix` and `folder` modes.

4. Build and distribution tests

- `npm run build:package` outputs `dist/ontowave.js` and `dist/extensions/*.js`.
- Automated size check: minified core ≤ 200KB.
- Verify `dist/ontowave.js` does not inline heavy render engines.

5. Merge gate

- `npm test`
- `npm run test:e2e`
- `npm run check`
- Quick manual smoke check on `https://ontowave.org` after `latest` publish.

## Out of Scope

- **Separate npm packages** (`@ontowave/ext-markdown`): out of scope, to consider if the project gains external contributors
- **Visual config panel** (interface.en.md §6): issue to create in v2.1 once v2.0 is in place
- **SSR / pre-rendering**: out of scope
- **Panini-specific content types** (PaniniFS proprietary formats): issues to create in the relevant repos once v2.0 architecture is available
