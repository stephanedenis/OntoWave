/**
 * Module UX — Améliorations de lecture inspirées des liseuses
 *
 * Fonctionnalités :
 * - Thèmes de lecture : clair / sépia / sombre (persistés dans localStorage)
 * - Navigation au clavier : j/k (défilement), n/p (page précédente/suivante)
 * - Export PDF : déclencheur print discret avec CSS d'impression
 * - Notes légères : ancrages persistants par hash (POC localStorage)
 * - Prefetch Markov : préchargement intelligent basé sur l'historique de navigation
 */

import { getJsonFromBundle } from './bundle'

export type ReadingTheme = 'light' | 'sepia' | 'dark'

const LS_THEME_KEY = 'ow-reading-theme'
const MARKOV_KEY = 'ow-markov'
const MARKOV_MAX_ENTRIES = 200

/** Vérifie qu'une clé de route ne peut pas polluer Object.prototype */
function isSafeRouteKey(key: string): boolean {
  return key !== '__proto__' && key !== 'constructor' && key !== 'prototype'
}

// ---------------------------------------------------------------------------
// Thèmes de lecture
// ---------------------------------------------------------------------------

export function applyTheme(theme: ReadingTheme): void {
  document.body.classList.remove('ow-theme-light', 'ow-theme-sepia', 'ow-theme-dark')
  document.body.classList.add(`ow-theme-${theme}`)
  try {
    localStorage.setItem(LS_THEME_KEY, theme)
  } catch {}
}

export function loadSavedTheme(): ReadingTheme {
  try {
    const saved = localStorage.getItem(LS_THEME_KEY) as ReadingTheme | null
    if (saved && ['light', 'sepia', 'dark'].includes(saved)) return saved
  } catch {}
  return 'light'
}

export function cycleTheme(): ReadingTheme {
  const current = loadSavedTheme()
  const order: ReadingTheme[] = ['light', 'sepia', 'dark']
  const next = order[(order.indexOf(current) + 1) % order.length]
  applyTheme(next)
  return next
}

// ---------------------------------------------------------------------------
// Prefetch Markov
// ---------------------------------------------------------------------------

type MarkovTable = Record<string, Record<string, number>>

