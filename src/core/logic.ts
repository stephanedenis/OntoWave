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
    const base = r.base === '/' ? '/' : ('/' + String(r.base).replace(/^\/+|\/+$/g, ''))
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
    const unifiedPrefix = prefix.replace(/\/(?:[a-z]{2})$/i, '') || prefix
    const isIndex = sub === '/'
    const baseSub = isIndex ? '/index' : sub
    const base = String(r.base || '').replace(/^\/+|\/+$/g, '')
    const langSuffix = base && base !== '/' ? `.${base}` : ''
    // Prefer language-suffix files in a unified content root
    if (langSuffix) {
      // Same-root (per-language tree)
      candidates.push(`${prefix}${baseSub}${langSuffix}.md`)
      candidates.push(`${prefix}${sub}/index${langSuffix}.md`)
      // Unified root (one content folder with suffix)
      if (unifiedPrefix !== prefix) {
        candidates.push(`${unifiedPrefix}${baseSub}${langSuffix}.md`)
        candidates.push(`${unifiedPrefix}${sub}/index${langSuffix}.md`)
  // Also try unified non-suffix fallbacks when only a single tree exists
  candidates.push(`${unifiedPrefix}${baseSub}.md`)
  candidates.push(`${unifiedPrefix}${sub}/index.md`)
      }
    }
    // Fallback: language as first segment subfolder (legacy structure: /content/<lang>/...)
    if (base) {
      candidates.push(`${prefix}/${base}${baseSub}.md`)
      candidates.push(`${prefix}/${base}${sub}/index.md`)
    }
    // Fallbacks without suffix for legacy mixed trees
    candidates.push(`${prefix}${baseSub}.md`)
    candidates.push(`${prefix}${sub}/index.md`)
  }
  return candidates
}

export function rewriteLinksHtml(html: string): string {
  // Réécrit les liens internes se terminant par .md en routes hash, avec résolution relative et ancre préservée
  const fullHash = (globalThis.location?.hash || '#/').toString()
  const [rawPath] = fullHash.split('?')
  const curr = rawPath.replace(/^#/, '') || '/'
  const parts = curr.split('/').filter(Boolean)
  const currentLang = /^[a-z]{2}$/.test(parts[0] || '') ? (parts[0] || '').toLowerCase() : ''
  const currDirParts = (currentLang ? parts.slice(0, -1) : parts.slice(0, -1))
  const norm = (seg: string[]): string => {
    const out: string[] = []
    for (const s of seg) {
      if (s === '' || s === '.') continue
      if (s === '..') { out.pop(); continue }
      out.push(s)
    }
    return '/' + out.join('/')
  }
  return html.replace(/href=("|')([^"']+\.md)(#[^"']*)?(\1)/gi, (_m, q, href, anchor = '', qq) => {
    if (/^(https?:)?\/\//i.test(href)) return `href=${q}${href}${anchor || ''}${q}`
    // Absolute content path
    if (href.startsWith('/')) {
      const clean = href.replace(/\.md$/i, '')
      return `href=${q}#${clean}${anchor || ''}${q}`
    }
    // Language-prefixed path
    if (/^[a-z]{2}\//i.test(href)) {
      const clean = href.replace(/\.md$/i, '')
      return `href=${q}#/${clean}${anchor || ''}${q}`
    }
    // Relative path from current directory
    const clean = href.replace(/^\.\//, '')
    const baseParts = currDirParts.length ? currDirParts : (currentLang ? [currentLang] : [])
    const target = norm([...baseParts, ...clean.replace(/\.md$/i, '').split('/')])
    return `href=${q}#${target}${anchor || ''}${q}`
  })
}
