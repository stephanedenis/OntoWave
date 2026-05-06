/**
 * Extension PlantUML — implémente ContentRenderer.
 * Rend les blocs plantuml/puml/uml via l'API Kroki (SVG inline).
 * Extrait et refactorisé depuis src/adapters/browser/enhance.ts.
 */
import type { ContentRenderer } from '../core/types'
import { svgCache, compressSvg } from '../adapters/browser/svg-cache'

const KROKI_ENGINE_MAP: Record<string, string> = {
  plantuml: 'plantuml',
  puml: 'plantuml',
  uml: 'plantuml',
  dot: 'graphviz',
  d2: 'd2',
  bpmn: 'bpmn',
}

/** Langages gérés par cette extension (pour la détection dans le HTML). */
export const PLANTUML_LANGUAGES = Object.keys(KROKI_ENGINE_MAP)

/** Retourne true si le HTML contient au moins un bloc plantuml/kroki. */
export function hasPlantumlBlocks(html: string): boolean {
  return PLANTUML_LANGUAGES.some((lang) => html.includes(`language-${lang}`))
}

/** Envoie un bloc source à Kroki et retourne le SVG. */
export async function fetchKrokiSvg(engine: string, source: string): Promise<string | null> {
  const krokiUrl = `https://kroki.io/${engine}/svg`
  const cacheKey = `${krokiUrl}:${source}`

  let svg = svgCache.get(cacheKey)
  if (svg) return svg

  const res = await fetch(krokiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: source,
  })
  if (!res.ok) {
    console.warn(`[OntoWave] Kroki rendu échoué (${res.status}) pour ${engine}`)
    return null
  }
  svg = compressSvg(await res.text())
  svgCache.set(cacheKey, svg)
  return svg
}

/**
 * Post-traite le container DOM pour remplacer les blocs plantuml/kroki
 * par des SVG inline (avec chargement différé via IntersectionObserver).
 */
export async function renderPlantumlInContainer(container: HTMLElement): Promise<void> {
  const blocks = Array.from(container.querySelectorAll('pre code')) as HTMLElement[]

  for (const code of blocks) {
    const classes = code.className.split(/\s+/)
    const langClass = classes.find((c) => c.startsWith('language-'))
    if (!langClass) continue
    const lang = langClass.replace('language-', '')
    const engine = KROKI_ENGINE_MAP[lang]
    if (!engine) continue

    const txt = code.textContent || ''
    const pre = code.closest('pre')
    if (!pre) continue

    const placeholder = document.createElement('div')
    placeholder.className = 'kroki-placeholder'
    placeholder.dataset.engine = engine
    placeholder.dataset.source = txt
    pre.replaceWith(placeholder)
  }

  const placeholders = Array.from(
    container.querySelectorAll<HTMLElement>('.kroki-placeholder'),
  )
  if (placeholders.length === 0) return

  const render = async (el: HTMLElement) => {
    const engine = el.dataset.engine || ''
    const source = el.dataset.source || ''
    try {
      const svg = await fetchKrokiSvg(engine, source)
      if (!svg) return
      const wrapper = document.createElement('div')
      wrapper.innerHTML = svg
      const svgEl = wrapper.querySelector('svg')
      if (svgEl) {
        svgEl.style.maxWidth = '100%'
        svgEl.style.height = 'auto'
        // Attacher les listeners pour les liens internes
        svgEl.querySelectorAll('a[href]').forEach((link) => {
          const href = link.getAttribute('href')
          if (href && (href.endsWith('.md') || href.endsWith('.html') || href.endsWith('.puml'))) {
            link.addEventListener('click', (e) => {
              e.preventDefault()
              window.location.hash = href
            })
          }
        })
        el.replaceWith(svgEl)
      }
    } catch {}
  }

  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target)
            render(entry.target as HTMLElement)
          }
        }
      },
      { rootMargin: '200px' },
    )
    placeholders.forEach((p) => observer.observe(p))
  } else {
    await Promise.all(placeholders.map(render))
  }
}

const plantumlRenderer: ContentRenderer = {
  name: 'plantuml',
  handles: [],

  canRender(_url: string): boolean {
    return false
  },

  async render(source: string, _url: string): Promise<string> {
    return source
  },
}

export default plantumlRenderer
