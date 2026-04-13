# Specifications — OntoWave Bootstrap Interface

**Reference version**: `ontowave.js` March 2026 (pure JS class)  
**Applies to**: `dist/ontowave.min.js` v1.x and above  
**Language**: English (translation) — [Version française](interface.fr.md)  
**Status**: Living document — all implementations must conform

---

## 1. Founding Principle

> **The HTML page is near-empty. The library creates all the DOM.**

A correct OntoWave page contains only:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My site</title>
</head>
<body>
  <script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
</body>
</html>
```

The library automatically detects configuration, creates the interface and loads content. **The user defines nothing in HTML.**

---

## 2. Optional Inline Configuration

Configuration can be passed directly in the page, before the library `<script>`:

```html
<body>
  <script>
    window.ontoWaveConfig = {
      roots: [
        { base: 'fr', root: 'content/fr/' },
        { base: 'en', root: 'content/en/' }
      ],
      i18n: { default: 'en', supported: ['en', 'fr'] }
    };
  </script>
  <script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
</body>
```

**Configuration resolution priority** (descending order):

1. `window.ontoWaveConfig` (inline in the page)
2. Config bundled in the library (embedded `config.json`)
3. `config.json` fetched from the site root

---

## 3. Automatic Bootstrap

On load, the library applies this algorithm:

```
1. Read configuration (per §2 priority)
2. If document.getElementById('app') exists → STOP (custom mode)
3. Otherwise → create full DOM:
   a. Inject <style id="ow-bootstrap-styles"> with base CSS
   b. Create <div id="ow-content"><div id="app"></div></div>
   c. Create floating menu (§4)
   d. Initialize router and load default page
```

**The `#app` guard is idempotent**: demo pages that define `<div id="app">` in their HTML are not affected by bootstrap.

---

## 4. Floating Menu — Visual Specification

### 4.1 CSS Identity

| Property | Value |
|----------|-------|
| Position | `fixed; top: 20px; left: 20px` |
| Z-index | `1000` |
| Background | `rgba(255, 255, 255, 0.95)` |
| Blur | `backdrop-filter: blur(10px)` |
| Border | `1px solid #e1e4e8` |
| Shadow | `0 4px 12px rgba(27, 31, 35, 0.15)` |
| Cursor | `move` (draggable) |
| Transition | `all 0.3s ease` |
| HTML ID | `#ontowave-floating-menu` |

### 4.2 Compact State (default)

- **Icon**: `&#127754;` (🌊 native emoji)
- **Icon size**: 30×30 px inside a 44×44 px area
- **Real bounding box**: ≈ 66×66 px (padding + overflow)
- **Border-radius**: 44px (circle)
- **Visible content**: icon only

```
┌──────────────┐
│     🌊       │  ← 66×66px
└──────────────┘
```

### 4.3 Expanded State (after clicking icon)

The circle stretches **horizontally** to the right to reveal the brand and actions. It does NOT drop down.

- **Border-radius**: 22px (pill)
- **Padding**: 10px 18px
- **Gap between items**: 10px
- **Animation**: `width: 0 → auto; opacity: 0 → 1; transition: all 0.3s ease`

Visible content from left to right:

```
┌─────────────────────────────────────────────────────────────┐
│ 🌊  OntoWave.org  [🏠 Home]  [FR]  [EN]  [⚙️ Settings]    │
└─────────────────────────────────────────────────────────────┘
```

**Element detail**:

| Element | CSS class | Behavior |
|---------|-----------|----------|
| 🌊 icon | `.ontowave-menu-icon` | Toggle expand/compact |
| Brand | `.ontowave-menu-brand` | Link to ontowave.org (new tab) |
| 🏠 Home | `.ontowave-menu-option` | Loads default page |
| [FR] [EN] (etc.) | `.ontowave-lang-btn` | Instant language switch |
| ⚙️ Settings | `.ontowave-menu-option` | Opens configuration panel |

