/**
 * OntoWave Reader — Améliorations de lecture
 *
 * Thèmes (clair/sépia/sombre), raccourcis clavier (j/k scroll, n/p nav),
 * export PDF (print CSS + déclencheur), notes légères (localStorage).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReadingTheme = 'light' | 'sepia' | 'dark'

export interface ReaderOptions {
  /** Activer les thèmes de lecture (défaut : true) */
  themes?: boolean
  /** Activer les raccourcis clavier (défaut : true) */
  keyboard?: boolean
  /** Activer le bouton d'impression (défaut : true) */
  print?: boolean
  /** Activer les notes légères (défaut : true) */
  notes?: boolean
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const LS_THEME_KEY = 'ow-theme'
const LS_NOTES_KEY = 'ow-notes'
const THEMES: ReadingTheme[] = ['light', 'sepia', 'dark']

// ─── Thèmes ───────────────────────────────────────────────────────────────────

const THEME_CSS = `
/* OntoWave Reading Themes */
body.ow-theme-sepia {
  --ow-bg: #f4ecd8;
  --ow-text: #3b2f1e;
  --ow-link: #7b5e3a;
  --ow-border: #c9b99a;
  --ow-code-bg: #ede3cc;
  --ow-header-bg: #e8d9be;
}
body.ow-theme-dark {
  --ow-bg: #1e1e2e;
  --ow-text: #cdd6f4;
  --ow-link: #89b4fa;
  --ow-border: #45475a;
  --ow-code-bg: #181825;
  --ow-header-bg: #181825;
}
body.ow-theme-light,
body {
  --ow-bg: #ffffff;
  --ow-text: #24292e;
  --ow-link: #0366d6;
  --ow-border: #e1e4e8;
  --ow-code-bg: #f6f8fa;
  --ow-header-bg: #f8f9fa;
}
body.ow-theme-sepia,
body.ow-theme-dark,
body.ow-theme-light {
  background-color: var(--ow-bg);
  color: var(--ow-text);
}
body.ow-theme-sepia a,
body.ow-theme-dark a,
body.ow-theme-light a {
  color: var(--ow-link);
}
body.ow-theme-sepia code,
body.ow-theme-dark code,
body.ow-theme-light code,
body.ow-theme-sepia pre,
body.ow-theme-dark pre,
body.ow-theme-light pre {
  background: var(--ow-code-bg);
}
/* Print styles */
@media print {
  .ow-reader-bar,
  .ow-notes-panel,
  .ontowave-floating-menu,
  #floating-menu,
  #sidebar,
  #toc,
  #site-header {
    display: none !important;
  }
  body {
    background: white !important;
    color: black !important;
  }
  #app, .ontowave-content {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
}
/* Reader bar */
.ow-reader-bar {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  z-index: 9000;
}
.ow-reader-btn {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  border: 1px solid var(--ow-border, #e1e4e8);
  background: var(--ow-header-bg, #f8f9fa);
  color: var(--ow-text, #24292e);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: opacity 0.2s;
  padding: 0;
  line-height: 1;
}
.ow-reader-btn:hover { opacity: 0.8; }
/* Notes panel */
.ow-notes-panel {
  position: fixed;
  bottom: 4rem;
  right: 3.5rem;
  width: 280px;
  background: var(--ow-header-bg, #f8f9fa);
  border: 1px solid var(--ow-border, #e1e4e8);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  display: none;
  flex-direction: column;
  z-index: 8999;
  overflow: hidden;
}
.ow-notes-panel.visible { display: flex; }
.ow-notes-header {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-bottom: 1px solid var(--ow-border, #e1e4e8);
  background: var(--ow-code-bg, #f6f8fa);
  color: var(--ow-text, #24292e);
}
.ow-notes-textarea {
  flex: 1;
  resize: none;
  border: none;
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
  font-family: inherit;
  background: var(--ow-bg, #fff);
  color: var(--ow-text, #24292e);
  min-height: 120px;
  outline: none;
}
`

function injectReaderCss(): void {
  if (document.getElementById('ow-reader-styles')) return
  const style = document.createElement('style')
  style.id = 'ow-reader-styles'
  style.textContent = THEME_CSS
  document.head.appendChild(style)
}

export function getTheme(): ReadingTheme {
  try {
    const stored = localStorage.getItem(LS_THEME_KEY) as ReadingTheme | null
    if (stored && THEMES.includes(stored)) return stored
  } catch {}
  return 'light'
}

export function setTheme(theme: ReadingTheme): void {
  for (const t of THEMES) document.body.classList.remove(`ow-theme-${t}`)
  document.body.classList.add(`ow-theme-${theme}`)
  try { localStorage.setItem(LS_THEME_KEY, theme) } catch {}
  // Update button title
  const btn = document.getElementById('ow-btn-theme')
  if (btn) btn.title = nextThemeLabel(theme)
}

function nextTheme(current: ReadingTheme): ReadingTheme {
  const idx = THEMES.indexOf(current)
  return THEMES[(idx + 1) % THEMES.length]
}

function themeIcon(theme: ReadingTheme): string {
  return theme === 'dark' ? '🌙' : theme === 'sepia' ? '📜' : '☀️'
}

function nextThemeLabel(current: ReadingTheme): string {
  const next = nextTheme(current)
  return `Thème : ${next}`
}

