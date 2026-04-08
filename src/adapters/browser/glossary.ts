import type { GlossaryConfig, GlossaryTerm } from '../../core/types'
import { mergeGlossarySources, buildTermRegex } from '../../core/glossary'

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchGlossarySource(url: string): Promise<GlossaryTerm[]> {
  try {
    const res = await fetch(url, { cache: 'no-cache' })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.terms) ? (data.terms as GlossaryTerm[]) : []
  } catch {
    return []
  }
}

async function loadGlossaryMap(config: GlossaryConfig): Promise<Map<string, GlossaryTerm>> {
  const sources = config.sources ?? []
  const loaded: GlossaryTerm[][] = []
  // Sequential load to guarantee last-wins merge order
  for (const url of sources) {
    const terms = await fetchGlossarySource(url)
    loaded.push(terms)
  }
  return mergeGlossarySources(loaded)
}

// ---------------------------------------------------------------------------
// Tooltip / sidebar UI
// ---------------------------------------------------------------------------

let tooltipEl: HTMLElement | null = null
let tooltipTimeout: ReturnType<typeof setTimeout> | null = null

function getOrCreateTooltip(maxWidth: number): HTMLElement {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.id = 'ow-glossary-tooltip'
    tooltipEl.setAttribute('role', 'tooltip')
    tooltipEl.style.cssText = [
      'position:fixed',
      'z-index:9999',
      `max-width:${maxWidth}px`,
      'background:#1e293b',
      'color:#f1f5f9',
      'border-radius:6px',
      'padding:0.6rem 0.9rem',
      'font-size:0.85rem',
      'line-height:1.5',
      'box-shadow:0 4px 16px rgba(0,0,0,0.3)',
      'pointer-events:none',
      'opacity:0',
      'transition:opacity 0.15s ease',
    ].join(';')
    document.body.appendChild(tooltipEl)
  }
  return tooltipEl
}

function showTooltip(term: GlossaryTerm, anchor: HTMLElement, maxWidth: number) {
  const el = getOrCreateTooltip(maxWidth)
  el.innerHTML = `<strong>${escapeHtml(term.term)}</strong><br>${escapeHtml(term.definition)}`
  el.style.opacity = '0'
  el.style.display = 'block'

  const rect = anchor.getBoundingClientRect()
  const top = rect.bottom + window.scrollY + 6
  const left = Math.min(rect.left + window.scrollX, window.innerWidth - maxWidth - 16)
  el.style.top = `${top}px`
  el.style.left = `${Math.max(8, left)}px`
  // Force reflow then animate
  void el.offsetWidth
  el.style.opacity = '1'
}

function hideTooltip() {
  if (tooltipEl) {
    tooltipEl.style.opacity = '0'
  }
}

