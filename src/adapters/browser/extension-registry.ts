import type { ContentRenderer, ExtensionRegistry, RuntimeWarning } from '../../core/types'

/**
 * Crée un registre d'extensions dynamiques pour OntoWave.
 *
 * Fonctionnalités :
 * - `register()` : enregistre une extension déjà instanciée
 * - `load()` : charge dynamiquement une extension via `import()` avec cache
 * - `resolve()` : retourne l'extension capable de rendre une URL donnée
 * - `getWarnings()` : expose l'état runtime pour le menu flottant
 */
export function createExtensionRegistry(): ExtensionRegistry & {
  getWarnings(): RuntimeWarning[]
  addWarning(warning: RuntimeWarning): void
} {
  const renderers = new Map<string, ContentRenderer>()

  // Cache : évite les imports multiples de la même extension
  const loadCache = new Map<string, Promise<ContentRenderer>>()

  // État runtime lisible par le menu flottant
  const warnings: RuntimeWarning[] = []

  function register(renderer: ContentRenderer): void {
    if (renderers.has(renderer.name)) {
      console.warn(`[OntoWave] Extension "${renderer.name}" est déjà enregistrée`)
      return
    }
    renderers.set(renderer.name, renderer)
  }

  async function load(name: string, url: string): Promise<ContentRenderer> {
    // Retourner l'extension si elle est déjà enregistrée
    const existing = renderers.get(name)
    if (existing) return existing

    // Retourner la promesse en cours si un chargement est déjà en attente (cache)
    const cached = loadCache.get(name)
    if (cached) return cached

    const promise = (async (): Promise<ContentRenderer> => {
      try {
        // Chargement dynamique — l'extension doit exporter un ContentRenderer par défaut
        const mod = await import(/* @vite-ignore */ url)
        const renderer: ContentRenderer = mod.default ?? mod
        if (!renderer || typeof renderer.render !== 'function') {
          throw new Error(`[OntoWave] Extension "${name}" (${url}) ne fournit pas d'objet ContentRenderer valide.`)
        }
        renderers.set(name, renderer)
        return renderer
      } catch (err) {
        loadCache.delete(name)
        const msg = err instanceof Error ? err.message : String(err)
        const warning: RuntimeWarning = {
          code: 'EXTENSION_LOAD_ERROR',
          message: `[OntoWave] Échec du chargement de l'extension "${name}" depuis "${url}" : ${msg}`,
        }
        warnings.push(warning)
        console.error(warning.message)
        throw err
      }
    })()

    loadCache.set(name, promise)
    return promise
  }

  function resolve(url: string, contentType?: string): ContentRenderer | null {
    for (const renderer of renderers.values()) {
      if (renderer.canRender(url, contentType)) return renderer
    }
    return null
  }

  function getWarnings(): RuntimeWarning[] {
    return [...warnings]
  }

  function addWarning(warning: RuntimeWarning): void {
    warnings.push(warning)
  }

  return { register, load, resolve, getWarnings, addWarning }
}