**The OntoWave.org brand is hidden** (display:none or visibility:hidden) in compact state.

### 4.4 Language Buttons

- One button per language declared in `i18n.supported`
- Class `.active` on the current language
- Active language: green background `#28a745`, white text
- Inactive language: light gray background `#f8f9fa`, border `#d0d7de`
- Click → changes language instantly (< 100ms), reloads content

### 4.5 Hover

- **On compact menu**: `transform: scale(1.05)`, enhanced shadow `0 6px 20px rgba(27,31,35,0.25)`
- **On a `menu-option`**: `transform: translateY(-1px)`, slightly darker background
- **Hover disabled** when configuration panel is open (class `.has-config-panel`)

---

## 5. Drag & Drop

### 5.1 Expected Behavior

- **Trigger**: `mousedown` / `touchstart` on menu in **compact state only**
- **Constraint**: position limited to viewport (with margins), menu cannot leave screen
- **Cursor**: `move` in compact state, `default` in expanded state (class `.no-drag`)
- **Persistence**: position kept for session duration, **NOT persisted** in localStorage after reload
- **Disabled when**: expanded state OR configuration panel open

### 5.2 Initial Position

```
top: 20px; left: 20px
```

### 5.3 Touch Support

Drag must work with a single finger on mobile/tablet (`touchstart`, `touchmove`, `touchend`).

---

## 6. Configuration Panel ⚙️

*(Future specification — out of scope for v1)*

The panel will be accessible via the ⚙️ button in the expanded menu. It must allow:

- Viewing and editing the active configuration
- **Download HTML**: standalone page with inline config and CDN
- **Download JS**: `ontowave.min.js` bundle
- Closing by clicking outside or pressing Escape

While the panel is open:
- Menu drag is disabled (class `.has-config-panel`)
- Hover scale effect is disabled

---

## 7. Responsive

### Mobile (≤ 480px)

- Floating menu: reduced size (TBD, ≈ 40×40px)
- Position: `top: 10px; left: 10px`
- Content area: `padding: 1rem`

### Tablet (≤ 768px)

- Functional menu, normal size
- Fixed language buttons (if `languageButtons: "fixed"`): `top: 10px; right: 10px`

---

## 8. What the Library MUST NOT Do

| ❌ Forbidden | Reason |
|-------------|--------|
| Require `<div id="app">` in HTML | Breaks minimal principle |
| Require `<div id="site-header">` | Same |
| Require `<style>` or external CSS | Same |
| Create a fixed `<header>` at page top | Breaks "page = content only" concept |
| Create a persistent `<nav>` or `<aside>` | Same |
| Create a sidebar or TOC in layout | Same — navigation via floating menu only |
| Make usage impossible without JS | The `<noscript>` tag covers SEO crawlers |

---

## 9. Anti-Drift Rule for `docs/index.html`

`docs/index.html` is the project's **user reference page**. It must satisfy all constraints in this spec. It may therefore only contain:

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OntoWave</title>
  <meta name="description" content="...">
</head>
<body>
  <noscript><!-- Bilingual SEO content --></noscript>
  <script src="/ontowave.min.js"></script>
</body>
</html>
```

**Verifiable invariants (to test in CI)**:

- `docs/index.html` does not contain `#site-header`
- `docs/index.html` does not contain `#sidebar`
- `docs/index.html` does not contain `#layout`
- `docs/index.html` does not contain a `<style>` block outside `<noscript>`
- Line count excluding `<noscript>` is ≤ 15

---

## 10. Non-Regression Contract

Any commit modifying `src/main.ts` or `src/adapters/` must satisfy:

1. Floating menu appears on a page with no pre-defined HTML
2. Menu has the visual identity described in §4 (translucent white background, 🌊 icon, subtle border)
3. Clicking the icon triggers horizontal expansion (not a dropdown)
4. Language can be changed via menu buttons
5. `docs/index.html` respects the §9 invariants

---

*Maintained by Stéphane Denis — [ontowave.org](https://ontowave.org)*
