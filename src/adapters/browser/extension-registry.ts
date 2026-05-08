import type {
  ContentRenderer,
  ExtensionRegistry,
  ExtensionStatus,
  RuntimeWarning,
  WarningSink,
} from '../../core/types'

/** Préfixes d'URL refusés pour `load()` afin d'éviter des imports arbitraires. */
const BLOCKED_URL_SCHEMES = /^(https?:|data:|blob:|javascript:)/i

/**
 * Crée un registre d'extensions dynamiques pour OntoWave.
 *
 * Fonctionnalités :
 * - `register()` : enregistre une extension déjà instanciée
 * - `load()` : charge dynamiquement une extension via `import()` avec cache (un seul import par nom)
 * - `resolve()` : retourne l'extension capable de rendre une URL donnée
 * - `getStatus()` : retourne l'état de chargement d'une extension
 * - `getWarnings()` + `addWarning()` : implémente `WarningSink` pour le menu flottant
 *
 * Événements DOM émis sur window (si disponible) :
 *   ow:extension:loading  { detail: { name: string } }
 *   ow:extension:ready    { detail: { name: string } }
 *   ow:extension:error    { detail: { name: string; error: unknown } }
 */
export function createExtensionRegistry(): ExtensionRegistry & WarningSink {
  const renderers = new Map<string, ContentRenderer>()
  const statuses = new Map<string, ExtensionStatus>()

  // Cache de promesses — évite les imports multiples de la même extension
  const loadCache = new Map<string, Promise<ContentRenderer>>()

  // État runtime lisible par le menu flottant
  const warnings: RuntimeWarning[] = []

  function emitEvent(
    type: 'ow:extension:loading' | 'ow:extension:ready' | 'ow:extension:error',
    name: string,
    error?: unknown,
  ): void {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent(type, { detail: { name, error } }))
  }

  function register(renderer: ContentRenderer): void {
    if (renderers.has(renderer.name)) {
      console.warn(`[OntoWave] Extension "${renderer.name}" est déjà enregistrée`)
      return
    }
    renderers.set(renderer.name, renderer)
    statuses.set(renderer.name, 'ready')
    emitEvent('ow:extension:ready', renderer.name)
  }

  async function load(name: string, url?: string): Promise<ContentRenderer> {
    // Retourner l'extension si elle est déjà enregistrée (évite un import inutile)
    const existing = renderers.get(name)
    if (existing) return existing

    // Validation de l'URL : refuser les schémas dangereux
    if (url && BLOCKED_URL_SCHEMES.test(url)) {
      const err = new Error(
        `[OntoWave] URL d'extension refusée : "${url}". Seuls les chemins relatifs sont autorisés.`,
      )
      statuses.set(name, 'error')
      emitEvent('ow:extension:error', name, err)
      throw err
    }

    if (!url) {
      const err = new Error(`[OntoWave] Extension inconnue : ${name}`)
      statuses.set(name, 'error')
      emitEvent('ow:extension:error', name, err)
      return Promise.reject(err)
    }

    // Retourner la promesse en cours si un chargement est déjà en attente (cache)
    const cached = loadCache.get(name)
    if (cached) return cached

    statuses.set(name, 'loading')
    emitEvent('ow:extension:loading', name)

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
        renderers.set(renderer.name, renderer)
        statuses.set(renderer.name, 'ready')
        emitEvent('ow:extension:ready', renderer.name)
        return renderer
      } catch (err) {
        loadCache.delete(name)
        statuses.set(name, 'error')
        emitEvent('ow:extension:error', name, err)
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

  function getStatus(name: string): ExtensionStatus | undefined {
    return statuses.get(name)
  }

  function getWarnings(): RuntimeWarning[] {
    return [...warnings]
  }

  function addWarning(warning: RuntimeWarning): void {
    warnings.push(warning)
  }

  return { register, load, resolve, getStatus, getWarnings, addWarning }
}

/**
 * Instance partagée du registre (singleton pour le runtime navigateur).
 * @deprecated Préférez `createExtensionRegistry()` pour les tests unitaires.
 */
export const browserExtensionRegistry = createExtensionRegistry()

/**
 * @deprecated Classe conservée pour compatibilité. Utilisez `createExtensionRegistry()`.
 */
export class BrowserExtensionRegistry {
  private readonly registry = createExtensionRegistry()

  register(renderer: ContentRenderer): void {
    this.registry.register(renderer)
  }

  async load(name: string, url?: string): Promise<ContentRenderer> {
    return this.registry.load(name, url)
  }

  resolve(url: string, contentType?: string): ContentRenderer | null {
    return this.registry.resolve(url, contentType)
  }

  getStatus(name: string): ExtensionStatus | undefined {
    return this.registry.getStatus(name)
  }

  getWarnings(): RuntimeWarning[] {
    return this.registry.getWarnings()
  }

  addWarning(warning: RuntimeWarning): void {
    this.registry.addWarning(warning)
  }
}
