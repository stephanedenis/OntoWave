import type { ContentRenderer, ExtensionRegistry, RuntimeWarning, WarningSink } from '../../core/types'

/** Préfixes d'URL refusés pour `load()` afin d'éviter des imports arbitraires. */
const BLOCKED_URL_SCHEMES = /^(https?:|data:|blob:|javascript:)/i

/**
 * Crée un registre d'extensions dynamiques pour OntoWave.
 *
 * Fonctionnalités :
 * - `register()` : enregistre une extension déjà instanciée
 * - `load()` : charge dynamiquement une extension via `import()` avec cache (un seul import par nom)
 * - `resolve()` : retourne l'extension capable de rendre une URL donnée
 * - `getWarnings()` + `addWarning()` : implémente `WarningSink` pour le menu flottant
 */
export function createExtensionRegistry(): ExtensionRegistry & WarningSink {
  const renderers = new Map<string, ContentRenderer>()

  // Cache de promesses — évite les imports multiples de la même extension
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
    // Retourner l'extension si elle est déjà enregistrée (évite un import inutile)
    const existing = renderers.get(name)
    if (existing) return existing

    // Validation de l'URL : refuser les schémas dangereux
    if (BLOCKED_URL_SCHEMES.test(url)) {
      throw new Error(
        `[OntoWave] URL d'extension refusée : "${url}". Seuls les chemins relatifs sont autorisés.`,
      )
    }

    // Retourner la promesse en cours si un chargement est déjà en attente (cache)
    const cached = loadCache.get(name)
    if (cached) return cached

    const promise = (async (): Promise<ContentRenderer> => {
      try {
        // Chargement dynamique — l'extension doit exporter un ContentRenderer comme export par défaut
        const mod = await import(/* @vite-ignore */ url)
        const renderer: ContentRenderer = mod.default ?? mod
        if (!renderer || typeof renderer.render !== 'function') {
          throw new Error(
            `[OntoWave] Extension "${name}" (${url}) ne fournit pas d'objet ContentRenderer valide.`,
          )
        }
        // Cohérence : imposer que renderer.name corresponde au name demandé
        if (renderer.name !== name) {
          throw new Error(
            `[OntoWave] Extension "${name}" (${url}) déclare le nom "${renderer.name}". ` +
            `Le nom demandé et renderer.name doivent correspondre.`,
          )
        }
        // Utiliser renderer.name comme clé canonique (cohérence avec register())
        renderers.set(renderer.name, renderer)
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
