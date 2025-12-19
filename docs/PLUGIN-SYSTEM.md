# 🔌 Système de Plugins OntoWave

## Vue d'ensemble

Le système de plugins OntoWave permet d'étendre les fonctionnalités de la bibliothèque de documentation interactive de manière modulaire et configurable, tout en respectant la philosophie OntoWave : **un seul fichier .min.js, configuration dans HTML uniquement**.

## 🎯 Philosophie

### Principes Fondamentaux

1. **Configuration HTML uniquement** - Pas de fichiers JSON externes
2. **Chargement dynamique** - Plugins intégrés au bundle ou chargés à la demande
3. **Zero-config par défaut** - Fonctionnement immédiat sans configuration
4. **Extensibilité totale** - API complète pour créer des plugins personnalisés

### Architecture

```
OntoWave Core
    ↓
Plugin Manager
    ↓
┌─────────┬──────────┬─────────┬─────────┐
│Analytics│ Mermaid  │PlantUML │  Math   │
└─────────┴──────────┴─────────┴─────────┘
    ↓          ↓          ↓          ↓
  Hooks    Hooks     Hooks      Hooks
```

## 🚀 Démarrage Rapide

### Utilisation de Base

```html
<!DOCTYPE html>
<html>
<head>
  <title>Ma Documentation</title>
</head>
<body>
  <div id="ontowave-root"></div>
  
  <!-- OntoWave avec plugins intégrés -->
  <script src="https://unpkg.com/ontowave@latest/dist/ontowave-with-plugins.min.js"></script>
  
  <script>
    window.ontoWaveConfig = {
      plugins: {
        enabled: [
          'analytics',
          'mermaid',
          'plantuml',
          'math'
        ]
      }
    }
  </script>
</body>
</html>
```

### Configuration Avancée

```javascript
window.ontoWaveConfig = {
  plugins: {
    // Plugins à activer
    enabled: [
      'analytics',
      'mermaid'
    ],
    
    // Configuration spécifique par plugin
    config: {
      analytics: {
        trackingId: 'GA-XXXXXXXXX',
        anonymizeIp: true,
        trackDownloads: true
      },
      mermaid: {
        theme: 'dark',
        logLevel: 'error'
      }
    },
    
    // Plugins externes (optionnel)
    external: [
      {
        name: 'custom-plugin',
        url: 'https://cdn.example.com/my-plugin.js',
        integrity: 'sha384-...'
      }
    ]
  }
}
```

## 📦 Plugins Officiels

### 1. Analytics Plugin

Suivi des pages visitées et interactions utilisateur.

**Activation:**
```javascript
plugins: {
  enabled: ['analytics'],
  config: {
    analytics: {
      trackingId: 'GA-XXXXXXXXX',  // ID Google Analytics
      anonymizeIp: true,            // Anonymiser les IPs
      trackDownloads: true,         // Suivre les téléchargements
      trackOutboundLinks: true      // Suivre liens externes
    }
  }
}
```

**Événements trackés:**
- Pages visitées
- Clics sur liens externes
- Téléchargements de fichiers
- Temps passé sur page
- Interactions utilisateur

### 2. Custom Syntax Highlighter Plugin

Coloration syntaxique personnalisée avec thèmes et langages additionnels.

**Activation:**
```javascript
plugins: {
  enabled: ['custom-syntax-highlighter'],
  config: {
    'custom-syntax-highlighter': {
      theme: 'monokai',           // Thème de coloration
      showLineNumbers: true,       // Afficher numéros de ligne
      highlightLines: [1, 5, 10],  // Lignes à surligner
      languages: ['rust', 'go']    // Langages additionnels
    }
  }
}
```

### 3. Mermaid Plugin (À venir)

Rendu de diagrammes Mermaid.

```javascript
plugins: {
  enabled: ['mermaid'],
  config: {
    mermaid: {
      theme: 'default',
      logLevel: 'error',
      startOnLoad: true
    }
  }
}
```

### 4. PlantUML Plugin (À venir)

Rendu de diagrammes PlantUML.

```javascript
plugins: {
  enabled: ['plantuml'],
  config: {
    plantuml: {
      serverUrl: 'https://www.plantuml.com/plantuml',
      format: 'svg',
      cache: true
    }
  }
}
```

### 5. Math Plugin (À venir)

Rendu mathématique avec KaTeX.

```javascript
plugins: {
  enabled: ['math'],
  config: {
    math: {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false}
      ],
      throwOnError: false
    }
  }
}
```

