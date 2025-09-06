declare global {
  interface Window {
    __ONTOWAVE_BUNDLE__?: Record<string, string>
  }
}

function norm(path: string) {
  // Ensure leading slash, normalize backslashes and duplicate slashes
  let p = path.replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/\/$/, '')
  return p.startsWith('/') ? p : '/' + p
}

export function hasBundle() {
  return !!window.__ONTOWAVE_BUNDLE__
}

export function getTextFromBundle(path: string): string | null {
  const map = window.__ONTOWAVE_BUNDLE__
  if (!map) return null
  const key = norm(path)
  return typeof map[key] === 'string' ? map[key] : null
}

export function getJsonFromBundle<T = any>(path: string): T | null {
  const txt = getTextFromBundle(path)
  if (txt == null) return null
  try { return JSON.parse(txt) as T } catch { return null }
}
