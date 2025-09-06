import { createApp } from './app'
import { browserConfig } from './adapters/browser/config'
import { browserContent } from './adapters/browser/content'
import { browserRouter } from './adapters/browser/router'
import { browserView } from './adapters/browser/view'
import { createMd as createMdV2 } from './adapters/browser/md'
import { enhancePage } from './adapters/browser/enhance'
import { buildSidebar, buildPrevNext } from './adapters/browser/navigation'
import { createSearch } from './adapters/browser/search'
import { renderConfigPage } from './adapters/browser/configPage'

;(async () => {
  // Toggle engine via config.json; fallback v2 par défaut si absent
  const res = await fetch('/config.json', { cache: 'no-cache' })
  const cfg = await res.json()
  const engine = cfg.engine ?? 'v2'
  // UI options
  try {
    const H = document.getElementById('site-header')
    const S = document.getElementById('sidebar')
    const T = document.getElementById('toc')
    const F = document.getElementById('floating-menu')
    const ui = cfg.ui || {}
    if (ui.minimal) {
  document.body.classList.add('minimal')
      H?.classList.add('hidden-by-config'); S?.classList.add('hidden-by-config'); T?.classList.add('hidden-by-config')
    } else {
      if (ui.header === false) H?.classList.add('hidden-by-config')
      if (ui.sidebar === false) S?.classList.add('hidden-by-config')
      if (ui.toc === false) T?.classList.add('hidden-by-config')
    }
    if (ui.menu === false) F?.classList.add('hidden-by-config')
  } catch {}
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
        // Prev/Next computation (used by footer and prefetch)
        const pn = await buildPrevNext(location.hash || '#/')
        // Prev/Next footer (optional)
        const ui = cfg.ui || {}
        if (ui.footer !== false && !ui.minimal) {
          const footer = document.createElement('div')
          footer.style.marginTop = '2rem'
          footer.innerHTML = `
            <hr/>
            <div style="display:flex; justify-content:space-between">
              <span>${pn.prev ? `<a href="${pn.prev}">← Précédent</a>` : ''}</span>
              <span>${pn.next ? `<a href="${pn.next}">Suivant →</a>` : ''}</span>
            </div>`
          appEl.appendChild(footer)
        }
        // Prefetch prev/next pour accélérer la nav
        const prefetch = async (href: string) => {
          try {
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
    // Si la page d’accueil n’existe pas, afficher une page de configuration
    try {
      const appEl = document.getElementById('app')!
      const isRoot = (location.hash === '' || location.hash === '#/' || location.hash === '#')
      if (/404 — Not found/.test(appEl.textContent || '') && isRoot) {
        appEl.innerHTML = `
          <h1>Configuration requise</h1>
          <p>Ajoutez un fichier <code>index.md</code> dans votre racine de contenu (<code>content/[lang]/index.md</code> avec i18n),
          ou modifiez <code>public/config.json</code> pour pointer vers vos dossiers.</p>
          <p>Vous pouvez aussi préparer la recherche en important un <code>pages.txt</code> via le menu Options, puis exporter <code>search-index.json</code> à déposer dans <code>docs/</code>.</p>
        `
      }
      // Route dédiée de config
      if (location.hash.replace(/^#/, '') === '/config') {
        const resCfg = await fetch('/config.json', { cache: 'no-cache' })
        const cfgJson = await resCfg.json()
        await renderConfigPage(appEl, cfgJson)
      }
      // Marqueur ⚠️ dans le menu si éléments auxiliaires manquants
      try {
        const check = async (url: string) => {
          try { const r = await fetch(url, { cache: 'no-cache' }); return r.ok } catch { return false }
        }
        const hasNav = await check('/nav.yml')
        const hasSearchIdx = await check('/search-index.json')
        const hasSitemap = await check('/sitemap.json')
        const needs = !hasNav || (!hasSearchIdx && !hasSitemap)
        if (needs) {
          const a = document.querySelector('.floating-menu a[href="#/config"]') as HTMLAnchorElement | null
          if (a && !(a.textContent || '').includes('⚠️')) a.textContent = (a.textContent || 'Configuration') + ' ⚠️'
        }
      } catch {}
    } catch {}
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

  // Recherche opt-in: inactive par défaut à moins qu'un index préconstruit existe
  try {
    const box = document.getElementById('search') as HTMLInputElement | null
    const resBox = document.getElementById('search-results')
    const opt = document.getElementById('opt-search') as HTMLInputElement | null
    const importBtn = document.getElementById('opt-pages') as HTMLInputElement | null
  const exportBtn = document.getElementById('opt-export-index') as HTMLButtonElement | null
  const dlPagesBtn = document.getElementById('opt-download-pages') as HTMLButtonElement | null
    const state = document.getElementById('opt-state') as HTMLElement | null
    const s = createSearch()
    let active = false
    const ensure = async () => {
      if (!active) return
      await s.init()
      if (box && resBox) s.bind(box, resBox)
      state && (state.textContent = s.hasReadyIndex() ? 'Index prêt' : 'Index minimal (titres)')
    }
    // Activer automatiquement si un index préconstruit existe
    try {
      const r = await fetch('/search-index.json', { cache: 'no-cache' })
      if (r.ok) { active = true; if (opt) opt.checked = true; await ensure() }
    } catch {}
    // Toggle manuel
    opt?.addEventListener('change', async () => { active = !!opt.checked; if (active) await ensure() })
    // Import pages.txt
    importBtn?.addEventListener('change', async () => {
      const f = importBtn.files?.[0]
      if (!f) return
      const text = await f.text()
      await s.importPagesList(text)
      await s.enableLiveIndexingFrom()
      if (box && resBox) s.bind(box, resBox)
      state && (state.textContent = 'Index en construction…')
    })
    // Export index JSON
    exportBtn?.addEventListener('click', () => {
      const data = s.exportIndex()
      const blob = new Blob([data], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'search-index.json'
      a.click()
      URL.revokeObjectURL(a.href)
    })
    // Télécharger pages.txt
    dlPagesBtn?.addEventListener('click', async () => {
      try {
        const r = await fetch('/pages.txt', { cache: 'no-cache' })
        const text = r.ok ? await r.text() : ''
        const blob = new Blob([text], { type: 'text/plain' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'pages.txt'
        a.click()
        URL.revokeObjectURL(a.href)
      } catch {}
    })
  } catch {}
})()
