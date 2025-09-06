import { getJsonFromBundle, getTextFromBundle } from './bundle'
type SitemapItem = { route: string; title?: string }

export async function buildSidebar(): Promise<string> {
  try {
    // Try nav.yml first
    try {
      const txt = getTextFromBundle('/nav.yml') || await fetch('/nav.yml', { cache: 'no-cache' }).then(r => r.ok ? r.text() : null)
      if (txt) {
        const { parse } = await import('yaml')
        const nav = parse(txt) as any
        const renderList = (node: any): string => {
          if (Array.isArray(node)) return `<ul>${node.map(renderNav).join('')}</ul>`
          if (typeof node === 'object' && node) {
            const [k, v] = Object.entries(node)[0]
            if (typeof v === 'string') return `<li><a href="#/${v.replace(/\.md$/i,'')}">${k}</a></li>`
            if (Array.isArray(v)) return `<li><details open><summary>${k}</summary>${renderList(v)}</details></li>`
          }
          return ''
        }
        // Support des sections par langue (fr:, en:)
        if (!Array.isArray(nav) && typeof nav === 'object') {
          const parts = Object.entries(nav).map(([lang, arr]) => `<details ${lang==='fr'?'open':''}><summary>${lang.toUpperCase()}</summary>${renderList(arr)}</details>`)
          return parts.join('')
        }
        const renderNav = (node: any): string => renderList(node)
        return renderList(nav)
      }
    } catch {}

  const data = getJsonFromBundle('/sitemap.json') || await fetch('/sitemap.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null)
  if (!data) return ''
      const items: { route: string; title?: string; base?: string }[] = data.items || []
    const tree = new Map()
    for (const it of items) {
      const path = it.route.replace('#/','')
      const parts = path.split('/').filter(Boolean)
      let node = tree
      for (let i=0; i<parts.length-1; i++) {
        const seg = parts[i]
        if (!node.has(seg)) node.set(seg, new Map())
        node = node.get(seg)
      }
      const leaf = parts[parts.length-1] || 'index'
      node.set(leaf, it)
    }
  function renderNode(node: Map<string, any> | SitemapItem): string {
      if (node instanceof Map) {
        const lis = []
    for (const [k, v] of node.entries()) {
          if (v instanceof Map) lis.push(`<li><details><summary>${k}</summary>${renderNode(v)}</details></li>`)
          else lis.push(`<li><a href="${v.route}">${v.title || k}</a></li>`)
        }
        return `<ul>${lis.join('')}</ul>`
      }
      return ''
    }
  // Flat fallback list if tree rendering above returns empty
  return renderNode(tree)
  } catch { return '' }
}

export async function buildPrevNext(current: string): Promise<{ prev?: string; next?: string }> {
  try {
    const res = await fetch('/sitemap.json', { cache: 'no-cache' })
    if (!res.ok) return {}
    const data = await res.json() as { items: SitemapItem[] }
    const items = data.items || []
    const idx = items.findIndex(i => i.route.replace('#','') === current.replace('#',''))
    if (idx === -1) return {}
    const prev = items[idx - 1]?.route
    const next = items[idx + 1]?.route
    return { prev, next }
  } catch { return {} }
}
