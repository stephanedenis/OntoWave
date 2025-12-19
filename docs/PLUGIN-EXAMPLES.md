# 🎨 Plugin Examples

Collection d'exemples pratiques de plugins OntoWave.

## Table des Matières

- [Plugins Simples](#plugins-simples)
- [Plugins de Transformation](#plugins-de-transformation)
- [Plugins UI](#plugins-ui)
- [Plugins Analytics](#plugins-analytics)
- [Plugins Avancés](#plugins-avancés)

---

## Plugins Simples

### 1. Hello World Plugin

Le plugin le plus simple possible.

```typescript
import { Plugin } from 'ontowave'

export const helloWorldPlugin: Plugin = {
  name: 'hello-world',
  version: '1.0.0',
  description: 'Plugin de démonstration basique',
  
  async initialize(context) {
    context.logger.info('Hello from plugin!')
  }
}
```

### 2. Logger Plugin

Plugin qui log toutes les navigations.

```typescript
export const loggerPlugin: Plugin = {
  name: 'logger',
  version: '1.0.0',
  description: 'Log toutes les actions',
  
  hooks: {
    afterNavigation(route) {
      console.log(`📍 Navigation vers: ${route}`)
    },
    
    beforeMarkdownRender(markdown) {
      console.log(`📝 Rendu de ${markdown.length} caractères`)
      return markdown
    },
    
    afterHtmlRender(html) {
      console.log(`✅ HTML généré: ${html.length} caractères`)
      return html
    }
  }
}
```

### 3. Timestamp Plugin

Ajoute un timestamp à chaque page.

```typescript
export const timestampPlugin: Plugin = {
  name: 'timestamp',
  version: '1.0.0',
  description: 'Ajoute un timestamp aux pages',
  
  hooks: {
    afterHtmlRender(html) {
      const timestamp = new Date().toLocaleString('fr-FR')
      const badge = `
        <div class="timestamp" style="
          position: fixed;
          bottom: 10px;
          right: 10px;
          padding: 5px 10px;
          background: #f0f0f0;
          border-radius: 3px;
          font-size: 12px;
        ">
          🕐 ${timestamp}
        </div>
      `
      return html + badge
    }
  }
}
```

---

## Plugins de Transformation

### 1. Auto-Link Plugin

Convertit automatiquement les URLs en liens cliquables.

```typescript
export const autoLinkPlugin: Plugin = {
  name: 'auto-link',
  version: '1.0.0',
  description: 'Convertit les URLs en liens',
  
  hooks: {
    beforeMarkdownRender(markdown) {
      // Regex pour détecter les URLs non-linkées
      const urlRegex = /(?<!\[)(?<!\()https?:\/\/[^\s<>)]+/g
      
      // Remplacer par des liens Markdown
      return markdown.replace(urlRegex, (url) => {
        return `[${url}](${url})`
      })
    }
  }
}
```

### 2. Emoji Plugin

Convertit les codes emoji en émojis réels.

```typescript
export const emojiPlugin: Plugin = {
  name: 'emoji',
  version: '1.0.0',
  description: 'Support des émojis :smile:',
  
  private emojiMap = {
    ':smile:': '😊',
    ':heart:': '❤️',
    ':star:': '⭐',
    ':fire:': '🔥',
    ':rocket:': '🚀',
    ':warning:': '⚠️',
    ':check:': '✅',
    ':cross:': '❌'
  },
  
  hooks: {
    beforeMarkdownRender(markdown) {
      let result = markdown
      
      for (const [code, emoji] of Object.entries(this.emojiMap)) {
        result = result.replace(new RegExp(code, 'g'), emoji)
      }
      
      return result
    }
  }
}
```

**Usage:**
```markdown
C'est génial :rocket: :fire:
```

**Résultat:**
```
C'est génial 🚀 🔥
```

### 3. Custom Blocks Plugin

Ajoute des blocs custom type Docusaurus.

```typescript
export const customBlocksPlugin: Plugin = {
  name: 'custom-blocks',
  version: '1.0.0',
  description: 'Blocs note, tip, warning, danger',
  
  hooks: {
    beforeMarkdownRender(markdown) {
      // :::note ... :::
      markdown = markdown.replace(
        /:::note\n([\s\S]*?)\n:::/g,
        '<div class="custom-block note">📝 $1</div>'
      )
      
      // :::tip ... :::
      markdown = markdown.replace(
        /:::tip\n([\s\S]*?)\n:::/g,
        '<div class="custom-block tip">💡 $1</div>'
      )
      
      // :::warning ... :::
      markdown = markdown.replace(
        /:::warning\n([\s\S]*?)\n:::/g,
        '<div class="custom-block warning">⚠️ $1</div>'
      )
      
      // :::danger ... :::
      markdown = markdown.replace(
        /:::danger\n([\s\S]*?)\n:::/g,
        '<div class="custom-block danger">🚨 $1</div>'
      )
      
      return markdown
    },
    
    afterAppInitialize() {
      // Ajouter les styles
      const style = document.createElement('style')
      style.textContent = `
        .custom-block {
          padding: 1rem;
          margin: 1rem 0;
          border-left: 4px solid;
          border-radius: 4px;
        }
        .custom-block.note {
          background: #e7f2ff;
          border-color: #2e86de;
        }
        .custom-block.tip {
          background: #e7ffe7;
          border-color: #26de81;
        }
        .custom-block.warning {
          background: #fff4e7;
          border-color: #fed330;
        }
        .custom-block.danger {
          background: #ffe7e7;
          border-color: #fc5c65;
        }
      `
      document.head.appendChild(style)
    }
  }
}
```

**Usage:**
```markdown
:::note
Ceci est une note importante.
:::

:::tip
Voici un conseil utile!
:::

:::warning
Attention à ceci.
:::

:::danger
Ne faites pas ça!
:::
```

### 4. Table of Contents Plugin

Génère une table des matières automatique.

```typescript
export const tocPlugin: Plugin = {
  name: 'toc',
  version: '1.0.0',
  description: 'Génère une table des matières',
  
  hooks: {
    afterHtmlRender(html) {
      // Extraire les titres (h2, h3)
      const headings: Array<{level: number, text: string, id: string}> = []
      const headingRegex = /<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/g
      
      let match
      while ((match = headingRegex.exec(html)) !== null) {
        headings.push({
          level: parseInt(match[1]),
          id: match[2],
          text: match[3]
        })
      }
      
      if (headings.length === 0) return html
      
      // Générer la TOC
      let toc = '<nav class="toc"><h4>📚 Table des Matières</h4><ul>'
      
      for (const heading of headings) {
        const indent = heading.level === 3 ? 'style="margin-left: 20px"' : ''
        toc += `<li ${indent}><a href="#${heading.id}">${heading.text}</a></li>`
      }
      
      toc += '</ul></nav>'
      
      // Insérer au début
      return toc + html
    }
  }
}
```

---

## Plugins UI

### 1. Dark Mode Plugin

Ajoute un bouton de basculement du mode sombre.

```typescript
export const darkModePlugin: Plugin = {
  name: 'dark-mode',
  version: '1.0.0',
  description: 'Mode sombre/clair',
  
  async initialize(context) {
    // Restaurer la préférence
    const isDark = localStorage.getItem('darkMode') === 'true'
    
    if (isDark) {
      document.body.classList.add('dark-mode')
    }
    
    // Créer le bouton
    const button = document.createElement('button')
    button.innerHTML = isDark ? '☀️' : '🌙'
    button.className = 'dark-mode-toggle'
    button.title = 'Basculer mode sombre/clair'
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid #ccc;
      background: white;
      cursor: pointer;
      font-size: 24px;
      z-index: 1000;
      transition: all 0.3s;
    `
    
    button.onclick = () => {
      document.body.classList.toggle('dark-mode')
      const isDark = document.body.classList.contains('dark-mode')
      button.innerHTML = isDark ? '☀️' : '🌙'
      localStorage.setItem('darkMode', isDark.toString())
    }
    
    document.body.appendChild(button)
    
    // Ajouter les styles CSS
    this.injectStyles()
  },
  
  injectStyles() {
    const style = document.createElement('style')
    style.textContent = `
      body.dark-mode {
        background: #1a1a1a;
        color: #e0e0e0;
      }
      
      body.dark-mode a {
        color: #6ab0f3;
      }
      
      body.dark-mode code {
        background: #2d2d2d;
        color: #f8f8f2;
      }
      
      body.dark-mode .dark-mode-toggle {
        background: #2d2d2d !important;
        border-color: #555 !important;
      }
    `
    document.head.appendChild(style)
  }
}
```

### 2. Reading Progress Bar

Barre de progression de lecture.

```typescript
export const readingProgressPlugin: Plugin = {
  name: 'reading-progress',
  version: '1.0.0',
  description: 'Barre de progression de lecture',
  
  async initialize(context) {
    // Créer la barre
    const bar = document.createElement('div')
    bar.className = 'reading-progress-bar'
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(to right, #00c6ff, #0072ff);
      z-index: 9999;
      transition: width 0.1s;
    `
    document.body.appendChild(bar)
    
    // Mettre à jour la progression
    const updateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100
      bar.style.width = `${Math.min(progress, 100)}%`
    }
    
    window.addEventListener('scroll', updateProgress)
    updateProgress()
  },
  
  hooks: {
    afterNavigation() {
      // Reset au changement de page
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 0)
    }
  }
}
```

### 3. Back to Top Button

Bouton de retour en haut de page.

```typescript
export const backToTopPlugin: Plugin = {
  name: 'back-to-top',
  version: '1.0.0',
  description: 'Bouton retour en haut',
  
  async initialize(context) {
    const button = document.createElement('button')
    button.innerHTML = '⬆️'
    button.className = 'back-to-top'
    button.title = 'Retour en haut'
    button.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #0072ff;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 20px;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 1000;
    `
    
    // Afficher/masquer selon le scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        button.style.opacity = '1'
      } else {
        button.style.opacity = '0'
      }
    })
    
    // Scroll smooth vers le haut
    button.onclick = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
    
    document.body.appendChild(button)
  }
}
```

### 4. Copy Code Button

Ajoute un bouton de copie aux blocs de code.

```typescript
export const copyCodePlugin: Plugin = {
  name: 'copy-code',
  version: '1.0.0',
  description: 'Bouton de copie pour les blocs de code',
  
  hooks: {
    afterHtmlRender(html) {
      // Wrapper les blocs de code
      return html.replace(
        /<pre><code/g,
        '<div class="code-block"><button class="copy-btn">📋 Copier</button><pre><code'
      ).replace(
        /<\/code><\/pre>/g,
        '</code></pre></div>'
      )
    },
    
    afterNavigation() {
      // Ajouter les event listeners
      document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const codeBlock = btn.nextElementSibling?.querySelector('code')
          if (codeBlock) {
            await navigator.clipboard.writeText(codeBlock.textContent || '')
            btn.textContent = '✅ Copié!'
            setTimeout(() => {
              btn.textContent = '📋 Copier'
            }, 2000)
          }
        })
      })
    }
  },
  
  async initialize() {
    const style = document.createElement('style')
    style.textContent = `
      .code-block {
        position: relative;
      }
      .copy-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 5px 10px;
        background: #2d2d2d;
        color: white;
        border: 1px solid #555;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .copy-btn:hover {
        background: #3d3d3d;
      }
    `
    document.head.appendChild(style)
  }
}
```

---

## Plugins Analytics

### 1. Page View Tracker

Tracker simple de pages vues.

```typescript
export const pageViewTrackerPlugin: Plugin = {
  name: 'page-view-tracker',
  version: '1.0.0',
  description: 'Compte les pages vues',
  
  hooks: {
    afterNavigation(route) {
      // Récupérer le compteur
      const views = JSON.parse(localStorage.getItem('pageViews') || '{}')
      
      // Incrémenter
      views[route] = (views[route] || 0) + 1
      views['_total'] = (views['_total'] || 0) + 1
      
      // Sauvegarder
      localStorage.setItem('pageViews', JSON.stringify(views))
      
      console.log(`📊 Page vue ${views[route]} fois (total: ${views['_total']})`)
    }
  }
}
```

### 2. Time on Page Tracker

Mesure le temps passé sur chaque page.

```typescript
export const timeOnPagePlugin: Plugin = {
  name: 'time-on-page',
  version: '1.0.0',
  description: 'Mesure le temps passé sur chaque page',
  
  private startTime = 0,
  private currentRoute = '',
  
  hooks: {
    afterNavigation(route) {
      // Sauvegarder le temps de la page précédente
      if (this.currentRoute && this.startTime) {
        const timeSpent = Date.now() - this.startTime
        this.saveTime(this.currentRoute, timeSpent)
      }
      
      // Démarrer le chrono pour la nouvelle page
      this.currentRoute = route
      this.startTime = Date.now()
    },
    
    beforePageUnload(route) {
      const timeSpent = Date.now() - this.startTime
      this.saveTime(route, timeSpent)
    }
  },
  
  saveTime(route: string, timeMs: number) {
    const times = JSON.parse(localStorage.getItem('pageTimes') || '{}')
    
    if (!times[route]) {
      times[route] = { total: 0, count: 0, avg: 0 }
    }
    
    times[route].total += timeMs
    times[route].count += 1
    times[route].avg = times[route].total / times[route].count
    
    localStorage.setItem('pageTimes', JSON.stringify(times))
    
    console.log(`⏱️ Temps sur ${route}: ${Math.round(timeMs / 1000)}s`)
  }
}
```

### 3. Click Heatmap Plugin

Enregistre les clics pour créer une heatmap.

```typescript
export const clickHeatmapPlugin: Plugin = {
  name: 'click-heatmap',
  version: '1.0.0',
  description: 'Enregistre les clics pour heatmap',
  
  async initialize(context) {
    document.addEventListener('click', (e) => {
      const x = e.pageX
      const y = e.pageY
      const route = context.services.router.currentRoute
      
      // Enregistrer le clic
      const clicks = JSON.parse(localStorage.getItem('clicks') || '[]')
      clicks.push({
        x,
        y,
        route,
        timestamp: Date.now()
      })
      
      // Garder les 1000 derniers clics
      if (clicks.length > 1000) {
        clicks.shift()
      }
      
      localStorage.setItem('clicks', JSON.stringify(clicks))
      
      // Visualiser (optionnel)
      if (context.config.visualize) {
        this.visualizeClick(x, y)
      }
    })
  },
  
  visualizeClick(x: number, y: number) {
    const dot = document.createElement('div')
    dot.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 10px;
      height: 10px;
      background: rgba(255, 0, 0, 0.5);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
    `
    document.body.appendChild(dot)
    
    setTimeout(() => dot.remove(), 1000)
  }
}
```

---

## Plugins Avancés

### 1. Search Plugin

Recherche full-text dans la documentation.

```typescript
export const searchPlugin: Plugin = {
  name: 'search',
  version: '1.0.0',
  description: 'Recherche dans la documentation',
  
  private index: Map<string, string> = new Map(),
  
  async initialize(context) {
    // Créer l'interface de recherche
    this.createSearchUI()
    
    // Indexer tout le contenu
    await this.buildIndex(context)
  },
  
  createSearchUI() {
    const container = document.createElement('div')
    container.className = 'search-container'
    container.innerHTML = `
      <input
        type="text"
        class="search-input"
        placeholder="🔍 Rechercher..."
      />
      <div class="search-results"></div>
    `
    
    container.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
    `
    
    document.body.appendChild(container)
    
    // Event listener
    const input = container.querySelector('.search-input') as HTMLInputElement
    input.addEventListener('input', (e) => {
      this.search((e.target as HTMLInputElement).value)
    })
  },
  
  async buildIndex(context: PluginContext) {
    const { content } = context.services
    
    try {
      // Lister tous les fichiers
      const files = await content.list('/docs')
      
      // Indexer chaque fichier
      for (const file of files) {
        if (file.endsWith('.md')) {
          const text = await content.load(file)
          this.index.set(file, text)
        }
      }
      
      context.logger.info(`Indexé ${this.index.size} fichiers`)
    } catch (error) {
      context.logger.error('Erreur indexation:', error)
    }
  },
  
  search(query: string) {
    if (!query || query.length < 2) {
      this.displayResults([])
      return
    }
    
    const results: Array<{path: string, excerpt: string}> = []
    const lowerQuery = query.toLowerCase()
    
    for (const [path, content] of this.index) {
      if (content.toLowerCase().includes(lowerQuery)) {
        // Extraire un extrait
        const index = content.toLowerCase().indexOf(lowerQuery)
        const start = Math.max(0, index - 50)
        const end = Math.min(content.length, index + 50)
        const excerpt = content.substring(start, end)
        
        results.push({ path, excerpt })
      }
    }
    
    this.displayResults(results.slice(0, 10))
  },
  
  displayResults(results: Array<{path: string, excerpt: string}>) {
    const container = document.querySelector('.search-results') as HTMLElement
    
    if (results.length === 0) {
      container.style.display = 'none'
      return
    }
    
    container.style.display = 'block'
    container.innerHTML = results.map(r => `
      <div class="search-result">
        <a href="#${r.path}">${r.path}</a>
        <p>${r.excerpt}...</p>
      </div>
    `).join('')
  }
}
```

### 2. Live Reload Plugin

Recharge automatiquement en développement.

```typescript
export const liveReloadPlugin: Plugin = {
  name: 'live-reload',
  version: '1.0.0',
  description: 'Recharge automatique en dev',
  
  async initialize(context) {
    // Uniquement en dev
    if (context.globalConfig.env !== 'development') {
      return
    }
    
    // Connecter au serveur WebSocket
    const ws = new WebSocket('ws://localhost:3000')
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'reload') {
        context.logger.info('🔄 Rechargement détecté')
        location.reload()
      }
    }
    
    ws.onerror = () => {
      context.logger.warn('WebSocket non disponible')
    }
  }
}
```

### 3. Version Banner Plugin

Affiche un bandeau si une nouvelle version est disponible.

```typescript
export const versionBannerPlugin: Plugin = {
  name: 'version-banner',
  version: '1.0.0',
  description: 'Bannière de nouvelle version',
  
  async initialize(context) {
    const currentVersion = context.globalConfig.version || '1.0.0'
    
    // Vérifier la dernière version
    try {
      const response = await fetch('/api/version')
      const data = await response.json()
      
      if (data.version !== currentVersion) {
        this.showBanner(data.version)
      }
    } catch (error) {
      context.logger.error('Erreur vérification version:', error)
    }
  },
  
  showBanner(newVersion: string) {
    const banner = document.createElement('div')
    banner.className = 'version-banner'
    banner.innerHTML = `
      📢 Nouvelle version disponible: ${newVersion}
      <button onclick="location.reload()">Mettre à jour</button>
      <button onclick="this.parentElement.remove()">✕</button>
    `
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #fed330;
      color: #000;
      padding: 10px;
      text-align: center;
      z-index: 9999;
    `
    
    document.body.prepend(banner)
  }
}
```

---

## Configuration HTML

Exemple de configuration complète avec plusieurs plugins :

```html
<!DOCTYPE html>
<html>
<head>
  <title>Ma Documentation avec Plugins</title>
</head>
<body>
  <div id="ontowave-root"></div>
  
  <script src="https://unpkg.com/ontowave@latest/dist/ontowave-with-plugins.min.js"></script>
  
  <script>
    window.ontoWaveConfig = {
      plugins: {
        enabled: [
          'analytics',
          'dark-mode',
          'reading-progress',
          'back-to-top',
          'copy-code',
          'toc',
          'custom-blocks',
          'emoji'
        ],
        config: {
          analytics: {
            trackingId: 'GA-XXXXXXXXX'
          },
          toc: {
            minHeadings: 3
          }
        }
      }
    }
  </script>
</body>
</html>
```

---

**Version**: 1.1.0-alpha  
**Dernière mise à jour**: Décembre 2025
