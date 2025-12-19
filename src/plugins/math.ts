import type { OntoWavePlugin, PluginContext } from '../core/plugins'

/**
 * Plugin Math (KaTeX)
 * 
 * Rend les équations mathématiques avec KaTeX.
 * Supporte : inline ($...$) et display ($$...$$) equations.
 */
class MathPlugin implements OntoWavePlugin {
  name = 'math'
  version = '1.0.0'
  description = 'Rendu d\'équations mathématiques avec KaTeX dans OntoWave'
  enabled = true

  private katexLoaded = false

  async initialize(context: PluginContext) {
    console.log('Initializing Math plugin...')
    
    // Charger KaTeX
    await this.loadKaTeX(context)
    
    // Injecter les styles KaTeX
    this.injectKaTeXStyles()
    
    console.log('Math plugin initialized')
  }
  
  destroy() {
    // Cleanup if needed
  }

  hooks = {
    afterHtmlRender: async (html: string): Promise<string> => {
      // Rendre les équations mathématiques
      return this.renderMathEquations(html)
    }
  }

  private async loadKaTeX(_context: PluginContext): Promise<void> {
    if ((window as any).katex) {
      this.katexLoaded = true
      return
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js'
      script.onload = () => {
        this.katexLoaded = true
        console.log('KaTeX loaded successfully')
        resolve()
      }
      script.onerror = () => {
        console.error('Failed to load KaTeX')
        reject(new Error('Failed to load KaTeX'))
      }
      document.head.appendChild(script)
    })
  }

  private injectKaTeXStyles() {
    if (document.querySelector('link[href*="katex"]')) {
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css'
    document.head.appendChild(link)
  }

  private renderMathEquations(html: string): string {
    if (!this.katexLoaded || !(window as any).katex) {
      return html
    }

    let result = html

    try {
      // Rendre les équations display ($$...$$)
      result = result.replace(/\$\$([\s\S]+?)\$\$/g, (match, equation) => {
        try {
          return (window as any).katex.renderToString(equation.trim(), {
            displayMode: true,
            throwOnError: false,
            strict: false
          })
        } catch (error) {
          console.error('KaTeX display error:', error)
          return match
        }
      })

      // Rendre les équations inline ($...$)
      // Éviter les faux positifs (prix en dollars, etc.)
      result = result.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g, (match, equation) => {
        // Vérifier que c'est bien une équation mathématique
        if (/[a-zA-Z0-9+\-*/=^_{}\\()]/.test(equation)) {
          try {
            return (window as any).katex.renderToString(equation.trim(), {
              displayMode: false,
              throwOnError: false,
              strict: false
            })
          } catch (error) {
            console.error('KaTeX inline error:', error)
            return match
          }
        }
        return match
      })
    } catch (error) {
      console.error('Math rendering error:', error)
    }

    return result
  }
}

export const mathPlugin = new MathPlugin()