function showSidebar(term: GlossaryTerm) {
  const sidebar = document.getElementById('sidebar')
  if (!sidebar) return

  const existing = document.getElementById('ow-glossary-panel')
  if (existing) existing.remove()

  const panel = document.createElement('div')
  panel.id = 'ow-glossary-panel'
  panel.style.cssText = [
    'border-top:2px solid #3b82f6',
    'padding:0.75rem 1rem',
    'background:#f0f7ff',
    'margin-bottom:1rem',
  ].join(';')
  panel.innerHTML = [
    `<div style="font-weight:700;font-size:0.95rem;margin-bottom:0.3rem;">${escapeHtml(term.term)}</div>`,
    `<div style="font-size:0.85rem;line-height:1.5;color:#334155;">${escapeHtml(term.definition)}</div>`,
    `<div style="margin-top:0.5rem;"><a href="${encodeURIComponent(term.href)}" style="font-size:0.8rem;color:#3b82f6;">→ Fiche complète</a></div>`,
  ].join('')

  sidebar.prepend(panel)
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ---------------------------------------------------------------------------
// CSS injection
// ---------------------------------------------------------------------------

function injectGlossaryStyles(underlineStyle: string) {
  const id = 'ow-glossary-styles'
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = `.ow-term{text-decoration:underline ${underlineStyle};text-underline-offset:3px;text-decoration-color:#3b82f6;cursor:help;}`
  document.head.appendChild(style)
}

// ---------------------------------------------------------------------------
// DOM walking & annotation
// ---------------------------------------------------------------------------

const EXCLUDED_DEFAULT = ['code', 'pre', 'kbd', 'script', 'style', 'textarea']

/**
 * Annotate text nodes inside `container` with glossary term wrappers.
 * Pure DOM manipulation — does not fetch anything.
 */
export function applyGlossaryToContainer(
  container: HTMLElement,
  glossaryMap: Map<string, GlossaryTerm>,
  config: GlossaryConfig,
): void {
  if (glossaryMap.size === 0) return

  const matching = config.matching ?? {}
  const excludeElements = new Set([
    ...EXCLUDED_DEFAULT,
    ...(config.exclude?.elements ?? []),
  ])
  const underlineStyle = config.ui?.underlineStyle ?? 'dotted'
  const clickBehavior = config.ui?.clickBehavior ?? 'sidebar'
  const hoverEnabled = config.ui?.tooltip?.showOnHover ?? true
  const hoverDelay = config.ui?.tooltip?.delay ?? 300
  const maxWidth = config.ui?.tooltip?.maxWidth ?? 340
  const firstOnly = matching.firstOccurrenceOnly ?? false

  injectGlossaryStyles(underlineStyle)

  const termKeys = Array.from(glossaryMap.keys())
  const regex = buildTermRegex(termKeys, matching)
  if (!regex) return

  const seen = new Set<string>()

  // Walk text nodes that are not inside excluded elements
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let el = node.parentElement
      while (el) {
        const tag = el.tagName?.toLowerCase()
        if (excludeElements.has(tag)) return NodeFilter.FILTER_REJECT
        if (el.classList?.contains('ow-term')) return NodeFilter.FILTER_REJECT
        el = el.parentElement
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes: Text[] = []
  let n: Node | null
  while ((n = walker.nextNode())) textNodes.push(n as Text)

  for (const textNode of textNodes) {
    const text = textNode.nodeValue ?? ''
    if (!text.trim()) continue
    regex.lastIndex = 0
    const match = regex.test(text)
    if (!match) continue

    // Build replacement fragment
    regex.lastIndex = 0
    const frag = document.createDocumentFragment()
    let lastIdx = 0
    let m: RegExpExecArray | null

    while ((m = regex.exec(text)) !== null) {
      const matched = m[0]
      const key = matched.toLowerCase()
      const term = glossaryMap.get(key)
      if (!term) continue

      if (firstOnly && seen.has(key)) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx, m.index + matched.length)))
        lastIdx = m.index + matched.length
        continue
      }
      seen.add(key)

      if (m.index > lastIdx) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx, m.index)))
      }

      const span = document.createElement('span')
      span.className = 'ow-term'
      span.setAttribute('data-ow-term', key)
      span.setAttribute('tabindex', '0')
      span.setAttribute('role', 'button')
      span.textContent = matched

      // Hover events
      if (hoverEnabled) {
        span.addEventListener('mouseenter', () => {
          tooltipTimeout = setTimeout(() => showTooltip(term, span, maxWidth), hoverDelay)
        })
        span.addEventListener('mouseleave', () => {
          if (tooltipTimeout) { clearTimeout(tooltipTimeout); tooltipTimeout = null }
          hideTooltip()
        })
      }

      // Click / keyboard events
      const activate = () => {
        if (tooltipTimeout) { clearTimeout(tooltipTimeout); tooltipTimeout = null }
        hideTooltip()
        if (clickBehavior === 'sidebar') showSidebar(term)
      }
      span.addEventListener('click', activate)
      span.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate() }
      })

      frag.appendChild(span)
      lastIdx = m.index + matched.length
    }

    if (lastIdx < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIdx)))
    }

    textNode.parentNode?.replaceChild(frag, textNode)
  }

  // SVG inline support
  if (config.svg?.inline) {
    applyGlossaryToSvg(container, glossaryMap, regex, clickBehavior, seen, firstOnly)
  }
}

// ---------------------------------------------------------------------------
// SVG inline support
// ---------------------------------------------------------------------------

function applyGlossaryToSvg(
  container: HTMLElement,
  glossaryMap: Map<string, GlossaryTerm>,
  regex: RegExp,
  clickBehavior: string,
  seen: Set<string>,
  firstOnly: boolean,
) {
  const textEls = Array.from(container.querySelectorAll<SVGTextElement | SVGTSpanElement>('svg text, svg tspan'))
  for (const el of textEls) {
    const txt = el.textContent ?? ''
    regex.lastIndex = 0
    if (!regex.test(txt)) continue

    // Find full-text match
    regex.lastIndex = 0
    const m = regex.exec(txt)
    if (!m) continue
    const key = m[0].toLowerCase()
    const term = glossaryMap.get(key)
    if (!term) continue
    if (firstOnly && seen.has(key)) continue
    seen.add(key)

    // Wrap the <text> or <tspan> in an SVG <a>
    const parent = el.parentNode
    if (!parent) continue
    const svgNs = 'http://www.w3.org/2000/svg'
    const a = document.createElementNS(svgNs, 'a')
    a.style.cursor = 'help'
    a.setAttribute('tabindex', '0')
    parent.insertBefore(a, el)
    a.appendChild(el)

    a.addEventListener('click', (e) => {
      e.preventDefault()
      if (clickBehavior === 'sidebar') showSidebar(term)
    })
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Load glossary sources and annotate the container's DOM.
 * Called from enhance.ts after each render.
 */
export async function applyGlossary(container: HTMLElement, config: GlossaryConfig): Promise<void> {
  if (config.enabled === false) return
  const glossaryMap = await loadGlossaryMap(config)
  if (glossaryMap.size === 0) return
  applyGlossaryToContainer(container, glossaryMap, config)
}
