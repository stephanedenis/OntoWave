import type { Root } from './types'

export function resolvePumlCandidates(roots: Root[], path: string): string[] {
  const candidates: string[] = []
  const p = normalizePath(path)
  for (const r of roots) {
    const base = r.base === '/' ? '/' : ('/' + String(r.base).replace(/^\/+|\/+$/g, ''))
    let sub: string
    if (base === '/' || p === base || p.startsWith(base + '/')) {
      sub = base === '/' ? p : (p.slice(base.length) || '/')
    } else {
      sub = p
    }
    const prefix = r.root.replace(/\/$/, '')
    candidates.push(`${prefix}${sub}`)
  }
  // Literal path fallback
  if (candidates.indexOf(p) === -1) candidates.push(p)
  return [...new Set(candidates)]
}

export function pickPreferredLanguage(
  preferredLanguages: readonly string[] | undefined,
  supportedLanguages: readonly string[] | undefined,
  fallbackLanguage: string | null = null,
): string | null {
  const supported = (supportedLanguages || [])
    .map(lang => String(lang || '').trim().toLowerCase())
    .filter(Boolean)
  if (supported.length === 0) return fallbackLanguage

  for (const preferred of preferredLanguages || []) {
    const normalized = String(preferred || '').trim().toLowerCase()
    if (!normalized) continue
    if (supported.includes(normalized)) return normalized
    const primary = normalized.split('-')[0]
    if (primary && supported.includes(primary)) return primary
  }

  return fallbackLanguage && supported.includes(fallbackLanguage.toLowerCase())
    ? fallbackLanguage.toLowerCase()
    : supported[0]
}

export function splitHashRoute(hash: string): { path: string; anchor: string } {
  const raw = (hash || '#/').startsWith('#') ? (hash || '#/').slice(1) : (hash || '/')
  const hashIndex = raw.indexOf('#')
  const routePart = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw
  const anchorPart = hashIndex >= 0 ? raw.slice(hashIndex + 1) : ''
  let path = routePart || '/'
  if (!path.startsWith('/')) path = '/' + path
  return { path, anchor: anchorPart }
}

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

export function rewriteLinksHtml(html: string, currentHash?: string): string {
  // Réécrit les liens internes se terminant par .md en routes hash, avec résolution relative et ancre préservée
  const fullHash = (currentHash ?? (globalThis as any).location?.hash ?? '#/').toString()
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
  const rewriteMd = html.replace(/href=("|')([^"']+\.md)(#[^"']*)?(\1)/gi, (_m, q, href, anchor = '') => {
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
  // Réécrit les liens internes se terminant par .puml en routes hash (extension conservée)
  return rewriteMd.replace(/href=("|')([^"']+\.puml)(#[^"']*)?(\1)/gi, (_m, q, href, anchor = '') => {
    if (/^(https?:)?\/\//i.test(href)) return `href=${q}${href}${anchor || ''}${q}`
    // Absolute content path (keep .puml extension)
    if (href.startsWith('/')) {
      return `href=${q}#${href}${anchor || ''}${q}`
    }
    // Language-prefixed path
    if (/^[a-z]{2}\//i.test(href)) {
      return `href=${q}#/${href}${anchor || ''}${q}`
    }
    // Relative path from current directory
    const clean = href.replace(/^\.\//, '')
    const baseParts = currDirParts.length ? currDirParts : (currentLang ? [currentLang] : [])
    const target = norm([...baseParts, ...clean.split('/')])
    return `href=${q}#${target}${anchor || ''}${q}`
  })
}
