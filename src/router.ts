export type Route = { path: string }

export function getCurrentRoute(): Route {
  const hash = location.hash || '#/'
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  let path = raw
  console.log(`[getCurrentRoute] hash="${hash}", raw="${raw}"`)
  // Ne pas ajouter le / initial si le path commence par @ (source externe)
  if (!path.startsWith('/') && !path.startsWith('@')) {
    console.log(`[getCurrentRoute] Adding / prefix to path="${path}"`)
    path = '/' + path
  } else {
    console.log(`[getCurrentRoute] Keeping path as is: "${path}"`)
  }
  console.log(`[getCurrentRoute] final path="${path}"`)
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
    // Liens internes vers .md → convertir en route
    if (href.endsWith('.md')) {
      e.preventDefault()
      const clean = href.replace(/\.md$/i, '')
      location.hash = '#'+ (clean.startsWith('/') ? clean : ('/' + clean))
    }
    // Liens internes relatifs sans protocole et sans .md → laisser au navigateur
  }, true)
  return () => window.removeEventListener('hashchange', handler)
}
