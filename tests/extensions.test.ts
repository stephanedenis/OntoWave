import { describe, it, expect } from 'vitest'
import { minimalRender } from '../src/core/minimal-md'

describe('minimalRender (rendu Markdown minimal — noyau sans dépendances)', () => {
  it('renders ATX headings h1–h3', () => {
    expect(minimalRender('# Titre')).toContain('<h1>Titre</h1>')
    expect(minimalRender('## Sous-titre')).toContain('<h2>Sous-titre</h2>')
    expect(minimalRender('### Section')).toContain('<h3>Section</h3>')
  })

  it('renders fenced code blocks with language class', () => {
    const html = minimalRender('```javascript\nconsole.log(1)\n```')
    expect(html).toContain('<pre><code class="language-javascript">')
    expect(html).toContain('console.log(1)')
    expect(html).toContain('</code></pre>')
  })

  it('renders fenced code block without language', () => {
    const html = minimalRender('```\ncode\n```')
    expect(html).toContain('<pre><code>')
    expect(html).toContain('code')
  })

  it('escapes HTML entities in code blocks', () => {
    const html = minimalRender('```\n<script>alert(1)</script>\n```')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('renders paragraphs', () => {
    const html = minimalRender('Hello world')
    expect(html).toContain('<p>Hello world</p>')
  })

  it('renders inline bold and italic', () => {
    const html = minimalRender('**gras** et *italique*')
    expect(html).toContain('<strong>gras</strong>')
    expect(html).toContain('<em>italique</em>')
  })

  it('renders inline code', () => {
    const html = minimalRender('Utiliser `npm install`')
    expect(html).toContain('<code>npm install</code>')
  })

  it('renders horizontal rules', () => {
    const html = minimalRender('---')
    expect(html).toContain('<hr/>')
  })

  it('renders unordered list items', () => {
    const html = minimalRender('- item one\n- item two')
    expect(html).toContain('<li>item one</li>')
    expect(html).toContain('<li>item two</li>')
  })

  it('renders inline links', () => {
    const html = minimalRender('[OntoWave](https://ontowave.org)')
    expect(html).toContain('<a href="https://ontowave.org">OntoWave</a>')
  })

  it('does not include mermaid-specific class markers', () => {
    const html = minimalRender('```mermaid\ngraph LR\nA-->B\n```')
    // Le rendu minimal ne tente pas de rendre les diagrammes Mermaid
    expect(html).toContain('language-mermaid')
    expect(html).not.toContain('mermaid.render')
  })

  it('ignores blank lines (no empty <p> tags)', () => {
    const html = minimalRender('# Titre\n\nParagraphe')
    expect(html).not.toContain('<p></p>')
  })
})

describe('extensions ContentRenderer interface', () => {
  it('markdown extension: canRender returns true for .md files', async () => {
    const { default: md } = await import('../src/extensions/markdown')
    expect(md.canRender('page.md')).toBe(true)
    expect(md.canRender('doc.markdown')).toBe(true)
    expect(md.canRender('data.json')).toBe(false)
  })

  it('markdown extension: render returns HTML', async () => {
    const { default: md } = await import('../src/extensions/markdown')
    const html = await md.render('# Titre\n\nTexte', 'page.md')
    expect(html).toContain('<h1')
    expect(html).toContain('Titre')
  })

  it('mermaid extension: canRender always false (post-processeur DOM)', async () => {
    const { default: mermaid } = await import('../src/extensions/mermaid')
    expect(mermaid.canRender('any.md')).toBe(false)
    expect(mermaid.name).toBe('mermaid')
  })

  it('mermaid extension: hasMermaidBlocks détecte les blocs mermaid', async () => {
    const { hasMermaidBlocks } = await import('../src/extensions/mermaid')
    expect(hasMermaidBlocks('<pre><code class="language-mermaid">graph LR</code></pre>')).toBe(true)
    expect(hasMermaidBlocks('<pre><code class="language-js">code</code></pre>')).toBe(false)
  })

  it('plantuml extension: canRender always false (post-processeur DOM)', async () => {
    const { default: plantuml } = await import('../src/extensions/plantuml')
    expect(plantuml.canRender('any.puml')).toBe(false)
    expect(plantuml.name).toBe('plantuml')
  })

  it('plantuml extension: hasPlantumlBlocks détecte les blocs plantuml', async () => {
    const { hasPlantumlBlocks } = await import('../src/extensions/plantuml')
    expect(hasPlantumlBlocks('<pre><code class="language-plantuml">@startuml</code></pre>')).toBe(true)
    expect(hasPlantumlBlocks('<pre><code class="language-puml">@startuml</code></pre>')).toBe(true)
    expect(hasPlantumlBlocks('<pre><code class="language-js">code</code></pre>')).toBe(false)
  })

  it('katex extension: name et canRender corrects', async () => {
    const { default: katex } = await import('../src/extensions/katex')
    expect(katex.name).toBe('katex')
    expect(katex.canRender('page.md')).toBe(false)
  })

  it('highlight extension: name et canRender corrects', async () => {
    const { default: highlight } = await import('../src/extensions/highlight')
    expect(highlight.name).toBe('highlight')
    expect(highlight.canRender('page.md')).toBe(false)
  })
})

describe('rendu en deux temps via createApp avec registry', () => {
  it('utilise le rendu minimal puis le rendu complet quand le renderer est trouvé', async () => {
    const { createApp } = await import('../src/app')
    const { BrowserExtensionRegistry } = await import('../src/adapters/browser/extension-registry')

    const registry = new BrowserExtensionRegistry()

    const htmlHistory: string[] = []
    const cfg = { roots: [{ base: '/', root: '/content' }], engine: 'v2' as const }
    const config = { load: async () => cfg }
    const content = { fetchText: async () => '# Titre\n\nTexte' }
    const resolver = { resolveCandidates: () => ['/content/index.md'] }
    const view = {
      setHtml: (h: string) => { htmlHistory.push(h) },
      setTitle: (_t: string) => {},
    }
    const md = { render: (_src: string) => '<should-not-be-used/>' }
    const router = {
      get: () => ({ path: '/index' }),
      subscribe: (_cb: any) => () => {},
      navigate: (_p: string) => {},
    }

    // Scénario sans extension dans le registre → phase 1 : rendu minimal (minimalRender)
    // puis tente registry.load('markdown') → échoue → garde le rendu minimal
    const app = createApp({ config, content, resolver, router, view, md, registry })
    await app.start()

    // Le rendu minimal a bien été affiché (pas de markdown-it, pas de md.render stub)
    expect(htmlHistory.length).toBeGreaterThan(0)
    expect(htmlHistory[0]).toContain('<h1>Titre</h1>')
    expect(htmlHistory[0]).not.toContain('<should-not-be-used/>')
  })

  it('utilise directement le ContentRenderer si déjà dans le registre', async () => {
    const { createApp } = await import('../src/app')
    const { BrowserExtensionRegistry } = await import('../src/adapters/browser/extension-registry')
    const { default: mdRenderer } = await import('../src/extensions/markdown')

    const registry = new BrowserExtensionRegistry()
    registry.register(mdRenderer)

    const htmlHistory: string[] = []
    const cfg = { roots: [{ base: '/', root: '/content' }], engine: 'v2' as const }
    const config = { load: async () => cfg }
    const content = { fetchText: async () => '# Titre' }
    const resolver = { resolveCandidates: () => ['/content/index.md'] }
    const view = {
      setHtml: (h: string) => { htmlHistory.push(h) },
      setTitle: (_t: string) => {},
    }
    const md = { render: (_src: string) => '<should-not-be-used/>' }
    const router = {
      get: () => ({ path: '/index.md' }),
      subscribe: (_cb: any) => () => {},
      navigate: (_p: string) => {},
    }

    const app = createApp({ config, content, resolver, router, view, md, registry })
    await app.start()

    // Le rendu doit utiliser mdRenderer (markdown-it), pas md.render (minimal)
    expect(htmlHistory[0]).toContain('<h1')
    expect(htmlHistory[0]).not.toContain('<should-not-be-used/>')
  })
})
