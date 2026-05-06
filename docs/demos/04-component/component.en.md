# Component Mode — createApp({ container })

OntoWave can integrate into an existing host application without taking over the entire page. Component mode allows displaying Markdown documentation inside a targeted `<div>`.

## Declarative Usage (Recommended)

Declare `container` in your configuration before loading the bundle:

```html
<script>
  window.ontoWaveConfig = {
    container: '#my-viewer',
    roots: [{ base: '/', root: '/docs' }]
  }
</script>
<div id="my-viewer"></div>
<script src="https://unpkg.com/ontowave/dist/ontowave.min.js"></script>
```

OntoWave creates its content **inside `#my-viewer`** without touching the rest of the page.

## Programmatic Usage

Available via `window.OntoWave.createApp` after loading the bundle:

```javascript
const app = window.OntoWave.createApp({
  container: '#my-viewer',
  roots: [{ base: '/', root: '/docs' }]
})
app.start()
```

## Constraints and Behavior

- The 🌊 floating menu is created **inside the container**, not on `<body>`.
- Routing remains hash-based (`window.location.hash`).
- Without `container`, full-page behavior is preserved (backward-compatible).
- The `ui.menu === false` option hides the menu even in component mode.

## DOM Isolation Guarantee

In component mode, **no element is injected outside the target container**:

| Element | Full-page mode | Component mode |
|---------|----------------|----------------|
| `#ow-content` | `<body>` | Target container |
| `#app` | `<body>` | Target container |
| `#ontowave-floating-menu` | `<body>` | Target container |
| CSS styles | `<head>` | `<head>` (shared) |

## Warning Indicator ⚠️

When auxiliary resources are missing (nav, sitemap, search index), the floating menu displays:
- **Compact state**: subtle `⚠️` badge next to the 🌊 icon
- **Expanded state**: visible detail message

The badge disappears automatically when the resources are available.
