import { getJsonFromBundle } from './bundle'
import { svgCache } from './svg-cache'

function buildTocFromHtml(html: string): string {
  const h = globalThis.document?.createElement('div')
  if (!h) return ''
  h.innerHTML = html
  const items: { id: string; text: string; level: number }[] = []
  h.querySelectorAll('h1, h2, h3').forEach((el) => {
    const id = el.id || ''
    const text = el.textContent || ''
    const level = el.tagName === 'H1' ? 1 : el.tagName === 'H2' ? 2 : 3
    if (id) items.push({ id, text, level })
  })
  return items.map(i => `${'  '.repeat(i.level - 1)}- <a href="#${i.id}">${i.text}</a>`).join('\n')
}

async function renderMermaid(container: HTMLElement) {
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
      // fallback: keep source text if render fails
      wrapper.textContent = txt
    }
    pre.replaceWith(wrapper)
  }
}

async function renderKroki(container: HTMLElement) {
  // SVG inline direct pour PlantUML, Graphviz, D2, BPMN via Kroki
  const langMap: Record<string, string> = {
    plantuml: 'plantuml', puml: 'plantuml', uml: 'plantuml',
    dot: 'graphviz', mermaid: 'mermaid', d2: 'd2', bpmn: 'bpmn'
  }
  const blocks = Array.from(container.querySelectorAll('pre code')) as HTMLElement[]
  for (const code of blocks) {
    const classes = code.className.split(/\s+/)
    const langClass = classes.find(c => c.startsWith('language-'))
    if (!langClass) continue
    const lang = langClass.replace('language-', '')
    const engine = langMap[lang]
    if (!engine || engine === 'mermaid') continue // Mermaid géré ailleurs
    const txt = code.textContent || ''
    const krokiUrl = `https://kroki.io/${engine}/svg`
    
    try {
      // Vérifier le cache SVG
      const cacheKey = `${krokiUrl}:${txt}`
      let svg = svgCache.get(cacheKey)
      
      if (!svg) {
        // Fetch depuis Kroki
        const res = await fetch(krokiUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: txt })
        if (!res.ok) continue
        svg = await res.text()
        
        // Mettre en cache
        svgCache.set(cacheKey, svg)
      }
      
      // Insérer SVG inline directement, sans div wrapper ni label
      const wrapper = document.createElement('div')
      wrapper.innerHTML = svg
      const svgEl = wrapper.querySelector('svg')
      if (svgEl) {
        svgEl.style.maxWidth = '100%'
        svgEl.style.height = 'auto'
        
        // Attacher event listeners pour les liens internes
        const links = svgEl.querySelectorAll('a[href]')
        links.forEach((link) => {
          const href = link.getAttribute('href')
          if (href && (href.endsWith('.md') || href.endsWith('.html') || href.endsWith('.puml'))) {
            link.addEventListener('click', (e) => {
              e.preventDefault()
              window.location.hash = href
            })
          }
        })
        
        const pre = code.closest('pre')!
        pre.replaceWith(svgEl)
      }
    } catch {}
  }
}

export async function enhancePage(appEl: HTMLElement, html: string) {
  // TOC
  const toc = buildTocFromHtml(html)
  const tocEl = document.getElementById('toc')
  if (tocEl) tocEl.innerHTML = toc
  // Mermaid / Kroki
  await renderMermaid(appEl)
  await renderKroki(appEl)
  // Submodules delegation: détecter _delegate.json ou CNAME dans un sous-dossier immédiatement sous la base (en/fr/...), et proposer une bascule
  try {
    const getBaseMap = async () => {
  const cfg = getJsonFromBundle('/config.json') || await fetch('/config.json', { cache: 'no-cache' }).then(r => r.json()).catch(() => ({}))
      const map: Record<string, string> = {}
      for (const r of (cfg.roots || [])) {
        const base = (r.base === '/' ? '' : String(r.base || '').replace(/^\/+|\/+$/g, ''))
        if (base) map[base] = String(r.root || '')
      }
      return map
    }
    const baseMap = await getBaseMap()
    const hash = location.hash || '#/'
    const path = hash.replace(/^#/, '')
    const parts = path.split('/').filter(Boolean) // e.g., ['en','vendor','page']
    if (parts.length >= 2) {
      const base = parts[0]
      const folder = parts[1]
      const rest = parts.slice(2).join('/')
      const rootDir = baseMap[base]
      if (rootDir) {
        const prefix = rootDir.replace(/\/$/, '') + '/' + folder
        // 1) _delegate.json
        let target: string | null = null
        try {
          const j = await fetch(`${prefix}/_delegate.json`, { cache: 'no-cache' })
          if (j.ok) {
            const obj = await j.json().catch(() => null)
            if (obj && typeof obj.baseUrl === 'string') target = obj.baseUrl.replace(/\/$/, '')
          }
        } catch {}
        // 2) CNAME
        if (!target) {
          try {
            const c = await fetch(`${prefix}/CNAME`, { cache: 'no-cache' })
            if (c.ok) {
              const domain = (await c.text()).trim()
              if (domain) target = `https://${domain}`
            }
          } catch {}
        }
        if (target) {
          const note = document.createElement('div')
          note.style.margin = '1rem 0'
          note.style.padding = '0.75rem'
          note.style.background = '#fffbdd'
          note.style.border = '1px solid #f0e6a0'
          const href = rest ? `${target.replace(/\/$/, '')}/${rest}` : target
          note.innerHTML = `Ce module possède son propre site : <a href="${href}">${href}</a>. Ouvrir là-bas pour la navigation complète.`
          appEl.prepend(note)
        }
      }
    }
  } catch {}
}
