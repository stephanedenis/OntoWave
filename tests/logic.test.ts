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
  it('rewrites .md links to hash routes', () => {
    const html = '<a href="/guide.md">Guide</a> <a href="http://x.md">ext</a>'
    const out = rewriteLinksHtml(html)
    expect(out).toContain('href="#/guide"')
    expect(out).toContain('href="http://x.md"')
  })
})
