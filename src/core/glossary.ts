import type { GlossaryTerm, GlossaryMatchingConfig } from './types'

/** Build a lookup map: normalized key → GlossaryTerm */
export function buildGlossaryMap(terms: GlossaryTerm[]): Map<string, GlossaryTerm> {
  const map = new Map<string, GlossaryTerm>()
  for (const t of terms) {
    map.set(t.term.toLowerCase(), t)
    for (const alias of t.aliases ?? []) {
      map.set(alias.toLowerCase(), t)
    }
  }
  return map
}

/**
 * Merge multiple glossary term arrays — last-wins on key conflict.
 * Each entry in `sources` is a list of terms from one source file.
 */
export function mergeGlossarySources(sources: GlossaryTerm[][]): Map<string, GlossaryTerm> {
  const map = new Map<string, GlossaryTerm>()
  for (const terms of sources) {
    const partial = buildGlossaryMap(terms)
    partial.forEach((term, key) => map.set(key, term))
  }
  return map
}

/**
 * Build a RegExp that matches any of the given term keys in a text node.
 * Keys should already be lowercase-normalised (as stored in the map).
 */
export function buildTermRegex(termKeys: string[], matching: GlossaryMatchingConfig = {}): RegExp | null {
  if (termKeys.length === 0) return null
  const { caseSensitive = false, wordBoundary = true } = matching

  // Sort longest first so longer matches win over sub-strings
  const sorted = [...termKeys].sort((a, b) => b.length - a.length)
  const escaped = sorted.map(escapeRegex)
  const pattern = escaped.join('|')

  if (wordBoundary) {
    // Use Unicode property escapes with `u` flag for proper Unicode word boundaries
    const wb = `(?<![\\p{L}\\p{N}_])(?:${pattern})(?![\\p{L}\\p{N}_])`
    const flags = caseSensitive ? 'gu' : 'giu'
    try {
      return new RegExp(wb, flags)
    } catch {
      // Fallback: standard ASCII word boundary
      const wbFallback = `\\b(?:${pattern})\\b`
      return new RegExp(wbFallback, caseSensitive ? 'g' : 'gi')
    }
  }

  return new RegExp(`(?:${pattern})`, caseSensitive ? 'g' : 'gi')
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
