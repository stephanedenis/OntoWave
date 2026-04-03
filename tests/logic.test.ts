import { describe, it, expect } from 'vitest'
import { resolveCandidates, normalizePath, rewriteLinksHtml } from '../src/core/logic'

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
    expect(out).toContain('href="#/guide"')
    expect(out).toContain('href="http://x.md"')
  })
  it('resolves relative .md link from root page', () => {
    const html = '<a href="processus-unifie.md">Processus unifié</a>'
    const out = rewriteLinksHtml(html, '#/')
    expect(out).toContain('href="#/processus-unifie"')
  })
  it('resolves relative .md link from sub-folder page (fix #40)', () => {
    const html = '<a href="processus-unifie.md">Processus unifié</a>'
    const out = rewriteLinksHtml(html, '#/portail-metho-prod/index')
    expect(out).toContain('href="#/portail-metho-prod/processus-unifie"')
  })
  it('resolves ./relative .md link from sub-folder page', () => {
    const html = '<a href="./processus-unifie.md">Processus unifié</a>'
    const out = rewriteLinksHtml(html, '#/portail-metho-prod/index')
    expect(out).toContain('href="#/portail-metho-prod/processus-unifie"')
  })
  it('resolves ../ relative .md link (parent directory)', () => {
    const html = '<a href="../autre.md">Autre</a>'
    const out = rewriteLinksHtml(html, '#/portail/sous-dossier/page')
    expect(out).toContain('href="#/portail/autre"')
  })
  it('resolves absolute /path.md link regardless of current page', () => {
    const html = '<a href="/racine/guide.md">Guide</a>'
    const out = rewriteLinksHtml(html, '#/portail-metho-prod/index')
    expect(out).toContain('href="#/racine/guide"')
  })
})
