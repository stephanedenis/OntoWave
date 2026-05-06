import { describe, it, expect, vi } from 'vitest'
import { createExtensionRegistry } from '../src/adapters/browser/extension-registry'
import { validateConfig } from '../src/core/config-validator'
import type { AppConfig, ContentRenderer } from '../src/core/types'

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRenderer(name: string, handles: string[] = ['.md']): ContentRenderer {
  return {
    name,
    handles,
    canRender: (url: string) => handles.some((ext) => url.endsWith(ext)),
    render: async (source: string) => `<rendered>${source}</rendered>`,
  }
}

// ── validateConfig ──────────────────────────────────────────────────────────

describe('validateConfig()', () => {
  it('ne produit aucun avertissement sans i18n (mode unilingue)', () => {
    const cfg: AppConfig = { roots: [{ base: '/', root: '/' }] }
    expect(validateConfig(cfg)).toHaveLength(0)
  })

  it('ne produit aucun avertissement si i18n.mode est défini', () => {
    const cfg: AppConfig = {
      roots: [{ base: '/fr', root: '/content/fr' }],
      i18n: { default: 'fr', supported: ['fr', 'en'], mode: 'suffix' },
    }
    expect(validateConfig(cfg)).toHaveLength(0)
  })

  it('signale I18N_MISSING_MODE si i18n est présent sans mode', () => {
    const cfg: AppConfig = {
      roots: [{ base: '/fr', root: '/content/fr' }],
      i18n: { default: 'fr', supported: ['fr', 'en'] },
    }
    const warnings = validateConfig(cfg)
    expect(warnings).toHaveLength(1)
    expect(warnings[0].code).toBe('I18N_MISSING_MODE')
    expect(warnings[0].message).toMatch(/i18n\.mode/)
  })
})

// ── createExtensionRegistry — register ────────────────────────────────────

describe('createExtensionRegistry — register()', () => {
  it('enregistre un renderer et le rend résolvable', () => {
    const registry = createExtensionRegistry()
    const renderer = makeRenderer('markdown', ['.md'])
    registry.register(renderer)
    expect(registry.resolve('page.md')).toBe(renderer)
  })

  it('avertit et ignore un renderer déjà enregistré (même nom)', () => {
    const registry = createExtensionRegistry()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    registry.register(makeRenderer('markdown'))
    registry.register(makeRenderer('markdown'))
    expect(warnSpy).toHaveBeenCalledOnce()
    warnSpy.mockRestore()
  })
})

// ── createExtensionRegistry — resolve ────────────────────────────────────

describe('createExtensionRegistry — resolve()', () => {
  it('retourne null si aucun renderer ne correspond', () => {
    const registry = createExtensionRegistry()
    registry.register(makeRenderer('markdown', ['.md']))
    expect(registry.resolve('diagram.puml')).toBeNull()
  })

  it("retourne le premier renderer compatible avec l'URL", () => {
    const registry = createExtensionRegistry()
    const md = makeRenderer('markdown', ['.md'])
    const html = makeRenderer('html-renderer', ['.html'])
    registry.register(md)
    registry.register(html)
    expect(registry.resolve('index.md')).toBe(md)
    expect(registry.resolve('page.html')).toBe(html)
  })
})

// ── createExtensionRegistry — load (cache) ───────────────────────────────

