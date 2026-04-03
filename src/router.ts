export type Route = { path: string }

export function getCurrentRoute(): Route {
  const hash = location.hash || '#/'
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  let path = raw
  if (!path.startsWith('/')) path = '/' + path
  return { path }
}

export function onRouteChange(cb: (_r: Route) => void) {
  const handler = () => cb(getCurrentRoute())
  window.addEventListener('hashchange', handler)
  // Intercepter clicks internes
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!a) return
    const href = a.getAttribute('href') || ''
    // Liens internes vers .md → convertir en route (résolution relative au dossier courant)
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
    // Liens internes relatifs sans protocole et sans .md → laisser au navigateur
  }, true)
  return () => window.removeEventListener('hashchange', handler)
}
