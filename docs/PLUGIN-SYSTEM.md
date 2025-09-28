# 🔌 OntoWave Plugin System Architecture

## Vision et Philosophie

Le système de plugins OntoWave respecte la philosophie fondamentale du projet : **simplicité, performance et zéro configuration externe**.

### Principes Fondamentaux

1. **Un seul fichier** : Tout est intégré dans `ontowave.min.js`
2. **Configuration HTML uniquement** : Pas de fichiers `.json` externes
3. **Chargement dynamique** : Plugins activés à l'exécution selon la configuration
4. **Auto-enregistrement** : Les plugins s'enregistrent automatiquement au chargement

## 📋 Architecture Technique

### Structure des Plugins

```typescript
interface OntoWavePlugin {
  readonly name: string;        // Nom unique du plugin
  readonly version: string;     // Version du plugin
  readonly description?: string; // Description optionnelle
  
  enabled: boolean;             // État d'activation
  
  initialize(context: PluginContext): Promise<void> | void;
  destroy(): Promise<void> | void;
}
```
    D --> E[Execute Hooks]
    E --> D
    D --> F[Unregister]
    F --> G[Destroy]
```

## Quick Start

### 1. Configuration

Activez les plugins dans `config.json` :

```json
{
  "plugins": {
    "enabled": [
      "custom-syntax-highlighter",
      "analytics"
    ],
    "config": {
      "analytics": {
        "trackingId": "GA_MEASUREMENT_ID"
      }
    }
  }
}
```

### 2. Plugin Simple

```typescript
import { createSimplePlugin } from 'ontowave/plugins'

export const myPlugin = createSimplePlugin({
  name: 'my-custom-plugin',
  version: '1.0.0',
  description: 'Mon plugin personnalisé',
  
  afterHtmlRender: (html) => {
    return html.replace(/TODO/g, '<mark>TODO</mark>')
  }
})
```

### 3. Plugin Avancé

```typescript
import type { Plugin, PluginContext } from 'ontowave/plugins'

class AdvancedPlugin implements Plugin {
  name = 'advanced-plugin'
  version = '1.0.0'
  
  async initialize(context: PluginContext) {
    context.logger.info('Plugin initialized')
    
    // Écouter les événements
    context.registerHook('afterNavigation', (route) => {
      this.handleNavigation(route, context)
    })
  }
  
  private handleNavigation(route: string, context: PluginContext) {
    context.logger.debug(`Navigation to: ${route}`)
  }
}
```

## API Reference

### Plugin Interface

```typescript
interface Plugin {
  name: string
  version: string
  description?: string
  author?: string
  dependencies?: string[]
  
  initialize?(context: PluginContext): Promise<void> | void
  destroy?(): Promise<void> | void
  hooks?: PluginHooks
}
```

### Available Hooks

| Hook | Description | Parameters | Return |
|------|-------------|------------|--------|
| `beforeMarkdownRender` | Avant le rendu MD | `markdown: string` | `string` |
| `afterHtmlRender` | Après le rendu HTML | `html: string` | `string` |
| `afterNavigation` | Après navigation | `route: string` | `void` |
| `transformContent` | Transform contenu | `content: string, route: string` | `string` |

### Plugin Context

```typescript
interface PluginContext {
  config: AppConfig           // Configuration globale
  services: PluginServices    // Services disponibles
  logger: PluginLogger        // Logger du plugin
  registerHook: Function      // Enregistrer des hooks
  emit: Function             // Émettre des événements
}
```

## Plugins Officiels

### Analytics Plugin

Track les vues de pages avec Google Analytics.

**Configuration:**

```json
{
  "plugins": {
    "enabled": ["analytics"],
    "config": {
      "analytics": {
        "trackingId": "GA_MEASUREMENT_ID"
      }
    }
  }
}
```

**Fonctionnalités:**
- ✅ Google Analytics integration
- ✅ Page view tracking
- ✅ Event tracking
- ✅ Privacy compliant

### Custom Syntax Highlighter

Améliore la coloration syntaxique avec des fonctionnalités avancées.

**Fonctionnalités:**
- ✅ Mots-clés spéciaux (TODO, FIXME, etc.)
- ✅ Numéros de ligne automatiques
- ✅ Styles personnalisables
- ✅ Support multi-langages

## Development Guide

### 1. Setup

```bash
# Cloner le repo
git clone https://github.com/stephanedenis/OntoWave.git
cd OntoWave

