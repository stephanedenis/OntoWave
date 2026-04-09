import { describe, it, expect } from 'vitest'
import { buildGlossaryMap, mergeGlossarySources, buildTermRegex } from '../src/core/glossary'
import type { GlossaryTerm } from '../src/core/types'

const TERMS: GlossaryTerm[] = [
  {
    term: 'Architecture d\'entreprise',
    aliases: ['AE'],
    definition: 'Description systématique d\'une organisation.',
    href: './docs/ae.md',
  },
  {
    term: 'Capabilité',
    aliases: ['Capability'],
    definition: 'Aptitude mesurable d\'une organisation.',
    href: './docs/capabilite.md',
  },
  {
    term: 'UAF',
    definition: 'Standard OMG de modélisation.',
    href: './docs/uaf.md',
  },
]

describe('buildGlossaryMap', () => {
  it('maps term and aliases to the same entry', () => {
    const map = buildGlossaryMap(TERMS)
    expect(map.has('architecture d\'entreprise')).toBe(true)
    expect(map.has('ae')).toBe(true)
    expect(map.get('ae')).toBe(map.get('architecture d\'entreprise'))
    expect(map.has('capabilité')).toBe(true)
    expect(map.has('capability')).toBe(true)
    expect(map.get('capability')).toBe(map.get('capabilité'))
    expect(map.has('uaf')).toBe(true)
  })

  it('returns empty map for empty input', () => {
    expect(buildGlossaryMap([]).size).toBe(0)
  })
})

describe('mergeGlossarySources', () => {
  it('last-wins on conflicting term', () => {
    const source1: GlossaryTerm[] = [
      { term: 'UAF', definition: 'Définition 1', href: './a.md' },
    ]
    const source2: GlossaryTerm[] = [
      { term: 'UAF', definition: 'Définition 2', href: './b.md' },
    ]
    const map = mergeGlossarySources([source1, source2])
    expect(map.get('uaf')?.definition).toBe('Définition 2')
  })

  it('accumulates non-conflicting terms from both sources', () => {
    const source1: GlossaryTerm[] = [
      { term: 'TermA', definition: 'Def A', href: './a.md' },
    ]
    const source2: GlossaryTerm[] = [
      { term: 'TermB', definition: 'Def B', href: './b.md' },
    ]
    const map = mergeGlossarySources([source1, source2])
    expect(map.has('terma')).toBe(true)
    expect(map.has('termb')).toBe(true)
  })

  it('returns empty map for empty input', () => {
    expect(mergeGlossarySources([]).size).toBe(0)
  })
})

describe('buildTermRegex', () => {
  it('returns null for empty term list', () => {
    expect(buildTermRegex([])).toBeNull()
  })

  it('matches a simple term (case-insensitive by default)', () => {
    const regex = buildTermRegex(['uaf'])!
    expect(regex).not.toBeNull()
    regex.lastIndex = 0
    expect(regex.test('UAF')).toBe(true)
    regex.lastIndex = 0
    expect(regex.test('uaf')).toBe(true)
    regex.lastIndex = 0
    expect(regex.test('Uaf standards')).toBe(true)
  })

  it('does not match partial word when wordBoundary=true', () => {
    const regex = buildTermRegex(['ae'], { wordBoundary: true })!
    // 'AEG' should NOT match 'ae' as a standalone word
    regex.lastIndex = 0
    expect(regex.test('AEG')).toBe(false)
    // 'AE standards' should match
    regex.lastIndex = 0
    expect(regex.test('AE standards')).toBe(true)
  })

  it('matches with wordBoundary=false', () => {
    const regex = buildTermRegex(['ae'], { wordBoundary: false })!
    regex.lastIndex = 0
    // Should also match inside 'AEG'
    expect(regex.test('AEG')).toBe(true)
  })

  it('is case-sensitive when configured', () => {
    const regex = buildTermRegex(['UAF'], { caseSensitive: true })!
    regex.lastIndex = 0
    expect(regex.test('UAF')).toBe(true)
    regex.lastIndex = 0
    expect(regex.test('uaf')).toBe(false)
  })

  it('prefers longer match (sorted longest-first)', () => {
    const regex = buildTermRegex(['architecture d\'entreprise', 'ae'], { wordBoundary: false })!
    const text = 'Architecture d\'entreprise'
    const matches: string[] = []
    let m: RegExpExecArray | null
    regex.lastIndex = 0
    while ((m = regex.exec(text)) !== null) {
      matches.push(m[0])
      if (!regex.global) break
    }
    // The longer term should have appeared as the first match
    expect(matches[0].toLowerCase()).toBe('architecture d\'entreprise')
  })
})
