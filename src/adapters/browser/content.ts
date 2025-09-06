export const browserContent = {
  async fetchText(url: string): Promise<string | null> {
    const res = await fetch(url, { cache: 'no-cache' })
    if (!res.ok) return null
    return await res.text()
  }
}
