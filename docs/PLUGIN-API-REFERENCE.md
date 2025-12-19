# 📚 Plugin API Reference

Documentation complète de l'API des plugins OntoWave.

## Table des Matières

- [Types Core](#types-core)
- [Plugin Interface](#plugin-interface)
- [PluginContext](#plugincontext)
- [Plugin Hooks](#plugin-hooks)
- [PluginManager](#pluginmanager)
- [Services](#services)
- [Types Utilitaires](#types-utilitaires)

---

## Types Core

### Plugin

Interface principale pour définir un plugin.

```typescript
interface Plugin {
  /** Nom unique du plugin */
  name: string
  
  /** Version sémantique (semver) */
  version: string
  
  /** Description courte du plugin */
  description: string
  
  /** Auteur du plugin */
  author?: string
  
  /** License du plugin */
  license?: string
  
  /** URL du repository */
  repository?: string
  
  /** Dépendances (noms d'autres plugins) */
  dependencies?: string[]
  
  /** Fonction d'initialisation */
  initialize?(context: PluginContext): Promise<void> | void
  
  /** Hooks du cycle de vie */
  hooks?: PluginHooks
  
  /** Fonction de nettoyage */
  dispose?(): Promise<void> | void
}
```

**Exemple:**
```typescript
export const myPlugin: Plugin = {
  name: 'my-awesome-plugin',
  version: '1.0.0',
  description: 'Un plugin génial',
  author: 'John Doe',
  license: 'MIT',
  dependencies: ['core-utils'],
  
  async initialize(context) {
    console.log('Plugin initialisé!')
  },
  
  hooks: {
    beforeMarkdownRender(md) {
      return md.toUpperCase()
    }
  },
  
  async dispose() {
    console.log('Plugin désactivé')
  }
}
```

---

## PluginContext

Contexte fourni à chaque plugin lors de l'initialisation.

```typescript
interface PluginContext {
  /** Services OntoWave */
  services: PluginServices
  
  /** Configuration spécifique du plugin */
  config: Record<string, any>
  
  /** Configuration globale OntoWave */
  globalConfig: AppConfig
  
  /** Logger pour le plugin */
  logger: PluginLogger
  
  /** Gestionnaire d'événements */
  events: PluginEvents
}
```

### PluginServices

Services disponibles pour les plugins.

```typescript
interface PluginServices {
  /** Service de chargement de contenu */
  content: ContentService
  
  /** Service de routage */
  router: RouterService
  
  /** Moteur de rendu de vue */
  view: ViewRenderer
  
  /** Moteur de rendu Markdown */
  markdown: MarkdownRenderer
}
```

### PluginLogger

Logger spécifique pour chaque plugin.

```typescript
interface PluginLogger {
  /** Log d'information */
  info(message: string, ...args: any[]): void
  
  /** Log d'avertissement */
  warn(message: string, ...args: any[]): void
  
  /** Log d'erreur */
  error(message: string, ...args: any[]): void
  
  /** Log de debug (visible uniquement en dev) */
  debug(message: string, ...args: any[]): void
}
```

**Exemple:**
```typescript
async initialize(context: PluginContext) {
  context.logger.info('Démarrage du plugin')
  context.logger.debug('Config:', context.config)
  
  try {
    // ... code du plugin
  } catch (error) {
    context.logger.error('Erreur:', error)
  }
}
```

### PluginEvents

Système d'événements inter-plugins.

```typescript
interface PluginEvents {
  /** Écouter un événement */
  on(event: string, handler: (...args: any[]) => void): void
  
  /** Arrêter d'écouter un événement */
  off(event: string, handler: (...args: any[]) => void): void
  
  /** Émettre un événement */
  emit(event: string, ...args: any[]): void
}
```

**Exemple:**
```typescript
async initialize(context: PluginContext) {
  // Écouter un événement custom
  context.events.on('content:loaded', (path, content) => {
    console.log(`Contenu chargé: ${path}`)
  })
  
  // Émettre un événement custom
  context.events.emit('my-plugin:ready', { version: '1.0.0' })
}
```

---

## Plugin Hooks

Hooks du cycle de vie disponibles pour les plugins.

```typescript
interface PluginHooks {
  /** Appelé avant l'initialisation de l'app */
  beforeAppInitialize?(context: PluginContext): Promise<void> | void
  
  /** Appelé après l'initialisation de l'app */
  afterAppInitialize?(context: PluginContext): Promise<void> | void
  
  /** Transforme le contenu brut avant le rendu Markdown */
  transformContent?(content: string, path: string): string | Promise<string>
  
  /** Transforme le Markdown avant conversion HTML */
  beforeMarkdownRender?(markdown: string): string | Promise<string>
  
  /** Transforme le HTML après conversion */
  afterHtmlRender?(html: string): string | Promise<string>
  
  /** Appelé après chaque navigation */
  afterNavigation?(route: string): void | Promise<void>
  
  /** Appelé avant déchargement d'une page */
  beforePageUnload?(route: string): void | Promise<void>
}
```

### beforeAppInitialize

Appelé avant le démarrage de l'application OntoWave.

**Signature:**
```typescript
beforeAppInitialize?(context: PluginContext): Promise<void> | void
```

**Cas d'usage:**
- Initialiser des services externes
- Charger des dépendances
- Préparer des ressources

**Exemple:**
```typescript
hooks: {
  async beforeAppInitialize(context) {
    // Charger Google Analytics
    const script = document.createElement('script')
    script.src = 'https://www.googletagmanager.com/gtag/js'
    document.head.appendChild(script)
    
    await new Promise(resolve => script.onload = resolve)
  }
}
```

### afterAppInitialize

Appelé après le démarrage complet de l'application.

**Signature:**
```typescript
afterAppInitialize?(context: PluginContext): Promise<void> | void
```

**Cas d'usage:**
- Modifier le DOM initial
- Ajouter des éléments UI
- Démarrer des services

**Exemple:**
```typescript
hooks: {
  afterAppInitialize(context) {
    // Ajouter un bouton de feedback
    const button = document.createElement('button')
    button.textContent = '💬 Feedback'
    button.className = 'feedback-button'
    button.onclick = () => showFeedbackModal()
    document.body.appendChild(button)
  }
}
```

### transformContent

Transforme le contenu brut avant le rendu Markdown.

**Signature:**
```typescript
transformContent?(content: string, path: string): string | Promise<string>
```

**Paramètres:**
- `content`: Contenu brut du fichier
- `path`: Chemin du fichier

**Retour:** Contenu transformé

**Cas d'usage:**
- Remplacer des variables
- Inclure du contenu externe
- Préprocessing custom

**Exemple:**
```typescript
hooks: {
  transformContent(content, path) {
    // Remplacer {{date}} par la date actuelle
    const date = new Date().toLocaleDateString('fr-FR')
    return content.replace(/\{\{date\}\}/g, date)
  }
}
```

### beforeMarkdownRender

Transforme le Markdown avant conversion en HTML.

**Signature:**
```typescript
beforeMarkdownRender?(markdown: string): string | Promise<string>
```

**Paramètres:**
- `markdown`: Contenu Markdown

**Retour:** Markdown transformé

**Cas d'usage:**
- Ajouter des extensions Markdown custom
- Transformer la syntaxe
- Ajouter des metadata

**Exemple:**
```typescript
hooks: {
  beforeMarkdownRender(markdown) {
    // Convertir :::note en blocs d'alerte
    return markdown.replace(
      /:::note\n([\s\S]*?)\n:::/g,
      '<div class="note">$1</div>'
    )
  }
}
```

### afterHtmlRender

Transforme le HTML après conversion depuis Markdown.

**Signature:**
```typescript
afterHtmlRender?(html: string): string | Promise<string>
```

**Paramètres:**
- `html`: HTML généré

**Retour:** HTML transformé

**Cas d'usage:**
- Ajouter des wrappers
- Modifier des attributs
- Injecter des scripts

**Exemple:**
```typescript
hooks: {
  afterHtmlRender(html) {
    // Ajouter target="_blank" aux liens externes
    return html.replace(
      /<a href="https?:\/\//g,
      '<a target="_blank" rel="noopener" href="http'
    )
  }
}
```

### afterNavigation

Appelé après chaque changement de page.

**Signature:**
```typescript
afterNavigation?(route: string): void | Promise<void>
```

**Paramètres:**
- `route`: Nouvelle route (ex: "/docs/api")

**Cas d'usage:**
- Tracking analytics
- Scroll to top
- Mettre à jour l'UI

**Exemple:**
```typescript
hooks: {
  afterNavigation(route) {
    // Envoyer un page view à Google Analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: route,
        page_title: document.title
      })
    }
    
    // Scroll to top
    window.scrollTo(0, 0)
  }
}
```

### beforePageUnload

Appelé avant de quitter une page.

**Signature:**
```typescript
beforePageUnload?(route: string): void | Promise<void>
```

**Paramètres:**
- `route`: Route actuelle

**Cas d'usage:**
- Sauvegarder l'état
- Nettoyer des ressources
- Tracking du temps passé

**Exemple:**
```typescript
let startTime = Date.now()

hooks: {
  afterNavigation(route) {
    startTime = Date.now()
  },
  
  beforePageUnload(route) {
    const timeSpent = Date.now() - startTime
    console.log(`Temps passé sur ${route}: ${timeSpent}ms`)
  }
}
```

---

## PluginManager

Gestionnaire de plugins OntoWave.

```typescript
class OntoWavePluginManager {
  constructor(services: PluginServices, config: PluginsConfig)
  
  /** Enregistrer un plugin */
  register(plugin: Plugin): Promise<void>
  
  /** Initialiser tous les plugins */
  initializeAll(): Promise<void>
  
  /** Obtenir un plugin par son nom */
  getPlugin(name: string): Plugin | undefined
  
  /** Vérifier si un plugin est chargé */
  hasPlugin(name: string): boolean
  
  /** Exécuter un hook sur tous les plugins */
  executeHooks<T>(hookName: keyof PluginHooks, ...args: any[]): Promise<T>
  
  /** Dispose tous les plugins */
  dispose(): Promise<void>
}
```

### register

Enregistre un nouveau plugin.

**Signature:**
```typescript
async register(plugin: Plugin): Promise<void>
```

**Erreurs:**
- `Plugin name is required`
- `Plugin already registered`
- `Missing dependency: ${dep}`

**Exemple:**
```typescript
const manager = new OntoWavePluginManager(services, config)

await manager.register({
  name: 'my-plugin',
  version: '1.0.0',
  description: 'Mon plugin'
})
```

### initializeAll

Initialise tous les plugins enregistrés.

**Signature:**
```typescript
async initializeAll(): Promise<void>
```

**Comportement:**
- Résout l'ordre des dépendances
- Initialise dans l'ordre correct
- Log les erreurs sans bloquer

**Exemple:**
```typescript
await manager.register(pluginA)
await manager.register(pluginB)
await manager.initializeAll()
```

### executeHooks

Exécute un hook sur tous les plugins.

**Signature:**
```typescript
async executeHooks<T>(
  hookName: keyof PluginHooks,
  ...args: any[]
): Promise<T>
```

**Paramètres:**
- `hookName`: Nom du hook
- `args`: Arguments du hook

**Retour:** Résultat transformé (pour hooks de transformation)

**Exemple:**
```typescript
// Transformer du Markdown
const transformed = await manager.executeHooks(
  'beforeMarkdownRender',
  '# Hello World'
)

// Notifier navigation
await manager.executeHooks('afterNavigation', '/docs/api')
```

---

## Services

### ContentService

Service de chargement de contenu.

```typescript
interface ContentService {
  /** Charger un fichier */
  load(path: string): Promise<string>
  
  /** Vérifier si un fichier existe */
  exists(path: string): Promise<boolean>
  
  /** Lister les fichiers d'un répertoire */
  list(dir: string): Promise<string[]>
  
  /** Obtenir les métadonnées d'un fichier */
  getMetadata(path: string): Promise<FileMetadata>
}
```

**Exemple:**
```typescript
async initialize(context: PluginContext) {
  const { content } = context.services
  
  // Charger un fichier
  const readme = await content.load('/README.md')
  
  // Vérifier existence
  if (await content.exists('/config.json')) {
    const config = await content.load('/config.json')
  }
  
  // Lister les fichiers
  const files = await content.list('/docs')
  console.log('Fichiers:', files)
}
```

### RouterService

Service de navigation.

```typescript
interface RouterService {
  /** Route actuelle */
  currentRoute: string
  
  /** Naviguer vers une route */
  navigate(route: string): Promise<void>
  
  /** Obtenir l'historique */
  getHistory(): string[]
  
  /** Revenir en arrière */
  back(): void
  
  /** Avancer */
  forward(): void
}
```

**Exemple:**
```typescript
hooks: {
  afterAppInitialize(context) {
    const { router } = context.services
    
    // Naviguer vers une page
    document.querySelector('#home-btn').onclick = () => {
      router.navigate('/')
    }
    
    // Bouton retour
    document.querySelector('#back-btn').onclick = () => {
      router.back()
    }
    
    console.log('Route actuelle:', router.currentRoute)
  }
}
```

### ViewRenderer

Moteur de rendu de vue.

```typescript
interface ViewRenderer {
  /** Rendre une vue */
  render(template: string, data: Record<string, any>): string
  
  /** Rendre dans un élément */
  renderInto(element: HTMLElement, template: string, data: any): void
  
  /** Enregistrer un helper */
  registerHelper(name: string, fn: Function): void
}
```

**Exemple:**
```typescript
async initialize(context: PluginContext) {
  const { view } = context.services
  
  // Enregistrer un helper
  view.registerHelper('uppercase', (str: string) => str.toUpperCase())
  
  // Rendre un template
  const html = view.render(
    '<h1>{{uppercase title}}</h1>',
    { title: 'hello' }
  )
  // Résultat: <h1>HELLO</h1>
}
```

### MarkdownRenderer

Moteur de rendu Markdown.

```typescript
interface MarkdownRenderer {
  /** Convertir Markdown en HTML */
  render(markdown: string): string
  
  /** Enregistrer une extension */
  registerExtension(extension: MarkdownExtension): void
  
  /** Configuration actuelle */
  config: MarkdownConfig
}
```

**Exemple:**
```typescript
async initialize(context: PluginContext) {
  const { markdown } = context.services
  
  // Enregistrer une extension
  markdown.registerExtension({
    name: 'custom-blocks',
    pattern: /:::(\w+)\n([\s\S]*?)\n:::/g,
    replace: (match, type, content) => {
      return `<div class="custom-${type}">${content}</div>`
    }
  })
}
```

---

## Types Utilitaires

### PluginsConfig

Configuration globale des plugins.

```typescript
interface PluginsConfig {
  /** Plugins à activer */
  enabled?: string[]
  
  /** Configuration par plugin */
  config?: Record<string, any>
  
  /** Plugins externes */
  external?: ExternalPlugin[]
}
```

### ExternalPlugin

Plugin externe à charger dynamiquement.

```typescript
interface ExternalPlugin {
  /** Nom du plugin */
  name: string
  
  /** URL du bundle JS */
  url: string
  
  /** Hash d'intégrité (SRI) */
  integrity?: string
  
  /** Configuration du plugin */
  config?: Record<string, any>
}
```

### AppConfig

Configuration globale OntoWave.

```typescript
interface AppConfig {
  /** Titre de l'application */
  title?: string
  
  /** Langue par défaut */
  defaultLang?: string
  
  /** Configuration des plugins */
  plugins?: PluginsConfig
  
  /** Configuration du Markdown */
  markdown?: MarkdownConfig
  
  /** Configuration du routeur */
  router?: RouterConfig
}
```

---

## Exemples Complets

### Plugin Analytics Avancé

```typescript
export const advancedAnalyticsPlugin: Plugin = {
  name: 'advanced-analytics',
  version: '2.0.0',
  description: 'Tracking analytics avancé',
  
  async initialize(context: PluginContext) {
    const config = {
      trackingId: 'GA-XXXXXXXXX',
      anonymizeIp: true,
      trackDownloads: true,
      trackOutboundLinks: true,
      ...context.config
    }
    
    // Initialiser GA
    await this.initGA(config.trackingId)
    
    // Tracker les clics sur liens externes
    if (config.trackOutboundLinks) {
      document.addEventListener('click', (e) => {
        const link = (e.target as HTMLElement).closest('a')
        if (link && link.hostname !== location.hostname) {
          this.trackEvent('outbound_link', {
            url: link.href,
            text: link.textContent
          })
        }
      })
    }
    
    // Tracker les téléchargements
    if (config.trackDownloads) {
      document.addEventListener('click', (e) => {
        const link = (e.target as HTMLElement).closest('a')
        if (link && /\.(pdf|zip|doc|docx)$/.test(link.href)) {
          this.trackEvent('download', {
            file: link.href,
            type: link.href.split('.').pop()
          })
        }
      })
    }
  },
  
  hooks: {
    afterNavigation(route) {
      // Envoyer page view
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: route,
          page_title: document.title
        })
      }
    }
  },
  
  async initGA(trackingId: string) {
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`
    script.async = true
    document.head.appendChild(script)
    
    window.dataLayer = window.dataLayer || []
    window.gtag = function() { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', trackingId)
  },
  
  trackEvent(name: string, params: any) {
    if (window.gtag) {
      window.gtag('event', name, params)
    }
  }
}
```

---

## Changelog

### v1.1.0-alpha (Décembre 2025)
- 🎉 Version initiale de l'API
- ✨ Support des hooks de cycle de vie
- ✨ Système d'événements inter-plugins
- ✨ Services OntoWave accessibles
- 📚 Documentation complète

---

**Version**: 1.1.0-alpha  
**Dernière mise à jour**: Décembre 2025
