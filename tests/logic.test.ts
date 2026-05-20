import { describe, it, expect } from 'vitest'
import { resolveCandidates, normalizePath, rewriteLinksHtml, resolvePumlCandidates, pickPreferredLanguage, splitHashRoute } from '../src/core/logic'

describe('core logic', () => {
  it('normalizes path', () => {
    expect(normalizePath('')).toBe('/')
    expect(normalizePath('a/b/')).toBe('/a/b')
    expect(normalizePath('/a//b/')).toBe('/a/b')
  })
  it('resolves candidates', () => {
    const roots = [{ base: '/', root: '/content' }]
    expect(resolveCandidates(roots as any, '/')).toEqual(['/content/index.md', '/content//index.md'])
    expect(resolveCandidates(roots as any, '/guide')).toEqual(['/content/guide.md', '/content/guide/index.md'])
  })
  it('resolves candidates with base prefix (i18n)', () => {
    const roots = [
      { base: 'en', root: '/content/en' },
      { base: 'fr', root: '/content/fr' },
    ]
    const enCandidates = resolveCandidates(roots as any, '/en/guide')
    expect(enCandidates).toContain('/content/en/guide.md')
    expect(enCandidates).toContain('/content/en/guide/index.md')
    const frCandidates = resolveCandidates(roots as any, '/fr')
    expect(frCandidates).toContain('/content/fr/index.md')
  })
  it('rewrites .md links to hash routes', () => {
    const html = '<a href="/guide.md">Guide</a> <a href="http://x.md">ext</a>'
    const out = rewriteLinksHtml(html)
    expect(out).toContain('href="#/guide.md"')
    expect(out).toContain('href="http://x.md"')
  })
  it('resolves relative .md link from root page', () => {
    const html = '<a href="processus-unifie.md">Processus unifié</a>'
    const out = rewriteLinksHtml(html, '#/')
    expect(out).toContain('href="#/processus-unifie.md"')
  })
  it('resolves relative .md link from sub-folder page (fix #40)', () => {
    const html = '<a href="processus-unifie.md">Processus unifié</a>'
    const out = rewriteLinksHtml(html, '#/portail-metho-prod/index')
    expect(out).toContain('href="#/portail-metho-prod/processus-unifie.md"')
  })
  it('resolves ./relative .md link from sub-folder page', () => {
    const html = '<a href="./processus-unifie.md">Processus unifié</a>'
    const out = rewriteLinksHtml(html, '#/portail-metho-prod/index')
    expect(out).toContain('href="#/portail-metho-prod/processus-unifie.md"')
  })
  it('resolves ../ relative .md link (parent directory)', () => {
    const html = '<a href="../autre.md">Autre</a>'
    const out = rewriteLinksHtml(html, '#/portail/sous-dossier/page')
    expect(out).toContain('href="#/portail/autre.md"')
  })
  it('resolves absolute /path.md link regardless of current page', () => {
    const html = '<a href="/racine/guide.md">Guide</a>'
    const out = rewriteLinksHtml(html, '#/portail-metho-prod/index')
    expect(out).toContain('href="#/racine/guide.md"')
  })

  it('resolves explicit extension routes without markdown guessing', () => {
    const roots = [{ base: '/', root: '/content' }]
    expect(resolveCandidates(roots as any, '/guide.md')).toEqual(['/content/guide.md', '/guide.md'])
  })

  // --- .puml link rewriting ---
  it('rewrites relative .puml link to hash route (extension preserved)', () => {
    const html = '<a href="architecture.puml">Architecture</a>'
    const out = rewriteLinksHtml(html, '#/')
    expect(out).toContain('href="#/architecture.puml"')
  })
  it('rewrites relative .puml link from sub-folder page', () => {
    const html = '<a href="architecture.puml">Architecture</a>'
    const out = rewriteLinksHtml(html, '#/demos/01-base/index')
    expect(out).toContain('href="#/demos/01-base/architecture.puml"')
  })
  it('does not rewrite external .puml links', () => {
    const html = '<a href="https://example.com/diagram.puml">External</a>'
    const out = rewriteLinksHtml(html)
    expect(out).toContain('href="https://example.com/diagram.puml"')
  })
  it('rewrites absolute /path.puml link to hash route', () => {
    const html = '<a href="/diagrams/arch.puml">Arch</a>'
    const out = rewriteLinksHtml(html, '#/any/page')
    expect(out).toContain('href="#/diagrams/arch.puml"')
  })

  // --- resolvePumlCandidates ---
  it('resolves .puml candidates with simple root', () => {
    const roots = [{ base: '/', root: '/content' }]
    const cands = resolvePumlCandidates(roots as any, '/diagrams/arch.puml')
    expect(cands).toContain('/content/diagrams/arch.puml')
  })
  it('resolves .puml candidates with base prefix (i18n)', () => {
    const roots = [{ base: 'fr', root: '/content/fr' }]
    const cands = resolvePumlCandidates(roots as any, '/fr/diagrams/arch.puml')
    expect(cands).toContain('/content/fr/diagrams/arch.puml')
  })
  it('resolves .puml candidates fallback to literal path', () => {
    const roots = [{ base: 'en', root: '/content/en' }]
    const cands = resolvePumlCandidates(roots as any, '/other/arch.puml')
    expect(cands).toContain('/other/arch.puml')
  })
  it('picks the navigator preferred language when supported', () => {
    expect(pickPreferredLanguage(['en-US', 'fr-FR'], ['fr', 'en'], 'fr')).toBe('en')
  })
  it('falls back to the configured default language when navigator does not match', () => {
    expect(pickPreferredLanguage(['de-DE'], ['fr', 'en'], 'fr')).toBe('fr')
  })
  it('splits a routed hash from its in-page anchor', () => {
    expect(splitHashRoute('#/fr/index#section-demo')).toEqual({ path: '/fr/index', anchor: 'section-demo' })
  })
})