function loadMarkov(): MarkovTable {
  try {
    return JSON.parse(localStorage.getItem(MARKOV_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveMarkov(table: MarkovTable): void {
  try {
    // Limiter la taille en supprimant les entrées les moins fréquentes
    const entries = Object.entries(table)
    if (entries.length > MARKOV_MAX_ENTRIES) {
      entries.sort((a, b) => {
        const sa = Object.values(a[1]).reduce((x, y) => x + y, 0)
        const sb = Object.values(b[1]).reduce((x, y) => x + y, 0)
        return sa - sb
      })
      const pruned = Object.fromEntries(entries.slice(entries.length - MARKOV_MAX_ENTRIES))
      localStorage.setItem(MARKOV_KEY, JSON.stringify(pruned))
    } else {
      localStorage.setItem(MARKOV_KEY, JSON.stringify(table))
    }
  } catch {}
}

function recordTransition(from: string, to: string): void {
  if (from === to) return
  if (!isSafeRouteKey(from) || !isSafeRouteKey(to)) return
  const table = loadMarkov()
  if (!table[from]) table[from] = Object.create(null) as Record<string, number>
  table[from][to] = (table[from][to] || 0) + 1
  saveMarkov(table)
}

function predictNext(from: string): string[] {
  const table = loadMarkov()
  const transitions = table[from]
  if (!transitions) return []
  return Object.entries(transitions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([route]) => route)
}

// Cache mémoire du sitemap pour éviter des requêtes répétées
let sitemapCache: Array<{ route: string; path?: string }> | null = null

async function getSitemapItems(): Promise<Array<{ route: string; path?: string }>> {
  if (sitemapCache !== null) return sitemapCache
  try {
    const bundleData = getJsonFromBundle('/sitemap.json')
    const data = bundleData || await fetch('/sitemap.json', { cache: 'default' }).then(r => r.ok ? r.json() : null).catch(() => null)
    if (!data) return []
    sitemapCache = (data as { items: Array<{ route: string; path?: string }> }).items || []
    return sitemapCache
  } catch {
    return []
  }
}

async function prefetchRoute(route: string): Promise<void> {
  try {
    const items = await getSitemapItems()
    const match = items.find(it => it.route === route)
    if (!match) return
    const mdPath = match.path?.replace(/^\//, '') || ''
    if (mdPath) await fetch('/' + mdPath, { cache: 'force-cache' }).catch(() => {})
  } catch {}
}

// ---------------------------------------------------------------------------
// Injection des styles CSS (thèmes)
// ---------------------------------------------------------------------------

const UX_CSS = `
/* === Thèmes de lecture OntoWave === */
body.ow-theme-light {
  --ow-bg: #ffffff;
  --ow-text: #1a1a1a;
  --ow-link: #0066cc;
  --ow-code-bg: #f5f5f5;
  --ow-border: #e0e0e0;
  --ow-sidebar-bg: #f9f9f9;
}
body.ow-theme-sepia {
  --ow-bg: #f4ede4;
  --ow-text: #3a2a1a;
  --ow-link: #7a4a20;
  --ow-code-bg: #e8ddd4;
  --ow-border: #c8b8a8;
  --ow-sidebar-bg: #ede6de;
}
body.ow-theme-dark {
  --ow-bg: #1a1a1a;
  --ow-text: #e0e0e0;
  --ow-link: #66aaff;
  --ow-code-bg: #2a2a2a;
  --ow-border: #444444;
  --ow-sidebar-bg: #222222;
}
body.ow-theme-light,
body.ow-theme-sepia,
body.ow-theme-dark {
  background-color: var(--ow-bg);
  color: var(--ow-text);
}
body.ow-theme-light a,
body.ow-theme-sepia a,
body.ow-theme-dark a {
  color: var(--ow-link);
}
body.ow-theme-light code, body.ow-theme-light pre,
body.ow-theme-sepia code, body.ow-theme-sepia pre,
body.ow-theme-dark code, body.ow-theme-dark pre {
  background-color: var(--ow-code-bg);
}
body.ow-theme-dark code, body.ow-theme-dark pre {
  color: #d4d4d4;
}
body.ow-theme-light #sidebar, body.ow-theme-light nav,
body.ow-theme-sepia #sidebar, body.ow-theme-sepia nav,
body.ow-theme-dark #sidebar, body.ow-theme-dark nav {
  background-color: var(--ow-sidebar-bg);
}
body.ow-theme-dark table {
  border-color: var(--ow-border);
}
body.ow-theme-dark th,
body.ow-theme-dark td {
  border-color: var(--ow-border);
}

/* === Bouton de bascule de thème === */
.ow-theme-btn {
  background: none;
  border: 1px solid currentColor;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  padding: 2px 8px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.ow-theme-btn:hover {
  opacity: 1;
}

/* === Masquer la barre UX quand le menu flottant est fermé === */
#ontowave-floating-menu:not(.expanded) #ow-ux-toolbar {
  display: none !important;
}
`

function injectStyles(): void {
  if (document.getElementById('ow-ux-styles')) return
  const style = document.createElement('style')
  style.id = 'ow-ux-styles'
  style.textContent = UX_CSS
  document.head.appendChild(style)
}

// ---------------------------------------------------------------------------
// Barre d'outils UX (thème + print + notes)
// ---------------------------------------------------------------------------

function createThemeLabel(theme: ReadingTheme): string {
  const labels: Record<ReadingTheme, string> = { light: '☀ Clair', sepia: '📖 Sépia', dark: '🌙 Sombre' }
  return labels[theme]
}

export function injectUxToolbar(container: HTMLElement | null): void {
  if (!container) return
  // Si la page a un #ontowave-floating-menu (chrome CDN), on y injecte la barre
  const floatingMenu = document.getElementById('ontowave-floating-menu')
  const toolbarTarget = floatingMenu ?? container
  const existing = document.getElementById('ow-ux-toolbar')
  if (existing) existing.remove()

  const toolbar = document.createElement('div')
  toolbar.id = 'ow-ux-toolbar'
  toolbar.className = 'ow-ux-toolbar'
  // Style compact si dans le floating-menu, barre horizontale si inline dans #app
  if (floatingMenu) {
    toolbar.style.cssText = 'display:flex; flex-direction:row; gap:0.5rem; align-items:center; font-size:0.85em;'
  } else {
    toolbar.style.cssText = 'display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; margin-bottom:1rem; padding:0.4rem 0; border-bottom:1px solid var(--ow-border,#e0e0e0); font-size:0.85em;'
  }

  // Bouton thème
  const themeBtn = document.createElement('button')
  themeBtn.className = 'ow-theme-btn'
  themeBtn.title = 'Changer le thème de lecture (j/k: défiler, n/p: page suiv./préc.)'
  const currentTheme = loadSavedTheme()
  themeBtn.textContent = createThemeLabel(currentTheme)
  themeBtn.addEventListener('click', () => {
    const next = cycleTheme()
    themeBtn.textContent = createThemeLabel(next)
  })
  toolbar.appendChild(themeBtn)

  // Injecter la barre dans le floating-menu ou dans le contenu (inline)
  if (floatingMenu) {
    toolbarTarget.appendChild(toolbar)
  } else {
    toolbarTarget.prepend(toolbar)
  }
}

// ---------------------------------------------------------------------------
// Navigation au clavier
// ---------------------------------------------------------------------------

export function installKeyboardNav(getPrevNext: () => { prev?: string; next?: string }): () => void {
  const handler = (e: KeyboardEvent) => {
    // Ignorer si focus dans un champ de saisie
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return
    if ((e.target as HTMLElement)?.isContentEditable) return

    const key = e.key.toLowerCase()
    switch (key) {
      case 'j':
        window.scrollBy({ top: 120, behavior: 'smooth' })
        break
      case 'k':
        window.scrollBy({ top: -120, behavior: 'smooth' })
        break
      case 'n': {
        const { next } = getPrevNext()
        if (next) location.hash = next.startsWith('#') ? next : `#${next}`
        break
      }
      case 'p': {
        const { prev } = getPrevNext()
        if (prev) location.hash = prev.startsWith('#') ? prev : `#${prev}`
        break
      }
    }
  }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}

// ---------------------------------------------------------------------------
// Initialisation principale
// ---------------------------------------------------------------------------

export interface UxOptions {
  /** Active/désactive les thèmes. Défaut : true */
  themes?: boolean
  /** Active/désactive la navigation clavier. Défaut : true */
  keyboard?: boolean
  /** Active/désactive le prefetch Markov. Défaut : true */
  prefetch?: boolean
}

export function initUx(options: UxOptions = {}): {
  onRouteChange: (_route: string, _prevNext: { prev?: string; next?: string }) => void
} {
  const opts = {
    themes: options.themes !== false,
    keyboard: options.keyboard !== false,
    prefetch: options.prefetch !== false,
  }

  injectStyles()

  if (opts.themes) {
    applyTheme(loadSavedTheme())
  }

  let currentPrevNext: { prev?: string; next?: string } = {}
  let previousRoute = ''

  if (opts.keyboard) {
    installKeyboardNav(() => currentPrevNext)
  }

  const onRouteChange = (route: string, prevNext: { prev?: string; next?: string }) => {
    // Prefetch Markov : enregistrer la transition et précharger les pages prédites
    if (opts.prefetch && previousRoute && previousRoute !== route) {
      recordTransition(previousRoute, route)
      const predicted = predictNext(route)
      for (const p of predicted) {
        prefetchRoute(p)
      }
    }
    previousRoute = route

    currentPrevNext = prevNext

    if (opts.themes) {
      const appEl = document.getElementById('app')
      if (appEl) injectUxToolbar(appEl)
    }
  }

  return { onRouteChange }
}
