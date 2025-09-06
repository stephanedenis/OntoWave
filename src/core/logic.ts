import type { Root } from './types'

export function normalizePath(path: string): string {
  const p = path.replace(/\/+/g, '/').replace(/\/$/, '')
  return p === '' ? '/' : (p.startsWith('/') ? p : '/' + p)
}

export function resolveCandidates(roots: Root[], path: string): string[] {
  const candidates: string[] = []
  const p = normalizePath(path)
  const tryRoots: Array<{ r: Root; sub: string }> = []
  for (const r of roots) {
    const base = r.base === '/' ? '/' : ('/' + r.base.replace(/^\/+|\/+$/g, ''))
    if (base === '/' || p === base || p.startsWith(base + '/')) {
      const sub = base === '/' ? p : (p.slice(base.length) || '/')
      tryRoots.push({ r, sub })
    }
  }
  // Fallback: if nothing matched, try all roots as if base was '/'
  if (tryRoots.length === 0) {
    for (const r of roots) tryRoots.push({ r, sub: p })
  }
  for (const { r, sub } of tryRoots) {
    const prefix = r.root.replace(/\/$/, '')
    const baseSub = sub === '/' ? '/index' : sub
    candidates.push(`${prefix}${baseSub}.md`)
    candidates.push(`${prefix}${sub}/index.md`)
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
