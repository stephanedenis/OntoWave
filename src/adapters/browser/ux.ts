/**
 * UX Enhancements pour OntoWave
 *
 * Fonctionnalités :
 * - Raccourcis clavier de navigation (j/k, n/p)
 * - Thèmes de lecture (clair/sépia/sombre)
 * - Export PDF (print CSS + déclencheur)
 * - Préfetch Markov basé sur l'historique de navigation
 * - Prise de notes légère (localStorage)
 */

// ─────────────────────────────────────────────────────────────
// Types internes
// ─────────────────────────────────────────────────────────────

type Theme = 'light' | 'sepia' | 'dark'
type SitemapItem = { route: string; title?: string }

// ─────────────────────────────────────────────────────────────
// Utilitaires partagés
// ─────────────────────────────────────────────────────────────

let _sitemapCache: SitemapItem[] | null = null

async function loadSitemap(): Promise<SitemapItem[]> {
  if (_sitemapCache) return _sitemapCache
  try {
    const r = await fetch('/sitemap.json', { cache: 'no-cache' })
    if (r.ok) {
      const data = await r.json() as { items?: SitemapItem[] }
      _sitemapCache = data.items || []
    }
  } catch {}
  return _sitemapCache || []
}

function getAdjacentRoutes(current: string): { prev?: string; next?: string } {
  if (!_sitemapCache) return {}
  const items = _sitemapCache
  const idx = items.findIndex(i => i.route.replace('#', '') === current.replace('#', ''))
  if (idx === -1) return {}
  return {
    prev: items[idx - 1]?.route,
    next: items[idx + 1]?.route,
  }
}

// ─────────────────────────────────────────────────────────────
// Raccourcis clavier de navigation
// ─────────────────────────────────────────────────────────────

/**
 * Active les raccourcis clavier :
 *   j / n / ArrowRight → page suivante
 *   k / p / ArrowLeft  → page précédente
 */
export function setupKeyboardNav(): void {
  // Pré-charger le sitemap
  void loadSitemap()

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // Ignorer si l'utilisateur tape dans un champ
    const target = e.target as HTMLElement
    if (target.closest('input,textarea,select,[contenteditable]')) return
    // Ignorer les combinaisons avec modificateurs
    if (e.ctrlKey || e.metaKey || e.altKey) return

    const { prev, next } = getAdjacentRoutes(location.hash || '#/')

    switch (e.key) {
      case 'j':
      case 'n':
        if (next) {
          e.preventDefault()
          location.hash = next.replace(/^#/, '')
        }
        break
      case 'k':
      case 'p':
        if (prev) {
          e.preventDefault()
          location.hash = prev.replace(/^#/, '')
        }
        break
    }
  })

  // Mettre à jour le cache lors des changements de route
  window.addEventListener('hashchange', () => void loadSitemap())
}

// ─────────────────────────────────────────────────────────────
// Thèmes de lecture
// ─────────────────────────────────────────────────────────────

const THEMES: Theme[] = ['light', 'sepia', 'dark']

const THEME_ICONS: Record<Theme, string> = {
  light: '☀️',
  sepia: '📖',
  dark: '🌙',
}

const THEME_CSS = `
:root {
  --ow-bg: #ffffff;
  --ow-text: #1a1a1a;
  --ow-link: #0066cc;
  --ow-border: #e0e0e0;
  --ow-code-bg: #f5f5f5;
}
:root[data-ow-theme="sepia"] {
  --ow-bg: #f4ecd8;
  --ow-text: #5b4636;
  --ow-link: #8b6914;
  --ow-border: #d4b896;
  --ow-code-bg: #ede0cc;
}
:root[data-ow-theme="dark"] {
  --ow-bg: #1a1a2e;
  --ow-text: #e0e0e0;
  --ow-link: #64b5f6;
  --ow-border: #3a3a5a;
  --ow-code-bg: #252540;
}
body {
  background-color: var(--ow-bg) !important;
  color: var(--ow-text) !important;
  transition: background-color 0.25s ease, color 0.25s ease;
}
a { color: var(--ow-link) !important; }
code, pre {
  background: var(--ow-code-bg) !important;
  transition: background-color 0.25s ease;
}
`

const TOGGLE_CSS = `
#ow-theme-toggle {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  background: var(--ow-bg, #fff);
  border: 1px solid var(--ow-border, #ccc);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
#ow-theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
`

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-ow-theme', theme)
  try { localStorage.setItem('ow-theme', theme) } catch {}
}

/**
 * Active les thèmes de lecture (clair / sépia / sombre).
 * Le thème est persisté dans localStorage.
 * Un bouton discret en bas à droite permet de basculer entre les thèmes.
 */
