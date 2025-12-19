import type { OntoWavePlugin, PluginContext } from '../core/plugins'

/**
 * Plugin Mermaid
 * 
 * Rend les diagrammes Mermaid directement dans la documentation.
 * Supporte : flowcharts, sequence diagrams, gantt charts, state diagrams, etc.
 */
class MermaidPlugin implements OntoWavePlugin {
  name = 'mermaid'
  version = '1.0.0'
  description = 'Rendu de diagrammes Mermaid dans OntoWave'
  enabled = true

  private mermaidLoaded = false

  async initialize(context: PluginContext) {
    console.log('Initializing Mermaid plugin...')
    
    // Charger Mermaid.js depuis CDN
    await this.loadMermaid(context)
    
    // Configurer Mermaid
    const config = {
      theme: context.config.theme || 'default',
      logLevel: context.config.logLevel || 'error',
      startOnLoad: false, // On contrôle le rendu manuellement
      securityLevel: 'loose',
      ...context.config
    }
    
    if (this.mermaidLoaded && (window as any).mermaid) {
      (window as any).mermaid.initialize(config)
      console.log('Mermaid configured:', config)
    }
  }
  
  destroy() {
    // Cleanup if needed
  }

  hooks = {
    afterHtmlRender: async (html: string): Promise<string> => {
      // Transformer les blocs de code mermaid en diagrammes
      return this.renderMermaidDiagrams(html)
    },
    
    afterNavigation: async (): Promise<void> => {
      // Re-render les diagrammes Mermaid après navigation
      if (this.mermaidLoaded && (window as any).mermaid) {
        // Attendre que le DOM soit mis à jour
        await new Promise(resolve => setTimeout(resolve, 100))
        await (window as any).mermaid.run({
          querySelector: '.mermaid'
        })
      }
    }
  }

  private async loadMermaid(_context: PluginContext): Promise<void> {
    if ((window as any).mermaid) {
      this.mermaidLoaded = true
      return
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
      script.type = 'module'
      script.onload = () => {
        this.mermaidLoaded = true
        console.log('Mermaid.js loaded successfully')
        resolve()
      }
      script.onerror = () => {
        console.error('Failed to load Mermaid.js')
        reject(new Error('Failed to load Mermaid.js'))
      }
      document.head.appendChild(script)
    })
  }

  private renderMermaidDiagrams(html: string): string {
    // Transformer <pre><code class="language-mermaid"> en <div class="mermaid">
    return html.replace(
      /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
      (match, code) => {
        // Décoder les entités HTML
        const decodedCode = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
        
        return `<div class="mermaid">${decodedCode.trim()}</div>`
      }
    )
  }
}

export const mermaidPlugin = new MermaidPlugin()
