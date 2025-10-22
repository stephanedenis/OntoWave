/**
 * Cache SVG intelligent avec TTL pour éviter les requêtes réseau répétées
 */

interface CacheEntry {
  svg: string
  timestamp: number
}

export class SVGCache {
  private cache: Map<string, CacheEntry> = new Map()
  private ttl: number
  private enabled: boolean

  constructor(enabled: boolean = true, ttlMs: number = 5 * 60 * 1000) {
    this.enabled = enabled
    this.ttl = ttlMs
  }

  /**
   * Récupère un SVG du cache s'il est valide
   */
  get(url: string): string | null {
    if (!this.enabled) return null

    const cached = this.cache.get(url)
    if (!cached) return null

    // Vérifier si le cache est expiré
    const now = Date.now()
    if (now - cached.timestamp > this.ttl) {
      this.cache.delete(url)
      return null
    }

    console.log('✅ SVG récupéré du cache:', url)
    return cached.svg
  }

  /**
   * Ajoute un SVG au cache
   */
  set(url: string, svg: string): void {
    if (!this.enabled) return

    this.cache.set(url, {
      svg,
      timestamp: Date.now(),
    })

    console.log('💾 SVG mis en cache:', url, `(${this.cache.size} entrées)`)
  }

  /**
   * Vide le cache SVG
   */
  clear(): void {
    const count = this.cache.size
    this.cache.clear()
    console.log(`🗑️ Cache SVG vidé (${count} entrées supprimées)`)
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
