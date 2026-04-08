# Système de plugins OntoWave

OntoWave offre une architecture de plugins extensible qui permet d'injecter du comportement personnalisé à chaque étape du cycle de vie de l'application.

## Concepts clés

Un **plugin** est un objet JavaScript qui implémente une ou plusieurs méthodes de cycle de vie :

| Hook | Moment d'appel | Signature |
|------|----------------|-----------|
| `onStart(ctx)` | Démarrage de l'appli | `(ctx: PluginContext) => void \| Promise<void>` |
| `onStop()` | Arrêt de l'appli | `() => void \| Promise<void>` |
| `beforeRender(md, route)` | Avant le rendu Markdown | `(md: string, route: string) => string \| Promise<string>` |
| `afterRender(html, route)` | Après l'injection du HTML | `(html: string, route: string) => void \| Promise<void>` |
| `onRouteChange(route)` | Changement de route | `(route: string) => void \| Promise<void>` |

## Créer un plugin

```javascript
const monPlugin = {
  name: 'mon-plugin',       // obligatoire, unique
  version: '1.0.0',         // optionnel

  onStart(ctx) {
    console.log('[mon-plugin] Démarrage', ctx.config)
  },

  beforeRender(md, route) {
    // Ajouter une bannière en haut de chaque page
    return `> 🔖 Route : ${route}\n\n` + md
  },

  afterRender(html, route) {
    console.log('[mon-plugin] HTML rendu pour', route, '—', html.length, 'octets')
  },

  onRouteChange(route) {
    console.log('[mon-plugin] Navigation vers', route)
  },

  onStop() {
    console.log('[mon-plugin] Arrêt')
  },
}
```

## Enregistrer des plugins

Utilisez `createPluginManager()` pour gérer vos plugins, puis passez-les à `createApp()` :

```javascript
import { createApp, createPluginManager } from 'ontowave'

const plugins = createPluginManager()
  .use(monPlugin)
  .use(autrePlugin)

const app = createApp({
  // ... autres dépendances ...
  plugins: plugins.getPlugins(),
})

await app.start()
```

## Exemples de plugins intégrables

### Plugin de journalisation

```javascript
const loggerPlugin = {
  name: 'logger',
  onRouteChange(route) {
    console.log('[logger] Route :', route)
  },
  afterRender(_html, route) {
    console.log('[logger] Rendu terminé :', route)
  },
}
```

### Plugin de méta-données analytiques

```javascript
const analyticsPlugin = {
  name: 'analytics',
  onRouteChange(route) {
    // Envoi vers un service d'analyse
    navigator.sendBeacon('/track', JSON.stringify({ page: route, ts: Date.now() }))
  },
}
```

### Plugin de transformation Markdown

```javascript
const badgePlugin = {
  name: 'badge',
  beforeRender(md) {
    // Remplace [[badge:nouveau]] par un span HTML coloré
    return md.replace(/\[\[badge:([^\]]+)\]\]/g,
      (_, label) => `<span class="badge">${label}</span>`)
  },
}
```

### Plugin de mise en évidence de route active

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

## API de référence

### `createPluginManager()`

Retourne un `PluginManager` avec les méthodes :

- `register(plugin)` — enregistre un plugin (avertissement si doublon)
- `use(plugin)` — enregistre et retourne le manager (chaînable)
- `getPlugins()` — retourne le tableau des plugins enregistrés

### Interface `PluginContext`

Disponible dans `onStart(ctx)` :

- `ctx.config` — la configuration complète de l'application (`AppConfig`)
- `ctx.navigate(path)` — navigue programmatiquement vers un chemin

## Limites connues

- Les hooks `beforeRender` sont exécutés en séquence : l'ordre d'enregistrement importe
- `afterRender` reçoit le HTML *avant* les transformations DOM (Mermaid, Kroki, etc.)
- Un plugin doit avoir un `name` unique — les doublons sont ignorés avec avertissement console
