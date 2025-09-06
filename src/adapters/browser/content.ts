import { getTextFromBundle } from './bundle'

export const browserContent = {
  async fetchText(url: string): Promise<string | null> {
    const embedded = getTextFromBundle(url)
    if (embedded != null) return embedded
    const res = await fetch(url, { cache: 'no-cache' }).catch(() => null as any)
    if (!res || !res.ok) return null
    return await res.text()
  }
}
