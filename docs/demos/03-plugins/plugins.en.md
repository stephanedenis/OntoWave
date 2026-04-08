# OntoWave Plugin System

OntoWave provides an extensible plugin architecture that allows injecting custom behavior at every stage of the application lifecycle.

## Key Concepts

A **plugin** is a JavaScript object that implements one or more lifecycle methods:

| Hook | When called | Signature |
|------|-------------|-----------|
| `onStart(ctx)` | App startup | `(ctx: PluginContext) => void \| Promise<void>` |
| `onStop()` | App shutdown | `() => void \| Promise<void>` |
| `beforeRender(md, route)` | Before Markdown rendering | `(md: string, route: string) => string \| Promise<string>` |
| `afterRender(html, route)` | After HTML injection | `(html: string, route: string) => void \| Promise<void>` |
| `onRouteChange(route)` | Route change | `(route: string) => void \| Promise<void>` |

## Creating a Plugin

```javascript
const myPlugin = {
  name: 'my-plugin',       // required, must be unique
  version: '1.0.0',        // optional

  onStart(ctx) {
    console.log('[my-plugin] Started', ctx.config)
  },

  beforeRender(md, route) {
    // Add a banner at the top of every page
    return `> 🔖 Route: ${route}\n\n` + md
  },

  afterRender(html, route) {
    console.log('[my-plugin] HTML rendered for', route, '—', html.length, 'bytes')
  },

  onRouteChange(route) {
    console.log('[my-plugin] Navigating to', route)
  },

  onStop() {
    console.log('[my-plugin] Stopped')
  },
}
```

## Registering Plugins

Use `createPluginManager()` to manage your plugins, then pass them to `createApp()`:

```javascript
import { createApp, createPluginManager } from 'ontowave'

const plugins = createPluginManager()
  .use(myPlugin)
  .use(anotherPlugin)

const app = createApp({
  // ... other dependencies ...
  plugins: plugins.getPlugins(),
})

await app.start()
```

## Example Plugins

### Logging Plugin

```javascript
const loggerPlugin = {
  name: 'logger',
  onRouteChange(route) {
    console.log('[logger] Route:', route)
  },
  afterRender(_html, route) {
    console.log('[logger] Render complete:', route)
  },
}
```

### Analytics Plugin

```javascript
const analyticsPlugin = {
  name: 'analytics',
  onRouteChange(route) {
    // Send to analytics service
    navigator.sendBeacon('/track', JSON.stringify({ page: route, ts: Date.now() }))
  },
}
```

### Markdown Transformation Plugin

```javascript
const badgePlugin = {
  name: 'badge',
  beforeRender(md) {
    // Replace [[badge:new]] with a colored HTML span
    return md.replace(/\[\[badge:([^\]]+)\]\]/g,
      (_, label) => `<span class="badge">${label}</span>`)
  },
}
```

### Active Navigation Plugin

```javascript
const activeNavPlugin = {
  name: 'active-nav',
  onRouteChange(route) {
    document.querySelectorAll('nav a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${route}`)
    })
  },
}
```

## API Reference

### `createPluginManager()`

Returns a `PluginManager` with the following methods:

- `register(plugin)` — registers a plugin (warns on duplicate)
- `use(plugin)` — registers and returns the manager (chainable)
- `getPlugins()` — returns the array of registered plugins

### `PluginContext` Interface

Available in `onStart(ctx)`:

- `ctx.config` — full application configuration (`AppConfig`)
- `ctx.navigate(path)` — programmatically navigate to a path

## Known Limitations

- `beforeRender` hooks run sequentially: registration order matters
- `afterRender` receives the HTML *before* DOM transforms (Mermaid, Kroki, etc.)
- Each plugin must have a unique `name` — duplicates are silently ignored with a console warning