export function setupThemes(): void {
  // Injecter le CSS des thèmes
  if (!document.getElementById('ow-theme-css')) {
    const style = document.createElement('style')
    style.id = 'ow-theme-css'
    style.textContent = THEME_CSS + TOGGLE_CSS
    document.head.appendChild(style)
  }

  // Appliquer le thème sauvegardé
  let saved: Theme = 'light'
  try {
    const stored = localStorage.getItem('ow-theme') as Theme | null
    if (stored && THEMES.includes(stored)) saved = stored
  } catch {}
  applyTheme(saved)

  // Créer le bouton de bascule
  if (!document.getElementById('ow-theme-toggle')) {
    const btn = document.createElement('button')
    btn.id = 'ow-theme-toggle'
    btn.type = 'button'

    const updateBtn = () => {
      const current = (document.documentElement.getAttribute('data-ow-theme') as Theme) || 'light'
      btn.textContent = THEME_ICONS[current]
      btn.title = `Thème : ${current} — cliquer pour changer`
      btn.setAttribute('aria-label', `Thème de lecture : ${current}`)
    }

    updateBtn()

    btn.addEventListener('click', () => {
      const current = (document.documentElement.getAttribute('data-ow-theme') as Theme) || 'light'
      const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]
      applyTheme(next)
      updateBtn()
    })

    document.body.appendChild(btn)
  }
}

// ─────────────────────────────────────────────────────────────
// Export PDF (print CSS + déclencheur)
// ─────────────────────────────────────────────────────────────

const PRINT_CSS = `
@media print {
  #floating-menu,
  .floating-menu,
  .ontowave-floating-menu,
  #sidebar,
  #toc,
  #site-header,
  #search,
  #view-toggles,
  #ow-theme-toggle,
  #ow-notes-panel,
  nav {
    display: none !important;
  }
  body {
    background: white !important;
    color: black !important;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.6;
  }
  a {
    color: inherit !important;
    text-decoration: underline;
  }
  pre, code {
    background: #f5f5f5 !important;
    color: black !important;
    border: 1px solid #ccc;
    font-family: 'Courier New', monospace;
  }
  h1, h2, h3, h4 { page-break-after: avoid; }
  pre, blockquote, img, figure { page-break-inside: avoid; }
  @page {
    margin: 2cm;
  }
}
`

/**
 * Ajoute le CSS d'impression optimisé (PDF via Ctrl+P).
 * Masque les éléments de navigation, optimise la typographie.
 */
export function setupPrint(): void {
  if (!document.getElementById('ow-print-css')) {
    const style = document.createElement('style')
    style.id = 'ow-print-css'
    style.textContent = PRINT_CSS
    document.head.appendChild(style)
  }
}

// ─────────────────────────────────────────────────────────────
// Préfetch Markov
// ─────────────────────────────────────────────────────────────

// Graphe de transitions : transitions[from][to] = count
const transitions: Map<string, Map<string, number>> = new Map()
let _lastRoute = ''

function recordTransition(from: string, to: string): void {
  if (!from || !to || from === to) return
  if (!transitions.has(from)) transitions.set(from, new Map())
  const t = transitions.get(from)!
  t.set(to, (t.get(to) ?? 0) + 1)
}

function predictNextRoute(current: string): string | null {
  const t = transitions.get(current)
  if (!t || t.size === 0) return null
  let bestRoute: string | null = null
  let bestCount = 0
  for (const [route, count] of t) {
    if (count > bestCount) {
      bestCount = count
      bestRoute = route
    }
  }
  return bestRoute
}