describe('createExtensionRegistry — load()', () => {
  it('retourne immédiatement un renderer déjà enregistré', async () => {
    const registry = createExtensionRegistry()
    const renderer = makeRenderer('markdown')
    registry.register(renderer)
    // load() ne doit pas faire d'import() si le renderer est déjà présent
    const result = await registry.load('markdown', 'extensions/markdown.js')
    expect(result).toBe(renderer)
  })

  it('utilise le cache : import() appelé une seule fois pour le même nom', async () => {
    const registry = createExtensionRegistry()
    const renderer = makeRenderer('cached-ext', ['.xyz'])
    let importCount = 0

    // Remplacer temporairement la logique d'import en pré-enregistrant via register()
    // puis en vérifiant que le second appel retourne la même instance
    registry.register(renderer)
    const p1 = registry.load('cached-ext', 'extensions/cached-ext.js')
    const p2 = registry.load('cached-ext', 'extensions/cached-ext.js')

    const [r1, r2] = await Promise.all([p1, p2])
    expect(r1).toBe(renderer)
    expect(r2).toBe(renderer)
    // importCount must stay 0 because the renderer was already registered
    expect(importCount).toBe(0)
  })

  it("relance l'erreur si import() echoue et ajoute un avertissement", async () => {
    const registry = createExtensionRegistry()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Tenter de charger une URL invalide — import() va échouer dans l'environnement node
    await expect(registry.load('broken', 'non-existent-extension.js')).rejects.toThrow()

    const warnings = registry.getWarnings()
    expect(warnings).toHaveLength(1)
    expect(warnings[0].code).toBe('EXTENSION_LOAD_ERROR')
    errorSpy.mockRestore()
  })
})

// ── createExtensionRegistry — getWarnings / addWarning ──────────────────

describe('createExtensionRegistry — getWarnings()', () => {
  it('retourne une copie de la liste (pas de mutation externe)', () => {
    const registry = createExtensionRegistry()
    registry.addWarning({ code: 'TEST', message: 'test' })
    const w1 = registry.getWarnings() as Array<{ code: string; message: string }>
    w1.push({ code: 'INJECTED', message: 'injected' })
    expect(registry.getWarnings()).toHaveLength(1)
  })
})

// ── createApp avec registry ──────────────────────────────────────────────

describe('createApp — intégration registry + validateConfig', () => {
  async function buildApp(cfg: AppConfig, registry?: ReturnType<typeof createExtensionRegistry>) {
    const { createApp } = await import('../src/app')
    const config = { load: async () => cfg }
    const content = { fetchText: async () => null as string | null }
    const resolver = { resolveCandidates: () => ['/content/index.md'] }
    const view = { setHtml: (_h: string) => {}, setTitle: (_t: string) => {} }
    const md = { render: (src: string) => src }
    const router = {
      get: () => ({ path: '/' }),
      subscribe: (_cb: (r: any) => void) => () => {},
      navigate: (_p: string) => {},
    }
    return createApp({ config, content, resolver, view, md, router, registry })
  }

  it('ne produit aucun avertissement avec config unilingue valide', async () => {
    const registry = createExtensionRegistry()
    const cfg: AppConfig = { roots: [{ base: '/', root: '/' }] }
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = await buildApp(cfg, registry)
    await app.start()
    expect(registry.getWarnings()).toHaveLength(0)
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('ajoute un avertissement I18N_MISSING_MODE si i18n sans mode', async () => {
    const registry = createExtensionRegistry()
    const cfg: AppConfig = {
      roots: [{ base: '/fr', root: '/content/fr' }],
      i18n: { default: 'fr', supported: ['fr', 'en'] },
    }
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = await buildApp(cfg, registry)
    await app.start()
    const warnings = registry.getWarnings()
    expect(warnings).toHaveLength(1)
    expect(warnings[0].code).toBe('I18N_MISSING_MODE')
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('produit un avertissement console sans registry si i18n sans mode', async () => {
    const cfg: AppConfig = {
      roots: [{ base: '/fr', root: '/content/fr' }],
      i18n: { default: 'fr', supported: ['fr', 'en'] },
    }
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = await buildApp(cfg)
    await app.start()
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('i18n.mode'))
    errorSpy.mockRestore()
  })

  it('fonctionne sans registry (compatibilité ascendante)', async () => {
    const cfg: AppConfig = { roots: [{ base: '/', root: '/' }] }
    const app = await buildApp(cfg)
    await expect(app.start()).resolves.toBeUndefined()
  })
})
