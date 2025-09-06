import type { Route } from '../../core/types'

function parse(): Route {
  const hash = location.hash || '#/'
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  let path = raw
  if (!path.startsWith('/')) path = '/' + path
  return { path }
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
      if (href.endsWith('.md') && !/^(https?:)?\/\//.test(href)) {
        e.preventDefault()
        const clean = href.replace(/\.md$/i, '')
        location.hash = '#' + (clean.startsWith('/') ? clean : ('/' + clean))
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
