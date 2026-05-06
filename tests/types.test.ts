import { describe, it, expect } from 'vitest'
import type {
  ContentRenderer,
  ExtensionRegistry,
  ExtensionConfig,
  I18nConfig,
  RenderPhase,
  AppConfig,
} from '../src/core/types'

// ---------------------------------------------------------------------------
// Contrats de types — vérifications légères à la compilation et au runtime
// Ces tests s'assurent que les interfaces nouvelles sont utilisables
// correctement par du code TypeScript sans erreur de compilation.
// ---------------------------------------------------------------------------

describe('RenderPhase', () => {
  it('accepte les valeurs "initial" et "enhanced"', () => {
    const phases: RenderPhase[] = ['initial', 'enhanced']
    expect(phases).toHaveLength(2)
  })
})

describe('I18nConfig', () => {
  it('accepte un objet avec mode suffix', () => {
    const cfg: I18nConfig = { default: 'fr', supported: ['fr', 'en'], mode: 'suffix' }
    expect(cfg.mode).toBe('suffix')
  })

  it('accepte un objet avec mode folder', () => {
    const cfg: I18nConfig = { default: 'en', supported: ['en', 'de'], mode: 'folder' }
    expect(cfg.mode).toBe('folder')
  })
})

describe('ExtensionConfig', () => {
  it('accepte un objet avec tous les champs optionnels absents', () => {
    const cfg: ExtensionConfig = {}
    expect(cfg).toBeDefined()
  })

  it('accepte un objet complet', () => {
    const cfg: ExtensionConfig = {
      base: ['markdown'],
      preload: [],
      lazy: ['mermaid', 'katex', 'highlight'],
    }
    expect(cfg.base).toContain('markdown')
    expect(cfg.lazy).toHaveLength(3)
  })
})

describe('AppConfig', () => {
  it('est valide sans i18n ni extensions', () => {
    const cfg: AppConfig = { roots: [{ base: '/', root: '/content' }] }
    expect(cfg.roots).toHaveLength(1)
    expect(cfg.i18n).toBeUndefined()
    expect(cfg.extensions).toBeUndefined()
  })

  it('intègre i18n avec mode obligatoire', () => {
    const cfg: AppConfig = {
      roots: [{ base: '/', root: '/content' }],
      i18n: { default: 'fr', supported: ['fr', 'en'], mode: 'suffix' },
    }
    expect(cfg.i18n?.mode).toBe('suffix')
  })

  it('intègre extensions', () => {
    const cfg: AppConfig = {
      roots: [{ base: '/', root: '/content' }],
      extensions: { base: ['markdown'], lazy: ['mermaid'] },
    }
    expect(cfg.extensions?.base).toContain('markdown')
    expect(cfg.extensions?.lazy).toContain('mermaid')
  })
})

describe('ContentRenderer', () => {
  it('accepte une implémentation minimale', async () => {
    const renderer: ContentRenderer = {
      name: 'plain-text',
      handles: ['.txt'],
      canRender: (url: string) => url.endsWith('.txt'),
      render: async (source: string) => `<pre>${source}</pre>`,
    }
    expect(renderer.name).toBe('plain-text')
    expect(renderer.handles).toContain('.txt')
    expect(renderer.canRender('readme.txt')).toBe(true)
    expect(renderer.canRender('readme.md')).toBe(false)
    await expect(renderer.render('hello', 'readme.txt')).resolves.toBe('<pre>hello</pre>')
  })

  it('accepte le champ requires optionnel', () => {
    const renderer: ContentRenderer = {
      name: 'markdown',
      handles: ['.md', '.markdown'],
      requires: ['mermaid', 'katex'],
      canRender: () => true,
      render: async (src: string) => src,
    }
    expect(renderer.requires).toEqual(['mermaid', 'katex'])
  })
})

describe('ExtensionRegistry', () => {
  it('accepte une implémentation de registre en mémoire', async () => {
    const store: ContentRenderer[] = []

    const registry: ExtensionRegistry = {
      register(renderer: ContentRenderer) {
        store.push(renderer)
      },
      async load(_name: string, _url: string): Promise<ContentRenderer> {
        // Stub : retourne un renderer factice sans import() dynamique
        const stub: ContentRenderer = {
          name: _name,
          handles: [],
          canRender: () => false,
          render: async () => '',
        }
        store.push(stub)
        return stub
      },
      resolve(url: string): ContentRenderer | null {
        return store.find(r => r.canRender(url)) ?? null
      },
    }

    const mdRenderer: ContentRenderer = {
      name: 'markdown',
      handles: ['.md'],
      canRender: (url: string) => url.endsWith('.md'),
      render: async (src: string) => src,
    }
    registry.register(mdRenderer)
    expect(registry.resolve('guide.md')).toBe(mdRenderer)
    expect(registry.resolve('image.png')).toBeNull()

    const loaded = await registry.load('stub', 'extensions/stub.js')
    expect(loaded.name).toBe('stub')
  })
})
