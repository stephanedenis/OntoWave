/**
 * Extension Markdown avancée — implémente ContentRenderer.
 * Utilise markdown-it avec les plugins katex, footnote, highlight, containers, etc.
 * Constitue la phase 2 du rendu en deux temps (après le rendu minimal du noyau).
 */
import { createMd } from '../adapters/browser/md'
import type { ContentRenderer } from '../core/types'

const markdownRenderer: ContentRenderer = {
  name: 'markdown',
  handles: ['.md', '.markdown'],
  requires: ['highlight', 'mermaid', 'katex'],

  canRender(url: string): boolean {
    const clean = url.split('?')[0]
    return clean.endsWith('.md') || clean.endsWith('.markdown')
  },

  async render(source: string, _url: string): Promise<string> {
    const md = createMd({ light: false })
    return md.render(source)
  },
}

export default markdownRenderer
