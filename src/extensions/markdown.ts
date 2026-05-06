/**
 * Extension OntoWave — Rendu Markdown complet
 *
 * Fournit un moteur Markdown avec :
 * - markdown-it + plugins (anchor, footnote, katex, container, link-attributes)
 * - KaTeX (via markdown-it-katex)
 * - Highlight.js (coloration syntaxique)
 *
 * Ce module est chargé dynamiquement par le noyau OntoWave (dist/ontowave.js)
 * uniquement quand du contenu Markdown doit être rendu.
 *
 * Export : objet compatible avec l'interface MarkdownRenderer du noyau.
 */

import { createMd } from '../adapters/browser/md'

const _md = createMd({ light: false })

const markdownRenderer = {
  /** Transforme un source Markdown en HTML */
  render(mdSrc: string): string {
    return _md.render(mdSrc)
  },
}

export default markdownRenderer
export type MarkdownExtension = typeof markdownRenderer