// ─── Notes ────────────────────────────────────────────────────────────────────

function getNotesKey(): string {
  const hash = location.hash.split('?')[0] || '#/'
  return `${LS_NOTES_KEY}:${hash}`
}

function loadNote(): string {
  try { return localStorage.getItem(getNotesKey()) ?? '' } catch { return '' }
}

function saveNote(text: string): void {
  try {
    const key = getNotesKey()
    if (text) localStorage.setItem(key, text)
    else localStorage.removeItem(key)
  } catch {}
}

// ─── Reader bar ───────────────────────────────────────────────────────────────

function createReaderBar(options: ReaderOptions): void {
  if (document.getElementById('ow-reader-bar')) return

  const bar = document.createElement('div')
  bar.id = 'ow-reader-bar'
  bar.className = 'ow-reader-bar'
  bar.setAttribute('aria-label', 'Barre de lecture')

  if (options.themes !== false) {
    const currentTheme = getTheme()
    const btnTheme = document.createElement('button')
    btnTheme.id = 'ow-btn-theme'
    btnTheme.className = 'ow-reader-btn'
    btnTheme.title = nextThemeLabel(currentTheme)
    btnTheme.setAttribute('aria-label', 'Changer le thème de lecture')
    btnTheme.textContent = themeIcon(currentTheme)
    btnTheme.addEventListener('click', () => {
      const cur = getTheme()
      const nxt = nextTheme(cur)
      setTheme(nxt)
      btnTheme.textContent = themeIcon(nxt)
    })
    bar.appendChild(btnTheme)
  }

  if (options.print !== false) {
    const btnPrint = document.createElement('button')
    btnPrint.id = 'ow-btn-print'
    btnPrint.className = 'ow-reader-btn'
    btnPrint.title = 'Imprimer / Exporter en PDF'
    btnPrint.setAttribute('aria-label', 'Imprimer ou exporter en PDF')
    btnPrint.textContent = '🖨️'
    btnPrint.addEventListener('click', () => window.print())
    bar.appendChild(btnPrint)
  }

  if (options.notes !== false) {
    const btnNotes = document.createElement('button')
    btnNotes.id = 'ow-btn-notes'
    btnNotes.className = 'ow-reader-btn'
    btnNotes.title = 'Notes'
    btnNotes.setAttribute('aria-label', 'Ouvrir les notes')
    btnNotes.textContent = '📝'

    const panel = document.createElement('div')
    panel.id = 'ow-notes-panel'
    panel.className = 'ow-notes-panel'
    panel.setAttribute('role', 'complementary')
    panel.setAttribute('aria-label', 'Notes de lecture')

    const header = document.createElement('div')
    header.className = 'ow-notes-header'
    header.textContent = 'Notes (sauvegardées localement)'

    const textarea = document.createElement('textarea')
    textarea.id = 'ow-notes-textarea'
    textarea.className = 'ow-notes-textarea'
    textarea.placeholder = 'Vos notes sur cette page…'
    textarea.value = loadNote()

    let saveTimer: ReturnType<typeof setTimeout> | null = null
    textarea.addEventListener('input', () => {
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => saveNote(textarea.value), 500)
    })

    panel.appendChild(header)
    panel.appendChild(textarea)

    btnNotes.addEventListener('click', () => {
      const visible = panel.classList.toggle('visible')
      if (visible) {
        textarea.value = loadNote()
        textarea.focus()
      }
    })

    bar.appendChild(btnNotes)
    document.body.appendChild(panel)

    // Update notes when route changes
    window.addEventListener('hashchange', () => {
      if (panel.classList.contains('visible')) {
        textarea.value = loadNote()
      }
    })
  }

  document.body.appendChild(bar)
}

// ─── Raccourcis clavier ───────────────────────────────────────────────────────

let keyboardInstalled = false

export function installKeyboardShortcuts(
  getPrevNext: () => { prev?: string; next?: string },
): void {
  if (keyboardInstalled) return
  keyboardInstalled = true

  document.addEventListener('keydown', (e) => {
    // Ignore when typing in an input or textarea
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return
    if ((e.target as HTMLElement)?.isContentEditable) return

    const { prev, next } = getPrevNext()

    switch (e.key) {
      case 'j': // scroll down
        window.scrollBy({ top: 200, behavior: 'smooth' })
        break
      case 'k': // scroll up
        window.scrollBy({ top: -200, behavior: 'smooth' })
        break
      case 'n': // page suivante
      case 'ArrowRight':
        if (next && !e.altKey && !e.ctrlKey && !e.metaKey) {
          location.hash = next
        }
        break
      case 'p': // page précédente
      case 'ArrowLeft':
        if (prev && !e.altKey && !e.ctrlKey && !e.metaKey) {
          location.hash = prev
        }
        break
    }
  })
}

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * Initialise toutes les fonctionnalités de lecture.
 * À appeler une seule fois au démarrage, après que le DOM est prêt.
 */
export function initReader(
  getPrevNext: () => { prev?: string; next?: string },
  options: ReaderOptions = {},
): void {
  injectReaderCss()
  setTheme(getTheme())
  createReaderBar(options)
  if (options.keyboard !== false) {
    installKeyboardShortcuts(getPrevNext)
  }
}
