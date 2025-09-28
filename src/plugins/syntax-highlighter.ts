import type { Plugin, PluginContext } from '../core/plugins'

/**
 * Plugin d'exemple : Custom Syntax Highlighter
 * 
 * Démontre comment créer un plugin pour étendre le rendu Markdown
 * avec des fonctionnalités personnalisées de coloration syntaxique.
 */
class CustomSyntaxHighlighterPlugin implements Plugin {
  name = 'custom-syntax-highlighter'
  version = '1.0.0'
  description = 'Plugin de coloration syntaxique personnalisée avec support de langages additionnels'
  author = 'OntoWave Team'
  dependencies = [] as string[]

  async initialize(context: PluginContext) {
    context.logger.info('Initializing custom syntax highlighter plugin...')
    
    // Injecter le CSS personnalisé
    this.injectCustomStyles()
    
    context.logger.info('Custom syntax highlighter plugin initialized')
  }

  hooks = {
    afterHtmlRender: async (html: string): Promise<string> => {
      // Transformer le HTML pour ajouter la coloration syntaxique personnalisée
      return this.enhanceSyntaxHighlighting(html)
    }
  }

  // Méthodes privées du plugin
  private injectCustomStyles() {
    const style = document.createElement('style')
    style.textContent = `
      /* Styles personnalisés pour la coloration syntaxique */
      .ontowave-custom-highlight {
        background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: bold;
      }
      
      .ontowave-code-block-enhanced {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }
      
      .ontowave-code-block-enhanced::before {
        content: attr(data-language);
        position: absolute;
        top: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        font-size: 12px;
        border-bottom-left-radius: 4px;
        z-index: 1;
      }
      
      .ontowave-line-numbers {
        background: #f8f9fa;
        border-right: 1px solid #e9ecef;
        padding: 1rem 0.5rem;
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
        line-height: 1.5;
        color: #6c757d;
        user-select: none;
      }
    `
    document.head.appendChild(style)
  }

  private enhanceSyntaxHighlighting(html: string): string {
    // Améliorer les blocs de code existants
    let enhancedHtml = html

    // Ajouter des classes personnalisées aux blocs de code
    enhancedHtml = enhancedHtml.replace(
      /<pre><code class="language-(\w+)">/g,
      '<pre class="ontowave-code-block-enhanced" data-language="$1"><code class="language-$1">'
    )

    // Ajouter la coloration pour des mots-clés spéciaux
    const specialKeywords = ['TODO', 'FIXME', 'NOTE', 'WARNING', 'IMPORTANT']
    const keywordRegex = new RegExp(`\\b(${specialKeywords.join('|')})\\b`, 'gi')
    
    enhancedHtml = enhancedHtml.replace(keywordRegex, '<span class="ontowave-custom-highlight">$1</span>')

    // Ajouter des numéros de ligne pour les gros blocs de code
    enhancedHtml = enhancedHtml.replace(
      /<pre class="ontowave-code-block-enhanced"[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
      (match, codeContent) => {
        const lines = codeContent.split('\n')
        if (lines.length > 5) {
          const lineNumbers = lines.map((_: any, i: number) => i + 1).join('\n')
          return match.replace(
            '<pre class="ontowave-code-block-enhanced"',
            `<div style="display: flex;"><div class="ontowave-line-numbers">${lineNumbers}</div><pre class="ontowave-code-block-enhanced" style="margin: 0; flex: 1;"`
          ).replace('</pre>', '</pre></div>')
        }
        return match
      }
    )

    return enhancedHtml
  }
}

export const syntaxHighlighterPlugin = new CustomSyntaxHighlighterPlugin()