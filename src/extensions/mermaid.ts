/**
 * Extension OntoWave — Rendu Mermaid
 *
 * Prend en charge le rendu des diagrammes Mermaid (flowcharts, séquences,
 * classes…) dans les blocs de code ```mermaid.
 *
 * Ce module est chargé dynamiquement par le noyau OntoWave uniquement
 * quand des blocs ```mermaid sont détectés dans la page rendue.
 *
 * Export : objet avec méthode `renderInPage(container: HTMLElement)`.
 */

import mermaid from 'mermaid'

let _initialized = false

async function renderMermaid(container: HTMLElement): Promise<void> {
  const blocks = Array.from(
    container.querySelectorAll('pre code.language-mermaid'),
  ) as HTMLElement[]
  if (blocks.length === 0) return

  if (!_initialized) {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' as never })
    _initialized = true
  }

  let idx = 0
  for (const code of blocks) {
    const txt = code.textContent || ''
    const pre = code.closest('pre')
    if (!pre) continue
    const wrapper = document.createElement('div')
    wrapper.className = 'mermaid'
    const id = `mmd-${Date.now()}-${idx++}`
    try {
      const { svg } = await mermaid.render(id, txt)
      wrapper.innerHTML = svg
    } catch {
      // fallback : conserver le texte source si le rendu échoue
      wrapper.textContent = txt
    }
    pre.replaceWith(wrapper)
  }
}

const mermaidExtension = {
  /** Détecte et rend tous les blocs ```mermaid dans l'élément conteneur */
  renderInPage: renderMermaid,
}

export default mermaidExtension
export type MermaidExtension = typeof mermaidExtension
