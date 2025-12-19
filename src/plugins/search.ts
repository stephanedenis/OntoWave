import type { OntoWavePlugin, PluginContext } from '../core/plugins'

/**
 * Plugin Search
 * 
 * Recherche full-text dans toute la documentation.
 * Indexe le contenu et fournit une interface de recherche instantanée.
 */
class SearchPlugin implements OntoWavePlugin {
  name = 'search'
  version = '1.0.0'
  description = 'Recherche full-text dans la documentation OntoWave'
  enabled = true

  private index: Map<string, { content: string; title: string }> = new Map()
  private searchUI: HTMLElement | null = null

  async initialize(context: PluginContext) {
    console.log('Initializing Search plugin...')
    
    // Créer l'interface de recherche
    this.createSearchUI(context)
    
    // Indexer le contenu initial
    await this.buildIndex(context)
    
    // Écouter les changements de contenu (si disponible)
    if ((context as any).events) {
      (context as any).events.on('contentLoaded', (data: any) => {
        this.indexContent(data.route, data.content)
      })
    }
    
    console.log(`Search plugin initialized (${this.index.size} pages indexed)`)
  }
  
  destroy() {
    // Cleanup if needed
    if (this.searchUI) {
      this.searchUI.remove()
    }
  }

  // Note: Search plugin n'utilise pas de hooks, il crée sa propre UI

  private createSearchUI(context: PluginContext) {
    const config = context.config || {}
    
    const container = document.createElement('div')
    container.className = 'ontowave-search-container'
    container.innerHTML = `
      <div class="search-box">
        <input
          type="text"
          class="search-input"
          placeholder="${config.placeholder || '🔍 Rechercher...'}"
          autocomplete="off"
        />
        <kbd class="search-shortcut">/</kbd>
      </div>
      <div class="search-results"></div>
    `
    
    // Styles
    this.injectStyles(config)
    
    // Event listeners
    const input = container.querySelector('.search-input') as HTMLInputElement
    input.addEventListener('input', (e) => {
      this.performSearch((e.target as HTMLInputElement).value, config)
    })
    
    // Raccourci clavier
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        input.focus()
      }
      if (e.key === 'Escape') {
        input.blur()
        const results = container.querySelector('.search-results') as HTMLElement
        if (results) results.style.display = 'none'
      }
    })
    
    document.body.appendChild(container)
    this.searchUI = container
  }

  private injectStyles(_config: any) {
    const style = document.createElement('style')
    style.textContent = `
      .ontowave-search-container {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        width: 90%;
        max-width: 600px;
      }
      
      .search-box {
        position: relative;
      }
      
      .search-input {
        width: 100%;
        padding: 12px 50px 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
        background: white;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
      }
      
      .search-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
      }
      
      .search-shortcut {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        padding: 4px 8px;
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 12px;
        color: #666;
      }
      
      .search-results {
        display: none;
        margin-top: 8px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        max-height: 400px;
        overflow-y: auto;
      }
      
      .search-result {
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .search-result:hover {
        background: #f8f9fa;
      }
      
      .search-result:last-child {
        border-bottom: none;
      }
      
      .search-result-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }
      
      .search-result-excerpt {
        font-size: 14px;
        color: #666;
        line-height: 1.5;
      }
      
      .search-highlight {
        background: #fff3cd;
        padding: 2px 4px;
        border-radius: 2px;
      }
      
      .no-results {
        padding: 20px;
        text-align: center;
        color: #666;
      }
    `
    document.head.appendChild(style)
  }

  private async buildIndex(context: PluginContext): Promise<void> {
    // Indexer la page actuelle
    const route = (context as any).services?.router?.currentRoute || window.location.hash
    const content = document.querySelector('#ontowave-root')?.textContent || ''
    const title = document.title
    
    this.index.set(route, { content, title })
  }

  private indexContent(route: string, content: string) {
    // Extraire le titre
    const titleMatch = /<h1[^>]*>(.*?)<\/h1>/i.exec(content)
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : route
    
    // Nettoyer le contenu
    const cleanContent = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    this.index.set(route, { content: cleanContent, title })
  }

  private performSearch(query: string, config: any) {
    const resultsContainer = this.searchUI?.querySelector('.search-results') as HTMLElement
    if (!resultsContainer) return
    
    // Masquer si query vide ou trop courte
    const minChars = config.minChars || 2
    if (!query || query.length < minChars) {
      resultsContainer.style.display = 'none'
      return
    }
    
    // Rechercher
    const results = this.search(query, config)
    
    // Afficher les résultats
    this.displayResults(results, resultsContainer, query)
  }

  private search(query: string, config: any): Array<{ route: string; title: string; excerpt: string; score: number }> {
    const lowerQuery = query.toLowerCase()
    const maxResults = config.maxResults || 10
    const results: Array<{ route: string; title: string; excerpt: string; score: number }> = []
    
    for (const [route, data] of this.index) {
      const lowerContent = data.content.toLowerCase()
      const lowerTitle = data.title.toLowerCase()
      
      // Recherche floue simple
      let score = 0
      
      // Titre match (score élevé)
      if (lowerTitle.includes(lowerQuery)) {
        score += 100
      }
      
      // Contenu match
      const contentIndex = lowerContent.indexOf(lowerQuery)
      if (contentIndex !== -1) {
        score += 10
        
        // Extraire un extrait autour du match
        const start = Math.max(0, contentIndex - 50)
        const end = Math.min(data.content.length, contentIndex + 100)
        const excerpt = (start > 0 ? '...' : '') + 
                       data.content.substring(start, end) + 
                       (end < data.content.length ? '...' : '')
        
        results.push({ route, title: data.title, excerpt, score })
      }
    }
    
    // Trier par score décroissant
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
  }

  private displayResults(results: Array<{ route: string; title: string; excerpt: string }>, container: HTMLElement, query: string) {
    if (results.length === 0) {
      container.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>'
      container.style.display = 'block'
      return
    }
    
    const highlightQuery = (text: string) => {
      const regex = new RegExp(`(${query})`, 'gi')
      return text.replace(regex, '<span class="search-highlight">$1</span>')
    }
    
    container.innerHTML = results.map(result => `
      <div class="search-result" data-route="${result.route}">
        <div class="search-result-title">${highlightQuery(result.title)}</div>
        <div class="search-result-excerpt">${highlightQuery(result.excerpt)}</div>
      </div>
    `).join('')
    
    // Event listeners pour navigation
    container.querySelectorAll('.search-result').forEach(el => {
      el.addEventListener('click', () => {
        const route = el.getAttribute('data-route')
        if (route) {
          window.location.hash = route
          container.style.display = 'none'
        }
      })
    })
    
    container.style.display = 'block'
  }
}

export const searchPlugin = new SearchPlugin()
