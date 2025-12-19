import type { OntoWavePlugin, PluginContext } from '../core/plugins'

/**
 * Plugin TOC (Table of Contents)
 * 
 * Génère automatiquement une table des matières basée sur les headings de la page.
 * Supporte : navigation smooth, position sticky, profondeur configurable.
 */
class TOCPlugin implements OntoWavePlugin {
  name = 'toc'
  version = '1.0.0'
  description = 'Génère une table des matières automatique dans OntoWave'
  enabled = true

  private tocContainer: HTMLElement | null = null

  async initialize(context: PluginContext) {
    console.log('Initializing TOC plugin...')
    
    // Créer le conteneur TOC
    this.createTOCContainer(context)
    
    // Injecter les styles
    this.injectStyles(context)
    
    console.log('TOC plugin initialized')
  }
  
  destroy() {
    // Cleanup if needed
    if (this.tocContainer) {
      this.tocContainer.remove()
    }
  }

  // Note: TOC génère sa propre UI après initialize

  private createTOCContainer(context: PluginContext) {
    const config = context.config || {}
    const position = config.position || 'right'
    
    const container = document.createElement('div')
    container.className = `ontowave-toc ontowave-toc-${position}`
    container.innerHTML = `
      <div class="toc-header">
        <h4>📚 Table des Matières</h4>
        <button class="toc-toggle">−</button>
      </div>
      <nav class="toc-nav"></nav>
    `
    
    // Toggle functionality
    const toggle = container.querySelector('.toc-toggle') as HTMLButtonElement
    const nav = container.querySelector('.toc-nav') as HTMLElement
    toggle.addEventListener('click', () => {
      const isCollapsed = nav.style.display === 'none'
      nav.style.display = isCollapsed ? 'block' : 'none'
      toggle.textContent = isCollapsed ? '−' : '+'
    })
    
    document.body.appendChild(container)
    this.tocContainer = container
  }

  private injectStyles(context: PluginContext) {
    const config = context.config || {}
    const sticky = config.sticky !== false
    
    const style = document.createElement('style')
    style.textContent = `
      .ontowave-toc {
        position: ${sticky ? 'fixed' : 'absolute'};
        top: 100px;
        width: 250px;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        max-height: calc(100vh - 120px);
        overflow-y: auto;
        z-index: 100;
      }
      
      .ontowave-toc-right {
        right: 20px;
      }
      
      .ontowave-toc-left {
        left: 20px;
      }
      
      .toc-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e0e0e0;
      }
      
      .toc-header h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }
      
      .toc-toggle {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        color: #666;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .toc-toggle:hover {
        background: #f0f0f0;
        border-radius: 4px;
      }
      
      .toc-nav {
        font-size: 14px;
      }
      
      .toc-nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .toc-nav li {
        margin: 4px 0;
      }
      
      .toc-nav a {
        color: #666;
        text-decoration: none;
        display: block;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s;
      }
      
      .toc-nav a:hover {
        background: #f8f9fa;
        color: #667eea;
      }
      
      .toc-nav a.active {
        background: #e7f2ff;
        color: #667eea;
        font-weight: 600;
      }
      
      .toc-nav .toc-level-2 {
        padding-left: 0;
      }
      
      .toc-nav .toc-level-3 {
        padding-left: 16px;
      }
      
      .toc-nav .toc-level-4 {
        padding-left: 32px;
      }
      
      /* Responsive */
      @media (max-width: 1200px) {
        .ontowave-toc {
          display: none;
        }
      }
      
      /* Scroll spy effect */
      .toc-nav a {
        position: relative;
      }
      
      .toc-nav a::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 0;
        background: #667eea;
        transition: height 0.2s;
      }
      
      .toc-nav a.active::before {
        height: 100%;
      }
    `
    document.head.appendChild(style)
  }

  private generateTOC() {
    if (!this.tocContainer) return
    
    const nav = this.tocContainer.querySelector('.toc-nav') as HTMLElement
    if (!nav) return
    
    // Extraire les headings (h2, h3, h4)
    const content = document.querySelector('#ontowave-root')
    if (!content) return
    
    const headings = Array.from(content.querySelectorAll('h2, h3, h4'))
    
    if (headings.length < 3) {
      // Masquer si pas assez de headings
      this.tocContainer.style.display = 'none'
      return
    }
    
    this.tocContainer.style.display = 'block'
    
    // Générer la structure de la TOC
    const tocHTML = this.buildTOCHTML(headings as HTMLHeadingElement[])
    nav.innerHTML = tocHTML
    
    // Ajouter la navigation smooth
    this.setupSmoothScroll(nav)
    
    // Ajouter le scroll spy
    this.setupScrollSpy(headings as HTMLHeadingElement[])
  }

  private buildTOCHTML(headings: HTMLHeadingElement[]): string {
    let html = '<ul>'
    
    for (const heading of headings) {
      const level = parseInt(heading.tagName.charAt(1))
      const id = heading.id || this.generateId(heading.textContent || '')
      const text = heading.textContent || ''
      
      // Assurer que le heading a un ID
      if (!heading.id) {
        heading.id = id
      }
      
      html += `
        <li class="toc-level-${level}">
          <a href="#${id}" data-id="${id}">${text}</a>
        </li>
      `
    }
    
    html += '</ul>'
    return html
  }

  private generateId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  private setupSmoothScroll(nav: HTMLElement) {
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const id = link.getAttribute('data-id')
        const target = document.getElementById(id || '')
        
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
          
          // Mettre à jour l'URL
          window.history.pushState(null, '', `#${id}`)
        }
      })
    })
  }

  private setupScrollSpy(headings: HTMLHeadingElement[]) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id
        const link = this.tocContainer?.querySelector(`a[data-id="${id}"]`)
        
        if (entry.isIntersecting) {
          // Retirer active de tous les liens
          this.tocContainer?.querySelectorAll('a').forEach(a => a.classList.remove('active'))
          // Ajouter active au lien courant
          link?.classList.add('active')
        }
      })
    }, {
      rootMargin: '-100px 0px -80% 0px'
    })
    
    headings.forEach(heading => observer.observe(heading))
  }
}

export const tocPlugin = new TOCPlugin()
