import { getTextFromBundle } from './bundle'

let knownMarkdownPathsPromise: Promise<Set<string> | null> | null = null

function normalizePublicPath(url: string): string {
  const withoutOrigin = url.replace(/^(https?:)?\/\/[^/]+/i, '')
  const withoutQuery = withoutOrigin.split('?')[0].split('#')[0]
  return '/' + withoutQuery.replace(/^\/+/, '')
}

async function loadKnownMarkdownPaths(): Promise<Set<string> | null> {
  if (!knownMarkdownPathsPromise) {
    knownMarkdownPathsPromise = (async () => {
      const embedded = getTextFromBundle('/pages.txt')
      const txt = embedded || await fetch('/pages.txt', { cache: 'force-cache' }).then(r => r.ok ? r.text() : null).catch(() => null)
      if (!txt) return null
      const paths = txt
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(normalizePublicPath)
      return paths.length > 0 ? new Set(paths) : null
    })()
  }
  return knownMarkdownPathsPromise
}

export const browserContent = {
  async fetchText(url: string): Promise<string | null> {
    const embedded = getTextFromBundle(url)
    if (embedded != null) return embedded
    const normalizedUrl = normalizePublicPath(url)
    if (/\.md$/i.test(normalizedUrl)) {
      const knownMarkdownPaths = await loadKnownMarkdownPaths()
      if (knownMarkdownPaths && !knownMarkdownPaths.has(normalizedUrl)) return null
    }
    const res = await fetch(url, { cache: 'no-cache' }).catch(() => null as any)
    if (!res || !res.ok) return null
    return await res.text()
  }
}
