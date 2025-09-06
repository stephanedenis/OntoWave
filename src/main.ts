import { createApp } from './app'
import { browserConfig } from './adapters/browser/config'
import { browserContent } from './adapters/browser/content'
import { browserRouter } from './adapters/browser/router'
import { browserView } from './adapters/browser/view'
import { createMd as createMdV2 } from './adapters/browser/md'
import { enhancePage } from './adapters/browser/enhance'
import { buildSidebar, buildPrevNext } from './adapters/browser/navigation'

;(async () => {
  // Toggle engine via config.json; fallback v2 par défaut si absent
  const res = await fetch('/config.json', { cache: 'no-cache' })
  const cfg = await res.json()
  const engine = cfg.engine ?? 'v2'
  // i18n: détecter la langue préférée et rediriger vers la base correspondante si on est à la racine
  try {
    if (location.hash === '' || location.hash === '#/' || location.hash === '#') {
      const supported: string[] = (cfg.i18n?.supported || []).map((s: string) => String(s).toLowerCase())
      const defLang: string = String(cfg.i18n?.default || 'en').toLowerCase()
      const navLangs = navigator.languages?.map(l => l.split('-')[0].toLowerCase()) || []
      const pick = navLangs.find(l => supported.includes(l)) || defLang
      if (supported.length > 0) {
        location.hash = `#/${pick}`
      }
    }
  } catch {}
  // Brand
  const brand = document.getElementById('brand')
  if (brand && typeof cfg.brand === 'string') brand.textContent = cfg.brand
  if (engine === 'v2') {
    const app = createApp({
      config: browserConfig,
      content: browserContent,
      router: browserRouter,
      view: browserView,
  md: createMdV2({ light: false }),
      enhance: { afterRender: async (html, _route) => {
        const appEl = document.getElementById('app')!
        await enhancePage(appEl, html)
        // Sidebar
        const side = await buildSidebar()
        if (side) {
          const el = document.getElementById('sidebar')
          if (el) el.innerHTML = side
        }
        // Prev/Next footer
        const pn = await buildPrevNext(location.hash || '#/')
        const footer = document.createElement('div')
        footer.style.marginTop = '2rem'
        footer.innerHTML = `
          <hr/>
          <div style="display:flex; justify-content:space-between">
            <span>${pn.prev ? `<a href="${pn.prev}">← Précédent</a>` : ''}</span>
            <span>${pn.next ? `<a href="${pn.next}">Suivant →</a>` : ''}</span>
          </div>`
        appEl.appendChild(footer)
        // Prefetch prev/next pour accélérer la nav
        const prefetch = async (href: string) => {
          try {
            const u = href.replace(/^#/, '')
            const resp = await fetch('/sitemap.json', { cache: 'no-cache' }).then(r => r.json()).catch(() => null)
            const items = resp?.items || []
            const match = items.find((it: any) => it.route === href)
            if (!match) return
            const md = match.path?.replace(/^\//,'') || ''
            if (md) { await fetch('/' + md, { cache: 'force-cache' }).catch(() => {}) }
          } catch {}
        }
        if (pn.prev) prefetch(pn.prev)
        if (pn.next) prefetch(pn.next)
      } },
    })
    await app.start()
  } else {
    // Legacy path: import legacy modules dynamically to keep bundle small if unused
    const [{ getCurrentRoute, onRouteChange }, { createMd, rewriteLinks }] = await Promise.all([
      import('./router'),
      import('./markdown'),
    ])
    type Root = { base: string; root: string }
    const appEl = document.getElementById('app')!
    const md = createMd()
    function resolveCandidates(roots: Root[], path: string) {
      const candidates: string[] = []
      const p = path.replace(/\/$/, '') || '/'
      for (const r of roots) {
        const prefix = r.root.replace(/\/$/, '')
        const base = p === '/' ? '/index' : p
        candidates.push(`${prefix}${base}.md`)
        candidates.push(`${prefix}${p}/index.md`)
      }
      return candidates
    }
  async function loadMarkdown(roots: Root[], routePath: string): Promise<string> {
      const cands = resolveCandidates(roots, routePath)
      for (const url of cands) {
        try {
          const res = await fetch(url, { cache: 'no-cache' })
          if (res.ok) return await res.text()
        } catch {}
      }
  return `# 404 — Not found\n\nAucun document pour \`${routePath}\``
    }
    const cfg2 = cfg
    async function renderRoute() {
      const { path } = getCurrentRoute()
      const mdSrc = await loadMarkdown(cfg2.roots, path)
      const html = md.render(mdSrc)
      appEl.innerHTML = html
      rewriteLinks(appEl)
      const h1 = appEl.querySelector('h1')?.textContent?.trim()
      if (h1) document.title = `${h1} — OntoWave`
    }
    await renderRoute()
    onRouteChange(() => { void renderRoute() })
  }

  // Simple search using sitemap
  try {
    const box = document.getElementById('search') as HTMLInputElement | null
    const resBox = document.getElementById('search-results')
    if (box && resBox) {
      const resp = await fetch('/sitemap.json', { cache: 'no-cache' })
      const data = await resp.json() as any
      const items: { route: string; title?: string }[] = data.items || []
      const render = (q: string) => {
        if (!q) { resBox.classList.add('hidden'); resBox.innerHTML=''; return }
        const lc = q.toLowerCase()
        const top = items.filter(i => (i.title || '').toLowerCase().includes(lc) || i.route.toLowerCase().includes(lc)).slice(0, 20)
        resBox.innerHTML = `<ul>${top.map(i => `<li><a href="${i.route}"><strong>${i.title || i.route.replace('#/','')}</strong><br/><small>${i.route}</small></a></li>`).join('')}</ul>`
        resBox.classList.remove('hidden')
      }
      box.addEventListener('input', () => render(box.value))
      document.addEventListener('click', (e) => { if (!resBox.contains(e.target as any) && e.target !== box) resBox.classList.add('hidden') })
    }
  } catch {}
})()
