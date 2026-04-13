# OntoWave Modular Architecture

> Spec version: 1.0 — April 12, 2026  
> Status: **approved** — implementation delegated to agents

## §1 Founding Principle

OntoWave is a **content navigation** library, not a rendering engine. Rendering is just one extension among many.

The core is responsible for:
- Creating the initial DOM (see [specs/interface.en.md](interface.en.md))
- Routing URLs (hash-based SPA)
- Fetching content (fetch + cache)
- Delegating rendering to the appropriate extension based on content type

Everything else (Markdown, Mermaid, KaTeX, syntax highlighting…) is an **extension**.

## §2 Current Problem

### Monolithic Bundle

The build produces a single ~4.7 MB file:

```
dist/ontowave.js ← mermaid (~1.8MB) + highlight.js + katex + markdown-it×7 + yaml
```

This bundle is fully loaded even for a page with just `# Hello`.

### Root Cause

`src/adapters/browser/enhance.ts` statically imports all rendering engines at startup,
even if the page content doesn't need them.

### Consequence

Performance is proportional to the **bundle size** rather than the **page needs**.

## §3 Target Architecture

### Overview

```
ontowave.js (~100KB)            ← core distributed alone
  ├── bootstrapDom()            — visual shell (minimal HTML → full DOM)
  ├── Hash router               — SPA navigation
  ├── Content fetcher           — fetch + HTTP cache
  ├── ContentRenderer registry  — registry with dynamic loading
  └── Extension loader          — on-demand import()

dist/extensions/
  ├── markdown.js   (~350KB)   — markdown-it + plugins
  ├── mermaid.js    (~1.8MB)   — mermaid (loaded if ```mermaid block detected)
  ├── katex.js      (~300KB)   — KaTeX
  ├── highlight.js  (~200KB)   — syntax highlighting
  └── plantuml.js   (~5KB)     — Kroki URL builder (no heavy dependency)
```

### Distribution Invariant

`dist/ontowave.js` **must never exceed 200KB** (minified + gzip). Any heavy dependency lives in `dist/extensions/`.

## §4 ContentRenderer Interface

Every rendering extension implements this interface.

```typescript
// src/core/types.ts

export interface ContentRenderer {
  /** Unique identifier for the extension */
  readonly name: string

  /** File extensions handled, e.g. ['.md', '.markdown'] */
  readonly handles: string[]

  /**
   * Sub-extensions required by this renderer.
   * If ['mermaid', 'katex'] is returned, the registry loads them
   * as soon as this renderer is activated (opportunistic preload).
   */
  readonly requires?: string[]

  /** Returns true if this extension can process the given URL */
  canRender(url: string, contentType?: string): boolean

  /** Transforms source content into HTML */
  render(source: string, url: string): Promise<string>
}
```

### Extension Registry

```typescript
// src/core/types.ts

export interface ExtensionRegistry {
  /** Registers an already-loaded extension */
  register(renderer: ContentRenderer): void

  /**
   * Dynamically loads an extension by its identifier.
   * url = relative path from dist/ (e.g. 'extensions/markdown.js')
   * The extension must export a ContentRenderer object as default export.
   */
  load(name: string, url: string): Promise<ContentRenderer>

  /** Returns the extension capable of rendering the given URL, or null */
  resolve(url: string, contentType?: string): ContentRenderer | null
}
```

## §5 Extension Configuration

The JSON configuration declares the extensions required by the site:

```json
{
  "roots": [{"base": "/", "root": "/content/"}],
  "i18n": {"default": "fr", "supported": ["fr", "en"]},
  "extensions": {
    "base": ["markdown"],
    "preload": [],
    "lazy": ["mermaid", "katex", "highlight"]
  }
}
```

### Field Semantics

| Field | Behavior |
|---|---|
| `base` | Loaded with the core, required for the first page |
| `preload` | Loaded immediately after the initial render (browser hint) |
| `lazy` | Loaded on demand if content requires it |

### Automatic Resolution of Lazy Extensions

When the Markdown `ContentRenderer` detects a ` ```mermaid ` block in the source,
it calls `registry.load('mermaid', ...)` before finalizing the render. The user
never sees an intermediate state without Mermaid.

## §6 AppConfig Update

```typescript
// src/core/types.ts — addition to existing AppConfig type

type ExtensionConfig = {
  base?: string[]     // e.g. ['markdown']
  preload?: string[]  // loaded just after the first render
  lazy?: string[]     // loaded on demand
}

type AppConfig = {
  // ... existing fields unchanged ...
  extensions?: ExtensionConfig
}
```

## §7 Migration Plan — Option C (Vite Build Split)

This option is chosen because it delivers a real performance improvement **without
breaking the public API or existing tests**.

### Step 1 — ContentRenderer Interface in types.ts

Add `ContentRenderer`, `ExtensionRegistry`, `ExtensionConfig` to `src/core/types.ts`.
No behavioral change.

### Step 2 — Implement the Registry in adapters/

Create `src/adapters/browser/extension-registry.ts` implementing `ExtensionRegistry`
with dynamic `import()`. The registry progressively replaces the static enhance subsystem.

### Step 3 — Move Engines to Separate Files

Each heavy engine (`mermaid`, `katex`, `highlight`) is extracted into
a `src/extensions/<name>.ts` file that exports a `ContentRenderer`.

### Step 4 — Modify vite.config.dist.ts

Configure Vite to produce:
- `dist/ontowave.js` — core (<200KB)
- `dist/extensions/markdown.js` — full Markdown engine
- `dist/extensions/mermaid.js` — Mermaid
- `dist/extensions/katex.js` — KaTeX
- `dist/extensions/highlight.js` — Highlight.js

### Step 5 — Update docs/index.html (invariant)

`docs/index.html` remains near-empty. The JSON config declares the required
extensions. No manual `<script src="extensions/...">` tags.

## §8 Non-Regression Rules

After each step:

1. `npm test` passes (Vitest)
2. `npm run test:e2e` passes (Playwright)
3. `npm run build:package` produces `dist/ontowave.js` ≤ 200KB minified
4. `docs/index.html` does not contain `<script src="extensions/...">`
5. The public API (`import { createApp } from 'ontowave'`) remains unchanged

## §9 Out of Scope

- **Non-Markdown content types** (JSON, CSV, HTML): to be specified in a future issue once the architecture is in place
- **Separate npm packages** (`@ontowave/ext-markdown`): out of scope, to consider if the project gains external contributors
- **Visual config panel**: covered by [interface.en.md §6](interface.en.md)