async function prefetchRoute(route: string): Promise<void> {
  try {
    const data = _sitemapCache ?? await loadSitemap()
    const match = data.find(it => it.route === route)
    if (!match) return
    // Extraire le chemin du fichier markdown
    const cfg = await fetch('/config.json', { cache: 'force-cache' })
      .then(r => r.json())
      .catch(() => ({ roots: [] }))
    const roots: { base: string; root: string }[] = cfg.roots || []
    const path = route.replace(/^#\//, '').replace(/^\//, '')
    const seg = path.split('/').filter(Boolean)
    const base = seg[0] || ''
    const rootCfg = roots.find((r: { base: string }) => r.base === base)
    const root = rootCfg ? rootCfg.root.replace(/\/$/, '') : (roots[0]?.root?.replace(/\/$/, '') || '/content')
    const remainder = (rootCfg ? seg.slice(1) : seg).join('/')
    const candidates = remainder
      ? [`${root}/${remainder}.md`, `${root}/${remainder}/index.md`]
      : [`${root}/index.md`]
    for (const url of candidates) {
      await fetch(url, { cache: 'force-cache' }).catch(() => {})
    }
  } catch {}
}

/**
 * Préfetch intelligent basé sur l'historique de navigation (modèle de Markov).
 *
 * Enregistre les transitions entre pages et précharge la page la plus
 * probable selon les habitudes de navigation de l'utilisateur.
 * Complète le préfetch prev/next avec des prédictions personnalisées.
 */
export function setupMarkovPrefetch(): void {
  // Essayer de recharger l'historique sauvegardé
  try {
    const saved = localStorage.getItem('ow-markov')
    if (saved) {
      const data = JSON.parse(saved) as Record<string, Record<string, number>>
      for (const [from, tos] of Object.entries(data)) {
        transitions.set(from, new Map(Object.entries(tos)))
      }
    }
  } catch {}

  const saveTransitions = () => {
    try {
      const data: Record<string, Record<string, number>> = {}
      for (const [from, tos] of transitions) {
        data[from] = Object.fromEntries(tos)
      }
      localStorage.setItem('ow-markov', JSON.stringify(data))
    } catch {}
  }

  const onRouteChange = () => {
    const current = location.hash || '#/'
    if (_lastRoute) recordTransition(_lastRoute, current)
    _lastRoute = current

    // Précharger la prédiction Markov
    const predicted = predictNextRoute(current)
    if (predicted && predicted !== current) {
      void prefetchRoute(predicted)
    }

    saveTransitions()
  }

  _lastRoute = location.hash || '#/'
  window.addEventListener('hashchange', onRouteChange)
}

// ─────────────────────────────────────────────────────────────
// Prise de notes légère (localStorage)
// ─────────────────────────────────────────────────────────────

const NOTES_CSS = `
#ow-notes-toggle {
  position: fixed;
  bottom: 4.25rem;
  right: 1.25rem;
  z-index: 9999;
  background: var(--ow-bg, #fff);
  border: 1px solid var(--ow-border, #ccc);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: transform 0.15s ease;
}
#ow-notes-toggle:hover { transform: scale(1.1); }
#ow-notes-panel {
  position: fixed;
  bottom: 7.25rem;
  right: 1.25rem;
  z-index: 9998;
  width: 280px;
  background: var(--ow-bg, #fff);
  border: 1px solid var(--ow-border, #ccc);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  display: none;
  flex-direction: column;
  overflow: hidden;
}
#ow-notes-panel.open { display: flex; }
#ow-notes-header {
  padding: 0.5rem 0.75rem;
  background: var(--ow-code-bg, #f5f5f5);
  border-bottom: 1px solid var(--ow-border, #ccc);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ow-text, #222);
}
#ow-notes-textarea {
  flex: 1;
  border: none;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  max-height: 300px;
  background: var(--ow-bg, #fff);
  color: var(--ow-text, #222);
  outline: none;
}
`

/**
 * Prise de notes légère ancrée au hash courant (POC localStorage).
 * Les notes sont sauvegardées par page (hash URL) dans localStorage.
 */
export function setupNotes(): void {
  if (!document.getElementById('ow-notes-css')) {
    const style = document.createElement('style')
    style.id = 'ow-notes-css'
    style.textContent = NOTES_CSS
    document.head.appendChild(style)
  }

  const getKey = () => `ow-note:${location.hash || '#/'}`

  const loadNote = () => {
    try { return localStorage.getItem(getKey()) ?? '' } catch { return '' }
  }
  const saveNote = (text: string) => {
    try { localStorage.setItem(getKey(), text) } catch {}
  }

  // Panel
  const panel = document.createElement('div')
  panel.id = 'ow-notes-panel'
  panel.innerHTML = `<div id="ow-notes-header">📝 Notes — <span id="ow-notes-page"></span></div>`
  const ta = document.createElement('textarea')
  ta.id = 'ow-notes-textarea'
  ta.placeholder = 'Vos notes pour cette page…'
  ta.value = loadNote()
  ta.addEventListener('input', () => saveNote(ta.value))
  panel.appendChild(ta)

  // Bouton toggle
  const btn = document.createElement('button')
  btn.id = 'ow-notes-toggle'
  btn.type = 'button'
  btn.textContent = '📝'
  btn.title = 'Notes pour cette page'
  btn.setAttribute('aria-label', 'Ouvrir/fermer le panneau de notes')
  btn.addEventListener('click', () => {
    panel.classList.toggle('open')
    if (panel.classList.contains('open')) {
      ta.value = loadNote()
      ta.focus()
    }
  })

  document.body.appendChild(panel)
  document.body.appendChild(btn)

  // Mettre à jour les notes lors des changements de route
  window.addEventListener('hashchange', () => {
    const pageEl = document.getElementById('ow-notes-page')
    if (pageEl) pageEl.textContent = location.hash || '#/'
    if (panel.classList.contains('open')) ta.value = loadNote()
  })

  // Init label
  const pageEl = document.getElementById('ow-notes-page')
  if (pageEl) pageEl.textContent = location.hash || '#/'
}
