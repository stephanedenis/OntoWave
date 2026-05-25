/**
 * Extension KaTeX — implémente ContentRenderer.
 * Le rendu KaTeX est géré par markdown-it-katex dans l'extension Markdown.
 * Ce fichier expose l'extension comme entité déclarable dans le registre.
 */
import type { ContentRenderer } from '../core/types'

const katexRenderer: ContentRenderer = {
  name: 'katex',
  handles: [],

  canRender(_url: string): boolean {
    return false
  },

  async render(source: string, _url: string): Promise<string> {
    return source
  },
}

export default katexRenderer
