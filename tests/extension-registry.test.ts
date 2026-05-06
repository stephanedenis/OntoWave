import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserExtensionRegistry } from '../src/adapters/browser/extension-registry'
import type { ContentRenderer } from '../src/core/types'

// Stub window.dispatchEvent pour les tests Node
const dispatchedEvents: Array<{ type: string; detail: unknown }> = []
;(globalThis as any).window = {
  dispatchEvent: (e: CustomEvent) => {
    dispatchedEvents.push({ type: e.type, detail: e.detail })
  },
  addEventListener: vi.fn(),
  CustomEvent: class CustomEvent {
    type: string
    detail: unknown
    constructor(type: string, init?: CustomEventInit) {
      this.type = type
      this.detail = init?.detail
    }
  },
}
;(globalThis as any).CustomEvent = (globalThis as any).window.CustomEvent

function makeRenderer(name: string, handles: string[] = []): ContentRenderer {
  return {
    name,
    handles,
    canRender: (url: string) => handles.some((h) => url.endsWith(h)),
    render: async (source: string) => `<rendered-by-${name}>${source}</rendered-by-${name}>`,
  }
}

describe('BrowserExtensionRegistry', () => {
  beforeEach(() => {
    dispatchedEvents.length = 0
  })

  it('register() adds a renderer and marks it ready', () => {
    const registry = new BrowserExtensionRegistry()
    const md = makeRenderer('markdown', ['.md'])
    registry.register(md)
    expect(registry.getStatus('markdown')).toBe('ready')
    expect(dispatchedEvents.some((e) => e.type === 'ow:extension:ready')).toBe(true)
  })

  it('resolve() returns the correct renderer by URL', () => {
    const registry = new BrowserExtensionRegistry()
    registry.register(makeRenderer('markdown', ['.md']))
    registry.register(makeRenderer('json', ['.json']))

    expect(registry.resolve('page.md')?.name).toBe('markdown')
    expect(registry.resolve('data.json')?.name).toBe('json')
    expect(registry.resolve('unknown.xyz')).toBeNull()
  })

  it('load() returns a registered extension immediately', async () => {
    const registry = new BrowserExtensionRegistry()
    const md = makeRenderer('markdown', ['.md'])
    registry.register(md)
    const result = await registry.load('markdown')
    expect(result.name).toBe('markdown')
  })

  it('load() rejects with error for unknown extension (no url)', async () => {
    const registry = new BrowserExtensionRegistry()
    await expect(registry.load('unknown')).rejects.toThrow()
    expect(registry.getStatus('unknown')).toBe('error')
    expect(dispatchedEvents.some((e) => e.type === 'ow:extension:error')).toBe(true)
  })

  it('load() deduplicates concurrent requests (same promise)', async () => {
    const registry = new BrowserExtensionRegistry()
    // Deux appels simultanés pour une extension inconnue → même rejet
    const p1 = registry.load('x', 'fake://x.js').catch(() => null)
    const p2 = registry.load('x', 'fake://x.js').catch(() => null)
    await Promise.all([p1, p2])
    // Une seule tentative de chargement (loading event émis une seule fois)
    const loadingEvents = dispatchedEvents.filter(
      (e) => e.type === 'ow:extension:loading' && (e.detail as any).name === 'x',
    )
    expect(loadingEvents.length).toBe(1)
  })

  it('getStatus() returns undefined for unknown extension', () => {
    const registry = new BrowserExtensionRegistry()
    expect(registry.getStatus('nonexistent')).toBeUndefined()
  })
})
