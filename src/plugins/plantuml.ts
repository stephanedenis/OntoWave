import type { OntoWavePlugin, PluginContext } from '../core/plugins'

/**
 * Plugin PlantUML
 * 
 * Rend les diagrammes UML avec PlantUML.
 * Supporte : class diagrams, sequence diagrams, component diagrams, etc.
 */
class PlantUMLPlugin implements OntoWavePlugin {
  name = 'plantuml'
  version = '1.0.0'
  description = 'Rendu de diagrammes PlantUML dans OntoWave'
  enabled = true

  private serverUrl = 'https://www.plantuml.com/plantuml'
  private format = 'svg'
  private cache = new Map<string, string>()

  async initialize(context: PluginContext) {
    console.log('Initializing PlantUML plugin...')
    
    // Configuration
    this.serverUrl = context.config.serverUrl || this.serverUrl
    this.format = context.config.format || this.format
    
    console.log(`PlantUML configured: ${this.serverUrl} (format: ${this.format})`)
  }
  
  destroy() {
    // Cleanup if needed
  }

  hooks = {
    afterHtmlRender: async (html: string): Promise<string> => {
      // Transformer les blocs PlantUML en images
      return await this.renderPlantUMLDiagrams(html)
    }
  }

  private async renderPlantUMLDiagrams(html: string): Promise<string> {
    const regex = /<pre><code class="language-plantuml">([\s\S]*?)<\/code><\/pre>/g
    const matches = Array.from(html.matchAll(regex))
    
    if (matches.length === 0) return html
    
    let result = html
    
    for (const match of matches) {
      const code = match[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .trim()
      
      try {
        const imageUrl = await this.generatePlantUMLUrl(code)
        const imgTag = `
          <div class="plantuml-diagram">
            <img src="${imageUrl}" alt="PlantUML Diagram" />
          </div>
        `
        result = result.replace(match[0], imgTag)
      } catch (error) {
        console.error('PlantUML rendering error:', error)
        // Garder le code original en cas d'erreur
      }
    }
    
    return result
  }

  private async generatePlantUMLUrl(code: string): Promise<string> {
    // Vérifier le cache
    if (this.cache.has(code)) {
      return this.cache.get(code)!
    }
    
    // Encoder le code PlantUML
    const encoded = this.encodePlantUML(code)
    const url = `${this.serverUrl}/${this.format}/${encoded}`
    
    // Mettre en cache
    this.cache.set(code, url)
    
    return url
  }

  private encodePlantUML(code: string): string {
    // Compression PlantUML (algorithme deflate + base64 custom)
    // Pour simplifier, on utilise une URL-encoding simple
    // En production, il faudrait utiliser la vraie compression PlantUML
    
    // Ajouter @startuml/@enduml si manquants
    if (!code.trim().startsWith('@start')) {
      code = `@startuml\n${code}\n@enduml`
    }
    
    // Pour l'instant, utilisation simple de btoa (à améliorer)
    try {
      const compressed = this.compress(code)
      return compressed
    } catch (error) {
      console.error('PlantUML encoding error:', error)
      return btoa(code)
    }
  }

  private compress(text: string): string {
    // Algorithme de compression PlantUML simplifié
    // En production, il faudrait utiliser pako.js pour deflate
    const base64 = btoa(unescape(encodeURIComponent(text)))
    return base64.replace(/\+/g, '-').replace(/\//g, '_')
  }
}

export const plantumlPlugin = new PlantUMLPlugin()
