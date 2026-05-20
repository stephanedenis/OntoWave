/**
 * Extension Highlight.js — implémente ContentRenderer.
 * La coloration syntaxique est gérée par highlight.js dans l'extension Markdown
 * via la configuration de markdown-it. Ce fichier expose l'extension comme entité
 * déclarable dans le registre.
 */
import type { ContentRenderer } from '../core/types'

const highlightRenderer: ContentRenderer = {
  name: 'highlight',
  handles: [],

  canRender(_url: string): boolean {
    return false
  },

  async render(source: string, _url: string): Promise<string> {
    return source
  },
}

export default highlightRenderer
