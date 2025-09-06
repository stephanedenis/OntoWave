import { getJsonFromBundle, getTextFromBundle } from './bundle'
type Item = { route: string; title?: string; base?: string; path?: string }

function tokenize(t: string): string[] {
  return (t.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean))
}

export function createSearch() {
  let items: Item[] = []
  const docs = new Map<string, { title: string; text?: string }>()
  let roots: Array<{ base: string; root: string }> = []
  // ready state was unused; initialization gates via items/docs presence

  async function loadConfig() {
    try {
  const cfg = getJsonFromBundle('/config.json') || await fetch('/config.json', { cache: 'no-cache' }).then(r => r.json())
      roots = (cfg.roots || []).map((r: any) => ({ base: String(r.base || '').replace(/^\/+|\/+$/g, ''), root: String(r.root || '') }))
    } catch {}
  }

  function routeFromPath(mdPath: string, base?: string): string {
    const p = mdPath.replace(/\.md$/i, '')
    if (base) return '#/' + base.replace(/^\/+|\/+$/g, '') + '/' + p.replace(/^\/+/, '')
    return '#/' + p.replace(/^\/+/, '')
  }

  function contentUrlFromRoute(route: string): string | null {
    // route ex: #/fr/demo/mermaid => base fr, sub demo/mermaid
    const clean = route.replace(/^#\//, '')
    const [b, ...rest] = clean.split('/')
    const base = b || ''
    const sub = rest.join('/') || 'index'
    const r = roots.find(x => String(x.base) === base)
    if (!r) return null
    const prefix = r.root.replace(/\/$/, '')
    return `${prefix}/${sub}.md`
  }

  async function loadFromPrebuiltIndex(): Promise<boolean> {
    try {
  const embedded = getJsonFromBundle<Array<{ route: string; title: string; text?: string }>>('/search-index.json')
  const arr = embedded || await fetch('/search-index.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null)
      if (!Array.isArray(arr) || arr.length === 0) return false
      items = arr.map(d => ({ route: d.route, title: d.title }))
      for (const d of arr) docs.set(d.route, { title: d.title, text: d.text || '' })
      return true
    } catch { return false }
  }

  async function loadFromSitemap(): Promise<boolean> {
    try {
  const s = getJsonFromBundle('/sitemap.json') || await fetch('/sitemap.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null)
      const arr = Array.isArray(s.items) ? s.items : []
      items = arr
      for (const it of items) docs.set(it.route, { title: it.title || it.route.replace('#/','') })
      return items.length > 0
    } catch { return false }
  }

  async function loadFromNav(): Promise<boolean> {
    try {
  const txt = getTextFromBundle('/nav.yml') || await fetch('/nav.yml', { cache: 'no-cache' }).then(r => r.ok ? r.text() : null)
  if (!txt) return false
      const { parse } = await import('yaml')
      const nav = parse(txt)
      const list: Item[] = []
      const pushEntry = (label: string, path: string, base?: string) => {
        list.push({ route: routeFromPath(path, base), title: label })
      }
      const walk = (node: any, base?: string) => {
        if (Array.isArray(node)) {
          for (const it of node) walk(it, base)
        } else if (typeof node === 'object' && node) {
          const [k, v] = Object.entries(node)[0]
          if (typeof v === 'string') pushEntry(k as string, v as string, base)
          else if (Array.isArray(v)) walk(v, base)
        }
      }
      if (Array.isArray(nav)) walk(nav)
      else if (typeof nav === 'object' && nav) {
        for (const [lang, arr] of Object.entries(nav)) walk(arr, lang)
      }
      items = list
      for (const it of items) docs.set(it.route, { title: it.title || it.route.replace('#/','') })
      return items.length > 0
    } catch { return false }
  }

  async function loadFromPagesTxt(): Promise<boolean> {
    try {
  const txt = getTextFromBundle('/pages.txt') || await fetch('/pages.txt', { cache: 'no-cache' }).then(r => r.ok ? r.text() : null)
  if (!txt) return false
  const lines = txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
      items = lines.map(p => ({ route: routeFromPath(p), title: p.replace(/\.md$/i,'') }))
      for (const it of items) docs.set(it.route, { title: it.title || it.route.replace('#/','') })
      return items.length > 0
    } catch { return false }
  }

  async function buildBodiesInBackground() {
    await loadConfig()
    for (const it of items) {
      if (docs.get(it.route)?.text) continue
      const url = it.path || contentUrlFromRoute(it.route)
      if (!url) continue
      try {
  const md = getTextFromBundle(url) || await fetch(url, { cache: 'no-cache' }).then(r => r.ok ? r.text() : null)
  if (!md) continue
        const text = md.replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`\-\[\]()]/g, ' ')
        const t = docs.get(it.route)?.title || it.title || it.route
        docs.set(it.route, { title: t, text })
      } catch {}
    }
  }

  async function init() {
    // Ensure roots are known for language-aware behavior
    await loadConfig()
    // 1) prebuilt index wins
    if (await loadFromPrebuiltIndex()) { return }
    // 2) sitemap/nav/pages as titles only, content in background
    if (await loadFromSitemap()) { void buildBodiesInBackground(); return }
    if (await loadFromNav())      { void buildBodiesInBackground(); return }
    if (await loadFromPagesTxt()) { void buildBodiesInBackground(); return }
    // 3) fallback: only current page
    const route = location.hash || '#/'
    docs.set(route, { title: document.title.replace(/\s*—.*$/, '') })
    items = [{ route, title: document.title }]
  }

  function score(q: string, doc: { title: string; text?: string }): number {
    const terms = tokenize(q)
    if (terms.length === 0) return 0
    let s = 0
    const hayTitle = doc.title.toLowerCase()
    for (const t of terms) {
      if (hayTitle.includes(t)) s += 5
      if (doc.text && doc.text.toLowerCase().includes(t)) s += 1
    }
    return s
  }

  function getCurrentBase(): string {
    const first = (location.hash.replace(/^#\/?/, '').split('/')[0] || '').toLowerCase()
    const bases = roots.map(r => String(r.base || '').toLowerCase()).filter(Boolean)
    return bases.includes(first) ? first : ''
  }

  function search(q: string, limit = 20) {
    const res = [] as Array<{ route: string; title: string; score: number }>
    const base = getCurrentBase()
    const pool = base ? items.filter(it => it.route.toLowerCase().startsWith(`#/${base}/`)) : items
    const scan = (arr: Item[]) => {
      for (const it of arr) {
        const d = docs.get(it.route)
        if (!d) continue
        const sc = score(q, d)
        if (sc > 0) res.push({ route: it.route, title: d.title, score: sc })
      }
    }
    scan(pool)
    if (res.length === 0 && base) scan(items) // fallback cross-lang if no hits in current lang
    res.sort((a, b) => b.score - a.score)
    return res.slice(0, limit)
  }

  function bind(box: HTMLInputElement, resBox: HTMLElement) {
    const render = (q: string) => {
      if (!q) { resBox.classList.add('hidden'); resBox.innerHTML=''; return }
      const hit = search(q)
      resBox.innerHTML = `<ul>${hit.map(i => `<li><a href="${i.route}"><strong>${i.title}</strong><br/><small>${i.route}</small></a></li>`).join('')}</ul>`
      resBox.classList.remove('hidden')
    }
    box.addEventListener('input', () => render(box.value))
    document.addEventListener('click', (e) => { if (!resBox.contains(e.target as any) && e.target !== box) resBox.classList.add('hidden') })
  }

  async function enableLiveIndexingFrom(itemsInput?: Array<{ route: string; title?: string }>) {
    if (itemsInput && itemsInput.length) {
      items = itemsInput
      for (const it of items) docs.set(it.route, { title: it.title || it.route })
    } else {
      await loadFromSitemap() || await loadFromNav() || await loadFromPagesTxt()
    }
    await buildBodiesInBackground()
  }

  function exportIndex(): string {
    const arr: Array<{ route: string; title: string; text?: string }> = []
    for (const it of items) {
      const d = docs.get(it.route)
      if (!d) continue
      arr.push({ route: it.route, title: d.title, text: d.text })
    }
    return JSON.stringify(arr, null, 2)
  }

  async function importPagesList(text: string) {
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    const list = lines.map(p => ({ route: routeFromPath(p), title: p.replace(/\.md$/i,'') }))
    items = list
    for (const it of items) docs.set(it.route, { title: it.title || it.route.replace('#/','') })
  }

  function hasReadyIndex() { return items.length > 0 && Array.from(docs.values()).some(d => typeof d.text === 'string') }

  return { init, bind, enableLiveIndexingFrom, exportIndex, importPagesList, hasReadyIndex }
}
