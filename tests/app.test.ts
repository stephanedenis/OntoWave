import { describe, it, expect } from 'vitest'
import { createApp } from '../src/app'

describe('app orchestrator (node env)', () => {
  it('renders 404 for missing content and sets title from h1 when present', async () => {
  const cfg = { roots: [{ base: '/', root: '/content' }], engine: 'v2' as const }
    const config = { load: async () => cfg }
    const content = { fetchText: async () => null as string | null }
    const resolver = { resolveCandidates: () => ['/content/index.md'] }
    let html = ''
    let title = ''
    const view = { setHtml: (h: string) => { html = h }, setTitle: (t: string) => { title = t } }
    const md = { render: (src: string) => src.startsWith('# 404') ? src : '<h1>Titre</h1>' }
    let emit: (r: any) => void = () => {}
    const router = {
      get: () => ({ path: '/' }),
      subscribe: (cb: (r: any) => void) => { emit = cb; return () => { /* noop */ } },
      navigate: (_p: string) => {}
    }
    const app = createApp({ config, content, resolver, router, view, md })
    await app.start()
    expect(html).toContain('# 404 — Not found')
  // Simuler route change avec h1 rendu
    ;(content.fetchText as any) = async () => '# Titre\n\nTexte'
  emit({ path: '/' })
    await app.renderRoute('/')
    expect(html).toContain('<h1>Titre</h1>')
    expect(title).toContain('Titre — OntoWave')
  })

  it('renders .puml file as plantuml code block', async () => {
    const pumlContent = '@startuml\nA --> B\n@enduml'
    const cfg = { roots: [{ base: '/', root: '/content' }], engine: 'v2' as const }
    const config = { load: async () => cfg }
    const content = { fetchText: async (url: string) => url.endsWith('.puml') ? pumlContent : null }
    const resolver = { resolveCandidates: () => [] }
    let html = ''
    let title = ''
    const view = { setHtml: (h: string) => { html = h }, setTitle: (t: string) => { title = t } }
    const md = { render: (src: string) => `<rendered>${src}</rendered>` }
    const router = {
      get: () => ({ path: '/diagrams/arch.puml' }),
      subscribe: (_cb: any) => () => {},
      navigate: (_p: string) => {}
    }
    const app = createApp({ config, content, resolver, router, view, md })
    await app.start()
    expect(html).toContain('plantuml')
    expect(html).toContain('@startuml')
    expect(title).toContain('arch — OntoWave')
  })

  it('shows error when .puml file is not found', async () => {
    const cfg = { roots: [{ base: '/', root: '/content' }], engine: 'v2' as const }
    const config = { load: async () => cfg }
    const content = { fetchText: async () => null as string | null }
    const resolver = { resolveCandidates: () => [] }
    let html = ''
    const view = { setHtml: (h: string) => { html = h }, setTitle: (_t: string) => {} }
    const md = { render: (src: string) => src }
    const router = {
      get: () => ({ path: '/missing.puml' }),
      subscribe: (_cb: any) => () => {},
      navigate: (_p: string) => {}
    }
    const app = createApp({ config, content, resolver, router, view, md })
    await app.start()
    expect(html).toContain('Fichier introuvable')
    expect(html).toContain('/missing.puml')
  })
})
