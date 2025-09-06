import type { Root } from './types'

export function normalizePath(path: string): string {
  const p = path.replace(/\/+/g, '/').replace(/\/$/, '')
  return p === '' ? '/' : (p.startsWith('/') ? p : '/' + p)
}

export function resolveCandidates(roots: Root[], path: string): string[] {
  const candidates: string[] = []
  const p = normalizePath(path)
  for (const r of roots) {
    const prefix = r.root.replace(/\/$/, '')
    const base = p === '/' ? '/index' : p
    candidates.push(`${prefix}${base}.md`)
    candidates.push(`${prefix}${p}/index.md`)
  }
  return candidates
}

export function rewriteLinksHtml(html: string): string {
  // Réécrit les liens internes se terminant par .md en routes hash
  return html.replace(/href=("|')([^"']+\.md)(\1)/g, (_m, q, href) => {
    if (/^(https?:)?\/\//.test(href)) return `href=${q}${href}${q}`
    const clean = href.replace(/\.md$/i, '')
    const target = '#' + (clean.startsWith('/') ? clean : '/' + clean)
    return `href=${q}${target}${q}`
  })
}