### 6. Search Plugin (À venir)

Recherche full-text dans la documentation.

```javascript
plugins: {
  enabled: ['search'],
  config: {
    search: {
      placeholder: 'Rechercher...',
      minChars: 3,
      maxResults: 10,
      fuzzy: true
    }
  }
}
```

### 7. TOC Plugin (À venir)

Table des matières automatique.

```javascript
plugins: {
  enabled: ['toc'],
  config: {
    toc: {
      position: 'right',
      minHeadings: 3,
      maxDepth: 3,
      sticky: true
    }
  }
}
```

## 🛠️ Créer un Plugin Personnalisé

### Structure de Base

```typescript
import { Plugin, PluginContext } from 'ontowave'

export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'Mon plugin personnalisé',
  author: 'Votre Nom',
  
  // Dépendances optionnelles
  dependencies: ['other-plugin'],
  
  // Initialisation
  async initialize(context: PluginContext): Promise<void> {
    console.log('Mon plugin est initialisé!')
    
    // Accès aux services OntoWave
    const { content, router, view, markdown } = context.services
    
    // Configuration du plugin
    const config = context.config
  },
  
  // Hooks du cycle de vie
  hooks: {
    beforeMarkdownRender(markdown: string): string {
      // Transformer le Markdown avant le rendu
      return markdown.replace(/TODO:/g, '✅ TODO:')
    },
    
    afterHtmlRender(html: string): string {
      // Transformer le HTML après le rendu
      return html
    },
    
    afterNavigation(route: string): void {
      // Réagir aux changements de page
      console.log(`Navigation vers: ${route}`)
    },
    
    transformContent(content: string, path: string): string {
      // Transformer le contenu avant le rendu Markdown
      return content
    }
  },
  
  // Nettoyage
  async dispose(): Promise<void> {
    // Libérer les ressources
  }
}
```

### Hooks Disponibles

#### 1. beforeMarkdownRender
Appelé avant que le Markdown soit converti en HTML.

```typescript
beforeMarkdownRender(markdown: string): string {
  // Transformer le markdown
  return modifiedMarkdown
}
```

#### 2. afterHtmlRender
Appelé après la conversion HTML, avant l'affichage.

```typescript
afterHtmlRender(html: string): string {
  // Transformer le HTML
  return modifiedHtml
}
```

#### 3. afterNavigation
Appelé après chaque navigation.

```typescript
afterNavigation(route: string): void {
  // Réagir à la navigation
}
```

#### 4. transformContent
Appelé avant le rendu Markdown pour transformer le contenu brut.

```typescript
transformContent(content: string, path: string): string {
  // Transformer le contenu
  return modifiedContent
}
```

#### 5. beforeAppInitialize
Appelé avant l'initialisation de l'application.

```typescript
async beforeAppInitialize(context: PluginContext): Promise<void> {
  // Préparation avant démarrage
}
```

#### 6. afterAppInitialize
Appelé après l'initialisation de l'application.

```typescript
async afterAppInitialize(context: PluginContext): Promise<void> {
  // Actions post-initialisation
}
```

## 🎨 Exemples de Plugins

### Plugin d'Auto-Complétion de Liens

```typescript
export const autoLinkPlugin: Plugin = {
  name: 'auto-link',
  version: '1.0.0',
  description: 'Convertit automatiquement les URLs en liens',
  
  hooks: {
    beforeMarkdownRender(markdown: string): string {
      // Regex pour détecter les URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g
      
      // Remplacer par des liens Markdown
      return markdown.replace(urlRegex, '[$1]($1)')
    }
  }
}
```

### Plugin de Statistiques de Lecture

```typescript
export const readingStatsPlugin: Plugin = {
  name: 'reading-stats',
  version: '1.0.0',
  description: 'Affiche le temps de lecture estimé',
  
  hooks: {
    afterHtmlRender(html: string): string {
      // Compter les mots
      const text = html.replace(/<[^>]*>/g, '')
      const wordCount = text.split(/\s+/).length
      const readingTime = Math.ceil(wordCount / 200) // 200 mots/min
      
      // Ajouter un badge de temps de lecture
      const badge = `
        <div class="reading-stats">
          📖 Temps de lecture: ${readingTime} min (${wordCount} mots)
        </div>
      `
      
      return badge + html
    }
  }
}
```

### Plugin de Dark Mode

