/**
 * Cache SVG intelligent avec TTL et persistance sessionStorage
 */

interface CacheEntry {
  svg: string
  timestamp: number
}

/**
 * Compresse un SVG en supprimant les espaces superflus entre balises.
 * Réduit la taille des SVG générés avant stockage et affichage.
 */
export function compressSvg(svg: string): string {
  return svg
    .replace(/\s{2,}/g, ' ') // Réduit les espaces multiples
    .replace(/>\s+</g, '><') // Supprime les espaces entre balises
    .trim()
}

export class SVGCache {
  private cache: Map<string, CacheEntry> = new Map()
  private ttl: number
  private enabled: boolean
  private storageKey = 'ontowave-svg-cache'
  private maxEntries: number

  constructor(enabled: boolean = true, ttlMs: number = 30 * 60 * 1000, maxEntries: number = 50) {
    this.enabled = enabled
    this.ttl = ttlMs
    this.maxEntries = maxEntries
    this.loadFromStorage()
  }

  /**
   * Charge le cache depuis sessionStorage (persistance entre navigations)
   */
  private loadFromStorage(): void {
    if (!this.enabled) return
    try {
      const raw = globalThis.sessionStorage?.getItem(this.storageKey)
      if (!raw) return
      const data = JSON.parse(raw) as Record<string, CacheEntry>
      const now = Date.now()
      for (const [key, entry] of Object.entries(data)) {
        if (now - entry.timestamp < this.ttl) {
          this.cache.set(key, entry)
        }
      }
    } catch {}
  }

  /**
   * Persiste le cache dans sessionStorage
   */
  private saveToStorage(): void {
    try {
      const data: Record<string, CacheEntry> = {}
      this.cache.forEach((v, k) => {
        data[k] = v
      })
      globalThis.sessionStorage?.setItem(this.storageKey, JSON.stringify(data))
    } catch {}
  }

  /**
   * Récupère un SVG du cache s'il est valide
   */
  get(key: string): string | null {
    if (!this.enabled) return null

    const cached = this.cache.get(key)
    if (!cached) return null

    // Vérifier si le cache est expiré
    const now = Date.now()
    if (now - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.svg
  }

  /**
   * Ajoute un SVG au cache, en évincant les entrées les plus anciennes si nécessaire
   */
  set(key: string, svg: string): void {
    if (!this.enabled) return

    // Évincer la plus ancienne entrée si le cache est plein
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      const oldest = this.cache.keys().next().value
      if (oldest !== undefined) this.cache.delete(oldest)
    }

    this.cache.set(key, {
      svg,
      timestamp: Date.now(),
    })

    this.saveToStorage()
  }

  /**
   * Vide le cache SVG
   */
  clear(): void {
    this.cache.clear()
    try {
      globalThis.sessionStorage?.removeItem(this.storageKey)
    } catch {}
  }

  /**
   * Obtient le nombre d'entrées dans le cache
   */
  size(): number {
    return this.cache.size
  }
}

// Instance globale partagée
export const svgCache = new SVGCache()