# Installer les dépendances
npm install

# Build avec plugins
npm run build:plugins
```

### 2. Créer un Plugin

```typescript
// src/plugins/my-plugin.ts
import type { Plugin, PluginContext } from '../core/plugins'

class MyPlugin implements Plugin {
  name = 'my-plugin'
  version = '1.0.0'
  
  async initialize(context: PluginContext) {
    // Votre logique d'initialisation
  }
  
  hooks = {
    afterHtmlRender: async (html: string) => {
      // Votre transformation HTML
      return html
    }
  }
}

export const myPlugin = new MyPlugin()
```

### 3. Enregistrer le Plugin

```typescript
// src/plugins/index.ts
export { myPlugin } from './my-plugin'

// src/app-with-plugins.ts  
import { myPlugin } from './plugins'

const availablePlugins = new Map([
  // ... autres plugins
  ['my-plugin', myPlugin]
])
```

### 4. Testing

```typescript
// tests/plugins/my-plugin.test.ts
import { describe, it, expect } from 'vitest'
import { myPlugin } from '../../src/plugins/my-plugin'

describe('MyPlugin', () => {
  it('should have correct metadata', () => {
    expect(myPlugin.name).toBe('my-plugin')
    expect(myPlugin.version).toBe('1.0.0')
  })
})
```

## Best Practices

### Performance
- ⚡ Lazy loading des resources
- ⚡ Caching intelligent des résultats
- ⚡ Éviter les transformations coûteuses

### Sécurité  
- 🔒 Validation des inputs
- 🔒 Sanitization HTML
- 🔒 Respect du CSP

### Compatibilité
- 🔧 Versioning sémantique
- 🔧 Dépendances explicites
- 🔧 Tests de régression

### UX
- 🎨 Loading states
- 🎨 Error handling gracieux
- 🎨 Configuration intuitive

## Examples

### Content Transformer

```typescript
export const contentTransformer = createSimplePlugin({
  name: 'content-transformer',
  version: '1.0.0',
  
  beforeMarkdownRender: (markdown) => {
    // Ajouter des métadonnées automatiques
    return `<!-- Generated by OntoWave -->\n${markdown}`
  },
  
  afterHtmlRender: (html) => {
    // Ajouter des liens automatiques
    return html.replace(
      /https?:\/\/[^\s]+/g, 
      '<a href="$&" target="_blank">$&</a>'
    )
  }
})
```

### Theme Plugin

```typescript
class ThemePlugin implements Plugin {
  name = 'theme-plugin'
  version = '1.0.0'
  
  async initialize(context: PluginContext) {
    const theme = context.config.theme || 'light'
    this.applyTheme(theme)
    
    // Écouter les changements de thème
    context.registerHook('afterNavigation', () => {
      this.refreshTheme()
    })
  }
  
  private applyTheme(theme: string) {
    document.body.className = `theme-${theme}`
  }
  
  private refreshTheme() {
    // Logic to refresh theme
  }
}
```

## Troubleshooting

### Plugin Not Loading

1. Vérifier le nom dans `config.json`
2. Vérifier l'export dans `plugins/index.ts`
3. Vérifier les dépendances

### Hook Not Firing

1. Vérifier l'enregistrement du hook
2. Vérifier l'ordre d'initialisation
3. Vérifier les erreurs dans la console

### Performance Issues

1. Profiler avec DevTools
2. Optimiser les transformations
3. Implémenter le caching

---

*Le système de plugins OntoWave offre une extensibilité complète tout en maintenant la performance et la simplicité d'utilisation.*