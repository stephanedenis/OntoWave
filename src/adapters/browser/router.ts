import type { Route } from '../../core/types'
import { splitHashRoute } from '../../core/logic'

function parse(): Route {
  const { path } = splitHashRoute(location.hash || '#/')
  return { path }
}

function getCurrentDocumentHash(): string {
  const { path } = splitHashRoute(location.hash || '#/')
  return path
}

function isInPageAnchor(href: string): boolean {
  if (!href.startsWith('#') || href.startsWith('#/')) return false
  const current = getCurrentDocumentHash()
  return current.startsWith('/') && current !== '/'
}

function navigateToInPageAnchor(href: string): void {
  const current = getCurrentDocumentHash()
  location.hash = `#${current}${href}`
}

export const browserRouter = {
  get(): Route { return parse() },
  subscribe(cb: (_r: Route) => void) {
    const onHash = () => cb(parse())
    window.addEventListener('hashchange', onHash)
    const onClick = (e: Event) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') || ''
      if (isInPageAnchor(href)) {
        e.preventDefault()
        navigateToInPageAnchor(href)
        return
      }
      if (href.endsWith('.md') && !/^(https?:)?\/\//.test(href)) {
        e.preventDefault()
        const clean = href.replace(/\.md$/i, '').replace(/^\.\//,'')
        if (clean.startsWith('/')) {
          location.hash = '#' + clean
        } else {
          const curr = location.hash.replace(/^#/, '') || '/'
          const dirParts = curr.split('/').filter(Boolean).slice(0, -1)
          const out: string[] = []
          for (const s of [...dirParts, ...clean.split('/')]) {
            if (s === '' || s === '.') continue
            if (s === '..') { out.pop(); continue }
            out.push(s)
          }
          location.hash = '#/' + out.join('/')
        }
      }
      // Liens internes vers .puml → route hash avec extension préservée
      if (href.endsWith('.puml') && !/^(https?:)?\/\//.test(href)) {
        e.preventDefault()
        const clean = href.replace(/^\.\//,'')
        if (clean.startsWith('/')) {
          location.hash = '#' + clean
        } else {
          const curr = location.hash.replace(/^#/, '') || '/'
          const dirParts = curr.split('/').filter(Boolean).slice(0, -1)
          const out: string[] = []
          for (const s of [...dirParts, ...clean.split('/')]) {
            if (s === '' || s === '.') continue
            if (s === '..') { out.pop(); continue }
            out.push(s)
          }
          location.hash = '#/' + out.join('/')
        }
      }
    }
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('hashchange', onHash)
      document.removeEventListener('click', onClick, true)
    }
  },
  navigate(path: string) { location.hash = '#' + (path.startsWith('/') ? path : ('/' + path)) }
}
