/**
 * Extension Mermaid — implémente ContentRenderer.
 * Post-traite le HTML rendu pour convertir les blocs ```mermaid en diagrammes SVG.
 * Appelée après le rendu Markdown (phase 2) quand des blocs mermaid sont détectés.
 */
import type { ContentRenderer } from '../core/types'

/** Retourne true si le HTML contient au moins un bloc mermaid. */
export function hasMermaidBlocks(html: string): boolean {
  return html.includes('language-mermaid')
}

/**
 * Rend les blocs mermaid trouvés dans le container DOM.
 * Retourne le HTML mis à jour.
 */
export async function renderMermaidInContainer(container: HTMLElement): Promise<void> {
  const blocks = Array.from(container.querySelectorAll('pre code.language-mermaid')) as HTMLElement[]
  if (blocks.length === 0) return
  const { default: mermaid } = await import('mermaid')
  mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' as any })
  let idx = 0
  for (const code of blocks) {
    const txt = code.textContent || ''
    const pre = code.closest('pre')!
    const wrapper = document.createElement('div')
    wrapper.className = 'mermaid'
    const id = `mmd-${Date.now()}-${idx++}`
    try {
      const { svg } = await mermaid.render(id, txt)
      wrapper.innerHTML = svg
    } catch {
      wrapper.textContent = txt
    }
    pre.replaceWith(wrapper)
  }
}

const mermaidRenderer: ContentRenderer = {
  name: 'mermaid',
  handles: [],

  canRender(_url: string): boolean {
    return false
  },

  async render(source: string, _url: string): Promise<string> {
    // Le rendu Mermaid opère sur le DOM ; cette méthode retourne la source inchangée.
    // Utiliser renderMermaidInContainer() pour le post-traitement DOM réel.
    return source
  },
}

export default mermaidRenderer
