import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// Helper : simule un environnement navigateur minimal avec window
function setupWindow(overrides: Record<string, unknown> = {}) {
  const win: Record<string, unknown> = { ...overrides }
  ;(global as any).window = win
  return win
}

function teardownWindow() {
  delete (global as any).window
}

describe('browserConfig.load()', () => {
  beforeEach(() => {
    // Réinitialise les modules entre les tests pour éviter le cache d'import
    setupWindow()
  })

  afterEach(() => {
    teardownWindow()
  })

  it('convertit window.ontoWaveConfig en __ONTOWAVE_BUNDLE__["/config.json"]', async () => {
    const cfg = { roots: [{ base: '/docs', root: '/docs' }] }
    ;(global as any).window = { ontoWaveConfig: cfg }

    // Import dynamique pour contourner le cache de module lors des tests
    const { browserConfig } = await import('../src/adapters/browser/config')
    const result = await browserConfig.load()

    expect(result).toEqual(cfg)
    expect((global as any).window.__ONTOWAVE_BUNDLE__['/config.json']).toBe(JSON.stringify(cfg))
  })

  it('utilise __ONTOWAVE_BUNDLE__["/config.json"] directement si ontoWaveConfig absent', async () => {
    const cfg = { roots: [{ base: '/content', root: '/content' }] }
    ;(global as any).window = {
      __ONTOWAVE_BUNDLE__: { '/config.json': JSON.stringify(cfg) }
    }

    const { browserConfig } = await import('../src/adapters/browser/config')
    const result = await browserConfig.load()

    expect(result).toEqual(cfg)
  })

  it('retourne le fallback minimal si aucune config n\'est fournie', async () => {
    ;(global as any).window = {}

    const { browserConfig } = await import('../src/adapters/browser/config')
    const result = await browserConfig.load()

    expect(result).toEqual({ roots: [{ base: '/', root: '/' }] })
  })

  it('window.ontoWaveConfig a priorité sur __ONTOWAVE_BUNDLE__ existant', async () => {
    const cfgConfig = { roots: [{ base: '/from-config', root: '/from-config' }] }
    const cfgBundle = { roots: [{ base: '/from-bundle', root: '/from-bundle' }] }
    ;(global as any).window = {
      ontoWaveConfig: cfgConfig,
      __ONTOWAVE_BUNDLE__: { '/config.json': JSON.stringify(cfgBundle) }
    }

    const { browserConfig } = await import('../src/adapters/browser/config')
    const result = await browserConfig.load()

    // ontoWaveConfig écrase l'entrée dans __ONTOWAVE_BUNDLE__
    expect(result).toEqual(cfgConfig)
  })
})
