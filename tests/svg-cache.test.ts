import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SVGCache, compressSvg } from '../src/adapters/browser/svg-cache'

describe('compressSvg', () => {
  it('réduit les espaces multiples', () => {
    const svg = '<svg  width="100"   height="50"></svg>'
    expect(compressSvg(svg)).toBe('<svg width="100" height="50"></svg>')
  })

  it('supprime les espaces entre balises', () => {
    const svg = '<svg>\n  <rect/>\n  <circle/>\n</svg>'
    expect(compressSvg(svg)).toBe('<svg><rect/><circle/></svg>')
  })

  it('retourne une chaîne vide si le svg est vide', () => {
    expect(compressSvg('')).toBe('')
  })

  it('retourne le svg sans modification si aucune compression n\'est possible', () => {
    const svg = '<svg><rect/></svg>'
    expect(compressSvg(svg)).toBe(svg)
  })

  it('supprime les espaces en début et fin', () => {
    expect(compressSvg('  <svg/> ')).toBe('<svg/>')
  })
})

describe('SVGCache', () => {
  let cache: SVGCache

  beforeEach(() => {
    cache = new SVGCache(true, 5000, 3)
  })

  it('stocke et récupère un SVG', () => {
    cache.set('key1', '<svg/>')
    expect(cache.get('key1')).toBe('<svg/>')
  })

  it('retourne null pour une clé inconnue', () => {
    expect(cache.get('inexistant')).toBeNull()
  })

  it('retourne null si le cache est désactivé', () => {
    const disabled = new SVGCache(false)
    disabled.set('key1', '<svg/>')
    expect(disabled.get('key1')).toBeNull()
  })

  it('respecte la limite maxEntries en évincant la plus ancienne entrée', () => {
    cache.set('key1', '<svg>1</svg>')
    cache.set('key2', '<svg>2</svg>')
    cache.set('key3', '<svg>3</svg>')
    // Ajout d'une 4e entrée → key1 doit être évincé
    cache.set('key4', '<svg>4</svg>')
    expect(cache.size()).toBe(3)
    expect(cache.get('key1')).toBeNull()
    expect(cache.get('key4')).toBe('<svg>4</svg>')
  })

  it('ne dépasse pas maxEntries lors d\'une mise à jour d\'une clé existante', () => {
    cache.set('key1', '<svg>1</svg>')
    cache.set('key2', '<svg>2</svg>')
    cache.set('key3', '<svg>3</svg>')
    // Mise à jour d'une clé existante → taille inchangée
    cache.set('key1', '<svg>updated</svg>')
    expect(cache.size()).toBe(3)
    expect(cache.get('key1')).toBe('<svg>updated</svg>')
  })

  it('retourne null pour une entrée expirée (TTL)', async () => {
    const shortTtl = new SVGCache(true, 10) // TTL de 10ms
    shortTtl.set('key1', '<svg/>')
    await new Promise((r) => setTimeout(r, 20))
    expect(shortTtl.get('key1')).toBeNull()
  })

  it('vide le cache avec clear()', () => {
    cache.set('key1', '<svg/>')
    cache.set('key2', '<svg/>')
    cache.clear()
    expect(cache.size()).toBe(0)
    expect(cache.get('key1')).toBeNull()
  })

  it('rapporte la taille correcte', () => {
    expect(cache.size()).toBe(0)
    cache.set('key1', '<svg/>')
    expect(cache.size()).toBe(1)
    cache.set('key2', '<svg/>')
    expect(cache.size()).toBe(2)
  })
})
