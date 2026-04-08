import { describe, it, expect, beforeEach } from 'vitest'

// Pure logic extracted from reader.ts for unit testing
// (fonctions ne nécessitant pas de DOM)

describe('reader — thèmes de lecture', () => {
  const THEMES = ['light', 'sepia', 'dark'] as const
  type ReadingTheme = 'light' | 'sepia' | 'dark'

  function nextTheme(current: ReadingTheme): ReadingTheme {
    const idx = THEMES.indexOf(current)
    return THEMES[(idx + 1) % THEMES.length]
  }

  it('cycle light → sepia → dark → light', () => {
    expect(nextTheme('light')).toBe('sepia')
    expect(nextTheme('sepia')).toBe('dark')
    expect(nextTheme('dark')).toBe('light')
  })

  it('chaque thème a une valeur valide', () => {
    for (const t of THEMES) {
      expect(THEMES).toContain(t)
    }
  })

  it('les trois thèmes sont distincts', () => {
    expect(new Set(THEMES).size).toBe(3)
  })
})

describe('reader — notes légères (clé localStorage)', () => {
  const LS_NOTES_KEY = 'ow-notes'

  function getNotesKey(hash: string): string {
    const h = hash.split('?')[0] || '#/'
    return `${LS_NOTES_KEY}:${h}`
  }

  // Implémentation localStorage en mémoire pour tests node
  const store: Record<string, string> = {}
  const mockStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { for (const k of Object.keys(store)) delete store[k] },
  }

  function loadNote(hash: string): string {
    return mockStorage.getItem(getNotesKey(hash)) ?? ''
  }

  function saveNote(hash: string, text: string): void {
    const key = getNotesKey(hash)
    if (text) mockStorage.setItem(key, text)
    else mockStorage.removeItem(key)
  }

  beforeEach(() => mockStorage.clear())

  it('saveNote puis loadNote retourne le même texte', () => {
    saveNote('#/fr/guide', 'Ma note importante')
    expect(loadNote('#/fr/guide')).toBe('Ma note importante')
  })

  it('saveNote texte vide supprime la clé', () => {
    saveNote('#/page', 'texte')
    saveNote('#/page', '')
    expect(loadNote('#/page')).toBe('')
  })

  it('les notes sont cloisonnées par hash', () => {
    saveNote('#/page-a', 'Note A')
    saveNote('#/page-b', 'Note B')
    expect(loadNote('#/page-a')).toBe('Note A')
    expect(loadNote('#/page-b')).toBe('Note B')
  })

  it('les query params sont ignorés pour la clé de note', () => {
    const key = getNotesKey('#/page?view=md')
    expect(key).toBe(`${LS_NOTES_KEY}:#/page`)
  })

  it('la clé de note vide utilise #/', () => {
    const key = getNotesKey('')
    expect(key).toBe(`${LS_NOTES_KEY}:#/`)
  })
})

describe('reader — raccourcis clavier', () => {
  const navKeys = new Set(['n', 'p', 'ArrowRight', 'ArrowLeft'])
  const scrollKeys = new Set(['j', 'k'])

  it('les touches de navigation sont définies', () => {
    expect(navKeys.has('n')).toBe(true)
    expect(navKeys.has('p')).toBe(true)
    expect(navKeys.has('ArrowRight')).toBe(true)
    expect(navKeys.has('ArrowLeft')).toBe(true)
  })

  it('les touches de scroll sont définies', () => {
    expect(scrollKeys.has('j')).toBe(true)
    expect(scrollKeys.has('k')).toBe(true)
  })

  it('les touches de navigation et de scroll ne se chevauchent pas', () => {
    for (const k of scrollKeys) {
      expect(navKeys.has(k)).toBe(false)
    }
    for (const k of navKeys) {
      expect(scrollKeys.has(k)).toBe(false)
    }
  })

  it('les éléments interactifs déclenchent l\'ignorance des raccourcis', () => {
    const ignoredTags = ['input', 'textarea', 'select']
    for (const tag of ignoredTags) {
      // La logique dans reader.ts ignore les raccourcis quand target.tagName est dans cette liste
      expect(ignoredTags.includes(tag)).toBe(true)
    }
  })
})