```typescript
export const darkModePlugin: Plugin = {
  name: 'dark-mode',
  version: '1.0.0',
  description: 'Ajoute un bouton de basculement mode sombre',
  
  async initialize(context: PluginContext): Promise<void> {
    // Créer le bouton de basculement
    const button = document.createElement('button')
    button.textContent = '🌙'
    button.className = 'dark-mode-toggle'
    button.onclick = () => {
      document.body.classList.toggle('dark-mode')
      button.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙'
    }
    
    document.body.appendChild(button)
    
    // Restaurer la préférence
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode')
      button.textContent = '☀️'
    }
  }
}
```

## 🔧 API Avancée

### PluginContext

Le contexte fourni à chaque plugin contient :

```typescript
interface PluginContext {
  // Services OntoWave
  services: {
    content: ContentService    // Chargement de contenu
    router: RouterService      // Navigation
    view: ViewRenderer        // Rendu de vue
    markdown: MarkdownRenderer // Rendu Markdown
  }
  
  // Configuration du plugin
  config: Record<string, any>
  
  // Configuration globale OntoWave
  globalConfig: AppConfig
  
  // Logger pour le plugin
  logger: PluginLogger
  
  // Gestionnaire d'événements
  events: PluginEvents
}
```

### PluginLogger

```typescript
interface PluginLogger {
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  debug(message: string, ...args: any[]): void
}
```

### PluginEvents

```typescript
interface PluginEvents {
  on(event: string, handler: Function): void
  off(event: string, handler: Function): void
  emit(event: string, ...args: any[]): void
}
```

## 📚 Bonnes Pratiques

### 1. Gestion des Erreurs

```typescript
hooks: {
  async afterHtmlRender(html: string): Promise<string> {
    try {
      // Code du plugin
      return processedHtml
    } catch (error) {
      context.logger.error('Erreur dans le plugin:', error)
      // Retourner le HTML original en cas d'erreur
      return html
    }
  }
}
```

### 2. Performance

```typescript
// ✅ BON - Lazy loading
async initialize(context: PluginContext): Promise<void> {
  // Charger les dépendances uniquement quand nécessaire
  const heavyLib = await import('./heavy-library.js')
}

// ❌ MAUVAIS - Chargement synchrone de grandes dépendances
initialize(context: PluginContext): void {
  const heavyLib = require('./heavy-library.js')
}
```

### 3. Configuration par Défaut

```typescript
async initialize(context: PluginContext): Promise<void> {
  // Fournir des valeurs par défaut
  const config = {
    enabled: true,
    theme: 'default',
    ...context.config
  }
}
```

### 4. Nettoyage des Ressources

```typescript
export const myPlugin: Plugin = {
  name: 'my-plugin',
  
  private listeners: Array<() => void> = []
  
  async initialize(context: PluginContext): Promise<void> {
    const listener = () => console.log('Event!')
    document.addEventListener('click', listener)
    this.listeners.push(() => document.removeEventListener('click', listener))
  },
  
  async dispose(): Promise<void> {
    // Nettoyer tous les listeners
    this.listeners.forEach(cleanup => cleanup())
    this.listeners = []
  }
}
```

## 🧪 Tests

### Tester un Plugin

```typescript
import { describe, it, expect } from 'vitest'
import { OntoWavePluginManager } from 'ontowave'
import { myPlugin } from './my-plugin'

describe('MyPlugin', () => {
  it('should transform markdown', async () => {
    const manager = new OntoWavePluginManager(mockServices, {})
    await manager.register(myPlugin)
    
    const result = await manager.executeHooks('beforeMarkdownRender', '# Test')
    expect(result).toBe('# Test Modified')
  })
})
```

## 📖 Ressources

- [API Reference](PLUGIN-API-REFERENCE.md) - Documentation complète de l'API
- [Exemples](PLUGIN-EXAMPLES.md) - Collection d'exemples de plugins
- [Plugin Demo](plugin-demo.html) - Démo interactive des plugins
- [GitHub Issues](https://github.com/stephanedenis/OntoWave/issues?q=label%3Aplugin) - Issues liées aux plugins

## 🤝 Contribuer

Pour créer un plugin officiel :

1. Forkez le repository
2. Créez votre plugin dans `src/plugins/`
3. Ajoutez des tests dans `src/tests/plugins/`
4. Documentez dans `PLUGIN-EXAMPLES.md`
5. Soumettez une Pull Request

## 📝 License

Les plugins officiels suivent la même license qu'OntoWave : CC-BY-NC-SA-4.0

---

**Version**: 1.1.0-alpha  
**Dernière mise à jour**: Décembre 2025
